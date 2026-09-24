// 지역 데이터 점검 도구 — 배포 전에 실행하세요:  node tools/check-data.js
// index.html에 적힌 순서대로 데이터 파일을 읽어 다음을 확인해요.
//  1) 필수 항목·출처(sources) 번호·확인일(verifiedAt) 형식
//  2) 교육지원청 관할(areas) 중복·누락: 한 시·군·구가 두 교육지원청에 들어가면 오류
//  3) 전화번호 형식: 대표번호·연락처·신청 방법에 든 번호가 올바른 국내 형식인지(032-5606-600 같은 오기 방지)
//  4) 지역 간 전화번호 혼입: 한 지역 파일에 다른 지역의 대표번호가 있으면 오류
//  5) 공통 데이터(common.js)에 112 외의 전화번호가 직접 들어가 있으면 오류
//  6) 지원제도(programs)의 area가 지원 찾기 유형(SUPPORT_TYPES)에 연결돼 있는지
//  7) 상황별 도움의 세부 상황(SITUS)이 모두 큰 상황(SITU_GROUPS)에 속하는지
//  8) 신청·상담·안내 링크(channels)와 교육지원청 링크가 https + 공식 도메인인지(접속 확인은 별도로 해요)
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
const { REGIONS, REGION_ORDER, SUPPORT_TYPES, SITUS, SITU_GROUPS } = vm.runInContext('({ REGIONS, REGION_ORDER, SUPPORT_TYPES, SITUS, SITU_GROUPS })', ctx);

const ISO = /^\d{4}-\d{2}-\d{2}$/;

// 전화번호 후보: 두 자리 이상 숫자로 시작해 하이픈으로 이어진 숫자 묶음 전체(예: 032-5606-600, 02-12345-678도 통째로 잡혀요).
// 한 자리로 시작하는 ARS 표기(2-4번)와 점으로 쓴 날짜(2026. 3. 1.)는 후보가 되지 않아요. 112처럼 하이픈 없는 번호도 대상이 아니에요.
const PHONE_CANDIDATE = /(?<![\d-])\d{2,}(?:-\d+)+(?![\d-])/g;
const AREA = '(?:02|0(?:3[1-3]|4[1-4]|5[1-5]|6[1-4]|70))'; // 서울 02, 지역번호 031~064, 인터넷전화 070
const VALID_PHONE = [
  new RegExp(`^${AREA}-\\d{3,4}-\\d{4}$`), // 일반 번호: 02-1234-5678, 032-123-4567, 070-7848-0794
  new RegExp(`^${AREA}-1395$`),             // 교원 보호 대표번호(지역번호+1395): 02-1395, 032-1395
  /^1[5-9]\d{2}-\d{4}$/                     // 전국 대표번호: 1600-8787, 1588-5255
];
const isValidPhone = n => VALID_PHONE.some(re => re.test(n));
const phonesIn = text => String(text).match(PHONE_CANDIDATE) || [];

// 지역 데이터에서 번호가 들어가는 필드(대표번호, 토큰 값, 연락처, 신청 방법)만 모아요
function contactTexts(r) {
  const out = [['hot', r.hot], ...Object.entries(r.terms).map(([k, v]) => ['terms.' + k, v])];
  for (const key of ['offices', 'programs', 'orgs']) {
    (r[key] || []).forEach((item, i) => {
      for (const f of ['contact', 'apply']) if (item[f]) out.push([`${key}[${i}].${f} (${item.name || item.t})`, item[f]]);
    });
  }
  return out;
}

