let ChartCtor = null;
let chartLoadPromise;
let chartObserver = null;
const courseCharts = [];

export function initLazyCharts() {
  const canvases = document.querySelectorAll('.chart-canvas-wrap');
  if (!canvases.length) return;
  if (typeof IntersectionObserver === 'undefined') { loadAndRenderCharts(); return; }
  chartObserver = new IntersectionObserver((entries) => {
    if (!entries.some((entry) => entry.isIntersecting)) return;
    chartObserver.disconnect();
    loadAndRenderCharts();
  }, { root: document.getElementById('course-reader'), threshold: 0.1 });
  canvases.forEach((canvas) => chartObserver.observe(canvas));
}

async function loadAndRenderCharts() {
  if (await loadCharts()) { initModelsChart(); initEvaluationChart(); }
}

export async function loadCharts() {
  if (ChartCtor) return true;
  if (!chartLoadPromise) chartLoadPromise = new Promise((resolve) => {
    let settled = false;
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/chart.js@4.5.1/dist/chart.umd.min.js';
    script.async = true;
    const timeout = window.setTimeout(() => finish(false), 8000);
    const finish = (loaded) => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timeout);
      ChartCtor = loaded ? window.Chart || null : null;
      resolve(Boolean(ChartCtor));
    };
    script.onload = () => finish(true);
    script.onerror = () => finish(false);
    document.head.append(script);
  });
  const loaded = await chartLoadPromise;
  if (!loaded) showChartFallback();
  return loaded;
}

function showChartFallback() {
  document.querySelectorAll('.chart-canvas-wrap').forEach((wrap) => {
    if (wrap.querySelector('.chart-unavailable')) return;
    const note = document.createElement('p');
    note.className = 'chart-unavailable';
    note.setAttribute('role', 'status');
    note.textContent = 'Los gráficos no están disponibles porque no se pudo cargar Chart.js. El contenido del curso sigue disponible.';
    wrap.append(note);
  });
}

function chartPalette() {
  const styles = getComputedStyle(document.documentElement);
  return Object.fromEntries(['data-1', 'data-2', 'data-3', 'data-context', 'outline-variant', 'on-surface']
    .map((token) => [token, styles.getPropertyValue('--' + token).trim()]));
}

function withAlpha(color, alpha) {
  const channels = color.match(/^#([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i);
  return channels ? 'rgba(' + channels.slice(1).map((part) => parseInt(part, 16)).join(', ') + ', ' + alpha + ')' : color;
}

export function initModelsChart() {
  if (!ChartCtor) return;
  const colors = chartPalette();
  const context = document.getElementById('models-context-chart');
  const radar = document.getElementById('models-radar-chart');
  if (context) courseCharts.push(new ChartCtor(context.getContext('2d'), contextChartConfig(colors)));
  if (radar) courseCharts.push(new ChartCtor(radar.getContext('2d'), radarChartConfig(colors)));
}

function contextChartConfig(colors) {
  return {
    type: 'bar',
    data: { labels: ['Qwen3 4B (Tool Calling)', 'Ministral 3B (Tool Calling)', 'Phi-3.5-mini (3.8B)', 'Gemma3:4b (Base)', 'Nemotron-Mini 4B (Func)'],
      datasets: [{ label: 'Ventana de contexto (K tokens)', data: [256, 128, 128, 8, 4], backgroundColor: [colors['data-1'], colors['data-2'], colors['data-context'], colors['data-3'], colors['data-context']], borderWidth: 0 }] },
    options: { indexAxis: 'y', responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false }, tooltip: { callbacks: { label: (ctx) => ctx.parsed.x + 'K tokens de contexto nativo' } } },
      scales: { x: { beginAtZero: true, grid: { color: colors['outline-variant'] }, ticks: { color: colors['on-surface'], callback: (value) => value + 'K' } },
        y: { grid: { display: false }, ticks: { color: colors['on-surface'] } } } }
  };
}

function radarChartConfig(colors) {
  return {
    type: 'radar',
    data: { labels: ['Contexto', 'Tool calling', 'Licencia', 'Eficiencia VRAM', 'Calidad español'], datasets: [
      { label: 'Gemma 3', data: [4, 3, 2, 3, 4], borderColor: colors['data-1'], backgroundColor: withAlpha(colors['data-1'], 0.16), pointBackgroundColor: colors['data-1'], borderWidth: 2 },
      { label: 'Qwen 3', data: [5, 5, 5, 3, 4], borderColor: colors['data-2'], backgroundColor: withAlpha(colors['data-2'], 0.14), pointBackgroundColor: colors['data-2'], borderWidth: 2 },
      { label: 'Ministral', data: [4, 4, 4, 4, 4], borderColor: colors['data-3'], backgroundColor: withAlpha(colors['data-3'], 0.12), pointBackgroundColor: colors['data-3'], borderWidth: 2 }] },
    options: { responsive: true, maintainAspectRatio: false,
      plugins: { tooltip: { callbacks: { label: (ctx) => ctx.dataset.label + ': ' + ctx.formattedValue + '/5 (rúbrica orientativa, no benchmark)' } }, legend: { labels: { color: colors['on-surface'] } } },
      scales: { r: { min: 0, max: 5, ticks: { stepSize: 1, color: colors['on-surface'], backdropColor: 'transparent' },
        grid: { color: colors['outline-variant'] }, angleLines: { color: colors['outline-variant'] }, pointLabels: { color: colors['on-surface'] } } } }
  };
}

export function initEvaluationChart() {
  const canvas = document.getElementById('eval-loss-chart');
  if (!canvas || !ChartCtor) return;
  courseCharts.push(new ChartCtor(canvas.getContext('2d'), evaluationChartConfig(chartPalette())));
}

function evaluationChartConfig(colors) {
  return {
    type: 'line', data: { labels: ['Baseline / época 0', 'Época 1', 'Época 2', 'Época 3'], datasets: [
      { label: 'Pre-FT · referencia demo', data: [1.82, 1.82, 1.82, 1.82], borderColor: colors['data-2'], backgroundColor: colors['data-2'], borderDash: [6, 4], pointRadius: 4, tension: 0.25 },
      { label: 'Post-FT · valores demo ficticios', data: [1.82, 1.42, 1.18, 1.10], borderColor: colors['data-1'], backgroundColor: colors['data-1'], pointRadius: 4, tension: 0.25 }] },
    options: { responsive: true, maintainAspectRatio: false,
      plugins: { tooltip: { callbacks: { label: (ctx) => ctx.dataset.label + ': ' + ctx.formattedValue + ' (ilustrativo)' } }, legend: { labels: { color: colors['on-surface'] } } },
      scales: { x: { grid: { color: colors['outline-variant'] }, ticks: { color: colors['on-surface'] } },
        y: { beginAtZero: false, title: { display: true, text: 'eval_loss (demo)', color: colors['on-surface'] }, grid: { color: colors['outline-variant'] }, ticks: { color: colors['on-surface'] } } } }
  };
}

export function refreshCourseCharts() {
  courseCharts.forEach((chart) => chart.destroy());
  courseCharts.length = 0;
  if (ChartCtor) { initModelsChart(); initEvaluationChart(); }
}

export function resizeCourseCharts() {
  courseCharts.forEach((chart) => chart.resize());
}
