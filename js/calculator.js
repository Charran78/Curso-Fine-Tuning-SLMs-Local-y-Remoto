import { UNSLOTH_SNIPPETS } from './data.js';

export function calculateExpression(expression) {
  const compact = expression.replace(/\s+/g, '');
  const tokens = compact.match(/\d+(?:\.\d+)?|[()+*/-]/g);
  if (!tokens || tokens.join('') !== compact) return 'Expresión no válida';
  try {
    const cursor = { index: 0 };
    const value = parseSum(tokens, cursor);
    return cursor.index === tokens.length && Number.isFinite(value) ? String(value) : 'Error de cálculo';
  } catch {
    return 'Error de cálculo';
  }
}

function parseSum(tokens, cursor) {
  let value = parseProduct(tokens, cursor);
  while (tokens[cursor.index] === '+' || tokens[cursor.index] === '-') {
    const operator = tokens[cursor.index++];
    const right = parseProduct(tokens, cursor);
    value = operator === '+' ? value + right : value - right;
  }
  return value;
}

function parseProduct(tokens, cursor) {
  let value = parseAtom(tokens, cursor);
  while (tokens[cursor.index] === '*' || tokens[cursor.index] === '/') {
    const operator = tokens[cursor.index++];
    const right = parseAtom(tokens, cursor);
    value = operator === '*' ? value * right : value / right;
  }
  return value;
}

function parseAtom(tokens, cursor) {
  if (tokens[cursor.index] === '-') {
    cursor.index++;
    return -parseAtom(tokens, cursor);
  }
  if (tokens[cursor.index] === '(') {
    cursor.index++;
    const value = parseSum(tokens, cursor);
    if (tokens[cursor.index++] !== ')') throw new Error('Paréntesis sin cerrar');
    return value;
  }
  const token = tokens[cursor.index++];
  if (!token || !/^\d/.test(token)) throw new Error('Número no válido');
  return Number(token);
}

export function calculateHardware({ rank, sequence, batch, epochs }) {
  const vram = (3.2 + (rank / 16) * 0.4 + (sequence / 2048) * batch * 0.55).toFixed(1);
  const gpuMinutes = Math.max(2, Math.round(epochs * 2.4 * (sequence / 4096) * (2 / Math.min(batch, 2.5))));
  return { vram, effectiveBatch: batch * 4, gpuMinutes, cpuHours: (epochs * 0.65 * (sequence / 4096)).toFixed(1) };
}

function readHardwareInputs() {
  const value = (id, fallback) => Number(document.getElementById(id)?.value || fallback);
  return { rank: value('hp-rank', 16), sequence: value('hp-seq', 4096), batch: value('hp-batch', 2), epochs: value('hp-epochs', 3) };
}

function gpuAdvice(vram) {
  if (Number(vram) <= 6.2) return 'Apto para GPUs de 6–8 GB (RTX 3060/4060) y Colab T4 (16 GB)';
  if (Number(vram) <= 10.5) return 'Requiere GPU ≥8–12 GB o Colab T4 (16 GB)';
  return 'Recomendado RTX 4070/4080 (12+ GB) o Colab T4';
}

export function updateHardwareCalc() {
  const result = calculateHardware(readHardwareInputs());
  const outputs = {
    'calc-vram': result.vram + ' GB', 'calc-gpu-note': gpuAdvice(result.vram),
    'calc-batch-eff': String(result.effectiveBatch), 'calc-time-gpu': '~' + result.gpuMinutes + ' min',
    'calc-time-cpu': 'Ruta fallback CPU: ~' + result.cpuHours + ' horas (FP32)'
  };
  Object.entries(outputs).forEach(([id, text]) => {
    const element = document.getElementById(id);
    if (element) element.textContent = text;
  });
}

export function selectSnippet(key, button) {
  const snippet = UNSLOTH_SNIPPETS[key];
  if (!snippet) return;
  const title = document.getElementById('snippet-title');
  const code = document.getElementById('snippet-code');
  if (title) title.textContent = snippet.title;
  if (code) code.textContent = snippet.code;
  document.querySelectorAll('.lab-tab[data-snippet]').forEach((tab) => tab.classList.remove('is-active'));
  if (button) button.classList.add('is-active');
}
