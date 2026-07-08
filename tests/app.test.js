/**
 * Unit tests for Sombra Coletiva — Portal de Admissão
 *
 * @jest-environment jsdom
 */

const {
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
} = require('../src/app');

/* ─────────────────────────────────────
   Helper: build minimal DOM for tests
───────────────────────────────────── */
function buildDOM() {
  document.body.innerHTML = `
    <!-- Theme menu -->
    <div id="themeMenu"></div>

    <!-- Progress dots -->
    <div id="dotBar">
      <div class="dot" id="d0"></div><div class="dot" id="d1"></div>
      <div class="dot" id="d2"></div><div class="dot" id="d3"></div>
      <div class="dot" id="d4"></div><div class="dot" id="d5"></div>
      <div class="dot" id="d6"></div><div class="dot" id="d7"></div>
    </div>

    <!-- Screens -->
    <div class="screen active" id="s0"></div>
    <div class="screen" id="s1"></div>
    <div class="screen" id="s2"></div>
    <div class="screen" id="s3"></div>
    <div class="screen" id="s4"></div>
    <div class="screen" id="s5"></div>
    <div class="screen" id="s6"></div>
    <div class="screen" id="s7"></div>
    <div class="screen" id="s8"></div>
    <div class="screen" id="s9"></div>
    <div class="screen" id="s10"></div>
    <div class="screen" id="s11"></div>
    <div class="screen" id="s12"></div>

    <!-- Countdown elements -->
    <svg><circle id="rf0" /><circle id="rf1" /><circle id="rf2" /></svg>
    <div id="cn0">10</div>
    <div id="cn1">5</div>
    <div id="cn2">20</div>
    <button class="btn btn-main hidden" id="b0"></button>
    <button class="btn btn-main hidden" id="b1"></button>
    <button class="btn btn-main hidden" id="b2"></button>

    <!-- Form inputs -->
    <input id="i_name" value="" />
    <input id="i_age"  value="" type="number" />
    <input id="i_rec"  value="" />
    <input id="i_fam"  value="" />
    <input id="i_app"  value="" />
    <input id="i_id"   value="" />

    <!-- Role cards -->
    <div class="r-card" id="rc1"></div>
    <div class="r-card" id="rc2"></div>
    <div class="r-card" id="rc3"></div>
    <button id="roleConfirm" disabled></button>

    <!-- SlayKtty containers -->
    <div id="sk4"></div>
    <div id="sk5"></div>
    <div id="sk10"></div>
    <div id="sk11"></div>

    <!-- SlayKtty SVG template -->
    <template id="skTpl">
      <svg class="sk-char" viewBox="0 0 200 320" xmlns="http://www.w3.org/2000/svg">
        <circle cx="100" cy="100" r="50"/>
      </svg>
    </template>

    <!-- Manifesto lines -->
    <div class="m-line" id="ml0"></div>
    <div class="m-line" id="ml1"></div>
    <div class="m-line" id="ml2"></div>

    <!-- Done screen -->
    <div id="doneName"></div>
  `;
}

beforeEach(() => {
  buildDOM();
  resetState();
  jest.useFakeTimers();
});

afterEach(() => {
  jest.useRealTimers();
  jest.restoreAllMocks();
});

