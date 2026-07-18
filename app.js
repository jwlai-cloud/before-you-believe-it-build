const stages = [...document.querySelectorAll('.stage')];
const steps = [...document.querySelectorAll('.path-step')];
const next = document.querySelector('#next');
const back = document.querySelector('#back');
const count = document.querySelector('#step-count');
const progress = document.querySelector('#progress-message');
const restart = document.querySelector('#restart');
let current = 0;
let thinking = 'A question about whether the land would really be untouched.';
let evidence = 'Floating platforms still need energy, materials and maintenance.';

const stageLabels = ['Meet the claim', 'Find the hidden assumption', 'Compare evidence', 'Build your answer', 'Read your receipt'];
const nextLabels = ['Push back', 'Check it', 'Make an answer', 'See receipt', 'Start again'];

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
  if (focus) document.querySelector('.stage.active')?.focus();
}

next.addEventListener('click', () => showStage(current === 4 ? 0 : current + 1));
back.addEventListener('click', () => showStage(Math.max(0, current - 1)));
restart.addEventListener('click', () => showStage(0));
steps.forEach((step) => step.addEventListener('click', () => showStage(Number(step.dataset.step))));

document.querySelectorAll('[data-think]').forEach((choice) => choice.addEventListener('click', () => {
  document.querySelectorAll('[data-think]').forEach((item) => item.classList.remove('selected'));
  choice.classList.add('selected');
  const question = choice.dataset.think;
  thinking = `You noticed: “${question}”`;
  document.querySelector('#think-note').textContent = `You chose: “${question}” That’s a useful place to begin.`;
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
  document.querySelectorAll('[data-evidence]').forEach((item) => item.classList.remove('chosen'));
  card.classList.add('chosen');
  evidence = card.dataset.evidence;
  document.querySelector('#check-note').textContent = `Linked: ${evidence}`;
  document.querySelector('#evidence-path').animate([{opacity:.15, strokeDashoffset:30}, {opacity:1, strokeDashoffset:0}], {duration:520, easing:'ease-out'});
}));

document.querySelector('#answer-builder').addEventListener('input', updateAnswer);
document.querySelector('#answer-builder').addEventListener('change', updateAnswer);
showStage(0, false);
