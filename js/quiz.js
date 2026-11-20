import { QUIZ_QUESTIONS, REQUIRED_CHAPTER_IDS } from './data.js';

let dependencies = {
  getState: () => ({ quizAnswers: {} }),
  isUnlocked: () => false,
  onLocked: () => {},
  persist: () => {},
  onChange: () => {}
};
let resetTimeout = null;

export function configureQuiz(options) {
  dependencies = { ...dependencies, ...options };
}

export function getQuizScore(answers) {
  return QUIZ_QUESTIONS.reduce((score, question) => score + (answers[question.id] === question.correct ? 1 : 0), 0);
}

export function isQuizCompletionEligible(state, requiredIds = REQUIRED_CHAPTER_IDS, questions = QUIZ_QUESTIONS) {
  if (!Array.isArray(state.completedChapters) || !state.quizAnswers || questions.length !== 12) return false;
  return requiredIds.every((id) => state.completedChapters.includes(id)) && getQuizScore(state.quizAnswers) === questions.length;
}

export function isValidQuizAnswer(questionId, answer) {
  const question = QUIZ_QUESTIONS.find((item) => item.id === questionId);
  return Boolean(question && Number.isInteger(answer) && answer >= 0 && answer < question.options.length);
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
}

function renderOption(question, option, index, chosen, answered) {
  const stateClass = !answered ? '' : index === question.correct ? ' is-correct' : index === chosen ? ' is-wrong' : '';
  const label = String.fromCharCode(65 + index);
  return `<button type="button" class="quiz-opt-btn${stateClass}" data-action-click="answerQuiz" data-action-question="${question.id}" data-action-option="${index}" aria-label="Pregunta ${question.id}, opción ${label}: ${escapeHtml(option)}"><span class="mono-label">${label}</span> <span>${escapeHtml(option)}</span></button>`;
}

function renderFeedback(question, chosen) {
  const correct = chosen === question.correct;
  const status = correct ? 'is-correct' : 'is-wrong';
  return `<div class="quiz-feedback ${status}" role="status"><strong>${correct ? 'Correcto: ' : 'Revisa este punto: '}</strong>${escapeHtml(question.explain)}</div>`;
}

function renderQuestion(question, index, answers) {
  const chosen = answers[question.id];
  const answered = typeof chosen === 'number';
  const options = question.options.map((option, optionIndex) => renderOption(question, option, optionIndex, chosen, answered)).join('');
  const feedback = answered ? renderFeedback(question, chosen) : '';
  return `<div class="quiz-item"><span class="mono-label">PREGUNTA ${index + 1} / ${QUIZ_QUESTIONS.length} · ${escapeHtml(question.part)}</span><div class="quiz-question">${escapeHtml(question.q)}</div><div class="quiz-options">${options}</div>${feedback}</div>`;
}

function updateQuizScore(answers) {
  const score = `${getQuizScore(answers)} / ${QUIZ_QUESTIONS.length}`;
  ['quiz-score-display', 'aside-quiz-score'].forEach((id) => {
    const element = document.getElementById(id);
    if (element) element.textContent = score;
  });
}

export function renderQuiz() {
  const container = document.getElementById('quiz-container');
  if (!container) return;
  const answers = dependencies.getState().quizAnswers || {};
  container.innerHTML = QUIZ_QUESTIONS.map((question, index) => renderQuestion(question, index, answers)).join('');
  updateQuizScore(answers);
  dependencies.onChange();
}

export function updateQuizNavigationState() {
  const unlocked = dependencies.isUnlocked();
  document.querySelectorAll('a[href="#cap-14"], a[href="#bloque-autoevaluacion"]').forEach((link) => {
    link.setAttribute('aria-disabled', String(!unlocked));
    link.setAttribute('aria-label', unlocked ? 'Punto 14: abrir el test final, desbloqueado' :
      `Punto 14: test final bloqueado; completa los ${REQUIRED_CHAPTER_IDS.length} capítulos obligatorios`);
    const label = link.querySelector('[data-quiz-state]');
    if (label) label.textContent = unlocked ? '' : '(bloqueado)';
  });
  const help = document.getElementById('quiz-lock-help');
  if (help) help.textContent = unlocked
    ? 'Desbloqueado: ya puedes responder el test. Los puntos 15 y 16 siguen disponibles como consulta libre.'
    : `Bloqueado: completa y marca como completados los ${REQUIRED_CHAPTER_IDS.length} capítulos obligatorios para desbloquear el test. Los puntos 15 y 16 son de consulta libre.`;
}

export function answerQuiz(questionId, answer) {
  if (!dependencies.isUnlocked()) return dependencies.onLocked(true);
  if (!isValidQuizAnswer(questionId, answer)) return;
  dependencies.getState().quizAnswers[questionId] = answer;
  renderQuiz();
  dependencies.persist();
}

function cancelQuizReset(button, message) {
  if (resetTimeout !== null) window.clearTimeout(resetTimeout);
  resetTimeout = null;
  const reset = button || document.getElementById('quiz-reset-btn');
  if (reset) {
    reset.dataset.armed = 'false';
    reset.textContent = 'Reiniciar test';
    reset.setAttribute('aria-pressed', 'false');
  }
  const status = document.getElementById('quiz-reset-status');
  if (status && message) status.textContent = message;
}

export function resetQuiz(button) {
  if (!dependencies.isUnlocked()) return dependencies.onLocked(true);
  if (button.dataset.armed !== 'true') {
    button.dataset.armed = 'true';
    button.textContent = 'Pulsa otra vez para confirmar';
    button.setAttribute('aria-pressed', 'true');
    const status = document.getElementById('quiz-reset-status');
    if (status) status.textContent = 'Reinicio pendiente. Vuelve a pulsar el botón antes de 3,5 segundos para confirmar.';
    resetTimeout = window.setTimeout(() => cancelQuizReset(button, 'No se confirmó el reinicio; se conservan tus respuestas.'), 3500);
    return;
  }
  cancelQuizReset(button, 'Test reiniciado. Puedes empezar de nuevo.');
  dependencies.getState().quizAnswers = {};
  renderQuiz();
  dependencies.persist();
}

export function initQuiz(options) {
  configureQuiz(options);
  window.addEventListener('pagehide', () => cancelQuizReset(null, 'Confirmación de reinicio cancelada al salir de la página.'));
  renderQuiz();
}
