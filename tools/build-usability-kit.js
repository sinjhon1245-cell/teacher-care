// 사용성 테스트 인쇄본 만들기 — node tools/build-usability-kit.js
// docs/usability-test-kit.html(원본)을 크롬으로 인쇄해 docs/usability-test-kit.pdf(A4 11쪽)를 다시 만들어요.
// 가이드(docs/usability-test-teachers.md)의 과제 문장·순서·성공 기준·시간을 고쳤다면 원본 HTML도 같이 고친 뒤 실행해요.
// 외부 패키지 없이 Node(22 이상, 내장 WebSocket)와 설치된 크롬·엣지만 써요. 글꼴(Pretendard)을 받으려면 인터넷이 필요해요.
//
// 옵션
//   --out=파일   PDF를 다른 곳에 저장(기본 docs/usability-test-kit.pdf)
//   CHROME_PATH  크롬 실행 파일 경로(자동으로 못 찾을 때)

'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawn } = require('child_process');
const { pathToFileURL } = require('url');

const ROOT = path.join(__dirname, '..');
const SRC = path.join(ROOT, 'docs', 'usability-test-kit.html');
const outArg = process.argv.find(a => a.startsWith('--out='));
const OUT = outArg ? path.resolve(outArg.slice(6)) : path.join(ROOT, 'docs', 'usability-test-kit.pdf');
const EXPECTED_PAGES = 11;

const CANDIDATES = [
  process.env.CHROME_PATH,
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser'
].filter(Boolean);

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function main() {
  if (typeof WebSocket === 'undefined') throw new Error('Node 22 이상이 필요해요(내장 WebSocket)');
  const chrome = CANDIDATES.find(p => fs.existsSync(p));
  if (!chrome) throw new Error('크롬을 찾지 못했어요. CHROME_PATH로 경로를 알려 주세요');
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'teacher-care-kit-'));
  const proc = spawn(chrome, [
    '--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check',
    '--remote-debugging-port=0', `--user-data-dir=${profile}`, 'about:blank'
  ], { stdio: 'ignore' });
  try {
    // 크롬이 고른 디버깅 포트는 프로필 폴더의 DevToolsActivePort 첫 줄에 적혀요
    let port = null;
    for (let i = 0; i < 100 && !port; i++) {
      await sleep(100);
      try { port = fs.readFileSync(path.join(profile, 'DevToolsActivePort'), 'utf8').split('\n')[0].trim(); } catch (e) {}
    }
    if (!port) throw new Error('크롬 디버깅 포트를 열지 못했어요');
    let target = null;
    for (let i = 0; i < 50 && !target; i++) {
      const list = await fetch(`http://127.0.0.1:${port}/json/list`).then(r => r.json()).catch(() => []);
      target = list.find(t => t.type === 'page');
      if (!target) await sleep(100);
    }
    if (!target) throw new Error('크롬 탭을 찾지 못했어요');

    const ws = new WebSocket(target.webSocketDebuggerUrl);
    await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
    let seq = 0;
    const pending = new Map();
    let onLoad = null;
    ws.onmessage = ev => {
      const m = JSON.parse(ev.data);
      if (m.method === 'Page.loadEventFired' && onLoad) onLoad();
      if (m.id && pending.has(m.id)) {
        const { res, rej } = pending.get(m.id);
        pending.delete(m.id);
        m.error ? rej(new Error(m.error.message)) : res(m.result);
      }
    };
    const send = (method, params = {}) => new Promise((res, rej) => { const id = ++seq; pending.set(id, { res, rej }); ws.send(JSON.stringify({ id, method, params })); });
    const evaluate = async expression => (await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true })).result.value;

    // 원본을 연 뒤, 문서·글꼴(필요한 글자 묶음만 받는 Pretendard)이 다 온 뒤에 인쇄해요
    await send('Page.enable');
    const loaded = new Promise(r => { onLoad = r; });
    await send('Page.navigate', { url: pathToFileURL(SRC).href });
    await loaded;
    await evaluate('document.fonts.ready');
    await sleep(500);
    await evaluate('document.fonts.ready');
    // 쪽마다 내용이 쪽 높이를 넘으면(인쇄에서 잘림) 그 쪽 번호를 알려 줘요
    const info = await evaluate(`({ pages: document.querySelectorAll('.page').length,
      overflow: [...document.querySelectorAll('.page')].map((p, i) => p.scrollHeight > p.clientHeight + 1 || p.scrollWidth > p.clientWidth + 1 ? i + 1 : 0).filter(Boolean),
      pretendard: [...document.fonts].some(f => /Pretendard/.test(f.family) && f.status === 'loaded') })`);
    const { data } = await send('Page.printToPDF', { printBackground: true, preferCSSPageSize: true, displayHeaderFooter: false });
    fs.writeFileSync(OUT, Buffer.from(data, 'base64'));
    ws.close();

    const size = fs.statSync(OUT).size;
    console.log(`PDF: ${path.relative(ROOT, OUT)} (${Math.round(size / 1024)}KB, 원본 쪽 ${info.pages}개)`);
    if (!info.pretendard) console.log('주의: Pretendard 글꼴을 받지 못해 다른 글꼴로 인쇄됐어요. 인터넷 연결을 확인하고 다시 실행하세요');
    if (info.pages !== EXPECTED_PAGES) console.log(`주의: 쪽 수가 ${EXPECTED_PAGES}쪽이 아니에요`);
    if (info.overflow.length) console.log(`주의: ${info.overflow.join('·')}쪽 내용이 쪽을 넘어 인쇄에서 잘려요. 원본 HTML에서 줄여 주세요`);
    return info.pretendard && info.pages === EXPECTED_PAGES && !info.overflow.length ? 0 : 1;
  } finally {
    proc.kill();
    await sleep(300);
    try { fs.rmSync(profile, { recursive: true, force: true }); } catch (e) {}
  }
}

main().then(code => process.exit(code)).catch(e => { console.error('실패:', e.message); process.exit(1); });
