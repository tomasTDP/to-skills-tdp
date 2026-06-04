// ============================================================
// TO-SKILLS-TDP // Character Select // main.js
// ============================================================

const REPO = 'https://github.com/tomasTDP/to-skills-tdp';
const SKILLS_PATH = `${REPO}/tree/main/skills`;

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

const state = {
  heroes: [],
  combos: [],
  heroById: new Map(),
  comboById: new Map(),
  comboByHero: new Map(),
  selectedId: null,
  activeFilter: 'all',
  soundOn: true,
  audioCtx: null,
};

// ---------- audio: procedural 8-bit beeps ----------

function audio() {
  if (!state.soundOn) return null;
  if (!state.audioCtx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    state.audioCtx = new AC();
  }
  return state.audioCtx;
}

function beep({ freq = 440, dur = 0.06, type = 'square', vol = 0.05, slide = 0 }) {
  const ctx = audio();
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, ctx.currentTime);
  if (slide) osc.frequency.exponentialRampToValueAtTime(Math.max(20, freq + slide), ctx.currentTime + dur);
  gain.gain.setValueAtTime(vol, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + dur);
}

const sfx = {
  hover: () => beep({ freq: 880, dur: 0.04, vol: 0.025 }),
  select: () => { beep({ freq: 660, dur: 0.05 }); setTimeout(() => beep({ freq: 990, dur: 0.06 }), 50); },
  engage: () => { beep({ freq: 440, dur: 0.08, slide: 400 }); setTimeout(() => beep({ freq: 880, dur: 0.1, slide: 200 }), 80); },
  copy:   () => beep({ freq: 1320, dur: 0.05, vol: 0.06 }),
  filter: () => beep({ freq: 760, dur: 0.05, type: 'triangle', vol: 0.04 }),
  boot:   () => {
    beep({ freq: 220, dur: 0.12, type: 'sawtooth', vol: 0.04 });
    setTimeout(() => beep({ freq: 440, dur: 0.08 }), 120);
    setTimeout(() => beep({ freq: 660, dur: 0.08 }), 220);
    setTimeout(() => beep({ freq: 880, dur: 0.18 }), 320);
  },
  achievement: () => {
    const notes = [523, 659, 784, 1047]; // C-E-G-C
    notes.forEach((f, i) => setTimeout(() => beep({ freq: f, dur: 0.12, vol: 0.06 }), i * 100));
  },
};

// ---------- data load ----------

async function loadData() {
  const [heroesRes, combosRes] = await Promise.all([
    fetch('heroes.json', { cache: 'no-cache' }),
    fetch('combos.json', { cache: 'no-cache' }),
  ]);
  if (!heroesRes.ok) throw new Error(`heroes.json: ${heroesRes.status}`);
  if (!combosRes.ok) throw new Error(`combos.json: ${combosRes.status}`);
  const heroes = await heroesRes.json();
  const combos = await combosRes.json();
  return { heroes, combos };
}

function indexData(heroes, combos) {
  state.heroes = heroes;
  state.combos = combos;
  state.heroById = new Map(heroes.map((h) => [h.id, h]));
  state.comboById = new Map(combos.map((c) => [c.id, c]));
  state.comboByHero = new Map();
  combos.forEach((c) => c.heroIds.forEach((hid) => state.comboByHero.set(hid, c)));
}

// ---------- sprite PNG fallback ----------

function trySpritePng(spriteEl, heroId) {
  const img = new Image();
  img.src = `sprites/${heroId}.png`;
  img.alt = '';
  img.className = 'sprite-png';
  img.addEventListener('load', () => {
    spriteEl.innerHTML = '';
    spriteEl.appendChild(img);
  });
  // on error: keep the SVG placeholder
}

// ---------- hero card ----------

function setIconHref(useEl, heroId) {
  if (!useEl) return;
  const href = `#icon-${heroId}`;
  useEl.setAttribute('href', href);
  useEl.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', href);
}