/* ═══════════════════════════════════════════
   THEME SYSTEM
═══════════════════════════════════════════ */
describe('Theme System', () => {
  describe('themes object', () => {
    it('contains all five themes', () => {
      expect(Object.keys(themes)).toEqual(['red', 'purple', 'blue', 'green', 'gold']);
    });

    it.each(['red', 'purple', 'blue', 'green', 'gold'])('theme "%s" has required keys', (name) => {
      const th = themes[name];
      expect(th).toHaveProperty('r');
      expect(th).toHaveProperty('rd');
      expect(th).toHaveProperty('pl');
      expect(th).toHaveProperty('gold');
      expect(th).toHaveProperty('cv');
      expect(th.cv).toHaveLength(3);
    });

    it.each(['red', 'purple', 'blue', 'green', 'gold'])('theme "%s" cv values are valid RGB', (name) => {
      const [r, g, b] = themes[name].cv;
      expect(r).toBeGreaterThanOrEqual(0);
      expect(r).toBeLessThanOrEqual(255);
      expect(g).toBeGreaterThanOrEqual(0);
      expect(g).toBeLessThanOrEqual(255);
      expect(b).toBeGreaterThanOrEqual(0);
      expect(b).toBeLessThanOrEqual(255);
    });
  });

  describe('parseThemePairs', () => {
    it('parses red theme pairs correctly', () => {
      const pairs = parseThemePairs(themes.red);
      expect(pairs['--red']).toBe('#cc0020');
      expect(pairs['--red-dim']).toBe('#7a0012');
      expect(pairs['--purple-l']).toBe('#8b3fc0');
      expect(pairs['--gold']).toBe('#b89a0c');
    });

    it('parses all four CSS variables from any theme', () => {
      const pairs = parseThemePairs(themes.blue);
      expect(Object.keys(pairs)).toHaveLength(4);
      expect(pairs).toHaveProperty('--red');
      expect(pairs).toHaveProperty('--red-dim');
      expect(pairs).toHaveProperty('--purple-l');
      expect(pairs).toHaveProperty('--gold');
    });

    it('returns correct values for gold theme', () => {
      const pairs = parseThemePairs(themes.gold);
      expect(pairs['--red']).toBe('#cc9900');
      expect(pairs['--red-dim']).toBe('#7a5c00');
    });
  });

  describe('applyTheme', () => {
    it('applies CSS custom properties to document root', () => {
      applyTheme('blue');
      const root = document.documentElement.style;
      expect(root.getPropertyValue('--red')).toBe('#0066cc');
      expect(root.getPropertyValue('--red-dim')).toBe('#003d7a');
      expect(root.getPropertyValue('--purple-l')).toBe('#4da6ff');
      expect(root.getPropertyValue('--gold')).toBe('#00ccff');
    });

    it('calls _setCanvasAccent when available', () => {
      window._setCanvasAccent = jest.fn();
      applyTheme('green');
      expect(window._setCanvasAccent).toHaveBeenCalledWith(0, 170, 51);
      delete window._setCanvasAccent;
    });

    it('returns false for an invalid theme name', () => {
      expect(applyTheme('nonexistent')).toBe(false);
    });

    it('returns true for a valid theme', () => {
      expect(applyTheme('red')).toBe(true);
    });

    it('closes the theme menu after applying', () => {
      const menu = document.getElementById('themeMenu');
      menu.classList.add('open');
      applyTheme('purple');
      expect(menu.classList.contains('open')).toBe(false);
    });

    it('does not throw when _setCanvasAccent is not defined', () => {
      delete window._setCanvasAccent;
      expect(() => applyTheme('red')).not.toThrow();
    });
  });

  describe('toggleTheme', () => {
    it('adds "open" class when menu is closed', () => {
      const menu = document.getElementById('themeMenu');
      expect(menu.classList.contains('open')).toBe(false);
      toggleTheme();
      expect(menu.classList.contains('open')).toBe(true);
    });

    it('removes "open" class when menu is already open', () => {
      const menu = document.getElementById('themeMenu');
      menu.classList.add('open');
      toggleTheme();
      expect(menu.classList.contains('open')).toBe(false);
    });

    it('toggles back and forth', () => {
      const menu = document.getElementById('themeMenu');
      toggleTheme();
      expect(menu.classList.contains('open')).toBe(true);
      toggleTheme();
      expect(menu.classList.contains('open')).toBe(false);
      toggleTheme();
      expect(menu.classList.contains('open')).toBe(true);
    });
  });
});

