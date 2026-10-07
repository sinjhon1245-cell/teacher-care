// 선생님 곁에 — 교육활동 보호·대응 가이드
// 화면 렌더링 및 상태 관리 (바닐라 JS, 빌드 도구 없이 동작)
// 지역별 내용은 data/regions/*.js 에서만 가져와요. 이 파일에는 특정 시·도 이름이나 번호를 두지 않아요.
// 화면 역할: 홈 = 어디부터 · 대응 절차 = 지금 할 일(체크) · 상황별 도움 = 어떤 경우 · 회복·보호 = 내가 쓸 제도 · 지원 찾기 = 어디서 도움

const STORAGE_REGION = 'teacher-care-region';
// 공유 주소에서 ‘공통(지역 미선택)’을 뜻하는 region 값. 시·도 id로 쓰지 않아요
const COMMON_REGION = 'common';
const STORAGE_CHECKS = 'teacher-care-procedure-checks-v1'; // { '단계번호.항목id': true }
// 회복·보호 ‘지금 확인해 볼 일’과 상황별 ‘지금 해볼 일’의 체크(이 기기에만). { 'benefit:제도id.항목id': true, 'situ:상황id.항목id': true }
const STORAGE_ACTIONS = 'teacher-care-action-checks-v1';
// 예전 체크리스트 키. 삭제된 목록의 순번으로 저장돼 새 항목과 맞지 않아 옮기지 않고 지워요
const LEGACY_CHECK_KEYS = ['teacher-care-checks', 'icn-gyeote-checks'];
// 업데이트 알림(data/updates.js): 마지막으로 연 업데이트 내역의 최신 id / 닫은 상단 안내바의 업데이트 id만 저장해요(개인 정보·서버 전송 없음)
const STORAGE_UPDATE_SEEN = 'teacher-care-update-seen';
const STORAGE_UPDATE_BANNER = 'teacher-care-update-banner-closed';

