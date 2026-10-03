// 지역 데이터 점검 도구 — 배포 전에 실행하세요:  node tools/check-data.js
// index.html에 적힌 순서대로 데이터 파일을 읽어 다음을 확인해요.
//  1) 필수 항목·출처(sources) 번호·확인일(verifiedAt) 형식
//  2) 교육지원청 관할(areas) 중복·누락: 한 시·군·구가 두 교육지원청에 들어가면 오류
//  3) 전화번호 형식: 대표번호·연락처·신청 방법에 든 번호가 올바른 국내 형식인지(032-5606-600 같은 오기 방지)
//  4) 지역 간 전화번호 혼입: 한 지역 파일에 다른 지역의 대표번호가 있으면 오류
//  5) 공통 데이터(common.js)에 112 외의 전화번호가 직접 들어가 있으면 오류
//  6) 지원제도(programs)의 area가 지원 찾기 유형(SUPPORT_TYPES)에 연결돼 있는지
//  7) 상황별 도움 V2의 stable id·필수 배열·그룹 연결이 올바른지
//  8) 신청·상담·안내 링크(channels·links)와 교육청·교육지원청 링크가 https + 공식 도메인인지(접속 확인은 별도로 해요)
//  9) 지역 출처(sources)마다 쓰이는 화면(uses)이 적혀 있는지, 공통 화면 근거에 특정 시·도 자료가 섞이지 않았는지
// 10) 5메뉴(PAGES)와 회복·보호 제도(BENEFITS): id 중복·형식, category·employment 값, 공식 근거(refs) id,
//     ‘놓치기 쉬워요’ 2개 이하, 공통 문장에 금액·지역 사업명·시·도 이름이 없는지, 특별휴가 ‘범위에서 부여’·휴직 ‘검토’ 표현,
//     ‘자동 승인·지급’ 같은 오해 표현 금지, 회복 흐름·홈 입구·놓치기 쉬운 제도·단계별 바로가기·상황 연결의 id,
//     회복·보호에 외부 지원(상담·치료비·법률·공제·경호)이 섞이지 않았는지, 지원 유형의 공통 기준(guide)·연결(care)
// 11) 지역 회복·보호 상세(benefits)·홈 한 줄(highlights)의 id·출처, 숫자 정보의 출처, 다른 지역 사업명 혼입,
//     출처의 region 표시, 지원 항목 area(문자열·배열)의 유형 연결
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
const { PAGES, REGIONS, REGION_ORDER, SUPPORT_TYPES, SITUS, SITU_GROUPS, FILTER_DEFS, STAGE_TO_STEP, STEPS, COMMON_PUBLIC_SOURCES, SOURCE_USES, BENEFITS, BENEFIT_FIELDS, BENEFIT_CATEGORIES, EMPLOYMENT_SCOPES, HOME_ENTRIES, HOME_HIGHLIGHTS, RECOVERY_PATH, RECOVERY_NOTE, STEP_LINKS, SITU_BENEFITS } = vm.runInContext('({ PAGES, REGIONS, REGION_ORDER, SUPPORT_TYPES, SITUS, SITU_GROUPS, FILTER_DEFS, STAGE_TO_STEP, STEPS, COMMON_PUBLIC_SOURCES, SOURCE_USES, BENEFITS, BENEFIT_FIELDS, BENEFIT_CATEGORIES, EMPLOYMENT_SCOPES, HOME_ENTRIES, HOME_HIGHLIGHTS, RECOVERY_PATH, RECOVERY_NOTE, STEP_LINKS, SITU_BENEFITS })', ctx);

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
      for (const f of ['contact', 'apply', 'amount', 'timing', 'documents', 'caution', 'eligibility']) if (item[f]) out.push([`${key}[${i}].${f} (${item.name || item.t})`, item[f]]);
      (item.contacts || []).forEach((c, j) => out.push([`${key}[${i}].contacts[${j}] (${item.name || item.t})`, c.value]));
    });
  }
  Object.entries(r.benefits || {}).forEach(([pid, d]) => {
    for (const [k, v] of Object.entries(d)) if (typeof v === 'string') out.push([`benefits.${pid}.${k}`, v]);
  });
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

