/* ════════════════════════════════════════
   SECURITY & VALIDATION CONSTANTS
════════════════════════════════════════ */

const SEC = {
  MAX_INPUT_LENGTH: 200,
  MAX_ATTEMPTS: 5,
  ATTEMPT_WINDOW: 60000, // 1 minuto
  DISCORD_LINK: 'https://discord.gg/GgYCbMAuX',
  INPUT_REGEX: /^[a-zA-Z0-9À-ÿ\s\-_.]+$/,
  
  // Sanitizar entrada XSS
  sanitize(str) {
    if (typeof str !== 'string') return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  },
  
  // Validar entrada
  validate(str, type = 'text') {
    str = String(str).trim();
    if (!str || str.length > this.MAX_INPUT_LENGTH) return false;
    
    switch(type) {
      case 'number':
        const num = parseInt(str);
        return !isNaN(num) && num >= 13 && num <= 120;
      case 'text':
        return this.INPUT_REGEX.test(str);
      default:
        return true;
    }
  }
};

/* ════════════════════════════════════════
   RATE LIMITER
════════════════════════════════════════ */

class RateLimiter {
  constructor() {
    this.attempts = {};
  }
  
  check(key) {
    const now = Date.now();
    if (!this.attempts[key]) this.attempts[key] = [];
    
    this.attempts[key] = this.attempts[key].filter(t => now - t < SEC.ATTEMPT_WINDOW);
    
    if (this.attempts[key].length >= SEC.MAX_ATTEMPTS) {
      return false;
    }
    
    this.attempts[key].push(now);
    return true;
  }
}

const limiter = new RateLimiter();

/* ════════════════════════════════════════
   CANVAS BACKGROUND
════════════════════════════════════════ */

(function() {
  const cv = document.getElementById('bgCanvas');
  if (!cv) return;
  
  const cx = cv.getContext('2d');
  if (!cx) return;
  
  let W, H;
  
  const resize = () => {
    W = cv.width = innerWidth;
    H = cv.height = innerHeight;
  };
  
  resize();
  window.addEventListener('resize', resize);
  
  const pts = Array.from({length: 90}, () => ({
    x: Math.random() * 2000,
    y: Math.random() * 1200,
    vx: (Math.random() - 0.5) * 0.25,
    vy: -Math.random() * 0.35 - 0.05,
    r: Math.random() * 1.4 + 0.25,
    c: ['#8b0015', '#3d0055', '#1a0028', '#111111'][Math.floor(Math.random() * 4)],
    o: Math.random() * 0.45 + 0.05
  }));
  
  let accent = [204, 0, 32];
  window._setCanvasAccent = (r, g, b) => { accent = [r, g, b]; };
  
  const draw = () => {
    cx.clearRect(0, 0, W, H);
    
    // Grid
    cx.strokeStyle = `rgba(${accent[0]},${accent[1]},${accent[2]},.045)`;
    cx.lineWidth = 0.5;
    const gs = 90;
    for (let x = 0; x < W; x += gs) {
      cx.beginPath();
      cx.moveTo(x, 0);
      cx.lineTo(x, H);
      cx.stroke();
    }
    for (let y = 0; y < H; y += gs) {
      cx.beginPath();
      cx.moveTo(0, y);
      cx.lineTo(W, y);
      cx.stroke();
    }
    
    // Particles
    pts.forEach(p => {
      cx.beginPath();
      cx.arc(p.x % W, p.y % H, p.r, 0, Math.PI * 2);
      cx.fillStyle = p.c;
      cx.globalAlpha = p.o;
      cx.fill();
      p.x += p.vx;
      p.y += p.vy;
      if (p.y < -5) {
        p.y = H + 5;
        p.x = Math.random() * W;
      }
    });
    cx.globalAlpha = 1;
    requestAnimationFrame(draw);
  };
  
  draw();
})();

/* ════════════════════════════════════════
   THEME SYSTEM
════════════════════════════════════════ */

const themes = {
  red: { r: '#cc0020', rd: '#7a0012', pl: '#8b3fc0', gold: '#b89a0c', cv: [204, 0, 32] },
  purple: { r: '#8b00cc', rd: '#500080', pl: '#cc66ff', gold: '#8b3fc0', cv: [139, 0, 204] },
  blue: { r: '#0066cc', rd: '#003d7a', pl: '#4da6ff', gold: '#00ccff', cv: [0, 102, 204] },
  green: { r: '#00aa33', rd: '#006620', pl: '#33ff77', gold: '#aaff00', cv: [0, 170, 51] },
  gold: { r: '#cc9900', rd: '#7a5c00', pl: '#ffcc44', gold: '#ffdd00', cv: [204, 153, 0] }
};