/* ═══════════════════════════════════════════
   SCREEN NAVIGATION
═══════════════════════════════════════════ */
describe('Screen Navigation', () => {
  describe('go', () => {
    it('removes "active" from current screen and adds to target', () => {
      expect(document.getElementById('s0').classList.contains('active')).toBe(true);
      go(1);
      expect(document.getElementById('s0').classList.contains('active')).toBe(false);
      expect(document.getElementById('s0').classList.contains('out')).toBe(true);
      expect(document.getElementById('s1').classList.contains('active')).toBe(true);
    });

    it('updates cur to the new screen index', () => {
      expect(getCur()).toBe(0);
      go(5);
      expect(getCur()).toBe(5);
    });

    it('returns the target screen number', () => {
      expect(go(3)).toBe(3);
    });

    it('navigates through multiple screens sequentially', () => {
      go(1);
      go(2);
      go(3);
      expect(getCur()).toBe(3);
      expect(document.getElementById('s3').classList.contains('active')).toBe(true);
    });

    it('can navigate backwards', () => {
      go(5);
      go(2);
      expect(getCur()).toBe(2);
      expect(document.getElementById('s2').classList.contains('active')).toBe(true);
    });

    it('handles navigating to the same screen', () => {
      go(0);
      expect(getCur()).toBe(0);
    });
  });

  describe('state management', () => {
    it('resetState clears cur and fd', () => {
      go(5);
      fd.name = 'test';
      fd.age = '25';
      resetState();
      expect(getCur()).toBe(0);
      expect(Object.keys(getFd())).toHaveLength(0);
    });

    it('setCur updates current screen index', () => {
      setCur(7);
      expect(getCur()).toBe(7);
    });

    it('getFd returns the form data object', () => {
      fd.name = 'Alice';
      expect(getFd().name).toBe('Alice');
    });
  });
});

/* ═══════════════════════════════════════════
   COUNTDOWN
═══════════════════════════════════════════ */
describe('Countdown', () => {
  it('initializes with strokeDashoffset of 0', () => {
    countdown(0, 10, 'rf0', 'cn0', 'b0');
    const ring = document.getElementById('rf0');
    expect(ring.style.strokeDashoffset).toBe('0');
  });

  it('decrements the counter each second', () => {
    countdown(0, 10, 'rf0', 'cn0', 'b0');
    const num = document.getElementById('cn0');

    jest.advanceTimersByTime(1000);
    expect(num.textContent).toBe('9');

    jest.advanceTimersByTime(1000);
    expect(num.textContent).toBe('8');
  });

  it('updates strokeDashoffset proportionally', () => {
    countdown(0, 10, 'rf0', 'cn0', 'b0');
    const ring = document.getElementById('rf0');

    jest.advanceTimersByTime(5000);
    const expected = ((5 / 10) * 226).toString();
    expect(ring.style.strokeDashoffset).toBe(expected);
  });

  it('shows button and checkmark when countdown finishes', () => {
    countdown(0, 3, 'rf0', 'cn0', 'b0');
    const btn = document.getElementById('b0');
    const num = document.getElementById('cn0');

    jest.advanceTimersByTime(3000);
    expect(btn.classList.contains('show')).toBe(true);
    expect(btn.classList.contains('hidden')).toBe(false);
    expect(num.innerHTML).toContain('✓');
  });

  it('sets final strokeDashoffset to 226', () => {
    countdown(0, 2, 'rf0', 'cn0', 'b0');
    const ring = document.getElementById('rf0');

    jest.advanceTimersByTime(2000);
    expect(ring.style.strokeDashoffset).toBe('226');
  });

  it('returns null when elements are missing', () => {
    expect(countdown(0, 5, 'nonexistent', 'cn0', 'b0')).toBeNull();
  });

  it('clears interval after countdown completes', () => {
    const spy = jest.spyOn(global, 'clearInterval');
    countdown(0, 1, 'rf0', 'cn0', 'b0');

    jest.advanceTimersByTime(1000);
    expect(spy).toHaveBeenCalled();
  });

  it('does not decrement past zero', () => {
    countdown(0, 2, 'rf0', 'cn0', 'b0');

    jest.advanceTimersByTime(5000);
    const num = document.getElementById('cn0');
    expect(num.innerHTML).toContain('✓');
  });
});