// 공통 화면 근거: 특정 시·도교육청 도메인 자료는 넣지 않아요(교차검증 자료는 VALIDATION_SOURCES에)
COMMON_PUBLIC_SOURCES.forEach((s, i) => {
  const host = new URL(s.url).hostname;
  for (const id of REGION_ORDER) {
    const own = new URL(REGIONS[id].officeUrl).hostname.replace(/^www\./, '');
    if (host === own || host.endsWith('.' + own)) errors.push(`COMMON_PUBLIC_SOURCES[${i}]에 ${id} 교육청 자료가 있어요: ${s.title}`);
  }
});

// 상황별 도움 V2 Phase 4: 38개 상황·faceted filter·교사 언어 검색 연결을 확인
const EXPECTED_SITU_COUNT = 38;
const EXPECTED_GROUP_COUNT = 11;
if (SITUS.length !== EXPECTED_SITU_COUNT) errors.push(`SITUS 개수 오류(Phase 2): ${SITUS.length}개, 기대 ${EXPECTED_SITU_COUNT}개`);
if (SITU_GROUPS.length !== EXPECTED_GROUP_COUNT) errors.push(`SITU_GROUPS 개수 오류(Phase 2): ${SITU_GROUPS.length}개, 기대 ${EXPECTED_GROUP_COUNT}개`);

const situIds = new Set();
const subjectOpts = new Set(FILTER_DEFS.find(d => d.g === '침해 주체').opts);
const typeOpts = new Set(FILTER_DEFS.find(d => d.g === '상황 유형').opts);
const urgencyOpts = new Set(FILTER_DEFS.find(d => d.g === '긴급성').opts);
const stageOpts = new Set(Object.keys(STAGE_TO_STEP));
const supportOpts = new Set(SUPPORT_TYPES.flatMap(t => t.situ));

SITUS.forEach((st, i) => {
  const label = st.title || `SITUS[${i}]`;
  if (!st.id || !/^[a-z0-9-]+$/.test(st.id)) errors.push(`SITUS[${i}] stable id 형식 오류: ${st.id}`);
  else if (situIds.has(st.id)) errors.push(`SITUS stable id 중복: ${st.id}`);
  else situIds.add(st.id);

  if (!st.group || !SITU_GROUPS.some(g => g.id === st.group)) errors.push(`SITUS[${i}] 큰 상황(group) 없음: ${label}`);
  if (!st.title) errors.push(`SITUS[${i}] title 없음`);

  for (const [field, arr] of [
    ['subjects', st.subjects],
    ['officialTypes', st.officialTypes],
    ['typeTags', st.typeTags],
    ['contexts', st.contexts],
    ['keywords', st.keywords],
    ['stages', st.stages],
    ['supports', st.supports]
  ]) {
    if (!Array.isArray(arr) || !arr.length) errors.push(`SITUS[${i}] ${field}가 비어 있어요: ${label}`);
  }

  (st.subjects || []).filter(v => !subjectOpts.has(v)).forEach(v => errors.push(`SITUS[${i}] 알 수 없는 subject: ${v} — ${label}`));
  (st.typeTags || []).filter(v => !typeOpts.has(v)).forEach(v => errors.push(`SITUS[${i}] 알 수 없는 typeTag: ${v} — ${label}`));
  if (!urgencyOpts.has(st.urgency)) errors.push(`SITUS[${i}] 알 수 없는 urgency: ${st.urgency} — ${label}`);
  (st.stages || []).filter(v => !stageOpts.has(v)).forEach(v => errors.push(`SITUS[${i}] 알 수 없는 stage: ${v} — ${label}`));
  (st.supports || []).filter(v => !supportOpts.has(v)).forEach(v => errors.push(`SITUS[${i}] 알 수 없는 support: ${v} — ${label}`));

  for (const field of ['example', 'firstAction', 'report', 'evidence', 'dont']) {
    if (!st[field]) errors.push(`SITUS[${i}] ${field} 없음: ${label}`);
  }

  if (st.regionVariants !== undefined) {
    if (!st.regionVariants || typeof st.regionVariants !== 'object' || Array.isArray(st.regionVariants)) {
      errors.push(`SITUS[${i}] regionVariants 형식 오류: ${label}`);
    } else {
      Object.keys(st.regionVariants).filter(id => !REGION_ORDER.includes(id)).forEach(id => errors.push(`SITUS[${i}] 알 수 없는 regionVariant: ${id} — ${label}`));
    }
  }
});
SITU_GROUPS.forEach(g => { if (!SITUS.some(st => st.group === g.id)) errors.push(`SITU_GROUPS ${g.id}: 세부 상황이 없어요`); });

