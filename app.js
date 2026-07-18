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
const defaultThinking = 'A question about whether the land would really be untouched.';
const defaultEvidence = 'Floating platforms still need energy, materials and maintenance.';
const defaultAnswer = {
  opening: 'I’m not sure floating cities are automatically better because…',
  reason: 'they still need energy, materials and maintenance.',
  question: 'Who would be helped, and who could be left out?'
};
const savedProgress = loadProgress();
let current = Number.isInteger(savedProgress?.current) ? savedProgress.current : 0;
let thinking = savedProgress?.thinking || defaultThinking;
let evidence = savedProgress?.evidence || defaultEvidence;
let thinkChoice = savedProgress?.thinkChoice || '';
let evidenceChoice = savedProgress?.evidenceChoice || document.querySelector('[data-evidence]')?.dataset.evidence || '';

const stageLabels = ['Meet the claim', 'Find the hidden assumption', 'Compare evidence', 'Build your answer', 'Read your receipt'];
const nextLabels = ['Push back', 'Check it', 'Make an answer', 'See receipt', 'Start again'];

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
    sessionStorage.setItem(storageKey, JSON.stringify({
      current,
      thinking,
      evidence,
      thinkChoice,
      evidenceChoice,
      opening: document.querySelector('#opening')?.value,
      reason: document.querySelector('#reason')?.value,
      question: document.querySelector('#question')?.value
    }));
  } catch {
    // The mission remains usable when browser storage is unavailable.
  }
}

function setAnswerValues(values) {
  const opening = document.querySelector('#opening');
  const reason = document.querySelector('#reason');
  const question = document.querySelector('#question');
  if (opening) opening.value = values.opening;
  if (reason) reason.value = values.reason;
  if (question) question.value = values.question;
}

function restoreSelections() {
  document.querySelectorAll('[data-think]').forEach((item) => item.classList.toggle('selected', item.dataset.think === thinkChoice));
  document.querySelectorAll('[data-evidence]').forEach((item) => item.classList.toggle('chosen', item.dataset.evidence === evidenceChoice));
  if (thinkChoice) document.querySelector('#think-note').textContent = `You chose: “${thinkChoice}” That’s a useful place to begin.`;
  if (evidenceChoice && evidenceChoice !== document.querySelector('[data-evidence]')?.dataset.evidence) {
    document.querySelector('#check-note').textContent = `Linked: ${evidence}`;
  }
}

function updateAnswer() {
  const opening = document.querySelector('#opening')?.value || '';
  const reason = document.querySelector('#reason')?.value || '';
  const question = document.querySelector('#question')?.value.trim() || 'What else would I need to know?';
  const answer = `${opening} ${reason} I’d still ask: ${question}`;
  const preview = document.querySelector('#answer-text');
  const receipt = document.querySelector('#receipt-answer-text');
  if (preview) preview.textContent = answer;
  if (receipt) receipt.textContent = `${opening} ${reason}`;
}

function showStage(index, focus = true) {
  current = index;
  stages.forEach((stage, i) => {
    const isActive = i === current;
    stage.hidden = !isActive;
    stage.classList.toggle('active', isActive);
  });
  steps.forEach((step, i) => {
    step.classList.toggle('active', i === current);
    step.classList.toggle('done', i < current);
    step.setAttribute('aria-current', i === current ? 'step' : 'false');
  });
  count.textContent = `STEP ${current + 1} OF 5`;
  back.disabled = current === 0;
  next.innerHTML = `${nextLabels[current]} <span aria-hidden="true">${current === 4 ? '↺' : '→'}</span>`;
  progress.textContent = current === 4 ? 'You made the trail. Keep the question alive.' : `${stageLabels[current]}. There isn’t a right click.`;
  if (current === 4) {
    document.querySelector('#receipt-think').textContent = thinking;
    document.querySelector('#receipt-evidence').textContent = evidence;
    updateAnswer();
  }
  saveProgress();
  if (focus) document.querySelector('.stage.active')?.focus();
}

function resetMission() {
  try { sessionStorage.removeItem(storageKey); } catch { /* no saved mission to clear */ }
  current = 0;
  thinking = defaultThinking;
  evidence = defaultEvidence;
  thinkChoice = '';
  evidenceChoice = document.querySelector('[data-evidence]')?.dataset.evidence || '';
  setAnswerValues(defaultAnswer);
  document.querySelector('#think-note').textContent = 'Choose the question that pulls at you.';
  document.querySelector('#check-note').textContent = 'A first clue is already linked. You can compare the others too.';
  restoreSelections();
  updateAnswer();
  showStage(0);
}

next.addEventListener('click', () => current === 4 ? resetMission() : showStage(current + 1));
back.addEventListener('click', () => showStage(Math.max(0, current - 1)));
restart.addEventListener('click', resetMission);
steps.forEach((step) => step.addEventListener('click', () => showStage(Number(step.dataset.step))));

document.querySelectorAll('[data-think]').forEach((choice) => choice.addEventListener('click', () => {
  thinkChoice = choice.dataset.think;
  thinking = `You noticed: “${thinkChoice}”`;
  restoreSelections();
  document.querySelector('#think-note').textContent = `You chose: “${thinkChoice}” That’s a useful place to begin.`;
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
  evidenceChoice = card.dataset.evidence;
  evidence = evidenceChoice;
  restoreSelections();
  document.querySelector('#check-note').textContent = `Linked: ${evidence}`;
  document.querySelector('#evidence-path').animate([{ opacity: .15, strokeDashoffset: 30 }, { opacity: 1, strokeDashoffset: 0 }], { duration: 520, easing: 'ease-out' });
  saveProgress();
}));

document.querySelector('#answer-builder').addEventListener('input', () => { updateAnswer(); saveProgress(); });
document.querySelector('#answer-builder').addEventListener('change', () => { updateAnswer(); saveProgress(); });
copyReceipt.addEventListener('click', async () => {
  const answer = document.querySelector('#receipt-answer-text').textContent;
  try {
    await navigator.clipboard.writeText(answer);
    receiptStatus.textContent = 'Working answer copied.';
  } catch {
    receiptStatus.textContent = 'Copy is unavailable here — you can select the working answer above.';
  }
});
printReceipt.addEventListener('click', () => window.print());

setAnswerValues({
  opening: savedProgress?.opening || defaultAnswer.opening,
  reason: savedProgress?.reason || defaultAnswer.reason,
  question: savedProgress?.question || defaultAnswer.question
});
restoreSelections();
updateAnswer();
showStage(Math.min(Math.max(current, 0), stages.length - 1), false);
