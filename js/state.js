import { REQUIRED_CHAPTER_IDS } from './data.js';
import { isValidQuizAnswer } from './quiz.js';

export const STORAGE_KEY = 'localAI_courseState_v1';
export const appState = { completedChapters: [], quizAnswers: {}, modelfileConfig: null };
const MAX_TRANSFER_BYTES = 512 * 1024;
const CONFIG_LIMITS = { name: 80, base: 120, temp: 10, ctx: 10, system: 400000 };

export function sanitizeCourseState(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const completed = Array.isArray(value.completedChapters) ? value.completedChapters : [];
  const answers = value.quizAnswers && typeof value.quizAnswers === 'object' ? value.quizAnswers : {};
  return {
    completedChapters: [...new Set(completed.filter((id) => REQUIRED_CHAPTER_IDS.includes(id)))],
    quizAnswers: Object.fromEntries(Object.entries(answers).filter(([id, answer]) => isValidQuizAnswer(id, answer))),
    modelfileConfig: sanitizeConfig(value.modelfileConfig)
  };
}

function sanitizeConfig(config) {
  if (config == null) return null;
  if (typeof config !== 'object' || Array.isArray(config)) return null;
  if (Object.keys(config).sort().join(',') !== 'base,ctx,name,system,temp') return null;
  if (Object.entries(CONFIG_LIMITS).some(([field, limit]) => typeof config[field] !== 'string' || config[field].length > limit)) return null;
  return Object.fromEntries(Object.keys(CONFIG_LIMITS).map((field) => [field, config[field]]));
}

export function getSafeApi() {
  return {
    async getAppState() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? sanitizeCourseState(JSON.parse(raw)) : null;
      } catch { return null; }
    },
    async setAppState(state) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(sanitizeCourseState(state)));
        return true;
      } catch {
        return false;
      }
    }
  };
}

export async function persistState() {
  return getSafeApi().setAppState(appState);
}

export async function restoreCourseState(onRestored = () => {}) {
  try {
    const saved = await getSafeApi().getAppState();
    if (!saved) return;
    Object.assign(appState, saved);
    onRestored(saved.modelfileConfig);
  } catch { /* Start with a clean state when storage is unavailable. */ }
}

export function getFirstIncompleteRequiredChapter() {
  const id = REQUIRED_CHAPTER_IDS.find((chapterId) => !appState.completedChapters.includes(chapterId));
  return id ? document.getElementById(id) : null;
}

export function areRequiredChaptersComplete() {
  return REQUIRED_CHAPTER_IDS.every((id) => appState.completedChapters.includes(id));
}

export function updateProgressUI() {
  const completed = new Set(appState.completedChapters);
  const count = REQUIRED_CHAPTER_IDS.filter((id) => completed.has(id)).length;
  const percent = REQUIRED_CHAPTER_IDS.length ? Math.round(count / REQUIRED_CHAPTER_IDS.length * 100) : 0;
  updateProgressBubble(count, percent);
  updateCompletionButtons(completed);
}

function updateProgressBubble(count, percent) {
  const bubble = document.getElementById('progress-bubble');
  const label = document.getElementById('progress-bubble-percent');
  const next = getFirstIncompleteRequiredChapter();
  if (bubble) {
    const destination = next ? `Ir al capítulo ${next.id.slice(4)}` : 'Ir al punto 14, test final';
    bubble.href = next ? `#${next.id}` : '#cap-14';
    bubble.setAttribute('aria-label', `Progreso del curso: ${count} de ${REQUIRED_CHAPTER_IDS.length} capítulos completados (${percent} %). ${destination}.`);
    bubble.title = `${count} de ${REQUIRED_CHAPTER_IDS.length} capítulos obligatorios · ${destination}`;
    bubble.style.setProperty('--progress', `${percent}%`);
  }
  if (label) label.textContent = `${percent}%`;
}

function updateCompletionButtons(completed) {
  document.querySelectorAll('.btn-complete').forEach((button) => {
    const chapterId = button.getAttribute('data-chapter');
    const isDone = completed.has(chapterId);
    button.classList.toggle('is-done', isDone);
    button.textContent = isDone ? 'Completado' : 'Marcar completado';
    const check = document.querySelector(`[data-check="${chapterId}"]`);
    if (check) check.textContent = isDone ? '[OK]' : '';
  });
}

export async function toggleChapter(chapterId, onUpdated = () => {}) {
  const chapter = document.getElementById(chapterId);
  if (!chapter || chapter.getAttribute('data-required') !== 'true') return;
  const index = appState.completedChapters.indexOf(chapterId);
  if (index === -1) appState.completedChapters.push(chapterId);
  else appState.completedChapters.splice(index, 1);
  updateProgressUI();
  onUpdated();
  await persistState();
}

