// 지역 데이터 점검 도구 — 배포 전에 실행하세요:  node tools/check-data.js
// index.html에 적힌 순서대로 데이터 파일을 읽어 다음을 확인해요.
//  1) 필수 항목·출처(sources) 번호·확인일(verifiedAt) 형식
//  2) 교육지원청 관할(areas) 중복·누락: 한 시·군·구가 두 교육지원청에 들어가면 오류
//  3) 지역 간 전화번호 혼입: 한 지역 파일에 다른 지역의 대표번호가 있으면 오류
//  4) 공통 데이터(common.js)에 112 외의 전화번호가 직접 들어가 있으면 오류
// 문제가 있으면 종료 코드 1로 끝나요.

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const scripts = [...html.matchAll(/<script src="(data\/[^"]+)"><\/script>/g)].map(m => m[1]);

const errors = [];
const warnings = [];
const ctx = { console: { error: (...a) => errors.push(a.join(' ')), warn: console.warn, log: console.log } };
vm.createContext(ctx);
for (const f of scripts) vm.runInContext(fs.readFileSync(path.join(root, f), 'utf8'), ctx, { filename: f });
const { REGIONS, REGION_ORDER } = vm.runInContext('({ REGIONS, REGION_ORDER })', ctx);

const PHONE = /\b(?:0\d{1,2}|1\d{3})-\d{3,4}(?:-\d{4})?\b/g;
const ISO = /^\d{4}-\d{2}-\d{2}$/;

// 공통 데이터: 전국 공통 긴급번호(112) 외의 번호 금지
const common = fs.readFileSync(path.join(root, 'data/common.js'), 'utf8');
for (const n of common.match(PHONE) || []) errors.push(`common.js에 지역 번호 직접 기재: ${n}`);

const numbersOf = id => new Set(JSON.stringify(REGIONS[id]).match(PHONE) || []);
let total = 0;

for (const id of REGION_ORDER) {
  const r = REGIONS[id];
  const tag = `[${id}]`;
  if (!ISO.test(r.verifiedAt)) errors.push(`${tag} verifiedAt 형식 오류: ${r.verifiedAt}`);
  r.sources.forEach((s, i) => {
    if (!s.title) errors.push(`${tag} sources[${i}] 제목 없음`);
    if (s.verifiedAt && !ISO.test(s.verifiedAt)) errors.push(`${tag} sources[${i}] verifiedAt 형식 오류`);
    if (!s.url) warnings.push(`${tag} sources[${i}] URL 없음: ${s.title}`);
    else if (s.url.replace(/\/$/, '') === (r.officeUrl || '').replace(/\/$/, '')) warnings.push(`${tag} sources[${i}]가 교육청 메인 홈페이지예요: ${s.title}`);
  });
  r.programs.forEach((p, i) => {
    if (p.source !== undefined && !r.sources[p.source]) errors.push(`${tag} programs[${i}] source 번호가 없어요: ${p.source}`);
  });

  // 관할 중복·누락
  const seen = new Map();
  r.offices.forEach(o => {
    if (!o.areas || !o.areas.length) errors.push(`${tag} ${o.name}: areas가 비어 있어요`);
    (o.areas || []).forEach(a => {
      if (seen.has(a)) errors.push(`${tag} 관할 중복: ${a} → ${seen.get(a)}, ${o.name}`);
      seen.set(a, o.name);
    });
  });
  if (r.expectedAreas !== undefined && r.expectedAreas !== seen.size) {
    errors.push(`${tag} 시·군·구 수가 달라요: 데이터 ${seen.size}곳, 기대 ${r.expectedAreas}곳`);
  }
  total += seen.size;

  // 다른 지역 번호 혼입
  const mine = numbersOf(id);
  for (const other of REGION_ORDER.filter(x => x !== id)) {
    const theirs = new Set([REGIONS[other].hot, ...Object.values(REGIONS[other].terms).map(t => (t.match(PHONE) || [])[0]).filter(Boolean)]);
    for (const n of theirs) if (mine.has(n)) errors.push(`${tag} 다른 지역(${other}) 번호 포함: ${n}`);
  }

  console.log(`${tag} 교육지원청 ${r.offices.length}곳 · 시·군·구 ${seen.size}곳 · 지원제도 ${r.programs.length} · 기관 ${r.orgs.length} · 최종 확인 ${r.verifiedAt}`);
}

console.log(`합계 시·군·구 ${total}곳`);
warnings.forEach(w => console.log('주의: ' + w));
if (errors.length) {
  errors.forEach(e => console.log('오류: ' + e));
  process.exit(1);
}
console.log('데이터 점검 통과');