/* ═══════════════════════════════════════════
   PROGRESS DOTS
═══════════════════════════════════════════ */
describe('Progress Dots', () => {
  it('marks all dots before active as "done"', () => {
    dots(3);
    expect(document.getElementById('d0').classList.contains('done')).toBe(true);
    expect(document.getElementById('d1').classList.contains('done')).toBe(true);
    expect(document.getElementById('d2').classList.contains('done')).toBe(true);
  });

  it('marks the active dot as "now"', () => {
    dots(3);
    expect(document.getElementById('d3').classList.contains('now')).toBe(true);
  });

  it('dots after active have no extra classes', () => {
    dots(3);
    expect(document.getElementById('d4').classList.contains('done')).toBe(false);
    expect(document.getElementById('d4').classList.contains('now')).toBe(false);
  });

  it('works with active = 0 (first dot)', () => {
    dots(0);
    expect(document.getElementById('d0').classList.contains('now')).toBe(true);
    expect(document.getElementById('d1').classList.contains('now')).toBe(false);
    expect(document.getElementById('d1').classList.contains('done')).toBe(false);
  });

  it('works with active = 7 (last dot)', () => {
    dots(7);
    for (let i = 0; i < 7; i++) {
      expect(document.getElementById('d' + i).classList.contains('done')).toBe(true);
    }
    expect(document.getElementById('d7').classList.contains('now')).toBe(true);
  });

  it('resets previous states when called again', () => {
    dots(5);
    dots(2);
    expect(document.getElementById('d2').classList.contains('now')).toBe(true);
    expect(document.getElementById('d5').classList.contains('now')).toBe(false);
    expect(document.getElementById('d5').classList.contains('done')).toBe(false);
  });

  it('all dots are plain when active is out of range', () => {
    dots(10);
    for (let i = 0; i < 8; i++) {
      expect(document.getElementById('d' + i).classList.contains('done')).toBe(true);
    }
  });
});

/* ═══════════════════════════════════════════
   FORM ANSWERS
═══════════════════════════════════════════ */
describe('Form Answers', () => {
  describe('ans', () => {
    it('returns false and adds shake class for empty input', () => {
      const input = document.getElementById('i_name');
      input.value = '';
      expect(ans('name', 'i_name', 5)).toBe(false);
      expect(input.classList.contains('shake')).toBe(true);
    });

    it('returns false for whitespace-only input', () => {
      const input = document.getElementById('i_name');
      input.value = '   ';
      expect(ans('name', 'i_name', 5)).toBe(false);
    });

    it('stores value in fd and clears input on valid submission', () => {
      const input = document.getElementById('i_name');
      input.value = 'Alice';
      expect(ans('name', 'i_name', 5)).toBe(true);
      expect(fd.name).toBe('Alice');
      expect(input.value).toBe('');
    });

    it('trims whitespace from input value', () => {
      const input = document.getElementById('i_name');
      input.value = '  Bob  ';
      ans('name', 'i_name', 5);
      expect(fd.name).toBe('Bob');
    });

    it('navigates to the next screen on success', () => {
      const input = document.getElementById('i_name');
      input.value = 'Charlie';
      ans('name', 'i_name', 5);
      expect(getCur()).toBe(5);
    });

    it('returns false when input element does not exist', () => {
      expect(ans('name', 'nonexistent', 5)).toBe(false);
    });

    it('stores age as string', () => {
      const input = document.getElementById('i_age');
      input.value = '25';
      ans('age', 'i_age', 6);
      expect(fd.age).toBe('25');
    });

    it('handles recruiter field', () => {
      const input = document.getElementById('i_rec');
      input.value = 'SlayKtty';
      ans('recruiter', 'i_rec', 7);
      expect(fd.recruiter).toBe('SlayKtty');
    });

    it('handles famTime field', () => {
      const input = document.getElementById('i_fam');
      input.value = '2 meses';
      ans('famTime', 'i_fam', 8);
      expect(fd.famTime).toBe('2 meses');
    });

    it('handles appTime field', () => {
      const input = document.getElementById('i_app');
      input.value = '6 meses';
      ans('appTime', 'i_app', 9);
      expect(fd.appTime).toBe('6 meses');
    });

    it('handles userId field', () => {
      const input = document.getElementById('i_id');
      input.value = 'user123';
      ans('userId', 'i_id', 10);
      expect(fd.userId).toBe('user123');
    });
  });

  describe('ek (Enter key handler)', () => {
    it('submits on Enter key', () => {
      const input = document.getElementById('i_name');
      input.value = 'Test';
      const result = ek({ key: 'Enter' }, 'name', 'i_name', 5);
      expect(result).toBe(true);
      expect(fd.name).toBe('Test');
    });

    it('does nothing on other keys', () => {
      const input = document.getElementById('i_name');
      input.value = 'Test';
      const result = ek({ key: 'a' }, 'name', 'i_name', 5);
      expect(result).toBe(false);
      expect(fd.name).toBeUndefined();
    });

    it('returns false on Enter with empty input', () => {
      const input = document.getElementById('i_name');
      input.value = '';
      const result = ek({ key: 'Enter' }, 'name', 'i_name', 5);
      expect(result).toBe(false);
    });
  });

  describe('pickRole', () => {
    it('selects a role and enables confirm button', () => {
      const card = document.getElementById('rc1');
      pickRole(card, 'Vigilante');
      expect(card.classList.contains('sel')).toBe(true);
      expect(fd.role).toBe('Vigilante');
      expect(document.getElementById('roleConfirm').disabled).toBe(false);
    });

    it('deselects other cards when selecting a new one', () => {
      const card1 = document.getElementById('rc1');
      const card2 = document.getElementById('rc2');
      pickRole(card1, 'Designer');
      pickRole(card2, 'Recrutador');
      expect(card1.classList.contains('sel')).toBe(false);
      expect(card2.classList.contains('sel')).toBe(true);
      expect(fd.role).toBe('Recrutador');
    });

    it('returns false when element is null', () => {
      expect(pickRole(null, 'Test')).toBe(false);
    });

    it('updates selRole internal variable', () => {
      const card = document.getElementById('rc1');
      pickRole(card, 'Segurança');
      expect(getSelRole()).toBe('Segurança');
    });

    it('can re-select the same role', () => {
      const card = document.getElementById('rc1');
      pickRole(card, 'Organizador');
      pickRole(card, 'Organizador');
      expect(fd.role).toBe('Organizador');
      expect(card.classList.contains('sel')).toBe(true);
    });
  });
});

