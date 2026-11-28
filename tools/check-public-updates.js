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
  STORAGE_UPDATE_SEEN: 'teacher-care-update-seen',
  STORAGE_UPDATE_BANNER: 'teacher-care-update-banner-closed',
  storeGet: key => key === 'teacher-care-update-seen' ? savedId : null,
  storeSet: () => {},
  authorCredit: () => '',
  REGION_ORDER: Array(16).fill(null),
  console
});
vm.runInContext(updates + '\n' + uiSource + '\nvar TEST = { UPDATES, WEEKLY_REVIEWS, UpdateUI };', context, { timeout: 1000 });
const { UPDATES, WEEKLY_REVIEWS, UpdateUI } = context.TEST;

const publicUpdates = UPDATES.filter(u => u.visibility !== 'internal' && u.type !== '기능 개선');
assert.equal(UPDATES.filter(u => u.visibility === 'internal').length, 2, '기존 두 UI 변경은 내부 이력에 보존해야 합니다');
assert.equal(UpdateUI.list().length, publicUpdates.length, '공개 목록이 원본의 공개 항목과 같아야 합니다');
assert.equal(UpdateUI.latest().id, publicUpdates[0].id);
assert.ok(publicUpdates.some(u => u.id === '2026-10-26-12-region-accuracy-audit'));
assert.ok(UpdateUI.list().every(u => u.visibility !== 'internal' && u.type !== '기능 개선'));
assert.ok(UpdateUI.list().some(u => u.type === '지역 확대'), '지역 확대 이력은 공개되어야 합니다');
const latestDay = UpdateUI.day(UpdateUI.latest().date);
assert.ok(UpdateUI.chip().includes('업데이트 ' + latestDay.short));
assert.ok(UpdateUI.footerBlock().includes(latestDay.full));
assert.ok(UpdateUI.footerBlock().includes('지원 정보 변경 내역 보기'));
const dialog = UpdateUI.dialogHtml();
assert.ok(dialog.includes('지원 정보 변경 내역'));
assert.ok(dialog.includes('12개 지역 지원 정보 정정'));
assert.ok(!dialog.includes('지역 선택과 화면 읽기 다듬기'));
assert.ok(!dialog.includes('홈에서 다른 지역 안내 보기'));

savedId = '2026-10-27-design-refine';
assert.equal(UpdateUI.unread(), UpdateUI.latest().date > '2026-10-27', '지난 UI 소식을 읽었을 때 새 실제 정보 변경이 있으면 알리고, 과거 소식은 다시 알리지 않습니다');
savedId = '2026-10-23-daejeon';
assert.equal(UpdateUI.unread(), true, '기존 공개 변경을 읽지 않은 이용자는 새 소식을 받아야 합니다');
savedId = null;
assert.equal(UpdateUI.unread(), true, '첫 방문자는 공개 최신 내용을 새 소식으로 인식해야 합니다');

// 정기점검 이력은 실제 변경 기록과 분리합니다.
assert.ok(WEEKLY_REVIEWS.length > 0);
const reviewIds = new Set();
for (const [i,r] of WEEKLY_REVIEWS.entries()) {
  assert.match(r.checkedAt, /^\d{4}-\d{2}-\d{2}$/);
  assert.ok(r.checkedAt <= UpdateUI.today() && new Date(r.checkedAt+'T00:00:00Z').toISOString().slice(0,10)===r.checkedAt);
  assert.ok(!reviewIds.has(r.id) && r.id.startsWith(r.checkedAt)); reviewIds.add(r.id);
  assert.ok(r.title && r.summary && r.details.length);
  if(i>0) assert.ok(WEEKLY_REVIEWS[i-1].checkedAt > r.checkedAt,'정기점검 최신순·중복 금지');
  assert.ok(!UPDATES.some(u=>u.id===r.id));
}
assert.equal(UpdateUI.latestReview().id,WEEKLY_REVIEWS[0].id);
assert.ok(UpdateUI.footerBlock().includes('최근 정기점검') && UpdateUI.footerBlock().includes(UpdateUI.day(WEEKLY_REVIEWS[0].checkedAt).full));
assert.ok(dialog.includes('주간 정기점검') && dialog.includes('실제 지원 정보 변경') && dialog.includes(WEEKLY_REVIEWS[0].summary));
savedId = UpdateUI.latest().id;
assert.equal(UpdateUI.unread(),false);
assert.equal(UpdateUI.strip(),'','정기점검만으로 새 업데이트 알림을 띄우지 않음');
if(WEEKLY_REVIEWS[0].checkedAt>UpdateUI.latest().date) assert.ok(UpdateUI.chip().includes('정기점검 '+UpdateUI.day(WEEKLY_REVIEWS[0].checkedAt).short));

console.log(`PASS public updates: ${UPDATES.length} source · ${publicUpdates.length} public · latest ${UpdateUI.latest().date} · read-state/backward compatibility`);
