// 선생님 곁에 — 교육활동 보호·대응 가이드
// 화면 렌더링 및 상태 관리 (바닐라 JS, 빌드 도구 없이 동작)
// 지역별 내용은 data/regions/*.js 에서만 가져와요. 이 파일에는 특정 시·도 이름이나 번호를 두지 않아요.

const STORAGE_REGION = 'teacher-care-region';

const App = {
  state: {
    page: 'home',
    regionId: null,     // 선택한 시·도 id(REGIONS의 key). 없으면 전국 공통 안내만 보여요
    area: '',           // '내 교육지원청 찾기'에서 고른 시·군·구
    quick: null,        // 홈에서 펼친 상황
    step: null,         // 대응 절차에서 펼친 단계
    situ: null,         // 상황별 도움에서 펼친 상황
    supportType: 'all', // 지원 찾기에서 고른 도움 유형
    faqOpen: null
  },

  init() {
    this.state.regionId = initialRegionId();
    this.render();
  },

  // 현재 선택된 지역 데이터(없으면 null)
  get R() { return REGIONS[this.state.regionId] || null; },

  setRegion(id) {
    const next = REGIONS[id] ? id : null;
    if (next === this.state.regionId) return;
    storeSet(STORAGE_REGION, next);
    this.setState({ regionId: next, area: '', supportType: 'all' });
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
  renderRegionSelect() {
    const cur = this.state.regionId;
    const opts = REGION_ORDER.map(id =>
      `<option value="${id}" ${cur === id ? 'selected' : ''}>${REGIONS[id].short}</option>`
    ).join('');
    return `
      <label class="region-select ${cur ? '' : 'empty'}">
        <span class="sr-only">근무 지역</span>
        <select onchange="App.setRegion(this.value)" aria-label="근무 지역 선택">
          ${cur ? '' : '<option value="" selected>지역 선택</option>'}
          ${opts}
        </select>
      </label>
    `;
  },

  // 지역이 아직 없을 때 보여 주는 선택 버튼. 긴급 신고(112)는 지역과 상관없이 함께 안내해요
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

  // ══════════════ 홈 ══════════════
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
    return `
      <section class="hero">
        <h1>교육활동 중 어려움이 생겼다면,<br>지금 해야 할 일을 바로 확인하세요.</h1>
        <p class="hero-sub">${regionNames} 공식 자료를 바탕으로 신고·대응·법률·심리 지원 절차를 안내해요.</p>
        ${R ? `
          <div class="hotline">
            <div class="hotline-text">
              <span class="hotline-label">${R.hotName}</span>
              <a href="{TEL}" class="hotline-num">{HOT}</a>
            </div>
            <a href="{TEL}" class="btn btn-primary hotline-btn"><span aria-hidden="true">☎</span> 전화 걸기</a>
          </div>
        ` : this.renderRegionPicker('근무 지역을 고르면 연락할 곳을 알려 드려요')}
        <div class="hero-actions">
          <button class="btn btn-primary" onclick="App.nav('proc')">지금 대응 절차 확인</button>
          <button class="btn btn-secondary" onclick="App.goHome('finder')">내 교육지원청 찾기</button>
        </div>
        ${this.emergencyNote()}
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
        <h2 class="h2">지금 어떤 도움이 필요하신가요?</h2>
        <ul class="action-list">${rows}</ul>
      </section>
    `;
  },

  renderStepsSummary() {
    const rows = STEPS.map((s, i) => `
      <li>
        <button class="step-row" onclick="App.nav('proc', { step: ${i} })">
          <span class="step-num">${s.n}</span>
          <span class="step-text"><span class="step-title">${s.title}</span><span class="step-meta">${s.org}${s.deadline ? ` · ${s.deadline}` : ''}</span></span>
          <span class="chevron right" aria-hidden="true"></span>
        </button>
      </li>
    `).join('');
    return `
      <section class="section">
        <div class="section-head">
          <h2 class="h2">대응 절차</h2>
          <button class="link-btn" onclick="App.nav('proc')">자세히 보기</button>
        </div>
        <ol class="step-list">${rows}</ol>
      </section>
    `;
  },

  // 현재 지역에서 실제로 지원이 있는 유형만(지역 미선택이면 전체 유형)
  availableTypes() {
    const R = this.R;
    if (!R) return SUPPORT_TYPES;
    return SUPPORT_TYPES.filter(t => R.programs.some(p => t.areas.includes(p.area)));
  },

  // 시·군·구 → 담당 교육지원청. 지역 수와 상관없이 select 하나로 표현해요(경기 31개 시·군도 한 화면)
  renderFinder() {
    const R = this.R;
    if (!R) {
      return `
        <section class="section" id="finder">
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
            <p class="result-title">${officeTitle(office)}</p>
            <p class="muted small">관할 · ${office.areas.join('·')}</p>
            ${this.facts([
              ['연락처', office.contact && /\d/.test(office.contact) ? linkifyPhone(office.contact) : ''],
              ['신고·심의', '소속 교육지원청 또는 {HOT2}'],
              ['법률·심리·치료', '{HOT1}'],
              ['홈페이지', office.url ? `<a href="${office.url}" target="_blank" rel="noopener">교육지원청 안내</a>` : '']
            ])}
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

  // ══════════════ 대응 절차 ══════════════
  renderProc() {
    const S = this.state;
    const list = (title, arr) => `
      <div class="duty">
        <h3 class="duty-title">${title}</h3>
        <ul>${arr.map(x => `<li>${x}</li>`).join('')}</ul>
      </div>
    `;
    const protections = `
      <div class="duty wide">
        <h3 class="duty-title">학교에 요청할 수 있는 보호조치</h3>
        <ul>${PROTECTIONS.map(p => `<li><strong>${p.t}</strong> — ${p.d}</li>`).join('')}</ul>
      </div>
    `;
    const rows = STEPS.map((s, i) => {
      const open = S.step === i;
      const d = STEP_DETAIL[i];
      return `
        <li class="proc-step ${open ? 'open' : ''}">
          <button class="proc-head" aria-expanded="${open}" onclick="App.toggle('step', ${i})">
            <span class="step-num">${s.n}</span>
            <span class="step-text"><span class="step-title">${s.title}</span><span class="step-meta">${s.org}${s.deadline ? ` · ${s.deadline}` : ''}</span></span>
            <span class="chevron" aria-hidden="true"></span>
          </button>
          ${open ? `
            <div class="proc-body">
              <p>${s.sum}</p>
              <div class="duty-grid">
                ${list('내가 할 일', d.teacher)}
                ${list('학교가 할 일', d.school)}
                ${list('교육지원청이 할 일', d.office)}
                ${list('기록·준비할 것', d.docs)}
              </div>
              <p class="caution"><strong>주의</strong> ${d.caution.join(' · ')}</p>
              <p class="muted small">${d.next}</p>
              ${i === 0 ? protections : ''}
            </div>
          ` : ''}
        </li>
      `;
    }).join('');
    return `
      <section class="section page">
        <h1 class="page-title">대응 절차</h1>
        <p class="muted">단계를 누르면 역할별로 할 일이 보여요.</p>
        ${this.emergencyNote()}
        <ol class="proc-list">${rows}</ol>
        <p class="muted small">기한은 법률이 아닌 교육활동 보호 매뉴얼 기준이에요(법률은 '지체 없이' 보고). 실제 적용 기한과 제출 방식은 소속 교육지원청 안내를 확인하세요.</p>
        ${sourceBox('절차 근거', COMMON_SOURCES, latestDate(COMMON_SOURCES))}
      </section>
    `;
  },

  // ══════════════ 상황별 도움 ══════════════
  renderGuide() {
    const S = this.state;
    // 큰 상황(SITU_GROUPS)을 누르면 그 안의 세부 상황 안내를 위험한 순서로 모두 보여요
    const rows = SITU_GROUPS.map(g => {
      const subs = SITUS.filter(s => s.g === g.id)
        .sort((a, b) => URGENCY_ORDER.indexOf(a.urgency) - URGENCY_ORDER.indexOf(b.urgency));
      const open = S.situ === g.id;
      const detail = s => `
        <div class="situ-sub">
          ${subs.length > 1 ? `<h3 class="support-title">${s.t}</h3>` : ''}
          <p class="muted small">${s.urgency} · 예: ${s.ex}</p>
          <p class="action-first">${s.act}</p>
          ${this.facts([['학교에 알릴 내용', s.report], ['지금 기록해 두세요', s.evidence], ['하지 말 것', s.dont], ['받을 수 있는 지원', s.programs], ['연락할 곳', s.orgs]])}
        </div>
      `;
      return `
        <li class="action ${g.urgent ? 'urgent' : ''} ${open ? 'open' : ''}">
          <button class="action-head" aria-expanded="${open}" onclick="App.toggle('situ', '${g.id}')">
            ${g.urgent ? '<span class="tag tag-danger">긴급</span>' : ''}
            <span class="action-label">${g.t}</span>
            <span class="chevron" aria-hidden="true"></span>
          </button>
          ${open ? `<div class="action-body">${subs.map(detail).join('')}</div>` : ''}
        </li>
      `;
    }).join('');
    return `
      <section class="section page">
        <h1 class="page-title">상황별 도움</h1>
        <p class="muted">지금 상황과 가장 가까운 항목을 누르세요.</p>
        ${this.emergencyNote()}
        <ul class="action-list">${rows}</ul>
        <p class="muted small">구체적인 사안의 교육활동 침해 해당 여부는 사실관계 조사와 지역교권보호위원회 심의로 판단돼요.</p>
      </section>
    `;
  },

  // ══════════════ 지원 찾기(지원제도 + 지원기관) ══════════════
  renderSupport() {
    const S = this.state;
    const R = this.R;
    if (!R) {
      return `
        <section class="section page">
          <h1 class="page-title">지원 찾기</h1>
          <p class="muted">지원 이름·신청 방법·연락처는 시·도교육청마다 달라요.</p>
          ${this.renderRegionPicker('근무 지역을 선택해 주세요')}
        </section>
      `;
    }
    const types = this.availableTypes();
    const cur = types.find(t => t.id === S.supportType);
    const chips = [{ id: 'all', label: '전체' }, ...types].map(t =>
      `<button class="chip ${(cur ? cur.id : 'all') === t.id ? 'active' : ''}" aria-pressed="${(cur ? cur.id : 'all') === t.id}" onclick="App.setState({ supportType: '${t.id}' })">${t.label}</button>`
    ).join('');
    const programs = R.programs.filter(p => !cur || cur.areas.includes(p.area));
    const items = programs.map(p => `
      <li class="support-item">
        <div class="support-head">
          <h3 class="support-title">${p.t}</h3>
          ${p.status && p.status !== '현재 시행 중' ? `<span class="tag">${p.status}</span>` : ''}
        </div>
        <p>${p.sum}</p>
        ${this.facts([['담당', p.org || UNKNOWN], ['연락처', p.contact ? linkifyPhone(p.contact) : UNKNOWN], ['신청', p.apply || UNKNOWN], ['대상', p.target]])}
        <p class="muted small">${sourceLine(R, p)}</p>
      </li>
    `).join('');
    const directory = R.orgs.map(o => `
      <li><span class="dir-name">${o.name}</span><span class="dir-contact">${o.contact ? linkifyPhone(o.contact) : UNKNOWN}</span></li>
    `).join('');
    return `
      <section class="section page">
        <h1 class="page-title">지원 찾기</h1>
        <p class="muted">어떤 도움이 필요하신가요? ${R.name} 기준으로 지원 내용과 연락처를 함께 보여 드려요.</p>
        <div class="hotline">
          <div class="hotline-text">
            <span class="hotline-label">${R.hotName}</span>
            <a href="{TEL}" class="hotline-num">{HOT}</a>
            ${R.menu
              ? `<ol class="hotline-menu">${R.menu.map(m => `<li>${m}</li>`).join('')}</ol>`
              : `<span class="hotline-desc">${R.hotSummary || R.menuNote || ''}</span>`}
          </div>
          <a href="{TEL}" class="btn btn-primary hotline-btn"><span aria-hidden="true">☎</span> 전화 걸기</a>
        </div>
        <div class="chip-row" role="group" aria-label="도움 유형">${chips}</div>
        <ul class="support-list">${items}</ul>
        <h2 class="h2">기관 연락처</h2>
        <ul class="directory">
          ${directory}
          <li><span class="dir-name">담당 교육지원청</span><span class="dir-contact"><button class="link-btn" onclick="App.goHome('finder')">내 교육지원청 찾기</button></span></li>
          <li><span class="dir-name">경찰(긴급 상황)</span><span class="dir-contact"><a href="tel:112">112</a></span></li>
        </ul>
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
          선택한 지역만 이 기기에 저장하고, 다른 정보는 저장하거나 보내지 않아요.</p>
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

function officeTitle(o) {
  return o.dept ? `${o.name} ${o.dept}` : o.name;
}

function sourceLine(R, item) {
  const src = item.source !== undefined ? R.sources[item.source] : null;
  const date = fmtDate((src && src.verifiedAt) || R.verifiedAt);
  const link = src && src.url ? ` · <a href="${src.url}" target="_blank" rel="noopener">출처</a>` : '';
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
