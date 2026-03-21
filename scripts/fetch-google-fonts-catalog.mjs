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

function slimFamily(f) {
  const w400 = f.fonts && f.fonts['400'];
  const thickness = w400 && typeof w400.thickness === 'number' ? w400.thickness : null;
  const subsets = Array.isArray(f.subsets) ? f.subsets.filter((s) => RELEVANT_SUBSETS.has(s)) : [];
  return {
    family: f.family,
    category: f.category,
    subsets,
    classifications: Array.isArray(f.classifications) ? f.classifications : [],
    stroke: f.stroke ?? null,
    popularity: typeof f.popularity === 'number' ? f.popularity : 9999,
    thickness,
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
