/**
 * Google Fonts catalog preview (metadata from fonts.google.com, same source as the public site).
 * Feeling / Appearance pills use heuristics on family metadata (category, subsets, name patterns).
 */
import bundledFontFamilies from '../../data/google-fonts-catalog-slim.json';
import { getPairSuggestions } from './font-pair-recommendations.js';

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

/**
 * Approximate language/script filter for local fonts (Figma does not expose Google-style subsets).
 * Uses family-name heuristics; results are imperfect for ambiguous or short names.
 * @param {string} famLower
 * @param {string} lang - same values as LANGUAGE_OPTIONS / Google subset keys
 */
function localFontMatchesLangSubset(famLower, lang) {
  if (!lang) return true;
  switch (lang) {
    case 'japanese':
      return /japanese|japan|(?:^|[\s._-])jp(?:[\s._-]|$)|hiragino|kozuka|gothic|mincho|noto sans jp|noto serif jp|noto sans cjk jp|noto serif cjk jp|source han sans jp|source han serif jp|yu gothic|yu mincho|meiryo|yu gothic ui|ms gothic|ms pgothic|ms mincho|msgothic|ipam|ipaex|mplus 1p|rounded mplus|zen kaku|sarasa|line seed|ヒラギノ|游ゴ|noto.*\bjp\b/i.test(
        famLower
      );
    case 'korean':
      return /korean|hangul|malgun|nanum|pretendard|gulim|dotum|batang|applesdgothic|apple sd gothic|noto sans kr|noto serif kr|source han sans kr|source han serif kr|noto sans cjk kr|yeon sung|black han|본고딕|본명조/i.test(famLower);
    case 'chinese-simplified':
      return /simplified|han sans cn|han serif cn|noto sans cjk sc|noto serif cjk sc|source han sans sc|source han serif sc|pingfang sc|microsoft yahei|yahei|simhei|simsun|nsimsun|kaiti|fangsong|stkaiti|stheiti|wqy|noto sans sc\b|noto serif sc\b|harmonyos sans sc|简体中文|汉仪|华文黑体|华文宋体/i.test(
        famLower
      );
    case 'chinese-traditional':
      return /traditional|han sans tw|han serif tw|noto sans cjk tc|noto serif cjk tc|source han sans tc|source han serif tc|pingfang tc|microsoft jhenghei|jhenghei|noto sans tc\b|noto serif tc\b|標楷|繁體|繁体|黑體|明體|蘋方/i.test(famLower);
    case 'arabic':
      return /\barabic\b|naskh|qalam|amiri|scheherazade|noto sans arabic|noto naskh|dubai|sakkal|traditional arabic|arabic typesetting/i.test(famLower);
    case 'hebrew':
      return /hebrew|david|gisha|arial hebrew|noto sans hebrew|frank ruehl|new peninim/i.test(famLower);
    case 'devanagari':
      return /devanagari|hindi|nagari|noto sans devanagari|noto serif devanagari|mangal|nirmala ui|kokila/i.test(famLower);
    case 'thai':
      return /\bthai\b|noto sans thai|sarabun|leelawadee|cordia new|angsana new|th sarabun/i.test(famLower);
    case 'tamil':
      return /tamil|noto sans tamil|noto serif tamil|latha|vijaya|tamil sangam/i.test(famLower);
    case 'bengali':
      return /bengali|noto sans bengali|noto serif bengali|shonar bangla|vrinda|solaiman/i.test(famLower);
    case 'latin':
      return localFontLikelyLatinPrimary(famLower);
    default:
      return true;
  }
}

/** For "Latin": keep fonts that do not look like non-Latin–only families. */
function localFontLikelyLatinPrimary(famLower) {
  if (
    /hiragino|kozuka|noto sans jp|noto serif jp|noto sans cjk|noto serif cjk|source han sans|source han serif|pingfang|microsoft yahei|jhenghei|simhei|simsun|meiryo|yu gothic|yu mincho|malgun|nanum|applesdgothic|gulim|dotum|pretendard|msgothic|ms mincho|ipaex|\bmplus\b|rounded mplus|line seed jp|black han|yeon sung/i.test(
      famLower
    )
  ) {
    return false;
  }
  if (
    /\b(arabic|hebrew|devanagari|bengali|gurmukhi|khmer|lao|myanmar|sinhala|ethiopic|georgian|mongolian|tibetan|syriac)(?:\s|$|_)/i.test(famLower) &&
    !/(unicode|pan-|global)/i.test(famLower)
  ) {
    return false;
  }
  if ((/\btamil\b|\bthai\b|\bkorean\b|\bhangul\b/i.test(famLower) && !/(latin|unicode)/i.test(famLower))) {
    return false;
  }
  return true;
}

/**
 * CSS font-family for .gfp-font-sample. Latin-only families have no JP glyphs; without a GF
 * Japanese fallback the browser uses system UI fonts, which often only expose ~2 weights.
 */
function gfpJpPreviewFallbackFamily(f) {
  if (f.category === 'Serif') return 'Noto Serif JP';
  return 'Noto Sans JP';
}

