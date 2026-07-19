const { requestLiveChallenge, validateLiveChallengeInput } = require('../live-challenge.js');
const { isAuthorizedRequest, isDemoAccessConfigured, isPreviewDemoBypassEnabled } = require('../demo-access.js');

module.exports = async function liveChallenge(request, response) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST');
    return response.status(405).json({ error: 'Method not allowed.' });
  }

  try {
    const input = validateLiveChallengeInput(request.body || {});
    const demoToken = process.env.DEMO_ACCESS_TOKEN;
    const capturePreview = isPreviewDemoBypassEnabled();
    if (!capturePreview && !isDemoAccessConfigured(demoToken)) {
      return response.status(503).json({ error: 'Live GPT judge access is not configured.' });
    }
    if (!capturePreview && !isAuthorizedRequest(request, demoToken)) {
      return response.status(401).json({ error: 'Judge access is required to prepare a live challenge.' });
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
