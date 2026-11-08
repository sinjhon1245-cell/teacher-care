// Phase C 1차(2026-11-08) 검증 상태 표시 회귀 검사 — 날짜 문구·상태 배지·검증 범위(checks)를 지켜요.
// node tools/check-phase-c1-status.js
// 설계: docs/audit/verification-status-design-20261107.md · 결과: docs/audit/phase-c1-verification-status-20261108.md
//  1) 화면 함수(app.js의 checkedScope·statusBadge·sourceLine)를 가짜 데이터로 돌려 시나리오 A~I를 확인해요(실데이터 개수에 기대지 않음).
//  2) 재발 방지(실패): ‘최종 확인’·‘확인 중’ 문구, 카드당 배지 둘 이상, 색만으로 전하는 상태를 막아요.
//  3) 실데이터 불변식(실패): review-needed·conflict 항목은 모두 글자 배지와 확인 안내를 가져요. 개수는 세지 않아요.
//  4) 대상 확인(경고): 이번에 checks를 넣은 항목이 이름 변경·삭제로 사라지면 다시 확인하라고 알려요.
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { loadSiteData } = require('./lib/load-site-data');
const ROOT = path.join(__dirname, '..');
const APP = fs.readFileSync(path.join(ROOT, 'app.js'), 'utf8');
const warnings = [];
const warn = m => warnings.push(m);

// app.js에서 최상위 함수 하나를 그대로 떼어 와요(중괄호 짝 맞추기)
function extract(name) {
  const start = APP.indexOf(`\nfunction ${name}(`);
  assert.ok(start >= 0, `app.js에 ${name} 함수가 없어요`);
  let depth = 0, i = APP.indexOf('{', start);
  for (; i < APP.length; i++) {
    if (APP[i] === '{') depth++;
    else if (APP[i] === '}' && --depth === 0) break;
  }
  return APP.slice(start, i + 1);
}
const TODAY = '2026-11-08';
const ctx = vm.createContext({ UpdateUI: { today: () => TODAY } });
vm.runInContext(['periodPassed', 'checkedScope', 'statusBadge', 'statusBadgeHtml', 'sourceLine', 'latestDate', 'fmtDate', 'escapeAttr'].map(extract).join('\n') +
  '\nthis.F = { periodPassed, checkedScope, statusBadge, statusBadgeHtml, sourceLine };', ctx);
const F = ctx.F;
const strip = html => html.replace(/<[^>]+>/g, '');
const R = { verifiedAt: '2026-10-01', sources: [
  { title: '교육청 안내', url: 'https://example.go.kr/a', verifiedAt: '2026-11-07' },
  { title: '기본계획', url: 'https://example.go.kr/b', verifiedAt: '2026-10-20' }
] };
const base = { t: '시험 사업', status: '현재 시행 중', reviewStatus: 'verified', verifiedAt: '2026-10-20', source: 0 };
const badge = p => { const b = F.statusBadge(p); return b ? b.text : null; };
const line = p => strip(F.sourceLine(R, p));

