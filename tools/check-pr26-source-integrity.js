// PR #26 — Verified application paths and unresolved annual policy checks.
// Do not convert pending support conditions to 'verified' based on a reachable index page.
'use strict';
const assert = require('node:assert/strict');
const { loadSiteData } = require('./lib/load-site-data');
const D = loadSiteData();
const j = D.REGIONS.jeonnamgwangju;
const g = D.REGIONS.gangwon;
const d = D.REGIONS.daejeon;

assert.equal(D.REGION_ORDER.length, 16);
assert.equal(D.REGION_ORDER.reduce((n,id)=>n+D.REGIONS[id].programs.length,0),192);
assert.equal(D.REGION_ORDER.filter(id=>id!=='jeonnamgwangju').reduce((n,id)=>n+D.REGIONS[id].programs.length,0),184);
assert.equal(j.programs.length,8);
const counseling=j.programs.find(x=>x.t==='광주권 교육활동보호센터 심리상담');
const legal=j.programs.find(x=>x.t==='광주권 교권전담변호사 법률상담');
assert.ok(counseling && legal);
const direct='https://forteacher.jge.go.kr/sub/page.php?mode=board&page_code=counsel_01_02&tbnum=2';
const legalGuide='https://forteacher.jge.go.kr/sub/page.php?page_code=support_06';
assert.ok(counseling.channels.some(x=>x.type==='apply' && x.url===direct),'official Gwangju counseling application');
assert.ok(legal.channels.some(x=>x.url===legalGuide),'distinct legal-support application guide');
assert.ok(legal.apply.includes('학교 내부결재') && legal.apply.includes('공문') && legal.apply.includes('팩스'));
assert.ok(legal.caution.includes('서로 달라요'),'different counsel/legal team channels must be identified');
assert.ok(legal.caution.includes('초·중·고·특수학교'),'official eligibility must not expand to unverified school types');
assert.equal(legal.verifiedAt,'2026-11-04');
assert.equal(counseling.verifiedAt,'2026-11-04');
assert.ok([11,12].every(i=>j.sources[i].verifiedAt==='2026-11-04'));
assert.ok(j.sources[11].url===legalGuide && j.sources[12].url===direct);
assert.ok(!j.sources.some(x=>/nttSn=5172350/.test(x.url)),'removed Jeonnam notice must not return');
const gw=g.programs.find(x=>x.t==='마음 건강 치료비(정신건강의학과)');
const dj=d.programs.find(x=>x.t==='학교 민원대응팀·교육지원청 학교민원대응지원팀');
assert.ok(gw && dj);
assert.equal(gw.reviewBy,'2026-11-02','Gangwon review due date cannot be extended without policy evidence');
assert.equal(dj.reviewBy,'2026-11-02','Daejeon implementation review due date cannot be extended without local contact evidence');
assert.ok(/교육지원청|공문/.test(dj.apply),'request must remain routed through school and authority');
const mutual=j.programs.filter(x=>String(x.area).includes('교원보호공제'));
assert.equal(mutual.length,2);
assert.ok(mutual.every(x=>x.reviewStatus==='review-needed' && !x.amount),'integration terms must remain unverified');
console.log('PASS PR26: 16/192 unchanged, 2 official Gwangju application routes, 2 unresolved due dates retained, merged mutual-aid terms still unverified');
