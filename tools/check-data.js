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
// 12) 최신성(Phase 3): verifiedAt·sourceUpdatedAt·reviewBy 날짜 형식(실제 있는 날짜), 미래 확인일은 오류,
//     reviewStatus 값, 오래된 확인일(FRESHNESS_DAYS: 법령 stable / 지역 사업·연락처 volatile)·지난 재확인일(reviewBy)·
//     확인 뒤 개정된 근거·다시 확인 필요 항목은 ‘주의’로 알려요. 기준일은 CHECK_TODAY=2027-06-01 처럼 바꿔 미리 볼 수 있어요
// 13) 공유 주소: 지역 id(‘common’은 공통 예약어), 주소에 들어가는 id 형식, app.js의 공유 주소 만들기 → 읽기 왕복(모든 지역 × 화면 × 항목)
// 14) 지역 gap 데이터(tools/data/regional-gaps.js): 지역 × 영역 누락, 상태 값, todo, 근거가 실제 데이터를 가리키는지
// 15) 업데이트 내역(data/updates.js): id 형식·중복, 실제 날짜·최신순, type 값, 제목·설명, 상단 안내바(showBanner·banner·bannerUntil), 전화번호 없음
// 옵션: --json=파일 → 오류·주의·요약을 JSON으로도 저장(운영 리포트·check-all이 읽어요)
// 문제가 있으면 종료 코드 1로 끝나요. 링크 접속 확인은 node tools/check-links.js 로 따로 해요.

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const scripts = [...html.matchAll(/<script src="(data\/[^"?]+)(?:\?v=[^"]*)?"><\/script>/g)].map(m => m[1]);

const errors = [];
const warnings = [];

