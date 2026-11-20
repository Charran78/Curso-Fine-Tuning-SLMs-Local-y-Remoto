import { DATASET_200 } from './data.js';

const PAGE_SIZE = 10;
let filteredDataset = DATASET_200.slice();
let currentPage = 1;

export function formatPairForMode(item, mode) {
  if (mode === 'jsonl') return JSON.stringify({ messages: [{ role: 'user', content: item.user }, { role: 'assistant', content: item.assistant }] });
  if (mode === 'gemma') return `<start_of_turn>user\n${item.user}<end_of_turn>\n<start_of_turn>model\n${item.assistant}<end_of_turn>`;
  return '';
}

export function matchesDatasetItem(item, query, domain) {
  if (domain !== 'all' && item.domain !== domain) return false;
  const normalized = query.trim().toLowerCase();
  return !normalized || item.user.toLowerCase().includes(normalized) || item.assistant.toLowerCase().includes(normalized);
}

export function paginateDataset(items, page, pageSize = PAGE_SIZE) {
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const safePage = Math.min(totalPages, Math.max(1, page));
  const start = (safePage - 1) * pageSize;
  return { items: items.slice(start, start + pageSize), page: safePage, totalPages, start, end: Math.min(items.length, start + pageSize) };
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
}

function readFilters() {
  const query = document.getElementById('ds-search')?.value || '';
  const domain = document.getElementById('ds-domain')?.value || 'all';
  return { query, domain };
}

export function filterDataset() {
  const { query, domain } = readFilters();
  filteredDataset = DATASET_200.filter((item) => matchesDatasetItem(item, query, domain));
  currentPage = 1;
  renderDatasetPage();
}

export function changeDatasetPage(delta) {
  currentPage += delta;
  renderDatasetPage();
}

function datasetMarkup(item, mode) {
  const contextTag = item.variant === 1 ? '<span class="tag is-warn">Contextualizado</span>' : '';
  const heading = `<div class="qa-card-head"><div class="qa-card-labels"><span class="mono-label">PAR #${item.id}</span><span class="tag">${escapeHtml(item.domainLabel)}</span>${contextTag}</div>`;
  const copy = `<button type="button" class="btn btn-ghost dataset-copy" data-action-click="copyRawDatasetItem" data-action-id="${item.id}" aria-label="Copiar el ejemplo QA ${item.id} como JSONL">Copiar JSONL</button></div>`;
  const content = mode === 'chat' ? datasetChatPair(item) : datasetCodePair(item, mode);
  return `<div class="qa-card">${heading}${copy}${content}</div>`;
}

function datasetChatPair(item) {
  return `<div class="qa-bubble-user"><span class="mono-label">USER</span><div>${escapeHtml(item.user)}</div></div>` +
    `<div class="qa-bubble-assistant"><span class="mono-label">ASSISTANT</span><div>${escapeHtml(item.assistant)}</div></div>`;
}

function datasetCodePair(item, mode) {
  return `<pre class="code-body dataset-code">${escapeHtml(formatPairForMode(item, mode))}</pre>`;
}

function updateDatasetCounts(total) {
  const training = total >= 10 ? Math.round(total * 0.9) : total;
  const values = { 'ds-count-total': total, 'ds-count-train': training, 'ds-count-eval': total - training };
  Object.entries(values).forEach(([id, value]) => {
    const element = document.getElementById(id);
    if (element) element.textContent = String(value);
  });
}

function updateDatasetControls(total, page, totalPages, start, end) {
  const info = document.getElementById('ds-page-info');
  const previous = document.getElementById('ds-prev-btn');
  const next = document.getElementById('ds-next-btn');
  if (info) info.textContent = `Página ${page} de ${totalPages} · Mostrando ${total ? start + 1 : 0}–${end} de ${total}`;
  if (previous) previous.disabled = page <= 1;
  if (next) next.disabled = page >= totalPages;
}

export function renderDatasetPage() {
  const pageData = paginateDataset(filteredDataset, currentPage);
  currentPage = pageData.page;
  updateDatasetCounts(filteredDataset.length);
  const mode = document.getElementById('ds-view-mode')?.value || 'chat';
  const list = document.getElementById('ds-list');
  if (list) list.innerHTML = pageData.items.length
    ? pageData.items.map((item) => datasetMarkup(item, mode)).join('')
    : '<div class="callout is-warn"><div class="callout-title">Sin resultados</div><p>Ningún par QA coincide con tu búsqueda. Limpia el filtro de texto o cambia de dominio.</p></div>';
  updateDatasetControls(filteredDataset.length, pageData.page, pageData.totalPages, pageData.start, pageData.end);
}

function notifyCopied(button) {
  if (!button) return;
  const label = button.textContent;
  button.textContent = 'Copiado';
  button.classList.add('is-copied');
  window.setTimeout(() => {
    button.textContent = label;
    button.classList.remove('is-copied');
  }, 1400);
}

export async function copyRawDatasetItem(id, button) {
  const item = DATASET_200.find((entry) => entry.id === id);
  if (!item) return;
  const text = formatPairForMode(item, 'jsonl');
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const field = document.createElement('textarea');
    field.className = 'clipboard-fallback';
    field.value = text;
    document.body.append(field);
    field.select();
    try { document.execCommand('copy'); }
    catch { /* Clipboard fallback may be blocked by browser policy. */ }
    finally { field.remove(); }
  }
  notifyCopied(button);
}

export function downloadDatasetJsonl() {
  const blob = new Blob([filteredDataset.map((item) => formatPairForMode(item, 'jsonl')).join('\n')], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'dataset_200_qa.jsonl';
  link.click();
  URL.revokeObjectURL(url);
}
