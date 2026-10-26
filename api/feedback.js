// 안내별 의견 저장(Vercel 서버 함수) — 사이트의 ‘이 안내가 도움이 되었나요?’ 버튼이 보내요.
// 저장하는 것: 날짜(한국 시간)·지역·안내 종류와 id·응답(도움이 되었어요 / 정보가 부족해요)·부족한 이유(4개 중 하나)의 건수만.
// 저장하지 않는 것: IP 주소, 브라우저 정보, 쿠키, 자유 입력 글, 시각. 건수는 ‘응답 건수’이지 사람 수가 아니에요.
// 저장소: Vercel Marketplace의 Upstash Redis(REST). 프로젝트에 연결하면 KV_REST_API_URL·KV_REST_API_TOKEN
// (또는 UPSTASH_REDIS_REST_URL·UPSTASH_REDIS_REST_TOKEN) 환경 변수가 생겨요. 비밀키는 서버에만 있고 브라우저로 보내지 않아요.
// 공개 조회는 없어요. 운영자는 tools/feedback-report.js나 Upstash 콘솔로 봐요(docs/feedback-and-analytics.md).
//
// GET  → { ready: true|false }  저장소가 연결돼 응답할 때만 true(사이트는 true일 때만 버튼을 그려요)
// POST { v: 1, region, kind, id, choice, reason } → 200 { ok: true }는 저장소에 실제로 더해졌을 때만
'use strict';

// data/common.js REGION_ORDER + 'common'(공통 안내). tools/check-data.js가 같은지 확인해요
const REGIONS = ['common', 'seoul', 'gyeonggi', 'incheon', 'busan', 'chungbuk', 'gangwon', 'ulsan', 'jeonbuk', 'gyeongnam', 'jeju', 'daegu', 'daejeon'];
const KINDS = ['program', 'benefit', 'situ', 'type'];
const CHOICES = ['helpful', 'needs-more'];
const REASONS = ['missing', 'unclear', 'outdated', 'broken-link'];
const ID = /^[a-z0-9][a-z0-9-]{0,63}$/;
const DAY_TTL = 400 * 24 * 3600; // 날짜별 건수는 400일 뒤 지워져요(누적 건수는 남아요)
const MAX_BODY = 1024;

function storeConfig() {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  return url && token ? { url: String(url).replace(/\/+$/, ''), token: String(token) } : null;
}

// Upstash REST 파이프라인. 명령 하나라도 오류면 실패로 봐요(그때는 성공이라고 답하지 않아요)
async function pipeline(store, commands) {
  const res = await fetch(store.url + '/pipeline', {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + store.token, 'Content-Type': 'application/json' },
    body: JSON.stringify(commands),
    signal: AbortSignal.timeout(4000)
  });
  if (!res.ok) throw new Error('store status ' + res.status);
  const out = await res.json();
  if (!Array.isArray(out) || out.length !== commands.length || out.some(x => !x || x.error)) throw new Error('store command failed');
  return out.map(x => x.result);
}

const kstDate = () => new Date(Date.now() + 9 * 3600 * 1000).toISOString().slice(0, 10);

function reply(res, status, body, cache) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', cache || 'no-store');
  res.end(JSON.stringify(body));
}

async function readJson(req) {
  if (req.body !== undefined && req.body !== null) {
    if (typeof req.body === 'object' && !Buffer.isBuffer(req.body)) return JSON.stringify(req.body).length <= MAX_BODY ? req.body : null;
    const text = Buffer.isBuffer(req.body) ? req.body.toString('utf8') : String(req.body);
    return text.length <= MAX_BODY ? parse(text) : null;
  }
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > MAX_BODY) return null;
    chunks.push(chunk);
  }
  return parse(Buffer.concat(chunks).toString('utf8'));
}

function parse(text) {
  try { const v = JSON.parse(text); return v && typeof v === 'object' && !Array.isArray(v) ? v : null; } catch (e) { return null; }
}

// 정해진 값만 받아요. 다른 칸이 있으면(예: 자유 입력) 통째로 거절해요
function validate(b) {
  if (!b || b.v !== 1) return null;
  const allowed = ['v', 'region', 'kind', 'id', 'choice', 'reason'];
  if (Object.keys(b).some(k => !allowed.includes(k))) return null;
  const { region, kind, id, choice } = b;
  const reason = b.reason || '';
  if (!REGIONS.includes(region) || !KINDS.includes(kind) || typeof id !== 'string' || !ID.test(id) || !CHOICES.includes(choice)) return null;
  if (reason && (choice !== 'needs-more' || !REASONS.includes(reason))) return null;
  return { region, kind, id, choice, reason };
}

// 같은 사이트에서 보낸 요청만 받아요(다른 사이트의 페이지가 대신 보내는 것을 막아요)
function sameOrigin(req) {
  const origin = req.headers.origin;
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  if (!origin || !host) return false;
  try { return new URL(origin).host === String(host).split(',')[0].trim(); } catch (e) { return false; }
}

module.exports = async function feedback(req, res) {
  const store = storeConfig();
  if (req.method === 'GET') {
    if (!store) return reply(res, 200, { ready: false }, 'public, max-age=0, s-maxage=60');
    try {
      const [pong] = await pipeline(store, [['PING']]);
      return reply(res, 200, { ready: pong === 'PONG' }, 'public, max-age=0, s-maxage=60');
    } catch (e) {
      return reply(res, 200, { ready: false }, 'no-store');
    }
  }
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'GET, POST');
    return reply(res, 405, { ok: false });
  }
  if (!store) return reply(res, 503, { ok: false });
  if (!sameOrigin(req)) return reply(res, 403, { ok: false });
  const ct = String(req.headers['content-type'] || '');
  if (!ct.startsWith('application/json')) return reply(res, 415, { ok: false });
  const v = validate(await readJson(req));
  if (!v) return reply(res, 400, { ok: false });
  const field = [v.region, v.kind + ':' + v.id, v.choice, v.reason || '-'].join('|');
  const day = 'fb:day:' + kstDate();
  try {
    await pipeline(store, [['HINCRBY', day, field, 1], ['EXPIRE', day, DAY_TTL], ['HINCRBY', 'fb:total', field, 1]]);
    return reply(res, 200, { ok: true });
  } catch (e) {
    return reply(res, 502, { ok: false });
  }
};

// 점검 도구용(배포에는 영향 없음)
module.exports.REGIONS = REGIONS;
module.exports.validate = validate;
