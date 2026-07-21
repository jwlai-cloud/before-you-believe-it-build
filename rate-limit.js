// Best-effort sliding-window rate limit for the paid live-challenge endpoint.
// ponytail: in-memory + per-serverless-instance, so it is NOT a global/durable
// limit — instances do not share this Map. It adds real friction against a
// single client hammering one warm instance; the durable control is a hard
// spend cap on the OpenAI key (see docs). Upgrade path: a shared store (Redis/
// Upstash/KV) keyed the same way if global limits are ever required.

const WINDOW_MS = 60_000;
const MAX_REQUESTS = 8;
const store = new Map(); // key -> array of request timestamps (ms)

function checkRateLimit(key, { now = Date.now(), windowMs = WINDOW_MS, max = MAX_REQUESTS, hits = store } = {}) {
  const recent = (hits.get(key) || []).filter((t) => now - t < windowMs);
  if (recent.length >= max) {
    hits.set(key, recent);
    const retryAfter = Math.max(1, Math.ceil((windowMs - (now - recent[0])) / 1000));
    return { allowed: false, retryAfter };
  }
  recent.push(now);
  hits.set(key, recent);
  return { allowed: true, retryAfter: 0 };
}

function clientKey(request) {
  const forwarded = request?.headers?.['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.trim()) return forwarded.split(',')[0].trim();
  return request?.headers?.['x-real-ip'] || 'unknown';
}

module.exports = { checkRateLimit, clientKey, WINDOW_MS, MAX_REQUESTS };