const App = {
  state: {
    page: 'home',
    regionId: null,     // 선택한 시·도 id(REGIONS의 key). 없으면 전국 공통 안내만 보여요
    area: '',           // '내 교육지원청 찾기'에서 고른 시·군·구
    quick: null,        // 홈에서 펼친 상황
    step: 0,            // 대응 절차에서 선택한 단계
    situ: null,         // 상황별 도움에서 펼친 항목('group:' + 그룹 id 또는 'situ:' + 상황 id)
    filters: {},        // 상세 조건 { 그룹명: [선택값] }
    query: '',          // 상황별 도움 검색어(현재 세션에서만 유지)
    filterOpen: null,   // 상세 조건 영역을 연 상태(null이면 데스크톱은 펼침, 모바일은 접힘)
    supportType: 'all', // 지원 찾기에서 고른 도움 유형('related'는 상황별 도움에서 넘어온 관련 지원 묶음)
    related: null,      // { situId: 상황 stable id, ids: [지원 유형 id] }
    faqOpen: null,
    benefit: null,      // 회복·보호에서 펼친 제도 id(BENEFITS[].id)
    compare: null,      // 회복·보호에서 연 비교표 id(COMPARISONS[].id)
    checks: {},
    actionChecks: {},   // 행동 체크(STORAGE_ACTIONS)
    onboarding: false   // 첫 방문(저장된 지역·주소의 region 모두 없음)이면 지역 선택 첫 화면을 보여요
  },

  init() {
    this.state.regionId = initialRegionId();
    // 지역 선택 첫 화면은 저장된 지역도 없고 주소에도 region이 없을 때만(region=common이면 공통 화면으로 바로 가요)
    this.state.onboarding = !this.state.regionId && urlRegion() === undefined;
    this.state.checks = loadChecks();
    this.state.actionChecks = loadActionChecks();
    // 공유 주소: ?page=care&benefit=… 처럼 화면이 정해져 있으면 지역 선택 첫 화면 없이 그 화면으로 바로 가요(잘못된 값은 무시)
    const linked = applySharedQuery(this.state);
    if (linked) this.state.onboarding = false;
    this.render();
    // 최초 진입: 지금 화면을 기록만 하고(replace) 새 항목은 만들지 않아요. 스크롤은 우리가 직접 맞춰요
    try { if ('scrollRestoration' in history) history.scrollRestoration = 'manual'; } catch (e) { /* 무시 */ }
    this.recordHistory('replace');
    if (linked) this.scrollToTarget();
  },

  // 첫 화면에서 지역을 고르면 기존 저장 방식(setRegion) 그대로 저장하고 바로 홈으로 가요
  chooseRegion(id) {
    this.state.onboarding = false;
    this.state.page = 'home';
    this.setRegion(id, true);
    window.scrollTo(0, 0);
  },

  // 지역 없이 공통 대응부터 보기. ‘미선택’은 저장하지 않아 다음 새 방문에는 다시 지역 선택 화면이 나와요
  skipOnboarding() {
    this.nav('home', { onboarding: false });
  },

  // 현재 선택된 지역 데이터(없으면 null)
  get R() { return REGIONS[this.state.regionId] || null; },

  // 지역 변경은 기록을 하나 쌓아요(뒤로가기로 이전 지역으로 돌아가요). 지역은 localStorage에도 저장하고, 주소의 region도 바꿔요
  setRegion(id, replace) {
    const next = REGIONS[id] ? id : null;
    if (next === this.state.regionId) return;
    storeSet(STORAGE_REGION, next);
    this._navigating = true;
    this.setState({ regionId: next, area: '', supportType: 'all', related: null });
    this._navigating = false;
    if (!this._restoring) this.recordHistory(replace ? 'replace' : 'push');
    if (next) this.showToast(REGIONS[next].name + ' 기준으로 안내해요');
  },

  setState(patch) {
    Object.assign(this.state, patch);
    this.render();
  },

  // 메뉴 이동. 다른 메뉴로 가면 브라우저 기록을 하나 쌓고(push), 같은 메뉴 안의 이동은 현재 기록만 바꿔요(replace).
  // 뒤로가기로 복원하는 중(_restoring)에는 기록을 건드리지 않아 기록이 꼬이지 않아요
  nav(page, patch) {
    const changed = page !== this.state.page;
    if (changed) this.saveScroll();
    this._navigating = true; // 다시 그리는 동안 주소 동기화(syncUrl)가 현재 기록을 덮어쓰지 않게
    this.setState({ page, ...patch });
    this._navigating = false;
    window.scrollTo(0, 0);
    if (!this._restoring) this.recordHistory(changed ? 'push' : 'replace');
  },

  // ── 브라우저 뒤로가기·앞으로가기(History API) + 공유 주소 ──
  // 주소(URL) = 공유할 수 있는 핵심 상태만: ?region=&page=&benefit=|situ=|type=|step=|compare= (경로 라우팅 없음 → 새로고침해도 404 없음)
  // 기록(history.state) = 탐색 중 세부 상태(관련 지원 묶음, 스크롤 위치 등). 검색어·체크·스크롤은 주소에 넣지 않아요
  historyState() {
    const S = this.state;
    return { tc: 1, page: S.page, region: S.regionId, step: S.step, benefit: S.benefit, situ: S.situ, compare: S.compare, supportType: S.supportType, related: S.related, scrollY: 0 };
  },

  recordHistory(mode) {
    try {
      const url = shareUrlOf(this.state, true);
      if (mode === 'push') history.pushState(this.historyState(), '', url);
      else history.replaceState({ ...this.historyState(), scrollY: (history.state && history.state.scrollY) || 0 }, '', url);
    } catch (e) { /* 기록을 못 남겨도 화면 이동은 그대로 돼요 */ }
  },

  // 같은 메뉴 안에서 바뀐 공유 상태(제도 펼침·지원 유형 등)는 새 기록 없이 주소만 맞춰요
  syncUrl() {
    if (this._navigating || this._restoring || !(history.state && history.state.tc)) return;
    const url = shareUrlOf(this.state, true);
    if (url === location.pathname + location.search) return;
    try { history.replaceState({ ...this.historyState(), scrollY: history.state.scrollY || 0 }, '', url); } catch (e) { /* 무시 */ }
  },

  // 공유 주소로 들어왔을 때 그 항목이 보이게
  scrollToTarget() {
    const S = this.state;
    const id = S.page === 'care' && S.compare ? 'compare'
      : S.page === 'care' && S.benefit ? 'bf-' + S.benefit
      : S.page === 'guide' && S.situ && S.situ.startsWith('situ:') ? 'situ-' + S.situ.slice(5)
      : S.page === 'support' && S.supportType !== 'all' ? 'support-results' : null;
    const el = id && document.getElementById(id);
    if (el) el.scrollIntoView({ block: 'start' });
  },

  // 다른 메뉴로 떠나기 전에 지금 위치를 현재 기록에 남겨 두면, 돌아왔을 때 그 자리로 가요
  saveScroll() {
    try {
      if (history.state && history.state.tc) history.replaceState({ ...history.state, scrollY: window.scrollY }, '');
    } catch (e) { /* 무시 */ }
  },

  restoreHistory(st) {
    if (!st || !st.tc) return; // 우리 기록이 아니면(본문 바로가기 #main 등) 그대로 둬요
    const page = PAGES.some(([id]) => id === st.page) ? st.page : 'home';
    const step = Number.isInteger(st.step) && st.step >= 0 && st.step < STEPS.length ? st.step : 0;
    this._restoring = true;
    // 지역도 그 기록의 지역으로 돌려요(저장된 지역도 함께). 지역 기록이 없던 예전 항목은 지금 지역을 그대로 둬요
    const patch = {};
    if (st.region !== undefined) {
      const region = REGIONS[st.region] ? st.region : null;
      if (region !== this.state.regionId) { storeSet(STORAGE_REGION, region); patch.regionId = region; patch.area = ''; }
    }
    this.setState({
      ...patch, page, step, onboarding: false,
      benefit: st.benefit && benefitById(st.benefit) ? st.benefit : null,
      situ: typeof st.situ === 'string' ? st.situ : null,
      compare: st.compare && COMPARISONS.some(c => c.id === st.compare) ? st.compare : null,
      supportType: typeof st.supportType === 'string' ? st.supportType : 'all',
      related: st.related || null
    });
    this._restoring = false;
    window.scrollTo(0, st.scrollY || 0);
  },

  toggle(key, value) {
    this.setState({ [key]: this.state[key] === value ? null : value });
  },

  // 회복·보호의 제도 하나를 펼쳐서 보여 줘요(홈·상황별 도움·대응 절차·지원 찾기에서 들어와요)
  openBenefit(id) {
    if (!benefitById(id)) return;
    this.nav('care', { benefit: id });
    // render()는 동기라 바로 찾을 수 있어요. 화면이 바뀐 직후라 부드러운 스크롤 대신 바로 이동해요
    const el = document.getElementById('bf-' + id);
    if (el) el.scrollIntoView({ block: 'start' });
  },

  // 회복·보호 맨 위 ‘회복에 시간이 더 필요하다면’
  openRecovery() {
    this.nav('care', { benefit: null });
    const el = document.getElementById('recovery');
    if (el) el.scrollIntoView({ block: 'start' });
  },

  // 지원 찾기의 한 유형으로(지역을 고르지 않았으면 지원 찾기의 지역 선택 화면이 보여요)
  openSupport(typeId) {
    this.nav('support', { supportType: typeId || 'all', related: null });
  },

  // ── 지원 찾기 검색: 현재 유형 안의 카드만 거르고, 입력창은 다시 그리지 않아요(한글 조합 보호) ──
  filterSupport(value) {
    this._supQuery = String(value || '');
    const terms = guideSearchTerms(this._supQuery);
    let shown = 0;
    document.querySelectorAll('[data-sp]').forEach(el => {
      const hit = !terms.length || terms.every(t => normalizeGuideSearch(el.dataset.sp).includes(t));
      el.hidden = !hit;
      if (hit) shown++;
    });
    const count = document.getElementById('sup-count');
    if (count) count.textContent = terms.length ? `지원 ${shown}건을 찾았어요` : '';
    const empty = document.getElementById('sup-empty');
    if (empty) empty.hidden = shown > 0;
    const clear = document.getElementById('sup-search-clear');
    if (clear) clear.hidden = !terms.length;
  },

  clearSupportSearch() {
    const el = document.getElementById('sup-search');
    if (el) {
      el.value = '';
      el.focus({ preventScroll: true });
    }
    this.filterSupport('');
  },

  // ── 회복·보호 제도 검색 ──
  // 입력창은 다시 그리지 않고 카드 표시만 바꿔요(한글 조합 중 자모가 흩어지지 않게). 검색어는 이 세션에서만 기억해요
  onCareInput(e) {
    this.filterCare(e.target.value);
  },

  filterCare(value) {
    this._careQuery = String(value || '');
    const terms = guideSearchTerms(this._careQuery);
    let shown = 0;
    document.querySelectorAll('[data-bf]').forEach(el => {
      const hit = !terms.length || matchesBenefit(benefitById(el.dataset.bf), terms);
      el.hidden = !hit;
      if (hit) shown++;
    });
    document.querySelectorAll('.care-cat').forEach(sec => { sec.hidden = !sec.querySelector('[data-bf]:not([hidden])'); });
    const count = document.getElementById('care-count');
    if (count) count.textContent = terms.length ? `제도 ${shown}개를 찾았어요` : '';
    const empty = document.getElementById('care-empty');
    if (empty) empty.hidden = shown > 0;
    const clear = document.getElementById('care-search-clear');
    if (clear) clear.hidden = !terms.length;
  },

  clearCareSearch() {
    const el = document.getElementById('care-search');
    if (el) {
      el.value = '';
      el.focus({ preventScroll: true });
    }
    this.filterCare('');
  },

  // 상황 검색어가 제도 이름일 때: 회복·보호의 제도 검색으로 옮겨요(두 검색의 결과는 섞지 않아요)
  searchCare(query) {
    this._careQuery = String(query || '');
    this.nav('care', { benefit: null });
    const el = document.getElementById('care-search');
    if (el) el.scrollIntoView({ block: 'center' });
  },

  // 홈의 특정 영역으로 이동(다른 화면이면 홈으로 먼저 이동)
  goHome(id) {
    if (this.state.page !== 'home') this.nav('home');
    requestAnimationFrame(() => {
      const el = document.getElementById(id);
      if (!el) return;
      el.scrollIntoView({ behavior: 'smooth' });
      const focusable = el.querySelector('select, button');
      if (focusable) focusable.focus({ preventScroll: true });
    });
  },

  // ── 대응 절차 체크 ──
  toggleCheck(step, id) {
    const key = step + '.' + id;
    const checks = { ...this.state.checks };
    if (checks[key]) delete checks[key]; else checks[key] = true;
    storeSet(STORAGE_CHECKS, JSON.stringify(checks));
    this.setState({ checks });
  },

  resetChecks(step) {
    const checks = { ...this.state.checks };
    Object.keys(checks).filter(k => k.startsWith(step + '.')).forEach(k => delete checks[k]);
    storeSet(STORAGE_CHECKS, Object.keys(checks).length ? JSON.stringify(checks) : null);
    this.setState({ checks });
  },

  progress(step) {
    const items = STEP_DETAIL[step].checks;
    return { done: items.filter(c => this.state.checks[step + '.' + c.id]).length, total: items.length };
  },

  // ── 상황별 도움 상세 조건 ──
  toggleFilter(group, opt) {
    const f = { ...this.state.filters };
    const set = new Set(f[group] || []);
    set.has(opt) ? set.delete(opt) : set.add(opt);
    if (set.size) f[group] = [...set]; else delete f[group];
    this.setState({ filters: f, situ: null });
  },

  clearFilters() { this.setState({ filters: {}, situ: null }); },

  // ── 상황별 도움 검색 ──
  // 입력창은 다시 그리지 않아요. 한글은 조합 중인 <input>이 바뀌면 자모가 흩어지므로
  // 검색어가 바뀌면 필터 개수와 결과 영역만 새로 그려요(refreshGuideResults).
  onGuideInput(e) {
    if (e.isComposing || this._guideComposing) this.previewGuideQuery(e.target.value);
    else this.setGuideQuery(e.target.value);
  },

  guideCompositionStart() { this._guideComposing = true; },

  guideCompositionEnd(e) {
    this._guideComposing = false;
    this.setGuideQuery(e.target.value);
  },

  // 조합 중인 글자(예: '담임'을 치는 중의 '담이')는 결과가 있을 때만 미리 보여 주고,
  // 0건이면 이전 결과를 그대로 둬요. 조합이 끝나면(compositionend) 확정된 검색어로 다시 그려요.
  previewGuideQuery(value) {
    if (!this.guideMatches(value).length) return;
    this.setGuideQuery(value);
  },

  setGuideQuery(value) {
    const query = String(value || '');
    if (query === this.state.query) return;
    this.state.query = query;
    this.state.situ = null;
    this.refreshGuideResults();
  },

  clearGuideSearch() {
    const el = document.getElementById('guide-search');
    if (el) {
      el.value = '';
      el.focus({ preventScroll: true });
    }
    this._guideComposing = false;
    this.setGuideQuery('');
  },

  // 검색창은 그대로 두고 필터 개수·결과·지우기 버튼만 갱신해요. 화면 구조가 다르면 전체를 다시 그려요.
  refreshGuideResults() {
    const rows = document.getElementById('guide-filter-rows');
    const results = document.getElementById('guide-results');
    const clear = document.getElementById('guide-search-clear');
    if (this.state.page !== 'guide' || !rows || !results || !clear) {
      this.render();
      return;
    }
    rows.innerHTML = T(this.guideFilterRowsHtml());
    results.innerHTML = T(this.guideResultsHtml());
    clear.hidden = guideSearchTerms(this.state.query).length === 0;
  },

  clearGuideTools() {
    this.setState({ query: '', filters: {}, situ: null });
  },

  showToast(msg) {
    const el = document.getElementById('toast');
    if (!el) return;
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => el.classList.remove('show'), 1600);
  },

  render() {
    const S = this.state;
    const R = this.R;
    document.body.classList.toggle('is-landing', S.onboarding);
    if (S.onboarding) {
      document.getElementById('app').innerHTML = this.renderLanding();
      return;
    }
    // 공통 데이터의 {HOT}·{LEGAL} 등 지역 토큰을 현재 지역 값(미선택 시 중립 문구)으로 치환
    document.getElementById('app').innerHTML = T(`
      <a class="skip-link" href="#main">본문 바로가기</a>
      ${this.renderHeader()}
      ${UpdateUI.strip()}
      <main id="main">
        <div class="print-head" id="print-head"></div>
        ${S.page === 'home' ? this.renderHome() : ''}
        ${S.page === 'proc' ? this.renderProc() : ''}
        ${S.page === 'guide' ? this.renderGuide() : ''}
        ${S.page === 'care' ? this.renderCare() : ''}
        ${S.page === 'support' ? this.renderSupport() : ''}
      </main>
      ${this.renderFooter()}
      ${this.renderBottomNav()}
      <div id="toast" class="toast" role="status" aria-live="polite"></div>
    `);
    // 회복·보호 검색어가 있으면 다시 그린 뒤에도 같은 결과를 보여 줘요
    if (S.page === 'care' && this._careQuery) this.filterCare(this._careQuery);
    if (S.page === 'support' && this._supQuery) this.filterSupport(this._supQuery);
    this.syncUrl();
    // 체크박스를 누른 뒤 다시 그려도 키보드 포커스가 그 자리에 남게
    if (this._focusId) {
      const el = document.getElementById(this._focusId);
      if (el) el.focus({ preventScroll: true });
      this._focusId = null;
    }
  },

  // 비교표를 열면 아래에 펼쳐 둔 제도는 접어요(주소가 지금 보는 비교표를 가리키게)
  toggleCompare(id) {
    const on = this.state.compare !== id;
    this.setState({ compare: on ? id : null, benefit: on ? null : this.state.benefit });
  },

  // ── 행동 체크(이 기기에만, 체크 여부만 저장) ──
  toggleAction(key, inputId) {
    const checks = { ...this.state.actionChecks };
    if (checks[key]) delete checks[key]; else checks[key] = true;
    storeSet(STORAGE_ACTIONS, Object.keys(checks).length ? JSON.stringify(checks) : null);
    this._focusId = inputId;
    this.setState({ actionChecks: checks });
  },

  actionList(scope, ownerId, items, title) {
    if (!items || !items.length) return '';
    const rows = items.map(a => {
      const key = `${scope}:${ownerId}.${a.id}`;
      const inputId = `act-${scope}-${ownerId}-${a.id}`;
      const done = !!this.state.actionChecks[key];
      return `<li><label class="check ${done ? 'done' : ''}" for="${inputId}"><input type="checkbox" id="${inputId}" ${done ? 'checked' : ''} onchange="App.toggleAction('${key}', '${inputId}')"><span>${a.t}</span></label></li>`;
    }).join('');
    const n = items.filter(a => this.state.actionChecks[`${scope}:${ownerId}.${a.id}`]).length;
    return `
      <div class="act-box act-${scope}">
        <p class="act-title">${title} <span class="muted small">${n}/${items.length}</span></p>
        <ul class="check-list act-list">${rows}</ul>
        <p class="muted small">스스로 확인해 볼 항목이에요(제출 서류 목록이 아니에요). 체크는 이 기기에만 저장되고 서버로 보내지 않아요.</p>
      </div>
    `;
  },

  // ── 링크 복사·인쇄 ──
  // 상세 하단의 작은 도구 묶음. url은 공유 주소(지역·화면·항목만, 개인 체크는 넣지 않아요)
  // withFeedback: 상황·제도·지원 유형 상세에만 한 줄짜리 의견 링크를 붙여요(의견 양식 주소가 있을 때만)
  shareTools(state, label, withFeedback) {
    const url = shareUrlOf(state, false);
    return `
      <div class="share-row">
        <button type="button" class="tool-btn" data-url="${escapeAttr(url)}" onclick="App.copyLink(this.dataset.url)" aria-label="${escapeAttr(label)} 링크 복사"><span aria-hidden="true">🔗</span> 링크 복사</button>
        <button type="button" class="tool-btn" data-title="${escapeAttr(label)}" onclick="App.printTarget(this)" aria-label="${escapeAttr(label)} 인쇄하기"><span aria-hidden="true">🖨</span> 인쇄하기</button>
      </div>
      ${withFeedback ? feedbackLine(state, label) : ''}
    `;
  },

  async copyLink(url) {
    try {
      await navigator.clipboard.writeText(url);
      this.showToast('링크를 복사했어요.');
    } catch (e) {
      if (copyWithSelection(url)) this.showToast('링크를 복사했어요.');
      else window.prompt('아래 링크를 길게 눌러 복사하세요.', url);
    }
  },

  // 이 내용만 인쇄: 버튼이 속한 상세([data-print])만 남기고 형제 영역은 인쇄에서 숨겨요. 상세 안의 접힌 근거도 펼쳐서 인쇄해요
  printTarget(btn) {
    const target = btn.closest('[data-print]');
    if (!target) { window.print(); return; }
    preparePrint(target, btn.dataset.title);
    window.print();
  },

  // ══════════════ 공통 부품 ══════════════
  // 헤더 지역 선택: 기본 select 대신 사이트 디자인에 맞춘 listbox(동작은 RegionMenu, 변경은 App.setRegion)
  renderRegionSelect() {
    const cur = this.state.regionId;
    const opts = REGION_ORDER.map(id => `
      <li id="region-opt-${id}" class="region-dd-opt" role="option" aria-selected="${cur === id}" aria-label="${REGIONS[id].short}" data-id="${id}"
        onclick="RegionMenu.pick('${id}')" onmousemove="RegionMenu.focusOpt('${id}')">
        <span>${REGIONS[id].short}</span><span class="region-dd-check" aria-hidden="true">✓</span>
      </li>
    `).join('');
    return `
      <div class="region-dd ${cur ? '' : 'empty'}" id="region-dd">
        <button type="button" class="region-dd-btn" id="region-dd-btn" aria-haspopup="listbox" aria-expanded="false"
          aria-controls="region-dd-list" aria-label="근무 지역: ${cur ? REGIONS[cur].short : '선택 안 함'}"
          onclick="RegionMenu.toggle()" onkeydown="RegionMenu.buttonKey(event)">
          <span>${cur ? REGIONS[cur].short : '지역 선택'}</span><span class="region-dd-caret" aria-hidden="true"></span>
        </button>
        <ul class="region-dd-list" id="region-dd-list" role="listbox" aria-label="근무 지역" tabindex="-1" hidden
          onkeydown="RegionMenu.listKey(event)">${opts}</ul>
      </div>
    `;
  },

  // 지역이 아직 없을 때 보여 주는 선택 버튼
  renderRegionPicker(title) {
    const btns = REGION_ORDER.map(id =>
      `<button class="region-pick" onclick="App.setRegion('${id}')">${REGIONS[id].short}</button>`
    ).join('');
    return `
      <div class="region-picker" id="region-picker">
        <p class="region-picker-title">${title}</p>
        <div class="region-pick-row">${btns}</div>
      </div>
    `;
  },

  callButton(cls) {
    return this.R
      ? `<a href="{TEL}" class="btn ${cls || 'btn-primary'}"><span aria-hidden="true">☎</span> {HOT}</a>`
      : '';
  },

  // 대표번호 하나로 모든 교원을 연결할 수 없는 지역(학교급별 담당 등)은 hotContacts로 역할별 전화 버튼을 보여 줘요
  hotContactButtons(R) {
    return R.hotContacts.map(c =>
      `<a href="${telHref(c.value)}" class="btn btn-primary" aria-label="${R.short} ${c.label} ${c.value} 전화 걸기"><span aria-hidden="true">☎</span> ${c.label} <span class="btn-sub">${c.value}</span></a>`
    ).join('');
  },

  emergencyNote() {
    return `<p class="emergency-note"><span class="emergency-icon" aria-hidden="true">!</span><span>폭행·협박·난입 등 지금 위험하다면 현장을 벗어나 <a href="tel:112">112</a>에 먼저 신고하세요.</span></p>`;
  },

  eyebrow(text) {
    return `<p class="eyebrow">${text}</p>`;
  },

  // 라벨 · 내용 목록(빈 값은 건너뜀)
  facts(rows) {
    return `<dl class="facts">${rows.filter(([, v]) => v).map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join('')}</dl>`;
  },

  // 브랜드: PC(1024px~)는 가로형 로고, 그보다 좁으면 심볼 + 글자. 이름은 버튼의 aria-label 하나로만 읽혀요(이미지는 alt="")
  renderHeader() {
    const S = this.state;
    const R = this.R;
    // hotContacts가 있는 지역은 헤더 버튼이 어느 담당으로 걸리는지 읽어 줘요
    const hotLabel = R && R.hotContacts && (R.hotContacts.find(c => c.value === R.hot) || {}).label;
    const navHtml = PAGES.map(([id, label]) =>
      `<button class="nav-btn ${S.page === id ? 'active' : ''}" ${S.page === id ? 'aria-current="page"' : ''} onclick="App.nav('${id}')">${label}</button>`
    ).join('');
    return `
      <header class="site-header">
        <div class="header-inner">
          <button class="brand" onclick="App.nav('home')" aria-label="선생님 곁에 홈">
            <img class="brand-logo" src="assets/brand/logo-horizontal.png" alt="" width="159" height="40">
            <span class="brand-compact"><img class="brand-symbol" src="assets/brand/logo-symbol.png" alt="" width="32" height="30"><span class="brand-name">선생님 곁에</span></span>
          </button>
          <nav class="main-nav" aria-label="주요 메뉴">${navHtml}</nav>
          ${this.renderRegionSelect()}
          ${UpdateUI.chip()}
          ${R ? `<a href="{TEL}" class="header-call" aria-label="${R.short} ${hotLabel || '교육활동 보호 대표번호'} {HOT} 전화 걸기"><span aria-hidden="true">☎</span> {HOT}</a>` : ''}
        </div>
      </header>
    `;
  },

  // ══════════════ 첫 방문: 지역 선택 첫 화면 ══════════════
  renderLanding() {
    const cards = REGION_ORDER.map(id => `
      <li><button class="region-card" onclick="App.chooseRegion('${id}')" aria-label="${REGIONS[id].short} 안내 보기">
        <span class="region-card-name">${REGIONS[id].short}</span>
        <span class="region-card-arrow" aria-hidden="true">→</span>
      </button></li>
    `).join('');
    return `
      <main id="main" class="landing">
        <div class="landing-inner">
          <p class="landing-brand"><img class="brand-symbol" src="assets/brand/logo-symbol.png" alt="" width="32" height="30"><span class="brand-name">선생님 곁에</span></p>
          <h1 class="landing-title">어느 지역의 안내를 볼까요?</h1>
          <p class="landing-sub">${REGION_ORDER.map(id => REGIONS[id].short).join('·')} 중 근무 지역을 선택하세요.</p>
          <ul class="region-cards" aria-label="근무 지역 선택">${cards}</ul>
          <button class="link-btn landing-skip" onclick="App.skipOnboarding()">공통 대응 먼저 보기</button>
          <p class="landing-safety">지금 위험한 상황이라면 <a href="tel:112">112</a> 신고가 우선입니다.</p>
        </div>
      </main>
    `;
  },

  // ══════════════ 홈 = 시작 ══════════════
  // 지역을 고르지 않은 ‘공통 모드’는 지역과 관계없이 먼저 확인할 기본 대응만 가볍게 보여 줘요
  renderHome() {
    if (!this.R) {
      return `
        ${this.renderCommonHero()}
        ${this.renderCommonFirst()}
        ${this.renderEntries()}
        ${this.renderHighlights()}
        ${this.renderStepsSummary()}
        ${this.renderOutsideNote()}
      `;
    }
    return `
      ${this.renderHero()}
      ${this.renderEntries()}
      ${this.renderHighlights()}
      ${this.renderStepsSummary()}
      ${this.renderQuick()}
      ${this.renderFinder()}
      ${this.renderFaq()}
    `;
  },

  renderHero() {
    const R = this.R;
    const regionNames = REGION_ORDER.map(id => REGIONS[id].short).join('·');
    // 오른쪽 패널: 장식이 아니라 현재 지역의 연락·지원 경로를 바로 쓰는 기능 영역
    const panel = `
      <aside class="region-panel" aria-label="현재 지역 연락처">
        <p class="panel-label">현재 지역 <strong>${R.name}</strong></p>
        <p class="panel-hot-label">${R.hotName}</p>
        ${R.hotContacts ? '' : '<a href="{TEL}" class="panel-hot">{HOT}</a>'}
        <div class="panel-actions${R.hotContacts ? ' panel-actions-split' : ''}">
          ${R.hotContacts ? this.hotContactButtons(R) : '<a href="{TEL}" class="btn btn-primary"><span aria-hidden="true">☎</span> 전화하기</a>'}
          <button class="btn btn-secondary" onclick="App.nav('support')">지원 방법 보기</button>
        </div>
      </aside>
    `;
    return `
      <section class="hero">
        <div class="hero-inner">
          <div class="hero-copy">
            ${this.eyebrow('교육활동 보호·대응 가이드')}
            <h1>교육활동 중 어려움이 생겼다면,<br>지금 해야 할 일을 바로 확인하세요.</h1>
            <p class="hero-sub">${regionNames} 공식 자료를 바탕으로 신고·대응·법률·심리 지원 절차를 안내해요.</p>
            <div class="hero-actions">
              <button class="btn btn-primary" onclick="App.nav('proc')">지금 대응 절차 확인</button>
              <button class="btn btn-secondary" onclick="App.goHome('finder')">내 교육지원청 찾기</button>
            </div>
            ${this.emergencyNote()}
          </div>
          ${panel}
        </div>
      </section>
    `;
  },

  // 공통 모드 첫 화면: 특정 시·도 번호·기관·사업 없이 안내 기준(전국 공통)과 지역 선택만 보여 줘요
  renderCommonHero() {
    const btns = REGION_ORDER.map(id =>
      `<button class="region-pick" onclick="App.setRegion('${id}')">${REGIONS[id].short}</button>`
    ).join('');
    return `
      <section class="hero">
        <div class="hero-inner">
          <div class="hero-copy">
            ${this.eyebrow('공통 대응 안내')}
            <h1>지역과 관계없이<br>지금 먼저 해야 할 일을 확인하세요.</h1>
            <p class="hero-sub">교육활동 중 어려움이 생겼을 때 우선 확인할 기본 대응을 안내해요.</p>
            <div class="hero-actions">
              <button class="btn btn-primary" onclick="App.nav('proc')">공통 대응 절차 보기</button>
              <button class="btn btn-secondary" onclick="App.openRegionMenu()">근무 지역 선택</button>
            </div>
            ${this.emergencyNote()}
          </div>
          <aside class="region-panel common-panel" aria-label="현재 안내 기준">
            <p class="panel-label">현재 안내 기준</p>
            <p class="common-basis">전국 공통 대응</p>
            <p class="common-panel-text">지역별 연락처·지원·신청 방법을 보려면 근무 지역을 선택하세요.</p>
            <div class="region-pick-row">${btns}</div>
          </aside>
        </div>
      </section>
    `;
  },

  // 공통 모드: 지금 먼저 할 일(각 1~2줄). 처리 기한 같은 세부 기준은 대응 절차 화면에서 근거와 함께 안내해요
  renderCommonFirst() {
    const rows = COMMON_FIRST.map((c, i) => `
      <li class="first-card ${c.urgent ? 'urgent' : ''}">
        <span class="step-num">${i + 1}</span>
        <div><p class="first-card-title">${c.t}</p><p class="first-card-text">${c.d}</p></div>
      </li>
    `).join('');
    return `
      <section class="section" id="quick">
        ${this.eyebrow('시작')}
        <h2 class="h2">지금 먼저 할 일</h2>
        <ol class="first-list">${rows}</ol>
        <div class="btn-row">
          <button class="btn btn-secondary" onclick="App.nav('guide')">상황별 도움 보기</button>
          <button class="btn btn-secondary" onclick="App.openRegionMenu()">지역별 지원 보기</button>
        </div>
      </section>
    `;
  },

  // 공통 모드: 등록된 지역 외 교사를 위한 짧은 안내
  renderOutsideNote() {
    const names = REGION_ORDER.map(id => REGIONS[id].short).join('·');
    return `
      <section class="section">
        <div class="outside-note">
          <p class="outside-note-title">${names} 외 지역인가요?</p>
          <p>공통 대응은 그대로 참고할 수 있어요. 세부 지원·신청 방법은 소속 시·도교육청의 최신 안내를 확인해 주세요.</p>
        </div>
      </section>
    `;
  },

  // 헤더의 지역 선택 목록을 열어요(공통 모드의 ‘근무 지역 선택’·‘지역별 지원 보기’)
  openRegionMenu() {
    window.scrollTo(0, 0);
    RegionMenu.open();
  },

  renderQuick() {
    const S = this.state;
    const rows = QUICK.map(q => {
      const open = S.quick === q.id;
      const actions = q.urgent
        ? `<a href="tel:112" class="btn btn-danger"><span aria-hidden="true">☎</span> 112 신고</a>${this.callButton('btn-secondary')}`
        : `${this.callButton('btn-primary')}<button class="btn btn-secondary" onclick="App.nav('proc')">대응 절차 보기</button>`;
      return `
        <li class="action ${q.urgent ? 'urgent' : ''} ${open ? 'open' : ''}">
          <button class="action-head" aria-expanded="${open}" onclick="App.toggle('quick','${q.id}')">
            ${q.urgent ? '<span class="tag tag-danger">긴급</span>' : ''}
            <span class="action-label">${q.label}</span>
            <span class="chevron" aria-hidden="true"></span>
          </button>
          ${open ? `
            <div class="action-body">
              <p class="action-first">${q.first}</p>
              ${this.facts([['연락할 곳', q.org], ['지금 기록해 두세요', q.records], ['받을 수 있는 지원', q.supports], ['다음 절차', q.next]])}
              <div class="btn-row">${actions}</div>
            </div>
          ` : ''}
        </li>
      `;
    }).join('');
    return `
      <section class="section" id="quick">
        ${this.eyebrow('상황')}
        <h2 class="h2">자주 겪는 상황, 먼저 할 일</h2>
        <ul class="action-list">${rows}</ul>
      </section>
    `;
  },

  // 홈 ‘지금 어떤 도움이 필요하신가요?’: 5메뉴로 들어가는 입구 4개(정보는 각 화면에서)
  renderEntries() {
    const cards = HOME_ENTRIES.map(x => `
      <li><button class="entry-card" onclick="App.nav('${x.page}')">
        <span class="entry-icon" aria-hidden="true">${x.e}</span>
        <span class="entry-text"><span class="entry-title">${x.t}</span><span class="entry-desc">${x.d}</span></span>
        <span class="entry-go" aria-hidden="true">→</span>
      </button></li>
    `).join('');
    return `
      <section class="section" id="entries">
        ${this.eyebrow('시작')}
        <h2 class="h2">지금 어떤 도움이 필요하신가요?</h2>
        <ul class="entry-list">${cards}</ul>
      </section>
    `;
  },

  // 홈 ‘놓치기 쉬운 제도’: 회복·보호 제도 6개를 한 줄씩(+ 지역 한 줄). 자세한 조건은 회복·보호에서 펼쳐 봐요
  renderHighlights() {
    const R = this.R;
    const cards = HOME_HIGHLIGHTS.map(h => {
      const b = benefitById(h.id);
      const local = R && R.highlights && R.highlights[h.id];
      return `
        <li class="hl-card">
          <button class="hl-btn" onclick="App.openBenefit('${b.id}')">
            <span class="hl-title"><span aria-hidden="true">${b.e}</span> ${b.t}</span>
            <span class="bf-badges">${benefitBadges(b)}</span>
            <span class="hl-text">${h.d}</span>
            ${local ? `<span class="hl-local"><strong>${R.short}</strong> ${local}</span>` : ''}
            <span class="hl-more">${h.cta} <span aria-hidden="true">→</span></span>
          </button>
        </li>
      `;
    }).join('');
    return `
      <section class="section" id="highlights">
        <div class="section-head">
          <div>${this.eyebrow('회복·보호')}<h2 class="h2">놓치기 쉬운 제도</h2></div>
          <button class="link-btn" onclick="App.nav('care')">회복·보호 전체 보기</button>
        </div>
        <p class="muted">제도별 적용 대상과 승인 절차는 교원 신분과 상황에 따라 달라질 수 있어요.</p>
        <ul class="hl-list">${cards}</ul>
      </section>
    `;
  },

  // 지역 모드는 단계 이름·담당·기한, 공통 모드는 기한 없이 공통 흐름만 보여 줘요
  renderStepsSummary() {
    const common = !this.R;
    const rows = STEPS.map((s, i) => {
      const p = this.progress(i);
      const title = common ? COMMON_FLOW[i].t : s.title;
      const meta = common ? COMMON_FLOW[i].d : `${s.org}${s.deadline ? ` · ${s.deadline}` : ''}`;
      return `
        <li>
          <button class="step-row" onclick="App.nav('proc', { step: ${i} })">
            <span class="step-num">${s.n}</span>
            <span class="step-text"><span class="step-title">${title}</span><span class="step-meta">${meta}</span></span>
            ${p.done ? `<span class="badge">${p.done}/${p.total} 완료</span>` : ''}
            <span class="chevron right" aria-hidden="true"></span>
          </button>
        </li>
      `;
    }).join('');
    return `
      <section class="band warm">
        <div class="section">
          <div class="section-head">
            <div>${this.eyebrow('실행')}<h2 class="h2">${common ? '공통 대응 흐름 4단계' : '대응 절차 4단계'}</h2></div>
            <button class="link-btn" onclick="App.nav('proc')">단계별로 체크하기</button>
          </div>
          <ol class="step-list">${rows}</ol>
          ${common ? '<p class="muted small flow-note">공통적으로 참고할 수 있는 흐름이에요. 세부 절차와 기한은 소속 교육(지원)청 안내를 확인하세요.</p>' : ''}
        </div>
      </section>
    `;
  },

  // 시·군·구 → 담당 교육지원청. 지역 수와 상관없이 select 하나로 표현해요(경기 31개 시·군도 한 화면)
  renderFinder() {
    const R = this.R;
    if (!R) {
      return `
        <section class="section" id="finder">
          ${this.eyebrow('연결')}
          <h2 class="h2">내 교육지원청 찾기</h2>
          <p class="muted">교육활동 침해 신고와 지역교권보호위원회 심의는 소속 교육지원청이 담당해요. 먼저 근무 지역을 골라 주세요.</p>
          ${this.renderRegionPicker('근무 지역')}
        </section>
      `;
    }
    const areas = regionAreas(R);
    const opts = areas.map(a => `<option value="${a.area}" ${this.state.area === a.area ? 'selected' : ''}>${a.area}</option>`).join('');
    const hit = areas.find(a => a.area === this.state.area);
    const office = hit ? hit.office : null;
    return `
      <section class="section" id="finder">
        ${this.eyebrow('연결')}
        <h2 class="h2">내 교육지원청 찾기</h2>
        <p class="muted">교육활동 침해 신고와 지역교권보호위원회 심의는 소속 교육지원청이 담당해요.</p>
        <div class="finder-grid">
          <div class="finder-pick">
            <label class="field">
              <span class="field-label">학교가 있는 ${R.short} 시·군·구</span>
              <select onchange="App.setState({ area: this.value })">
                <option value="" ${office ? '' : 'selected'}>선택해 주세요</option>
                ${opts}
              </select>
            </label>
            ${R.areaNote ? `<p class="note">${R.areaNote}</p>` : ''}
          </div>
        ${office ? `
          <div class="result" aria-live="polite">
            <p class="result-title">${office.name}</p>
            <p class="muted small">${office.dept ? `담당 · ${office.dept} · ` : ''}관할 · ${office.areas.join('·')}</p>
            ${this.facts([
              ['연락처', office.contact && /\d/.test(office.contact) ? linkifyPhone(office.contact) : ''],
              ['신고·심의', '소속 교육지원청 또는 {HOT2}'],
              ['법률·심리·치료', '{HOT1}']
            ])}
            ${actionButtons(officeChannels(office))}
          </div>
        ` : `<p class="finder-hint">시·군·구를 고르면 담당 교육지원청과 연락처가 여기에 보여요.</p>`}
        </div>
        ${this.renderSources('finder')}
      </section>
    `;
  },

  renderFaq() {
    const S = this.state;
    const items = FAQS.map((f, i) => {
      const open = S.faqOpen === i;
      return `
        <li class="faq-item">
          <button class="faq-btn" aria-expanded="${open}" onclick="App.toggle('faqOpen', ${i})">
            <span>${f.q}</span><span class="chevron" aria-hidden="true"></span>
          </button>
          ${open ? `<p class="faq-answer">${f.a}</p>` : ''}
        </li>
      `;
    }).join('');
    return `
      <section class="section">
        <h2 class="h2">자주 묻는 질문</h2>
        <ul class="faq-list">${items}</ul>
        <p class="more-link"><button class="link-btn" onclick="App.nav('support')">법률·심리·민원 등 지원 찾기 →</button></p>
      </section>
    `;
  },

  // ══════════════ 대응 절차 = 실행 ══════════════
  renderProc() {
    const S = this.state;
    const i = S.step;
    const s = STEPS[i];
    const d = STEP_DETAIL[i];
    const p = this.progress(i);
    const stepper = STEPS.map((st, j) => {
      const pj = this.progress(j);
      return `
        <li><button class="stepper-btn ${j === i ? 'active' : ''} ${pj.done === pj.total ? 'complete' : ''}" ${j === i ? 'aria-current="step"' : ''} onclick="App.setState({ step: ${j} })">
          <span class="step-num">${pj.done === pj.total ? '✓' : st.n}</span>
          <span class="stepper-text"><span class="stepper-title">${st.title}</span><span class="stepper-meta">${pj.done}/${pj.total}</span></span>
        </button></li>
      `;
    }).join('');
    const checks = d.checks.map(c => {
      const done = !!S.checks[i + '.' + c.id];
      return `
        <li><label class="check ${done ? 'done' : ''}">
          <input type="checkbox" ${done ? 'checked' : ''} onchange="App.toggleCheck(${i}, '${c.id}')">
          <span>${c.t}</span>
        </label></li>
      `;
    }).join('');
    const list = (title, arr) => `
      <div class="duty">
        <h3 class="duty-title">${title}</h3>
        <ul>${arr.map(x => `<li>${x}</li>`).join('')}</ul>
      </div>
    `;
    return `
      <section class="section page">
        ${this.eyebrow('실행')}
        <h1 class="page-title">대응 절차</h1>
        <p class="muted">지금 단계를 고르고, 한 일을 체크하며 따라가세요.</p>
        ${this.emergencyNote()}
        <ol class="stepper" aria-label="대응 단계">${stepper}</ol>
        <div class="proc-panel" data-print>
          <div class="proc-title-row">
            <h2 class="h2">${s.n}. ${s.title}</h2>
            <span class="badge">${s.org}</span>
            ${s.deadline ? `<span class="badge badge-accent">⏱ ${s.deadline}</span>` : ''}
          </div>
          <p>${s.sum}</p>
          <div class="progress-row">
            <span class="progress-label">진행 ${p.done} / ${p.total}</span>
            <span class="progress" aria-hidden="true"><span style="width:${Math.round(p.done / p.total * 100)}%"></span></span>
          </div>
          <ul class="check-list" aria-label="${s.title} 진행 체크">${checks}</ul>
          <p class="muted small check-note">체크 상태는 이 기기에만 저장돼요.${p.done ? ` <button class="link-btn small" onclick="App.resetChecks(${i})">이 단계 체크 지우기</button>` : ''}</p>
          <div class="duty-grid">
            ${list('내가 할 일', d.teacher)}
            ${list('학교가 할 일', d.school)}
            ${list('교육지원청이 할 일', d.office)}
            ${list('준비·기록할 것', d.docs)}
          </div>
          <p class="caution"><strong>주의할 점</strong> ${d.caution.join(' · ')}</p>
          <p class="next-step"><strong>다음 단계</strong> ${d.next}</p>
          ${this.renderStepLinks(i)}
          ${this.shareTools({ page: 'proc', step: i, regionId: this.state.regionId }, '대응 절차 · ' + s.n + '단계 ' + s.title)}
          <div class="btn-row">
            ${i > 0 ? `<button class="btn btn-secondary" onclick="App.setState({ step: ${i - 1} })">← 이전 단계</button>` : ''}
            ${i < STEPS.length - 1 ? `<button class="btn btn-primary" onclick="App.setState({ step: ${i + 1} }); document.querySelector('.stepper').scrollIntoView({ behavior: 'smooth' })">다음 단계 →</button>` : ''}
          </div>
        </div>
        <p class="muted small">기한은 법률이 아닌 교육활동 보호 매뉴얼 기준이에요(법률은 '지체 없이' 보고). 실제 적용 기한과 제출 방식은 소속 교육지원청 안내를 확인하세요.</p>
        ${this.renderSources('procedure')}
      </section>
    `;
  },

  // 대응 절차 단계별 ‘이 단계에서 함께 확인’: 회복·보호 제도와 지원 유형으로 가는 링크만(목록을 펼치지 않아요)
  renderStepLinks(i) {
    const L = STEP_LINKS[i];
    if (!L) return '';
    const bs = L.benefits.map(benefitById).filter(Boolean);
    const ts = L.supports.map(supportTypeById).filter(Boolean);
    return `
      <div class="step-links">
        <p class="step-links-title">이 단계에서 함께 확인</p>
        ${bs.length ? `<div class="link-group"><span class="link-group-label">회복·보호</span><div class="bf-list">${bs.map(benefitChip).join('')}</div></div>` : ''}
        ${ts.length ? `<div class="link-group"><span class="link-group-label">지원 찾기</span><div class="bf-list">${ts.map(t => supportChip(t, this.R)).join('')}</div></div>` : ''}
      </div>
    `;
  },

  // 제도 하나의 상세: 꼭 확인할 한 줄 → 적용 범위 → 공통 기준 → 놓치기 쉬워요 → 지역 기준(R.benefits[id]) → 공식 근거 → 지원 찾기 연결.
  // 지역 값은 공통 문장에 섞지 않고, 지역을 고르지 않으면 지역 상자를 아예 보여 주지 않아요
  benefitDetail(x) {
    const R = this.R;
    const local = R && R.benefits && R.benefits[x.id];
    const links = x.supportLinks ? x.supportLinks.types.map(supportTypeById).filter(Boolean) : [];
    return `
      <div class="bf-detail">
        ${x.notice ? `<p class="bf-notice"><strong>꼭 확인하세요</strong> ${x.notice}</p>` : ''}
        ${x.scope ? `<p class="prot-scope">${x.scope}</p>` : ''}
        ${this.fieldGrid(x)}
        ${x.caution ? `<p class="bf-caution"><strong>주의할 점</strong> ${x.caution}</p>` : ''}
        ${missedBox(x.missed, '놓치기 쉬워요')}
        ${local ? `
          <div class="prot-local">
            <p class="prot-local-title">${R.short} 기준</p>
            ${local.program ? `<p class="prot-local-name">${local.program}</p>` : ''}
            ${this.fieldGrid(local, true)}
            ${local.caution ? `<p class="bf-caution"><strong>주의할 점</strong> ${linkifyPhone(local.caution)}</p>` : ''}
            ${missedBox(local.missed, R.short + '에서 놓치기 쉬워요')}
            <p class="muted small">${sourceLine(R, local)}</p>
          </div>` : (R ? `<p class="muted small prot-local-none">${R.short}에서 별도로 안내한 세부 기준은 현재 확인되지 않았어요. 공통 기준을 먼저 확인하고, 실제 적용은 소속 학교나 교육(지원)청에 확인하세요.${R.hot ? ` 문의 <a href="${telHref(R.hot)}">${R.hot}</a>` : ''}</p>` : '')}
      </div>
      ${this.actionList('benefit', x.id, x.actions, '지금 확인해 볼 일')}
      ${refsBox(x.refs, x.basis, x.verifiedAt)}
      ${links.length ? `
        <div class="bf-cross">
          <p class="bf-cross-q">${x.supportLinks.q}</p>
          <div class="bf-list">${links.map(t => supportChip(t, R)).join('')}</div>
        </div>` : ''}
      ${this.shareTools({ page: 'care', benefit: x.id, regionId: this.state.regionId }, '회복·보호 · ' + x.t, true)}
    `;
  },

  // 제도 상세의 필드: 왼쪽(무엇·누가·기간) / 오른쪽(언제·어떻게·준비). 좁은 화면은 한 열로 이어져요. 빈 필드는 숨겨요
  fieldGrid(x, phone) {
    const v = k => x[k] ? (phone ? linkifyPhone(x[k]) : x[k]) : '';
    const col = keys => {
      const rows = BENEFIT_FIELDS.filter(([k]) => keys.includes(k)).map(([k, label]) => [label, v(k)]).filter(([, val]) => val);
      return rows.length ? `<dl class="facts bf-col">${rows.map(([k, val]) => `<div><dt>${k}</dt><dd>${val}</dd></div>`).join('')}</dl>` : '';
    };
    const left = col(['what', 'who', 'limit']);
    const right = col(['when', 'apply', 'prepare']);
    if (!left && !right) return '';
    // 필드가 4개 이상일 때만 두 열로(짧은 지역 상자를 억지로 나누지 않아요)
    const count = BENEFIT_FIELDS.filter(([k]) => ['what', 'who', 'limit', 'when', 'apply', 'prepare'].includes(k) && x[k]).length;
    return `<div class="bf-grid ${left && right && count >= 4 ? '' : 'single'}">${left}${right}</div>`;
  },

  // ══════════════ 회복·보호 = 내가 사용할 수 있는 제도 ══════════════
  // 맨 위 회복 흐름 → 제도 검색 → 상황별 묶음(BENEFIT_CATEGORIES). 기관이 주는 지원은 지원 찾기에 있어요
  renderCare() {
    const S = this.state;
    const card = b => {
      const open = S.benefit === b.id;
      return `
        <li class="action prot ${open ? 'open' : ''}" id="bf-${b.id}" data-bf="${b.id}">
          <button class="action-head" aria-expanded="${open}" onclick="App.toggle('benefit','${b.id}')">
            <span class="prot-icon" aria-hidden="true">${b.e}</span>
            <span class="action-label bf-head"><span class="bf-title">${b.t}</span><span class="prot-sum">${b.d}</span><span class="bf-badges">${benefitBadges(b)}</span></span>
            <span class="chevron" aria-hidden="true"></span>
          </button>
          ${open ? `<div class="action-body" data-print>${this.benefitDetail(b)}</div>` : ''}
        </li>
      `;
    };
    const cats = BENEFIT_CATEGORIES.map(c => {
      const list = BENEFITS.filter(b => b.category === c.id);
      if (!list.length) return '';
      return `
        <section class="care-cat" aria-labelledby="cat-${c.id}">
          <h2 class="care-cat-title" id="cat-${c.id}">${c.t}</h2>
          <ul class="action-list prot-list">${list.map(card).join('')}</ul>
        </section>
      `;
    }).join('');
    const q = this._careQuery || '';
    return `
      <section class="section page">
        ${this.eyebrow('회복·보호')}
        <h1 class="page-title">회복·보호</h1>
        <p class="muted">사건 이후 사용할 수 있는 휴가·병가·휴직과 보호 제도를 확인해 보세요.</p>
        <p class="muted small">제도별 적용 대상과 승인 절차는 교원 신분과 상황에 따라 달라질 수 있어요. 상담·치료비·법률·경호 같은 지원은 <button class="link-btn small" onclick="App.nav('support')">지원 찾기</button>에서 확인하세요.</p>
        ${this.renderRecoveryFlow()}
        ${this.renderCompare()}
        <div class="tool-panel guide-search-panel care-search-panel">
          <label class="guide-search-label" for="care-search">어떤 제도를 찾으세요?</label>
          <div class="guide-search-field">
            <input id="care-search" class="guide-search-input" type="search"
              value="${escapeAttr(q)}"
              placeholder="특별휴가, 병가, 공무상, 휴직, 요양, 전보, 분리..."
              autocomplete="off" enterkeyhint="search"
              oninput="App.onCareInput(event)"
              aria-describedby="care-count">
            <button type="button" id="care-search-clear" class="guide-search-clear" onclick="App.clearCareSearch()" aria-label="검색어 지우기" ${guideSearchTerms(q).length ? '' : 'hidden'}>지우기</button>
          </div>
          <p id="care-count" class="muted small guide-search-hint" aria-live="polite"></p>
        </div>
        <p class="note" id="care-empty" hidden>검색어에 맞는 제도가 없어요. 상담·치료비·변호사·경호는 <button class="link-btn" onclick="App.nav('support')">지원 찾기</button>에서 찾아보세요.</p>
        ${cats}
        ${this.renderSources('care')}
      </section>
    `;
  },

  // ‘제도 차이가 헷갈리나요?’: 정해 둔 비교 묶음(COMPARISONS). 칸 내용은 BENEFITS에서 그대로 가져와요(같은 숫자를 두 군데 적지 않음).
  // 넓은 화면은 표, 좁은 화면은 항목별 카드(CSS)로 보여요
  renderCompare() {
    const S = this.state;
    const c = COMPARISONS.find(x => x.id === S.compare);
    // aria-controls는 비교표가 화면에 있을 때만(닫혀 있으면 가리킬 요소가 없어요)
    const btns = COMPARISONS.map(x => `<button type="button" class="bf-chip ${S.compare === x.id ? 'active' : ''}" aria-expanded="${S.compare === x.id}"${c ? ' aria-controls="compare-panel"' : ''} onclick="App.toggleCompare('${x.id}')">${x.t}</button>`).join('');
    let panel = '';
    if (c) {
      const bs = c.ids.map(benefitById);
      const cell = (b, key) => key === 'keyNote' ? (b.notice || (b.missed || [])[0] || b.caution || '')
        : key === '@return' ? (benefitById('return-to-work') || {}).limit || '' : b[key] || '';
      panel = `
        <div class="cmp-panel" id="compare-panel" data-print>
          ${c.note ? `<p class="bf-notice"><strong>꼭 확인하세요</strong> ${c.note}</p>` : ''}
          <table class="cmp-table">
            <caption>${c.t}: ${bs.map(b => b.t).join(' · ')}</caption>
            <thead><tr><th scope="col">항목</th>${bs.map(b => `<th scope="col">${b.t}${benefitBadges(b) ? `<span class="bf-badges">${benefitBadges(b)}</span>` : ''}</th>`).join('')}</tr></thead>
            <tbody>${c.rows.map(([key, label]) => `<tr><th scope="row">${label}</th>${bs.map(b => `<td data-col="${b.t}">${cell(b, key)}</td>`).join('')}</tr>`).join('')}</tbody>
          </table>
          <p class="muted small">각 제도의 자세한 내용은 아래 목록에서 펼쳐 보세요. 적용 여부는 교원 신분과 요건·승인 절차에 따라 달라요.</p>
          <div class="bf-list">${bs.map(b => `<button type="button" class="link-btn small" onclick="App.openBenefit('${b.id}')">${b.t} 자세히</button>`).join('')}</div>
          ${this.shareTools({ page: 'care', compare: c.id, regionId: S.regionId }, '회복·보호 · ' + c.t)}
        </div>`;
    }
    return `
      <section class="compare" id="compare">
        <h2 class="care-cat-title">제도 차이가 헷갈리나요?</h2>
        <div class="bf-list">${btns}</div>
        ${panel}
      </section>
    `;
  },

  // ‘회복에 시간이 더 필요하다면’: 특별휴가 → 병가 → 휴직 → 복귀를 한눈에. 자동으로 이어지지 않는다는 안내를 반드시 함께 보여 줘요
  renderRecoveryFlow() {
    const steps = RECOVERY_PATH.map((r, i) => `
      <li class="rec-step">
        <p class="rec-title"><span class="rec-num" aria-hidden="true">${i + 1}</span>${r.t}</p>
        <p class="rec-period bf-badges">${r.badges.map(t => `<span class="bf-badge">${t}</span>`).join('')}<span class="bf-badge bf-scope">${r.scope}</span></p>
        <p class="rec-note-small">${r.note}</p>
        <p class="rec-text">${r.d}</p>
        <div class="rec-links">${r.ids.map(id => `<button class="link-btn small" onclick="App.openBenefit('${id}')">${benefitById(id).t} 자세히 보기</button>`).join('')}</div>
      </li>
    `).join('');
    return `
      <section class="recovery" id="recovery">
        <h2 class="h2">회복에 시간이 더 필요하다면</h2>
        <ol class="rec-flow">${steps}</ol>
        <p class="rec-note"><strong>꼭 확인하세요</strong> ${RECOVERY_NOTE}</p>
      </section>
    `;
  },

  // ══════════════ 상황별 도움 = 판단 → 선택 → 결과 ══════════════
  // 상황 하나의 안내. ‘관련 대응 절차’·‘관련 지원 보기’는 상황 데이터(stages·supports)로 둘러볼 곳만 안내해요
  // 상황의 supports를 현재 지역에 실제로 있는 지원 유형으로 옮겨요(새 판단 없이 SUPPORT_TYPES.situ 매핑만 사용)
  relatedTypes(s) {
    return this.availableTypes().filter(t => s.supports.some(v => t.situ.includes(v)) || s.typeTags.some(v => (t.tags || []).includes(v)));
  },

  situById(id) {
    return SITUS.find(s => s.id === id) || null;
  },

  // 관련 지원이 여러 개면 지원 찾기에서 그 유형들만 한 번에 보여 줘요
  showRelated(situId) {
    const situ = this.situById(situId);
    if (!situ) return;
    this.nav('support', { supportType: 'related', related: { situId, ids: this.relatedTypes(situ).map(t => t.id) } });
  },

  situDetail(s, withTitle) {
    const step = STAGE_TO_STEP[s.stages[0]];
    const types = this.relatedTypes(s);
    const supportBtn = types.length > 1
      ? `<button class="btn btn-secondary" onclick="App.showRelated('${s.id}')">관련 지원 ${types.length}개 보기 →</button>`
      : `<button class="btn btn-secondary" onclick="App.nav('support', { supportType: '${types.length ? types[0].id : 'all'}' })">${types.length ? `관련 지원 보기(${types[0].label})` : '지원 찾기'} →</button>`;
    return `
      <div class="situ-sub ${this.state.situ === 'situ:' + s.id ? 'is-target' : ''}" id="situ-${s.id}" data-print>
        ${withTitle ? `<h3 class="sub-title">${s.title} ${urgencyBadge(s.urgency)}</h3>` : ''}
        <div class="situ-layout">
          <div class="situ-main">
            <p class="muted small situ-example">예: ${s.example}</p>
            <div class="first-box"><p class="first-label">지금 먼저 할 일</p><p>${s.firstAction}</p></div>
            ${this.actionList('situ', s.id, SITU_ACTIONS[s.id], '지금 해볼 일')}
            ${this.facts([['학교에 알릴 내용', s.report], ['남겨 두면 좋은 기록', s.evidence]])}
          </div>
          <div class="situ-side">
            ${this.facts([['주의할 점', s.dont]])}
            ${s.legalCaution ? `<p class="note"><strong>판단 시 주의</strong> ${s.legalCaution}</p>` : ''}
            ${this.situBenefits(s)}
            <div class="situ-supports">
              <p class="first-label">연결 가능한 지원</p>
              ${this.facts([['받을 수 있는 지원', s.programs], ['연락할 곳', s.orgs]])}
              ${types.length ? `<div class="bf-list">${types.map(t => supportChip(t, this.R)).join('')}</div>` : ''}
            </div>
          </div>
        </div>
        <div class="btn-row">
          <button class="btn btn-secondary" onclick="App.nav('proc', { step: ${step === undefined ? 0 : step} })">관련 대응 절차 →</button>
          ${supportBtn}
        </div>
        ${this.shareTools({ page: 'guide', situ: 'situ:' + s.id, regionId: this.state.regionId }, '상황별 도움 · ' + s.title, true)}
      </div>
    `;
  },

  // 상황과 관련이 분명한 회복·보호 제도(SITU_BENEFITS)만 작은 버튼으로. 적용을 확정하지 않고 ‘함께 확인’으로 안내해요
  situBenefits(s) {
    const list = (SITU_BENEFITS[s.id] || []).map(benefitById).filter(Boolean);
    if (!list.length) return '';
    return `
      <div class="situ-benefits">
        <p class="first-label">함께 확인할 회복·보호 제도</p>
        <p class="muted small">적용 여부는 교원 신분과 요건·승인 절차에 따라 달라요.</p>
        <div class="bf-list">${list.map(benefitChip).join('')}</div>
      </div>
    `;
  },

  // 검색어 + 상세 조건(같은 그룹 OR, 다른 그룹 AND). except 그룹은 빼고 봐요(필터 개수 계산용)
  guidePasses(s, query, except) {
    return matchesGuideSearch(s, query) && FILTER_DEFS.every(d => {
      if (d.g === except) return true;
      const sel = this.state.filters[d.g] || [];
      return sel.length === 0 || sel.some(o => d.test(s, o));
    });
  },

  guideMatches(query) {
    return SITUS.filter(s => this.guidePasses(s, query))
      .sort((a, b) => URGENCY_ORDER.indexOf(a.urgency) - URGENCY_ORDER.indexOf(b.urgency));
  },

  // 숫자는 현재 검색어 + 다른 필터 그룹을 적용한 뒤, 이 선택지를 더했을 때 남는 상황 수예요.
  // 같은 필터 그룹 안은 OR라 해당 그룹의 현재 선택은 count 계산에서 제외해요.
  guideFilterRowsHtml() {
    const S = this.state;
    return FILTER_DEFS.map(d => {
      const pool = SITUS.filter(s => this.guidePasses(s, S.query, d.g));
      const chips = d.opts.filter(o => SITUS.some(s => d.test(s, o))).map(o => {
        const n = pool.filter(s => d.test(s, o)).length;
        const on = (S.filters[d.g] || []).includes(o);
        const off = !on && n === 0;
        return `<button class="chip ${on ? 'active' : ''}" aria-pressed="${on}" ${off ? 'disabled title="현재 검색·조건에서는 해당 상황이 없어요"' : ''} onclick="App.toggleFilter('${d.g}','${o}')">${o} <span class="chip-count">${n}</span></button>`;
      }).join('');
      return `<div class="filter-row" role="group" aria-label="${d.g}"><span class="filter-label">${d.g}</span><div class="chip-row">${chips}</div></div>`;
    }).join('');
  },

  // 검색어·조건이 없으면 큰 상황 목록, 있으면 결과 개수와 결과 목록(또는 결과 없음 안내)
  guideResultsHtml() {
    const S = this.state;
    const query = S.query || '';
    const queryActive = guideSearchTerms(query).length > 0;
    const selected = FILTER_DEFS.flatMap(d => S.filters[d.g] || []);

    if (!queryActive && !selected.length) {
      const groupRows = SITU_GROUPS.map(g => {
        const subs = SITUS.filter(s => s.group === g.id)
          .sort((a, b) => URGENCY_ORDER.indexOf(a.urgency) - URGENCY_ORDER.indexOf(b.urgency));
        const key = 'group:' + g.id;
        // 공유 주소로 특정 상황(situ:…)이 정해지면 그 상황이 속한 큰 상황을 펼쳐요
        const isOpen = S.situ === key || (!!S.situ && subs.some(x => 'situ:' + x.id === S.situ));
        return `
          <li class="action ${g.urgent ? 'urgent' : ''} ${isOpen ? 'open' : ''}">
            <button class="action-head" aria-expanded="${isOpen}" onclick="App.toggle('situ', '${key}')">
              ${g.urgent ? '<span class="tag tag-danger">긴급</span>' : ''}
              <span class="action-label">${g.t}</span>
              <span class="action-count">${subs.length}</span>
              <span class="chevron" aria-hidden="true"></span>
            </button>
            ${isOpen ? `<div class="action-body">${subs.map(s => this.situDetail(s, subs.length > 1)).join('')}</div>` : ''}
          </li>
        `;
      }).join('');
      return `
        <div class="result-head"><p class="result-count">큰 상황으로 바로 찾기</p></div>
        <ul class="action-list">${groupRows}</ul>
      `;
    }

    const matches = this.guideMatches(query);
    const resultRows = matches.map(s => {
      const key = 'situ:' + s.id;
      const isOpen = S.situ === key;
      const urgent = s.urgency === URGENCY_ORDER[0];
      return `
        <li class="action ${urgent ? 'urgent' : ''} ${isOpen ? 'open' : ''}">
          <button class="action-head" aria-expanded="${isOpen}" onclick="App.toggle('situ', '${key}')">
            <span class="action-label">${s.title}</span>
            ${urgencyBadge(s.urgency)}
            <span class="chevron" aria-hidden="true"></span>
          </button>
          ${isOpen ? `<div class="action-body">${this.situDetail(s, false)}</div>` : ''}
        </li>
      `;
    }).join('');

    const conditionParts = [
      queryActive ? `검색 ‘${escapeAttr(query.trim())}’` : '',
      selected.length ? selected.join(' · ') : ''
    ].filter(Boolean);

    const benefitHits = queryActive ? matchBenefits(query) : [];
    const hint = benefitHits.length ? `
      <div class="bf-hint">
        <p class="bf-hint-title">‘${escapeAttr(query.trim())}’은(는) 회복·보호 제도에서 찾을 수 있어요</p>
        <button class="link-btn" data-q="${escapeAttr(query.trim())}" onclick="App.searchCare(this.dataset.q)">회복·보호에서 찾아보기 →</button>
      </div>` : '';
    return `
      ${hint}
      <div class="result-head" aria-live="polite">
        <div>
          <p class="result-count">${matches.length}개 상황을 찾았어요</p>
          <p class="muted small">현재 조건: ${conditionParts.join(' · ')}</p>
        </div>
        <button class="btn btn-secondary" onclick="App.clearGuideTools()">검색·필터 초기화</button>
      </div>
      ${matches.length ? `<ul class="action-list">${resultRows}</ul>` : '<p class="note">검색어나 선택한 조건에 맞는 상황이 없어요. 검색어를 조금 짧게 입력하거나 조건을 줄여 다시 찾아보세요.</p>'}
    `;
  },

  renderGuide() {
    const S = this.state;
    const query = S.query || '';
    const queryActive = guideSearchTerms(query).length > 0;
    const filterActive = Object.keys(S.filters).length > 0;
    const selected = FILTER_DEFS.flatMap(d => S.filters[d.g] || []);
    const open = S.filterOpen === null ? isDesktop() || filterActive : S.filterOpen;
    // 화면 전체를 다시 그리면 입력창도 새로 만들어지므로 남아 있던 조합 상태는 버려요
    this._guideComposing = false;

    return `
      <section class="section page">
        ${this.eyebrow('판단')}
        <h1 class="page-title">상황별 도움</h1>
        <p class="muted">떠오르는 단어로 검색하거나, 상세 조건과 큰 상황에서 바로 찾아보세요.</p>
        ${this.emergencyNote()}

        <div class="tool-panel guide-search-panel">
          <label class="guide-search-label" for="guide-search">어떤 일이 있었나요?</label>
          <div class="guide-search-field">
            <input id="guide-search" class="guide-search-input" type="search"
              value="${escapeAttr(query)}"
              placeholder="욕설, 담임교체, 녹음, 생기부, 아동학대 신고..."
              autocomplete="off" enterkeyhint="search"
              oninput="App.onGuideInput(event)"
              aria-describedby="guide-search-hint">
            <button type="button" id="guide-search-clear" class="guide-search-clear" onclick="App.clearGuideSearch()" aria-label="검색어 지우기" ${queryActive ? '' : 'hidden'}>지우기</button>
          </div>
          <p id="guide-search-hint" class="muted small guide-search-hint">정확한 용어를 몰라도, 떠오르는 단어로 검색할 수 있어요.</p>
        </div>

        <details class="tool-panel filter-panel" ${open ? 'open' : ''} ontoggle="App.state.filterOpen = this.open">
          <summary><span class="tool-title">상세 조건으로 찾기</span>${selected.length ? `<span class="badge badge-accent">${selected.length}개 선택</span>` : ''}<span class="chevron" aria-hidden="true"></span></summary>
          <div class="filter-rows" id="guide-filter-rows">${this.guideFilterRowsHtml()}</div>
        </details>

        <div id="guide-results" class="guide-results">${this.guideResultsHtml()}</div>
        <p class="muted small">구체적인 사안의 교육활동 침해 해당 여부는 사실관계 조사와 지역교권보호위원회 심의로 판단돼요.</p>
        ${this.renderSources('guide')}
      </section>
    `;
  },

  // ══════════════ 지원 찾기 = 연결 → 유형 선택 → 신청·상담 ══════════════
  // 현재 지역에서 실제로 지원이 있는 유형만
  availableTypes() {
    const R = this.R;
    return R ? SUPPORT_TYPES.filter(t => R.programs.some(p => inType(p, t))) : SUPPORT_TYPES;
  },

  // 지역 지원 허브: 왼쪽 대표 창구, 오른쪽 공식 확인된 바로가기(시·도교육청 홈페이지는 항상)
  renderHub(R) {
    const links = [
      ...(R.links || []).slice().sort((a, b) => CHANNEL_ORDER.indexOf(a.type) - CHANNEL_ORDER.indexOf(b.type)),
      { type: 'office', label: R.office, url: R.officeUrl }
    ];
    const linkHtml = links.map(l => `
      <li><a class="hub-link" href="${l.url}" target="_blank" rel="noopener">
        <span class="hub-link-type">${HUB_TYPE_LABEL[l.type]}</span><span class="hub-link-label">${l.label}</span><span aria-hidden="true">↗</span>
      </a></li>
    `).join('');
    return `
      <div class="hub">
        <div class="hub-main">
          <p class="hub-region">${R.short} 교육활동 보호 지원</p>
          <p class="panel-hot-label">${R.hotName}</p>
          ${R.hotContacts ? '' : '<a href="{TEL}" class="panel-hot">{HOT}</a>'}
          ${R.menu
            ? `<ol class="hotline-menu">${R.menu.map(m => `<li>${m}</li>`).join('')}</ol>`
            : `<p class="muted small">${R.hotSummary || R.menuNote || ''}</p>`}
          ${R.hotContacts
            ? `<div class="panel-actions panel-actions-split">${this.hotContactButtons(R)}</div>`
            : '<a href="{TEL}" class="btn btn-primary"><span aria-hidden="true">☎</span> 전화 상담 {HOT}</a>'}
        </div>
        <div class="hub-links">
          <p class="hub-links-title">바로 이용하기</p>
          <ul>
            ${linkHtml}
            <li><button class="hub-link" onclick="App.goHome('finder')"><span class="hub-link-type">찾기</span><span class="hub-link-label">내 교육지원청 찾기</span><span aria-hidden="true">→</span></button></li>
          </ul>
        </div>
      </div>
    `;
  },

  renderSupport() {
    const S = this.state;
    const R = this.R;
    if (!R) {
      return `
        <section class="section page">
          ${this.eyebrow('연결')}
          <h1 class="page-title">지원 찾기</h1>
          <p class="muted">지원 이름·신청 방법·연락처는 시·도교육청마다 달라요.</p>
          ${this.renderRegionPicker('근무 지역을 선택해 주세요')}
        </section>
      `;
    }
    const types = this.availableTypes();
    // 상황별 도움에서 넘어온 ‘관련 지원’ 묶음(여러 유형을 한 번에). 현재 지역에 있는 유형만 남겨요
    const relTypes = S.related ? types.filter(t => S.related.ids.includes(t.id)) : [];
    const relMode = S.supportType === 'related' && relTypes.length > 0;
    const cur = relMode ? null : types.find(t => t.id === S.supportType);
    const areasOf = list => list.flatMap(t => t.areas);
    const chipDefs = [
      ...(relTypes.length ? [{ id: 'related', label: '이 상황 관련', areas: areasOf(relTypes) }] : []),
      { id: 'all', label: '전체' }, ...types
    ];
    const selectedId = relMode ? 'related' : (cur ? cur.id : 'all');
    const chips = chipDefs.map(t => {
      const on = selectedId === t.id;
      const n = t.id === 'all' ? R.programs.length : R.programs.filter(p => inType(p, t)).length;
      return `<button class="chip ${on ? 'active' : ''}" aria-pressed="${on}" onclick="App.setState({ supportType: '${t.id}' })">${t.label} <span class="chip-count">${n}</span></button>`;
    }).join('');
    const programs = R.programs.filter(p => relMode ? relTypes.some(t => inType(p, t)) : (!cur || inType(p, cur)));
    const items = programs.map(p => `
      <li class="support-item" data-sp="${escapeAttr([p.t, p.sum, programAreas(p).join(' '), SUPPORT_TYPES.filter(t => inType(p, t)).map(t => t.label + ' ' + t.desc).join(' '), p.org].join(' '))}">
        <div class="support-head">
          <h3 class="sub-title">${p.t}</h3>
          ${p.status && p.status !== '현재 시행 중' ? `<span class="badge badge-accent">${p.status}</span>` : ''}
        </div>
        <p>${p.sum}</p>
        ${p.amount ? `<p class="support-amount"><span class="support-amount-label">지원 범위 · ${R.short} 기준</span> ${p.amount}</p>` : ''}
        ${p.apply || p.contact || p.contacts ? this.facts([
          ['어디에 신청하나요?', p.apply || ''],
          // 용도가 다른 번호(contacts)는 용도별로 나눠 보여 줘요
          ...(p.contacts ? p.contacts.map(c => [c.label, linkifyPhone(c.value)]) : [['연락처', p.contact ? linkifyPhone(p.contact) : '']])
        ]) : `<p class="muted small">신청 방법·연락처는 아래 공식 안내나 소속 학교에 확인하세요.</p>`}
        ${this.supportDetail(p)}
        ${actionButtons(programChannels(p))}
        <p class="muted small">${sourceLine(R, p)}</p>
      </li>
    `).join('');
    const directory = R.orgs.map(o => `
      <li><span class="dir-name">${o.name}</span>${o.contact ? `<span class="dir-contact">${linkifyPhone(o.contact)}</span>` : ''}</li>
    `).join('');
    return `
      <section class="section page">
        ${this.eyebrow('연결')}
        <h1 class="page-title">지원 찾기</h1>
        <p class="muted">현재 지역(${R.name})에서 이용할 수 있는 상담·치료·법률·경호 등의 지원을 찾아보세요.</p>
        <p class="muted small">특별휴가·병가·휴직처럼 직접 사용하는 제도는 <button class="link-btn small" onclick="App.nav('care')">회복·보호</button>에 있어요.</p>
        ${this.renderHub(R)}
        <div class="tool-panel">
          <p class="tool-title">어떤 도움이 필요하신가요?</p>
          <div class="chip-row" role="group" aria-label="도움 유형">${chips}</div>
        </div>
        <div class="result-head" aria-live="polite">
          <div>
            <p class="result-count">${relMode ? `이 상황과 관련된 지원: ${relTypes.map(t => t.label).join(' · ')}` : `${R.short} ${cur ? cur.label + ' 지원' : '지원 전체'} ${programs.length}건`}</p>
            ${relMode ? `<p class="muted small">${(this.situById(S.related.situId) || { title: '선택한 상황' }).title} · ${R.short} 지원 ${programs.length}건</p>` : ''}
          </div>
          ${relMode || cur ? `<button class="btn btn-secondary" onclick="App.setState({ supportType: 'all' })">전체 보기</button>` : ''}
        </div>
        <div class="sup-print" data-print>
        ${cur ? this.supportGuideBox(cur) : ''}
        <div class="tool-panel guide-search-panel sup-search-panel">
          <label class="guide-search-label" for="sup-search">찾는 지원이 있나요?</label>
          <div class="guide-search-field">
            <input id="sup-search" class="guide-search-input" type="search" value="${escapeAttr(this._supQuery || '')}"
              placeholder="상담, 치료비, 변호사, 경호, 공제, 민원, 갈등조정..." autocomplete="off" enterkeyhint="search"
              oninput="App.filterSupport(this.value)" aria-describedby="sup-count">
            <button type="button" id="sup-search-clear" class="guide-search-clear" onclick="App.clearSupportSearch()" aria-label="검색어 지우기" ${guideSearchTerms(this._supQuery || '').length ? '' : 'hidden'}>지우기</button>
          </div>
          <p id="sup-count" class="muted small guide-search-hint" aria-live="polite"></p>
        </div>
        <ul class="support-list" id="support-results">${items}</ul>
        </div>
        <p class="note" id="sup-empty" hidden>검색어에 맞는 지원이 없어요. 위 유형에서 고르거나 대표번호(<a href="${telHref(R.hot)}">${R.hot}</a>)로 문의하세요.</p>
        <h2 class="h2">기관 연락처</h2>
        <ul class="directory">
          ${directory}
          <li><span class="dir-name">담당 교육지원청</span><span class="dir-contact"><button class="link-btn" onclick="App.goHome('finder')">내 교육지원청 찾기</button></span></li>
          <li><span class="dir-name">경찰(긴급 상황)</span><span class="dir-contact"><a href="tel:112">112</a></span></li>
        </ul>
        ${this.renderSources('support')}
      </section>
    `;
  },

  // 지원 유형의 공통 기준(접힘) + 회복·보호 제도 연결. 지역 사업은 아래 카드에 있어요
  supportGuideBox(t) {
    const g = t.guide;
    const careIds = t.care ? t.care.ids.map(benefitById).filter(Boolean) : [];
    return `
      <div class="sup-guide">
        ${g ? `
          <details class="support-more sup-guide-detail">
            <summary>${t.label} 지원, 공통 기준 보기 <span class="muted small">무엇 · 누가 · 언제 · 어디에</span></summary>
            <div class="bf-grid">${this.facts([['어떤 지원인가요?', g.what], ['누가 받을 수 있나요?', g.who]])}${this.facts([['언제 신청하나요?', g.when], ['어디에 신청하나요?', g.apply]])}</div>
            ${missedBox(g.missed, '놓치기 쉬워요')}
            ${refsBox(g.refs, g.basis)}
          </details>` : ''}
        ${careIds.length ? `
          <div class="bf-cross">
            <p class="bf-cross-q">${t.care.q}</p>
            <div class="bf-list">${careIds.map(b => `<button class="bf-chip" onclick="App.openBenefit('${b.id}')"><span aria-hidden="true">${b.e}</span> ${b.t} 제도 확인</button>`).join('')}</div>
          </div>` : ''}
        ${t.id === 'office' ? `<button class="btn btn-secondary" onclick="App.goHome('finder')">내 교육지원청 찾기 →</button>` : ''}
        ${this.shareTools({ page: 'support', supportType: t.id, regionId: this.state.regionId }, '지원 찾기 · ' + t.label, true)}
      </div>
    `;
  },

  // 지원 카드의 ‘자세히’: 누가·언제·준비물·주의·담당(공식 자료로 확인한 값만, 없는 항목은 숨겨요)
  supportDetail(p) {
    const rows = [
      ['누가 이용할 수 있나요?', p.eligibility || p.target], ['언제 신청하나요?', p.timing],
      ['준비하면 좋은 것', p.documents], ['주의할 점', p.caution], ['담당', p.org]
    ].filter(([, v]) => v);
    if (!rows.length) return '';
    return `
      <details class="support-more">
        <summary>자세히 <span class="muted small">${rows.map(([k]) => k.replace(/\?$/, '')).join(' · ')}</span></summary>
        ${this.facts(rows)}
      </details>
    `;
  },

  // ══════════════ 화면별 출처 ══════════════
  // 지역을 고르면 그 지역 sources 중 이 화면 용도(uses)에 맞는 자료만 ‘안내 근거 · 지역’으로 보여 주고,
  // 전국 공통 법적·정책 근거(COMMON_PUBLIC_SOURCES)는 그 아래 작게 붙여요(교육지원청 찾기 제외). 다른 시·도 자료나 내부 검증 자료는 보이지 않아요.
  // 지역 자료가 없는 화면(또는 공통 모드)은 ‘공통 안내 근거’만 보여 줘요.
  renderSources(use) {
    const R = this.R;
    const own = R ? R.sources.filter(s => (s.uses || []).includes(use)) : [];
    if (own.length) {
      // 교육지원청 찾기는 관할 자료만(공통 법적·정책 근거는 관할과 무관해 붙이지 않아요)
      return sourceBox(`안내 근거 · ${R.short}`, own, latestDate(own), '', use === 'finder' ? [] : COMMON_PUBLIC_SOURCES);
    }
    if (use === 'finder') return '';
    const note = R ? `${R.office}의 세부 기준은 소속 교육(지원)청 안내를 확인해 주세요.` : '';
    return sourceBox('공통 안내 근거', COMMON_PUBLIC_SOURCES, latestDate(COMMON_PUBLIC_SOURCES), note);
  },

  // ══════════════ 푸터(서비스 안내) ══════════════
  renderFooter() {
    const R = this.R;
    return `
      <footer class="site-footer">
        <div class="footer-inner footer-grid">
          <div class="footer-main">
            <p class="footer-title">선생님 곁에 · 서비스 안내</p>
            <p>교사를 위한 교육활동 보호·대응 가이드예요.</p>
            <p>공식 기관이 운영하는 서비스가 아니며, 시·도교육청 공식 자료를 바탕으로 정리했어요.</p>
            <p>실제 사안의 판단과 절차는 학교와 ${R ? R.office : '소속 시·도교육청'}, 소속 교육지원청의 최신 안내를 따라 주세요.</p>
            <p>선택한 지역, 체크 상태(대응 절차·행동 체크), 업데이트 알림 확인 여부만 이 기기에 저장하고, 서버로 보내지 않아요.</p>
          </div>
          <div class="footer-side">
            <div class="footer-official">
              <p class="footer-side-title">최신 안내 확인</p>
              ${R
                ? `<p>최신 내용은 <a href="${R.officeUrl}" target="_blank" rel="noopener">${R.office} 홈페이지<span class="sr-only"> (새 창)</span> <span aria-hidden="true">↗</span></a>에서 확인하세요.</p>`
                : `<p>공통 안내는 교육부 「교육활동 보호 매뉴얼」과 관련 법령을 바탕으로 해요. 근무 지역을 고르면 그 시·도교육청 안내를 함께 보여 줘요.</p>`}
              <p>화면마다 아래쪽 ‘안내 근거’에 그 화면에 쓴 공식 자료를 적어 두었어요.</p>
            </div>
            ${UpdateUI.footerBlock()}
            ${this.feedbackCard()}
          </div>
        </div>
      </footer>
    `;
  },

  feedbackCard() {
    if (!feedbackEnabled()) return '';
    const S = this.state;
    const link = (type, text, cls) => `<a class="${cls}" href="${escapeAttr(buildFeedbackUrl(S, type))}" target="_blank" rel="noopener">${text}<span class="sr-only"> (의견 양식, 새 창)</span></a>`;
    return `
      <section class="fb-card" aria-labelledby="fb-title">
        <h2 class="fb-title" id="fb-title">의견을 들려주세요</h2>
        <p class="fb-q">이 안내가 도움이 되었나요?</p>
        <div class="fb-choices">
          ${link('helpful', '도움이 되었어요', 'fb-btn')}
          ${link('needs-improvement', '보완이 필요해요', 'fb-btn')}
        </div>
        <p class="fb-more">정보가 바뀌었거나 잘못된 내용을 발견하셨다면 알려주세요.</p>
        <p class="fb-more-link">${link('general', '의견 보내기 <span aria-hidden="true">↗</span>', 'fb-link')}</p>
        <p class="fb-privacy">학생·보호자·교직원의 이름, 학교명, 연락처 등 개인을 식별할 수 있는 정보나 구체적인 사건 내용은 입력하지 마세요.</p>
      </section>
    `;
  },

  // ══════════════ 모바일 하단 내비게이션 ══════════════
  renderBottomNav() {
    const S = this.state;
    const icons = {
      home: '<path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z"/>',
      proc: '<path d="M8 6h13M8 12h13M8 18h13M3.5 6h.01M3.5 12h.01M3.5 18h.01"/>',
      guide: '<circle cx="12" cy="12" r="9"/><path d="M12 8v4l3 2"/>',
      care: '<path d="M12 20s-7-4.3-8.9-8.6A4.9 4.9 0 0 1 12 6.6a4.9 4.9 0 0 1 8.9 4.8C19 15.7 12 20 12 20z"/>',
      support: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/>'
    };
    const tabs = PAGES.map(([id, label]) => `
      <button class="bn-btn ${S.page === id ? 'active' : ''}" ${S.page === id ? 'aria-current="page"' : ''} onclick="App.nav('${id}')">
        <svg viewBox="0 0 24 24" aria-hidden="true">${icons[id]}</svg><span>${label}</span>
      </button>
    `).join('');
    return `<nav class="bottom-nav" aria-label="하단 메뉴">${tabs}</nav>`;
  }
};

