// 선생님 곁에 — 교육활동 보호·대응 가이드
// 화면 렌더링 및 상태 관리 (바닐라 JS, 빌드 도구 없이 동작)
// 지역별 내용은 data/regions/*.js 에서만 가져와요. 이 파일에는 특정 시·도 이름이나 번호를 두지 않아요.
// 화면 역할: 홈 = 시작 · 상황별 도움 = 판단 · 대응 절차 = 실행(체크) · 지원 찾기 = 연결(신청·상담·안내)

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
    situ: null,         // 상황별 도움에서 펼친 큰 상황(그룹 id) 또는 세부 상황('s' + 번호)
    filters: {},        // 상세 조건 { 그룹명: [선택값] }
    filterOpen: null,   // 상세 조건 영역을 연 상태(null이면 데스크톱은 펼침, 모바일은 접힘)
    supportType: 'all', // 지원 찾기에서 고른 도움 유형('related'는 상황별 도움에서 넘어온 관련 지원 묶음)
    related: null,      // { i: 상황 번호, ids: [지원 유형 id] }
    faqOpen: null,
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
        ${S.page === 'support' ? this.renderSupport() : ''}
      </main>
      ${this.renderFooter()}
      ${this.renderBottomNav()}
      <div id="toast" class="toast" role="status" aria-live="polite"></div>
    `);
  },

  // ══════════════ 공통 부품 ══════════════
  renderRegionSelect(cls) {
    const cur = this.state.regionId;
    const opts = REGION_ORDER.map(id =>
      `<option value="${id}" ${cur === id ? 'selected' : ''}>${REGIONS[id].short}</option>`
    ).join('');
    return `
      <label class="region-select ${cls || ''} ${cur ? '' : 'empty'}">
        <span class="sr-only">근무 지역</span>
        <select onchange="App.setRegion(this.value)" aria-label="근무 지역 선택">
          ${cur ? '' : '<option value="" selected>지역 선택</option>'}
          ${opts}
        </select>
      </label>
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
  renderHome() {
    return `
      ${this.renderHero()}
      ${this.renderQuick()}
      ${this.renderStepsSummary()}
      ${this.renderFinder()}
      ${this.renderFaq()}
    `;
  },

  renderHero() {
    const R = this.R;
    const regionNames = REGION_ORDER.map(id => REGIONS[id].short).join('·');
    // 오른쪽 패널: 장식이 아니라 현재 지역의 연락·지원 경로를 바로 쓰는 기능 영역
    const panel = R ? `
      <aside class="region-panel" aria-label="현재 지역 연락처">
        <p class="panel-label">현재 지역 <strong>${R.name}</strong></p>
        <p class="panel-hot-label">${R.hotName}</p>
        <a href="{TEL}" class="panel-hot">{HOT}</a>
        <div class="panel-actions">
          <a href="{TEL}" class="btn btn-primary"><span aria-hidden="true">☎</span> 전화하기</a>
          <button class="btn btn-secondary" onclick="App.nav('support')">지원 방법 보기</button>
        </div>
      </aside>
    ` : `<aside class="region-panel">${this.renderRegionPicker('근무 지역을 고르면 연락할 곳을 알려 드려요')}</aside>`;
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
        ${this.eyebrow('시작')}
        <h2 class="h2">지금 어떤 도움이 필요하신가요?</h2>
        <ul class="action-list">${rows}</ul>
      </section>
    `;
  },

  renderStepsSummary() {
    const rows = STEPS.map((s, i) => {
      const p = this.progress(i);
      return `
        <li>
          <button class="step-row" onclick="App.nav('proc', { step: ${i} })">
            <span class="step-num">${s.n}</span>
            <span class="step-text"><span class="step-title">${s.title}</span><span class="step-meta">${s.org}${s.deadline ? ` · ${s.deadline}` : ''}</span></span>
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
            <div>${this.eyebrow('실행')}<h2 class="h2">대응 절차 4단계</h2></div>
            <button class="link-btn" onclick="App.nav('proc')">단계별로 체크하기</button>
          </div>
          <ol class="step-list">${rows}</ol>
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
          ${i === 0 ? `
            <details class="more">
              <summary>학교에 요청할 수 있는 보호조치</summary>
              <ul class="plain-list">${PROTECTIONS.map(x => `<li><strong>${x.t}</strong> — ${x.d}</li>`).join('')}</ul>
            </details>
          ` : ''}
          <div class="btn-row">
            ${i > 0 ? `<button class="btn btn-secondary" onclick="App.setState({ step: ${i - 1} })">← 이전 단계</button>` : ''}
            ${i < STEPS.length - 1 ? `<button class="btn btn-primary" onclick="App.setState({ step: ${i + 1} }); document.querySelector('.stepper').scrollIntoView({ behavior: 'smooth' })">다음 단계 →</button>` : ''}
          </div>
        </div>
        <p class="muted small">기한은 법률이 아닌 교육활동 보호 매뉴얼 기준이에요(법률은 '지체 없이' 보고). 실제 적용 기한과 제출 방식은 소속 교육지원청 안내를 확인하세요.</p>
        ${sourceBox('절차 근거', COMMON_SOURCES, latestDate(COMMON_SOURCES))}
      </section>
    `;
  },

  // ══════════════ 상황별 도움 = 판단 → 선택 → 결과 ══════════════
  // 상황 하나의 안내. ‘관련 대응 절차’·‘관련 지원 보기’는 상황 데이터(stages·supports)로 둘러볼 곳만 안내해요
  // 상황의 supports를 현재 지역에 실제로 있는 지원 유형으로 옮겨요(새 판단 없이 SUPPORT_TYPES.situ 매핑만 사용)
  relatedTypes(s) {
    return this.availableTypes().filter(t => s.supports.some(v => t.situ.includes(v)));
  },

  // 관련 지원이 여러 개면 지원 찾기에서 그 유형들만 한 번에 보여 줘요
  showRelated(i) {
    this.nav('support', { supportType: 'related', related: { i, ids: this.relatedTypes(SITUS[i]).map(t => t.id) } });
  },

  situDetail(s, withTitle) {
    const i = s.i !== undefined ? s.i : SITUS.indexOf(s);
    const step = STAGE_TO_STEP[s.stages[0]];
    const types = this.relatedTypes(s);
    const supportBtn = types.length > 1
      ? `<button class="btn btn-secondary" onclick="App.showRelated(${i})">관련 지원 ${types.length}개 보기 →</button>`
      : `<button class="btn btn-secondary" onclick="App.nav('support', { supportType: '${types.length ? types[0].id : 'all'}' })">${types.length ? `관련 지원 보기(${types[0].label})` : '지원 찾기'} →</button>`;
    return `
      <div class="situ-sub">
        ${withTitle ? `<h3 class="sub-title">${s.t} ${urgencyBadge(s.urgency)}</h3>` : ''}
        <p class="muted small">예: ${s.ex}</p>
        <div class="first-box"><p class="first-label">지금 먼저 할 일</p><p>${s.act}</p></div>
        ${this.facts([['학교에 알릴 내용', s.report], ['지금 기록해 두세요', s.evidence], ['하지 말 것', s.dont], ['받을 수 있는 지원', s.programs], ['연락할 곳', s.orgs], ['관련 지원', types.map(t => t.label).join(' · ')]])}
        <div class="btn-row">
          <button class="btn btn-secondary" onclick="App.nav('proc', { step: ${step === undefined ? 0 : step} })">관련 대응 절차 →</button>
          ${supportBtn}
        </div>
      </div>
    `;
  },

  renderGuide() {
    const S = this.state;
    const active = Object.keys(S.filters).length > 0;
    const selected = FILTER_DEFS.flatMap(d => S.filters[d.g] || []);
    const matches = SITUS.map((s, i) => ({ ...s, i })).filter(s => FILTER_DEFS.every(d => {
      const sel = S.filters[d.g] || [];
      return sel.length === 0 || sel.some(o => d.test(s, o));
    })).sort((a, b) => URGENCY_ORDER.indexOf(a.urgency) - URGENCY_ORDER.indexOf(b.urgency));

    // 조건 영역: 왼쪽 그룹 이름, 오른쪽 선택지.
    // 숫자는 ‘다른 그룹의 선택 조건을 적용했을 때 이 선택지에 해당하는 상황 수’(같은 그룹 안은 OR라 자기 그룹은 제외).
    // 0이면 비활성으로 두되, 이미 선택된 선택지는 해제할 수 있게 항상 눌러요. 데이터에 아예 없는 선택지는 숨겨요.
    const passesOthers = (s, group) => FILTER_DEFS.every(d => {
      if (d.g === group) return true;
      const sel = S.filters[d.g] || [];
      return sel.length === 0 || sel.some(o => d.test(s, o));
    });
    const rows = FILTER_DEFS.map(d => {
      const pool = SITUS.filter(s => passesOthers(s, d.g));
      const chips = d.opts.filter(o => SITUS.some(s => d.test(s, o))).map(o => {
        const n = pool.filter(s => d.test(s, o)).length;
        const on = (S.filters[d.g] || []).includes(o);
        const off = !on && n === 0;
        return `<button class="chip ${on ? 'active' : ''}" aria-pressed="${on}" ${off ? 'disabled title="현재 조건에서는 해당 상황이 없어요"' : ''} onclick="App.toggleFilter('${d.g}','${o}')">${o} <span class="chip-count">${n}</span></button>`;
      }).join('');
      return `<div class="filter-row" role="group" aria-label="${d.g}"><span class="filter-label">${d.g}</span><div class="chip-row">${chips}</div></div>`;
    }).join('');
    // 데스크톱은 기본으로 펼치고, 모바일은 접어서 시작해요(사용자가 연 상태는 유지)
    const open = S.filterOpen === null ? isDesktop() || active : S.filterOpen;

    const groupRows = SITU_GROUPS.map(g => {
      const subs = SITUS.filter(s => s.g === g.id)
        .sort((a, b) => URGENCY_ORDER.indexOf(a.urgency) - URGENCY_ORDER.indexOf(b.urgency));
      const isOpen = S.situ === g.id;
      return `
        <li class="action ${g.urgent ? 'urgent' : ''} ${isOpen ? 'open' : ''}">
          <button class="action-head" aria-expanded="${isOpen}" onclick="App.toggle('situ', '${g.id}')">
            ${g.urgent ? '<span class="tag tag-danger">긴급</span>' : ''}
            <span class="action-label">${g.t}</span>
            <span class="action-count">${subs.length}</span>
            <span class="chevron" aria-hidden="true"></span>
          </button>
          ${isOpen ? `<div class="action-body">${subs.map(s => this.situDetail(s, subs.length > 1)).join('')}</div>` : ''}
        </li>
      `;
    }).join('');

    const resultRows = matches.map(s => {
      const key = 's' + s.i;
      const isOpen = S.situ === key;
      const urgent = s.urgency === URGENCY_ORDER[0];
      return `
        <li class="action ${urgent ? 'urgent' : ''} ${isOpen ? 'open' : ''}">
          <button class="action-head" aria-expanded="${isOpen}" onclick="App.toggle('situ', '${key}')">
            <span class="action-label">${s.t}</span>
            ${urgencyBadge(s.urgency)}
            <span class="chevron" aria-hidden="true"></span>
          </button>
          ${isOpen ? `<div class="action-body">${this.situDetail(s, false)}</div>` : ''}
        </li>
      `;
    }).join('');

    return `
      <section class="section page">
        ${this.eyebrow('판단')}
        <h1 class="page-title">상황별 도움</h1>
        <p class="muted">조건을 고르면 맞는 상황과 지금 할 일을 보여 드려요. 큰 상황에서 바로 골라도 돼요.</p>
        ${this.emergencyNote()}
        <details class="tool-panel filter-panel" ${open ? 'open' : ''} ontoggle="App.state.filterOpen = this.open">
          <summary><span class="tool-title">상세 조건으로 찾기</span>${selected.length ? `<span class="badge badge-accent">${selected.length}개 선택</span>` : ''}<span class="chevron" aria-hidden="true"></span></summary>
          <div class="filter-rows">${rows}</div>
        </details>
        ${active ? `
          <div class="result-head" aria-live="polite">
            <div>
              <p class="result-count">${matches.length}개 상황을 찾았어요</p>
              <p class="muted small">선택 조건: ${selected.join(' · ')}</p>
            </div>
            <button class="btn btn-secondary" onclick="App.clearFilters()">필터 초기화</button>
          </div>
          ${matches.length ? `<ul class="action-list">${resultRows}</ul>` : '<p class="note">조건에 맞는 상황이 없어요. 조건을 줄여 보세요.</p>'}
        ` : `
          <div class="result-head"><p class="result-count">큰 상황으로 바로 찾기</p></div>
          <ul class="action-list">${groupRows}</ul>
        `}
        <p class="muted small">구체적인 사안의 교육활동 침해 해당 여부는 사실관계 조사와 지역교권보호위원회 심의로 판단돼요.</p>
        ${sourceBox('안내 근거', COMMON_SOURCES, latestDate(COMMON_SOURCES))}
      </section>
    `;
  },

  // ══════════════ 지원 찾기 = 연결 → 유형 선택 → 신청·상담 ══════════════
  // 현재 지역에서 실제로 지원이 있는 유형만
  availableTypes() {
    const R = this.R;
    return R ? SUPPORT_TYPES.filter(t => R.programs.some(p => t.areas.includes(p.area))) : SUPPORT_TYPES;
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
      const n = t.id === 'all' ? R.programs.length : R.programs.filter(p => t.areas.includes(p.area)).length;
      return `<button class="chip ${on ? 'active' : ''}" aria-pressed="${on}" onclick="App.setState({ supportType: '${t.id}' })">${t.label} <span class="chip-count">${n}</span></button>`;
    }).join('');
    const programs = R.programs.filter(p => relMode ? areasOf(relTypes).includes(p.area) : (!cur || cur.areas.includes(p.area)));
    const items = programs.map(p => `
      <li class="support-item">
        <div class="support-head">
          <h3 class="sub-title">${p.t}</h3>
          ${p.status && p.status !== '현재 시행 중' ? `<span class="badge badge-accent">${p.status}</span>` : ''}
        </div>
        <p>${p.sum}</p>
        ${this.facts([
          ['담당', p.org || UNKNOWN], ['신청 방법', p.apply || UNKNOWN],
          // 용도가 다른 번호(contacts)는 용도별로 나눠 보여 줘요
          ...(p.contacts ? p.contacts.map(c => [c.label, linkifyPhone(c.value)]) : [['연락처', p.contact ? linkifyPhone(p.contact) : UNKNOWN]]),
          ['대상', p.target]
        ])}
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
        <p class="muted">${R.name}에서 실제로 신청하거나 상담받는 방법을 보여 드려요.</p>
        ${this.renderHub(R)}
        <div class="tool-panel">
          <p class="tool-title">어떤 도움이 필요하신가요?</p>
          <div class="chip-row" role="group" aria-label="도움 유형">${chips}</div>
        </div>
        <div class="result-head" aria-live="polite">
          <div>
            <p class="result-count">${relMode ? `이 상황과 관련된 지원: ${relTypes.map(t => t.label).join(' · ')}` : `${R.short} ${cur ? cur.label + ' 지원' : '지원 전체'} ${programs.length}건`}</p>
            ${relMode ? `<p class="muted small">${SITUS[S.related.i].t} · ${R.short} 지원 ${programs.length}건</p>` : ''}
          </div>
          ${relMode || cur ? `<button class="btn btn-secondary" onclick="App.setState({ supportType: 'all' })">전체 보기</button>` : ''}
        </div>
        <ul class="support-list">${items}</ul>
        <h2 class="h2">기관 연락처</h2>
        <ul class="directory">
          ${directory}
          <li><span class="dir-name">담당 교육지원청</span><span class="dir-contact"><button class="link-btn" onclick="App.goHome('finder')">내 교육지원청 찾기</button></span></li>
          <li><span class="dir-name">경찰(긴급 상황)</span><span class="dir-contact"><a href="tel:112">112</a></span></li>
        </ul>
        ${sourceBox(`${R.short} 공식 출처`, R.sources, R.verifiedAt)}
      </section>
    `;
  },

  // ══════════════ 푸터(서비스 안내·출처) ══════════════
  renderFooter() {
    const R = this.R;
    return `
      <footer class="site-footer">
        <div class="footer-inner">
          <p class="footer-title">선생님 곁에 · 서비스 안내</p>
          <p>교사를 위한 교육활동 보호·대응 가이드예요. 공식 기관이 운영하는 서비스가 아니며, 시·도교육청 공식 자료를 바탕으로 정리했어요.
          실제 사안의 판단과 절차는 학교와 ${R ? R.office : '소속 시·도교육청'}, 소속 교육지원청의 최신 안내를 따라 주세요.
          선택한 지역과 대응 절차 체크 상태만 이 기기에 저장하고, 서버로 보내지 않아요.</p>
          ${R ? sourceBox(`${R.short} 공식 출처`, R.sources, R.verifiedAt,
            `최신 내용은 <a href="${R.officeUrl}" target="_blank" rel="noopener">${R.office} 홈페이지</a>에서 확인하세요.`) : ''}
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

// 값이 없는 항목에 보여 줄 문구(확인되지 않은 내용을 다른 지역 값으로 채우지 않아요)
const UNKNOWN = '<span class="unknown">공식 안내 확인 필요</span>';

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

function sourceLine(R, item) {
  const src = item.source !== undefined ? R.sources[item.source] : null;
  const date = fmtDate((src && src.verifiedAt) || R.verifiedAt);
  const link = src && src.url ? ` · <a href="${src.url}" target="_blank" rel="noopener">근거 자료</a>` : '';
  return `${date} 최종 확인${link}`;
}

// 접이식 출처 상자: 제목 · 최종 확인일 → 출처 목록(+ 안내 문구)
function sourceBox(label, sources, verifiedAt, note) {
  const list = sources.map(s => `
    <li>${s.url ? `<a href="${s.url}" target="_blank" rel="noopener">${s.title}</a>` : s.title}${s.verifiedAt ? ` <span class="muted">· ${fmtDate(s.verifiedAt)} 확인</span>` : ''}</li>
  `).join('');
  return `
    <details class="source-box">
      <summary>${label} · ${fmtDate(verifiedAt)} 최종 확인</summary>
      <ul>${list}</ul>
      ${note ? `<p>${note}</p>` : ''}
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

document.addEventListener('DOMContentLoaded', () => App.init());
