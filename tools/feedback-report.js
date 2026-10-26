#!/usr/bin/env node
// 안내별 의견 집계(운영자용) — api/feedback.js가 Upstash Redis에 더한 ‘응답 건수’를 읽어 표로 보여 줘요.
// 사람 수가 아니라 응답 건수예요(같은 사람이 다른 기기·브라우저에서 다시 답할 수 있어요).
//
// 사용: KV_REST_API_URL=… KV_REST_API_READ_ONLY_TOKEN=… node tools/feedback-report.js [--days=28] [--json=파일]
//   - 읽기 전용 토큰(KV_REST_API_READ_ONLY_TOKEN)을 권해요. 없으면 KV_REST_API_TOKEN(또는 UPSTASH_REDIS_REST_URL·_TOKEN)을 써요.
//   - 토큰은 Vercel 프로젝트의 Storage(Upstash) 화면에서 복사해요. 저장소에 올리거나 다른 사람에게 보내지 마세요.
'use strict';

const fs = require('fs');
const path = require('path');
const { loadSiteData } = require('./lib/load-site-data');

const args = Object.fromEntries(process.argv.slice(2).map(a => { const [k, v] = a.replace(/^--/, '').split('='); return [k, v === undefined ? true : v]; }));
const DAYS = Math.max(1, Math.min(400, Number(args.days) || 28));
const url = (process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL || '').replace(/\/+$/, '');
const token = process.env.KV_REST_API_READ_ONLY_TOKEN || process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
if (!url || !token) {
  console.error('KV_REST_API_URL과 KV_REST_API_READ_ONLY_TOKEN(또는 KV_REST_API_TOKEN)을 환경 변수로 넣어 주세요.');
  process.exit(1);
}

const CHOICE = { helpful: '도움이 되었어요', 'needs-more': '정보가 부족해요' };
const REASON = { missing: '찾는 정보가 없어요', unclear: '이해하기 어려워요', outdated: '오래된 것 같아요', 'broken-link': '링크가 안 열려요', '-': '이유 없음' };

// app.js programFeedbackId와 같은 계산(지원 카드 이름 → 짧은 id)
function programId(t) {
  let h = 0x811c9dc5;
  for (const ch of String(t)) { h ^= ch.codePointAt(0); h = Math.imul(h, 0x01000193) >>> 0; }
  return 'p-' + h.toString(16).padStart(8, '0');
}

const D = loadSiteData();
function nameOf(region, kindId) {
  const [kind, id] = kindId.split(':');
  if (kind === 'program') {
    const R = D.REGIONS[region];
    const p = R && R.programs.find(x => programId(x.t) === id);
    return p ? `${R.short} 지원 · ${p.t}` : `${region} 지원 · ${id}(이름이 바뀌었거나 없어진 카드)`;
  }
  if (kind === 'benefit') { const b = D.BENEFITS.find(x => x.id === id); return `회복·보호 · ${b ? b.t : id}`; }
  if (kind === 'situ') { const s = D.SITUS.find(x => x.id === id); return `상황별 도움 · ${s ? s.title : id}`; }
  if (kind === 'type') { const t = D.SUPPORT_TYPES.find(x => x.id === id); return `지원 유형 · ${t ? t.label : id}`; }
  return kindId;
}
const regionName = id => (D.REGIONS[id] ? D.REGIONS[id].short : id === 'common' ? '공통' : id);

