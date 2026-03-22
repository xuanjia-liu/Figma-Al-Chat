/**
 * Google Fonts catalog preview (metadata from fonts.google.com, same source as the public site).
 * Feeling / Appearance pills use heuristics on family metadata (category, subsets, name patterns).
 */
import bundledFontFamilies from '../../data/google-fonts-catalog-slim.json';

const LANGUAGE_OPTIONS = [
  { value: '', labelKey: 'actions.fontPreview.langAll' },
  { value: 'japanese', labelKey: 'actions.fontPreview.langJapanese', subset: 'japanese' },
  { value: 'korean', labelKey: 'actions.fontPreview.langKorean', subset: 'korean' },
  { value: 'chinese-simplified', labelKey: 'actions.fontPreview.langChineseSimplified', subset: 'chinese-simplified' },
  { value: 'chinese-traditional', labelKey: 'actions.fontPreview.langChineseTraditional', subset: 'chinese-traditional' },
  { value: 'arabic', labelKey: 'actions.fontPreview.langArabic', subset: 'arabic' },
  { value: 'hebrew', labelKey: 'actions.fontPreview.langHebrew', subset: 'hebrew' },
  { value: 'devanagari', labelKey: 'actions.fontPreview.langDevanagari', subset: 'devanagari' },
  { value: 'thai', labelKey: 'actions.fontPreview.langThai', subset: 'thai' },
  { value: 'tamil', labelKey: 'actions.fontPreview.langTamil', subset: 'tamil' },
  { value: 'bengali', labelKey: 'actions.fontPreview.langBengali', subset: 'bengali' },
  { value: 'latin', labelKey: 'actions.fontPreview.langLatin', subset: 'latin' },
];

const SCRIPT_OPTIONS = [
  { value: '', labelKey: 'actions.fontPreview.scriptAny' },
  { value: 'latin-ext', labelKey: 'actions.fontPreview.scriptLatinExt', subset: 'latin-ext' },
  { value: 'cyrillic', labelKey: 'actions.fontPreview.scriptCyrillic', subset: 'cyrillic' },
  { value: 'cyrillic-ext', labelKey: 'actions.fontPreview.scriptCyrillicExt', subset: 'cyrillic-ext' },
  { value: 'greek', labelKey: 'actions.fontPreview.scriptGreek', subset: 'greek' },
  { value: 'vietnamese', labelKey: 'actions.fontPreview.scriptVietnamese', subset: 'vietnamese' },
];

const FEELING_TAGS = [
  ['Business', 'Fancy'],
  ['Calm', 'Playful'],
  ['Cute', 'Artistic'],
  ['Vintage', 'Loud'],
  ['Sophisticated', 'Futuristic'],
  ['Active', 'Stiff'],
  ['Innovative', 'Happy'],
  ['Childlike', 'Rugged'],
  ['Awkward', 'EXCITED'],
];

const APPEARANCE_TAGS = [
  ['Techno', 'Monospaced'],
  ['Blobby', 'Marker'],
  ['Art Deco', 'Art Nouveau'],
  ['Distressed', 'Stencil'],
  ['Wood type', 'Medieval'],
  ['Blackletter', 'Pixel'],
  ['Not text', 'Tuscan'],
  ['WACKY', 'Shaded'],
  ['Inline', '—'],
];

function familyLower(f) {
  return String(f.family || '').toLowerCase();
}

function hasSubset(f, key) {
  return Array.isArray(f.subsets) && f.subsets.includes(key);
}

function thicknessOf(f) {
  if (typeof f.thickness === 'number') return f.thickness;
  const w400 = f.fonts && f.fonts['400'];
  return w400 && typeof w400.thickness === 'number' ? w400.thickness : 5;
}