// ── 회복·보호(BENEFITS)·지원 유형(SUPPORT_TYPES) 헬퍼 ──
function benefitById(id) {
  return BENEFITS.find(b => b.id === id) || null;
}

function supportTypeById(id) {
  return SUPPORT_TYPES.find(t => t.id === id) || null;
}

// 지원 항목의 area는 문자열 또는 배열이에요(법률 상담과 수사·소송 지원을 함께 하는 사업)
function programAreas(p) {
  return [].concat(p.area);
}

function inType(p, t) {
  return programAreas(p).some(a => t.areas.includes(a));
}

// 핵심 범위 배지 + 교원 신분 배지(국·공립 기준 / 신분별 확인). 사용자의 신분을 추정하지 않고 적용 범위만 알려요
function benefitBadges(b) {
  const scope = EMPLOYMENT_SCOPES[b.employment];
  const own = (b.badges || []).map((t, i) => `<span class="bf-badge ${i ? 'bf-cond' : ''}">${t}</span>`).join('');
  return own + (scope && scope.badge ? `<span class="bf-badge bf-scope">${scope.badge}</span>` : '');
}

function benefitChip(b) {
  const first = (b.badges || [])[0];
  return `<button class="bf-chip" onclick="App.openBenefit('${b.id}')"><span aria-hidden="true">${b.e}</span> ${b.t}${first ? ` <span class="bf-badge">${first}</span>` : ''}</button>`;
}

