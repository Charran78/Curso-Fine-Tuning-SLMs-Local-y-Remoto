import { areRequiredChaptersComplete, getFirstIncompleteRequiredChapter } from './state.js';
import { resizeCourseCharts } from './chart.js';

export function decodeReaderTarget(hash) {
  try { return document.getElementById(decodeURIComponent(hash.slice(1))); }
  catch { return null; }
}

function setReaderHash(hash, method = 'pushState') {
  try { window.history[method](null, '', hash); }
  catch { window.location.hash = hash.slice(1); }
}

function setReaderCover(updateHash, shouldScroll) {
  const reader = document.getElementById('course-reader');
  const cover = document.getElementById('prologo');
  if (!reader || !cover) return;
  reader.querySelectorAll('.chapter-section, .course-part').forEach((element) => { element.hidden = true; });
  cover.hidden = false;
  reader.classList.add('is-showing-cover');
  document.querySelectorAll('.aside-link, .mobile-toc-list a').forEach((link) => {
    link.classList.remove('is-active');
    link.removeAttribute('aria-current');
  });
  const status = document.getElementById('reader-chapter-status');
  if (status) status.textContent = 'Portada del curso';
  setReaderPager(reader, -1, 0);
  if (updateHash && window.location.hash !== '#prologo') setReaderHash('#prologo');
  if (shouldScroll) scrollToReaderTarget(reader, cover);
}

function setReaderPager(reader, index, count) {
  const previous = reader.querySelector('[data-reader-step="-1"]');
  const next = reader.querySelector('[data-reader-step="1"]');
  if (previous) previous.disabled = index <= 0;
  if (next) next.disabled = index < 0 || index >= count - 1;
}

function scrollToReaderTarget(reader, target) {
  if (window.matchMedia('(max-width: 900px)').matches) target.scrollIntoView({ block: 'start' });
  else reader.scrollTop = target === reader ? 0 : reader.scrollTop + target.getBoundingClientRect().top - reader.getBoundingClientRect().top;
}

function showReaderChapter(reader, chapters, chapter, activePart) {
  const cover = document.getElementById('prologo');
  if (cover) cover.hidden = true;
  reader.classList.remove('is-showing-cover');
  chapters.forEach((item) => {
    item.hidden = item !== chapter;
    const part = item.closest('.course-part');
    if (part) part.hidden = part !== activePart;
  });
  resizeCourseCharts();
}

function updateReaderNavigation(chapterId, index, count) {
  document.querySelectorAll('.aside-link, .mobile-toc-list a').forEach((link) => {
    const active = link.getAttribute('href') === `#${chapterId}`;
    link.classList.toggle('is-active', active);
    if (active) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });
  const status = document.getElementById('reader-chapter-status');
  if (status) status.textContent = `Capítulo ${index + 1} de ${count}`;
}

function updateChapterHash(chapterId, targetId) {
  const hash = `#${targetId || chapterId}`;
  if (window.location.hash !== hash) setReaderHash(hash);
}

function scrollToChapterTarget(reader, targetId, chapter, activePart) {
  let target = document.getElementById(targetId || chapter.id) || chapter;
  if (window.matchMedia('(max-width: 900px)').matches) {
    if (target === chapter && activePart) target = activePart;
    target.scrollIntoView({ block: 'start' });
  } else if (target === chapter || target === activePart) reader.scrollTop = 0;
  else reader.scrollTop += target.getBoundingClientRect().top - reader.getBoundingClientRect().top;
}

function redirectFromLockedQuiz(shouldScroll) {
  const missing = getFirstIncompleteRequiredChapter();
  if (!missing) return;
  setReaderChapter(missing.id, missing.id, false, shouldScroll);
  setReaderHash(`#${missing.id}`, 'replaceState');
  const status = document.getElementById('reader-chapter-status');
  if (status) status.textContent = `Test bloqueado. Completa el capítulo ${missing.id.slice(4)} y vuelve al punto 14.`;
}

export function setReaderChapter(chapterId, targetId, updateHash, shouldScroll) {
  const reader = document.getElementById('course-reader');
  const chapter = document.getElementById(chapterId);
  if (!reader || !chapter || !chapter.classList.contains('chapter-section')) return;
  if (chapter.hasAttribute('data-quiz-gated') && !areRequiredChaptersComplete()) return redirectFromLockedQuiz(shouldScroll);
  const chapters = [...reader.querySelectorAll('.chapter-section')];
  const activePart = chapter.closest('.course-part');
  const index = chapters.indexOf(chapter);
  showReaderChapter(reader, chapters, chapter, activePart);
  updateReaderNavigation(chapterId, index, chapters.length);
  setReaderPager(reader, index, chapters.length);
  if (updateHash) updateChapterHash(chapterId, targetId);
  if (shouldScroll) scrollToChapterTarget(reader, targetId, chapter, activePart);
}

function chapterForTarget(target) {
  if (target.classList.contains('chapter-section')) return target;
  const closest = target.closest('.chapter-section');
  if (closest) return closest;
  return target.classList.contains('course-part') ? target.querySelector('.chapter-section') : null;
}

