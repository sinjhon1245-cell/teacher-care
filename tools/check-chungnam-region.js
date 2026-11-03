// 충남 1차 지역 확대 — 등록 데이터·대표번호·관할·과도한 지원금 표시 방지 회귀 검사.
// node tools/check-chungnam-region.js
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const read = p => fs.readFileSync(path.join(root, p), 'utf8');
const names = ['seoul','gyeonggi','incheon','busan','chungbuk','gangwon','ulsan','jeonbuk','gyeongnam','jeju','daegu','daejeon','gyeongbuk','sejong','chungnam','jeonnamgwangju'];
const ctx = vm.createContext({console});
vm.runInContext(read('data/common.js') + '\n' +
  names.map(x=>read('data/regions/'+x+'.js')).join('\n')+
  '\nvar CHECK_CHUNGNAM = {REGIONS, REGION_ORDER};',ctx,{timeout:2000});
const {REGIONS, REGION_ORDER} = ctx.CHECK_CHUNGNAM;
assert.equal(REGION_ORDER.length,16);
assert.equal(REGIONS.chungnam.id,'chungnam');
assert.equal(REGIONS.chungnam.hot,'1588-9331');
assert.equal(REGIONS.chungnam.hotContacts,undefined,'세부 대표번호는 공식 직통 확인 전 미등록');
assert.ok(REGIONS.chungnam.hotSummary.includes('연중 24시간') &&
  REGIONS.chungnam.hotSummary.includes('신고') &&
  REGIONS.chungnam.hotSummary.includes('다를 수 있'),'신고 접수와 상담·출동 시간을 구분');
assert.equal(REGIONS.chungnam.offices.length,14);
assert.equal(REGIONS.chungnam.expectedAreas,15);
const allAreas = REGIONS.chungnam.offices.flatMap(o=>o.areas);
assert.equal(new Set(allAreas).size,15);
const shared = REGIONS.chungnam.offices.find(x=>x.name==='논산계룡교육지원청');
assert.ok(shared && shared.areas.includes('논산시') && shared.areas.includes('계룡시'));
assert.equal(REGIONS.chungnam.programs.length,4);
assert.ok(REGIONS.chungnam.programs.every(p=>!p.amount),'미확인 지원금 표시 금지');
assert.ok(REGIONS.chungnam.programs.some(p=>p.t.includes('교원안심 온콜')));
assert.ok(REGIONS.chungnam.programs.some(p=>p.t.includes('학교민원대응팀')));
assert.ok(!REGIONS.chungnam.programs.some(p=>/공제|법률동행단|200만 원/.test(p.t)),'2026 지역 조건 미확인 프로그램은 미등록');
const prior = REGION_ORDER.filter(id=>!['chungnam','jeonnamgwangju'].includes(id));
assert.equal(prior.length,14);
assert.equal(prior.reduce((sum,id)=>sum+REGIONS[id].programs.length,0),180);
assert.equal(REGION_ORDER.filter(id=>id!=='jeonnamgwangju').reduce((sum,id)=>sum+REGIONS[id].programs.length,0),184);
const requiredSourceDomains = ['pf.kakao.com','law.go.kr'];
for(const d of requiredSourceDomains)
  assert.ok(REGIONS.chungnam.sources.some(s=>new URL(s.url).hostname.endsWith(d)),d+' official source missing');
console.log('PASS Chungnam preservation: original 15 regions / 184 programs, original 14/180, 14 offices / 15 areas, hotline intake distinct from field response, 4 sourced entries, no invented limits');
