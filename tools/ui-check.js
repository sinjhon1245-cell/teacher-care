// 화면 회귀 점검(브라우저에서 실행): 등록된 모든 지역(REGION_ORDER) × 5개 메뉴를 차례로 열며 연락처·넘침·전화 링크를 확인해요.
// 데이터 점검(node tools/check-all.js)이 못 보는 ‘실제로 그려진 화면’을 재요. 사이트 파일은 바꾸지 않아요.
//
// 사용법
//   1) 사이트(로컬 또는 배포 주소)를 브라우저로 열어요.
//   2) 개발자 도구 콘솔에 이 파일 내용을 붙여 넣고 실행해요 → 표와 요약 객체가 나와요.
//   3) 화면 너비 360·375·390·768·769·881·961·1024·1440에서 각각 실행해요(지역 9곳이면 9 × 45 = 405개 조합).
//      결과 객체의 ‘조합’ 값이 실제로 검사한 지역 × 메뉴 수예요(너비마다 따로 세요).
//      개발자 도구의 기기 모드로 너비를 바꾸고, 바꾼 뒤에는 새로고침 없이 다시 실행해도 돼요.
// 끝나면 처음 보던 지역·메뉴로 돌아가요.
(async function uiCheck() {
  const wait = ms => new Promise(r => setTimeout(r, ms));
  const digits = s => String(s || '').replace(/\(\d번\)/g, '').replace(/\D/g, '');
  const visible = el => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0 && getComputedStyle(el).visibility !== 'hidden'; };
  const PHONE = /\d{2,4}-\d{3,4}(?:-\d{4})?/g;
  const start = { region: App.state.regionId, page: App.state.page };
  const fails = [];
  let combos = 0;
  const fail = (id, pg, check, detail) => fails.push({ 지역: id, 메뉴: pg, 검사: check, 내용: detail });

  for (const id of REGION_ORDER) {
    const R = REGIONS[id];
    const { main, levels } = contactModel(R);
    const expected = [...(main ? [main] : []), ...levels];
    for (const [pg] of PAGES) {
      App.setRegion(id);
      App.nav(pg);
      window.scrollTo(0, 0);
      await wait(80);
      combos++;
      const mainEl = document.querySelector('main');

      // 1) 페이지 가로 넘침
      const docOver = document.documentElement.scrollWidth - document.documentElement.clientWidth;
      if (docOver > 0) fail(id, pg, '페이지 가로 넘침', docOver + 'px');

      // 2) 요소 단위 넘침: 버튼·연락처 줄·링크가 부모의 안쪽 여백을 넘지 않아야 해요
      document.querySelectorAll('main .btn, main .cc-line, main .hub-link, main .chip, main .panel-hot, .header-call').forEach(el => {
        if (!visible(el)) return;
        const p = el.parentElement, pr = p.getBoundingClientRect(), cs = getComputedStyle(p);
        const limit = pr.right - parseFloat(cs.paddingRight) - parseFloat(cs.borderRightWidth);
        const over = el.getBoundingClientRect().right - limit;
        if (over > 1) fail(id, pg, '요소 넘침', `${el.innerText.replace(/\s+/g, ' ').trim().slice(0, 30)} +${Math.round(over)}px`);
        // 요소 자체는 제자리인데 안의 글자(줄바꿈 금지 번호 등)가 밖으로 나가는 경우
        const inner = el.scrollWidth - el.clientWidth;
        if (inner > 1) fail(id, pg, '글자 넘침', `${el.innerText.replace(/\s+/g, ' ').trim().slice(0, 30)} +${inner}px`);
      });
      // 연락처 카드·허브는 자기 칸보다 넓어지면 안 돼요(긴 번호가 칸을 밀어내는 경우)
      document.querySelectorAll('#contacts, .hub-main').forEach(el => {
        if (!visible(el)) return;
        const over = el.scrollWidth - el.clientWidth;
        if (over > 1) fail(id, pg, '카드 넘침', `${el.id || el.className} +${over}px`);
      });

      // 3) 전화 글자의 숫자 = tel: 숫자
      document.querySelectorAll('a[href^="tel:"]').forEach(a => {
        if (!visible(a)) return;
        const shown = (a.innerText.match(PHONE) || []).map(digits);
        if (shown.length && !shown.includes(digits(a.getAttribute('href')))) fail(id, pg, '전화 글자≠tel', `${a.innerText.trim()} → ${a.getAttribute('href')}`);
      });

      // 8) 치환되지 않은 토큰·빈 값
      const bad = mainEl.innerText.match(/\{(HOT1|HOT2|HOT|TEL|OFFICER|LEGAL|MUTUAL|SOS|MEDIATE)\}|undefined|\bnull\b/);
      if (bad) fail(id, pg, '남은 토큰·빈 값', bad[0]);

      // 5) 헤더 ☎: 대표가 있으면 대표 번호로, 없으면 연락처 카드로 옮기는 버튼
      const hc = document.querySelector('.header-call');
      if (!hc) fail(id, pg, '헤더 ☎', '없음');
      else if (main && digits(hc.getAttribute('href')) !== digits(main.value)) fail(id, pg, '헤더 ☎', `대표 ${main.value}가 아닌 ${hc.getAttribute('href')}`);
      else if (!main && (hc.tagName !== 'BUTTON' || hc.hasAttribute('href'))) fail(id, pg, '헤더 ☎', '학교급별 지역인데 한 번호로 걸어요');

      // 9) 하단 메뉴는 768px 이하에서만, 본문 아래 여백이 메뉴 높이 이상
      const bn = document.querySelector('.bottom-nav');
      const bnShown = bn && getComputedStyle(bn).display !== 'none';
      if (bnShown !== matchMedia('(max-width: 768px)').matches) fail(id, pg, '하단 메뉴', bnShown ? '넓은 화면에 보여요' : '좁은 화면에 없어요');
      if (bnShown && parseFloat(getComputedStyle(document.body).paddingBottom) < bn.getBoundingClientRect().height - 1) fail(id, pg, '하단 메뉴', '본문 아래 여백이 메뉴보다 작아요');

      if (pg === 'home') {
        // 4) 연락처 카드: 데이터의 번호가 모두 있고, 대표가 있으면 첫 전화가 대표
        const card = document.getElementById('contacts');
        const tels = card ? [...card.querySelectorAll('a[href^="tel:"]')].filter(visible) : [];
        const got = [...new Set(tels.map(a => digits(a.getAttribute('href'))))];
        const want = expected.map(c => digits(c.value));
        if (got.length !== want.length || want.some(w => !got.includes(w))) fail(id, pg, '카드 번호', `기대 ${want.join(',')} / 화면 ${got.join(',')}`);
        if (main && tels[0] && digits(tels[0].getAttribute('href')) !== digits(main.value)) fail(id, pg, '카드 첫 전화', `대표 ${main.value}가 첫째가 아니에요`);
        // 10) 전화 대상 높이 44 이상(소수 배율 반올림 0.5 허용), 위아래 간격 8 이상
        const targets = card ? [...card.querySelectorAll('.cc-call, .cc-line')].filter(visible) : [];
        targets.forEach(t => { const h = t.getBoundingClientRect().height; if (h < 43.5) fail(id, pg, '터치 높이', `${t.innerText.replace(/\s+/g, ' ').trim()} ${h.toFixed(1)}px`); });
        const lines = card ? [...card.querySelectorAll('.cc-line')].filter(visible) : [];
        for (let i = 1; i < lines.length; i++) {
          const a = lines[i - 1].getBoundingClientRect(), b = lines[i].getBoundingClientRect();
          if (b.top >= a.bottom - 1 && b.top - a.bottom < 7.5) fail(id, pg, '버튼 간격', `${(b.top - a.bottom).toFixed(1)}px`);
        }

        // 6) 빠른 대응: 대표가 있으면 대표 하나, 없으면 학교급별 번호 모두(라벨 포함)
        for (const q of QUICK) {
          App.state.quick = q.id;
          App.render();
          await wait(20);
          const body = document.querySelector('.action.open .action-body');
          const calls = body ? [...body.querySelectorAll('a.btn-call')] : [];
          const want6 = main ? [main] : levels;
          const ok = calls.length === want6.length && want6.every(c => calls.some(a => digits(a.getAttribute('href')) === digits(c.value) && (!R.hotContacts || a.innerText.includes(c.label))));
          if (!ok) fail(id, pg, '빠른 대응 전화', `${q.id}: ${calls.map(a => a.innerText.replace(/\s+/g, ' ').trim()).join(' | ') || '없음'}`);
          const over = calls.find(a => a.getBoundingClientRect().right > a.parentElement.getBoundingClientRect().right + 1);
          if (over) fail(id, pg, '요소 넘침', `빠른 대응 ${over.innerText.replace(/\s+/g, ' ').trim()}`);
        }
        App.state.quick = null;
        App.render();
      }

      if (pg === 'support') {
        // 7) 지원 찾기 허브: 전화가 설명보다 위, 설명 속 번호는 모두 전화 링크
        const hub = document.querySelector('.hub-main');
        const firstTel = hub && hub.querySelector('a[href^="tel:"]');
        const desc = hub && hub.querySelector('.hub-summary, .hotline-menu');
        if (!firstTel) fail(id, pg, '허브 전화', '없음');
        else if (desc && visible(desc) && firstTel.getBoundingClientRect().top > desc.getBoundingClientRect().top) fail(id, pg, '허브 순서', '설명이 전화보다 위에 있어요');
        // 768px 이하: 설명·바로 이용하기는 접기 줄로, 지원 유형 선택은 대표 연락처 바로 다음(접기 줄 두 개 아래)에 와요
        if (matchMedia('(max-width: 768px)').matches) {
          const folds = [...document.querySelectorAll('.hub .hub-fold')];
          if (folds.length !== 2 || folds.some(d => d.open)) fail(id, pg, '허브 접기', `접기 줄 ${folds.length}개, 펼침 ${folds.filter(d => d.open).length}개`);
          const chip = document.querySelector('.chip-row .chip');
          const hubEnd = document.querySelector('.hub').getBoundingClientRect().bottom;
          if (!chip || chip.getBoundingClientRect().top - hubEnd > 80) fail(id, pg, '유형 선택 위치', chip ? `허브 아래 ${Math.round(chip.getBoundingClientRect().top - hubEnd)}px` : '없음');
        } else if ([...document.querySelectorAll('.hub .hub-fold')].some(d => !d.open)) fail(id, pg, '허브 접기', '넓은 화면인데 접혀 있어요');
        const sum = hub && hub.querySelector('.hub-summary');
        if (sum) {
          // 좁은 화면에서는 설명이 접혀 있어 innerText가 비어요 → 글자 그대로(textContent)로 세요
          const n = (sum.textContent.match(PHONE) || []).length, linked = sum.querySelectorAll('a.tel-link').length;
          if (n !== linked) fail(id, pg, '허브 설명 번호', `번호 ${n}개 중 링크 ${linked}개`);
        }
      }
    }
  }

  App.setRegion(start.region);
  App.nav(start.page || 'home');
  const summary = { 너비: innerWidth, 조합: combos, 실패: fails.length };
  console.log('UI 점검', summary);
  if (fails.length) console.table(fails);
  return { ...summary, fails };
})();
