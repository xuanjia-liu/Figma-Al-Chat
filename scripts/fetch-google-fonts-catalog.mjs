/**
 * Downloads Google Fonts metadata and writes a slim catalog for offline / fallback use.
 * Run: node scripts/fetch-google-fonts-catalog.mjs
 */
import fs from 'node:fs/promises';
import path from 'node:path';

const METADATA_URL = 'https://fonts.google.com/metadata/fonts';
const OUT = path.join(process.cwd(), 'ui', 'data', 'google-fonts-catalog-slim.json');

const RELEVANT_SUBSETS = new Set([
  'japanese',
  'korean',
  'chinese-simplified',
  'chinese-traditional',
  'arabic',
  'hebrew',
  'devanagari',
  'thai',
  'tamil',
  'bengali',
  'latin',
  'latin-ext',
  'cyrillic',
  'cyrillic-ext',
  'greek',
  'vietnamese',
  'symbols',
  'symbols2',
]);

function wghtBoundsAndCss(f) {
  const wghtAxis = Array.isArray(f.axes) ? f.axes.find((a) => a.tag === 'wght') : null;
  if (wghtAxis && Math.round(wghtAxis.max) > Math.round(wghtAxis.min)) {
    const lo = Math.round(wghtAxis.min);
    const hi = Math.round(wghtAxis.max);
    return { wghtMin: lo, wghtMax: hi, wghtCss: `${lo}..${hi}` };
  }
  const roman = Object.keys(f.fonts || {})
    .filter((k) => /^\d+$/.test(k))
    .map(Number)
    .sort((a, b) => a - b);
  if (roman.length === 0) {
    return { wghtMin: 400, wghtMax: 400, wghtCss: '400' };
  }
  if (roman.length === 1) {
    const w = roman[0];
    return { wghtMin: w, wghtMax: w, wghtCss: String(w) };
  }
  const lo = roman[0];
  const hi = roman[roman.length - 1];
  return { wghtMin: lo, wghtMax: hi, wghtCss: roman.join(';') };
}

function slimFamily(f) {
  const w400 = f.fonts && f.fonts['400'];
  const thickness = w400 && typeof w400.thickness === 'number' ? w400.thickness : null;
  const subsets = Array.isArray(f.subsets) ? f.subsets.filter((s) => RELEVANT_SUBSETS.has(s)) : [];
  const wght = wghtBoundsAndCss(f);
  return {
    family: f.family,
    category: f.category,
    subsets,
    classifications: Array.isArray(f.classifications) ? f.classifications : [],
    stroke: f.stroke ?? null,
    popularity: typeof f.popularity === 'number' ? f.popularity : 9999,
    thickness,
    wghtMin: wght.wghtMin,
    wghtMax: wght.wghtMax,
    wghtCss: wght.wghtCss,
  };
}

const res = await fetch(METADATA_URL);
if (!res.ok) {
  console.error('Fetch failed:', res.status);
  process.exit(1);
}
const data = await res.json();
const families = (data.familyMetadataList || []).map(slimFamily);
await fs.mkdir(path.dirname(OUT), { recursive: true });
await fs.writeFile(OUT, JSON.stringify(families), 'utf8');
console.log('Wrote', families.length, 'families to', OUT, `(${(await fs.stat(OUT)).size} bytes)`);
