const test = require('node:test');
const assert = require('node:assert/strict');

const { checkRateLimit, clientKey } = require('../rate-limit.js');

test('allows up to the max within the window, then blocks', () => {
  const hits = new Map();
  const opts = { now: 1000, windowMs: 60_000, max: 3, hits };
  assert.equal(checkRateLimit('a', opts).allowed, true);
  assert.equal(checkRateLimit('a', opts).allowed, true);
  assert.equal(checkRateLimit('a', opts).allowed, true);
  const blocked = checkRateLimit('a', opts);
  assert.equal(blocked.allowed, false);
  assert.ok(blocked.retryAfter >= 1, 'retryAfter is a positive number of seconds');
});

test('frees a slot once the oldest request ages out of the window', () => {
  const hits = new Map();
  const base = { windowMs: 60_000, max: 2, hits };
  checkRateLimit('b', { ...base, now: 0 });
  checkRateLimit('b', { ...base, now: 10_000 });
  assert.equal(checkRateLimit('b', { ...base, now: 20_000 }).allowed, false);
  // The first request (t=0) leaves the window at t=60_000.
  assert.equal(checkRateLimit('b', { ...base, now: 61_000 }).allowed, true);
});

test('limits are independent per key', () => {
  const hits = new Map();
  const opts = { now: 5, windowMs: 60_000, max: 1, hits };
  assert.equal(checkRateLimit('ip-1', opts).allowed, true);
  assert.equal(checkRateLimit('ip-1', opts).allowed, false);
  assert.equal(checkRateLimit('ip-2', opts).allowed, true);
});

test('clientKey reads the first x-forwarded-for hop, else falls back', () => {
  assert.equal(clientKey({ headers: { 'x-forwarded-for': '203.0.113.7, 10.0.0.1' } }), '203.0.113.7');
  assert.equal(clientKey({ headers: { 'x-real-ip': '198.51.100.4' } }), '198.51.100.4');
  assert.equal(clientKey({ headers: {} }), 'unknown');
  assert.equal(clientKey({}), 'unknown');
});
