/**
 * Curated + heuristic pairing hints for Google Fonts (JP 見出し/本文, 和欧混植, Latin-only).
 * Suggestions are filtered against the live catalog Map so names always resolve.
 */

/** @param {object | undefined} f */
function hasJapaneseSubset(f) {
  return Array.isArray(f?.subsets) && f.subsets.includes('japanese');
}

/** @param {string[]} names @param {Map<string, object>} familyByName @param {string} exclude */
function pickInCatalog(names, familyByName, exclude) {
  const out = [];
  const seen = new Set();
  const ex = exclude ? String(exclude) : '';
  for (const n of names) {
    if (!n || n === ex || seen.has(n)) continue;
    if (familyByName.has(n)) {
      seen.add(n);
      out.push(n);
      if (out.length >= 3) break;
    }
  }
  return out;
}

/** @type {Record<string, { heading?: string[]; body?: string[]; latin?: string[] }>} */
const JP_CURATED = {
  'Noto Sans JP': {
    heading: ['Zen Kaku Gothic New', 'M PLUS 1', 'Dela Gothic One'],
    body: ['Noto Serif JP', 'Shippori Mincho', 'BIZ UDPMincho'],
    latin: ['Inter', 'Source Sans 3', 'IBM Plex Sans'],
  },
  'Noto Serif JP': {
    heading: ['Zen Kaku Gothic New', 'Noto Sans JP', 'M PLUS 1'],
    body: ['Noto Sans JP', 'IBM Plex Sans JP', 'M PLUS 2'],
    latin: ['Source Serif 4', 'Lora', 'Merriweather'],
  },
  'Zen Kaku Gothic New': {
    heading: ['Dela Gothic One', 'Reggae One', 'M PLUS 1'],
    body: ['Noto Sans JP', 'M PLUS 2', 'IBM Plex Sans JP'],
    latin: ['Inter', 'DM Sans', 'Work Sans'],
  },
  'IBM Plex Sans JP': {
    heading: ['Zen Kaku Gothic New', 'Noto Serif JP', 'M PLUS 1'],
    body: ['Noto Sans JP', 'Noto Serif JP', 'M PLUS 2'],
    latin: ['IBM Plex Sans', 'IBM Plex Serif', 'Source Sans 3'],
  },
  'M PLUS 1': {
    heading: ['Zen Kaku Gothic New', 'Dela Gothic One', 'Noto Sans JP'],
    body: ['Noto Sans JP', 'Noto Serif JP', 'M PLUS 2'],
    latin: ['Inter', 'Source Sans 3', 'Roboto'],
  },
  'M PLUS 2': {
    heading: ['Zen Kaku Gothic New', 'M PLUS 1', 'Dela Gothic One'],
    body: ['Noto Serif JP', 'Shippori Mincho', 'Noto Sans JP'],
    latin: ['Inter', 'Open Sans', 'Source Sans 3'],
  },
  'M PLUS 1p': {
    heading: ['Zen Kaku Gothic New', 'M PLUS 1', 'Dela Gothic One'],
    body: ['Noto Serif JP', 'Noto Sans JP', 'Shippori Mincho'],
    latin: ['Inter', 'Source Sans 3', 'Nunito Sans'],
  },
  'M PLUS 1 Code': {
    heading: ['Zen Kaku Gothic New', 'IBM Plex Sans JP', 'Noto Sans JP'],
    body: ['Noto Sans JP', 'IBM Plex Sans JP', 'M PLUS 2'],
    latin: ['JetBrains Mono', 'IBM Plex Mono', 'Source Code Pro'],
  },
  'M PLUS Rounded 1c': {
    heading: ['Zen Maru Gothic', 'Zen Kaku Gothic New', 'M PLUS 1'],
    body: ['Noto Sans JP', 'Kosugi', 'M PLUS 2'],
    latin: ['Nunito', 'Quicksand', 'Varela Round'],
  },
  'Kosugi': {
    heading: ['Zen Kaku Gothic New', 'M PLUS 1', 'Noto Serif JP'],
    body: ['Noto Sans JP', 'Noto Serif JP', 'M PLUS 2'],
    latin: ['Inter', 'Roboto', 'Source Sans 3'],
  },
  'Kosugi Maru': {
    heading: ['Zen Maru Gothic', 'M PLUS 1', 'Zen Kaku Gothic New'],
    body: ['Noto Sans JP', 'M PLUS 2', 'Kiwi Maru'],
    latin: ['Nunito', 'Varela Round', 'Quicksand'],
  },
  'Shippori Mincho': {
    heading: ['Zen Kaku Gothic New', 'Noto Sans JP', 'M PLUS 1'],
    body: ['Noto Sans JP', 'Sawarabi Gothic', 'IBM Plex Sans JP'],
    latin: ['Source Serif 4', 'Lora', 'Crimson Pro'],
  },
  'Shippori Mincho B1': {
    heading: ['Zen Kaku Gothic New', 'Noto Sans JP', 'M PLUS 1'],
    body: ['Noto Sans JP', 'Shippori Mincho', 'Noto Serif JP'],
    latin: ['Source Serif 4', 'Lora', 'Libre Baskerville'],
  },
  'Shippori Antique': {
    heading: ['Zen Kaku Gothic New', 'Noto Sans JP', 'Reggae One'],
    body: ['Noto Sans JP', 'Noto Serif JP', 'M PLUS 2'],
    latin: ['Libre Baskerville', 'Source Serif 4', 'Lora'],
  },
  'Kaisei Opti': {
    heading: ['Zen Kaku Gothic New', 'Noto Sans JP', 'M PLUS 1'],
    body: ['Noto Sans JP', 'M PLUS 2', 'IBM Plex Sans JP'],
    latin: ['Source Serif 4', 'Lora', 'Cormorant Garamond'],
  },
  'Kaisei Tokumin': {
    heading: ['Zen Kaku Gothic New', 'Noto Sans JP', 'M PLUS 1'],
    body: ['Noto Sans JP', 'Noto Serif JP', 'M PLUS 2'],
    latin: ['Source Serif 4', 'Merriweather', 'Lora'],
  },
  'Kaisei HarunoUmi': {
    heading: ['Zen Kaku Gothic New', 'Noto Sans JP', 'M PLUS 1'],
    body: ['Noto Sans JP', 'M PLUS 2', 'IBM Plex Sans JP'],
    latin: ['Lora', 'Source Serif 4', 'Crimson Pro'],
  },
  'Kaisei Decol': {
    heading: ['Zen Kaku Gothic New', 'M PLUS 1', 'Dela Gothic One'],
    body: ['Noto Sans JP', 'M PLUS 2', 'Kosugi'],
    latin: ['Fraunces', 'Playfair Display', 'Source Serif 4'],
  },
  'Sawarabi Gothic': {
    heading: ['Zen Kaku Gothic New', 'M PLUS 1', 'Noto Serif JP'],
    body: ['Noto Sans JP', 'Noto Serif JP', 'M PLUS 2'],
    latin: ['Inter', 'Source Sans 3', 'Work Sans'],
  },
  'Sawarabi Mincho': {
    heading: ['Zen Kaku Gothic New', 'Noto Sans JP', 'M PLUS 1'],
    body: ['Noto Sans JP', 'IBM Plex Sans JP', 'M PLUS 2'],
    latin: ['Source Serif 4', 'Lora', 'Noto Serif'],
  },
  'BIZ UDPGothic': {
    heading: ['Zen Kaku Gothic New', 'M PLUS 1', 'Noto Serif JP'],
    body: ['Noto Sans JP', 'Noto Serif JP', 'BIZ UDPMincho'],
    latin: ['Inter', 'Source Sans 3', 'Roboto'],
  },
  'BIZ UDPMincho': {
    heading: ['Zen Kaku Gothic New', 'Noto Sans JP', 'M PLUS 1'],
    body: ['Noto Sans JP', 'BIZ UDPGothic', 'M PLUS 2'],
    latin: ['Source Serif 4', 'Lora', 'Noto Serif'],
  },
  'BIZ UDGothic': {
    heading: ['Zen Kaku Gothic New', 'M PLUS 1', 'Noto Serif JP'],
    body: ['Noto Sans JP', 'Noto Serif JP', 'BIZ UDMincho'],
    latin: ['Inter', 'Open Sans', 'Roboto'],
  },
  'BIZ UDMincho': {
    heading: ['Zen Kaku Gothic New', 'Noto Sans JP', 'M PLUS 1'],
    body: ['Noto Sans JP', 'BIZ UDGothic', 'M PLUS 2'],
    latin: ['Source Serif 4', 'Merriweather', 'Lora'],
  },
  'Zen Old Mincho': {
    heading: ['Zen Kaku Gothic New', 'Noto Sans JP', 'M PLUS 1'],
    body: ['Noto Sans JP', 'Shippori Mincho', 'Noto Serif JP'],
    latin: ['Cormorant Garamond', 'Source Serif 4', 'Lora'],
  },
  'Zen Maru Gothic': {
    heading: ['M PLUS 1', 'Zen Kaku Gothic New', 'Dela Gothic One'],
    body: ['Noto Sans JP', 'Kosugi', 'M PLUS 2'],
    latin: ['Nunito', 'Quicksand', 'Varela Round'],
  },
  'Zen Antique': {
    heading: ['Zen Kaku Gothic New', 'Noto Sans JP', 'M PLUS 1'],
    body: ['Noto Sans JP', 'Noto Serif JP', 'Shippori Mincho'],
    latin: ['Libre Baskerville', 'Source Serif 4', 'Lora'],
  },
  'Zen Antique Soft': {
    heading: ['Zen Kaku Gothic New', 'Noto Sans JP', 'M PLUS 1'],
    body: ['Noto Sans JP', 'M PLUS 2', 'Kiwi Maru'],
    latin: ['Lora', 'Source Serif 4', 'Nunito'],
  },
  'Hina Mincho': {
    heading: ['Zen Kaku Gothic New', 'Noto Sans JP', 'M PLUS 1'],
    body: ['Noto Sans JP', 'M PLUS 2', 'IBM Plex Sans JP'],
    latin: ['Cormorant', 'Source Serif 4', 'Lora'],
  },
  'Yuji Mai': {
    heading: ['Zen Kaku Gothic New', 'Noto Sans JP', 'M PLUS 1'],
    body: ['Noto Sans JP', 'M PLUS 2', 'Sawarabi Gothic'],
    latin: ['Shippori Mincho', 'Noto Serif', 'Source Serif 4'],
  },
  'Yuji Boku': {
    heading: ['Zen Kaku Gothic New', 'Noto Sans JP', 'M PLUS 1'],
    body: ['Noto Sans JP', 'Klee One', 'M PLUS 2'],
    latin: ['Kalam', 'Caveat', 'Patrick Hand'],
  },
  'Klee One': {
    heading: ['Zen Kaku Gothic New', 'M PLUS 1', 'Noto Serif JP'],
    body: ['Noto Sans JP', 'Noto Serif JP', 'M PLUS 2'],
    latin: ['Nunito', 'Quicksand', 'Source Sans 3'],
  },
  'Kiwi Maru': {
    heading: ['Zen Maru Gothic', 'M PLUS 1', 'Zen Kaku Gothic New'],
    body: ['Noto Sans JP', 'M PLUS 2', 'Kosugi Maru'],
    latin: ['Nunito', 'Varela Round', 'Nunito Sans'],
  },
  'Yomogi': {
    heading: ['Zen Kaku Gothic New', 'M PLUS 1', 'Reggae One'],
    body: ['Noto Sans JP', 'M PLUS 2', 'Klee One'],
    latin: ['Kalam', 'Patrick Hand', 'Caveat'],
  },
  'DotGothic16': {
    heading: ['Dela Gothic One', 'Reggae One', 'Rampart One'],
    body: ['Noto Sans JP', 'M PLUS 2', 'IBM Plex Sans JP'],
    latin: ['VT323', 'Press Start 2P', 'IBM Plex Mono'],
  },
  'Dela Gothic One': {
    heading: ['Rampart One', 'Reggae One', 'M PLUS 1'],
    body: ['Noto Sans JP', 'M PLUS 2', 'IBM Plex Sans JP'],
    latin: ['Bebas Neue', 'Oswald', 'Anton'],
  },
  'Reggae One': {
    heading: ['Dela Gothic One', 'Rampart One', 'RocknRoll One'],
    body: ['Noto Sans JP', 'M PLUS 2', 'Kosugi'],
    latin: ['Bungee', 'Righteous', 'Oswald'],
  },
};