// 지원 유형 버튼: 지역을 골랐으면 ‘인천 상담·회복 지원’처럼 지역을 붙여요
function supportChip(t, R) {
  return `<button class="bf-chip sup-chip" onclick="App.openSupport('${t.id}')">${R ? R.short + ' ' : ''}${t.label} 지원 보기 <span aria-hidden="true">→</span></button>`;
}

// 놓치기 쉬워요 상자(공통·지역 기준을 섞지 않고 각자의 상자에)
function missedBox(list, title) {
  return list && list.length ? `
    <div class="prot-missed">
      <p class="prot-missed-title">${title}</p>
      <ul>${list.map(m => `<li>${m}</li>`).join('')}</ul>
    </div>` : '';
}

// 공식 근거: 조문 요약 + COMMON_PUBLIC_SOURCES 링크(접힘)
// verifiedAt: 제도(BENEFITS)를 공식 근거와 마지막으로 대조한 날(없으면 근거 자료의 확인일)
function refsBox(refs, basis, verifiedAt) {
  const srcs = (refs || []).map(id => COMMON_PUBLIC_SOURCES.find(s => s.id === id)).filter(Boolean);
  if (!basis && !srcs.length) return '';
  return `
    <details class="bf-refs">
      <summary>공식 근거${srcs.length ? ` ${srcs.length}건 · ${fmtDate(verifiedAt || latestDate(srcs))} 확인` : ''}</summary>
      ${basis ? `<p class="muted small">${basis}</p>` : ''}
      ${srcs.length ? `<ul class="source-common">${srcs.map(s => `<li><a href="${s.url}" target="_blank" rel="noopener">${s.title}</a></li>`).join('')}</ul>` : ''}
    </details>`;
}

