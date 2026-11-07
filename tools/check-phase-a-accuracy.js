// 독립 사실검증 Phase A(2026-11-07) 회귀 검사 — P1 4건·심리상담 토큰(CARE)·고위험 연락처 정정이 다시 틀어지지 않게 지켜요.
// node tools/check-phase-a-accuracy.js
// 근거와 수정 전후 문구: docs/audit/phase-a-high-risk-fixes-20261107.md
//
// 검사 목적을 둘로 나눠요.
//  1) 재발 방지(실패 처리): 이미 바로잡은 오류가 어느 지역·사업·상황에든 다시 들어오면 실패해요.
//     특정 사업 순번·개수에 기대지 않고 전체 데이터를 훑어요. 지역·사업이 늘거나 줄어도 그대로 작동해요.
//  2) 대상 확인(경고만): 수정한 카드가 이름 변경·통합·삭제로 사라졌으면 실패 대신 ‘다시 확인’ 경고를 내요.
//     정상적인 정리 작업을 막지 않되, 재발 방지 문구가 함께 사라졌는지 사람이 확인하게 해요.
// 지역 수·사업 수 같은 규모 고정값은 이 파일에서 검사하지 않아요(규모 보존은 지역 확대 회귀 검사들의 몫이에요).
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { loadSiteData } = require('./lib/load-site-data');
const ROOT = path.join(__dirname, '..');
const D = loadSiteData(ROOT);
const { REGIONS, REGION_ORDER, BENEFITS, SITUS, SUPPORT_TYPES } = D;
const common = fs.readFileSync(path.join(ROOT, 'data/common.js'), 'utf8');
const warnings = [];
const warn = m => warnings.push(m);

// 구조 일관성(규모와 무관)
assert.ok(REGION_ORDER.length > 0, '등록된 지역이 있어야 해요');
assert.deepEqual([...REGION_ORDER].sort(), Object.keys(REGIONS).sort(), '지역 목록과 등록 지역이 같아야 해요');
const allPrograms = REGION_ORDER.flatMap(id => REGIONS[id].programs.map(p => ({ id, p })));
const allOffices = REGION_ORDER.flatMap(id => REGIONS[id].offices.map(o => ({ id, o })));

// ── 1) 재발 방지 ──────────────────────────────────────────────

