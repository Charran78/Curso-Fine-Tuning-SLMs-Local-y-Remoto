import { MODELFILE_PRESETS } from './data.js';

let appState = { modelfileConfig: null };
let persist = () => {};
let simulatedModels = ['gemma3:4b (2.5 GB)', 'qwen3:4b-instruct-2507 (2.6 GB)'];
let lastTerminalCommand = 'ollama pull gemma3:4b';

export function configureTerminal(options) {
  appState = options.getState();
  persist = options.persist;
}

export function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
}

export function appendTerminalLine(htmlContent) {
  const output = document.getElementById('terminal-output');
  if (!output) return;
  const line = document.createElement('div');
  line.innerHTML = htmlContent;
  output.append(line);
  output.scrollTop = output.scrollHeight;
}

export function buildModelfileString() {
  const value = (id, fallback) => document.getElementById(id)?.value ?? fallback;
  const base = value('mf-base', 'gemma3:4b');
  const temp = value('mf-temp', '0.3');
  const context = value('mf-ctx', '4096');
  const system = value('mf-system', '').trim();
  return `# Plano generado para Ollama\nFROM ${base}\n\nPARAMETER temperature ${temp}\nPARAMETER top_p 0.9\nPARAMETER num_ctx ${context}\nPARAMETER repeat_penalty 1.1\n\nSYSTEM """\n${system}\n"""`;
}

export function updateModelfilePreview() {
  const name = renderModelfilePreview();
  appState.modelfileConfig = {
    name, base: document.getElementById('mf-base')?.value || 'gemma3:4b',
    temp: document.getElementById('mf-temp')?.value || '0.3', ctx: document.getElementById('mf-ctx')?.value || '4096',
    system: document.getElementById('mf-system')?.value || ''
  };
  persist();
}

function renderModelfilePreview() {
  const name = document.getElementById('mf-name')?.value.trim() || 'mi-modelo';
  const label = document.getElementById('mf-filename-label');
  const code = document.getElementById('mf-preview-code');
  if (label) label.textContent = `${name}.modelfile`;
  if (code) code.textContent = buildModelfileString();
  return name;
}

export function applyModelfileConfig(config) {
  const values = config || { name: 'asesor-financiero', base: 'gemma3:4b', temp: '0.3', ctx: '4096', system: '' };
  const fields = { 'mf-name': values.name, 'mf-base': values.base, 'mf-temp': values.temp, 'mf-ctx': values.ctx, 'mf-system': values.system };
  Object.entries(fields).forEach(([id, value]) => {
    const field = document.getElementById(id);
    if (field) field.value = value;
  });
  const temperature = document.getElementById('mf-temp-val');
  if (temperature) temperature.textContent = values.temp;
  renderModelfilePreview();
}

export function syncMfTemp(value) {
  const label = document.getElementById('mf-temp-val');
  if (label) label.textContent = value;
  updateModelfilePreview();
}

export function applyModelfilePreset(key) {
  const system = document.getElementById('mf-system');
  const name = document.getElementById('mf-name');
  if (system && MODELFILE_PRESETS[key]) system.value = MODELFILE_PRESETS[key];
  const names = { fiscal: 'asesor-financiero', codigo: 'code-assistant', odoo: 'odoo-experto' };
  if (name && names[key]) name.value = names[key];
  updateModelfilePreview();
}

function showTerminalHelp() {
  appendTerminalLine('<span class="term-muted">Comandos soportados: ollama --version, ollama pull &lt;modelo&gt;, ollama list, ollama create &lt;nombre&gt; -f &lt;archivo&gt;, ollama run &lt;modelo&gt;, ollama show &lt;modelo&gt; --modelfile, ollama ps, ollama stop &lt;modelo&gt;, ollama rm &lt;modelo&gt;</span>');
}

function handlePullCommand(command) {
  const model = command.slice(12).trim() || 'gemma3:4b';
  appendTerminalLine(`pulling manifest...\npulling 72c3a9f810d4... 100% [================] 2.5 GB\nverifying sha256 digest...\nwriting manifest...\n<span class="term-ok">success: ${escapeHtml(model)} listo en local.</span>`);
  if (!simulatedModels.some((item) => item.startsWith(model))) simulatedModels.push(`${model} (2.5 GB)`);
}

function showSimulatedModels() {
  const rows = simulatedModels.map((model) => `${model}      a8f102c94b1e    Hace un momento`).join('\n');
  appendTerminalLine(`<span class="term-muted">NAME                              ID              SIZE      MODIFIED\n${escapeHtml(rows)}</span>`);
}

function handleCreateCommand(command) {
  const name = command.split(/\s+/)[2] || 'asesor-financiero';
  appendTerminalLine(`gathering model components...\nusing existing layer sha256:72c3a9f810d4\ncreating new layer system prompt &amp; parameters...\nwriting manifest...\n<span class="term-ok">success: modelo "${escapeHtml(name)}" creado correctamente.</span>`);
  if (!simulatedModels.some((model) => model.startsWith(name))) simulatedModels.unshift(`${name}:latest (2.5 GB)`);
}

