const test = require('node:test');
const assert = require('node:assert/strict');
const {
  createMissionState,
  selectEvidence,
  selectThink,
  serialiseMissionState,
  buildWorkingAnswer,
  receiptFromState,
  resetMissionState,
  restoreMissionState,
  defaultAnswer,
  defaultEvidence,
  defaultThinking
} = require('../mission-state.js');

test('selectThink records the child question without evaluating it', () => {
  const state = selectThink(createMissionState(), 'Who gets to live there, and who does not?');

  assert.equal(state.thinkChoice, 'Who gets to live there, and who does not?');
  assert.equal(state.thinking, 'You noticed: “Who gets to live there, and who does not?”');
  assert.doesNotMatch(state.thinking, /correct|wrong|score|grade/i);
});

test('selectEvidence updates the receipt evidence without changing the child contribution', () => {
  const withThink = selectThink(createMissionState(), 'Would it really leave the land below untouched?');
  const state = selectEvidence(withThink, 'A city can affect the people and ecosystems around it even when it is built above the ground.');

  const receipt = receiptFromState(state);
  assert.equal(receipt.contributed, 'You noticed: “Would it really leave the land below untouched?”');
  assert.equal(receipt.checked, 'A city can affect the people and ecosystems around it even when it is built above the ground.');
});

test('buildWorkingAnswer keeps a child question open when the input is blank', () => {
  const answer = buildWorkingAnswer({
    opening: 'I would need more information before I said…',
    reason: 'we need to decide what “better” means first.',
    question: '   '
  });

  assert.equal(answer, 'I would need more information before I said… we need to decide what “better” means first. I’d still ask: What else would I need to know?');
});

test('restoreMissionState rejects an out-of-range stage and keeps a valid saved answer', () => {
  const restored = restoreMissionState({
    current: 99,
    thinking: 'You noticed: “How would it get power and water?”',
    thinkChoice: 'How would it get power and water?',
    evidence: 'A floating platform needs materials, energy and maintenance — each has environmental impacts.',
    evidenceChoice: 'A floating platform needs materials, energy and maintenance — each has environmental impacts.',
    opening: 'Floating cities could help in some ways, but…',
    reason: 'they still need energy, materials and maintenance.',
    question: 'Where does the energy come from?'
  });

  assert.equal(restored.current, 0);
  assert.equal(restored.answer.question, 'Where does the energy come from?');
  assert.equal(restored.thinkChoice, 'How would it get power and water?');
});

test('restoreMissionState safely defaults malformed saved values', () => {
  for (const saved of [null, undefined, 'not a saved mission']) {
    const restored = restoreMissionState(saved);
    assert.equal(restored.current, 0);
    assert.equal(restored.thinking, defaultThinking);
    assert.equal(restored.evidence, defaultEvidence);
  }
});

test('restoreMissionState preserves valid stage and partial answer values', () => {
  const restored = restoreMissionState({ current: 2, answer: { question: 'What would happen in a storm?' } });

  assert.equal(restored.current, 2);
  assert.equal(restored.answer.opening, defaultAnswer.opening);
  assert.equal(restored.answer.reason, defaultAnswer.reason);
  assert.equal(restored.answer.question, 'What would happen in a storm?');
});

test('resetMissionState clears prior choices and returns to the first stage', () => {
  const selected = selectEvidence(
    selectThink(createMissionState(), 'How would it get power and water?'),
    'People may disagree about what “better” means: land use, fairness, biodiversity or climate can lead to different answers.'
  );
  const reset = resetMissionState(selected);

  assert.equal(reset.current, 0);
  assert.equal(reset.thinkChoice, '');
  assert.equal(reset.thinking, 'A question about whether the land would really be untouched.');
  assert.equal(reset.evidence, 'A floating platform needs materials, energy and maintenance — each has environmental impacts.');
});

test('a new mission starts with the visible first evidence clue selected', () => {
  const state = createMissionState();

  assert.equal(state.evidenceChoice, 'A floating platform needs materials, energy and maintenance — each has environmental impacts.');
  assert.equal(state.evidence, state.evidenceChoice);
});

test('empty selections fall back to neutral default mission material', () => {
  const withEmptyThink = selectThink(createMissionState(), '   ');
  const withEmptyEvidence = selectEvidence(withEmptyThink, undefined);

  assert.equal(withEmptyEvidence.thinkChoice, '');
  assert.equal(withEmptyEvidence.thinking, defaultThinking);
  assert.equal(withEmptyEvidence.evidence, defaultEvidence);
  assert.equal(withEmptyEvidence.evidenceChoice, defaultEvidence);
});

test('buildWorkingAnswer normalises missing and malformed fields', () => {
  const defaulted = buildWorkingAnswer();
  const partial = buildWorkingAnswer({ question: 'Could it be safer?' });
  const malformed = buildWorkingAnswer({ opening: null, reason: 42, question: 'Could it be fair?' });

  assert.match(defaulted, /I’d still ask:/);
  assert.match(partial, /Could it be safer\?/);
  assert.match(malformed, /Could it be fair\?/);
  assert.doesNotMatch(malformed, /null|undefined|42/);
});

test('serialiseMissionState keeps only values required to restore a mission', () => {
  const state = selectEvidence(
    selectThink(createMissionState(), 'How would it get power and water?'),
    'A city can affect the people and ecosystems around it even when it is built above the ground.'
  );
  const persisted = serialiseMissionState({ ...state, current: 3 });

  assert.deepEqual(persisted, {
    current: 3,
    thinkChoice: 'How would it get power and water?',
    evidenceChoice: 'A city can affect the people and ecosystems around it even when it is built above the ground.',
    answer: defaultAnswer
  });
  assert.equal('thinking' in persisted, false);
  assert.equal('evidence' in persisted, false);
});
