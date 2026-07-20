const test = require('node:test');
const assert = require('node:assert/strict');
const demoAccessHandler = require('../api/demo-access.js');

function createResponse() {
  return {
    headers: {}, statusCode: null, body: null,
    setHeader(name, value) { this.headers[name] = value; },
    status(code) { this.statusCode = code; return this; },
    json(body) { this.body = body; return this; }
  };
}

test('demo access accepts the right code and creates an HttpOnly cookie', async () => {
  const previousToken = process.env.DEMO_ACCESS_TOKEN;
  process.env.DEMO_ACCESS_TOKEN = 'judge-demo-token';
  const response = createResponse();
  await demoAccessHandler({ method: 'POST', body: { code: 'judge-demo-token' } }, response);
  if (previousToken === undefined) delete process.env.DEMO_ACCESS_TOKEN;
  else process.env.DEMO_ACCESS_TOKEN = previousToken;

  assert.equal(response.statusCode, 200);
  assert.equal(response.body.authorized, true);
  assert.match(response.headers['Set-Cookie'], /HttpOnly; Secure; SameSite=Strict/);
});

test('demo access does not expose access status without a valid signed cookie', async () => {
  const previousToken = process.env.DEMO_ACCESS_TOKEN;
  process.env.DEMO_ACCESS_TOKEN = 'judge-demo-token';
  const response = createResponse();
  await demoAccessHandler({ method: 'GET', headers: {} }, response);
  if (previousToken === undefined) delete process.env.DEMO_ACCESS_TOKEN;
  else process.env.DEMO_ACCESS_TOKEN = previousToken;

  assert.equal(response.statusCode, 200);
  assert.equal(response.body.authorized, false);
});

test('preview-only capture bypass authorizes access without configuring a judge code', async (t) => {
  const previousToken = process.env.DEMO_ACCESS_TOKEN;
  const previousEnvironment = process.env.VERCEL_ENV;
  const previousBypass = process.env.BEFORE_YOU_BELIEVE_DEMO_BYPASS;
  delete process.env.DEMO_ACCESS_TOKEN;
  process.env.VERCEL_ENV = 'preview';
  process.env.BEFORE_YOU_BELIEVE_DEMO_BYPASS = 'true';
  t.after(() => {
    if (previousToken === undefined) delete process.env.DEMO_ACCESS_TOKEN;
    else process.env.DEMO_ACCESS_TOKEN = previousToken;
    if (previousEnvironment === undefined) delete process.env.VERCEL_ENV;
    else process.env.VERCEL_ENV = previousEnvironment;
    if (previousBypass === undefined) delete process.env.BEFORE_YOU_BELIEVE_DEMO_BYPASS;
    else process.env.BEFORE_YOU_BELIEVE_DEMO_BYPASS = previousBypass;
  });

  const response = createResponse();
  await demoAccessHandler({ method: 'GET', headers: {} }, response);

  assert.equal(response.statusCode, 200);
  assert.deepEqual(response.body, { authorized: true, captureBypass: true });
});

test('production capture bypass authorizes access only with its separate opt-in', async (t) => {
  const previousEnvironment = process.env.VERCEL_ENV;
  const previousBypass = process.env.BEFORE_YOU_BELIEVE_PRODUCTION_CAPTURE_BYPASS;
  const previousNodeEnvironment = process.env.NODE_ENV;
  process.env.VERCEL_ENV = 'production';
  process.env.BEFORE_YOU_BELIEVE_PRODUCTION_CAPTURE_BYPASS = 'true';
  process.env.NODE_ENV = 'test';
  t.after(() => {
    if (previousEnvironment === undefined) delete process.env.VERCEL_ENV;
    else process.env.VERCEL_ENV = previousEnvironment;
    if (previousBypass === undefined) delete process.env.BEFORE_YOU_BELIEVE_PRODUCTION_CAPTURE_BYPASS;
    else process.env.BEFORE_YOU_BELIEVE_PRODUCTION_CAPTURE_BYPASS = previousBypass;
    if (previousNodeEnvironment === undefined) delete process.env.NODE_ENV;
    else process.env.NODE_ENV = previousNodeEnvironment;
  });

  const response = createResponse();
  await demoAccessHandler({ method: 'GET', headers: {} }, response);

  assert.equal(response.statusCode, 200);
  assert.deepEqual(response.body, { authorized: true, captureBypass: true });
});