// 배포 버전(cache busting): 로컬 CSS·JS는 모두 meta asset-version과 같은 ?v= 를 써야 해요(서로 다른 배포 파일이 섞이지 않게)
{
  const meta = (html.match(/<meta name="asset-version" content="([^"]+)">/) || [])[1];
  if (!meta) errors.push('index.html에 <meta name="asset-version">이 없어요');
  const local = [...html.matchAll(/<(?:script src|link rel="stylesheet" href)="(?!https?:)([^"]+)"/g)].map(m => m[1]);
  if (!local.length) errors.push('index.html에서 로컬 CSS·JS를 찾지 못했어요');
  local.forEach(u => {
    const v = (u.match(/\?v=([^&"]+)/) || [])[1];
    if (!v) errors.push(`index.html: ${u}에 ?v= 버전이 없어요`);
    else if (meta && v !== meta) errors.push(`index.html: ${u}의 버전(${v})이 asset-version(${meta})과 달라요`);
    if (!fs.existsSync(path.join(root, u.split('?')[0]))) errors.push(`index.html: ${u} 파일이 없어요`);
  });
}
// 브랜드 이미지: index.html(favicon)·app.js(헤더 로고)가 가리키는 assets/ 파일이 실제로 있는지
{
  const appSrc = fs.readFileSync(path.join(root, 'app.js'), 'utf8');
  const refs = [...html.matchAll(/href="(assets\/[^"?]+)"/g), ...appSrc.matchAll(/src="(assets\/[^"?]+)"/g)].map(m => m[1]);
  if (!refs.some(r => r.startsWith('assets/brand/'))) errors.push('index.html·app.js에서 assets/brand 브랜드 이미지를 찾지 못했어요');
  [...new Set(refs)].forEach(r => { if (!fs.existsSync(path.join(root, r))) errors.push(`${r} 파일이 없어요(브랜드 이미지는 assets/brand/에서 관리해요)`); });
}
// 링크 공유 미리보기(Open Graph·Twitter Card): 처음 받는 HTML에 한 번씩만, 이미지는 절대 https 주소이고 저장소에 실제 파일이 있어야 해요
{
  const metaOf = key => [...html.matchAll(new RegExp(`<meta (?:property|name)="${key.replace(/[.:]/g, '\\$&')}" content="([^"]*)">`, 'g'))].map(m => m[1]);
  ['og:type', 'og:site_name', 'og:title', 'og:description', 'og:url', 'og:image', 'twitter:card', 'twitter:title', 'twitter:description', 'twitter:image'].forEach(k => {
    const n = metaOf(k).length;
    if (n !== 1) errors.push(`index.html: ${k} meta가 ${n}개예요(정확히 1개)`);
  });
  for (const k of ['og:image', 'twitter:image', 'og:url']) {
    const v = metaOf(k)[0];
    if (v && !/^https:\/\//.test(v)) errors.push(`index.html: ${k}는 https 절대 주소여야 해요: ${v}`);
    if (v && k !== 'og:url') {
      const local = new URL(v).pathname.replace(/^\//, '');
      if (!fs.existsSync(path.join(root, local))) errors.push(`index.html: ${k} 이미지 ${local} 파일이 저장소에 없어요`);
    }
  }
}
const ctx = { console: { error: (...a) => errors.push(a.join(' ')), warn: console.warn, log: console.log } };
vm.createContext(ctx);
for (const f of scripts) vm.runInContext(fs.readFileSync(path.join(root, f), 'utf8'), ctx, { filename: f });
const { PAGES, REGIONS, REGION_ORDER, SUPPORT_TYPES, SITUS, SITU_GROUPS, FILTER_DEFS, STAGE_TO_STEP, STEPS, COMMON_PUBLIC_SOURCES, SOURCE_USES, BENEFITS, BENEFIT_FIELDS, BENEFIT_CATEGORIES, EMPLOYMENT_SCOPES, HOME_ENTRIES, HOME_HIGHLIGHTS, RECOVERY_PATH, RECOVERY_NOTE, STEP_LINKS, SITU_BENEFITS, COMPARISONS, SITU_ACTIONS, REVIEW_STATUSES, FRESHNESS_DAYS, FEEDBACK_URL, FEEDBACK_FIELDS, VALIDATION_SOURCES } = vm.runInContext('({ REVIEW_STATUSES, FRESHNESS_DAYS, FEEDBACK_URL, FEEDBACK_FIELDS: typeof FEEDBACK_FIELDS === "undefined" ? undefined : FEEDBACK_FIELDS, VALIDATION_SOURCES, COMPARISONS, SITU_ACTIONS, PAGES, REGIONS, REGION_ORDER, SUPPORT_TYPES, SITUS, SITU_GROUPS, FILTER_DEFS, STAGE_TO_STEP, STEPS, COMMON_PUBLIC_SOURCES, SOURCE_USES, BENEFITS, BENEFIT_FIELDS, BENEFIT_CATEGORIES, EMPLOYMENT_SCOPES, HOME_ENTRIES, HOME_HIGHLIGHTS, RECOVERY_PATH, RECOVERY_NOTE, STEP_LINKS, SITU_BENEFITS })', ctx);

const ISO = /^\d{4}-\d{2}-\d{2}$/;
// 최신성 날짜 필드(Phase 3)
const DATE_KEYS = ['verifiedAt', 'sourceUpdatedAt', 'contactsVerifiedAt', 'areasVerifiedAt', 'reviewBy', 'areasReviewBy'];

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
  const out = [['hot', r.hot], ...(r.hotContacts || []).map((c, i) => [`hotContacts[${i}] (${c.label})`, c.value]), ...Object.entries(r.terms).map(([k, v]) => ['terms.' + k, v])];
  for (const key of ['offices', 'programs', 'orgs']) {
    (r[key] || []).forEach((item, i) => {
      for (const f of ['contact', 'apply', 'amount', 'timing', 'documents', 'caution', 'eligibility']) if (item[f]) out.push([`${key}[${i}].${f} (${item.name || item.t})`, item[f]]);
      (item.contacts || []).forEach((c, j) => out.push([`${key}[${i}].contacts[${j}] (${item.name || item.t})`, c.value]));
    });
  }
  Object.entries(r.benefits || {}).forEach(([pid, d]) => {
    for (const [k, v] of Object.entries(d)) if (typeof v === 'string' && !DATE_KEYS.includes(k)) out.push([`benefits.${pid}.${k}`, v]);
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
  /^chungbuk\.ssif\.or\.kr$/,          // 충청북도학교안전공제회
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
  incheon: ['아이스톡', '교육활동보호담당관', '학교민원 SOS', '중재지원단', '학교 변호사 ON'],
  busan: ['One-Stop 지원단', '교원법률지원단', '교원 힐링캠프', '교원 힐링 아카데미', '민원 해결 요청 게시판'],
  chungbuk: ['교원119', '마음클리닉', '현장지원119', '갈등조정지원관'],
  gangwon: ['동:행 119', '원스톱 변호사 법률지원', '이음톡']
};
const regionWords = () => REGION_ORDER.flatMap(id => [REGIONS[id].short, REGIONS[id].name, REGIONS[id].office, ...(REGION_BRANDS[id] || [])]);
function commonTextIssues(tag, text) {
  if (MONEY.test(text)) errors.push(`${tag}: 공통 문장에 금액이 있어요(지역 benefits로 옮기세요): ${text.match(MONEY)[0]}`);
  for (const w of regionWords()) if (text.includes(w)) errors.push(`${tag}: 공통 문장에 지역 이름·사업명이 있어요: ${w}`);
}
function misleadingIssues(tag, text) {
  for (const re of MISLEADING) { const m = text.match(re); if (m) errors.push(`${tag}: 자동 적용으로 오해할 수 있는 표현이에요: ${m[0]}`); }
}
const benefitText = x => [x.t, x.d, x.scope, x.notice, x.cause, x.recognition, ...(x.badges || []), ...FIELD_KEYS.map(k => x[k]), ...(x.missed || []), ...(x.actions || []).map(a => a.t)].filter(Boolean).join(' ');
// 행동 체크 목록: 3~5개(상황은 2~5개), id 중복 없음, id 형식(저장 키에 쓰여요)
const checkActions = (tag, list, min) => {
  if (!Array.isArray(list)) return;
  if (list.length < min || list.length > 5) errors.push(`${tag}: 행동 체크는 ${min}~5개로 해 주세요(${list.length}개)`);
  const ids = new Set();
  list.forEach(a => {
    if (!a.id || !/^[a-z]+(?:-[a-z]+)*$/.test(a.id)) errors.push(`${tag}: 행동 id 형식 오류 ${a.id}`);
    else if (ids.has(a.id)) errors.push(`${tag}: 행동 id 중복 ${a.id}`);
    ids.add(a.id);
    if (!a.t) errors.push(`${tag}: 행동 문구가 비어 있어요(${a.id})`);
  });
};
// 배지는 짧은 의미 단위로(긴 막대처럼 보이지 않게)
const checkBadges = (tag, list) => (list || []).forEach(t => { if (String(t).length > 14) errors.push(`${tag}: 배지가 길어요(14자 이하로 나눠 주세요): ${t}`); });
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
  checkBadges(tag, x.badges);
  if (!Array.isArray(x.actions)) errors.push(`${tag} ‘지금 확인해 볼 일’(actions)이 없어요`);
  checkActions(tag, x.actions, 3);
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
  for (const f of ['t', 'scope', 'note', 'd']) if (!r[f]) errors.push(`RECOVERY_PATH[${i}] ${f} 없음`);
  if (!Array.isArray(r.badges) || !r.badges.length) errors.push(`RECOVERY_PATH[${i}] badges 없음`);
  checkBadges(`RECOVERY_PATH[${i}]`, r.badges);
  checkCommon(`RECOVERY_PATH[${i}]`, [r.t, ...(r.badges || []), r.scope, r.note, r.d].join(' '));
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
if (SUPPORT_IDS.size !== SUPPORT_TYPES.length) errors.push('SUPPORT_TYPES id가 중복돼요');
// 같은 검색 키워드가 너무 많은 제도에 붙으면 검색 결과가 흐려져요(주의만)
const kwCount = {};
BENEFITS.forEach(b => (b.keywords || []).forEach(k => { kwCount[k] = (kwCount[k] || 0) + 1; }));
Object.entries(kwCount).filter(([, n]) => n > 4).forEach(([k, n]) => warnings.push(`키워드 ‘${k}’가 제도 ${n}개에 붙어 있어요`));
// 출처 URL: https만(접속 확인은 별도)
const httpsOnly = (tag, url) => { try { if (new URL(url).protocol !== 'https:') errors.push(`${tag} https가 아니에요: ${url}`); } catch (e) { errors.push(`${tag} URL 형식 오류: ${url}`); } };
COMMON_PUBLIC_SOURCES.forEach((src, i) => httpsOnly(`COMMON_PUBLIC_SOURCES[${i}]`, src.url));
REGION_ORDER.forEach(id => REGIONS[id].sources.forEach((src, i) => src.url && httpsOnly(`[${id}] sources[${i}]`, src.url)));

// 회복·보호 비교표(COMPARISONS): id 중복, 제도 참조, 같은 제도 중복, 칸 필드
const cmpIds = new Set();
COMPARISONS.forEach((c, i) => {
  const tag = `COMPARISONS[${i}] (${c.t})`;
  if (!c.id || cmpIds.has(c.id)) errors.push(`${tag}: id가 없거나 중복돼요`);
  cmpIds.add(c.id);
  if (!Array.isArray(c.ids) || c.ids.length < 2) errors.push(`${tag}: 비교할 제도가 2개 이상이어야 해요`);
  if (new Set(c.ids).size !== c.ids.length) errors.push(`${tag}: 같은 제도가 두 번 들어 있어요`);
  c.ids.filter(id => !BENEFIT_IDS.has(id)).forEach(id => errors.push(`${tag}: 없는 제도 id ${id}`));
  c.rows.forEach(([key]) => {
    if (key === 'keyNote' || key === '@return') return;
    c.ids.map(id => BENEFITS.find(b => b.id === id)).filter(Boolean).forEach(b => { if (!b[key]) errors.push(`${tag}: ${b.id}에 비교 칸 ‘${key}’ 내용이 없어요`); });
  });
  if (c.note) checkCommon(`${tag} note`, c.note);
});
if (!COMPARISONS.some(c => c.ids.includes('official-disease-leave') && /공무상 요양 승인/.test(c.note || ''))) errors.push('질병휴직 비교에 ‘침해 인정 ≠ 공무상 질병휴직’ 안내(note)가 없어요');
// 상황별 ‘지금 해볼 일’: 실제 상황 id, 2~5개
Object.entries(SITU_ACTIONS).forEach(([id, list]) => {
  if (!SITUS.some(st => st.id === id)) errors.push(`SITU_ACTIONS: 없는 상황 id ${id}`);
  checkActions(`SITU_ACTIONS[${id}]`, list, 2);
  checkCommon(`SITU_ACTIONS[${id}]`, list.map(a => a.t).join(' '));
});
if (Object.keys(SITU_ACTIONS).length > 12) errors.push('상황별 ‘지금 해볼 일’은 핵심 상황에만(12개 이하) 두세요');

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
    Object.keys(d).filter(k => ![...FIELD_KEYS, 'missed', 'source', 'program', 'verifiedAt', 'reviewStatus', 'sourceUpdatedAt'].includes(k)).forEach(k => errors.push(`${tag} benefits.${pid}: 알 수 없는 필드 ${k}`));
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

  // 역할별 대표 연락처(선택): 라벨·번호가 모두 있어야 하고, 헤더 버튼이 거는 hot은 그중 하나여야 해요
  if (r.hotContacts !== undefined) {
    if (!Array.isArray(r.hotContacts) || r.hotContacts.length < 2) errors.push(`${tag} hotContacts는 2개 이상인 배열이어야 해요`);
    else {
      r.hotContacts.forEach((c, i) => {
        if (!c.label || !c.value) errors.push(`${tag} hotContacts[${i}] label·value가 필요해요`);
        else if (!isValidPhone(c.value)) errors.push(`${tag} hotContacts[${i}] 번호는 전화번호 하나만 적어요: ${c.value}`);
      });
      if (!r.hotContacts.some(c => c.value === r.hot)) errors.push(`${tag} hot(${r.hot})이 hotContacts에 없어요`);
    }
  }

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

// ══════════════ 15) 업데이트 내역 ══════════════
// 헤더 ‘업데이트 MM.DD’·상단 안내바·내역 창·푸터가 모두 이 목록의 맨 위 항목을 쓰므로 순서와 형식이 중요해요
{
  const { UPDATES, UPDATE_TYPES } = vm.runInContext('({ UPDATES: typeof UPDATES === "undefined" ? undefined : UPDATES, UPDATE_TYPES: typeof UPDATE_TYPES === "undefined" ? undefined : UPDATE_TYPES })', ctx);
  const { isRealDate } = require('./lib/freshness');
  if (!Array.isArray(UPDATES) || !UPDATES.length) errors.push('업데이트 내역(UPDATES)이 없어요 — index.html에 data/updates.js를 넣었는지 확인하세요');
  else {
    const ids = new Set();
    UPDATES.forEach((u, i) => {
      const tag = `[업데이트 ${u.id || i}]`;
      if (!/^\d{4}-\d{2}-\d{2}-[a-z0-9-]+$/.test(u.id || '')) errors.push(`${tag} id는 ‘YYYY-MM-DD-영문-요약’ 형식이어야 해요`);
      if (ids.has(u.id)) errors.push(`${tag} id가 중복돼요`);
      ids.add(u.id);
      if (!ISO.test(u.date || '') || !isRealDate(u.date)) errors.push(`${tag} date 형식 오류: ${u.date}`);
      else if (u.id && !u.id.startsWith(u.date)) errors.push(`${tag} id 앞부분이 date(${u.date})와 달라요`);
      // 아직 반영하지 않은 작업을 미리 적지 않도록 미래 날짜는 오류예요
      if (isRealDate(u.date || '') && u.date > (process.env.CHECK_TODAY || require('./lib/freshness').kstToday())) errors.push(`${tag} 미래 날짜예요(반영된 날을 적어요): ${u.date}`);
      if (i > 0 && UPDATES[i - 1].date < u.date) errors.push(`${tag} 최신순이 아니에요(새 업데이트는 맨 위에 적어요)`);
      if (!(UPDATE_TYPES || []).includes(u.type)) errors.push(`${tag} type은 ${(UPDATE_TYPES || []).join('·')} 중 하나여야 해요: ${u.type}`);
      if (!u.title || !u.summary) errors.push(`${tag} title·summary가 필요해요`);
      if (u.details !== undefined && (!Array.isArray(u.details) || u.details.some(d => typeof d !== 'string' || !d))) errors.push(`${tag} details는 문장 배열이어야 해요`);
      if (u.showBanner && !u.banner) errors.push(`${tag} showBanner면 banner(안내바 한 줄)가 필요해요`);
      if (!u.showBanner && (u.banner || u.bannerUntil)) errors.push(`${tag} banner·bannerUntil은 showBanner와 함께 써요`);
      if (u.bannerUntil && (!ISO.test(u.bannerUntil) || !isRealDate(u.bannerUntil) || u.bannerUntil < u.date)) errors.push(`${tag} bannerUntil 형식 오류이거나 date보다 빨라요: ${u.bannerUntil}`);
      const text = [u.title, u.summary, u.banner, ...(u.details || [])].join(' ');
      if (phonesIn(text).length) errors.push(`${tag} 업데이트 문장에 전화번호를 적지 않아요(번호는 지역 화면에서 안내): ${phonesIn(text).join(', ')}`);
    });
    console.log(`업데이트 내역: ${UPDATES.length}건 · 최신 ${UPDATES[0].date} ${UPDATES[0].title} · 안내바 후보 ${UPDATES.filter(u => u.showBanner).length}`);
  }
}

// ══════════════ 12) 최신성 ══════════════
// 계산 규칙은 tools/lib/freshness.js에 있어요(운영 리포트와 같은 규칙). CHECK_TODAY=YYYY-MM-DD로 바꾸면 앞으로 뜰 주의를 미리 볼 수 있어요
const { analyzeFreshness, kstToday } = require('./lib/freshness');
const TODAY = process.env.CHECK_TODAY || kstToday();
const fresh = analyzeFreshness({ COMMON_PUBLIC_SOURCES, VALIDATION_SOURCES, BENEFITS, REGIONS, REGION_ORDER, REVIEW_STATUSES, FRESHNESS_DAYS }, TODAY);
errors.push(...fresh.errors);
warnings.push(...fresh.warnings);
const FD = FRESHNESS_DAYS || {};
console.log(`최신성: 점검 ${fresh.items}건 · 기준일 ${TODAY} · 기준 법령·공통 ${FD.stable}일 / 지역 사업·연락처 ${FD.volatile}일 · 오래된 확인 ${(fresh.stale || []).length} · 재확인일 지남 ${(fresh.due || []).length} · 다시 확인 필요 ${fresh.flags.length}${fresh.next ? ` · 다음 주의 예정 ${fresh.next.until}(${fresh.next.tag})` : ''}`);

// ══════════════ 13) 공유 주소 ══════════════
// 지역 id: 영문 소문자, ‘common’은 공통(지역 미선택)을 뜻하는 공유 주소 예약어라 지역 id로 쓸 수 없어요
const URL_ID = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
REGION_ORDER.forEach(id => {
  if (!REGIONS[id]) errors.push(`REGION_ORDER에 등록되지 않은 지역 id: ${id}`);
  if (!/^[a-z]+$/.test(id)) errors.push(`지역 id 형식 오류(영문 소문자): ${id}`);
  if (id === 'common') errors.push('지역 id로 common을 쓸 수 없어요(공유 주소의 공통 예약어)');
});
[['PAGES', PAGES.map(([id]) => id)], ['BENEFITS', BENEFITS.map(b => b.id)], ['COMPARISONS', COMPARISONS.map(c => c.id)], ['SITUS', SITUS.map(x => x.id)], ['SUPPORT_TYPES', SUPPORT_TYPES.map(t => t.id)]]
  .forEach(([name, ids]) => ids.filter(id => !URL_ID.test(id)).forEach(id => errors.push(`${name}: 공유 주소에 쓰는 id 형식 오류 ${id}`)));
if (!(STEPS.length >= 1 && STEPS.length <= 9)) errors.push(`STEPS는 1~9단계여야 해요(공유 주소 step=1~9): ${STEPS.length}`);
if (typeof FEEDBACK_URL !== 'string') errors.push('FEEDBACK_URL은 문자열이어야 해요(없으면 빈 문자열)');
else if (FEEDBACK_URL && !/^https:\/\/(docs\.google\.com\/forms|forms\.gle)\//.test(FEEDBACK_URL)) errors.push(`FEEDBACK_URL은 관리하는 Google 설문 주소(https)만 넣어요: ${FEEDBACK_URL}`);
// 만든 사람 표시: 공개 별칭과 https 블로그 주소 두 칸만(다른 개인 정보 칸은 두지 않아요)
{
  const SITE_AUTHOR = vm.runInContext('typeof SITE_AUTHOR === "undefined" ? undefined : SITE_AUTHOR', ctx);
  if (!SITE_AUTHOR || typeof SITE_AUTHOR !== 'object') errors.push('data/common.js에 SITE_AUTHOR가 없어요');
  else {
    const extra = Object.keys(SITE_AUTHOR).filter(k => !['name', 'blogUrl'].includes(k));
    if (extra.length) errors.push(`SITE_AUTHOR에는 name·blogUrl만 적어요: ${extra.join(', ')}`);
    if (typeof SITE_AUTHOR.name !== 'string' || !SITE_AUTHOR.name.trim()) errors.push('SITE_AUTHOR.name이 비어 있어요');
    if (!/^https:\/\/[^\s"'<>]+$/.test(SITE_AUTHOR.blogUrl || '')) errors.push(`SITE_AUTHOR.blogUrl은 https 주소여야 해요: ${SITE_AUTHOR.blogUrl}`);
  }
}
// 의견 양식 미리 채우기 칸: 정해진 다섯 칸만, 값은 비어 있거나 entry.숫자.
// 칸을 채우려면 양식 주소가 docs.google.com/forms/d/e/…/viewform 이어야 해요(forms.gle 짧은 주소는 미리 채우기가 안 돼요)
{
  const FB_KEYS = ['type', 'region', 'page', 'item', 'url'];
  if (!FEEDBACK_FIELDS || typeof FEEDBACK_FIELDS !== 'object') errors.push('data/common.js에 FEEDBACK_FIELDS가 없어요');
  else {
    const keys = Object.keys(FEEDBACK_FIELDS);
    keys.filter(k => !FB_KEYS.includes(k)).forEach(k => errors.push(`FEEDBACK_FIELDS: 알 수 없는 칸 ${k}`));
    FB_KEYS.filter(k => !keys.includes(k)).forEach(k => errors.push(`FEEDBACK_FIELDS: ${k} 칸이 없어요(쓰지 않으면 빈 문자열)`));
    const used = Object.values(FEEDBACK_FIELDS).filter(v => v !== '');
    used.filter(v => !/^entry\.\d+$/.test(String(v))).forEach(v => errors.push(`FEEDBACK_FIELDS: entry 번호 형식 오류 ${v}(예: entry.1234567890)`));
    if (new Set(used).size !== used.length) errors.push('FEEDBACK_FIELDS: 같은 entry 번호가 두 칸에 있어요');
    if (used.length && !FEEDBACK_URL) errors.push('FEEDBACK_FIELDS를 채웠다면 FEEDBACK_URL도 넣어야 해요');
    if (used.length && FEEDBACK_URL && !/^https:\/\/docs\.google\.com\/forms\/d\/e\/[\w-]+\/viewform/.test(FEEDBACK_URL)) errors.push('미리 채우기를 쓰려면 FEEDBACK_URL을 docs.google.com/forms/d/e/…/viewform 주소로 넣어요');
  }
}

// app.js의 공유 주소 함수를 브라우저 없이 불러와 ‘만들기 → 읽기’가 같은 화면을 가리키는지 확인해요
{
  const store = new Map();
  const loc = { origin: 'https://example.test', pathname: '/teacher-care/', search: '' };
  const noop = () => {};
  const appCtx = { ...ctx, console: { log: noop, warn: noop, error: (...a) => errors.push('app.js: ' + a.join(' ')) },
    location: loc, history: { state: null, pushState: noop, replaceState: noop }, URLSearchParams,
    localStorage: { getItem: k => (store.has(k) ? store.get(k) : null), setItem: (k, v) => store.set(k, String(v)), removeItem: k => store.delete(k) },
    document: { addEventListener: noop, getElementById: () => null, querySelector: () => null, querySelectorAll: () => [], body: { classList: { add: noop, remove: noop, contains: () => false } } },
    window: { addEventListener: noop, scrollTo: noop, scrollY: 0 }, setTimeout, clearTimeout };
  vm.createContext(appCtx);
  for (const f of scripts) vm.runInContext(fs.readFileSync(path.join(root, f), 'utf8'), appCtx, { filename: f });
  vm.runInContext(fs.readFileSync(path.join(root, 'app.js'), 'utf8'), appCtx, { filename: 'app.js' });
  const api = vm.runInContext('({ shareUrlOf, applySharedQuery, initialRegionId, urlRegion, COMMON_REGION, STORAGE_REGION })', appCtx);
  const base = () => ({ page: 'home', regionId: null, step: 0, benefit: null, compare: null, situ: null, supportType: 'all', onboarding: false });
  const states = [];
  for (const regionId of [...REGION_ORDER, null]) {
    PAGES.forEach(([page]) => states.push({ ...base(), regionId, page }));
    BENEFITS.forEach(b => states.push({ ...base(), regionId, page: 'care', benefit: b.id }));
    COMPARISONS.forEach(c => states.push({ ...base(), regionId, page: 'care', compare: c.id }));
    SITUS.forEach(x => states.push({ ...base(), regionId, page: 'guide', situ: 'situ:' + x.id }));
    SUPPORT_TYPES.forEach(t => states.push({ ...base(), regionId, page: 'support', supportType: t.id }));
    STEPS.forEach((_, i) => states.push({ ...base(), regionId, page: 'proc', step: i }));
  }
  let bad = 0;
  const KEYS = ['page', 'regionId', 'step', 'benefit', 'compare', 'situ', 'supportType'];
  for (const st of states) {
    const url = new URL(api.shareUrlOf(st, false));
    // 받는 사람은 다른 지역(첫 지역 또는 둘째 지역)을 저장해 둔 상태라고 가정해요
    store.clear();
    store.set(api.STORAGE_REGION, REGION_ORDER.find(x => x !== st.regionId));
    loc.search = url.search;
    const got = base();
    got.regionId = api.initialRegionId();
    if (got.regionId === null && api.urlRegion() === undefined) got.onboarding = true;
    api.applySharedQuery(got);
    const diff = KEYS.filter(k => got[k] !== st[k]);
    if (!url.searchParams.get('region')) { bad++; errors.push(`공유 주소에 region이 없어요: ${url.search}`); }
    else if (diff.length || got.onboarding) { bad++; if (bad <= 5) errors.push(`공유 주소 왕복 불일치(${diff.join(',') || 'onboarding'}): ${url.search}`); }
    // 받는 사람이 저장해 둔 지역은 바뀌지 않아요
    if (store.get(api.STORAGE_REGION) !== REGION_ORDER.find(x => x !== st.regionId)) { bad++; if (bad <= 5) errors.push(`공유 주소가 받는 사람의 저장 지역을 바꿨어요: ${url.search}`); }
  }
  // 잘못된 값은 무시(오류 없이 기본 화면)
  for (const q of ['?region=mars&page=care&benefit=special-leave', '?region=&page=nope', '?region=common&page=care&benefit=zzz&compare=yyy', '?page=proc&step=99', '?region=%3Cscript%3E']) {
    loc.search = q;
    store.clear();
    try { const g = base(); g.regionId = api.initialRegionId(); api.applySharedQuery(g); if (g.regionId && !REGIONS[g.regionId]) errors.push(`잘못된 region이 적용됐어요: ${q}`); if (g.benefit && !BENEFIT_IDS.has(g.benefit)) errors.push(`잘못된 benefit이 적용됐어요: ${q}`); if (g.step > STEPS.length - 1) errors.push(`잘못된 step이 적용됐어요: ${q}`); }
    catch (e) { errors.push(`잘못된 공유 주소에서 오류: ${q} — ${e.message}`); }
  }
  console.log(`공유 주소: 왕복 ${states.length}건(지역 ${REGION_ORDER.length} + 공통) · 불일치 ${bad}`);
}
// ══════════════ 14) 지역 gap 데이터 ══════════════
// tools/data/regional-gaps.js: 모든 지역 × 영역, 상태 값, complete가 아니면 todo, 근거(evidence)가 실제 지원 항목·지역 기준을 가리키는지
const { analyzeGaps } = require('./lib/gaps');
const gaps = analyzeGaps(require('./data/regional-gaps.js'), { REGIONS, REGION_ORDER, BENEFITS });
errors.push(...gaps.errors);
console.log(`지역 gap: ${Object.entries(gaps.counts).map(([k, n]) => `${k} ${n}`).join(' · ')} · 영역 밖 ${(gaps.extras || []).length}`);

// 배포 전 한눈에 보기
console.log(`요약: 메뉴 ${PAGES.length} · 상황 ${SITUS.length}/${EXPECTED_SITU_COUNT} · 그룹 ${SITU_GROUPS.length}/${EXPECTED_GROUP_COUNT} · 회복·보호 제도 ${BENEFITS.length} · 비교 ${COMPARISONS.length} · 상황 행동 ${Object.keys(SITU_ACTIONS).length} · 지원 유형 ${SUPPORT_TYPES.length} · 지역 ${REGION_ORDER.join('·')} · 공통 근거 ${COMMON_PUBLIC_SOURCES.length} · 오류 ${errors.length} · 주의 ${warnings.length}`);
warnings.forEach(w => console.log('주의: ' + w));
// --json=파일: 운영 리포트·check-all이 읽는 결과(오류·주의·요약)
const jsonArg = process.argv.slice(2).find(x => x.startsWith('--json='));
if (jsonArg) {
  fs.writeFileSync(path.resolve(jsonArg.slice(7)), JSON.stringify({
    checkedAt: TODAY, ok: !errors.length, errors, warnings,
    summary: { pages: PAGES.length, situs: SITUS.length, expectedSitus: EXPECTED_SITU_COUNT, groups: SITU_GROUPS.length, expectedGroups: EXPECTED_GROUP_COUNT, benefits: BENEFITS.length, comparisons: COMPARISONS.length, supportTypes: SUPPORT_TYPES.length, regions: REGION_ORDER.slice() }
  }, null, 2));
}
if (errors.length) {
  errors.forEach(e => console.log('오류: ' + e));
  process.exit(1);
}
console.log('데이터 점검 통과');