/** @type {Record<string, (f: object) => boolean>} */
const FEELING_TEST = {
  Business: f => f.category === 'Sans Serif' && !f.classifications?.includes('Handwriting'),
  Calm: f => f.category === 'Sans Serif' || f.category === 'Serif',
  Cute: f =>
    f.category === 'Handwriting' ||
    /cute|round|bubble|comic|sniglet|quicksand|fredoka|nunito|comfortaa/i.test(familyLower(f)),
  Vintage: f =>
    f.category === 'Serif' ||
    /retro|vintage|old|classic|steam|western|slab|abril|playfair|cardo/i.test(familyLower(f)),
  Sophisticated: f => f.category === 'Serif' || f.stroke === 'Serif',
  Active: f => f.category === 'Display' || /sport|speed|race|impact|anton|bebas/i.test(familyLower(f)),
  Innovative: f => f.category === 'Display' && !f.classifications?.includes('Handwriting'),
  Childlike: f =>
    /school|kids|child|bangers|bubble|marker|crayon|finger/i.test(familyLower(f)) ||
    f.category === 'Handwriting',
  Awkward: f => /wonky|irregular|creepster|eater|bungee/i.test(familyLower(f)),
  Fancy: f =>
    f.category === 'Display' ||
    /fancy|script|great|dancing|great vibes|parisienne|lobster/i.test(familyLower(f)),
  Playful: f =>
    f.category === 'Handwriting' ||
    /play|fun|game|bungee|righteous|chewy/i.test(familyLower(f)),
  Artistic: f => f.category === 'Display' || f.category === 'Handwriting',
  Loud: f =>
    (f.category === 'Display' && thicknessOf(f) >= 7) ||
    /black|heavy|fat|ultra|impact|anton|bebas/i.test(familyLower(f)),
  Futuristic: f =>
    /orbit|exo|space|techno|future|cyber|electro|rajdhani|audiowide/i.test(familyLower(f)),
  Stiff: f => f.category === 'Sans Serif' && (!f.classifications || f.classifications.length === 0),
  Happy: f =>
    /happy|smile|sunny|sunshine|delight|joy/i.test(familyLower(f)) || f.category === 'Handwriting',
  Rugged: f => /rust|rough|western|stamp|rock|grit|wood/i.test(familyLower(f)),
  EXCITED: f => f.category === 'Display' && /impact|anton|bebas|bungee|black han/i.test(familyLower(f)),
};

/** @type {Record<string, (f: object) => boolean>} */
const APPEARANCE_TEST = {
  Techno: f =>
    /tech|digital|orbit|matrix|electron|lcd|segment|share tech|audiowide/i.test(familyLower(f)) ||
    f.category === 'Monospace',
  Blobby: f => /blob|gummy|soft|plush|chewy|fatface/i.test(familyLower(f)),
  'Art Deco': f => /deco|gatsby|metropolis|cinzel|poiret|great gatsby/i.test(familyLower(f)),
  Distressed: f => /distress|rough|grunge|erosion|stamp|weather/i.test(familyLower(f)),
  'Wood type': f => /wood|western|wanted|rizoma|slab/i.test(familyLower(f)) || f.stroke === 'Slab Serif',
  Blackletter: f =>
    /fraktur|black|gothic|unifraktur|pirate|textur|old english|medieval sharp/i.test(familyLower(f)),
  'Not text': f =>
    f.classifications?.includes('Symbols') || hasSubset(f, 'symbols') || hasSubset(f, 'symbols2'),
  WACKY: f => /wacky|weird|zany|creepster|frijole|bungee outline/i.test(familyLower(f)),
  Inline: f => /inline|outline|hollow|contour/i.test(familyLower(f)),
  Monospaced: f => f.category === 'Monospace' || f.classifications?.includes('Monospace'),
  Marker: f =>
    /marker|pen|brush|scrib|handwrit|permanent/i.test(familyLower(f)) && f.category === 'Handwriting',
  'Art Nouveau': f => /nouveau|jugend|belle|poiret/i.test(familyLower(f)),
  Stencil: f => /stencil|army|cut|plaster/i.test(familyLower(f)),
  Medieval: f => /medieval|uncial|cinzel decorative|pirata/i.test(familyLower(f)),
  Pixel: f => /pixel|dos|8-?bit|vt323|press start|retro gaming/i.test(familyLower(f)),
  Tuscan: f => /tuscan|western|spurs|rizoma/i.test(familyLower(f)),
  Shaded: f => /shade|shadow|emboss|3d|extrusion/i.test(familyLower(f)),
  '—': () => false,
};

function escapeAttr(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;');
}

/** @param {object | undefined} f */
function gfpWghtBounds(f) {
  if (f && typeof f.wghtMin === 'number' && typeof f.wghtMax === 'number') {
    return { min: f.wghtMin, max: f.wghtMax };
  }
  return { min: 100, max: 900 };
}

