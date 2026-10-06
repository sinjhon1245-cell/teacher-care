// 관리자용 운영 점검 리포트 만들기 — node tools/generate-maintenance-report.js → docs/maintenance-report.md
// 데이터 검사(check-data.js)·공식 링크 검사(check-links.js)·최신성(verifiedAt·sourceUpdatedAt·reviewStatus·reviewBy)·지역 gap을
// 한 문서로 모아요. 숫자는 모두 실제 데이터에서 계산해요(리포트에 직접 적은 값 없음). 공개 화면에는 연결하지 않아요.
//
// 옵션
//   --data=파일     check-data.js --json 결과를 다시 쓰기(없으면 지금 실행해요)
//   --links=파일    check-links.js --json 결과를 다시 쓰기(없으면 지금 실행해요, 1분 안팎)
//   --skip-links    링크 접속 점검을 건너뛰기(리포트에 ‘점검 안 함’으로 적어요)
//   --out=파일      출력 위치(기본 docs/maintenance-report.md)
// 기준일은 한국 시간 오늘이에요. CHECK_TODAY=2027-04-01 처럼 바꾸면 그날 기준으로 만들어요.

'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');
const { loadSiteData, ROOT } = require('./lib/load-site-data');
const { analyzeFreshness, kstToday, daysBetween, rankOf } = require('./lib/freshness');
const { analyzeGaps } = require('./lib/gaps');

const args = Object.fromEntries(process.argv.slice(2).map(a => { const [k, ...v] = a.replace(/^--/, '').split('='); return [k, v.length ? v.join('=') : true]; }));
const TODAY = process.env.CHECK_TODAY || kstToday();
const OUT = path.resolve(ROOT, typeof args.out === 'string' ? args.out : 'docs/maintenance-report.md');

// ── 1) 검사 결과 모으기 ──
function runJson(script, extra, timeout) {
  const file = path.join(os.tmpdir(), `teacher-care-${path.basename(script, '.js')}-${process.pid}-${Date.now()}.json`);
  const r = spawnSync(process.execPath, [path.join(ROOT, 'tools', script), `--json=${file}`, ...(extra || [])], { cwd: ROOT, encoding: 'utf8', timeout, env: process.env });
  let json = null;
  try { json = JSON.parse(fs.readFileSync(file, 'utf8')); fs.unlinkSync(file); } catch (e) { /* 실행 오류 */ }
  return { json, code: r.status, out: (r.stdout || '') + (r.stderr || '') };
}
function readJson(file) { return JSON.parse(fs.readFileSync(path.resolve(file), 'utf8')); }

const dataRun = typeof args.data === 'string' ? { json: readJson(args.data), code: null } : runJson('check-data.js', [], 120000);
const linkRun = args['skip-links'] ? null : typeof args.links === 'string' ? { json: readJson(args.links), code: null } : runJson('check-links.js', [], 600000);

const D = loadSiteData();
const fresh = analyzeFreshness(D, TODAY);
const gaps = analyzeGaps(require('./data/regional-gaps.js'), D);
const G = require('./data/regional-gaps.js');
const R = id => D.REGIONS[id];
const short = id => (R(id) && R(id).short) || id;

// ── 2) 요약 계산 ──
const dataJson = dataRun.json;
const dataStatus = !dataJson ? 'FAIL' : dataJson.ok ? 'PASS' : 'FAIL';
const linkRows = linkRun && linkRun.json ? linkRun.json.rows : null;
const count = v => (linkRows || []).filter(r => r.verdict === v).length;
const offline = linkRows && linkRows.length && linkRows.every(r => r.verdict === 'check' && !Number.isInteger(r.status));
const linkStatus = !linkRun ? '점검 안 함' : !linkRows ? 'FAIL' : offline ? '접속 불가(네트워크 확인)' : count('broken') ? 'FAIL' : count('check') ? 'PASS(확인 필요 있음)' : 'PASS';
const programs = D.REGION_ORDER.map(id => [id, R(id).programs.length]);
const sources = [['공통', D.COMMON_PUBLIC_SOURCES.length], ['교차 확인', (D.VALIDATION_SOURCES || []).length], ...D.REGION_ORDER.map(id => [short(id), R(id).sources.length])];
const reviewNeeded = fresh.flags.length + fresh.due.length;
// 최근 전체 확인일: 모든 지역 안내를 마지막으로 다 확인한 날(지역 verifiedAt 중 가장 이른 날)
const fullCheck = D.REGION_ORDER.map(id => R(id).verifiedAt).sort()[0];
const allDates = fresh.dates.filter(x => x.field === 'verifiedAt').map(x => x.date).sort();