// V2 필터는 모든 선택지가 실제 상황에 연결되어야 하고, 같은 그룹 OR / 그룹 간 AND로 동작해야 해요.
FILTER_DEFS.forEach(d => {
  d.opts.forEach(o => {
    if (!SITUS.some(st => d.test(st, o))) errors.push(`FILTER_DEFS ${d.g} 선택지가 어떤 상황에도 연결되지 않아요: ${o}`);
  });
});

function filterSituations(selected) {
  return SITUS.filter(st => FILTER_DEFS.every(d => {
    const values = selected[d.g] || [];
    return values.length === 0 || values.some(o => d.test(st, o));
  }));
}
function expectSituIds(label, selected, ids) {
  const got = new Set(filterSituations(selected).map(st => st.id));
  ids.filter(id => !got.has(id)).forEach(id => errors.push(`필터 조합 오류(${label}): ${id}가 결과에 없어요`));
}

expectSituIds('보호자 + 부당한 요구·간섭',
  { '침해 주체': ['보호자'], '상황 유형': ['부당한 요구·간섭'] },
  ['homeroom-change-demand', 'no-guidance-demand', 'attendance-record-change-demand', 'assessment-change-demand', 'unlawful-personal-demand']);

expectSituIds('학생 + 수업·생활지도 방해',
  { '침해 주체': ['학생'], '상황 유형': ['수업·생활지도 방해'] },
  ['repeated-class-disruption', 'guidance-noncompliance-disruption']);

expectSituIds('보호자 + 녹음·촬영',
  { '침해 주체': ['보호자'], '상황 유형': ['녹음·촬영'] },
  ['hidden-parent-recording', 'class-recording-filming', 'recording-distribution']);

expectSituIds('외부인 + 방문·점거',
  { '침해 주체': ['외부인'], '상황 유형': ['방문·점거'] },
  ['unauthorized-entry', 'refusal-to-leave-occupation']);

expectSituIds('즉시 안전 확보 + 법률 지원',
  { '긴급성': ['즉시 안전 확보 필요'], '지원 유형': ['법률 지원'] },
  ['physical-assault', 'object-threat', 'specific-threat', 'weapon-threat', 'sexual-contact', 'unauthorized-entry', 'refusal-to-leave-occupation']);

// 같은 '상황 유형' 안에서 여러 값을 선택하면 OR가 되어 서로 다른 유형의 대표 상황이 함께 남아야 해요.
expectSituIds('상황 유형 OR',
  { '상황 유형': ['폭언·모욕', '성적 언동·접촉'] },
  ['verbal-abuse', 'private-verbal-abuse', 'sexual-remarks-content', 'sexual-contact']);

// Phase 4 검색: title + keywords + contexts + officialTypes + example, 공백을 나눈 검색어는 모두 포함(AND)해야 해요.
function normalizeGuideSearch(text) {
  return String(text == null ? '' : text).toLocaleLowerCase('ko-KR').replace(/\s+/g, '');
}
function searchSituations(query) {
  const terms = String(query || '').trim().toLocaleLowerCase('ko-KR').split(/\s+/).map(normalizeGuideSearch).filter(Boolean);
  if (!terms.length) return SITUS;
  return SITUS.filter(st => {
    const corpus = normalizeGuideSearch([
      st.title,
      ...(st.keywords || []),
      ...(st.contexts || []),
      ...(st.officialTypes || []),
      st.example
    ].filter(Boolean).join(' '));
    return terms.every(term => corpus.includes(term));
  });
}
function expectSearch(label, query, ids) {
  const got = new Set(searchSituations(query).map(st => st.id));
  ids.filter(id => !got.has(id)).forEach(id => errors.push(`상황 검색 오류(${label} / "${query}"): ${id}가 결과에 없어요`));
}

expectSearch('담임', '담임', ['homeroom-change-demand']);
expectSearch('생기부', '생기부', ['attendance-record-change-demand']);
expectSearch('생활기록부', '생활기록부', ['attendance-record-change-demand']);
expectSearch('녹음', '녹음', ['hidden-parent-recording', 'class-recording-filming', 'recording-distribution']);
expectSearch('녹음기', '녹음기', ['hidden-parent-recording']);
expectSearch('욕설', '욕설', ['verbal-abuse', 'private-verbal-abuse']);
expectSearch('밤에 전화', '밤에 전화', ['after-hours-contact']);
expectSearch('아동학대', '아동학대', ['child-abuse-report']);
expectSearch('성적인', '성적인', ['sexual-remarks-content']);
expectSearch('폭행', '폭행', ['physical-assault']);
expectSearch('손해배상', '손해배상', ['civil-damages-legal-response']);
expectSearch('정보공개', '정보공개', ['repeated-info-disclosure-complaint']);
expectSearch('출근', '출근', ['post-incident-burnout']);