async function pipeline(commands) {
  const res = await fetch(url + '/pipeline', { method: 'POST', headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' }, body: JSON.stringify(commands) });
  if (!res.ok) throw new Error('저장소 응답 ' + res.status);
  const out = await res.json();
  return out.map(x => { if (x.error) throw new Error(x.error); return x.result; });
}

// HGETALL 결과([필드, 값, …]) → [{ region, item, choice, reason, n }]
function rows(flat) {
  const out = [];
  for (let i = 0; i < (flat || []).length; i += 2) {
    const [region, item, choice, reason] = String(flat[i]).split('|');
    out.push({ region, item, choice, reason, n: Number(flat[i + 1]) || 0 });
  }
  return out;
}

const kst = d => new Date(d.getTime() + 9 * 3600 * 1000).toISOString().slice(0, 10);
const sum = (list, f) => list.filter(f).reduce((s, r) => s + r.n, 0);

(async () => {
  const today = new Date();
  const days = [...Array(DAYS)].map((_, i) => kst(new Date(today.getTime() - i * 86400000))).reverse();
  const results = await pipeline([...days.map(d => ['HGETALL', 'fb:day:' + d]), ['HGETALL', 'fb:total']]);
  const perDay = days.map((d, i) => ({ day: d, rows: rows(results[i]) }));
  const all = perDay.flatMap(x => x.rows);
  const total = rows(results[results.length - 1]);

  console.log(`안내별 의견 — 최근 ${DAYS}일(${days[0]} ~ ${days[days.length - 1]}, 한국 날짜) · 응답 건수 기준(사람 수 아님)\n`);
  console.log('날짜        도움이 되었어요  정보가 부족해요');
  perDay.filter(x => x.rows.length).forEach(x => console.log(`${x.day}  ${String(sum(x.rows, r => r.choice === 'helpful')).padStart(14)}  ${String(sum(x.rows, r => r.choice === 'needs-more')).padStart(14)}`));

  // 주별(월요일 시작) 합계
  const weekOf = d => { const t = new Date(d + 'T00:00:00Z'); const k = (t.getUTCDay() + 6) % 7; return new Date(t.getTime() - k * 86400000).toISOString().slice(0, 10); };
  const weeks = {};
  perDay.forEach(x => { const w = weekOf(x.day); weeks[w] = weeks[w] || { h: 0, m: 0 }; weeks[w].h += sum(x.rows, r => r.choice === 'helpful'); weeks[w].m += sum(x.rows, r => r.choice === 'needs-more'); });
  console.log('\n주(월요일 시작)  도움이 되었어요  정보가 부족해요');
  Object.entries(weeks).filter(([, v]) => v.h || v.m).forEach(([w, v]) => console.log(`${w}      ${String(v.h).padStart(14)}  ${String(v.m).padStart(14)}`));

  // 안내별: ‘정보가 부족해요’가 많은 순
  const byItem = {};
  all.forEach(r => {
    const k = r.region + '|' + r.item;
    const x = byItem[k] = byItem[k] || { region: r.region, item: r.item, helpful: 0, more: 0, reasons: {} };
    if (r.choice === 'helpful') x.helpful += r.n; else { x.more += r.n; x.reasons[r.reason] = (x.reasons[r.reason] || 0) + r.n; }
  });
  const items = Object.values(byItem).sort((a, b) => b.more - a.more || b.helpful - a.helpful);
  console.log('\n개선 요청이 많은 안내(정보가 부족해요 순, 상위 20)');
  items.slice(0, 20).forEach(x => console.log(`- [${regionName(x.region)}] ${nameOf(x.region, x.item)} — 부족해요 ${x.more}(${Object.entries(x.reasons).map(([k, n]) => `${REASON[k] || k} ${n}`).join(', ') || '-'}) · 도움 ${x.helpful}`));

  // 지역별
  const byRegion = {};
  all.forEach(r => { const x = byRegion[r.region] = byRegion[r.region] || { h: 0, m: 0 }; if (r.choice === 'helpful') x.h += r.n; else x.m += r.n; });
  console.log('\n지역별(최근 기간)');
  Object.entries(byRegion).sort((a, b) => b[1].m - a[1].m).forEach(([k, v]) => console.log(`- ${regionName(k)}: 도움 ${v.h} · 부족해요 ${v.m}`));

  console.log(`\n누적(저장 시작 뒤 전체): 도움이 되었어요 ${sum(total, r => r.choice === 'helpful')} · 정보가 부족해요 ${sum(total, r => r.choice === 'needs-more')}`);
  if (args.json) {
    fs.writeFileSync(path.resolve(String(args.json)), JSON.stringify({ days: perDay, total, labels: { CHOICE, REASON } }, null, 2));
    console.log('JSON 저장:', args.json);
  }
})().catch(e => { console.error('집계 실패:', e.message); process.exit(1); });