// 제도 검색(제목 + keywords + 요약, 공백으로 나눈 검색어는 모두 포함)
function matchesBenefit(b, terms) {
  const corpus = normalizeGuideSearch([b.t, ...(b.keywords || []), b.d].join(' '));
  return terms.every(t => corpus.includes(t));
}

function matchBenefits(query) {
  const terms = guideSearchTerms(query);
  if (!terms.length) return [];
  return BENEFITS.filter(b => {
    const corpus = normalizeGuideSearch([b.t, ...(b.keywords || [])].join(' '));
    return terms.every(t => corpus.includes(t));
  });
}

// ── 공통 모드(지역 미선택) 안내 문구 ──
// 특정 시·도의 번호·기관·사업·처리 기한을 넣지 않아요. 지역과 관계없이 먼저 확인할 기본 대응만 담아요
const COMMON_FIRST = [
  { t: '안전 확보', d: '폭행·협박·난입 등 즉각적인 위험이 있으면 현장을 벗어나고, 긴급하면 <a href="tel:112">112</a>에 신고하세요.', urgent: true },
  { t: '학교에 알리기', d: '관리자 또는 학교 교육활동 보호 담당자에게 상황을 공유하세요.' },
  { t: '사실관계 기록', d: '언제·어디서·어떤 일이 있었는지 시간순으로 적고, 문자·게시물·사진·영상 등은 원본을 보존하세요.' },
  { t: '필요한 지원 확인', d: '법률·심리·치료 지원이 필요하면 소속 학교나 교육(지원)청의 교육활동 보호 창구를 확인하세요.' }
];
// 대응 절차 4단계(STEPS)를 공통 수준으로 요약한 이름·설명(순서는 STEPS와 같아요)
const COMMON_FLOW = [
  { t: '학교 초기 대응', d: '안전 확보, 학교 보고, 보호조치 요청' },
  { t: '교육(지원)청 보고·조사', d: '학교 보고 후 사실관계 조사' },
  { t: '필요한 경우 심의', d: '침해 여부와 조치를 위원회에서 심의' },
  { t: '보호·회복 지원', d: '조치 이행, 심리상담·치료 등 회복 지원' }
];

