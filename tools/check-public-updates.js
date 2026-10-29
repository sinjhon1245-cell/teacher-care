// 공개 업데이트 정책 회귀 검사: node tools/check-public-updates.js
// Node 기본 vm으로 실제 data/updates.js와 app.js의 UpdateUI 객체를 불러와 검증합니다.
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ROOT = path.resolve(__dirname, '..');
const updates = fs.readFileSync(path.join(ROOT, 'data/updates.js'), 'utf8');
const app = fs.readFileSync(path.join(ROOT, 'app.js'), 'utf8');
const start = app.indexOf('const UpdateUI = {');
const end = app.indexOf('\n};', start);
assert.ok(start >= 0 && end > start, 'app.js UpdateUI 객체를 찾지 못했습니다');
const uiSource = app.slice(start, end + 3);
let savedId = null;
const context = vm.createContext({
  storeGet: key => key === 'teacher-care-update-seen' ? savedId : null,
  storeSet: () => {},
  authorCredit: () => '',
  REGION_ORDER: Array(12).fill(null),
  console
});
vm.runInContext(updates + '\n' + uiSource + '\nvar TEST = { UPDATES, UpdateUI };', context, { timeout: 1000 });
const { UPDATES, UpdateUI } = context.TEST;

assert.equal(UPDATES.length, 12, '업데이트 원본은 12건 보존해야 합니다');
assert.equal(UpdateUI.list().length, 10, '공개 변경 내역은 10건이어야 합니다');
assert.equal(UpdateUI.latest().id, '2026-10-26-12-region-accuracy-audit');
assert.ok(UpdateUI.list().every(u => u.visibility !== 'internal' && u.type !== '기능 개선'));
assert.equal(UpdateUI.list().filter(u => u.type === '지역 확대').length, 8);
assert.ok(UpdateUI.chip().includes('업데이트 10.26'));
assert.ok(UpdateUI.footerBlock().includes('2026.10.26'));
assert.ok(UpdateUI.footerBlock().includes('지원 정보 변경 내역 보기'));
const dialog = UpdateUI.dialogHtml();
assert.ok(dialog.includes('지원 정보 변경 내역'));
assert.ok(dialog.includes('12개 지역 지원 안내 공식 자료 재대조'));
assert.ok(!dialog.includes('지역 선택과 화면 읽기 다듬기'));
assert.ok(!dialog.includes('홈에서 다른 지역 안내 보기'));

savedId = '2026-10-27-design-refine';
assert.equal(UpdateUI.unread(), false, '이전에 최신 UI 소식을 읽은 이용자에게 과거 내용을 새 소식으로 표시하면 안 됩니다');
savedId = '2026-10-23-daejeon';
assert.equal(UpdateUI.unread(), true, '기존 공개 변경을 읽지 않은 이용자는 새 소식을 받아야 합니다');
savedId = null;
assert.equal(UpdateUI.unread(), true, '첫 방문자는 공개 최신 내용을 새 소식으로 인식해야 합니다');

console.log('PASS public updates: 12 source · 10 public · latest 2026-10-26 · read-state/backward compatibility');
