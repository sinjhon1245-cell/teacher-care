// PR #10: enacted-law and data preservation regression (Node built-ins only).
'use strict';
const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const read = f => fs.readFileSync(path.join(root, f), 'utf8');
const names = ['seoul','gyeonggi','incheon','busan','chungbuk','gangwon','ulsan','jeonbuk','gyeongnam','jeju','daegu','daejeon'];
const code = read('data/common.js') + '\n' + names.map(n => read('data/regions/' + n + '.js')).join('\n') +
  '\nvar LEGAL_QA = { SITUS, REGIONS, REGION_ORDER, COMMON_PUBLIC_SOURCES };';
const ctx = vm.createContext({console});
vm.runInContext(code, ctx, {timeout:2000});
const {SITUS, REGIONS, REGION_ORDER, COMMON_PUBLIC_SOURCES} = ctx.LEGAL_QA;
assert.equal(REGION_ORDER.length, 12);
assert.equal(Object.values(REGIONS).reduce((n,r) => n + r.programs.length, 0), 161);
assert.equal(SITUS.length, 38);
const unauthorized = SITUS.find(s => s.id === 'unauthorized-entry');
const refused = SITUS.find(s => s.id === 'refusal-to-leave-occupation');
for (const s of [unauthorized, refused]) {
  assert.ok(s, 'Relevant situation must exist');
  assert.ok(s.legalCaution.includes('초·중등교육법'), s.id + ' missing enacted law');
  assert.ok(s.legalCaution.includes('2026. 10. 29.'), s.id + ' missing enactment date');
}
for (const phrase of ['중지', '면담 종료', '퇴거', '출입 제한', '수사기관 신고', '긴급']) {
  assert.ok(refused.legalCaution.includes(phrase), 'Missing legal process detail: ' + phrase);
}
for (const id of ['school-complaint-law','school-complaint-decree']) {
  const source = COMMON_PUBLIC_SOURCES.find(s => s.id === id);
  assert.ok(source && source.url.startsWith('https://www.law.go.kr/'), 'Missing official source ' + id);
}
const daejeon = REGIONS.daejeon;
const minwon = daejeon.programs.find(p => p.area === '학교민원·특이민원 지원');
assert.ok(minwon, 'Daejeon school complaint program missing');
assert.ok(minwon.caution.includes('시행령') && minwon.caution.includes('중지 요청'), 'Daejeon enactment wording missing');
assert.ok(!/미공포|시행령으로 정하니/.test(minwon.caution), 'Old not-yet-enacted warning remains');
assert.ok(daejeon.sources.some(s => s.title.includes('대통령령 제36785호')));
for (const phrase of ['제37조제3항', '제4항', '직접 처리를 요청', '전용 연락처', '이첩 서식']) {
  assert.ok(minwon.caution.includes(phrase), 'Daejeon verification/caveat missing: ' + phrase);
}
assert.ok(minwon.apply.includes('학교장이 관할 교육지원청에'), 'Daejeon escalation must be school-head led');
assert.ok(minwon.apply.includes('먼저 확인'), 'Unverified local contact and form must be checked');
assert.ok(!minwon.contact, 'Do not invent a direct school-minwon team number');
const gwTreatment = REGIONS.gangwon.programs.find(p => p.t === '마음 건강 치료비(정신건강의학과)');
assert.ok(gwTreatment, 'Gangwon treatment program missing');
assert.equal(gwTreatment.validUntil, '2026-11-30');
assert.equal(gwTreatment.reviewBy, '2026-11-02');
assert.equal(gwTreatment.verifiedAt, '2026-10-26', 'Cannot advance verifiedAt without rereading the official attachment');
assert.ok(gwTreatment.sum.includes('11월 30일까지') && gwTreatment.sum.includes('접수할 수 없어요'), 'Gangwon deadline must be visible in summary');
const updates = read('data/updates.js');
assert.ok(updates.includes('2026-10-29-school-complaint-procedure'), 'Content-only change not announced');
assert.ok(!updates.includes('visibility: \'internal\',\n    date: \'2026-10-29\''), 'Legal update accidentally hidden');
console.log('PASS legal/data: 12 regions, 161 programs, 38 situations, 2 common official sources, Daejeon correction, public update');