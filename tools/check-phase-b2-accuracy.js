// 독립 사실검증 Phase B 2차(2026-11-07) 회귀 검사 — 학교장 긴급조치, 공무상 병가·질병휴직, 상황 카드 법적 유형, 신청 손실 위험 사업,
// 시행 예정 교원지위법(2026. 11. 20.·12. 3.)의 조기 반영 방지를 지켜요.
// node tools/check-phase-b2-accuracy.js
// 근거와 수정 전후: docs/audit/phase-b2-legal-accuracy-20261107.md · 시행일 계획: docs/audit/pending-law-plan-2026-11-20-12-03.md
//  1) 재발 방지(실패): 바로잡은 표현이 어느 카드에든 다시 들어오면 실패해요. 개수·순번에 기대지 않아요.
//  2) 대상 확인(경고): 수정한 카드가 이름 변경·통합·삭제로 사라지면 다시 확인하라고 알려요.
//  3) 시행일 인식: 시행 전 개정 문구가 데이터에 미리 들어오면 실패, 시행일이 지나면 반영 여부를 확인하라는 경고를 내요.
'use strict';
const assert = require('node:assert/strict');
const path = require('node:path');
const { loadSiteData } = require('./lib/load-site-data');
const D = loadSiteData(path.join(__dirname, '..'));
const { REGIONS, REGION_ORDER, BENEFITS, SITUS, SUPPORT_TYPES } = D;
const warnings = [];
const warn = m => warnings.push(m);
const all = REGION_ORDER.flatMap(id => REGIONS[id].programs.map(p => ({ id, p })));
const commonText = JSON.stringify([SITUS, BENEFITS, SUPPORT_TYPES, D.STEPS]);
const everything = commonText + JSON.stringify(all);

// ── 1) 재발 방지 ──────────────────────────────────────────────
// 법령·고시에 없는 유형 이름을 쓰지 않아요(공식 유형: 교원지위법 제19조, 교육활동 침해 행위 및 조치 기준에 관한 고시 제2조)
for (const s of SITUS) assert.ok(!(s.officialTypes || []).includes('그 밖의 부당한 방해·간섭'), `[${s.id}] 법령·고시에 없는 유형 이름이에요`);
// 교육청이 게시물을 직접 삭제·차단해 주는 것처럼 쓰지 않아요(삭제 요청은 피해자가 플랫폼에, 성적 촬영물·합성물은 국가 삭제 지원)
assert.ok(!/삭제·차단 지원/.test(everything), '‘삭제·차단 지원’을 교육청 지원처럼 쓰지 않아요');
// 학교장 긴급조치를 안내하면 대상 범죄 한정과 위원회 추인을 함께 적어요(모든 침해에 가능한 것처럼 쓰지 않음)
for (const s of SITUS) {
  const t = `${s.legalCaution || ''} ${s.firstAction || ''}`;
  if (/긴급조치/.test(t)) assert.ok(/(상해|폭행|성폭력)/.test(t) && /추인/.test(t), `[${s.id}] 긴급조치는 상해·폭행·성폭력범죄 한정과 추인을 함께 적어요`);
}
// 공무상 병가 기간을 ‘연 180일’만으로 요약하지 않아요(같은 사유는 연도 구분 없이 180일)
assert.ok(!/공무상 연 180일/.test(JSON.stringify(D)), '‘공무상 연 180일’만으로 요약하지 않아요');
// 직권면직은 재량 규정이에요. ‘면직돼요’처럼 단정하지 않아요
assert.ok(!/면직(돼요|된다|됩니다|돼\b)/.test(everything), '면직을 단정하지 않아요(국가공무원법 제70조 ‘면직시킬 수 있다’)');