const JP_HEADING_POOL = [
  'Zen Kaku Gothic New',
  'M PLUS 1',
  'Dela Gothic One',
  'Reggae One',
  'Noto Sans JP',
  'Rampart One',
];

const JP_BODY_SANS_POOL = ['Noto Sans JP', 'M PLUS 2', 'IBM Plex Sans JP', 'BIZ UDPGothic', 'Kosugi', 'Sawarabi Gothic'];

const JP_BODY_SERIF_POOL = [
  'Noto Serif JP',
  'Shippori Mincho',
  'Sawarabi Mincho',
  'BIZ UDPMincho',
  'Kaisei Opti',
  'Hina Mincho',
];

const JP_LATIN_SANS = ['Inter', 'Source Sans 3', 'IBM Plex Sans', 'Roboto', 'Open Sans'];
const JP_LATIN_SERIF = ['Source Serif 4', 'Lora', 'Merriweather', 'Noto Serif', 'Libre Baskerville'];
const JP_LATIN_DISPLAY = ['DM Sans', 'Work Sans', 'Bebas Neue', 'Oswald'];

const DISPLAY_NAME_RE =
  /pop|bomb|rock|train|stick\b|reggae|rampart|dela|dotgothic|chokokutai|mochiy|palette|rocknroll|monomaniac|hachi maru|tsukimi|yusei|hentaigana|slackside|tegomin|darumadrop|aoboshi|potta|murecho|rock 3d|wdxl|lubrifont|shizuru|kapakana|line seed|zen kurenaido|zen antique(?! soft)|cherry bomb|yuji syuku/i;