/* ═══════════════════════════════════════════
   DISCORD ACTIONS
═══════════════════════════════════════════ */
describe('Discord Actions', () => {
  it('dcAccept sets fd.discord to ACEITOU', () => {
    dcAccept();
    expect(fd.discord).toBe('ACEITOU');
  });

  it('dcAccept returns the discord value', () => {
    expect(dcAccept()).toBe('ACEITOU');
  });

  it('dcRefuse sets fd.discord to RECUSOU', () => {
    dcRefuse();
    expect(fd.discord).toBe('RECUSOU');
  });

  it('dcRefuse returns the discord value', () => {
    expect(dcRefuse()).toBe('RECUSOU');
  });

  it('last action wins when both are called', () => {
    dcAccept();
    dcRefuse();
    expect(fd.discord).toBe('RECUSOU');
  });
});

/* ═══════════════════════════════════════════
   SLAYKTTY INJECTION
═══════════════════════════════════════════ */
describe('SlayKtty Injection', () => {
  it('injects SVG into an empty container', () => {
    const result = injectSK(4);
    expect(result).toBe(true);
    const ct = document.getElementById('sk4');
    expect(ct.querySelector('svg')).not.toBeNull();
  });

  it('does not inject again if container already has children', () => {
    injectSK(4);
    const result = injectSK(4);
    expect(result).toBe(false);
  });

  it('sets width=80px for screen 10', () => {
    const result = injectSK(10);
    expect(result).toBe(true);
    const svg = document.getElementById('sk10').querySelector('svg');
    expect(svg.style.width).toBe('80px');
    expect(svg.style.height).toBe('auto');
  });

  it('sets width=130px for screen 11', () => {
    const result = injectSK(11);
    expect(result).toBe(true);
    const svg = document.getElementById('sk11').querySelector('svg');
    expect(svg.style.width).toBe('130px');
    expect(svg.style.height).toBe('auto');
  });

  it('returns false for nonexistent container', () => {
    expect(injectSK(99)).toBe(false);
  });

  it('does not set special width for non-10/11 screens', () => {
    injectSK(5);
    const svg = document.getElementById('sk5').querySelector('svg');
    expect(svg.style.width).toBe('');
  });
});

