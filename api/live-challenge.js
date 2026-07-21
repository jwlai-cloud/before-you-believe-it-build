const { requestLiveChallenge, validateLiveChallengeInput } = require('../live-challenge.js');
const { isAuthorizedRequest, isDemoAccessConfigured, isDemoCaptureBypassEnabled } = require('../demo-access.js');
const { checkRateLimit, clientKey } = require('../rate-limit.js');

module.exports = async function liveChallenge(request, response) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST');
    return response.status(405).json({ error: 'Method not allowed.' });
  }

  try {
    const input = validateLiveChallengeInput(request.body || {});
    const demoToken = process.env.DEMO_ACCESS_TOKEN;
    const captureBypass = isDemoCaptureBypassEnabled();
    if (!captureBypass && !isDemoAccessConfigured(demoToken)) {
      return response.status(503).json({ error: 'Live GPT judge access is not configured.' });
    }
    if (!captureBypass && !isAuthorizedRequest(request, demoToken)) {
      return response.status(401).json({ error: 'Judge access is required to prepare a live challenge.' });
    }
    const rate = checkRateLimit(clientKey(request));
    if (!rate.allowed) {
      response.setHeader('Retry-After', String(rate.retryAfter));
      return response.status(429).json({ error: 'Too many live requests. Please wait a moment before trying another topic.' });
    }
    const challenge = await requestLiveChallenge({
      ...input,
      apiKey: process.env.OPENAI_API_KEY,
      model: process.env.OPENAI_MODEL || 'gpt-5.6'
    });
    return response.status(200).json({ challenge });
  } catch (error) {
    const isInputError = /invalid (topic|age band)/i.test(error.message);
    const status = isInputError ? 400 : 503;
    return response.status(status).json({
      error: isInputError ? error.message : 'Live GPT is unavailable. The preset mission is ready to use.'
    });
  }
};

// GPT-5.6 preparing the full mission takes ~15-20s; allow headroom so the
// serverless function is not killed before the model responds.
module.exports.config = { maxDuration: 30 };