export function validateTransferText(text) {
  if (new TextEncoder().encode(text).byteLength > MAX_TRANSFER_BYTES) throw new Error('Archivo superior a 512 KiB.');
  let payload;
  try { payload = JSON.parse(text); } catch { throw new Error('JSON no válido.'); }
  if (!payload || Object.keys(payload).sort().join(',') !== 'exportedAt,state,version' || payload.version !== 1 || typeof payload.exportedAt !== 'string' || !Number.isFinite(Date.parse(payload.exportedAt))) throw new Error('Se requiere una exportación JSON v1 con fecha válida.');
  const state = payload.state;
  if (!state || typeof state !== 'object' || Array.isArray(state) || Object.keys(state).sort().join(',') !== 'completedChapters,modelfileConfig,quizAnswers') throw new Error('El estado debe contener solo completedChapters, quizAnswers y modelfileConfig.');
  if (!Array.isArray(state.completedChapters) || state.completedChapters.some((id) => !REQUIRED_CHAPTER_IDS.includes(id)) || new Set(state.completedChapters).size !== state.completedChapters.length) throw new Error('Hay IDs de capítulo desconocidos o duplicados.');
  if (!state.quizAnswers || typeof state.quizAnswers !== 'object' || Array.isArray(state.quizAnswers) || Object.entries(state.quizAnswers).some(([id, answer]) => !isValidQuizAnswer(id, answer))) throw new Error('Hay preguntas u opciones inválidas.');
  const config = state.modelfileConfig === null ? null : sanitizeConfig(state.modelfileConfig);
  if (state.modelfileConfig !== null && !config) throw new Error('Configuración Modelfile no válida o demasiado extensa.');
  return { completedChapters: [...state.completedChapters], quizAnswers: { ...state.quizAnswers }, modelfileConfig: config };
}

export function buildStateExportPayload(state, exportedAt = new Date().toISOString()) {
  const clean = sanitizeCourseState(state);
  if (!clean) throw new Error('No se pudo preparar el estado del curso.');
  return { version: 1, exportedAt, state: clean };
}

let pendingImport = null;

function updateTransferPreview(message) {
  const status = document.getElementById('state-transfer-status');
  if (status) status.textContent = message;
}

function setTransferButtons(enabled) {
  const apply = document.getElementById('state-import-apply');
  const cancel = document.getElementById('state-import-cancel');
  if (apply) apply.disabled = !enabled;
  if (cancel) cancel.disabled = !enabled;
}

async function previewStateImport(file) {
  if (!file) {
    pendingImport = null;
    updateTransferPreview('No se ha seleccionado ningún archivo.');
    setTransferButtons(false);
    return;
  }
  if (file.size > MAX_TRANSFER_BYTES) {
    pendingImport = null;
    updateTransferPreview('Archivo demasiado grande (máximo 512 KiB).');
    setTransferButtons(false);
    return;
  }
  try {
    pendingImport = validateTransferText(await file.text());
    const config = pendingImport.modelfileConfig;
    const modelfile = config ? `Modelfile incluido; system prompt de ${config.system.length} caracteres` : 'sin Modelfile';
    updateTransferPreview(`Vista previa v1: ${pendingImport.completedChapters.length}/13 capítulos, ${Object.keys(pendingImport.quizAnswers).length}/12 respuestas guardadas, ${modelfile}.`);
    setTransferButtons(true);
  } catch (error) {
    pendingImport = null;
    updateTransferPreview(`No se puede importar: ${error.message}`);
    setTransferButtons(false);
  }
}

async function applyStateImport(onImported) {
  if (!pendingImport || !window.confirm('Importar reemplazará el progreso, las respuestas y la configuración Modelfile guardados en este origen. ¿Continuar?')) return;
  const nextState = { ...pendingImport };
  const saved = await getSafeApi().setAppState(nextState);
  if (!saved) {
    updateTransferPreview('No se aplicó la importación: el navegador no pudo guardar el estado local. El progreso actual se conserva.');
    return;
  }
  Object.assign(appState, nextState);
  onImported(pendingImport.modelfileConfig);
  updateTransferPreview('Importación aplicada y guardada en este origen. El tema no se transfiere.');
  pendingImport = null;
  setTransferButtons(false);
}

function cancelStateImport(input) {
  pendingImport = null;
  if (input) input.value = '';
  setTransferButtons(false);
  updateTransferPreview('Importación cancelada.');
}

export function initStateTransfer(onImported) {
  const input = document.getElementById('state-import-file');
  const apply = document.getElementById('state-import-apply');
  const cancel = document.getElementById('state-import-cancel');
  if (input) input.addEventListener('change', () => previewStateImport(input.files?.[0]));
  if (apply) apply.addEventListener('click', () => applyStateImport(onImported));
  if (cancel) cancel.addEventListener('click', () => cancelStateImport(input));
}