/** @param {object | undefined} f */
function gfpWghtCssParam(f) {
  if (f && typeof f.wghtCss === 'string' && f.wghtCss.length > 0) return f.wghtCss;
  return '100..900';
}

function gfpClampWght(f, w) {
  const { min, max } = gfpWghtBounds(f);
  return Math.min(max, Math.max(min, w));
}

/**
 * @param {HTMLElement} container
 * @param {{ tu: (k: string) => string; showToast: (msg: string, type?: string) => void }} deps
 * @returns {() => void}
 */
export function mountGoogleFontPreview(container, { tu, showToast }) {
  let disposed = false;
  let allFamilies = [];
  /** @type {Map<string, object>} */
  let familyByName = new Map();
  const loadedCss = new Set();
  /** @type {IntersectionObserver | null} */
  let listObserver = null;

  const state = {
    previewText: '',
    fontSizePx: 40,
    fontWght: 400,
    search: '',
    langSubset: '',
    scriptSubset: '',
    feeling: new Set(),
    appearance: new Set(),
    filtered: [],
    renderOffset: 0,
  };

  const BATCH = 48;

  container.innerHTML = `
    <div class="gfp-root">
      <aside class="gfp-sidebar" aria-label="${escapeAttr(tu('actions.fontPreview.filtersAria'))}">
        <section class="gfp-filter-block">
          <div class="gfp-filter-heading">
            <span class="gfp-filter-heading-icon" aria-hidden="true">🌐</span>
            ${escapeAttr(tu('actions.fontPreview.language'))}
          </div>
          <div class="gfp-lang-row">
            <select class="gfp-select gfp-lang-primary" aria-label="${escapeAttr(tu('actions.fontPreview.languagePrimaryAria'))}"></select>
            <select class="gfp-select gfp-lang-secondary" aria-label="${escapeAttr(tu('actions.fontPreview.languageSecondaryAria'))}"></select>
          </div>
        </section>
        <section class="gfp-filter-block">
          <div class="gfp-filter-heading">
            <span class="gfp-filter-heading-icon" aria-hidden="true">☺</span>
            ${escapeAttr(tu('actions.fontPreview.feeling'))}
          </div>
          <div class="gfp-tag-grid" data-group="feeling"></div>
        </section>
        <section class="gfp-filter-block">
          <div class="gfp-filter-heading">
            <span class="gfp-filter-heading-icon" aria-hidden="true">👕</span>
            ${escapeAttr(tu('actions.fontPreview.appearance'))}
          </div>
          <div class="gfp-tag-grid" data-group="appearance"></div>
        </section>
      </aside>
      <div class="gfp-main">
        <section class="gfp-preview-block">
          <div class="gfp-preview-label-row">
            <div class="gfp-section-label">${escapeAttr(tu('actions.fontPreview.preview'))}</div>
            <button type="button" class="gfp-get-selection-btn">${escapeAttr(tu('actions.fontPreview.getFromSelection'))}</button>
          </div>
          <textarea class="gfp-preview-input" rows="4"></textarea>
        </section>
        <div class="gfp-toolbar">
          <input type="search" class="gfp-search" placeholder="${escapeAttr(tu('actions.fontPreview.searchFamilies'))}" />
          <select class="gfp-size-select" aria-label="${escapeAttr(tu('actions.fontPreview.size'))}"></select>
          <select class="gfp-weight-select" aria-label="${escapeAttr(tu('actions.fontPreview.weight'))}"></select>
        </div>
        <div class="gfp-size-slider-row">
          <input type="range" class="gfp-size-range" min="10" max="120" step="1" value="40" aria-label="${escapeAttr(tu('actions.fontPreview.size'))}" />
        </div>
        <div class="gfp-weight-slider-row">
          <input type="range" class="gfp-weight-range" min="1" max="1000" step="1" value="400" aria-label="${escapeAttr(tu('actions.fontPreview.weight'))}" />
        </div>
        <div class="gfp-list-meta"><span class="gfp-count"></span></div>
        <div class="gfp-list-scroll">
          <div class="gfp-list"></div>
          <div class="gfp-list-sentinel"></div>
        </div>
      </div>
    </div>
  `;

  const textarea = container.querySelector('.gfp-preview-input');
  const getSelectionBtn = container.querySelector('.gfp-get-selection-btn');
  const sizeSelect = container.querySelector('.gfp-size-select');
  const sizeRange = container.querySelector('.gfp-size-range');
  const weightSelect = container.querySelector('.gfp-weight-select');
  const weightRange = container.querySelector('.gfp-weight-range');
  const langPrimary = container.querySelector('.gfp-lang-primary');
  const langSecondary = container.querySelector('.gfp-lang-secondary');
  const feelingGrid = container.querySelector('.gfp-tag-grid[data-group="feeling"]');
  const appearanceGrid = container.querySelector('.gfp-tag-grid[data-group="appearance"]');
  const searchInput = container.querySelector('.gfp-search');
  const listEl = container.querySelector('.gfp-list');
  const sentinel = container.querySelector('.gfp-list-sentinel');
  const countEl = container.querySelector('.gfp-count');
  const scrollBox = container.querySelector('.gfp-list-scroll');

  textarea.placeholder = tu('actions.fontPreview.placeholder');

  // One option per px so slider and select stay in sync (sparse presets left blanks when value had no <option>)
  const sizeOpts = [];
  for (let px = 10; px <= 120; px++) {
    sizeOpts.push(`<option value="${px}"${px === 40 ? ' selected' : ''}>${px}px</option>`);
  }
  sizeSelect.innerHTML = sizeOpts.join('');

  const weightOpts = [];
  for (let w = 1; w <= 1000; w++) {
    weightOpts.push(`<option value="${w}"${w === 400 ? ' selected' : ''}>${w}</option>`);
  }
  weightSelect.innerHTML = weightOpts.join('');

  function fillLangSelect(sel, options) {
    sel.innerHTML = options
      .map(o => {
        const label = tu(o.labelKey);
        const sub = o.subset || '';
        return `<option value="${escapeAttr(sub)}">${escapeAttr(label)}</option>`;
      })
      .join('');
  }

  fillLangSelect(langPrimary, LANGUAGE_OPTIONS);
  fillLangSelect(langSecondary, SCRIPT_OPTIONS);

  function renderTagGrid(grid, pairs, group) {
    const parts = [];
    for (const [a, b] of pairs) {
      for (const tag of [a, b]) {
        if (!tag || tag === '—') continue;
        const test = group === 'feeling' ? FEELING_TEST[tag] : APPEARANCE_TEST[tag];
        if (!test) continue;
        parts.push(
          `<button type="button" class="gfp-tag" data-group="${group}" data-tag="${escapeAttr(tag)}">${escapeAttr(tag)}</button>`
        );
      }
    }
    grid.innerHTML = parts.join('');
  }

  renderTagGrid(feelingGrid, FEELING_TAGS, 'feeling');
  renderTagGrid(appearanceGrid, APPEARANCE_TAGS, 'appearance');

  function applyFilters() {
    const q = state.search.trim().toLowerCase();
    const needFeeling = state.feeling.size > 0;
    const needAppearance = state.appearance.size > 0;

    state.filtered = allFamilies.filter(f => {
      if (q && !familyLower(f).includes(q)) return false;
      if (state.langSubset && !hasSubset(f, state.langSubset)) return false;
      if (state.scriptSubset && !hasSubset(f, state.scriptSubset)) return false;
      if (needFeeling) {
        const ok = [...state.feeling].some(tag => FEELING_TEST[tag]?.(f));
        if (!ok) return false;
      }
      if (needAppearance) {
        const ok = [...state.appearance].some(tag => APPEARANCE_TEST[tag]?.(f));
        if (!ok) return false;
      }
      return true;
    });
    state.renderOffset = 0;
    listEl.innerHTML = '';
    countEl.textContent = tu('actions.fontPreview.showingCount', {
      shown: Math.min(BATCH, state.filtered.length),
      total: state.filtered.length,
    });
    appendBatch();
  }

  function loadFontCss(family) {
    if (loadedCss.has(family) || disposed) return;
    loadedCss.add(family);
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.dataset.gfpFont = '1';
    const enc = family.replace(/\s+/g, '+');
    const f = familyByName.get(family);
    const wParam = gfpWghtCssParam(f);
    link.href = `https://fonts.googleapis.com/css2?family=${enc}:wght@${wParam}&display=swap`;
    document.head.appendChild(link);
  }

  function appendBatch() {
    const end = Math.min(state.renderOffset + BATCH, state.filtered.length);
    const frag = document.createDocumentFragment();
    for (let i = state.renderOffset; i < end; i++) {
      const f = state.filtered[i];
      const row = document.createElement('div');
      row.className = 'gfp-font-row';
      row.dataset.family = f.family;
      const label = document.createElement('div');
      label.className = 'gfp-font-name';
      label.textContent = f.family;
      const sample = document.createElement('div');
      sample.className = 'gfp-font-sample';
      sample.textContent = state.previewText || tu('actions.fontPreview.placeholder');
      sample.style.fontSize = `${state.fontSizePx}px`;
      sample.style.fontWeight = String(gfpClampWght(f, state.fontWght));
      sample.style.fontFamily = `'${f.family.replace(/'/g, "\\'")}', var(--font-ui, system-ui)`;
      row.appendChild(label);
      row.appendChild(sample);
      frag.appendChild(row);
    }
    listEl.appendChild(frag);
    state.renderOffset = end;
    countEl.textContent = tu('actions.fontPreview.showingCount', {
      shown: state.renderOffset,
      total: state.filtered.length,
    });
  }

  function setupListObserver() {
    if (listObserver) listObserver.disconnect();
    listObserver = new IntersectionObserver(
      entries => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          if (state.renderOffset >= state.filtered.length) continue;
          appendBatch();
        }
      },
      { root: scrollBox, rootMargin: '120px', threshold: 0 }
    );
    listObserver.observe(sentinel);
  }

  function onRowVisible(row) {
    const fam = row.dataset.family;
    if (fam) loadFontCss(fam);
  }

  const rowObserver = new IntersectionObserver(
    entries => {
      for (const e of entries) {
        if (e.isIntersecting) onRowVisible(e.target);
      }
    },
    { root: scrollBox, rootMargin: '80px', threshold: 0 }
  );

  const mo = new MutationObserver(muts => {
    for (const m of muts) {
      m.addedNodes.forEach(node => {
        if (node.nodeType === 1 && node.classList?.contains('gfp-font-row')) {
          rowObserver.observe(node);
        }
      });
    }
  });
  mo.observe(listEl, { childList: true });

  textarea.addEventListener('input', () => {
    state.previewText = textarea.value;
    listEl.querySelectorAll('.gfp-font-sample').forEach(el => {
      el.textContent = state.previewText || tu('actions.fontPreview.placeholder');
    });
  });

  let pendingSelectionText = false;
  function onFontPreviewSelectionTextMessage(ev) {
    const pm = ev.data?.pluginMessage;
    if (!pm || pm.type !== 'font-preview-selection-text-result') return;
    pendingSelectionText = false;
    if (getSelectionBtn) getSelectionBtn.disabled = false;
    if (pm.error === 'empty') {
      showToast(tu('actions.fontPreview.getSelectionEmpty'), 'error');
      return;
    }
    if (pm.error === 'noText') {
      showToast(tu('actions.fontPreview.getSelectionNoText'), 'error');
      return;
    }
    if (typeof pm.text === 'string') {
      textarea.value = pm.text;
      textarea.dispatchEvent(new Event('input', { bubbles: true }));
    }
  }
  window.addEventListener('message', onFontPreviewSelectionTextMessage);

  if (getSelectionBtn) {
    getSelectionBtn.addEventListener('click', () => {
      if (pendingSelectionText) return;
      pendingSelectionText = true;
      getSelectionBtn.disabled = true;
      parent.postMessage({ pluginMessage: { type: 'get-font-preview-selection-text' } }, '*');
    });
  }

  function syncSize(fromRange) {
    let px = fromRange ? parseInt(sizeRange.value, 10) : parseInt(sizeSelect.value, 10);
    if (Number.isNaN(px)) px = 40;
    px = Math.min(120, Math.max(10, px));
    state.fontSizePx = px;
    sizeSelect.value = String(px);
    sizeRange.value = String(px);
    listEl.querySelectorAll('.gfp-font-sample').forEach(el => {
      el.style.fontSize = `${px}px`;
    });
  }

  function applyWeightToSamples() {
    listEl.querySelectorAll('.gfp-font-row').forEach(row => {
      const name = row.dataset.family;
      const meta = familyByName.get(name);
      const sample = row.querySelector('.gfp-font-sample');
      if (sample) sample.style.fontWeight = String(gfpClampWght(meta, state.fontWght));
    });
  }

  function syncWeight(fromRange) {
    let w = fromRange ? parseInt(weightRange.value, 10) : parseInt(weightSelect.value, 10);
    if (Number.isNaN(w)) w = 400;
    w = Math.min(1000, Math.max(1, w));
    state.fontWght = w;
    weightSelect.value = String(w);
    weightRange.value = String(w);
    applyWeightToSamples();
  }

  sizeSelect.addEventListener('change', () => syncSize(false));
  sizeRange.addEventListener('input', () => syncSize(true));
  weightSelect.addEventListener('change', () => syncWeight(false));
  weightRange.addEventListener('input', () => syncWeight(true));

  langPrimary.addEventListener('change', () => {
    state.langSubset = langPrimary.value;
    applyFilters();
    setupListObserver();
  });
  langSecondary.addEventListener('change', () => {
    state.scriptSubset = langSecondary.value;
    applyFilters();
    setupListObserver();
  });

  searchInput.addEventListener('input', () => {
    state.search = searchInput.value;
    applyFilters();
    setupListObserver();
  });

  container.addEventListener('click', ev => {
    const btn = ev.target.closest('.gfp-tag');
    if (!btn) return;
    const group = btn.dataset.group;
    const tag = btn.dataset.tag;
    const set = group === 'feeling' ? state.feeling : state.appearance;
    if (set.has(tag)) {
      set.delete(tag);
      btn.classList.remove('gfp-tag--on');
    } else {
      set.add(tag);
      btn.classList.add('gfp-tag--on');
    }
    applyFilters();
    setupListObserver();
  });

  function loadCatalog() {
    listEl.innerHTML = `<div class="gfp-loading">${escapeAttr(tu('actions.fontPreview.loading'))}</div>`;

    const fallback = Array.isArray(bundledFontFamilies) ? bundledFontFamilies : [];
    let settled = false;

    function finish(families, usedFallback) {
      if (settled || disposed) return;
      settled = true;
      clearTimeout(timeoutId);
      window.removeEventListener('plugin-google-fonts-catalog', onPluginCatalog);

      const list = Array.isArray(families) ? families : [];
      if (list.length === 0) {
        listEl.innerHTML = `<div class="gfp-error">${escapeAttr(tu('actions.fontPreview.loadError'))}</div>`;
        showToast(tu('actions.fontPreview.loadError'), 'error');
        return;
      }
      allFamilies = list;
      allFamilies.sort((a, b) => (a.popularity || 9999) - (b.popularity || 9999));
      familyByName = new Map(allFamilies.map(f => [f.family, f]));
      listEl.innerHTML = '';
      applyFilters();
      setupListObserver();
      if (usedFallback && fallback.length > 0) {
        showToast(tu('actions.fontPreview.usingBundledCatalog'), 'info');
      }
    }

    function onPluginCatalog(ev) {
      const msg = ev.detail;
      if (!msg || msg.type !== 'google-fonts-catalog-result') return;
      if (msg.error || !Array.isArray(msg.families) || msg.families.length === 0) {
        finish(fallback.length ? fallback : [], true);
        return;
      }
      finish(msg.families, false);
    }

    window.addEventListener('plugin-google-fonts-catalog', onPluginCatalog);
    const timeoutId = setTimeout(() => finish(fallback, fallback.length > 0), 8000);

    parent.postMessage({ pluginMessage: { type: 'fetch-google-fonts-catalog' } }, '*');
  }

  syncSize(false);
  syncWeight(false);
  loadCatalog();

  return () => {
    disposed = true;
    window.removeEventListener('message', onFontPreviewSelectionTextMessage);
    if (listObserver) listObserver.disconnect();
    rowObserver.disconnect();
    mo.disconnect();
    document.querySelectorAll('link[data-gfp-font]').forEach(l => l.remove());
    loadedCss.clear();
    container.innerHTML = '';
  };
}