// ── 신청·상담·안내 경로 ──
// 우선순위: 실제 신청 → 전화 → 카카오톡 → 공식 안내. 한 카드에 최대 3개까지만 보여요
const CHANNEL_ORDER = ['apply', 'phone', 'kakao', 'guide', 'office', 'officeGuide'];
// 지역 지원 허브의 링크 종류 표시
const HUB_TYPE_LABEL = { apply: '신청', kakao: '상담', guide: '안내', office: '교육청' };
const CHANNEL_LABEL = { apply: '온라인 신청', kakao: '카카오톡 상담', phone: '전화 문의', guide: '공식 안내', office: '교육지원청 홈페이지', officeGuide: '교육활동보호 안내' };

// 지원 항목: 데이터의 channels + 전화 버튼. 용도별 번호(contacts)가 있으면 call이 붙은 번호로, 없으면 연락처의 첫 번호로 걸어요
function programChannels(p) {
  const list = (p.channels || []).slice();
  const callable = p.contacts && p.contacts.find(c => c.call);
  const phone = firstPhone(callable ? callable.value : p.contact);
  if (phone) list.push({ type: 'phone', tel: phone, label: callable ? callable.call : undefined });
  return list;
}

// 교육지원청: 대표번호 + 홈페이지 + 교육활동보호 안내 페이지(공식 확인된 것만 데이터에 있어요)
function officeChannels(o) {
  const list = [];
  const phone = firstPhone(o.contact);
  if (phone) list.push({ type: 'phone', tel: phone });
  if (o.url) list.push({ type: 'office', url: o.url, label: o.name });
  if (o.guideUrl) list.push({ type: 'officeGuide', url: o.guideUrl });
  return list;
}

