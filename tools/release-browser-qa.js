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
    await page.waitForFunction(() => typeof App !== 'undefined' && REGION_ORDER.length === 12);
    const content=await page.evaluate(() => {
      const item = SITUS.find(x => x.id === 'refusal-to-leave-occupation');
      return {regionCount:REGION_ORDER.length,programs:Object.values(REGIONS).reduce((n,r)=>n+r.programs.length,0),
        publicLatest:UpdateUI.latest().id,situation:item.legalCaution};
    });
    assert.equal(content.regionCount,12);
    assert.equal(content.programs,161);
    assert.equal(content.publicLatest,'2026-10-29-school-complaint-procedure');
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
      assert.equal(result.조합,60,'Unexpected region/menu combinations for '+width);
      assert.equal(result.실패,0,'UI regression at '+width+'px');
    }
    assert.equal(combos,540);
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
    assert.equal(errors.length,0,'Uncaught browser errors: '+JSON.stringify(errors));
    console.log('PASS 540/540 responsive UI combinations, 200% text 12 pages, 3 screenshots, zero browser JS errors');
  } finally {
    await page.close();await browser.close();await new Promise(resolve=>server.close(resolve));
  }
})().catch(error => {console.error(error);process.exitCode=1;});