// ── 3) 묶음 이름 ──
function groupLabel(g) {
  const [kind, id] = g.split(':');
  return {
    'common-benefits': '회복·보호 제도(BENEFITS)', 'common-sources': '공통 근거',
    programs: `${short(id)} 지원 프로그램`, benefits: `${short(id)} 회복·보호 지역 기준`, sources: `${short(id)} 출처`,
    contacts: `${short(id)} 전화번호`, areas: `${short(id)} 관할`, region: `${short(id)} 지역 안내 전체`
  }[id ? kind : g] || g;
}
const fmtD = (d, base = TODAY) => { const n = daysBetween(base, d); return n === 0 ? '오늘' : n > 0 ? `D-${n}` : `${-n}일 지남`; };
// ISO 시각 → 한국 시간 'YYYY-MM-DD HH:MM'
const kst = iso => { const t = Date.parse(iso); return Number.isNaN(t) ? String(iso) : new Date(t + 9 * 3600 * 1000).toISOString().slice(0, 16).replace('T', ' '); };
const esc = s => String(s == null ? '' : s).replace(/\|/g, '\\|').replace(/\r?\n/g, ' ');
const cut = (s, n = 60) => (s.length > n ? s.slice(0, n - 1) + '…' : s);

// ── 4) 다음 점검 항목(우선순위 순) ──
const tasks = [];
fresh.due.forEach(x => tasks.push({ p: 1, tag: '재확인일 지남', text: `${groupLabel(x.group)} — ${x.field} ${x.date}(${fmtD(x.date)}) · 새 공식 자료로 다시 확인` }));
fresh.flags.forEach(x => {
  const why = x.status === 'review-needed' ? '공식 상세자료 확인' : x.status === 'source-unavailable' ? '원문 게시물 다시 찾기' : x.status;
  tasks.push({ p: 2, tag: `재검토 필요(${x.status})`, text: `${x.label} — ${why}` });
});
// 오래된 정보·예정은 묶음(지역 × 종류)별로 한 줄로 모아요(상세는 아래 ‘오래된 정보 상세’)
function byGroup(list) {
  const m = new Map();
  list.forEach(x => {
    if (!m.has(x.group)) m.set(x.group, { group: x.group, n: 0, first: x.date, last: x.date, what: new Set(), kinds: new Set(), labels: [] });
    const g = m.get(x.group);
    g.n++; g.labels.push(x.label);
    if (x.date < g.first) g.first = x.date;
    if (x.date > g.last) g.last = x.date;
    (x.what || []).forEach(w => g.what.add(w));
    if (x.kind) g.kinds.add(x.kind);
  });
  return [...m.values()];
}
const range = g => `${g.first}${g.last !== g.first ? ` ~ ${g.last}` : ''}`;
const one = g => (g.n === 1 && !g.labels[0].endsWith('전체') ? ` · ${cut(g.labels[0], 40)}` : '');
byGroup(fresh.stale).sort((a, b) => rankOf([...a.what]) - rankOf([...b.what]) || a.first.localeCompare(b.first))
  .forEach(g => tasks.push({ p: 3, tag: '오래된 정보', text: `${groupLabel(g.group)} ${g.n}건 — 확인일 ${range(g)} · 확인할 것: ${[...g.what].sort((a, b) => rankOf([a]) - rankOf([b])).join('·')}${one(g)}` }));