function buildHeroCard(hero) {
  const tpl = $('#hero-card-tpl');
  const node = tpl.content.firstElementChild.cloneNode(true);
  node.dataset.id = hero.id;
  $('.hero-name', node).textContent = hero.name;
  node.setAttribute('aria-label', `${hero.name}, ${hero.title}. Type ${hero.type}.`);
  node.addEventListener('click', () => selectHero(hero.id));
  node.addEventListener('mouseenter', () => sfx.hover());
  node.addEventListener('focus', () => sfx.hover());
  setIconHref($('.sprite-use', node), hero.id);
  trySpritePng($('.sprite', node), hero.id);
  return node;
}

// ---------- combo rows ----------

function buildCombos() {
  const combosRoot = $('#combos');
  const tpl = $('#combo-row-tpl');
  combosRoot.innerHTML = '';

  let globalIdx = 0;
  state.combos.forEach((combo, comboIdx) => {
    const node = tpl.content.firstElementChild.cloneNode(true);
    node.dataset.combo = combo.id;
    node.style.setProperty('--row-delay', comboIdx);
    $('[data-field="name"]', node).textContent = combo.name;
    $('[data-field="tagline"]', node).textContent = combo.tagline;

    const heroesRoot = $('[data-field="heroes"]', node);
    combo.heroIds.forEach((hid) => {
      const hero = state.heroById.get(hid);
      if (!hero) return;
      const card = buildHeroCard(hero);
      card.style.setProperty('--stagger-delay', globalIdx++);
      heroesRoot.appendChild(card);
    });

    combosRoot.appendChild(node);
  });
}

// ---------- team filters ----------

function buildFilters() {
  const root = $('#teamFilters');
  root.innerHTML = '';

  const all = document.createElement('button');
  all.className = 'team-filter is-active';
  all.textContent = 'ALL TEAMS';
  all.dataset.filter = 'all';
  all.addEventListener('click', () => applyFilter('all'));
  root.appendChild(all);

  state.combos.forEach((combo) => {
    const btn = document.createElement('button');
    btn.className = 'team-filter';
    btn.textContent = combo.name;
    btn.dataset.filter = combo.id;
    btn.addEventListener('click', () => applyFilter(combo.id));
    root.appendChild(btn);
  });
}

