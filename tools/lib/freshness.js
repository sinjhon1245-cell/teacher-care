// 최신성 계산 — tools/check-data.js(검사)와 tools/generate-maintenance-report.js(운영 리포트)가 같은 규칙을 쓰도록 한곳에 둬요.
// 기준 일수는 data/common.js의 FRESHNESS_DAYS, 상태 값은 REVIEW_STATUSES를 그대로 읽어요(여기에 숫자를 적지 않아요).
//
// 결과
//   errors    날짜 형식 오류·미래 확인일·필수 필드 없음·알 수 없는 reviewStatus(→ 검사 실패)
//   warnings  오래된 확인일·지난 재확인일·확인 뒤 개정된 근거·review-needed 항목(→ ‘주의’)
//   dates     확인일 기록 { group, tag, label, field, date, kind, limit, until, age, stale, what }
//   reviews   재확인일 기록 { group, tag, label, field, date, days, passed }
//   flags     verified가 아닌 항목 { group, tag, label, status }

'use strict';

const ISO = /^\d{4}-\d{2}-\d{2}$/;
const DATE_KEYS = ['verifiedAt', 'sourceUpdatedAt', 'contactsVerifiedAt', 'areasVerifiedAt', 'reviewBy', 'areasReviewBy'];
const DAY = 86400000;

// 한국 시간 기준 오늘(YYYY-MM-DD)
const kstToday = () => new Date(Date.now() + 9 * 3600 * 1000).toISOString().slice(0, 10);
const isRealDate = d => typeof d === 'string' && ISO.test(d) && new Date(d + 'T00:00:00Z').toISOString().slice(0, 10) === d;
const addDays = (d, n) => new Date(Date.parse(d + 'T00:00:00Z') + n * DAY).toISOString().slice(0, 10);
// b - a (일)
const daysBetween = (a, b) => Math.floor((Date.parse(b + 'T00:00:00Z') - Date.parse(a + 'T00:00:00Z')) / DAY);

// 지원 항목에서 특히 자주 바뀌는 정보(주의 문구에 함께 적어 먼저 확인하게 해요)
function volatileParts(p) {
  const text = [p.sum, p.amount, p.eligibility, p.timing].filter(Boolean).join(' ');
  const parts = [];
  if (p.amount) parts.push('금액');
  if (/\d+\s*회(기)?/.test(text) && /상담/.test(text + p.t)) parts.push('상담 횟수');
  if (/경호/.test(p.t + text) && /\d+\s*일/.test(text)) parts.push('경호 기간');
  if (p.contact || p.contacts) parts.push('전화번호');
  if ((p.channels || []).length) parts.push('신청 URL');
  parts.push('프로그램명');
  return parts;
}

// 오래된 항목은 자주 바뀌는 정보가 있는 것부터 보여 줘요
const PRIORITY = ['금액', '상담 횟수', '경호 기간', '전화번호', '신청 URL', '교육지원청 관할', '프로그램명'];
const rankOf = what => Math.min(...(what || []).map(w => PRIORITY.indexOf(w)).filter(n => n >= 0), 99);

