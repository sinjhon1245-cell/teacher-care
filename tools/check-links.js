// 공식 링크 점검 도구 — 배포 전(또는 정기적으로) 실행하세요:  node tools/check-links.js
// 데이터 파일(data/*.js, data/regions/*.js)에 적힌 모든 https 주소에 실제로 접속해 상태를 확인해요.
// 외부 패키지 없이 Node 18+의 fetch만 써요. 결과는 화면에 표로 보여 주고, 끊긴 링크가 있으면 종료 코드 1로 끝나요.
//
// 판정
//   정상      2xx(같은 주소)
//   이동      2xx지만 다른 주소로 이동(redirect) — 동작하지만 데이터의 주소를 새 주소로 바꿀지 확인하세요
//   끊김      404·410, 주소 형식 오류, 도메인 없음(DNS), ‘존재하지 않는 게시물’ 같은 안내 페이지(soft 404) → 오류
//   확인 필요 401·403(공공기관 서버가 자동 접속을 막는 경우가 많아요), 5xx, 시간 초과, 연결 실패 → 주의(브라우저로 직접 확인)
// HEAD를 막는 서버가 많아 처음부터 GET으로 요청하고, HTML은 앞부분만 읽어 soft 404 문구를 찾아요(PDF 등은 헤더만 봐요).
//
// 옵션
//   --only=seoul|gyeonggi|incheon|busan|chungbuk|common   해당 파일의 링크만
//   --timeout=15000                         요청당 제한 시간(ms)
//   --json=파일경로                          결과를 JSON으로도 저장(정기 점검 기록용)

const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const args = Object.fromEntries(process.argv.slice(2).map(a => { const [k, v] = a.replace(/^--/, '').split('='); return [k, v === undefined ? true : v]; }));
const TIMEOUT = Number(args.timeout) || 15000;
const CONCURRENCY = 6;        // 동시에 여는 요청 수
const PER_HOST = 2;           // 한 기관 서버에 동시에 보내는 요청 수(부담을 주지 않게)
const MAX_BODY = 256 * 1024;  // soft 404를 찾으려고 읽는 HTML 앞부분 크기
// 게시물이 지워졌거나 주소가 틀렸을 때 200으로 돌려주는 안내 페이지 문구
const SOFT_404 = /(존재하지\s*않는\s*(게시물|게시글|페이지|글)|삭제된\s*(게시물|게시글)|페이지를\s*찾을\s*수\s*없|잘못된\s*(접근|경로|요청)|요청하신\s*페이지[^<]{0,20}(없|찾을)|해당\s*(게시물|게시글)이\s*없|오류\s*페이지|주소명을\s*찾을\s*수\s*없)/;
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36 teacher-care-link-check';

// 1) 데이터 파일에서 주소 모으기(같은 주소는 한 번만 요청하고, 쓰인 위치는 모두 기록)
const files = ['data/common.js', ...fs.readdirSync(path.join(root, 'data/regions')).filter(f => f.endsWith('.js')).map(f => 'data/regions/' + f)]
  .filter(f => !args.only || (args.only === 'common' ? f === 'data/common.js' : f.endsWith('/' + args.only + '.js')));