// B-1: 심리상담 문장은 {CARE}로 치환하고, 모든 지역에서 법률 창구가 들어가지 않아요
const TOKEN = /\{(HOT1|HOT2|HOT|CARE|OFFICER|LEGAL|MUTUAL|SOS|MEDIATE)\}/g;
const fill = (text, terms) => String(text).replace(TOKEN, (_, k) => terms[k]);
const counselTexts = [
  ...SITUS.filter(s => (s.supports || []).includes('심리상담') && /심리상담·치료/.test(s.firstAction || '')).flatMap(s => [s.firstAction, s.orgs]),
  ...SUPPORT_TYPES.filter(t => t.id === 'counsel').map(t => t.guide.apply)
];
assert.ok(counselTexts.length > 0, '심리상담 안내 문장을 찾지 못했어요');
for (const t of counselTexts) assert.ok(!String(t).includes('{HOT1}'), `심리상담 문장에 {HOT1}이 다시 들어왔어요: ${t}`);
assert.ok(!/first: '\{HOT1\}로 심리상담/.test(common), '홈 빠른 입구(심리상담·치료)는 {CARE}를 써요');
for (const id of REGION_ORDER) {
  const terms = REGIONS[id].terms;
  assert.ok(terms.CARE && !/변호사|법률/.test(terms.CARE), `[${id}] CARE는 심리상담 창구여야 해요: ${terms.CARE}`);
  for (const t of counselTexts) assert.ok(!/변호사/.test(fill(t, terms)), `[${id}] 심리상담 문장에 변호사가 들어가요: ${fill(t, terms)}`);
}

// A-2: ‘고소인만 이의신청 가능’은 현행 형사소송법과 달라요(피해자도 고소인등). 어디에도 다시 쓰지 않아요
const everything = JSON.stringify([allPrograms, SITUS, BENEFITS, SUPPORT_TYPES]);
assert.ok(!/고소인만 가능|고소인만 이의신청/.test(everything), '‘고소인만 (이의신청) 가능’ 표현이 다시 들어왔어요');

// A-1: 공무상 요양 심리상담비 사전승인은 그 제도에만 적어요(다른 제도·상담 지원에 일반화 금지)
for (const b of BENEFITS) if (b.id !== 'official-medical-care') assert.ok(!/사전승인|공단의 승인/.test(JSON.stringify(b)), `[${b.id}] 공단 사전승인을 다른 제도에 일반화했어요`);
assert.ok(!/사전승인|공단의 승인/.test(JSON.stringify(SUPPORT_TYPES)), '지원 유형에 공단 사전승인을 일반화했어요');

// A-3: 모욕죄 고소권자를 ‘본인만’으로 단정하지 않아요
for (const s of SITUS) if (/모욕죄/.test(s.legalCaution || '')) assert.ok(!/본인이 직접|본인만/.test(s.legalCaution), `[${s.id}] 고소권자를 본인으로만 한정했어요`);

// A-4·B-3: 공식 자료끼리 다르거나 현행 효력이 미확정인 기한을 확정 문구로 바꾸지 않아요
for (const { id, p } of allPrograms) {
  if (id === 'gyeongnam' && /보호조치 비용/.test(p.t) && /10일/.test(p.timing || '')) assert.ok(/현행 적용 여부/.test(p.timing), '[gyeongnam] 10일 기한은 현행 효력 미확정으로 안내해요');
}

// B-2: 현행 업무분장에서 다른 업무로 확인된 번호를 교육활동 보호 담당으로 되살리지 않아요
// (다시 쓰려면 공식 업무분장을 새로 확인하고 이 목록과 근거 문서를 함께 고쳐요)
const RETIRED_OFFICE_NUMBERS = { '02-3499-6899': '서울 북부 학교폭력제로센터 콜센터', '02-2286-3754': '서울 성동광진 직원 목록에 없음', '055-379-3192': '경남 양산 조직도에 없음' };
for (const { id, o } of allOffices) for (const [n, why] of Object.entries(RETIRED_OFFICE_NUMBERS)) assert.ok(!String(o.contact || '').includes(n), `[${id}] ${o.name}: ${n}(${why})이 다시 들어왔어요`);

// B-4: 심리적 위기 안내는 조건부로 두고, 일반 상담 카드를 긴급 위기로 일괄 분류하지 않아요
const crisis = SITUS.filter(s => /109/.test(s.firstAction || ''));
for (const s of crisis) assert.ok(/죽고 싶은 생각이 들거나/.test(s.firstAction), `[${s.id}] 109 안내는 위기 조건과 함께 적어요`);

// ── 2) 대상 확인(경고) ────────────────────────────────────────
const expectSitu = (sid, test, what) => { const s = SITUS.find(x => x.id === sid); if (!s) warn(`${sid} 상황이 없어요(통합·삭제?) — ${what}가 다른 곳에 남았는지 확인하세요`); else assert.ok(test(s), `[${sid}] ${what}`); };
const expectProgram = (rid, re, test, what) => { const p = (REGIONS[rid] ? REGIONS[rid].programs : []).find(x => re.test(x.t)); if (!p) warn(`[${rid}] ${re} 사업이 없어요(이름 변경·삭제?) — ${what} 확인 필요`); else assert.ok(test(p), `[${rid}] ${p.t}: ${what}`); };
const ben = BENEFITS.find(b => b.id === 'official-medical-care');
if (!ben) warn('official-medical-care 제도가 없어요 — 심리상담비 사전승인 안내 위치 확인 필요');
else assert.ok(/상담을 시작하기 전에 공무원연금공단의 승인/.test(ben.limit) && /별개 제도/.test(ben.limit) && /제39조/.test(ben.basis), '[BEN-06] 사전승인·교육청 상담과 구분·시행령 제39조');
expectProgram('gyeonggi', /경기교육법률지원단/, p => /피해 교원은 피해자로서 이의신청/.test(p.caution) && /2026\. 10\. 2\. 이후/.test(p.caution) && /3개월/.test(p.caution), '피해자 이의신청·시행일·3개월');
expectSitu('public-insult-body-shaming', s => /친고죄/.test(s.legalCaution) && /6개월/.test(s.legalCaution) && /제230조/.test(s.legalCaution) && /지역교권보호위원회 신고와 별도로/.test(s.legalCaution), '친고죄·6개월·교권보호위원회와 별개');
expectProgram('gyeongnam', /보호조치 비용/, p => /확정하지 못했어요/.test(p.timing) && /신청 기한을 확인하세요/.test(p.timing), '기한 미확정·담당관 확인 안내');
expectProgram('chungnam', /상담·회복 지원/, p => /6개월/.test(p.timing) && /1년/.test(p.timing) && /확인/.test(p.timing), '6개월·1년 병기와 확인 안내');
expectSitu('post-incident-burnout', s => /109/.test(s.firstAction) && /112·119/.test(s.firstAction) && /1577-0199/.test(s.orgs) && s.urgency === '일반 상담 가능', '위기 조건부 109·112·119, 1577-0199, 일반 상담 등급 유지');
if (REGIONS.jeonnamgwangju) assert.ok(/교육활동보호센터/.test(REGIONS.jeonnamgwangju.terms.CARE), '[jeonnamgwangju] CARE는 권역별 교육활동보호센터');
if (REGIONS.gangwon) assert.ok(/033-258-5344/.test(REGIONS.gangwon.terms.CARE), '[gangwon] CARE는 교권전담 상담사(심리상담 접수)');

for (const w of warnings) console.log('주의: ' + w);
console.log(`PASS Phase A: ${REGION_ORDER.length} regions / ${allPrograms.length} programs scanned · CARE counseling routes without legal desks · retired numbers ${Object.keys(RETIRED_OFFICE_NUMBERS).length} · targeted cards ${warnings.length ? warnings.length + ' to re-check' : 'all present'}`);
