// 선생님 곁에 — 교육활동 보호·대응 가이드
// 화면 렌더링 및 상태 관리 (바닐라 JS, 빌드 도구 없이 동작)
// 지역별 내용은 data/regions/*.js 에서만 가져와요. 이 파일에는 특정 시·도 이름이나 번호를 두지 않아요.

const STORAGE = {
  region: 'teacher-care-region',
  checks: 'teacher-care-checks',
  legacyChecks: 'icn-gyeote-checks' // 인천 단일 버전에서 쓰던 키 → 첫 실행 때 한 번 옮겨요
};

const App = {
  state: {
    page: 'home',
    regionId: null, // 선택한 시·도 id(REGIONS의 key). 없으면 전국 공통 안내만 보여요
    area: '',       // '내 교육지원청 찾기'에서 고른 시·군·구
    quick: null,
    faqOpen: null,
    stepIdx: 0,
    filters: {},
    formModal: null,
    orgCat: '전체',
    checks: {},
    moreOpen: false
  },

  init() {
    this.state.regionId = initialRegionId();
    this.state.checks = loadChecks();
    this.render();
  },

  // 현재 선택된 지역 데이터(없으면 null)
  get R() { return REGIONS[this.state.regionId] || null; },

  setRegion(id) {
    const next = REGIONS[id] ? id : null;
    if (next === this.state.regionId) return;
    storeSet(STORAGE.region, next);
    this.setState({ regionId: next, area: '', orgCat: '전체', moreOpen: false });
    if (next) this.showToast(REGIONS[next].name + ' 기준으로 안내해요');
  },

  setState(patch) {
    Object.assign(this.state, patch);
    this.render();
  },

  nav(p) {
    this.setState({ page: p, moreOpen: false });
    window.scrollTo(0, 0);
  },

  scrollToId(id) {
    requestAnimationFrame(() => {
      const el = document.getElementById(id);
      if (!el) return;
      el.scrollIntoView({ behavior: 'smooth' });
      const focusable = el.querySelector('select, button');
      if (focusable) focusable.focus({ preventScroll: true });
    });
  },

  // 지역 선택 영역으로 이동(홈이 아니면 홈으로 먼저 이동)
  goRegionPicker() {
    if (this.state.page !== 'home') this.nav('home');
    this.scrollToId(this.R ? 'region-finder' : 'region-picker');
  },

  toggleMore() {
    this.setState({ moreOpen: !this.state.moreOpen });
  },

  toggleCheck(key) {
    const checks = { ...this.state.checks, [key]: !this.state.checks[key] };
    this.setState({ checks });
    storeSet(STORAGE.checks, JSON.stringify(checks));
  },

  toggleFilter(group, opt) {
    const f = { ...this.state.filters };
    const set = new Set(f[group] || []);
    set.has(opt) ? set.delete(opt) : set.add(opt);
    f[group] = [...set];
    this.setState({ filters: f });
  },

  clearFilters() { this.setState({ filters: {} }); },

  formText(i) {
    const f = FORMS[i];
    return f.t + '\n\n' + T(f.body);
  },

  copyForm(i) {
    const text = this.formText(i);
    const done = () => { this.showToast('내용을 복사했어요'); };
    // Clipboard API가 막힌 환경(권한·구형 브라우저)에서는 선택 후 execCommand로 한 번 더 시도해요
    const fallback = () => {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.cssText = 'position:fixed;top:0;left:0;opacity:0';
      document.body.appendChild(ta);
      ta.select();
      let ok = false;
      try { ok = document.execCommand('copy'); } catch (e) {}
      ta.remove();
      this.showToast(ok ? '내용을 복사했어요' : '복사하지 못했어요. 미리보기에서 직접 선택해 주세요');
    };
    if (navigator.clipboard) navigator.clipboard.writeText(text).then(done, fallback); else fallback();
  },

  showToast(msg) {
    const el = document.getElementById('toast');
    if (!el) return;
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => el.classList.remove('show'), 1600);
  },

  downloadForm(i) {
    const f = FORMS[i];
    const blob = new Blob(['﻿' + this.formText(i)], { type: 'text/plain;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = f.t + '.txt';
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 3000);
  },

  printForm(i) {
    const f = FORMS[i];
    const w = window.open('', '_blank');
    if (!w) return;
    w.document.write('<html><head><title>' + esc(f.t) + '</title><style>body{font-family:sans-serif;padding:40px;line-height:1.8}pre{white-space:pre-wrap;font-family:inherit;font-size:14px}</style></head><body><h1>' + esc(f.t) + '</h1><pre>' + esc(T(f.body)) + '</pre></body></html>');
    w.document.close();
    w.focus();
    w.print();
  },

  render() {
    const S = this.state;
    const R = this.R;
    const root = document.getElementById('app');
    document.title = R ? `선생님 곁에 — ${R.short} 교육활동 보호·대응 가이드` : '선생님 곁에 — 교육활동 보호·대응 가이드';
    // 공통 데이터의 {HOT}·{LEGAL} 등 지역 토큰을 현재 지역 값(미선택 시 중립 문구)으로 치환
    root.innerHTML = T(`
      <a class="skip-link" href="#main">본문 바로가기</a>
      ${this.renderHeader()}
      <main id="main">
        ${S.page === 'home' ? this.renderHome() : ''}
        ${S.page === 'proc' ? this.renderProc() : ''}
        ${S.page === 'guide' ? this.renderGuide() : ''}
        ${S.page === 'forms' ? this.renderForms() : ''}
        ${S.page === 'support' ? this.renderSupport() : ''}
        ${S.page === 'orgs' ? this.renderOrgs() : ''}
        ${S.page === 'about' ? this.renderAbout() : ''}
        ${this.renderFaq()}
      </main>
      ${this.renderFooter()}
      ${this.renderBottomNav()}
      ${S.formModal !== null ? this.renderFormModal() : ''}
      ${S.moreOpen ? this.renderMoreSheet() : ''}
      <div id="toast" class="toast" role="status" aria-live="polite"></div>
    `);
    document.body.style.overflow = (S.formModal !== null || S.moreOpen) ? 'hidden' : '';
  },

  // ══════════════ 지역 선택 ══════════════
  renderRegionSelect(extraClass) {
    const cur = this.state.regionId;
    const opts = REGION_ORDER.map(id =>
      `<option value="${id}" ${cur === id ? 'selected' : ''}>${REGIONS[id].short}</option>`
    ).join('');
    return `
      <label class="region-select ${extraClass || ''} ${cur ? '' : 'empty'}">
        <span class="sr-only">근무 지역 선택</span>
        <span class="region-select-pin" aria-hidden="true">📍</span>
        <select onchange="App.setRegion(this.value)" aria-label="근무 지역 선택">
          ${cur ? '' : '<option value="" selected>지역 선택</option>'}
          ${opts}
        </select>
      </label>
    `;
  },

  renderRegionButtons() {
    return REGION_ORDER.map(id =>
      `<button class="region-pick-btn" onclick="App.setRegion('${id}')"><span class="region-pick-name">${REGIONS[id].short}</span><span class="region-pick-sub">${REGIONS[id].office}</span></button>`
    ).join('');
  },

  // 지역이 필요한 화면에서 쓰는 선택 카드. 긴급 안내(112)는 지역과 상관없이 함께 보여요.
  renderRegionPicker(title, sub, id) {
    return `
      <div class="region-picker" ${id ? `id="${id}"` : ''}>
        <div class="region-picker-title">${title}</div>
        ${sub ? `<p class="region-picker-sub">${sub}</p>` : ''}
        <div class="region-pick-row">${this.renderRegionButtons()}</div>
        <p class="region-picker-note">지금 위험한 상황이라면 지역을 고르기 전에 <a href="tel:112" class="tel-link">112</a>에 먼저 신고하세요.</p>
      </div>
    `;
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
          <div class="brand-badge" aria-hidden="true">곁</div>
          <div class="brand-text">
            <div class="brand-name">선생님 곁에</div>
            <div class="brand-sub">교육활동 보호·대응 가이드</div>
          </div>
          ${this.renderRegionSelect('in-header')}
          <nav class="main-nav" aria-label="주요 메뉴">${navHtml}</nav>
          ${R ? `<a href="{TEL}" class="header-call" aria-label="${R.short} 교육활동 보호 대표번호 {HOT} 전화 걸기"><span aria-hidden="true">☎</span><span class="header-call-num"> {HOT}</span></a>` : ''}
          <button class="mobile-menu-btn" onclick="App.toggleMore()" aria-label="전체 메뉴 열기">☰</button>
        </div>
      </header>
    `;
  },

  // ══════════════ 홈 ══════════════
  renderHome() {
    return `
      ${this.renderHero()}
      ${this.R ? '' : `<section class="section region-picker-section">${this.renderRegionPicker('어느 지역에서 근무하시나요?', '지역을 고르면 그 지역의 대표번호, 교육지원청, 지원제도를 바로 보여 드려요. 선택은 이 기기에만 저장돼요.', 'region-picker')}</section>`}
      ${this.renderMarquee()}
      ${this.renderQuickHelp()}
      ${this.renderSteps()}
      ${this.renderCta()}
      ${this.renderSituChips()}
      ${this.renderProtections()}
      ${this.renderSupportCards()}
      ${this.renderRegionFinder()}
    `;
  },

  renderHero() {
    const R = this.R;
    return `
      <section class="hero">
        <div>
          <span class="hero-chip">🌿 ${R ? `${R.basis} 기준` : '전국 공통 대응 절차 안내'}</span>
          <h1>선생님 곁에 늘 가까이,<br><span class="highlight">교육활동 침해 대응부터 회복까지</span><br>함께합니다</h1>
          <p class="hero-sub">불안하고 지친 마음, 혼자 감당하지 않으셔도 돼요.<br>무엇을 먼저 해야 하는지, 어디에 신고하고 어떤 지원을 받을 수 있는지 ${R ? `${R.short}의 절차에 맞게` : '근무 지역의 절차에 맞게'} 차근차근 안내해 드릴게요.</p>
          <div class="hero-btn-row">
            <button class="btn btn-primary" onclick="App.nav('proc')">지금 대응 절차 확인하기</button>
            ${R
              ? '<a href="{TEL}" class="btn btn-accent">☎ {HOT} 바로 연결</a>'
              : '<button class="btn btn-accent" onclick="App.goRegionPicker()">📍 근무 지역 선택하기</button>'}
            <button class="btn btn-ghost" onclick="App.goRegionPicker()">내 교육지원청 찾기</button>
            <button class="btn btn-text" onclick="App.nav('forms')">기록지·체크리스트 열기</button>
          </div>
        </div>
        <div class="hero-art">
          <div class="hero-blob"></div>
          <div class="hero-card">
            <div class="hero-icon-circle">💬</div>
            <div style="font-weight:700;font-size:16px">오늘, 어떤 일이 있으셨나요?</div>
            <div class="hero-art-slot">따뜻한 사진·일러스트 자리</div>
            <div class="tag-row">
              <span class="badge badge-main">심리·치유</span>
              <span class="badge badge-lav">법률 지원</span>
              <span class="badge badge-accent">신고·심의</span>
            </div>
          </div>
        </div>
      </section>
    `;
  },

  renderMarquee() {
    const R = this.R;
    const items = ['예방', '✿', '대응', '✿', '치유', '✿', '기반 구축', '✿', R ? `${R.hotName} {HOT}` : '긴급 상황은 112', '✿'];
    const track = items.concat(items).map(s => `<span>${s}</span>`).join('');
    return `<div class="marquee" aria-hidden="true"><div class="marquee-track">${track}</div></div>`;
  },

  renderQuickHelp() {
    const S = this.state;
    const R = this.R;
    const items = QUICK.map((q, i) => `
      <button class="quick-btn q${i % 4} ${S.quick === q.id ? 'active' : ''}" aria-expanded="${S.quick === q.id}" onclick="App.setState({quick: ${S.quick === q.id ? 'null' : `'${q.id}'`}})">
        ${q.e} ${q.label}
      </button>
    `).join('');
    const detail = QUICK.find(q => q.id === S.quick);
    // 지역 미선택 + 긴급 상황이면 112를, 그 외 지역 미선택이면 지역 선택을 먼저 안내
    const callBtn = R
      ? '<a href="{TEL}" class="btn btn-accent">☎ 긴급 연락 {HOT}</a>'
      : detail && detail.urgent
        ? '<a href="tel:112" class="btn btn-accent">☎ 긴급 신고 112</a>'
        : '<button class="btn btn-accent" onclick="App.goRegionPicker()">📍 지역 선택하고 연락처 보기</button>';
    return `
      <section class="section">
        <div class="eyebrow"><span class="eyebrow-dot"></span>빠른 안내</div>
        <h2 class="h2">지금 어떤 도움이 필요하신가요?</h2>
        <p class="section-sub">상황을 선택하면 지금 가장 먼저 해야 할 일과 연락할 기관을 바로 보여 드려요.</p>
        <div class="grid-auto" style="margin-bottom:22px">${items}</div>
        ${detail ? `
          <div class="quick-detail">
            ${detail.urgent ? `<div class="urgent-box">현재 폭행, 협박, 난입 등으로 신변의 위험이 지속되는 경우에는 행정 절차보다 현장 이탈과 안전 확보, 관리자 보고, 경찰 신고(<a href="tel:112" class="tel-link">112</a>)가 우선입니다.</div>` : ''}
            <div class="grid-auto-230">
              <div><div class="detail-label-accent">지금 가장 먼저 해야 할 일</div><div class="detail-text">${detail.first}</div></div>
              <div><div class="detail-label-main">연락해야 할 기관</div><div class="detail-text">${detail.org}</div></div>
              <div><div class="detail-label-main">준비할 기록과 증거</div><div class="detail-text">${detail.records}</div></div>
              <div><div class="detail-label-lav">신청 가능한 지원</div><div class="detail-text">${detail.supports}</div></div>
              <div><div class="detail-label-muted">다음 절차</div><div class="detail-text">${detail.next}</div></div>
            </div>
            <div class="btn-row" style="margin-top:22px">
              ${callBtn}
              <button class="btn btn-ghost" onclick="App.nav('proc')">관련 대응 절차 보기 →</button>
            </div>
          </div>
        ` : ''}
      </section>
    `;
  },

  renderSteps() {
    const rows = STEPS.map((s, i) => `
      <div class="step-row">
        <div class="step-num-col">
          <div class="step-num c${i}">${s.n}</div>
          ${i < 3 ? '<div class="step-line"></div>' : ''}
        </div>
        <div class="step-tl-card">
          <div class="step-tl-head">
            <span class="step-tl-title">${s.title}</span>
            <span class="badge ${i < 2 ? 'badge-main' : i === 2 ? 'badge-lav' : 'badge-accent'}">${s.org}</span>
            ${s.deadline ? `<span class="deadline-badge">⏱ ${s.deadline}</span>` : ''}
          </div>
          <div class="step-tl-sum">${s.sum}</div>
        </div>
      </div>
    `).join('');
    return `
      <section class="section-alt">
        <div class="section-alt-inner">
          <div class="eyebrow"><span class="eyebrow-dot"></span>사안 처리 절차</div>
          <h2 class="h2">사안 처리 4단계, 차근차근</h2>
          <p class="section-sub">각 단계의 담당 기관과 기한을 확인하세요. 실제 기한·제출 방식은 최신 매뉴얼과 소속 교육지원청 안내를 다시 확인해 주세요.</p>
          <div class="steps-timeline">${rows}</div>
        </div>
      </section>
    `;
  },

  renderCta() {
    const R = this.R;
    if (!R) {
      return `
        <section class="section">
          <div class="cta-band">
            <div style="flex:1;min-width:280px">
              <div class="cta-eyebrow">지역별 대표번호</div>
              <div class="cta-title">근무 지역을 고르면<br>연결할 번호를 알려 드려요</div>
              <div class="cta-sub">시·도교육청마다 교육활동 보호 대표번호와 지원 창구가 달라요.</div>
            </div>
            <div style="text-align:center;flex:1;min-width:260px">
              <div class="cta-phone-label">긴급 상황이라면</div>
              <a href="tel:112" class="cta-phone">112</a>
              <div><button class="btn cta-btn" onclick="App.goRegionPicker()">지역 선택하기</button></div>
            </div>
          </div>
        </section>
      `;
    }
    const menuRows = R.menu
      ? R.menu.map((m, i) => `<div class="cta-row"><span class="cta-num n${i + 1}">${i + 1}</span><span style="font-size:14px">${m}</span></div>`).join('')
      : `<div class="cta-row"><span class="cta-num n1" aria-hidden="true">☎</span><span style="font-size:14px">${R.menuNote || '연결 후 안내에 따라 상담을 요청하세요.'}</span></div>`;
    return `
      <section class="section">
        <div class="cta-band">
          <div style="flex:1;min-width:280px">
            <div class="cta-eyebrow">${R.hotName}</div>
            <div class="cta-title">한 번의 전화로,<br>필요한 지원까지 연결해요</div>
            <div class="cta-sub">${R.hotSummary || '교육활동 침해 대응, 법률, 상담, 치료, 신고 및 심의 절차를 안내받을 수 있어요.'}</div>
            <div style="display:flex;flex-direction:column;gap:8px;max-width:430px;margin-top:16px">
              ${menuRows}
            </div>
            <div class="cta-note">※ 전화 연결 방식과 담당 부서는 변경될 수 있어요 · ${fmtDate(R.verifiedAt)} 최종 확인</div>
          </div>
          <div style="text-align:center;flex:1;min-width:260px">
            <div class="cta-phone-label">${R.short} 교육활동 보호 대표번호</div>
            <a href="{TEL}" class="cta-phone">{HOT}</a>
            <div><a href="{TEL}" class="btn cta-btn">지금 바로 연결하기</a></div>
          </div>
        </div>
      </section>
    `;
  },

  renderSituChips() {
    const chips = SITU_CHIPS.map((label, i) =>
      `<span class="chip badge-${['main', 'accent', 'lav', 'danger'][i % 4]}">${label}</span>`
    ).join('');
    return `
      <section class="section">
        <div class="eyebrow"><span class="eyebrow-dot"></span>상황별 대응</div>
        <h2 class="h2">이런 상황이라면, 이렇게</h2>
        <p class="section-sub">${SITUS.length}가지 상황별 가이드에서 지금 상황과 가장 가까운 안내를 찾아보세요.</p>
        <div class="chip-row">${chips}</div>
        <p style="font-size:12.5px;color:var(--text-faint);margin:18px 0 0;line-height:1.6">구체적인 사안의 교육활동 침해 해당 여부는 사실관계 조사와 지역교권보호위원회 심의를 통해 판단될 수 있습니다.</p>
      </section>
    `;
  },

  renderProtections() {
    const cards = PROTECTIONS.map(p => `
      <div class="card">
        <div class="protect-head"><span style="font-size:20px">${p.e}</span><span class="protect-title">${p.t}</span></div>
        <div class="protect-desc">${p.d}</div>
      </div>
    `).join('');
    return `
      <section class="section-alt">
        <div class="section-alt-inner">
          <div class="eyebrow"><span class="eyebrow-dot"></span>피해 교원 보호조치</div>
          <h2 class="h2">선생님이 학교에 요청할 수 있는 보호조치</h2>
          <p class="section-sub">보호조치는 피해 교원의 의사를 확인한 후 이루어져요. 필요한 조치를 학교 관리자와 {OFFICER}에게 요청하세요.</p>
          <div class="grid-auto-250">${cards}</div>
        </div>
      </section>
    `;
  },

  renderSupportCards() {
    const R = this.R;
    const cards = SUPPORT_CARDS.map((s, i) => `
      <div class="support-card s${i}">
        <div class="support-emoji">${s.e}</div>
        <div class="support-cat">${s.cat}</div>
        <div class="support-title">${s.t}</div>
        <div class="support-desc">${s.d}</div>
      </div>
    `).join('');
    return `
      <section class="section">
        <div class="eyebrow"><span class="eyebrow-dot"></span>지원 체계</div>
        <h2 class="h2">법률부터 치유·회복까지</h2>
        <p class="section-sub">${R ? `${R.short} 교원이라면 누구나, {HOT} 한 통으로 연결돼요.` : '근무 지역을 선택하면 연결되는 대표번호와 지원 창구를 알려 드려요.'}</p>
        <div class="grid-auto-250">${cards}</div>
      </section>
    `;
  },

  // 시·군·구 → 담당 교육지원청. 지역 수와 상관없이 select 하나로 표현해요(경기 31개 시·군도 한 화면).
  renderRegionFinder() {
    const R = this.R;
    if (!R) {
      return `
        <section class="section-alt" id="region-finder">
          <div class="section-alt-inner">
            <div class="eyebrow"><span class="eyebrow-dot"></span>내 교육지원청 찾기</div>
            ${this.renderRegionPicker('먼저 근무 지역을 선택해 주세요', '교육활동 침해 신고와 지역교권보호위원회 심의는 소속 교육지원청이 담당해요.')}
          </div>
        </section>
      `;
    }
    const areas = regionAreas(R);
    const opts = areas.map(a => `<option value="${a.area}" ${this.state.area === a.area ? 'selected' : ''}>${a.area}</option>`).join('');
    const hit = areas.find(a => a.area === this.state.area);
    const office = hit ? hit.office : null;
    return `
      <section class="section-alt" id="region-finder">
        <div class="section-alt-inner">
          <div class="eyebrow"><span class="eyebrow-dot"></span>내 교육지원청 찾기</div>
          <h2 class="h2">학교가 있는 시·군·구를 선택해 주세요</h2>
          <p class="section-sub">교육활동 침해 신고와 지역교권보호위원회 심의는 <strong>소속 교육지원청</strong>이 담당해요. ${R.name} 교육지원청 ${R.offices.length}곳 중에서 찾아 드려요.</p>
          ${R.areaNote ? `<p class="area-note">ⓘ ${R.areaNote}</p>` : ''}
          <label class="area-select">
            <span class="area-select-label">${R.short} 시·군·구</span>
            <select onchange="App.setState({area: this.value})">
              <option value="" ${office ? '' : 'selected'}>선택해 주세요</option>
              ${opts}
            </select>
          </label>
          ${office ? `
            <div class="region-card">
              <div>
                <div class="detail-label-main">담당 교육지원청</div>
                <div style="font-weight:700;font-size:18px">${officeTitle(office)}</div>
                <div style="font-size:13px;color:var(--text-faint);margin-top:4px">관할 · ${office.areas.join('·')}</div>
              </div>
              <div class="detail-text"><strong>신고·심의</strong> — 소속 교육지원청 또는 {HOT2}로 연락하세요.${office.contact && /\d/.test(office.contact) ? ` 교육지원청 연락처: ${linkifyPhone(office.contact)}` : ''}</div>
              <div class="detail-text"><strong>지원 문의</strong> — 법률·심리상담·치료는 {HOT1} · ${office.url ? `<a href="${office.url}" target="_blank" rel="noopener">교육지원청 홈페이지</a>` : '대표번호는 홈페이지'}에서 최신 확인.</div>
            </div>
          ` : ''}
        </div>
      </section>
    `;
  },

  // ══════════════ 대응 절차 ══════════════
  renderProc() {
    const S = this.state;
    const tabs = STEPS.map((s, i) => `
      <button class="step-tab ${S.stepIdx === i ? 'active' : ''}" aria-pressed="${S.stepIdx === i}" onclick="App.setState({stepIdx:${i}})">
        <span class="step-tab-n">${s.n}</span>
        <span class="step-tab-title">${s.title}</span>
        <span class="badge ${i < 2 ? 'badge-main' : i === 2 ? 'badge-lav' : 'badge-accent'} step-tab-badge">${s.org}</span>
      </button>
    `).join('');
    const step = STEPS[S.stepIdx];
    const detail = STEP_DETAIL[S.stepIdx];
    const items = detail.items.map((label, j) => {
      const key = 's' + S.stepIdx + '-' + j;
      const done = !!S.checks[key];
      return `
        <label class="check-item ${done ? 'done' : ''}">
          <input type="checkbox" ${done ? 'checked' : ''} onchange="App.toggleCheck('${key}')">
          <span class="label">${label}</span>
        </label>
      `;
    }).join('');
    const doneCount = detail.items.filter((_, j) => S.checks['s' + S.stepIdx + '-' + j]).length;
    const listBox = (title, arr, cls) => `
      <div class="info-box ${cls || ''}">
        <div class="info-box-title">${title}</div>
        ${arr.map(x => `<div class="info-box-line">· ${x}</div>`).join('')}
      </div>
    `;
    return `
      <section class="section">
        <div class="eyebrow"><span class="eyebrow-dot"></span>대응 절차</div>
        <h1 class="page-title">교육활동 침해 사안 처리 4단계</h1>
        <p class="section-sub">체크한 내용은 이 기기 안에서만 임시 저장돼요.</p>
        <div class="urgent-box">범죄행위가 의심되거나 긴급한 위험이 있다면 절차 확인보다 안전 확보와 경찰 신고(<a href="tel:112" class="tel-link">112</a>)가 우선이에요.</div>
        <div class="step-tabs-grid">${tabs}</div>
        <div class="proc-card">
          <div class="proc-head">
            <h2>${step.n}. ${step.title}</h2>
            <span class="badge ${S.stepIdx < 2 ? 'badge-main' : S.stepIdx === 2 ? 'badge-lav' : 'badge-accent'}">담당 · ${step.org}</span>
            ${step.deadline ? `<span class="deadline-badge">⏱ ${step.deadline}</span>` : ''}
          </div>
          <p class="proc-sum">${step.sum}</p>
          <div class="proc-check-label">핵심 행동 <span class="proc-check-count">(${doneCount}/${detail.items.length} 완료)</span></div>
          <div class="check-list">${items}</div>
          <div class="grid-auto-250">
            ${listBox('피해 교원이 확인할 일', detail.teacher)}
            ${listBox('학교에 요청·확인할 일', detail.school)}
            ${listBox('교육지원청이 처리하는 일', detail.office)}
            ${listBox('준비 서류·증거자료', detail.docs)}
          </div>
          <div class="grid-auto-250" style="margin-top:20px">
            ${listBox('주의사항', detail.caution, 'caution')}
            <div class="info-box next"><div class="info-box-title">다음 단계 기준</div><div style="font-size:13.5px;line-height:1.6">${detail.next}</div></div>
          </div>
        </div>
        <p class="proc-note">※ 기한은 법률이 아닌 교육활동 보호 매뉴얼 기준이에요(법률은 '지체 없이' 보고). 실제 적용 기한과 제출 방식은 소속 교육지원청 안내를 확인하세요.</p>
        ${sourceBox('절차 근거', COMMON_SOURCES, latestDate(COMMON_SOURCES))}
      </section>
    `;
  },

  // ══════════════ 상황별 가이드 ══════════════
  renderGuide() {
    const S = this.state;
    const groupsHtml = FILTER_DEFS.map(d => {
      const opts = d.opts.map(o => {
        const on = (S.filters[d.g] || []).includes(o);
        return `<button class="pill-btn-sm ${on ? 'active' : ''}" aria-pressed="${on}" onclick="App.toggleFilter('${d.g}','${o}')">${o}</button>`;
      }).join('');
      return `<div class="filter-group-row"><span class="filter-group-name">${d.g}</span>${opts}</div>`;
    }).join('');

    const filtered = SITUS.filter(s => FILTER_DEFS.every(d => {
      const sel = S.filters[d.g] || [];
      return sel.length === 0 || sel.some(o => d.test(s, o));
    }));

    const cards = filtered.map(s => `
      <div class="card situ-card">
        <div class="situ-tags">
          <span class="badge ${URGENCY_BADGE_CLASS[s.urgency]}">${s.urgency}</span>
          <span class="badge badge-muted">${s.subject}</span>
        </div>
        <div class="situ-title">${s.t}</div>
        <div class="situ-ex"><strong>예시</strong> — ${s.ex}</div>
        <div class="situ-facts">
          <div><strong>즉시 행동</strong> · ${s.act}</div>
          <div><strong>학교에 알릴 내용</strong> · ${s.report}</div>
          <div><strong>확보할 증거</strong> · ${s.evidence}</div>
          <div><strong>하지 말 것</strong> · ${s.dont}</div>
          <div><strong>이용 가능 지원</strong> · ${s.programs}</div>
          <div><strong>신고·상담 기관</strong> · ${s.orgs}</div>
        </div>
        <button class="situ-goto" onclick="App.nav('proc')">관련 절차 바로가기 →</button>
      </div>
    `).join('');

    return `
      <section class="section">
        <div class="eyebrow"><span class="eyebrow-dot"></span>상황별 가이드</div>
        <h1 class="page-title">상황에 맞는 대응 방법 찾기</h1>
        <div class="urgent-box">현재 폭행, 협박, 난입 등으로 신변의 위험이 지속되는 경우에는 행정 절차보다 현장 이탈과 안전 확보, 관리자 보고, 경찰 신고(<a href="tel:112" class="tel-link">112</a>)가 우선입니다.</div>
        <div class="card filter-card">
          ${groupsHtml}
          <div class="filter-footer">
            <span class="filter-count">${filtered.length}개 상황 검색됨</span>
            <button class="filter-reset" onclick="App.clearFilters()">필터 초기화</button>
          </div>
        </div>
        <div class="grid-auto-330">${cards}</div>
      </section>
    `;
  },

  // ══════════════ 서식·체크리스트 ══════════════
  renderForms() {
    const cards = FORMS.map((f, i) => `
      <div class="card form-card">
        <span class="badge ${f.official ? 'badge-main' : 'badge-muted'}">${f.official ? '공식 제출 서식 준비용' : '참고용 기록지'}</span>
        <div class="form-title">${f.t}</div>
        <div class="form-desc">${f.d}</div>
        <div class="form-actions">
          <button class="btn btn-primary btn-small" onclick="App.setState({formModal:${i}})">미리보기</button>
          <button class="btn btn-ghost btn-small" onclick="App.copyForm(${i})">복사</button>
          <button class="btn btn-ghost btn-small" onclick="App.downloadForm(${i})">내려받기</button>
          <button class="btn btn-ghost btn-small" onclick="App.printForm(${i})">인쇄</button>
        </div>
      </div>
    `).join('');
    return `
      <section class="section">
        <div class="eyebrow"><span class="eyebrow-dot"></span>서식·체크리스트</div>
        <h1 class="page-title">바로 쓰는 기록지와 체크리스트</h1>
        <div class="urgent-box">공식 서식은 제출 전 소속 학교·교육지원청의 최신 서식인지 반드시 확인하세요. 민감한 개인정보는 공개된 공간에 입력하지 마세요.</div>
        <div class="grid-auto-300">${cards}</div>
      </section>
    `;
  },

  renderFormModal() {
    const f = FORMS[this.state.formModal];
    return `
      <div class="modal-overlay" onclick="App.setState({formModal:null})">
        <div class="modal-box" role="dialog" aria-modal="true" aria-label="${f.t}" onclick="event.stopPropagation()">
          <div class="modal-head">
            <h3 class="h2" style="margin:0">${f.t}</h3>
            <button class="modal-close" aria-label="닫기" onclick="App.setState({formModal:null})">✕</button>
          </div>
          <span class="badge ${f.official ? 'badge-main' : 'badge-muted'}">${f.official ? '공식 제출 서식 준비용' : '참고용 기록지'}</span>
          ${f.official ? `<div class="urgent-box" style="margin-top:14px">제출 전 소속 학교·교육지원청의 최신 공식 서식인지 반드시 확인해 주세요.</div>` : ''}
          <pre class="modal-body">${esc(T(f.body))}</pre>
          <div class="modal-actions">
            <button class="btn btn-ghost" onclick="App.setState({formModal:null})">닫기</button>
            <button class="btn btn-ghost" onclick="App.setState({formModal:null}); App.nav('proc')">관련 절차 확인 →</button>
          </div>
        </div>
      </div>
    `;
  },

  // 지역 데이터의 출처·최종 확인일 안내
  renderSources(R) {
    return sourceBox('공식 출처', R.sources, R.verifiedAt,
      `정책·연락처는 바뀔 수 있어요. 최신 내용은 <a href="${R.officeUrl}" target="_blank" rel="noopener">${R.office} 홈페이지</a>에서 확인하세요.`);
  },

  // ══════════════ 지원제도 ══════════════
  renderSupport() {
    const R = this.R;
    if (!R) {
      return `
        <section class="section">
          <div class="eyebrow"><span class="eyebrow-dot"></span>지원제도</div>
          <h1 class="page-title">신청할 수 있는 지원, 한눈에</h1>
          ${this.renderRegionPicker('근무 지역을 선택해 주세요', '지원제도의 이름·신청 방법·연락처는 시·도교육청마다 달라요.')}
        </section>
      `;
    }
    const cards = R.programs.map(p => `
      <div class="card program-card">
        <div class="situ-tags">
          <span class="badge ${PROGRAM_AREA_CLASS[p.area] || 'badge-muted'}">${p.area}</span>
          <span class="badge ${PROGRAM_STATUS_CLASS[p.status] || 'badge-muted'}">${p.status}</span>
        </div>
        <div class="program-title">${p.t}</div>
        <div class="program-sum">${p.sum}</div>
        <div class="program-facts">
          <div><strong>대상</strong> · ${p.target || UNKNOWN}</div>
          <div><strong>담당</strong> · ${p.org || UNKNOWN}</div>
          <div><strong>신청 방법</strong> · ${p.apply || UNKNOWN}</div>
          <div><strong>준비 자료</strong> · ${p.docs || UNKNOWN}</div>
          <div><strong>처리 기한</strong> · ${p.deadline || UNKNOWN}</div>
          <div><strong>연락처</strong> · ${p.contact ? linkifyPhone(p.contact) : UNKNOWN}</div>
        </div>
        <div class="program-updated">${sourceLine(R, p)}</div>
      </div>
    `).join('');
    return `
      <section class="section">
        <div class="eyebrow"><span class="eyebrow-dot"></span>${R.short} 지원제도</div>
        <h1 class="page-title">신청할 수 있는 지원, 한눈에</h1>
        <p class="section-sub">${R.basis} 기준. 시행 상태와 최종 확인 날짜를 함께 확인하세요.</p>
        ${this.renderSources(R)}
        <div class="grid-auto-320">${cards}</div>
      </section>
    `;
  },

  // ══════════════ 지원기관 ══════════════
  renderOrgs() {
    const S = this.state;
    const R = this.R;
    const ORGS = R ? [...ORGS_SCHOOL, ...officeOrgs(R), ...R.orgs, ...ORGS_EMERGENCY] : [...ORGS_SCHOOL, ...ORGS_EMERGENCY];
    const cats = ORG_CATS.filter(c => c === '전체' || ORGS.some(o => o.cat === c)).map(c =>
      `<button class="pill-btn ${S.orgCat === c ? 'active' : ''}" aria-pressed="${S.orgCat === c}" onclick="App.setState({orgCat:'${c}'})">${c}</button>`
    ).join('');
    const filtered = ORGS.filter(o => S.orgCat === '전체' || o.cat === S.orgCat);
    const cards = filtered.map(o => `
      <div class="card org-card">
        <span class="badge ${ORG_CAT_CLASS[o.cat] || 'badge-muted'}">${o.cat}</span>
        <div class="org-title">${o.name}</div>
        <div class="org-facts">
          <div><strong>담당 지역</strong> · ${o.region || UNKNOWN}</div>
          <div><strong>지원 내용</strong> · ${o.role || UNKNOWN}</div>
          <div><strong>연락처</strong> · ${o.contact ? linkifyPhone(o.contact) : UNKNOWN}</div>
          <div><strong>운영 시간</strong> · ${o.hours || UNKNOWN}</div>
        </div>
      </div>
    `).join('');
    return `
      <section class="section">
        <div class="eyebrow"><span class="eyebrow-dot"></span>지원기관</div>
        <h1 class="page-title">${R ? `${R.short} 교원이 도움을 요청할 수 있는 곳` : '도움을 요청할 수 있는 곳'}</h1>
        ${R ? this.renderSources(R) : this.renderRegionPicker('근무 지역을 선택하면 지역 기관이 함께 보여요', '지금은 모든 지역에 공통인 학교 내 창구와 긴급 신고만 보여 드려요.')}
        <div class="org-cats-row">${cats}</div>
        <div class="grid-auto-300">${cards}</div>
      </section>
    `;
  },

  // ══════════════ 소개 ══════════════
  renderAbout() {
    const R = this.R;
    const regionList = REGION_ORDER.map(id => REGIONS[id].short).join('·');
    return `
      <section class="faq-section">
        <div class="eyebrow"><span class="eyebrow-dot"></span>소개</div>
        <h1 class="page-title">선생님 곁에</h1>
        <p class="about-p">‘선생님 곁에’는 교육활동 침해, 아동학대 신고, 학교민원, 특이민원 등으로 어려움을 겪는 선생님이 지금 무엇을 먼저 해야 하는지 빠르게 판단할 수 있도록 돕는 교육활동 보호·대응 가이드예요.</p>
        <p class="about-p">사안 처리 절차와 상황별 가이드는 어느 지역에서나 같은 공통 절차를 바탕으로 하고, 대표번호·교육지원청·지원기관·지원제도는 근무 지역(현재 ${regionList})의 공식 자료를 바탕으로 보여 드려요. 지역 정보마다 출처와 최종 확인일을 함께 적어 두었어요.</p>
        <p class="about-p">이 서비스는 공식 기관을 대신하지 않아요. 실제 사안의 판단과 절차는 학교, 교육(지원)청, 관계기관의 최신 안내를 따라 주세요. ‘교권침해’라는 표현과 공식 용어인 ‘교육활동 침해’를 함께 사용하되, 주요 메뉴와 절차에서는 공식 용어를 우선 사용해요.</p>
        ${R ? this.renderSources(R) : ''}
        <div class="card about-note">개인정보 보호를 위해 체크리스트와 기록 내용을 서버에 저장하지 않아요. 선택한 지역과 체크 상태는 사용자의 기기 안에서만 저장돼요.</div>
      </section>
    `;
  },

  // ══════════════ FAQ / 푸터 ══════════════
  renderFaq() {
    const S = this.state;
    const items = FAQS.map((f, i) => {
      const open = S.faqOpen === i;
      return `
        <div class="faq-item">
          <button class="faq-btn" aria-expanded="${open}" onclick="App.setState({faqOpen:${open ? 'null' : i}})">
            <span>${f.q}</span><span class="faq-mark" aria-hidden="true">${open ? '−' : '+'}</span>
          </button>
          ${open ? `<div class="faq-answer">${f.a}</div>` : ''}
        </div>
      `;
    }).join('');
    return `
      <section class="faq-section">
        <div class="eyebrow center"><span class="eyebrow-dot"></span>자주 묻는 질문</div>
        <h2 class="h2 center">궁금한 점이 있으신가요?</h2>
        <div style="display:flex;flex-direction:column;gap:10px;margin-top:24px">${items}</div>
      </section>
    `;
  },

  renderFooter() {
    const R = this.R;
    return `
      <footer class="site-footer">
        <div class="footer-inner">
          <div class="footer-brand-row">
            <div class="footer-badge" aria-hidden="true">곁</div>
            <div><div style="font-weight:700;font-size:15px">선생님 곁에</div><div style="font-size:11.5px;opacity:.7">${R ? `${R.short} ` : ''}교육활동 보호·대응 가이드</div></div>
            ${R ? '<a href="{TEL}" class="footer-call">☎ {HOT}</a>' : '<a href="tel:112" class="footer-call">긴급 112</a>'}
          </div>
          <p class="footer-p">본 사이트는 ${R ? `${R.basis}과(와) 공통 교육활동 보호 절차` : '공통 교육활동 보호 절차'}를 바탕으로 교육활동 침해 대응 절차를 이해하기 쉽게 안내하기 위한 참고용 서비스입니다. 실제 사안의 교육활동 침해 해당 여부, 신고·조사·심의 절차, 보호조치 및 지원 여부는 구체적인 사실관계와 관련 법령, 최신 교육활동 보호 매뉴얼, ${R ? R.office : '소속 시·도교육청'} 및 소속 교육지원청의 안내에 따라 달라질 수 있습니다.</p>
          <p class="footer-p">폭행, 협박, 난입 등으로 현재 신변의 위험이 있는 경우에는 사이트 이용보다 현장 이탈, 안전 확보, 관리자 보고 및 경찰 신고를 우선해 주세요. 교육활동 침해 사안과 관련된 개인정보와 사건 자료를 공개된 게시판이나 외부 공유 공간에 입력하지 마세요.</p>
          <p class="footer-fine">법령·행정 절차·지원 금액·기관 연락처 등은 변경될 수 있습니다${R ? ` · ${R.short} 정보 ${fmtDate(R.verifiedAt)} 최종 확인` : ''}</p>
        </div>
      </footer>
    `;
  },

  // ══════════════ 모바일 하단 내비게이션 ══════════════
  renderBottomNav() {
    const S = this.state;
    const isMoreTab = ['forms', 'support', 'about'].includes(S.page);
    const tab = (page, icon, label, active, action) => `
      <button class="bn-btn ${active ? 'active' : ''}" ${active && page !== 'more' ? 'aria-current="page"' : ''} onclick="${action}">
        <span class="bn-icon" aria-hidden="true">${icon}</span><span class="bn-label">${label}</span>
      </button>
    `;
    return `
      <nav class="bottom-nav" aria-label="하단 메뉴">
        ${tab('home', '🏠', '홈', S.page === 'home', "App.nav('home')")}
        ${tab('proc', '📋', '대응절차', S.page === 'proc', "App.nav('proc')")}
        ${tab('guide', '🧭', '상황가이드', S.page === 'guide', "App.nav('guide')")}
        ${tab('orgs', '🏢', '지원기관', S.page === 'orgs', "App.nav('orgs')")}
        ${tab('more', '☰', '전체', isMoreTab || S.moreOpen, 'App.toggleMore()')}
      </nav>
    `;
  },

  renderMoreSheet() {
    return `
      <div class="modal-overlay sheet-overlay" onclick="App.setState({moreOpen:false})">
        <div class="sheet-box" role="dialog" aria-modal="true" aria-label="전체 메뉴" onclick="event.stopPropagation()">
          <div class="modal-head">
            <h3 class="h2" style="margin:0">전체 메뉴</h3>
            <button class="modal-close" aria-label="닫기" onclick="App.setState({moreOpen:false})">✕</button>
          </div>
          <div class="sheet-region">
            <span class="sheet-region-label">근무 지역</span>
            ${this.renderRegionSelect('in-sheet')}
          </div>
          <div class="sheet-menu">
            <button class="sheet-item" onclick="App.nav('forms')"><span aria-hidden="true">🗂️</span> 서식·체크리스트</button>
            <button class="sheet-item" onclick="App.nav('support')"><span aria-hidden="true">🤝</span> 지원제도</button>
            <button class="sheet-item" onclick="App.nav('about')"><span aria-hidden="true">ℹ️</span> 소개</button>
          </div>
        </div>
      </div>
    `;
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
  if (q && REGIONS[q]) { storeSet(STORAGE.region, q); return q; }
  const saved = storeGet(STORAGE.region);
  if (saved && REGIONS[saved]) return saved;
  if (saved) storeSet(STORAGE.region, null);
  return null;
}

// 체크 상태 불러오기. 예전 키(icn-gyeote-checks)가 있으면 새 키로 한 번만 옮기고 지워요.
function loadChecks() {
  const parse = raw => {
    try {
      const v = JSON.parse(raw || '{}');
      return v && typeof v === 'object' && !Array.isArray(v) ? v : {};
    } catch (e) { return {}; }
  };
  const current = storeGet(STORAGE.checks);
  const legacy = storeGet(STORAGE.legacyChecks);
  if (current === null && legacy !== null) {
    const migrated = parse(legacy);
    storeSet(STORAGE.checks, JSON.stringify(migrated));
    storeSet(STORAGE.legacyChecks, null);
    return migrated;
  }
  return parse(current);
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

// 교육지원청을 '신고·심의' 기관 카드로 변환
function officeOrgs(R) {
  return R.offices.map(o => ({
    cat: '신고·심의',
    name: officeTitle(o),
    region: o.areas.join('·'),
    role: o.role || '신고 접수, 사안 조사, 지역교권보호위원회',
    contact: o.contact,
    hours: o.hours
  }));
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
    <li>${s.url ? `<a href="${s.url}" target="_blank" rel="noopener">${s.title}</a>` : s.title}${s.verifiedAt ? ` <span class="source-date">· ${fmtDate(s.verifiedAt)} 확인</span>` : ''}</li>
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

function esc(str) {
  return String(str).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

// 02-1234-5678, 1600-8787, 032-1395(1번), 112 형태의 번호에 전화 링크를 걸어요
function linkifyPhone(text) {
  return String(text).replace(/(\d{2,4}-\d{3,4}(?:-\d{4})?(?:\(\d번\))?|\b112\b)/g, m => {
    return '<a href="' + telHref(m) + '" class="tel-link">' + m + '</a>';
  });
}

document.addEventListener('DOMContentLoaded', () => App.init());
