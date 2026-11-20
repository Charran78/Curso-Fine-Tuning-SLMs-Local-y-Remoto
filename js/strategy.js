import { STRATEGY_DATA } from './data.js';

export function updateStrategyAdvice(value) {
  const advice = STRATEGY_DATA[value] || STRATEGY_DATA.tone;
  const title = document.getElementById('strategy-title');
  const description = document.getElementById('strategy-desc');
  if (title) title.textContent = advice.title;
  if (description) description.textContent = advice.desc;
}
