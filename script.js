'use strict';

const SECURITY_CONFIG = {
  maxAttempts: 5,
  lockoutTime: 300000,
  sessionTimeout: 600000,
  maxInputLength: 100,
  allowedRoles: ['Organizador', 'Recrutador', 'Vigilante', 'Designer', 'Segurança', 'Conselheiro'],
  discordInvite: 'https://discord.gg/GgYCbMAuX'
};

class SecurityManager {
  constructor() {
    this.attempts = 0;
    this.locked = false;
    this.lastAttempt = 0;
  }

  isLocked() {
    if (!this.locked) return false;
    const now = Date.now();
    if (now - this.lastAttempt > SECURITY_CONFIG.lockoutTime) {
      this.locked = false;
      this.attempts = 0;
      return false;
    }
    return true;
  }

  recordAttempt() {
    this.lastAttempt = Date.now();
    this.attempts++;
    if (this.attempts >= SECURITY_CONFIG.maxAttempts) this.locked = true;
  }

  sanitize(input) {
    if (typeof input !== 'string') return '';
    const div = document.createElement('div');
    div.textContent = input;
    return div.innerHTML;
  }

  validateInput(value, minLength = 1, maxLength = SECURITY_CONFIG.maxInputLength) {
    if (typeof value !== 'string') return false;
    const trimmed = value.trim();
    return trimmed.length >= minLength && trimmed.length <= maxLength && !/[<>"'`]/g.test(trimmed);
  }

  validateAge(age) {
    const ageNum = parseInt(age, 10);
    return !isNaN(ageNum) && ageNum >= 13 && ageNum <= 120;
  }
}

const securityManager = new SecurityManager();

(function initCanvas() {
  const canvas = document.getElementById('bgCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let width = canvas.width = window.innerWidth;
  let height = canvas.height = window.innerHeight;
  const particles = Array.from({ length: 90 }, () => ({
    x: Math.random() * 2000, y: Math.random() * 1200,
    vx: (Math.random() - 0.5) * 0.25, vy: -Math.random() * 0.35 - 0.05,
    r: Math.random() * 1.4 + 0.25,
    c: ['#8b0015', '#3d0055', '#1a0028', '#111111'][Math.floor(Math.random() * 4)],
    o: Math.random() * 0.45 + 0.05
  }));
  let accent = [204, 0, 32];
  window._setCanvasAccent = (r, g, b) => { accent = [r, g, b]; };
  function draw() {
    ctx.clearRect(0, 0, width, height);
    ctx.strokeStyle = `rgba(${accent[0]},${accent[1]},${accent[2]},.045)`;
    ctx.lineWidth = 0.5;
    const gridSize = 90;
    for (let x = 0; x < width; x += gridSize) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke(); }
    for (let y = 0; y < height; y += gridSize) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke(); }
    particles.forEach(p => {
      ctx.beginPath(); ctx.arc(p.x % width, p.y % height, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.c; ctx.globalAlpha = p.o; ctx.fill();
      p.x += p.vx; p.y += p.vy;
      if (p.y < -5) { p.y = height + 5; p.x = Math.random() * width; }
    });
    ctx.globalAlpha = 1;
    requestAnimationFrame(draw);
  }
  draw();
  window.addEventListener('resize', () => { width = canvas.width = window.innerWidth; height = canvas.height = window.innerHeight; });
})();

const THEMES = {
  red: { r: '#cc0020', rd: '#7a0012', pl: '#8b3fc0', gold: '#b89a0c', cv: [204, 0, 32] },
  purple: { r: '#8b00cc', rd: '#500080', pl: '#cc66ff', gold: '#8b3fc0', cv: [139, 0, 204] },
  blue: { r: '#0066cc', rd: '#003d7a', pl: '#4da6ff', gold: '#00ccff', cv: [0, 102, 204] },
  green: { r: '#00aa33', rd: '#006620', pl: '#33ff77', gold: '#aaff00', cv: [0, 170, 51] },
  gold: { r: '#cc9900', rd: '#7a5c00', pl: '#ffcc44', gold: '#ffdd00', cv: [204, 153, 0] }
};

function applyTheme(themeName) {
  const theme = THEMES[themeName];
  if (!theme) return;
  const root = document.documentElement.style;
  root.setProperty('--red', theme.r);
  root.setProperty('--red-dim', theme.rd);
  root.setProperty('--purple-l', theme.pl);
  root.setProperty('--gold', theme.gold);
  if (window._setCanvasAccent) window._setCanvasAccent(...theme.cv);
  localStorage.setItem('selectedTheme', themeName);
  closeThemeMenu();
}

function toggleThemeMenu() { document.getElementById('themeMenu')?.classList.toggle('open'); }
function closeThemeMenu() { document.getElementById('themeMenu')?.classList.remove('open'); }

document.getElementById('themeBtn')?.addEventListener('click', toggleThemeMenu);
document.querySelectorAll('.theme-option').forEach(option => {
  option.addEventListener('click', (e) => { applyTheme(e.target.dataset.theme); });
});
document.addEventListener('click', (e) => { if (!e.target.closest('#themeBtn') && !e.target.closest('#themeMenu')) closeThemeMenu(); });

const savedTheme = localStorage.getItem('selectedTheme') || 'red';
applyTheme(savedTheme);

let currentScreen = 0;
const formData = {};
let selectedRole = '';

function goToScreen(n) {
  const prev = document.getElementById(`s${currentScreen}`);
  if (prev) { prev.classList.remove('active'); prev.classList.add('out'); setTimeout(() => prev.classList.remove('out'), 700); }
  currentScreen = n;
  setTimeout(() => {
    const next = document.getElementById(`s${n}`);
    if (next) { next.classList.add('active'); onEnterScreen(n); }
  }, 350);
}

function onEnterScreen(n) {
  if (n === 0) startCountdown(0, 10, 'rf0', 'cn0', 'b0');
  if (n === 1) startCountdown(1, 5, 'rf1', 'cn1', 'b1');
  if (n === 2) manifestoAnimation();
  if (n === 3) startLoadingAnimation();
  if (n >= 4 && n <= 11) injectCharacter(n);
  const dotBar = document.getElementById('dotBar');
  if (n >= 4 && n <= 11) { dotBar.style.display = 'flex'; updateProgressDots(n - 4); } else { dotBar.style.display = 'none'; }
  const inputMap = { 4: 'i_name', 5: 'i_age', 6: 'i_rec', 7: 'i_fam', 8: 'i_app', 9: 'i_id' };
  if (inputMap[n]) setTimeout(() => { document.getElementById(inputMap[n])?.focus(); }, 500);
}

function startCountdown(idx, total, ringId, numId, btnId) {
  const C = 226;
  const ring = document.getElementById(ringId);
  const num = document.getElementById(numId);
  const btn = document.getElementById(btnId);
  let remaining = total;
  if (!ring || !num || !btn) return;
  ring.style.strokeDashoffset = '0';
  const interval = setInterval(() => {
    remaining--;
    num.textContent = remaining;
    ring.style.strokeDashoffset = (((total - remaining) / total) * C).toString();
    if (remaining <= 0) {
      clearInterval(interval);
      ring.style.strokeDashoffset = C.toString();
      num.innerHTML = '<span style="font-size:1.1rem">✓</span>';
      btn.classList.remove('hidden');
      btn.classList.add('show');
    }
  }, 1000);
}

function manifestoAnimation() {
  const lines = document.querySelectorAll('.m-line');
  const footer = document.getElementById('mf');
  lines.forEach(l => l.classList.remove('on'));
  if (footer) footer.classList.remove('on');
  lines.forEach((l, i) => { setTimeout(() => l.classList.add('on'), 350 + i * 620); });
  const after = 350 + lines.length * 620 + 500;
  if (footer) setTimeout(() => footer.classList.add('on'), after);
  setTimeout(() => startCountdown(2, 20, 'rf2', 'cn2', 'b2'), after + 900);
}

function startLoadingAnimation() {
  const phases = ['INICIALIZANDO SISTEMA...', 'VERIFICANDO CREDENCIAIS...', 'CARREGANDO PROTOCOLOS...', 'SINCRONIZANDO REDE...', 'ANALISANDO DISPOSITIVO...', 'VALIDANDO IDENTIDADE...', 'ACESSO CONCEDIDO ✓'];
  const bar = document.getElementById('ldBar');
  const phaseEl = document.getElementById('ldPh');
  const pctEl = document.getElementById('ldPct');
  let progress = 0, phaseIndex = 0;
  const interval = setInterval(() => {
    progress += Math.random() * 2.8 + 0.8;
    if (progress > 100) progress = 100;
    if (bar) bar.style.width = progress + '%';
    if (pctEl) pctEl.textContent = Math.round(progress) + '%';
    const newPhaseIndex = Math.floor((progress / 100) * (phases.length - 1));
    if (newPhaseIndex !== phaseIndex && newPhaseIndex < phases.length) { phaseIndex = newPhaseIndex; if (phaseEl) phaseEl.textContent = phases[phaseIndex]; }
    if (progress >= 100) { clearInterval(interval); setTimeout(() => goToScreen(4), 900); }
  }, 75);
}

function injectCharacter(screenId) {
  const container = document.getElementById(`sk${screenId}`);
  if (!container || container.children.length > 0) return;
  const template = document.getElementById('skTpl');
  if (!template) return;
  const clone = template.content.cloneNode(true);
  const svg = clone.querySelector('svg');
  if (screenId === 10) { svg.style.width = '80px'; svg.style.height = 'auto'; } else if (screenId === 11) { svg.style.width = '130px'; svg.style.height = 'auto'; }
  container.appendChild(clone);
}

function updateProgressDots(active) {
  for (let i = 0; i < 8; i++) {
    const dot = document.getElementById(`d${i}`);
    if (!dot) continue;
    dot.className = 'dot';
    if (i < active) dot.classList.add('done');
    else if (i === active) dot.classList.add('now');
  }
}

function submitAnswer(key, inputId, nextScreen) {
  if (securityManager.isLocked()) { showError(inputId, 'Muitas tentativas. Aguarde alguns minutos.'); return; }
  const inputEl = document.getElementById(inputId);
  if (!inputEl) return;
  const value = inputEl.value.trim();
  let isValid = false;
  if (key === 'name') isValid = securityManager.validateInput(value, 2, 50);
  else if (key === 'age') isValid = securityManager.validateAge(value);
  else isValid = securityManager.validateInput(value, 1, 50);
  if (!isValid) { securityManager.recordAttempt(); shake(inputEl); showError(inputId, 'Entrada inválida'); return; }
  const sanitized = securityManager.sanitize(value);
  formData[key] = sanitized;
  inputEl.value = '';
  goToScreen(nextScreen);
}

function showError(inputId, message) {
  const inputEl = document.getElementById(inputId);
  if (!inputEl) return;
  inputEl.classList.add('shake');
  setTimeout(() => inputEl.classList.remove('shake'), 450);
  const originalBorderColor = inputEl.style.borderBottomColor;
  inputEl.style.borderBottomColor = 'var(--red)';
  setTimeout(() => { inputEl.style.borderBottomColor = originalBorderColor || ''; }, 600);
}

function shake(element) { element.classList.add('shake'); setTimeout(() => element.classList.remove('shake'), 450); }

document.getElementById('i_name')?.addEventListener('keydown', (e) => { if (e.key === 'Enter') submitAnswer('name', 'i_name', 5); });
document.getElementById('i_age')?.addEventListener('keydown', (e) => { if (e.key === 'Enter') submitAnswer('age', 'i_age', 6); });
document.getElementById('i_rec')?.addEventListener('keydown', (e) => { if (e.key === 'Enter') submitAnswer('recruiter', 'i_rec', 7); });
document.getElementById('i_fam')?.addEventListener('keydown', (e) => { if (e.key === 'Enter') submitAnswer('famTime', 'i_fam', 8); });
document.getElementById('i_app')?.addEventListener('keydown', (e) => { if (e.key === 'Enter') submitAnswer('appTime', 'i_app', 9); });
document.getElementById('i_id')?.addEventListener('keydown', (e) => { if (e.key === 'Enter') submitAnswer('userId', 'i_id', 10); });

document.getElementById('btn_name')?.addEventListener('click', () => submitAnswer('name', 'i_name', 5));
document.getElementById('btn_age')?.addEventListener('click', () => submitAnswer('age', 'i_age', 6));
document.getElementById('btn_rec')?.addEventListener('click', () => submitAnswer('recruiter', 'i_rec', 7));
document.getElementById('btn_fam')?.addEventListener('click', () => submitAnswer('famTime', 'i_fam', 8));
document.getElementById('btn_app')?.addEventListener('click', () => submitAnswer('appTime', 'i_app', 9));
document.getElementById('btn_id')?.addEventListener('click', () => submitAnswer('userId', 'i_id', 10));

document.querySelectorAll('.r-card').forEach(card => {
  card.addEventListener('click', () => {
    document.querySelectorAll('.r-card').forEach(c => c.classList.remove('sel'));
    card.classList.add('sel');
    selectedRole = card.dataset.role;
    formData.role = selectedRole;
    const confirmBtn = document.getElementById('roleConfirm');
    if (confirmBtn) confirmBtn.disabled = false;
  });
});

document.getElementById('b0')?.addEventListener('click', () => goToScreen(1));
document.getElementById('b1')?.addEventListener('click', () => goToScreen(2));
document.getElementById('b2')?.addEventListener('click', () => goToScreen(3));
document.getElementById('roleConfirm')?.addEventListener('click', () => goToScreen(11));

function handleDiscordAccept() { formData.discord = 'ACEITOU'; window.open(SECURITY_CONFIG.discordInvite, '_blank', 'noopener,noreferrer'); finish(); }
function handleDiscordRefuse() { formData.discord = 'RECUSOU'; finish(); }

document.getElementById('dcAccept')?.addEventListener('click', handleDiscordAccept);
document.getElementById('dcRefuse')?.addEventListener('click', handleDiscordRefuse);

function finish() {
  formData.timestamp = new Date().toISOString();
  formData.userAgent = navigator.userAgent.substring(0, 100);
  console.log('Formulário completo:', formData);
  const doneNameEl = document.getElementById('doneName');
  if (doneNameEl) { doneNameEl.textContent = securityManager.sanitize(formData.name || 'Candidato'); }
  goToScreen(12);
}

document.addEventListener('DOMContentLoaded', () => { goToScreen(0); });
if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') console.warn('⚠️ Site deve ser servido via HTTPS em produção');
setTimeout(() => { console.warn('Sessão expirada'); }, SECURITY_CONFIG.sessionTimeout);
