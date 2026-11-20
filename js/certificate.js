import { REQUIRED_CHAPTER_IDS, QUIZ_QUESTIONS } from './data.js';
import { isQuizCompletionEligible } from './quiz.js';

let dependencies = { getState: () => ({}), isUnlocked: () => false };
let certificateBackground;
let certificateBackgroundPromise;

export function configureCertificate(options) {
  dependencies = { ...dependencies, ...options };
}

export function normalizeCertificateName(value) {
  return Array.from(String(value || '').normalize('NFC').trim().replace(/\s+/g, ' ')).slice(0, 60).join('');
}

export function isCourseCompletionEligible() {
  const state = dependencies.getState();
  return dependencies.isUnlocked() && isQuizCompletionEligible(state, REQUIRED_CHAPTER_IDS, QUIZ_QUESTIONS);
}

function getToken(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

function certificateNameLines(context, value, maxWidth) {
  const lines = [''];
  let truncated = false;
  for (const character of Array.from(value)) {
    const next = lines[lines.length - 1] + character;
    if (context.measureText(next).width <= maxWidth || !lines[lines.length - 1]) lines[lines.length - 1] = next;
    else if (lines.length < 2) lines.push(character === ' ' ? '' : character);
    else { truncated = true; break; }
  }
  if (truncated) lines[1] = fitEllipsis(context, lines[1], maxWidth);
  return lines;
}

function fitEllipsis(context, value, maxWidth) {
  let line = value.trimEnd();
  while (line && context.measureText(`${line}…`).width > maxWidth) line = line.slice(0, -1);
  return `${line}…`;
}

function loadCertificateBackground() {
  if (certificateBackgroundPromise) return certificateBackgroundPromise;
  certificateBackgroundPromise = new Promise((resolve) => {
    const image = new Image();
    image.addEventListener('load', () => {
      certificateBackground = image;
      renderCertificatePreview();
      resolve(true);
    }, { once: true });
    image.addEventListener('error', () => resolve(false), { once: true });
    image.src = new URL('../assets/FONDO_CERTIFICADO.png', import.meta.url).href;
  });
  return certificateBackgroundPromise;
}

function drawCertificateFrame(context, width, height) {
  const background = getToken('--background');
  const accent = getToken('--primary');
  if (certificateBackground?.complete && certificateBackground.naturalWidth) {
    context.drawImage(certificateBackground, 0, 0, width, height);
  } else {
    context.fillStyle = background;
    context.fillRect(0, 0, width, height);
    context.strokeStyle = accent;
    context.lineWidth = 5;
    context.strokeRect(28, 28, width - 56, height - 56);
    context.fillStyle = accent;
    context.fillRect(58, 58, width - 116, 7);
    context.fillRect(58, height - 65, width - 116, 3);
  }
  context.textAlign = 'center';
}

function drawBlockedCertificate(context, width, canvas) {
  context.font = '600 30px "IBM Plex Sans", Arial, sans-serif';
  context.fillText('Vista previa bloqueada', width / 2, 365);
  context.font = '22px "IBM Plex Sans", Arial, sans-serif';
  context.fillStyle = getToken('--certificate-foreground');
  context.fillText(`Completa ${REQUIRED_CHAPTER_IDS.length}/${REQUIRED_CHAPTER_IDS.length} capítulos y 12/12 respuestas correctas`, width / 2, 412);
  canvas.setAttribute('aria-label', `Vista previa bloqueada; completa los ${REQUIRED_CHAPTER_IDS.length} capítulos obligatorios y responde correctamente las 12 preguntas.`);
}

function drawEligibleCertificate(context, width, canvas) {
  const input = document.getElementById('certificate-name');
  const name = normalizeCertificateName(input?.value) || 'Participante';
  drawCertificateCopy(context, width, name);
  canvas.setAttribute('aria-label', `Vista previa PNG del reconocimiento de finalización para ${name}. No acreditado y sin validez oficial ni profesional.`);
}

function drawCertificateCopy(context, width, name) {
  context.fillStyle = getToken('--certificate-foreground');
  context.font = '600 24px "IBM Plex Sans", Arial, sans-serif';
  context.fillText('RECONOCIMIENTO DE FINALIZACIÓN', width / 2, 150);
  context.font = '700 37px "IBM Plex Sans", Arial, sans-serif';
  context.fillText(document.title, width / 2, 236, width - 150);
  context.font = '24px "IBM Plex Sans", Arial, sans-serif';
  context.fillText('Se reconoce la finalización del curso a', width / 2, 326);
  context.font = '600 46px "IBM Plex Sans", Arial, sans-serif';
  const nameLines = certificateNameLines(context, name, width - 180);
  const firstY = nameLines.length > 1 ? 390 : 410;
  context.fillText(nameLines[0], width / 2, firstY);
  if (nameLines[1]) context.fillText(nameLines[1], width / 2, firstY + 52);
  drawCertificateFooter(context, width);
}

function drawCertificateFooter(context, width) {
  context.font = '24px "IBM Plex Sans", Arial, sans-serif';
  context.fillText(`${REQUIRED_CHAPTER_IDS.length} / ${REQUIRED_CHAPTER_IDS.length} capítulos obligatorios completados · 12 / 12 respuestas correctas`, width / 2, 520);
  context.fillText(`Generado localmente · ${new Date().toLocaleDateString('es-ES')}`, width / 2, 574);
  context.font = '700 18px "IBM Plex Sans", Arial, sans-serif';
  context.fillText('NO ACREDITADO · SIN VALIDEZ OFICIAL NI PROFESIONAL', width / 2, 674, width - 120);
}

export function renderCertificatePreview() {
  const canvas = document.getElementById('certificate-canvas');
  if (!canvas) return;
  loadCertificateBackground();
  const width = 1376;
  const height = 768;
  const scale = Math.min(window.devicePixelRatio || 1, 3);
  canvas.width = width * scale;
  canvas.height = height * scale;
  const context = canvas.getContext('2d');
  if (!context) return;
  context.setTransform(scale, 0, 0, scale, 0, 0);
  drawCertificateFrame(context, width, height);
  if (isCourseCompletionEligible()) drawEligibleCertificate(context, width, canvas);
  else drawBlockedCertificate(context, width, canvas);
}

export function updateCertificateUI() {
  const eligible = isCourseCompletionEligible();
  const courseUrl = getPublicCourseUrl();
  ['certificate-download', 'certificate-share'].forEach((id) => setDisabled(id, !eligible));
  ['certificate-linkedin', 'certificate-x', 'certificate-copy-link'].forEach((id) => setDisabled(id, !eligible || !courseUrl));
  const status = document.getElementById('certificate-status');
  if (status) status.textContent = certificateStatus(eligible, Boolean(courseUrl));
  renderCertificatePreview();
}

function setDisabled(id, disabled) {
  const button = document.getElementById(id);
  if (button) button.disabled = disabled;
}

function certificateStatus(eligible, hasPublicUrl) {
  if (!eligible) return `Bloqueado: completa los ${REQUIRED_CHAPTER_IDS.length} capítulos obligatorios y responde correctamente las 12 preguntas.`;
  if (hasPublicUrl) return `Disponible: has completado los ${REQUIRED_CHAPTER_IDS.length} capítulos obligatorios y respondido correctamente las 12 preguntas.`;
  return 'Reconocimiento disponible. Publica el curso en una URL web para habilitar los enlaces sociales.';
}

function certificateBlobFromDataUrl(dataUrl) {
  const encoded = dataUrl.split(',')[1];
  if (!encoded) throw new Error('No se pudo leer la imagen PNG del canvas.');
  const binary = atob(encoded);
  const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
  return new Blob([bytes], { type: 'image/png' });
}

async function createCertificatePng() {
  if (!isCourseCompletionEligible()) throw new Error('El reconocimiento sigue bloqueado por los requisitos del curso.');
  await loadCertificateBackground();
  if (document.fonts?.ready) await document.fonts.ready;
  renderCertificatePreview();
  const canvas = document.getElementById('certificate-canvas');
  if (!canvas) throw new Error('No se encontró el canvas del reconocimiento.');
  if (typeof canvas.toBlob !== 'function') return certificateBlobFromDataUrl(canvas.toDataURL('image/png'));
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
  return blob || certificateBlobFromDataUrl(canvas.toDataURL('image/png'));
}

function startCertificateDownload(blob) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'reconocimiento-curso.png';
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function setCertificateStatus(message) {
  const status = document.getElementById('certificate-status');
  if (status) status.textContent = message;
}

export async function downloadCompletionPng() {
  if (!isCourseCompletionEligible()) {
    updateCertificateUI();
    return setCertificateStatus(`Descarga bloqueada: completa los ${REQUIRED_CHAPTER_IDS.length} capítulos obligatorios y responde correctamente las 12 preguntas.`);
  }
  try {
    startCertificateDownload(await createCertificatePng());
    setCertificateStatus('Descarga PNG iniciada. La imagen se generó en este dispositivo.');
  } catch (error) { setCertificateStatus(`No se pudo generar o descargar el PNG: ${error.message}`); }
}

async function shareCertificateFile(file, blob) {
  let supported = false;
  let checkError = '';
  try { supported = Boolean(navigator.share && navigator.canShare?.({ files: [file] })); }
  catch (error) { checkError = `No se pudo comprobar la compatibilidad para compartir (${error.message}).`; }
  if (!supported) {
    startCertificateDownload(blob);
    return setCertificateStatus(checkError ? `${checkError} Se descargó el PNG para adjuntarlo manualmente.` : 'Este navegador no admite compartir archivos PNG aquí. Se descargó el archivo; adjúntalo manualmente.');
  }
  try {
    await navigator.share({ files: [file], title: 'Reconocimiento de finalización del curso' });
    setCertificateStatus('Se cerró el menú de compartir; el navegador no confirma si el destinatario recibió la imagen.');
  } catch (error) { handleShareError(error, blob); }
}

function handleShareError(error, blob) {
  if (error.name === 'AbortError') return setCertificateStatus('Compartir cancelado; no se envió ninguna imagen.');
  if (error.name === 'NotAllowedError') {
    startCertificateDownload(blob);
    return setCertificateStatus('El navegador no autorizó compartir. Se descargó el PNG para que puedas adjuntarlo manualmente.');
  }
  setCertificateStatus(`No se pudo compartir el PNG (${error.message}). Puedes descargarlo y adjuntarlo manualmente.`);
}

export async function shareCompletionPng() {
  if (!isCourseCompletionEligible()) {
    updateCertificateUI();
    return setCertificateStatus(`Compartir bloqueado: completa los ${REQUIRED_CHAPTER_IDS.length} capítulos obligatorios y responde correctamente las 12 preguntas.`);
  }
  try {
    const blob = await createCertificatePng();
    if (typeof File !== 'function' || !navigator.share || !navigator.canShare) {
      startCertificateDownload(blob);
      return setCertificateStatus('Este navegador no admite compartir archivos PNG aquí. Se descargó el archivo; adjúntalo manualmente.');
    }
    let file;
    try { file = new File([blob], 'reconocimiento-curso.png', { type: 'image/png' }); }
    catch (error) {
      startCertificateDownload(blob);
      return setCertificateStatus(`No se pudo preparar el archivo para compartir (${error.message}). Se descargó para adjuntarlo manualmente.`);
    }
    await shareCertificateFile(file, blob);
  } catch (error) { setCertificateStatus(`No se pudo preparar la imagen para compartir: ${error.message}`); }
}

export function getPublicCourseUrl() {
  if (!['http:', 'https:'].includes(window.location.protocol)) return null;
  const url = new URL(window.location.href);
  const host = url.hostname.toLowerCase();
  if (!host.includes('.') || host === 'localhost' || /\.(localhost|local|test|invalid|example|internal|home|lan)$/.test(host)) return null;
  if (/^\d{1,3}(?:\.\d{1,3}){3}$/.test(host) || host === 'example.com' || host.endsWith('.example.com')) return null;
  url.search = '';
  url.hash = '';
  return url.href;
}

export function openCourseComposer(network) {
  const url = getPublicCourseUrl();
  if (!url) return setCertificateStatus('Publica el curso en una URL web pública antes de compartirlo; no se enviará ninguna ruta local.');
  const message = `He completado el curso de Fine-Tuning e IA Local con Ollama. Reconocimiento no acreditado. La imagen PNG no se adjunta automáticamente; puedes añadirla manualmente. ${url}`;
  const composer = network === 'linkedin'
    ? `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`
    : `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}`;
  try {
    window.open(composer, '_blank', 'noopener,noreferrer');
    setCertificateStatus(`Se solicitó abrir el compositor de ${network === 'linkedin' ? 'LinkedIn' : 'X'}. Adjunta el PNG manualmente; no se envía automáticamente.`);
  } catch (error) { setCertificateStatus(`No se pudo abrir el compositor (${error.message}). Adjunta el PNG manualmente cuando publiques el curso en una URL pública.`); }
}

export async function copyCourseLink() {
  const url = getPublicCourseUrl();
  if (!url) return setCertificateStatus('Publica el curso en una URL web pública antes de copiar el enlace; no se copiará ninguna ruta local.');
  try {
    if (!navigator.clipboard?.writeText) throw new Error('La API de portapapeles no está disponible.');
    await navigator.clipboard.writeText(url);
    setCertificateStatus('Enlace público del curso copiado.');
  } catch (error) { copyCourseLinkFallback(url, error); }
}

function copyCourseLinkFallback(url, error) {
  const field = document.createElement('textarea');
  field.className = 'clipboard-fallback';
  field.value = url;
  field.setAttribute('readonly', '');
  field.setAttribute('aria-label', 'Enlace público del curso para copiar manualmente');
  let copied = false;
  try {
    document.body.append(field);
    field.select();
    copied = Boolean(document.execCommand && document.execCommand('copy'));
  } catch { /* Fall back to a readable status with the URL. */ }
  finally { field.remove(); }
  setCertificateStatus(copied ? 'Enlace público copiado con el método alternativo del navegador.' : `No se pudo copiar (${error.message}). Cópialo manualmente: ${url}`);
}

export function initCertificateActions() {
  document.getElementById('certificate-download')?.addEventListener('click', downloadCompletionPng);
  document.getElementById('certificate-share')?.addEventListener('click', shareCompletionPng);
  document.getElementById('certificate-linkedin')?.addEventListener('click', () => openCourseComposer('linkedin'));
  document.getElementById('certificate-x')?.addEventListener('click', () => openCourseComposer('x'));
  document.getElementById('certificate-copy-link')?.addEventListener('click', copyCourseLink);
  document.getElementById('certificate-name')?.addEventListener('input', renderCertificatePreview);
}
