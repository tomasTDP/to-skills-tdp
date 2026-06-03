// ============================================================
// TO-SKILLS-TDP // Character Select // main.js
// ============================================================

const REPO = 'https://github.com/tomasTDP/to-skills-tdp';
const SKILLS_PATH = `${REPO}/tree/main/skills`;

const STAT_KEYS = ['power', 'craft', 'speed', 'rigor'];
const STAT_LABELS = { power: 'POWER', craft: 'CRAFT', speed: 'SPEED', rigor: 'RIGOR' };

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

const state = {
  heroes: [],
  selectedId: null,
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
};

// ---------- data load ----------

async function loadHeroes() {
  const res = await fetch('heroes.json', { cache: 'no-cache' });
  if (!res.ok) throw new Error(`Failed to load heroes.json: ${res.status}`);
  return res.json();
}

// ---------- rendering ----------

function trySpritePng(spriteEl, heroId) {
  // Attempt to load sprites/<id>.png. If it exists, replace the SVG.
  // If not, leave the SVG placeholder in place.
  const img = new Image();
  img.src = `sprites/${heroId}.png`;
  img.alt = '';
  img.className = 'sprite-png';
  img.addEventListener('load', () => {
    spriteEl.innerHTML = '';
    spriteEl.appendChild(img);
  });
  // on error: keep the SVG placeholder, no action needed
}

function buildGrid(heroes) {
  const grid = $('#grid');
  const tpl = $('#hero-card-tpl');
  grid.innerHTML = '';

  heroes.forEach((hero, idx) => {
    const node = tpl.content.firstElementChild.cloneNode(true);
    node.dataset.id = hero.id;
    node.style.setProperty('--hero-color', hero.color);
    $('.hero-name', node).textContent = hero.name;
    node.setAttribute('aria-label', `${hero.name}, ${hero.title}. Type ${hero.type}.`);
    node.addEventListener('click', () => selectHero(hero.id));
    node.addEventListener('mouseenter', () => sfx.hover());
    node.addEventListener('focus', () => sfx.hover());
    node.style.animationDelay = `${idx * 50}ms`;
    trySpritePng($('.sprite', node), hero.id);
    grid.appendChild(node);
  });
}

function renderDetail(hero) {
  const detail = $('#detail');
  const tpl = $('#detail-tpl');
  const node = tpl.content.firstElementChild.cloneNode(true);

  node.style.setProperty('--hero-color', hero.color);

  $('[data-field="name"]', node).textContent = hero.name;
  $('[data-field="title"]', node).textContent = `"${hero.title}"`;
  $('[data-field="type"]', node).textContent = hero.type;
  $('[data-field="description"]', node).textContent = hero.description;
  $('[data-field="howIUse"]', node).textContent = hero.howIUse;

  const installCmd = `cp -R skills/${hero.id} ~/.claude/skills/`;
  $('[data-field="installCmd"]', node).textContent = installCmd;

  // stats
  const statsRoot = $('[data-field="stats"]', node);
  STAT_KEYS.forEach((key) => {
    const li = document.createElement('li');
    li.className = 'stat';
    const value = hero.stats[key] ?? 0;
    li.innerHTML = `
      <span class="stat-label">${STAT_LABELS[key]}</span>
      <span class="stat-bar"><span class="stat-bar-fill"></span></span>
      <span class="stat-value">${value}</span>
    `;
    statsRoot.appendChild(li);
    // animate bar fill on next frame
    requestAnimationFrame(() => {
      $('.stat-bar-fill', li).style.width = `${value}%`;
    });
  });

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

  // portrait color is inherited from --hero-color; portrait visor/emblem already styled via CSS
  trySpritePng($('.detail-portrait', node), hero.id);

  detail.innerHTML = '';
  detail.appendChild(node);
}

function selectHero(id) {
  const hero = state.heroes.find((h) => h.id === id);
  if (!hero) return;
  state.selectedId = id;

  $$('.hero').forEach((el) => el.classList.toggle('is-selected', el.dataset.id === id));
  renderDetail(hero);
  sfx.select();
}

// ---------- toast ----------

let toastTimer = null;
function showToast(msg) {
  let toast = $('#toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.classList.add('is-visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 1600);
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
    const grid = $$('.hero');
    const cols = 4;
    const currentIdx = grid.findIndex((el) => el.dataset.id === state.selectedId);
    if (currentIdx === -1) return;

    let nextIdx = null;
    if (e.key === 'ArrowRight') nextIdx = Math.min(currentIdx + 1, grid.length - 1);
    if (e.key === 'ArrowLeft') nextIdx = Math.max(currentIdx - 1, 0);
    if (e.key === 'ArrowDown') nextIdx = Math.min(currentIdx + cols, grid.length - 1);
    if (e.key === 'ArrowUp') nextIdx = Math.max(currentIdx - cols, 0);
    if (e.key === 'Enter') {
      const engage = $('[data-action="engage"]');
      if (engage) engage.click();
      return;
    }

    if (nextIdx !== null && nextIdx !== currentIdx) {
      e.preventDefault();
      const nextId = grid[nextIdx].dataset.id;
      selectHero(nextId);
      grid[nextIdx].focus();
    }
  });
}

// ---------- init ----------

(async function init() {
  try {
    state.heroes = await loadHeroes();
    buildGrid(state.heroes);
    wireSoundToggle();
    wireKeyboard();
    // select the first hero by default
    selectHero(state.heroes[0].id);
  } catch (err) {
    console.error(err);
    $('#detail').innerHTML = `<p style="color:#ff3344">ERROR LOADING HEROES: ${err.message}</p>`;
  }
})();
