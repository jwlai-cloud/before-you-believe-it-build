const test = require('node:test');
const assert = require('node:assert/strict');
const liveChallengeHandler = require('../api/live-challenge.js');
const { createAccessCookie } = require('../demo-access.js');

function createResponse() {
  return {
    headers: {},
    statusCode: null,
    body: null,
    setHeader(name, value) { this.headers[name] = value; },
    status(code) { this.statusCode = code; return this; },
    json(body) { this.body = body; return this; }
  };
}

test('live challenge endpoint rejects non-POST methods', async () => {
  const response = createResponse();
  await liveChallengeHandler({ method: 'GET' }, response);

  assert.equal(response.statusCode, 405);
  assert.equal(response.headers.Allow, 'POST');
});

test('live challenge endpoint rejects malformed parent input before an API call', async (t) => {
  const previousToken = process.env.DEMO_ACCESS_TOKEN;
  delete process.env.DEMO_ACCESS_TOKEN;
  t.after(() => {
    if (previousToken === undefined) delete process.env.DEMO_ACCESS_TOKEN;
    else process.env.DEMO_ACCESS_TOKEN = previousToken;
  });
  const response = createResponse();
  await liveChallengeHandler({ method: 'POST', body: { topic: '', ageBand: '8-10' } }, response);

  assert.equal(response.statusCode, 400);
  assert.match(response.body.error, /topic/i);
});

test('live challenge endpoint hides missing-key details behind a safe fallback message', async () => {
  const previousKey = process.env.OPENAI_API_KEY;
  const previousToken = process.env.DEMO_ACCESS_TOKEN;
  delete process.env.OPENAI_API_KEY;
  process.env.DEMO_ACCESS_TOKEN = 'judge-demo-token';
  const response = createResponse();
  await liveChallengeHandler({ method: 'POST', headers: { cookie: `live_demo_access=${createAccessCookie(process.env.DEMO_ACCESS_TOKEN)}` }, body: { topic: 'School gardens', ageBand: '8-10' } }, response);
  if (previousKey === undefined) delete process.env.OPENAI_API_KEY;
  else process.env.OPENAI_API_KEY = previousKey;
  if (previousToken === undefined) delete process.env.DEMO_ACCESS_TOKEN;
  else process.env.DEMO_ACCESS_TOKEN = previousToken;

  assert.equal(response.statusCode, 503);
  assert.equal(response.body.error, 'Live GPT is unavailable. The preset mission is ready to use.');
});

test('live challenge endpoint requires a signed judge cookie when demo access is configured', async () => {
  const previousToken = process.env.DEMO_ACCESS_TOKEN;
  process.env.DEMO_ACCESS_TOKEN = 'judge-demo-token';
  const response = createResponse();
  await liveChallengeHandler({ method: 'POST', headers: {}, body: { topic: 'School gardens', ageBand: '8-10' } }, response);
  if (previousToken === undefined) delete process.env.DEMO_ACCESS_TOKEN;
  else process.env.DEMO_ACCESS_TOKEN = previousToken;

  assert.equal(response.statusCode, 401);
  assert.equal(response.body.error, 'Judge access is required to prepare a live challenge.');
});

test('preview-only capture bypass skips judge-cookie enforcement but still requires live GPT configuration', async (t) => {
  const previousToken = process.env.DEMO_ACCESS_TOKEN;
  const previousKey = process.env.OPENAI_API_KEY;
  const previousEnvironment = process.env.VERCEL_ENV;
  const previousBypass = process.env.BEFORE_YOU_BELIEVE_DEMO_BYPASS;
  delete process.env.DEMO_ACCESS_TOKEN;
  delete process.env.OPENAI_API_KEY;
  process.env.VERCEL_ENV = 'preview';
  process.env.BEFORE_YOU_BELIEVE_DEMO_BYPASS = 'true';
  t.after(() => {
    if (previousToken === undefined) delete process.env.DEMO_ACCESS_TOKEN;
    else process.env.DEMO_ACCESS_TOKEN = previousToken;
    if (previousKey === undefined) delete process.env.OPENAI_API_KEY;
    else process.env.OPENAI_API_KEY = previousKey;
    if (previousEnvironment === undefined) delete process.env.VERCEL_ENV;
    else process.env.VERCEL_ENV = previousEnvironment;
    if (previousBypass === undefined) delete process.env.BEFORE_YOU_BELIEVE_DEMO_BYPASS;
    else process.env.BEFORE_YOU_BELIEVE_DEMO_BYPASS = previousBypass;
  });

  const response = createResponse();
  await liveChallengeHandler({ method: 'POST', headers: {}, body: { topic: 'School gardens', ageBand: '8-10' } }, response);

  assert.equal(response.statusCode, 503);
  assert.equal(response.body.error, 'Live GPT is unavailable. The preset mission is ready to use.');
});

test('production capture bypass skips judge-cookie enforcement but still requires live GPT configuration', async (t) => {
  const previousToken = process.env.DEMO_ACCESS_TOKEN;
  const previousKey = process.env.OPENAI_API_KEY;
  const previousEnvironment = process.env.VERCEL_ENV;
  const previousBypass = process.env.BEFORE_YOU_BELIEVE_PRODUCTION_CAPTURE_BYPASS;
  const previousNodeEnvironment = process.env.NODE_ENV;
  delete process.env.DEMO_ACCESS_TOKEN;
  delete process.env.OPENAI_API_KEY;
  process.env.VERCEL_ENV = 'production';
  process.env.BEFORE_YOU_BELIEVE_PRODUCTION_CAPTURE_BYPASS = 'true';
  process.env.NODE_ENV = 'test';
  t.after(() => {
    if (previousToken === undefined) delete process.env.DEMO_ACCESS_TOKEN;
    else process.env.DEMO_ACCESS_TOKEN = previousToken;
    if (previousKey === undefined) delete process.env.OPENAI_API_KEY;
    else process.env.OPENAI_API_KEY = previousKey;
    if (previousEnvironment === undefined) delete process.env.VERCEL_ENV;
    else process.env.VERCEL_ENV = previousEnvironment;
    if (previousBypass === undefined) delete process.env.BEFORE_YOU_BELIEVE_PRODUCTION_CAPTURE_BYPASS;
    else process.env.BEFORE_YOU_BELIEVE_PRODUCTION_CAPTURE_BYPASS = previousBypass;
    if (previousNodeEnvironment === undefined) delete process.env.NODE_ENV;
    else process.env.NODE_ENV = previousNodeEnvironment;
  });

  const response = createResponse();
  await liveChallengeHandler({ method: 'POST', headers: {}, body: { topic: 'School gardens', ageBand: '8-10' } }, response);

  assert.equal(response.statusCode, 503);
  assert.equal(response.body.error, 'Live GPT is unavailable. The preset mission is ready to use.');
});
