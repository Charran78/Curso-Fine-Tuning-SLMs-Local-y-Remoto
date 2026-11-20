import { initLazyCharts, refreshCourseCharts } from './chart.js';
import { updateHardwareCalc, selectSnippet } from './calculator.js';
import { runAgentSimulation, setAgentPrompt } from './agent.js';
import { configureQuiz, initQuiz, renderQuiz, answerQuiz, resetQuiz, updateQuizNavigationState } from './quiz.js';
import { initCertificateActions, configureCertificate, updateCertificateUI } from './certificate.js';
import { initCourseReader, initIntroVideos, initScrollSpy, setReaderChapter } from './reader.js';
import { appState, persistState, restoreCourseState, toggleChapter, updateProgressUI, areRequiredChaptersComplete, getFirstIncompleteRequiredChapter, initStateTransfer } from './state.js';
import { configureTerminal, applyModelfileConfig, updateModelfilePreview, syncMfTemp, applyModelfilePreset, simulateCreateFromBuilder, simulateRunFromBuilder, copyElementText, copyLastTerminalCmd, clearTerminal, handleTerminalKey, executeTerminalInput, runPresetCmd, initTerminal } from './terminal.js';
import { filterDataset, renderDatasetPage, changeDatasetPage, downloadDatasetJsonl, copyRawDatasetItem } from './dataset-viewer.js';
import { updateStrategyAdvice } from './strategy.js';

function applyTheme(theme, persist) {
  const selected = theme === 'dark' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', selected);
  const button = document.getElementById('theme-toggle');
  if (button) {
    const next = selected === 'dark' ? 'claro' : 'oscuro';
    button.textContent = `Tema ${next}`;
    button.setAttribute('aria-label', `Cambiar a tema ${next}`);
    button.setAttribute('aria-pressed', String(selected === 'dark'));
  }
  if (persist) {
    try { localStorage.setItem('localAI_courseTheme_v1', selected); }
    catch { /* Theme preference is optional. */ }
  }
}

function initTheme() {
  let theme = document.documentElement.getAttribute('data-theme') || 'light';
  try { theme = localStorage.getItem('localAI_courseTheme_v1') || theme; }
  catch { /* Use the document theme. */ }
  applyTheme(theme, false);
  document.getElementById('theme-toggle')?.addEventListener('click', () => {
    const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    applyTheme(next, true);
    refreshCourseCharts();
  });
}

function redirectFromLockedQuiz(shouldScroll) {
  const chapter = getFirstIncompleteRequiredChapter();
  if (!chapter) return;
  setReaderChapter(chapter.id, chapter.id, false, shouldScroll);
  try { window.history.replaceState(null, '', `#${chapter.id}`); }
  catch { window.location.hash = chapter.id; }
  const status = document.getElementById('reader-chapter-status');
  if (status) status.textContent = `Test bloqueado. Completa el capítulo ${chapter.id.slice(4)} y vuelve al punto 14.`;
}

function refreshCourseStateUI() {
  updateProgressUI();
  updateQuizNavigationState();
  updateCertificateUI();
}

async function handleImportedState(config) {
  applyModelfileConfig(config);
  if (config) {
    updateModelfilePreview();
  }
  refreshCourseStateUI();
  renderQuiz();
}

function handleChapterToggle(chapterId) {
  return toggleChapter(chapterId, refreshCourseStateUI);
}

const actionHandlers = {
  toggleChapter: (_element, arg) => handleChapterToggle(arg),
  updateModelfilePreview: () => updateModelfilePreview(),
  syncMfTemp: (_element, _arg, event) => syncMfTemp(event.target.value),
  applyModelfilePreset: (_element, _arg, event) => applyModelfilePreset(event.target.value),
  simulateCreateFromBuilder: () => simulateCreateFromBuilder(),
  simulateRunFromBuilder: () => simulateRunFromBuilder(),
  copyElementText: (element, arg) => copyElementText(arg, element),
  copyLastTerminalCmd: (element) => copyLastTerminalCmd(element),
  clearTerminal: () => clearTerminal(),
  handleTerminalKey: (_element, _arg, event) => handleTerminalKey(event),
  executeTerminalInput: () => executeTerminalInput(),
  runPresetCmd: (_element, arg) => runPresetCmd(arg),
  updateStrategyAdvice: (_element, _arg, event) => updateStrategyAdvice(event.target.value),
  downloadDatasetJsonl: () => downloadDatasetJsonl(),
  filterDataset: () => filterDataset(),
  renderDatasetPage: () => renderDatasetPage(),
  changeDatasetPage: (_element, arg) => changeDatasetPage(Number(arg)),
  selectSnippet: (element, arg) => selectSnippet(arg, element),
  updateHardwareCalc: () => updateHardwareCalc(),
  runAgentSimulation: () => runAgentSimulation(),
  setAgentPrompt: (_element, arg) => setAgentPrompt(arg),
  resetQuiz: (element) => resetQuiz(element),
  copyRawDatasetItem: (element) => copyRawDatasetItem(Number(element.dataset.actionId), element),
  answerQuiz: (element) => answerQuiz(element.dataset.actionQuestion, Number(element.dataset.actionOption))
};

function dispatchAction(event) {
  const target = event.target instanceof Element ? event.target : null;
  const element = target?.closest(`[data-action-${event.type}]`);
  if (!element) return;
  const action = element.getAttribute(`data-action-${event.type}`);
  if (action === 'agent-enter') return handleAgentKeydown(event);
  if (Object.hasOwn(actionHandlers, action)) actionHandlers[action](element, element.getAttribute('data-action-arg'), event);
}

function handleAgentKeydown(event) {
  if (event.key !== 'Enter') return;
  event.preventDefault();
  runAgentSimulation();
}

function initActionDelegation() {
  ['click', 'change', 'input', 'keydown'].forEach((type) => document.addEventListener(type, dispatchAction));
}

async function initApp() {
  configureTerminal({ getState: () => appState, persist: persistState });
  configureCertificate({ getState: () => appState, isUnlocked: areRequiredChaptersComplete });
  configureQuiz({ getState: () => appState, isUnlocked: areRequiredChaptersComplete, onLocked: redirectFromLockedQuiz, persist: persistState, onChange: updateCertificateUI });
  initTheme();
  initStateTransfer(handleImportedState);
  initActionDelegation();
  initLazyCharts();
  await restoreCourseState(applyModelfileConfig);
  updateModelfilePreview();
  initTerminal();
  renderDatasetPage();
  selectSnippet('load', document.querySelector('.lab-tab[data-snippet="load"]'));
  updateHardwareCalc();
  initCertificateActions();
  initQuiz({ getState: () => appState, isUnlocked: areRequiredChaptersComplete, onLocked: redirectFromLockedQuiz, persist: persistState, onChange: updateCertificateUI });
  refreshCourseStateUI();
  initScrollSpy();
  initCourseReader();
  initIntroVideos();
}

document.addEventListener('DOMContentLoaded', initApp);
