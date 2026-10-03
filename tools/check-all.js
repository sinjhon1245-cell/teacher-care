// 한 번에 점검 — node tools/check-all.js
// 1) 데이터 검사(check-data.js) → 2) 공식 링크 검사(check-links.js) → 3) 운영 리포트 생성(docs/maintenance-report.md)
// 외부 패키지 없이 Node 기본 기능만 써요. 중간 단계가 실패하면 STATUS는 절대 PASS가 아니에요(종료 코드 1).
//
// STATUS
//   PASS        데이터 통과 · 끊긴 링크 없음 · 리포트 생성
//   FAIL        데이터 오류, 끊긴 링크, 도구 실행 오류, 리포트 생성 실패 중 하나라도 있음(종료 코드 1)
//   INCOMPLETE  링크 점검을 건너뛰었거나 네트워크 문제로 접속 확인을 못 함(종료 코드 1, 다시 실행하세요)
//
// 옵션
//   --skip-links   링크 접속 점검 건너뛰기(STATUS는 INCOMPLETE)
//   --verbose      각 도구의 출력을 모두 보여 주기(기본: 실패한 도구만)

'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const argv = process.argv.slice(2);
const SKIP_LINKS = argv.includes('--skip-links');
const VERBOSE = argv.includes('--verbose');
const tmp = name => path.join(os.tmpdir(), `teacher-care-${name}-${process.pid}-${Date.now()}.json`);

function run(script, args, timeout) {
  const r = spawnSync(process.execPath, [path.join(ROOT, 'tools', script), ...args], { cwd: ROOT, encoding: 'utf8', timeout, env: process.env });
  const out = (r.stdout || '') + (r.stderr || '');
  if (VERBOSE) process.stdout.write(`\n── ${script} ──\n${out}`);
  return { code: r.status, out, error: r.error };
}
function readJson(file) {
  try { const j = JSON.parse(fs.readFileSync(file, 'utf8')); fs.unlinkSync(file); return j; } catch (e) { return null; }
}
const lines = [];
const show = (k, v) => lines.push(`${k.padEnd(10)} ${v}`);
const failures = [];

// 1) 데이터
const dataFile = tmp('data');
const data = run('check-data.js', [`--json=${dataFile}`], 120000);
const dataJson = readJson(dataFile);
let dataState;
if (data.code === 0 && dataJson && dataJson.ok) dataState = 'PASS';
else { dataState = 'FAIL'; failures.push(['check-data.js', data]); }
show('DATA', dataState + (dataJson ? ` (오류 ${dataJson.errors.length} · 주의 ${dataJson.warnings.length})` : ' (실행 오류)'));

// 2) 링크
let linkState = 'SKIPPED';
let linkJson = null;
const linkFile = tmp('links');
if (!SKIP_LINKS) {
  const links = run('check-links.js', [`--json=${linkFile}`], 600000);
  linkJson = readJson(linkFile);
  const rows = linkJson ? linkJson.rows : null;
  const n = v => (rows || []).filter(r => r.verdict === v).length;
  if (!rows) { linkState = 'FAIL (실행 오류)'; failures.push(['check-links.js', links]); }
  else if (n('broken') || links.code !== 0) { linkState = `FAIL (broken ${n('broken')})`; failures.push(['check-links.js', links]); }
  else if (rows.length && rows.every(r => r.verdict === 'check' && !Number.isInteger(r.status))) linkState = 'OFFLINE (네트워크 확인 후 다시 실행)';
  else linkState = `PASS (${rows.length}개${n('check') ? ` · 확인 필요 ${n('check')}` : ''}${n('moved') ? ` · redirect ${n('moved')}` : ''})`;
}
show('LINKS', linkState);

// 3) 리포트(앞 단계 결과를 그대로 넘겨 다시 실행하지 않아요)
const reportArgs = [];
if (dataJson) { fs.writeFileSync(dataFile, JSON.stringify(dataJson)); reportArgs.push(`--data=${dataFile}`); }
if (linkJson) { fs.writeFileSync(linkFile, JSON.stringify(linkJson)); reportArgs.push(`--links=${linkFile}`); }
else reportArgs.push('--skip-links');
const report = run('generate-maintenance-report.js', reportArgs, 600000);
[dataFile, linkFile].forEach(f => { try { fs.unlinkSync(f); } catch (e) { /* 없음 */ } });
const reportOk = report.code === 0 && /리포트:/.test(report.out);
if (!reportOk) failures.push(['generate-maintenance-report.js', report]);
show('REPORT', reportOk ? 'GENERATED (docs/maintenance-report.md)' : 'FAILED');

// 요약
const linkChecks = linkJson ? linkJson.rows.filter(r => r.verdict === 'check').length : 0;
show('WARNINGS', String((dataJson ? dataJson.warnings.length : 0) + linkChecks));
const status = failures.length ? 'FAIL' : (linkState === 'SKIPPED' || linkState.startsWith('OFFLINE')) ? 'INCOMPLETE' : 'PASS';
show('STATUS', status);

if (!VERBOSE) failures.forEach(([name, r]) => {
  process.stdout.write(`\n── ${name} 출력(실패) ──\n${r.out.split(/\r?\n/).filter(l => !/^\s*$/.test(l)).slice(-40).join('\n')}\n${r.error ? String(r.error) + '\n' : ''}`);
});
if (dataJson && dataJson.warnings.length) process.stdout.write(`\n주의 ${dataJson.warnings.length}건은 docs/maintenance-report.md ‘다음 점검 항목’에서 확인하세요.\n`);
process.stdout.write('\n' + lines.join('\n') + '\n');
process.exit(status === 'PASS' ? 0 : 1);