function applyFilter(filterId) {
  state.activeFilter = filterId;
  sfx.filter();
  $$('.team-filter').forEach((btn) => {
    btn.classList.toggle('is-active', btn.dataset.filter === filterId);
  });
  $$('.combo-row').forEach((row) => {
    const matches = filterId === 'all' || row.dataset.combo === filterId;
    row.classList.toggle('is-dimmed', !matches);
    row.classList.toggle('is-highlighted', filterId !== 'all' && matches);
  });
  // scroll the highlighted combo into view if filtering
  if (filterId !== 'all') {
    const target = document.querySelector(`.combo-row[data-combo="${filterId}"]`);
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

// ---------- detail panel ----------

function renderDetail(hero) {
  const detail = $('#detail');
  const tpl = $('#detail-tpl');
  const node = tpl.content.firstElementChild.cloneNode(true);

  const combo = state.comboByHero.get(hero.id);

  $('[data-field="name"]', node).textContent = hero.name;
  $('[data-field="title"]', node).textContent = `"${hero.title}"`;
  $('[data-field="type"]', node).textContent = hero.type;
  $('[data-field="description"]', node).textContent = hero.description;
  $('[data-field="howIUse"]', node).textContent = hero.howIUse;

  const installCmd = `npx skills add thedesignproject/agent-skills -s ${hero.id}`;
  $('[data-field="installCmd"]', node).textContent = installCmd;

  // best used with — other heroes in the same combo
  const bestRoot = $('.best-with-chips', node);
  const bestSection = $('.best-with', node);
  if (combo && combo.heroIds.length > 1) {
    combo.heroIds
      .filter((hid) => hid !== hero.id)
      .forEach((hid) => {
        const buddy = state.heroById.get(hid);
        if (!buddy) return;
        const chip = document.createElement('a');
        chip.className = 'best-with-chip';
        chip.href = '#';
        chip.innerHTML = `<span class="chip-dot"></span>${buddy.name}`;
        chip.addEventListener('click', (e) => {
          e.preventDefault();
          selectHero(buddy.id);
        });
        bestRoot.appendChild(chip);
      });
  } else {
    bestSection.style.display = 'none';
  }

  // copy button
  $('[data-action="copy"]', node).addEventListener('click', () => {
    navigator.clipboard.writeText(installCmd).then(() => {
      const btn = $('[data-action="copy"]', node);
      btn.classList.add('is-copied');
      btn.textContent = 'COPIED!';
      sfx.copy();
      showToast('// INSTALL COMMAND COPIED');
      setTimeout(() => {
        btn.classList.remove('is-copied');
        btn.textContent = 'COPY';
      }, 1400);
    });
  });

  // engage button
  const engage = $('[data-action="engage"]', node);
  engage.href = `${SKILLS_PATH}/${hero.id}`;
  engage.addEventListener('click', () => sfx.engage());

  setIconHref($('.portrait-use', node), hero.id);
  trySpritePng($('.detail-portrait', node), hero.id);

  detail.innerHTML = '';
  detail.appendChild(node);
}

function selectHero(id) {
  const hero = state.heroById.get(id);
  if (!hero) return;
  state.selectedId = id;

  $$('.hero').forEach((el) => el.classList.toggle('is-selected', el.dataset.id === id));
  renderDetail(hero);

  // glitch transition
  const detail = $('#detail');
  if (detail) {
    detail.classList.remove('is-glitching');
    void detail.offsetWidth; // force reflow to restart animation
    detail.classList.add('is-glitching');
    setTimeout(() => detail.classList.remove('is-glitching'), 240);
  }

  sfx.select();
}

// ---------- toast ----------

let toastTimer = null;
function showToast(msg, opts = {}) {
  let toast = $('#toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.classList.toggle('is-achievement', !!opts.achievement);
  toast.classList.add('is-visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('is-visible'), opts.achievement ? 2400 : 1600);
}

// ---------- sound toggle ----------

function wireSoundToggle() {
  const btn = $('#soundToggle');
  const stateLabel = $('#soundState');
  btn.addEventListener('click', () => {
    state.soundOn = !state.soundOn;
    stateLabel.textContent = state.soundOn ? 'ON' : 'OFF';
    btn.setAttribute('aria-pressed', String(state.soundOn));
    if (state.soundOn) sfx.copy();
  });
}

// ---------- keyboard navigation ----------

function wireKeyboard() {
  document.addEventListener('keydown', (e) => {
    const cards = $$('.hero');
    const currentIdx = cards.findIndex((el) => el.dataset.id === state.selectedId);
    if (currentIdx === -1) return;

    let nextIdx = null;
    if (e.key === 'ArrowRight') nextIdx = Math.min(currentIdx + 1, cards.length - 1);
    if (e.key === 'ArrowLeft') nextIdx = Math.max(currentIdx - 1, 0);
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      // jump to next/prev combo row's first hero
      const currentEl = cards[currentIdx];
      const row = currentEl.closest('.combo-row');
      const rows = $$('.combo-row');
      const rowIdx = rows.indexOf(row);
      const nextRow = rows[rowIdx + (e.key === 'ArrowDown' ? 1 : -1)];
      if (nextRow) {
        const firstHero = $('.hero', nextRow);
        if (firstHero) nextIdx = cards.indexOf(firstHero);
      }
    }
    if (e.key === 'Enter') {
      const engage = $('[data-action="engage"]');
      if (engage) engage.click();
      return;
    }

    if (nextIdx !== null && nextIdx !== currentIdx) {
      e.preventDefault();
      const nextId = cards[nextIdx].dataset.id;
      selectHero(nextId);
      cards[nextIdx].focus();
    }
  });
}

// ---------- custom cursor ----------

function setupCursor() {
  if (!matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  const cursor = document.createElement('div');
  cursor.className = 'cursor';
  cursor.setAttribute('aria-hidden', 'true');
  cursor.innerHTML = `
    <svg viewBox="0 0 12 12" shape-rendering="crispEdges" xmlns="http://www.w3.org/2000/svg">
      <rect x="1" y="1" width="1" height="11" fill="#fff"/>
      <rect x="2" y="2" width="1" height="9"  fill="#fff"/>
      <rect x="3" y="3" width="1" height="7"  fill="#fff"/>
      <rect x="4" y="4" width="1" height="5"  fill="#fff"/>
      <rect x="5" y="5" width="1" height="3"  fill="#fff"/>
      <rect x="6" y="6" width="1" height="1"  fill="#fff"/>
    </svg>
  `;
  document.body.appendChild(cursor);

  let raf = 0;
  let x = -100, y = -100;
  document.addEventListener('mousemove', (e) => {
    x = e.clientX;
    y = e.clientY;
    if (!raf) {
      raf = requestAnimationFrame(() => {
        cursor.style.transform = `translate3d(${x}px, ${y}px, 0)`;
        raf = 0;
      });
    }
  }, { passive: true });

  document.addEventListener('mouseover', (e) => {
    const isClickable = e.target.closest('button, a, [role="button"], .hero, .best-with-chip');
    cursor.classList.toggle('is-pointer', !!isClickable);
  });

  // hide on touch
  document.addEventListener('touchstart', () => {
    cursor.style.display = 'none';
  }, { once: true, passive: true });
}

// ---------- grain noise overlay ----------

function setupGrain() {
  const size = 96;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d');
  const img = ctx.createImageData(size, size);
  for (let i = 0; i < img.data.length; i += 4) {
    const v = (Math.random() * 255) | 0;
    img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
    img.data[i + 3] = 12; // very subtle
  }
  ctx.putImageData(img, 0, 0);
  document.documentElement.style.setProperty('--noise-tile', `url("${canvas.toDataURL()}")`);
}

// ---------- boot intro ----------

function setupBoot() {
  const boot = document.getElementById('boot');
  if (!boot) return Promise.resolve();

  // play a 4-note arpeggio with the boot
  sfx.boot();

  return new Promise((resolve) => {
    let dismissed = false;
    const dismiss = () => {
      if (dismissed) return;
      dismissed = true;
      boot.classList.add('is-leaving');
      document.body.classList.add('is-booted');
      setTimeout(() => {
        boot.remove();
        resolve();
      }, 720);
    };
    boot.addEventListener('click', dismiss);
    const keyHandler = (e) => {
      if (e.key === ' ' || e.key === 'Enter' || e.key === 'Escape') {
        dismiss();
        document.removeEventListener('keydown', keyHandler);
      }
    };
    document.addEventListener('keydown', keyHandler);
    // auto-advance after the full sequence (~4.2s)
    setTimeout(dismiss, 4200);
  });
}

// ---------- konami code ----------

const KONAMI = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];

function setupKonami() {
  let idx = 0;
  document.addEventListener('keydown', (e) => {
    const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    const expected = KONAMI[idx];
    if (key === (expected.length === 1 ? expected.toLowerCase() : expected)) {
      idx++;
      if (idx === KONAMI.length) {
        idx = 0;
        triggerArcadeMode();
      }
    } else {
      idx = key === KONAMI[0] ? 1 : 0;
    }
  });
}

function triggerArcadeMode() {
  const on = document.body.classList.toggle('is-arcade-mode');
  showToast(on ? '// ARCADE MODE UNLOCKED' : '// ARCADE MODE OFF', { achievement: true });
  if (on) sfx.achievement(); else sfx.copy();
}

// ---------- init ----------

(async function init() {
  try {
    setupCursor();
    setupGrain();
    setupKonami();
    const { heroes, combos } = await loadData();
    indexData(heroes, combos);
    buildFilters();
    buildCombos();
    wireSoundToggle();
    wireKeyboard();
    selectHero(state.heroes[0].id);
    await setupBoot();
  } catch (err) {
    console.error(err);
    $('#detail').innerHTML = `<p style="color:#fff;padding:24px;font-family:'Press Start 2P',monospace;font-size:10px;">ERROR LOADING: ${err.message}</p>`;
  }
})();
