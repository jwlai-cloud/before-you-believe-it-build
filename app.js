const { STAGE_COUNT, defaultAnswer, restoreMissionState, selectEvidence, selectThink, updateAnswer: updateMissionAnswer, resetMissionState, buildWorkingAnswer, receiptFromState } = window.MissionState;
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
    sessionStorage.setItem(storageKey, JSON.stringify(state));
  } catch {
    // The mission remains usable when browser storage is unavailable.
  }
}

function setAnswerValues(answer) {
  document.querySelector('#opening').value = answer.opening;
  document.querySelector('#reason').value = answer.reason;
  document.querySelector('#question').value = answer.question;
}

function readAnswer() {
  return {
    opening: document.querySelector('#opening').value,
    reason: document.querySelector('#reason').value,
    question: document.querySelector('#question').value
  };
}

function restoreSelections() {
  document.querySelectorAll('[data-think]').forEach((item) => item.classList.toggle('selected', item.dataset.think === state.thinkChoice));
  document.querySelectorAll('[data-evidence]').forEach((item) => item.classList.toggle('chosen', item.dataset.evidence === state.evidenceChoice));
  if (state.thinkChoice) document.querySelector('#think-note').textContent = `You chose: “${state.thinkChoice}” That’s a useful place to begin.`;
  if (state.evidenceChoice !== document.querySelector('[data-evidence]').dataset.evidence) document.querySelector('#check-note').textContent = `Linked: ${state.evidence}`;
}

function updateAnswerPreview() {
  state = updateMissionAnswer(state, readAnswer());
  document.querySelector('#answer-text').textContent = buildWorkingAnswer(state.answer);
}

function updateReceipt() {
  const receipt = receiptFromState(state);
  document.querySelector('#receipt-think').textContent = receipt.contributed;
  document.querySelector('#receipt-evidence').textContent = receipt.checked;
  document.querySelector('#receipt-answer-text').textContent = receipt.workingAnswer;
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
  count.textContent = `STEP ${state.current + 1} OF 5`;
  back.disabled = state.current === 0;
  next.innerHTML = `${nextLabels[state.current]} <span aria-hidden="true">${state.current === 4 ? '↺' : '→'}</span>`;
  progress.textContent = state.current === 4 ? 'You made the trail. Keep the question alive.' : `${stageLabels[state.current]}. There isn’t a right click.`;
  if (state.current === 4) updateReceipt();
  saveProgress();
  if (focus) document.querySelector('.stage.active').focus();
}

function resetMission() {
  try { sessionStorage.removeItem(storageKey); } catch { /* no saved mission to clear */ }
  state = resetMissionState();
  setAnswerValues(defaultAnswer);
  document.querySelector('#think-note').textContent = 'Choose the question that pulls at you.';
  document.querySelector('#check-note').textContent = 'A first clue is already linked. You can compare the others too.';
  restoreSelections();
  updateAnswerPreview();
  showStage(0);
}

next.addEventListener('click', () => state.current === 4 ? resetMission() : showStage(state.current + 1));
back.addEventListener('click', () => showStage(state.current - 1));
restart.addEventListener('click', resetMission);
steps.forEach((step) => step.addEventListener('click', () => showStage(Number(step.dataset.step))));

document.querySelectorAll('[data-think]').forEach((choice) => choice.addEventListener('click', () => {
  state = selectThink(state, choice.dataset.think);
  restoreSelections();
  document.querySelector('#think-note').textContent = `You chose: “${state.thinkChoice}” That’s a useful place to begin.`;
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
  document.querySelector('#assumption-card h3').textContent = title;
  document.querySelector('#assumption-card p').textContent = body;
}));

document.querySelectorAll('[data-evidence]').forEach((card) => card.addEventListener('click', () => {
  state = selectEvidence(state, card.dataset.evidence);
  restoreSelections();
  document.querySelector('#check-note').textContent = `Linked: ${state.evidence}`;
  document.querySelector('#evidence-path').animate([{ opacity: .15, strokeDashoffset: 30 }, { opacity: 1, strokeDashoffset: 0 }], { duration: 520, easing: 'ease-out' });
  saveProgress();
}));

document.querySelector('#answer-builder').addEventListener('input', () => { updateAnswerPreview(); saveProgress(); });
document.querySelector('#answer-builder').addEventListener('change', () => { updateAnswerPreview(); saveProgress(); });
copyReceipt.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(receiptFromState(state).workingAnswer);
    receiptStatus.textContent = 'Working answer copied.';
  } catch {
    receiptStatus.textContent = 'Copy is unavailable here — you can select the working answer above.';
  }
});
printReceipt.addEventListener('click', () => window.print());

setAnswerValues(state.answer);
restoreSelections();
updateAnswerPreview();
showStage(state.current, false);
