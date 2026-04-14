/**
 * Curated font families + typical Figma style names for Font mapping quick-picks.
 * Merged at runtime with `list-font-preview-local-fonts` when available (union of styles).
 */

/** @type {{ family: string, styles: string[] }[]} */
export const FONT_MAPPING_CURATED_FONTS = [
  { family: 'Inter', styles: ['Regular', 'Medium', 'Semi Bold', 'Bold', 'Light', 'Extra Bold', 'Black', 'Thin', 'Extra Light'] },
  { family: 'Roboto', styles: ['Regular', 'Medium', 'Bold', 'Black', 'Light', 'Thin', 'Italic', 'Medium Italic', 'Bold Italic'] },
  { family: 'Roboto Mono', styles: ['Regular', 'Medium', 'Bold', 'Light', 'Thin', 'Italic'] },
  { family: 'Open Sans', styles: ['Regular', 'SemiBold', 'Bold', 'Light', 'ExtraBold', 'Italic', 'SemiBold Italic'] },
  { family: 'Noto Sans', styles: ['Regular', 'Medium', 'Bold', 'Light', 'SemiBold', 'Black', 'Italic'] },
  { family: 'Noto Sans CJK JP', styles: ['Regular', 'Medium', 'Bold', 'Light'] },
  { family: 'Noto Serif CJK JP', styles: ['Regular', 'Medium', 'Bold', 'SemiBold'] },
  { family: 'Noto Sans CJK KR', styles: ['Regular', 'Medium', 'Bold', 'Light'] },
  { family: 'Noto Sans CJK SC', styles: ['Regular', 'Medium', 'Bold', 'Light'] },
  { family: 'Noto Sans CJK TC', styles: ['Regular', 'Medium', 'Bold', 'Light'] },
  { family: 'Source Sans 3', styles: ['Regular', 'SemiBold', 'Bold', 'Light', 'Black', 'Italic'] },
  { family: 'Source Serif 4', styles: ['Regular', 'SemiBold', 'Bold', 'Light', 'Italic'] },
  { family: 'SF Pro Display', styles: ['Regular', 'Medium', 'Semibold', 'Bold', 'Light', 'Thin', 'Ultralight', 'Heavy', 'Black'] },
  { family: 'SF Pro Text', styles: ['Regular', 'Medium', 'Semibold', 'Bold', 'Light', 'Thin', 'Heavy'] },
  { family: 'SF Mono', styles: ['Regular', 'Medium', 'Bold', 'Light', 'Semibold'] },
  { family: 'Hiragino Sans', styles: ['W3', 'W4', 'W5', 'W6', 'W7', 'W8'] },
  { family: 'Hiragino Maru Gothic Pro', styles: ['W4'] },
  { family: 'Hiragino Mincho ProN', styles: ['W3', 'W6'] },
  { family: 'Yu Gothic', styles: ['Regular', 'Medium', 'Bold', 'Light'] },
  { family: 'Yu Mincho', styles: ['Regular', 'Medium', 'Demibold'] },
  { family: 'Meiryo', styles: ['Regular', 'Bold'] },
  { family: 'MS PGothic', styles: ['Regular'] },
  { family: 'MS PMincho', styles: ['Regular'] },
  { family: 'PingFang SC', styles: ['Regular', 'Medium', 'Semibold', 'Ultralight', 'Thin', 'Light'] },
  { family: 'PingFang TC', styles: ['Regular', 'Medium', 'Semibold', 'Ultralight', 'Thin', 'Light'] },
  { family: 'PingFang HK', styles: ['Regular', 'Medium', 'Semibold', 'Ultralight', 'Thin', 'Light'] },
  { family: 'Helvetica Neue', styles: ['Regular', 'Medium', 'Bold', 'Light', 'Thin', 'Ultra Light'] },
  { family: 'Arial', styles: ['Regular', 'Bold', 'Italic', 'Bold Italic', 'Black'] },
  { family: 'Arial Unicode MS', styles: ['Regular'] },
  { family: 'Times New Roman', styles: ['Regular', 'Bold', 'Italic', 'Bold Italic'] },
  { family: 'Georgia', styles: ['Regular', 'Bold', 'Italic', 'Bold Italic'] },
  { family: 'Menlo', styles: ['Regular', 'Bold'] },
  { family: 'Monaco', styles: ['Regular'] },
  { family: 'Consolas', styles: ['Regular', 'Bold', 'Italic', 'Bold Italic'] },
  { family: 'Apple SD Gothic Neo', styles: ['Regular', 'Medium', 'SemiBold', 'Bold', 'Light', 'UltraLight', 'Thin'] },
  { family: 'Malgun Gothic', styles: ['Regular', 'Bold', 'Semilight'] },
  { family: 'Nanum Gothic', styles: ['Regular', 'Bold', 'ExtraBold'] },
  { family: 'Nanum Myeongjo', styles: ['Regular', 'Bold', 'ExtraBold'] },
  { family: 'Microsoft YaHei', styles: ['Regular', 'Bold', 'Light'] },
  { family: 'Microsoft JhengHei', styles: ['Regular', 'Bold', 'Light'] },
  { family: 'Segoe UI', styles: ['Regular', 'Semibold', 'Bold', 'Light', 'Italic', 'Semibold Italic'] },
  { family: 'Lato', styles: ['Regular', 'Bold', 'Light', 'Black', 'Italic', 'Bold Italic'] },
  { family: 'Montserrat', styles: ['Regular', 'Medium', 'SemiBold', 'Bold', 'Light', 'Black', 'Italic'] },
  { family: 'Poppins', styles: ['Regular', 'Medium', 'SemiBold', 'Bold', 'Light', 'Black', 'Italic'] },
  { family: 'Nunito Sans', styles: ['Regular', 'SemiBold', 'Bold', 'Light', 'ExtraBold', 'Italic'] },
  { family: 'Work Sans', styles: ['Regular', 'Medium', 'SemiBold', 'Bold', 'Light', 'Black'] },
  { family: 'DM Sans', styles: ['Regular', 'Medium', 'Bold', 'Italic'] },
  { family: 'Manrope', styles: ['Regular', 'Medium', 'SemiBold', 'Bold', 'Light', 'ExtraBold'] },
  { family: 'JetBrains Mono', styles: ['Regular', 'Medium', 'Bold', 'Light', 'Italic'] },
  { family: 'Fira Code', styles: ['Regular', 'Medium', 'Light', 'Retina'] },
  { family: 'IBM Plex Sans', styles: ['Regular', 'Medium', 'SemiBold', 'Bold', 'Light', 'Text', 'Italic'] },
  { family: 'IBM Plex Mono', styles: ['Regular', 'Medium', 'SemiBold', 'Bold', 'Light', 'Text', 'Italic'] },
];

/**
 * @param {{ family: string, styles: string[] }[] | null | undefined} localFamilies
 * @returns {Map<string, string[]>}
 */
export function buildFontMappingFamilyStyleMap(localFamilies) {
  /** @type {Map<string, string[]>} */
  const map = new Map();
  const pushUnique = (family, styles) => {
    const fam = String(family || '').trim();
    if (!fam) return;
    const prev = map.get(fam) || [];
    const set = new Set([...prev, ...styles.map(s => String(s || '').trim()).filter(Boolean)]);
    map.set(fam, [...set].sort((a, b) => a.localeCompare(b)));
  };

  for (const row of FONT_MAPPING_CURATED_FONTS) {
    pushUnique(row.family, row.styles);
  }

  if (Array.isArray(localFamilies)) {
    for (const row of localFamilies) {
      if (row && typeof row.family === 'string') {
        pushUnique(row.family, Array.isArray(row.styles) ? row.styles : []);
      }
    }
  }

  return map;
}

/** Stable curated order for empty-query suggestions. */
export function getFontMappingCuratedFamilyOrder() {
  return FONT_MAPPING_CURATED_FONTS.map(r => r.family);
}
