(function exposeMissionState(global, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  global.MissionState = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, () => {
  const STAGE_COUNT = 5;
  const defaultAnswer = {
    opening: 'I’m not sure floating cities are automatically better because…',
    reason: 'they still need energy, materials and maintenance.',
    question: 'Who would be helped, and who could be left out?'
  };
  const defaultThinking = 'A question about whether the land would really be untouched.';
  const defaultEvidence = 'A floating platform needs materials, energy and maintenance — each has environmental impacts.';

  function safeText(value, fallback) {
    return typeof value === 'string' && value.trim() ? value : fallback;
  }

  function normaliseAnswer(answer = {}) {
    return {
      opening: safeText(answer.opening, defaultAnswer.opening),
      reason: safeText(answer.reason, defaultAnswer.reason),
      question: typeof answer.question === 'string' ? answer.question : defaultAnswer.question
    };
  }

  function createMissionState(overrides = {}) {
    const thinkChoice = safeText(overrides.thinkChoice, '');
    const savedEvidence = safeText(overrides.evidence, '');
    const evidenceChoice = safeText(overrides.evidenceChoice, savedEvidence || defaultEvidence);
    const evidence = savedEvidence || evidenceChoice;
    return {
      current: Number.isInteger(overrides.current) && overrides.current >= 0 && overrides.current < STAGE_COUNT ? overrides.current : 0,
      thinking: thinkChoice ? `You noticed: “${thinkChoice}”` : safeText(overrides.thinking, defaultThinking),
      evidence,
      thinkChoice,
      evidenceChoice,
      answer: normaliseAnswer(overrides.answer || overrides)
    };
  }

  function restoreMissionState(saved) {
    return createMissionState(saved && typeof saved === 'object' ? saved : {});
  }

  function selectThink(state, thinkChoice) {
    return createMissionState({ ...state, thinkChoice, answer: state.answer });
  }

  function selectEvidence(state, evidenceChoice) {
    return createMissionState({ ...state, evidence: evidenceChoice, evidenceChoice, answer: state.answer });
  }

  function updateAnswer(state, answer) {
    return createMissionState({ ...state, answer });
  }

  function resetMissionState() {
    return createMissionState();
  }

  function serialiseMissionState(state) {
    const restored = restoreMissionState(state);
    return {
      current: restored.current,
      thinkChoice: restored.thinkChoice,
      evidenceChoice: restored.evidenceChoice,
      answer: { ...restored.answer }
    };
  }

  function buildWorkingAnswer(answer) {
    const normalised = normaliseAnswer(answer);
    const question = normalised.question.trim() || 'What else would I need to know?';
    return `${normalised.opening} ${normalised.reason} I’d still ask: ${question}`;
  }

  function receiptFromState(state) {
    const restored = restoreMissionState(state);
    return {
      contributed: restored.thinking,
      checked: restored.evidence,
      workingAnswer: buildWorkingAnswer(restored.answer)
    };
  }

  return {
    STAGE_COUNT,
    defaultAnswer,
    defaultThinking,
    defaultEvidence,
    createMissionState,
    restoreMissionState,
    selectThink,
    selectEvidence,
    updateAnswer,
    resetMissionState,
    serialiseMissionState,
    buildWorkingAnswer,
    receiptFromState
  };
});