/** @param {object} f */
function japaneseVisualRole(f) {
  const name = String(f.family || '');
  if (f.category === 'Serif' || /mincho|serif jp|zen old|kaisei|yuji mai|yuji boku|hina|tegomin|shippori antique|new tegomin/i.test(name)) {
    return 'serif';
  }
  if (f.category === 'Monospace') return 'mono';
  if (f.category === 'Display' || f.category === 'Handwriting' || DISPLAY_NAME_RE.test(name)) {
    return 'display';
  }
  return 'sans';
}

/**
 * @param {object} f
 * @param {Map<string, object>} familyByName
 */
function fillJapaneseFallbacks(f, out, familyByName) {
  const self = f.family;
  const role = japaneseVisualRole(f);

  if (!out.heading.length) {
    if (role === 'serif') {
      out.heading = pickInCatalog(JP_HEADING_POOL, familyByName, self);
    } else if (role === 'display') {
      out.heading = pickInCatalog(['Dela Gothic One', 'Rampart One', 'M PLUS 1', 'Zen Kaku Gothic New'], familyByName, self);
    } else {
      out.heading = pickInCatalog(JP_HEADING_POOL, familyByName, self);
    }
  }

  if (!out.body.length) {
    if (role === 'display' || role === 'mono') {
      out.body = pickInCatalog(JP_BODY_SANS_POOL, familyByName, self);
    } else if (role === 'serif') {
      out.body = pickInCatalog(JP_BODY_SANS_POOL, familyByName, self);
    } else {
      out.body = pickInCatalog(JP_BODY_SERIF_POOL, familyByName, self);
    }
  }

  if (!out.latin.length) {
    if (role === 'serif') {
      out.latin = pickInCatalog(JP_LATIN_SERIF, familyByName, self);
    } else if (role === 'display') {
      out.latin = pickInCatalog(JP_LATIN_DISPLAY, familyByName, self);
    } else {
      out.latin = pickInCatalog(JP_LATIN_SANS, familyByName, self);
    }
  }
}