// ── 1) 시나리오 ───────────────────────────────────────────────
// A. 확인 완료(verified)·checks 없음: 배지 없음, ‘자료 확인’
assert.equal(badge(base), null, 'A: verified 항목에 배지를 붙이지 않아요');
assert.match(line(base), /^2026\. 10\. 20\. 자료 확인 · 근거 자료$/, 'A: 날짜 문구는 ‘자료 확인’');
// B. 일부 신청 조건 확인 필요(review-needed)
const B = { ...base, reviewStatus: 'review-needed' };
assert.equal(badge(B), '조건 확인 필요', 'B: review-needed 배지');
assert.equal(F.statusBadge(B).cls, 'badge badge-check', 'B: 경고색이 아닌 테두리 배지');
// C. 원문 열람 불가(source-unavailable)
const C = { ...base, reviewStatus: 'source-unavailable' };
assert.equal(badge(C), '원문 열람 불가', 'C: source-unavailable 배지');
assert.match(line(C), /원문 게시물을 지금 열 수 없어요/, 'C: 날짜 옆 짧은 안내');
// D. checks 없는 기존 데이터(하위 호환): verifiedAt → 없으면 근거 자료 확인일 → 지역 확인일
assert.match(line({ ...base, verifiedAt: undefined }), /^2026\. 11\. 7\. 자료 확인/, 'D: verifiedAt이 없으면 근거 자료 확인일');
assert.match(line({ t: 'x', status: '현재 시행 중' }), /^2026\. 10\. 1\. 자료 확인$/, 'D: 근거도 없으면 지역 확인일');
assert.match(line({ ...base, checks: { exists: '2026-10-20' } }), /^2026\. 10\. 20\. 자료 확인/, 'D: exists만 있으면 신청 조건을 확인한 것처럼 쓰지 않아요');
// E. 신청 조건만 확인(terms)
assert.match(line({ ...base, verifiedAt: '2026-11-07', checks: { exists: '2026-11-07', terms: '2026-11-07' } }), /^2026\. 11\. 7\. 신청 조건 확인 · /, 'E: terms');
assert.match(line({ ...base, checks: { route: '2026-10-20' } }), /^2026\. 10\. 20\. 신청 경로 확인 · /, 'E: route만');
// F. 신청 조건·경로 모두 확인: 더 이른 날짜(확인 범위를 넘겨 말하지 않게)
assert.match(line({ ...base, verifiedAt: '2026-11-07', checks: { terms: '2026-11-07', route: '2026-10-20' } }), /^2026\. 10\. 20\. 신청 조건·경로 확인 · /, 'F: terms+route는 더 이른 날짜');
// G. 공식 자료 간 차이(conflict): ‘조건 확인 필요’와 겹치지 않고 하나만
const G = { ...base, reviewStatus: 'review-needed', checks: { conflict: '신청 기한 — 신청 페이지 6개월, 기본계획 1년' } };
assert.equal(badge(G), '자료 간 차이', 'G: conflict 배지가 review-needed보다 우선');
assert.match(line(G), /자료 확인/, 'G: conflict만으로 날짜 범위를 바꾸지 않아요');
// H. 공식 기간이 지남(validUntil)
assert.equal(badge({ ...base, validUntil: '2026-11-07' }), '기간 확인 필요', 'H: 기간 지남');
assert.equal(badge({ ...base, validUntil: TODAY }), null, 'H: 마지막 날까지는 배지 없음');
assert.equal(badge({ ...B, validUntil: '2026-11-01' }), '기간 확인 필요', 'H: 기간 지남이 review-needed보다 우선');
// I. 운영 상태 배지와 검증 상태가 겹칠 때: 운영 상태 하나만
assert.equal(badge({ ...B, status: '신청 전 확인' }), '신청 전 확인', 'I: 운영 상태가 우선');
assert.equal(badge({ ...G, status: '시범 운영', validUntil: '2026-01-01' }), '시범 운영', 'I: 운영 상태 > 기간 > 차이');

// ── 2) 재발 방지 ──────────────────────────────────────────────
const shown = [APP, fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8'),
  ...fs.readdirSync(path.join(ROOT, 'data')).filter(f => f.endsWith('.js')).map(f => fs.readFileSync(path.join(ROOT, 'data', f), 'utf8')),
  ...fs.readdirSync(path.join(ROOT, 'data/regions')).map(f => fs.readFileSync(path.join(ROOT, 'data/regions', f), 'utf8'))].join('\n');
