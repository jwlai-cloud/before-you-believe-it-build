const test = require('node:test');
const assert = require('node:assert/strict');

const {
  createAccessCookie,
  isAuthorizedRequest,
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
