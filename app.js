// 선생님 곁에 — 교육활동 보호·대응 가이드
// 화면 렌더링 및 상태 관리 (바닐라 JS, 빌드 도구 없이 동작)
// 지역별 내용은 data/regions/*.js 에서만 가져와요. 이 파일에는 특정 시·도 이름이나 번호를 두지 않아요.
// 화면 역할: 홈 = 어디부터 · 대응 절차 = 지금 할 일(체크) · 상황별 도움 = 어떤 경우 · 회복·보호 = 내가 쓸 제도 · 지원 찾기 = 어디서 도움

const STORAGE_REGION = 'teacher-care-region';
const STORAGE_CHECKS = 'teacher-care-procedure-checks-v1'; // { '단계번호.항목id': true }
// 예전 체크리스트 키. 삭제된 목록의 순번으로 저장돼 새 항목과 맞지 않아 옮기지 않고 지워요
const LEGACY_CHECK_KEYS = ['teacher-care-checks', 'icn-gyeote-checks'];

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
    checks: {},
    onboarding: false   // 첫 방문(저장된 지역·주소의 region 모두 없음)이면 지역 선택 첫 화면을 보여요
  },

  init() {
    this.state.regionId = initialRegionId();
    this.state.onboarding = !this.state.regionId;
    this.state.checks = loadChecks();
    this.render();
  },

  // 첫 화면에서 지역을 고르면 기존 저장 방식(setRegion) 그대로 저장하고 바로 홈으로 가요
  chooseRegion(id) {
    this.state.onboarding = false;
    this.state.page = 'home';
    this.setRegion(id);
    window.scrollTo(0, 0);
  },

  // 지역 없이 공통 대응부터 보기. ‘미선택’은 저장하지 않아 다음 새 방문에는 다시 지역 선택 화면이 나와요
  skipOnboarding() {
    this.nav('home', { onboarding: false });
  },

  // 현재 선택된 지역 데이터(없으면 null)
  get R() { return REGIONS[this.state.regionId] || null; },

  setRegion(id) {
    const next = REGIONS[id] ? id : null;
    if (next === this.state.regionId) return;
    storeSet(STORAGE_REGION, next);
    this.setState({ regionId: next, area: '', supportType: 'all', related: null });
    if (next) this.showToast(REGIONS[next].name + ' 기준으로 안내해요');
  },

  setState(patch) {
    Object.assign(this.state, patch);
    this.render();
  },

  nav(page, patch) {
    this.setState({ page, ...patch });
    window.scrollTo(0, 0);
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
    document.title = R ? `선생님 곁에 — ${R.short} 교육활동 보호·대응 가이드` : '선생님 곁에 — 교육활동 보호·대응 가이드';
    document.body.classList.toggle('is-landing', S.onboarding);
    if (S.onboarding) {
      document.getElementById('app').innerHTML = this.renderLanding();
      return;
    }
    // 공통 데이터의 {HOT}·{LEGAL} 등 지역 토큰을 현재 지역 값(미선택 시 중립 문구)으로 치환
    document.getElementById('app').innerHTML = T(`
      <a class="skip-link" href="#main">본문 바로가기</a>
      ${this.renderHeader()}
      <main id="main">
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

  renderHeader() {
    const S = this.state;
    const R = this.R;
    const navHtml = PAGES.map(([id, label]) =>
      `<button class="nav-btn ${S.page === id ? 'active' : ''}" ${S.page === id ? 'aria-current="page"' : ''} onclick="App.nav('${id}')">${label}</button>`
    ).join('');
    return `
      <header class="site-header">
        <div class="header-inner">
          <button class="brand" onclick="App.nav('home')" aria-label="선생님 곁에 홈">
            <span class="brand-mark" aria-hidden="true">곁</span><span class="brand-name">선생님 곁에</span>
          </button>
          <nav class="main-nav" aria-label="주요 메뉴">${navHtml}</nav>
          ${this.renderRegionSelect()}
          ${R ? `<a href="{TEL}" class="header-call" aria-label="${R.short} 교육활동 보호 대표번호 {HOT} 전화 걸기"><span aria-hidden="true">☎</span> {HOT}</a>` : ''}
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
          <p class="landing-brand"><span class="brand-mark" aria-hidden="true">곁</span><span class="brand-name">선생님 곁에</span></p>
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
        <a href="{TEL}" class="panel-hot">{HOT}</a>
        <div class="panel-actions">
          <a href="{TEL}" class="btn btn-primary"><span aria-hidden="true">☎</span> 전화하기</a>
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

  // 공통 모드: 서울·경기·인천 외 지역 교사를 위한 짧은 안내
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
        ${R.areaNote ? `<p class="note">${R.areaNote}</p>` : ''}
        <label class="field">
          <span class="field-label">학교가 있는 ${R.short} 시·군·구</span>
          <select onchange="App.setState({ area: this.value })">
            <option value="" ${office ? '' : 'selected'}>선택해 주세요</option>
            ${opts}
          </select>
        </label>
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
        ` : ''}
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
        <div class="proc-panel">
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
      ${refsBox(x.refs, x.basis)}
      ${links.length ? `
        <div class="bf-cross">
          <p class="bf-cross-q">${x.supportLinks.q}</p>
          <div class="bf-list">${links.map(t => supportChip(t, R)).join('')}</div>
        </div>` : ''}
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
    return `<div class="bf-grid ${left && right ? '' : 'single'}">${left}${right}</div>`;
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
          ${open ? `<div class="action-body">${this.benefitDetail(b)}</div>` : ''}
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
      <div class="situ-sub">
        ${withTitle ? `<h3 class="sub-title">${s.title} ${urgencyBadge(s.urgency)}</h3>` : ''}
        <p class="muted small">예: ${s.example}</p>
        <div class="first-box"><p class="first-label">지금 먼저 할 일</p><p>${s.firstAction}</p></div>
        ${this.facts([['학교에 알릴 내용', s.report], ['남겨 두면 좋은 기록', s.evidence], ['주의할 점', s.dont]])}
        ${s.legalCaution ? `<p class="note"><strong>판단 시 주의</strong> ${s.legalCaution}</p>` : ''}
        ${this.situBenefits(s)}
        <div class="situ-supports">
          <p class="first-label">연결 가능한 지원</p>
          ${this.facts([['받을 수 있는 지원', s.programs], ['연락할 곳', s.orgs]])}
          ${types.length ? `<div class="bf-list">${types.map(t => supportChip(t, this.R)).join('')}</div>` : ''}
        </div>
        <div class="btn-row">
          <button class="btn btn-secondary" onclick="App.nav('proc', { step: ${step === undefined ? 0 : step} })">관련 대응 절차 →</button>
          ${supportBtn}
        </div>
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
        const isOpen = S.situ === key;
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
          <a href="{TEL}" class="panel-hot">{HOT}</a>
          ${R.menu
            ? `<ol class="hotline-menu">${R.menu.map(m => `<li>${m}</li>`).join('')}</ol>`
            : `<p class="muted small">${R.hotSummary || R.menuNote || ''}</p>`}
          <a href="{TEL}" class="btn btn-primary"><span aria-hidden="true">☎</span> 전화 상담 {HOT}</a>
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
      <li><span class="dir-name">${o.name}</span><span class="dir-contact">${o.contact ? linkifyPhone(o.contact) : UNKNOWN}</span></li>
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
        <ul class="support-list">${items}</ul>
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
    if (!g && !careIds.length && t.id !== 'office') return '';
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
        <div class="footer-inner">
          <p class="footer-title">선생님 곁에 · 서비스 안내</p>
          <p>교사를 위한 교육활동 보호·대응 가이드예요. 공식 기관이 운영하는 서비스가 아니며, 시·도교육청 공식 자료를 바탕으로 정리했어요.
          실제 사안의 판단과 절차는 학교와 ${R ? R.office : '소속 시·도교육청'}, 소속 교육지원청의 최신 안내를 따라 주세요.
          선택한 지역과 대응 절차 체크 상태만 이 기기에 저장하고, 서버로 보내지 않아요.</p>
          ${R ? `<p>최신 내용은 <a href="${R.officeUrl}" target="_blank" rel="noopener">${R.office} 홈페이지</a>에서 확인하세요. 화면마다 아래쪽 ‘안내 근거’에 그 화면에 쓴 공식 자료를 적어 두었어요.</p>` : ''}
        </div>
      </footer>
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
function refsBox(refs, basis) {
  const srcs = (refs || []).map(id => COMMON_PUBLIC_SOURCES.find(s => s.id === id)).filter(Boolean);
  if (!basis && !srcs.length) return '';
  return `
    <details class="bf-refs">
      <summary>공식 근거${srcs.length ? ` ${srcs.length}건 · ${fmtDate(latestDate(srcs))} 확인` : ''}</summary>
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

// 값이 없는 항목에 보여 줄 문구(확인되지 않은 내용을 다른 지역 값으로 채우지 않아요)
const UNKNOWN = '<span class="unknown">공식 안내 확인 필요</span>';

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

// 주소의 ?region=seoul → 저장된 지역 → 미선택 순. 알 수 없는 값은 무시해요.
function initialRegionId() {
  let q = null;
  try { q = new URLSearchParams(location.search).get('region'); } catch (e) {}
  if (q && REGIONS[q]) { storeSet(STORAGE_REGION, q); return q; }
  const saved = storeGet(STORAGE_REGION);
  if (saved && REGIONS[saved]) return saved;
  if (saved) storeSet(STORAGE_REGION, null);
  return null;
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
  const date = fmtDate(latestDate(srcs.length ? srcs : [R]) || R.verifiedAt);
  const links = srcs.filter(s => s.url).map((s, i, arr) =>
    `<a href="${s.url}" target="_blank" rel="noopener" title="${escapeAttr(s.title)}">근거 자료${arr.length > 1 ? ' ' + (i + 1) : ''}</a>`);
  return `${date} 최종 확인${links.length ? ' · ' + links.join(' · ') : ''}`;
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

document.addEventListener('DOMContentLoaded', () => App.init());