function actionButtons(channels) {
  const sorted = channels.slice().sort((a, b) => CHANNEL_ORDER.indexOf(a.type) - CHANNEL_ORDER.indexOf(b.type)).slice(0, 3);
  if (!sorted.length) return '';
  return `<div class="channel-row">${sorted.map((c, i) => {
    const label = c.label || CHANNEL_LABEL[c.type];
    const cls = i === 0 ? 'btn btn-primary' : 'btn btn-secondary';
    return c.type === 'phone'
      ? `<a class="${cls}" href="${telHref(c.tel)}"><span aria-hidden="true">☎</span> ${label} <span class="btn-sub">${c.tel}</span></a>`
      : `<a class="${cls}" href="${c.url}" target="_blank" rel="noopener">${label} <span aria-hidden="true">↗</span></a>`;
  }).join('')}</div>`;
}

// 긴급성 배지(색만으로 구분하지 않도록 글자로 표시)
function urgencyBadge(u) {
  const cls = u === URGENCY_ORDER[0] ? 'tag tag-danger' : u === URGENCY_ORDER[1] ? 'badge badge-accent' : 'badge';
  return `<span class="${cls}">${u}</span>`;
}

function isDesktop() {
  try { return window.matchMedia('(min-width: 769px)').matches; } catch (e) { return true; }
}

function firstPhone(text) {
  const m = /(?<![\d-])(?:0\d{1,2}|1\d{3})-\d{3,4}(?:-\d{4})?(?![\d-])/.exec(text || '');
  return m ? m[0] : null;
}

// ── 저장소(사생활 보호 모드 등에서 실패해도 동작하도록 모두 try/catch) ──
function storeGet(key) {
  try { return localStorage.getItem(key); } catch (e) { return null; }
}

function storeSet(key, value) {
  try {
    if (value === null || value === undefined) localStorage.removeItem(key);
    else localStorage.setItem(key, value);
  } catch (e) {}
}

function loadChecks() {
  LEGACY_CHECK_KEYS.forEach(k => storeSet(k, null));
  try {
    const v = JSON.parse(storeGet(STORAGE_CHECKS) || '{}');
    return v && typeof v === 'object' && !Array.isArray(v) ? v : {};
  } catch (e) { return {}; }
}

function loadActionChecks() {
  try {
    const v = JSON.parse(storeGet(STORAGE_ACTIONS) || '{}');
    return v && typeof v === 'object' && !Array.isArray(v) ? v : {};
  } catch (e) { return {}; }
}

// ── 공유 주소 ──
// ?region=incheon&page=care&benefit=special-leave · ?region=seoul&page=guide&situ=physical-assault · ?region=gyeonggi&page=support&type=legal
// ?region=common&page=proc&step=2 · ?region=common&page=care&compare=leave
// 화면마다 그 화면의 항목 하나만 넣어요. 검색어·체크·스크롤·사소한 펼침 상태는 넣지 않아요.
// 지역은 늘 적어요(공통이면 region=common). 그래야 받는 사람이 저장해 둔 지역과 관계없이 보낸 사람이 보던 지역 그대로 열려요.
// 지역 선택 첫 화면(onboarding)에서만 지역을 적지 않아요
function shareParamsOf(st) {
  const q = new URLSearchParams();
  if (st.regionId && REGIONS[st.regionId]) q.set('region', st.regionId);
  else if (!st.onboarding) q.set('region', COMMON_REGION);
  const page = st.page || 'home';
  if (page !== 'home') q.set('page', page);
  // 회복·보호: 펼친 제도가 더 구체적이라 먼저, 없으면 비교표
  if (page === 'care' && st.benefit && benefitById(st.benefit)) q.set('benefit', st.benefit);
  else if (page === 'care' && st.compare && COMPARISONS.some(c => c.id === st.compare)) q.set('compare', st.compare);
  if (page === 'guide' && typeof st.situ === 'string' && st.situ.startsWith('situ:') && SITUS.some(x => 'situ:' + x.id === st.situ)) q.set('situ', st.situ.slice(5));
  if (page === 'support' && st.supportType && SUPPORT_TYPES.some(t => t.id === st.supportType)) q.set('type', st.supportType);
  if (page === 'proc' && Number.isInteger(st.step) && st.step > 0) q.set('step', String(st.step + 1));
  return q;
}

// relative: 주소창용(경로 + 쿼리), 아니면 다른 사람에게 보낼 전체 주소
function shareUrlOf(st, relative) {
  const qs = shareParamsOf(st).toString();
  const rel = location.pathname + (qs ? '?' + qs : '');
  return relative ? rel : location.origin + rel;
}

// 처음 들어온 주소의 공유 상태를 읽어요. 알 수 없는 값은 무시하고 기본 화면으로. 화면(page)이 정해졌으면 true
function applySharedQuery(S) {
  let q;
  try { q = new URLSearchParams(location.search); } catch (e) { return false; }
  const page = q.get('page');
  if (!page || !PAGES.some(([id]) => id === page)) return false;
  S.page = page;
  const benefit = q.get('benefit');
  const compare = q.get('compare');
  const situ = q.get('situ');
  const type = q.get('type');
  const step = parseInt(q.get('step'), 10);
  if (page === 'care' && compare && COMPARISONS.some(c => c.id === compare)) S.compare = compare;
  if (page === 'care' && benefit && benefitById(benefit)) S.benefit = benefit;
  if (page === 'guide' && situ && SITUS.some(x => x.id === situ)) S.situ = 'situ:' + situ;
  if (page === 'support' && type && SUPPORT_TYPES.some(t => t.id === type)) S.supportType = type;
  if (page === 'proc' && step >= 1 && step <= STEPS.length) S.step = step - 1;
  return true;
}

// Clipboard API를 못 쓸 때(권한·http 등) 선택 후 복사
function copyWithSelection(text) {
  try {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    ta.remove();
    return ok;
  } catch (e) { return false; }
}

// ── 인쇄 ──
// 인쇄 머리: 서비스 이름 · 화면 > 항목 · 지역 기준 · 인쇄 날짜와 공유 주소
function fillPrintHead(title) {
  const head = document.getElementById('print-head');
  if (!head) return;
  const S = App.state;
  const R = App.R;
  const pageLabel = (PAGES.find(([id]) => id === S.page) || [, ''])[1];
  const today = new Date();
  head.innerHTML = `
    <p class="print-brand">선생님 곁에 · 교육활동 보호·대응 가이드</p>
    <p class="print-title">${title || pageLabel}</p>
    <p class="print-meta">${R ? R.name + ' 기준' : '전국 공통 기준'} · 2026년 공식 자료 기준 · 인쇄 ${today.getFullYear()}. ${today.getMonth() + 1}. ${today.getDate()}.</p>
    <p class="print-meta print-url">${escapeAttr(shareUrlOf(S, false))}</p>`;
}

// 이 내용만 인쇄할 때: 대상의 조상마다 형제 요소를 인쇄에서 숨기고, 대상 안의 접힌 상자(근거 등)는 펼쳐요
function preparePrint(target, title) {
  cleanupPrint();
  document.body.classList.add('print-focus');
  let el = target;
  while (el && el.id !== 'main' && el.parentElement) {
    [...el.parentElement.children].forEach(sib => { if (sib !== el && sib.id !== 'print-head') sib.setAttribute('data-print-hide', ''); });
    el = el.parentElement;
  }
  target.querySelectorAll('details:not([open])').forEach(d => { d.open = true; d.setAttribute('data-print-opened', ''); });
  fillPrintHead(title);
}

function cleanupPrint() {
  document.body.classList.remove('print-focus');
  document.querySelectorAll('[data-print-hide]').forEach(e => e.removeAttribute('data-print-hide'));
  document.querySelectorAll('[data-print-opened]').forEach(d => { d.open = false; d.removeAttribute('data-print-opened'); });
}

// 브라우저 메뉴로 인쇄할 때도 머리를 채우고, 펼쳐 둔 상세 안의 접힌 근거는 펼쳐요(닫힌 항목 전체를 펼치지는 않아요)
window.addEventListener('beforeprint', () => {
  if (document.body.classList.contains('print-focus')) return;
  fillPrintHead();
  document.querySelectorAll('.action.open details:not([open]), .sup-guide details:not([open])').forEach(d => { d.open = true; d.setAttribute('data-print-opened', ''); });
});
window.addEventListener('afterprint', cleanupPrint);

// 주소의 region: 시·도 id면 그 지역, common이면 공통(null), 없거나 알 수 없는 값이면 undefined(무시하고 저장된 지역을 써요)
function urlRegion() {
  let q = null;
  try { q = new URLSearchParams(location.search).get('region'); } catch (e) {}
  if (q === COMMON_REGION) return null;
  return q && REGIONS[q] ? q : undefined;
}

// 주소의 region → 저장된 지역 → 미선택 순.
// 공유 받은 주소의 지역은 이 탭의 화면에만 적용하고, 받는 사람이 저장해 둔 지역은 덮어쓰지 않아요
// (저장된 지역이 없을 때만 그 시·도를 저장해 다음 방문에 이어 써요. 일반 진입은 지금처럼 저장된 지역으로 열려요)
function initialRegionId() {
  const fromUrl = urlRegion();
  let saved = storeGet(STORAGE_REGION);
  if (saved && !REGIONS[saved]) { storeSet(STORAGE_REGION, null); saved = null; }
  if (fromUrl === undefined) return saved || null;
  if (fromUrl && !saved) storeSet(STORAGE_REGION, fromUrl);
  return fromUrl;
}

// ── 지역 데이터 도우미 ──
// 교육지원청 목록 → [{ area, office }] (시·군·구 가나다순)
function regionAreas(R) {
  return R.offices
    .flatMap(o => o.areas.map(area => ({ area, office: o })))
    .sort((a, b) => a.area.localeCompare(b.area, 'ko'));
}

// source는 sources 배열 번호 하나 또는 번호 배열이에요(근거 자료가 둘 이상이면 ‘근거 자료 1·2’)
function sourceLine(R, item) {
  const ids = item.source === undefined ? [] : [].concat(item.source);
  const srcs = ids.map(i => R.sources[i]).filter(Boolean);
  // 항목마다 적어 둔 확인일(verifiedAt)이 있으면 그 날짜, 없으면 근거 자료의 확인일
  const date = fmtDate(item.verifiedAt || latestDate(srcs.length ? srcs : [R]) || R.verifiedAt);
  const links = srcs.filter(s => s.url).map((s, i, arr) =>
    `<a href="${s.url}" target="_blank" rel="noopener" title="${escapeAttr(s.title)}">근거 자료${arr.length > 1 ? ' ' + (i + 1) : ''}</a>`);
  // 원문 게시물이 사라진 항목은 날짜 옆에 짧게 알려요(reviewStatus: source-unavailable)
  const gone = item.reviewStatus === 'source-unavailable' ? ' · 원문 게시물을 다시 확인하고 있어요' : '';
  return `${date} 최종 확인${gone}${links.length ? ' · ' + links.join(' · ') : ''}`;
}

// 접이식 출처 상자: 제목 · 최종 확인일 → 출처 목록(+ 안내 문구, + 공통 법적·정책 근거를 작게)
function sourceBox(label, sources, verifiedAt, note, common) {
  const list = arr => arr.map(s => `
    <li>${s.url ? `<a href="${s.url}" target="_blank" rel="noopener">${s.title}</a>` : s.title}${s.verifiedAt ? ` <span class="muted">· ${fmtDate(s.verifiedAt)} 확인</span>` : ''}</li>
  `).join('');
  return `
    <details class="source-box">
      <summary>${label} · ${fmtDate(verifiedAt)} 최종 확인</summary>
      <ul>${list(sources)}</ul>
      ${note ? `<p>${note}</p>` : ''}
      ${common && common.length ? `<p class="source-sub">공통 법적·정책 근거</p><ul class="source-common">${list(common)}</ul>` : ''}
    </details>
  `;
}

// ── 의견 받기(Google Form) ──
// 양식 주소(FEEDBACK_URL)와 미리 채우기 칸(FEEDBACK_FIELDS)은 data/common.js 한 곳에서만 정해요.
// 주소가 비어 있으면 의견 카드·링크를 아예 그리지 않아요(누를 수 없는 버튼·‘준비 중’ 표시 없음).
// 보내는 값: 의견 종류와 지금 보는 화면(공유 주소와 같은 지역·화면·항목). 검색어·체크·입력 내용은 보내지 않아요
const FEEDBACK_TYPES = ['helpful', 'needs-improvement', 'general'];
const FEEDBACK_HOST = /^https:\/\/(docs\.google\.com\/forms\/|forms\.gle\/)/;

function feedbackEnabled() {
  return typeof FEEDBACK_URL === 'string' && FEEDBACK_HOST.test(FEEDBACK_URL);
}

// 공유 주소를 만드는 함수(shareParamsOf·shareUrlOf)를 그대로 써서 같은 상태만 꺼내요
function feedbackContext(st) {
  const q = shareParamsOf(st);
  const step = q.get('step');
  return {
    region: q.get('region') || COMMON_REGION,
    page: q.get('page') || 'home',
    item: q.get('benefit') || q.get('compare') || q.get('situ') || q.get('type') || (step ? 'step-' + step : ''),
    url: shareUrlOf(st, false)
  };
}

// FEEDBACK_FIELDS에 entry 번호가 적힌 칸만 미리 채워요(번호가 없으면 양식 주소만 열어요)
function buildFeedbackUrl(st, type) {
  if (!feedbackEnabled()) return '';
  let url;
  try { url = new URL(FEEDBACK_URL); } catch (e) { return ''; }
  const fields = (typeof FEEDBACK_FIELDS === 'object' && FEEDBACK_FIELDS) || {};
  const values = { type: FEEDBACK_TYPES.includes(type) ? type : 'general', ...feedbackContext(st) };
  let filled = false;
  for (const [key, value] of Object.entries(values)) {
    const entry = fields[key];
    if (value && typeof entry === 'string' && /^entry\.\d+$/.test(entry)) { url.searchParams.set(entry, value); filled = true; }
  }
  if (filled) url.searchParams.set('usp', 'pp_url');
  return url.toString();
}