// 권리·지원: 공통 데이터는 제도·법령상 권리만. 금액(○만 원)·지역 사업명·시·도 이름은 지역 데이터(benefits)로
const BENEFIT_IDS = new Set();
const FIELD_KEYS = BENEFIT_FIELDS.map(([k]) => k);
const MONEY = /\d[\d,]*\s*(?:만|천|억)\s*원|\d[\d,]{2,}\s*원/;
// 오해 표현: ‘자동 승인·지급·부여’(부정문 ‘자동 승인되는 것은 아니에요’는 허용), ‘휴직 인정’, ‘○○ 가능’ 단정, 최대 일수 단독 표기
const MISLEADING = [
  /자동(?:으로)?\s?(?:승인|지급|부여|적용|휴직|전보)(?!되는 (?:것은|제도는) 아니|되지 않|되는 것이 아니)/,
  /휴직\s?인정/, /공무상 질병휴직\s?가능/, /특별휴가\s?(?:5|10)일(?!의 범위| 범위)/, /자동으로 \d+일/,
  /불인정(?:되면|이면)?\s?(?:곧|바로)?\s?허위/, /녹음(?:은|은 모두)?\s?무조건\s?불법/, /민원(?:은|이면)\s?(?:곧|모두|무조건)\s?교육활동 침해/
];
// 공통 문장에 쓰면 안 되는 지역 사업명·채널(지역 데이터에만). 시·도 이름(short·name)도 함께 검사해요
const REGION_BRANDS = {
  seoul: ['SEM119', '마음선', '마음생', '마음동', '마음행', '갈등조정단', '100인의 변호인단', '안심SEM'],
  gyeonggi: ['교권보호119', '안심콜', 'TAC', '교권코디', '경기교권보호지원센터', '화해중재단', 'SOS! 경기교육법률지원단'],
  incheon: ['아이스톡', '교육활동보호담당관', '학교민원 SOS', '중재지원단', '학교 변호사 ON']
};
const regionWords = () => REGION_ORDER.flatMap(id => [REGIONS[id].short, REGIONS[id].name, REGIONS[id].office, ...(REGION_BRANDS[id] || [])]);
function commonTextIssues(tag, text) {
  if (MONEY.test(text)) errors.push(`${tag}: 공통 문장에 금액이 있어요(지역 benefits로 옮기세요): ${text.match(MONEY)[0]}`);
  for (const w of regionWords()) if (text.includes(w)) errors.push(`${tag}: 공통 문장에 지역 이름·사업명이 있어요: ${w}`);
}
function misleadingIssues(tag, text) {
  for (const re of MISLEADING) { const m = text.match(re); if (m) errors.push(`${tag}: 자동 적용으로 오해할 수 있는 표현이에요: ${m[0]}`); }
}
const benefitText = x => [x.t, x.d, x.scope, x.notice, x.badge, ...FIELD_KEYS.map(k => x[k]), ...(x.missed || [])].filter(Boolean).join(' ');
const checkCommon = (tag, text) => { commonTextIssues(tag, text); misleadingIssues(tag, text); };

// 5메뉴: 회복·보호가 지원 찾기 앞에 있어야 해요
const PAGE_IDS = PAGES.map(([id]) => id);
if (PAGE_IDS.join(',') !== 'home,proc,guide,care,support') errors.push(`PAGES 순서가 5메뉴 IA와 달라요: ${PAGE_IDS.join(',')}`);
if (!PAGES.some(([id, label]) => id === 'care' && label === '회복·보호')) errors.push('PAGES에 ‘회복·보호’(care) 메뉴가 없어요');

