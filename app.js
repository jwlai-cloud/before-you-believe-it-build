const { STAGE_COUNT, defaultAnswer, createMissionState, restoreMissionState, selectEvidence, selectThink, updateAnswer: updateMissionAnswer, resetMissionState, serialiseMissionState, buildWorkingAnswer, receiptFromState } = window.MissionState;
const stages = [...document.querySelectorAll('.stage')];
const steps = [...document.querySelectorAll('.path-step')];
const next = document.querySelector('#next');
const back = document.querySelector('#back');
const count = document.querySelector('#step-count');
const progress = document.querySelector('#progress-message');
const restart = document.querySelector('#restart');
const copyReceipt = document.querySelector('#copy-receipt');
const printReceipt = document.querySelector('#print-receipt');
const receiptStatus = document.querySelector('#receipt-action-status');
const nextLabel = document.querySelector('#next-label');
const nextIcon = document.querySelector('#next-icon');
const liveMissionForm = document.querySelector('#live-mission-form');
const judgeAccessForm = document.querySelector('#judge-access-form');
const judgeAccessSubmit = document.querySelector('#judge-access-submit');
const liveMissionStatus = document.querySelector('#live-mission-status');
const liveMissionResult = document.querySelector('#live-mission-result');
const liveMissionSubmit = document.querySelector('#live-mission-submit');
const storageKey = 'before-you-believe-it:floating-city';
const stageLabels = ['Meet the claim', 'Find the hidden assumption', 'Compare evidence', 'Build your answer', 'Read your receipt'];
const nextLabels = ['Push back', 'Check it', 'Make an answer', 'See receipt', 'Start again'];
let state = restoreMissionState(loadProgress());
let activePack = null;

function loadProgress() {
  try {
    const saved = sessionStorage.getItem(storageKey);
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
}

function saveProgress() {
  try {
    sessionStorage.setItem(storageKey, JSON.stringify(serialiseMissionState(state)));
  } catch {
    // The mission remains usable when browser storage is unavailable.
  }
}

function setLiveMissionStatus(message, isError = false) {
  if (!liveMissionStatus) return;
  liveMissionStatus.textContent = message;
  liveMissionStatus.classList.toggle('error', isError);
}

function setLiveMissionAccess(authorized) {
  if (liveMissionForm) liveMissionForm.hidden = !authorized;
  if (judgeAccessForm) judgeAccessForm.hidden = authorized;
}

async function refreshLiveMissionAccess() {
  try {
    const response = await fetch('/api/demo-access', { credentials: 'same-origin' });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload?.error || 'Live GPT is unavailable.');
    setLiveMissionAccess(Boolean(payload?.authorized));
    setLiveMissionStatus(payload?.authorized
      ? payload?.captureBypass
        ? 'Temporary capture access is ready. Use a general topic, never a child’s personal information.'
        : 'Judge access is ready. Use a general topic, never a child’s personal information.'
      : 'Enter the judge access code to prepare a live challenge.');
  } catch {
    setLiveMissionAccess(false);
    setLiveMissionStatus('Live GPT is unavailable right now. The preset mission is ready to use.', true);
  }
}

function setText(selector, text) {
  const element = document.querySelector(selector);
  if (element) element.textContent = text;
}

function makeOption(value) {
  const option = document.createElement('option');
  option.textContent = value;
  return option;
}