// 신청·상담·안내 링크: 공식 기관 도메인만 허용(새 기관을 넣을 땐 공식 출처를 확인한 뒤 여기에 추가)
const CHANNEL_TYPES = ['apply', 'kakao', 'guide'];
const OFFICIAL_HOSTS = [
  /(^|\.)go\.kr$/,                     // 교육부·시도교육청·교육지원청(sen.go.kr, ice.go.kr, goe.go.kr 등)
  /^www\.(goe[a-z]+|gpoe)\.kr$/,       // 경기 교육지원청 홈페이지(경기도교육청 공식 목록)
  /^incheon\.ssif\.or\.kr$/,           // 인천광역시학교안전공제회
  /^www\.gessia\.or\.kr$/,             // 경기도학교안전공제회
  /^www\.ssia\.or\.kr$/,               // 서울특별시학교안전공제회
  /^forteacher\.kedi\.re\.kr$/,        // 한국교육개발원 교원 지원 포털
  /^pf\.kakao\.com$/                   // 공식 자료가 안내한 카카오톡 채널
];
function checkUrl(tag, where, url) {
  let u;
  try { u = new URL(url); } catch (e) { errors.push(`${tag} ${where} URL 형식 오류: ${url}`); return; }
  if (u.protocol !== 'https:') errors.push(`${tag} ${where} https가 아니에요: ${url}`);
  if (!OFFICIAL_HOSTS.some(re => re.test(u.hostname))) errors.push(`${tag} ${where} 공식 도메인 목록에 없어요: ${u.hostname}`);
}

// 공통 데이터: 전국 공통 긴급번호(112) 외의 번호 금지
const common = fs.readFileSync(path.join(root, 'data/common.js'), 'utf8');
for (const n of phonesIn(common)) if (isValidPhone(n) || /^0\d/.test(n)) errors.push(`common.js에 지역 번호 직접 기재: ${n}`);

// 상황별 도움: 그룹이 없는 세부 상황은 화면에서 사라지므로 오류, 빈 그룹도 오류
SITUS.forEach((st, i) => { if (!SITU_GROUPS.some(g => g.id === st.g)) errors.push(`SITUS[${i}] 큰 상황(g) 없음: ${st.t}`); });
SITU_GROUPS.forEach(g => { if (!SITUS.some(st => st.g === g.id)) errors.push(`SITU_GROUPS ${g.id}: 세부 상황이 없어요`); });

// 지역 데이터 전체(설명 문구 포함)에서 올바른 형식의 번호만 모아요(날짜 등은 형식이 달라 제외돼요)
const numbersOf = id => new Set(phonesIn(JSON.stringify(REGIONS[id])).filter(isValidPhone));
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
    // 지원 찾기에 보이려면 area가 SUPPORT_TYPES 중 하나에 속해야 해요
    if (!SUPPORT_TYPES.some(t => t.areas.includes(p.area))) errors.push(`${tag} programs[${i}] area가 SUPPORT_TYPES에 없어요: ${p.area}`);
  });

  // 신청·상담·안내 링크(channels)와 교육지원청 링크: https + 공식 도메인만
  r.programs.forEach((p, i) => (p.channels || []).forEach((c, j) => {
    const where = `programs[${i}].channels[${j}] (${p.t})`;
    if (!CHANNEL_TYPES.includes(c.type)) errors.push(`${tag} ${where} 알 수 없는 type: ${c.type}`);
    checkUrl(tag, where, c.url);
  }));
  r.offices.forEach((o, i) => {
    if (o.url) checkUrl(tag, `offices[${i}].url (${o.name})`, o.url);
    if (o.guideUrl) checkUrl(tag, `offices[${i}].guideUrl (${o.name})`, o.guideUrl);
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

  // 전화번호 형식
  for (const [field, value] of contactTexts(r)) {
    for (const n of phonesIn(value)) if (!isValidPhone(n)) errors.push(`${tag} 전화번호 형식 오류: ${n} — ${field}`);
  }

  // 다른 지역 번호 혼입
  const mine = numbersOf(id);
  for (const other of REGION_ORDER.filter(x => x !== id)) {
    const theirs = new Set([REGIONS[other].hot, ...Object.values(REGIONS[other].terms).flatMap(phonesIn)]);
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
