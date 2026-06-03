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

function buildHeroCard(hero) {
  const tpl = $('#hero-card-tpl');
  const node = tpl.content.firstElementChild.cloneNode(true);
  node.dataset.id = hero.id;
  node.style.setProperty('--hero-color', hero.color);
  $('.hero-name', node).textContent = hero.name;
  node.setAttribute('aria-label', `${hero.name}, ${hero.title}. Type ${hero.type}.`);
  node.addEventListener('click', () => selectHero(hero.id));
  node.addEventListener('mouseenter', () => sfx.hover());
  node.addEventListener('focus', () => sfx.hover());
  trySpritePng($('.sprite', node), hero.id);
  return node;
}

// ---------- combo rows ----------

function buildCombos() {
  const combosRoot = $('#combos');
  const tpl = $('#combo-row-tpl');
  combosRoot.innerHTML = '';

  state.combos.forEach((combo) => {
    const node = tpl.content.firstElementChild.cloneNode(true);
    node.dataset.combo = combo.id;
    node.style.setProperty('--combo-color', combo.color);
    $('[data-field="name"]', node).textContent = combo.name;
    $('[data-field="tagline"]', node).textContent = combo.tagline;

    const heroesRoot = $('[data-field="heroes"]', node);
    combo.heroIds.forEach((hid) => {
      const hero = state.heroById.get(hid);
      if (hero) heroesRoot.appendChild(buildHeroCard(hero));
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
    btn.style.setProperty('--filter-color', combo.color);
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

  node.style.setProperty('--hero-color', hero.color);

  const combo = state.comboByHero.get(hero.id);

  $('[data-field="name"]', node).textContent = hero.name;
  $('[data-field="title"]', node).textContent = `"${hero.title}"`;
  $('[data-field="type"]', node).textContent = hero.type;
  $('[data-field="description"]', node).textContent = hero.description;
  $('[data-field="howIUse"]', node).textContent = hero.howIUse;

  const installCmd = `cp -R skills/${hero.id} ~/.claude/skills/`;
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
        chip.style.setProperty('--chip-color', buddy.color);
        chip.href = '#';
        chip.innerHTML = `<span class="chip-dot" style="background:${buddy.color}"></span>${buddy.name}`;
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
  sfx.select();
}

// ---------- recipes ----------

function buildRecipes() {
  const root = $('#recipesGrid');
  const tpl = $('#recipe-card-tpl');
  root.innerHTML = '';

  state.combos.forEach((combo) => {
    if (!combo.recipe) return;
    const node = tpl.content.firstElementChild.cloneNode(true);
    node.style.setProperty('--recipe-color', combo.color);
    $('[data-field="combo"]', node).textContent = combo.name;
    $('[data-field="title"]', node).textContent = combo.recipe.title;
    $('[data-field="useWhen"]', node).textContent = combo.recipe.useWhen;

    const stepsRoot = $('[data-field="steps"]', node);
    combo.recipe.steps.forEach((step, idx) => {
      const hero = state.heroById.get(step.heroId);
      const li = document.createElement('li');
      li.className = 'recipe-step';
      const heroColor = hero ? hero.color : combo.color;
      const heroLabel = hero ? hero.name : step.heroId.toUpperCase();
      li.innerHTML = `
        <span class="recipe-step-num">${idx + 1}</span>
        <div>
          <a href="#" class="recipe-step-hero" style="--step-hero-color:${heroColor}" data-hero="${step.heroId}">${heroLabel}</a>
          <span class="recipe-step-do">${step.do}</span>
        </div>
      `;
      stepsRoot.appendChild(li);
    });

    // wire hero links in this recipe
    $$('.recipe-step-hero', node).forEach((link) => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        selectHero(link.dataset.hero);
        const detail = $('#detail');
        if (detail) detail.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });

    root.appendChild(node);
  });
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

// ---------- init ----------

(async function init() {
  try {
    const { heroes, combos } = await loadData();
    indexData(heroes, combos);
    buildFilters();
    buildCombos();
    buildRecipes();
    wireSoundToggle();
    wireKeyboard();
    selectHero(state.heroes[0].id);
  } catch (err) {
    console.error(err);
    $('#detail').innerHTML = `<p style="color:#ff3344;padding:24px;font-family:'Press Start 2P',monospace;font-size:10px;">ERROR LOADING: ${err.message}</p>`;
  }
})();
