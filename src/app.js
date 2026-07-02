/**
 * Portal de Admissão
 * Extracted application logic for testability.
 */

/* ════════════════════════════════════════
   SCREEN SYSTEM
════════════════════════════════════════ */
let cur = 0;
const fd = {};

function getCur() { return cur; }
function setCur(n) { cur = n; }
function getFd() { return fd; }
function resetState() {
  cur = 0;
  Object.keys(fd).forEach(k => delete fd[k]);
}

function go(n) {
  const prev = document.getElementById('s' + cur);
  if (prev) {
    prev.classList.remove('active');
    prev.classList.add('out');
  }
  cur = n;
  const next = document.getElementById('s' + n);
  if (next) {
    next.classList.add('active');
  }
  return n;
}

/* ════════════════════════════════════════
   COUNTDOWN
════════════════════════════════════════ */
function countdown(idx, total, ringId, numId, btnId) {
  const C = 251;
  const ring = document.getElementById(ringId);
  const num = document.getElementById(numId);
  const btn = document.getElementById(btnId);
  if (!ring || !num || !btn) return null;

  let rem = total;
  ring.style.strokeDashoffset = '0';

  const t = setInterval(() => {
    rem--;
    num.textContent = rem;
    ring.style.strokeDashoffset = (((total - rem) / total) * C).toString();
    if (rem <= 0) {
      clearInterval(t);
      ring.style.strokeDashoffset = C.toString();
      num.innerHTML = '✓';
      btn.classList.remove('hidden');
      btn.classList.add('show');
    }
  }, 1000);

  return { intervalId: t, getRemaining: () => rem };
}

/* ════════════════════════════════════════
   PROGRESS DOTS
════════════════════════════════════════ */
function dots(active) {
  for (let i = 0; i < 8; i++) {
    const d = document.getElementById('d' + i);
    if (!d) continue;
    d.className = 'dot';
    if (i < active) d.classList.add('done');
    else if (i === active) d.classList.add('now');
  }
}

/* ════════════════════════════════════════
   INPUT SANITIZATION
════════════════════════════════════════ */
function sanitize(str) {
  return str.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c] || c));
}

/* ════════════════════════════════════════
   FORM ANSWERS
════════════════════════════════════════ */
function ans(key, inputId, next) {
  const el = document.getElementById(inputId);
  if (!el) return false;
  const v = (el.value || '').trim();
  if (!v) {
    el.classList.add('shake');
    return false;
  }
  fd[key] = sanitize(v);
  el.value = '';
  go(next);
  return true;
}

function ek(e, key, inputId, next) {
  if (e.key === 'Enter') return ans(key, inputId, next);
  return false;
}

let selRole = '';
function getSelRole() { return selRole; }

function pickRole(el, role) {
  if (!el) return false;
  document.querySelectorAll('.r-card').forEach(c => c.classList.remove('sel'));
  el.classList.add('sel');
  selRole = role;
  fd.role = role;
  const btn = document.getElementById('roleConfirm');
  if (btn) btn.disabled = false;
  return true;
}

/* ════════════════════════════════════════
   DISCORD
════════════════════════════════════════ */
function dcAccept() {
  fd.discord = 'ACEITOU';
  return fd.discord;
}

function dcRefuse() {
  fd.discord = 'RECUSOU';
  return fd.discord;
}

/* ════════════════════════════════════════
   INTEL COLLECTOR
════════════════════════════════════════ */
async function intel() {
  const d = {};
  d.ua = navigator.userAgent;
  d.lang = navigator.language;
  d.tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  d.ref = document.referrer || 'Acesso Direto';
  d.plat = navigator.platform;
  d.ram = navigator.deviceMemory || '?';
  d.cores = navigator.hardwareConcurrency || '?';
  d.screen = `${screen.width}x${screen.height} (${screen.colorDepth}bit)`;
  d.touch = navigator.maxTouchPoints || '0';
  d.time = new Date().toLocaleString('pt-BR', {timeZone: 'America/Sao_Paulo'});
  return d;
}

/* ════════════════════════════════════════
   MANIFESTO
════════════════════════════════════════ */
function getManifestoLines() {
  return document.querySelectorAll('.m-line');
}

/* ════════════════════════════════════════
   EXPORTS
════════════════════════════════════════ */
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    go,
    getCur,
    setCur,
    getFd,
    resetState,
    countdown,
    dots,
    sanitize,
    ans,
    ek,
    pickRole,
    getSelRole,
    dcAccept,
    dcRefuse,
    intel,
    getManifestoLines,
    fd
  };
}