// ── 2) 대상 확인(경고) ────────────────────────────────────────
const situ = id => SITUS.find(s => s.id === id);
const ben = id => BENEFITS.find(b => b.id === id);
const prog = (rid, re) => (REGIONS[rid] ? REGIONS[rid].programs : []).find(p => re.test(p.t));
const expect = (label, item, test, what) => { if (!item) warn(`${label} 항목이 없어요(이름 변경·통합·삭제?) — ${what} 확인 필요`); else assert.ok(test(item), `${label}: ${what}`); };
expect('physical-assault', situ('physical-assault'), s => /제25조제9항/.test(s.legalCaution) && /추인/.test(s.legalCaution) && /의견을 진술/.test(s.legalCaution) && /보호자·외부인/.test(s.legalCaution), '학교장 긴급조치 요건·추인·의견 진술·적용 대상');
assert.ok(/school: \[[^\]]*학교장 긴급조치 검토[^\]]*추인/.test(require('node:fs').readFileSync(path.join(__dirname, '..', 'data/common.js'), 'utf8')), '대응 절차 ‘학교가 할 일’의 긴급조치 검토(STEP_DETAIL)');
expect('BEN official-sick-leave', ben('official-sick-leave'), b => /같은 사유/.test(b.limit) && /다시 승인받을 수 없어요/.test(b.limit), '같은 사유 180일 합산·재승인 불가');
expect('BEN disease-leave', ben('disease-leave'), b => (b.missed || []).some(m => /15일 전까지/.test(m)) && /직권면직 사유가 될 수 있어요/.test(b.caution || ''), '연장 15일 전 신청·면직 가능성');
expect('BEN official-disease-leave', ben('official-disease-leave'), b => /제19조제4항/.test(b.limit) && (b.missed || []).some(m => /15일 전까지/.test(m)), '요양 승인 기간 종료 뒤 연장 불가·15일 전 신청');
expect('BEN protection-request', ben('protection-request'), b => /관할청\(교육청\)이 정한 전문심리상담기관/.test(b.limit), '비용 인정 상담기관(시행령 제19조)');
expect('stalking-approach', situ('stalking-approach'), s => /스토킹처벌법/.test(s.legalCaution) && /긴급응급조치/.test(s.legalCaution), '스토킹 신고·긴급응급조치');
expect('synthetic-media-posting', situ('synthetic-media-posting'), s => /제14조의2/.test(s.legalCaution) && /중앙디지털성범죄피해자지원센터/.test(s.legalCaution), '성적 합성물·국가 삭제 지원');
expect('online-defamation-doxxing', situ('online-defamation-doxxing'), s => /6개월/.test(s.legalCaution) && /제44조의2/.test(s.legalCaution), '고소기간·삭제 요청 주체');
expect('[gyeongbuk] 치료비', prog('gyeongbuk', /상해 치료비·심리상담비/), p => /1년 이내 청구/.test(p.timing || '') && /중복 청구할 수 없어요/.test(p.caution), '청구 기한·중복 제외');
expect('[jeonnamgwangju] 전남권 상담', prog('jeonnamgwangju', /전남권 교육활동보호센터 개인상담/), p => /6개월 이내 신청/.test(p.timing || '') && !p.amount, '신청 기한(통합 전 금액은 미표시)');
expect('[busan] 치료비', prog('busan', /치료비·심리상담비·치유비/), p => /소멸시효는 3년/.test(p.timing), '1년 청구와 3년 시효의 관계');
expect('[busan] 공제', prog('busan', /^교원보호공제\(/), p => /1년 안에 청구/.test(p.timing), '치료비 1년 청구');
expect('[seoul] 법률지원', prog('seoul', /전담변호사·법률지원단/), p => /기소유예·선고유예·보호처분 포함/.test(p.caution), '환수 범위');
expect('[daegu] 소송비용', prog('daegu', /교원보호공제 소송비용/), p => /특약 제8조/.test(p.caution) && /보호처분/.test(p.caution), '환수 사유');

// ── 3) 시행 예정 교원지위법: 시행일 전에는 현행처럼 쓰지 않아요 ─────────
const today = new Date(Date.now() + 9 * 3600 * 1000).toISOString().slice(0, 10); // 한국 날짜
const PENDING = [
  { date: '2026-11-20', law: '법률 제21655호(제18조제3항 교사 위원 10분의 2 이상)', re: /10분의 2 이상|교사인 위원/ },
  { date: '2026-12-03', law: '법률 제21717호(제19조 대면 또는 비대면 교육활동, 제2호가목 현저한 지장, 제29조 센터 설치·운영)', re: /대면 또는 비대면 교육활동|교육활동에 현저한 지장을 주는 방식/ }
];
for (const x of PENDING) {
  const found = x.re.test(everything);
  if (today < x.date) assert.ok(!found, `${x.date} 시행 전인 ${x.law} 문구를 현행처럼 썼어요`);
  else if (!found) warn(`${x.date} 시행 ${x.law} — 시행일이 지났어요. docs/audit/pending-law-plan-2026-11-20-12-03.md 계획대로 반영 여부를 확인하세요`);
}

for (const w of warnings) console.log('주의: ' + w);
console.log(`PASS Phase B2: ${REGION_ORDER.length} regions / ${all.length} programs · ${SITUS.length} situations scanned · pending-law guard (today ${today}) · targeted ${warnings.length ? warnings.length + ' to re-check' : 'all present'}`);
