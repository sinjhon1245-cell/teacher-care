// 독립 사실검증 Phase A(2026-11-07) 회귀 검사 — P1 4건·심리상담 토큰(CARE)·고위험 연락처 정정이 다시 틀어지지 않게 지켜요.
// node tools/check-phase-a-accuracy.js
// 근거와 수정 전후 문구: docs/audit/phase-a-high-risk-fixes-20261107.md
'use strict';
const assert = require('node:assert/strict');
const path = require('node:path');
const { loadSiteData } = require('./lib/load-site-data');
const D = loadSiteData(path.join(__dirname, '..'));
const { REGIONS, REGION_ORDER, BENEFITS, SITUS, SUPPORT_TYPES } = D;
const fs = require('node:fs');
const common = fs.readFileSync(path.join(__dirname, '..', 'data/common.js'), 'utf8');

// 규모 보존: 16개 지역·192개 사업·상황 38·제도 10
assert.equal(REGION_ORDER.length, 16);
assert.equal(REGION_ORDER.reduce((n, id) => n + REGIONS[id].programs.length, 0), 192, '지역 사업 192건 유지');
assert.equal(SITUS.length, 38);
assert.equal(BENEFITS.length, 10);

// B-1: 심리상담 문장은 {CARE}로 치환하고, 지역마다 법률 창구가 들어가지 않아요
const fill = (text, terms) => String(text).replace(/\{(HOT1|HOT2|HOT|CARE|OFFICER|LEGAL|MUTUAL|SOS|MEDIATE)\}/g, (_, k) => terms[k]);
const counselTexts = [
  ...SITUS.filter(s => ['post-incident-burnout', 'counseling-treatment-return'].includes(s.id)).flatMap(s => [s.firstAction, s.orgs]),
  SUPPORT_TYPES.find(t => t.id === 'counsel').guide.apply
];
assert.equal(counselTexts.length, 5);
assert.ok(counselTexts.every(t => t.includes('{CARE}') && !t.includes('{HOT1}')), '심리상담 문장은 {CARE}만 써요');
assert.ok(/first: '\{CARE\}로 심리상담·치료 지원을 신청하세요/.test(common), '홈 빠른 입구(심리상담·치료)도 {CARE}');
for (const id of REGION_ORDER) {
  const terms = REGIONS[id].terms;
  assert.ok(terms.CARE && !/변호사|법률/.test(terms.CARE), `[${id}] CARE는 심리상담 창구`);
  for (const t of counselTexts) assert.ok(!/변호사/.test(fill(t, terms)), `[${id}] 심리상담 문장에 변호사가 들어가요: ${fill(t, terms)}`);
}
assert.ok(/교육활동보호센터/.test(REGIONS.jeonnamgwangju.terms.CARE) && !/전담변호사/.test(REGIONS.jeonnamgwangju.terms.CARE), '전남광주 CARE는 권역별 교육활동보호센터');
assert.ok(REGIONS.gangwon.terms.CARE.includes('033-258-5344'), '강원 CARE는 교권전담 상담사(심리상담 접수)');

// B-4: 심리적 위기 — 일반 상담과 위기를 구분하고 24시간 국가 상담전화를 조건부로 안내해요
const burnout = SITUS.find(s => s.id === 'post-incident-burnout');
assert.ok(/죽고 싶은 생각이 들거나/.test(burnout.firstAction) && /109/.test(burnout.firstAction) && /112·119/.test(burnout.firstAction), '위기 조건과 109·112·119');
assert.ok(/1577-0199/.test(burnout.orgs), '정신건강 위기상담전화');
assert.equal(burnout.urgency, '일반 상담 가능', '모든 불안을 긴급 위기로 분류하지 않아요');

// A-1: 공무상 요양 심리상담비 — 상담 전 공단 승인, 교육청 상담과 구분
const care = BENEFITS.find(b => b.id === 'official-medical-care');
assert.ok(/상담을 시작하기 전에 공무원연금공단의 승인/.test(care.limit), '사전승인 조건');
assert.ok(/별개 제도/.test(care.limit), '교육청 심리상담 지원과 구분');
assert.ok(care.refs.includes('geps-counsel') && /제39조/.test(care.basis), '공단 안내·시행령 제39조 근거');
assert.ok(!BENEFITS.some(b => b.id !== 'official-medical-care' && /사전승인|공단의 승인/.test(JSON.stringify(b))), '다른 제도에 공단 사전승인을 일반화하지 않아요');

// A-2: 경기 불송치 이의신청 — 피해자 권리, 고발인 제한, 3개월은 2026. 10. 2. 이후 통지분
const gg = REGIONS.gyeonggi.programs.find(p => p.t === 'SOS! 경기교육법률지원단');
assert.ok(!/고소인만 가능/.test(gg.caution), '‘고소인만 가능’ 삭제');
assert.ok(/피해 교원은 피해자로서 이의신청/.test(gg.caution) && /2026\. 10\. 2\. 이후/.test(gg.caution) && /3개월/.test(gg.caution), '피해자·시행일·기한');
assert.ok([].concat(gg.source).some(i => /형사소송법/.test(REGIONS.gyeonggi.sources[i].title)), '형사소송법 출처 연결');

// A-3: 공개 모욕 — 친고죄·고소기간·교권보호위원회와 별개, 배타적 단정 금지
const insult = SITUS.find(s => s.id === 'public-insult-body-shaming');
assert.ok(/친고죄/.test(insult.legalCaution) && /6개월/.test(insult.legalCaution) && /제230조/.test(insult.legalCaution) && /제312조/.test(insult.legalCaution));
assert.ok(/지역교권보호위원회 신고와 별도로/.test(insult.legalCaution));
assert.ok(!/본인이 직접|본인만/.test(insult.legalCaution), '고소권자를 본인으로만 한정하지 않아요');

// A-4: 경남 보호조치 비용 — 10일을 현행 규정으로 확정하지 않고 담당기관 확인 안내
const gn = REGIONS.gyeongnam.programs.find(p => /보호조치 비용 지원/.test(p.t));
assert.ok(/확정하지 못했어요/.test(gn.timing) && /현행 적용 여부가 확인되지 않았/.test(gn.timing) && /신청 기한을 확인하세요/.test(gn.timing));

// B-3: 충남 상담비 — 6개월·1년을 하나로 고르지 않고 함께 안내, 확인 경로 제시
const cn = REGIONS.chungnam.programs.find(p => p.t === '교육활동 침해 상담·회복 지원 연결');
assert.ok(/6개월/.test(cn.timing) && /1년/.test(cn.timing) && /1588-9331\(3번/.test(cn.timing));
assert.equal(cn.reviewStatus, 'review-needed', '충돌이 풀리기 전까지 다시 확인 필요 상태 유지');

// B-2: 근거 없이 남아 있던 담당 번호 제거·교체
const allOffices = JSON.stringify(REGION_ORDER.map(id => REGIONS[id].offices));
for (const n of ['02-3499-6899', '02-2286-3754', '055-379-3192']) assert.ok(!allOffices.includes(n), `${n}는 현행 업무분장에 없어요`);

console.log('PASS Phase A: 16 regions / 192 programs, {CARE} counseling routes without legal desks, crisis lines, 4 P1 fixes, unresolved deadlines kept as check-first, 3 office numbers corrected');
