const AGE_BANDS = new Set(['8-10', '11-13']);
const MAX_TOPIC_LENGTH = 80;
const MAX_TEXT_LENGTH = 420;
const LIVE_CHALLENGE_TIMEOUT_MS = 15_000;

const challengeSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['topic', 'claim', 'pause_question', 'assumption_label', 'assumption_note', 'evidence_cards', 'parent_prompt', 'uncertainty'],
  properties: {
    topic: { type: 'string' },
    claim: { type: 'string' },
    pause_question: { type: 'string' },
    assumption_label: { type: 'string' },
    assumption_note: { type: 'string' },
    evidence_cards: {
      type: 'array',
      minItems: 3,
      maxItems: 3,
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['label', 'title', 'detail'],
        properties: {
          label: { type: 'string' },
          title: { type: 'string' },
          detail: { type: 'string' }
        }
      }
    },
    parent_prompt: { type: 'string' },
    uncertainty: { type: 'string' }
  }
};

function requireText(value, name, maxLength = MAX_TEXT_LENGTH) {
  if (typeof value !== 'string' || !value.trim()) throw new Error(`Invalid ${name}.`);
  const text = value.trim();
  if (text.length > maxLength) throw new Error(`Invalid ${name}: must be ${maxLength} characters or fewer.`);
  return text;
}

function validateLiveChallengeInput(input = {}) {
  const topic = requireText(input.topic, 'topic', MAX_TOPIC_LENGTH);
  if (!AGE_BANDS.has(input.ageBand)) throw new Error('Invalid age band.');
  return { topic, ageBand: input.ageBand };
}

function validateLiveChallenge(candidate) {
  if (!candidate || typeof candidate !== 'object' || Array.isArray(candidate)) throw new Error('Invalid live challenge.');
  if (!Array.isArray(candidate.evidence_cards) || candidate.evidence_cards.length !== 3) throw new Error('Invalid live challenge evidence.');

  return {
    topic: requireText(candidate.topic, 'challenge topic', 100),
    claim: requireText(candidate.claim, 'claim'),
    pause_question: requireText(candidate.pause_question, 'pause question'),
    assumption_label: requireText(candidate.assumption_label, 'assumption label'),
    assumption_note: requireText(candidate.assumption_note, 'assumption note'),
    evidence_cards: candidate.evidence_cards.map((card, index) => ({
      label: requireText(card?.label, `evidence ${index + 1} label`, 60),
      title: requireText(card?.title, `evidence ${index + 1} title`, 140),
      detail: requireText(card?.detail, `evidence ${index + 1} detail`, 260)
    })),
    parent_prompt: requireText(candidate.parent_prompt, 'parent prompt'),
    uncertainty: requireText(candidate.uncertainty, 'uncertainty')
  };
}

function buildLiveChallengeRequest({ topic, ageBand, model = 'gpt-5.6' }) {
  const input = validateLiveChallengeInput({ topic, ageBand });
  return {
    model,
    reasoning: { effort: 'low' },
    max_output_tokens: 900,
    input: [
      {
        role: 'developer',
        content: 'You are the Mission Director for a 5–7 minute parent-and-child reasoning activity. Create challenge material, never an answer. Make one plausible but unproven claim, a hidden assumption, and three balanced reasoning clues. Use age-appropriate plain language. Do not invent citations or facts presented as verified. Never grade, score, diagnose, rank, persuade, or judge a child. Do not request personal information. Return only the requested structured challenge.'
      },
      {
        role: 'user',
        content: `Prepare a reasoning challenge about: ${input.topic}\nAge band: ${input.ageBand}\nThe parent supplied only this topic; do not infer personal details.`
      }
    ],
    text: {
      format: {
        type: 'json_schema',
        name: 'live_reasoning_challenge',
        strict: true,
        schema: challengeSchema
      }
    }
  };
}

function extractOutputText(response) {
  if (typeof response?.output_text === 'string') return response.output_text;
  const message = response?.output?.find((item) => item.type === 'message');
  const text = message?.content?.find((item) => item.type === 'output_text')?.text;
  if (typeof text === 'string') return text;
  throw new Error('Live GPT returned no structured challenge.');
}

async function requestLiveChallenge({ topic, ageBand, apiKey, fetchImpl = fetch, model = 'gpt-5.6', timeoutMs = LIVE_CHALLENGE_TIMEOUT_MS }) {
  if (!apiKey) throw new Error('Live GPT is not configured.');
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  let response;
  try {
    response = await fetchImpl('https://api.openai.com/v1/responses', {
      method: 'POST',
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(buildLiveChallengeRequest({ topic, ageBand, model }))
    });
  } finally {
    clearTimeout(timeout);
  }
  if (!response.ok) throw new Error('Live GPT could not prepare a challenge.');

  let payload;
  try {
    payload = await response.json();
  } catch {
    throw new Error('Live GPT returned an unreadable response.');
  }
  try {
    return validateLiveChallenge(JSON.parse(extractOutputText(payload)));
  } catch (error) {
    if (error instanceof SyntaxError) throw new Error('Live GPT returned an invalid challenge.');
    throw error;
  }
}

module.exports = {
  AGE_BANDS,
  MAX_TOPIC_LENGTH,
  buildLiveChallengeRequest,
  requestLiveChallenge,
  validateLiveChallenge,
  validateLiveChallengeInput
};