function applyTheme(t) {
  const th = themes[t];
  if (!th) return;
  
  const root = document.documentElement.style;
  root.setProperty('--red', th.r);
  root.setProperty('--red-dim', th.rd);
  root.setProperty('--purple-l', th.pl);
  root.setProperty('--gold', th.gold);
  
  if (window._setCanvasAccent) window._setCanvasAccent(...th.cv);
  
  const menu = document.getElementById('themeMenu');
  if (menu) menu.classList.remove('open');
  
  localStorage.setItem('selectedTheme', t);
}

// Theme button handler
document.addEventListener('click', function(e) {
  const themeBtn = document.getElementById('themeBtn');
  const themeMenu = document.getElementById('themeMenu');
  
  if (!themeBtn || !themeMenu) return;
  
  if (e.target === themeBtn || themeBtn.contains(e.target)) {
    themeMenu.classList.toggle('open');
  } else if (!themeMenu.contains(e.target)) {
    themeMenu.classList.remove('open');
  }
});

// Theme option handlers
document.addEventListener('click', function(e) {
  if (e.target.classList.contains('theme-option')) {
    const theme = e.target.getAttribute('data-theme');
    if (theme) applyTheme(theme);
  }
});

// Load saved theme
const savedTheme = localStorage.getItem('selectedTheme') || 'red';
applyTheme(savedTheme);

/* ════════════════════════════════════════
   SCREEN SYSTEM
════════════════════════════════════════ */

let cur = 0;
const fd = {};

function go(n) {
  if (!limiter.check('nav')) {
    console.warn('⚠️ Navegação muito rápida');
    return;
  }
  
  const prev = document.getElementById('s' + cur);
  if (!prev) return;
  
  prev.classList.remove('active');
  prev.classList.add('out');
  
  setTimeout(() => prev.classList.remove('out'), 700);
  
  cur = n;
  
  setTimeout(() => {
    const next = document.getElementById('s' + n);
    if (next) {
      next.classList.add('active');
      onEnter(n);
    }
  }, 350);
}

function onEnter(n) {
  if (n === 0) countdown(0, 10, 'rf0', 'cn0', 'b0');
  if (n === 1) countdown(1, 5, 'rf1', 'cn1', 'b1');
  if (n === 2) manifesto();
  if (n === 3) runLoad();
  if (n >= 4 && n <= 11) injectSK(n);
  
  const bar = document.getElementById('dotBar');
  if (n >= 4 && n <= 11) {
    bar.style.display = 'flex';
    dots(n - 4);
  } else {
    bar.style.display = 'none';
  }
  
  // Auto-focus input fields
  const inputs = {
    4: 'i_name',
    5: 'i_age',
    6: 'i_rec',
    7: 'i_fam',
    8: 'i_app',
    9: 'i_id'
  };
  
  if (inputs[n]) {
    const el = document.getElementById(inputs[n]);
    if (el) setTimeout(() => el.focus(), 500);
  }
}

/* ════════════════════════════════════════
   COUNTDOWN
════════════════���═══════════════════════ */

function countdown(idx, total, ringId, numId, btnId) {
  const C = 226;
  const ring = document.getElementById(ringId);
  const num = document.getElementById(numId);
  const btn = document.getElementById(btnId);
  
  if (!ring || !num || !btn) return;
  
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
}

/* ════════════════════════════════════════
   MANIFESTO
════════════════════════════════════════ */

function manifesto() {
  const lines = document.querySelectorAll('.m-line');
  const ft = document.getElementById('mf');
  
  lines.forEach(l => l.classList.remove('on'));
  if (ft) ft.classList.remove('on');
  
  lines.forEach((l, i) => {
    setTimeout(() => l.classList.add('on'), 350 + i * 620);
  });
  
  const after = 350 + lines.length * 620 + 500;
  if (ft) setTimeout(() => ft.classList.add('on'), after);
  setTimeout(() => countdown(2, 20, 'rf2', 'cn2', 'b2'), after + 900);
}

/* ════════════════════════════════════════
   LOADING
════════════════════════════════════════ */

function startLoad() { go(3); }

function runLoad() {
  const phases = [
    'INICIALIZANDO SISTEMA...',
    'VERIFICANDO CREDENCIAIS...',
    'CARREGANDO PROTOCOLOS...',
    'SINCRONIZANDO REDE...',
    'ANALISANDO DISPOSITIVO...',
    'VALIDANDO IDENTIDADE...',
    'ACESSO CONCEDIDO ✓'
  ];
  
  const bar = document.getElementById('ldBar');
  const ph = document.getElementById('ldPh');
  const pct = document.getElementById('ldPct');
  
  if (!bar || !ph || !pct) return;
  
  let p = 0, pi = 0;
  
  const iv = setInterval(() => {
    p += Math.random() * 2.8 + 0.8;
    if (p > 100) p = 100;
    
    bar.style.width = p + '%';
    pct.textContent = Math.round(p) + '%';
    
    const ep = Math.floor((p / 100) * (phases.length - 1));
    if (ep !== pi && ep < phases.length) {
      pi = ep;
      ph.textContent = phases[pi];
    }
    
    if (p >= 100) {
      clearInterval(iv);
      setTimeout(() => go(4), 900);
    }
  }, 75);
}

