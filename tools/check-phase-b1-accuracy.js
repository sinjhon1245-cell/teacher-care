// 독립 사실검증 Phase B 1차(2026-11-07) 회귀 검사 — 내용 불일치·구정보 4건과 강원 교육지원청 연락처 정정이 되돌아가지 않게 지켜요.
// node tools/check-phase-b1-accuracy.js
// 근거와 수정 전후 문구: docs/audit/phase-b1-mismatch-fixes-20261107.md
// Phase A 검사(tools/check-phase-a-accuracy.js)와 같은 구조예요.
//  1) 재발 방지(실패): 바로잡은 표현·구조가 어느 카드에든 다시 들어오면 실패해요. 개수·순번에 기대지 않아요.
//  2) 대상 확인(경고): 수정한 카드가 이름 변경·통합·삭제로 사라지면 실패 대신 다시 확인하라고 알려요.
'use strict';
const assert = require('node:assert/strict');
const path = require('node:path');
const { loadSiteData } = require('./lib/load-site-data');
const D = loadSiteData(path.join(__dirname, '..'));
const { REGIONS, REGION_ORDER } = D;
const warnings = [];
const progs = id => (REGIONS[id] ? REGIONS[id].programs : []);
const all = REGION_ORDER.flatMap(id => REGIONS[id].programs.map(p => ({ id, p })));
const text = p => JSON.stringify(p);

// ── 1) 재발 방지 ──────────────────────────────────────────────
// 인천: 학교 변호사 ON은 희망교 신청·계약형이에요. ‘학교마다’ 자동 지원처럼 쓰지 않아요
for (const { id, p } of all) assert.ok(!/학교마다 1교 1변호사|모든 학교에 (전담 )?변호사/.test(text(p)), `[${id}] ${p.t}: 1교 1변호사를 모든 학교 지원처럼 썼어요`);
// 인천: 형사고발 요청서는 2026 매뉴얼 서식 14예요(서식 13-1·13-2는 조치 미이행 보고서)
for (const p of progs('incheon')) assert.ok(!/형사고발[^.]*서식 13\)/.test(text(p)), `[incheon] ${p.t}: 형사고발 요청서를 서식 13으로 적었어요`);
// 울산: 아동학대 신고 사안의 교육활동 확인서는 교육활동보호센터·교육지원청 등이 작성·발송해요(학교 제출로 쓰지 않아요)
for (const p of progs('ulsan')) assert.ok(!/학교가 교육활동 확인서를|학교가[^.]*교육활동 확인서를 공문으로 제출/.test(text(p)), `[ulsan] ${p.t}: 교육활동 확인서 작성·발송 주체를 학교로 썼어요`);
// 대구: 약관 제24조(청구 당시 약관 적용)가 있으므로 ‘적용 규정이 없다’고 쓰지 않아요
for (const p of progs('daegu')) assert.ok(!/어느 한도를 적용하는지 정한 규정이 없어요/.test(text(p)), `[daegu] ${p.t}: 약관 제24조와 어긋나요`);
// 충남: 1588-9331의 24시간은 접수 시간이에요. 상담·출동이 24시간이라고 쓰지 않아요
for (const p of progs('chungnam')) assert.ok(!/24시간\s*(상담|심리상담|법률상담|출동)/.test(text(p)), `[chungnam] ${p.t}: 24시간 상담·출동으로 과장했어요`);
// 강원: 교육지원청 연락처를 적었으면 ‘직통번호를 확인하지 못했다’는 일괄 안내와 모순되지 않아야 해요
if (REGIONS.gangwon) {
  const withContact = REGIONS.gangwon.offices.filter(o => /\d{2,4}-\d{3,4}-\d{4}/.test(o.contact || ''));
  if (withContact.length) assert.ok(!/교육지원청별 교육활동보호 직통번호는 공식 자료에서 확인되지 않아/.test(REGIONS.gangwon.areaNote), '[gangwon] 연락처를 적은 교육지원청이 있는데 areaNote가 모두 미확인이라고 해요');
  for (const o of withContact) {
    for (const n of o.contact.match(/\d{2,4}-\d{3,4}-\d{4}/g)) assert.ok(n.startsWith('033-'), `[gangwon] ${o.name}: 강원 번호가 아니에요 ${n}`);
    const host = new URL(o.url).hostname;
    assert.ok(REGIONS.gangwon.sources.some(s => new URL(s.url).hostname === host && /jobShare/.test(s.url)), `[gangwon] ${o.name}: 연락처 근거(교육지원청 조직도) 출처가 없어요`);
  }
}

// ── 2) 대상 확인(경고) ────────────────────────────────────────
const expect = (rid, re, test, what) => {
  const p = progs(rid).find(x => re.test(x.t));
  if (!p) warnings.push(`[${rid}] ${re} 사업이 없어요(이름 변경·통합·삭제?) — ${what} 확인 필요`);
  else assert.ok(test(p), `[${rid}] ${p.t}: ${what}`);
};
expect('incheon', /법률지원단·교권전담변호사/, p => /희망한 학교/.test(p.sum) && /법률 지원 의뢰서\(필수/.test(p.documents) && /서식 14/.test(p.caution) && (p.contacts || []).some(c => c.value === '032-550-1785'), '희망교·의뢰서 필수·서식 14·법률지원팀 번호');
expect('ulsan', /아동학대 신고 사안 교육감 의견서/, p => /교육활동보호센터와 교육지원청 등 담당 부서가 학교를 통해 사안을 확인/.test(p.apply) && /확인서 작성에 협조/.test(p.apply), '확인서 작성·발송 주체와 교원 협조');
expect('daegu', /^교원보호공제\(/, p => /제24조/.test(p.caution) && /청구할 당시의 약관/.test(p.caution), '약관 제24조 적용 기준');
expect('chungnam', /신고·지역교권보호위원회 심의/, p => /온라인 신고\(권장\)/.test(p.apply) && /24시간·연중 접수/.test(p.apply) && /5일 이내/.test(p.timing) && /21일 이내/.test(p.timing) && /14일 이내/.test(p.timing) && /신고 접수 시간/.test(p.caution) && /17:30/.test(p.caution), '2026. 10. 신고 경로·기한·운영시간 구분');

for (const w of warnings) console.log('주의: ' + w);
const gw = REGIONS.gangwon ? REGIONS.gangwon.offices.filter(o => /\d/.test(o.contact || '')).length : 0;
console.log(`PASS Phase B1: ${REGION_ORDER.length} regions / ${all.length} programs scanned · Gangwon offices with sourced contacts ${gw} · targeted cards ${warnings.length ? warnings.length + ' to re-check' : 'all present'}`);