function gfpSampleFontFamilyCss(f) {
  const primary = `'${String(f.family || '').replace(/'/g, "\\'")}'`;
  /** Local list uses Figma names; the plugin iframe often has no matching system/@font-face. When the Google catalog lists the same family we load GF CSS — use GF-style stacks for preview. */
  if (f && f.source === 'local' && !f.gfpCatalogMatch) {
    return `${primary}, var(--font-ui, system-ui, sans-serif)`;
  }
  if (hasSubset(f, 'japanese')) {
    return `${primary}, var(--font-ui, system-ui)`;
  }
  const jp = gfpJpPreviewFallbackFamily(f);
  return `${primary}, '${jp.replace(/'/g, "\\'")}', var(--font-ui, system-ui)`;
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

/** @param {(k: string) => string} tu */
function gfpFormatRowWeightStyle(effectiveWght, tu) {
  const w = Math.round(Number(effectiveWght)) || 400;
  let styleKey = 'actions.fontPreview.wghtStyleRegular';
  if (w <= 120) styleKey = 'actions.fontPreview.wghtStyleThin';
  else if (w <= 220) styleKey = 'actions.fontPreview.wghtStyleExtraLight';
  else if (w <= 320) styleKey = 'actions.fontPreview.wghtStyleLight';
  else if (w <= 420) styleKey = 'actions.fontPreview.wghtStyleRegular';
  else if (w <= 520) styleKey = 'actions.fontPreview.wghtStyleMedium';
  else if (w <= 620) styleKey = 'actions.fontPreview.wghtStyleSemiBold';
  else if (w <= 720) styleKey = 'actions.fontPreview.wghtStyleBold';
  else if (w <= 820) styleKey = 'actions.fontPreview.wghtStyleExtraBold';
  else styleKey = 'actions.fontPreview.wghtStyleBlack';
  return tu('actions.fontPreview.weightStyleMeta', { weight: String(w), style: tu(styleKey) });
}

const LOCAL_BOOKMARK_PREFIX = 'LOCAL|';

function parseBookmarkFamilyKey(key) {
  const s = String(key || '');
  if (s.startsWith(LOCAL_BOOKMARK_PREFIX)) {
    return { source: 'local', family: s.slice(LOCAL_BOOKMARK_PREFIX.length) };
  }
  return { source: 'google', family: s };
}

function formatBookmarkFamilyKey(source, family) {
  const fam = String(family || '').trim();
  if (!fam) return '';
  return source === 'local' ? `${LOCAL_BOOKMARK_PREFIX}${fam}` : fam;
}

function gfpSyntheticLocalMeta(family) {
  const fam = String(family || '').trim() || 'Unknown';
  return {
    family: fam,
    source: 'local',
    styles: ['Regular'],
    category: 'Local',
    subsets: [],
    classifications: [],
    stroke: null,
    popularity: 9999,
    thickness: 5,
    wghtMin: 100,
    wghtMax: 900,
    wghtCss: '100..900',
  };
}

function buildLocalFontEntry(family, styles) {
  return {
    family,
    source: 'local',
    styles: Array.isArray(styles) && styles.length ? [...styles] : ['Regular'],
    category: 'Local',
    subsets: [],
    classifications: [],
    stroke: null,
    popularity: 5000,
    thickness: 5,
    wghtMin: 100,
    wghtMax: 900,
    wghtCss: '100..900',
  };
}

/** @param {(k: string, vars?: object) => string} tu */
function gfpFamilyWeightCatalogSummary(f, tu) {
  if (f && f.source === 'local' && Array.isArray(f.styles)) {
    const n = f.styles.length;
    return n <= 1
      ? tu('actions.fontPreview.localFontStylesOne')
      : tu('actions.fontPreview.localFontStylesCount', { count: String(n) });
  }
  const css = f && typeof f.wghtCss === 'string' ? f.wghtCss.trim() : '';
  if (css.includes('..')) {
    return tu('actions.fontPreview.weightFamilyVariable');
  }
  if (css.includes(';')) {
    const n = css.split(';').filter(Boolean).length;
    return n <= 1
      ? tu('actions.fontPreview.weightFamilyOne')
      : tu('actions.fontPreview.weightFamilyCount', { count: String(n) });
  }
  if (css && /^\d+$/.test(css)) {
    return tu('actions.fontPreview.weightFamilyOne');
  }
  if (css) {
    return tu('actions.fontPreview.weightFamilyOne');
  }
  const { min, max } = gfpWghtBounds(f);
  if (min === max) return tu('actions.fontPreview.weightFamilyOne');
  return tu('actions.fontPreview.weightFamilyVariable');
}

function gfpNewBookmarkListId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return `gfp-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

/** @param {string} name */
function gfpSyntheticFamilyMeta(name) {
  const family = String(name || '').trim() || 'Unknown';
  return {
    family,
    category: 'Sans Serif',
    subsets: [],
    classifications: [],
    stroke: null,
    popularity: 9999,
    thickness: 5,
    wghtMin: 100,
    wghtMax: 900,
    wghtCss: '100..900',
  };
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
  /** Lowercase catalog family → canonical name from `familyByName` (for Figma/local name matching). */
  let catalogLowerToCanonical = new Map();
  let allLocalFamilies = [];
  /** @type {Map<string, object>} */
  let localFamilyByName = new Map();
  /** @type {'google' | 'local'} */
  let fontSource = 'google';
  let localFontsLoadAttempted = false;
  const loadedCss = new Set();
  /** @type {IntersectionObserver | null} */
  let listObserver = null;

  const state = {
    previewText: '',
    fontSizePx: 24,
    fontWght: 400,
    viewMode: 'list',
    search: '',
    langSubset: '',
    feeling: new Set(),
    appearance: new Set(),
    filtered: [],
    renderOffset: 0,
  };

  const BATCH = 48;

  container.innerHTML = `
    <div class="gfp-root">
      <aside class="gfp-sidebar" aria-label="${escapeAttr(tu('actions.fontPreview.filtersAria'))}">
        <div class="gfp-sidebar-lang-font-pair">
          <section class="gfp-filter-block">
            <div class="gfp-filter-heading">
              <svg class="gfp-filter-heading-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="10" stroke-linecap="round"/><path stroke-linecap="round" stroke-linejoin="round" d="M2 12h20"/><path stroke-linecap="round" stroke-linejoin="round" d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>
              ${escapeAttr(tu('actions.fontPreview.language'))}
            </div>
            <div class="gfp-lang-row">
              <select class="gfp-select gfp-lang-primary" aria-label="${escapeAttr(tu('actions.fontPreview.languagePrimaryAria'))}"></select>
            </div>
          </section>
          <section class="gfp-filter-block">
            <div class="gfp-filter-heading">
              <svg class="gfp-filter-heading-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"/></svg>
              ${escapeAttr(tu('actions.fontPreview.fontLibraryHeading'))}
            </div>
            <div class="gfp-font-source-row">
              <select class="gfp-select gfp-font-source-select" aria-label="${escapeAttr(tu('actions.fontPreview.fontSourceSelectAria'))}">
                <option value="google">${escapeAttr(tu('actions.fontPreview.fontSourceGoogle'))}</option>
                <option value="local">${escapeAttr(tu('actions.fontPreview.fontSourceLocal'))}</option>
              </select>
            </div>
          </section>
        </div>
        <section class="gfp-filter-block">
          <div class="gfp-filter-heading">
            <svg class="gfp-filter-heading-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/></svg>
            ${escapeAttr(tu('actions.fontPreview.bookmarksHeading'))}
          </div>
          <div class="gfp-bookmark-bar">
            <select class="gfp-select gfp-bookmark-list-select" aria-label="${escapeAttr(tu('actions.fontPreview.bookmarkListSelectAria'))}"></select>
            <div class="gfp-bookmark-manage-row" role="toolbar" aria-label="${escapeAttr(tu('actions.fontPreview.bookmarkToolbarAria'))}">
              <button type="button" class="gfp-bookmark-icon-btn gfp-bookmark-rename-btn" title="${escapeAttr(tu('actions.fontPreview.bookmarkRename'))}" aria-label="${escapeAttr(tu('actions.fontPreview.bookmarkRename'))}">
                <svg class="gfp-bookmark-icon-btn-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
              </button>
              <button type="button" class="gfp-bookmark-icon-btn gfp-bookmark-delete-btn" title="${escapeAttr(tu('actions.fontPreview.bookmarkDeleteList'))}" aria-label="${escapeAttr(tu('actions.fontPreview.bookmarkDeleteList'))}">
                <svg class="gfp-bookmark-icon-btn-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
              </button>
              <button type="button" class="gfp-bookmark-icon-btn gfp-bookmark-new-btn" title="${escapeAttr(tu('actions.fontPreview.bookmarkNewList'))}" aria-label="${escapeAttr(tu('actions.fontPreview.bookmarkNewList'))}">
                <svg class="gfp-bookmark-icon-btn-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/></svg>
              </button>
            </div>
          </div>
        </section>
        <section class="gfp-filter-block">
          <div class="gfp-filter-heading">
            <svg class="gfp-filter-heading-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/><path stroke-linecap="round" stroke-linejoin="round" d="M9.75 9.75h.008v.008H9.75V9.75zm4.5 0h.008v.008h-.008V9.75z"/></svg>
            ${escapeAttr(tu('actions.fontPreview.feeling'))}
          </div>
          <div class="gfp-tag-grid" data-group="feeling"></div>
        </section>
        <section class="gfp-filter-block">
          <div class="gfp-filter-heading">
            <svg class="gfp-filter-heading-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M10.5 6h9.75M10.5 6a1.125 1.125 0 11-2.25 0 1.125 1.125 0 012.25 0zm4.125 8.25h9.75m-9.75 0a1.125 1.125 0 11-2.25 0 1.125 1.125 0 012.25 0zm-4.125 8.25h9.75m-9.75 0a1.125 1.125 0 11-2.25 0 1.125 1.125 0 012.25 0z"/></svg>
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
          <textarea class="gfp-preview-input" rows="1"></textarea>
        </section>
        <div class="gfp-toolbar">
          <input type="search" class="gfp-search" placeholder="${escapeAttr(tu('actions.fontPreview.searchFamilies'))}" />
          <select class="gfp-size-select" aria-label="${escapeAttr(tu('actions.fontPreview.size'))}"></select>
          <select class="gfp-weight-select" aria-label="${escapeAttr(tu('actions.fontPreview.weight'))}"></select>
        </div>
        <div class="gfp-sliders-row" role="group" aria-label="${escapeAttr(tu('actions.fontPreview.sizeAndWeightControlsAria'))}">
          <div class="gfp-size-slider-row">
            <input type="range" class="gfp-size-range" min="10" max="120" step="1" value="24" aria-label="${escapeAttr(tu('actions.fontPreview.size'))}" />
          </div>
          <div class="gfp-weight-slider-row">
            <input type="range" class="gfp-weight-range" min="1" max="1000" step="1" value="400" aria-label="${escapeAttr(tu('actions.fontPreview.weight'))}" />
          </div>
        </div>
        <div class="gfp-list-meta">
          <span class="gfp-count"></span>
          <div class="gfp-view-toggle" role="group" aria-label="${escapeAttr(tu('actions.fontPreview.viewToggleAria'))}">
            <button
              type="button"
              class="gfp-view-toggle-btn gfp-view-toggle-btn--active"
              data-view="list"
              aria-pressed="true"
              title="${escapeAttr(tu('actions.fontPreview.viewList'))}"
              aria-label="${escapeAttr(tu('actions.fontPreview.viewList'))}"
            >
              <svg class="gfp-view-toggle-btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path stroke-linecap="round" d="M8 6h12M8 12h12M8 18h12"/><path stroke-linecap="round" stroke-linejoin="round" d="M4 6h.01M4 12h.01M4 18h.01"/></svg>
            </button>
            <button
              type="button"
              class="gfp-view-toggle-btn"
              data-view="grid"
              aria-pressed="false"
              title="${escapeAttr(tu('actions.fontPreview.viewGrid'))}"
              aria-label="${escapeAttr(tu('actions.fontPreview.viewGrid'))}"
            >
              <svg class="gfp-view-toggle-btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="4" y="4" width="6" height="6" rx="1"/><rect x="14" y="4" width="6" height="6" rx="1"/><rect x="4" y="14" width="6" height="6" rx="1"/><rect x="14" y="14" width="6" height="6" rx="1"/></svg>
            </button>
          </div>
        </div>
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
  const fontSourceSelect = container.querySelector('.gfp-font-source-select');
  const bookmarkListSelect = container.querySelector('.gfp-bookmark-list-select');
  const bookmarkRenameBtn = container.querySelector('.gfp-bookmark-rename-btn');
  const bookmarkDeleteBtn = container.querySelector('.gfp-bookmark-delete-btn');
  const bookmarkNewBtn = container.querySelector('.gfp-bookmark-new-btn');
  const feelingGrid = container.querySelector('.gfp-tag-grid[data-group="feeling"]');
  const appearanceGrid = container.querySelector('.gfp-tag-grid[data-group="appearance"]');
  const searchInput = container.querySelector('.gfp-search');
  const listEl = container.querySelector('.gfp-list');
  const sentinel = container.querySelector('.gfp-list-sentinel');
  const countEl = container.querySelector('.gfp-count');
  const viewToggleButtons = Array.from(container.querySelectorAll('.gfp-view-toggle-btn'));
  const scrollBox = container.querySelector('.gfp-list-scroll');
  const mainEl = container.querySelector('.gfp-main');

  const pairPopover = document.createElement('div');
  pairPopover.className = 'gfp-pair-popover';
  pairPopover.setAttribute('role', 'region');
  pairPopover.hidden = true;
  if (mainEl) mainEl.appendChild(pairPopover);

  const bookmarkPopover = document.createElement('div');
  bookmarkPopover.className = 'gfp-bookmark-popover';
  bookmarkPopover.setAttribute('role', 'dialog');
  bookmarkPopover.setAttribute('aria-modal', 'true');
  bookmarkPopover.hidden = true;
  if (mainEl) mainEl.appendChild(bookmarkPopover);

  const renameListPopover = document.createElement('div');
  renameListPopover.className = 'gfp-bookmark-rename-popover';
  renameListPopover.setAttribute('role', 'dialog');
  renameListPopover.setAttribute('aria-modal', 'true');
  renameListPopover.hidden = true;
  container.appendChild(renameListPopover);

  /** @type {HTMLElement | null} */
  let renamePopoverAnchor = null;

  /** @type {{ id: string, name: string, families: string[] }[]} */
  let bookmarkLists = [];
  let bookmarkLastSelectedListId = null;
  /** @type {string} '' = browse all fonts */
  let activeListId = '';
  let bookmarkSaveTimer = null;
  /** @type {HTMLElement | null} */
  let bookmarkAnchorRow = null;

  let pairShowTimer = null;
  let pairHideTimer = null;
  let pairHoverRow = null;

  function isGridMode() {
    return state.viewMode === 'grid';
  }

  function syncViewMode() {
    const gridMode = isGridMode();
    listEl.classList.toggle('gfp-list--grid', gridMode);
    viewToggleButtons.forEach(btn => {
      const active = btn.dataset.view === state.viewMode;
      btn.classList.toggle('gfp-view-toggle-btn--active', active);
      btn.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
    if (gridMode) hidePairPopover();
  }

  function syncGridTileSize() {
    let minCol = '64px';
    if (state.fontSizePx > 80) minCol = '120px';
    else if (state.fontSizePx > 40) minCol = '80px';
    listEl.style.setProperty('--gfp-grid-min-col', minCol);
  }

  function hidePairPopover() {
    if (pairPopover.contains(document.activeElement)) {
      try {
        document.activeElement.blur();
      } catch {
        /* ignore */
      }
    }
    pairPopover.hidden = true;
    pairPopover.textContent = '';
    pairPopover.removeAttribute('style');
  }

  function positionPairPopover(anchorRow) {
    const margin = 10;
    const pad = 6;
    const rect = anchorRow.getBoundingClientRect();
    const pr = pairPopover.getBoundingClientRect();
    let left = rect.left - pr.width - margin;
    if (left < pad) left = pad;
    let top = rect.top + (rect.height - pr.height) / 2;
    if (top < pad) top = pad;
    const maxTop = window.innerHeight - pr.height - pad;
    if (top > maxTop) top = Math.max(pad, maxTop);
    pairPopover.style.position = 'fixed';
    pairPopover.style.left = `${Math.round(left)}px`;
    pairPopover.style.top = `${Math.round(top)}px`;
    pairPopover.style.zIndex = '30';
  }

  function fillPairPopover(f) {
    const s = getPairSuggestions(f, familyByName);
    pairPopover.replaceChildren();
    const inner = document.createElement('div');
    inner.className = 'gfp-pair-popover-inner';

    const title = document.createElement('div');
    title.className = 'gfp-pair-popover-title';
    title.textContent = tu('actions.fontPreview.pairPopoverTitle');
    inner.appendChild(title);

    let hasSection = false;
    function addSection(labelKey, names) {
      if (!names.length) return;
      hasSection = true;
      const sec = document.createElement('div');
      sec.className = 'gfp-pair-popover-section';
      const lab = document.createElement('div');
      lab.className = 'gfp-pair-popover-label';
      lab.textContent = tu(labelKey);
      const namesEl = document.createElement('div');
      namesEl.className = 'gfp-pair-popover-names';
      const copyHint = tu('actions.fontPreview.pairFontCopyHint');
      for (let i = 0; i < names.length; i++) {
        if (i > 0) {
          const sep = document.createElement('span');
          sep.className = 'gfp-pair-font-sep';
          sep.textContent = ' · ';
          sep.setAttribute('aria-hidden', 'true');
          namesEl.appendChild(sep);
        }
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'gfp-pair-font-name';
        btn.dataset.family = names[i];
        btn.title = copyHint;
        btn.setAttribute('aria-label', `${names[i]} — ${copyHint}`);
        const iconWrap = document.createElement('span');
        iconWrap.className = 'gfp-pair-font-name-icon';
        iconWrap.setAttribute('aria-hidden', 'true');
        iconWrap.innerHTML =
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>';
        const label = document.createElement('span');
        label.className = 'gfp-pair-font-name-text';
        label.textContent = names[i];
        btn.appendChild(iconWrap);
        btn.appendChild(label);
        namesEl.appendChild(btn);
      }
      sec.appendChild(lab);
      sec.appendChild(namesEl);
      inner.appendChild(sec);
    }

    addSection('actions.fontPreview.pairHeading', s.heading);
    addSection('actions.fontPreview.pairBody', s.body);
    if (s.isJapanese && s.latin.length) {
      addSection('actions.fontPreview.pairLatin', s.latin);
    }

    if (!hasSection) {
      const empty = document.createElement('div');
      empty.className = 'gfp-pair-popover-empty';
      empty.textContent = tu('actions.fontPreview.pairEmpty');
      inner.appendChild(empty);
    }

    pairPopover.appendChild(inner);
    pairPopover.setAttribute('aria-label', tu('actions.fontPreview.pairPopoverTitle'));
  }

  function showPairPopoverForRow(row, f) {
    if (disposed) return;
    if (isGridMode()) return;
    if (f && f.source === 'local') return;
    fillPairPopover(f);
    pairPopover.hidden = false;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (disposed || pairPopover.hidden) return;
        positionPairPopover(row);
      });
    });
  }

  function onListMouseOver(e) {
    if (isGridMode()) return;
    const row = e.target.closest?.('.gfp-font-row');
    if (!row || !listEl.contains(row)) return;
    if (pairHoverRow === row) return;
    pairHoverRow = row;
    clearTimeout(pairHideTimer);
    pairHideTimer = null;
    clearTimeout(pairShowTimer);
    pairShowTimer = setTimeout(() => {
      pairShowTimer = null;
      if (disposed || pairHoverRow !== row) return;
      const meta = metaFromDatasetRow(row);
      if (meta && meta.source !== 'local') showPairPopoverForRow(row, meta);
    }, 150);
  }

  function onListMouseOut(e) {
    if (isGridMode()) return;
    const row = e.target.closest?.('.gfp-font-row');
    if (!row || !listEl.contains(row)) return;
    const rel = e.relatedTarget;
    if (rel && row.contains(rel)) return;
    if (rel && pairPopover.contains(rel)) {
      clearTimeout(pairHideTimer);
      pairHideTimer = null;
      return;
    }
    const other = rel && rel instanceof Element ? rel.closest('.gfp-font-row') : null;
    if (other && listEl.contains(other)) {
      pairHoverRow = other;
      clearTimeout(pairHideTimer);
      pairHideTimer = null;
      clearTimeout(pairShowTimer);
      pairShowTimer = setTimeout(() => {
        pairShowTimer = null;
        if (disposed || pairHoverRow !== other) return;
        const meta = metaFromDatasetRow(other);
        if (meta && meta.source !== 'local') showPairPopoverForRow(other, meta);
      }, 150);
      return;
    }
    pairHoverRow = null;
    clearTimeout(pairShowTimer);
    pairShowTimer = null;
    pairHideTimer = setTimeout(() => {
      pairHideTimer = null;
      hidePairPopover();
    }, 100);
  }

  function onListFocusIn(e) {
    if (isGridMode()) return;
    const row = e.target.closest?.('.gfp-font-row');
    if (!row || !listEl.contains(row)) return;
    clearTimeout(pairHideTimer);
    pairHideTimer = null;
    clearTimeout(pairShowTimer);
    pairShowTimer = null;
    pairHoverRow = row;
    const meta = metaFromDatasetRow(row);
    if (meta && meta.source !== 'local') showPairPopoverForRow(row, meta);
  }

  function onListFocusOut(e) {
    if (isGridMode()) return;
    const row = e.target.closest?.('.gfp-font-row');
    if (!row || !listEl.contains(row)) return;
    requestAnimationFrame(() => {
      if (disposed) return;
      const ae = document.activeElement;
      if (ae && row.contains(ae)) return;
      if (ae && pairPopover.contains(ae)) return;
      pairHoverRow = null;
      clearTimeout(pairShowTimer);
      pairShowTimer = null;
      pairHideTimer = setTimeout(() => {
        pairHideTimer = null;
        hidePairPopover();
      }, 100);
    });
  }

  listEl.addEventListener('mouseover', onListMouseOver);
  listEl.addEventListener('mouseout', onListMouseOut);
  listEl.addEventListener('focusin', onListFocusIn);
  listEl.addEventListener('focusout', onListFocusOut);

  function onPairPopoverMouseEnter() {
    clearTimeout(pairHideTimer);
    pairHideTimer = null;
  }

  function onPairPopoverMouseLeave(e) {
    const rel = e.relatedTarget;
    if (rel && pairPopover.contains(rel)) return;
    if (rel && rel instanceof Element && listEl.contains(rel) && rel.closest('.gfp-font-row')) return;
    pairHoverRow = null;
    clearTimeout(pairShowTimer);
    pairShowTimer = null;
    pairHideTimer = setTimeout(() => {
      pairHideTimer = null;
      if (pairPopover.hidden) return;
      const ae = document.activeElement;
      if (ae && pairPopover.contains(ae)) return;
      hidePairPopover();
    }, 200);
  }

  function onPairPopoverFocusIn() {
    clearTimeout(pairHideTimer);
    pairHideTimer = null;
  }

  function onPairPopoverFocusOut() {
    requestAnimationFrame(() => {
      if (disposed || pairPopover.hidden) return;
      const ae = document.activeElement;
      if (ae && pairPopover.contains(ae)) return;
      if (ae && listEl.contains(ae)) return;
      hidePairPopover();
      pairHoverRow = null;
    });
  }

  pairPopover.addEventListener('mouseenter', onPairPopoverMouseEnter);
  pairPopover.addEventListener('mouseleave', onPairPopoverMouseLeave);
  pairPopover.addEventListener('focusin', onPairPopoverFocusIn);
  pairPopover.addEventListener('focusout', onPairPopoverFocusOut);

  textarea.placeholder = tu('actions.fontPreview.placeholder');
  syncViewMode();

  // One option per px so slider and select stay in sync (sparse presets left blanks when value had no <option>)
  const sizeOpts = [];
  for (let px = 10; px <= 120; px++) {
    sizeOpts.push(`<option value="${px}"${px === 24 ? ' selected' : ''}>${px}px</option>`);
  }
  sizeSelect.innerHTML = sizeOpts.join('');

  /** Standard CSS weight steps shown in the compact select (slider stays 1–1000). */
  const WEIGHT_SELECT_STEPS = [100, 200, 300, 400, 500, 600, 700, 800, 900];

  function nearestWeightSelectStep(w) {
    let best = WEIGHT_SELECT_STEPS[0];
    let bestDist = Math.abs(w - best);
    for (const s of WEIGHT_SELECT_STEPS) {
      const d = Math.abs(w - s);
      if (d < bestDist) {
        bestDist = d;
        best = s;
      }
    }
    return best;
  }

  const weightOpts = WEIGHT_SELECT_STEPS.map(
    w => `<option value="${w}"${w === 400 ? ' selected' : ''}>${w}</option>`
  );
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

  function getActiveBookmarkList() {
    if (!activeListId) return null;
    return bookmarkLists.find(l => l.id === activeListId) || null;
  }

  function getFamilyMeta(storedKey) {
    const p = parseBookmarkFamilyKey(storedKey);
    if (p.source === 'local') {
      return localFamilyByName.get(p.family) || gfpSyntheticLocalMeta(p.family);
    }
    return familyByName.get(p.family) || gfpSyntheticFamilyMeta(p.family);
  }

  function metaFromDatasetRow(row) {
    const fam = row?.dataset?.family || '';
    if (!fam) return null;
    if (row.dataset.fontSource === 'local') {
      const local = localFamilyByName.get(fam) || gfpSyntheticLocalMeta(fam);
      const catalogKey = resolveGoogleCatalogFamilyName(fam);
      const cat = catalogKey ? familyByName.get(catalogKey) : null;
      if (!cat) return local;
      return { ...cat, family: local.family, source: 'local', styles: local.styles, gfpCatalogMatch: true };
    }
    return familyByName.get(fam) || gfpSyntheticFamilyMeta(fam);
  }

  function familyPassesFilters(f) {
    const q = state.search.trim().toLowerCase();
    const needFeeling = state.feeling.size > 0;
    const needAppearance = state.appearance.size > 0;
    const isLocal = f && f.source === 'local';
    if (q && !familyLower(f).includes(q)) return false;
    if (state.langSubset) {
      if (isLocal) {
        if (!localFontMatchesLangSubset(familyLower(f), state.langSubset)) return false;
      } else if (!hasSubset(f, state.langSubset)) {
        return false;
      }
    }
    if (needFeeling && !isLocal) {
      const ok = [...state.feeling].some(tag => FEELING_TEST[tag]?.(f));
      if (!ok) return false;
    }
    if (needAppearance && !isLocal) {
      const ok = [...state.appearance].some(tag => APPEARANCE_TEST[tag]?.(f));
      if (!ok) return false;
    }
    return true;
  }

  function buildBookmarkPayload() {
    return {
      lists: bookmarkLists.map(l => ({
        id: l.id,
        name: l.name,
        families: [...l.families],
      })),
      lastSelectedListId: activeListId || null,
    };
  }

  function scheduleSaveBookmarks() {
    if (disposed) return;
    clearTimeout(bookmarkSaveTimer);
    bookmarkSaveTimer = setTimeout(() => {
      bookmarkSaveTimer = null;
      if (disposed) return;
      parent.postMessage(
        { pluginMessage: { type: 'save-font-preview-bookmarks', data: buildBookmarkPayload() } },
        '*'
      );
    }, 300);
  }

  function rebuildBookmarkSelect() {
    if (!bookmarkListSelect) return;
    const parts = [`<option value="">${escapeAttr(tu('actions.fontPreview.bookmarkAllFonts'))}</option>`];
    for (const l of bookmarkLists) {
      parts.push(`<option value="${escapeAttr(l.id)}">${escapeAttr(l.name)}</option>`);
    }
    bookmarkListSelect.innerHTML = parts.join('');
    bookmarkListSelect.value = activeListId || '';
  }

  function syncBookmarkManageRowDisabled() {
    const hasList = !!activeListId && !!getActiveBookmarkList();
    if (bookmarkRenameBtn) bookmarkRenameBtn.disabled = !hasList;
    if (bookmarkDeleteBtn) bookmarkDeleteBtn.disabled = !hasList;
  }

  function applyBookmarksFromServer(data) {
    if (!data || typeof data !== 'object') return;
    bookmarkLists = Array.isArray(data.lists)
      ? data.lists
          .map(l => ({
            id: String(l.id || ''),
            name: String(l.name || 'List').slice(0, 80),
            families: Array.isArray(l.families) ? l.families.map(String) : [],
          }))
          .filter(l => l.id)
      : [];
    bookmarkLastSelectedListId =
      typeof data.lastSelectedListId === 'string' && data.lastSelectedListId
        ? data.lastSelectedListId
        : null;
    activeListId =
      bookmarkLastSelectedListId && bookmarkLists.some(l => l.id === bookmarkLastSelectedListId)
        ? bookmarkLastSelectedListId
        : '';
    rebuildBookmarkSelect();
    syncBookmarkManageRowDisabled();
    applyFilters();
    setupListObserver();
  }

  function hideRenameListPopover() {
    if (renameListPopover.contains(document.activeElement)) {
      try {
        document.activeElement.blur();
      } catch {
        /* ignore */
      }
    }
    renameListPopover.hidden = true;
    renameListPopover.replaceChildren();
    renameListPopover.removeAttribute('style');
    renamePopoverAnchor = null;
  }

  function positionRenameListPopover(anchorBtn) {
    const margin = 8;
    const pad = 6;
    const rect = anchorBtn.getBoundingClientRect();
    const pr = renameListPopover.getBoundingClientRect();
    let left = rect.left;
    let top = rect.bottom + margin;
    if (left + pr.width > window.innerWidth - pad) {
      left = window.innerWidth - pr.width - pad;
    }
    if (left < pad) left = pad;
    if (top + pr.height > window.innerHeight - pad) {
      top = rect.top - pr.height - margin;
    }
    if (top < pad) top = pad;
    renameListPopover.style.position = 'fixed';
    renameListPopover.style.left = `${Math.round(left)}px`;
    renameListPopover.style.top = `${Math.round(top)}px`;
    renameListPopover.style.zIndex = '32';
  }

  /**
   * @param {HTMLElement} headerRow
   * @param {() => void} onClose
   */
  function appendBookmarkPopoverCloseBtn(headerRow, onClose) {
    const closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.className = 'gfp-bookmark-popover-close';
    closeBtn.setAttribute('aria-label', tu('actions.prompt.close'));
    closeBtn.innerHTML =
      '<svg class="gfp-bookmark-popover-close-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>';
    closeBtn.addEventListener('click', ev => {
      ev.stopPropagation();
      onClose();
    });
    headerRow.appendChild(closeBtn);
  }

  function showRenameListPopover() {
    const list = getActiveBookmarkList();
    if (!list || !bookmarkRenameBtn) return;
    hideBookmarkPopover();
    renameListPopover.replaceChildren();
    const inner = document.createElement('div');
    inner.className = 'gfp-bookmark-rename-popover-inner';
    const header = document.createElement('div');
    header.className = 'gfp-bookmark-rename-popover-header';
    const title = document.createElement('div');
    title.className = 'gfp-bookmark-rename-popover-title';
    title.textContent = tu('actions.fontPreview.bookmarkRenamePopoverTitle');
    header.appendChild(title);
    appendBookmarkPopoverCloseBtn(header, hideRenameListPopover);
    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.className = 'gfp-input gfp-bookmark-rename-popover-input';
    nameInput.maxLength = 80;
    nameInput.value = list.name;
    nameInput.placeholder = tu('actions.fontPreview.bookmarkRenamePlaceholder');
    nameInput.setAttribute('aria-label', tu('actions.fontPreview.bookmarkRenamePlaceholder'));
    const saveBtn = document.createElement('button');
    saveBtn.type = 'button';
    saveBtn.className = 'gfp-bookmark-btn gfp-bookmark-rename-popover-save';
    saveBtn.textContent = tu('actions.fontPreview.bookmarkRenameSave');
    function commitRename() {
      const current = getActiveBookmarkList();
      if (!current || current.id !== list.id) return;
      const nm = nameInput.value.trim().slice(0, 80);
      if (!nm) {
        showToast(tu('actions.fontPreview.bookmarkNeedListName'), 'error');
        return;
      }
      current.name = nm;
      rebuildBookmarkSelect();
      if (bookmarkListSelect) bookmarkListSelect.value = activeListId;
      scheduleSaveBookmarks();
      hideRenameListPopover();
    }
    saveBtn.addEventListener('click', commitRename);
    nameInput.addEventListener('keydown', ev => {
      if (ev.key === 'Enter') {
        ev.preventDefault();
        commitRename();
      }
    });
    inner.appendChild(header);
    inner.appendChild(nameInput);
    inner.appendChild(saveBtn);
    renameListPopover.appendChild(inner);
    renamePopoverAnchor = bookmarkRenameBtn;
    renameListPopover.hidden = false;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (disposed || renameListPopover.hidden) return;
        positionRenameListPopover(bookmarkRenameBtn);
        nameInput.focus();
        nameInput.select();
      });
    });
  }

  function showNewBookmarkListPopover() {
    if (!bookmarkNewBtn) return;
    hideBookmarkPopover();
    hideRenameListPopover();
    renameListPopover.replaceChildren();
    const inner = document.createElement('div');
    inner.className = 'gfp-bookmark-rename-popover-inner';
    const header = document.createElement('div');
    header.className = 'gfp-bookmark-rename-popover-header';
    const title = document.createElement('div');
    title.className = 'gfp-bookmark-rename-popover-title';
    title.textContent = tu('actions.fontPreview.bookmarkNewList');
    header.appendChild(title);
    appendBookmarkPopoverCloseBtn(header, hideRenameListPopover);
    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.className = 'gfp-input gfp-bookmark-rename-popover-input';
    nameInput.maxLength = 80;
    nameInput.value = '';
    nameInput.placeholder = tu('actions.fontPreview.bookmarkNewListNamePlaceholder');
    nameInput.setAttribute('aria-label', tu('actions.fontPreview.bookmarkNewListNamePlaceholder'));
    const saveBtn = document.createElement('button');
    saveBtn.type = 'button';
    saveBtn.className = 'gfp-bookmark-btn gfp-bookmark-rename-popover-save';
    saveBtn.textContent = tu('actions.fontPreview.bookmarkRenameSave');
    function commitNewList() {
      if (bookmarkLists.length >= 50) {
        showToast(tu('actions.fontPreview.bookmarkMaxLists'), 'error');
        return;
      }
      const nm = nameInput.value.trim().slice(0, 80);
      if (!nm) {
        showToast(tu('actions.fontPreview.bookmarkNeedListName'), 'error');
        return;
      }
      const id = gfpNewBookmarkListId();
      bookmarkLists.push({ id, name: nm, families: [] });
      activeListId = id;
      rebuildBookmarkSelect();
      if (bookmarkListSelect) bookmarkListSelect.value = id;
      syncBookmarkManageRowDisabled();
      scheduleSaveBookmarks();
      applyFilters();
      setupListObserver();
      hideRenameListPopover();
    }
    saveBtn.addEventListener('click', commitNewList);
    nameInput.addEventListener('keydown', ev => {
      if (ev.key === 'Enter') {
        ev.preventDefault();
        commitNewList();
      }
    });
    inner.appendChild(header);
    inner.appendChild(nameInput);
    inner.appendChild(saveBtn);
    renameListPopover.appendChild(inner);
    renamePopoverAnchor = bookmarkNewBtn;
    renameListPopover.hidden = false;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (disposed || renameListPopover.hidden) return;
        positionRenameListPopover(bookmarkNewBtn);
        nameInput.focus();
      });
    });
  }

  function hideBookmarkPopover() {
    if (bookmarkPopover.contains(document.activeElement)) {
      try {
        document.activeElement.blur();
      } catch {
        /* ignore */
      }
    }
    bookmarkPopover.hidden = true;
    bookmarkPopover.replaceChildren();
    bookmarkPopover.removeAttribute('style');
    bookmarkAnchorRow = null;
  }

  function positionBookmarkPopover(anchorRow) {
    const gap = 6;
    const pad = 6;
    const markBtn = anchorRow.querySelector('.gfp-font-row-btn--bookmark');
    const anchor = markBtn instanceof HTMLElement ? markBtn : anchorRow;
    const rect = anchor.getBoundingClientRect();
    const pr = bookmarkPopover.getBoundingClientRect();
    let left = rect.left;
    if (left + pr.width > window.innerWidth - pad) {
      left = window.innerWidth - pr.width - pad;
    }
    if (left < pad) left = pad;
    let top = rect.bottom + gap;
    if (top + pr.height > window.innerHeight - pad) {
      top = rect.top - pr.height - gap;
    }
    if (top < pad) top = pad;
    const maxTop = window.innerHeight - pr.height - pad;
    if (top > maxTop) top = Math.max(pad, maxTop);
    bookmarkPopover.style.position = 'fixed';
    bookmarkPopover.style.left = `${Math.round(left)}px`;
    bookmarkPopover.style.top = `${Math.round(top)}px`;
    bookmarkPopover.style.zIndex = '31';
  }

  function fillBookmarkPopoverInner(family, source) {
    const src = source === 'local' ? 'local' : 'google';
    bookmarkPopover.replaceChildren();
    const inner = document.createElement('div');
    inner.className = 'gfp-bookmark-popover-inner';
    const header = document.createElement('div');
    header.className = 'gfp-bookmark-popover-header';
    const title = document.createElement('div');
    title.className = 'gfp-bookmark-popover-title';
    title.textContent = tu('actions.fontPreview.bookmarkAddTitle');
    header.appendChild(title);
    appendBookmarkPopoverCloseBtn(header, hideBookmarkPopover);
    const sub = document.createElement('div');
    sub.className = 'gfp-bookmark-popover-family';
    sub.textContent = family;
    const sel = document.createElement('select');
    sel.className = 'gfp-select gfp-bookmark-popover-list';
    sel.setAttribute('aria-label', tu('actions.fontPreview.bookmarkPopoverListAria'));
    const optNew = document.createElement('option');
    optNew.value = '__new__';
    optNew.textContent = tu('actions.fontPreview.bookmarkNewListOption');
    sel.appendChild(optNew);
    for (const l of bookmarkLists) {
      const o = document.createElement('option');
      o.value = l.id;
      o.textContent = l.name;
      sel.appendChild(o);
    }
    const nameRow = document.createElement('div');
    nameRow.className = 'gfp-bookmark-popover-new-row';
    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.className = 'gfp-input gfp-bookmark-popover-new-name';
    nameInput.maxLength = 80;
    nameInput.placeholder = tu('actions.fontPreview.bookmarkNewListNamePlaceholder');
    nameRow.appendChild(nameInput);
    function syncNewRow() {
      nameRow.hidden = sel.value !== '__new__';
    }
    sel.addEventListener('change', syncNewRow);
    if (bookmarkLists.length > 0) {
      sel.value = bookmarkLists[0].id;
    }
    syncNewRow();
    const addBtn = document.createElement('button');
    addBtn.type = 'button';
    addBtn.className = 'gfp-bookmark-btn gfp-bookmark-popover-add';
    addBtn.textContent = tu('actions.fontPreview.bookmarkAddConfirm');
    addBtn.addEventListener('click', () => {
      let targetListId = sel.value;
      /** @type {{ id: string, name: string, families: string[] } | null} */
      let targetList = bookmarkLists.find(x => x.id === targetListId) || null;
      if (targetListId === '__new__') {
        if (bookmarkLists.length >= 50) {
          showToast(tu('actions.fontPreview.bookmarkMaxLists'), 'error');
          return;
        }
        const nm = nameInput.value.trim().slice(0, 80);
        if (!nm) {
          showToast(tu('actions.fontPreview.bookmarkNeedListName'), 'error');
          return;
        }
        targetListId = gfpNewBookmarkListId();
        targetList = { id: targetListId, name: nm, families: [] };
        bookmarkLists.push(targetList);
        rebuildBookmarkSelect();
      }
      if (!targetList) return;
      const entryKey = formatBookmarkFamilyKey(src, family);
      if (!targetList.families.includes(entryKey)) {
        targetList.families.push(entryKey);
      }
      scheduleSaveBookmarks();
      showToast(tu('actions.fontPreview.bookmarkAddedToast', { list: targetList.name }), 'success');
      hideBookmarkPopover();
      if (activeListId === targetListId) {
        applyFilters();
        setupListObserver();
      }
    });
    inner.appendChild(header);
    inner.appendChild(sub);
    inner.appendChild(sel);
    inner.appendChild(nameRow);
    inner.appendChild(addBtn);
    bookmarkPopover.appendChild(inner);
  }

  function showBookmarkPopoverForFamily(row, family) {
    hidePairPopover();
    hideRenameListPopover();
    const src = row.dataset.fontSource === 'local' ? 'local' : 'google';
    fillBookmarkPopoverInner(family, src);
    bookmarkAnchorRow = row;
    bookmarkPopover.hidden = false;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (disposed || bookmarkPopover.hidden) return;
        positionBookmarkPopover(row);
        bookmarkPopover.querySelector('.gfp-bookmark-popover-add')?.focus();
      });
    });
  }

  function onBookmarkPopoverKeydown(ev) {
    if (ev.key !== 'Escape' || bookmarkPopover.hidden) return;
    ev.stopPropagation();
    hideBookmarkPopover();
  }

  bookmarkPopover.addEventListener('keydown', onBookmarkPopoverKeydown);

  function onDocMousedownBookmark(ev) {
    const t = ev.target;
    if (!(t instanceof Node)) return;
    if (!bookmarkPopover.hidden) {
      if (!bookmarkPopover.contains(t) && !(bookmarkAnchorRow && bookmarkAnchorRow.contains(t))) {
        hideBookmarkPopover();
      }
    }
    if (!renameListPopover.hidden) {
      if (!renameListPopover.contains(t) && !(renamePopoverAnchor && renamePopoverAnchor.contains(t))) {
        hideRenameListPopover();
      }
    }
  }
  document.addEventListener('mousedown', onDocMousedownBookmark);

  function onRenameListPopoverKeydown(ev) {
    if (ev.key !== 'Escape' || renameListPopover.hidden) return;
    ev.stopPropagation();
    hideRenameListPopover();
  }
  renameListPopover.addEventListener('keydown', onRenameListPopoverKeydown);

  function applyFilters() {
    clearTimeout(pairShowTimer);
    pairShowTimer = null;
    clearTimeout(pairHideTimer);
    pairHideTimer = null;
    pairHoverRow = null;
    hidePairPopover();

    /** @type {object[]} */
    let base;
    if (activeListId) {
      const list = getActiveBookmarkList();
      base = [];
      if (list) {
        for (const name of list.families) {
          base.push(getFamilyMeta(name));
        }
      }
    } else {
      base = fontSource === 'local' ? allLocalFamilies : allFamilies;
    }

    state.filtered = base.filter(familyPassesFilters);
    state.renderOffset = 0;
    listEl.innerHTML = '';
    if (state.filtered.length === 0 && activeListId) {
      listEl.innerHTML = `<div class="gfp-bookmarks-empty-hint">${escapeAttr(tu('actions.fontPreview.bookmarksEmptyList'))}</div>`;
    } else if (
      state.filtered.length === 0 &&
      !activeListId &&
      fontSource === 'local' &&
      !localFontsLoadAttempted
    ) {
      listEl.innerHTML = `<div class="gfp-bookmarks-empty-hint">${escapeAttr(tu('actions.fontPreview.localFontsLoading'))}</div>`;
    } else if (
      state.filtered.length === 0 &&
      !activeListId &&
      fontSource === 'local' &&
      localFontsLoadAttempted &&
      allLocalFamilies.length === 0
    ) {
      listEl.innerHTML = `<div class="gfp-bookmarks-empty-hint">${escapeAttr(tu('actions.fontPreview.localFontsEmpty'))}</div>`;
    }
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

  /** Load Noto Sans/Serif JP so mixed JP/Latin preview text respects weight for CJK, not system 2-master fonts. */
  function ensureJpPreviewFallbackCss(meta) {
    if (!meta || disposed) return;
    if (meta.source === 'local' && !meta.gfpCatalogMatch) return;
    if (hasSubset(meta, 'japanese')) return;
    const jp = gfpJpPreviewFallbackFamily(meta);
    if (familyByName.has(jp)) loadFontCss(jp);
  }

  function syncCatalogFamilyIndex() {
    catalogLowerToCanonical = new Map(
      [...familyByName.keys()].map(k => [String(k).trim().toLowerCase(), k])
    );
  }

  /** @returns {string | null} */
  function resolveGoogleCatalogFamilyName(figmaFamily) {
    const raw = String(figmaFamily || '').trim();
    if (!raw || catalogLowerToCanonical.size === 0) return null;
    if (familyByName.has(raw)) return raw;
    return catalogLowerToCanonical.get(raw.toLowerCase()) ?? null;
  }

  function primeLocalRowFontCss(row) {
    const fam = row.dataset.family;
    if (!fam || row.dataset.fontSource !== 'local') return;
    const catalogFam = resolveGoogleCatalogFamilyName(fam);
    if (!catalogFam) return;
    const meta = familyByName.get(catalogFam);
    ensureJpPreviewFallbackCss(
      meta
        ? { ...meta, family: fam, source: 'local', styles: [], gfpCatalogMatch: true }
        : null
    );
    loadFontCss(catalogFam);
  }

  function appendBatch() {
    const end = Math.min(state.renderOffset + BATCH, state.filtered.length);
    const frag = document.createDocumentFragment();
    for (let i = state.renderOffset; i < end; i++) {
      const f = state.filtered[i];
      const catalogKey = f.source === 'local' ? resolveGoogleCatalogFamilyName(f.family) : null;
      const catMeta = catalogKey ? familyByName.get(catalogKey) : null;
      const sampleFont =
        catMeta
          ? { ...catMeta, family: f.family, source: 'local', styles: f.styles, gfpCatalogMatch: true }
          : f;
      const row = document.createElement('div');
      row.className = 'gfp-font-row';
      row.dataset.family = f.family;
      row.dataset.fontSource = f.source === 'local' ? 'local' : 'google';
      const label = document.createElement('div');
      label.className = 'gfp-font-name';
      const titleEl = document.createElement('span');
      titleEl.className = 'gfp-font-name-title';
      titleEl.textContent = f.family;
      const metaEl = document.createElement('span');
      metaEl.className = 'gfp-font-name-meta';
      const effW = gfpClampWght(sampleFont, state.fontWght);
      metaEl.textContent = gfpFormatRowWeightStyle(effW, tu);
      const wghtCountEl = document.createElement('span');
      wghtCountEl.className = 'gfp-font-name-wght-count';
      wghtCountEl.textContent = gfpFamilyWeightCatalogSummary(f, tu);
      label.appendChild(titleEl);
      label.appendChild(metaEl);
      label.appendChild(wghtCountEl);
      const sample = document.createElement('div');
      sample.className = 'gfp-font-sample';
      sample.textContent = state.previewText || tu('actions.fontPreview.placeholder');
      sample.style.fontSize = `${state.fontSizePx}px`;
      sample.style.fontWeight = String(gfpClampWght(sampleFont, state.fontWght));
      sample.style.fontFamily = gfpSampleFontFamilyCss(sampleFont);
      ensureJpPreviewFallbackCss(sampleFont);
      const actions = document.createElement('div');
      actions.className = 'gfp-font-row-actions';
      const applyBtn = document.createElement('button');
      applyBtn.type = 'button';
      applyBtn.className = 'gfp-font-row-btn gfp-font-row-btn--apply';
      applyBtn.dataset.family = f.family;
      applyBtn.title = tu('actions.fontPreview.applyToSelectionTitle');
      applyBtn.setAttribute('aria-label', tu('actions.fontPreview.applyToSelectionTitle'));
      applyBtn.innerHTML =
        '<svg class="gfp-font-row-btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>';
      const markBtn = document.createElement('button');
      markBtn.type = 'button';
      markBtn.className = 'gfp-font-row-btn gfp-font-row-btn--bookmark';
      markBtn.dataset.family = f.family;
      const listForRow = getActiveBookmarkList();
      const bookmarkKey = formatBookmarkFamilyKey(f.source === 'local' ? 'local' : 'google', f.family);
      const inActiveList = !!(activeListId && listForRow && listForRow.families.includes(bookmarkKey));
      if (inActiveList) {
        markBtn.classList.add('gfp-font-row-btn--bookmark-on');
        markBtn.title = tu('actions.fontPreview.bookmarkRemoveTitle');
        markBtn.setAttribute('aria-label', tu('actions.fontPreview.bookmarkRemoveTitle'));
        markBtn.innerHTML =
          '<svg class="gfp-font-row-btn-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M6 2h12a2 2 0 012 2v18l-8-4-8 4V4a2 2 0 012-2z"/></svg>';
      } else {
        markBtn.title = tu('actions.fontPreview.bookmarkAddTitle');
        markBtn.setAttribute('aria-label', tu('actions.fontPreview.bookmarkAddTitle'));
        markBtn.innerHTML =
          '<svg class="gfp-font-row-btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/></svg>';
      }
      const copyBtn = document.createElement('button');
      copyBtn.type = 'button';
      copyBtn.className = 'gfp-font-row-btn gfp-font-row-btn--copy';
      copyBtn.dataset.family = f.family;
      copyBtn.title = tu('actions.fontPreview.copyFamilyNameTitle');
      copyBtn.setAttribute('aria-label', tu('actions.fontPreview.copyFamilyNameTitle'));
      copyBtn.innerHTML =
        '<svg class="gfp-font-row-btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>';
      actions.appendChild(markBtn);
      actions.appendChild(applyBtn);
      actions.appendChild(copyBtn);
      row.appendChild(label);
      row.appendChild(sample);
      row.appendChild(actions);
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
    if (!fam) return;
    if (row.dataset.fontSource === 'local') {
      primeLocalRowFontCss(row);
      return;
    }
    const meta = familyByName.get(fam);
    ensureJpPreviewFallbackCss(meta);
    loadFontCss(fam);
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
  function onGfpPluginWindowMessage(ev) {
    const pm = ev.data?.pluginMessage;
    if (!pm) return;
    if (pm.type === 'font-preview-local-fonts-result') {
      localFontsLoadAttempted = true;
      if (pm.error && typeof pm.error === 'string') {
        showToast(tu('actions.fontPreview.localFontsLoadError', { message: pm.error }), 'error');
      }
      const fams = Array.isArray(pm.families) ? pm.families : [];
      allLocalFamilies = fams.map(({ family, styles }) =>
        buildLocalFontEntry(typeof family === 'string' ? family : '', Array.isArray(styles) ? styles : [])
      );
      localFamilyByName = new Map(allLocalFamilies.map(f => [f.family, f]));
      if (fontSource === 'local') {
        applyFilters();
        setupListObserver();
      }
      return;
    }
    if (pm.type === 'font-preview-bookmarks-result' && pm.data) {
      applyBookmarksFromServer(pm.data);
      return;
    }
    if (pm.type === 'font-preview-selection-text-result') {
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
      return;
    }
    if (pm.type === 'font-preview-apply-result') {
      if (pm.error === 'noTextSelection') {
        showToast(tu('actions.fontPreview.applyNoTextSelection'), 'error');
        return;
      }
      if (pm.error === 'noFamily') {
        showToast(tu('actions.fontPreview.applyNoFamily'), 'error');
        return;
      }
      if (pm.ok && pm.applied > 0) {
        showToast(tu('actions.fontPreview.applySuccess', { count: String(pm.applied) }), 'success');
        return;
      }
      if (pm.applied > 0 && pm.failed > 0) {
        showToast(
          tu('actions.fontPreview.applyPartial', {
            applied: String(pm.applied),
            failed: String(pm.failed),
          }),
          'error'
        );
        return;
      }
      showToast(
        pm.message ? tu('actions.fontPreview.applyLoadFailWithMsg', { message: pm.message }) : tu('actions.fontPreview.applyLoadFail'),
        'error'
      );
    }
  }
  window.addEventListener('message', onGfpPluginWindowMessage);

  function copyFamilyNameToClipboard(name) {
    const okToast = () => showToast(tu('actions.fontPreview.copyFamilySuccess'), 'success');
    const failToast = () => showToast(tu('actions.fontPreview.copyFamilyFail'), 'error');
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(name).then(okToast).catch(() => {
        try {
          const ta = document.createElement('textarea');
          ta.value = name;
          ta.style.position = 'fixed';
          ta.style.left = '-9999px';
          document.body.appendChild(ta);
          ta.focus();
          ta.select();
          const ok = document.execCommand('copy');
          document.body.removeChild(ta);
          if (ok) okToast();
          else failToast();
        } catch {
          failToast();
        }
      });
      return;
    }
    try {
      const ta = document.createElement('textarea');
      ta.value = name;
      ta.style.position = 'fixed';
      ta.style.left = '-9999px';
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      const ok = document.execCommand('copy');
      document.body.removeChild(ta);
      if (ok) okToast();
      else failToast();
    } catch {
      failToast();
    }
  }

  function onPairPopoverCopyClick(ev) {
    const btn = ev.target.closest('.gfp-pair-font-name');
    if (!btn || !pairPopover.contains(btn)) return;
    ev.preventDefault();
    ev.stopPropagation();
    const family = btn.dataset.family;
    if (family) copyFamilyNameToClipboard(family);
  }

  function onPairPopoverKeydown(ev) {
    if (ev.key !== 'Escape' || pairPopover.hidden) return;
    ev.stopPropagation();
    clearTimeout(pairShowTimer);
    clearTimeout(pairHideTimer);
    pairHoverRow = null;
    hidePairPopover();
  }

  pairPopover.addEventListener('click', onPairPopoverCopyClick);
  pairPopover.addEventListener('keydown', onPairPopoverKeydown);

  function onGfpRowActionClick(ev) {
    const btn = ev.target.closest('.gfp-font-row-btn');
    if (!btn || !container.contains(btn)) return;
    ev.stopPropagation();
    const family = btn.dataset.family;
    if (!family) return;
    if (btn.classList.contains('gfp-font-row-btn--bookmark')) {
      if (activeListId) {
        const list = getActiveBookmarkList();
        if (list) {
          const row = btn.closest('.gfp-font-row');
          const src = row?.dataset.fontSource === 'local' ? 'local' : 'google';
          const key = formatBookmarkFamilyKey(src, family);
          list.families = list.families.filter(n => n !== key);
          scheduleSaveBookmarks();
          showToast(tu('actions.fontPreview.bookmarkRemovedToast'), 'success');
          applyFilters();
          setupListObserver();
        }
      } else {
        const row = btn.closest('.gfp-font-row');
        if (row) showBookmarkPopoverForFamily(row, family);
      }
      return;
    }
    if (btn.classList.contains('gfp-font-row-btn--copy')) {
      copyFamilyNameToClipboard(family);
      return;
    }
    if (btn.classList.contains('gfp-font-row-btn--apply')) {
      const row = btn.closest('.gfp-font-row');
      const meta = metaFromDatasetRow(row);
      if (!meta) return;
      const src = row?.dataset.fontSource === 'local' ? 'local' : 'google';
      const w = gfpClampWght(meta, state.fontWght);
      const wghtCss = src === 'local' ? '' : meta && typeof meta.wghtCss === 'string' ? meta.wghtCss : '';
      parent.postMessage(
        {
          pluginMessage: {
            type: 'font-preview-apply-family',
            family: meta.family,
            weight: w,
            wghtCss,
            source: src,
            localStyles: src === 'local' && Array.isArray(meta.styles) ? meta.styles : [],
          },
        },
        '*'
      );
    }
  }
  container.addEventListener('click', onGfpRowActionClick);

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
    if (Number.isNaN(px)) px = 24;
    px = Math.min(120, Math.max(10, px));
    state.fontSizePx = px;
    sizeSelect.value = String(px);
    sizeRange.value = String(px);
    syncGridTileSize();
    listEl.querySelectorAll('.gfp-font-sample').forEach(el => {
      el.style.fontSize = `${px}px`;
    });
  }

  function applyWeightToSamples() {
    listEl.querySelectorAll('.gfp-font-row').forEach(row => {
      const meta = metaFromDatasetRow(row);
      if (!meta) return;
      const sample = row.querySelector('.gfp-font-sample');
      const w = gfpClampWght(meta, state.fontWght);
      if (sample) sample.style.fontWeight = String(w);
      const metaEl = row.querySelector('.gfp-font-name-meta');
      if (metaEl) metaEl.textContent = gfpFormatRowWeightStyle(w, tu);
    });
  }

  function syncWeight(fromRange) {
    let w = fromRange ? parseInt(weightRange.value, 10) : parseInt(weightSelect.value, 10);
    if (Number.isNaN(w)) w = 400;
    w = Math.min(1000, Math.max(1, w));
    state.fontWght = w;
    weightRange.value = String(w);
    weightSelect.value = String(fromRange ? nearestWeightSelectStep(w) : w);
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

  if (fontSourceSelect) {
    fontSourceSelect.value = fontSource;
    fontSourceSelect.addEventListener('change', () => {
      hideBookmarkPopover();
      hideRenameListPopover();
      hidePairPopover();
      fontSource = fontSourceSelect.value === 'local' ? 'local' : 'google';
      applyFilters();
      setupListObserver();
    });
  }

  rebuildBookmarkSelect();
  syncBookmarkManageRowDisabled();

  if (bookmarkListSelect) {
    bookmarkListSelect.addEventListener('change', () => {
      hideRenameListPopover();
      activeListId = bookmarkListSelect.value || '';
      syncBookmarkManageRowDisabled();
      scheduleSaveBookmarks();
      applyFilters();
      setupListObserver();
    });
  }

  if (bookmarkRenameBtn) {
    bookmarkRenameBtn.addEventListener('click', () => {
      if (!getActiveBookmarkList()) return;
      showRenameListPopover();
    });
  }

  if (bookmarkDeleteBtn) {
    bookmarkDeleteBtn.addEventListener('click', () => {
      const list = getActiveBookmarkList();
      if (!list) return;
      hideRenameListPopover();
      if (!window.confirm(tu('actions.fontPreview.bookmarkDeleteConfirm', { name: list.name }))) return;
      const removedId = list.id;
      bookmarkLists = bookmarkLists.filter(l => l.id !== removedId);
      if (activeListId === removedId) {
        activeListId = '';
      }
      rebuildBookmarkSelect();
      syncBookmarkManageRowDisabled();
      scheduleSaveBookmarks();
      applyFilters();
      setupListObserver();
    });
  }

  if (bookmarkNewBtn) {
    bookmarkNewBtn.addEventListener('click', () => {
      if (bookmarkLists.length >= 50) {
        showToast(tu('actions.fontPreview.bookmarkMaxLists'), 'error');
        return;
      }
      showNewBookmarkListPopover();
    });
  }

  searchInput.addEventListener('input', () => {
    state.search = searchInput.value;
    applyFilters();
    setupListObserver();
  });

  viewToggleButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const nextMode = btn.dataset.view === 'grid' ? 'grid' : 'list';
      if (state.viewMode === nextMode) return;
      state.viewMode = nextMode;
      syncViewMode();
    });
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
      syncCatalogFamilyIndex();
      listEl.innerHTML = '';
      applyFilters();
      setupListObserver();
      listEl.querySelectorAll('.gfp-font-row[data-font-source="local"]').forEach(r => primeLocalRowFontCss(r));
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
  parent.postMessage({ pluginMessage: { type: 'get-font-preview-bookmarks' } }, '*');
  parent.postMessage({ pluginMessage: { type: 'list-font-preview-local-fonts' } }, '*');
  loadCatalog();

  return () => {
    disposed = true;
    clearTimeout(bookmarkSaveTimer);
    clearTimeout(pairShowTimer);
    clearTimeout(pairHideTimer);
    hideBookmarkPopover();
    hideRenameListPopover();
    document.removeEventListener('mousedown', onDocMousedownBookmark);
    bookmarkPopover.removeEventListener('keydown', onBookmarkPopoverKeydown);
    renameListPopover.removeEventListener('keydown', onRenameListPopoverKeydown);
    listEl.removeEventListener('mouseover', onListMouseOver);
    listEl.removeEventListener('mouseout', onListMouseOut);
    listEl.removeEventListener('focusin', onListFocusIn);
    listEl.removeEventListener('focusout', onListFocusOut);
    pairPopover.removeEventListener('mouseenter', onPairPopoverMouseEnter);
    pairPopover.removeEventListener('mouseleave', onPairPopoverMouseLeave);
    pairPopover.removeEventListener('focusin', onPairPopoverFocusIn);
    pairPopover.removeEventListener('focusout', onPairPopoverFocusOut);
    pairPopover.removeEventListener('click', onPairPopoverCopyClick);
    pairPopover.removeEventListener('keydown', onPairPopoverKeydown);
    hidePairPopover();
    window.removeEventListener('message', onGfpPluginWindowMessage);
    container.removeEventListener('click', onGfpRowActionClick);
    if (listObserver) listObserver.disconnect();
    rowObserver.disconnect();
    mo.disconnect();
    document.querySelectorAll('link[data-gfp-font]').forEach(l => l.remove());
    loadedCss.clear();
    container.innerHTML = '';
  };
}
