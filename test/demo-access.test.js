const test = require('node:test');
const assert = require('node:assert/strict');

const {
  createAccessCookie,
  isAuthorizedRequest,
  isDemoCaptureBypassEnabled,
  isProductionCaptureBypassEnabled,
  isPreviewDemoBypassEnabled,
  verifyAccessCookie
} = require('../demo-access.js');

test('a signed judge-access cookie authorizes a request before its expiry', () => {
  const token = 'judge-demo-token';
  const cookie = createAccessCookie(token, 2_000, 1_000);

  assert.equal(verifyAccessCookie(cookie, token, 1_500), true);
  assert.equal(isAuthorizedRequest({ headers: { cookie: `live_demo_access=${cookie}` } }, token, 1_500), true);
});

test('judge access rejects missing, tampered, and expired cookies', () => {
  const token = 'judge-demo-token';
  const cookie = createAccessCookie(token, 2_000, 1_000);

  assert.equal(verifyAccessCookie('', token, 1_500), false);
  assert.equal(verifyAccessCookie(`${cookie}x`, token, 1_500), false);
  assert.equal(verifyAccessCookie(cookie, token, 2_001), false);
  assert.equal(isAuthorizedRequest({ headers: {} }, token, 1_500), false);
});

test('preview capture bypass requires both the Vercel preview environment and exact opt-in value', () => {
  assert.equal(isPreviewDemoBypassEnabled({ VERCEL_ENV: 'preview', BEFORE_YOU_BELIEVE_DEMO_BYPASS: 'true' }), true);
  assert.equal(isPreviewDemoBypassEnabled({ VERCEL_ENV: 'production', BEFORE_YOU_BELIEVE_DEMO_BYPASS: 'true' }), false);
  assert.equal(isPreviewDemoBypassEnabled({ VERCEL_ENV: 'preview', BEFORE_YOU_BELIEVE_DEMO_BYPASS: 'TRUE' }), false);
  assert.equal(isPreviewDemoBypassEnabled({ VERCEL_ENV: 'preview' }), false);
});

test('production capture bypass requires a separate exact opt-in value', () => {
  assert.equal(isDemoCaptureBypassEnabled({ VERCEL_ENV: 'preview', BEFORE_YOU_BELIEVE_DEMO_BYPASS: 'true' }), true);
  assert.equal(isDemoCaptureBypassEnabled({ VERCEL_ENV: 'production', BEFORE_YOU_BELIEVE_DEMO_BYPASS: 'true' }), false);
  assert.equal(isProductionCaptureBypassEnabled({ VERCEL_ENV: 'production', BEFORE_YOU_BELIEVE_PRODUCTION_CAPTURE_BYPASS: 'true', NODE_ENV: 'test' }), true);
  assert.equal(isDemoCaptureBypassEnabled({ VERCEL_ENV: 'production', BEFORE_YOU_BELIEVE_PRODUCTION_CAPTURE_BYPASS: 'true', NODE_ENV: 'test' }), true);
  assert.equal(isDemoCaptureBypassEnabled({ VERCEL_ENV: 'preview', BEFORE_YOU_BELIEVE_PRODUCTION_CAPTURE_BYPASS: 'true' }), false);
  assert.equal(isDemoCaptureBypassEnabled({ VERCEL_ENV: 'production', BEFORE_YOU_BELIEVE_PRODUCTION_CAPTURE_BYPASS: 'TRUE' }), false);
});