// Rewrite all five mission stages in place from a live GPT-5.6 challenge, then
// reset the flow to a fresh start so the whole activity explores the new topic.
function applyMissionPack(challenge) {
  activePack = challenge;

  // Stage 0 — Think: the claim and the "what makes you pause?" choices.
  setText('#claim-text', `“${challenge.claim}”`);
  document.querySelectorAll('[data-think]').forEach((button, index) => {
    const question = challenge.pause_questions[index];
    const label = button.querySelectorAll('span')[1];
    if (label) label.textContent = question;
    button.dataset.think = question;
    button.classList.remove('selected');
    button.setAttribute('aria-pressed', 'false');
  });

  // Stage 1 — Push back: tappable claim parts, each carrying a hidden assumption.
  const nextAssumptions = {};
  document.querySelectorAll('[data-assumption]').forEach((part, index) => {
    const info = challenge.claim_parts[index];
    const key = `part-${index}`;
    part.dataset.assumption = key;
    const fragment = part.querySelector('span');
    const hint = part.querySelector('small');
    if (fragment) fragment.textContent = info.fragment;
    if (hint) hint.textContent = info.hint;
    part.classList.toggle('selected', index === 1);
    nextAssumptions[key] = [info.assumption_title, info.assumption_note];
  });
  assumptions = nextAssumptions;
  const revealed = challenge.claim_parts[1];
  setText('#assumption-card h3', revealed.assumption_title);
  const assumptionBody = document.querySelector('#assumption-card p');
  if (assumptionBody) assumptionBody.textContent = revealed.assumption_note;
  setText('#push-parent-prompt', challenge.parent_prompt);

  // Stage 2 — Check: the short claim label and three evidence clues.
  setText('#mini-claim-text', `“${challenge.claim_label}”`);
  document.querySelectorAll('[data-evidence]').forEach((button, index) => {
    const card = challenge.evidence_cards[index];
    button.dataset.evidence = card.check_note;
    const type = button.querySelector('.evidence-type');
    const title = button.querySelector('h3');
    const detail = button.querySelector('p');
    if (type) type.textContent = card.label;
    if (title) title.textContent = card.title;
    if (detail) detail.textContent = card.detail;
    button.classList.toggle('chosen', index === 0);
  });

  // Stage 3 — Make: answer-building scaffolds.
  document.querySelector('#opening')?.replaceChildren(...challenge.answer_openings.map(makeOption));
  document.querySelector('#reason')?.replaceChildren(...challenge.answer_reasons.map(makeOption));

  // Stage 4 — Own: receipt title and the remaining uncertainty.
  setText('#receipt-title', `The ${challenge.topic} question`);
  setText('#receipt-uncertain', challenge.uncertainty);

  // Fresh start for the new topic.
  const firstCheck = challenge.evidence_cards[0].check_note;
  state = createMissionState({
    thinking: `A question worth pausing on about ${challenge.topic}.`,
    evidence: firstCheck,
    evidenceChoice: firstCheck,
    answer: {
      opening: challenge.answer_openings[0],
      reason: challenge.answer_reasons[0],
      question: challenge.default_question
    }
  });
  setAnswerValues(state.answer);
  setText('#think-note', 'Choose the question that pulls at you.');
  setText('#check-note', 'A first clue is already linked. You can compare the others too.');
  restoreSelections();
  updateAnswerPreview();
  showStage(0);
}

function setAnswerValues(answer) {
  const opening = document.querySelector('#opening');
  const reason = document.querySelector('#reason');
  const question = document.querySelector('#question');
  if (opening) opening.value = answer.opening;
  if (reason) reason.value = answer.reason;
  if (question) question.value = answer.question;
}

function readAnswer() {
  return {
    opening: document.querySelector('#opening')?.value || '',
    reason: document.querySelector('#reason')?.value || '',
    question: document.querySelector('#question')?.value || ''
  };
}

function restoreSelections() {
  document.querySelectorAll('[data-think]').forEach((item) => {
    const selected = item.dataset.think === state.thinkChoice;
    item.classList.toggle('selected', selected);
    item.setAttribute('aria-pressed', String(selected));
  });
  document.querySelectorAll('[data-evidence]').forEach((item) => item.classList.toggle('chosen', item.dataset.evidence === state.evidenceChoice));
  const thinkNote = document.querySelector('#think-note');
  const checkNote = document.querySelector('#check-note');
  const firstEvidence = document.querySelector('[data-evidence]');
  if (state.thinkChoice && thinkNote) thinkNote.textContent = `You chose: “${state.thinkChoice}” That’s a useful place to begin.`;
  if (checkNote && firstEvidence && state.evidenceChoice !== firstEvidence.dataset.evidence) checkNote.textContent = `Linked: ${state.evidence}`;
}