// D: { COMMON_PUBLIC_SOURCES, VALIDATION_SOURCES, BENEFITS, REGIONS, REGION_ORDER, REVIEW_STATUSES, FRESHNESS_DAYS }
function analyzeFreshness(D, today = kstToday()) {
  const out = { today, items: 0, errors: [], warnings: [], dates: [], reviews: [], flags: [], next: null };
  const { REVIEW_STATUSES, FRESHNESS_DAYS } = D;
  if (!isRealDate(today)) out.errors.push(`CHECK_TODAY 형식 오류: ${today}`);
  if (!REVIEW_STATUSES || !FRESHNESS_DAYS || !(FRESHNESS_DAYS.stable > 0) || !(FRESHNESS_DAYS.volatile > 0)) {
    out.errors.push('common.js에 REVIEW_STATUSES·FRESHNESS_DAYS가 없어요');
    return out;
  }
  const staleWarnings = [];

  // groups: 필드별 묶음 이름(연락처·관할은 지역 안내 전체와 따로 봐요)
  function check(spec) {
    const { tag, label, item, kind, need = [], parts, groups } = spec;
    out.items++;
    need.forEach(k => { if (item[k] === undefined) out.errors.push(`${tag}: ${k}가 없어요`); });
    for (const k of DATE_KEYS) {
      const d = item[k];
      if (d === undefined) continue;
      if (!isRealDate(d)) { out.errors.push(`${tag}: ${k} 날짜 형식 오류(YYYY-MM-DD, 실제 날짜): ${d}`); continue; }
      const review = k === 'reviewBy' || k === 'areasReviewBy';
      if (!review && d > today) out.errors.push(`${tag}: ${k}가 미래 날짜예요(${d} > 오늘 ${today})`);
      if (review) {
        const days = daysBetween(today, d);
        out.reviews.push({ group: groups[k] || groups.verifiedAt, tag, label, field: k, date: d, days, passed: d <= today });
        if (d <= today) out.warnings.push(`[최신성] ${tag}: 재확인일(${k} ${d})이 지났어요 — 새 자료로 다시 확인하고 날짜를 고치세요`);
      }
    }
    if (isRealDate(item.sourceUpdatedAt) && isRealDate(item.verifiedAt) && item.sourceUpdatedAt > item.verifiedAt) {
      out.warnings.push(`[최신성] ${tag}: 공식 자료 날짜(${item.sourceUpdatedAt})가 확인일(${item.verifiedAt})보다 늦어요 — 바뀐 자료로 다시 확인하세요`);
    }
    if (item.reviewStatus !== undefined && !REVIEW_STATUSES.includes(item.reviewStatus)) out.errors.push(`${tag}: 알 수 없는 reviewStatus ${item.reviewStatus}`);
    if (item.reviewStatus && item.reviewStatus !== 'verified') {
      out.flags.push({ group: groups.verifiedAt, tag, label, status: item.reviewStatus });
      out.warnings.push(`[최신성] ${tag}: reviewStatus=${item.reviewStatus} — 공식 자료로 다시 확인이 필요해요`);
    }
    // 오래된 확인일: 내용(verifiedAt)·연락처(contactsVerifiedAt)·관할(areasVerifiedAt)을 따로 봐요
    const limit = FRESHNESS_DAYS[kind];
    [['verifiedAt', parts || ['공식 자료 내용·링크']], ['contactsVerifiedAt', ['전화번호']], ['areasVerifiedAt', ['교육지원청 관할']]].forEach(([k, what]) => {
      const d = item[k];
      if (!isRealDate(d)) return;
      const until = addDays(d, limit);
      const age = daysBetween(d, today);
      const stale = age > limit;
      out.dates.push({ group: groups[k] || groups.verifiedAt, tag, label, field: k, date: d, kind, limit, until, age, stale, what });
      if (stale) staleWarnings.push({ tag, k, d, what, limit, age });
      else if (!out.next || until < out.next.until) out.next = { until, tag: `${tag} ${k}` };
    });
  }

  const common = { verifiedAt: 'common-sources' };
  D.COMMON_PUBLIC_SOURCES.forEach(src => check({ tag: `COMMON_PUBLIC_SOURCES.${src.id}`, label: `공통 근거: ${src.title}`, item: src, kind: 'stable', need: ['verifiedAt'], groups: common }));
  (D.VALIDATION_SOURCES || []).forEach((src, i) => check({ tag: `VALIDATION_SOURCES[${i}]`, label: `교차 확인 자료: ${src.title}`, item: src, kind: 'stable', need: ['verifiedAt'], groups: common }));
  D.BENEFITS.forEach(b => {
    const tag = `BENEFITS.${b.id}`;
    check({ tag, label: `회복·보호 ${b.t}`, item: b, kind: 'stable', need: ['verifiedAt', 'reviewStatus'], parts: ['제도 기준'], groups: { verifiedAt: 'common-benefits' } });
    // sourceUpdatedAt = 근거(refs) 중 가장 최근 시행·개정일. 근거 쪽 날짜를 고치면 여기도 맞춰야 해요
    const latest = b.refs.map(id => (D.COMMON_PUBLIC_SOURCES.find(x => x.id === id) || {}).sourceUpdatedAt).filter(Boolean).sort().pop();
    if ((latest || undefined) !== b.sourceUpdatedAt) out.warnings.push(`[최신성] ${tag}: sourceUpdatedAt(${b.sourceUpdatedAt || '없음'})이 근거의 가장 최근 시행일(${latest || '없음'})과 달라요 — 바뀐 근거로 다시 확인하세요`);
  });
  for (const id of D.REGION_ORDER) {
    const r = D.REGIONS[id];
    const name = r.short || id;
    check({ tag: `[${id}]`, label: `${name} 지역 안내 전체`, item: r, kind: 'volatile', need: ['verifiedAt', 'reviewStatus', 'contactsVerifiedAt', 'areasVerifiedAt'], parts: ['지역 안내 전체'],
      groups: { verifiedAt: `region:${id}`, reviewBy: `region:${id}`, contactsVerifiedAt: `contacts:${id}`, areasVerifiedAt: `areas:${id}`, areasReviewBy: `areas:${id}` } });
    r.sources.forEach((src, i) => check({ tag: `[${id}] sources[${i}]`, label: `${name} 출처: ${src.title}`, item: src, kind: 'volatile', need: ['verifiedAt'], groups: { verifiedAt: `sources:${id}` } }));
    r.programs.forEach((p, i) => {
      const tag = `[${id}] programs[${i}] ${p.t}`;
      check({ tag, label: `${name} ${p.t}`, item: p, kind: 'volatile', need: ['verifiedAt', 'reviewStatus'], parts: volatileParts(p), groups: { verifiedAt: `programs:${id}` } });
      // 근거 자료가 이 항목을 확인한 뒤에 바뀌었으면(게시·시행일이 더 늦으면) 다시 확인
      [].concat(p.source === undefined ? [] : p.source).map(n => r.sources[n]).filter(Boolean).forEach(src => {
        if (src.sourceUpdatedAt && p.verifiedAt && src.sourceUpdatedAt > p.verifiedAt) out.warnings.push(`[최신성] ${tag}: 근거 자료(${src.title.slice(0, 30)}…)가 확인 뒤(${src.sourceUpdatedAt})에 바뀌었어요`);
        if (src.reviewStatus === 'source-unavailable' && p.reviewStatus === 'verified') out.warnings.push(`[최신성] ${tag}: 근거 원문이 사라졌어요(source-unavailable) — 항목 reviewStatus도 확인하세요`);
      });
    });
    Object.entries(r.benefits || {}).forEach(([bid, d]) => {
      const b = D.BENEFITS.find(x => x.id === bid);
      check({ tag: `[${id}] benefits.${bid}`, label: `${name} ${b ? b.t : bid} 지역 기준`, item: d, kind: 'volatile', need: ['verifiedAt'], parts: ['지역 기준'], groups: { verifiedAt: `benefits:${id}` } });
    });
  }
  staleWarnings.sort((a, b) => rankOf(a.what) - rankOf(b.what) || a.d.localeCompare(b.d)).forEach(x => {
    out.warnings.push(`[최신성] ${x.tag}: ${x.k} ${x.d} (${x.age}일 지남 · 기준 ${x.limit}일) — 다시 확인할 것: ${x.what.join('·')}`);
  });
  out.stale = out.dates.filter(x => x.stale);
  out.due = out.reviews.filter(x => x.passed);
  return out;
}

module.exports = { analyzeFreshness, volatileParts, rankOf, kstToday, isRealDate, addDays, daysBetween, DATE_KEYS, ISO };