// 예정: 재확인일(reviewBy)과 확인 기준일(확인일 + 기준 일수)
function upcoming(from, to) {
  const list = [];
  fresh.reviews.filter(x => !x.passed && x.days > from && x.days <= to).forEach(x => list.push({ date: x.date, group: x.group, kind: '재확인일', label: x.label }));
  fresh.dates.filter(x => !x.stale && daysBetween(TODAY, x.until) > from && daysBetween(TODAY, x.until) <= to).forEach(x => list.push({ date: x.until, group: x.group, kind: '확인 기준일', label: x.label }));
  return byGroup(list).sort((a, b) => a.first.localeCompare(b.first) || a.group.localeCompare(b.group));
}
const fmtUp = g => `${groupLabel(g.group)} ${[...g.kinds].join('·')} ${range(g)}(${fmtD(g.first)})${g.n > 1 ? ` · ${g.n}건` : one(g)}`;
upcoming(0, 30).forEach(x => tasks.push({ p: 4, tag: '30일 내 예정', text: fmtUp(x) }));
upcoming(30, 90).forEach(x => tasks.push({ p: 5, tag: '90일 내 예정', text: fmtUp(x) }));
gaps.open.forEach(x => tasks.push({ p: 6, tag: `지역 gap · ${G.statuses[x.status]}`, text: `${x.todo}${x.extra ? ` (${x.label})` : ` (${short(x.region)} ${x.label})`}` }));
const later = upcoming(90, 366 * 2);

// ── 5) 최신성 현황 표 ──
const regionReview = id => fresh.reviews.filter(x => x.group === `region:${id}`).map(x => x.date).sort()[0];
function freshRow(title, groups, kinds) {
  const ds = fresh.dates.filter(x => groups.includes(x.group));
  const oldest = ds.slice().sort((a, b) => a.date.localeCompare(b.date))[0];
  const warnFrom = ds.map(x => x.until).sort()[0];
  const rv = [...fresh.reviews.filter(x => groups.includes(x.group)).map(x => x.date),
    ...groups.map(g => g.split(':')[1]).filter(Boolean).map(regionReview).filter(Boolean)].sort()[0];
  const stale = ds.filter(x => x.stale).length;
  const flags = fresh.flags.filter(x => groups.includes(x.group)).length;
  const oldestLabel = oldest ? `${oldest.date}${groups.length > 1 && oldest.group ? ` (${groupLabel(oldest.group)})` : ''}` : '—';
  return `| ${title} | ${ds.length} | ${kinds} | ${oldestLabel} | ${warnFrom || '—'} | ${rv ? `${rv} (${fmtD(rv)})` : '—'} | ${stale} | ${flags} |`;
}
const regs = D.REGION_ORDER;
const FDays = D.FRESHNESS_DAYS;
const freshTable = [
  '| 묶음 | 항목 | 기준 | 가장 오래된 확인일 | 주의 시작일 | 가장 가까운 reviewBy | 오래됨 | 재검토 |',
  '| --- | ---: | --- | --- | --- | --- | ---: | ---: |',
  freshRow('회복·보호 제도(BENEFITS)', ['common-benefits'], `stable ${FDays.stable}일`),
  ...regs.map(id => freshRow(`${short(id)} 지원 프로그램`, [`programs:${id}`], `volatile ${FDays.volatile}일`)),
  freshRow('지역 회복·보호 기준', regs.map(id => `benefits:${id}`), `volatile ${FDays.volatile}일`),
  freshRow('전화번호(대표·교육지원청·기관)', regs.map(id => `contacts:${id}`), `volatile ${FDays.volatile}일`),
  freshRow('교육지원청 관할', regs.map(id => `areas:${id}`), `volatile ${FDays.volatile}일`),
  freshRow('출처(공통 근거)', ['common-sources'], `stable ${FDays.stable}일`),
  freshRow('출처(지역)', regs.map(id => `sources:${id}`), `volatile ${FDays.volatile}일`)
].join('\n');