/* ════════════════════════════════════════
   SLAYKTTY INJECTION
════════════════════════════════════════ */

function injectSK(sid) {
  const ct = document.getElementById('sk' + sid);
  if (!ct || ct.children.length > 0) return;
  
  const tpl = document.getElementById('skTpl');
  if (!tpl) return;
  
  const clone = tpl.content.cloneNode(true);
  const svg = clone.querySelector('svg');
  
  if (svg) {
    if (sid === 10) { svg.style.width = '80px'; svg.style.height = 'auto'; }
    else if (sid === 11) { svg.style.width = '130px'; svg.style.height = 'auto'; }
  }
  
  ct.appendChild(clone);
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
   FORM HANDLING
════════════════════════════════════════ */

function ans(key, inputId, next, type = 'text') {
  if (!limiter.check('input')) {
    console.warn('⚠️ Muitas tentativas');
    return;
  }
  
  const el = document.getElementById(inputId);
  if (!el) return;
  
  let v = (el.value || '').trim();
  
  // Validação
  if (!SEC.validate(v, type)) {
    el.classList.add('shake');
    setTimeout(() => el.classList.remove('shake'), 450);
    el.style.borderBottomColor = 'var(--red)';
    setTimeout(() => el.style.borderBottomColor = '', 600);
    return;
  }
  
  // Sanitizar e armazenar
  fd[key] = SEC.sanitize(v);
  el.value = '';
  go(next);
}

// Event delegation para botões de formulário
document.addEventListener('click', function(e) {
  if (e.target.id === 'btn_name') ans('name', 'i_name', 5);
  if (e.target.id === 'btn_age') ans('age', 'i_age', 6, 'number');
  if (e.target.id === 'btn_rec') ans('recruiter', 'i_rec', 7);
  if (e.target.id === 'btn_fam') ans('famTime', 'i_fam', 8);
  if (e.target.id === 'btn_app') ans('appTime', 'i_app', 9);
  if (e.target.id === 'btn_id') ans('userId', 'i_id', 10);
  if (e.target.id === 'b0') go(1);
  if (e.target.id === 'b1') go(2);
  if (e.target.id === 'b2') startLoad();
});

// Enter key handler
document.addEventListener('keydown', function(e) {
  if (e.key !== 'Enter') return;
  
  const inputs = {
    'i_name': () => ans('name', 'i_name', 5),
    'i_age': () => ans('age', 'i_age', 6, 'number'),
    'i_rec': () => ans('recruiter', 'i_rec', 7),
    'i_fam': () => ans('famTime', 'i_fam', 8),
    'i_app': () => ans('appTime', 'i_app', 9),
    'i_id': () => ans('userId', 'i_id', 10)
  };
  
  if (e.target.id in inputs) {
    inputs[e.target.id]();
  }
});

/* ════════════════════════════════════════
   ROLES
════════════════════════════════════════ */

let selRole = '';

document.addEventListener('click', function(e) {
  if (e.target.classList.contains('r-card')) {
    const cards = document.querySelectorAll('.r-card');
    cards.forEach(c => c.classList.remove('sel'));
    
    e.target.classList.add('sel');
    selRole = e.target.getAttribute('data-role');
    fd.role = selRole;
    
    const btn = document.getElementById('roleConfirm');
    if (btn) btn.disabled = false;
  }
});

document.addEventListener('click', function(e) {
  if (e.target.id === 'roleConfirm') go(11);
});

/* ════════════════════════════════════════
   DISCORD
════════════════════════════════════════ */

document.addEventListener('click', function(e) {
  if (e.target.id === 'dcAccept') {
    fd.discord = 'ACEITOU';
    window.open(SEC.DISCORD_LINK, '_blank', 'noopener,noreferrer');
    finish();
  }
  
  if (e.target.id === 'dcRefuse') {
    fd.discord = 'RECUSOU';
    finish();
  }
});

/* ════════════════════════════════════════
   FINISH
════════════════════════════════════════ */

function finish() {
  // Enviar dados de forma segura (apenas local)
  const name = fd.name || 'Usuário';
  const doneName = document.getElementById('doneName');
  if (doneName) doneName.textContent = SEC.sanitize(name);
  
  go(12);
  
  // Log (sem expor dados sensíveis)
  console.log('✅ Formulário completo');
}

/* ════════════════════════════════════════
   INICIALIZAÇÃO
════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', function() {
  const startBtn = document.getElementById('b0');
  if (startBtn) {
    countdown(0, 10, 'rf0', 'cn0', 'b0');
  }
});
