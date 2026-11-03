// 2026 전남광주통합특별시 지역 확대: 기존 데이터 보존·관할·공식 신청 안내·과장 금지 확인.
'use strict';
const assert = require('node:assert/strict');
const { loadSiteData } = require('./lib/load-site-data');
const D=loadSiteData();
const R=D.REGIONS.jeonnamgwangju;
assert.ok(R,'integrated region must be registered');
assert.equal(R.name,'전남광주통합특별시');
assert.equal(R.office,'전남광주통합특별시교육청');
assert.equal(D.REGION_ORDER.length,16,'15 old regions plus one integrated region');
assert.equal(D.REGION_ORDER.filter(id=>id!=='jeonnamgwangju').reduce((n,id)=>n+D.REGIONS[id].programs.length,0),184,'existing 184 entries unchanged');
assert.equal(D.REGION_ORDER.reduce((n,id)=>n+D.REGIONS[id].programs.length,0),191);
assert.equal(R.programs.length,7);
assert.equal(R.offices.length,24,'22 Jeonnam and 2 Gwangju educational offices');
const areas=R.offices.flatMap(o=>o.areas);
assert.equal(areas.length,27);
assert.equal(new Set(areas).size,27,'every jurisdiction assigned once');
assert.equal(R.expectedAreas,27);
assert.equal(R.offices.filter(o=>o.name.startsWith('광주')).length,2);
assert.ok(R.offices.some(o=>o.name==='광주동부교육지원청'&&o.areas.join(',')==='동구,북구'));
assert.ok(R.offices.some(o=>o.name==='광주서부교육지원청'&&o.areas.join(',')==='서구,남구,광산구'));
assert.ok(R.offices.every(o=>o.url==='https://gen.go.kr/sub/page.php?page_code=introduce_06_02'),
  'unverified individual office domains must not be published');
assert.ok(R.programs.some(p=>p.t.startsWith('광주권'))&&R.programs.some(p=>p.t.startsWith('전남권')),'distinct service paths');
assert.ok(R.programs.every(p=>!p.amount),'no unverified grant or insurance limits');
assert.ok(!R.programs.some(p=>/1시간 이내 출동|2027.*시행 중|24시간.*상담/.test(p.sum||'')),'future response plans not present services');
assert.ok(R.sources.every(s=>s.region==='jeonnamgwangju'&&/^https:\/\//.test(s.url)));
assert.ok(D.REGION_ORDER.includes('chungnam')&&D.REGIONS.chungnam.programs.length===4);
console.log('PASS integrated region: 16 regions / 191 entries; 24 educational offices / 27 jurisdictions; 7 source-linked entries, original 15 regions / 184 preserved');
