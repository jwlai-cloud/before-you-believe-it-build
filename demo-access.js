const crypto = require('node:crypto');

const COOKIE_NAME = 'live_demo_access';
const ACCESS_DURATION_SECONDS = 60 * 60 * 2;
let productionCaptureBypassWarningIssued = false;

function isDemoAccessConfigured(token) {
  return typeof token === 'string' && token.length >= 12;
}

function isPreviewDemoBypassEnabled(environment = process.env) {
  return environment?.VERCEL_ENV === 'preview'
    && environment?.BEFORE_YOU_BELIEVE_DEMO_BYPASS === 'true';
}

function isProductionCaptureBypassEnabled(environment = process.env) {
  const enabled = environment?.VERCEL_ENV === 'production'
    && environment?.BEFORE_YOU_BELIEVE_PRODUCTION_CAPTURE_BYPASS === 'true';
  if (enabled && environment?.NODE_ENV !== 'test' && !productionCaptureBypassWarningIssued) {
    console.warn('WARNING: Production capture bypass is active. Unauthenticated live-generation requests are permitted.');
    productionCaptureBypassWarningIssued = true;
  }
  return enabled;
}

function isDemoCaptureBypassEnabled(environment = process.env) {
  return isPreviewDemoBypassEnabled(environment) || isProductionCaptureBypassEnabled(environment);
}

function constantTimeEqual(left, right) {
  const leftBuffer = Buffer.from(String(left));
  const rightBuffer = Buffer.from(String(right));
  return leftBuffer.length === rightBuffer.length && crypto.timingSafeEqual(leftBuffer, rightBuffer);
}

function sign(payload, token) {
  return crypto.createHmac('sha256', token).update(payload).digest('base64url');
}

function createAccessCookie(token, expiresAt = Date.now() + ACCESS_DURATION_SECONDS * 1000) {
  if (!isDemoAccessConfigured(token)) throw new Error('Demo access is not configured.');
  const payload = Buffer.from(JSON.stringify({ expiresAt }), 'utf8').toString('base64url');
  return `${payload}.${sign(payload, token)}`;
}

function verifyAccessCookie(value, token, now = Date.now()) {
  if (!isDemoAccessConfigured(token) || typeof value !== 'string') return false;
  const [payload, signature, extra] = value.split('.');
  if (!payload || !signature || extra || !constantTimeEqual(signature, sign(payload, token))) return false;

  try {
    const { expiresAt } = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    return Number.isSafeInteger(expiresAt) && expiresAt > now;
  } catch {
    return false;
  }
}

function cookieValue(header, name) {
  if (typeof header !== 'string') return '';
  const prefix = `${name}=`;
  const part = header.split(';').map((item) => item.trim()).find((item) => item.startsWith(prefix));
  return part ? part.slice(prefix.length) : '';
}

function isAuthorizedRequest(request, token, now = Date.now()) {
  return verifyAccessCookie(cookieValue(request?.headers?.cookie, COOKIE_NAME), token, now);
}

function formatAccessCookie(value) {
  return `${COOKIE_NAME}=${value}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${ACCESS_DURATION_SECONDS}`;
}

module.exports = {
  ACCESS_DURATION_SECONDS,
  COOKIE_NAME,
  constantTimeEqual,
  createAccessCookie,
  formatAccessCookie,
  isAuthorizedRequest,
  isDemoCaptureBypassEnabled,
  isDemoAccessConfigured,
  isProductionCaptureBypassEnabled,
  isPreviewDemoBypassEnabled,
  verifyAccessCookie
};
