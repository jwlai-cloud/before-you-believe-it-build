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
