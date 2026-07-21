const AGE_BANDS = new Set(['8-10', '11-13']);
const MAX_TOPIC_LENGTH = 80;
const MAX_TEXT_LENGTH = 420;
const LIVE_CHALLENGE_TIMEOUT_MS = 30_000;

const challengeSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['topic', 'claim', 'claim_label', 'pause_questions', 'claim_parts', 'evidence_cards', 'answer_openings', 'answer_reasons', 'default_question', 'parent_prompt', 'uncertainty'],
  properties: {
    topic: { type: 'string' },
    claim: { type: 'string' },
    claim_label: { type: 'string' },
    pause_questions: { type: 'array', minItems: 3, maxItems: 3, items: { type: 'string' } },
    claim_parts: {
      type: 'array',
      minItems: 3,
      maxItems: 3,
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['fragment', 'hint', 'assumption_title', 'assumption_note'],
        properties: {
          fragment: { type: 'string' },
          hint: { type: 'string' },
          assumption_title: { type: 'string' },
          assumption_note: { type: 'string' }
        }
      }
    },
    evidence_cards: {
      type: 'array',
      minItems: 3,
      maxItems: 3,
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['label', 'title', 'detail', 'check_note'],
        properties: {
          label: { type: 'string' },
          title: { type: 'string' },
          detail: { type: 'string' },
          check_note: { type: 'string' }
        }
      }
    },
    answer_openings: { type: 'array', minItems: 3, maxItems: 3, items: { type: 'string' } },
    answer_reasons: { type: 'array', minItems: 3, maxItems: 3, items: { type: 'string' } },
    default_question: { type: 'string' },
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

function requireArray(value, name, length) {
  if (!Array.isArray(value) || value.length !== length) throw new Error(`Invalid live challenge ${name}.`);
  return value;
}

function validateLiveChallenge(candidate) {
  if (!candidate || typeof candidate !== 'object' || Array.isArray(candidate)) throw new Error('Invalid live challenge.');
  const pauseQuestions = requireArray(candidate.pause_questions, 'pause questions', 3);
  const claimParts = requireArray(candidate.claim_parts, 'claim parts', 3);
  const evidenceCards = requireArray(candidate.evidence_cards, 'evidence', 3);
  const answerOpenings = requireArray(candidate.answer_openings, 'answer openings', 3);
  const answerReasons = requireArray(candidate.answer_reasons, 'answer reasons', 3);

  // Generous ceilings: these bound UI layout only (text renders as textContent),
  // so they are set well above the model's normal output to avoid false rejects.
  return {
    topic: requireText(candidate.topic, 'challenge topic', 100),
    claim: requireText(candidate.claim, 'claim'),
    claim_label: requireText(candidate.claim_label, 'claim label', 120),
    pause_questions: pauseQuestions.map((question, index) => requireText(question, `pause question ${index + 1}`, 220)),
    claim_parts: claimParts.map((part, index) => ({
      fragment: requireText(part?.fragment, `claim part ${index + 1} fragment`, 100),
      hint: requireText(part?.hint, `claim part ${index + 1} hint`, 180),
      assumption_title: requireText(part?.assumption_title, `claim part ${index + 1} assumption title`, 180),
      assumption_note: requireText(part?.assumption_note, `claim part ${index + 1} assumption note`, 360)
    })),
    evidence_cards: evidenceCards.map((card, index) => ({
      label: requireText(card?.label, `evidence ${index + 1} label`, 60),
      title: requireText(card?.title, `evidence ${index + 1} title`, 180),
      detail: requireText(card?.detail, `evidence ${index + 1} detail`, 360),
      check_note: requireText(card?.check_note, `evidence ${index + 1} check note`, 320)
    })),
    answer_openings: answerOpenings.map((opening, index) => requireText(opening, `answer opening ${index + 1}`, 220)),
    answer_reasons: answerReasons.map((reason, index) => requireText(reason, `answer reason ${index + 1}`, 220)),
    default_question: requireText(candidate.default_question, 'default question', 220),
    parent_prompt: requireText(candidate.parent_prompt, 'parent prompt'),
    uncertainty: requireText(candidate.uncertainty, 'uncertainty')
  };
}

function buildLiveChallengeRequest({ topic, ageBand, model = 'gpt-5.6' }) {
  const input = validateLiveChallengeInput({ topic, ageBand });
  return {
    model,
    reasoning: { effort: 'low' },
    max_output_tokens: 1600,
    input: [
      {
        role: 'developer',
        content: 'You are the Mission Director for a 5–7 minute parent-and-child reasoning activity. Build one complete reasoning mission about the given topic as challenge material to question — never an answer or a verdict. Provide: one plausible but unproven claim; a short claim label of a few words; three "what makes you pause" questions a child could choose from; three claim_parts that each quote a short fragment of the claim, a hint, and the hidden assumption it carries as a title and note; three balanced evidence clues, each with a label, title, detail, and a short check_note stating what the clue lets a child check; three answer openings and three answer reasons a child could build a careful answer from; a default child question; a parent prompt; and one honest remaining uncertainty. Use age-appropriate plain language and keep every field to one or two short sentences. Do not invent citations or facts presented as verified. Never grade, score, diagnose, rank, persuade, or judge a child. Do not request personal information. Return only the requested structured challenge.'
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