function syncReaderFromHash(shouldScroll) {
  const hash = window.location.hash.slice(1);
  if (!hash || hash === 'prologo') return setReaderCover(false, shouldScroll);
  const target = decodeReaderTarget(window.location.hash);
  const chapter = target && chapterForTarget(target);
  const fallback = chapter || document.getElementById('cap-1');
  if (fallback) setReaderChapter(fallback.id, target && target !== fallback ? target.id : fallback.id, false, shouldScroll);
}

function handleCourseReaderLink(event) {
  const eventTarget = event.target instanceof Element ? event.target : null;
  const link = eventTarget?.closest('a[href^="#"]');
  if (!link) return;
  const targetId = link.getAttribute('href').slice(1);
  const target = targetId ? decodeReaderTarget(`#${targetId}`) : null;
  if (!target) return;
  if (target.id === 'prologo') {
    event.preventDefault();
    setReaderCover(true, true);
    return;
  }
  const chapter = chapterForTarget(target);
  if (!chapter) return;
  event.preventDefault();
  const toc = link.closest('.mobile-toc');
  if (toc) toc.open = false;
  setReaderChapter(chapter.id, target.id, true, true);
}

function handleReaderPagerClick(event, reader) {
  const eventTarget = event.target instanceof Element ? event.target : null;
  const button = eventTarget?.closest('[data-reader-step]');
  if (!button || button.disabled) return;
  const chapters = [...reader.querySelectorAll('.chapter-section')];
  const active = reader.querySelector('.chapter-section:not([hidden])');
  const nextIndex = chapters.indexOf(active) + Number(button.getAttribute('data-reader-step'));
  if (chapters[nextIndex]) setReaderChapter(chapters[nextIndex].id, chapters[nextIndex].id, true, true);
}

export function initCourseReader() {
  const reader = document.getElementById('course-reader');
  if (!reader) return;
  document.addEventListener('click', handleCourseReaderLink);
  reader.querySelector('.chapter-pager')?.addEventListener('click', (event) => handleReaderPagerClick(event, reader));
  window.addEventListener('hashchange', () => syncReaderFromHash(true));
  window.addEventListener('popstate', () => syncReaderFromHash(true));
  syncReaderFromHash(Boolean(window.location.hash));
}

function createVideoFallback(slot, id) {
  const title = slot.getAttribute('data-video-title') || 'este vídeo';
  const fallback = document.createElement('p');
  const link = document.createElement('a');
  fallback.className = 'intro-video-fallback';
  fallback.append(document.createTextNode(
    window.location.protocol === 'file:'
      ? 'file:// no envía HTTP Referer; YouTube lo requiere y puede mostrar el error 153. '
      : '¿No se reproduce? '
  ));
  link.href = `https://www.youtube.com/watch?v=${id}`;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  link.textContent = 'Abrir en YouTube (se abre en una pestaña nueva)';
  link.setAttribute('aria-label', `Abrir ${title} en YouTube (se abre en una pestaña nueva)`);
  fallback.append(link);
  return fallback;
}

function loadIntroVideo(slot, observer) {
  if (!slot.open || (observer && slot.dataset.videoVisible !== 'true') || slot.querySelector('iframe')) return;
  const id = slot.getAttribute('data-youtube-id') || '';
  if (!/^[A-Za-z0-9_-]{11}$/.test(id)) return;
  const frame = slot.querySelector('.intro-video-frame');
  const iframe = document.createElement('iframe');
  const badge = slot.querySelector('.video-status');
  iframe.loading = 'lazy';
  iframe.title = slot.getAttribute('data-video-title') || 'Vídeo introductorio del curso';
  iframe.src = `https://www.youtube.com/embed/${id}?rel=0&modestbranding=1`;
  iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
  iframe.allowFullscreen = true;
  iframe.referrerPolicy = 'strict-origin-when-cross-origin';
  iframe.addEventListener('load', () => {
    if (!badge) return;
    badge.textContent = 'Iframe cargado; reproducción no verificada.';
    badge.classList.add('is-available');
  }, { once: true });
  if (badge) badge.textContent = 'Cargando reproductor…';
  frame.replaceChildren(iframe);
  frame.insertAdjacentElement('afterend', createVideoFallback(slot, id));
}

export function initIntroVideos() {
  let observer = null;
  if (typeof IntersectionObserver !== 'undefined') {
    observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const slot = entry.target.closest('.intro-video');
        if (!slot) return;
        slot.dataset.videoVisible = String(entry.isIntersecting);
        loadIntroVideo(slot, observer);
      });
    }, { threshold: 0.15 });
  }
  document.querySelectorAll('.intro-video').forEach((slot) => {
    slot.addEventListener('toggle', () => loadIntroVideo(slot, observer));
    const frame = slot.querySelector('.intro-video-frame');
    if (frame) observer?.observe(frame);
  });
}

export function initScrollSpy() {
  if (typeof IntersectionObserver === 'undefined') return;
  const observer = new IntersectionObserver((entries) => {
    entries.filter((entry) => entry.isIntersecting).forEach((entry) => {
      document.querySelectorAll('.aside-link').forEach((link) => {
        const active = link.getAttribute('data-nav') === entry.target.id;
        link.classList.toggle('is-active', active);
        if (active) link.setAttribute('aria-current', 'page');
        else link.removeAttribute('aria-current');
      });
    });
  }, { threshold: 0.15, rootMargin: '-10% 0px -65% 0px' });
  document.querySelectorAll('.chapter-section').forEach((chapter) => observer.observe(chapter));
}
