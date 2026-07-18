const {
  createAccessCookie,
  formatAccessCookie,
  isAuthorizedRequest,
  isDemoAccessConfigured,
  constantTimeEqual
} = require('../demo-access.js');

module.exports = async function demoAccess(request, response) {
  const token = process.env.DEMO_ACCESS_TOKEN;
  if (!isDemoAccessConfigured(token)) {
    return response.status(503).json({ error: 'Live judge access is not configured.' });
  }

  if (request.method === 'GET') {
    return response.status(200).json({ authorized: isAuthorizedRequest(request, token) });
  }

  if (request.method !== 'POST') {
    response.setHeader('Allow', 'GET, POST');
    return response.status(405).json({ error: 'Method not allowed.' });
  }

  if (!constantTimeEqual(request.body?.code || '', token)) {
    return response.status(401).json({ error: 'That access code did not work.' });
  }

  response.setHeader('Set-Cookie', formatAccessCookie(createAccessCookie(token)));
  return response.status(200).json({ authorized: true });
};