// 상세(상황·제도·지원 유형) 아래의 한 줄 의견 링크. 큰 카드는 서비스 안내에만 있어요
function feedbackLine(st, label) {
  if (!feedbackEnabled()) return '';
  return `<p class="fb-line">정보가 달라졌거나 보완이 필요하면 알려주세요. <a href="${escapeAttr(buildFeedbackUrl(st, 'general'))}" target="_blank" rel="noopener" aria-label="${escapeAttr(label)} 의견 보내기 (의견 양식, 새 창)">의견 보내기 <span aria-hidden="true">↗</span></a></p>`;
}

function latestDate(sources) {
  return sources.map(s => s.verifiedAt).filter(Boolean).sort().pop();
}

function fmtDate(iso) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || '');
  return m ? `${+m[1]}. ${+m[2]}. ${+m[3]}.` : '확인일 미기재';
}

function telHref(num) {
  return 'tel:' + String(num).replace(/\(.*?\)/g, '').replace(/[^0-9]/g, '');
}

function escapeAttr(text) {
  return String(text == null ? '' : text)
    .replace(/&/g, '&amp;').replace(/"/g, '&quot;')
    .replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function normalizeGuideSearch(text) {
  return String(text == null ? '' : text).toLocaleLowerCase('ko-KR').replace(/\s+/g, '');
}

function guideSearchTerms(query) {
  return String(query || '').trim().toLocaleLowerCase('ko-KR').split(/\s+/).map(normalizeGuideSearch).filter(Boolean);
}

function matchesGuideSearch(situ, query) {
  const terms = guideSearchTerms(query);
  if (!terms.length) return true;
  const corpus = normalizeGuideSearch([
    situ.title,
    ...(situ.keywords || []),
    ...(situ.contexts || []),
    ...(situ.officialTypes || []),
    situ.example
  ].filter(Boolean).join(' '));
  return terms.every(term => corpus.includes(term));
}

// 공통 데이터 안의 지역 토큰을 현재 지역 값으로 바꿔요. 지역 미선택이면 중립 문구를 써요.
function T(str) {
  const R = REGIONS[App.state.regionId];
  const terms = R ? R.terms : NEUTRAL_TERMS;
  return String(str).replace(/\{(HOT1|HOT2|HOT|TEL|OFFICER|LEGAL|MUTUAL|SOS|MEDIATE)\}/g, (_, k) =>
    k === 'TEL' ? (R ? telHref(R.hot) : 'tel:112') : terms[k]);
}

// 02-1234-5678, 1600-8787, 032-1395(1번), 112 형태의 번호에 전화 링크를 걸어요
function linkifyPhone(text) {
  return String(text).replace(/(\d{2,4}-\d{3,4}(?:-\d{4})?(?:\(\d번\))?|\b112\b)/g, m => {
    return '<a href="' + telHref(m) + '" class="tel-link">' + m + '</a>';
  });
}

// ── 업데이트 알림(data/updates.js 하나로 헤더 표시·상단 안내바·내역 창·푸터를 만들어요) ──
// 자동으로 뜨는 창은 없어요. 내역 창은 누를 때만 열고, 주소(URL)·기록(history)은 바꾸지 않아요.
// 창은 #app 밖(body)에 두어 화면을 다시 그려도 닫히지 않아요. 저장이 막힌 브라우저에서도 이번 방문 동안은 메모리로 동작해요
const UpdateUI = {
  _seen: null,          // 저장이 실패해도 이번 방문에서는 읽음·닫음을 기억해요
  _bannerClosed: null,
  _trigger: null,

  list() { return typeof UPDATES !== 'undefined' && Array.isArray(UPDATES) ? UPDATES : []; },
  latest() { return this.list()[0] || null; },
  seenId() { return this._seen || storeGet(STORAGE_UPDATE_SEEN); },
  unread() { const u = this.latest(); return !!u && this.seenId() !== u.id; },
  day(iso) { const [y, m, d] = iso.split('-'); return { full: `${y}.${m}.${d}`, short: `${m}.${d}` }; },
  today() { return new Date(Date.now() + 9 * 3600 * 1000).toISOString().slice(0, 10); }, // 한국 날짜

  // 상단 안내바: showBanner인 가장 최근 업데이트 하나. 닫았거나, 그 뒤(또는 그) 업데이트 내역을 이미 열어 봤거나, 기간이 지나면 숨겨요
  banner() {
    const list = this.list();
    const b = list.find(u => u.showBanner);
    if (!b || (b.bannerUntil && this.today() > b.bannerUntil)) return null;
    if (this._bannerClosed === b.id || storeGet(STORAGE_UPDATE_BANNER) === b.id) return null;
    const seen = list.findIndex(u => u.id === this.seenId());
    if (seen !== -1 && seen <= list.indexOf(b)) return null;
    return b;
  },

  // PC 헤더: 지역 선택 옆의 작은 글자 버튼(880px 이하에서는 CSS로 숨기고 strip·푸터로 안내해요)
  chip() {
    const u = this.latest();
    if (!u) return '';
    const isNew = this.unread();
    return `<button type="button" class="update-chip${isNew ? ' is-new' : ''}" id="update-chip" aria-haspopup="dialog" onclick="UpdateUI.open('update-chip')">${isNew ? '<span class="update-dot" aria-hidden="true"></span>새 ' : ''}업데이트 ${this.day(u.date).short}<span class="sr-only"> 내역 보기</span></button>`;
  },

  // 헤더 바로 아래 한 줄: 큰 업데이트면 안내바(모든 폭), 아니면 880px 이하에서만 ‘새 업데이트’ 한 줄(읽으면 사라져요)
  strip() {
    const b = this.banner();
    if (b) {
      return `<div class="update-banner" id="update-strip" role="region" aria-label="새 소식">
        <div class="update-banner-inner">
          <p><span class="update-banner-label">새 소식</span> ${b.banner || b.title}</p>
          <button type="button" class="update-banner-more" id="update-banner-more" aria-haspopup="dialog" onclick="UpdateUI.open('update-banner-more')">자세히 보기</button>
          <button type="button" class="update-banner-close" aria-label="새 소식 안내 닫기" onclick="UpdateUI.closeBanner()"><span aria-hidden="true">×</span></button>
        </div>
      </div>`;
    }
    const u = this.latest();
    if (!u || !this.unread()) return '';
    return `<div class="update-line" id="update-strip">
      <button type="button" class="update-line-btn" id="update-line-btn" aria-haspopup="dialog" onclick="UpdateUI.open('update-line-btn')">
        <span class="update-dot" aria-hidden="true"></span><span class="update-line-text">새 업데이트 ${this.day(u.date).short} · ${u.title}</span><span aria-hidden="true">›</span>
      </button>
    </div>`;
  },

  // 공통 하단(서비스 안내): 최근 업데이트 한 건과 지원 지역 수, 전체 내역 열기
  footerBlock() {
    const u = this.latest();
    if (!u) return '';
    return `<div class="footer-update">
      <p class="footer-side-title">최근 업데이트</p>
      <p><span class="footer-update-date">${this.day(u.date).full}</span> ${u.title}</p>
      <p class="footer-update-meta">${this.day(u.date).full} 기준 · ${REGION_ORDER.length}개 시·도 안내</p>
      <button type="button" class="link-btn small" id="footer-update-btn" aria-haspopup="dialog" onclick="UpdateUI.open('footer-update-btn')">전체 업데이트 보기 <span aria-hidden="true">→</span></button>
    </div>`;
  },

  dialogHtml() {
    const items = this.list().map(u => `
      <li class="update-item">
        <p class="update-meta"><time datetime="${u.date}">${this.day(u.date).full}</time><span class="update-type">${u.type}</span></p>
        <h3 class="update-title">${u.title}</h3>
        <p class="update-summary">${u.summary}</p>
        ${u.details && u.details.length ? `<ul class="update-details">${u.details.map(d => `<li>${d}</li>`).join('')}</ul>` : ''}
      </li>`).join('');
    return `<div class="update-dialog-body">
      <div class="update-dialog-head">
        <h2 class="update-dialog-title" id="update-dialog-title" tabindex="-1">업데이트 내역</h2>
        <button type="button" class="update-dialog-close" aria-label="업데이트 내역 닫기" onclick="UpdateUI.close()"><span aria-hidden="true">×</span></button>
      </div>
      <p class="update-dialog-note">선생님 곁에에서 달라진 점을 최신순으로 알려 드려요.</p>
      <ol class="update-list">${items}</ol>
      <div class="update-dialog-foot"><button type="button" class="btn btn-secondary" onclick="UpdateUI.close()">닫기</button></div>
    </div>`;
  },

  open(triggerId) {
    if (!this.list().length) return;
    this._trigger = triggerId;
    let d = document.getElementById('update-dialog');
    if (!d) {
      d = document.createElement('dialog');
      d.id = 'update-dialog';
      d.className = 'update-dialog';
      d.setAttribute('aria-labelledby', 'update-dialog-title');
      d.addEventListener('close', () => UpdateUI.afterClose());
      // 창 바깥(배경)을 누르면 닫아요
      d.addEventListener('click', e => { if (e.target === d) UpdateUI.close(); });
      document.body.appendChild(d);
    }
    d.innerHTML = this.dialogHtml();
    if (!d.open) {
      if (typeof d.showModal === 'function') d.showModal(); else d.setAttribute('open', '');
    }
    const title = document.getElementById('update-dialog-title');
    if (title) title.focus();
    this.markSeen();
  },

  close() {
    const d = document.getElementById('update-dialog');
    if (!d || !d.open) return;
    if (typeof d.close === 'function') d.close(); else { d.removeAttribute('open'); this.afterClose(); }
  },

  // 닫으면 연 버튼으로 포커스를 돌려줘요. 그 버튼이 사라졌으면(안내바·모바일 한 줄) 보이는 업데이트 버튼이나 본문으로
  // 브라우저가 닫힘 처리를 끝낸 뒤에 옮겨야 포커스가 덮어써지지 않아요
  afterClose() {
    const trigger = this._trigger;
    this._trigger = null;
    setTimeout(() => {
      const visible = el => el && el.offsetParent !== null;
      const target = [trigger, 'update-chip'].map(id => id && document.getElementById(id)).find(visible);
      if (target) target.focus();
      else {
        const main = document.getElementById('main');
        if (main) { main.setAttribute('tabindex', '-1'); main.focus({ preventScroll: true }); }
      }
    }, 0);
  },

  // 최신 업데이트를 읽음으로 표시하고, 다시 그리지 않고 헤더 표시·한 줄 안내만 바꿔요(스크롤·입력 상태 유지)
  markSeen() {
    const u = this.latest();
    if (!u) return;
    this._seen = u.id;
    storeSet(STORAGE_UPDATE_SEEN, u.id);
    this.swap('update-chip', this.chip());
    this.swap('update-strip', this.strip());
  },

  closeBanner() {
    const b = this.banner();
    if (!b) return;
    this._bannerClosed = b.id;
    storeSet(STORAGE_UPDATE_BANNER, b.id);
    this.swap('update-strip', this.strip());
    const next = ['update-chip', 'update-line-btn'].map(id => document.getElementById(id)).find(el => el && el.offsetParent !== null);
    if (next) next.focus();
  },

  swap(id, html) {
    const el = document.getElementById(id);
    if (!el) return;
    if (!html) { el.remove(); return; }
    const t = document.createElement('template');
    t.innerHTML = html.trim();
    const next = t.content.firstElementChild;
    // 같은 종류의 요소면 그 자리에서 내용만 바꿔요(포커스·연 버튼이 그대로 남아요)
    if (next.tagName === el.tagName) {
      [...el.attributes].forEach(a => el.removeAttribute(a.name));
      [...next.attributes].forEach(a => el.setAttribute(a.name, a.value));
      el.innerHTML = next.innerHTML;
    }
    else el.replaceWith(next);
  }
};

// ── 헤더 지역 선택 목록(listbox) ──
// 열림 상태는 화면을 다시 그리지 않고 DOM에서만 바꿔요. 지역을 고르면 App.setRegion()이 저장·렌더링을 맡아요.
// 키보드: 버튼에서 Enter·Space·↓·↑로 열기, 목록에서 ↑↓·Home·End로 이동, Enter·Space로 선택, Esc·Tab으로 닫기
const RegionMenu = {
  els() {
    return { box: document.getElementById('region-dd'), btn: document.getElementById('region-dd-btn'), list: document.getElementById('region-dd-list') };
  },
  isOpen() {
    const { list } = this.els();
    return !!list && !list.hidden;
  },
  open(toEnd) {
    const { btn, list } = this.els();
    if (!list) return;
    list.hidden = false;
    btn.setAttribute('aria-expanded', 'true');
    const start = App.state.regionId || REGION_ORDER[toEnd ? REGION_ORDER.length - 1 : 0];
    this.focusOpt(start);
    list.focus();
  },
  close(returnFocus) {
    const { btn, list } = this.els();
    if (!list || list.hidden) return;
    list.hidden = true;
    btn.setAttribute('aria-expanded', 'false');
    if (returnFocus) btn.focus();
  },
  toggle() {
    this.isOpen() ? this.close(true) : this.open();
  },
  // 키보드·마우스로 가리킨 항목(aria-activedescendant)
  focusOpt(id) {
    const { list } = this.els();
    if (!list) return;
    list.querySelectorAll('.region-dd-opt').forEach(li => li.classList.toggle('focused', li.dataset.id === id));
    list.setAttribute('aria-activedescendant', 'region-opt-' + id);
  },
  current() {
    const { list } = this.els();
    const li = list && list.querySelector('.region-dd-opt.focused');
    return li ? li.dataset.id : null;
  },
  pick(id) {
    this.close(false);
    App.setRegion(id);
    // 다시 그려진 헤더의 버튼으로 초점을 돌려요(키보드 사용자가 위치를 잃지 않도록)
    const { btn } = this.els();
    if (btn) btn.focus();
  },
  buttonKey(e) {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      this.open(e.key === 'ArrowUp');
    }
  },
  listKey(e) {
    const i = REGION_ORDER.indexOf(this.current());
    const move = n => { e.preventDefault(); this.focusOpt(REGION_ORDER[(n + REGION_ORDER.length) % REGION_ORDER.length]); };
    if (e.key === 'ArrowDown') move(i + 1);
    else if (e.key === 'ArrowUp') move(i - 1);
    else if (e.key === 'Home') move(0);
    else if (e.key === 'End') move(REGION_ORDER.length - 1);
    else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); if (this.current()) this.pick(this.current()); }
    else if (e.key === 'Escape') { e.preventDefault(); this.close(true); }
    else if (e.key === 'Tab') this.close(false);
  }
};

// 목록 바깥을 누르면 닫아요
document.addEventListener('pointerdown', e => {
  const { box } = RegionMenu.els();
  if (RegionMenu.isOpen() && box && !box.contains(e.target)) RegionMenu.close(false);
});

// 한글 조합 이벤트는 oncompositionstart 같은 HTML 속성이 없어(속성으로 적으면 실행되지 않아요) 문서에서 받아요
document.addEventListener('compositionstart', e => {
  if (e.target.id === 'guide-search') App.guideCompositionStart();
});
document.addEventListener('compositionend', e => {
  if (e.target.id === 'guide-search') App.guideCompositionEnd(e);
  if (e.target.id === 'care-search') App.filterCare(e.target.value);
  if (e.target.id === 'sup-search') App.filterSupport(e.target.value);
});

// 브라우저 뒤로가기·앞으로가기 → 기록에 담아 둔 메뉴로 복원(이때는 새 기록을 쌓지 않아요)
// 업데이트 내역 창은 기록을 쌓지 않으므로, 뒤로가기를 누르면 창을 닫고 이전 화면으로 돌아가요
window.addEventListener('popstate', e => { UpdateUI.close(); App.restoreHistory(e.state); });

document.addEventListener('DOMContentLoaded', () => App.init());