// ── 6) 링크 ──
const VERDICT = { ok: '정상', moved: '이동(redirect)', check: '확인 필요', broken: '끊김' };
let linkSection;
if (!linkRun) linkSection = '이번에는 링크 접속 점검을 하지 않았어요(`--skip-links`). `node tools/check-all.js`로 다시 만드세요.';
else if (!linkRows) linkSection = `링크 점검 도구가 결과를 남기지 못했어요(실행 오류).\n\n\`\`\`\n${(linkRun.out || '').slice(-1500)}\n\`\`\``;
else {
  const bad = linkRows.filter(r => r.verdict !== 'ok');
  linkSection = [
    `점검 시각: ${kst(linkRun.json.checkedAt)}(한국 시간) · 링크 ${linkRows.length}개(사용 위치 ${linkRows.reduce((n, r) => n + r.where.length, 0)}곳)`,
    '',
    '| 정상 | redirect | 확인 필요 | broken |',
    '| ---: | ---: | ---: | ---: |',
    `| ${count('ok')} | ${count('moved')} | ${count('check')} | ${count('broken')} |`,
    '',
    bad.length ? ['| 판정 | 상태 | 주소 | 위치 | 메모 |', '| --- | --- | --- | --- | --- |',
      ...bad.sort((a, b) => ['broken', 'check', 'moved'].indexOf(a.verdict) - ['broken', 'check', 'moved'].indexOf(b.verdict))
        .map(r => `| ${VERDICT[r.verdict]} | ${esc(r.status)} | ${esc(r.url)}${r.verdict === 'moved' ? ` → ${esc(r.finalUrl)}` : ''} | ${esc(r.where.join(', '))} | ${esc(r.note || '')} |`)].join('\n')
      : '확인 필요·broken·redirect 링크가 없어요. (정상 링크 목록은 싣지 않아요. 전체는 `node tools/check-links.js --json=결과.json`)'
  ].join('\n');
}

// ── 7) 지역별 gap ──
const gapTable = [
  `| 영역 | ${regs.map(short).join(' | ')} |`,
  `| --- | ${regs.map(() => '---').join(' | ')} |`,
  ...G.areas.map(a => `| ${a.label} | ${regs.map(id => { const x = gaps.rows.find(r => r.region === id && r.area === a.id); return x ? G.statuses[x.status] : '—'; }).join(' | ')} |`)
].join('\n');
const gapCounts = regs.map(id => `${short(id)}: ${Object.keys(G.statuses).map(s => `${G.statuses[s]} ${gaps.rows.filter(r => r.region === id && r.status === s).length}`).join(' · ')}`);
const gapDetail = gaps.open.map(x => `- **${short(x.region)} · ${x.label}** — ${G.statuses[x.status]}: ${x.note}\\\n  다음 확인: ${x.todo}`);

// ── 8) 문서 ──
const summaryRows = [
  ['데이터 검증', `${dataStatus}${dataJson ? ` (오류 ${dataJson.errors.length} · 주의 ${dataJson.warnings.length})` : ' (검사 도구 실행 실패)'}`],
  ['공식 링크', linkRows ? `${linkStatus} (${linkRows.length}개)` : linkStatus],
  ['오래된 정보', fresh.stale.length],
  ['재검토 필요', `${reviewNeeded}${reviewNeeded ? ` (reviewStatus ${fresh.flags.length} · 재확인일 지남 ${fresh.due.length})` : ''}`],
  ['지역 gap', `${gaps.openInAreas}${(gaps.extras || []).filter(x => x.status !== 'complete').length ? ` (+ 영역 밖 ${(gaps.extras || []).filter(x => x.status !== 'complete').length})` : ''}`],
  ['broken link', linkRows ? count('broken') : '—'],
  ['상황', `${D.SITUS.length} / ${dataJson ? dataJson.summary.expectedSitus : '?'}`],
  ['그룹', `${D.SITU_GROUPS.length} / ${dataJson ? dataJson.summary.expectedGroups : '?'}`],
  ['제도', D.BENEFITS.length],
  ['지원 프로그램', `${programs.reduce((n, [, c]) => n + c, 0)} (${programs.map(([id, c]) => `${short(id)} ${c}`).join(' · ')})`],
  ['출처', `${sources.reduce((n, [, c]) => n + c, 0)} (${sources.map(([k, c]) => `${k} ${c}`).join(' · ')})`]
];
// 오래된 정보 상세(접힘): 다음 점검 항목에는 묶음별 한 줄만 보여 줘요
const staleDetail = fresh.stale.length ? [
  `### 오래된 정보 상세(${fresh.stale.length}건)`, '', '<details><summary>펼치기</summary>', '',
  ...fresh.stale.slice().sort((a, b) => rankOf(a.what) - rankOf(b.what) || a.date.localeCompare(b.date))
    .map(x => `- ${x.label} — ${x.field} ${x.date}(${x.age}일, 기준 ${x.limit}일) · ${x.what.join('·')}`),
  '', '</details>'
].join('\n') : '';
const md = `# teacher-care 운영 점검

> 자동으로 만든 문서예요. 직접 고치지 말고 \`node tools/check-all.js\`(또는 \`node tools/generate-maintenance-report.js\`)로 다시 만드세요.
> 공개 화면에는 연결하지 않아요. 근거 데이터: \`data/*.js\`, \`data/regions/*.js\`, \`tools/data/regional-gaps.js\`

| 항목 | 값 |
| --- | --- |
| 생성일 | ${TODAY} (한국 시간) |
| asset version | ${D.assetVersion || '없음'} |
| 최근 전체 확인일 | ${fullCheck} (모든 지역 안내를 마지막으로 다 확인한 날) |
| 확인일 범위 | ${allDates[0]} ~ ${allDates[allDates.length - 1]} (항목 ${fresh.items}건) |

| 점검 | 결과 |
| --- | --- |
${summaryRows.map(([k, v]) => `| ${k} | ${esc(v)} |`).join('\n')}

## 다음 점검 항목

우선순위: 재확인일 지남 → 재검토 필요 → 오래된 정보 → 30일 내 예정 → 90일 내 예정 → 지역 gap(부분적·부족·미확인)

${tasks.length ? tasks.sort((a, b) => a.p - b.p).map((t, i) => `${i + 1}. [${t.tag}] ${t.text}`).join('\n') : '지금 할 일이 없어요.'}

${later.length ? `### 그 뒤 예정(90일 이후, 가까운 순)\n\n${later.slice(0, 8).map(x => `- ${fmtUp(x)}`).join('\n')}${later.length > 8 ? `\n- 외 ${later.length - 8}건` : ''}` : ''}