const byUrl = new Map();
for (const f of files) {
  fs.readFileSync(path.join(root, f), 'utf8').split(/\r?\n/).forEach((line, i) => {
    for (const m of line.matchAll(/https?:\/\/[^'"`\s)<>]+/g)) {
      const url = m[0];
      if (!byUrl.has(url)) byUrl.set(url, []);
      byUrl.get(url).push(`${f}:${i + 1}`);
    }
  });
}

// 2) 한 주소 확인
async function check(url) {
  let parsed;
  try { parsed = new URL(url); } catch (e) { return { verdict: 'broken', status: 'invalid-url', note: '주소 형식 오류' }; }
  if (parsed.protocol !== 'https:') return { verdict: 'broken', status: 'not-https', note: 'https가 아니에요' };
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), TIMEOUT);
  try {
    const res = await fetch(parsed.href, { method: 'GET', redirect: 'follow', signal: ctl.signal, headers: { 'User-Agent': UA, 'Accept': 'text/html,application/xhtml+xml,application/pdf;q=0.9,*/*;q=0.8', 'Accept-Language': 'ko-KR,ko;q=0.9' } });
    const finalUrl = res.url || parsed.href;
    const type = res.headers.get('content-type') || '';
    let soft = false;
    if (res.ok && /html/i.test(type) && res.body) {
      const reader = res.body.getReader();
      const chunks = [];
      let size = 0;
      while (size < MAX_BODY) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value); size += value.length;
      }
      try { await reader.cancel(); } catch (e) { /* 무시 */ }
      const buf = Buffer.concat(chunks);
      // 공공기관 페이지는 아직 EUC-KR인 곳이 있어요
      const charset = (/charset=([\w-]+)/i.exec(type) || [])[1] || (/<meta[^>]+charset=["']?([\w-]+)/i.exec(buf.toString('latin1')) || [])[1] || 'utf-8';
      let text;
      try { text = new TextDecoder(charset.toLowerCase()).decode(buf); } catch (e) { text = buf.toString('utf8'); }
      // 문구는 화면에 보이는 글자에서만 찾아요(스크립트 안의 ‘잘못된 접근입니다’ 같은 오류 처리 문구는 제외).
      // 보이는 글자가 거의 없고 alert·history.back만 있는 페이지도 soft 404로 봐요
      const visible = text.replace(/<script[\s\S]*?<\/script>/gi, ' ').replace(/<style[\s\S]*?<\/style>/gi, ' ').replace(/<!--[\s\S]*?-->/g, ' ').replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ');
      soft = SOFT_404.test(visible) || (visible.length < 300 && /alert\(/.test(text) && /history\.(back|go\(-1\))|location\.(href|replace)/.test(text));
    } else if (res.body) {
      try { await res.body.cancel(); } catch (e) { /* 무시 */ }
    }
    // 기관 홈(도메인만 적은 주소)이 같은 서버의 첫 화면(/index.do 등)으로 가는 것은 정상으로 봐요
    const homeRedirect = parsed.pathname === '/' && !parsed.search && hostOf(finalUrl) === parsed.host;
    const moved = !homeRedirect && normalize(finalUrl) !== normalize(parsed.href);
    if (res.status === 404 || res.status === 410) return { verdict: 'broken', status: res.status, finalUrl };
    if (res.status === 401 || res.status === 403) return { verdict: 'check', status: res.status, finalUrl, note: '서버가 자동 접속을 막았어요(브라우저로 확인)' };
    if (res.status >= 500) return { verdict: 'check', status: res.status, finalUrl, note: '서버 오류(잠시 뒤 다시 확인)' };
    if (!res.ok) return { verdict: 'check', status: res.status, finalUrl };
    if (soft) return { verdict: 'broken', status: res.status, finalUrl, note: '‘존재하지 않는 게시물’ 같은 안내 페이지(soft 404)' };
    return { verdict: moved ? 'moved' : 'ok', status: res.status, finalUrl, type: type.split(';')[0] };
  } catch (e) {
    const code = (e.cause && (e.cause.code || e.cause.name)) || e.name;
    if (e.name === 'AbortError') return { verdict: 'check', status: 'timeout', note: `${TIMEOUT / 1000}초 안에 응답이 없어요` };
    if (code === 'ENOTFOUND') return { verdict: 'broken', status: 'dns', note: '도메인을 찾을 수 없어요' };
    return { verdict: 'check', status: code || 'network', note: '연결 실패(인증서·네트워크 확인)' };
  } finally {
    clearTimeout(timer);
  }
}

function normalize(u) {
  try { const x = new URL(u); return (x.protocol + '//' + x.host + x.pathname.replace(/\/$/, '') + x.search).toLowerCase(); } catch (e) { return u; }
}

// 3) 동시 요청 수·기관별 요청 수를 제한해 실행
async function run() {
  const queue = [...byUrl.keys()];
  const results = new Map();
  const active = new Map();
  async function worker() {
    while (queue.length) {
      // 같은 서버에 이미 PER_HOST개가 열려 있으면 다른 서버의 주소를 먼저 처리해요
      const idx = queue.findIndex(u => (active.get(hostOf(u)) || 0) < PER_HOST);
      if (idx === -1) { await new Promise(r => setTimeout(r, 50)); continue; }
      const [url] = queue.splice(idx, 1);
      const host = hostOf(url);
      active.set(host, (active.get(host) || 0) + 1);
      let r = await check(url);
      // 시간 초과·연결 실패는 한 번 더 시도해요
      if (r.verdict === 'check' && !Number.isInteger(r.status)) r = await check(url);
      active.set(host, active.get(host) - 1);
      results.set(url, r);
      process.stderr.write('.');
    }
  }
  await Promise.all(Array.from({ length: CONCURRENCY }, worker));
  process.stderr.write('\n');
  return results;
}

function hostOf(u) { try { return new URL(u).host; } catch (e) { return ''; } }

if (require.main !== module) module.exports = { check };
else run().then(results => {
  const LABEL = { ok: '정상', moved: '이동', check: '확인 필요', broken: '끊김' };
  const rows = [...byUrl.entries()].map(([url, where]) => ({ url, where, ...results.get(url) }));
  const order = { broken: 0, check: 1, moved: 2, ok: 3 };
  rows.sort((a, b) => order[a.verdict] - order[b.verdict] || a.url.localeCompare(b.url));
  for (const r of rows) {
    if (r.verdict === 'ok') continue;
    console.log(`[${LABEL[r.verdict]}] ${r.status} ${r.url}`);
    if (r.verdict === 'moved') console.log(`    → ${r.finalUrl}`);
    if (r.note) console.log(`    ${r.note}`);
    console.log(`    위치: ${r.where.join(', ')}`);
  }
  const count = v => rows.filter(r => r.verdict === v).length;
  console.log(`\n링크 ${rows.length}개(사용 위치 ${rows.reduce((n, r) => n + r.where.length, 0)}곳) · 정상 ${count('ok')} · 이동 ${count('moved')} · 확인 필요 ${count('check')} · 끊김 ${count('broken')}`);
  if (args.json) fs.writeFileSync(path.resolve(String(args.json)), JSON.stringify({ checkedAt: new Date().toISOString(), rows }, null, 2));
  if (count('broken')) { console.log('끊긴 링크가 있어요. 공식 사이트에서 새 주소를 찾아 데이터와 verifiedAt을 고치거나, 찾을 수 없으면 reviewStatus를 source-unavailable로 바꾸세요.'); process.exit(1); }
  console.log(count('check') ? '링크 점검 통과(‘확인 필요’는 브라우저로 직접 열어 확인하세요)' : '링크 점검 통과');
});