function updateAnswerPreview() {
  state = updateMissionAnswer(state, readAnswer());
  const answerText = document.querySelector('#answer-text');
  if (answerText) answerText.textContent = buildWorkingAnswer(state.answer);
}

function updateReceipt() {
  const receipt = receiptFromState(state);
  const receiptThink = document.querySelector('#receipt-think');
  const receiptEvidence = document.querySelector('#receipt-evidence');
  const receiptAnswer = document.querySelector('#receipt-answer-text');
  if (receiptThink) receiptThink.textContent = receipt.contributed;
  if (receiptEvidence) receiptEvidence.textContent = receipt.checked;
  if (receiptAnswer) receiptAnswer.textContent = receipt.workingAnswer;
}

function showStage(index, focus = true) {
  state = { ...state, current: Math.min(Math.max(index, 0), STAGE_COUNT - 1) };
  stages.forEach((stage, i) => {
    const isActive = i === state.current;
    stage.hidden = !isActive;
    stage.classList.toggle('active', isActive);
  });
  steps.forEach((step, i) => {
    step.classList.toggle('active', i === state.current);
    step.classList.toggle('done', i < state.current);
    step.setAttribute('aria-current', i === state.current ? 'step' : 'false');
  });
  if (count) count.textContent = `STEP ${state.current + 1} OF 5`;
  if (back) back.disabled = state.current === 0;
  if (nextLabel) nextLabel.textContent = nextLabels[state.current];
  if (nextIcon) nextIcon.textContent = state.current === 4 ? '↺' : '→';
  if (progress) progress.textContent = state.current === 4 ? 'You made the trail. Keep the question alive.' : `${stageLabels[state.current]}. There isn’t a right click.`;
  if (state.current === 4) updateReceipt();
  saveProgress();
  if (focus) document.querySelector('.stage.active')?.focus();
}

function resetMission() {
  try { sessionStorage.removeItem(storageKey); } catch { /* no saved mission to clear */ }
  if (activePack) {
    applyMissionPack(activePack);
    return;
  }
  state = resetMissionState();
  setAnswerValues(defaultAnswer);
  const thinkNote = document.querySelector('#think-note');
  const checkNote = document.querySelector('#check-note');
  if (thinkNote) thinkNote.textContent = 'Choose the question that pulls at you.';
  if (checkNote) checkNote.textContent = 'A first clue is already linked. You can compare the others too.';
  restoreSelections();
  updateAnswerPreview();
  showStage(0);
}

next?.addEventListener('click', () => state.current === 4 ? resetMission() : showStage(state.current + 1));
back?.addEventListener('click', () => showStage(state.current - 1));
restart?.addEventListener('click', resetMission);
steps.forEach((step) => step.addEventListener('click', () => showStage(Number(step.dataset.step))));

document.querySelectorAll('[data-think]').forEach((choice) => choice.addEventListener('click', () => {
  state = selectThink(state, choice.dataset.think);
  restoreSelections();
  saveProgress();
}));

let assumptions = {
  surface: ['“Floating” is simple.', 'It could still need anchors, routes, and a safe place in the sky.'],
  untouched: ['“Untouched” means no effects at all.', 'But a city can cast shade, need anchors, and send waste somewhere — even if it floats.'],
  better: ['“Better” means the same thing to everyone.', 'People may care about different things: climate, wildlife, fairness, cost, or home.']
};
document.querySelectorAll('[data-assumption]').forEach((part) => part.addEventListener('click', () => {
  document.querySelectorAll('[data-assumption]').forEach((item) => item.classList.remove('selected'));
  part.classList.add('selected');
  const [title, body] = assumptions[part.dataset.assumption];
  const assumptionTitle = document.querySelector('#assumption-card h3');
  const assumptionBody = document.querySelector('#assumption-card p');
  if (assumptionTitle) assumptionTitle.textContent = title;
  if (assumptionBody) assumptionBody.textContent = body;
}));

