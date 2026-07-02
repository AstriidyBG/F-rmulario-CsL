/**
 * Sombra Coletiva — Portal de Admissão
 * Extracted application logic for testability.
 */

/* ════════════════════════════════════════
   THEME SYSTEM
════════════════════════════════════════ */
const themes = {
  red:    { r:'--red:#cc0020', rd:'--red-dim:#7a0012', pl:'--purple-l:#8b3fc0', gold:'--gold:#b89a0c', cv:[204,0,32] },
  purple: { r:'--red:#8b00cc', rd:'--red-dim:#500080', pl:'--purple-l:#cc66ff', gold:'--gold:#8b3fc0', cv:[139,0,204] },
  blue:   { r:'--red:#0066cc', rd:'--red-dim:#003d7a', pl:'--purple-l:#4da6ff', gold:'--gold:#00ccff', cv:[0,102,204] },
  green:  { r:'--red:#00aa33', rd:'--red-dim:#006620', pl:'--purple-l:#33ff77', gold:'--gold:#aaff00', cv:[0,170,51] },
  gold:   { r:'--red:#cc9900', rd:'--red-dim:#7a5c00', pl:'--purple-l:#ffcc44', gold:'--gold:#ffdd00', cv:[204,153,0] }
};

function parseThemePairs(th) {
  const pairs = {};
  [th.r, th.rd, th.pl, th.gold].forEach(s => {
    const [k, v] = s.split(':');
    pairs[k.trim()] = v.trim();
  });
  return pairs;
}

function applyTheme(t) {
  const th = themes[t];
  if (!th) return false;
  const root = document.documentElement.style;
  const pairs = parseThemePairs(th);
  Object.entries(pairs).forEach(([k, v]) => root.setProperty(k, v));
  if (typeof window._setCanvasAccent === 'function') {
    window._setCanvasAccent(...th.cv);
  }
  const menu = document.getElementById('themeMenu');
  if (menu) menu.classList.remove('open');
  return true;
}

function toggleTheme() {
  const menu = document.getElementById('themeMenu');
  if (menu) menu.classList.toggle('open');
}

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
  const C = 226;
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
      num.innerHTML = '<span style="font-size:1.1rem">✓</span>';
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
  fd[key] = v;
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
   SLAYKTTY INJECTION
════════════════════════════════════════ */
function injectSK(sid) {
  const ct = document.getElementById('sk' + sid);
  if (!ct || ct.children.length > 0) return false;
  const tpl = document.getElementById('skTpl');
  if (!tpl || !tpl.content) return false;
  const clone = tpl.content.cloneNode(true);
  const svg = clone.querySelector('svg');
  if (sid === 10) { svg.style.width = '80px'; svg.style.height = 'auto'; }
  else if (sid === 11) { svg.style.width = '130px'; svg.style.height = 'auto'; }
  ct.appendChild(clone);
  return true;
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
  d.time = new Date().toLocaleString('pt-BR');
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
    themes,
    parseThemePairs,
    applyTheme,
    toggleTheme,
    go,
    getCur,
    setCur,
    getFd,
    resetState,
    countdown,
    dots,
    ans,
    ek,
    pickRole,
    getSelRole,
    dcAccept,
    dcRefuse,
    injectSK,
    intel,
    getManifestoLines,
    fd
  };
}
