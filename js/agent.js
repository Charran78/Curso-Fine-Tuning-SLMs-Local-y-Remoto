import { calculateExpression } from './calculator.js';

const WEATHER_WORDS = ['tiempo', 'clima', 'temperatura'];
const CITIES = ['Barcelona', 'Valencia', 'Sevilla', 'Bilbao'];
const DIRECT_ANSWER = 'Un Modelfile es el archivo de configuración declarativo de Ollama que define el modelo base (FROM), parámetros (PARAMETER) y personalidad (SYSTEM).';

function requestedCity(query) {
  const normalized = query.toLowerCase();
  return CITIES.find((city) => normalized.includes(city.toLowerCase())) || 'Madrid';
}

function isWeatherQuery(query) {
  const normalized = query.toLowerCase();
  return WEATHER_WORDS.some((word) => normalized.includes(word));
}

function formatWeatherTrace(query) {
  const city = requestedCity(query);
  const call = JSON.stringify({ name: 'get_weather', arguments: { city } }, null, 2);
  return `[1] Usuario -> "${query}"\n[2] Qwen3-4B-toolcalling detecta intención ->\n<tool_call>\n${call}\n</tool_call>\n` +
    `[3] Python ejecuta get_weather("${city}") -> "El tiempo en ${city} es soleado, 22°C."\n` +
    `[4] Respuesta final al usuario -> "Actualmente en ${city} hace sol con 22°C."`;
}

function queryExpression(query) {
  const match = query.match(/[0-9+\-*/().\s]{3,}/);
  return match ? match[0].trim() : '25 * 4';
}

function formatCalculationTrace(query) {
  const expression = queryExpression(query);
  const call = JSON.stringify({ name: 'calculate', arguments: { expression } }, null, 2);
  const result = calculateExpression(expression);
  return `[1] Usuario -> "${query}"\n[2] Qwen3-4B-toolcalling detecta operación matemática ->\n<tool_call>\n${call}\n</tool_call>\n` +
    `[3] Python ejecuta calculate("${expression}") -> "Resultado: ${result}"\n` +
    `[4] Respuesta final al usuario -> "El resultado de ${expression} es ${result}."`;
}

export function buildAgentTrace(query) {
  if (isWeatherQuery(query)) return formatWeatherTrace(query);
  if (/[0-9]+\s*[+\-*/]\s*[0-9]+/.test(query) || query.toLowerCase().includes('calcula')) return formatCalculationTrace(query);
  return `[1] Usuario -> "${query}"\n[2] Qwen3-4B evalúa el contexto -> Ninguna herramienta externa necesaria (abstención correcta).\n[3] Respuesta directa -> "${DIRECT_ANSWER}"`;
}

export function runAgentSimulation() {
  const input = document.getElementById('agent-input');
  const trace = document.getElementById('agent-trace');
  if (!input || !trace || !input.value.trim()) return;
  trace.textContent = buildAgentTrace(input.value.trim());
}

export function setAgentPrompt(text) {
  const input = document.getElementById('agent-input');
  if (!input) return;
  input.value = text;
  runAgentSimulation();
}