document.querySelectorAll('[data-evidence]').forEach((card) => card.addEventListener('click', () => {
  state = selectEvidence(state, card.dataset.evidence);
  restoreSelections();
  const checkNote = document.querySelector('#check-note');
  const evidencePath = document.querySelector('#evidence-path');
  if (checkNote) checkNote.textContent = `Linked: ${state.evidence}`;
  evidencePath?.animate([{ opacity: .15, strokeDashoffset: 30 }, { opacity: 1, strokeDashoffset: 0 }], { duration: 520, easing: 'ease-out' });
  saveProgress();
}));

const answerBuilder = document.querySelector('#answer-builder');
answerBuilder?.addEventListener('input', () => { updateAnswerPreview(); saveProgress(); });
answerBuilder?.addEventListener('change', () => { updateAnswerPreview(); saveProgress(); });
copyReceipt?.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(receiptFromState(state).workingAnswer);
    if (receiptStatus) receiptStatus.textContent = 'Working answer copied.';
  } catch {
    if (receiptStatus) receiptStatus.textContent = 'Copy is unavailable here — you can select the working answer above.';
  }
});
printReceipt?.addEventListener('click', () => window.print());
judgeAccessForm?.addEventListener('submit', async (event) => {
  event.preventDefault();
  const code = document.querySelector('#judge-access-code')?.value || '';
  if (judgeAccessSubmit) judgeAccessSubmit.disabled = true;
  setLiveMissionStatus('Checking judge access…');
  try {
    const response = await fetch('/api/demo-access', {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code })
    });
    const payload = await response.json();
    if (!response.ok || !payload?.authorized) throw new Error(payload?.error || 'That access code did not work.');
    setLiveMissionAccess(true);
    judgeAccessForm.reset();
    setLiveMissionStatus('Judge access is ready. Use a general topic, never a child’s personal information.');
    document.querySelector('#live-topic')?.focus();
  } catch (error) {
    setLiveMissionStatus(error.message || 'That access code did not work.', true);
  } finally {
    if (judgeAccessSubmit) judgeAccessSubmit.disabled = false;
  }
});
liveMissionForm?.addEventListener('submit', async (event) => {
  event.preventDefault();
  const topic = document.querySelector('#live-topic')?.value.trim() || '';
  const ageBand = document.querySelector('#live-age-band')?.value || '';
  if (!topic) {
    setLiveMissionStatus('Add a short topic first.', true);
    return;
  }
  if (liveMissionSubmit) liveMissionSubmit.disabled = true;
  if (liveMissionResult) liveMissionResult.hidden = true;
  setLiveMissionStatus('GPT-5.6 is preparing challenge material…');
  try {
    const response = await fetch('/api/live-challenge', {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic, ageBand })
    });
    const payload = await response.json();
    if (response.status === 401) {
      setLiveMissionAccess(false);
      setLiveMissionStatus('Judge access expired. Enter the access code again.', true);
      return;
    }
    if (!response.ok || !payload?.challenge) throw new Error(payload?.error || 'Live GPT is unavailable.');
    applyMissionPack(payload.challenge);
    setLiveMissionStatus(`Live mission ready — every step now explores “${payload.challenge.topic}”. Start at Think above.`);
  } catch (error) {
    setLiveMissionStatus(error.message || 'Live GPT is unavailable right now. The preset mission is ready to use.', true);
  } finally {
    if (liveMissionSubmit) liveMissionSubmit.disabled = false;
  }
});

setAnswerValues(state.answer);
restoreSelections();
updateAnswerPreview();
showStage(state.current, false);
refreshLiveMissionAccess();