${staleDetail}

## 최신성 현황

기준(\`data/common.js\` FRESHNESS_DAYS): 법령·공통 제도 stable ${FDays.stable}일 · 지역 사업·금액·연락처·관할 volatile ${FDays.volatile}일. 기준을 넘기면 ‘오래된 정보’, reviewBy가 지나면 ‘재확인일 지남’이에요.
‘주의 시작일’은 그 묶음에서 가장 먼저 기준 일수를 넘기는 날, reviewBy는 지역 전체 재확인일(새 학년도 등)도 함께 봐요.

${freshTable}

## 링크 현황

${linkSection}

## 지역별 gap

근거 데이터: \`tools/data/regional-gaps.js\`(확인일 ${G.checkedAt}). 판정 기준과 지난 기록은 \`docs/regional-gap-audit-2026.md\`에 있어요. 자료가 없다고 다른 지역 값을 옮겨 적지 않아요.

${gapTable}

${gapCounts.map(x => `- ${x}`).join('\n')}

### 충분이 아닌 영역

${gapDetail.length ? gapDetail.join('\n') : '없어요.'}

## 데이터 검증 주의·오류

${!dataJson ? `검사 도구가 결과를 남기지 못했어요.\n\n\`\`\`\n${(dataRun.out || '').slice(-1500)}\n\`\`\`` : [...dataJson.errors.map(e => `- 오류: ${e}`), ...dataJson.warnings.map(w => `- 주의: ${w}`)].join('\n') || '오류·주의가 없어요.'}

## 다시 만들기

\`\`\`bash
node tools/check-all.js
\`\`\`

개별 실행: \`node tools/check-data.js\` · \`node tools/check-links.js\` · \`node tools/generate-maintenance-report.js\`(\`--skip-links\`로 링크 점검 생략). 연간 갱신 순서는 \`docs/annual-maintenance-checklist.md\`.
`.replace(/\n{3,}/g, '\n\n');

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, md.replace(/\r?\n/g, '\n'));
console.log(`리포트: ${path.relative(ROOT, OUT)} · 데이터 ${dataStatus} · 링크 ${linkStatus} · 오래된 정보 ${fresh.stale.length} · 재검토 ${reviewNeeded} · 지역 gap ${gaps.openInAreas} · 다음 점검 ${tasks.length}건`);
