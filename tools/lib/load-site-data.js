// 사이트 데이터 읽기 — index.html에 적힌 순서대로 data/*.js를 Node vm에서 실행해 전역 값을 돌려줘요(브라우저 없이)
'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.join(__dirname, '..', '..');
const NAMES = ['PAGES', 'REGIONS', 'REGION_ORDER', 'SUPPORT_TYPES', 'SITUS', 'SITU_GROUPS', 'STEPS', 'BENEFITS', 'COMPARISONS', 'SITU_ACTIONS',
  'COMMON_PUBLIC_SOURCES', 'VALIDATION_SOURCES', 'REVIEW_STATUSES', 'FRESHNESS_DAYS', 'FEEDBACK_URL'];

function loadSiteData(root = ROOT) {
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  const scripts = [...html.matchAll(/<script src="(data\/[^"?]+)(?:\?v=[^"]*)?"><\/script>/g)].map(m => m[1]);
  const logs = [];
  const ctx = { console: { error: (...a) => logs.push(a.join(' ')), warn: () => {}, log: () => {} } };
  vm.createContext(ctx);
  for (const f of scripts) vm.runInContext(fs.readFileSync(path.join(root, f), 'utf8'), ctx, { filename: f });
  const D = vm.runInContext(`({ ${NAMES.map(n => `${n}: typeof ${n} === 'undefined' ? undefined : ${n}`).join(', ')} })`, ctx);
  D.assetVersion = (html.match(/<meta name="asset-version" content="([^"]+)">/) || [])[1] || null;
  D.scripts = scripts;
  D.loadErrors = logs;
  return D;
}

module.exports = { loadSiteData, ROOT };