const CATEGORY_IDS = new Set(BENEFIT_CATEGORIES.map(c => c.id));
const SOURCE_IDS = new Set();
COMMON_PUBLIC_SOURCES.forEach((src, i) => {
  if (!src.id) errors.push(`COMMON_PUBLIC_SOURCES[${i}] id가 없어요`);
  else if (SOURCE_IDS.has(src.id)) errors.push(`COMMON_PUBLIC_SOURCES id 중복: ${src.id}`);
  SOURCE_IDS.add(src.id);
  if (src.region !== 'common') errors.push(`COMMON_PUBLIC_SOURCES[${i}] region이 'common'이 아니에요`);
  if (!Array.isArray(src.uses) || !src.uses.length) errors.push(`COMMON_PUBLIC_SOURCES[${i}] uses가 없어요`);
  if (!ISO.test(src.verifiedAt || '')) errors.push(`COMMON_PUBLIC_SOURCES[${i}] verifiedAt 형식 오류`);
});
const SUPPORT_IDS = new Set(SUPPORT_TYPES.map(t => t.id));
const checkRefs = (tag, refs) => {
  if (!Array.isArray(refs) || !refs.length) errors.push(`${tag}: 공식 근거(refs)가 없어요`);
  (refs || []).filter(r => !SOURCE_IDS.has(r)).forEach(r => errors.push(`${tag}: 알 수 없는 근거 id ${r}`));
};
// 회복·보호에는 ‘내가 사용할 제도’만. 기관이 주는 지원 id가 들어오면 오류(지원 찾기로)
const SUPPORT_LIKE = ['counseling', 'treatment-cost', 'legal-consult', 'mutual-aid', 'security', 'mediation', 'property-damage'];