/**
 * @param {object} f
 * @param {Map<string, object>} familyByName
 */
function fillLatinOnlyFallbacks(f, out, familyByName) {
  const self = f.family;
  const cat = f.category || '';

  if (!out.heading.length) {
    if (cat === 'Serif') {
      out.heading = pickInCatalog(['Playfair Display', 'DM Sans', 'Work Sans', 'Oswald'], familyByName, self);
    } else if (cat === 'Sans Serif') {
      out.heading = pickInCatalog(['Playfair Display', 'Merriweather', 'Lora', 'Fraunces'], familyByName, self);
    } else {
      out.heading = pickInCatalog(['Bebas Neue', 'Oswald', 'Playfair Display', 'Anton'], familyByName, self);
    }
  }

  if (!out.body.length) {
    if (cat === 'Serif') {
      out.body = pickInCatalog(['Lora', 'Source Serif 4', 'Merriweather', 'Libre Baskerville'], familyByName, self);
    } else if (cat === 'Sans Serif') {
      out.body = pickInCatalog(['Source Sans 3', 'Inter', 'Open Sans', 'Roboto'], familyByName, self);
    } else {
      out.body = pickInCatalog(['Inter', 'Open Sans', 'Roboto', 'Source Sans 3'], familyByName, self);
    }
  }

  if (!out.latin.length && hasJapaneseSubset(f)) {
    out.latin = pickInCatalog(JP_LATIN_SANS, familyByName, self);
  }
}

/**
 * @param {object} f - Catalog family object
 * @param {Map<string, object>} familyByName
 * @returns {{ heading: string[]; body: string[]; latin: string[]; isJapanese: boolean }}
 */
export function getPairSuggestions(f, familyByName) {
  const self = String(f?.family || '');
  const isJapanese = hasJapaneseSubset(f);

  /** @type {{ heading: string[]; body: string[]; latin: string[]; isJapanese: boolean }} */
  const out = {
    heading: [],
    body: [],
    latin: [],
    isJapanese,
  };

  if (isJapanese) {
    const cur = JP_CURATED[self];
    if (cur) {
      if (cur.heading) out.heading = pickInCatalog(cur.heading, familyByName, self);
      if (cur.body) out.body = pickInCatalog(cur.body, familyByName, self);
      if (cur.latin) out.latin = pickInCatalog(cur.latin, familyByName, self);
    }
    fillJapaneseFallbacks(f, out, familyByName);
  } else {
    fillLatinOnlyFallbacks(f, out, familyByName);
  }

  return out;
}
