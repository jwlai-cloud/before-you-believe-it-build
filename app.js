const { STAGE_COUNT, defaultAnswer, restoreMissionState, selectEvidence, selectThink, updateAnswer: updateMissionAnswer, resetMissionState, serialiseMissionState, buildWorkingAnswer, receiptFromState } = window.MissionState;
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
const storageKey = 'before-you-believe-it:floating-city';
const stageLabels = ['Meet the claim', 'Find the hidden assumption', 'Compare evidence', 'Build your answer', 'Read your receipt'];
const nextLabels = ['Push back', 'Check it', 'Make an answer', 'See receipt', 'Start again'];
let state = restoreMissionState(loadProgress());

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
  document.querySelectorAll('[data-think]').forEach((item) => item.classList.toggle('selected', item.dataset.think === state.thinkChoice));
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

const assumptions = {
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

setAnswerValues(state.answer);
restoreSelections();
updateAnswerPreview();
showStage(state.current, false);
