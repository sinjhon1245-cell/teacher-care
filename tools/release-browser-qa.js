// Full in-browser responsive regression. Requires Playwright in test runner.
'use strict';
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const os = require('node:os');
const assert = require('node:assert/strict');
const {chromium} = require('playwright');
const ROOT = path.resolve(__dirname, '..');
const SCREEN_DIR = process.env.QA_SCREEN_DIR || path.join(os.tmpdir(), 'teacher-care-release-qa');
const MIME = {'.html':'text/html; charset=utf-8','.js':'application/javascript; charset=utf-8',
  '.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.png':'image/png',
  '.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.woff2':'font/woff2',
  '.ico':'image/x-icon','.pdf':'application/pdf'};
const server = http.createServer((req,res) => {
  let p;
  try { p = decodeURIComponent(new URL(req.url,'http://localhost').pathname); }
  catch { res.writeHead(400).end(); return; }
  const full = path.resolve(ROOT, '.' + (p === '/' ? '/index.html' : p));
  if (!full.startsWith(ROOT + path.sep) || !fs.existsSync(full) || !fs.statSync(full).isFile()) {
    res.writeHead(404).end('not found'); return;
  }
  res.writeHead(200,{'content-type': MIME[path.extname(full)] || 'application/octet-stream'});
  fs.createReadStream(full).pipe(res);
});
const listen = () => new Promise(resolve => server.listen(0,'127.0.0.1',resolve));
(async () => {
  fs.mkdirSync(SCREEN_DIR,{recursive:true});
  await listen();
  const base = 'http://127.0.0.1:' + server.address().port + '/';
  const browser = await chromium.launch({headless:true,args:['--no-sandbox']});
  const page = await browser.newPage({viewport:{width:375,height:850}});
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  try {
    await page.goto(base,{waitUntil:'domcontentloaded',timeout:30000});
    await page.waitForFunction(() => typeof App !== 'undefined' && REGION_ORDER.length === 16);
    const content=await page.evaluate(() => {
      const item = SITUS.find(x => x.id === 'refusal-to-leave-occupation');
      return {regionCount:REGION_ORDER.length,programs:Object.values(REGIONS).reduce((n,r)=>n+r.programs.length,0),
        existingPrograms:REGION_ORDER.filter(id=>!['gyeongbuk','sejong','chungnam','jeonnamgwangju'].includes(id)).reduce((n,id)=>n+REGIONS[id].programs.length,0),
        before13:REGION_ORDER.filter(id=>!['sejong','chungnam','jeonnamgwangju'].includes(id)).reduce((n,id)=>n+REGIONS[id].programs.length,0),
        before14:REGION_ORDER.filter(id=>!['chungnam','jeonnamgwangju'].includes(id)).reduce((n,id)=>n+REGIONS[id].programs.length,0),
        agencyOnly:REGION_ORDER.filter(id=>!REGIONS[id].offices.length),
        publicLatest:UpdateUI.latest().id,situation:item.legalCaution};
    });
    assert.equal(content.regionCount,16);
    assert.equal(content.existingPrograms,161,'기존 12개 지역의 지원 프로그램 161개가 그대로여야 해요');
    assert.equal(content.before13,174,'경북까지 13개 지역의 지원 프로그램 174개가 그대로여야 해요');
    assert.equal(content.before14,180,'세종까지 14개 지역 지원 프로그램 180개가 그대로여야 해요');
    assert.deepEqual(content.agencyOnly,['sejong'],'교육지원청이 없는 지역은 세종 하나예요');
    assert.equal(content.programs,192);
    assert.equal(content.publicLatest,'2026-11-03-pr20-accuracy');
    assert.ok(content.situation.includes('긴급'));
    await page.evaluate(() => {App.setRegion('incheon');App.setState({onboarding:false});App.nav('home');});
    const source=fs.readFileSync(path.join(ROOT,'tools/ui-check.js'),'utf8');
    let combos=0;
    for (const width of [360,375,390,768,769,881,961,1024,1440]) {
      await page.setViewportSize({width,height:900});
      const result = await page.evaluate(async code => await eval(code), source);
      combos+=result.조합;
      console.log('UI '+width+': '+result.조합+' combinations; errors='+result.실패);
      if (result.실패) console.log(JSON.stringify(result.fails.slice(0,14)));
      assert.equal(result.조합,80,'Unexpected region/menu combinations for '+width);
      assert.equal(result.실패,0,'UI regression at '+width+'px');
    }
    assert.equal(combos,720);
    for (const width of [375,768,1440]) {
      await page.setViewportSize({width,height:900});
      await page.evaluate(() => {App.setRegion('incheon');App.setState({onboarding:false});App.nav('home');window.scrollTo(0,0)});
      await page.screenshot({path:path.join(SCREEN_DIR,'home-'+width+'.png'),fullPage:true});
      for (const screen of ['home','guide','care','support']) {
        const result=await page.evaluate(pg => {
          App.nav(pg);
          document.documentElement.style.fontSize='32px';
          App.render();
          return {overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth,
            page:pg,main:!!document.querySelector('main')};
        },screen);
        if (result.overflow>1) console.log('200% text overflow',width,result);
        assert.ok(result.main);
        assert.ok(result.overflow<=1,'200% text horizontal overflow at '+width+' '+screen+': '+result.overflow+'px');
      }
      await page.evaluate(() => {document.documentElement.style.fontSize='';App.nav('home')});
    }
    // 지역 선택 화면: 너비 7개 × 글자 100·200%. 칸 수는 너비로 정해요(마지막 줄만 덜 차도 돼요). 지역명 줄바꿈·넘침·누르는 영역·높이·가로 넘침
    let chooserChecks=0;
    for (const width of [375,480,768,769,1024,1280,1440]) for (const size of ['','32px']) {
      await page.setViewportSize({width,height:900});
      const r=await page.evaluate(async size => {
        App.setRegion('incheon');App.setState({onboarding:false});
        document.documentElement.style.fontSize=size;App.openRegionChooser();
        await new Promise(res=>setTimeout(res,80));
        const cards=[...document.querySelectorAll('.region-card')];const rows={};
        cards.forEach(c=>{const t=Math.round(c.getBoundingClientRect().top);rows[t]=(rows[t]||0)+1;});
        const per=Object.keys(rows).sort((a,b)=>a-b).map(k=>rows[k]);const cols=Math.max(...per);
        const hs=cards.map(c=>c.getBoundingClientRect().height);
        const out={n:cards.length,per,cols,
          partialRow:per.slice(0,-1).some(n=>n!==cols),
          wrapped:cards.filter(c=>{const n=c.querySelector('.region-card-name');return n.getBoundingClientRect().height>parseFloat(getComputedStyle(n).lineHeight)*1.5;}).length,
          over:cards.filter(c=>c.scrollWidth-c.clientWidth>1).length,
          small:cards.filter(c=>{const q=c.getBoundingClientRect();return q.width<44||q.height<44;}).length,
          height:Math.max(...hs)-Math.min(...hs),
          hscroll:document.documentElement.scrollWidth-document.documentElement.clientWidth};
        App.closeRegionChooser();document.documentElement.style.fontSize='';
        return out;
      },size);
      const tag='chooser '+width+'px '+(size?'200%':'100%')+' '+r.per.join('·');
      assert.equal(r.n,16,tag);assert.equal(r.cols, width<=480?2:width<1024?3:4, tag+' unexpected column count');assert.ok(!r.partialRow,tag+' rows before the last must be full');
      assert.equal(r.wrapped,0,tag+' region name wrapped');assert.equal(r.over,0,tag+' card overflow');
      assert.equal(r.small,0,tag+' card under 44px');assert.ok(r.height<=1,tag+' card heights differ');assert.ok(r.hscroll<=0,tag+' horizontal overflow');
      chooserChecks++;
    }
    // PR #20: 첫 화면 PC 4×4와 제도 세부 항목 시각적 위계, 실제 전화 링크를 별도로 회귀 확인.
    for (const width of [390,1440]) {
      await page.setViewportSize({width,height:900});
      await page.evaluate(() => { App.setRegion('incheon'); App.setState({onboarding:false}); App.nav('home'); App.openRegionChooser(); });
      await page.screenshot({path:path.join(SCREEN_DIR,'region-chooser-'+width+'.png'),fullPage:true});
      const layout = await page.evaluate(() => {
        const cards=[...document.querySelectorAll('.region-card')];
        const rows={};for(const card of cards){const y=Math.round(card.getBoundingClientRect().top);rows[y]=(rows[y]||0)+1;}
        return {total:cards.length,rows:Object.values(rows),scroll:document.documentElement.scrollWidth-document.documentElement.clientWidth};
      });
      assert.equal(layout.total,16);
      if (width===1440) assert.deepEqual(layout.rows,[4,4,4,4],'desktop must use exact 4×4 arrangement');
      assert.equal(layout.scroll,0,'region chooser horizontal overflow');
      await page.evaluate(() => App.closeRegionChooser());

      await page.evaluate(() => {App.setRegion('incheon');App.openBenefit('official-sick-leave');});
      const benefit = await page.evaluate(() => {
        const root=document.querySelector('#bf-official-sick-leave');
        const when=root && root.querySelector('[data-field="when"]');
        const apply=root && root.querySelector('[data-field="apply"]');
        // 핵심 질문(언제·어떻게 신청)은 색 상자 대신 제목(dt)의 굵기·색으로 나머지 항목과 구분해요
        const dtStyle=el=>{const dt=el&&el.querySelector('dt');if(!dt)return '';const s=getComputedStyle(dt);return s.fontWeight+' '+s.color;};
        const plain=root && [...root.querySelectorAll('.facts > div')].find(d=>!['when','apply'].includes(d.dataset.field));
        return {when:!!when,apply:!!apply,
          whenDt:dtStyle(when),applyDt:dtStyle(apply),plainDt:dtStyle(plain),
          overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth,
          text:apply?apply.innerText:''};
      });
      assert.ok(benefit.when && benefit.apply,'both benefit questions should have separate blocks');
      assert.ok(benefit.whenDt && benefit.whenDt===benefit.applyDt,'benefit key questions must share one emphasis style');
      assert.ok(benefit.plainDt && benefit.whenDt!==benefit.plainDt,'benefit key questions must stand out from other fields');
      assert.ok(benefit.text.includes('경미한'),'six-day exception needs minor-injury qualification');
      assert.ok(benefit.overflow<=1,'benefit detail horizontal overflow');
      await page.screenshot({path:path.join(SCREEN_DIR,'benefit-detail-'+width+'.png')});
    }
    await page.evaluate(() => {
      App.setRegion('incheon');
      App.nav('guide',{situ:'situ:refusal-to-leave-occupation'});
    });
    const contacts=await page.evaluate(() => {
      const block=document.querySelector('.situ-supports');
      return block?[...block.querySelectorAll('.facts a[href^="tel:"]')].map(a=>a.getAttribute('href')):[];
    });
    assert.ok(contacts.includes('tel:112') && contacts.includes('tel:0321395'),
      'situation support panel must link 112 and verified Incheon hotline separately');
    assert.equal(errors.length,0,'Uncaught browser errors: '+JSON.stringify(errors));
    console.log('PASS 720/720 responsive UI combinations (기존 15개 지역 675 포함), 200% text 12 pages, region chooser '+chooserChecks+'/14 (7 widths × 100·200%), 3 screenshots, zero browser JS errors');
  } finally {
    await page.close();await browser.close();await new Promise(resolve=>server.close(resolve));
  }
})().catch(error => {console.error(error);process.exitCode=1;});