/* ═══════════════════════════════════════════
   INTEL COLLECTOR
═══════════════════════════════════════════ */
describe('Intel Collector', () => {
  it('returns an object with standard fields', async () => {
    const data = await intel();
    expect(data).toHaveProperty('ua');
    expect(data).toHaveProperty('lang');
    expect(data).toHaveProperty('tz');
    expect(data).toHaveProperty('ref');
    expect(data).toHaveProperty('plat');
    expect(data).toHaveProperty('ram');
    expect(data).toHaveProperty('cores');
    expect(data).toHaveProperty('screen');
    expect(data).toHaveProperty('touch');
    expect(data).toHaveProperty('time');
  });

  it('ref defaults to "Acesso Direto" when no referrer', async () => {
    Object.defineProperty(document, 'referrer', { value: '', configurable: true });
    const data = await intel();
    expect(data.ref).toBe('Acesso Direto');
  });

  it('screen is formatted as WxH (depthbit)', async () => {
    const data = await intel();
    expect(data.screen).toMatch(/^\d+x\d+ \(\d+bit\)$/);
  });

  it('time is a non-empty string', async () => {
    const data = await intel();
    expect(typeof data.time).toBe('string');
    expect(data.time.length).toBeGreaterThan(0);
  });
});

/* ═══════════════════════════════════════════
   MANIFESTO
═══════════════════════════════════════════ */
describe('Manifesto', () => {
  it('getManifestoLines returns NodeList of .m-line elements', () => {
    const lines = getManifestoLines();
    expect(lines.length).toBe(3);
  });

  it('manifesto lines initially lack "on" class', () => {
    const lines = getManifestoLines();
    lines.forEach(line => {
      expect(line.classList.contains('on')).toBe(false);
    });
  });
});

/* ═══════════════════════════════════════════
   FULL FLOW INTEGRATION
═══════════════════════════════════════════ */
describe('Full Flow Integration', () => {
  it('completes a full form submission flow', () => {
    // Start at screen 0
    expect(getCur()).toBe(0);

    // Navigate to name screen
    go(4);
    expect(getCur()).toBe(4);

    // Fill name
    document.getElementById('i_name').value = 'TestUser';
    ans('name', 'i_name', 5);
    expect(fd.name).toBe('TestUser');
    expect(getCur()).toBe(5);

    // Fill age
    document.getElementById('i_age').value = '20';
    ans('age', 'i_age', 6);
    expect(fd.age).toBe('20');

    // Fill recruiter
    document.getElementById('i_rec').value = 'Recruiter1';
    ans('recruiter', 'i_rec', 7);
    expect(fd.recruiter).toBe('Recruiter1');

    // Fill famTime
    document.getElementById('i_fam').value = '3 meses';
    ans('famTime', 'i_fam', 8);
    expect(fd.famTime).toBe('3 meses');

    // Fill appTime
    document.getElementById('i_app').value = '1 ano';
    ans('appTime', 'i_app', 9);
    expect(fd.appTime).toBe('1 ano');

    // Fill userId
    document.getElementById('i_id').value = 'id999';
    ans('userId', 'i_id', 10);
    expect(fd.userId).toBe('id999');

    // Pick role
    const card = document.getElementById('rc1');
    pickRole(card, 'Vigilante');
    expect(fd.role).toBe('Vigilante');

    // Discord
    dcAccept();
    expect(fd.discord).toBe('ACEITOU');

    // Verify all form data
    expect(fd).toEqual({
      name: 'TestUser',
      age: '20',
      recruiter: 'Recruiter1',
      famTime: '3 meses',
      appTime: '1 ano',
      userId: 'id999',
      role: 'Vigilante',
      discord: 'ACEITOU'
    });
  });

  it('theme changes persist across screen navigation', () => {
    applyTheme('blue');
    go(5);
    expect(document.documentElement.style.getPropertyValue('--red')).toBe('#0066cc');
    go(8);
    expect(document.documentElement.style.getPropertyValue('--red')).toBe('#0066cc');
  });
});
