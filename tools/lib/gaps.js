// 지역 gap 데이터(tools/data/regional-gaps.js) 점검·요약 — check-data.js와 운영 리포트가 함께 써요
'use strict';

const STATUS_ORDER = ['missing', 'unverified', 'partial', 'complete'];

// D: { REGIONS, REGION_ORDER, BENEFITS }. 반환 { errors, rows, open, counts }
//   rows  [{ region, area, label, status, note, todo, evidence }] (지역 순 × 영역 순)
//   open  complete가 아닌 행(영역 + extras), 우선순위: 부족 → 미확인 → 부분적
function analyzeGaps(G, D) {
  const errors = [];
  const rows = [];
  if (!G || !Array.isArray(G.areas) || !G.regions || !G.statuses) return { errors: ['tools/data/regional-gaps.js 구조 오류(areas·regions·statuses)'], rows, open: [], counts: {} };
  const statusIds = Object.keys(G.statuses);
  STATUS_ORDER.forEach(s => { if (!statusIds.includes(s)) errors.push(`regional-gaps: statuses에 ${s}가 없어요`); });
  const areaIds = new Set();
  G.areas.forEach(a => { if (!a.id || !a.label || areaIds.has(a.id)) errors.push(`regional-gaps: 영역 id 오류 ${a.id}`); areaIds.add(a.id); });
  const evidenceOk = (rid, ev) => {
    const R = D.REGIONS[rid];
    if (ev.startsWith('benefits:')) return !!(R.benefits && R.benefits[ev.slice(9)]);
    return R.programs.some(p => p.t === ev);
  };
  // optionalEvidence: 영역 밖 항목(extras)은 지원 항목이 아닌 화면(교육지원청 찾기 등)일 수 있어 근거 표시를 생략할 수 있어요
  const checkRow = (tag, rid, x, optionalEvidence) => {
    if (!statusIds.includes(x.status)) errors.push(`${tag}: 알 수 없는 status ${x.status}`);
    if (!x.note) errors.push(`${tag}: note가 없어요`);
    if (x.status !== 'complete' && !x.todo) errors.push(`${tag}: complete가 아니면 todo(다음에 확인할 일)가 필요해요`);
    (x.evidence || []).forEach(ev => { if (!evidenceOk(rid, ev)) errors.push(`${tag}: evidence가 실제 데이터에 없어요 — ${ev}`); });
    if (!optionalEvidence && x.status !== 'unverified' && !(x.evidence || []).length) errors.push(`${tag}: evidence가 없어요(공식자료 미확인이 아니면 근거 데이터를 적어요)`);
  };
  for (const rid of D.REGION_ORDER) {
    const reg = G.regions[rid];
    if (!reg) { errors.push(`regional-gaps: 지역 ${rid}가 없어요`); continue; }
    Object.keys(reg).filter(k => !areaIds.has(k)).forEach(k => errors.push(`regional-gaps.${rid}: 알 수 없는 영역 ${k}`));
    for (const a of G.areas) {
      const x = reg[a.id];
      if (!x) { errors.push(`regional-gaps.${rid}: 영역 ${a.label}(${a.id})이 없어요`); continue; }
      checkRow(`regional-gaps.${rid}.${a.id}`, rid, x);
      rows.push({ region: rid, area: a.id, label: a.label, status: x.status, note: x.note, todo: x.todo, evidence: x.evidence || [] });
    }
  }
  Object.keys(G.regions).filter(rid => !D.REGION_ORDER.includes(rid)).forEach(rid => errors.push(`regional-gaps: 등록되지 않은 지역 ${rid}`));
  const extras = (G.extras || []).map((x, i) => {
    if (!D.REGIONS[x.region]) errors.push(`regional-gaps.extras[${i}]: 지역 id 오류 ${x.region}`);
    else checkRow(`regional-gaps.extras[${i}]`, x.region, x, true);
    if (!x.label) errors.push(`regional-gaps.extras[${i}]: label이 없어요`);
    return { region: x.region, area: 'extra', label: x.label, status: x.status, note: x.note, todo: x.todo, evidence: x.evidence || [], extra: true };
  });
  const open = [...rows, ...extras].filter(x => x.status !== 'complete')
    .sort((a, b) => STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status) || D.REGION_ORDER.indexOf(a.region) - D.REGION_ORDER.indexOf(b.region));
  const counts = {};
  statusIds.forEach(s => { counts[s] = rows.filter(x => x.status === s).length; });
  return { errors, rows, extras, open, counts, openInAreas: rows.filter(x => x.status !== 'complete').length };
}

module.exports = { analyzeGaps, STATUS_ORDER };