assert.ok(!/최종 확인/.test(shown), '‘최종 확인’은 신청 가능 보장처럼 읽혀요 — ‘자료 확인’·‘신청 조건 확인’을 써요');
for (const p of [B, C, G, { ...base, validUntil: '2026-01-01' }, { ...B, status: '신청 전 확인' }]) {
  const html = F.statusBadgeHtml(p);
  assert.ok(!/확인 중/.test(html), '‘확인 중’처럼 운영자 작업 상태로 쓰지 않아요');
  assert.match(html, /<span class="sr-only">상태: <\/span>/, '배지는 화면 읽기 프로그램에 ‘상태:’로 읽혀요');
  assert.equal((html.match(/class="badge/g) || []).length, 1, '배지는 하나만');
  assert.ok(strip(html).replace('상태: ', '').length >= 4, '배지는 색이 아니라 글자로 뜻을 전해요');
}
assert.equal(F.statusBadgeHtml(base), '', '확인 완료 항목은 배지 HTML이 비어요');
// 겹침(최종 점검): 앞 순위 배지가 뒤의 중요한 사실을 숨기지 않아요 — 배지는 하나, 사실은 날짜 줄·기간 안내·카드 상세에 남아요
assert.equal(badge({ ...G, status: '신청 전 확인' }), '신청 전 확인', '겹침: 신청 전 확인 + 자료 간 차이 → 운영 상태 배지');
assert.equal(badge({ ...G, status: '2026 신청 마감' }), '2026 신청 마감', '겹침: 신청 마감 + 기한 충돌 → 운영 상태 배지');
const expiredGone = { ...C, validUntil: '2026-10-31' };
assert.equal(badge(expiredGone), '기간 확인 필요', '겹침: 기간 지남 + 원문 열람 불가 → 기간 배지');
assert.match(line(expiredGone), /원문 게시물을 지금 열 수 없어요/, '겹침: 원문 열람 불가는 날짜 줄에 계속 보여요');
assert.match(APP, /periodPassed\(p\) \? callout\('caution', '기간 확인'/, '겹침: 기간 지남은 배지와 함께 카드 안 기간 안내 상자로도 보여요');
// 지원 카드 제목 줄에는 상태 배지 자리가 하나뿐이에요(인라인 배지를 다시 만들지 않게)
const head = (APP.match(/<div class="support-head">[\s\S]*?<\/div>/) || [''])[0];
assert.ok(head, '지원 카드 제목 줄(support-head)을 찾지 못했어요');
assert.equal((head.match(/statusBadgeHtml\(p\)/g) || []).length, 1, '제목 줄 배지는 statusBadgeHtml 한 곳에서만');
assert.ok(!/class="badge/.test(head), '제목 줄에 다른 배지를 직접 쓰지 않아요');
// 검증 상태 배지는 경고색을 쓰지 않아요
const css = fs.readFileSync(path.join(ROOT, 'style.css'), 'utf8');
const checkCss = (css.match(/\.badge-check\s*\{[^}]*\}/) || [''])[0];
assert.ok(checkCss && !/--(danger|warn|caution|error|accent)/.test(checkCss), '.badge-check는 경고·강조색 없이 테두리로만');

// ── 3) 실데이터 불변식 ────────────────────────────────────────
const D = loadSiteData(ROOT);
const all = D.REGION_ORDER.flatMap(id => D.REGIONS[id].programs.map(p => ({ id, p, R: D.REGIONS[id] })));
let reviewed = 0, scoped = 0, conflicts = 0;
for (const { id, p, R: RR } of all) {
  const tag = `[${id}] ${p.t}`;
  const b = F.statusBadge(p);
  const l = strip(F.sourceLine(RR, p));
  assert.ok(!/최종 확인|확인일 미기재/.test(l), `${tag}: 날짜 문구 ${l}`);
  if (p.reviewStatus === 'review-needed' || p.reviewStatus === 'source-unavailable') {
    reviewed++;
    assert.ok(b, `${tag}: ${p.reviewStatus}인데 배지가 없어요`);
    assert.match(`${p.timing || ''} ${p.caution || ''}`, /확인/, `${tag}: 무엇을 확인할지 안내가 없어요`);
  }
  if (p.checks && p.checks.conflict) {
    conflicts++;
    assert.equal(p.reviewStatus, 'review-needed', `${tag}: 자료 간 차이는 review-needed`);
    // 배지가 운영 상태에 가려져도 차이 나는 기한·금액은 카드 상세 문구에서 보여야 해요
    const detail = [p.timing, p.caution, p.amount, p.eligibility, p.target, p.apply].filter(Boolean).join(' ').replace(/\s+/g, '');
    for (const v of p.checks.conflict.match(/\d+\s*(개월|년|일|만\s?원|회기)/g) || []) assert.ok(detail.includes(v.replace(/\s+/g, '')), `${tag}: 자료 간 차이 ‘${v}’가 카드 상세에 없어요`);
    if (!p.status || p.status === '현재 시행 중') assert.equal(b.text, '자료 간 차이', `${tag}: 자료 간 차이 배지`);
  }
  if (F.checkedScope(p)) {
    scoped++;
    assert.match(l, /신청 (조건|경로)/, `${tag}: checks가 있으면 확인 범위를 보여요`);
  }
}

// ── 4) 대상 확인(경고) ────────────────────────────────────────
const prog = (rid, re) => (D.REGIONS[rid] ? D.REGIONS[rid].programs : []).find(p => re.test(p.t));
const expect = (label, p, test, what) => { if (!p) warn(`${label} 항목이 없어요(이름 변경·통합·삭제?) — ${what} 확인 필요`); else assert.ok(test(p), `${label}: ${what}`); };
expect('[incheon] 법률지원단', prog('incheon', /법률지원단·교권전담변호사/), p => p.checks && p.checks.terms && p.checks.route, '신청 조건·경로 확인');
expect('[chungnam] 신고·심의', prog('chungnam', /교육활동 침해 신고·지역교권보호위원회 심의/), p => p.checks && p.checks.terms && p.checks.route, '신청 조건·경로 확인');
expect('[gyeongbuk] 치료비', prog('gyeongbuk', /상해 치료비·심리상담비/), p => p.checks && p.checks.terms && !p.checks.route, '신청 조건만 확인');
expect('[chungnam] 상담·회복', prog('chungnam', /교육활동 침해 상담·회복 지원 연결/), p => p.checks && /6개월/.test(p.checks.conflict || '') && /1년/.test(p.checks.conflict), '신청 기한 자료 간 차이');
expect('[gyeongnam] 보호조치 비용', prog('gyeongnam', /피해 교원 보호조치 비용 지원/), p => p.checks && /10일/.test(p.checks.conflict || '') && p.reviewStatus === 'review-needed', '신청 기한 자료 간 차이');

for (const w of warnings) console.log('주의: ' + w);
console.log(`PASS Phase C1: scenarios A–I · ${D.REGION_ORDER.length} regions / ${all.length} programs · 검증 상태 표시 ${reviewed} · 확인 범위 ${scoped} · 자료 간 차이 ${conflicts} · targeted ${warnings.length ? warnings.length + ' to re-check' : 'all present'}`);