function handleRunCommand(command) {
  const target = command.slice(11).trim() || 'asesor-financiero';
  const response = target.includes('code')
    ? 'Para unir dos DataFrames en pandas usa pd.merge(df1, df2, on="clave", how="inner") y añade un assert sobre merged.shape para validarlo.'
    : target.includes('odoo')
      ? 'En Odoo, la orden de venta confirma el acuerdo comercial; la factura es el documento fiscal que se genera desde ella mediante "Crear factura".'
      : 'El modelo 303 corresponde a la autoliquidación trimestral del IVA y el modelo 130 al pago fraccionado del IRPF en estimación directa.';
  appendTerminalLine(`<span class="term-muted">&gt;&gt;&gt; Consulta de prueba enviada a ${escapeHtml(target)}...</span>\n<span class="term-ok">${escapeHtml(response)}</span>`);
}

function handleRemoveCommand(command) {
  const model = command.slice(10).trim();
  simulatedModels = simulatedModels.filter((item) => !item.startsWith(model));
  appendTerminalLine(`<span class="term-warn">deleted '${escapeHtml(model)}'</span>`);
}

export function processOllamaCommand(rawCommand) {
  const command = rawCommand.trim();
  if (!command) return;
  lastTerminalCommand = command;
  appendTerminalLine(`<span class="term-cmd">$ ${escapeHtml(command)}</span>`);
  const lower = command.toLowerCase();
  if (lower === 'help' || lower === 'ollama help') return showTerminalHelp();
  if (lower === 'ollama --version') return appendTerminalLine('<span class="term-ok">ollama version is 0.6.8 (motor llama.cpp activo)</span>');
  if (lower.startsWith('ollama pull ')) return handlePullCommand(command);
  if (lower === 'ollama list') return showSimulatedModels();
  if (lower.startsWith('ollama create ')) return handleCreateCommand(command);
  if (lower.startsWith('ollama run ')) return handleRunCommand(command);
  if (lower.startsWith('ollama show ')) return appendTerminalLine(`<span class="term-muted">${escapeHtml(buildModelfileString())}</span>`);
  if (lower === 'ollama ps') return appendTerminalLine('<span class="term-muted">NAME                  ID              SIZE      PROCESSOR    UNTIL\nasesor-financiero     9d2a1b448e01    2.7 GB    100% GPU     4 minutes from now</span>');
  if (lower.startsWith('ollama stop ')) return appendTerminalLine('<span class="term-ok">Modelo descargado de la memoria RAM/VRAM.</span>');
  if (lower.startsWith('ollama rm ')) return handleRemoveCommand(command);
  appendTerminalLine('<span class="term-warn">Comando no reconocido en el simulador. Escribe "help" o usa los botones rápidos.</span>');
}

export function runPresetCmd(command) {
  const input = document.getElementById('terminal-input');
  if (input) input.value = command;
  processOllamaCommand(command);
}

export function executeTerminalInput() {
  const input = document.getElementById('terminal-input');
  if (!input) return;
  processOllamaCommand(input.value);
  input.value = '';
}

export function handleTerminalKey(event) {
  if (event.key !== 'Enter') return;
  event.preventDefault();
  executeTerminalInput();
}

export function clearTerminal() {
  const output = document.getElementById('terminal-output');
  if (output) output.innerHTML = '<span class="term-muted">Terminal lista. Prueba "ollama pull gemma3:4b" o "ollama list".</span>';
}

export function simulateCreateFromBuilder() {
  const name = document.getElementById('mf-name')?.value.trim() || 'asesor-financiero';
  processOllamaCommand(`ollama create ${name} -f ${name}.modelfile`);
}

export function simulateRunFromBuilder() {
  const name = document.getElementById('mf-name')?.value.trim() || 'asesor-financiero';
  processOllamaCommand(`ollama run ${name}`);
}

function fallbackCopy(text) {
  const field = document.createElement('textarea');
  field.className = 'clipboard-fallback';
  field.value = text;
  document.body.append(field);
  field.select();
  try { document.execCommand('copy'); }
  catch { /* Clipboard fallback may be blocked by browser policy. */ }
  finally { field.remove(); }
}

function flashCopiedButton(button) {
  if (!button) return;
  const label = button.textContent;
  button.classList.add('is-copied');
  button.textContent = 'Copiado';
  window.setTimeout(() => {
    button.classList.remove('is-copied');
    button.textContent = label;
  }, 1400);
}

export async function copyStringToClipboard(text, button) {
  try {
    if (!navigator.clipboard?.writeText) throw new Error('Clipboard API no disponible');
    await navigator.clipboard.writeText(text);
  } catch {
    fallbackCopy(text);
  }
  flashCopiedButton(button);
}

export function copyElementText(id, button) {
  const element = document.getElementById(id);
  if (element) copyStringToClipboard(element.textContent, button);
}

export function copyLastTerminalCmd(button) {
  copyStringToClipboard(lastTerminalCommand, button);
}

export function initTerminal() {
  clearTerminal();
}