BENEFITS.forEach((x, i) => {
  const tag = `BENEFITS[${i}] (${x.t})`;
  if (!x.id || !/^[a-z]+(?:-[a-z]+)*$/.test(x.id)) errors.push(`${tag} id 형식 오류: ${x.id}`);
  else if (BENEFIT_IDS.has(x.id)) errors.push(`${tag} id 중복`);
  BENEFIT_IDS.add(x.id);
  if (SUPPORT_LIKE.includes(x.id)) errors.push(`${tag} 외부 지원은 회복·보호가 아니라 지원 찾기(SUPPORT_TYPES)에 둬요`);
  for (const f of ['t', 'd', 'e', 'what', 'who', 'limit', 'when', 'apply', 'basis']) if (!x[f]) errors.push(`${tag} ${f} 없음`);
  if (!CATEGORY_IDS.has(x.category)) errors.push(`${tag} category 값이 잘못됐어요: ${x.category}`);
  if (!Object.prototype.hasOwnProperty.call(EMPLOYMENT_SCOPES, x.employment)) errors.push(`${tag} employment 값이 잘못됐어요: ${x.employment}`);
  if ((x.missed || []).length > 2) errors.push(`${tag} ‘놓치기 쉬워요’는 2개까지예요: ${x.missed.length}개`);
  checkRefs(tag, x.refs);
  if (x.supportLinks) x.supportLinks.types.filter(t => !SUPPORT_IDS.has(t)).forEach(t => errors.push(`${tag} supportLinks에 없는 지원 유형: ${t}`));
  checkCommon(tag, benefitText(x));
});
BENEFIT_CATEGORIES.forEach(c => { if (!BENEFITS.some(b => b.category === c.id)) errors.push(`BENEFIT_CATEGORIES ${c.id}: 제도가 없어요`); });
const need = id => { const x = BENEFITS.find(b => b.id === id); if (!x) errors.push(`BENEFITS에 ${id}가 없어요`); return x; };
// 특별휴가: ‘범위에서 부여할 수 있어요’ 유지, ‘지급’ 금지
const leave = need('special-leave');
if (leave) {
  const lt = benefitText(leave);
  if (!/범위에서/.test(lt) || !/부여할 수 있/.test(lt)) errors.push('특별휴가 안내에 ‘범위에서 … 부여할 수 있어요’ 표현이 없어요');
  if (/지급/.test(lt)) errors.push('특별휴가 안내에 ‘지급’ 표현이 있어요');
}
// 일반 병가와 공무상 병가는 별도 제도, 국·공립 기준 제도는 employment: public
for (const id of ['special-leave', 'sick-leave', 'official-sick-leave', 'official-disease-leave', 'official-medical-care']) {
  const x = need(id);
  if (x && x.employment !== 'public') errors.push(`${id}: 국·공립 교원 기준(employment: 'public')으로 표시해야 해요`);
}
for (const id of ['disease-leave', 'official-disease-leave']) {
  const x = need(id);
  if (x && !/(?:검토|확인)할 수 있어요/.test(x.d)) errors.push(`${id}: 요약에 ‘검토·확인할 수 있어요’ 표현이 없어요`);
}
// 공무상 질병휴직·공무상 병가는 첫 줄(notice)에 ‘자동 적용이 아니다’를 보여 줘요
for (const id of ['official-disease-leave', 'official-sick-leave']) {
  const x = need(id);
  if (x && !/자동/.test(x.notice || '')) errors.push(`${id}: notice에 ‘자동으로 적용되지 않는다’는 안내가 없어요`);
}
// 회복 흐름
RECOVERY_PATH.forEach((r, i) => {
  (r.ids || []).filter(id => !BENEFIT_IDS.has(id)).forEach(id => errors.push(`RECOVERY_PATH[${i}] id가 BENEFITS에 없어요: ${id}`));
  for (const f of ['t', 'period', 'badge', 'd']) if (!r[f]) errors.push(`RECOVERY_PATH[${i}] ${f} 없음`);
  checkCommon(`RECOVERY_PATH[${i}]`, [r.t, r.period, r.badge, r.d].join(' '));
});
if (!/자동으로 이어지는 것이 아니/.test(RECOVERY_NOTE || '')) errors.push('RECOVERY_NOTE에 ‘자동으로 이어지는 것이 아니며’ 안내가 없어요');
// 홈
HOME_ENTRIES.forEach((h, i) => {
  if (!PAGE_IDS.includes(h.page) || h.page === 'home') errors.push(`HOME_ENTRIES[${i}] page가 잘못됐어요: ${h.page}`);
  checkCommon(`HOME_ENTRIES[${i}]`, [h.t, h.d].join(' '));
});
['proc', 'guide', 'care', 'support'].forEach(p => { if (!HOME_ENTRIES.some(h => h.page === p)) errors.push(`HOME_ENTRIES에 ${p} 입구가 없어요`); });
HOME_HIGHLIGHTS.forEach((h, i) => {
  if (!BENEFIT_IDS.has(h.id)) errors.push(`HOME_HIGHLIGHTS[${i}] id가 BENEFITS에 없어요: ${h.id}`);
  checkCommon(`HOME_HIGHLIGHTS[${i}]`, [h.d, h.cta].join(' '));
  if (h.d.length > 70) errors.push(`HOME_HIGHLIGHTS[${i}] 홈 문구가 길어요(70자 이하): ${h.d.length}자`);
});
// 대응 절차 단계별 바로가기
if (STEP_LINKS.length !== STEPS.length) errors.push(`STEP_LINKS 개수(${STEP_LINKS.length})가 STEPS(${STEPS.length})와 달라요`);
STEP_LINKS.forEach((L, i) => {
  L.benefits.filter(id => !BENEFIT_IDS.has(id)).forEach(id => errors.push(`STEP_LINKS[${i}] 알 수 없는 benefit id: ${id}`));
  L.supports.filter(id => !SUPPORT_IDS.has(id)).forEach(id => errors.push(`STEP_LINKS[${i}] 알 수 없는 지원 유형: ${id}`));
});
// 상황 → 회복·보호(관련성이 분명할 때만, 빈 배열 허용)
SITUS.forEach(st => {
  const list = SITU_BENEFITS[st.id];
  if (!Array.isArray(list)) errors.push(`SITU_BENEFITS: 상황 ${st.id} 항목이 없어요(관련 제도가 없으면 빈 배열)`);
  (list || []).filter(id => !BENEFIT_IDS.has(id)).forEach(id => errors.push(`SITU_BENEFITS[${st.id}] 알 수 없는 benefit id: ${id}`));
  if (list && new Set(list).size !== list.length) errors.push(`SITU_BENEFITS[${st.id}] 중복 id가 있어요`);
});
Object.keys(SITU_BENEFITS).filter(id => !SITUS.some(st => st.id === id)).forEach(id => errors.push(`SITU_BENEFITS에 없는 상황 id: ${id}`));
const leaveLinked = SITUS.filter(st => (SITU_BENEFITS[st.id] || []).some(id => /disease-leave$/.test(id))).length;
if (leaveLinked > 4) errors.push(`휴직이 연결된 상황이 너무 많아요(${leaveLinked}개): 장기 회복과 관련된 상황에만 연결하세요`);
// 민원·부당 요구 상황에는 휴직을 바로 연결하지 않아요
SITUS.filter(st => ['complaint', 'interference', 'legal'].includes(st.group)).forEach(st => {
  if ((SITU_BENEFITS[st.id] || []).some(id => /leave$/.test(id))) errors.push(`SITU_BENEFITS[${st.id}] 민원·간섭·수사 상황에 휴가·병가·휴직을 연결했어요`);
});
// 지원 유형: 공통 기준(guide)·회복·보호 연결(care)
SUPPORT_TYPES.forEach((t, i) => {
  const tag = `SUPPORT_TYPES[${i}] (${t.label})`;
  if (!t.id || !t.label || !Array.isArray(t.areas) || !t.areas.length) errors.push(`${tag} id·label·areas가 필요해요`);
  if (t.guide) {
    for (const f of ['what', 'who', 'when', 'apply']) if (!t.guide[f]) errors.push(`${tag} guide.${f} 없음`);
    if ((t.guide.missed || []).length > 2) errors.push(`${tag} guide ‘놓치기 쉬워요’는 2개까지예요`);
    checkRefs(`${tag} guide`, t.guide.refs);
    checkCommon(`${tag} guide`, [t.guide.what, t.guide.who, t.guide.when, t.guide.apply, ...(t.guide.missed || [])].join(' '));
  }
  if (t.care) t.care.ids.filter(id => !BENEFIT_IDS.has(id)).forEach(id => errors.push(`${tag} care에 없는 benefit id: ${id}`));
  (t.tags || []).forEach(v => { if (!FILTER_DEFS.find(d => d.g === '상황 유형').opts.includes(v)) errors.push(`${tag} tags에 없는 상황 유형: ${v}`); });
});
// 상담 지원에서 병가·휴직으로 이어지는 연결(회복·보호 cross-link)
const counsel = SUPPORT_TYPES.find(t => t.id === 'counsel');
if (!counsel || !counsel.care || !counsel.care.ids.some(id => /leave$/.test(id))) errors.push('상담·회복 지원에서 병가·휴직(회복·보호)으로 가는 연결이 없어요');

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
  // 출처를 보여 줄 화면(uses): 비었거나 모르는 값이면 오류. 지원 항목이 가리키는 출처는 지원 찾기(support)에 쓰여야 해요
  r.sources.forEach((s, i) => {
    if (!Array.isArray(s.uses) || !s.uses.length) errors.push(`${tag} sources[${i}] uses가 없어요: ${s.title}`);
    else s.uses.filter(u => !SOURCE_USES.includes(u)).forEach(u => errors.push(`${tag} sources[${i}] 알 수 없는 uses: ${u}`));
  });
  for (const use of SOURCE_USES) {
    if (!r.sources.some(s => (s.uses || []).includes(use))) warnings.push(`${tag} ${use} 화면에 쓸 지역 출처가 없어요(공통 근거만 표시돼요)`);
  }
  r.programs.forEach((p, i) => {
    // source는 번호 하나 또는 번호 배열
    for (const n of p.source === undefined ? [] : [].concat(p.source)) {
      if (!r.sources[n]) errors.push(`${tag} programs[${i}] source 번호가 없어요: ${n}`);
      else if (!(r.sources[n].uses || []).includes('support')) errors.push(`${tag} programs[${i}] source ${n}의 uses에 support가 없어요`);
    }
    // 지원 찾기에 보이려면 area가 SUPPORT_TYPES 중 하나에 속해야 해요
    const areas = [].concat(p.area);
    if (!areas.length) errors.push(`${tag} programs[${i}] area가 없어요`);
    areas.filter(a => !SUPPORT_TYPES.some(t => t.areas.includes(a))).forEach(a => errors.push(`${tag} programs[${i}] area가 SUPPORT_TYPES에 없어요: ${a}`));
  });

  // 회복·보호 지역 상세·홈 한 줄: 공통 제도 id에 연결되고, 근거 출처(uses에 care)가 있어야 해요
  if (r.protections !== undefined) errors.push(`${tag} 예전 필드 protections → benefits로 바꿔 주세요`);
  r.sources.forEach((src, i) => { if (src.region !== id) errors.push(`${tag} sources[${i}] region이 '${id}'가 아니에요: ${src.region}`); });
  Object.entries(r.benefits || {}).forEach(([pid, d]) => {
    if (!BENEFIT_IDS.has(pid)) errors.push(`${tag} benefits.${pid}: BENEFITS에 없는 id예요`);
    const refs = d.source === undefined ? [] : [].concat(d.source);
    if (!refs.length) errors.push(`${tag} benefits.${pid}: source가 없어요`);
    for (const n of refs) {
      if (!r.sources[n]) errors.push(`${tag} benefits.${pid}: source 번호가 없어요(${n})`);
      else if (!(r.sources[n].uses || []).includes('care')) errors.push(`${tag} benefits.${pid}: source ${n}의 uses에 care가 없어요`);
    }
    Object.keys(d).filter(k => ![...FIELD_KEYS, 'missed', 'source', 'program'].includes(k)).forEach(k => errors.push(`${tag} benefits.${pid}: 알 수 없는 필드 ${k}`));
    if ((d.missed || []).length > 2) errors.push(`${tag} benefits.${pid}: ‘놓치기 쉬워요’는 2개까지예요`);
    misleadingIssues(`${tag} benefits.${pid}`, [d.program, ...FIELD_KEYS.map(k => d[k]), ...(d.missed || [])].filter(Boolean).join(' '));
  });
  // 숫자 정보(일·회·원·년·개월)가 있는 지원 항목은 출처가 있어야 해요
  const NUMERIC = /\d+\s*(?:만\s*원|억\s*원|원|일|회기|회|년|개월)/;
  r.programs.forEach((p, i) => {
    const text = [p.sum, p.amount, p.eligibility, p.timing, p.documents, p.caution].filter(Boolean).join(' ');
    if (NUMERIC.test(text) && p.source === undefined) errors.push(`${tag} programs[${i}] 숫자 정보가 있는데 출처(source)가 없어요: ${p.t}`);
    misleadingIssues(`${tag} programs[${i}]`, text);
  });
  // 다른 지역의 사업명이 섞이지 않았는지(이 지역 파일 전체 문장 기준)
  const own = JSON.stringify({ ...r, sources: undefined, offices: undefined });
  for (const other of REGION_ORDER.filter(x => x !== id)) {
    for (const w of REGION_BRANDS[other] || []) if (own.includes(w) && !(REGION_BRANDS[id] || []).includes(w)) errors.push(`${tag} 다른 지역(${other}) 사업명이 섞였어요: ${w}`);
  }
  Object.entries(r.highlights || {}).forEach(([hid, text]) => {
    if (!HOME_HIGHLIGHTS.some(h => h.id === hid)) errors.push(`${tag} highlights.${hid}: HOME_HIGHLIGHTS에 없는 id예요`);
    misleadingIssues(`${tag} highlights.${hid}`, String(text));
    if (String(text).length > 60) errors.push(`${tag} highlights.${hid}: 홈 한 줄이 길어요(60자 이하): ${String(text).length}자`);
  });
  // 지원 항목 상세 필드(amount·eligibility·timing·documents·caution): 예전 이름(docs·deadline)은 쓰지 않아요
  r.programs.forEach((p, i) => {
    for (const old of ['docs', 'deadline']) if (p[old] !== undefined) errors.push(`${tag} programs[${i}] 예전 필드 ${old} → ${old === 'docs' ? 'documents' : 'timing'}로 바꿔 주세요`);
  });

  // 신청·상담·안내 링크(channels)와 교육지원청 링크: https + 공식 도메인만
  r.programs.forEach((p, i) => (p.channels || []).forEach((c, j) => {
    const where = `programs[${i}].channels[${j}] (${p.t})`;
    if (!CHANNEL_TYPES.includes(c.type)) errors.push(`${tag} ${where} 알 수 없는 type: ${c.type}`);
    checkUrl(tag, where, c.url);
  }));
  checkUrl(tag, 'officeUrl', r.officeUrl);
  (r.links || []).forEach((c, j) => {
    if (!CHANNEL_TYPES.includes(c.type)) errors.push(`${tag} links[${j}] 알 수 없는 type: ${c.type}`);
    if (!c.label) errors.push(`${tag} links[${j}] label 없음`);
    checkUrl(tag, `links[${j}] (${c.label})`, c.url);
  });
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

  console.log(`${tag} 교육지원청 ${r.offices.length}곳 · 시·군·구 ${seen.size}곳 · 지원제도 ${r.programs.length}(한도 표시 ${r.programs.filter(p => p.amount).length}) · 회복·보호 상세 ${Object.keys(r.benefits || {}).length} · 기관 ${r.orgs.length} · 최종 확인 ${r.verifiedAt}`);
}

console.log(`합계 시·군·구 ${total}곳`);
warnings.forEach(w => console.log('주의: ' + w));
if (errors.length) {
  errors.forEach(e => console.log('오류: ' + e));
  process.exit(1);
}
console.log('데이터 점검 통과');
