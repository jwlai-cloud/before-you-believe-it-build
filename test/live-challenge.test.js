const test = require('node:test');
const assert = require('node:assert/strict');

const {
  buildLiveChallengeRequest,
  requestLiveChallenge,
  validateLiveChallengeInput
} = require('../live-challenge.js');

const validChallenge = {
  topic: 'School gardens',
  claim: 'Every school should turn its oval into a food garden because gardens always help students and nature.',
  claim_label: 'Gardens always help',
  pause_questions: [
    'What would need to be true for “always help” to make sense?',
    'Who would look after the garden over the holidays?',
    'What else could the same space be used for?'
  ],
  claim_parts: [
    { fragment: 'Every school', hint: 'Do all schools have the same space and budget?', assumption_title: 'Every school faces the same conditions.', assumption_note: 'Schools differ in space, water, time, budget and community needs.' },
    { fragment: 'always help', hint: 'Is “always” doing too much work?', assumption_title: '“Always” leaves no room for trade-offs.', assumption_note: 'A garden can help some goals while costing time or money for others.' },
    { fragment: 'students and nature', hint: 'Help which students, and how?', assumption_title: 'Every student benefits the same way.', assumption_note: 'Some students may take part while others rarely use the garden.' }
  ],
  evidence_cards: [
    { label: 'SYSTEMS CLUE', title: 'Gardens need care', detail: 'A garden needs water, tools, time and people to look after it.', check_note: 'A garden needs ongoing care, not just planting.' },
    { label: 'ANOTHER VIEW', title: 'Space can be shared', detail: 'A school oval can be used for sport, play, shade or growing food.', check_note: 'The same space has several possible uses.' },
    { label: 'QUESTION', title: 'Helpful for whom?', detail: 'Different students and families may value different uses of the space.', check_note: 'People may weigh the benefits differently.' }
  ],
  answer_openings: [
    'I’m not sure a school garden always helps because…',
    'A school garden could help in some ways, but…',
    'I would need more information before I said…'
  ],
  answer_reasons: [
    'it needs steady care that someone has to give.',
    '“always” ignores schools with different needs.',
    'the space could serve other useful purposes too.'
  ],
  default_question: 'Who would care for it, and who might miss out?',
  parent_prompt: 'What would we want to learn before deciding?',
  uncertainty: 'Which choice would be fairest for this particular school?'
};

test('validateLiveChallengeInput accepts a short parent topic and known age band', () => {
  assert.deepEqual(validateLiveChallengeInput({ topic: 'School gardens', ageBand: '8-10' }), {
    topic: 'School gardens',
    ageBand: '8-10'
  });
});

test('validateLiveChallengeInput rejects empty, oversize, and unsupported values', () => {
  assert.throws(() => validateLiveChallengeInput({ topic: '   ', ageBand: '8-10' }), /topic/i);
  assert.throws(() => validateLiveChallengeInput({ topic: 'a'.repeat(81), ageBand: '8-10' }), /80/);
  assert.throws(() => validateLiveChallengeInput({ topic: 'Weather', ageBand: 'adult' }), /age/i);
});

test('buildLiveChallengeRequest asks GPT-5.6 for a bounded structured reasoning challenge', () => {
  const request = buildLiveChallengeRequest({ topic: 'School gardens', ageBand: '8-10', model: 'gpt-5.6' });

  assert.equal(request.model, 'gpt-5.6');
  assert.equal(request.reasoning.effort, 'low');
  assert.equal(request.text.format.type, 'json_schema');
  assert.equal(request.text.format.strict, true);
  assert.match(request.input[0].content, /never grade/i);
  assert.match(request.input[0].content, /or judge/i);
  assert.match(request.input[1].content, /School gardens/);
});

test('requestLiveChallenge parses a structured Responses API result and never needs a browser key', async () => {
  const calls = [];
  const fetchImpl = async (url, options) => {
    calls.push({ url, options });
    return { ok: true, json: async () => ({ output_text: JSON.stringify(validChallenge) }) };
  };

  const challenge = await requestLiveChallenge({
    topic: 'School gardens',
    ageBand: '8-10',
    apiKey: 'test-key',
    fetchImpl
  });

  assert.deepEqual(challenge, validChallenge);
  assert.equal(calls[0].url, 'https://api.openai.com/v1/responses');
  assert.equal(calls[0].options.headers.Authorization, 'Bearer test-key');
  assert.ok(calls[0].options.signal instanceof AbortSignal);
  assert.equal(JSON.parse(calls[0].options.body).model, 'gpt-5.6');
});

test('requestLiveChallenge aborts a slow upstream request', async () => {
  await assert.rejects(
    requestLiveChallenge({
      topic: 'School gardens',
      ageBand: '8-10',
      apiKey: 'test-key',
      timeoutMs: 1,
      fetchImpl: async (_url, options) => new Promise((_resolve, reject) => {
        options.signal.addEventListener('abort', () => reject(new Error('request timed out')));
      })
    }),
    /timed out/
  );
});

test('requestLiveChallenge rejects malformed model output instead of passing it to the browser', async () => {
  await assert.rejects(
    requestLiveChallenge({
      topic: 'School gardens',
      ageBand: '8-10',
      apiKey: 'test-key',
      fetchImpl: async () => ({ ok: true, json: async () => ({ output_text: '{"claim":"missing fields"}' }) })
    }),
    /invalid/i
  );
});
