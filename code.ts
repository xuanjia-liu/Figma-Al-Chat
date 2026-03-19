// Figma Gemini Plugin - Export selections to Gemini chat
// Supports: CSS code, SVG code, PNG image, Text content

// Settings keys
const SETTINGS_KEYS = {
  PROVIDER: 'figma-ai-provider',
  AI_OFF_MODE: 'figma-ai-off-mode',
  GEMINI_API_KEY: 'figma-gemini-api-key',
  GEMINI_MODEL: 'figma-gemini-model',
  OPENAI_API_KEY: 'figma-openai-api-key',
  OPENAI_MODEL: 'figma-openai-model',
  ANTHROPIC_API_KEY: 'figma-anthropic-api-key',
  ANTHROPIC_MODEL: 'figma-anthropic-model',
  CSS_FORMAT: 'figma-css-format',
  // Selection size limit
  SELECTION_SIZE_LIMIT: 'figma-selection-size-limit',
  // Enabled models for chat dropdown
  ENABLED_MODELS: 'figma-enabled-models',
  // Audit mode settings
  AUDIT_SETTINGS: 'figma-audit-settings',
  AUDIT_PRESETS: 'figma-audit-presets',
  // Chat archives
  CHAT_ARCHIVES: 'figma-chat-archives',
  // Slash quick actions usage
  QUICK_ACTION_USAGE: 'figma-quick-action-usage',
  // Custom tones for Change tone action
  CUSTOM_TONES: 'figma-custom-tones',
  CUSTOM_IMAGE_PRESETS: 'figma-custom-image-presets',
  CUSTOM_RE_STYLE_PRESETS: 'figma-custom-re-style-presets',
  CUSTOM_SMART_RENAME_PRESETS: 'figma-custom-smart-rename-presets',
  CUSTOM_STYLE_CATEGORIES: 'figma-custom-style-categories',
  // Last used quick actions
  LAST_USED_QUICK_ACTIONS: 'figma-last-used-quick-actions',
  // Icon API source
  ICON_API_SOURCE: 'figma-icon-api-source',
  // Icon font family
  ICON_FONT_FAMILY: 'figma-icon-font-family',
  // Saved inputs for each action (the "drawer inputs")
  PROMPT_HISTORY: 'figma-prompt-history',
  REPLY_TEMPLATES: 'figma-reply-templates',
  // Plugin window size
  PLUGIN_WIDTH: 'figma-plugin-width',
  PLUGIN_HEIGHT: 'figma-plugin-height',
  // Figma Personal Access Token for REST API
  FIGMA_PERSONAL_TOKEN: 'figma-personal-access-token',
  // Quiver API key for vector generation
  QUIVER_API_KEY: 'figma-quiver-api-key',
  // Last opened chat ID
  LAST_CHAT_ID: 'figma-last-chat-id',
  // Last active commands category
  LAST_COMMANDS_CATEGORY: 'figma-last-commands-category',
  // Maximized prompt drawer data for restoration
  MAXIMIZED_PROMPT_DRAWER_DATA: 'figma-maximized-prompt-drawer-data',
  UNSPLASH_API_KEY: 'figma-unsplash-api-key',
  PIXABAY_API_KEY: 'figma-pixabay-api-key',
  PEXELS_API_KEY: 'figma-pexels-api-key'
};

figma.showUI(__html__, {
  width: 480,
  height: 700,
  themeColors: true
});

// Load and apply stored size immediately
(async () => {
  try {
    const width = await figma.clientStorage.getAsync(SETTINGS_KEYS.PLUGIN_WIDTH);
    const height = await figma.clientStorage.getAsync(SETTINGS_KEYS.PLUGIN_HEIGHT);
    if (width && height) {
      figma.ui.resize(width, height);
    }
  } catch (error) {
    console.error('Failed to load plugin size:', error);
  }
})();

// Send file info to UI on plugin start
setTimeout(() => {
  const fileKey = figma.fileKey || '';
  const fileName = figma.root.name;
  const currentPageId = figma.currentPage.id;
  const currentPageName = figma.currentPage.name;

  console.log('[Figma AI] File info - fileKey:', fileKey || '(not available)', 'fileName:', fileName);

  figma.ui.postMessage({
    type: 'file-info',
    data: {
      fileKey,
      fileName,
      currentPageId,
      currentPageName
    }
  });
}, 500);

// Helper function to convert RGB to hex
function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) => {
    const hex = Math.round(n * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

// OKLCH color space conversion functions
// Polyfill for Math.cbrt
const cbrt = (x: number): number => {
  const y = Math.pow(Math.abs(x), 1 / 3);
  return x < 0 ? -y : y;
};
function rgbToOklch(r: number, g: number, b: number): { l: number, c: number, h: number } {
  // Convert RGB to linear RGB
  const toLinear = (x: number) => x <= 0.04045 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4);

  const lr = toLinear(r);
  const lg = toLinear(g);
  const lb = toLinear(b);

  // Convert to XYZ
  const x = lr * 0.4124 + lg * 0.3576 + lb * 0.1805;
  const y = lr * 0.2126 + lg * 0.7152 + lb * 0.0722;
  const z = lr * 0.0193 + lg * 0.1192 + lb * 0.9505;

  // Convert to OKLab
  const x_ = x * 0.8189330101 + y * 0.3618667424 - z * 0.1288597133;
  const y_ = x * 0.0329845436 + y * 1.0000000000 + z * 0.0095746948;
  const z_ = x * 0.0482003018 + y * 0.2970766037 + z * 0.8162819536;

  const l_ = cbrt(y_);
  const m_ = cbrt(x_);
  const s_ = cbrt(z_);

  const l = 0.2104542553 * l_ + 0.7936177850 * m_ - 0.0040720468 * s_;
  const a = 1.9779984951 * l_ - 2.4285922050 * m_ + 0.4505937099 * s_;
  const b_ = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.8086757660 * s_;

  // Convert OKLab to OKLCH
  const c = Math.sqrt(a * a + b_ * b_);
  const h = Math.atan2(b_, a) * (180 / Math.PI);
  const h_normalized = h < 0 ? h + 360 : h;

  return { l: l * 100, c, h: h_normalized };
}

function oklchToRgb(l: number, c: number, h: number): { r: number, g: number, b: number } {
  // Convert OKLCH to OKLab
  const l_norm = l / 100;
  const h_rad = (h * Math.PI) / 180;
  const a = c * Math.cos(h_rad);
  const b_ = c * Math.sin(h_rad);

  // Convert OKLab to linear RGB
  const l_ = l_norm + 0.3963377774 * a + 0.2158037573 * b_;
  const m_ = l_norm - 0.1055613458 * a - 0.0638541728 * b_;
  const s_ = l_norm - 0.0894841775 * a - 1.2914855480 * b_;

  const l_cubed = l_ * l_ * l_;
  const m_cubed = m_ * m_ * m_;
  const s_cubed = s_ * s_ * s_;

  const x = l_cubed * 1.2270138511 - m_cubed * 0.5577999807 + s_cubed * 0.2812561490;
  const y = l_cubed * -0.0405801784 + m_cubed * 1.1122568696 - s_cubed * 0.0716766787;
  const z = l_cubed * -0.0763812845 - m_cubed * 0.4214819784 + s_cubed * 1.5861632204;

  // Convert to sRGB
  const toSrgb = (x: number) => x <= 0.0031308 ? x * 12.92 : 1.055 * Math.pow(x, 1 / 2.4) - 0.055;

  const r = Math.max(0, Math.min(1, toSrgb(x)));
  const g = Math.max(0, Math.min(1, toSrgb(y)));
  const b = Math.max(0, Math.min(1, toSrgb(z)));

  return { r, g, b };
}

// Helper function to modify gradient hues using OKLCH
function modifyGradientHue(gradient: GradientPaint, targetHue: number): GradientPaint {
  const modifiedStops = gradient.gradientStops.map(stop => {
    const oklch = rgbToOklch(stop.color.r, stop.color.g, stop.color.b);
    const newRgb = oklchToRgb(oklch.l, oklch.c, targetHue);

    return {
      ...stop,
      color: {
        ...stop.color,
        r: newRgb.r,
        g: newRgb.g,
        b: newRgb.b
      }
    };
  });

  return {
    ...gradient,
    gradientStops: modifiedStops
  };
}

// Smart setFill that preserves gradients by modifying hue
function smartSetFill(node: GeometryMixin, targetColor: RGBA): boolean {
  const currentFills = node.fills;

  if (currentFills === figma.mixed || !Array.isArray(currentFills) || currentFills.length === 0) {
    // No fills or mixed state, set solid color
    node.fills = [{ type: 'SOLID', color: { r: targetColor.r, g: targetColor.g, b: targetColor.b } }];
    return true;
  }

  // Check if there are any gradients
  const hasGradients = currentFills.some(fill =>
    fill.type === 'GRADIENT_LINEAR' ||
    fill.type === 'GRADIENT_RADIAL' ||
    fill.type === 'GRADIENT_ANGULAR' ||
    fill.type === 'GRADIENT_DIAMOND'
  );

  if (!hasGradients) {
    // No gradients, set solid color
    node.fills = [{ type: 'SOLID', color: { r: targetColor.r, g: targetColor.g, b: targetColor.b } }];
    return true;
  }

  // Convert target color to OKLCH to get target hue
  const targetOklch = rgbToOklch(targetColor.r, targetColor.g, targetColor.b);
  const targetHue = targetOklch.h;

  // Modify all gradients by changing their hue
  const modifiedFills = currentFills.map(fill => {
    if (fill.type === 'GRADIENT_LINEAR' ||
      fill.type === 'GRADIENT_RADIAL' ||
      fill.type === 'GRADIENT_ANGULAR' ||
      fill.type === 'GRADIENT_DIAMOND') {
      return modifyGradientHue(fill as GradientPaint, targetHue);
    }
    return fill;
  });

  node.fills = modifiedFills;
  return true;
}

type SmartRenameCaseOnlyDelimiter = 'camelCase' | 'PascalCase' | '_' | '/' | '-' | ' ';
type LocalSequenceOrder = 'zOrder' | 'reverse' | 'alphabetical';

type EditableTextTarget =
  | { kind: 'text'; node: TextNode }
  | { kind: 'sticky'; node: StickyNode }
  | { kind: 'shape-with-text'; node: ShapeWithTextNode }
  | { kind: 'instance-prop'; node: InstanceNode; propertyKey: string; currentText: string };

function splitNameIntoTokens(name: string): string[] {
  return name
    .trim()
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
    .replace(/[_/\-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .split(' ')
    .map(token => token.trim())
    .filter(Boolean);
}

function capitalizeWord(word: string): string {
  if (!word) return '';
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
}

function formatTokensWithDelimiter(tokens: string[], delimiter: SmartRenameCaseOnlyDelimiter): string {
  if (tokens.length === 0) return '';

  switch (delimiter) {
    case 'camelCase':
      return tokens
        .map((token, index) => index === 0 ? token.toLowerCase() : capitalizeWord(token))
        .join('');
    case 'PascalCase':
      return tokens.map(capitalizeWord).join('');
    case '_':
    case '/':
    case '-':
      return tokens.map(token => token.toLowerCase()).join(delimiter);
    case ' ':
    default:
      return tokens.map(capitalizeWord).join(' ');
  }
}

function transformNameCaseOnly(name: string, delimiter: SmartRenameCaseOnlyDelimiter, keepOriginal: boolean): string {
  const trimmedName = (name || '').trim();
  if (!trimmedName) return name;

  let transformedName = '';

  if (trimmedName.includes('=')) {
    const [propertyPart, ...rest] = trimmedName.split('=');
    const valuePart = rest.join('=').trim();
    const formattedValue = formatTokensWithDelimiter(splitNameIntoTokens(valuePart), delimiter) || valuePart;
    transformedName = `${propertyPart}=${formattedValue}`;
  } else {
    transformedName = formatTokensWithDelimiter(splitNameIntoTokens(trimmedName), delimiter) || trimmedName;
  }

  if (keepOriginal && transformedName !== trimmedName) {
    return `${transformedName} (${trimmedName})`;
  }

  return transformedName;
}

function isRenameableSceneNode(node: SceneNode): node is SceneNode & { name: string } {
  return typeof node.name === 'string';
}

function collectSmartRenameTargets(
  selection: readonly SceneNode[],
  onlySelected: boolean,
  includeInstances: boolean
): SceneNode[] {
  const collected: SceneNode[] = [];
  const seen = new Set<string>();

  const visit = (node: SceneNode) => {
    if (seen.has(node.id)) return;
    seen.add(node.id);

    if (!includeInstances && node.type === 'INSTANCE') {
      return;
    }

    collected.push(node);

    if ('children' in node) {
      for (const child of node.children) {
        visit(child as SceneNode);
      }
    }
  };

  for (const node of selection) {
    if (onlySelected) {
      if (!includeInstances && node.type === 'INSTANCE') {
        continue;
      }
      if (!seen.has(node.id)) {
        seen.add(node.id);
        collected.push(node);
      }
      continue;
    }
    visit(node);
  }

  return collected;
}

function getNodeSortText(node: SceneNode): string {
  const text = extractTextContent([node]).trim();
  if (text) return text.toLowerCase();
  return (node.name || '').trim().toLowerCase();
}

function getNodeAbsolutePosition(node: SceneNode): { x: number; y: number } {
  const transform = node.absoluteTransform;
  return {
    x: transform[0][2],
    y: transform[1][2]
  };
}

function sortSceneNodesByOrder(nodes: readonly SceneNode[], order: LocalSequenceOrder = 'zOrder'): SceneNode[] {
  const sorted = [...nodes];

  if (order === 'alphabetical') {
    sorted.sort((a, b) => getNodeSortText(a).localeCompare(getNodeSortText(b), undefined, { numeric: true }));
    return sorted;
  }

  sorted.sort((a, b) => {
    const posA = getNodeAbsolutePosition(a);
    const posB = getNodeAbsolutePosition(b);
    if (posA.y !== posB.y) return posA.y - posB.y;
    if (posA.x !== posB.x) return posA.x - posB.x;
    return a.id.localeCompare(b.id);
  });

  if (order === 'reverse') {
    sorted.reverse();
  }

  return sorted;
}

function getSequencePaddingDigits(
  tokenLength: number,
  sequenceNumber: number,
  maxSequenceNumber: number,
  explicitPadLength: number = 0
): number {
  if (explicitPadLength > 0) return explicitPadLength;
  const autoDigits = Math.max(String(Math.max(sequenceNumber, maxSequenceNumber, 0)).length, 1);
  return Math.max(tokenLength, autoDigits);
}

function replaceSequenceTokens(
  template: string,
  original: string,
  sequenceNumber: number,
  maxSequenceNumber: number,
  explicitPadLength: number = 0
): string {
  const input = template || '';
  return input
    .replace(/\{original\}/g, original)
    .replace(/\{(n+)\}/g, (_, token: string) => {
      const digits = getSequencePaddingDigits(token.length, sequenceNumber, maxSequenceNumber, explicitPadLength);
      return String(sequenceNumber).padStart(digits, '0');
    });
}

function normalizeManagedSpacing(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}

function buildAffixedString(
  original: string,
  prefix: string,
  suffix: string,
  sequenceNumber: number,
  maxSequenceNumber: number,
  explicitPadLength: number = 0,
  keepSpacing: boolean = false
): string {
  const prefixHasOriginal = /\{original\}/.test(prefix || '');
  const suffixHasOriginal = /\{original\}/.test(suffix || '');
  const resolvedPrefix = replaceSequenceTokens(prefix || '', original, sequenceNumber, maxSequenceNumber, explicitPadLength);
  const resolvedSuffix = replaceSequenceTokens(suffix || '', original, sequenceNumber, maxSequenceNumber, explicitPadLength);

  const combined = (prefixHasOriginal || suffixHasOriginal)
    ? `${resolvedPrefix}${resolvedSuffix}`
    : `${resolvedPrefix}${original}${resolvedSuffix}`;

  return keepSpacing ? normalizeManagedSpacing(combined) : combined;
}

function cleanUpNameSegment(segment: string): string {
  return segment
    .replace(/[^\p{L}\p{N}\s\-_]/gu, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function cleanUpLayerName(name: string): string {
  if (!name) return '';
  if (name.includes('=')) {
    const [propertyPart, ...rest] = name.split('=');
    return `${cleanUpNameSegment(propertyPart)}=${cleanUpNameSegment(rest.join('='))}`;
  }
  return cleanUpNameSegment(name);
}

async function resolveEditableTextTarget(node: SceneNode): Promise<EditableTextTarget | null> {
  if (node.type === 'INSTANCE') {
    const instance = node as InstanceNode;
    try {
      let mainComp: ComponentNode | null = null;
      if ('getMainComponentAsync' in instance) {
        mainComp = await (instance as any).getMainComponentAsync();
      } else {
        mainComp = (instance as any).mainComponent;
      }

      if (mainComp) {
        const defs = (mainComp.parent && mainComp.parent.type === 'COMPONENT_SET')
          ? (mainComp.parent as ComponentSetNode).componentPropertyDefinitions
          : mainComp.componentPropertyDefinitions;

        const textPropDefs = Object.entries(defs).filter(([_, d]) => (d as any).type === 'TEXT');
        if (textPropDefs.length > 0) {
          const bestMatch = textPropDefs.find(([key]) => {
            const lowKey = key.toLowerCase();
            return lowKey.includes('label') || lowKey.includes('text') || lowKey.includes('title') || lowKey.includes('content') || lowKey.includes('button');
          });
          const propertyKey = (bestMatch ? bestMatch[0] : textPropDefs[0][0]) || '';
          const currentText = typeof (instance.componentProperties as any)?.[propertyKey]?.value === 'string'
            ? (instance.componentProperties as any)[propertyKey].value
            : '';
          if (propertyKey) {
            return { kind: 'instance-prop', node: instance, propertyKey, currentText };
          }
        }
      }
    } catch (error) {
      console.warn('Failed to resolve instance text property', error);
    }
  }

  if (node.type === 'TEXT') return { kind: 'text', node: node as TextNode };
  if (node.type === 'STICKY') return { kind: 'sticky', node: node as StickyNode };
  if (node.type === 'SHAPE_WITH_TEXT') return { kind: 'shape-with-text', node: node as ShapeWithTextNode };

  if ('children' in node) {
    const container = node as ChildrenMixin;
    let textNode = container.children.find(n => n.type === 'TEXT' && isEffectivelyVisible(n as SceneNode)) as TextNode | undefined;
    if (!textNode && 'findOne' in container) {
      textNode = (container as any).findOne((n: any) => n.type === 'TEXT' && isEffectivelyVisible(n as SceneNode)) as TextNode | undefined;
    }
    if (textNode) return { kind: 'text', node: textNode };
  }

  return null;
}

function getEditableTextTargetContent(target: EditableTextTarget): string {
  switch (target.kind) {
    case 'text':
      return target.node.characters || '';
    case 'sticky':
      return target.node.text.characters || '';
    case 'shape-with-text':
      return target.node.text.characters || '';
    case 'instance-prop':
      return target.currentText || '';
  }
}

async function setEditableTextTargetContent(target: EditableTextTarget, newText: string): Promise<void> {
  switch (target.kind) {
    case 'instance-prop':
      target.node.setProperties({ [target.propertyKey]: newText });
      return;
    case 'sticky':
      await loadAllFontsForTextSublayerNode(target.node.text);
      target.node.text.characters = newText;
      return;
    case 'shape-with-text':
      await loadAllFontsForTextSublayerNode(target.node.text);
      target.node.text.characters = newText;
      return;
    case 'text': {
      const textNode = target.node;
      await loadAllFontsForTextNode(textNode);
      if (textNode.fontName !== figma.mixed && textNode.fontSize !== figma.mixed && textNode.textStyleId === '') {
        textNode.characters = newText;
      } else {
        const originalLen = textNode.characters.length;
        const originalSegs = getTextStyleSegments(textNode);
        textNode.characters = newText;
        await reapplyTextStylesAfterReplace(textNode, originalSegs, originalLen, newText);
      }
      return;
    }
  }
}

function buildSelectionInfoPayload(selection: readonly SceneNode[]) {
  const collectDescendantIds = (node: BaseNode): string[] => {
    const ids: string[] = [];
    if ('children' in node) {
      for (const child of node.children) {
        ids.push(child.id);
        ids.push(...collectDescendantIds(child));
      }
    }
    return ids;
  };

  return selection.map(node => {
    let hasImageFill = false;
    if ('fills' in node && Array.isArray(node.fills)) {
      hasImageFill = node.fills.some((fill: Paint) => fill.type === 'IMAGE');
    }
    return {
      name: node.name,
      type: node.type,
      id: node.id,
      description: typeof (node as any).description === 'string' ? (node as any).description : undefined,
      hasImageFill,
      descendantIds: collectDescendantIds(node)
    };
  });
}

// Global font cache to avoid redundant awaits during large batch operations
const loadedFontsCache = new Set<string>();
const loadingFontsPromises = new Map<string, Promise<void>>();

/**
 * Smart font loader that skips the await if the font is already known to be loaded.
 * This significantly improves performance in large loops by avoiding microtask overhead.
 * It also prevents concurrent figma.loadFontAsync calls for the same font.
 */
async function smartLoadFont(font: FontName): Promise<FontName> {
  const key = `${font.family}::${font.style}`;
  if (loadedFontsCache.has(key)) return font;

  // If already loading this font, wait for the existing promise
  if (loadingFontsPromises.has(key)) {
    try {
      await loadingFontsPromises.get(key);
      return font;
    } catch (err) {
      // If the primary loading failed, try variations below
    }
  }

  // Try loading the exact font first
  const tryLoad = async (f: FontName): Promise<boolean> => {
    const k = `${f.family}::${f.style}`;
    if (loadedFontsCache.has(k)) return true;
    try {
      await figma.loadFontAsync(f);
      loadedFontsCache.add(k);
      return true;
    } catch {
      return false;
    }
  };

  if (await tryLoad(font)) return font;

  // Generate style name variations to handle different font naming conventions.
  // e.g. "SemiBold" ↔ "Semi Bold", "ExtraLight" ↔ "Extra Light", "ExtraBold" ↔ "Extra Bold"
  const styleVariations: string[] = [];
  const s = font.style;
  if (/[a-z][A-Z]/.test(s)) {
    // CamelCase → spaced: "SemiBold" → "Semi Bold"
    styleVariations.push(s.replace(/([a-z])([A-Z])/g, '$1 $2'));
  }
  if (s.includes(' ')) {
    // Spaced → CamelCase: "Semi Bold" → "SemiBold"
    styleVariations.push(s.replace(/ /g, ''));
  }
  // Also try same-family Regular as a last resort within the family
  if (s !== 'Regular') {
    styleVariations.push('Regular');
  }

  for (const variant of styleVariations) {
    const variantFont: FontName = { family: font.family, style: variant };
    if (await tryLoad(variantFont)) {
      console.log(`Font style "${font.family} ${s}" not found, loaded "${variant}" instead`);
      return variantFont;
    }
  }

  // Final fallback: Inter Regular
  const fallback: FontName = { family: 'Inter', style: 'Regular' };
  if (await tryLoad(fallback)) return fallback;

  console.error('Critical failure: Could not even load Inter Regular fallback');
  return fallback;
}

// Load every font used in a text node (including mixed font ranges) so that
// characters can be safely modified.
async function loadAllFontsForTextNode(textNode: TextNode): Promise<void> {
  const fontsToLoad: FontName[] = [];

  if (textNode.fontName === figma.mixed) {
    const seen = new Set<string>();
    // Using segments is O(segments) - significantly faster than O(characters)
    const segments = textNode.getStyledTextSegments(['fontName']);
    for (const seg of segments) {
      if (seg.fontName) {
        const font = seg.fontName as FontName;
        const key = `${font.family}::${font.style}`;
        if (!seen.has(key)) {
          seen.add(key);
          fontsToLoad.push(font);
        }
      }
    }
  } else {
    fontsToLoad.push(textNode.fontName as FontName);
  }

  // Load fonts sequentially to avoid triggering CppVm conflicts
  for (const font of fontsToLoad) {
    await smartLoadFont(font);
  }
}

// Load every font used in a text sublayer node (for STICKY and SHAPE_WITH_TEXT nodes)
// This handles mixed fonts similar to loadAllFontsForTextNode
async function loadAllFontsForTextSublayerNode(textSublayer: TextSublayerNode): Promise<void> {
  const fontsToLoad: FontName[] = [];

  if (textSublayer.fontName === figma.mixed) {
    const seen = new Set<string>();
    const segments = textSublayer.getStyledTextSegments(['fontName']);
    for (const seg of segments) {
      if (seg.fontName) {
        const font = seg.fontName as FontName;
        const key = `${font.family}::${font.style}`;
        if (!seen.has(key)) {
          seen.add(key);
          fontsToLoad.push(font);
        }
      }
    }
  } else {
    fontsToLoad.push(textSublayer.fontName as FontName);
  }

  // Load fonts sequentially to avoid triggering CppVm conflicts
  for (const font of fontsToLoad) {
    await smartLoadFont(font);
  }
}

// Check if a node and all its ancestors are visible
function isEffectivelyVisible(node: SceneNode): boolean {
  try {
    if (!node || node.removed) return false;
    let current: BaseNode | null = node;
    while (current && !current.removed && current.type !== 'PAGE' && current.type !== 'DOCUMENT') {
      if ('visible' in current && (current as any).visible === false) {
        return false;
      }
      current = current.parent as BaseNode | null;
    }
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Check if a node supports HUG sizing.
 * HUG can only be set on auto-layout frames or text children of auto-layout frames.
 */
function canSetHug(node: SceneNode): boolean {
  if (node.type === 'FRAME' || node.type === 'COMPONENT' || node.type === 'INSTANCE') {
    return node.layoutMode !== 'NONE';
  }
  if (node.type === 'TEXT') {
    const parent = node.parent;
    return !!(parent && (parent.type === 'FRAME' || parent.type === 'COMPONENT' || parent.type === 'INSTANCE') && parent.layoutMode !== 'NONE');
  }
  return false;
}

type TextStyleSegment = {
  start: number;
  end: number;
  fontName: FontName;
  fontSize?: number;
  textDecoration?: TextDecoration;
  letterSpacing?: LetterSpacing;
  lineHeight?: LineHeight;
  fills?: ReadonlyArray<Paint>;
  fillStyleId?: string;
  textStyleId?: string;
};

function getTextStyleSegments(textNode: TextNode): TextStyleSegment[] {
  const segments = textNode.getStyledTextSegments([
    'fontName',
    'fontSize',
    'textDecoration',
    'letterSpacing',
    'lineHeight',
    'fills',
    'fillStyleId',
    'textStyleId'
  ]);

  return segments.map((seg) => ({
    start: seg.start,
    end: seg.end,
    fontName: seg.fontName as FontName,
    fontSize: seg.fontSize,
    textDecoration: seg.textDecoration,
    letterSpacing: seg.letterSpacing,
    lineHeight: seg.lineHeight,
    fills: seg.fills as ReadonlyArray<Paint>,
    fillStyleId: (seg as any).fillStyleId,
    textStyleId: (seg as any).textStyleId
  }));
}

async function reapplyTextStylesAfterReplace(
  textNode: TextNode,
  segments: TextStyleSegment[],
  originalLength: number,
  newText: string
): Promise<void> {
  const newLength = newText.length;
  if (!originalLength || !newLength || !segments.length) return;

  const ratio = newLength / originalLength;
  let lastEnd = 0;

  for (let index = 0; index < segments.length; index++) {
    const seg = segments[index];
    let start = Math.floor(seg.start * ratio);
    let end = index === segments.length - 1 ? newLength : Math.floor(seg.end * ratio);

    start = Math.max(0, Math.min(start, newLength));
    if (start < lastEnd) start = lastEnd;
    end = Math.max(start + 1, Math.min(end, newLength));
    if (start >= newLength) return;

    if (seg.textStyleId) {
      if (
        'setRangeTextStyleIdAsync' in textNode &&
        typeof (textNode as any).setRangeTextStyleIdAsync === 'function'
      ) {
        await (textNode as any).setRangeTextStyleIdAsync(start, end, seg.textStyleId);
      } else {
        textNode.setRangeTextStyleId(start, end, seg.textStyleId);
      }
    } else {
      textNode.setRangeFontName(start, end, seg.fontName);
      if (seg.fontSize !== undefined) {
        textNode.setRangeFontSize(start, end, seg.fontSize);
      }
      if (seg.textDecoration !== undefined) {
        textNode.setRangeTextDecoration(start, end, seg.textDecoration);
      }
      if (seg.letterSpacing !== undefined) {
        textNode.setRangeLetterSpacing(start, end, seg.letterSpacing);
      }
      if (seg.lineHeight !== undefined) {
        textNode.setRangeLineHeight(start, end, seg.lineHeight);
      }
    }

    if (seg.fillStyleId) {
      // Use async version for dynamic pages
      if (
        'setRangeFillStyleIdAsync' in textNode &&
        typeof (textNode as any).setRangeFillStyleIdAsync === 'function'
      ) {
        await (textNode as any).setRangeFillStyleIdAsync(start, end, seg.fillStyleId);
      } else {
        textNode.setRangeFillStyleId(start, end, seg.fillStyleId);
      }
    } else if (seg.fills && seg.fills.length) {
      // Use async version for dynamic pages
      if (
        'setRangeFillsAsync' in textNode &&
        typeof (textNode as any).setRangeFillsAsync === 'function'
      ) {
        await (textNode as any).setRangeFillsAsync(start, end, [...seg.fills]);
      } else {
        textNode.setRangeFills(start, end, [...seg.fills]);
      }
    }

    lastEnd = end;
  }
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Helper function to split text and track original indices
function splitTextWithIndices(
  text: string,
  delimiter: string | RegExp,
  keepDelimiter: boolean
): Array<{ text: string; startIndex: number; endIndex: number }> {
  const segments: Array<{ text: string; startIndex: number; endIndex: number }> = [];

  let regex: RegExp;
  try {
    if (typeof delimiter === 'string') {
      if (delimiter.startsWith('/') && delimiter.lastIndexOf('/') > 0) {
        const lastSlash = delimiter.lastIndexOf('/');
        const pattern = delimiter.substring(1, lastSlash);
        const flags = delimiter.substring(lastSlash + 1);
        regex = new RegExp(pattern, flags.includes('g') ? flags : flags + 'g');
      } else {
        regex = new RegExp(escapeRegex(delimiter), 'g');
      }
    } else {
      regex = delimiter;
    }
  } catch (e) {
    // Fallback to literal if regex is invalid
    regex = new RegExp(escapeRegex(String(delimiter)), 'g');
  }

  let lastIndex = 0;
  let match: RegExpExecArray | null;

  // Reset regex lastIndex for global regex
  if (regex.global) {
    regex.lastIndex = 0;
  }

  while ((match = regex.exec(text)) !== null) {
    const matchStart = match.index;
    const matchEnd = matchStart + match[0].length;

    // Add segment before delimiter
    if (matchStart > lastIndex) {
      segments.push({
        text: text.substring(lastIndex, matchStart),
        startIndex: lastIndex,
        endIndex: matchStart
      });
    }

    // Add delimiter if keeping it
    if (keepDelimiter) {
      segments.push({
        text: match[0],
        startIndex: matchStart,
        endIndex: matchEnd
      });
    }

    lastIndex = matchEnd;

    // Prevent infinite loop for zero-length matches
    if (match[0].length === 0) {
      regex.lastIndex++;
    }
  }

  // Add remaining text after last delimiter
  if (lastIndex < text.length) {
    segments.push({
      text: text.substring(lastIndex),
      startIndex: lastIndex,
      endIndex: text.length
    });
  }

  // If no matches, return the whole text as a single segment
  if (segments.length === 0 && text.length > 0) {
    segments.push({
      text: text,
      startIndex: 0,
      endIndex: text.length
    });
  }

  return segments;
}

// Helper function to filter and shift style segments for a text range
function getStyleSegmentsForRange(
  originalSegments: TextStyleSegment[],
  rangeStart: number,
  rangeEnd: number
): TextStyleSegment[] {
  const filtered: TextStyleSegment[] = [];

  for (const seg of originalSegments) {
    // Check if segment overlaps with the range
    const segStart = Math.max(seg.start, rangeStart);
    const segEnd = Math.min(seg.end, rangeEnd);

    if (segStart < segEnd) {
      // Shift indices relative to the start of the new segment
      filtered.push({
        ...seg,
        start: segStart - rangeStart,
        end: segEnd - rangeStart
      });
    }
  }

  return filtered;
}

async function applyStyleSegmentsToTextNode(
  textNode: TextNode,
  segments: TextStyleSegment[]
): Promise<void> {
  if (!segments.length) return;

  for (const seg of segments) {
    const start = seg.start;
    const end = seg.end;

    if (start >= end || start < 0 || end > textNode.characters.length) {
      continue;
    }

    // Apply text style ID if present
    if (seg.textStyleId) {
      if (
        'setRangeTextStyleIdAsync' in textNode &&
        typeof (textNode as any).setRangeTextStyleIdAsync === 'function'
      ) {
        await (textNode as any).setRangeTextStyleIdAsync(start, end, seg.textStyleId);
      } else {
        textNode.setRangeTextStyleId(start, end, seg.textStyleId);
      }
    } else {
      // Apply individual style properties
      textNode.setRangeFontName(start, end, seg.fontName);
      if (seg.fontSize !== undefined) {
        textNode.setRangeFontSize(start, end, seg.fontSize);
      }
      if (seg.textDecoration !== undefined) {
        textNode.setRangeTextDecoration(start, end, seg.textDecoration);
      }
      if (seg.letterSpacing !== undefined) {
        textNode.setRangeLetterSpacing(start, end, seg.letterSpacing);
      }
      if (seg.lineHeight !== undefined) {
        textNode.setRangeLineHeight(start, end, seg.lineHeight);
      }
    }

    // Apply fills
    if (seg.fillStyleId) {
      if (
        'setRangeFillStyleIdAsync' in textNode &&
        typeof (textNode as any).setRangeFillStyleIdAsync === 'function'
      ) {
        await (textNode as any).setRangeFillStyleIdAsync(start, end, seg.fillStyleId);
      } else {
        textNode.setRangeFillStyleId(start, end, seg.fillStyleId);
      }
    } else if (seg.fills && seg.fills.length) {
      if (
        'setRangeFillsAsync' in textNode &&
        typeof (textNode as any).setRangeFillsAsync === 'function'
      ) {
        await (textNode as any).setRangeFillsAsync(start, end, [...seg.fills]);
      } else {
        textNode.setRangeFills(start, end, [...seg.fills]);
      }
    }
  }
}

// Helper function to format numbers with minimal decimal places
function formatNumber(num: number): string {
  if (Number.isInteger(num)) {
    return num.toString();
  }
  return num.toFixed(2).replace(/\.?0+$/, '');
}

// Helper functions for annotation content generation


// ===== GRADIENT HELPERS =====
// Figma's gradientTransform is a 2x3 affine matrix: [[a, b, tx], [c, d, ty]]
// The matrix transforms the gradient from unit space to element space.
// 
// Key insights from Figma's coordinate system:
// - The gradient is defined in a 0-1 normalized space with center at (0.5, 0.5)
// - tx, ty represent the position offset (0.5 = centered = 0% in CSS)
// - Scale factors determine the gradient size (0.5 scale = 100% CSS size)
// - CSS position X corresponds to Figma's ty (swapped axes!)
// - CSS position Y corresponds to Figma's tx (swapped axes!)

interface GradientTransformInfo {
  angle: number;           // Rotation angle in degrees
  centerX: number;         // Center X position (0-100%) - derived from ty
  centerY: number;         // Center Y position (0-100%) - derived from tx
  sizeX: number;           // Size X as percentage (for radial gradient width)
  sizeY: number;           // Size Y as percentage (for radial gradient height)
  scaleX: number;          // Raw scale factor X
  scaleY: number;          // Raw scale factor Y
}

// Extract all transform properties from Figma's gradient transform matrix
function parseGradientTransform(gradientTransform: Transform): GradientTransformInfo {
  const [[a, b, tx], [c, d, ty]] = gradientTransform;

  // Calculate rotation angle from the matrix
  const angle = Math.atan2(b, a) * (180 / Math.PI);

  // Calculate scale factors (length of each axis vector)
  const scaleX = Math.sqrt(a * a + c * c);
  const scaleY = Math.sqrt(b * b + d * d);

  // For radial gradients:
  // - Figma uses 0.5 scale to represent 100% CSS size
  // - So CSS size = scale * 200%
  const sizeX = Math.round(scaleX * 200);
  const sizeY = Math.round(scaleY * 200);

  // Center position conversion:
  // - Figma: tx, ty are in 0-1 space where 0.5 is center
  // - CSS: 0% is top-left corner, 50% is center
  // - Formula: CSS position = (figma_value - 0.5) * 200
  // - Also: CSS X corresponds to Figma ty, CSS Y corresponds to Figma tx (axes swapped!)
  const centerX = Math.round((ty - 0.5) * 200);
  const centerY = Math.round((tx - 0.5) * 200);

  return {
    angle: Math.round((angle + 360) % 360),
    centerX,
    centerY,
    sizeX,
    sizeY,
    scaleX: parseFloat(scaleX.toFixed(3)),
    scaleY: parseFloat(scaleY.toFixed(3))
  };
}

// Helper to format color stop
function formatColorStop(stop: ColorStop): string {
  if (stop.color.a < 1) {
    return `rgba(${Math.round(stop.color.r * 255)}, ${Math.round(stop.color.g * 255)}, ${Math.round(stop.color.b * 255)}, ${stop.color.a.toFixed(2)})`;
  }
  return rgbToHex(stop.color.r, stop.color.g, stop.color.b);
}

// Calculate linear gradient angle (CSS uses different angle convention)
function calculateLinearGradientAngle(gradientTransform: Transform): number {
  const [[a, b]] = gradientTransform;
  // CSS linear-gradient: 0deg = to top, 90deg = to right
  // Figma: angle is based on the transform matrix rotation
  const angle = Math.atan2(b, a) * (180 / Math.PI);
  return Math.round((angle + 90 + 360) % 360);
}

// Generate CSS for linear gradient with proper angle
function generateLinearGradientCSS(fill: GradientPaint): string {
  const angle = fill.gradientTransform ? calculateLinearGradientAngle(fill.gradientTransform) : 180;

  const stops = fill.gradientStops.map((stop: ColorStop) => {
    return `${formatColorStop(stop)} ${Math.round(stop.position * 100)}%`;
  }).join(', ');

  return `linear-gradient(${angle}deg, ${stops})`;
}

// Generate CSS for radial gradient matching Figma's dev mode format:
// radial-gradient(WIDTH% HEIGHT% at X% Y%, color-stops)
function generateRadialGradientCSS(fill: GradientPaint): string {
  const transform = fill.gradientTransform ? parseGradientTransform(fill.gradientTransform) : null;

  // Default values for a centered gradient (tx=0.5, ty=0.5, scale=0.5)
  // In Figma's convention: centered gradient = "at 0% 0%" with size 100% 100%
  let sizeX = 100;
  let sizeY = 100;
  let centerX = 0;
  let centerY = 0;

  if (transform) {
    sizeX = transform.sizeX;
    sizeY = transform.sizeY;
    centerX = transform.centerX;
    centerY = transform.centerY;
  }

  // Build the stops
  const stops = fill.gradientStops.map((stop: ColorStop) => {
    return `${formatColorStop(stop)} ${Math.round(stop.position * 100)}%`;
  }).join(', ');

  // Format: radial-gradient(WIDTH% HEIGHT% at X% Y%, stops)
  // This matches Figma's dev mode output format
  return `radial-gradient(${sizeX}% ${sizeY}% at ${centerX}% ${centerY}%, ${stops})`;
}

// Generate CSS for angular/conic gradient with center position and starting angle
function generateAngularGradientCSS(fill: GradientPaint): string {
  const transform = fill.gradientTransform ? parseGradientTransform(fill.gradientTransform) : null;

  // Default values for centered gradient (matches Figma's convention)
  let startAngle = 0;
  let centerX = 0;
  let centerY = 0;

  if (transform) {
    // For angular gradients, the angle represents the starting rotation
    startAngle = transform.angle;
    centerX = transform.centerX;
    centerY = transform.centerY;
  }

  // Build the stops (angular gradients use degrees for positions)
  const stops = fill.gradientStops.map((stop: ColorStop) => {
    return `${formatColorStop(stop)} ${Math.round(stop.position * 360)}deg`;
  }).join(', ');

  // Format: conic-gradient(from ANGLEdeg at X% Y%, stops)
  return `conic-gradient(from ${startAngle}deg at ${centerX}% ${centerY}%, ${stops})`;
}

// Generate CSS for diamond gradient (no direct CSS equivalent - use radial approximation)
function generateDiamondGradientCSS(fill: GradientPaint): string {
  const transform = fill.gradientTransform ? parseGradientTransform(fill.gradientTransform) : null;

  // Default values for centered gradient
  let sizeX = 100;
  let sizeY = 100;
  let centerX = 0;
  let centerY = 0;

  if (transform) {
    sizeX = transform.sizeX;
    sizeY = transform.sizeY;
    centerX = transform.centerX;
    centerY = transform.centerY;
  }

  // Build the stops
  const stops = fill.gradientStops.map((stop: ColorStop) => {
    return `${formatColorStop(stop)} ${Math.round(stop.position * 100)}%`;
  }).join(', ');

  // Diamond gradients don't have a CSS equivalent, approximate with radial
  return `radial-gradient(${sizeX}% ${sizeY}% at ${centerX}% ${centerY}%, ${stops}) /* Figma diamond gradient - approximated */`;
}

// Helper function to generate Tailwind classes from a node
function getTailwindClasses(node: SceneNode): string {
  const classes: string[] = [];

  // Width and height
  if ('width' in node && 'height' in node) {
    classes.push(`w-[${Math.round(node.width)}px]`);
    classes.push(`h-[${Math.round(node.height)}px]`);
  }

  // Border radius
  if ('cornerRadius' in node && typeof node.cornerRadius === 'number' && node.cornerRadius > 0) {
    const r = node.cornerRadius;
    if (r <= 2) classes.push('rounded-sm');
    else if (r <= 4) classes.push('rounded');
    else if (r <= 6) classes.push('rounded-md');
    else if (r <= 8) classes.push('rounded-lg');
    else if (r <= 12) classes.push('rounded-xl');
    else if (r <= 16) classes.push('rounded-2xl');
    else if (r <= 24) classes.push('rounded-3xl');
    else if (r >= 9999) classes.push('rounded-full');
    else classes.push(`rounded-[${Math.round(r)}px]`);
  } else if ('topLeftRadius' in node) {
    const tl = (node as RectangleNode).topLeftRadius || 0;
    const tr = (node as RectangleNode).topRightRadius || 0;
    const br = (node as RectangleNode).bottomRightRadius || 0;
    const bl = (node as RectangleNode).bottomLeftRadius || 0;
    if (tl || tr || br || bl) {
      classes.push(`rounded-tl-[${Math.round(tl)}px]`);
      classes.push(`rounded-tr-[${Math.round(tr)}px]`);
      classes.push(`rounded-br-[${Math.round(br)}px]`);
      classes.push(`rounded-bl-[${Math.round(bl)}px]`);
    }
  }

  // Background fill - including gradients
  if ('fills' in node && Array.isArray(node.fills) && node.fills.length > 0) {
    const fill = node.fills[0];
    if (fill.visible !== false) {
      if (fill.type === 'SOLID') {
        const opacity = fill.opacity !== undefined ? fill.opacity : 1;
        const hex = rgbToHex(fill.color.r, fill.color.g, fill.color.b);
        if (opacity < 1) {
          classes.push(`bg-[${hex}]/${Math.round(opacity * 100)}`);
        } else {
          classes.push(`bg-[${hex}]`);
        }
      } else if (fill.type === 'GRADIENT_LINEAR') {
        // Tailwind arbitrary gradient value
        const gradientCSS = generateLinearGradientCSS(fill as GradientPaint);
        classes.push(`bg-[${gradientCSS.replace(/\s+/g, '_')}]`);
      } else if (fill.type === 'GRADIENT_RADIAL') {
        const gradientCSS = generateRadialGradientCSS(fill as GradientPaint);
        classes.push(`bg-[${gradientCSS.replace(/\s+/g, '_')}]`);
      } else if (fill.type === 'GRADIENT_ANGULAR') {
        const gradientCSS = generateAngularGradientCSS(fill as GradientPaint);
        classes.push(`bg-[${gradientCSS.replace(/\s+/g, '_')}]`);
      } else if (fill.type === 'GRADIENT_DIAMOND') {
        const gradientCSS = generateDiamondGradientCSS(fill as GradientPaint);
        classes.push(`bg-[${gradientCSS.replace(/\s+/g, '_')}]`);
      }
    }
  }

  // Stroke/Border
  if ('strokes' in node && Array.isArray(node.strokes) && node.strokes.length > 0) {
    const stroke = node.strokes[0];
    if (stroke.type === 'SOLID' && stroke.visible !== false) {
      const strokeWeight = 'strokeWeight' in node ? (node.strokeWeight as number) : 1;
      const hex = rgbToHex(stroke.color.r, stroke.color.g, stroke.color.b);
      classes.push(`border-[${strokeWeight}px]`);
      classes.push(`border-[${hex}]`);
    }
  }

  // Opacity
  if ('opacity' in node && node.opacity < 1) {
    classes.push(`opacity-${Math.round(node.opacity * 100)}`);
  }

  // Rotation
  if ('rotation' in node && node.rotation !== 0) {
    classes.push(`rotate-[${formatNumber(-node.rotation)}deg]`);
  }

  // Effects (shadows)
  if ('effects' in node && Array.isArray(node.effects) && node.effects.length > 0) {
    for (const effect of node.effects) {
      if (effect.visible === false) continue;
      if (effect.type === 'DROP_SHADOW') {
        const color = `rgba(${Math.round(effect.color.r * 255)},${Math.round(effect.color.g * 255)},${Math.round(effect.color.b * 255)},${formatNumber(effect.color.a || 1)})`;
        classes.push(`shadow-[${formatNumber(effect.offset.x)}px_${formatNumber(effect.offset.y)}px_${formatNumber(effect.radius)}px_${formatNumber(effect.spread || 0)}px_${color}]`);
      } else if (effect.type === 'LAYER_BLUR') {
        classes.push(`blur-[${formatNumber(effect.radius)}px]`);
      } else if (effect.type === 'BACKGROUND_BLUR') {
        classes.push(`backdrop-blur-[${formatNumber(effect.radius)}px]`);
      }
    }
  }

  // Text-specific styles
  if (node.type === 'TEXT') {
    const textNode = node as TextNode;

    if (typeof textNode.fontName !== 'symbol') {
      const weight = getFontWeight(textNode.fontName.style);
      const weightMap: Record<number, string> = {
        100: 'font-thin', 200: 'font-extralight', 300: 'font-light',
        400: 'font-normal', 500: 'font-medium', 600: 'font-semibold',
        700: 'font-bold', 800: 'font-extrabold', 900: 'font-black'
      };
      classes.push(weightMap[weight] || 'font-normal');
    }

    if (typeof textNode.fontSize === 'number') {
      classes.push(`text-[${formatNumber(textNode.fontSize)}px]`);
    }

    if (typeof textNode.lineHeight !== 'symbol' && textNode.lineHeight.unit !== 'AUTO') {
      if (textNode.lineHeight.unit === 'PIXELS') {
        classes.push(`leading-[${formatNumber(textNode.lineHeight.value)}px]`);
      } else if (textNode.lineHeight.unit === 'PERCENT') {
        classes.push(`leading-[${formatNumber(textNode.lineHeight.value)}%]`);
      }
    }

    if (typeof textNode.letterSpacing !== 'symbol') {
      if (textNode.letterSpacing.unit === 'PIXELS') {
        classes.push(`tracking-[${formatNumber(textNode.letterSpacing.value)}px]`);
      } else if (textNode.letterSpacing.unit === 'PERCENT') {
        classes.push(`tracking-[${formatNumber(textNode.letterSpacing.value / 100)}em]`);
      }
    }

    if (textNode.textAlignHorizontal) {
      const alignMap: Record<string, string> = {
        'LEFT': 'text-left', 'CENTER': 'text-center',
        'RIGHT': 'text-right', 'JUSTIFIED': 'text-justify'
      };
      classes.push(alignMap[textNode.textAlignHorizontal] || 'text-left');
    }

    if (textNode.textDecoration === 'UNDERLINE') {
      classes.push('underline');
    } else if (textNode.textDecoration === 'STRIKETHROUGH') {
      classes.push('line-through');
    }

    if (textNode.textCase === 'UPPER') {
      classes.push('uppercase');
    } else if (textNode.textCase === 'LOWER') {
      classes.push('lowercase');
    } else if (textNode.textCase === 'TITLE') {
      classes.push('capitalize');
    }

    // Text color from fills
    if ('fills' in node && Array.isArray(node.fills) && node.fills.length > 0) {
      const fill = node.fills[0];
      if (fill.type === 'SOLID' && fill.visible !== false) {
        const hex = rgbToHex(fill.color.r, fill.color.g, fill.color.b);
        // Remove the bg- class added earlier and use text- instead
        const bgIndex = classes.findIndex(c => c.startsWith('bg-'));
        if (bgIndex !== -1) classes.splice(bgIndex, 1);
        classes.push(`text-[${hex}]`);
      }
    }
  }

  // Layout properties for frames
  if (node.type === 'FRAME' || node.type === 'COMPONENT' || node.type === 'INSTANCE') {
    const frameNode = node as FrameNode;

    if (frameNode.layoutMode !== 'NONE') {
      classes.push('flex');
      classes.push(frameNode.layoutMode === 'HORIZONTAL' ? 'flex-row' : 'flex-col');

      if (frameNode.itemSpacing > 0) {
        classes.push(`gap-[${formatNumber(frameNode.itemSpacing)}px]`);
      }

      const pt = frameNode.paddingTop || 0;
      const pr = frameNode.paddingRight || 0;
      const pb = frameNode.paddingBottom || 0;
      const pl = frameNode.paddingLeft || 0;
      if (pt || pr || pb || pl) {
        if (pt === pr && pr === pb && pb === pl) {
          classes.push(`p-[${formatNumber(pt)}px]`);
        } else {
          if (pt) classes.push(`pt-[${formatNumber(pt)}px]`);
          if (pr) classes.push(`pr-[${formatNumber(pr)}px]`);
          if (pb) classes.push(`pb-[${formatNumber(pb)}px]`);
          if (pl) classes.push(`pl-[${formatNumber(pl)}px]`);
        }
      }

      const alignMap: Record<string, string> = {
        'MIN': 'start', 'CENTER': 'center', 'MAX': 'end', 'SPACE_BETWEEN': 'between'
      };
      if (frameNode.primaryAxisAlignItems) {
        classes.push(`justify-${alignMap[frameNode.primaryAxisAlignItems] || 'start'}`);
      }
      if (frameNode.counterAxisAlignItems) {
        classes.push(`items-${alignMap[frameNode.counterAxisAlignItems] || 'start'}`);
      }

      // Flex wrap
      if (frameNode.layoutWrap === 'WRAP') {
        classes.push('flex-wrap');
      }
    }

    if (frameNode.clipsContent) {
      classes.push('overflow-hidden');
    }
  }

  // Flex child properties
  if ('layoutAlign' in node) {
    const alignSelfMap: Record<string, string> = {
      'STRETCH': 'self-stretch', 'MIN': 'self-start', 'CENTER': 'self-center', 'MAX': 'self-end'
    };
    if (node.layoutAlign && node.layoutAlign !== 'INHERIT') {
      classes.push(alignSelfMap[node.layoutAlign] || '');
    }
  }

  if ('layoutGrow' in node && node.layoutGrow > 0) {
    classes.push('flex-1');
  }

  return classes.filter(c => c).join(' ');
}

// Helper function to get CSS from a node (manual fallback)
function getNodeCSSManual(node: SceneNode): string {
  const css: string[] = [];

  // Position and dimensions
  if ('width' in node && 'height' in node) {
    css.push(`width: ${Math.round(node.width)}px;`);
    css.push(`height: ${Math.round(node.height)}px;`);
  }

  // Min/Max dimensions for auto-layout children
  if ('minWidth' in node && node.minWidth !== null && node.minWidth > 0) {
    css.push(`min-width: ${formatNumber(node.minWidth)}px;`);
  }
  if ('maxWidth' in node && node.maxWidth !== null && node.maxWidth < 10000) {
    css.push(`max-width: ${formatNumber(node.maxWidth)}px;`);
  }
  if ('minHeight' in node && node.minHeight !== null && node.minHeight > 0) {
    css.push(`min-height: ${formatNumber(node.minHeight)}px;`);
  }
  if ('maxHeight' in node && node.maxHeight !== null && node.maxHeight < 10000) {
    css.push(`max-height: ${formatNumber(node.maxHeight)}px;`);
  }

  // Rotation/Transform
  if ('rotation' in node && node.rotation !== 0) {
    css.push(`transform: rotate(${formatNumber(-node.rotation)}deg);`);
  }

  // Border radius
  if ('cornerRadius' in node && typeof node.cornerRadius === 'number' && node.cornerRadius > 0) {
    css.push(`border-radius: ${formatNumber(node.cornerRadius)}px;`);
  } else if ('topLeftRadius' in node) {
    const tl = (node as RectangleNode).topLeftRadius || 0;
    const tr = (node as RectangleNode).topRightRadius || 0;
    const br = (node as RectangleNode).bottomRightRadius || 0;
    const bl = (node as RectangleNode).bottomLeftRadius || 0;
    if (tl || tr || br || bl) {
      css.push(`border-radius: ${formatNumber(tl)}px ${formatNumber(tr)}px ${formatNumber(br)}px ${formatNumber(bl)}px;`);
    }
  }

  // Background/Fill - IMPROVED: Full gradient support with position, angle, and shape
  if ('fills' in node && Array.isArray(node.fills) && node.fills.length > 0) {
    const visibleFills = (node.fills as Paint[]).filter(f => f.visible !== false);
    const backgrounds: string[] = [];

    for (const fill of visibleFills) {
      if (fill.type === 'SOLID') {
        const opacity = fill.opacity !== undefined ? fill.opacity : 1;
        if (opacity < 1) {
          backgrounds.push(`rgba(${Math.round(fill.color.r * 255)}, ${Math.round(fill.color.g * 255)}, ${Math.round(fill.color.b * 255)}, ${opacity.toFixed(2)})`);
        } else {
          backgrounds.push(rgbToHex(fill.color.r, fill.color.g, fill.color.b));
        }
      } else if (fill.type === 'GRADIENT_LINEAR') {
        backgrounds.push(generateLinearGradientCSS(fill as GradientPaint));
      } else if (fill.type === 'GRADIENT_RADIAL') {
        backgrounds.push(generateRadialGradientCSS(fill as GradientPaint));
      } else if (fill.type === 'GRADIENT_ANGULAR') {
        backgrounds.push(generateAngularGradientCSS(fill as GradientPaint));
      } else if (fill.type === 'GRADIENT_DIAMOND') {
        backgrounds.push(generateDiamondGradientCSS(fill as GradientPaint));
      }
    }

    if (backgrounds.length === 1) {
      // Single solid color uses background-color
      if (visibleFills[0].type === 'SOLID') {
        css.push(`background-color: ${backgrounds[0]};`);
      } else {
        css.push(`background: ${backgrounds[0]};`);
      }
    } else if (backgrounds.length > 1) {
      css.push(`background: ${backgrounds.join(', ')};`);
    }
  }

  // Stroke/Border - IMPROVED: Handle stroke position
  if ('strokes' in node && Array.isArray(node.strokes) && node.strokes.length > 0) {
    const stroke = node.strokes[0];
    if (stroke.type === 'SOLID' && stroke.visible !== false) {
      const strokeWeight = 'strokeWeight' in node ? (node.strokeWeight as number) : 1;
      const strokeAlign = 'strokeAlign' in node ? (node as GeometryMixin).strokeAlign : 'CENTER';
      const strokeColor = rgbToHex(stroke.color.r, stroke.color.g, stroke.color.b);

      css.push(`border: ${strokeWeight}px solid ${strokeColor};`);

      // Handle stroke alignment
      if (strokeAlign === 'INSIDE') {
        css.push(`box-sizing: border-box;`);
      } else if (strokeAlign === 'OUTSIDE') {
        // Outside strokes are better represented with outline or box-shadow
        css.push(`/* Note: Figma stroke is outside, consider using outline or box-shadow */`);
      }
    }
  }

  // Opacity
  if ('opacity' in node && node.opacity < 1) {
    css.push(`opacity: ${node.opacity.toFixed(2)};`);
  }

  // Blend mode
  if ('blendMode' in node && node.blendMode !== 'PASS_THROUGH' && node.blendMode !== 'NORMAL') {
    const blendModeMap: Record<string, string> = {
      'MULTIPLY': 'multiply',
      'SCREEN': 'screen',
      'OVERLAY': 'overlay',
      'DARKEN': 'darken',
      'LIGHTEN': 'lighten',
      'COLOR_DODGE': 'color-dodge',
      'COLOR_BURN': 'color-burn',
      'HARD_LIGHT': 'hard-light',
      'SOFT_LIGHT': 'soft-light',
      'DIFFERENCE': 'difference',
      'EXCLUSION': 'exclusion',
      'HUE': 'hue',
      'SATURATION': 'saturation',
      'COLOR': 'color',
      'LUMINOSITY': 'luminosity'
    };
    if (blendModeMap[node.blendMode]) {
      css.push(`mix-blend-mode: ${blendModeMap[node.blendMode]};`);
    }
  }

  // Effects (shadows, blur)
  if ('effects' in node && Array.isArray(node.effects) && node.effects.length > 0) {
    const shadows: string[] = [];
    for (const effect of node.effects) {
      if (effect.visible === false) continue;
      if (effect.type === 'DROP_SHADOW') {
        const color = `rgba(${Math.round(effect.color.r * 255)}, ${Math.round(effect.color.g * 255)}, ${Math.round(effect.color.b * 255)}, ${formatNumber(effect.color.a || 1)})`;
        shadows.push(`${formatNumber(effect.offset.x)}px ${formatNumber(effect.offset.y)}px ${formatNumber(effect.radius)}px ${formatNumber(effect.spread || 0)}px ${color}`);
      } else if (effect.type === 'INNER_SHADOW') {
        const color = `rgba(${Math.round(effect.color.r * 255)}, ${Math.round(effect.color.g * 255)}, ${Math.round(effect.color.b * 255)}, ${formatNumber(effect.color.a || 1)})`;
        shadows.push(`inset ${formatNumber(effect.offset.x)}px ${formatNumber(effect.offset.y)}px ${formatNumber(effect.radius)}px ${formatNumber(effect.spread || 0)}px ${color}`);
      }
    }
    if (shadows.length > 0) {
      css.push(`box-shadow: ${shadows.join(', ')};`);
    }

    for (const effect of node.effects) {
      if (effect.visible === false) continue;
      if (effect.type === 'LAYER_BLUR') {
        css.push(`filter: blur(${formatNumber(effect.radius)}px);`);
      } else if (effect.type === 'BACKGROUND_BLUR') {
        css.push(`backdrop-filter: blur(${formatNumber(effect.radius)}px);`);
      }
    }
  }

  // Text-specific styles
  if (node.type === 'TEXT') {
    const textNode = node as TextNode;

    // Font family, weight, and style
    if (typeof textNode.fontName !== 'symbol') {
      css.push(`font-family: "${textNode.fontName.family}", sans-serif;`);
      css.push(`font-weight: ${getFontWeight(textNode.fontName.style)};`);
      // Detect italic
      if (textNode.fontName.style.toLowerCase().includes('italic') ||
        textNode.fontName.style.toLowerCase().includes('oblique')) {
        css.push(`font-style: italic;`);
      }
    }
    if (typeof textNode.fontSize === 'number') {
      css.push(`font-size: ${formatNumber(textNode.fontSize)}px;`);
    }
    if (typeof textNode.lineHeight !== 'symbol' && textNode.lineHeight.unit !== 'AUTO') {
      if (textNode.lineHeight.unit === 'PIXELS') {
        css.push(`line-height: ${formatNumber(textNode.lineHeight.value)}px;`);
      } else if (textNode.lineHeight.unit === 'PERCENT') {
        css.push(`line-height: ${formatNumber(textNode.lineHeight.value)}%;`);
      }
    }
    if (typeof textNode.letterSpacing !== 'symbol') {
      if (textNode.letterSpacing.unit === 'PIXELS') {
        css.push(`letter-spacing: ${formatNumber(textNode.letterSpacing.value)}px;`);
      } else if (textNode.letterSpacing.unit === 'PERCENT') {
        css.push(`letter-spacing: ${formatNumber(textNode.letterSpacing.value / 100)}em;`);
      }
    }
    if (textNode.textAlignHorizontal) {
      const alignMap: Record<string, string> = {
        'LEFT': 'left',
        'CENTER': 'center',
        'RIGHT': 'right',
        'JUSTIFIED': 'justify'
      };
      css.push(`text-align: ${alignMap[textNode.textAlignHorizontal] || 'left'};`);
    }
    // Vertical alignment for text
    if (textNode.textAlignVertical) {
      const vAlignMap: Record<string, string> = {
        'TOP': 'flex-start',
        'CENTER': 'center',
        'BOTTOM': 'flex-end'
      };
      if (textNode.textAlignVertical !== 'TOP') {
        css.push(`/* Vertical align: ${vAlignMap[textNode.textAlignVertical] || 'flex-start'} - use flexbox container */`);
      }
    }
    if (textNode.textDecoration === 'UNDERLINE') {
      css.push(`text-decoration: underline;`);
    } else if (textNode.textDecoration === 'STRIKETHROUGH') {
      css.push(`text-decoration: line-through;`);
    }
    if (textNode.textCase === 'UPPER') {
      css.push(`text-transform: uppercase;`);
    } else if (textNode.textCase === 'LOWER') {
      css.push(`text-transform: lowercase;`);
    } else if (textNode.textCase === 'TITLE') {
      css.push(`text-transform: capitalize;`);
    }
    // Text truncation
    if (textNode.textTruncation === 'ENDING') {
      css.push(`overflow: hidden;`);
      css.push(`text-overflow: ellipsis;`);
      css.push(`white-space: nowrap;`);
    }
  }

  // Layout properties for frames
  if (node.type === 'FRAME' || node.type === 'COMPONENT' || node.type === 'INSTANCE') {
    const frameNode = node as FrameNode;

    if (frameNode.layoutMode !== 'NONE') {
      css.push(`display: flex;`);
      css.push(`flex-direction: ${frameNode.layoutMode === 'HORIZONTAL' ? 'row' : 'column'};`);

      // Flex wrap
      if (frameNode.layoutWrap === 'WRAP') {
        css.push(`flex-wrap: wrap;`);
      }

      // Gap
      if (frameNode.itemSpacing > 0) {
        css.push(`gap: ${formatNumber(frameNode.itemSpacing)}px;`);
      }

      // Padding
      const pt = frameNode.paddingTop || 0;
      const pr = frameNode.paddingRight || 0;
      const pb = frameNode.paddingBottom || 0;
      const pl = frameNode.paddingLeft || 0;
      if (pt || pr || pb || pl) {
        if (pt === pr && pr === pb && pb === pl) {
          css.push(`padding: ${formatNumber(pt)}px;`);
        } else if (pt === pb && pl === pr) {
          css.push(`padding: ${formatNumber(pt)}px ${formatNumber(pr)}px;`);
        } else {
          css.push(`padding: ${formatNumber(pt)}px ${formatNumber(pr)}px ${formatNumber(pb)}px ${formatNumber(pl)}px;`);
        }
      }

      // Alignment
      const alignMap: Record<string, string> = {
        'MIN': 'flex-start',
        'CENTER': 'center',
        'MAX': 'flex-end',
        'SPACE_BETWEEN': 'space-between'
      };
      if (frameNode.primaryAxisAlignItems) {
        css.push(`justify-content: ${alignMap[frameNode.primaryAxisAlignItems] || 'flex-start'};`);
      }
      if (frameNode.counterAxisAlignItems) {
        css.push(`align-items: ${alignMap[frameNode.counterAxisAlignItems] || 'flex-start'};`);
      }
    }

    // Clip content
    if (frameNode.clipsContent) {
      css.push(`overflow: hidden;`);
    }
  }

  // Flex child properties (for any node inside an auto-layout frame)
  if ('layoutAlign' in node) {
    const alignSelfMap: Record<string, string> = {
      'STRETCH': 'stretch',
      'MIN': 'flex-start',
      'CENTER': 'center',
      'MAX': 'flex-end'
    };
    if (node.layoutAlign && node.layoutAlign !== 'INHERIT') {
      css.push(`align-self: ${alignSelfMap[node.layoutAlign] || 'auto'};`);
    }
  }

  if ('layoutGrow' in node && node.layoutGrow > 0) {
    css.push(`flex-grow: ${node.layoutGrow};`);
  }

  return css.join('\n  ');
}

// Prefer native Figma CSS extraction when available; fall back to manual
async function getNodeCSS(node: SceneNode): Promise<string> {
  if ('getCSSAsync' in node && typeof (node as any).getCSSAsync === 'function') {
    try {
      const cssObj = await (node as any).getCSSAsync();
      if (cssObj) {
        const entries = Object.entries(cssObj).map(([prop, value]) => `${prop}: ${value};`);
        if (entries.length > 0) return entries.join('\n  ');
      }
    } catch (err) {
      // Fall back to manual extraction on any error
      console.warn('getCSSAsync failed, using manual CSS extraction', err);
    }
  }
  return getNodeCSSManual(node);
}

// Helper to convert font style to weight
function getFontWeight(style: string): number {
  const styleMap: Record<string, number> = {
    'Thin': 100,
    'ExtraLight': 200,
    'Light': 300,
    'Regular': 400,
    'Medium': 500,
    'SemiBold': 600,
    'Bold': 700,
    'ExtraBold': 800,
    'Black': 900
  };

  for (const [key, value] of Object.entries(styleMap)) {
    if (style.includes(key)) return value;
  }
  return 400;
}

// Reverse mapping: convert a numeric CSS weight OR named style to a Figma style string.
// Handles values like 700, "700", "Bold", "semi-bold", "SemiBold", "Semi Bold", etc.
function normalizeFontStyle(weight: string | number): string {
  const numericToStyle: Record<number, string> = {
    100: 'Thin',
    200: 'ExtraLight',
    300: 'Light',
    400: 'Regular',
    500: 'Medium',
    600: 'SemiBold',
    700: 'Bold',
    800: 'ExtraBold',
    900: 'Black',
  };

  // Handle numeric values (700 or "700")
  const asNum = typeof weight === 'number' ? weight : parseInt(String(weight), 10);
  if (!isNaN(asNum) && numericToStyle[asNum]) {
    return numericToStyle[asNum];
  }

  const s = String(weight).trim();
  if (!s) return 'Regular';

  // Normalize common CSS/human-readable names to Figma style strings
  const lower = s.toLowerCase().replace(/[\s_-]+/g, '');
  const aliasMap: Record<string, string> = {
    'thin': 'Thin',
    'hairline': 'Thin',
    'extralight': 'ExtraLight',
    'ultralight': 'ExtraLight',
    'light': 'Light',
    'regular': 'Regular',
    'normal': 'Regular',
    'medium': 'Medium',
    'semibold': 'SemiBold',
    'demibold': 'SemiBold',
    'bold': 'Bold',
    'extrabold': 'ExtraBold',
    'ultrabold': 'ExtraBold',
    'black': 'Black',
    'heavy': 'Black',
  };

  return aliasMap[lower] || s;
}

/**
 * Universal Helper: Check if a node is nested inside an Instance.
 */
function isNodeInsideInstance(node: SceneNode): boolean {
  let curr = node.parent;
  while (curr) {
    if (curr.type === 'INSTANCE') return true;
    curr = curr.parent;
  }
  return false;
}

/**
 * Universal Helper: Detect if a node is a shape/icon that should NOT be stretched with FILL sizing.
 * Covers primitive shapes (ELLIPSE, POLYGON, STAR, VECTOR, LINE, BOOLEAN_OPERATION)
 * and SVG icon frames (FRAME/GROUP whose children are all vector-like types).
 */
function isIconOrShapeNode(node: SceneNode): boolean {
  const primitiveShapeTypes = new Set(['ELLIPSE', 'POLYGON', 'STAR', 'VECTOR', 'LINE', 'BOOLEAN_OPERATION']);
  if (primitiveShapeTypes.has(node.type)) return true;

  // SVG icons (createNodeFromSvg) are FRAME or GROUP nodes containing only vector children
  if ((node.type === 'FRAME' || node.type === 'GROUP') && 'children' in node) {
    const children = (node as any).children;
    if (children && children.length > 0) {
      const vectorLikeTypes = new Set([...primitiveShapeTypes, 'GROUP', 'FRAME']);
      const allVectorLike = children.every((c: any) => {
        if (primitiveShapeTypes.has(c.type)) return true;
        // Recursively check nested groups/frames (SVGs can have nested structure)
        if ((c.type === 'GROUP' || c.type === 'FRAME') && 'children' in c) {
          return isIconOrShapeNode(c);
        }
        return false;
      });
      if (allVectorLike) return true;
    }
  }

  // Detect by name heuristic — strict match to avoid false positives on containers like "Icon Row"
  const name = (node.name || '').toLowerCase();
  const iconKws = ['icon', 'avatar', 'glyph', 'symbol', 'badge', 'notification', 'dot', 'indicator', 'chevron', 'arrow', 'status', 'mark'];
  const isIconName = iconKws.some(kw => {
    if (name === kw) return true;
    if (name.startsWith(kw + ' ') || name.startsWith(kw + '-') || name.startsWith(kw + '_')) return true;
    if (name.endsWith(' ' + kw) || name.endsWith('-' + kw) || name.endsWith('_' + kw)) return true;
    return false;
  });
  if (isIconName && node.width <= 64 && node.height <= 64) {
    return true;
  }

  return false;
}

/**
 * Universal Helper: Create a component set from a list of nodes with variant property values.
 */
// Helper to safely convert node to component with sizing preservation
const convertToComponentSafe = (node: SceneNode): ComponentNode => {
  // Capture dimensions and sizing before conversion
  const originalWidth = node.width;
  const originalHeight = node.height;

  // Sizing mode capture (handle potential layout props)
  const originalPrimaryAxisSizingMode = 'primaryAxisSizingMode' in node ? (node as any).primaryAxisSizingMode : 'FIXED';
  const originalCounterAxisSizingMode = 'counterAxisSizingMode' in node ? (node as any).counterAxisSizingMode : 'FIXED';
  const originalLayoutSizingH = 'layoutSizingHorizontal' in node ? (node as any).layoutSizingHorizontal : null;
  const originalLayoutSizingV = 'layoutSizingVertical' in node ? (node as any).layoutSizingVertical : null;

  const finalizeComponent = (comp: ComponentNode) => {
    // Only force-resize if we have a meaningful width (not collapsed from FILL without parent)
    const hasAutoLayout = 'layoutMode' in comp && (comp as any).layoutMode !== 'NONE';
    if (originalWidth >= 10 && originalHeight >= 10) {
      comp.resize(originalWidth, originalHeight);
    }

    // Preserve the original sizing modes as closely as possible.
    // FILL makes no sense for a standalone master component (it has no auto-layout parent),
    // so convert FILL → HUG (AUTO). Keep FIXED and HUG (AUTO) as-is.
    if (hasAutoLayout) {
      if ('primaryAxisSizingMode' in comp) {
        // primaryAxis: FIXED stays FIXED, AUTO (HUG) stays AUTO
        (comp as any).primaryAxisSizingMode = originalPrimaryAxisSizingMode;
      }
      if ('counterAxisSizingMode' in comp) {
        // counterAxis: FIXED stays FIXED, AUTO (HUG) stays AUTO
        (comp as any).counterAxisSizingMode = originalCounterAxisSizingMode;
      }
      // Handle the newer layoutSizing properties (these take precedence in newer API)
      if (originalLayoutSizingH && 'layoutSizingHorizontal' in comp) {
        // FILL → HUG for standalone component; HUG and FIXED stay as-is
        try {
          (comp as any).layoutSizingHorizontal = originalLayoutSizingH === 'FILL' ? 'HUG' : originalLayoutSizingH;
        } catch (e) { /* ignore */ }
      }
      if (originalLayoutSizingV && 'layoutSizingVertical' in comp) {
        try {
          (comp as any).layoutSizingVertical = originalLayoutSizingV === 'FILL' ? 'HUG' : originalLayoutSizingV;
        } catch (e) { /* ignore */ }
      }
    }
    return comp;
  };

  if (node.type === 'COMPONENT') return finalizeComponent(node);

  // Check if node is nested in any restricted structure (Instance, Component, or ComponentSet)
  // Converting a node inside a component definition or an instance can be restricted or cause issues.
  const insideInstance = isNodeInsideInstance(node);
  let isNested = insideInstance;
  if (!isNested) {
    let curr = node.parent;
    while (curr) {
      if (curr.type === 'COMPONENT' || curr.type === 'COMPONENT_SET') {
        isNested = true;
        break;
      }
      curr = curr.parent;
    }
  }

  // If nested in a restricted parent, clone it to the page first for a clean conversion
  if (isNested) {
    const clone = node.clone();
    figma.currentPage.appendChild(clone);
    clone.x = node.absoluteTransform[0][2];
    clone.y = node.absoluteTransform[1][2];
    const component = finalizeComponent(figma.createComponentFromNode(clone));

    // If we're not inside a read-only instance, we should remove the original node 
    // to simulate a conversion. If we are inside an instance, we can't remove it.
    if (!insideInstance) {
      try { node.remove(); } catch (e) { /* ignore if restricted */ }
    }
    return component;
  }

  try {
    return finalizeComponent(figma.createComponentFromNode(node));
  } catch (e: any) {
    // Only use wrapper fallback for known conversion failures (e.g., unsupported node types).
    // Re-throw unexpected errors (permissions, removed nodes, etc.)
    const msg = e?.message || '';
    if (msg.includes('removed') || msg.includes('permission') || msg.includes('Cannot read')) {
      throw e;
    }
    console.warn('convertToComponentSafe: createComponentFromNode failed, using wrapper fallback', msg);
    // Fallback: wrap in a frame on the page, preserving auto-layout
    const wrapper = figma.createFrame();
    wrapper.name = node.name;
    wrapper.resize(originalWidth, originalHeight);
    const absX = node.absoluteTransform[0][2];
    const absY = node.absoluteTransform[1][2];

    figma.currentPage.appendChild(wrapper);
    wrapper.x = absX;
    wrapper.y = absY;

    // Inherit auto-layout from the original node so the wrapper isn't a plain frame
    if ('layoutMode' in node && (node as any).layoutMode !== 'NONE') {
      wrapper.layoutMode = (node as any).layoutMode;
      wrapper.primaryAxisSizingMode = (node as any).primaryAxisSizingMode || 'AUTO';
      wrapper.counterAxisSizingMode = (node as any).counterAxisSizingMode || 'AUTO';
      wrapper.itemSpacing = (node as any).itemSpacing || 0;
      wrapper.paddingTop = (node as any).paddingTop || 0;
      wrapper.paddingRight = (node as any).paddingRight || 0;
      wrapper.paddingBottom = (node as any).paddingBottom || 0;
      wrapper.paddingLeft = (node as any).paddingLeft || 0;
    }
    if ('clipsContent' in node) {
      wrapper.clipsContent = (node as any).clipsContent;
    }

    wrapper.appendChild(node);
    node.x = 0;
    node.y = 0;
    return finalizeComponent(figma.createComponentFromNode(wrapper));
  }
};

/**
 * Automatically identifies icon-like nodes within a component and binds them to Instance Swap properties.
 * Also converts raw shapes that look like icons into standalone icon components.
 */
async function autoBindInstanceSwapProperties(
  comp: ComponentNode | ComponentSetNode,
  moveComponentFn?: (c: ComponentNode) => void
) {
  try {
    const isSet = comp.type === 'COMPONENT_SET';
    // Use the first variant for scanning structure
    const scanTarget = isSet ? (comp.children[0] as ComponentNode) : comp;
    if (!scanTarget || !('findAll' in scanTarget)) return;

    // 1. Find all icon-like nodes
    const iconNodes = scanTarget.findAll(n => isIconOrShapeNode(n));
    if (iconNodes.length === 0) return;

    // Track which icons we've processed to avoid duplicates if nested (rare for icons)
    const processedIds = new Set<string>();

    for (const node of iconNodes) {
      if (processedIds.has(node.id)) continue;

      // Skip if this node is already part of a component property reference
      if ('componentPropertyReferences' in node && (node as any).componentPropertyReferences?.mainComponent) {
        continue;
      }

      let mainComponentId: string | null = null;
      let targetInstance: InstanceNode | null = null;
      let iconComponent: ComponentNode | null = null;

      if (node.type === 'INSTANCE') {
        targetInstance = node as InstanceNode;
        const mainComp = await targetInstance.getMainComponentAsync();
        if (mainComp) {
          mainComponentId = mainComp.id;
          iconComponent = mainComp;
        }
      } else {
        // Raw shape/frame - convert to a standalone icon component first
        const name = node.name || 'Icon';

        // Capture position, parent, AND original dimensions before conversion.
        // moveComponentFn (moveComponentToBatchSection) may resize the master component,
        // so we need to preserve the original icon size for the instance.
        const parent = node.parent;
        const index = parent ? parent.children.indexOf(node) : -1;
        const originalX = node.x;
        const originalY = node.y;
        const originalName = node.name;
        const originalWidth = node.width;
        const originalHeight = node.height;

        const iconComp = convertToComponentSafe(node);
        iconComp.name = `Icon/${name}`;
        if (moveComponentFn) {
          moveComponentFn(iconComp);
        }
        iconComponent = iconComp;
        mainComponentId = iconComp.id;

        // Replace the raw node (which might have been removed or moved) with an instance
        if (parent && 'insertChild' in parent && index !== -1) {
          const inst = iconComp.createInstance();
          (parent as any).insertChild(index, inst);

          // Resize the instance to the original icon dimensions.
          // The master component may have been resized by moveComponentToBatchSection,
          // but the instance inside the parent component should match the original icon size.
          try {
            inst.resize(originalWidth, originalHeight);
          } catch (e) { /* ignore */ }

          inst.x = originalX;
          inst.y = originalY;
          inst.name = originalName;

          // Copy basic layout props — force FIXED sizing for icons to prevent stretching
          if ('layoutGrow' in inst && 'layoutGrow' in node) (inst as any).layoutGrow = (node as any).layoutGrow;
          if ('layoutAlign' in inst && 'layoutAlign' in node) (inst as any).layoutAlign = (node as any).layoutAlign;
          if ('layoutSizingHorizontal' in inst) {
            try { (inst as any).layoutSizingHorizontal = 'FIXED'; } catch (e) { /* ignore */ }
          }
          if ('layoutSizingVertical' in inst) {
            try { (inst as any).layoutSizingVertical = 'FIXED'; } catch (e) { /* ignore */ }
          }

          targetInstance = inst;
          // Ensure original is gone (convertToComponentSafe usually handles it but be safe)
          if (!node.removed && node.id !== iconComp.id && node.parent === parent) {
            try { node.remove(); } catch (e) { /* ignore */ }
          }
        }
      }

      if (targetInstance && mainComponentId) {
        processedIds.add(node.id);

        // Create the property on the root component/set
        const propName = node.name || 'Icon';
        let finalPropName = propName;
        let counter = 1;
        const existingDefs = comp.componentPropertyDefinitions;
        while (Object.keys(existingDefs).some(k => k.split('#')[0] === finalPropName)) {
          finalPropName = `${propName} ${++counter}`;
        }

        try {
          // Collect preferred values (other icons in the generated section)
          let preferredValues: string[] = [];
          if (iconComponent && iconComponent.parent && iconComponent.parent.type === 'SECTION') {
            const section = iconComponent.parent as SectionNode;
            preferredValues = section.findAll(n => n.type === 'COMPONENT' && n.name.startsWith('Icon/') && n.id !== mainComponentId)
              .map(n => n.id)
              .slice(0, 5); // Limit to 5 preferred icons to keep UI clean
          }

          const preferredOpts = preferredValues.length > 0
            ? { preferredValues: preferredValues.map(id => ({ type: 'COMPONENT' as const, key: id })) }
            : undefined;
          const propId = comp.addComponentProperty(finalPropName, 'INSTANCE_SWAP', mainComponentId, preferredOpts);
          targetInstance.componentPropertyReferences = { mainComponent: propId };

          // If it's a component set, bind corresponding nodes in other variants
          if (isSet) {
            for (const variant of comp.children) {
              if (variant.id === scanTarget.id) continue;
              if (variant.type !== 'COMPONENT') continue;

              // Find matching icon in this variant by name
              const otherIcon = variant.findOne(n => n.name === node.name && isIconOrShapeNode(n));
              if (otherIcon) {
                processedIds.add(otherIcon.id);
                if (otherIcon.type === 'INSTANCE') {
                  (otherIcon as InstanceNode).componentPropertyReferences = { mainComponent: propId };
                } else {
                  // If it's a raw node in another variant, replace it with an instance too
                  const p = otherIcon.parent;
                  if (p && 'insertChild' in p) {
                    const idx = p.children.indexOf(otherIcon);
                    const otherOrigWidth = otherIcon.width;
                    const otherOrigHeight = otherIcon.height;
                    const inst = (targetInstance.mainComponent as ComponentNode).createInstance();
                    (p as any).insertChild(idx, inst);

                    // Resize the instance to match the original icon size (master may have been stretched)
                    try {
                      inst.resize(otherOrigWidth, otherOrigHeight);
                    } catch (e) { /* ignore */ }

                    inst.x = otherIcon.x;
                    inst.y = otherIcon.y;
                    inst.name = otherIcon.name;
                    inst.componentPropertyReferences = { mainComponent: propId };

                    // Copy layout props — force FIXED for icons to prevent stretching
                    if ('layoutGrow' in inst && 'layoutGrow' in otherIcon) (inst as any).layoutGrow = (otherIcon as any).layoutGrow;
                    if ('layoutAlign' in inst && 'layoutAlign' in otherIcon) (inst as any).layoutAlign = (otherIcon as any).layoutAlign;
                    if ('layoutSizingHorizontal' in inst) {
                      try { (inst as any).layoutSizingHorizontal = 'FIXED'; } catch (e) { /* ignore */ }
                    }
                    if ('layoutSizingVertical' in inst) {
                      try { (inst as any).layoutSizingVertical = 'FIXED'; } catch (e) { /* ignore */ }
                    }

                    if (!otherIcon.removed) {
                      try { otherIcon.remove(); } catch (e) { /* ignore */ }
                    }
                  }
                }
              }
            }
          }
        } catch (e) {
          console.warn(`autoBindInstanceSwapProperties: Failed to bind ${finalPropName}`, e);
        }
      }
    }
  } catch (err) {
    console.error('autoBindInstanceSwapProperties failed', err);
  }
}

async function createComponentSetHelper(
  name: string,
  variantNodes: { node: SceneNode; properties: { [key: string]: string } }[],
  layoutOptions?: {
    layoutMode?: 'HORIZONTAL' | 'VERTICAL';
    layoutGrow?: number;
    primaryAxisSizingMode?: 'FIXED' | 'AUTO';
    counterAxisSizingMode?: 'FIXED' | 'AUTO';
    itemSpacing?: number;
    padding?: number;
    layoutWrap?: 'WRAP' | 'NO_WRAP';
    counterAxisSpacing?: number;
    skipInstanceCreation?: boolean;
  },
  moveComponentFn?: (c: ComponentNode) => void
): Promise<ComponentSetNode> {
  // 1. Convert all nodes to components
  const components: ComponentNode[] = variantNodes.map(({ node, properties }) => {
    // Capture original parent info for replacement
    const originalParent = node.parent;
    const originalIndex = originalParent ? originalParent.children.indexOf(node) : -1;
    const originalX = node.x;
    const originalY = node.y;
    const originalLayoutGrow = 'layoutGrow' in node ? node.layoutGrow : 0;
    const originalLayoutAlign = 'layoutAlign' in node ? node.layoutAlign : 'INHERIT';

    const component = convertToComponentSafe(node);

    // Register mapping from original node ID to the new component
    if (node.id !== component.id) {
      persistentCreatedNodes.set(node.id, component);
      // Also update any refId/name entries that still point to the old (now removed) node,
      // so that later createInstance commands can resolve them correctly.
      for (const [key, val] of persistentCreatedNodes.entries()) {
        if (val === node && key !== node.id) {
          persistentCreatedNodes.set(key, component);
        }
      }
    }

    // 2. Set variant name (Prop1=Value1, Prop2=Value2)
    const nameParts = Object.entries(properties).map(([k, v]) => `${k}=${v}`);
    if (nameParts.length > 0) {
      component.name = nameParts.join(', ');
    }

    // Replace original node with instance
    if (!layoutOptions?.skipInstanceCreation &&
      originalParent && originalIndex !== -1 && 'insertChild' in originalParent &&
      originalParent.type !== 'INSTANCE' && originalParent.type !== 'COMPONENT_SET') {
      const instance = component.createInstance();
      (originalParent as any).insertChild(originalIndex, instance);
      instance.x = originalX;
      instance.y = originalY;
      // Re-apply layout sizing to instance
      if ('layoutGrow' in instance) instance.layoutGrow = originalLayoutGrow;
      if ('layoutAlign' in instance) instance.layoutAlign = originalLayoutAlign;

      // Ensure the original node is removed if it hasn't been already (e.g. if it was cloned)
      // and it's not the component itself.
      if (!node.removed && node.parent === originalParent && node.id !== component.id) {
        try { node.remove(); } catch (e) { /* ignore */ }
      }
    }

    return component;
  });

  // 3. Combine as variants
  const componentSet = figma.combineAsVariants(components, figma.currentPage);
  componentSet.name = name;
  // 4. Apply layout
  componentSet.layoutMode = layoutOptions?.layoutMode || 'HORIZONTAL';
  componentSet.itemSpacing = layoutOptions?.itemSpacing ?? 16;
  if (layoutOptions?.layoutWrap) componentSet.layoutWrap = layoutOptions.layoutWrap;
  if (layoutOptions?.counterAxisSpacing !== undefined) componentSet.counterAxisSpacing = layoutOptions.counterAxisSpacing;

  const p = layoutOptions?.padding ?? 24;
  componentSet.paddingLeft = componentSet.paddingRight = componentSet.paddingTop = componentSet.paddingBottom = p;

  // Ensure the component set hugs its contents
  componentSet.primaryAxisSizingMode = layoutOptions?.primaryAxisSizingMode || 'AUTO';
  componentSet.counterAxisSizingMode = layoutOptions?.counterAxisSizingMode || 'AUTO';

  // Default: make icons inside the set swappable via instance swap properties
  await autoBindInstanceSwapProperties(componentSet, moveComponentFn);

  return componentSet;
}

// Serialize node data for Agent mode
interface GradientStopInfo {
  color: string; // Hex color
  position: number; // 0-1
  opacity?: number;
}

interface GradientInfo {
  type: 'GRADIENT_LINEAR' | 'GRADIENT_RADIAL' | 'GRADIENT_ANGULAR' | 'GRADIENT_DIAMOND';
  stops: GradientStopInfo[];
  angle?: number; // For linear gradients, calculated from transform
}

interface FillInfo {
  type: 'SOLID' | 'GRADIENT_LINEAR' | 'GRADIENT_RADIAL' | 'GRADIENT_ANGULAR' | 'GRADIENT_DIAMOND' | 'IMAGE';
  color?: string; // For SOLID fills
  gradient?: GradientInfo; // For gradient fills
  visible: boolean;
  boundVariables?: any;
}

type PaintInfo = FillInfo;

interface SerializedNode {
  id: string;
  name: string;
  type: string;
  description?: string;
  visible: boolean;
  x?: number;  // Relative X position (to parent)
  y?: number;  // Relative Y position (to parent)
  absX?: number;  // Absolute X position on canvas/world
  absY?: number;  // Absolute Y position on canvas/world
  width?: number;
  height?: number;
  // Variant Properties (if child of ComponentSet)
  variantProperties?: { [property: string]: string } | null;
  fills?: string | null; // Backward compatible: hex color for solid fills
  fillsDetailed?: FillInfo[]; // Detailed fill info including gradients
  strokes?: string | null; // Backward compatible: hex color for solid strokes
  strokesDetailed?: PaintInfo[]; // Detailed stroke info including gradients
  fillStyleId?: string;
  fillTokenName?: string;
  strokeStyleId?: string;
  strokeTokenName?: string;
  textStyleId?: string;
  textStyleName?: string;
  opacity?: number;
  constrainProportions?: boolean;
  tokens?: Record<string, string>;
  characters?: string; // Text content for TEXT, STICKY, SHAPE_WITH_TEXT nodes
  fontSize?: number;
  fontName?: FontName | string;
  lineHeight?: LineHeight | string;
  letterSpacing?: LetterSpacing | string;
  paragraphSpacing?: number;
  paragraphIndent?: number;
  textCase?: TextCase | string;
  textDecoration?: TextDecoration | string;
  boundVariables?: any;
  // Layout properties
  layoutMode?: 'NONE' | 'HORIZONTAL' | 'VERTICAL' | 'GRID';
  primaryAxisAlignItems?: 'MIN' | 'MAX' | 'CENTER' | 'SPACE_BETWEEN';
  counterAxisAlignItems?: 'MIN' | 'MAX' | 'CENTER' | 'BASELINE';
  paddingLeft?: number;
  paddingRight?: number;
  paddingTop?: number;
  paddingBottom?: number;
  itemSpacing?: number;
  cornerRadius?: number | string | typeof figma.mixed;
  topLeftRadius?: number;
  topRightRadius?: number;
  bottomLeftRadius?: number;
  bottomRightRadius?: number;
  clipsContent?: boolean;
  overflowDirection?: 'NONE' | 'HORIZONTAL' | 'VERTICAL' | 'BOTH';
  numberOfFixedChildren?: number;
  reactions?: any[];
  children?: SerializedNode[];
  // FigJam Connector properties
  connectorLineType?: string; // ELBOWED, STRAIGHT, CURVED
  connectorStartNodeId?: string;
  connectorEndNodeId?: string;
  strokeColor?: string;
  strokeWeight?: number;
  strokeTopWeight?: number;
  strokeBottomWeight?: number;
  strokeLeftWeight?: number;
  strokeRightWeight?: number;
  // FigJam Shape properties
  shapeType?: string; // SQUARE, ELLIPSE, DIAMOND, TRIANGLE_UP, etc.
  // Z-order index for sequential operations (1-based, sorted by absolute position: top-to-bottom, left-to-right)
  zOrderIndex?: number;
  // Figma Component Instance Properties
  componentProperties?: ComponentProperties;
  // Figma Component / Component Set Property Definitions
  componentPropertyDefinitions?: ComponentPropertyDefinitions;
  // Summary of existing variants and their property options (for COMPONENT_SET only)
  variantSummary?: {
    properties: Record<string, string[]>;
    existingCombinations: Record<string, string>[];
  };
  // Smart mode fields
  prototypeId?: string; // ID of the first occurrence of this repeated element
  isSmartDiff?: boolean; // If true, this node only contains properties that differ from its prototype
  vectorNetwork?: VectorNetwork; // Granular vector data for direct point manipulation
  vectorPaths?: VectorPath[]; // SVG-like path data
}

interface TokenColorValue {
  modeId: string;
  modeName?: string;
  hex?: string;
  rgba?: RGBA;
}

interface TokenColorVariable {
  id?: string;
  key?: string;
  name: string;
  source: 'local' | 'library';
  collectionId?: string;
  collectionName?: string;
  collectionKey?: string;
  libraryName?: string;
  defaultModeId?: string;
  values?: TokenColorValue[];
}

interface TokenPaintStyle {
  id: string;
  name: string;
  type: Paint['type'];
  hex?: string;
}

interface TokenTextStyle {
  id: string;
  name: string;
  fontFamily?: string;
  fontStyle?: string;
  fontSize?: number;
  lineHeight?: LineHeight;
  letterSpacing?: LetterSpacing;
}

interface TokenNonColorVariable {
  id: string;
  name: string;
  resolvedType: 'FLOAT' | 'STRING' | 'BOOLEAN';
  collectionId: string;
  collectionName?: string;
  value?: string | number | boolean;
}

interface TokenVariableCollection {
  id: string;
  name: string;
  modes: { modeId: string; name: string }[];
  defaultModeId: string;
}

interface TokenContext {
  colorVariables: TokenColorVariable[];
  otherVariables: TokenNonColorVariable[];
  collections: TokenVariableCollection[];
  paintStyles: TokenPaintStyle[];
  textStyles: TokenTextStyle[];
}

async function paintToInfo(paint: Paint): Promise<PaintInfo | null> {
  if (!paint || (paint as any).visible === false) return null;

  const baseInfo: any = { visible: true };
  if ('boundVariables' in paint && (paint as any).boundVariables) {
    baseInfo.boundVariables = await resolveBoundVariableNames((paint as any).boundVariables);
  }

  if (paint.type === 'SOLID') {
    const solid = paint as SolidPaint;
    const hexColor = rgbToHex(solid.color.r, solid.color.g, solid.color.b);
    return { ...baseInfo, type: 'SOLID', color: hexColor };
  }

  if (paint.type === 'GRADIENT_LINEAR' || paint.type === 'GRADIENT_RADIAL' || paint.type === 'GRADIENT_ANGULAR' || paint.type === 'GRADIENT_DIAMOND') {
    const gradientPaint = paint as GradientPaint;
    const stops: GradientStopInfo[] = gradientPaint.gradientStops.map(stop => ({
      color: rgbToHex(stop.color.r, stop.color.g, stop.color.b),
      position: stop.position,
      opacity: stop.color.a < 1 ? stop.color.a : undefined
    }));

    let angle: number | undefined;
    if (paint.type === 'GRADIENT_LINEAR' && gradientPaint.gradientTransform) {
      const [[a, b]] = gradientPaint.gradientTransform;
      angle = Math.round(Math.atan2(b, a) * (180 / Math.PI));
    }

    return {
      ...baseInfo,
      type: paint.type,
      gradient: {
        type: paint.type,
        stops,
        angle
      }
    };
  }

  if (paint.type === 'IMAGE') {
    return { ...baseInfo, type: 'IMAGE' };
  }

  return null;
}

async function resolveBoundVariableNames(boundVariables: any): Promise<any> {
  if (!boundVariables || typeof boundVariables !== 'object') return boundVariables;

  const resolved: any = {};
  for (const [key, value] of Object.entries(boundVariables)) {
    if (Array.isArray(value)) {
      resolved[key] = await Promise.all(value.map(async v => {
        if (v && typeof v === 'object' && v.type === 'VARIABLE_ALIAS' && v.id) {
          try {
            const variable = await figma.variables.getVariableByIdAsync(v.id);
            return variable ? { ...v, name: variable.name } : v;
          } catch (e) { return v; }
        }
        return v;
      }));
    } else if (value && typeof value === 'object' && (value as any).type === 'VARIABLE_ALIAS' && (value as any).id) {
      try {
        const variable = await figma.variables.getVariableByIdAsync((value as any).id);
        resolved[key] = variable ? { ...value as any, name: variable.name } : value;
      } catch (e) { resolved[key] = value; }
    } else {
      resolved[key] = value;
    }
  }
  return resolved;
}

async function collectResolvedTokens(node: SceneNode): Promise<Record<string, string>> {
  const tokens: Record<string, string> = {};

  // Resolve Styles (Human-readable names for applied styles)
  try {
    if ('fillStyleId' in node && typeof node.fillStyleId === 'string' && node.fillStyleId) {
      const style = await figma.getStyleByIdAsync(node.fillStyleId);
      if (style) tokens['fill'] = style.name;
    }
    if ('strokeStyleId' in node && typeof node.strokeStyleId === 'string' && node.strokeStyleId) {
      const style = await figma.getStyleByIdAsync(node.strokeStyleId);
      if (style) tokens['stroke'] = style.name;
    }
    if ('textStyleId' in node && typeof node.textStyleId === 'string' && node.textStyleId) {
      const style = await figma.getStyleByIdAsync(node.textStyleId);
      if (style) tokens['textStyle'] = style.name;
    }
    if ('effectStyleId' in node && typeof node.effectStyleId === 'string' && node.effectStyleId) {
      const style = await figma.getStyleByIdAsync(node.effectStyleId);
      if (style) tokens['effectStyle'] = style.name;
    }
  } catch (e) { /* ignore */ }

  // Resolve Variables (Human-readable names for bound variables)
  try {
    if ('boundVariables' in node && node.boundVariables) {
      const bv = node.boundVariables as any;
      for (const [key, value] of Object.entries(bv)) {
        if (!value) continue;

        // Handle single variable alias (e.g., radius, padding, spacing)
        if (typeof value === 'object' && (value as any).type === 'VARIABLE_ALIAS' && (value as any).id) {
          const variable = await figma.variables.getVariableByIdAsync((value as any).id);
          if (variable) tokens[key] = variable.name;
        }
        // Handle array of variable aliases (common for fills/strokes)
        else if (Array.isArray(value)) {
          const namePromises = value.map(async v => {
            if (v && v.type === 'VARIABLE_ALIAS' && v.id) {
              const variable = await figma.variables.getVariableByIdAsync(v.id);
              return variable ? variable.name : null;
            }
            return null;
          });
          const names = (await Promise.all(namePromises)).filter(name => !!name);
          if (names.length > 0) tokens[key] = names.join(', ');
        }
      }
    }
  } catch (e) { /* ignore */ }

  return tokens;
}


// Helper to detect language (en, ja, cn, kr) based on character ranges
function detectLanguage(text: string): string {
  if (!text || text.trim().length === 0) return 'en';

  const counts: Record<string, number> = { en: 0, ja: 0, cn: 0, kr: 0 };

  for (let i = 0; i < text.length; i++) {
    const charCode = text.charCodeAt(i);

    // Japanese: Hiragana (3040-309F) and Katakana (30A0-30FF)
    if ((charCode >= 0x3040 && charCode <= 0x309F) || (charCode >= 0x30A0 && charCode <= 0x30FF)) {
      counts.ja++;
    }
    // Korean: Hangul Syllables (AC00-D7AF)
    else if (charCode >= 0xAC00 && charCode <= 0xD7AF) {
      counts.kr++;
    }
    // Chinese: CJK Unified Ideographs (4E00-9FFF) - also used in Ja/Kr but strictly Cn for this heuristic
    else if (charCode >= 0x4E00 && charCode <= 0x9FFF) {
      counts.cn++;
    }
    // English: Latins
    else if ((charCode >= 0x0041 && charCode <= 0x005A) || (charCode >= 0x0061 && charCode <= 0x007A)) {
      counts.en++;
    }
  }

  // Weight ja/kr/cn higher than English if present
  counts.ja *= 1.5;
  counts.kr *= 1.5;
  counts.cn *= 1.2;

  let maxLang = 'en';
  let maxCount = 0;
  for (const lang in counts) {
    if (counts[lang] > maxCount) {
      maxCount = counts[lang];
      maxLang = lang;
    }
  }

  return maxLang;
}

/**
 * Generate a structural fingerprint for a node to identify repeats (e.g., list items)
 */
async function getNodeFingerprint(node: SceneNode): Promise<string> {
  if (node.type === 'INSTANCE') {
    const instance = node as InstanceNode;
    try {
      // Use async getter to avoid EPERM/documentAccess errors
      const mc = await (instance as any).getMainComponentAsync();
      return `INSTANCE:${mc ? mc.id : instance.name}`;
    } catch (e) {
      return `INSTANCE:${instance.name}`;
    }
  }
  if (node.type === 'FRAME' || node.type === 'GROUP' || node.type === 'COMPONENT') {
    // For containers, include type, name and a simplified child structure summary
    const childSummary = 'children' in node ? node.children.map(c => c.type).join(',') : '';
    return `${node.type}:${node.name}:${childSummary}`;
  }
  return `${node.type}:${node.name}`;
}

/**
 * Creates a "diff" node that only contains properties that differ from the prototype
 */
function createSmartDiff(target: SerializedNode, prototype: SerializedNode): SerializedNode {
  const diff: SerializedNode = {
    id: target.id,
    name: target.name,
    type: target.type,
    prototypeId: prototype.id,
    isSmartDiff: true,
    visible: target.visible
  };

  // Important keys to always compare
  const skipKeys = new Set(['id', 'prototypeId', 'isSmartDiff', 'children', 'zOrderIndex']);

  for (const key in target) {
    if (skipKeys.has(key)) continue;

    const targetVal = (target as any)[key];
    const protoVal = (prototype as any)[key];

    // Deep comparison using stringify for objects/arrays
    if (JSON.stringify(targetVal) !== JSON.stringify(protoVal)) {
      (diff as any)[key] = targetVal;
    }
  }

  // Handle children recursion
  if (target.children && prototype.children && target.children.length === prototype.children.length) {
    const diffChildren: SerializedNode[] = [];
    for (let i = 0; i < target.children.length; i++) {
      diffChildren.push(createSmartDiff(target.children[i], prototype.children[i]));
    }
    diff.children = diffChildren;
  } else if (target.children) {
    diff.children = target.children;
  }

  return diff;
}

/**
 * Removes default Figma properties to save tokens
 */
function stripDefaultProperties(serialized: SerializedNode): SerializedNode {
  const result = { ...serialized };

  // Strip common defaults
  if (result.visible === true) delete (result as any).visible;
  if (result.opacity === 1) delete result.opacity;

  // Strip empty/null values
  for (const key in result) {
    const val = (result as any)[key];
    if (val === null || val === undefined) {
      delete (result as any)[key];
    }
  }

  return result;
}

async function serializeNodeForAgent(node: SceneNode, skipHidden: boolean = false, depth: number = 0, contextMode: string = 'all'): Promise<SerializedNode | null> {
  // Max depth limit to prevent performance issues or infinite loops
  if (depth > 20) {
    return null;
  }

  // Skip hidden nodes if skipHidden is true
  if (skipHidden && node.visible === false) {
    return null;
  }

  const isMinimal = contextMode === 'minimal';
  const isTextOnly = contextMode === 'textOnly';
  const isLayoutOnly = contextMode === 'layoutOnly';
  const isStyleOnly = contextMode === 'styleOnly';
  const isHierarchy = contextMode === 'hierarchy';
  const isIndexOnly = contextMode === 'indexOnly';
  const isPillOnly = contextMode === 'pillOnly';
  const isAll = contextMode === 'all' || contextMode === 'smart';

  // For pillOnly mode, return absolute minimum for node-pill functionality
  if (isPillOnly) {
    const pillNode: SerializedNode = {
      id: node.id,
      name: node.name,
      type: node.type,
      visible: node.visible
    };
    // Only recurse for container types to maintain hierarchy
    if ('children' in node && node.children.length > 0) {
      // Filter hidden children BEFORE creating promises to avoid unnecessary work
      const childrenToProcess = skipHidden
        ? node.children.filter(child => child.visible !== false)
        : node.children;
      const childResults = await Promise.all(
        childrenToProcess.map(child => serializeNodeForAgent(child, skipHidden, depth + 1, contextMode))
      );
      const validChildren = childResults.filter((c): c is SerializedNode => c !== null);
      if (validChildren.length > 0) {
        pillNode.children = validChildren;
      }
    }
    return pillNode;
  }

  // Get absolute position from transform matrix for world/canvas coordinates
  const absX = Math.round(node.absoluteTransform[0][2]);
  const absY = Math.round(node.absoluteTransform[1][2]);

  const serialized: SerializedNode = {
    id: node.id,
    name: node.name,
    type: node.type,
    visible: node.visible
  };

  // Only include heavy properties based on contextMode
  if (isAll || isLayoutOnly || isIndexOnly) {
    serialized.x = 'x' in node ? Math.round(node.x) : 0;
    serialized.y = 'y' in node ? Math.round(node.y) : 0;
    serialized.absX = absX;
    serialized.absY = absY;
    serialized.width = 'width' in node ? Math.round(node.width) : 0;
    serialized.height = 'height' in node ? Math.round(node.height) : 0;
  }

  if (isIndexOnly) {
    // For indexOnly, we also want characters for quick identification but nothing else
    if (node.type === 'TEXT') {
      serialized.characters = (node as TextNode).characters.substring(0, 100); // Limit length
    }
  }

  if (isAll) {
    serialized.description = typeof (node as any).description === 'string' ? (node as any).description : undefined;
  }

  if (isAll || isStyleOnly) {
    serialized.tokens = await collectResolvedTokens(node);
  }

  // Get variant properties if the node is a COMPONENT child of a COMPONENT_SET
  if ((isAll || isMinimal || isTextOnly || isLayoutOnly || isStyleOnly || isHierarchy) && node.type === 'COMPONENT' && node.parent && node.parent.type === 'COMPONENT_SET') {
    serialized.variantProperties = node.variantProperties;
  }

  // Get fill information (solid and gradient)
  if ((isAll || isStyleOnly) && 'fills' in node && Array.isArray(node.fills) && node.fills.length > 0) {
    const fillsDetailed: PaintInfo[] = [];

    for (const fill of node.fills) {
      const info = await paintToInfo(fill);
      if (!info) continue;
      fillsDetailed.push(info);
      if (!serialized.fills && info.type === 'SOLID' && info.color) {
        serialized.fills = info.color;
      }
    }

    if (fillsDetailed.length > 0) {
      serialized.fillsDetailed = fillsDetailed;
    }
  }

  if ((isAll || isStyleOnly) && 'fillStyleId' in node && typeof (node as any).fillStyleId === 'string' && (node as any).fillStyleId) {
    const fillStyleId = (node as any).fillStyleId as string;
    serialized.fillStyleId = fillStyleId;
    try {
      const style = await figma.getStyleByIdAsync(fillStyleId);
      if (style) serialized.fillTokenName = style.name;
    } catch (e) { /* ignore */ }
  }

  // Get stroke information (solid and gradient)
  if ((isAll || isStyleOnly) && 'strokes' in node && Array.isArray(node.strokes) && node.strokes.length > 0) {
    const strokesDetailed: PaintInfo[] = [];

    for (const stroke of node.strokes) {
      const info = await paintToInfo(stroke);
      if (!info) continue;
      strokesDetailed.push(info);
      if (!serialized.strokes && info.type === 'SOLID' && info.color) {
        serialized.strokes = info.color;
      }
    }

    if (strokesDetailed.length > 0) {
      serialized.strokesDetailed = strokesDetailed;
    }
  }

  if ((isAll || isStyleOnly) && 'strokeStyleId' in node && typeof (node as any).strokeStyleId === 'string' && (node as any).strokeStyleId) {
    const strokeStyleId = (node as any).strokeStyleId as string;
    serialized.strokeStyleId = strokeStyleId;
    try {
      const style = await figma.getStyleByIdAsync(strokeStyleId);
      if (style) serialized.strokeTokenName = style.name;
    } catch (e) { /* ignore */ }
  }

  if ((isAll || isStyleOnly) && 'strokeWeight' in node && typeof (node as any).strokeWeight === 'number') {
    serialized.strokeWeight = (node as any).strokeWeight;
  }

  // Get individual stroke weights for frames (per-side border widths)
  if ((isAll || isStyleOnly) && 'strokeTopWeight' in node) {
    const frameNode = node as FrameNode;
    // Only include if at least one side differs (i.e., individual strokes are in use)
    const top = frameNode.strokeTopWeight;
    const bottom = frameNode.strokeBottomWeight;
    const left = frameNode.strokeLeftWeight;
    const right = frameNode.strokeRightWeight;
    if (top !== bottom || top !== left || top !== right) {
      serialized.strokeTopWeight = top;
      serialized.strokeBottomWeight = bottom;
      serialized.strokeLeftWeight = left;
      serialized.strokeRightWeight = right;
    }
  }

  // Get vector network for VECTOR nodes to allow direct point manipulation
  if (isAll && (node.type === 'VECTOR' || node.type === 'BOOLEAN_OPERATION' || 'vectorNetwork' in node)) {
    try {
      const vn = (node as any).vectorNetwork;
      if (vn && vn.vertices && vn.vertices.length < 100) { // Limit to avoid token bloat
        serialized.vectorNetwork = vn;
      }
      if ('vectorPaths' in node) {
        serialized.vectorPaths = (node as any).vectorPaths;
      }
    } catch (e) { /* ignore */ }
  }

  // Get layout and geometry properties
  if ((isAll || isLayoutOnly) && 'layoutMode' in node) {
    serialized.layoutMode = node.layoutMode;
    serialized.primaryAxisAlignItems = node.primaryAxisAlignItems;
    serialized.counterAxisAlignItems = node.counterAxisAlignItems;
    serialized.paddingLeft = node.paddingLeft;
    serialized.paddingRight = node.paddingRight;
    serialized.paddingTop = node.paddingTop;
    serialized.paddingBottom = node.paddingBottom;
    serialized.itemSpacing = node.itemSpacing;
  }

  if ((isAll || isLayoutOnly) && 'cornerRadius' in node) {
    if (node.cornerRadius !== figma.mixed) {
      serialized.cornerRadius = node.cornerRadius;
    } else {
      // Don't assign figma.mixed (a Symbol) to serialized data as postMessage will fail
      serialized.cornerRadius = 'mixed';
      serialized.topLeftRadius = (node as any).topLeftRadius;
      serialized.topRightRadius = (node as any).topRightRadius;
      serialized.bottomLeftRadius = (node as any).bottomLeftRadius;
      serialized.bottomRightRadius = (node as any).bottomRightRadius;
    }
  }

  // Get clipsContent for frames
  if ((isAll || isLayoutOnly) && 'clipsContent' in node) {
    serialized.clipsContent = (node as FrameNode).clipsContent;
  }

  // Get overflowDirection for scrollable frames
  if ((isAll || isLayoutOnly) && 'overflowDirection' in node) {
    const overflowDir = (node as FrameNode).overflowDirection;
    if (overflowDir && overflowDir !== 'NONE') {
      serialized.overflowDirection = overflowDir;
    }
  }

  // Get numberOfFixedChildren for scroll frames (fixed headers/footers)
  if ((isAll || isLayoutOnly) && 'numberOfFixedChildren' in node) {
    const fixedCount = (node as FrameNode).numberOfFixedChildren;
    if (fixedCount > 0) {
      serialized.numberOfFixedChildren = fixedCount;
    }
  }

  // Get reactions (prototype interactions)
  if (isAll && 'reactions' in node) {
    const reactions = (node as any).reactions;
    if (Array.isArray(reactions) && reactions.length > 0) {
      serialized.reactions = reactions.map((r: any) => {
        const reaction: any = {};
        if (r.trigger) {
          reaction.trigger = { type: r.trigger.type };
          if (r.trigger.delay !== undefined) reaction.trigger.delay = r.trigger.delay;
          if (r.trigger.timeout !== undefined) reaction.trigger.timeout = r.trigger.timeout;
        }
        if (r.actions && Array.isArray(r.actions)) {
          reaction.actions = r.actions.map((a: any) => {
            const actionInfo: any = { type: a.type };
            if (a.destinationId) actionInfo.destinationId = a.destinationId;
            if (a.navigation) actionInfo.navigation = a.navigation;
            if (a.transition) {
              actionInfo.transition = { type: a.transition.type };
              if (a.transition.duration !== undefined) actionInfo.transition.duration = a.transition.duration;
              if (a.transition.easing) actionInfo.transition.easing = a.transition.easing;
              if (a.transition.direction) actionInfo.transition.direction = a.transition.direction;
            }
            if (a.url) actionInfo.url = a.url;
            if (a.openUrlInNewTab !== undefined) actionInfo.openUrlInNewTab = a.openUrlInNewTab;
            return actionInfo;
          });
        }
        return reaction;
      });
    }
  }

  // Get opacity
  if ((isAll || isStyleOnly) && 'opacity' in node && node.opacity < 1) {
    serialized.opacity = node.opacity;
  }

  // Get constrainProportions (lock aspect ratio)
  if ((isAll || isLayoutOnly) && 'constrainProportions' in node) {
    serialized.constrainProportions = (node as any).constrainProportions;
  }

  // Get text content for TEXT nodes
  if ((isAll || isTextOnly || isLayoutOnly) && node.type === 'TEXT') {
    const textNode = node as TextNode;
    serialized.characters = textNode.characters;

    if (isAll) {
      if (typeof textNode.fontSize === 'number') {
        serialized.fontSize = textNode.fontSize;
      }
      if (typeof textNode.textStyleId === 'string' && textNode.textStyleId) {
        const textStyleId = textNode.textStyleId as string;
        serialized.textStyleId = textStyleId;
        try {
          const style = await figma.getStyleByIdAsync(textStyleId);
          if (style) serialized.textStyleName = style.name;
        } catch (e) { /* ignore */ }
      }
      if (textNode.fontName !== figma.mixed) {
        serialized.fontName = textNode.fontName as FontName;
      } else {
        serialized.fontName = 'mixed';
      }
      if (textNode.lineHeight !== figma.mixed) {
        serialized.lineHeight = textNode.lineHeight as LineHeight;
      } else {
        serialized.lineHeight = 'mixed';
      }
      if (textNode.letterSpacing !== figma.mixed) {
        serialized.letterSpacing = textNode.letterSpacing as LetterSpacing;
      } else {
        serialized.letterSpacing = 'mixed';
      }
      if (typeof textNode.paragraphSpacing === 'number') {
        serialized.paragraphSpacing = textNode.paragraphSpacing;
      }
      if (typeof textNode.paragraphIndent === 'number') {
        serialized.paragraphIndent = textNode.paragraphIndent;
      }
      if (textNode.textCase && textNode.textCase !== figma.mixed) {
        serialized.textCase = textNode.textCase as TextCase;
      } else if (textNode.textCase === figma.mixed) {
        serialized.textCase = 'mixed';
      }
      if (textNode.textDecoration && textNode.textDecoration !== figma.mixed) {
        serialized.textDecoration = textNode.textDecoration as TextDecoration;
      } else if (textNode.textDecoration === figma.mixed) {
        serialized.textDecoration = 'mixed';
      }
      if ('boundVariables' in textNode && (textNode as any).boundVariables) {
        serialized.boundVariables = await resolveBoundVariableNames((textNode as any).boundVariables);
      }
    }
  }

  // Handle boundVariables for all nodes that have them
  if (isAll && !serialized.boundVariables && 'boundVariables' in node && (node as any).boundVariables) {
    serialized.boundVariables = await resolveBoundVariableNames((node as any).boundVariables);
  }

  // Get text content for FigJam STICKY nodes
  if ((isAll || isTextOnly || isLayoutOnly) && node.type === 'STICKY') {
    const stickyNode = node as StickyNode;
    if (stickyNode.text && stickyNode.text.characters) {
      serialized.characters = stickyNode.text.characters;
    }
  }

  // Get FigJam CONNECTOR properties
  if (isAll && node.type === 'CONNECTOR') {
    const connectorNode = node as ConnectorNode;
    serialized.connectorLineType = connectorNode.connectorLineType;

    // Get connected node IDs
    if (connectorNode.connectorStart && 'endpointNodeId' in connectorNode.connectorStart) {
      serialized.connectorStartNodeId = connectorNode.connectorStart.endpointNodeId;
    }
    if (connectorNode.connectorEnd && 'endpointNodeId' in connectorNode.connectorEnd) {
      serialized.connectorEndNodeId = connectorNode.connectorEnd.endpointNodeId;
    }

    // Get stroke info
    if (connectorNode.strokes && connectorNode.strokes.length > 0) {
      const stroke = connectorNode.strokes[0];
      if (stroke.type === 'SOLID') {
        serialized.strokeColor = rgbToHex(stroke.color.r, stroke.color.g, stroke.color.b);
      }
    }
    if (typeof connectorNode.strokeWeight === 'number') {
      serialized.strokeWeight = connectorNode.strokeWeight;
    }
  }

  // Get FigJam SHAPE_WITH_TEXT properties
  if ((isAll || isTextOnly) && node.type === 'SHAPE_WITH_TEXT') {
    const shapeNode = node as ShapeWithTextNode;
    serialized.shapeType = shapeNode.shapeType;
    if (shapeNode.text && shapeNode.text.characters) {
      serialized.characters = shapeNode.text.characters;
    }
  }

  // Get component properties for INSTANCE nodes
  if (isAll && node.type === 'INSTANCE') {
    const instanceNode = node as InstanceNode;
    serialized.componentProperties = instanceNode.componentProperties;
  }

  // Get component property definitions for COMPONENT and COMPONENT_SET nodes
  // Note: Variant components (children of COMPONENT_SET) do not have their own definitions
  if (isAll && node.type === 'COMPONENT_SET') {
    serialized.componentPropertyDefinitions = node.componentPropertyDefinitions;

    // Calculate variant summary for easier AI consumption
    const summaryProperties: Record<string, string[]> = {};
    const existingCombinations: Record<string, string>[] = [];

    // 1. Get property options from definitions
    for (const [name, def] of Object.entries(node.componentPropertyDefinitions)) {
      if (def.type === 'VARIANT' && def.variantOptions) {
        summaryProperties[name] = [...def.variantOptions];
      }
    }

    // 2. Get existing combinations from children
    for (const child of node.children) {
      if (child.type === 'COMPONENT') {
        const props = child.variantProperties;
        if (props) {
          existingCombinations.push({ ...props });
        }
      }
    }

    serialized.variantSummary = {
      properties: summaryProperties,
      existingCombinations: existingCombinations
    };
  } else if (isAll && node.type === 'COMPONENT') {
    const componentNode = node as ComponentNode;
    if (!componentNode.parent || componentNode.parent.type !== 'COMPONENT_SET') {
      serialized.componentPropertyDefinitions = componentNode.componentPropertyDefinitions;
    }
  }

  // Get FigJam STAMP info (stamps are read-only, just capture type)
  if (isAll && node.type === 'STAMP') {
    // Stamps don't have editable text, just name
  }

  // Recursively serialize children (skip hidden children)
  // Recursion enabled for most modes to allow depth context when needed
  const shouldRecurse = isAll || isHierarchy || isTextOnly || isLayoutOnly || isStyleOnly || isIndexOnly || contextMode === 'smart';

  if (shouldRecurse && 'children' in node && node.children.length > 0) {
    const isSmart = contextMode === 'smart';
    const siblingFingerprints = new Map<string, SerializedNode>();

    // Filter hidden children BEFORE creating promises to avoid unnecessary async overhead
    const childrenToProcess = skipHidden
      ? node.children.filter(child => child.visible !== false)
      : node.children;

    const visibleChildrenResults = await Promise.all(childrenToProcess.map(async child => {
      const s = await serializeNodeForAgent(child, skipHidden, depth + 1, contextMode);
      if (!s) return null;

      if (isSmart) {
        const fp = await getNodeFingerprint(child);
        if (siblingFingerprints.has(fp)) {
          const prototype = siblingFingerprints.get(fp)!;
          return createSmartDiff(s, prototype);
        }
        siblingFingerprints.set(fp, s);
      }
      return s;
    }));

    const visibleChildren = visibleChildrenResults.filter((child): child is SerializedNode => child !== null);

    if (visibleChildren.length > 0) {
      serialized.children = visibleChildren;
    }
  }

  // Post-recursion filtering to keep context compact and relevant to the mode
  if (isTextOnly) {
    const hasCharacters = serialized.characters !== undefined;
    const hasChildrenWithText = serialized.children && serialized.children.length > 0;
    // If this node has no text and no children with text, skip it to save tokens
    if (!hasCharacters && !hasChildrenWithText) {
      return null;
    }
  } else if (isStyleOnly) {
    const hasStyle = (serialized.fillsDetailed && serialized.fillsDetailed.length > 0) ||
      (serialized.strokesDetailed && serialized.strokesDetailed.length > 0) ||
      serialized.fillTokenName || serialized.strokeTokenName ||
      serialized.opacity !== undefined || (serialized.tokens && Object.keys(serialized.tokens).length > 0);
    const hasChildrenWithStyle = serialized.children && serialized.children.length > 0;
    // If this node has no style and no children with style, skip it
    if (!hasStyle && !hasChildrenWithStyle) {
      return null;
    }
  } else if (isLayoutOnly) {
    // For layout only, we keep nodes that have layout properties or text (which affects layout)
    const hasLayoutInfo = serialized.layoutMode !== undefined ||
      (serialized.width !== undefined && serialized.width > 0) ||
      (serialized.height !== undefined && serialized.height > 0) ||
      serialized.characters !== undefined;
    const hasChildrenWithLayout = serialized.children && serialized.children.length > 0;
    if (!hasLayoutInfo && !hasChildrenWithLayout) {
      return null;
    }
  }

  // Apply compression for smart mode
  if (contextMode === 'smart') {
    return stripDefaultProperties(serialized);
  }

  return serialized;
}

/**
 * Capture current context lock for intent-based pipeline.
 * Returns minimal metadata (pageId, nodeIds, basic info) for locking.
 */
function captureCurrentContextLock(): { pageId: string, nodeIds: string[], metadata: { id: string, name: string, type: string }[], timestamp: number } {
  const selection = figma.currentPage.selection;
  return {
    pageId: figma.currentPage.id,
    nodeIds: selection.map(n => n.id),
    metadata: selection.map(n => ({
      id: n.id,
      name: n.name,
      type: n.type
    })),
    timestamp: Date.now()
  };
}

/**
 * Fast pre-flight check to count visible nodes without full serialization.
 * Returns early if count exceeds threshold to trigger fallback quickly.
 */
function countVisibleNodes(nodes: readonly SceneNode[], skipHidden: boolean = true, maxCount: number = 500): { count: number, exceeded: boolean } {
  let count = 0;
  const maxDepth = 20;

  function countRecursive(node: SceneNode, depth: number): boolean {
    if (depth > maxDepth) return false;
    if (skipHidden && node.visible === false) return false;

    count++;
    if (count > maxCount) return true; // Early exit

    if ('children' in node) {
      for (const child of node.children) {
        if (skipHidden && child.visible === false) continue;
        if (countRecursive(child, depth + 1)) return true; // Propagate early exit
      }
    }
    return false;
  }

  for (const node of nodes) {
    if (countRecursive(node, 0)) {
      return { count, exceeded: true };
    }
  }

  return { count, exceeded: false };
}

async function serializeSelection(nodes: readonly SceneNode[], skipHidden: boolean = true, contextMode: string = 'all'): Promise<{ data: SerializedNode[], dataSize: number, flattened?: SerializedNode[] }> {
  // Sort nodes by Z-order: top-to-bottom (Y), then left-to-right (X)
  // Use ABSOLUTE/WORLD coordinates so sorting works correctly across different parent containers
  const sortedNodes = [...nodes].sort((a, b) => {
    // Get absolute positions from absoluteTransform matrix
    // absoluteTransform[0][2] = absolute X, absoluteTransform[1][2] = absolute Y
    const aAbsX = a.absoluteTransform[0][2];
    const aAbsY = a.absoluteTransform[1][2];
    const bAbsX = b.absoluteTransform[0][2];
    const bAbsY = b.absoluteTransform[1][2];
    const aHeight = 'height' in a ? a.height : 0;
    const bHeight = 'height' in b ? b.height : 0;

    // Consider nodes on the same "row" if their Y positions overlap significantly
    // Use 50% overlap threshold to group items on the same visual row
    const aTop = aAbsY;
    const aBottom = aAbsY + aHeight;
    const bTop = bAbsY;
    const bBottom = bAbsY + bHeight;

    // Check if nodes are on the same visual row (vertical overlap > 50%)
    const overlapTop = Math.max(aTop, bTop);
    const overlapBottom = Math.min(aBottom, bBottom);
    const overlapHeight = Math.max(0, overlapBottom - overlapTop);
    const minHeight = Math.min(aHeight, bHeight);

    if (minHeight > 0 && overlapHeight / minHeight > 0.5) {
      // Same row - sort by absolute X (left to right)
      return aAbsX - bAbsX;
    }

    // Different rows - sort by absolute Y (top to bottom)
    return aAbsY - bAbsY;
  });

  const flattened: SerializedNode[] = [];
  const addToFlattened = (node: SerializedNode) => {
    // Create a copy without children for the flattened list to save space
    const { children, ...rest } = node;
    flattened.push(rest as SerializedNode);
    if (children) {
      children.forEach(child => addToFlattened(child));
    }
  };

  const dataResults = await Promise.all(sortedNodes.map(async (node, index) => {
    const serialized = await serializeNodeForAgent(node, skipHidden, 0, contextMode);
    if (serialized) {
      // Add sequence index for sequential operations
      serialized.zOrderIndex = index + 1;
      addToFlattened(serialized);
    }
    return serialized;
  }));

  const data = dataResults.filter((node): node is SerializedNode => node !== null);

  // Only include flattened nodes if the selection is relatively small to avoid hitting token limits
  // If the tree is too big, the AI will have to rely on the tree structure.
  const jsonString = JSON.stringify(data);
  const flattenedString = JSON.stringify(flattened);

  // Calculate byte size without TextEncoder (not available in Figma sandbox)
  let dataSize = 0;
  for (let i = 0; i < jsonString.length; i++) {
    const charCode = jsonString.charCodeAt(i);
    if (charCode < 0x80) dataSize += 1;
    else if (charCode < 0x800) dataSize += 2;
    else if (charCode < 0xd800 || charCode >= 0xe000) dataSize += 3;
    else { i++; dataSize += 4; }
  }

  // Include flattened nodes if total size is manageable (e.g. < 30KB)
  if (dataSize + flattenedString.length < 30000) {
    return { data, dataSize: dataSize + flattenedString.length, flattened };
  }

  return { data, dataSize };
}

// Build a compact token context for the agent (local + library variables, paint styles, text styles)
// Options allow skipping expensive operations for large selections
interface TokenContextOptions {
  skipLibraryVariables?: boolean;  // Skip slow library variable imports
  skipStyles?: boolean;            // Skip paint/text styles
}

async function buildTokenContext(options: TokenContextOptions = {}): Promise<TokenContext> {
  const tokenContext: TokenContext = { colorVariables: [], otherVariables: [], collections: [], paintStyles: [], textStyles: [] };
  const { skipLibraryVariables = false, skipStyles = false } = options;

  // Local variables (all types, all modes) - these are fast, always include
  try {
    if (figma.variables && typeof figma.variables.getLocalVariablesAsync === 'function') {
      const [variables, collections] = await Promise.all([
        figma.variables.getLocalVariablesAsync(),
        figma.variables.getLocalVariableCollectionsAsync()
      ]);
      const collectionMap = new Map<string, VariableCollection>();
      collections.forEach(c => collectionMap.set(c.id, c));

      // Serialize collections with IDs and modes
      for (const c of collections) {
        tokenContext.collections.push({
          id: c.id,
          name: c.name,
          modes: (c.modes || []).map(m => ({ modeId: m.modeId, name: m.name })),
          defaultModeId: c.defaultModeId
        });
      }

      const collectionModeMaps = new Map<string, Map<string, string>>();
      for (const c of collections) {
        const modeMap = new Map<string, string>();
        (c.modes || []).forEach(m => modeMap.set(m.modeId, m.name));
        collectionModeMaps.set(c.id, modeMap);
      }

      for (const variable of variables) {
        const collection = collectionMap.get(variable.variableCollectionId);

        if (variable.resolvedType === 'COLOR') {
          const valuesByMode = (variable as any).valuesByMode || {};
          const values: TokenColorValue[] = [];
          const modeEntries = Object.entries(valuesByMode) as [string, any][];
          for (const [modeId, value] of modeEntries) {
            if (value && typeof value === 'object' && 'r' in value && 'g' in value && 'b' in value) {
              const colorValue = value as RGBA;
              values.push({
                modeId,
                modeName: collectionModeMaps.get(variable.variableCollectionId)?.get(modeId),
                hex: rgbToHex(colorValue.r, colorValue.g, colorValue.b),
                rgba: colorValue
              });
            }
          }

          tokenContext.colorVariables.push({
            id: variable.id,
            name: variable.name,
            source: 'local',
            collectionId: variable.variableCollectionId,
            collectionName: collection?.name,
            defaultModeId: collection?.defaultModeId,
            values
          });
        } else {
          // FLOAT, STRING, BOOLEAN variables
          const valuesByMode = (variable as any).valuesByMode || {};
          const defaultModeId = collection?.defaultModeId;
          const defaultValue = defaultModeId ? valuesByMode[defaultModeId] : undefined;

          tokenContext.otherVariables.push({
            id: variable.id,
            name: variable.name,
            resolvedType: variable.resolvedType as 'FLOAT' | 'STRING' | 'BOOLEAN',
            collectionId: variable.variableCollectionId,
            collectionName: collection?.name,
            value: defaultValue
          });
        }
      }
    }
  } catch (err) {
    console.warn('Token context: local variables unavailable', err);
  }

  // Library color variables (all modes) - SLOW due to network calls, skip for large selections
  if (!skipLibraryVariables) {
    try {
      const teamLibrary = (figma as any).teamLibrary as any;
      if (teamLibrary && typeof teamLibrary.getAvailableLibraryVariableCollectionsAsync === 'function' && typeof teamLibrary.getVariablesInLibraryCollectionAsync === 'function' && typeof figma.variables.importVariableByKeyAsync === 'function') {
        const libraryCollections: any[] = await teamLibrary.getAvailableLibraryVariableCollectionsAsync();

        // Limit number of collections to process to avoid long stalls
        const processedCollections = libraryCollections.slice(0, 5);

        for (const libCollection of processedCollections) {
          try {
            const libVariables: any[] = await teamLibrary.getVariablesInLibraryCollectionAsync(libCollection.key);

            // Limit variables per collection
            const processedVars = libVariables.filter(v => v.resolvedType === 'COLOR').slice(0, 100);

            for (const libVar of processedVars) {
              try {
                // Import to read values
                const imported = await figma.variables.importVariableByKeyAsync(libVar.key);
                const valuesByMode = (imported as any).valuesByMode || {};
                let collection: VariableCollection | null = null;
                try {
                  collection = await figma.variables.getVariableCollectionByIdAsync(imported.variableCollectionId);
                } catch (collectionErr) {
                  // ignore
                }
                const modeMap = new Map<string, string>();
                if (collection && Array.isArray(collection.modes)) {
                  collection.modes.forEach(m => modeMap.set(m.modeId, m.name));
                }

                const values: TokenColorValue[] = [];
                for (const [modeId, value] of Object.entries(valuesByMode) as [string, any][]) {
                  if (value && typeof value === 'object' && 'r' in value && 'g' in value && 'b' in value) {
                    const colorValue = value as RGBA;
                    values.push({
                      modeId,
                      modeName: modeMap.get(modeId),
                      hex: rgbToHex(colorValue.r, colorValue.g, colorValue.b),
                      rgba: colorValue
                    });
                  }
                }

                tokenContext.colorVariables.push({
                  key: libVar.key,
                  name: libVar.name,
                  source: 'library',
                  collectionName: libCollection.name,
                  collectionKey: libCollection.key,
                  libraryName: libCollection.libraryName,
                  defaultModeId: collection?.defaultModeId,
                  values
                });
              } catch (importErr) {
                // ignore
              }
            }
          } catch (libErr) {
            console.warn('Token context: library collection fetch failed', libErr);
          }
        }
      }
    } catch (err) {
      console.warn('Token context: library variables unavailable', err);
    }
  }

  // Paint styles (solid colors only for compactness) - skip if requested
  if (!skipStyles) {
    try {
      const paintStyles = await figma.getLocalPaintStylesAsync();
      for (const style of paintStyles) {
        const firstPaint = Array.isArray(style.paints) ? style.paints[0] : null;
        let hex: string | undefined;
        const type: Paint['type'] = firstPaint ? firstPaint.type : 'SOLID';
        if (firstPaint && firstPaint.type === 'SOLID') {
          hex = rgbToHex(firstPaint.color.r, firstPaint.color.g, firstPaint.color.b);
        }
        tokenContext.paintStyles.push({
          id: style.id,
          name: style.name,
          type,
          hex
        });
      }
    } catch (err) {
      console.warn('Token context: paint styles unavailable', err);
    }

    // Text styles (basic typography attributes)
    try {
      const textStyles = await figma.getLocalTextStylesAsync();
      for (const style of textStyles) {
        tokenContext.textStyles.push({
          id: style.id,
          name: style.name,
          fontFamily: style.fontName?.family,
          fontStyle: style.fontName?.style,
          fontSize: style.fontSize,
          lineHeight: style.lineHeight as LineHeight,
          letterSpacing: style.letterSpacing as LetterSpacing
        });
      }
    } catch (err) {
      console.warn('Token context: text styles unavailable', err);
    }
  }

  return tokenContext;
}

// Serialize variables with resolved default-mode values (including aliases) for UI display
function serializeVariablesForDisplay(variables: Variable[], collections: VariableCollection[]) {
  const collectionMap = new Map<string, VariableCollection>();
  collections.forEach(c => collectionMap.set(c.id, c));

  const variableMap = new Map<string, Variable>();
  variables.forEach(v => variableMap.set(v.id, v));

  const resolveAliasValue = (value: any, depth: number = 0): any => {
    if (!value) return value;
    if (depth > 8) return value; // prevent cycles

    if (typeof value === 'object' && 'type' in value && (value as any).type === 'VARIABLE_ALIAS' && 'id' in value) {
      const aliasId = (value as any).id;
      const aliasVar = variableMap.get(aliasId);
      if (!aliasVar) return value;
      const aliasCollection = collectionMap.get(aliasVar.variableCollectionId);
      const aliasDefaultModeId = aliasCollection?.defaultModeId;
      const aliasValues = (aliasVar as any).valuesByMode || {};
      const aliasValue = aliasDefaultModeId ? aliasValues[aliasDefaultModeId] : undefined;
      return resolveAliasValue(aliasValue, depth + 1);
    }

    return value;
  };

  const serializedVariables = variables.map(v => {
    const collection = collectionMap.get(v.variableCollectionId);
    const defaultModeId = collection?.defaultModeId;
    const valuesByMode = (v as any).valuesByMode || {};
    const defaultValue = defaultModeId ? valuesByMode[defaultModeId] : null;
    const resolvedValue = resolveAliasValue(defaultValue);

    let displayValue: string | boolean | null = null;
    let displayColor: RGBA | null = null;

    if (resolvedValue !== null && resolvedValue !== undefined) {
      switch (v.resolvedType) {
        case 'COLOR':
          if (typeof resolvedValue === 'object' && 'r' in resolvedValue && 'g' in resolvedValue && 'b' in resolvedValue) {
            const colorValue = resolvedValue as RGBA;
            displayValue = rgbToHex(colorValue.r, colorValue.g, colorValue.b);
            displayColor = { r: colorValue.r, g: colorValue.g, b: colorValue.b, a: colorValue.a ?? 1 };
          }
          break;
        case 'FLOAT':
          displayValue = typeof resolvedValue === 'number' ? resolvedValue.toString() : String(resolvedValue);
          break;
        case 'STRING':
          displayValue = typeof resolvedValue === 'string' ? resolvedValue : String(resolvedValue);
          break;
        case 'BOOLEAN':
          displayValue = Boolean(resolvedValue);
          break;
      }
    }

    return {
      id: v.id,
      name: v.name,
      type: 'variable',
      resolvedType: v.resolvedType,
      collectionId: v.variableCollectionId,
      collectionName: collection?.name,
      displayValue,
      displayColor
    };
  });

  const serializedCollections = collections.map(c => ({
    id: c.id,
    name: c.name,
    modes: c.modes
  }));

  return { serializedVariables, serializedCollections };
}

// Extract all text content from selection (including FigJam elements)
function extractTextContent(nodes: readonly SceneNode[]): string {
  const texts: string[] = [];

  function traverse(node: SceneNode) {
    // Skip hidden nodes and their children
    if (node.visible === false) return;

    if (node.type === 'TEXT') {
      texts.push((node as TextNode).characters);
    } else if (node.type === 'STICKY') {
      // FigJam sticky note
      const stickyNode = node as StickyNode;
      if (stickyNode.text && stickyNode.text.characters) {
        texts.push(`[Sticky: ${node.name}] ${stickyNode.text.characters}`);
      }
    } else if (node.type === 'SHAPE_WITH_TEXT') {
      // FigJam shape with text
      const shapeNode = node as ShapeWithTextNode;
      if (shapeNode.text && shapeNode.text.characters) {
        texts.push(`[Shape ${shapeNode.shapeType}: ${node.name}] ${shapeNode.text.characters}`);
      }
    } else if (node.type === 'CONNECTOR') {
      // FigJam connector - include connection info
      const connectorNode = node as ConnectorNode;
      let connectorInfo = `[Connector: ${node.name}] Type: ${connectorNode.connectorLineType}`;
      if (connectorNode.connectorStart && 'endpointNodeId' in connectorNode.connectorStart) {
        connectorInfo += `, Start: ${connectorNode.connectorStart.endpointNodeId}`;
      }
      if (connectorNode.connectorEnd && 'endpointNodeId' in connectorNode.connectorEnd) {
        connectorInfo += `, End: ${connectorNode.connectorEnd.endpointNodeId}`;
      }
      texts.push(connectorInfo);
    } else if ('children' in node) {
      for (const child of node.children) {
        traverse(child);
      }
    }
  }

  for (const node of nodes) {
    traverse(node);
  }

  return texts.join('\n');
}

// Generate CSS for all selected nodes
async function generateCSS(nodes: readonly SceneNode[], format: string = 'classes'): Promise<string> {
  if (format === 'tailwind') {
    // Generate Tailwind classes (synchronous; uses manual extraction)
    const tailwindBlocks: string[] = [];

    function traverseTailwind(node: SceneNode) {
      // Skip hidden nodes and their children
      if (node.visible === false) return;

      const classes = getTailwindClasses(node);
      if (classes) {
        tailwindBlocks.push(`<!-- ${node.name} -->\n<div class="${classes}">`);
      }

      if ('children' in node) {
        for (const child of node.children) {
          traverseTailwind(child);
        }
      }
    }

    for (const node of nodes) {
      traverseTailwind(node);
    }

    return tailwindBlocks.join('\n\n');
  } else if (format === 'inline') {
    // Generate inline styles
    const inlineStyles: string[] = [];

    async function traverseInline(node: SceneNode) {
      // Skip hidden nodes and their children
      if (node.visible === false) return;

      const css = await getNodeCSS(node);
      if (css) {
        const styles = css.split('\n  ').filter(line => line.trim() && !line.trim().startsWith('/*'));
        inlineStyles.push(`/* ${node.name} */\nstyle="${styles.join(' ').replace(/;/g, ';')}"`);
      }

      if ('children' in node) {
        for (const child of node.children) {
          await traverseInline(child);
        }
      }
    }

    for (const node of nodes) {
      await traverseInline(node);
    }

    return inlineStyles.join('\n\n');
  } else {
    // Generate CSS classes (default)
    const cssBlocks: string[] = [];

    async function traverse(node: SceneNode, depth: number = 0) {
      // Skip hidden nodes and their children
      if (node.visible === false) return;

      const indent = '  '.repeat(depth);
      // Improved class naming: handle edge cases better
      let name = node.name
        .replace(/[^a-zA-Z0-9-_\s]/g, '')  // Remove special chars except spaces
        .trim()
        .replace(/\s+/g, '-')  // Replace spaces with dashes
        .toLowerCase();

      // Ensure valid CSS class name (can't start with number)
      if (/^[0-9]/.test(name)) {
        name = `el-${name}`;
      }
      if (!name) {
        name = `element-${depth}`;
      }

      const css = await getNodeCSS(node);

      if (css) {
        // Filter out comments for cleaner output
        const cssLines = css.split('\n  ').filter(line => line.trim() && !line.trim().startsWith('/*'));
        if (cssLines.length > 0) {
          cssBlocks.push(`${indent}.${name} {\n  ${indent}${cssLines.join(`\n  ${indent}`)}\n${indent}}`);
        }
      }

      if ('children' in node) {
        for (const child of node.children) {
          await traverse(child, depth + 1);
        }
      }
    }

    for (const node of nodes) {
      await traverse(node);
    }

    return cssBlocks.join('\n\n');
  }
}

// Message handler
// Global variables for batch icon imports
let activeComponentSet: ComponentSetNode | null = null;
const persistentCreatedNodes = new Map<string, any>();
let batchComponentsSection: SectionNode | null = null;
let batchComponentsCount = 0;

const getOrCreateComponentsSection = (offset?: { x: number, y: number }) => {
  if (batchComponentsSection && !batchComponentsSection.removed) return batchComponentsSection;
  batchComponentsSection = figma.createSection();
  batchComponentsSection.name = "Generated Components";

  const sectionWidth = 1200;
  const spacing = 400;
  const viewportCenter = figma.viewport.center;

  // Position it to the left of the main design
  if (offset && offset.x !== 0) {
    batchComponentsSection.x = offset.x - sectionWidth - spacing;
    batchComponentsSection.y = offset.y;
  } else {
    batchComponentsSection.x = viewportCenter.x - sectionWidth - spacing - 400;
    batchComponentsSection.y = viewportCenter.y - 500;
  }

  batchComponentsSection.resizeWithoutConstraints(sectionWidth, 1200);
  return batchComponentsSection;
};

const moveComponentToBatchSection = (component: ComponentNode | ComponentSetNode, offset?: { x: number, y: number }) => {
  try {
    const section = getOrCreateComponentsSection(offset);
    section.appendChild(component);

    // Ensure a minimum reasonable width for the component so it doesn't appear
    // as a narrow strip. Skip for icon/shape components — they should keep their
    // original small size so instances used for swap don't get stretched.
    const isIcon = isIconOrShapeNode(component) || (component.name || '').startsWith('Icon/');
    const MIN_COMPONENT_WIDTH = 300;
    if (!isIcon && component.width < MIN_COMPONENT_WIDTH) {
      try {
        const hasAL = 'layoutMode' in component && (component as any).layoutMode !== 'NONE';
        if (hasAL) {
          const layoutMode = (component as any).layoutMode;
          if (layoutMode === 'VERTICAL') {
            if ('counterAxisSizingMode' in component) (component as any).counterAxisSizingMode = 'FIXED';
            if ('layoutSizingHorizontal' in component) (component as any).layoutSizingHorizontal = 'FIXED';
          } else {
            if ('primaryAxisSizingMode' in component) (component as any).primaryAxisSizingMode = 'FIXED';
            if ('layoutSizingHorizontal' in component) (component as any).layoutSizingHorizontal = 'FIXED';
          }
        }
        component.resize(MIN_COMPONENT_WIDTH, component.height < 10 ? 100 : component.height);

        if (hasAL && 'children' in component) {
          for (const child of component.children) {
            if ('layoutSizingHorizontal' in child && !isIconOrShapeNode(child)) {
              try { (child as any).layoutSizingHorizontal = 'FILL'; } catch (e) { }
            }
          }
        }
      } catch (e) {
        try { component.resize(MIN_COMPONENT_WIDTH, component.height < 10 ? 100 : component.height); } catch (e2) { }
      }
    }

    const cols = 2;
    const spacing = 120;
    const itemW = Math.max(400, component.width + 40);
    const itemH = Math.max(300, component.height + 40);

    const r = Math.floor(batchComponentsCount / cols);
    const c = batchComponentsCount % cols;

    component.x = 80 + c * (itemW + spacing);
    component.y = 120 + r * (itemH + spacing);

    batchComponentsCount++;

    const neededWidth = 80 + cols * (itemW + spacing);
    const neededHeight = 200 + (r + 1) * (itemH + spacing);
    if (neededWidth > section.width) section.resizeWithoutConstraints(neededWidth + 80, section.height);
    if (neededHeight > section.height) section.resizeWithoutConstraints(section.width, neededHeight + 200);
  } catch (e) {
    console.warn('Failed to move component to section', e);
  }
};

// Cancellation flag for long-running execute-commands batches.
// The UI can send 'cancel-execution' to abort in-flight processing.
let executionCancelled = false;

// Helper to get only the top-level nodes from a selection (filters out children if their parent is also selected)
function getTopLevelSelection(nodes: readonly SceneNode[]): SceneNode[] {
  const nodeIds = new Set(nodes.map(n => n.id));
  return nodes.filter(node => {
    let parent = node.parent;
    while (parent) {
      if (nodeIds.has(parent.id)) return false;
      parent = parent.parent;
    }
    return true;
  });
}

// Helper function to export selection using clone-into-frame method (fallback for complex cases)
async function exportWithCloneMethod(
  nodes: SceneNode[],
  exportScale: number,
  pngs: { name: string, data: number[] }[],
  commentMarker?: any
): Promise<void> {
  let tempFrame: FrameNode | null = null;

  try {
    // Find bounding box of selection
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const node of nodes) {
      const absTransform = node.absoluteTransform;
      const x = absTransform[0][2];
      const y = absTransform[1][2];
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x + node.width);
      maxY = Math.max(maxY, y + node.height);
    }

    // Expand bounds slightly if marker is present and outside
    if (commentMarker) {
      // We'll calculate absolute marker position below, but for now just ensure some padding
      minX -= 20;
      minY -= 20;
      maxX += 20;
      maxY += 20;
    }

    const width = maxX - minX;
    const height = maxY - minY;

    // Create temporary frame
    tempFrame = figma.createFrame();
    tempFrame.name = 'temp-export-frame';
    tempFrame.resize(width, height);
    tempFrame.x = minX;
    tempFrame.y = minY;
    tempFrame.fills = []; // Transparent background
    tempFrame.clipsContent = false;

    // Clone nodes into temporary frame
    for (const node of nodes) {
      const clone = node.clone();
      const absTransform = node.absoluteTransform;
      tempFrame.appendChild(clone);
      clone.x = absTransform[0][2] - minX;
      clone.y = absTransform[1][2] - minY;
    }

    // Add marker overlay if present
    if (commentMarker) {
      try {
        let absX = 0, absY = 0, markerWidth = 0, markerHeight = 0;
        let hasMarker = false;

        if (commentMarker.nodeId) {
          const targetNode = await figma.getNodeByIdAsync(commentMarker.nodeId);
          if (targetNode && 'absoluteTransform' in targetNode) {
            const sceneNode = targetNode as SceneNode;
            const t = sceneNode.absoluteTransform;
            const w = sceneNode.width;
            const h = sceneNode.height;

            if (commentMarker.nodeOffset) {
              // node_offset.x/y are in the node's local coordinate space
              const ox = commentMarker.nodeOffset.x;
              const oy = commentMarker.nodeOffset.y;
              // Transform local offset to absolute canvas coordinates
              absX = t[0][0] * ox + t[0][1] * oy + t[0][2];
              absY = t[1][0] * ox + t[1][1] * oy + t[1][2];
              hasMarker = true;

              // If this is a region comment, use region dimensions
              if (commentMarker.regionWidth > 0 && commentMarker.regionHeight > 0) {
                markerWidth = commentMarker.regionWidth;
                markerHeight = commentMarker.regionHeight;
              }
            } else {
              // No offset - use center of node
              absX = t[0][2] + w / 2;
              absY = t[1][2] + h / 2;
              hasMarker = true;
            }
          }
        } else if (commentMarker.x !== undefined && commentMarker.y !== undefined) {
          // Canvas-level comment (not attached to a specific node)
          absX = commentMarker.x;
          absY = commentMarker.y;
          hasMarker = true;
          if (commentMarker.regionWidth > 0 && commentMarker.regionHeight > 0) {
            markerWidth = commentMarker.regionWidth;
            markerHeight = commentMarker.regionHeight;
          }
        }

        if (hasMarker) {
          if (markerWidth > 0 && markerHeight > 0) {
            // Region comment - draw a rectangle
            const rect = figma.createRectangle();
            rect.name = 'AI-Context-Marker-Region';
            rect.resize(markerWidth, markerHeight);
            rect.x = absX - minX;
            rect.y = absY - minY;
            rect.fills = [{ type: 'SOLID', color: { r: 1, g: 0, b: 0 }, opacity: 0.15 }];
            rect.strokes = [{ type: 'SOLID', color: { r: 1, g: 0, b: 0 } }];
            rect.strokeWeight = 3;
            rect.strokeAlign = 'OUTSIDE';
            tempFrame.appendChild(rect);
          } else {
            // Point comment - draw a red dot
            const dot = figma.createEllipse();
            dot.name = 'AI-Context-Marker-Dot';
            const dotSize = 16;
            dot.resize(dotSize, dotSize);
            dot.x = absX - minX - dotSize / 2;
            dot.y = absY - minY - dotSize / 2;
            dot.fills = [{ type: 'SOLID', color: { r: 1, g: 0, b: 0 } }];
            dot.strokes = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
            dot.strokeWeight = 2;
            dot.effects = [{
              type: 'DROP_SHADOW',
              color: { r: 0, g: 0, b: 0, a: 0.3 },
              offset: { x: 0, y: 2 },
              radius: 4,
              visible: true,
              blendMode: 'NORMAL'
            }];
            tempFrame.appendChild(dot);
          }
        }
      } catch (markerError) {
        console.warn('Failed to draw comment marker:', markerError);
      }
    }

    // Export the temporary frame
    const png = await tempFrame.exportAsync({ format: 'PNG', constraint: { type: 'SCALE', value: exportScale } });
    pngs.push({ name: 'Selection', data: Array.from(png) });
  } finally {
    if (tempFrame) {
      tempFrame.remove();
    }
  }
}

figma.ui.onmessage = async (msg: {
  type: string,
  cssFormat?: string,
  settings?: any,
  usage?: Record<string, number>,
  customTones?: any[],
  customImagePresets?: any[],
  customReStylePresets?: any[],
  width?: number,
  height?: number,
  history?: any,
  delimiter?: SmartRenameCaseOnlyDelimiter,
  formatPattern?: string,
  startIndex?: number,
  order?: LocalSequenceOrder,
  padLength?: number,
  replaceSubstring?: boolean,
  prefix?: string,
  suffix?: string,
  keepSpacing?: boolean,
  onlySelected?: boolean,
  includeInstances?: boolean,
  keepOriginal?: boolean
}) => {
  // Handle cancellation requests immediately, before the switch
  if (msg.type === 'cancel-execution') {
    executionCancelled = true;
    console.log('[execute-commands] Cancellation requested by UI');
    return;
  }

  const selection = figma.currentPage.selection;

  switch (msg.type) {
    case 'resize': {
      if (msg.width && msg.height) {
        const w = Math.round(msg.width);
        const h = Math.round(msg.height);
        figma.ui.resize(w, h);
        // Persist the size
        figma.clientStorage.setAsync(SETTINGS_KEYS.PLUGIN_WIDTH, w);
        figma.clientStorage.setAsync(SETTINGS_KEYS.PLUGIN_HEIGHT, h);
      }
      break;
    }

    case 'reset-size': {
      const defaultWidth = 480;
      const defaultHeight = 700;
      figma.ui.resize(defaultWidth, defaultHeight);
      figma.clientStorage.setAsync(SETTINGS_KEYS.PLUGIN_WIDTH, defaultWidth);
      figma.clientStorage.setAsync(SETTINGS_KEYS.PLUGIN_HEIGHT, defaultHeight);
      break;
    }

    case 'load-settings': {
      try {
        const provider = await figma.clientStorage.getAsync(SETTINGS_KEYS.PROVIDER) || 'gemini';
        const aiOffMode = await figma.clientStorage.getAsync(SETTINGS_KEYS.AI_OFF_MODE) === true;
        const geminiApiKey = await figma.clientStorage.getAsync(SETTINGS_KEYS.GEMINI_API_KEY) || '';
        const geminiModel = await figma.clientStorage.getAsync(SETTINGS_KEYS.GEMINI_MODEL) || 'gemini-2.0-flash';
        const openaiApiKey = await figma.clientStorage.getAsync(SETTINGS_KEYS.OPENAI_API_KEY) || '';
        const openaiModel = await figma.clientStorage.getAsync(SETTINGS_KEYS.OPENAI_MODEL) || 'gpt-4o';
        const anthropicApiKey = await figma.clientStorage.getAsync(SETTINGS_KEYS.ANTHROPIC_API_KEY) || '';
        const anthropicModel = await figma.clientStorage.getAsync(SETTINGS_KEYS.ANTHROPIC_MODEL) || 'claude-sonnet-4-20250514';
        const cssFormat = await figma.clientStorage.getAsync(SETTINGS_KEYS.CSS_FORMAT) || 'classes';
        const selectionSizeLimit = await figma.clientStorage.getAsync(SETTINGS_KEYS.SELECTION_SIZE_LIMIT) || 200;
        const auditSettings = await figma.clientStorage.getAsync(SETTINGS_KEYS.AUDIT_SETTINGS) || null;
        const auditPresets = await figma.clientStorage.getAsync(SETTINGS_KEYS.AUDIT_PRESETS) || {};
        const chatArchives = await figma.clientStorage.getAsync(SETTINGS_KEYS.CHAT_ARCHIVES) || [];
        
        // Calculate approximate size of archives
        const archivesJson = JSON.stringify(chatArchives);
        const archivesSize = archivesJson.length;
        
        const customTones = await figma.clientStorage.getAsync(SETTINGS_KEYS.CUSTOM_TONES) || [];
        const customImagePresets = await figma.clientStorage.getAsync(SETTINGS_KEYS.CUSTOM_IMAGE_PRESETS) || [];
        const customReStylePresets = await figma.clientStorage.getAsync(SETTINGS_KEYS.CUSTOM_RE_STYLE_PRESETS) || [];
        const customSmartRenamePresets = await figma.clientStorage.getAsync(SETTINGS_KEYS.CUSTOM_SMART_RENAME_PRESETS) || [];
        const customStyleCategories = await figma.clientStorage.getAsync(SETTINGS_KEYS.CUSTOM_STYLE_CATEGORIES) || [];
        const enabledModels = await figma.clientStorage.getAsync(SETTINGS_KEYS.ENABLED_MODELS) || null;
        const figmaPersonalToken = await figma.clientStorage.getAsync(SETTINGS_KEYS.FIGMA_PERSONAL_TOKEN) || '';
        const quiverApiKey = await figma.clientStorage.getAsync(SETTINGS_KEYS.QUIVER_API_KEY) || '';
        const unsplashApiKey = await figma.clientStorage.getAsync(SETTINGS_KEYS.UNSPLASH_API_KEY) || '';
        const pixabayApiKey = await figma.clientStorage.getAsync(SETTINGS_KEYS.PIXABAY_API_KEY) || '';
        const pexelsApiKey = await figma.clientStorage.getAsync(SETTINGS_KEYS.PEXELS_API_KEY) || '';
        const replyTemplates = await figma.clientStorage.getAsync(SETTINGS_KEYS.REPLY_TEMPLATES) || [];
        const lastChatId = await figma.clientStorage.getAsync(SETTINGS_KEYS.LAST_CHAT_ID) || null;
        const lastCommandsCategory = await figma.clientStorage.getAsync(SETTINGS_KEYS.LAST_COMMANDS_CATEGORY) || null;
        const maximizedPromptDrawerData = await figma.clientStorage.getAsync(SETTINGS_KEYS.MAXIMIZED_PROMPT_DRAWER_DATA) || null;

        const promptHistory = await figma.clientStorage.getAsync(SETTINGS_KEYS.PROMPT_HISTORY) || {};

        figma.ui.postMessage({
          type: 'settings-loaded',
          data: { provider, aiOffMode, geminiApiKey, geminiModel, openaiApiKey, openaiModel, anthropicApiKey, anthropicModel, cssFormat, selectionSizeLimit, auditSettings, auditPresets, chatArchives, customTones, customImagePresets, customReStylePresets, customSmartRenamePresets, customStyleCategories, enabledModels, figmaPersonalToken, quiverApiKey, unsplashApiKey, pixabayApiKey, pexelsApiKey, promptHistory, replyTemplates, lastChatId, lastCommandsCategory, maximizedPromptDrawerData },
          archivesSize: archivesSize
        });
      } catch (error) {
        console.error('Failed to load settings:', error);
        figma.ui.postMessage({
          type: 'settings-loaded',
          data: { provider: 'gemini', aiOffMode: false, geminiApiKey: '', geminiModel: 'gemini-2.0-flash', openaiApiKey: '', openaiModel: 'gpt-4o', anthropicApiKey: '', anthropicModel: 'claude-sonnet-4-20250514', cssFormat: 'classes', selectionSizeLimit: 200, auditSettings: null, auditPresets: {}, chatArchives: [], customTones: [], customImagePresets: [], customReStylePresets: [], customSmartRenamePresets: [], customStyleCategories: [], enabledModels: null, figmaPersonalToken: '', quiverApiKey: '' }
        });
      }
      break;
    }

    case 'load-quick-actions-usage': {
      try {
        const usage = await figma.clientStorage.getAsync(SETTINGS_KEYS.QUICK_ACTION_USAGE);
        const lastUsed = await figma.clientStorage.getAsync(SETTINGS_KEYS.LAST_USED_QUICK_ACTIONS);
        const normalizedUsage = usage && typeof usage === 'object' ? usage as Record<string, number> : {};
        const normalizedLastUsed = Array.isArray(lastUsed) ? lastUsed : [];
        figma.ui.postMessage({
          type: 'quick-actions-usage-loaded',
          data: normalizedUsage,
          lastUsed: normalizedLastUsed
        });
      } catch (error) {
        console.error('Failed to load quick action usage:', error);
        figma.ui.postMessage({ type: 'quick-actions-usage-loaded', data: {}, lastUsed: [] });
      }
      break;
    }

    case 'save-quick-actions-usage': {
      try {
        const usage = msg.usage && typeof msg.usage === 'object' ? msg.usage : {};
        const lastUsed = (msg as any).lastUsed;
        const sanitizedUsage = Object.entries(usage).reduce((acc, [key, value]) => {
          if (typeof value === 'number' && Number.isFinite(value) && value >= 0) {
            acc[key] = value as number;
          }
          return acc;
        }, {} as Record<string, number>);

        await figma.clientStorage.setAsync(SETTINGS_KEYS.QUICK_ACTION_USAGE, sanitizedUsage);

        if (Array.isArray(lastUsed)) {
          await figma.clientStorage.setAsync(SETTINGS_KEYS.LAST_USED_QUICK_ACTIONS, lastUsed);
        }
      } catch (error) {
        console.error('Failed to save quick action usage:', error);
      }
      break;
    }

    case 'load-custom-tones': {
      try {
        const customTones = await figma.clientStorage.getAsync(SETTINGS_KEYS.CUSTOM_TONES) || [];
        const normalized = Array.isArray(customTones) ? customTones : [];
        figma.ui.postMessage({ type: 'custom-tones-loaded', data: normalized });
      } catch (error) {
        console.error('Failed to load custom tones:', error);
        figma.ui.postMessage({ type: 'custom-tones-loaded', data: [] });
      }
      break;
    }

    case 'save-custom-tones': {
      try {
        const customTones = Array.isArray(msg.customTones) ? msg.customTones : [];
        // Sanitize custom tones - ensure each has value and label
        const sanitized = customTones.filter((tone: any) =>
          typeof tone === 'object' &&
          tone !== null &&
          typeof tone.value === 'string' &&
          typeof tone.label === 'string' &&
          tone.value.trim() !== '' &&
          tone.label.trim() !== ''
        );
        await figma.clientStorage.setAsync(SETTINGS_KEYS.CUSTOM_TONES, sanitized);
        figma.ui.postMessage({ type: 'custom-tones-saved' });
      } catch (error) {
        console.error('Failed to save custom tones:', error);
        figma.ui.postMessage({ type: 'error', message: 'Failed to save custom tones' });
      }
      break;
    }

    case 'save-custom-image-presets': {
      try {
        const presets = Array.isArray((msg as any).presets) ? (msg as any).presets : [];
        // Sanitize custom presets
        const sanitized = presets.filter((p: any) =>
          typeof p === 'object' &&
          p !== null &&
          typeof p.value === 'string' &&
          typeof p.label === 'string' &&
          p.value.trim() !== '' &&
          p.label.trim() !== ''
        );
        await figma.clientStorage.setAsync(SETTINGS_KEYS.CUSTOM_IMAGE_PRESETS, sanitized);
      } catch (error) {
        console.error('Failed to save custom image presets:', error);
        figma.ui.postMessage({ type: 'error', message: 'Failed to save custom image presets' });
      }
      break;
    }

    case 'save-custom-re-style-presets': {
      try {
        const presets = Array.isArray((msg as any).presets) ? (msg as any).presets : [];
        // Sanitize custom presets
        const sanitized = presets.filter((p: any) =>
          typeof p === 'object' &&
          p !== null &&
          typeof p.value === 'string' &&
          typeof p.label === 'string' &&
          p.value.trim() !== '' &&
          p.label.trim() !== ''
        );
        await figma.clientStorage.setAsync(SETTINGS_KEYS.CUSTOM_RE_STYLE_PRESETS, sanitized);
      } catch (error) {
        console.error('Failed to save custom re-style presets:', error);
        figma.ui.postMessage({ type: 'error', message: 'Failed to save custom re-style presets' });
      }
      break;
    }

    case 'save-custom-smart-rename-presets': {
      try {
        const presets = Array.isArray((msg as any).presets) ? (msg as any).presets : [];
        const sanitized = presets.filter((p: any) =>
          typeof p === 'object' &&
          p !== null &&
          typeof p.value === 'string' &&
          typeof p.label === 'string' &&
          p.value.trim() !== '' &&
          p.label.trim() !== ''
        );
        await figma.clientStorage.setAsync(SETTINGS_KEYS.CUSTOM_SMART_RENAME_PRESETS, sanitized);
      } catch (error) {
        console.error('Failed to save custom smart rename presets:', error);
        figma.ui.postMessage({ type: 'error', message: 'Failed to save custom smart rename presets' });
      }
      break;
    }

    case 'save-custom-style-categories': {
      try {
        const categories = Array.isArray((msg as any).customStyleCategories) ? (msg as any).customStyleCategories : [];
        const sanitized = categories.filter((c: any) =>
          typeof c === 'object' &&
          c !== null &&
          typeof c.name === 'string' &&
          c.name.trim() !== ''
        );
        await figma.clientStorage.setAsync(SETTINGS_KEYS.CUSTOM_STYLE_CATEGORIES, sanitized);
      } catch (error) {
        console.error('Failed to save custom style categories:', error);
        figma.ui.postMessage({ type: 'error', message: 'Failed to save custom style categories' });
      }
      break;
    }

    case 'save-reply-templates': {
      try {
        const templates = Array.isArray((msg as any).templates) ? (msg as any).templates : [];
        await figma.clientStorage.setAsync(SETTINGS_KEYS.REPLY_TEMPLATES, templates);
      } catch (error) {
        console.error('Failed to save reply templates:', error);
        figma.ui.postMessage({ type: 'error', message: 'Failed to save reply templates' });
      }
      break;
    }

    case 'save-settings': {
      try {
        if (!msg.settings) {
          figma.ui.postMessage({ type: 'error', message: 'No settings provided' });
          return;
        }

        const { provider, aiOffMode, geminiApiKey, geminiModel, openaiApiKey, openaiModel, anthropicApiKey, anthropicModel, cssFormat, selectionSizeLimit, enabledModels, figmaPersonalToken, quiverApiKey, unsplashApiKey, pixabayApiKey, pexelsApiKey } = msg.settings;

        await figma.clientStorage.setAsync(SETTINGS_KEYS.PROVIDER, provider || 'gemini');
        await figma.clientStorage.setAsync(SETTINGS_KEYS.AI_OFF_MODE, aiOffMode === true);
        await figma.clientStorage.setAsync(SETTINGS_KEYS.GEMINI_API_KEY, geminiApiKey || '');
        await figma.clientStorage.setAsync(SETTINGS_KEYS.GEMINI_MODEL, geminiModel || 'gemini-2.0-flash');
        await figma.clientStorage.setAsync(SETTINGS_KEYS.OPENAI_API_KEY, openaiApiKey || '');
        await figma.clientStorage.setAsync(SETTINGS_KEYS.OPENAI_MODEL, openaiModel || 'gpt-4o');
        await figma.clientStorage.setAsync(SETTINGS_KEYS.ANTHROPIC_API_KEY, anthropicApiKey || '');
        await figma.clientStorage.setAsync(SETTINGS_KEYS.ANTHROPIC_MODEL, anthropicModel || 'claude-sonnet-4-20250514');
        await figma.clientStorage.setAsync(SETTINGS_KEYS.CSS_FORMAT, cssFormat || 'classes');
        await figma.clientStorage.setAsync(SETTINGS_KEYS.SELECTION_SIZE_LIMIT, selectionSizeLimit || 200);
        await figma.clientStorage.setAsync(SETTINGS_KEYS.ENABLED_MODELS, enabledModels || null);
        await figma.clientStorage.setAsync(SETTINGS_KEYS.FIGMA_PERSONAL_TOKEN, figmaPersonalToken || '');
        await figma.clientStorage.setAsync(SETTINGS_KEYS.QUIVER_API_KEY, quiverApiKey || '');
        await figma.clientStorage.setAsync(SETTINGS_KEYS.UNSPLASH_API_KEY, unsplashApiKey || '');
        await figma.clientStorage.setAsync(SETTINGS_KEYS.PIXABAY_API_KEY, pixabayApiKey || '');
        await figma.clientStorage.setAsync(SETTINGS_KEYS.PEXELS_API_KEY, pexelsApiKey || '');

        figma.ui.postMessage({ type: 'settings-saved' });
      } catch (error) {
        console.error('Failed to save settings:', error);
        figma.ui.postMessage({ type: 'error', message: 'Failed to save settings' });
      }
      break;
    }

    case 'quiver-vector-request': {
      try {
        const requestMsg = msg as any;
        const requestId = requestMsg.requestId;
        const endpoint = typeof requestMsg.endpoint === 'string' ? requestMsg.endpoint : '';
        const payload = requestMsg.payload;
        const apiKey = typeof requestMsg.apiKey === 'string' ? requestMsg.apiKey : '';

        const allowedEndpoints = new Set([
          '/v1/svgs/generations',
          '/v1/svgs/vectorizations'
        ]);

        if (!requestId || !allowedEndpoints.has(endpoint)) {
          figma.ui.postMessage({
            type: 'quiver-vector-response',
            requestId,
            ok: false,
            status: 400,
            error: 'Invalid Quiver request'
          });
          break;
        }

        if (!apiKey) {
          figma.ui.postMessage({
            type: 'quiver-vector-response',
            requestId,
            ok: false,
            status: 401,
            error: 'Missing Quiver API key'
          });
          break;
        }

        const streamPayload = { ...payload, stream: true };

        const quiverUrl = `https://api.quiver.ai${endpoint}`;
        const proxiedUrl = 'https://corsproxy.io/?url=' + encodeURIComponent(quiverUrl);
        const response = await fetch(proxiedUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          },
          body: JSON.stringify(streamPayload)
        });

        if (!response.ok) {
          const errText = await response.text();
          let errMsg = errText;
          try {
            const errData = JSON.parse(errText);
            errMsg = errData.message || errData.error?.message || errText;
          } catch (_e) { /* not JSON */ }
          figma.ui.postMessage({
            type: 'quiver-vector-response',
            requestId,
            ok: false,
            status: response.status,
            error: errMsg || `Quiver API failed with status ${response.status}`
          });
          break;
        }

        const responseText = await response.text();
        const svgs: string[] = [];

        try {
          const jsonData = JSON.parse(responseText);
          const items = jsonData?.data || [];
          for (const item of items) {
            if (item?.svg && typeof item.svg === 'string') svgs.push(item.svg);
          }
        } catch (_e) {
          const lines = responseText.split('\n');
          for (const line of lines) {
            const stripped = line.startsWith('data: ') ? line.substring(6).trim() : '';
            if (!stripped || stripped === '[DONE]') continue;
            try {
              const evt = JSON.parse(stripped);
              if (evt?.data && Array.isArray(evt.data)) {
                for (const item of evt.data) {
                  if (item?.svg && typeof item.svg === 'string') svgs.push(item.svg);
                }
              } else if (evt?.svg && typeof evt.svg === 'string') {
                svgs.push(evt.svg);
              }
              if (evt?.type === 'content' || evt?.phase === 'content') {
                const contentSvg = evt?.svg || evt?.data?.[0]?.svg || evt?.content;
                if (contentSvg && typeof contentSvg === 'string' && contentSvg.trim().startsWith('<')) {
                  if (!svgs.includes(contentSvg)) svgs.push(contentSvg);
                }
              }
            } catch (_e2) { /* skip non-JSON lines */ }
          }
        }

        figma.ui.postMessage({
          type: 'quiver-vector-response',
          requestId,
          ok: true,
          status: response.status,
          data: { data: svgs.map(s => ({ svg: s })) }
        });
      } catch (error) {
        const requestId = (msg as any).requestId;
        figma.ui.postMessage({
          type: 'quiver-vector-response',
          requestId,
          ok: false,
          status: 500,
          error: error instanceof Error ? error.message : 'Failed to call Quiver API'
        });
      }
      break;
    }

    case 'save-model-selection': {
      try {
        const { provider, modelId } = msg as any;
        if (!provider || !modelId) {
          figma.ui.postMessage({ type: 'error', message: 'Provider and modelId required' });
          return;
        }

        // Save the provider
        await figma.clientStorage.setAsync(SETTINGS_KEYS.PROVIDER, provider);

        // Save the model for the specific provider
        switch (provider) {
          case 'gemini':
            await figma.clientStorage.setAsync(SETTINGS_KEYS.GEMINI_MODEL, modelId);
            break;
          case 'openai':
            await figma.clientStorage.setAsync(SETTINGS_KEYS.OPENAI_MODEL, modelId);
            break;
          case 'anthropic':
            await figma.clientStorage.setAsync(SETTINGS_KEYS.ANTHROPIC_MODEL, modelId);
            break;
        }
      } catch (error) {
        console.error('Failed to save model selection:', error);
        figma.ui.postMessage({ type: 'error', message: 'Failed to save model selection' });
      }
      break;
    }

    case 'save-prompt-history': {
      try {
        const history = msg.history || {};
        await figma.clientStorage.setAsync(SETTINGS_KEYS.PROMPT_HISTORY, history);
      } catch (error) {
        console.error('Failed to save prompt history:', error);
      }
      break;
    }

    case 'save-reply-templates': {
      try {
        const templates = Array.isArray((msg as any).templates) ? (msg as any).templates : [];
        await figma.clientStorage.setAsync(SETTINGS_KEYS.REPLY_TEMPLATES, templates);
      } catch (error) {
        console.error('Failed to save reply templates:', error);
      }
      break;
    }

    case 'get-current-context': {
      try {
        const fileKey = figma.fileKey;
        const fileName = figma.root.name;
        const currentPageId = figma.currentPage.id;
        const currentPageName = figma.currentPage.name;

        figma.ui.postMessage({
          type: 'current-context',
          data: {
            fileKey,
            fileName,
            currentPageId,
            currentPageName,
          }
        });
      } catch (error) {
        console.error('Failed to get current context:', error);
        figma.ui.postMessage({
          type: 'current-context',
          data: {
            fileKey: '',
            fileName: '',
            currentPageId: '',
            currentPageName: '',
            error: 'Failed to get current context'
          }
        });
      }
      break;
    }

    case 'get-file-info': {
      try {
        // Try to get fileKey (only available for private plugins, will be undefined otherwise)
        const fileKey = figma.fileKey || '';
        const fileName = figma.root.name;
        const currentPageId = figma.currentPage.id;
        const currentPageName = figma.currentPage.name;

        // Get all pages for reference
        const pages = figma.root.children.map(page => ({
          id: page.id,
          name: page.name
        }));

        figma.ui.postMessage({
          type: 'file-info',
          data: {
            fileKey,
            fileName,
            currentPageId,
            currentPageName,
            pages
          }
        });
      } catch (error) {
        console.error('Failed to get file info:', error);
        figma.ui.postMessage({
          type: 'file-info',
          data: {
            fileKey: '',
            fileName: '',
            currentPageId: '',
            currentPageName: '',
            pages: [],
            error: 'Failed to get file info'
          }
        });
      }
      break;
    }

    case 'get-nodes-pages': {
      try {
        const { nodeIds } = msg as any;
        if (!nodeIds || !Array.isArray(nodeIds)) {
          break;
        }

        const results: Record<string, string> = {};
        for (const id of nodeIds) {
          try {
            const node = await figma.getNodeByIdAsync(id);
            if (node) {
              let current: BaseNode | null = node;
              while (current && current.type !== 'PAGE') {
                current = current.parent;
              }
              if (current && current.type === 'PAGE') {
                results[id] = current.id;
              }
            }
          } catch (e) {
            // Ignore individual node failures
          }
        }

        figma.ui.postMessage({
          type: 'nodes-pages-result',
          results
        });
      } catch (error) {
        console.error('Failed to get nodes pages:', error);
      }
      break;
    }

    case 'get-viewport-and-node-positions': {
      try {
        const { nodeIds } = msg as any;
        const viewportCenter = { x: figma.viewport.center.x, y: figma.viewport.center.y };
        const positions: Record<string, { x: number, y: number }> = {};
        const names: Record<string, string> = {};

        if (nodeIds && Array.isArray(nodeIds)) {
          for (const id of nodeIds) {
            try {
              const node = await figma.getNodeByIdAsync(id);
              if (node) {
                names[id] = node.name;
                if ('absoluteTransform' in node) {
                  const sceneNode = node as SceneNode;
                  const transform = sceneNode.absoluteTransform;
                  // Return center of the node
                  positions[id] = {
                    x: transform[0][2] + sceneNode.width / 2,
                    y: transform[1][2] + sceneNode.height / 2
                  };
                }
              }
            } catch (e) {
              // Ignore individual node failures
            }
          }
        }

        figma.ui.postMessage({
          type: 'viewport-and-node-positions-result',
          viewportCenter,
          positions,
          names
        });
      } catch (error) {
        console.error('Failed to get viewport and node positions:', error);
        figma.ui.postMessage({
          type: 'viewport-and-node-positions-result',
          viewportCenter: { x: 0, y: 0 },
          positions: {}
        });
      }
      break;
    }

    case 'navigate-to-node': {

      try {
        const { nodeId } = msg as any;
        if (!nodeId) {
          figma.ui.postMessage({ type: 'error', message: 'No node ID provided' });
          return;
        }

        console.log('[Figma AI] Attempting to navigate to node:', nodeId);

        // Try to find the node - handle different ID formats from Comments API
        // Use async version for dynamic-page document access
        let node: BaseNode | null = null;

        // First, try the ID as-is
        node = await figma.getNodeByIdAsync(nodeId);

        // If not found, the Comments API might return IDs with different formats
        // Try extracting just the node part if it contains special characters
        if (!node && typeof nodeId === 'string') {
          // Some comment node_ids might have format like "I123:456;789:012" for instances
          // Or just "123:456" for regular nodes
          const cleanId = nodeId.replace(/^I/, ''); // Remove leading 'I' for instance IDs
          if (cleanId !== nodeId) {
            node = await figma.getNodeByIdAsync(cleanId);
          }

          // Try splitting by semicolon (instance path) and use the last part
          if (!node && nodeId.includes(';')) {
            const parts = nodeId.split(';');
            for (const part of parts) {
              const cleanPart = part.replace(/^I/, '');
              node = await figma.getNodeByIdAsync(cleanPart);
              if (node) break;
            }
          }
        }

        if (node && node.type !== 'DOCUMENT') {
          // If the node is on a different page, switch to that page first
          let pageNode: PageNode | null = null;
          let currentNode: BaseNode | null = node;
          while (currentNode && currentNode.type !== 'PAGE') {
            currentNode = currentNode.parent;
          }
          if (currentNode && currentNode.type === 'PAGE') {
            pageNode = currentNode as PageNode;
            if (figma.currentPage !== pageNode) {
              await figma.setCurrentPageAsync(pageNode);
            }
          }

          // Navigate to specific position if offset is provided, otherwise zoom to node
          const { nodeOffset } = msg as any;
          if (nodeOffset && 'absoluteTransform' in node) {
            const sceneNode = node as SceneNode;
            const t = sceneNode.absoluteTransform;
            // Convert local offset to absolute coordinates:
            // ax = a*lx + b*ly + tx
            // ay = c*lx + d*ly + ty
            const absX = t[0][0] * nodeOffset.x + t[0][1] * nodeOffset.y + t[0][2];
            const absY = t[1][0] * nodeOffset.x + t[1][1] * nodeOffset.y + t[1][2];

            figma.currentPage.selection = [sceneNode];
            figma.viewport.center = { x: absX, y: absY };
            // Optional: suggest a zoom level if we are too far out
            if (figma.viewport.zoom < 0.5) figma.viewport.zoom = 1;
          } else if ('type' in node && node.type !== 'PAGE') {
            const sceneNode = node as SceneNode;
            figma.currentPage.selection = [sceneNode];
            figma.viewport.scrollAndZoomIntoView([sceneNode]);
          }

          console.log('[Figma AI] Successfully navigated to node:', node.name);
          figma.ui.postMessage({ type: 'navigate-success', nodeId });
        } else {
          console.log('[Figma AI] Node not found with ID:', nodeId);
          figma.ui.postMessage({ type: 'error', message: `Node not found (ID: ${nodeId}). It may have been deleted or moved.` });
        }
      } catch (error) {
        console.error('[Figma AI] Failed to navigate to node:', error);
        figma.ui.postMessage({ type: 'error', message: 'Failed to navigate to node: ' + (error as Error).message });
      }
      break;
    }

    case 'get-css': {
      if (selection.length === 0) {
        figma.ui.postMessage({ type: 'error', message: 'Please select at least one element' });
        return;
      }

      const css = await generateCSS(selection, msg.cssFormat || 'classes');
      figma.ui.postMessage({ type: 'css-result', data: css });
      break;
    }

    case 'get-svg': {
      if (selection.length === 0) {
        figma.ui.postMessage({ type: 'error', message: 'Please select at least one element' });
        return;
      }

      try {
        const svgPromises = selection.map(async (node) => {
          if ('exportAsync' in node) {
            const svg = await node.exportAsync({ format: 'SVG_STRING' });
            return `<!-- ${node.name} -->\n${svg}`;
          }
          return '';
        });
        const svgs = await Promise.all(svgPromises);
        figma.ui.postMessage({ type: 'svg-result', data: svgs.filter(s => s).join('\n\n') });
      } catch (error) {
        figma.ui.postMessage({ type: 'error', message: 'Failed to export SVG' });
      }
      break;
    }

    case 'get-png': {
      if (selection.length === 0) {
        figma.ui.postMessage({ type: 'error', message: 'Please select at least one element' });
        return;
      }

      try {
        const pngPromises = selection.map(async (node) => {
          if ('exportAsync' in node) {
            const png = await node.exportAsync({ format: 'PNG', constraint: { type: 'SCALE', value: 2 } });
            return { name: node.name, data: Array.from(png) };
          }
          return null;
        });
        const pngs = await Promise.all(pngPromises);
        figma.ui.postMessage({ type: 'png-result', data: pngs.filter(p => p) });
      } catch (error) {
        figma.ui.postMessage({ type: 'error', message: 'Failed to export PNG' });
      }
      break;
    }

    case 'get-figma-images': {
      const { mode, fieldKey, commentMarker } = msg as any;
      if (selection.length === 0) {
        figma.ui.postMessage({ type: 'error', message: 'Please select at least one element' });
        return;
      }

      // Use 1x scale for fallback exports to reduce token usage, 2x for regular exports
      const isFallbackExport = fieldKey === 'selection-fallback';
      const exportScale = isFallbackExport ? 1 : 2;

      try {
        let pngs: { name: string, data: number[] }[] = [];
        // Filter selection to only top-level nodes to avoid parent-child grouping issues
        const topLevelSelection = getTopLevelSelection(selection);

        if (mode === 'whole') {
          // Optimized export strategies based on selection

          // Strategy 1: Single node - direct export (fastest, no cloning)
          // Exception: If we have a comment marker, we MUST use clone method to draw the overlay
          if (topLevelSelection.length === 1 && !commentMarker) {
            const node = topLevelSelection[0];
            if ('exportAsync' in node) {
              const png = await node.exportAsync({ format: 'PNG', constraint: { type: 'SCALE', value: exportScale } });
              pngs.push({ name: 'Selection', data: Array.from(png) });
            }
          }
          // Strategy 2: Multiple nodes with same parent - use temporary grouping (faster than cloning)
          // Exception: If we have a comment marker, we MUST use clone method
          else if (topLevelSelection.length > 1 && !commentMarker &&
            topLevelSelection.every(n => n.parent === topLevelSelection[0].parent) &&
            topLevelSelection[0].parent?.type !== 'INSTANCE') {
            const parent = topLevelSelection[0].parent;
            if (parent && 'children' in parent && 'insertChild' in parent) {
              // Store original indices and nodes for accurate restoration
              const nodePositions = topLevelSelection.map(node => ({
                node: node as SceneNode,
                index: parent.children.indexOf(node as SceneNode)
              }));

              // Sort by index ascending to ensure stable restoration
              nodePositions.sort((a, b) => a.index - b.index);

              let tempGroup: GroupNode | null = null;
              try {
                // Group temporarily - this moves nodes but doesn't clone
                tempGroup = figma.group([...topLevelSelection], parent);
                const png = await tempGroup.exportAsync({ format: 'PNG', constraint: { type: 'SCALE', value: exportScale } });
                pngs.push({ name: 'Selection', data: Array.from(png) });

                // Success - the try block naturally cleans up via finally
              } catch (groupError) {
                // Fallback to clone method if grouping fails
                console.warn('Grouping export failed, falling back to clone method:', groupError);
                // Clear any partial results to avoid duplicate images
                pngs.length = 0;
                await exportWithCloneMethod(topLevelSelection, exportScale, pngs, commentMarker);
              } finally {
                if (tempGroup && !tempGroup.removed) {
                  try {
                    for (const pos of nodePositions) {
                      if (!pos.node.removed) {
                        try { parent.insertChild(pos.index, pos.node); } catch (e) { }
                      }
                    }
                    if (!tempGroup.removed) {
                      if (tempGroup.children.length === 0) {
                        tempGroup.remove();
                      } else {
                        figma.ungroup(tempGroup);
                      }
                    }
                  } catch (e) {
                    if (!tempGroup.removed) {
                      try { figma.ungroup(tempGroup); } catch (err) { }
                    }
                  }
                }
              }
            } else {
              await exportWithCloneMethod(topLevelSelection, exportScale, pngs, commentMarker);
            }
          }
          // Strategy 3: Multiple nodes with different parents OR Comment Marker present - use clone method
          else {
            await exportWithCloneMethod(topLevelSelection, exportScale, pngs, commentMarker);
          }
        } else {
          // Export each item separately
          const pngPromises = selection.map(async (node) => {
            if ('exportAsync' in node) {
              const png = await node.exportAsync({ format: 'PNG', constraint: { type: 'SCALE', value: exportScale } });
              return { name: node.name, data: Array.from(png) };
            }
            return null;
          });
          const results = await Promise.all(pngPromises);
          pngs = results.filter((p): p is { name: string, data: number[] } => p !== null);
        }

        figma.ui.postMessage({
          type: 'figma-images-result',
          fieldKey,
          images: pngs
        });
      } catch (error) {
        console.error('Error exporting Figma images:', error);
        figma.ui.postMessage({ type: 'error', message: 'Failed to export Figma images' });
      }
      break;
    }

    case 'focus-node': {
      const anyMsg = msg as any;
      if (anyMsg.id) {
        try {
          // Use async API for better cross-page support
          const node = await figma.getNodeByIdAsync(anyMsg.id);
          if (node && node.type !== 'PAGE' && node.type !== 'DOCUMENT') {
            // Find the page this node belongs to and switch if needed
            let current: BaseNode | null = node;
            while (current && current.type !== 'PAGE') {
              current = current.parent;
            }
            if (current && current.type === 'PAGE' && current !== figma.currentPage) {
              await figma.setCurrentPageAsync(current as PageNode);
            }
            // Select and scroll into view
            figma.currentPage.selection = [node as SceneNode];
            figma.viewport.scrollAndZoomIntoView([node as SceneNode]);
          } else {
            figma.ui.postMessage({ type: 'error', message: 'Node not found or not focusable' });
          }
        } catch (err) {
          console.error('Error focusing node:', err);
          figma.ui.postMessage({ type: 'error', message: 'Failed to focus node' });
        }
      }
      break;
    }

    case 'get-text': {
      if (selection.length === 0) {
        figma.ui.postMessage({ type: 'error', message: 'Please select at least one element' });
        return;
      }

      const text = extractTextContent(selection);
      if (text) {
        figma.ui.postMessage({ type: 'text-result', data: text });
      } else {
        figma.ui.postMessage({ type: 'error', message: 'No text found in selection' });
      }
      break;
    }

    case 'get-selection-info': {
      figma.ui.postMessage({ type: 'selection-info', data: buildSelectionInfoPayload(selection) });
      break;
    }

    case 'smart-rename-case-only': {
      try {
        if (selection.length === 0) {
          figma.ui.postMessage({ type: 'error', message: 'Please select at least one layer to rename.' });
          break;
        }

        const delimiter = msg.delimiter || '_';
        const onlySelected = msg.onlySelected === true;
        const includeInstances = msg.includeInstances === true;
        const keepOriginal = msg.keepOriginal === true;

        const targets = collectSmartRenameTargets(selection, onlySelected, includeInstances)
          .filter(isRenameableSceneNode);

        let renamed = 0;
        let skipped = 0;

        for (const node of targets) {
          const nextName = transformNameCaseOnly(node.name, delimiter, keepOriginal);
          if (!nextName || nextName === node.name) {
            skipped++;
            continue;
          }

          node.name = nextName;
          renamed++;
        }

        figma.ui.postMessage({
          type: 'smart-rename-case-only-result',
          renamed,
          skipped,
          total: targets.length
        });

        figma.ui.postMessage({ type: 'selection-info', data: buildSelectionInfoPayload(figma.currentPage.selection) });
      } catch (error) {
        console.error('smart-rename-case-only failed', error);
        figma.ui.postMessage({
          type: 'error',
          message: `Case-only rename failed: ${(error as Error)?.message || 'Unknown error'}`
        });
      }
      break;
    }

    case 'local-sequential-naming': {
      try {
        if (selection.length === 0) {
          figma.ui.postMessage({ type: 'error', message: 'Please select at least one layer to rename.' });
          break;
        }

        const formatPattern = msg.formatPattern || 'Layer {n}';
        const startIndex = typeof msg.startIndex === 'number' ? msg.startIndex : 1;
        const order = msg.order || 'zOrder';
        const padLength = typeof msg.padLength === 'number' ? msg.padLength : 0;
        const targets = sortSceneNodesByOrder(selection.filter(isRenameableSceneNode), order);
        const maxSequenceNumber = startIndex + Math.max(targets.length - 1, 0);

        let renamed = 0;
        let skipped = 0;

        targets.forEach((node, index) => {
          const nextName = replaceSequenceTokens(formatPattern, node.name, startIndex + index, maxSequenceNumber, padLength);
          if (!nextName || nextName === node.name) {
            skipped++;
            return;
          }
          node.name = nextName;
          renamed++;
        });

        figma.ui.postMessage({ type: 'local-sequential-naming-result', renamed, skipped, total: targets.length });
        figma.ui.postMessage({ type: 'selection-info', data: buildSelectionInfoPayload(figma.currentPage.selection) });
      } catch (error) {
        console.error('local-sequential-naming failed', error);
        figma.ui.postMessage({ type: 'error', message: `Sequential naming failed: ${(error as Error)?.message || 'Unknown error'}` });
      }
      break;
    }

    case 'local-prefix-suffix-naming': {
      try {
        if (selection.length === 0) {
          figma.ui.postMessage({ type: 'error', message: 'Please select at least one layer to rename.' });
          break;
        }

        const prefix = msg.prefix || '';
        const suffix = msg.suffix || '';
        const startIndex = typeof msg.startIndex === 'number' ? msg.startIndex : 1;
        const padLength = typeof msg.padLength === 'number' ? msg.padLength : 0;
        const keepSpacing = msg.keepSpacing === true;
        const targets = selection.filter(isRenameableSceneNode);
        const maxSequenceNumber = startIndex + Math.max(targets.length - 1, 0);

        let renamed = 0;
        let skipped = 0;

        targets.forEach((node, index) => {
          const nextName = buildAffixedString(node.name, prefix, suffix, startIndex + index, maxSequenceNumber, padLength, keepSpacing);
          if (!nextName || nextName === node.name) {
            skipped++;
            return;
          }
          node.name = nextName;
          renamed++;
        });

        figma.ui.postMessage({ type: 'local-prefix-suffix-naming-result', renamed, skipped, total: targets.length });
        figma.ui.postMessage({ type: 'selection-info', data: buildSelectionInfoPayload(figma.currentPage.selection) });
      } catch (error) {
        console.error('local-prefix-suffix-naming failed', error);
        figma.ui.postMessage({ type: 'error', message: `Prefix/suffix naming failed: ${(error as Error)?.message || 'Unknown error'}` });
      }
      break;
    }

    case 'local-clean-up-names': {
      try {
        if (selection.length === 0) {
          figma.ui.postMessage({ type: 'error', message: 'Please select at least one layer to rename.' });
          break;
        }

        const targets = selection.filter(isRenameableSceneNode);
        let renamed = 0;
        let skipped = 0;

        targets.forEach((node) => {
          const nextName = cleanUpLayerName(node.name);
          if (!nextName || nextName === node.name) {
            skipped++;
            return;
          }
          node.name = nextName;
          renamed++;
        });

        figma.ui.postMessage({ type: 'local-clean-up-names-result', renamed, skipped, total: targets.length });
        figma.ui.postMessage({ type: 'selection-info', data: buildSelectionInfoPayload(figma.currentPage.selection) });
      } catch (error) {
        console.error('local-clean-up-names failed', error);
        figma.ui.postMessage({ type: 'error', message: `Clean up names failed: ${(error as Error)?.message || 'Unknown error'}` });
      }
      break;
    }

    case 'local-format-sequencer': {
      try {
        if (selection.length === 0) {
          figma.ui.postMessage({ type: 'error', message: 'Please select at least one text layer.' });
          break;
        }

        const formatPattern = msg.formatPattern || 'Item {n}';
        const startIndex = typeof msg.startIndex === 'number' ? msg.startIndex : 1;
        const order = msg.order || 'zOrder';
        const targets = sortSceneNodesByOrder(selection, order);
        const maxSequenceNumber = startIndex + Math.max(targets.length - 1, 0);

        let updated = 0;
        let skipped = 0;
        let failed = 0;

        for (let index = 0; index < targets.length; index++) {
          const node = targets[index];
          const target = await resolveEditableTextTarget(node);
          if (!target) {
            skipped++;
            continue;
          }

          const original = getEditableTextTargetContent(target);
          const nextText = replaceSequenceTokens(formatPattern, original, startIndex + index, maxSequenceNumber);
          if (nextText === original) {
            skipped++;
            continue;
          }

          try {
            await setEditableTextTargetContent(target, nextText);
            updated++;
          } catch (error) {
            console.error('local-format-sequencer failed for node', node.id, error);
            failed++;
          }
        }

        figma.ui.postMessage({ type: 'local-format-sequencer-result', updated, skipped, failed, total: targets.length });
      } catch (error) {
        console.error('local-format-sequencer failed', error);
        figma.ui.postMessage({ type: 'error', message: `Format sequencer failed: ${(error as Error)?.message || 'Unknown error'}` });
      }
      break;
    }

    case 'local-add-prefix-suffix-text': {
      try {
        if (selection.length === 0) {
          figma.ui.postMessage({ type: 'error', message: 'Please select at least one text layer.' });
          break;
        }

        const prefix = msg.prefix || '';
        const suffix = msg.suffix || '';
        let updated = 0;
        let skipped = 0;
        let failed = 0;

        for (const node of selection) {
          const target = await resolveEditableTextTarget(node);
          if (!target) {
            skipped++;
            continue;
          }

          const original = getEditableTextTargetContent(target);
          const nextText = `${prefix}${original}${suffix}`;
          if (nextText === original) {
            skipped++;
            continue;
          }

          try {
            await setEditableTextTargetContent(target, nextText);
            updated++;
          } catch (error) {
            console.error('local-add-prefix-suffix-text failed for node', node.id, error);
            failed++;
          }
        }

        figma.ui.postMessage({ type: 'local-add-prefix-suffix-text-result', updated, skipped, failed, total: selection.length });
      } catch (error) {
        console.error('local-add-prefix-suffix-text failed', error);
        figma.ui.postMessage({ type: 'error', message: `Add prefix/suffix failed: ${(error as Error)?.message || 'Unknown error'}` });
      }
      break;
    }

    // ============================================
    // 縦書き / Vertical Text
    // ============================================

    case 'detect-vertical-text-metadata': {
      try {
        const sel = figma.currentPage.selection;
        const results: Array<{
          isVertical: boolean;
          heightPx: number;
          columnTextCount: number;
          lineHeightPx: number;
          sourceRowCount: number;
          fontSize: number;
        }> = [];

        for (const node of sel) {
          let textNode: TextNode | null = null;
          let wrapperNode: FrameNode | null = null;

          if (node.type === 'FRAME' && node.getPluginData('fgVerticalText') === 'true') {
            wrapperNode = node as FrameNode;
            const child = wrapperNode.children.find(c => c.type === 'TEXT' && c.getPluginData('fgVerticalText') === 'true');
            if (child) textNode = child as TextNode;
          } else if (node.type === 'TEXT' && node.getPluginData('fgVerticalText') === 'true') {
            textNode = node as TextNode;
            const p = node.parent;
            if (p && p.type === 'FRAME' && p.getPluginData('fgVerticalText') === 'true') {
              wrapperNode = p as FrameNode;
            }
          } else if (node.type === 'TEXT') {
            textNode = node as TextNode;
          }

          if (!textNode) {
            results.push({ isVertical: false, heightPx: 0, columnTextCount: 0, lineHeightPx: 0, sourceRowCount: 0, fontSize: 0 });
            continue;
          }

          const isVertical = textNode.getPluginData('fgVerticalText') === 'true';
          const fontSize = typeof textNode.fontSize === 'number' ? textNode.fontSize : 16;

          if (isVertical) {
            results.push({
              isVertical: true,
              heightPx: parseFloat(textNode.getPluginData('fgVerticalTextHeightPx') || '0'),
              columnTextCount: parseInt(textNode.getPluginData('fgVerticalTextColumnTextCount') || '0', 10),
              lineHeightPx: parseFloat(textNode.getPluginData('fgVerticalTextLineHeightPx') || '0'),
              sourceRowCount: parseInt(textNode.getPluginData('fgVerticalTextSourceRowCount') || '0', 10),
              fontSize,
            });
          } else {
            results.push({ isVertical: false, heightPx: 0, columnTextCount: 0, lineHeightPx: 0, sourceRowCount: 0, fontSize });
          }
        }

        figma.ui.postMessage({ type: 'detect-vertical-text-metadata-result', results });
      } catch (error) {
        console.error('detect-vertical-text-metadata failed', error);
        figma.ui.postMessage({ type: 'detect-vertical-text-metadata-result', results: [] });
      }
      break;
    }

    case 'local-verticalize-text': {
      try {
        if (selection.length === 0) {
          figma.ui.postMessage({ type: 'error', message: 'Verticalize text failed: Please select at least one text layer.' });
          break;
        }

        const reqHeightPx = typeof (msg as any).heightPx === 'number' ? (msg as any).heightPx : 0;
        const reqColumnTextCount = typeof (msg as any).columnTextCount === 'number' ? (msg as any).columnTextCount : 0;
        const reqLineHeightPx = typeof (msg as any).lineHeightPx === 'number' ? (msg as any).lineHeightPx : 0;

        let updated = 0;
        let skipped = 0;
        let failed = 0;

        for (const node of selection) {
          let textNode: TextNode | null = null;
          let wrapperNode: FrameNode | null = null;
          let isRerun = false;

          if (node.type === 'FRAME' && node.getPluginData('fgVerticalText') === 'true') {
            wrapperNode = node as FrameNode;
            const child = wrapperNode.children.find(c => c.type === 'TEXT' && c.getPluginData('fgVerticalText') === 'true');
            if (child) { textNode = child as TextNode; isRerun = true; }
          } else if (node.type === 'TEXT' && node.getPluginData('fgVerticalText') === 'true') {
            textNode = node as TextNode;
            isRerun = true;
            const p = node.parent;
            if (p && p.type === 'FRAME' && p.getPluginData('fgVerticalText') === 'true') {
              wrapperNode = p as FrameNode;
            }
          } else if (node.type === 'TEXT') {
            textNode = node as TextNode;
          }

          if (!textNode) {
            skipped++;
            continue;
          }

          try {
            await loadAllFontsForTextNode(textNode);

            const baseFontSize = typeof textNode.fontSize === 'number' ? textNode.fontSize : 16;
            const baseFontName = typeof textNode.fontName !== 'symbol' ? textNode.fontName : { family: "Inter", style: "Regular" };
            let baseFills = textNode.fills;
            if (typeof baseFills === 'symbol') baseFills = [{ type: 'SOLID', color: { r: 0, g: 0, b: 0 } }];

            // Determine the original line height before conversion (for wrapper padding)
            let originalLineHeight = baseFontSize * 1.2;
            if (typeof textNode.lineHeight !== 'symbol' && textNode.lineHeight.unit === 'PIXELS') {
              originalLineHeight = textNode.lineHeight.value;
            } else if (typeof textNode.lineHeight !== 'symbol' && textNode.lineHeight.unit === 'PERCENT') {
              originalLineHeight = baseFontSize * (textNode.lineHeight.value / 100);
            }

            // --- Get source text ---
            let sourceText: string;
            if (isRerun) {
              const stored = textNode.getPluginData('fgVerticalTextOriginalContent')
                || (wrapperNode ? wrapperNode.getPluginData('fgVerticalTextOriginalContent') : '');
              sourceText = stored || textNode.characters;
            } else {
              sourceText = textNode.characters;
            }

            // --- Measure source rows using the ruby/wrapping measurement approach ---
            await smartLoadFont(baseFontName);
            const measurementNode = figma.createText();
            measurementNode.visible = false;
            measurementNode.fontName = baseFontName;
            measurementNode.fontSize = baseFontSize;
            if (typeof textNode.letterSpacing !== 'symbol') {
              measurementNode.letterSpacing = textNode.letterSpacing as LetterSpacing;
            }
            figma.currentPage.appendChild(measurementNode);
            const measureWidth = (text: string): number => {
              measurementNode.characters = text || '';
              return measurementNode.width;
            };

            // Determine wrapping width from the *original* text layout (before verticalization)
            let maxLineWidth = Infinity;
            if (!isRerun) {
              const autoResizeMode = textNode.textAutoResize || 'NONE';
              if (autoResizeMode === 'HEIGHT' || autoResizeMode === 'NONE') {
                maxLineWidth = textNode.width;
              }
            }

            const lineTexts: string[] = [''];
            let lineIdx = 0;
            const wrapTolerance = 0.5;

            for (let i = 0; i < sourceText.length; i++) {
              const ch = sourceText[i];
              if (ch === '\n') {
                lineIdx++;
                lineTexts[lineIdx] = '';
                continue;
              }
              if (maxLineWidth !== Infinity) {
                const prospectiveText = lineTexts[lineIdx] + ch;
                const prospectiveWidth = measureWidth(prospectiveText);
                if (prospectiveWidth > maxLineWidth + wrapTolerance && lineTexts[lineIdx].length > 0) {
                  lineIdx++;
                  lineTexts[lineIdx] = ch;
                } else {
                  lineTexts[lineIdx] = prospectiveText;
                }
              } else {
                lineTexts[lineIdx] = (lineTexts[lineIdx] || '') + ch;
              }
            }

            measurementNode.remove();

            const sourceRowCount = lineTexts.length;

            // --- Resolve effective parameters ---
            const effectiveLineHeight = reqLineHeightPx > 0 ? reqLineHeightPx : Math.round(baseFontSize * 1.1 * 10) / 10;
            const effectiveColumnCount = reqColumnTextCount > 0 ? reqColumnTextCount : sourceRowCount;
            const effectiveHeight = reqHeightPx > 0 ? reqHeightPx : effectiveColumnCount * effectiveLineHeight;

            // --- Build columns from source rows ---
            const columns: string[] = [];
            for (let c = 0; c < effectiveColumnCount; c++) {
              if (c < sourceRowCount) {
                if (c === effectiveColumnCount - 1 && effectiveColumnCount < sourceRowCount) {
                  columns.push(lineTexts.slice(c).join(''));
                } else {
                  columns.push(lineTexts[c] || '');
                }
              } else {
                columns.push('');
              }
            }

            // Convert each column into vertical text (characters joined by \n)
            const verticalColumnTexts: string[] = columns.map(col => {
              const chars = Array.from(col);
              return chars.join('\n');
            });

            // --- Helper to apply vertical style to a text node ---
            const applyVerticalStyle = (tn: TextNode, content: string) => {
              tn.characters = content;
              tn.textAlignHorizontal = 'CENTER';
              tn.lineHeight = { value: effectiveLineHeight, unit: 'PIXELS' };
              tn.textAutoResize = 'HEIGHT';
              tn.resize(0.01, tn.height);
            };

            // --- Create or update wrapper ---
            if (!isRerun || !wrapperNode) {
              const parent = textNode.parent;
              if (!parent || !('insertChild' in parent)) {
                failed++;
                continue;
              }

              const textIdx = parent.children.indexOf(textNode);
              const textX = textNode.x;
              const textY = textNode.y;

              const wrapper = figma.createFrame();
              wrapper.name = '縦書き Wrapper';
              wrapper.layoutMode = 'HORIZONTAL';
              wrapper.primaryAxisSizingMode = 'AUTO';
              wrapper.counterAxisSizingMode = 'AUTO';
              wrapper.paddingLeft = Math.round(originalLineHeight / 2);
              wrapper.paddingRight = Math.round(originalLineHeight / 2);
              wrapper.paddingTop = 0;
              wrapper.paddingBottom = 0;
              wrapper.itemSpacing = 0;
              wrapper.fills = [];
              wrapper.clipsContent = false;

              (parent as any).insertChild(textIdx, wrapper);
              wrapper.x = textX;
              wrapper.y = textY;
              wrapper.appendChild(textNode);
              wrapperNode = wrapper;
            } else {
              wrapperNode.paddingLeft = Math.round(originalLineHeight / 2);
              wrapperNode.paddingRight = Math.round(originalLineHeight / 2);

              // Remove previously created extra column text nodes
              const extras = wrapperNode.children.filter(
                c => c.type === 'TEXT' && c.getPluginData('fgVerticalTextExtra') === 'true'
              );
              for (const ex of extras) ex.remove();
            }

            // --- Apply column 1 to the original text node ---
            applyVerticalStyle(textNode, verticalColumnTexts[0] || '');

            // --- Create additional text nodes for columns 2+ ---
            for (let c = 1; c < verticalColumnTexts.length; c++) {
              const colText = verticalColumnTexts[c];
              if (!colText) continue;

              const colNode = figma.createText();
              colNode.fontName = baseFontName;
              colNode.fontSize = baseFontSize;
              colNode.fills = baseFills as Paint[];
              if (typeof textNode.letterSpacing !== 'symbol') {
                colNode.letterSpacing = textNode.letterSpacing as LetterSpacing;
              }
              applyVerticalStyle(colNode, colText);
              colNode.setPluginData('fgVerticalText', 'true');
              colNode.setPluginData('fgVerticalTextExtra', 'true');
              wrapperNode.appendChild(colNode);
            }

            // --- Store plugin data ---
            const pluginData: Record<string, string> = {
              'fgVerticalText': 'true',
              'fgVerticalTextVersion': '1',
              'fgVerticalTextWrapperId': wrapperNode.id,
              'fgVerticalTextOriginalContent': sourceText,
              'fgVerticalTextSourceRowCount': String(sourceRowCount),
              'fgVerticalTextColumnTextCount': String(effectiveColumnCount),
              'fgVerticalTextLineHeightPx': String(effectiveLineHeight),
              'fgVerticalTextHeightPx': String(effectiveHeight),
            };

            for (const [key, val] of Object.entries(pluginData)) {
              textNode.setPluginData(key, val);
              wrapperNode.setPluginData(key, val);
            }

            updated++;
          } catch (nodeError) {
            console.error('local-verticalize-text failed for node', node.id, nodeError);
            failed++;
          }
        }

        figma.ui.postMessage({
          type: 'local-verticalize-text-result',
          updated,
          skipped,
          failed,
          total: selection.length
        });
      } catch (error) {
        console.error('local-verticalize-text failed', error);
        figma.ui.postMessage({ type: 'error', message: `Verticalize text failed: ${(error as Error)?.message || 'Unknown error'}` });
      }
      break;
    }

    // ============================================
    // Intent-Based Context System - Context Lock
    // ============================================

    case 'get-context-lock': {
      // Step 0: Capture current selection snapshot for context locking
      // This ensures the AI operates on the original selection even if user changes it
      try {
        const contextLock = captureCurrentContextLock();
        figma.ui.postMessage({
          type: 'context-lock-result',
          data: contextLock
        });
      } catch (error) {
        console.error('get-context-lock failed:', error);
        figma.ui.postMessage({
          type: 'context-lock-result',
          data: { pageId: figma.currentPage.id, nodeIds: [], metadata: [], timestamp: Date.now() },
          error: error instanceof Error ? error.message : String(error)
        });
      }
      break;
    }

    case 'get-selection-data-by-ids': {
      // Get selection data for specific node IDs (used with context lock)
      try {
        const nodeIds = (msg as any).nodeIds as string[];
        const allowEmpty = (msg as any).allowEmpty === true;
        const includeTokens = (msg as any).includeTokens === true;
        const contextMode = (msg as any).contextMode || 'all';

        // Get nodes by ID (use async version for dynamic-page access)
        const nodes: SceneNode[] = [];
        for (const id of nodeIds) {
          const node = await figma.getNodeByIdAsync(id);
          if (node && 'type' in node && node.type !== 'PAGE' && node.type !== 'DOCUMENT') {
            nodes.push(node as SceneNode);
          }
        }

        if (nodes.length === 0 && !allowEmpty) {
          figma.ui.postMessage({ type: 'error', message: 'Locked nodes no longer exist' });
          return;
        }

        // Use the same serialization logic as get-selection-data
        const LARGE_SELECTION_THRESHOLD = 200;
        const HUGE_SELECTION_THRESHOLD = 500;

        const { count: nodeCount, exceeded: isHugeSelection } = countVisibleNodes(nodes, true, HUGE_SELECTION_THRESHOLD);
        const isLargeSelection = nodeCount > LARGE_SELECTION_THRESHOLD;

        if (isHugeSelection && contextMode !== 'pillOnly') {
          const pillResults = await serializeSelection(nodes, true, 'pillOnly');
          figma.ui.postMessage({
            type: 'selection-data',
            data: pillResults.data,
            dataSize: pillResults.dataSize,
            flattened: pillResults.flattened,
            tokenContext: undefined,
            nodeCount,
            requiresFallback: true,
            fromLockedContext: true
          });
          return;
        }

        const tokenContextOptions: TokenContextOptions = {
          skipLibraryVariables: isLargeSelection,
          skipStyles: false
        };

        const [selectionResults, tokenContext] = await Promise.all([
          serializeSelection(nodes, true, contextMode),
          includeTokens ? buildTokenContext(tokenContextOptions) : Promise.resolve(undefined)
        ]);

        figma.ui.postMessage({
          type: 'selection-data',
          data: selectionResults.data,
          dataSize: selectionResults.dataSize,
          flattened: selectionResults.flattened,
          tokenContext,
          nodeCount,
          skippedLibraryVariables: isLargeSelection,
          fromLockedContext: true
        });
      } catch (error) {
        console.error('get-selection-data-by-ids failed:', error);
        figma.ui.postMessage({
          type: 'error',
          message: 'Failed to get selection data for locked nodes: ' + (error instanceof Error ? error.message : String(error))
        });
      }
      break;
    }

    // ============================================
    // End Intent-Based Context System
    // ============================================

    case 'get-selection-data': {
      try {
        // Allow empty selection for noSelection actions
        const allowEmpty = (msg as any).allowEmpty === true;
        const includeTokens = (msg as any).includeTokens === true;
        const contextMode = (msg as any).contextMode || 'all';

        if (selection.length === 0 && !allowEmpty) {
          figma.ui.postMessage({ type: 'error', message: 'Please select at least one element' });
          return;
        }

        // Thresholds for optimization decisions
        const LARGE_SELECTION_THRESHOLD = 200;  // nodes - trigger optimizations
        const HUGE_SELECTION_THRESHOLD = 500;   // nodes - trigger immediate fallback

        // Pre-flight node count check (fast, synchronous)
        const { count: nodeCount, exceeded: isHugeSelection } = countVisibleNodes(selection, true, HUGE_SELECTION_THRESHOLD);
        const isLargeSelection = nodeCount > LARGE_SELECTION_THRESHOLD;

        // For huge selections, return immediately with fallback flag
        if (isHugeSelection && contextMode !== 'pillOnly') {
          console.log(`Pre-flight check: ${nodeCount}+ nodes detected, triggering immediate fallback`);

          // Only do pillOnly serialization for minimal data
          const pillResults = await serializeSelection(selection, true, 'pillOnly');

          figma.ui.postMessage({
            type: 'selection-data',
            data: pillResults.data,
            dataSize: pillResults.dataSize,
            flattened: pillResults.flattened,
            tokenContext: undefined,
            selectionImage: undefined,
            detectedLanguage: undefined,
            nodeCount,
            requiresFallback: true  // Signal to UI that fallback is needed
          });
          return;
        }

        // Determine token context options based on selection size
        const tokenContextOptions: TokenContextOptions = {
          skipLibraryVariables: isLargeSelection,  // Skip slow library imports for large selections
          skipStyles: false  // Styles are fast, always include
        };

        // Automatic selection image export removed as per UI changes
        const selectionImage: { name: string, data: number[] } | undefined = undefined;

        // Run serialization and token context building in parallel
        const [selectionResults, tokenContext] = await Promise.all([
          serializeSelection(selection, true, contextMode),
          includeTokens ? buildTokenContext(tokenContextOptions) : Promise.resolve(undefined)
        ]);

        const { data, dataSize, flattened } = selectionResults;

        // Detect dominant language from selected text
        let allText = '';
        const collectText = (nodes: any[]) => {
          for (const node of nodes) {
            if (node.characters) allText += node.characters + ' ';
            if (node.children) collectText(node.children);
          }
        };
        collectText(data);

        const detectedLanguage = detectLanguage(allText);

        figma.ui.postMessage({
          type: 'selection-data',
          data,
          dataSize,
          flattened,
          tokenContext,
          selectionImage,
          detectedLanguage,
          nodeCount,
          skippedLibraryVariables: isLargeSelection  // Inform UI that library vars were skipped
        });
      } catch (error) {
        console.error('get-selection-data failed:', error);
        figma.ui.postMessage({ type: 'error', message: 'Failed to collect selection data: ' + (error instanceof Error ? error.message : String(error)) });
      }
      break;
    }

    case 'getLocalStyles': {
      try {
        const paintStyles = await figma.getLocalPaintStylesAsync();
        const textStyles = await figma.getLocalTextStylesAsync();
        const effectStyles = await figma.getLocalEffectStylesAsync();
        const gridStyles = await figma.getLocalGridStylesAsync();

        // Get variables and collections
        let serializedVariables: any[] = [];
        let serializedCollections: any[] = [];
        if (figma.variables && typeof figma.variables.getLocalVariablesAsync === 'function') {
          try {
            const variables = await figma.variables.getLocalVariablesAsync();
            const collections = await figma.variables.getLocalVariableCollectionsAsync();

            const serialized = serializeVariablesForDisplay(variables, collections);
            serializedVariables = serialized.serializedVariables;
            serializedCollections = serialized.serializedCollections;
          } catch (varError) {
            console.warn('Variables not available', varError);
          }
        }

        // Serialize the styles for the UI
        const serializedPaintStyles = paintStyles.map(s => ({
          id: s.id,
          name: s.name,
          type: 'paint',
          paints: s.paints ? s.paints.slice(0, 1).map(p => {
            if (p.type === 'SOLID') {
              return {
                type: 'SOLID',
                color: { r: p.color.r, g: p.color.g, b: p.color.b, a: 'opacity' in p ? (p as any).opacity ?? 1 : 1 }
              };
            }
            return { type: p.type };
          }) : []
        }));

        const serializedTextStyles = textStyles.map(s => ({
          id: s.id,
          name: s.name,
          type: 'text',
          fontFamily: s.fontName?.family,
          fontStyle: s.fontName?.style,
          fontSize: s.fontSize,
          lineHeight: s.lineHeight,
          letterSpacing: s.letterSpacing
        }));

        const serializedEffectStyles = effectStyles.map(s => ({
          id: s.id,
          name: s.name,
          type: 'effect',
          effects: s.effects ? s.effects.slice(0, 1).map(e => ({ type: e.type })) : []
        }));

        const serializedGridStyles = gridStyles.map(s => ({
          id: s.id,
          name: s.name,
          type: 'grid',
          layoutGrids: s.layoutGrids ? s.layoutGrids.map(g => ({ pattern: g.pattern })) : []
        }));

        figma.ui.postMessage({
          type: 'local-styles',
          paintStyles: serializedPaintStyles,
          textStyles: serializedTextStyles,
          effectStyles: serializedEffectStyles,
          gridStyles: serializedGridStyles,
          variables: serializedVariables,
          collections: serializedCollections
        });
      } catch (error) {
        console.error('getLocalStyles failed', error);
        figma.ui.postMessage({ type: 'error', message: 'Failed to load local styles' });
      }
      break;
    }

    case 'import-icons-batch': {
      const { icons, config } = msg as unknown as { icons: { id: string, svg: string }[], config: any };
      const { size, color, importMode, categoryName, batchIndex, isFirstBatch } = config;

      const STYLE_KEYWORDS = [
        'bold-duotone', 'line-duotone', 'duotone-line', 'round-corners', 'sharp-edges',
        'outline', 'line', 'remix', 'linear', 'filled', 'fill', 'solid', 'duotone',
        'glyph', 'isometric', 'broken', 'bold'
      ];

      const sortedKeywords = [...STYLE_KEYWORDS].sort((a, b) => b.length - a.length);

      try {
        const nodes: SceneNode[] = [];
        const gap = 40;

        // Calculate positioning based on batch index
        const batchOffsetY = batchIndex * 200; // Space batches vertically
        const startX = figma.viewport.center.x;
        const startY = figma.viewport.center.y + batchOffsetY;

        if (importMode === 'componentSet') {
          if (isFirstBatch) {
            activeComponentSet = null;
          }

          const batchComponents: ComponentNode[] = [];

          // Create all components for this batch
          icons.forEach(icon => {
            const fullName = icon.id.split(':').pop() || icon.id;
            let category = categoryName || 'Regular';
            let iconName = fullName;

            for (const keyword of sortedKeywords) {
              if (fullName.endsWith(`-${keyword}`)) {
                category = keyword.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
                iconName = fullName.slice(0, -(keyword.length + 1));
                break;
              }
            }

            const svgNode = figma.createNodeFromSvg(icon.svg);
            const comp = figma.createComponent();
            comp.resize(size, size);
            comp.name = `Category=${category}, Icon Name=${iconName}`;

            const offsetX = (size - svgNode.width) / 2;
            const offsetY = (size - svgNode.height) / 2;
            const children = [...svgNode.children];
            for (const child of children) {
              comp.appendChild(child);
              child.x += offsetX;
              child.y += offsetY;
            }
            svgNode.remove();
            batchComponents.push(comp);
          });

          if (batchComponents.length > 0) {
            if (!activeComponentSet || activeComponentSet.removed) {
              // Create the initial component set
              activeComponentSet = figma.combineAsVariants(batchComponents, figma.currentPage);
              activeComponentSet.name = config.collectionName || 'Icon Library';

              // Calculate optimal width for ~3:4 aspect ratio
              const estimatedColumns = Math.max(3, Math.min(12, Math.ceil(Math.sqrt(icons.length * 1.333))));
              const fixedWidth = Math.max(200, estimatedColumns * (size + gap) - gap);

              // Apply horizontal auto-layout with wrap and fixed width
              if ('layoutMode' in activeComponentSet) {
                (activeComponentSet as any).layoutMode = 'HORIZONTAL';
                (activeComponentSet as any).layoutWrap = 'WRAP';
                (activeComponentSet as any).itemSpacing = gap;
                (activeComponentSet as any).counterAxisSpacing = gap;
                (activeComponentSet as any).primaryAxisSizingMode = 'FIXED';
                (activeComponentSet as any).counterAxisSizingMode = 'AUTO';
                (activeComponentSet as any).resize(fixedWidth, activeComponentSet.height);
                (activeComponentSet as any).paddingLeft = 0;
                (activeComponentSet as any).paddingRight = 0;
                (activeComponentSet as any).paddingTop = 0;
                (activeComponentSet as any).paddingBottom = 0;
              }

              // Position the component set at the viewport center
              activeComponentSet.x = figma.viewport.center.x - (activeComponentSet.width / 2);
              activeComponentSet.y = figma.viewport.center.y - (activeComponentSet.height / 2);

              nodes.push(activeComponentSet);
            } else {
              // Add to existing component set
              batchComponents.forEach(comp => {
                activeComponentSet!.appendChild(comp);
              });
              nodes.push(activeComponentSet);
            }
          }
        } else {
          icons.forEach((icon, idx) => {
            const svgNode = figma.createNodeFromSvg(icon.svg);
            const fullIconName = icon.id.split(':').pop() || icon.id;

            // For individual components: style/baseName format
            let componentName = fullIconName;
            if (importMode === 'component') {
              let baseName = fullIconName;
              let style = 'Regular';

              for (const keyword of sortedKeywords) {
                if (fullIconName.endsWith(`-${keyword}`)) {
                  style = keyword;
                  baseName = fullIconName.slice(0, -(keyword.length + 1));
                  break;
                }
              }

              componentName = `${style}/${baseName}`;
            }

            const columns = Math.ceil(Math.sqrt(icons.length));
            const col = idx % columns;
            const row = Math.floor(idx / columns);

            const x = startX + col * (size + gap);
            const y = startY + row * (size + gap);

            if (importMode === 'component') {
              const comp = figma.createComponent();
              comp.resize(size, size);
              comp.name = componentName;
              comp.x = x;
              comp.y = y;

              const offsetX = (size - svgNode.width) / 2;
              const offsetY = (size - svgNode.height) / 2;
              const children = [...svgNode.children];
              for (const child of children) {
                comp.appendChild(child);
                child.x += offsetX;
                child.y += offsetY;
              }
              svgNode.remove();

              nodes.push(comp);
            } else {
              // Frame - use the same naming as components
              const frame = figma.createFrame();
              frame.resize(size, size);
              frame.name = componentName;
              frame.x = x;
              frame.y = y;
              frame.fills = []; // Transparent background

              const offsetX = (size - svgNode.width) / 2;
              const offsetY = (size - svgNode.height) / 2;
              const children = [...svgNode.children];
              for (const child of children) {
                frame.appendChild(child);
                child.x += offsetX;
                child.y += offsetY;
              }
              svgNode.remove();

              nodes.push(frame);
            }
          });
        }

        figma.currentPage.selection = nodes;
        figma.viewport.scrollAndZoomIntoView(nodes);
        figma.ui.postMessage({ type: 'success', message: `Imported ${icons.length} icons.` });
      } catch (error) {
        console.error('Batch import failed:', error);
        figma.ui.postMessage({ type: 'error', message: 'Failed to import icons.' });
      }
      break;
    }

    case 'get-variable-collections': {
      try {
        if (figma.variables && typeof figma.variables.getLocalVariableCollectionsAsync === 'function') {
          const collections = await figma.variables.getLocalVariableCollectionsAsync();
          const collectionList = collections.map(collection => ({
            id: collection.id,
            name: collection.name
          }));
          figma.ui.postMessage({ type: 'variable-collections-list', collections: collectionList });
        } else {
          figma.ui.postMessage({ type: 'variable-collections-list', collections: [] });
        }
      } catch (error) {
        console.error('get-variable-collections failed', error);
        figma.ui.postMessage({ type: 'variable-collections-list', collections: [] });
      }
      break;
    }

    case 'get-selection-dimensions': {
      if (selection.length === 0) {
        figma.ui.postMessage({ type: 'error', message: 'Please select at least one element' });
        return;
      }

      const node = selection[0];
      const width = 'width' in node ? Math.round(node.width) : 0;
      const height = 'height' in node ? Math.round(node.height) : 0;
      figma.ui.postMessage({ type: 'selection-dimensions', data: { width, height } });
      break;
    }

    case 'get-selection-bounding-box': {
      if (selection.length === 0) {
        figma.ui.postMessage({ type: 'selection-bounding-box', width: null, height: null });
        break;
      }
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      for (const node of selection) {
        const t = node.absoluteTransform;
        const w = 'width' in node ? node.width : 0;
        const h = 'height' in node ? node.height : 0;
        const corners: [number, number][] = [[0, 0], [w, 0], [w, h], [0, h]];
        for (const [lx, ly] of corners) {
          const gx = t[0][0] * lx + t[0][1] * ly + t[0][2];
          const gy = t[1][0] * lx + t[1][1] * ly + t[1][2];
          minX = Math.min(minX, gx);
          minY = Math.min(minY, gy);
          maxX = Math.max(maxX, gx);
          maxY = Math.max(maxY, gy);
        }
      }
      const width = Math.round(maxX - minX);
      const height = Math.round(maxY - minY);
      figma.ui.postMessage({ type: 'selection-bounding-box', width, height });
      break;
    }

    case 'extract-design-system': {
      try {
        const source: string = (msg as any).source || 'selection';
        const categories: string[] = (msg as any).categories || ['colors', 'typography', 'components', 'effects', 'spacing'];

        let rootNodes: readonly SceneNode[] = [];
        if (source === 'selection') {
          rootNodes = figma.currentPage.selection;
          if (rootNodes.length === 0) {
            figma.ui.postMessage({ type: 'error', message: 'Please select at least one element' });
            break;
          }
        } else if (source === 'page') {
          rootNodes = figma.currentPage.children;
        } else if (source === 'file') {
          const allNodes: SceneNode[] = [];
          for (const page of figma.root.children) {
            for (const child of page.children) {
              allNodes.push(child);
            }
          }
          rootNodes = allNodes;
        }

        const data: any = {};

        // Collect raw values from node tree
        const rawColors: Map<string, { hex: string, count: number, r: number, g: number, b: number }> = new Map();
        const rawGradients: any[] = [];
        const rawFontStyles: Map<string, any> = new Map();
        const rawFontFamilies: Set<string> = new Set();
        const rawFontSizes: Set<number> = new Set();
        const rawFontWeights: Set<string> = new Set();
        const rawLineHeights: Set<string> = new Set();
        const rawLetterSpacings: Set<string> = new Set();
        const rawShadows: Map<string, any> = new Map();
        const rawBlurs: Map<string, any> = new Map();
        const rawBorders: Map<string, any> = new Map();
        const rawCornerRadii: Set<number> = new Set();
        const rawOpacities: Set<number> = new Set();
        const rawSpacings: Set<number> = new Set();
        const rawPaddings: Set<number> = new Set();
        const rawGridSystems: any[] = [];
        const rawComponents: Map<string, any> = new Map();

        const STRUCTURAL_NODE_TYPES = new Set(['RECTANGLE', 'TEXT', 'FRAME', 'INSTANCE', 'COMPONENT', 'COMPONENT_SET', 'SECTION', 'GROUP']);
        const ILLUSTRATION_KEYWORDS = ['illustration', 'vector', 'art', 'graphic', 'drawing', 'img', 'image', 'icon', 'logo', 'svg', 'doodle', 'sketch', 'avatar', 'hero'];

        function isInsideIllustration(node: SceneNode): boolean {
          const name = node.name.toLowerCase();
          if (ILLUSTRATION_KEYWORDS.some(k => name.includes(k))) return true;
          let p: BaseNode | null = node.parent;
          let depth = 0;
          while (p && depth < 3) {
            if ('name' in p && ILLUSTRATION_KEYWORDS.some(k => (p as any).name.toLowerCase().includes(k))) return true;
            p = p.parent;
            depth++;
          }
          return false;
        }

        function shouldCollectColor(node: SceneNode): boolean {
          const hasFillStyle = 'fillStyleId' in node && typeof (node as any).fillStyleId === 'string' && (node as any).fillStyleId.length > 0;
          const hasStrokeStyle = 'strokeStyleId' in node && typeof (node as any).strokeStyleId === 'string' && (node as any).strokeStyleId.length > 0;
          if (hasFillStyle || hasStrokeStyle) return true;
          if (!STRUCTURAL_NODE_TYPES.has(node.type)) return false;
          if (isInsideIllustration(node)) return false;
          return true;
        }

        function traverseNode(node: SceneNode) {
          const collectColor = categories.includes('colors') && shouldCollectColor(node);

          // Colors from fills
          if (collectColor && 'fills' in node && Array.isArray(node.fills)) {
            for (const fill of node.fills) {
              if (fill.visible === false) continue;
              if (fill.type === 'SOLID') {
                const hex = rgbToHex(fill.color.r, fill.color.g, fill.color.b);
                const existing = rawColors.get(hex);
                if (existing) {
                  existing.count++;
                } else {
                  rawColors.set(hex, { hex, count: 1, r: fill.color.r, g: fill.color.g, b: fill.color.b });
                }
              } else if (fill.type === 'GRADIENT_LINEAR' || fill.type === 'GRADIENT_RADIAL' || fill.type === 'GRADIENT_ANGULAR') {
                const gradPaint = fill as GradientPaint;
                const stops = gradPaint.gradientStops.map(s => ({
                  color: rgbToHex(s.color.r, s.color.g, s.color.b),
                  position: Math.round(s.position * 100) / 100
                }));
                rawGradients.push({ type: fill.type, stops });
              }
            }
          }

          // Colors from strokes
          if (collectColor && 'strokes' in node && Array.isArray(node.strokes)) {
            for (const stroke of node.strokes) {
              if (stroke.visible === false) continue;
              if (stroke.type === 'SOLID') {
                const hex = rgbToHex(stroke.color.r, stroke.color.g, stroke.color.b);
                const existing = rawColors.get(hex);
                if (existing) existing.count++;
                else rawColors.set(hex, { hex, count: 1, r: stroke.color.r, g: stroke.color.g, b: stroke.color.b });
              }
            }
          }

          // Typography from text nodes
          if (categories.includes('typography') && node.type === 'TEXT') {
            const textNode = node as TextNode;
            try {
              const segments = textNode.getStyledTextSegments(['fontName', 'fontSize', 'fontWeight', 'lineHeight', 'letterSpacing']);
              for (const seg of segments) {
                if (seg.fontName) {
                  rawFontFamilies.add(seg.fontName.family);
                  rawFontWeights.add(seg.fontName.style);
                  const key = `${seg.fontName.family}/${seg.fontName.style}/${seg.fontSize}`;
                  if (!rawFontStyles.has(key)) {
                    rawFontStyles.set(key, {
                      fontFamily: seg.fontName.family,
                      fontWeight: seg.fontName.style,
                      fontSize: seg.fontSize,
                      lineHeight: seg.lineHeight,
                      letterSpacing: seg.letterSpacing
                    });
                  }
                }
                if (seg.fontSize) rawFontSizes.add(seg.fontSize);
                if (seg.lineHeight) {
                  const lh = seg.lineHeight as any;
                  if (lh.unit === 'PIXELS') rawLineHeights.add(`${lh.value}px`);
                  else if (lh.unit === 'PERCENT') rawLineHeights.add(`${lh.value}%`);
                  else rawLineHeights.add('auto');
                }
                if (seg.letterSpacing) {
                  const ls = seg.letterSpacing as any;
                  if (ls.unit === 'PIXELS') rawLetterSpacings.add(`${ls.value}px`);
                  else if (ls.unit === 'PERCENT') rawLetterSpacings.add(`${ls.value}%`);
                }
              }
            } catch (_) { /* mixed fonts */ }
          }

          // Effects
          if (categories.includes('effects') && 'effects' in node && Array.isArray(node.effects)) {
            for (const effect of node.effects) {
              if ((effect as any).visible === false) continue;
              if (effect.type === 'DROP_SHADOW' || effect.type === 'INNER_SHADOW') {
                const s = effect as DropShadowEffect;
                const key = `${s.offset?.x || 0},${s.offset?.y || 0},${s.radius},${s.spread || 0}`;
                if (!rawShadows.has(key)) {
                  const color = s.color ? `rgba(${Math.round(s.color.r * 255)},${Math.round(s.color.g * 255)},${Math.round(s.color.b * 255)},${Math.round((s.color.a || 1) * 100) / 100})` : 'rgba(0,0,0,0.1)';
                  rawShadows.set(key, {
                    type: effect.type,
                    value: `${s.offset?.x || 0}px ${s.offset?.y || 0}px ${s.radius}px ${s.spread || 0}px ${color}`,
                    offsetX: s.offset?.x || 0,
                    offsetY: s.offset?.y || 0,
                    blur: s.radius,
                    spread: s.spread || 0,
                    color
                  });
                }
              } else if (effect.type === 'LAYER_BLUR' || effect.type === 'BACKGROUND_BLUR') {
                const b = effect as BlurEffect;
                const key = `${effect.type}-${b.radius}`;
                if (!rawBlurs.has(key)) {
                  rawBlurs.set(key, { type: effect.type, radius: b.radius });
                }
              }
            }
          }

          // Corner radii
          if (categories.includes('effects') && 'cornerRadius' in node) {
            const cr = (node as any).cornerRadius;
            if (typeof cr === 'number' && cr > 0) rawCornerRadii.add(cr);
          }

          // Opacity
          if (categories.includes('effects') && 'opacity' in node) {
            const op = (node as any).opacity;
            if (typeof op === 'number' && op < 1 && op > 0) {
              rawOpacities.add(Math.round(op * 100) / 100);
            }
          }

          // Borders (stroke weight)
          if (categories.includes('effects') && 'strokeWeight' in node) {
            const sw = (node as any).strokeWeight;
            if (typeof sw === 'number' && sw > 0) {
              const strokeColor = ('strokes' in node && Array.isArray(node.strokes) && node.strokes.length > 0 && node.strokes[0].type === 'SOLID')
                ? rgbToHex((node.strokes[0] as SolidPaint).color.r, (node.strokes[0] as SolidPaint).color.g, (node.strokes[0] as SolidPaint).color.b)
                : '#000000';
              const key = `${sw}-${strokeColor}`;
              if (!rawBorders.has(key)) {
                rawBorders.set(key, { width: sw, color: strokeColor });
              }
            }
          }

          // Spacing from auto-layout
          if (categories.includes('spacing') && 'layoutMode' in node && (node as any).layoutMode !== 'NONE') {
            const frame = node as FrameNode;
            if (frame.itemSpacing > 0) rawSpacings.add(frame.itemSpacing);
            if (frame.paddingTop > 0) rawPaddings.add(frame.paddingTop);
            if (frame.paddingBottom > 0) rawPaddings.add(frame.paddingBottom);
            if (frame.paddingLeft > 0) rawPaddings.add(frame.paddingLeft);
            if (frame.paddingRight > 0) rawPaddings.add(frame.paddingRight);
          }

          // Grid systems
          if (categories.includes('spacing') && 'layoutGrids' in node && Array.isArray((node as any).layoutGrids)) {
            for (const grid of (node as any).layoutGrids) {
              if (grid.pattern === 'COLUMNS' || grid.pattern === 'ROWS') {
                rawGridSystems.push({
                  pattern: grid.pattern,
                  count: grid.count,
                  gutterSize: grid.gutterSize,
                  offset: grid.offset,
                  alignment: grid.alignment
                });
              }
            }
          }

          // Components
          if (categories.includes('components') && (node.type === 'COMPONENT' || node.type === 'COMPONENT_SET')) {
            const compNode = node as ComponentNode | ComponentSetNode;
            const info: any = { name: compNode.name, type: node.type, variants: [] };
            if (node.type === 'COMPONENT_SET') {
              const cs = node as ComponentSetNode;
              info.variants = cs.children.map(c => c.name);
              try {
                info.properties = (cs as any).componentPropertyDefinitions ? Object.keys((cs as any).componentPropertyDefinitions) : [];
              } catch (_) { }
            } else {
              try {
                info.properties = (compNode as any).componentPropertyDefinitions ? Object.keys((compNode as any).componentPropertyDefinitions) : [];
              } catch (_) { }
            }
            rawComponents.set(compNode.name, info);
          }

          // Also check instances for component references
          if (categories.includes('components') && node.type === 'INSTANCE') {
            const inst = node as InstanceNode;
            const mainComp = inst.mainComponent;
            if (mainComp && !rawComponents.has(mainComp.name)) {
              const info: any = { name: mainComp.name, type: 'COMPONENT (referenced)', variants: [] };
              if (mainComp.parent && mainComp.parent.type === 'COMPONENT_SET') {
                info.variants = (mainComp.parent as ComponentSetNode).children.map(c => c.name);
              }
              rawComponents.set(mainComp.name, info);
            }
          }

          // Recurse
          if ('children' in node) {
            for (const child of (node as any).children) {
              traverseNode(child);
            }
          }
        }

        for (const node of rootNodes) {
          traverseNode(node);
        }

        // Collect style IDs referenced by selected nodes (for selection-scoped extraction)
        const usedPaintStyleIds: Set<string> = new Set();
        const usedTextStyleIds: Set<string> = new Set();
        const usedEffectStyleIds: Set<string> = new Set();

        function collectUsedStyleIds(node: SceneNode) {
          if ('fillStyleId' in node) {
            const id = (node as any).fillStyleId;
            if (typeof id === 'string' && id.length > 0) usedPaintStyleIds.add(id);
          }
          if ('strokeStyleId' in node) {
            const id = (node as any).strokeStyleId;
            if (typeof id === 'string' && id.length > 0) usedPaintStyleIds.add(id);
          }
          if ('textStyleId' in node) {
            const id = (node as any).textStyleId;
            if (typeof id === 'string' && id.length > 0) usedTextStyleIds.add(id);
          }
          if ('effectStyleId' in node) {
            const id = (node as any).effectStyleId;
            if (typeof id === 'string' && id.length > 0) usedEffectStyleIds.add(id);
          }
          if ('children' in node) {
            for (const child of (node as any).children) {
              collectUsedStyleIds(child);
            }
          }
        }

        if (source === 'selection') {
          for (const node of rootNodes) {
            collectUsedStyleIds(node);
          }
        }

        // Enrich from local styles — for selection, only include styles actually used by selected nodes
        // For page/file, include all local styles
        if (categories.includes('colors')) {
          try {
            const paintStyles = await figma.getLocalPaintStylesAsync();
            for (const style of paintStyles) {
              if (source === 'selection' && !usedPaintStyleIds.has(style.id)) continue;
              const firstPaint = style.paints?.[0];
              if (firstPaint && firstPaint.type === 'SOLID') {
                const hex = rgbToHex(firstPaint.color.r, firstPaint.color.g, firstPaint.color.b);
                if (!rawColors.has(hex)) {
                  rawColors.set(hex, { hex, count: 1, r: firstPaint.color.r, g: firstPaint.color.g, b: firstPaint.color.b });
                }
              }
            }
          } catch (_) { }
        }

        if (categories.includes('typography')) {
          try {
            const textStyles = await figma.getLocalTextStylesAsync();
            for (const style of textStyles) {
              if (source === 'selection' && !usedTextStyleIds.has(style.id)) continue;
              const key = `${style.fontName?.family}/${style.fontName?.style}/${style.fontSize}`;
              if (!rawFontStyles.has(key)) {
                rawFontStyles.set(key, {
                  fontFamily: style.fontName?.family || '',
                  fontWeight: style.fontName?.style || 'Regular',
                  fontSize: style.fontSize,
                  lineHeight: style.lineHeight,
                  letterSpacing: style.letterSpacing,
                  styleName: style.name
                });
              }
              if (style.fontName?.family) rawFontFamilies.add(style.fontName.family);
              if (style.fontSize) rawFontSizes.add(style.fontSize);
            }
          } catch (_) { }
        }

        if (categories.includes('effects')) {
          try {
            const effectStyles = await figma.getLocalEffectStylesAsync();
            for (const style of effectStyles) {
              if (source === 'selection' && !usedEffectStyleIds.has(style.id)) continue;
              for (const effect of style.effects) {
                if (effect.type === 'DROP_SHADOW' || effect.type === 'INNER_SHADOW') {
                  const s = effect as DropShadowEffect;
                  const key = `style-${style.name}`;
                  if (!rawShadows.has(key)) {
                    const color = s.color ? `rgba(${Math.round(s.color.r * 255)},${Math.round(s.color.g * 255)},${Math.round(s.color.b * 255)},${Math.round((s.color.a || 1) * 100) / 100})` : 'rgba(0,0,0,0.1)';
                    rawShadows.set(key, {
                      type: effect.type,
                      value: `${s.offset?.x || 0}px ${s.offset?.y || 0}px ${s.radius}px ${s.spread || 0}px ${color}`,
                      offsetX: s.offset?.x || 0, offsetY: s.offset?.y || 0,
                      blur: s.radius, spread: s.spread || 0, color,
                      styleName: style.name
                    });
                  }
                }
              }
            }
          } catch (_) { }
        }

        // Format a number: max 2 decimal places, strip trailing zeros, cap % at 100
        function fmtNum(v: number): number {
          const rounded = Math.round(v * 100) / 100;
          return parseFloat(rounded.toFixed(2));
        }
        function fmtPx(v: number): string {
          const n = fmtNum(v);
          return Number.isInteger(n) ? `${n}px` : `${n}px`;
        }
        function fmtPct(v: number): string {
          const capped = Math.min(v, 100);
          const n = fmtNum(capped);
          return `${n}%`;
        }

        // Classify colors by heuristic
        if (categories.includes('colors')) {
          const sortedColors = [...rawColors.values()].sort((a, b) => b.count - a.count);
          const primaryColors: any[] = [];
          const secondaryColors: any[] = [];
          const semanticColors: any[] = [];
          const neutralColors: any[] = [];

          for (const c of sortedColors) {
            const luminance = 0.299 * c.r + 0.587 * c.g + 0.114 * c.b;
            const saturation = Math.max(c.r, c.g, c.b) - Math.min(c.r, c.g, c.b);

            if (saturation < 0.1) {
              neutralColors.push({ name: `color/neutral/${c.hex.slice(1)}`, hex: c.hex, description: `Neutral tone (luminance: ${Math.round(luminance * 100)}%)`, _luminance: luminance });
            } else if (c.r > 0.7 && c.g < 0.3 && c.b < 0.3) {
              semanticColors.push({ name: `color/error/${c.hex.slice(1)}`, hex: c.hex, description: 'Error/danger state' });
            } else if (c.g > 0.6 && c.r < 0.4 && c.b < 0.4) {
              semanticColors.push({ name: `color/success/${c.hex.slice(1)}`, hex: c.hex, description: 'Success state' });
            } else if (c.r > 0.8 && c.g > 0.6 && c.b < 0.2) {
              semanticColors.push({ name: `color/warning/${c.hex.slice(1)}`, hex: c.hex, description: 'Warning state' });
            } else if (c.b > 0.5 && c.r < 0.4 && c.g < 0.5) {
              semanticColors.push({ name: `color/info/${c.hex.slice(1)}`, hex: c.hex, description: 'Info state' });
            } else if (primaryColors.length < 5) {
              primaryColors.push({ name: `color/primary/${c.hex.slice(1)}`, hex: c.hex, description: `Primary brand color`, _count: c.count });
            } else {
              secondaryColors.push({ name: `color/secondary/${c.hex.slice(1)}`, hex: c.hex, description: `Secondary color`, _count: c.count });
            }
          }

          // Sort neutrals light-to-dark, primaries/secondaries by usage frequency
          neutralColors.sort((a, b) => b._luminance - a._luminance);
          const neutralShades = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900'];
          neutralColors.forEach((c, i) => { c.name = `color/neutral/${neutralShades[i] || (i * 100)}`; delete c._luminance; });

          const primaryShades = ['50', '100', '300', '500', '700', '800', '900'];
          primaryColors.forEach((c, i) => { c.name = `color/primary/${primaryShades[i] || (i * 100)}`; delete c._count; });

          const secondaryShades = ['50', '100', '300', '500', '700', '800', '900'];
          secondaryColors.forEach((c, i) => { c.name = `color/secondary/${secondaryShades[i] || (i * 100)}`; delete c._count; });

          data.colors = { primary: primaryColors.slice(0, 10), secondary: secondaryColors.slice(0, 10), semantic: semanticColors.slice(0, 10), neutral: neutralColors.slice(0, 10) };

          if (rawGradients.length > 0) {
            data.colors.gradients = rawGradients.slice(0, 10).map((g, i) => ({
              name: `color/gradient/${i + 1}`,
              type: g.type,
              stops: g.stops,
              description: `${g.type.replace('GRADIENT_', '')} gradient`
            }));
          }
        }

        // Build typography data — sorted by font size descending (headings first)
        if (categories.includes('typography')) {
          const sortedFontStyles = [...rawFontStyles.values()].sort((a, b) => (b.fontSize || 0) - (a.fontSize || 0));

          const styles = sortedFontStyles.map((s) => {
            const sizeLabel = s.fontSize >= 32 ? 'display' : s.fontSize >= 24 ? 'h1' : s.fontSize >= 20 ? 'h2' : s.fontSize >= 18 ? 'h3' : s.fontSize >= 16 ? 'body' : s.fontSize >= 14 ? 'body-sm' : 'caption';
            let lhValue: string | number = 'auto';
            if (s.lineHeight && typeof s.lineHeight === 'object') {
              if (s.lineHeight.unit === 'PIXELS') lhValue = fmtNum(s.lineHeight.value);
              else if (s.lineHeight.unit === 'PERCENT') lhValue = fmtPct(s.lineHeight.value);
            }
            let lsValue: number | string = 0;
            if (s.letterSpacing && typeof s.letterSpacing === 'object') {
              if (s.letterSpacing.unit === 'PIXELS') lsValue = fmtNum(s.letterSpacing.value);
              else if (s.letterSpacing.unit === 'PERCENT') lsValue = fmtPct(s.letterSpacing.value);
            }
            return {
              name: s.styleName || `typography/${sizeLabel}/${s.fontWeight?.toLowerCase() || 'regular'}`,
              fontFamily: s.fontFamily,
              fontSize: fmtNum(s.fontSize),
              fontWeight: s.fontWeight,
              lineHeight: lhValue,
              letterSpacing: lsValue,
              description: `${s.fontFamily} ${s.fontWeight} at ${fmtNum(s.fontSize)}px`
            };
          });

          data.typography = {
            styles: styles.slice(0, 30),
            fontFamilies: [...rawFontFamilies].sort().slice(0, 20),
            fontSizes: [...rawFontSizes].sort((a, b) => a - b).map(fmtNum).slice(0, 20),
            fontWeights: [...rawFontWeights].slice(0, 10),
            lineHeights: [...rawLineHeights].slice(0, 10),
            letterSpacings: [...rawLetterSpacings].slice(0, 10)
          };
        }

        // Build components data
        if (categories.includes('components')) {
          const buttons: any[] = [];
          const inputs: any[] = [];
          const cards: any[] = [];
          const navigation: any[] = [];
          const forms: any[] = [];
          const icons: any[] = [];
          const other: any[] = [];

          for (const [, comp] of rawComponents) {
            const nameLower = comp.name.toLowerCase();
            const entry = {
              name: comp.name,
              variants: comp.variants || [],
              properties: comp.properties || [],
              description: comp.variants.length > 0 ? `${comp.variants.length} variants` : ''
            };

            if (nameLower.includes('button') || nameLower.includes('btn') || nameLower.includes('cta')) {
              buttons.push(entry);
            } else if (nameLower.includes('input') || nameLower.includes('textfield') || nameLower.includes('text field') || nameLower.includes('search')) {
              inputs.push(entry);
            } else if (nameLower.includes('card')) {
              cards.push(entry);
            } else if (nameLower.includes('nav') || nameLower.includes('tab') || nameLower.includes('menu') || nameLower.includes('header') || nameLower.includes('sidebar')) {
              navigation.push(entry);
            } else if (nameLower.includes('form') || nameLower.includes('checkbox') || nameLower.includes('radio') || nameLower.includes('toggle') || nameLower.includes('switch') || nameLower.includes('select') || nameLower.includes('dropdown')) {
              forms.push(entry);
            } else if (nameLower.includes('icon') || nameLower.includes('ico')) {
              icons.push(entry);
            } else {
              other.push(entry);
            }
          }

          data.components = {
            buttons: buttons.slice(0, 20),
            inputs: inputs.slice(0, 20),
            cards: cards.slice(0, 20),
            navigation: navigation.slice(0, 20),
            forms: forms.slice(0, 20),
            icons: icons.slice(0, 30),
            other: other.slice(0, 30)
          };
        }

        // Build effects data
        if (categories.includes('effects')) {
          const shadowNames = ['xs', 'sm', 'md', 'lg', 'xl', '2xl'];
          const shadows = [...rawShadows.values()].map((s, i) => ({
            name: s.styleName || `effect/shadow/${shadowNames[i] || 'shadow-' + (i + 1)}`,
            value: `${fmtNum(s.offsetX)}px ${fmtNum(s.offsetY)}px ${fmtNum(s.blur)}px ${fmtNum(s.spread)}px ${s.color}`,
            description: `${s.type === 'INNER_SHADOW' ? 'Inner' : 'Drop'} shadow — blur ${fmtNum(s.blur)}px`
          }));

          const blurs = [...rawBlurs.values()].map((b, i) => ({
            name: `effect/blur/${b.type === 'BACKGROUND_BLUR' ? 'background' : 'layer'}-${i + 1}`,
            value: fmtPx(b.radius),
            description: `${b.type === 'BACKGROUND_BLUR' ? 'Background' : 'Layer'} blur`
          }));

          const borders = [...rawBorders.values()].map((b, i) => ({
            name: `effect/border/${i === 0 ? 'default' : 'variant-' + i}`,
            width: fmtNum(b.width),
            color: b.color,
            description: `${fmtNum(b.width)}px border`
          }));

          data.effects = {
            shadows: shadows.slice(0, 10),
            blurs: blurs.slice(0, 10),
            borders: borders.slice(0, 10),
            cornerRadii: [...rawCornerRadii].sort((a, b) => a - b).map(fmtNum).slice(0, 10),
            opacities: [...rawOpacities].sort((a, b) => a - b).map(fmtNum).slice(0, 10)
          };
        }

        // Build spacing data
        if (categories.includes('spacing')) {
          const allSpacings = [...new Set([...rawSpacings, ...rawPaddings])].sort((a, b) => a - b);
          const spacingNames = ['4xs', '3xs', '2xs', 'xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl'];
          const spacingTokens = allSpacings.map((v, i) => ({
            name: `spacing/${spacingNames[i] || 'space-' + fmtNum(v)}`,
            value: fmtNum(v),
            description: `${fmtNum(v)}px spacing unit`
          }));

          data.spacing = {
            tokens: spacingTokens.slice(0, 15),
            paddings: [...rawPaddings].sort((a, b) => a - b).map(fmtNum).slice(0, 15),
            margins: [...rawSpacings].sort((a, b) => a - b).map(fmtNum).slice(0, 15),
            gridSystems: rawGridSystems.slice(0, 5).map(g => ({
              columns: g.count,
              gutter: fmtNum(g.gutterSize),
              margin: fmtNum(g.offset),
              pattern: g.pattern
            })),
            layoutConstraints: []
          };
        }

        figma.ui.postMessage({ type: 'design-system-extracted', data });
      } catch (error) {
        console.error('extract-design-system failed:', error);
        figma.ui.postMessage({ type: 'error', message: 'Failed to extract design system: ' + (error instanceof Error ? error.message : String(error)) });
      }
      break;
    }

    case 'create-design-tokens': {
      try {
        const dsData = (msg as any).data;
        let createdCount = 0;

        // Create color variables
        if (dsData.colors) {
          const allColors: { name: string, hex: string }[] = [];
          for (const group of ['primary', 'secondary', 'semantic', 'neutral']) {
            if (dsData.colors[group]) {
              for (const c of dsData.colors[group]) {
                allColors.push(c);
              }
            }
          }

          if (allColors.length > 0 && figma.variables && typeof figma.variables.createVariableCollection === 'function') {
            // Check for existing collection
            const existingCollections = await figma.variables.getLocalVariableCollectionsAsync();
            let colorCollection = existingCollections.find(c => c.name === 'Design System Colors');
            if (!colorCollection) {
              colorCollection = figma.variables.createVariableCollection('Design System Colors');
            }
            const modeId = colorCollection.defaultModeId;

            for (const c of allColors) {
              try {
                const varName = c.name.replace(/\//g, '/');
                const variable = figma.variables.createVariable(varName, colorCollection, 'COLOR');
                const hex = c.hex.replace('#', '');
                const r = parseInt(hex.substring(0, 2), 16) / 255;
                const g = parseInt(hex.substring(2, 4), 16) / 255;
                const b = parseInt(hex.substring(4, 6), 16) / 255;
                variable.setValueForMode(modeId, { r, g, b, a: 1 });
                createdCount++;
              } catch (e) {
                console.warn('Failed to create color variable:', c.name, e);
              }
            }
          }

          // Gradient colors go to paint styles
          if (dsData.colors.gradients) {
            for (const grad of dsData.colors.gradients) {
              try {
                const style = figma.createPaintStyle();
                style.name = grad.name || 'Gradient';
                const stops = (grad.stops || []).map((s: any) => {
                  const hex = (s.color || '#000000').replace('#', '');
                  const r = parseInt(hex.substring(0, 2), 16) / 255;
                  const g = parseInt(hex.substring(2, 4), 16) / 255;
                  const b = parseInt(hex.substring(4, 6), 16) / 255;
                  return { color: { r, g, b, a: 1 }, position: s.position || 0 };
                });
                style.paints = [{
                  type: 'GRADIENT_LINEAR',
                  gradientTransform: [[1, 0, 0], [0, 1, 0]],
                  gradientStops: stops
                }];
                createdCount++;
              } catch (e) {
                console.warn('Failed to create gradient style:', e);
              }
            }
          }
        }

        // Create spacing variables
        if (dsData.spacing && dsData.spacing.tokens && dsData.spacing.tokens.length > 0) {
          if (figma.variables && typeof figma.variables.createVariableCollection === 'function') {
            const existingCollections = await figma.variables.getLocalVariableCollectionsAsync();
            let spacingCollection = existingCollections.find(c => c.name === 'Design System Spacing');
            if (!spacingCollection) {
              spacingCollection = figma.variables.createVariableCollection('Design System Spacing');
            }
            const modeId = spacingCollection.defaultModeId;

            for (const t of dsData.spacing.tokens) {
              try {
                const variable = figma.variables.createVariable(t.name, spacingCollection, 'FLOAT');
                variable.setValueForMode(modeId, t.value);
                if (t.description) variable.description = t.description;
                createdCount++;
              } catch (e) {
                console.warn('Failed to create spacing variable:', t.name, e);
              }
            }
          }
        }

        // Create text styles
        if (dsData.typography && dsData.typography.styles) {
          for (const s of dsData.typography.styles) {
            try {
              const textStyle = figma.createTextStyle();
              textStyle.name = s.name || 'Text Style';
              const family = s.fontFamily || 'Inter';
              const style = s.fontWeight || 'Regular';
              await smartLoadFont({ family, style });
              textStyle.fontName = { family, style };
              textStyle.fontSize = s.fontSize || 16;
              if (s.lineHeight && typeof s.lineHeight === 'number') {
                textStyle.lineHeight = { value: s.lineHeight, unit: 'PIXELS' };
              }
              if (s.letterSpacing && typeof s.letterSpacing === 'number') {
                textStyle.letterSpacing = { value: s.letterSpacing, unit: 'PIXELS' };
              }
              if (s.description) textStyle.description = s.description;
              createdCount++;
            } catch (e) {
              console.warn('Failed to create text style:', s.name, e);
            }
          }
        }

        // Create effect styles (shadows)
        if (dsData.effects && dsData.effects.shadows) {
          for (const s of dsData.effects.shadows) {
            try {
              const effectStyle = figma.createEffectStyle();
              effectStyle.name = s.name || 'Shadow';
              // Parse shadow value: "Xpx Ypx Rpx Spx rgba(...)"
              const parts = (s.value || '').match(/([-\d.]+)px\s+([-\d.]+)px\s+([-\d.]+)px\s+([-\d.]+)px\s+(.+)/);
              if (parts) {
                const colorMatch = parts[5].match(/rgba?\((\d+),\s*(\d+),\s*(\d+),?\s*([\d.]*)\)/);
                const color = colorMatch ? {
                  r: parseInt(colorMatch[1]) / 255,
                  g: parseInt(colorMatch[2]) / 255,
                  b: parseInt(colorMatch[3]) / 255,
                  a: colorMatch[4] ? parseFloat(colorMatch[4]) : 1
                } : { r: 0, g: 0, b: 0, a: 0.1 };

                effectStyle.effects = [{
                  type: 'DROP_SHADOW',
                  color,
                  offset: { x: parseFloat(parts[1]), y: parseFloat(parts[2]) },
                  radius: parseFloat(parts[3]),
                  spread: parseFloat(parts[4]),
                  visible: true,
                  blendMode: 'NORMAL'
                }];
                createdCount++;
              }
            } catch (e) {
              console.warn('Failed to create effect style:', s.name, e);
            }
          }
        }

        figma.ui.postMessage({ type: 'design-tokens-created', message: `Created ${createdCount} design tokens (variables, styles)` });
      } catch (error) {
        console.error('create-design-tokens failed:', error);
        figma.ui.postMessage({ type: 'error', message: 'Failed to create design tokens: ' + (error instanceof Error ? error.message : String(error)) });
      }
      break;
    }

    case 'output-design-system-figma': {
      try {
        const dsData = (msg as any).data;
        const PAGE_PADDING = 80;
        const SECTION_GAP = 60;
        const CARD_GAP = 16;
        const SWATCH_SIZE = 60;

        await smartLoadFont({ family: 'Inter', style: 'Bold' });
        await smartLoadFont({ family: 'Inter', style: 'Regular' });
        await smartLoadFont({ family: 'Inter', style: 'Medium' });

        const mainFrame = figma.createFrame();
        mainFrame.name = 'Design System';
        mainFrame.layoutMode = 'VERTICAL';
        mainFrame.primaryAxisSizingMode = 'AUTO';
        mainFrame.counterAxisSizingMode = 'AUTO';
        mainFrame.paddingTop = PAGE_PADDING;
        mainFrame.paddingBottom = PAGE_PADDING;
        mainFrame.paddingLeft = PAGE_PADDING;
        mainFrame.paddingRight = PAGE_PADDING;
        mainFrame.itemSpacing = SECTION_GAP;
        mainFrame.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
        mainFrame.cornerRadius = 16;

        // Title
        const titleText = figma.createText();
        titleText.fontName = { family: 'Inter', style: 'Bold' };
        titleText.characters = 'Design System';
        titleText.fontSize = 40;
        titleText.fills = [{ type: 'SOLID', color: { r: 0.1, g: 0.1, b: 0.1 } }];
        mainFrame.appendChild(titleText);

        const subtitleText = figma.createText();
        subtitleText.fontName = { family: 'Inter', style: 'Regular' };
        subtitleText.characters = `Generated on ${new Date().toLocaleDateString()}`;
        subtitleText.fontSize = 14;
        subtitleText.fills = [{ type: 'SOLID', color: { r: 0.5, g: 0.5, b: 0.5 } }];
        mainFrame.appendChild(subtitleText);

        function createSectionTitle(text: string): TextNode {
          const t = figma.createText();
          t.fontName = { family: 'Inter', style: 'Bold' };
          t.characters = text;
          t.fontSize = 24;
          t.fills = [{ type: 'SOLID', color: { r: 0.15, g: 0.15, b: 0.15 } }];
          return t;
        }

        function createLabel(text: string, size: number = 12): TextNode {
          const t = figma.createText();
          t.fontName = { family: 'Inter', style: 'Regular' };
          t.characters = text || '-';
          t.fontSize = size;
          t.fills = [{ type: 'SOLID', color: { r: 0.4, g: 0.4, b: 0.4 } }];
          return t;
        }

        function createDivider(): RectangleNode {
          const d = figma.createRectangle();
          d.resize(800, 1);
          d.fills = [{ type: 'SOLID', color: { r: 0.9, g: 0.9, b: 0.9 } }];
          return d;
        }

        // Colors section
        if (dsData.colors) {
          const section = figma.createFrame();
          section.name = 'Colors';
          section.layoutMode = 'VERTICAL';
          section.primaryAxisSizingMode = 'AUTO';
          section.counterAxisSizingMode = 'AUTO';
          section.itemSpacing = 24;
          section.fills = [];

          section.appendChild(createSectionTitle('Color Styles'));
          section.appendChild(createDivider());

          for (const group of ['primary', 'secondary', 'semantic', 'neutral']) {
            const colors = dsData.colors[group];
            if (!colors || colors.length === 0) continue;

            const groupLabel = figma.createText();
            groupLabel.fontName = { family: 'Inter', style: 'Medium' };
            groupLabel.characters = group.charAt(0).toUpperCase() + group.slice(1) + ' Colors';
            groupLabel.fontSize = 16;
            groupLabel.fills = [{ type: 'SOLID', color: { r: 0.2, g: 0.2, b: 0.2 } }];
            section.appendChild(groupLabel);

            const row = figma.createFrame();
            row.name = `${group}-colors`;
            row.layoutMode = 'HORIZONTAL';
            row.primaryAxisSizingMode = 'AUTO';
            row.counterAxisSizingMode = 'AUTO';
            row.itemSpacing = CARD_GAP;
            row.fills = [];

            for (const c of colors) {
              const card = figma.createFrame();
              card.name = c.name || 'color';
              card.layoutMode = 'VERTICAL';
              card.primaryAxisSizingMode = 'AUTO';
              card.counterAxisSizingMode = 'AUTO';
              card.itemSpacing = 6;
              card.fills = [];

              const swatch = figma.createRectangle();
              swatch.resize(SWATCH_SIZE, SWATCH_SIZE);
              swatch.cornerRadius = 8;
              const hex = (c.hex || '#000000').replace('#', '');
              const r = parseInt(hex.substring(0, 2), 16) / 255;
              const g = parseInt(hex.substring(2, 4), 16) / 255;
              const b = parseInt(hex.substring(4, 6), 16) / 255;
              swatch.fills = [{ type: 'SOLID', color: { r, g, b } }];
              card.appendChild(swatch);

              card.appendChild(createLabel(c.hex || '', 11));
              const nameLabel = createLabel(c.name?.split('/').pop() || '', 10);
              nameLabel.resize(SWATCH_SIZE, nameLabel.height);
              nameLabel.textAutoResize = 'HEIGHT';
              card.appendChild(nameLabel);

              row.appendChild(card);
            }
            section.appendChild(row);
          }
          mainFrame.appendChild(section);
        }

        // Typography section
        if (dsData.typography && dsData.typography.styles) {
          const section = figma.createFrame();
          section.name = 'Typography';
          section.layoutMode = 'VERTICAL';
          section.primaryAxisSizingMode = 'AUTO';
          section.counterAxisSizingMode = 'AUTO';
          section.itemSpacing = 16;
          section.fills = [];

          section.appendChild(createSectionTitle('Typography Styles'));
          section.appendChild(createDivider());

          for (const s of dsData.typography.styles.slice(0, 15)) {
            const row = figma.createFrame();
            row.name = s.name || 'type-style';
            row.layoutMode = 'HORIZONTAL';
            row.primaryAxisSizingMode = 'AUTO';
            row.counterAxisSizingMode = 'AUTO';
            row.itemSpacing = 24;
            row.counterAxisAlignItems = 'CENTER';
            row.fills = [];

            const info = createLabel(`${s.name || ''} — ${s.fontFamily || ''} ${s.fontWeight || ''} ${s.fontSize || ''}px`, 12);
            info.resize(300, info.height);
            info.textAutoResize = 'HEIGHT';
            row.appendChild(info);

            try {
              const sample = figma.createText();
              const family = s.fontFamily || 'Inter';
              const style = s.fontWeight || 'Regular';
              await smartLoadFont({ family, style });
              sample.fontName = { family, style };
              sample.characters = 'The quick brown fox jumps';
              sample.fontSize = Math.min(s.fontSize || 16, 48);
              sample.fills = [{ type: 'SOLID', color: { r: 0.1, g: 0.1, b: 0.1 } }];
              row.appendChild(sample);
            } catch (_) {
              row.appendChild(createLabel('(font unavailable)', 12));
            }

            section.appendChild(row);
          }
          mainFrame.appendChild(section);
        }

        // Components section
        if (dsData.components) {
          const section = figma.createFrame();
          section.name = 'Components';
          section.layoutMode = 'VERTICAL';
          section.primaryAxisSizingMode = 'AUTO';
          section.counterAxisSizingMode = 'AUTO';
          section.itemSpacing = 16;
          section.fills = [];

          section.appendChild(createSectionTitle('Component Library'));
          section.appendChild(createDivider());

          const compGroups = [
            { key: 'buttons', title: 'Buttons' }, { key: 'inputs', title: 'Inputs' },
            { key: 'cards', title: 'Cards' }, { key: 'navigation', title: 'Navigation' },
            { key: 'forms', title: 'Forms' }, { key: 'icons', title: 'Icons' },
            { key: 'other', title: 'Other' }
          ];

          for (const cg of compGroups) {
            const comps = dsData.components[cg.key];
            if (!comps || comps.length === 0) continue;

            const groupLabel = figma.createText();
            groupLabel.fontName = { family: 'Inter', style: 'Medium' };
            groupLabel.characters = cg.title;
            groupLabel.fontSize = 16;
            groupLabel.fills = [{ type: 'SOLID', color: { r: 0.2, g: 0.2, b: 0.2 } }];
            section.appendChild(groupLabel);

            const grid = figma.createFrame();
            grid.name = `${cg.key}-grid`;
            grid.layoutMode = 'HORIZONTAL';
            grid.layoutWrap = 'WRAP';
            grid.primaryAxisSizingMode = 'FIXED';
            grid.counterAxisSizingMode = 'AUTO';
            grid.resize(800, 10);
            grid.itemSpacing = 12;
            grid.counterAxisSpacing = 12;
            grid.fills = [];

            for (const comp of comps.slice(0, 12)) {
              const card = figma.createFrame();
              card.name = comp.name;
              card.layoutMode = 'VERTICAL';
              card.primaryAxisSizingMode = 'AUTO';
              card.counterAxisSizingMode = 'FIXED';
              card.resize(180, 10);
              card.paddingTop = 12;
              card.paddingBottom = 12;
              card.paddingLeft = 12;
              card.paddingRight = 12;
              card.itemSpacing = 6;
              card.cornerRadius = 8;
              card.fills = [{ type: 'SOLID', color: { r: 0.97, g: 0.97, b: 0.97 } }];
              card.strokes = [{ type: 'SOLID', color: { r: 0.9, g: 0.9, b: 0.9 } }];
              card.strokeWeight = 1;

              const nameT = figma.createText();
              nameT.fontName = { family: 'Inter', style: 'Medium' };
              nameT.characters = comp.name || '-';
              nameT.fontSize = 13;
              nameT.fills = [{ type: 'SOLID', color: { r: 0.1, g: 0.1, b: 0.1 } }];
              nameT.resize(156, nameT.height);
              nameT.textAutoResize = 'HEIGHT';
              card.appendChild(nameT);

              if (comp.variants && comp.variants.length > 0) {
                const vLabel = createLabel(`Variants: ${comp.variants.slice(0, 4).join(', ')}${comp.variants.length > 4 ? '...' : ''}`, 10);
                vLabel.resize(156, vLabel.height);
                vLabel.textAutoResize = 'HEIGHT';
                card.appendChild(vLabel);
              }
              grid.appendChild(card);
            }
            section.appendChild(grid);
          }
          mainFrame.appendChild(section);
        }

        // Effects section
        if (dsData.effects) {
          const section = figma.createFrame();
          section.name = 'Effects';
          section.layoutMode = 'VERTICAL';
          section.primaryAxisSizingMode = 'AUTO';
          section.counterAxisSizingMode = 'AUTO';
          section.itemSpacing = 16;
          section.fills = [];

          section.appendChild(createSectionTitle('Effects & Styles'));
          section.appendChild(createDivider());

          if (dsData.effects.shadows && dsData.effects.shadows.length > 0) {
            section.appendChild(createLabel('Shadows', 14));
            const row = figma.createFrame();
            row.name = 'shadows-row';
            row.layoutMode = 'HORIZONTAL';
            row.primaryAxisSizingMode = 'AUTO';
            row.counterAxisSizingMode = 'AUTO';
            row.itemSpacing = 20;
            row.fills = [];

            for (const s of dsData.effects.shadows.slice(0, 6)) {
              const card = figma.createFrame();
              card.name = s.name || 'shadow';
              card.layoutMode = 'VERTICAL';
              card.primaryAxisSizingMode = 'AUTO';
              card.counterAxisSizingMode = 'AUTO';
              card.itemSpacing = 8;
              card.fills = [];

              const demo = figma.createRectangle();
              demo.resize(80, 60);
              demo.cornerRadius = 8;
              demo.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
              // Parse shadow and apply
              const parts = (s.value || '').match(/([-\d.]+)px\s+([-\d.]+)px\s+([-\d.]+)px\s+([-\d.]+)px\s+(.+)/);
              if (parts) {
                const colorMatch = parts[5].match(/rgba?\((\d+),\s*(\d+),\s*(\d+),?\s*([\d.]*)\)/);
                demo.effects = [{
                  type: 'DROP_SHADOW',
                  color: colorMatch ? {
                    r: parseInt(colorMatch[1]) / 255,
                    g: parseInt(colorMatch[2]) / 255,
                    b: parseInt(colorMatch[3]) / 255,
                    a: colorMatch[4] ? parseFloat(colorMatch[4]) : 0.15
                  } : { r: 0, g: 0, b: 0, a: 0.15 },
                  offset: { x: parseFloat(parts[1]), y: parseFloat(parts[2]) },
                  radius: parseFloat(parts[3]),
                  spread: parseFloat(parts[4]),
                  visible: true,
                  blendMode: 'NORMAL'
                }];
              }
              card.appendChild(demo);
              card.appendChild(createLabel(s.name?.split('/').pop() || '', 10));
              row.appendChild(card);
            }
            section.appendChild(row);
          }

          if (dsData.effects.cornerRadii && dsData.effects.cornerRadii.length > 0) {
            section.appendChild(createLabel('Corner Radii', 14));
            const row = figma.createFrame();
            row.name = 'radii-row';
            row.layoutMode = 'HORIZONTAL';
            row.primaryAxisSizingMode = 'AUTO';
            row.counterAxisSizingMode = 'AUTO';
            row.itemSpacing = 16;
            row.fills = [];

            for (const r of dsData.effects.cornerRadii.slice(0, 8)) {
              const card = figma.createFrame();
              card.name = `radius-${r}`;
              card.layoutMode = 'VERTICAL';
              card.primaryAxisSizingMode = 'AUTO';
              card.counterAxisSizingMode = 'AUTO';
              card.itemSpacing = 6;
              card.fills = [];

              const demo = figma.createRectangle();
              demo.resize(50, 50);
              demo.cornerRadius = r;
              demo.fills = [{ type: 'SOLID', color: { r: 0.85, g: 0.88, b: 0.95 } }];
              demo.strokes = [{ type: 'SOLID', color: { r: 0.6, g: 0.65, b: 0.8 } }];
              demo.strokeWeight = 1;
              card.appendChild(demo);
              card.appendChild(createLabel(`${r}px`, 10));
              row.appendChild(card);
            }
            section.appendChild(row);
          }
          mainFrame.appendChild(section);
        }

        // Spacing section
        if (dsData.spacing && dsData.spacing.tokens && dsData.spacing.tokens.length > 0) {
          const section = figma.createFrame();
          section.name = 'Spacing';
          section.layoutMode = 'VERTICAL';
          section.primaryAxisSizingMode = 'AUTO';
          section.counterAxisSizingMode = 'AUTO';
          section.itemSpacing = 16;
          section.fills = [];

          section.appendChild(createSectionTitle('Spacing System'));
          section.appendChild(createDivider());

          for (const t of dsData.spacing.tokens.slice(0, 12)) {
            const row = figma.createFrame();
            row.name = t.name || 'spacing';
            row.layoutMode = 'HORIZONTAL';
            row.primaryAxisSizingMode = 'AUTO';
            row.counterAxisSizingMode = 'AUTO';
            row.counterAxisAlignItems = 'CENTER';
            row.itemSpacing = 12;
            row.fills = [];

            const label = createLabel(`${t.name?.split('/').pop() || ''} (${t.value}px)`, 12);
            label.resize(120, label.height);
            label.textAutoResize = 'HEIGHT';
            row.appendChild(label);

            const bar = figma.createRectangle();
            bar.resize(Math.min(t.value * 4, 400), 16);
            bar.cornerRadius = 4;
            bar.fills = [{ type: 'SOLID', color: { r: 0.4, g: 0.55, b: 0.95 } }];
            row.appendChild(bar);

            section.appendChild(row);
          }
          mainFrame.appendChild(section);
        }

        // Position and focus
        figma.currentPage.appendChild(mainFrame);
        mainFrame.x = Math.round(figma.viewport.center.x - mainFrame.width / 2);
        mainFrame.y = Math.round(figma.viewport.center.y - mainFrame.height / 2);
        figma.currentPage.selection = [mainFrame];
        figma.viewport.scrollAndZoomIntoView([mainFrame]);

        figma.ui.postMessage({ type: 'design-system-figma-created', message: 'Design system document created with visual layout' });
      } catch (error) {
        console.error('output-design-system-figma failed:', error);
        figma.ui.postMessage({ type: 'error', message: 'Failed to create Figma document: ' + (error instanceof Error ? error.message : String(error)) });
      }
      break;
    }

    case 'get-selection-colors': {
      if (selection.length === 0) {
        figma.ui.postMessage({ type: 'error', message: 'Please select at least one element' });
        return;
      }

      const colors: string[] = [];
      function extractColors(node: SceneNode) {
        if ('fills' in node && Array.isArray(node.fills)) {
          for (const fill of node.fills) {
            if (fill.type === 'SOLID' && fill.visible !== false) {
              colors.push(rgbToHex(fill.color.r, fill.color.g, fill.color.b));
            }
          }
        }
        if ('children' in node) {
          for (const child of node.children) {
            extractColors(child);
          }
        }
      }

      for (const node of selection) {
        extractColors(node);
      }

      // Remove duplicates and limit to 5 colors
      const uniqueColors = [...new Set(colors)].slice(0, 5);
      figma.ui.postMessage({ type: 'selection-colors', data: uniqueColors });
      break;
    }

    case 'duplicate-with-instructions': {
      try {
        const options = (msg as any).options || {};
        const sequentialFull = options.sequentialFull === true;
        const realityData = options.realityData === true;
        const randomizeInstance = options.randomizeInstance === true;
        const randomizeNestedInstances = options.randomizeNestedInstances === true;
        const hasImage = options.hasImage === true;
        const customInstructions = Array.isArray(options.customInstructions) ? options.customInstructions : [];
        const duplicateCount = typeof options.duplicateCount === 'number' && options.duplicateCount > 0 ? options.duplicateCount : 1;
        const numCopies = typeof options.numCopies === 'number' ? options.numCopies : duplicateCount;

        console.log('Duplicate with instructions - randomizeInstance:', randomizeInstance, 'selection types:', selection.map(n => n.type));

        if (selection.length === 0) {
          figma.ui.postMessage({ type: 'error', message: 'Please select at least one node to duplicate' });
          break;
        }

        // Check if randomizeInstance or randomizeNestedInstances is enabled but selection doesn't contain instances
        if (randomizeInstance || randomizeNestedInstances) {
          const hasTopLevelInstances = selection.some(n => n.type === 'INSTANCE');

          if (randomizeNestedInstances) {
            // Check for any instance in the selection or its children
            const hasAnyInstance = (nodes: readonly SceneNode[]): boolean => {
              for (const node of nodes) {
                if (node.type === 'INSTANCE') return true;
                if ('children' in node && hasAnyInstance(node.children)) return true;
              }
              return false;
            };

            if (!hasAnyInstance(selection)) {
              figma.notify('Randomize Nested Instances is enabled but no component instances were found in the selection. Please select components or frames containing instances.', { error: true });
            }
          } else if (randomizeInstance && !hasTopLevelInstances) {
            figma.notify('Randomize Instance is enabled but no component instances are selected at the top level. Use "Randomize Nested Instances" to randomize instances inside the selection.', { error: true });
          }
        }

        figma.commitUndo();

        // Helper function to find all text nodes recursively
        function findAllTextNodes(node: SceneNode): TextNode[] {
          const textNodes: TextNode[] = [];
          if (node.type === 'TEXT') {
            textNodes.push(node as TextNode);
          }
          if ('children' in node) {
            for (const child of node.children) {
              textNodes.push(...findAllTextNodes(child));
            }
          }
          return textNodes;
        }

        // Helper function to randomize properties of a single instance
        async function randomizeInstanceProperties(instance: InstanceNode, copyIndex: number) {
          try {
            console.log(`Processing instance ${instance.id} for randomization`);

            // Use async method for dynamic pages
            let mainComponent: ComponentNode | null = null;
            if ('getMainComponentAsync' in instance && typeof (instance as any).getMainComponentAsync === 'function') {
              mainComponent = await (instance as any).getMainComponentAsync();
            } else {
              mainComponent = (instance as any).mainComponent;
            }

            if (!mainComponent) {
              console.warn(`Instance ${instance.id} has no main component`);
              return;
            }

            console.log(`Main component: ${mainComponent.id} (${mainComponent.name})`);

            // Get properties from component set if this is a variant, otherwise from the component
            let propertyDefs: any = null;
            let componentName = mainComponent.name;
            let componentSet: ComponentSetNode | null = null;

            if (mainComponent.type === 'COMPONENT' && mainComponent.parent && mainComponent.parent.type === 'COMPONENT_SET') {
              // This is a variant component - get properties from the component set
              componentSet = mainComponent.parent as ComponentSetNode;
              propertyDefs = componentSet.componentPropertyDefinitions;
              componentName = componentSet.name;
              console.log(`Using component set ${componentSet.id} (${componentName}) properties for variant`);
            } else {
              // This is a regular component
              propertyDefs = mainComponent.componentPropertyDefinitions;
            }

            console.log(`Component property definitions:`, Object.keys(propertyDefs || {}));

            if (!propertyDefs || Object.keys(propertyDefs).length === 0) {
              console.warn(`Component ${mainComponent.id} (${componentName}) has no properties to randomize`);
              return;
            }

            const randomProps: Record<string, string | boolean> = {};

            // If it's a component set, pick one of the actual variants to ensure validity
            if (componentSet) {
              const variants = componentSet.children.filter(c => c.type === 'COMPONENT') as ComponentNode[];
              if (variants.length > 0) {
                const selectedVariant = variants[copyIndex % variants.length];
                // Extract properties from the selected variant's name (e.g., "Size=Large, Style=Outlined")
                const propStr = selectedVariant.name;
                const parts = propStr.split(',').map(s => s.trim());
                parts.forEach(part => {
                  const [key, val] = part.split('=').map(s => s.trim());
                  if (key && val) {
                    randomProps[key] = val;
                  }
                });
                console.log(`Selected variant "${selectedVariant.name}" for properties:`, randomProps);
              }
            }

            // Also handle any other properties (like BOOLEAN or TEXT properties that are NOT variants)
            Object.keys(propertyDefs).forEach((key) => {
              const prop = propertyDefs[key];
              // Skip if already handled by variant selection
              if (randomProps[key] !== undefined) return;

              if (prop.type === 'VARIANT') {
                // If not already set by variant picking (e.g., if variant picking failed or handled differently)
                const options = prop.variantOptions || [];
                if (options.length > 0) {
                  randomProps[key] = options[copyIndex % options.length];
                }
              } else if (prop.type === 'BOOLEAN') {
                randomProps[key] = (copyIndex % 2 === 0);
              } else if (prop.type === 'TEXT') {
                randomProps[key] = `Value ${copyIndex + 1}`;
              }
            });

            if (Object.keys(randomProps).length > 0) {
              // Normalize boolean values for VARIANT properties if needed
              // (Though variant picking above should have given us strings)
              const normalizedProps: Record<string, string | boolean> = {};
              for (const [key, val] of Object.entries(randomProps)) {
                const def = propertyDefs[key];
                if (def && def.type === 'VARIANT' && typeof val === 'boolean') {
                  const options = def.variantOptions || [];
                  const valStr = val.toString();
                  // Try to find a matching option case-insensitively
                  const match = (options as string[]).find((o: string) => o.toLowerCase() === valStr ||
                    (val && (o.toLowerCase() === 'on' || o.toLowerCase() === 'yes' || o.toLowerCase() === 'true')) ||
                    (!val && (o.toLowerCase() === 'off' || o.toLowerCase() === 'no' || o.toLowerCase() === 'false')));
                  normalizedProps[key] = match || valStr;
                } else {
                  normalizedProps[key] = val;
                }
              }

              console.log(`Setting properties on instance ${instance.id}:`, normalizedProps);
              instance.setProperties(normalizedProps);
            }
          } catch (e) {
            console.error(`Failed to randomize instance ${instance.id}:`, e);
          }
        }

        // Helper function to randomize all instances within a node recursively
        async function randomizeAllInstancesRecursively(node: SceneNode, copyIndex: number) {
          if (node.type === 'INSTANCE') {
            await randomizeInstanceProperties(node as InstanceNode, copyIndex);
          }

          if ('children' in node) {
            for (const child of node.children) {
              await randomizeAllInstancesRecursively(child, copyIndex);
            }
          }
        }

        // Helper function to generate sequential numbers (preserves format)
        function generateSequentialText(text: string, index: number): string {
          // Try to find numbers in the text and increment them, preserving format
          return text.replace(/\d+/g, (match) => {
            const num = parseInt(match, 10);
            const newNum = num + index;
            // Preserve leading zeros and format
            if (match.length > 1 && match[0] === '0') {
              // Has leading zeros, preserve them
              const padding = match.length;
              return String(newNum).padStart(padding, '0');
            }
            return String(newNum);
          });
        }


        // Determine how many copies to create per node
        // RandomizeInstance can create multiple copies with different randomizations
        const copiesToCreate = customInstructions.length > 0
          ? customInstructions.length
          : (sequentialFull || randomizeInstance || randomizeNestedInstances ? numCopies : numCopies);

        // Track all duplicated nodes for selection and post-processing
        const duplicatedNodes: SceneNode[] = [];

        // Process each selected node
        for (const originalNode of selection) {
          const parent = originalNode.parent;
          if (!parent || !('appendChild' in parent)) {
            continue;
          }

          for (let copyIndex = 0; copyIndex < copiesToCreate; copyIndex++) {
            // Clone the node
            const clone = originalNode.clone();

            // Position as sibling (next to original)
            clone.x = originalNode.x + (copyIndex + 1) * (originalNode.width + 20);
            clone.y = originalNode.y;

            // Append to same parent
            (parent as ChildrenMixin).appendChild(clone);

            // Track duplicated node
            duplicatedNodes.push(clone);

            // Apply modifications based on options
            const textNodes = findAllTextNodes(clone);

            // Load fonts for all text nodes before modifying
            for (const textNode of textNodes) {
              try {
                await loadAllFontsForTextNode(textNode);
              } catch (e) {
                console.warn('Failed to load fonts for text node:', e);
              }
            }

            if (sequentialFull) {
              // Sequentially change numbers in text nodes
              for (const textNode of textNodes) {
                try {
                  const newText = generateSequentialText(textNode.characters, copyIndex + 1);
                  textNode.characters = newText;
                } catch (e) {
                  console.warn('Failed to update text node:', e);
                }
              }
            }

            // Apply custom instructions immediately (they're copy-specific)
            if (customInstructions.length > 0 && copyIndex < customInstructions.length) {
              // Apply custom instruction
              const instruction = customInstructions[copyIndex];
              for (const textNode of textNodes) {
                try {
                  // Replace {text} placeholder with the instruction text
                  let newText = instruction;
                  if (instruction.includes('{text}')) {
                    newText = instruction.replace(/{text}/g, textNode.characters);
                  } else if (instruction.includes('Replace')) {
                    // Try to parse "Replace X with Y" pattern
                    const match = instruction.match(/Replace\s+(.+?)\s+with\s+(.+)/i);
                    if (match) {
                      const searchText = match[1].trim();
                      const replaceText = match[2].trim();
                      newText = textNode.characters.replace(new RegExp(searchText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'), replaceText);
                    } else {
                      newText = instruction;
                    }
                  } else {
                    // If no pattern found, replace entire text
                    newText = instruction;
                  }
                  textNode.characters = newText;
                } catch (e) {
                  console.warn('Failed to apply custom instruction:', e);
                }
              }
            }

            // Apply Randomize Instance immediately if enabled (before selection)
            // This ensures instance properties are set correctly
            if (randomizeNestedInstances) {
              await randomizeAllInstancesRecursively(clone, copyIndex);
            } else if (randomizeInstance) {
              // Only randomize the top-level instance
              let instance: InstanceNode | null = null;
              if (clone.type === 'INSTANCE') {
                instance = clone as InstanceNode;
              } else if (originalNode.type === 'INSTANCE') {
                instance = clone as unknown as InstanceNode;
              }

              if (instance) {
                await randomizeInstanceProperties(instance, copyIndex);
              } else {
                if (copyIndex === 0) {
                  figma.notify(`Selected node "${originalNode.name}" is not a component instance. Please select a component instance or use "Randomize Nested Instances".`, { error: true });
                }
              }
            }
            // Skip realityData here - will be applied after selection
          }
        }

        // Select all duplicated nodes
        if (duplicatedNodes.length > 0) {
          figma.currentPage.selection = duplicatedNodes;
        }

        // Apply Reality Data to selected duplicates if enabled (and no image provided)
        if (realityData && duplicatedNodes.length > 0 && !hasImage) {
          // For Reality Data, send request to UI for AI processing
          // The UI will handle this via AI agent
          figma.ui.postMessage({
            type: 'apply-reality-data-to-selection',
            nodeIds: duplicatedNodes.map(n => n.id)
          });
        }


        const appliedFeatures = [];
        if (sequentialFull) appliedFeatures.push('Sequential');
        if (realityData) appliedFeatures.push('Reality Data');
        if (randomizeInstance) appliedFeatures.push('Randomized');
        if (randomizeNestedInstances) appliedFeatures.push('Nested Randomized');
        if (customInstructions.length > 0) appliedFeatures.push('Custom');

        const featuresText = appliedFeatures.length > 0 ? ` (${appliedFeatures.join(', ')})` : '';

        figma.ui.postMessage({
          type: 'duplicate-complete',
          message: `Duplicated ${selection.length} node(s) with ${copiesToCreate} copy/copies each${featuresText}`,
          nodeIds: duplicatedNodes.map(n => n.id)
        });
      } catch (error) {
        console.error('Duplicate with instructions failed:', error);
        figma.ui.postMessage({
          type: 'error',
          message: 'Failed to duplicate nodes: ' + (error instanceof Error ? error.message : String(error))
        });
      }
      break;
    }

    case 'set-component-description': {
      const { description, nodeIds } = (msg as any) || {};
      const ids: string[] = Array.isArray(nodeIds) ? nodeIds : [];
      const hasDescription = typeof description === 'string';
      const cleanDescription = hasDescription ? description.trim() : '';

      if (!hasDescription || ids.length === 0) {
        figma.ui.postMessage({
          type: 'set-component-description-result',
          success: 0,
          failed: ids.length,
          message: 'No description applied (missing text or target components).'
        });
        break;
      }

      // Start new undo group for this operation
      figma.commitUndo();

      // Resolve targets to actual components/sets (handles instances and nested children)
      const targets = new Map<string, ComponentNode | ComponentSetNode>();

      const resolveTarget = async (node: SceneNode | null): Promise<ComponentNode | ComponentSetNode | null> => {
        if (!node) return null;
        if (node.type === 'COMPONENT' || node.type === 'COMPONENT_SET') return node;
        if (node.type === 'INSTANCE') {
          const main = await node.getMainComponentAsync();
          if (main) {
            return main.parent && main.parent.type === 'COMPONENT_SET'
              ? main.parent
              : main;
          }
        }
        // Walk ancestors to find nearest component or component set
        let parent = (node as any).parent as SceneNode | null;
        while (parent) {
          if (parent.type === 'COMPONENT' || parent.type === 'COMPONENT_SET') {
            return parent;
          }
          parent = (parent as any).parent || null;
        }
        return null;
      };

      for (const id of ids) {
        try {
          const node = await figma.getNodeByIdAsync(id) as SceneNode | null;
          const target = await resolveTarget(node);
          if (target) {
            targets.set(target.id, target);
          }
        } catch (err) {
          // ignore lookup errors
        }
      }

      let success = 0;
      let failed = 0;

      if (targets.size === 0) {
        figma.ui.postMessage({
          type: 'set-component-description-result',
          success: 0,
          failed: ids.length,
          message: 'No component description updated (no components resolved from selection).'
        });
        break;
      }

      for (const [, target] of targets) {
        try {
          target.description = cleanDescription || '';
          success++;
        } catch (err) {
          failed++;
        }
      }

      figma.ui.postMessage({
        type: 'set-component-description-result',
        success,
        failed
      });

      // Commit this operation to undo history
      figma.commitUndo();
      break;
    }

    case 'execute-commands': {
      const { commands = [], metadata } = msg as any;
      console.log('Received commands:', commands);
      let success = 0;
      let failed = 0;
      let firstError: { action?: string; nodeId?: string; message: string } | null = null;

      // Reset cancellation flag at the start of each batch
      executionCancelled = false;

      // Helper: yield control back to the main thread so Figma stays responsive.
      // Returns true if execution should be aborted (cancelled by UI).
      const yieldAndCheck = async (): Promise<boolean> => {
        await new Promise(resolve => setTimeout(resolve, 1));
        return executionCancelled;
      };

      // Clear persistent map only if explicitly requested at the start of a session
      if (metadata && metadata.sessionStart) {
        persistentCreatedNodes.clear();
      }

      // Track created nodes by reference ID or index for connector creation
      const createdNodes = persistentCreatedNodes;
      const createdNodesByName = new Map<string, BaseNode>();
      const nodesToSelect: SceneNode[] = [];
      const intendedRelativePositions = new Map<string, { x?: number, y?: number }>();
      const intendedParents = new Map<string, { parentId?: string, parentName?: string }>();

      // Pre-load common fonts to speed up initial text operations
      smartLoadFont({ family: "Inter", style: "Regular" }).catch(() => { });

      // Pass 0: Preflight Graph Analysis & Validation
      interface LayoutIntent {
        refId: string;
        action: string;
        parentId?: string;
        children: string[];
        layoutMode?: 'HORIZONTAL' | 'VERTICAL' | 'GRID' | 'NONE';
        horizontalSizing?: 'FILL' | 'HUG' | 'FIXED';
        verticalSizing?: 'FILL' | 'HUG' | 'FIXED';
        isAbsolute?: boolean;
        isRoot: boolean;
        isIcon: boolean;
        section?: string;
      }

      const intentMap = new Map<string, LayoutIntent>();
      const refIdSet = new Set<string>();

      // Initialize intent map and check for duplicate refIds
      for (const cmd of commands) {
        if (cmd.refId) {
          if (refIdSet.has(cmd.refId)) {
            figma.notify(`Error: Duplicate refId detected: ${cmd.refId}`, { error: true });
            return;
          }
          refIdSet.add(cmd.refId);

          const name = (cmd.name || '').toLowerCase();
          const shapeActions = new Set(['createEllipse', 'createPolygon', 'createStar', 'createLine', 'createNodeFromSvg', 'createVector']);
          const iconKeywords = ['icon', 'avatar', 'symbol', 'glyph', 'badge', 'notification', 'dot', 'indicator', 'chevron', 'arrow', 'status', 'mark'];
          const isIconByName = iconKeywords.some(kw => {
            if (name === kw) return true;
            if (name.startsWith(kw + ' ') || name.startsWith(kw + '-') || name.startsWith(kw + '_')) return true;
            if (name.endsWith(' ' + kw) || name.endsWith('-' + kw) || name.endsWith('_' + kw)) return true;
            return false;
          });
          intentMap.set(cmd.refId, {
            refId: cmd.refId,
            action: cmd.action,
            children: [],
            isRoot: name.includes('root') || name.includes('screen') || name.includes('page'),
            isIcon: isIconByName || shapeActions.has(cmd.action),
            section: cmd.section
          });
        }
      }

      // Build hierarchy in intent map and collect layout details
      for (const cmd of commands) {
        const pId = cmd.parentId;
        const cId = cmd.nodeId || cmd.refId;
        if (pId && cId) {
          const parentIntent = intentMap.get(pId);
          if (parentIntent) {
            // Avoid duplicate children if both a creation cmd and appendChild cmd exist
            if (!parentIntent.children.includes(cId)) {
              parentIntent.children.push(cId);
            }
            const childIntent = intentMap.get(cId);
            if (childIntent) childIntent.parentId = pId;
          }
        }
        if (cmd.action === 'setAutoLayout') {
          const intent = intentMap.get(cmd.nodeId || cmd.refId);
          if (intent) {
            const direction = (cmd.direction || 'VERTICAL').toUpperCase();
            if (direction === 'GRID') {
              intent.layoutMode = 'GRID';
            } else if (direction === 'HORIZONTAL' || direction === 'VERTICAL') {
              intent.layoutMode = direction;
            } else {
              intent.layoutMode = 'VERTICAL';
            }
          }
        }
        if (cmd.action === 'setSizing') {
          const intent = intentMap.get(cmd.nodeId || cmd.refId);
          if (intent) {
            if (cmd.horizontal) intent.horizontalSizing = cmd.horizontal;
            if (cmd.vertical) intent.verticalSizing = cmd.vertical;
            if (cmd.layoutPositioning === 'ABSOLUTE') intent.isAbsolute = true;
          }
        }
      }

      // Icon/Shape Protection: Downgrade FILL to FIXED for shape/icon nodes before conflict resolution
      for (const intent of intentMap.values()) {
        if (intent.isIcon) {
          if (intent.horizontalSizing === 'FILL') {
            intent.horizontalSizing = 'FIXED';
          }
          if (intent.verticalSizing === 'FILL') {
            intent.verticalSizing = 'FIXED';
          }
        }
      }

      // Conflict Resolution: Parent HUG / Child FILL
      for (const intent of intentMap.values()) {
        if (intent.layoutMode && intent.layoutMode !== 'NONE') {
          for (const childId of intent.children) {
            const childIntent = intentMap.get(childId);
            if (childIntent) {
              // Check horizontal conflict
              if (intent.horizontalSizing === 'HUG' && childIntent.horizontalSizing === 'FILL') {
                console.log(`Pass 0 Conflict: Promoting ${intent.refId} to FIXED to accommodate FILL child ${childIntent.refId}`);
                intent.horizontalSizing = 'FIXED';
              }
              // Check vertical conflict
              if (intent.verticalSizing === 'HUG' && childIntent.verticalSizing === 'FILL') {
                console.log(`Pass 0 Conflict: Promoting ${intent.refId} to FIXED to accommodate FILL child ${childIntent.refId}`);
                intent.verticalSizing = 'FIXED';
              }
            }
          }
        }
        // Mark actual roots (those with no parent in the graph)
        if (!intent.parentId) {
          intent.isRoot = true;
        }
      }

      // Helper to check if a node should have its position forced manually
      const shouldForcePosition = (node: SceneNode, parent: BaseNode & ChildrenMixin, cmd: any) => {
        // If parent is page, always allow manual positioning
        if (parent.type === 'PAGE') return true;

        // Check if parent is currently Auto Layout or will be
        const parentId = (parent as any).id;
        const parentRefId = (parent as any).getPluginData ? (parent as any).getPluginData('refId') : null;
        const parentIntent = intentMap.get(parentId) || intentMap.get(parentRefId) || (cmd.parentId ? intentMap.get(cmd.parentId) : null);

        const isParentAutoLayout = ('layoutMode' in parent && parent.layoutMode !== 'NONE') ||
          (parentIntent && parentIntent.layoutMode && parentIntent.layoutMode !== 'NONE');

        if (!isParentAutoLayout) return true;

        // If parent IS auto layout, only force position if child is absolute
        const nodeRefId = (node as any).getPluginData ? (node as any).getPluginData('refId') : null;
        const nodeIntent = intentMap.get(node.id) || intentMap.get(nodeRefId) || (cmd.nodeId || cmd.refId ? intentMap.get(cmd.nodeId || cmd.refId) : null);

        const isNodeAbsolute = (node as any).layoutPositioning === 'ABSOLUTE' || (nodeIntent && nodeIntent.isAbsolute);

        return isNodeAbsolute;
      };

      // Helper to register newly created node or style
      const registerCreatedNode = (node: any, refId?: string, name?: string) => {
        if (!node) return;
        if (refId) {
          createdNodes.set(refId, node);
          // Persist refId as plugin data so we can resolve it even if the Map is cleared
          if ('setPluginData' in node) {
            node.setPluginData('refId', refId);
          }
        }
        if (node.id) {
          createdNodes.set(node.id, node);
        }

        // Priority: Explicit name param -> node.name -> cmd.name (via external logic if needed)
        const finalName = name || (node && node.name);
        if (finalName) {
          createdNodesByName.set(finalName, node);
        }
      };

      // Helper to calculate bounding box of nodes
      const getNodesBounds = (nodes: SceneNode[]) => {
        if (nodes.length === 0) return { x: 0, y: 0, width: 0, height: 0 };

        let minX = Infinity;
        let minY = Infinity;
        let maxX = -Infinity;
        let maxY = -Infinity;

        for (const node of nodes) {
          const absTransform = node.absoluteTransform;
          const nx = absTransform[0][2];
          const ny = absTransform[1][2];
          const nw = node.width;
          const nh = node.height;

          minX = Math.min(minX, nx);
          minY = Math.min(minY, ny);
          maxX = Math.max(maxX, nx + nw);
          maxY = Math.max(maxY, ny + nh);
        }

        return {
          x: minX,
          y: minY,
          width: maxX - minX,
          height: maxY - minY
        };
      };

      // Helper to apply smart auto layout settings
      const applySmartAutoLayout = (frame: FrameNode, direction?: 'HORIZONTAL' | 'VERTICAL') => {
        let mode: 'HORIZONTAL' | 'VERTICAL' = direction || 'VERTICAL';

        const children = [...frame.children] as SceneNode[];
        if (children.length === 0) return;

        // Capture original positions to calculate padding accurately
        const childBounds = children.map(c => ({
          x: c.x,
          y: c.y,
          width: c.width,
          height: c.height
        }));

        if (!direction && children.length > 1) {
          const sortedByX = [...childBounds].sort((a, b) => a.x - b.x);
          const sortedByY = [...childBounds].sort((a, b) => a.y - b.y);

          let xDiffTotal = 0;
          let yDiffTotal = 0;
          for (let j = 0; j < children.length - 1; j++) {
            xDiffTotal += Math.abs(sortedByX[j + 1].x - (sortedByX[j].x + sortedByX[j].width));
            yDiffTotal += Math.abs(sortedByY[j + 1].y - (sortedByY[j].y + sortedByY[j].height));
          }
          if (xDiffTotal < yDiffTotal) mode = 'HORIZONTAL';
          else mode = 'VERTICAL';
        }

        // Sort children in the frame
        const sortedChildren = [...children].sort((a, b) => {
          return mode === 'VERTICAL' ? (a.y - b.y) : (a.x - b.x);
        });

        for (const child of sortedChildren) {
          frame.appendChild(child);
        }

        // Calculate actual gaps
        let gap = 0;
        if (sortedChildren.length > 1) {
          let totalGap = 0;
          let gapCount = 0;
          for (let i = 0; i < sortedChildren.length - 1; i++) {
            const current = sortedChildren[i];
            const next = sortedChildren[i + 1];
            let currentGap = 0;
            if (mode === 'VERTICAL') {
              currentGap = next.y - (current.y + current.height);
            } else {
              currentGap = next.x - (current.x + current.width);
            }
            totalGap += Math.max(0, currentGap);
            gapCount++;
          }
          gap = gapCount > 0 ? Math.round(totalGap / gapCount) : 0;
        }

        // Calculate padding from child positions
        const minX = Math.min(...childBounds.map(c => c.x));
        const minY = Math.min(...childBounds.map(c => c.y));
        const maxX = Math.max(...childBounds.map(c => c.x + c.width));
        const maxY = Math.max(...childBounds.map(c => c.y + c.height));

        const paddingLeft = Math.max(0, Math.round(minX));
        const paddingTop = Math.max(0, Math.round(minY));
        const paddingRight = Math.max(0, Math.round(frame.width - maxX));
        const paddingBottom = Math.max(0, Math.round(frame.height - maxY));

        frame.layoutMode = mode;
        frame.itemSpacing = gap;
        frame.paddingLeft = paddingLeft;
        frame.paddingTop = paddingTop;
        frame.paddingRight = paddingRight;
        frame.paddingBottom = paddingBottom;

        console.log(`[applySmartAutoLayout] ${frame.name}: padding=[${paddingTop}, ${paddingRight}, ${paddingBottom}, ${paddingLeft}], children=${children.length}`);

        frame.primaryAxisSizingMode = 'AUTO';
        frame.counterAxisSizingMode = 'AUTO';
        frame.primaryAxisAlignItems = 'MIN';
        frame.counterAxisAlignItems = 'MIN';

        console.log(`[applySmartAutoLayout] Applied to ${frame.name}: mode=${mode}, gap=${gap}, padding=[${paddingTop}, ${paddingRight}, ${paddingBottom}, ${paddingLeft}]`);
      };

      // Helper to detect layout direction for a group of nodes
      const detectLayoutDirection = (nodes: SceneNode[]): 'HORIZONTAL' | 'VERTICAL' => {
        if (nodes.length <= 1) return 'VERTICAL';

        // Calculate bounding box centers
        const nodeData = nodes.map(n => {
          const absX = n.absoluteTransform[0][2];
          const absY = n.absoluteTransform[1][2];
          return {
            node: n,
            centerX: absX + n.width / 2,
            centerY: absY + n.height / 2,
            left: absX,
            top: absY,
            right: absX + n.width,
            bottom: absY + n.height
          };
        });

        // Sort by X and Y to find the primary axis
        const sortedByX = [...nodeData].sort((a, b) => a.centerX - b.centerX);
        const sortedByY = [...nodeData].sort((a, b) => a.centerY - b.centerY);

        const xGaps: number[] = [];
        for (let i = 0; i < sortedByX.length - 1; i++) {
          xGaps.push(sortedByX[i + 1].left - sortedByX[i].right);
        }

        const yGaps: number[] = [];
        for (let i = 0; i < sortedByY.length - 1; i++) {
          yGaps.push(sortedByY[i + 1].top - sortedByY[i].bottom);
        }

        const minGapThreshold = 10;
        const xOverlapSignal = xGaps.some(g => g > minGapThreshold) && yGaps.some(g => g < 0);
        const yOverlapSignal = yGaps.some(g => g > minGapThreshold) && xGaps.some(g => g < 0);

        if (xOverlapSignal && !yOverlapSignal) return 'HORIZONTAL';
        if (yOverlapSignal && !xOverlapSignal) return 'VERTICAL';

        // Fallback to spread
        const xSpread = sortedByX[sortedByX.length - 1].centerX - sortedByX[0].centerX;
        const ySpread = sortedByY[sortedByY.length - 1].centerY - sortedByY[0].centerY;

        return xSpread > ySpread ? 'HORIZONTAL' : 'VERTICAL';
      };

      // Helper to cluster nodes into spatial groups
      const clusterNodesIntoGroups = (nodes: SceneNode[]): { groups: SceneNode[][], direction: 'HORIZONTAL' | 'VERTICAL' } => {
        if (nodes.length <= 1) return { groups: [nodes], direction: 'VERTICAL' };

        // For exactly 2 nodes, check if they need to be separate groups
        // (e.g., side-by-side with significant offset on counter-axis)
        if (nodes.length === 2) {
          const n0 = nodes[0];
          const n1 = nodes[1];
          const n0AbsX = n0.absoluteTransform[0][2];
          const n0AbsY = n0.absoluteTransform[1][2];
          const n1AbsX = n1.absoluteTransform[0][2];
          const n1AbsY = n1.absoluteTransform[1][2];

          const xGap = Math.max(n1AbsX - (n0AbsX + n0.width), n0AbsX - (n1AbsX + n1.width));
          const yGap = Math.max(n1AbsY - (n0AbsY + n0.height), n0AbsY - (n1AbsY + n1.height));

          // If there's a significant gap, treat as 2 clusters
          if (xGap > 10 || yGap > 10) {
            console.log(`[clusterNodes] 2 nodes with gap: xGap=${xGap.toFixed(1)}, yGap=${yGap.toFixed(1)} - treating as 2 clusters`);
            // Sort by position
            if (xGap > yGap) {
              // Horizontal layout - sort by X
              return { groups: n0AbsX < n1AbsX ? [[n0], [n1]] : [[n1], [n0]], direction: 'HORIZONTAL' };
            } else {
              // Vertical layout - sort by Y
              return { groups: n0AbsY < n1AbsY ? [[n0], [n1]] : [[n1], [n0]], direction: 'VERTICAL' };
            }
          }
        }

        // Get node positions
        const nodeData = nodes.map(n => {
          const absX = n.absoluteTransform[0][2];
          const absY = n.absoluteTransform[1][2];
          return {
            node: n,
            centerX: absX + n.width / 2,
            centerY: absY + n.height / 2,
            left: absX,
            top: absY,
            right: absX + n.width,
            bottom: absY + n.height,
            width: n.width,
            height: n.height
          };
        });

        // Try BOTH horizontal and vertical clustering

        // === Horizontal gaps (left/right groups) ===
        const sortedByX = [...nodeData].sort((a, b) => a.centerX - b.centerX);
        const xGaps: number[] = [];
        for (let i = 0; i < sortedByX.length - 1; i++) {
          xGaps.push(sortedByX[i + 1].left - sortedByX[i].right);
        }

        // === Vertical gaps (top/bottom groups) ===
        const sortedByY = [...nodeData].sort((a, b) => a.centerY - b.centerY);
        const yGaps: number[] = [];
        for (let i = 0; i < sortedByY.length - 1; i++) {
          yGaps.push(sortedByY[i + 1].top - sortedByY[i].bottom);
        }

        const minGapThreshold = 10;

        // Determine the primary clustering axis
        const maxXGap = xGaps.length > 0 ? Math.max(...xGaps) : 0;
        const maxYGap = yGaps.length > 0 ? Math.max(...yGaps) : 0;

        // Special overlapping signals
        const xOverlapSignal = xGaps.some(g => g > minGapThreshold) && yGaps.some(g => g < 0);
        const yOverlapSignal = yGaps.some(g => g > minGapThreshold) && xGaps.some(g => g < 0);

        let direction: 'HORIZONTAL' | 'VERTICAL' = 'HORIZONTAL';
        if (xOverlapSignal && !yOverlapSignal) direction = 'HORIZONTAL';
        else if (yOverlapSignal && !xOverlapSignal) direction = 'VERTICAL';
        else direction = maxXGap > maxYGap ? 'HORIZONTAL' : 'VERTICAL';

        const selectedSorted = direction === 'HORIZONTAL' ? sortedByX : sortedByY;
        const selectedGaps = direction === 'HORIZONTAL' ? xGaps : yGaps;

        // Find split points. A gap is a split point if it's "significantly" larger than the other gaps.
        const splitIndices: number[] = [];

        if (selectedGaps.length > 1) {
          const avgGap = selectedGaps.reduce((sum, g) => sum + Math.max(0, g), 0) / selectedGaps.length;

          for (let i = 0; i < selectedGaps.length; i++) {
            const gap = selectedGaps[i];
            // A gap is significant if it's much larger than the average gap
            // and exceeds the minimum threshold.
            if (gap > minGapThreshold && gap > avgGap * 1.5) {
              splitIndices.push(i);
            }
          }
        } else if (selectedGaps.length === 1) {
          // For exactly two groups of nodes, just check if the gap is significant
          if (selectedGaps[0] > minGapThreshold) {
            splitIndices.push(0);
          }
        }

        if (splitIndices.length === 0) {
          console.log(`Clustering: No significant gaps found on ${direction} axis.`);
          return { groups: [nodes], direction };
        }

        console.log(`Clustering: Found ${splitIndices.length} split points on ${direction} axis.`);
        const groups: SceneNode[][] = [];
        let lastSplit = -1;
        for (const splitIndex of splitIndices) {
          groups.push(selectedSorted.slice(lastSplit + 1, splitIndex + 1).map(d => d.node));
          lastSplit = splitIndex;
        }
        groups.push(selectedSorted.slice(lastSplit + 1).map(d => d.node));

        return { groups, direction };
      };

      // Helper to wrap nodes in an auto layout frame (Recursive)
      const wrapNodesInAutoLayoutFrame = (nodes: SceneNode[], parent: BaseNode & ChildrenMixin, name: string, outerBounds?: { x: number, y: number, width: number, height: number }, outerDirection?: 'HORIZONTAL' | 'VERTICAL'): FrameNode => {
        const bounds = getNodesBounds(nodes);
        const frame = figma.createFrame();

        const absX = bounds.x;
        const absY = bounds.y;

        // Calculate the relative offset from outer bounds BEFORE any frame manipulation
        let relativeOffsetTop = 0;
        let relativeOffsetLeft = 0;
        if (outerBounds && outerDirection) {
          if (outerDirection === 'HORIZONTAL') {
            relativeOffsetTop = Math.max(0, Math.round(absY - outerBounds.y));
          } else if (outerDirection === 'VERTICAL') {
            relativeOffsetLeft = Math.max(0, Math.round(absX - outerBounds.x));
          }
        }

        console.log(`[wrapNodes] ${name}: absY=${absY}, outerBounds.y=${outerBounds?.y}, relativeOffsetTop=${relativeOffsetTop}`);

        parent.appendChild(frame);

        const parentAbsX = (parent as any).absoluteTransform ? (parent as any).absoluteTransform[0][2] : 0;
        const parentAbsY = (parent as any).absoluteTransform ? (parent as any).absoluteTransform[1][2] : 0;

        frame.x = absX - parentAbsX;
        frame.y = absY - parentAbsY;
        frame.resize(Math.max(bounds.width, 1), Math.max(bounds.height, 1));
        frame.name = name;
        frame.fills = []; // Transparent background

        // Check for nested clusters
        const { groups: clusters, direction: innerDirection } = clusterNodesIntoGroups(nodes);

        if (clusters.length > 1) {
          // Multiple clusters found: use the direction detected by clustering
          // Wrap each cluster recursively
          for (let i = 0; i < clusters.length; i++) {
            wrapNodesInAutoLayoutFrame(clusters[i], frame, `Group ${i + 1}`, bounds, innerDirection);
          }

          // Apply auto layout to this frame
          applySmartAutoLayout(frame, innerDirection);
        } else {
          // Base case: no more clusters, just add nodes and apply AL
          const direction = detectLayoutDirection(nodes);

          // Sort nodes by position: top-to-bottom for VERTICAL, left-to-right for HORIZONTAL
          const sortedNodes = [...nodes].sort((a, b) => {
            const aAbsX = a.absoluteTransform[0][2];
            const aAbsY = a.absoluteTransform[1][2];
            const bAbsX = b.absoluteTransform[0][2];
            const bAbsY = b.absoluteTransform[1][2];

            if (direction === 'VERTICAL') {
              return aAbsY - bAbsY;
            } else {
              return aAbsX - bAbsX;
            }
          });

          // Move nodes into frame
          for (const node of sortedNodes) {
            const nAbsX = node.absoluteTransform[0][2];
            const nAbsY = node.absoluteTransform[1][2];
            frame.appendChild(node);
            node.x = nAbsX - frame.absoluteTransform[0][2];
            node.y = nAbsY - frame.absoluteTransform[1][2];
          }

          // Apply auto layout - but we need to add the relative offset as padding
          // Calculate gap first
          let gap = 0;
          if (sortedNodes.length > 1) {
            let totalGap = 0;
            for (let i = 0; i < sortedNodes.length - 1; i++) {
              const current = sortedNodes[i];
              const next = sortedNodes[i + 1];
              if (direction === 'VERTICAL') {
                totalGap += Math.max(0, next.y - (current.y + current.height));
              } else {
                totalGap += Math.max(0, next.x - (current.x + current.width));
              }
            }
            gap = Math.round(totalGap / (sortedNodes.length - 1));
          }

          // Apply layout mode first
          frame.layoutMode = direction;
          frame.itemSpacing = gap;
          frame.primaryAxisSizingMode = 'AUTO';
          frame.counterAxisSizingMode = 'AUTO';
          frame.primaryAxisAlignItems = 'MIN';
          frame.counterAxisAlignItems = 'MIN';

          // Set padding with the relative offset included
          frame.paddingTop = relativeOffsetTop;
          frame.paddingLeft = relativeOffsetLeft;
          frame.paddingRight = 0;
          frame.paddingBottom = 0;

          console.log(`[wrapNodes] ${name}: Applied paddingTop=${relativeOffsetTop}, paddingLeft=${relativeOffsetLeft}`);
        }

        // For clustered frames, also apply the relative offset
        if (clusters.length > 1 && (relativeOffsetTop > 0 || relativeOffsetLeft > 0)) {
          frame.paddingTop = Math.max(frame.paddingTop, relativeOffsetTop);
          frame.paddingLeft = Math.max(frame.paddingLeft, relativeOffsetLeft);
          console.log(`[wrapNodes] ${name}: Updated clustered frame paddingTop=${frame.paddingTop}, paddingLeft=${frame.paddingLeft}`);
        }

        return frame;
      };

      let stickyCreationIndex = 0;

      // Start new undo group for this batch of commands
      figma.commitUndo();

      // Use the viewport center as the default drop point when no x/y is provided,
      // and center batches that come in with origin-based layouts (e.g., quick actions)
      const viewportCenter = figma.viewport.center;

      // Get current selection for smart positioning (especially for FigJam)
      const currentSelection = figma.currentPage.selection;
      const firstSelectedNode = currentSelection.length > 0 ? currentSelection[0] : null;

      // Rough default sizes for centering groups when width/height are absent
      const getDefaultSize = (cmd: any) => {
        const isStructural = !!cmd.refId;
        switch (cmd.action) {
          case 'createSection':
            return { width: cmd.width || 800, height: cmd.height || 600 };
          case 'createPage':
            return { width: 0, height: 0 };
          case 'createNodeFromSvg':
            return { width: 0, height: 0 };
          case 'createRectangle':
            return { width: cmd.width || 100, height: cmd.height || 100 };
          case 'createEllipse':
            return { width: cmd.width || 100, height: cmd.height || 100 };
          case 'createText':
            return { width: 0, height: 0 };
          case 'createFrame':
            if (isStructural && !cmd.width && !cmd.height) return { width: 1, height: 1 };
            return { width: cmd.width || 100, height: cmd.height || 100 };
          case 'createPolygon':
            return { width: cmd.width || 100, height: cmd.height || 100 };
          case 'createStar':
            return { width: cmd.width || 100, height: cmd.height || 100 };
          case 'createLine':
            return { width: cmd.length || 100, height: 0 };
          case 'createSticky':
            return { width: 160, height: 120 };
          case 'createShapeWithText':
            return { width: cmd.width || 100, height: cmd.height || 100 };
          case 'createButtonComponent':
            return { width: cmd.width || 120, height: cmd.height || 40 };
          default:
            return { width: 0, height: 0 };
        }
      };

      const createActions = new Set([
        'createSection',
        'createPage',
        'createTable',
        'duplicate',
        'createInstance',
        'createNodeFromSvg',
        'createRectangle',
        'createEllipse',
        'createText',
        'createFrame',
        'createPolygon',
        'createStar',
        'createLine',
        'createSticky',
        'createShapeWithText',
        'createButtonComponent'
      ]);

      // Detect origin-based batch layouts (like quick actions) and center the whole batch
      const originAlignedCreates = (commands as any[]).filter(c => createActions.has(c.action));
      let groupOffset = { x: 0, y: 0 };
      let shouldGroupRectangles = false;
      if (originAlignedCreates.length > 1) {
        let minX = Number.POSITIVE_INFINITY;
        let minY = Number.POSITIVE_INFINITY;
        let maxX = Number.NEGATIVE_INFINITY;
        let maxY = Number.NEGATIVE_INFINITY;

        // Check if all commands are createRectangle (indicates "Create grid" action)
        const allRectangles = originAlignedCreates.every(c => c.action === 'createRectangle');
        shouldGroupRectangles = allRectangles && originAlignedCreates.length > 1;

        for (const c of originAlignedCreates) {
          const size = getDefaultSize(c);
          const px = c.x !== undefined && c.x !== null ? c.x : 0;
          const py = c.y !== undefined && c.y !== null ? c.y : 0;
          minX = Math.min(minX, px);
          minY = Math.min(minY, py);
          maxX = Math.max(maxX, px + size.width);
          maxY = Math.max(maxY, py + size.height);
        }

        // If the batch is anchored at origin (0,0), treat it as relative layout and center it
        if (minX === 0 && minY === 0) {
          const groupCenterX = (minX + maxX) / 2;
          const groupCenterY = (minY + maxY) / 2;
          groupOffset = {
            x: viewportCenter.x - groupCenterX,
            y: viewportCenter.y - groupCenterY
          };
        }
      }

      const getDefaultPosition = (cmd: any, size?: { width: number, height: number }) => {
        const width = size?.width ?? 0;
        const height = size?.height ?? 0;
        const xProvided = 'x' in cmd && cmd.x !== null && cmd.x !== undefined;
        const yProvided = 'y' in cmd && cmd.y !== null && cmd.y !== undefined;
        const explicitZeroOrigin = xProvided && yProvided && cmd.x === 0 && cmd.y === 0;

        // If batch centering is active (origin-aligned), apply group offset to provided coords or 0
        if (groupOffset.x !== 0 || groupOffset.y !== 0) {
          const baseX = xProvided ? cmd.x : 0;
          const baseY = yProvided ? cmd.y : 0;
          return { x: baseX + groupOffset.x, y: baseY + groupOffset.y };
        }

        // Smart positioning for FigJam nodes (sticky, connector, shapeWithText) based on selection
        // Apply smart positioning only when explicit coordinates are NOT provided (or are explicitly 0,0)
        // This allows explicit positioning to override smart positioning when needed (e.g., affinity mapping)
        const isFigJamNode = cmd.action === 'createSticky' || cmd.action === 'createConnector' || cmd.action === 'createShapeWithText';
        if (isFigJamNode) {
          // Only apply smart positioning if coordinates are not explicitly provided, or are explicitly 0,0
          const shouldUseSmartPositioning = !xProvided || !yProvided || explicitZeroOrigin;

          if (shouldUseSmartPositioning && firstSelectedNode) {
            // Selection exists - apply smart positioning rules
            const nodeType = firstSelectedNode.type;
            const nodeWidth = 'width' in firstSelectedNode ? firstSelectedNode.width : 0;
            const nodeHeight = 'height' in firstSelectedNode ? firstSelectedNode.height : 0;

            // Get absolute position for accurate positioning
            const absTransform = firstSelectedNode.absoluteTransform;
            const absX = absTransform[0][2];
            const absY = absTransform[1][2];

            // If selection is SECTION or GROUP, position inside it (centered)
            if (nodeType === 'SECTION' || nodeType === 'GROUP') {
              const centerX = absX + nodeWidth / 2;
              const centerY = absY + nodeHeight / 2;
              return { x: centerX - width / 2, y: centerY - height / 2 };
            }

            // For other nodes (not section/group), check aspect ratio
            if (nodeWidth > nodeHeight) {
              // Width > Height: position below the selection
              const spacing = 20;
              return { x: absX, y: absY + nodeHeight + spacing };
            } else if (nodeHeight > nodeWidth) {
              // Height > Width: position to the right of the selection
              const spacing = 20;
              return { x: absX + nodeWidth + spacing, y: absY };
            }
            // If equal dimensions, fall through to viewport center
          }
          // If explicit coordinates provided and not 0,0, use them (fall through to default handling below)
          // No selection - center in viewport (fall through to default centering)
        }

        // Otherwise, fallback to centering single nodes when coords are missing or explicitly 0,0
        let x = !xProvided || explicitZeroOrigin ? viewportCenter.x - width / 2 : cmd.x;
        let y = !yProvided || explicitZeroOrigin ? viewportCenter.y - height / 2 : cmd.y;

        // Apply additional relative offsets if provided (useful for variations)
        if (cmd.offsetX !== undefined) x += cmd.offsetX;
        if (cmd.offsetY !== undefined) y += cmd.offsetY;

        return { x, y };
      };

      // Helper to parse hex color (supports #RGB, #RRGGBB, #RRGGBBAA)
      const parseHexColor = (hex: string) => {
        if (!hex || typeof hex !== 'string') return { r: 0, g: 0, b: 0, a: 1 };
        let cleanHex = hex.trim().replace('#', '');
        if (cleanHex.length === 3) {
          cleanHex = cleanHex.split('').map(ch => ch + ch).join(''); // expand #RGB to #RRGGBB
        }
        if (cleanHex.length === 6) {
          cleanHex = `${cleanHex}FF`; // add alpha if missing
        }
        if (cleanHex.length !== 8) return { r: 0, g: 0, b: 0, a: 1 };
        const r = parseInt(cleanHex.substring(0, 2), 16) / 255;
        const g = parseInt(cleanHex.substring(2, 4), 16) / 255;
        const b = parseInt(cleanHex.substring(4, 6), 16) / 255;
        const a = parseInt(cleanHex.substring(6, 8), 16) / 255;
        return { r, g, b, a };
      };

      const normalizeHex = (hex?: string) => {
        if (!hex) return null;
        const clean = hex.replace('#', '').trim();
        if (clean.length === 3) {
          const [r, g, b] = clean.split('');
          return `#${r}${r}${g}${g}${b}${b}`.toUpperCase();
        }
        if (clean.length === 6 || clean.length === 8) {
          return `#${clean}`.toUpperCase();
        }
        return null;
      };

      const colorsEqual = (a: RGB | RGBA, b: RGBA) => {
        const EPS = 0.0001;
        return (
          Math.abs(a.r - b.r) < EPS &&
          Math.abs(a.g - b.g) < EPS &&
          Math.abs(a.b - b.b) < EPS &&
          Math.abs(((a as RGBA).a ?? 1) - (b.a ?? 1)) < EPS
        );
      };

      const swapColorsInPaints = (
        paints: Paint[],
        from: RGBA,
        to: RGBA,
        includeGradients: boolean
      ): { updated: boolean; paints: Paint[]; found: boolean } => {
        let updated = false;
        let found = false;

        const nextPaints = paints.map((paint) => {
          if (paint.type === 'SOLID') {
            const solid = paint as SolidPaint;
            if (colorsEqual(solid.color, from)) {
              found = true;
              updated = true;
              const solidOpacity = (solid as any).opacity ?? 1;
              const nextOpacity = to.a !== undefined ? to.a : solidOpacity;
              return {
                ...solid,
                color: {
                  r: to.r,
                  g: to.g,
                  b: to.b
                },
                opacity: nextOpacity
              } as SolidPaint;
            }
            return paint;
          }

          if (
            includeGradients &&
            (paint.type === 'GRADIENT_LINEAR' ||
              paint.type === 'GRADIENT_RADIAL' ||
              paint.type === 'GRADIENT_ANGULAR' ||
              paint.type === 'GRADIENT_DIAMOND')
          ) {
            const gradient = paint as GradientPaint;
            let stopChanged = false;
            const newStops = gradient.gradientStops.map((stop) => {
              if (colorsEqual(stop.color, from)) {
                found = true;
                stopChanged = true;
                return {
                  ...stop,
                  color: {
                    r: to.r,
                    g: to.g,
                    b: to.b,
                    a: to.a !== undefined ? to.a : stop.color.a
                  }
                };
              }
              return stop;
            });
            if (stopChanged) {
              updated = true;
              return {
                ...gradient,
                gradientStops: newStops
              } as GradientPaint;
            }
            return paint;
          }

          return paint;
        });

        return { updated, paints: nextPaints, found };
      };

      const swapColorsInPaintsTwoWay = (
        paints: Paint[],
        a: RGBA,
        b: RGBA,
        includeGradients: boolean
      ): { updated: boolean; paints: Paint[]; foundA: boolean; foundB: boolean } => {
        let updated = false;
        let foundA = false;
        let foundB = false;

        const nextPaints = paints.map((paint) => {
          if (paint.type === 'SOLID') {
            const solid = paint as SolidPaint;
            if (colorsEqual(solid.color, a)) {
              foundA = true;
              updated = true;
              const solidOpacity = (solid as any).opacity ?? 1;
              const nextOpacity = b.a !== undefined ? b.a : solidOpacity;
              return {
                ...solid,
                color: { r: b.r, g: b.g, b: b.b },
                opacity: nextOpacity
              } as SolidPaint;
            }
            if (colorsEqual(solid.color, b)) {
              foundB = true;
              updated = true;
              const solidOpacity = (solid as any).opacity ?? 1;
              const nextOpacity = a.a !== undefined ? a.a : solidOpacity;
              return {
                ...solid,
                color: { r: a.r, g: a.g, b: a.b },
                opacity: nextOpacity
              } as SolidPaint;
            }
            return paint;
          }

          if (
            includeGradients &&
            (paint.type === 'GRADIENT_LINEAR' ||
              paint.type === 'GRADIENT_RADIAL' ||
              paint.type === 'GRADIENT_ANGULAR' ||
              paint.type === 'GRADIENT_DIAMOND')
          ) {
            const gradient = paint as GradientPaint;
            let stopChanged = false;
            const newStops = gradient.gradientStops.map((stop) => {
              if (colorsEqual(stop.color, a)) {
                foundA = true;
                stopChanged = true;
                return {
                  ...stop,
                  color: {
                    r: b.r,
                    g: b.g,
                    b: b.b,
                    a: b.a !== undefined ? b.a : stop.color.a
                  }
                };
              }
              if (colorsEqual(stop.color, b)) {
                foundB = true;
                stopChanged = true;
                return {
                  ...stop,
                  color: {
                    r: a.r,
                    g: a.g,
                    b: a.b,
                    a: a.a !== undefined ? a.a : stop.color.a
                  }
                };
              }
              return stop;
            });
            if (stopChanged) {
              updated = true;
              return {
                ...gradient,
                gradientStops: newStops
              } as GradientPaint;
            }
            return paint;
          }

          return paint;
        });

        return { updated, paints: nextPaints, foundA, foundB };
      };

      const swapColorsInEffects = (
        effects: ReadonlyArray<Effect>,
        from: RGBA,
        to: RGBA
      ): { updated: boolean; effects: Effect[]; found: boolean } => {
        let updated = false;
        let found = false;
        const next = effects.map((effect) => {
          if (
            (effect.type === 'DROP_SHADOW' || effect.type === 'INNER_SHADOW') &&
            effect.color &&
            colorsEqual(effect.color, from)
          ) {
            found = true;
            updated = true;
            const nextColor: RGBA = {
              r: to.r,
              g: to.g,
              b: to.b,
              a: to.a !== undefined ? to.a : effect.color.a
            };
            return { ...effect, color: nextColor };
          }
          return effect;
        });
        return { updated, effects: next, found };
      };

      const swapColorsInEffectsTwoWay = (
        effects: ReadonlyArray<Effect>,
        a: RGBA,
        b: RGBA
      ): { updated: boolean; effects: Effect[]; foundA: boolean; foundB: boolean } => {
        let updated = false;
        let foundA = false;
        let foundB = false;
        const next = effects.map((effect) => {
          if (
            (effect.type === 'DROP_SHADOW' || effect.type === 'INNER_SHADOW') &&
            effect.color
          ) {
            if (colorsEqual(effect.color, a)) {
              foundA = true;
              updated = true;
              const nextColor: RGBA = {
                r: b.r,
                g: b.g,
                b: b.b,
                a: b.a !== undefined ? b.a : effect.color.a
              };
              return { ...effect, color: nextColor };
            }
            if (colorsEqual(effect.color, b)) {
              foundB = true;
              updated = true;
              const nextColor: RGBA = {
                r: a.r,
                g: a.g,
                b: a.b,
                a: a.a !== undefined ? a.a : effect.color.a
              };
              return { ...effect, color: nextColor };
            }
          }
          return effect;
        });
        return { updated, effects: next, foundA, foundB };
      };

      const resolveComponentTarget = async (n: SceneNode | null): Promise<ComponentNode | ComponentSetNode | null> => {
        if (!n) return null;
        if (n.type === 'COMPONENT' || n.type === 'COMPONENT_SET') return n;
        if (n.type === 'INSTANCE') {
          const main = await n.getMainComponentAsync();
          if (main) {
            return main.parent && main.parent.type === 'COMPONENT_SET'
              ? main.parent
              : main;
          }
        }
        let parent = (n as any).parent as SceneNode | null;
        while (parent) {
          if (parent.type === 'COMPONENT' || parent.type === 'COMPONENT_SET') {
            return parent;
          }
          parent = (parent as any).parent || null;
        }
        return null;
      };

      const collectUsedComponentPropertyNames = (target: ComponentNode | ComponentSetNode): Set<string> => {
        const used = new Set<string>();

        const collectFromNode = (n: SceneNode) => {
          const refs = (n as any).componentPropertyReferences as Record<string, string> | undefined;
          if (refs && typeof refs === 'object') {
            for (const propName of Object.values(refs)) {
              used.add(propName);
            }
          }

          if ('children' in n && Array.isArray((n as any).children)) {
            for (const child of (n as ChildrenMixin).children) {
              collectFromNode(child as SceneNode);
            }
          }
        };

        const roots = target.type === 'COMPONENT_SET'
          ? (target.children.filter(child => child.type === 'COMPONENT') as ComponentNode[])
          : [target];

        for (const root of roots) {
          collectFromNode(root);
        }

        return used;
      };

      const removeUnusedComponentProperties = (target: ComponentNode | ComponentSetNode): { removed: string[] } => {
        const defs = target.componentPropertyDefinitions;
        if (!defs) return { removed: [] };

        const used = collectUsedComponentPropertyNames(target);
        const removed: string[] = [];

        for (const [name, def] of Object.entries(defs)) {
          if (def.type !== 'VARIANT' && !used.has(name)) {
            removed.push(name);
          }
        }

        for (const name of removed) {
          try {
            target.deleteComponentProperty(name);
          } catch (e) {
            console.warn(`Failed to remove property ${name}:`, e);
          }
        }

        return { removed };
      };

      // Find substring range with simple and reliable matching
      // Priority: exact match > case-insensitive > normalized (NFKC) > trimmed
      const findTextRange = (
        fullText: string,
        query: string,
        occurrence: number = 0
      ): { start: number; end: number } | null => {
        if (!query || !fullText) return null;

        // Strip common surrounding quotes from query
        const stripQuotes = (s: string) =>
          s.replace(/^[\"'""''「『【（(﹁]+/, '').replace(/[\"'""''」』】）)﹂]+$/, '');

        // Helper: find nth occurrence of needle in haystack, return { start, end } or null
        const findNth = (haystack: string, needle: string, n: number): { start: number; end: number } | null => {
          let from = 0;
          let idx = -1;
          for (let i = 0; i <= n; i++) {
            idx = haystack.indexOf(needle, from);
            if (idx === -1) return null;
            from = idx + 1; // move past this match for next iteration
          }
          return { start: idx, end: idx + needle.length };
        };

        // Candidate queries: original, quote-stripped, trimmed
        const candidates = [
          query,
          stripQuotes(query),
          query.trim(),
          stripQuotes(query).trim()
        ].filter((c, i, arr) => c && arr.indexOf(c) === i); // unique non-empty

        // Attempt 1: Exact match (fastest and most reliable)
        for (const cand of candidates) {
          const match = findNth(fullText, cand, occurrence);
          if (match) return match;
        }

        // Attempt 2: Case-insensitive match (for mixed EN/JP with Latin chars)
        const fullTextLower = fullText.toLowerCase();
        for (const cand of candidates) {
          const candLower = cand.toLowerCase();
          const matchLower = findNth(fullTextLower, candLower, occurrence);
          if (matchLower) {
            // Return indices into original fullText (same positions since toLowerCase preserves length for BMP chars)
            return matchLower;
          }
        }

        // Attempt 3: NFKC normalized match (handles full/half width: ０１２ vs 012, Ａ vs A)
        const fullTextNFKC = fullText.normalize('NFKC');
        // Build a mapping from NFKC positions back to original positions
        // This handles cases where NFKC might change character lengths
        const nfkcToOriginal: number[] = [];
        {
          let origIdx = 0;
          const origChars = [...fullText];
          for (let i = 0; i < origChars.length; i++) {
            const origChar = origChars[i];
            const normChar = origChar.normalize('NFKC');
            const normLen = [...normChar].length; // count codepoints in normalized form
            for (let j = 0; j < normLen; j++) {
              nfkcToOriginal.push(i);
            }
            origIdx++;
          }
        }

        for (const cand of candidates) {
          const candNFKC = cand.normalize('NFKC');
          const matchNFKC = findNth(fullTextNFKC, candNFKC, occurrence);
          if (matchNFKC) {
            // Map back to original positions
            const origStart = nfkcToOriginal[matchNFKC.start] ?? 0;
            // For end, we need the character AFTER the last matched char
            const lastMatchedNFKCIdx = matchNFKC.end - 1;
            const origLastChar = nfkcToOriginal[lastMatchedNFKCIdx] ?? (fullText.length - 1);
            const origEnd = origLastChar + 1;
            return { start: origStart, end: origEnd };
          }
        }

        // Attempt 4: Case-insensitive NFKC
        const fullTextNFKCLower = fullTextNFKC.toLowerCase();
        for (const cand of candidates) {
          const candNFKCLower = cand.normalize('NFKC').toLowerCase();
          const matchNFKCLower = findNth(fullTextNFKCLower, candNFKCLower, occurrence);
          if (matchNFKCLower) {
            const origStart = nfkcToOriginal[matchNFKCLower.start] ?? 0;
            const lastMatchedNFKCIdx = matchNFKCLower.end - 1;
            const origLastChar = nfkcToOriginal[lastMatchedNFKCIdx] ?? (fullText.length - 1);
            const origEnd = origLastChar + 1;
            return { start: origStart, end: origEnd };
          }
        }

        return null;
      };

      // Decode base64 (with optional data URL prefix) to bytes for image APIs
      const base64ToBytes = (base64: any): Uint8Array => {
        if (base64 instanceof Uint8Array) return base64;
        if (typeof base64 !== 'string' || !base64) return new Uint8Array(0);

        const cleaned = base64.replace(/^data:[^,]+,/, '').replace(/\s/g, '');
        const base64Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

        const len = cleaned.length;
        if (len === 0) return new Uint8Array(0);

        let bufferLength = len * 0.75;
        if (cleaned.endsWith('==')) bufferLength -= 2;
        else if (cleaned.endsWith('=')) bufferLength -= 1;

        const bytes = new Uint8Array(Math.floor(bufferLength));
        let p = 0;
        for (let i = 0; i < len; i += 4) {
          const encoded1 = base64Chars.indexOf(cleaned[i]);
          const encoded2 = base64Chars.indexOf(cleaned[i + 1]);
          const encoded3 = i + 2 < len ? base64Chars.indexOf(cleaned[i + 2]) : -1;
          const encoded4 = i + 3 < len ? base64Chars.indexOf(cleaned[i + 3]) : -1;

          const byte1 = (encoded1 << 2) | (encoded2 >> 4);
          const byte2 = ((encoded2 & 15) << 4) | (encoded3 >> 2);
          const byte3 = ((encoded3 & 3) << 6) | encoded4;

          if (p < bytes.length) bytes[p++] = byte1;
          if (encoded3 !== -1 && encoded3 !== 64 && p < bytes.length) bytes[p++] = byte2;
          if (encoded4 !== -1 && encoded4 !== 64 && p < bytes.length) bytes[p++] = byte3;
        }
        return bytes;
      };

      // Build prototyping trigger
      const buildTrigger = (triggerInput: any): Trigger => {
        const type = (triggerInput?.type || 'ON_CLICK') as Trigger['type'];
        const trigger: any = { type };
        if (type === 'AFTER_TIMEOUT' && typeof triggerInput?.timeout === 'number') {
          trigger.timeout = triggerInput.timeout;
        }
        if (type === 'ON_KEY_DOWN' && Array.isArray(triggerInput?.keyCodes)) {
          trigger.keyCodes = triggerInput.keyCodes;
          if (Array.isArray(triggerInput?.modifiers)) {
            trigger.modifiers = triggerInput.modifiers;
          }
        }
        return trigger as Trigger;
      };

      // Build transition used in prototyping actions
      const buildTransition = (transitionInput: any): Transition => {
        // Default to SMART_ANIMATE 300ms ease-out
        const defaultTransition: Transition = {
          type: 'SMART_ANIMATE',
          duration: 0.3,
          easing: { type: 'EASE_OUT' }
        };

        if (!transitionInput) return defaultTransition;

        const { type, duration, direction, easing } = transitionInput;
        const base: any = {
          type: type || 'SMART_ANIMATE',
          duration: typeof duration === 'number' ? duration : 0.3
        };
        if (direction) base.direction = direction;
        if (easing) {
          base.easing = {
            type: easing.type || 'EASE_OUT',
            easingFunctionCubicBezier: easing.easingFunctionCubicBezier
          };
        } else {
          base.easing = defaultTransition.easing;
        }
        return base as Transition;
      };

      // Build prototyping action
      const buildAction = (actionInput: any): Action | null => {
        if (!actionInput || !actionInput.type) return null;
        const type = actionInput.type;

        if (type === 'NAVIGATE' || type === 'NODE' || type === 'OVERLAY' || type === 'SWAP') {
          if (!actionInput.destinationId) return null;
          const navigation = (actionInput.navigation ||
            (type === 'OVERLAY' ? 'OVERLAY' : 'NAVIGATE')) as
            | 'NAVIGATE'
            | 'OVERLAY'
            | 'SWAP'
            | 'REPLACE'
            | 'CHANGE_TO';
          const action: any = {
            type: 'NODE',
            destinationId: actionInput.destinationId,
            navigation
          };
          const transition = buildTransition(actionInput.transition);
          if (transition) action.transition = transition;
          if (navigation === 'OVERLAY') {
            action.overlayRelativePosition = actionInput.overlayRelativePosition || { x: 0, y: 0 };
          }
          return action as Action;
        }

        if (type === 'SCROLL_TO') {
          if (!actionInput.destinationId) return null;
          return { type: 'SCROLL_TO', destinationId: actionInput.destinationId } as unknown as Action;
        }

        if (type === 'BACK') {
          return { type: 'BACK' } as Action;
        }

        if (type === 'CLOSE') {
          return { type: 'CLOSE' } as Action;
        }

        if (type === 'URL') {
          if (!actionInput.url) return null;
          return { type: 'URL', url: actionInput.url } as Action;
        }

        if (type === 'SET_VARIABLE' && actionInput.variableId !== undefined) {
          return {
            type: 'SET_VARIABLE',
            variableId: actionInput.variableId,
            value: actionInput.value
          } as Action;
        }

        return null;
      };

      // Readable node name from text or name
      const getReadableNodeName = (node: SceneNode | null): string => {
        if (!node) return '';
        if (node.type === 'TEXT') {
          const chars = (node as TextNode).characters || '';
          if (chars.trim()) return chars.trim();
        }
        return (node.name || '').trim();
      };

      // Find owning page for a node
      const findPageNode = (node: BaseNode | null): PageNode | null => {
        let current: BaseNode | null = node;
        while (current && current.type !== 'PAGE') {
          current = current.parent as BaseNode | null;
        }
        return current && current.type === 'PAGE' ? (current as PageNode) : null;
      };

      // (isEffectivelyVisible moved to global scope)

      // Find the top-level prototype-eligible frame (direct child of Page)
      const findTopLevelFrame = (node: SceneNode | null): SceneNode | null => {
        let current: BaseNode | null = node;
        while (current && current.parent && current.parent.type !== 'PAGE') {
          current = current.parent;
        }
        if (current && current.parent && current.parent.type === 'PAGE' &&
          (current.type === 'FRAME' || current.type === 'COMPONENT' || current.type === 'INSTANCE')) {
          return current as SceneNode;
        }
        return null;
      };

      // Ensure a flow starting point exists with a generated name (async-safe for dynamic-page)
      const ensureFlowName = async (
        sourceNode: SceneNode,
        destinationId: string,
        overrideName?: string
      ) => {
        const destinationNode = (await figma.getNodeByIdAsync(destinationId)) as SceneNode | null;
        if (!destinationNode) return;

        const destFrame = findTopLevelFrame(destinationNode);
        if (!destFrame || !isEffectivelyVisible(destFrame)) return;

        const page = findPageNode(destFrame);
        if (!page) return;

        const existing = Array.isArray((page as any).flowStartingPoints)
          ? [...(page as any).flowStartingPoints]
          : [];

        const already = existing.find((fp: any) => fp.nodeId === destFrame.id);
        if (already && already.name) {
          return; // Keep existing named flow
        }

        const sourceName = getReadableNodeName(sourceNode) || 'Flow';
        const destName = getReadableNodeName(destFrame) || 'Destination';
        const flowName = (overrideName || `${sourceName} → ${destName}`).trim().slice(0, 80);

        try {
          existing.push({ nodeId: destFrame.id, name: flowName });
          (page as any).flowStartingPoints = existing;
        } catch (err) {
          console.warn('Failed to set flowStartingPoints:', err);
        }
      };

      const getNodeCenter = (node: SceneNode) => {
        const [[, , tx], [, , ty]] = node.absoluteTransform;
        const x = tx + node.width / 2;
        const y = ty + node.height / 2;
        return { x, y };
      };

      // Get the center point on the nearest border edge, choosing the edge in the dominant direction toward the target
      const getNearestBorderPoint = (node: SceneNode, target: { x: number; y: number }) => {
        const [[, , tx], [, , ty]] = node.absoluteTransform;
        const cx = tx + node.width / 2;
        const cy = ty + node.height / 2;
        const dx = target.x - cx;
        const dy = target.y - cy;

        if (Math.abs(dx) >= Math.abs(dy)) {
          // Left or right edge
          return dx >= 0
            ? { x: tx + node.width, y: cy } // right edge center
            : { x: tx, y: cy };             // left edge center
        } else {
          // Top or bottom edge
          return dy >= 0
            ? { x: cx, y: ty + node.height } // bottom edge center
            : { x: cx, y: ty };              // top edge center
        }
      };

      // Clear effects on a node and all descendants; returns number of nodes cleared
      const clearEffectsDeep = (node: SceneNode): number => {
        let cleared = 0;
        if ('effects' in node) {
          (node as BlendMixin).effects = [];
          cleared += 1;
        }
        if ('children' in node) {
          for (const child of node.children) {
            cleared += clearEffectsDeep(child as SceneNode);
          }
        }
        return cleared;
      };

      // Create frame for rectangle grids if needed
      let rectangleFrame: FrameNode | null = null;
      if (shouldGroupRectangles) {
        // Calculate frame bounds based on the originAlignedCreates
        let minX = Number.POSITIVE_INFINITY;
        let minY = Number.POSITIVE_INFINITY;
        let maxX = Number.NEGATIVE_INFINITY;
        let maxY = Number.NEGATIVE_INFINITY;

        for (const c of originAlignedCreates) {
          const size = getDefaultSize(c);
          const px = (c.x !== undefined && c.x !== null ? c.x : 0) + groupOffset.x;
          const py = (c.y !== undefined && c.y !== null ? c.y : 0) + groupOffset.y;
          minX = Math.min(minX, px);
          minY = Math.min(minY, py);
          maxX = Math.max(maxX, px + size.width);
          maxY = Math.max(maxY, py + size.height);
        }

        const frameWidth = maxX - minX;
        const frameHeight = maxY - minY;

        rectangleFrame = figma.createFrame();
        rectangleFrame.name = `Grid (${originAlignedCreates.length} rectangles)`;
        rectangleFrame.resize(frameWidth, frameHeight);
        rectangleFrame.x = minX;
        rectangleFrame.y = minY;
        // Remove default background fill
        rectangleFrame.fills = [];
        figma.currentPage.appendChild(rectangleFrame);
      }

      const creationActions = new Set([
        'createSection', 'createPage', 'createNodeFromSvg', 'createRectangle',
        'createEllipse', 'createText', 'createFrame', 'createPolygon',
        'createStar', 'createLine', 'createSticky', 'createShapeWithText',
        'createButtonComponent', 'createPaintStyle', 'createTextStyle', 'createEffectStyle', 'createGridStyle',
        'createRectangleWithImage', 'createGridLines', 'group', 'union', 'booleanUnion',
        'subtract', 'booleanSubtract', 'intersect', 'booleanIntersect', 'exclude', 'booleanExclude',
        'duplicate', 'createInstance', 'duplicateStyle',
        'createVariableCollection', 'createVariable',
        'applyAutoLayout', 'createTable'
      ]);
      const hierarchyActions = new Set(['appendChild', 'moveTo']);
      const layoutEnableActions = new Set(['setAutoLayout']);

      // Multi-pass command splitting
      const rawCreationCmds = (commands as any[]).filter(c => c && creationActions.has(c.action));

      // Topologically sort creation commands based on refId/parentId/parentName dependencies
      // This ensures parents are created before children so appendToParent finds them
      const creationCmdMap = new Map<string, any>();
      const creationCmdByName = new Map<string, any>();
      for (const cmd of rawCreationCmds) {
        if (cmd.refId) creationCmdMap.set(cmd.refId, cmd);
        if (cmd.name) {
          // Topological Sort Priority:
          // 1. Keep the first command that defines this name
          // 2. But if we find a "real" creation (not duplicate/group/createInstance), prioritize it over duplicates
          // This ensures that 'duplicate'/'createInstance' commands correctly depend on their source creation.
          const existing = creationCmdByName.get(cmd.name);
          const isNewDuplicate = cmd.action === 'duplicate' || cmd.action === 'createInstance' || cmd.action === 'group';
          const isExistingDuplicate = existing && (existing.action === 'duplicate' || existing.action === 'createInstance' || existing.action === 'group');

          if (!existing || (isExistingDuplicate && !isNewDuplicate)) {
            creationCmdByName.set(cmd.name, cmd);
          }
        }
      }

      const creationCmds: any[] = [];
      const visitedSort = new Set<any>();
      const visitingSort = new Set<any>();

      const sortCmd = (cmd: any) => {
        if (visitedSort.has(cmd)) return;
        if (visitingSort.has(cmd)) return; // Cycle - break it

        visitingSort.add(cmd);

        // 1. Dependency: Parent (for nested creation)
        const pId = cmd.parentId;
        const pName = cmd.parentName;

        // Follow refId dependency
        if (pId && creationCmdMap.has(pId)) {
          sortCmd(creationCmdMap.get(pId));
        }

        // Follow parentName dependency if refId didn't catch it
        if (pName && creationCmdByName.has(pName)) {
          sortCmd(creationCmdByName.get(pName));
        }

        // Also handle cases where AI puts the parent name in parentId
        if (pId && !creationCmdMap.has(pId) && creationCmdByName.has(pId)) {
          sortCmd(creationCmdByName.get(pId));
        }

        // 2. Dependency: Ingredients (for groups/boolean ops)
        const nodeIds = cmd.nodeIds;
        if (Array.isArray(nodeIds)) {
          for (const depId of nodeIds) {
            if (creationCmdMap.has(depId)) {
              sortCmd(creationCmdMap.get(depId));
            }
          }
        }

        // 3. Dependency: Source for duplicates / createInstance
        if ((cmd.action === 'duplicate' || cmd.action === 'createInstance') && cmd.nodeId) {
          if (creationCmdMap.has(cmd.nodeId)) {
            sortCmd(creationCmdMap.get(cmd.nodeId));
          } else if (creationCmdByName.has(cmd.nodeId)) {
            sortCmd(creationCmdByName.get(cmd.nodeId));
          }
        }

        visitingSort.delete(cmd);
        visitedSort.add(cmd);
        creationCmds.push(cmd);
      };

      for (const cmd of rawCreationCmds) {
        sortCmd(cmd);
      }

      const hierarchyCmds = (commands as any[]).filter(c => c && hierarchyActions.has(c.action));
      const layoutEnableCmds = (commands as any[]).filter(c => c && layoutEnableActions.has(c.action)).map(c => ({ ...c, isPass3: true }));
      const layoutConfigCmds = (commands as any[]).filter(c => c && !creationActions.has(c.action) && !hierarchyActions.has(c.action)).map(c => ({ ...c, isPass4: true }));
      // Heuristic to resolve node even if ID is mangled or if container is targeted
      const resolveNodeSmart = async (id: string | undefined): Promise<BaseNode | null> => {
        if (!id || id.trim() === '') {
          return null;
        }

        // 1. Check in-memory createdNodes map (includes refId and node.id)
        if (createdNodes.has(id)) {
          const n = createdNodes.get(id);
          if (n && !n.removed) return n;
        }

        // 1.5. Check in-memory name map (High priority for current batch)
        if (createdNodesByName.has(id)) {
          const n = createdNodesByName.get(id);
          if (n && !n.removed) return n;
        }

        // 1.6. Case-insensitive name map lookup (Fuzzy match for AI inconsistency)
        const lowerId = id.toLowerCase();
        const normalizedId = lowerId.replace(/[\s\-_]/g, '');
        for (const [name, node] of createdNodesByName.entries()) {
          if (name.toLowerCase() === lowerId && node && !node.removed) {
            return node;
          }
        }

        // 1.7. Normalized match: hyphen/underscore/space insensitive (handles item_tmpl vs item-tmpl, etc.)
        if (normalizedId.length > 0) {
          for (const [key, n] of createdNodes.entries()) {
            if (n && !n.removed && key.toLowerCase().replace(/[\s\-_]/g, '') === normalizedId) {
              return n;
            }
          }
          for (const [key, n] of createdNodesByName.entries()) {
            if (n && !n.removed && key.toLowerCase().replace(/[\s\-_]/g, '') === normalizedId) {
              return n;
            }
          }
        }

        // 2. Try to find by direct Figma ID (Very fast)
        try {
          const targetNode = await figma.getNodeByIdAsync(id);
          if (targetNode) return targetNode;
        } catch (err) { /* ignore */ }

        // 3. Search in selection first (Usually very small and fast)
        const cleanId = lowerId.replace(/[^a-zA-Z0-9]/g, '');
        const findInSelection = (nodes: readonly SceneNode[]): SceneNode | null => {
          for (const n of nodes) {
            try {
              if (n.removed) continue;
              if (n.id === id) return n;
              if (n.id.replace(/[^a-zA-Z0-9]/g, '').toLowerCase() === cleanId) return n;
              if (n.name === id || n.name.toLowerCase() === lowerId) return n;
              if ('children' in n) {
                const found = findInSelection((n as any).children);
                if (found) return found;
              }
            } catch (e) {
              continue;
            }
          }
          return null;
        };
        const selected = findInSelection(currentSelection);
        if (selected) return selected;

        return null;
      };

      // Helper to resolve parent specifically, with redirect for Instances and name fallback
      const resolveParentSmart = async (id: string | undefined, name?: string): Promise<BaseNode & ChildrenMixin | null> => {
        let target = await resolveNodeSmart(id);

        // Fallback to name if ID resolution failed or returned page
        if ((!target || target.type === 'PAGE') && name) {
          target = await resolveNodeSmart(name);
        }

        if (!target) return figma.currentPage;

        if (target.type === 'INSTANCE') {
          const main = await target.getMainComponentAsync();
          if (main) return main;
        }

        if ('appendChild' in target) {
          return target as BaseNode & ChildrenMixin;
        }

        return figma.currentPage;
      };

      // Helper to apply min/max sizing constraints if the node supports them
      const applySizingConstraints = (node: SceneNode, cmd: any) => {
        if (!node || node.removed) return;
        if (cmd.minWidth !== undefined && 'minWidth' in node) (node as any).minWidth = cmd.minWidth;
        if (cmd.maxWidth !== undefined && 'maxWidth' in node) (node as any).maxWidth = cmd.maxWidth;
        if (cmd.minHeight !== undefined && 'minHeight' in node) (node as any).minHeight = cmd.minHeight;
        if (cmd.maxHeight !== undefined && 'maxHeight' in node) (node as any).maxHeight = cmd.maxHeight;
      };

      // Helper to apply common styling like corner radius and strokes
      const applyBaseStyling = (node: SceneNode, cmd: any) => {
        if (!node || node.removed) return;
        if ('cornerRadius' in node && cmd.cornerRadius !== undefined) {
          (node as any).cornerRadius = cmd.cornerRadius;
        }
        if ('strokes' in node) {
          if (cmd.strokeColor) {
            const strokeColor = parseHexColor(cmd.strokeColor);
            (node as GeometryMixin).strokes = [{ type: 'SOLID', color: { r: strokeColor.r, g: strokeColor.g, b: strokeColor.b } }];
          }
          if (cmd.strokeWeight !== undefined) {
            (node as GeometryMixin).strokeWeight = cmd.strokeWeight;
          }
        }
      };

      // Helper to apply auto layout padding
      const applyAutoLayoutPadding = (node: SceneNode, cmd: any) => {
        if (!node || node.removed || !('paddingLeft' in node)) return;
        const frame = node as FrameNode;
        if (cmd.padding !== undefined) {
          frame.paddingTop = frame.paddingRight = frame.paddingBottom = frame.paddingLeft = cmd.padding;
        }
        if (cmd.horizontalPadding !== undefined || cmd.paddingHorizontal !== undefined) {
          frame.paddingLeft = frame.paddingRight = cmd.horizontalPadding !== undefined ? cmd.horizontalPadding : cmd.paddingHorizontal;
        }
        if (cmd.verticalPadding !== undefined || cmd.paddingVertical !== undefined) {
          frame.paddingTop = frame.paddingBottom = cmd.verticalPadding !== undefined ? cmd.verticalPadding : cmd.paddingVertical;
        }
        if (cmd.paddingTop !== undefined) frame.paddingTop = cmd.paddingTop;
        if (cmd.paddingRight !== undefined) frame.paddingRight = cmd.paddingRight;
        if (cmd.paddingBottom !== undefined) frame.paddingBottom = cmd.paddingBottom;
        if (cmd.paddingLeft !== undefined) frame.paddingLeft = cmd.paddingLeft;
      };

      // Helper to append a node to its intended parent and handle positioning
      const appendToParent = async (node: SceneNode, cmd: any, size?: { width: number, height: number }) => {
        const parent = await resolveParentSmart(cmd.parentId, cmd.parentName);
        if (!parent) return; // Should not happen as it defaults to currentPage

        parent.appendChild(node);

        // If coordinates were provided, they are relative to the parent
        // If not provided, use default positioning (which centers in viewport or does smart placement)
        const { x, y } = getDefaultPosition(cmd, size);

        // If parent is page, use absolute center
        // If parent is a frame/component, coordinates are relative
        if (parent.type === 'PAGE') {
          // CRITICAL FIX: If we have an intended parent but we're on the page, this is an orphaned child.
          // We MUST NOT use cmd.x/y as absolute coordinates because they are likely relative.
          // Instead, center in viewport (Pass 2 will move to correct relative pos).
          if (cmd.parentId || cmd.parentName) {
            const viewportCenter = figma.viewport.center;
            node.x = viewportCenter.x - (size?.width || node.width) / 2;
            node.y = viewportCenter.y - (size?.height || node.height) / 2;
          } else {
            node.x = x;
            node.y = y;
          }
        } else {
          // Only apply if coordinates were actually in the command AND parent is not AL (or child is absolute)
          const hasX = typeof cmd.x === 'number';
          const hasY = typeof cmd.y === 'number';
          const hasOffsetX = typeof cmd.offsetX === 'number';
          const hasOffsetY = typeof cmd.offsetY === 'number';

          if ((hasX || hasY || hasOffsetX || hasOffsetY) && shouldForcePosition(node, parent, cmd)) {
            if (hasX) {
              node.x = cmd.x;
            } else if ('width' in (parent as any)) {
              node.x = ((parent as any).width / 2) - (node.width / 2);
            }

            if (hasY) {
              node.y = cmd.y;
            } else if ('height' in (parent as any)) {
              node.y = ((parent as any).height / 2) - (node.height / 2);
            }

            // Apply offsets
            if (hasOffsetX) node.x += cmd.offsetX;
            if (hasOffsetY) node.y += cmd.offsetY;
          } else if (!hasX && !hasY && !hasOffsetX && !hasOffsetY) {
            // If no coords provided, and we should force position (e.g. parent is NOT auto layout), center it
            if (shouldForcePosition(node, parent, cmd)) {
              if ('width' in (parent as any) && 'height' in (parent as any)) {
                node.x = ((parent as any).width / 2) - (node.width / 2);
                node.y = ((parent as any).height / 2) - (node.height / 2);
              } else {
                node.x = 0;
                node.y = 0;
              }
            }
            // If we shouldn't force position (parent is AL), do nothing - let the engine handle it
          }
        }

        // Always track intended relative coords for hierarchy pass
        if ((cmd.parentId || cmd.parentName) && ('x' in cmd || 'y' in cmd)) {
          intendedRelativePositions.set(node.id, { x: cmd.x, y: cmd.y });
        }

        // Store intended parent for mandatory correction pass
        if (cmd.parentId || cmd.parentName) {
          intendedParents.set(node.id, { parentId: cmd.parentId, parentName: cmd.parentName });
        }
      };

      // HIERARCHY CORRECTION: One final pass to ensure all created nodes are in their intended parents
      // This runs before we move into the main command loop so parents are settled before Auto Layout starts
      const performHierarchyCorrection = async () => {
        let correctionCount = 0;
        for (const [nodeId, target] of intendedParents.entries()) {
          if (executionCancelled) break;
          try {
            const node = await resolveNodeSmart(nodeId) as SceneNode;
            if (node && node.parent === figma.currentPage) {
              const parent = await resolveParentSmart(target.parentId, target.parentName);
              if (parent && parent !== figma.currentPage && 'appendChild' in parent) {
                parent.appendChild(node);

                if (shouldForcePosition(node, parent, target)) {
                  const intended = intendedRelativePositions.get(nodeId);
                  if (intended) {
                    if (typeof intended.x === 'number') node.x = intended.x;
                    if (typeof intended.y === 'number') node.y = intended.y;
                  } else {
                    // If no specific coordinates, center in new parent
                    if ('width' in (parent as any) && 'height' in (parent as any)) {
                      node.x = ((parent as any).width / 2) - (node.width / 2);
                      node.y = ((parent as any).height / 2) - (node.height / 2);
                    }
                  }
                }
              }
            }
          } catch (err) { /* ignore */ }
          // Yield every 5 corrections to keep Figma responsive
          correctionCount++;
          if (correctionCount % 5 === 0) {
            await yieldAndCheck();
          }
        }
      };

      // Split duplicate/createInstance commands from creation commands so they run LAST.
      // Duplicates/instances must execute after all layout passes (setAutoLayout, setSizing, setFill, etc.)
      // so that clone()/createInstance() captures the fully-configured source node.
      const duplicateCmds = creationCmds.filter(c => c.action === 'duplicate' || c.action === 'createInstance');
      const nonDuplicateCreationCmds = creationCmds.filter(c => c.action !== 'duplicate' && c.action !== 'createInstance');

      // Identify setSimpleText commands that target pending instance/duplicate refIds.
      // These must run AFTER createInstance so the target nodes actually exist.
      const pendingInstanceRefIds = new Set<string>();
      for (const dc of duplicateCmds) {
        if (dc.refId) pendingInstanceRefIds.add(dc.refId);
      }
      const postDuplicateConfigCmds = layoutConfigCmds.filter(c => {
        if (c.action === 'setSimpleText') {
          const targetId = c.nodeId || c.refId;
          return targetId && pendingInstanceRefIds.has(targetId);
        }
        return false;
      });
      const mainLayoutConfigCmds = postDuplicateConfigCmds.length > 0
        ? layoutConfigCmds.filter(c => !postDuplicateConfigCmds.includes(c))
        : layoutConfigCmds;

      // Reassemble in order: Creation -> Hierarchy -> Layout Enable -> Layout Config -> Duplicates -> Post-Duplicate Config
      let orderedCommands: any[] = [];
      const hasSections = (commands as any[]).some(c => c && c.section);

      if (hasSections) {
        const sections: string[] = [];
        const sectionSet = new Set<string>();
        for (const c of commands as any[]) {
          if (c && c.section && !sectionSet.has(c.section)) {
            sections.push(c.section);
            sectionSet.add(c.section);
          }
        }

        const usedCmds = new Set<any>();
        for (const section of sections) {
          const sCreation = nonDuplicateCreationCmds.filter(c => c.section === section);
          const sHierarchy = hierarchyCmds.filter(c => c.section === section);
          const sLayoutEnable = layoutEnableCmds.filter(c => c.section === section);
          const sLayoutConfig = mainLayoutConfigCmds.filter(c => c.section === section);
          const sDuplicates = duplicateCmds.filter(c => c.section === section);
          const sPostDupConfig = postDuplicateConfigCmds.filter(c => c.section === section);

          // For each section, run ALL passes sequentially: Creation -> Hierarchy -> LayoutEnable -> LayoutConfig -> Duplicates -> PostDupConfig
          orderedCommands.push(...sCreation, ...sHierarchy, ...sLayoutEnable, ...sLayoutConfig, ...sDuplicates, ...sPostDupConfig);

          sCreation.forEach(c => usedCmds.add(c));
          sHierarchy.forEach(c => usedCmds.add(c));
          sLayoutEnable.forEach(c => usedCmds.add(c));
          sLayoutConfig.forEach(c => usedCmds.add(c));
          sDuplicates.forEach(c => usedCmds.add(c));
          sPostDupConfig.forEach(c => usedCmds.add(c));
        }

        // Add remaining global commands that had no section, keeping the same pass structure
        const remainingPass1 = nonDuplicateCreationCmds.filter(c => !usedCmds.has(c));
        const remainingPass2 = hierarchyCmds.filter(c => !usedCmds.has(c));
        const remainingPass3 = layoutEnableCmds.filter(c => !usedCmds.has(c));
        const remainingPass4 = mainLayoutConfigCmds.filter(c => !usedCmds.has(c));
        const remainingDuplicates = duplicateCmds.filter(c => !usedCmds.has(c));
        const remainingPostDup = postDuplicateConfigCmds.filter(c => !usedCmds.has(c));

        orderedCommands.push(...remainingPass1, ...remainingPass2, ...remainingPass3, ...remainingPass4, ...remainingDuplicates, ...remainingPostDup);
      } else {
        // Standard global passes
        orderedCommands = [...nonDuplicateCreationCmds, ...hierarchyCmds, ...layoutEnableCmds, ...mainLayoutConfigCmds, ...duplicateCmds, ...postDuplicateConfigCmds];
      }
      const commandDetails: any[] = [];

      const getCommandPreview = (cmd: any) => {
        if (cmd.action === 'setAutoLayout') {
          const p = [];
          if (cmd.direction) p.push(cmd.direction);
          if (cmd.gap !== undefined) p.push(`gap:${cmd.gap}`);
          if (cmd.padding !== undefined) p.push(`p:${cmd.padding}`);
          else if (cmd.horizontalPadding !== undefined || cmd.verticalPadding !== undefined) {
            p.push(`p(h/v):${cmd.horizontalPadding || 0}/${cmd.verticalPadding || 0}`);
          }
          else if (cmd.paddingTop !== undefined || cmd.paddingRight !== undefined || cmd.paddingBottom !== undefined || cmd.paddingLeft !== undefined) {
            const pt = cmd.paddingTop !== undefined ? cmd.paddingTop : 0;
            const pr = cmd.paddingRight !== undefined ? cmd.paddingRight : 0;
            const pb = cmd.paddingBottom !== undefined ? cmd.paddingBottom : 0;
            const pl = cmd.paddingLeft !== undefined ? cmd.paddingLeft : 0;
            p.push(`p:${pt},${pr},${pb},${pl}`);
          }
          if (cmd.primaryAxisAlignItems || cmd.counterAxisAlignItems) {
            p.push(`align:${cmd.primaryAxisAlignItems || 'MIN'}/${cmd.counterAxisAlignItems || 'MIN'}`);
          }
          return p.join(' ') || 'AUTO';
        }
        if (cmd.action === 'setSizing') {
          const p = [];
          if (cmd.horizontal) p.push(`H:${cmd.horizontal}`);
          if (cmd.vertical) p.push(`V:${cmd.vertical}`);
          if (cmd.width !== undefined) p.push(`w:${Math.round(cmd.width)}`);
          if (cmd.height !== undefined) p.push(`h:${Math.round(cmd.height)}`);
          return p.join(' ');
        }
        if (cmd.action === 'move') return `pos(${Math.round(cmd.x)},${Math.round(cmd.y)})`;
        if (cmd.width && cmd.height) return `${Math.round(cmd.width)}x${Math.round(cmd.height)}`;
        if (cmd.color) return cmd.color;
        if (cmd.text) return cmd.text.length > 20 ? cmd.text.substring(0, 20) + '...' : cmd.text;
        if (cmd.fontSize) return `${cmd.fontSize}px`;
        return '';
      };

      const getBeforeValue = (node: any, action: string) => {
        if (!node) return null;
        try {
          if (action === 'setAutoLayout' && 'layoutMode' in node) {
            const frame = node as FrameNode;
            if (frame.layoutMode === 'NONE') return 'None';
            return `${frame.layoutMode} (gap:${frame.itemSpacing})`;
          }
          if (action === 'setSizing') {
            const h = (node as any).layoutSizingHorizontal || ((node as any).primaryAxisSizingMode === 'AUTO' ? 'HUG' : 'FIXED');
            const v = (node as any).layoutSizingVertical || ((node as any).counterAxisSizingMode === 'AUTO' ? 'HUG' : 'FIXED');
            return `${h}/${v}`;
          }
          if (action === 'rename') return node.name;
          if (action === 'setText' || action === 'updateText') {
            if ('characters' in node) return node.characters;
            if (node.text && 'characters' in node.text) return node.text.characters;
            // For containers, try to find the first visible text node (matching plugin logic)
            if ('findAll' in node) {
              const textNode = node.findAll((n: any) => n.type === 'TEXT' && isEffectivelyVisible(n))[0];
              if (textNode) return textNode.characters;
            }
          }
          if (action === 'setFill' || action === 'setStroke' || action === 'swapPaints') {
            const paints = (action === 'setStroke') ? (node.strokes || []) : (node.fills || []);
            if (Array.isArray(paints) && paints.length > 0 && paints[0].type === 'SOLID') {
              const p = paints[0] as SolidPaint;
              return rgbToHex(p.color.r, p.color.g, p.color.b).toUpperCase();
            }
          }
          if (action === 'setCornerRadius' && 'cornerRadius' in node) {
            return typeof node.cornerRadius === 'number' ? `${node.cornerRadius}px` : 'Mixed';
          }
          if (action === 'setOpacity' && 'opacity' in node) {
            return `${Math.round(node.opacity * 100)}%`;
          }
        } catch (e) {
          return null;
        }
        return null;
      };

      for (let i = 0; i < orderedCommands.length; i++) {
        const startTime = Date.now();
        let cmd = orderedCommands[i];
        const initialSuccess = success;
        const initialFailed = failed;
        let node: any = null;
        let beforeValue: any = null;

        // Trigger correction after Pass 1 (Creation) and before Pass 2 (Hierarchy)
        // This ensures creation pass artifacts are cleaned up
        if (i > 0 && creationActions.has(orderedCommands[i - 1].action) && !creationActions.has(cmd.action)) {
          await performHierarchyCorrection();
        }

        // Yield control to the main thread to prevent Figma from freezing.
        // Reduced frequency for large batches to improve throughput while maintaining responsiveness.
        const yieldInterval = orderedCommands.length > 100 ? 10 : orderedCommands.length > 50 ? 5 : 5;
        if (i === 0 || i % yieldInterval === 0 || i === orderedCommands.length - 1) {
          figma.ui.postMessage({
            type: 'execution-progress',
            current: i + 1,
            total: orderedCommands.length
          });
          if (await yieldAndCheck()) {
            console.log(`[execute-commands] Cancelled at command ${i + 1}/${orderedCommands.length}`);
            break;
          }
        }

        try {
          if (!cmd) continue;

          // Sanitize numeric fields that AI might send as strings (e.g. "12" instead of 12)
          const numericFields = [
            'padding', 'horizontalPadding', 'verticalPadding',
            'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft',
            'paddingHorizontal', 'paddingVertical',
            'gap', 'itemSpacing', 'cornerRadius', 'strokeWeight', 'opacity',
            'width', 'height', 'x', 'y', 'offsetX', 'offsetY',
            'fontSize', 'letterSpacing', 'lineHeight',
            'rotation', 'blurRadius', 'spreadRadius'
          ];
          for (const field of numericFields) {
            if (cmd[field] !== undefined && typeof cmd[field] === 'string') {
              const parsed = parseFloat(cmd[field]);
              if (!isNaN(parsed)) {
                cmd[field] = parsed;
              }
            }
          }

          // Global/file-level actions that don't target a specific node
          const globalActions = new Set([
            'getLocalStyles', 'getLocalVariables',
            'getAvailableLibraryComponents', 'getAvailableLibraryStyles',
            'getAvailableLibraryVariableCollections', 'getImageByHash',
            'createImage',
            'createVariableCollection', 'renameVariableCollection', 'removeVariableCollection',
            'createVariable', 'removeVariable', 'renameVariable',
            'setVariableValue', 'setVariableDescription', 'setVariableScopes', 'setVariableAlias',
            'addMode', 'removeMode', 'renameMode',
            'removeStyle', 'updateStyle', 'setStyleDescription', 'duplicateStyle',
            'createGridStyle', 'updateGridStyle'
          ]);

          // If the command doesn't target a specific node, expand it to all selected nodes
          if (!cmd.nodeId && currentSelection.length > 1 && !creationActions.has(cmd.action) && !hierarchyActions.has(cmd.action) && !globalActions.has(cmd.action)) {
            const expandedCommands = currentSelection.map(node => ({ ...cmd, nodeId: node.id }));
            orderedCommands.splice(i, 1, ...expandedCommands);
            cmd = orderedCommands[i];
          }

          // Commands that require an existing node (except creation and global actions)
          if (!creationActions.has(cmd.action) && !globalActions.has(cmd.action)) {
            const targetId = cmd.nodeId || cmd.refId;
            node = await resolveNodeSmart(targetId);

            // Fallback to current selection if no target ID was provided (for actions like setAutoLayout)
            if (!node && !targetId && currentSelection.length > 0) {
              node = currentSelection[0];
            }

            if (node) {
              beforeValue = getBeforeValue(node, cmd.action);
            }

            if (!node && cmd.action !== 'createComponentSet' &&
              cmd.action !== 'zoomToSelection' && cmd.action !== 'zoom-to-selection' &&
              cmd.action !== 'setViewport' && cmd.action !== 'set-viewport') {
              if (!cmd.isPass3 && !cmd.isPass4) {
                // failed++;
              }
              continue;
            }

            if (node && (node.removed || (cmd.action !== 'setVisible' && cmd.action !== 'focusNode' && cmd.action !== 'focus-node' && !isEffectivelyVisible(node)))) {
              success++;
              continue;
            }
          }
          // Commands that don't require an existing node
          if (cmd.action === 'createSection') {
            const section = figma.createSection();
            registerCreatedNode(section, cmd.refId, cmd.name);
            const width = cmd.width || 800;
            const height = cmd.height || 600;
            const { x, y } = getDefaultPosition(cmd, { width, height });
            section.x = x;
            section.y = y;
            if ('resize' in section) {
              (section as any).resize(width, height);
            } else if ('resizeWithoutConstraints' in section) {
              (section as any).resizeWithoutConstraints(width, height);
            }
            if (cmd.name) section.name = cmd.name;
            figma.currentPage.appendChild(section);
            figma.currentPage.selection = [section];
            success++;
            continue;
          }

          if (cmd.action === 'createPage') {
            const page = figma.createPage();
            registerCreatedNode(page, cmd.refId);
            page.name = cmd.name || 'New Page';
            if (cmd.makeCurrent) {
              await figma.setCurrentPageAsync(page);
            }
            success++;
            continue;
          }

          if (cmd.action === 'createNodeFromSvg') {
            try {
              const svg = cmd.svg || '';
              const node = figma.createNodeFromSvg(svg);
              registerCreatedNode(node, cmd.refId);

              const width = cmd.width || node.width;
              const height = cmd.height || node.height;

              if (cmd.width !== undefined || cmd.height !== undefined) {
                try {
                  node.resize(width, height);
                } catch (err) {
                  console.warn('Failed to resize created svg node', err);
                }
              }

              if (cmd.name) {
                try {
                  node.name = cmd.name;
                } catch (err) {
                  console.warn('Failed to set name on created svg node', err);
                }
              }
              await appendToParent(node, cmd, { width, height });
              figma.currentPage.selection = [node];
              success++;
            } catch (error) {
              const svgContent = (cmd.svg || '');
              console.error('createNodeFromSvg failed. Action:', cmd.action, 'Name:', cmd.name);
              console.error('Error details:', error);
              console.error('SVG length:', svgContent.length);
              console.error('SVG snippet:', svgContent.substring(0, 200));
              if (!firstError) firstError = { action: cmd.action, message: (error as Error)?.message || 'createNodeFromSvg failed' };
              failed++;
            }
            continue;
          }

          if (cmd.action === 'createPaintStyle') {
            try {
              const style = figma.createPaintStyle();
              registerCreatedNode(style, cmd.refId);
              style.name = cmd.name || 'New Paint Style';

              const paintType = cmd.paintType || 'SOLID';

              if (paintType === 'SOLID') {
                const color = parseHexColor(cmd.color || '#000000');
                style.paints = [{ type: 'SOLID', color: { r: color.r, g: color.g, b: color.b }, opacity: color.a } as SolidPaint];
              } else if (paintType === 'GRADIENT_LINEAR' || paintType === 'GRADIENT_RADIAL' || paintType === 'GRADIENT_ANGULAR' || paintType === 'GRADIENT_DIAMOND') {
                const stops: ColorStop[] = (cmd.gradientStops || [
                  { position: 0, color: '#000000' },
                  { position: 1, color: '#FFFFFF' }
                ]).map((stop: any) => {
                  const c = parseHexColor(typeof stop.color === 'string' ? stop.color : '#000000');
                  return {
                    position: stop.position ?? 0,
                    color: { r: c.r, g: c.g, b: c.b, a: c.a }
                  };
                });

                const defaultTransform: Transform = [[1, 0, 0], [0, 1, 0]];
                const gradientPaint: GradientPaint = {
                  type: paintType,
                  gradientStops: stops,
                  gradientTransform: cmd.gradientTransform || defaultTransform
                };
                style.paints = [gradientPaint];
              } else {
                const color = parseHexColor(cmd.color || '#000000');
                style.paints = [{ type: 'SOLID', color: { r: color.r, g: color.g, b: color.b }, opacity: color.a } as SolidPaint];
              }

              figma.ui.postMessage({ type: 'paint-style-created', id: style.id, name: style.name });
              success++;
            } catch (error) {
              console.error('createPaintStyle failed', error);
              failed++;
            }
            continue;
          }

          if (cmd.action === 'createVariableCollection') {
            if (!figma.variables || typeof figma.variables.createVariableCollection !== 'function' || typeof figma.variables.getLocalVariableCollectionsAsync !== 'function') {
              console.warn('Variables API not available in this file; skipping variable creation');
              failed++;
              continue;
            }
            try {
              const collectionName = cmd.name || 'Color Variables';
              const colors = cmd.colors || [];

              // Check if collection already exists
              const existingCollections = await figma.variables.getLocalVariableCollectionsAsync();
              let collection = existingCollections.find(c => c.name === collectionName);

              // If collection doesn't exist, create it
              if (!collection) {
                console.log('Creating new variable collection:', collectionName);
                collection = figma.variables.createVariableCollection(collectionName);
              } else {
                console.log('Using existing variable collection:', collectionName);
              }

              // Create color variables for each color
              let variablesCreated = 0;
              const existingVariables = await figma.variables.getLocalVariablesAsync();

              for (const colorItem of colors) {
                try {
                  // Check if variable already exists in this collection
                  const existingVar = existingVariables.find(v =>
                    v.name === colorItem.name &&
                    v.variableCollectionId === collection.id
                  );

                  if (existingVar) {
                    console.log('Variable already exists, updating:', colorItem.name);
                    const color = parseHexColor(colorItem.hex || '#000000');
                    existingVar.setValueForMode(collection.modes[0].modeId, {
                      r: color.r,
                      g: color.g,
                      b: color.b,
                      a: color.a
                    });
                  } else {
                    console.log('Creating new variable:', colorItem.name);
                    const color = parseHexColor(colorItem.hex || '#000000');
                    const variable = figma.variables.createVariable(colorItem.name, collection, 'COLOR');
                    variable.setValueForMode(collection.modes[0].modeId, {
                      r: color.r,
                      g: color.g,
                      b: color.b,
                      a: color.a
                    });
                  }
                  variablesCreated++;
                } catch (varError) {
                  console.error('Failed to create/update variable:', colorItem.name, varError);
                }
              }

              figma.ui.postMessage({
                type: 'variable-collection-updated',
                id: collection.id,
                name: collection.name,
                variableCount: variablesCreated,
                wasExisting: !!existingCollections.find(c => c.name === collectionName)
              });
              success++;
            } catch (error) {
              console.error('createVariableCollection failed', error);
              failed++;
            }
            continue;
          }

          if (cmd.action === 'createRectangle') {
            const rect = figma.createRectangle();
            registerCreatedNode(rect, cmd.refId, cmd.name);
            const width = cmd.width || 100;
            const height = cmd.height || 100;
            rect.resize(width, height);
            if (cmd.name) rect.name = cmd.name;
            if (cmd.color) {
              const color = parseHexColor(cmd.color);
              rect.fills = [{ type: 'SOLID', color: { r: color.r, g: color.g, b: color.b } }];
            }
            applyBaseStyling(rect, cmd);
            applySizingConstraints(rect, cmd);

            // Append to rectangle frame if grouping rectangles, otherwise to parent/page
            if (rectangleFrame) {
              const { x, y } = getDefaultPosition(cmd, { width, height });
              rect.x = x - rectangleFrame.x;
              rect.y = y - rectangleFrame.y;
              rectangleFrame.appendChild(rect);
            } else {
              await appendToParent(rect, cmd, { width, height });
              figma.currentPage.selection = [rect];
            }

            success++;
            continue;
          }

          if (cmd.action === 'createRectangleWithImage') {
            try {
              const rect = figma.createRectangle();
              const width = cmd.width || 512;
              const height = cmd.height || 512;
              rect.resize(width, height);
              if (cmd.name) rect.name = cmd.name;

              // Create image from base64 data and set as fill
              if (cmd.imageData) {
                const bytes = base64ToBytes(cmd.imageData);
                const image = figma.createImage(bytes);
                rect.fills = [{
                  type: 'IMAGE',
                  imageHash: image.hash,
                  scaleMode: cmd.scaleMode || 'FILL'
                } as ImagePaint];
              } else {
                throw new Error('Invalid imageData: must be a base64 string or bytes');
              }

              applyBaseStyling(rect, cmd);
              applySizingConstraints(rect, cmd);

              registerCreatedNode(rect, cmd.refId);

              // Use common helper which handles parentName, persistence, and default positioning
              await appendToParent(rect, cmd, { width, height });

              const parentNode = rect.parent;
              if (parentNode && parentNode.type !== 'PAGE') {
                // Apply layout sizing properties if provided (allows generated images to fill container etc)
                const p = parentNode as any;
                const parentIsAL = (p.type === 'FRAME' || p.type === 'COMPONENT' || p.type === 'INSTANCE') && p.layoutMode !== 'NONE';
                const parentALMode = parentIsAL ? p.layoutMode : null;

                const hSizing = cmd.horizontal;
                const vSizing = cmd.vertical;
                const r = rect as any;

                if (hSizing && parentIsAL) {
                  if (hSizing === 'FILL') {
                    if ('layoutSizingHorizontal' in r) r.layoutSizingHorizontal = 'FILL';
                    else if (parentALMode === 'HORIZONTAL') r.layoutGrow = 1;
                    else r.layoutAlign = 'STRETCH';
                  } else if (hSizing === 'HUG') {
                    if ('layoutSizingHorizontal' in r) r.layoutSizingHorizontal = 'FIXED';
                  } else if (hSizing === 'FIXED') {
                    if ('layoutSizingHorizontal' in r) r.layoutSizingHorizontal = 'FIXED';
                  }
                }

                if (vSizing && parentIsAL) {
                  if (vSizing === 'FILL') {
                    if ('layoutSizingVertical' in r) r.layoutSizingVertical = 'FILL';
                    else if (parentALMode === 'VERTICAL') r.layoutGrow = 1;
                    else r.layoutAlign = 'STRETCH';
                  } else if (vSizing === 'HUG') {
                    if ('layoutSizingVertical' in r) r.layoutSizingVertical = 'FIXED';
                  } else if (vSizing === 'FIXED') {
                    if ('layoutSizingVertical' in r) r.layoutSizingVertical = 'FIXED';
                  }
                }

                if (cmd.layoutAlign) {
                  const align = typeof cmd.layoutAlign === 'string' ? cmd.layoutAlign.toUpperCase() : cmd.layoutAlign;
                  if (['MIN', 'CENTER', 'MAX', 'STRETCH', 'INHERIT'].includes(align)) {
                    r.layoutAlign = align;
                  }
                }
                if (cmd.layoutGrow !== undefined) {
                  r.layoutGrow = cmd.layoutGrow ? 1 : 0;
                }

                if (cmd.layoutPositioning) {
                  const pos = typeof cmd.layoutPositioning === 'string' ? cmd.layoutPositioning.toUpperCase() : cmd.layoutPositioning;
                  if (pos === 'ABSOLUTE' || pos === 'AUTO') {
                    if (pos === 'ABSOLUTE') {
                      if (parentIsAL) r.layoutPositioning = 'ABSOLUTE';
                    } else {
                      r.layoutPositioning = pos;
                    }
                  }
                }

                // Apply min/max constraints
                applySizingConstraints(r, cmd);

                // Final coordinate application if absolute
                const isAbsolute = r.layoutPositioning === 'ABSOLUTE';
                if (!parentIsAL || isAbsolute) {
                  if (typeof cmd.x === 'number' || typeof cmd.y === 'number') {
                    if (typeof cmd.x === 'number') r.x = cmd.x;
                    if (typeof cmd.y === 'number') r.y = cmd.y;
                  }
                }
              }

              figma.currentPage.selection = [rect];
              figma.viewport.scrollAndZoomIntoView([rect]);

              success++;
            } catch (error) {
              console.error('createRectangleWithImage failed', error);
              if (!firstError) firstError = { action: cmd.action, message: (error as Error)?.message || 'createRectangleWithImage failed' };
              failed++;
            }
            continue;
          }

          if (cmd.action === 'createGridLines') {
            const mode = (cmd.mode || 'totalSize').toString();

            // Mode: total size (existing behavior)
            const count = Math.max(1, Math.min(200, cmd.count || 5));
            const length = Math.max(10, Math.min(50000, cmd.length || 400));
            const spacing = count > 1 ? length / (count - 1) : 0;

            // Mode: square grid (n x m) using square size
            const rows = Math.max(1, Math.min(500, cmd.rows || 6));
            const cols = Math.max(1, Math.min(500, cmd.cols || 6));
            const squareSize = Math.max(1, Math.min(10000, cmd.squareSize || 50));
            const gridWidth = cols * squareSize;
            const gridHeight = rows * squareSize;
            const spacingX = cols > 0 ? gridWidth / cols : 0;
            const spacingY = rows > 0 ? gridHeight / rows : 0;
            const verticalLength = mode === 'squareGrid' ? gridHeight : length;
            const horizontalLength = mode === 'squareGrid' ? gridWidth : length;
            const strokeWeight = Math.max(0.5, Math.min(100, cmd.strokeWeight || 1));
            const color = cmd.color || '#E5E7EB';

            const includeHorizontal = true;
            const includeVertical = true;

            // Account for stroke width - strokes extend half their width on each side
            const strokePadding = strokeWeight;

            // Adjust origin to account for stroke padding
            const originX = strokePadding;
            const originY = strokePadding;

            // Calculate bounds for the frame (padding only on left/top for stroke containment)
            const minX = 0;
            const minY = 0;
            let maxX = originX + horizontalLength;
            let maxY = originY + verticalLength;

            if (includeHorizontal) {
              const horizontalLines = mode === 'squareGrid' ? rows + 1 : count;
              const ySpacing = mode === 'squareGrid' ? spacingY : spacing;
              maxY = originY + (horizontalLines - 1) * ySpacing;
            }

            if (includeVertical) {
              const verticalLines = mode === 'squareGrid' ? cols + 1 : count;
              const xSpacing = mode === 'squareGrid' ? spacingX : spacing;
              maxX = originX + (verticalLines - 1) * xSpacing;
            }

            const frameWidth = maxX - minX;
            const frameHeight = maxY - minY;

            const lineCount = (includeHorizontal ? (mode === 'squareGrid' ? rows + 1 : count) : 0) +
              (includeVertical ? (mode === 'squareGrid' ? cols + 1 : count) : 0);

            // Create the frame
            const frame = figma.createFrame();
            frame.name = `Grid Lines (${lineCount} lines)`;
            frame.resize(frameWidth, frameHeight);
            frame.x = viewportCenter.x - frameWidth / 2;
            frame.y = viewportCenter.y - frameHeight / 2;
            // Remove default background fill
            frame.fills = [];

            // Parse color for strokes (only RGB, no alpha)
            const strokeColor = parseHexColor(color);

            // Create and add horizontal lines
            if (includeHorizontal) {
              const horizontalLines = mode === 'squareGrid' ? rows + 1 : count;
              const ySpacing = mode === 'squareGrid' ? spacingY : spacing;
              for (let i = 0; i < horizontalLines; i++) {
                const line = figma.createLine();
                const isTopLine = i === 0;
                const lineLength = isTopLine ? maxX : horizontalLength;
                const lineX = isTopLine ? 0 : originX;

                line.resize(lineLength, 0);
                line.x = lineX;
                line.y = originY + i * ySpacing;
                line.strokes = [{ type: 'SOLID', color: { r: strokeColor.r, g: strokeColor.g, b: strokeColor.b } }];
                line.strokeWeight = strokeWeight;
                frame.appendChild(line);
              }
            }

            // Create and add vertical lines
            if (includeVertical) {
              const verticalLines = mode === 'squareGrid' ? cols + 1 : count;
              const xSpacing = mode === 'squareGrid' ? spacingX : spacing;
              for (let i = 0; i < verticalLines; i++) {
                const line = figma.createLine();
                const isLeftLine = i === 0;
                const lineLength = isLeftLine ? maxY : verticalLength;
                const lineY = isLeftLine ? maxY : originY + verticalLength;

                line.resize(lineLength, 0);
                line.rotation = 90;
                line.x = originX + i * xSpacing;
                // Align top edge for left line, bottom edge for others
                line.y = isLeftLine ? lineY : originY + verticalLength;
                line.strokes = [{ type: 'SOLID', color: { r: strokeColor.r, g: strokeColor.g, b: strokeColor.b } }];
                line.strokeWeight = strokeWeight;
                frame.appendChild(line);
              }
            }

            // Add frame to parent and select it
            await appendToParent(frame, cmd, { width: frameWidth, height: frameHeight });
            figma.currentPage.selection = [frame];
            success++;
            continue;
          }

          if (cmd.action === 'createAdvancedGrid') {
            const pattern = cmd.pattern || 'grid';
            const shape = cmd.shape || 'rectangle';
            const rows = Math.max(1, Math.min(50, cmd.rows || 4));
            const cols = Math.max(1, Math.min(50, cmd.cols || 3));
            const cellWidth = Math.max(1, Math.min(500, cmd.cellWidth || 100));
            const cellHeight = Math.max(1, Math.min(500, cmd.cellHeight || 80));
            const spacing = Math.max(0, Math.min(100, cmd.spacing || 16));

            // Pattern-specific settings
            const centerX = 0;
            const centerY = 0;
            let radius = 200;
            let angle = 0;

            if (pattern === 'radial') {
              radius = cmd.radialRadius || 200;
              angle = cmd.radialAngle || 0;
            } else if (pattern === 'spiral') {
              radius = cmd.spiralRadius || 200;
              angle = cmd.spiralAngle || 0;
            }
            const spiralTurns = cmd.spiralTurns || 3;
            const brickOffset = cmd.brickOffset || 0.5;
            const radialRings = cmd.radialRings || 3;
            const radialInnerRadius = Math.min(cmd.radialInnerRadius || 0, radius);
            const radialItems = cmd.radialItems || 20;
            const spiralItems = cmd.spiralItems || 20;

            // Shape-specific settings
            const color = cmd.color || '#E5E7EB';
            const strokeColor = cmd.strokeColor || '#000000';
            const strokeWeight = Math.max(0, Math.min(100, cmd.strokeWeight || 0));
            const cornerRadius = Math.max(0, Math.min(100, cmd.cornerRadius || 0));
            const sides = Math.max(3, Math.min(20, cmd.sides || 6));
            const innerRadius = Math.max(0, Math.min(1, cmd.innerRadius || 0.4));
            const points = Math.max(3, Math.min(20, cmd.points || 5));

            // Prevent extremely large grids
            let finalRows = rows;
            let finalCols = cols;
            const totalCells = finalRows * finalCols;
            if (totalCells > 1000) {
              console.warn(`Grid too large: ${totalCells} cells. Limiting to 1000 cells.`);
              const aspectRatio = finalCols / finalRows;
              const maxRows = Math.floor(Math.sqrt(1000 / aspectRatio));
              const maxCols = Math.floor(1000 / maxRows);
              finalRows = Math.min(finalRows, maxRows);
              finalCols = Math.min(finalCols, maxCols);
            }

            // Calculate grid bounds
            let gridWidth = 0;
            let gridHeight = 0;
            const positions: Array<{ x: number, y: number }> = [];

            // Generate positions based on pattern
            switch (pattern) {
              case 'grid':
                gridWidth = finalCols * cellWidth + (finalCols - 1) * spacing;
                gridHeight = finalRows * cellHeight + (finalRows - 1) * spacing;
                for (let row = 0; row < finalRows; row++) {
                  for (let col = 0; col < finalCols; col++) {
                    positions.push({
                      x: col * (cellWidth + spacing),
                      y: row * (cellHeight + spacing)
                    });
                  }
                }
                break;

              case 'brick':
                gridWidth = finalCols * cellWidth + (finalCols - 1) * spacing;
                gridHeight = finalRows * cellHeight + (finalRows - 1) * spacing;
                for (let row = 0; row < finalRows; row++) {
                  for (let col = 0; col < finalCols; col++) {
                    const offsetX = row % 2 === 0 ? 0 : brickOffset * cellWidth;
                    positions.push({
                      x: col * (cellWidth + spacing) + offsetX,
                      y: row * (cellHeight + spacing)
                    });
                  }
                }
                break;

              case 'radial': {
                // Calculate bounds for radial first
                const maxDistance = radius;
                gridWidth = maxDistance * 2 + cellWidth;
                gridHeight = maxDistance * 2 + cellHeight;

                // Create concentric ring pattern, centered in the frame
                const patternCenterX = gridWidth / 2 + centerX;
                const patternCenterY = gridHeight / 2 + centerY;

                let itemsPlaced = 0;
                for (let ring = 0; ring < radialRings && itemsPlaced < radialItems; ring++) {
                  // Interpolate between inner radius and outer radius
                  const ringRadius = radialInnerRadius + (ring / (radialRings - 1 || 1)) * (radius - radialInnerRadius);

                  // Distribute remaining items across remaining rings
                  const remainingRings = radialRings - ring;
                  const remainingItems = radialItems - itemsPlaced;
                  const targetItemsPerRing = Math.ceil(remainingItems / remainingRings);

                  // For center ring, limit to 1 item. For other rings, use the calculated distribution
                  const itemsInRing = ring === 0 ? Math.min(1, remainingItems) : Math.min(targetItemsPerRing, remainingItems);

                  for (let i = 0; i < itemsInRing && itemsPlaced < radialItems; i++) {
                    const angleRad = (i / itemsInRing) * Math.PI * 2 + (angle * Math.PI / 180);

                    positions.push({
                      x: patternCenterX + Math.cos(angleRad) * ringRadius,
                      y: patternCenterY + Math.sin(angleRad) * ringRadius
                    });
                    itemsPlaced++;
                  }
                }
                break;
              }

              case 'spiral': {
                // Calculate bounds for spiral first
                gridWidth = radius * 2 + cellWidth;
                gridHeight = radius * 2 + cellHeight;

                // Create spiral pattern, centered in the frame
                const spiralPatternCenterX = gridWidth / 2 + centerX;
                const spiralPatternCenterY = gridHeight / 2 + centerY;

                for (let i = 0; i < spiralItems; i++) {
                  const t = i / spiralItems;
                  const angleRad = t * Math.PI * 2 * spiralTurns;
                  const distance = t * radius;
                  positions.push({
                    x: spiralPatternCenterX + Math.cos(angleRad) * distance,
                    y: spiralPatternCenterY + Math.sin(angleRad) * distance
                  });
                }
                break;
              }
            }

            // Create main grid frame (normal frame, not auto-layout)
            const gridFrame = figma.createFrame();
            gridFrame.name = `${pattern.charAt(0).toUpperCase() + pattern.slice(1)} Grid (${shape})`;
            gridFrame.resize(gridWidth, gridHeight);
            gridFrame.fills = []; // Remove default fill

            registerCreatedNode(gridFrame, cmd.refId);

            const fillColor = parseHexColor(color);
            const parsedStrokeColor = parseHexColor(strokeColor);

            // Create shapes at each position
            for (let i = 0; i < positions.length; i++) {
              const pos = positions[i];
              let shapeNode: SceneNode | null = null;

              switch (shape) {
                case 'rectangle': {
                  const rect = figma.createRectangle();
                  rect.resize(cellWidth, cellHeight);
                  rect.fills = [{ type: 'SOLID', color: { r: fillColor.r, g: fillColor.g, b: fillColor.b } }];
                  if (strokeWeight > 0) {
                    rect.strokes = [{ type: 'SOLID', color: { r: parsedStrokeColor.r, g: parsedStrokeColor.g, b: parsedStrokeColor.b } }];
                    rect.strokeWeight = strokeWeight;
                  }
                  if (cornerRadius > 0) {
                    rect.cornerRadius = cornerRadius;
                  }
                  rect.name = `Rectangle ${i + 1}`;
                  shapeNode = rect;
                  break;
                }

                case 'ellipse':
                  const ellipse = figma.createEllipse();
                  ellipse.resize(cellWidth, cellHeight);
                  ellipse.fills = [{ type: 'SOLID', color: { r: fillColor.r, g: fillColor.g, b: fillColor.b } }];
                  if (strokeWeight > 0) {
                    ellipse.strokes = [{ type: 'SOLID', color: { r: parsedStrokeColor.r, g: parsedStrokeColor.g, b: parsedStrokeColor.b } }];
                    ellipse.strokeWeight = strokeWeight;
                  }
                  ellipse.name = `Ellipse ${i + 1}`;
                  shapeNode = ellipse;
                  break;

                case 'polygon':
                  const polygon = figma.createPolygon();
                  polygon.resize(cellWidth, cellHeight);
                  polygon.fills = [{ type: 'SOLID', color: { r: fillColor.r, g: fillColor.g, b: fillColor.b } }];
                  if (strokeWeight > 0) {
                    polygon.strokes = [{ type: 'SOLID', color: { r: parsedStrokeColor.r, g: parsedStrokeColor.g, b: parsedStrokeColor.b } }];
                    polygon.strokeWeight = strokeWeight;
                  }
                  polygon.pointCount = sides;
                  polygon.name = `Polygon ${i + 1}`;
                  shapeNode = polygon;
                  break;

                case 'star':
                  const star = figma.createStar();
                  star.resize(cellWidth, cellHeight);
                  star.fills = [{ type: 'SOLID', color: { r: fillColor.r, g: fillColor.g, b: fillColor.b } }];
                  if (strokeWeight > 0) {
                    star.strokes = [{ type: 'SOLID', color: { r: parsedStrokeColor.r, g: parsedStrokeColor.g, b: parsedStrokeColor.b } }];
                    star.strokeWeight = strokeWeight;
                  }
                  star.pointCount = points;
                  star.innerRadius = innerRadius;
                  star.name = `Star ${i + 1}`;
                  shapeNode = star;
                  break;

                case 'line':
                  const line = figma.createLine();
                  line.resize(cellWidth, 0);
                  line.strokes = [{ type: 'SOLID', color: { r: fillColor.r, g: fillColor.g, b: fillColor.b } }];
                  line.strokeWeight = strokeWeight || 2;
                  line.name = `Line ${i + 1}`;
                  shapeNode = line;
                  break;

                case 'arrow':
                  const arrowFrame = figma.createFrame();
                  arrowFrame.resize(cellWidth, cellHeight);
                  arrowFrame.fills = [];

                  const arrowLine = figma.createLine();
                  arrowLine.resize(cellWidth * 0.8, 0);
                  arrowLine.x = 0;
                  arrowLine.y = cellHeight / 2;
                  arrowLine.strokes = [{ type: 'SOLID', color: { r: fillColor.r, g: fillColor.g, b: fillColor.b } }];
                  arrowLine.strokeWeight = strokeWeight || 2;

                  const arrowHead = figma.createPolygon();
                  arrowHead.resize(cellWidth * 0.2, cellHeight * 0.3);
                  arrowHead.x = cellWidth * 0.8;
                  arrowHead.y = cellHeight * 0.35;
                  arrowHead.fills = [{ type: 'SOLID', color: { r: fillColor.r, g: fillColor.g, b: fillColor.b } }];
                  arrowHead.pointCount = 3;

                  arrowFrame.appendChild(arrowLine);
                  arrowFrame.appendChild(arrowHead);
                  arrowFrame.name = `Arrow ${i + 1}`;
                  shapeNode = arrowFrame;
                  break;

                case 'frame':
                  const frame = figma.createFrame();
                  frame.resize(cellWidth, cellHeight);
                  frame.fills = [{ type: 'SOLID', color: { r: fillColor.r, g: fillColor.g, b: fillColor.b } }];
                  if (strokeWeight > 0) {
                    frame.strokes = [{ type: 'SOLID', color: { r: parsedStrokeColor.r, g: parsedStrokeColor.g, b: parsedStrokeColor.b } }];
                    frame.strokeWeight = strokeWeight;
                  }
                  if (cornerRadius > 0) {
                    frame.cornerRadius = cornerRadius;
                  }
                  frame.name = `Frame ${i + 1}`;
                  shapeNode = frame;
                  break;

                case 'selectedLayer':
                  // For selected layer, we would need to clone existing selection
                  // This is complex, so for now create a rectangle as fallback
                  const selectedRect = figma.createRectangle();
                  selectedRect.resize(cellWidth, cellHeight);
                  selectedRect.fills = [{ type: 'SOLID', color: { r: fillColor.r, g: fillColor.g, b: fillColor.b } }];
                  selectedRect.name = `Selected Layer ${i + 1}`;
                  shapeNode = selectedRect;
                  break;
              }

              if (shapeNode) {
                shapeNode.x = pos.x;
                shapeNode.y = pos.y;
                gridFrame.appendChild(shapeNode);
              }
            }

            await appendToParent(gridFrame, cmd, { width: gridWidth, height: gridHeight });
            figma.currentPage.selection = [gridFrame];
            success++;
            continue;
          }

          if (cmd.action === 'createEllipse') {
            const ellipse = figma.createEllipse();
            registerCreatedNode(ellipse, cmd.refId, cmd.name);
            const width = cmd.width || 100;
            const height = cmd.height || 100;
            ellipse.resize(width, height);
            if (cmd.name) ellipse.name = cmd.name;
            if (cmd.color) {
              const color = parseHexColor(cmd.color);
              ellipse.fills = [{ type: 'SOLID', color: { r: color.r, g: color.g, b: color.b } }];
            }
            applyBaseStyling(ellipse, cmd);
            applySizingConstraints(ellipse, cmd);
            await appendToParent(ellipse, cmd, { width, height });
            figma.currentPage.selection = [ellipse];
            success++;
            continue;
          }

          if (cmd.action === 'createText') {
            const text = figma.createText();
            registerCreatedNode(text, cmd.refId, cmd.name);

            // Determine the target font: honour fontFamily / fontWeight / fontStyle from the command
            const targetFamily = cmd.fontFamily || 'Inter';
            const targetStyle = cmd.fontWeight
              ? normalizeFontStyle(cmd.fontWeight)
              : (cmd.fontStyle || 'Regular');
            const loadedFont = await smartLoadFont({ family: targetFamily, style: targetStyle });
            text.fontName = loadedFont;

            // Apply properties BEFORE inserting into Auto Layout (which happens in Pass 2)
            if (cmd.text) text.characters = cmd.text;
            if (cmd.fontSize) text.fontSize = cmd.fontSize;
            if (cmd.name) text.name = cmd.name;
            if (cmd.listType) {
              text.setRangeListOptions(0, text.characters.length, { type: cmd.listType });
            }
            if (cmd.listSpacing) {
              text.listSpacing = cmd.listSpacing;
            }
            if (cmd.color) {
              const color = parseHexColor(cmd.color);
              text.fills = [{ type: 'SOLID', color: { r: color.r, g: color.g, b: color.b } }];
            }

            await appendToParent(text, cmd, { width: text.width, height: text.height });
            figma.currentPage.selection = [text];
            success++;
            continue;
          }

          if (cmd.action === 'createFrame') {
            const frame = figma.createFrame();
            registerCreatedNode(frame, cmd.refId, cmd.name);

            // Root detection by role and intent graph
            const intent = intentMap.get(cmd.refId);
            const isStructural = !!cmd.refId;
            const isRoot = intent?.isRoot || false;
            const isIcon = intent?.isIcon || false;

            // Default sizes: 24x24 for icons, 40x40 for other containers (root is 800x600)
            const defaultWidth = isRoot ? 800 : (isIcon ? 24 : 40);
            const defaultHeight = isRoot ? 600 : (isIcon ? 24 : 40);
            const width = cmd.width || defaultWidth;
            const height = cmd.height || defaultHeight;

            frame.resize(width, height);

            if (cmd.name) frame.name = cmd.name;

            // FIX: Remove Figma's default white fill from non-root frames
            // Frames are transparent by default; only add fill if explicitly specified
            if (cmd.color) {
              const color = parseHexColor(cmd.color);
              frame.fills = [{ type: 'SOLID', color: { r: color.r, g: color.g, b: color.b } }];
            } else if (!isRoot) {
              // Non-root structural frames should be transparent (no fill)
              frame.fills = [];
            }
            // Root frames keep Figma's default white (or will be styled via setFill in Pass 3)
            if (cmd.clipsContent !== undefined) {
              frame.clipsContent = cmd.clipsContent;
            }
            applyBaseStyling(frame, cmd);
            applyAutoLayoutPadding(frame, cmd);
            applySizingConstraints(frame, cmd);

            // Apply HUG defaults for structural frames that are NOT icons and NOT roots
            if (isStructural && !cmd.width && !cmd.height && !isIcon && !isRoot) {
              frame.primaryAxisSizingMode = 'AUTO';
              frame.counterAxisSizingMode = 'AUTO';
            }

            // For roots with explicit sizes, keep them FIXED
            if (isRoot && (cmd.width || cmd.height)) {
              frame.primaryAxisSizingMode = 'FIXED';
              frame.counterAxisSizingMode = 'FIXED';
            }

            // Fallback: Apply basic layout properties if provided directly during creation
            if (cmd.direction) {
              const direction = cmd.direction.toUpperCase();
              if (direction === 'HORIZONTAL' || direction === 'VERTICAL') frame.layoutMode = direction;
              else if (direction === 'GRID') frame.layoutMode = 'GRID';
            }
            if (cmd.gap !== undefined) {
              if (frame.layoutMode === 'GRID') {
                (frame as any).gridColumnGap = cmd.gap;
                (frame as any).gridRowGap = cmd.gap;
              } else {
                frame.itemSpacing = cmd.gap;
              }
            }

            await appendToParent(frame, cmd, { width, height });
            figma.currentPage.selection = [frame];
            success++;
            continue;
          }

          if (cmd.action === 'duplicate') {
            // resolveNodeSmart handles refId, id, name, and case-insensitivity
            const sourceId = cmd.nodeId || cmd.refId;
            let sourceNode = await resolveNodeSmart(sourceId) as SceneNode;

            if (!sourceNode) {
              console.error('Duplicate failed: Source node not found', sourceId);
              failed++;
              continue;
            }

            // Clone the fully-configured source (runs after all layout passes)
            const clone = (sourceNode as any).clone();

            // Set clone name: use cmd.name if provided, otherwise keep source name
            if (cmd.name) {
              clone.name = cmd.name;
            }

            // Register refId if provided
            if (cmd.refId) {
              registerCreatedNode(clone, cmd.refId, cmd.name || clone.name);
            }

            // Handle nesting if parentId provided
            // Capture source's layout sizing BEFORE moving to new parent (Figma may reset on appendChild)
            const srcLayoutH = ('layoutSizingHorizontal' in sourceNode) ? (sourceNode as any).layoutSizingHorizontal : null;
            const srcLayoutV = ('layoutSizingVertical' in sourceNode) ? (sourceNode as any).layoutSizingVertical : null;

            if (cmd.parentId) {
              const parent = await resolveParentSmart(cmd.parentId, cmd.parentName);
              if (parent && 'appendChild' in parent) {
                parent.appendChild(clone);
              }
            } else if (sourceNode.parent) {
              (sourceNode.parent as ChildrenMixin).appendChild(clone);
            }

            // Restore layout sizing after appendChild (Figma can reset these to FIXED on re-parent)
            if (srcLayoutH && 'layoutSizingHorizontal' in clone) {
              try { clone.layoutSizingHorizontal = srcLayoutH; } catch (e) { /* ignore */ }
            }
            if (srcLayoutV && 'layoutSizingVertical' in clone) {
              try { clone.layoutSizingVertical = srcLayoutV; } catch (e) { /* ignore */ }
            }

            // Set position (absolute or relative) — only for non-auto-layout parents
            if (cmd.x !== undefined) clone.x = cmd.x;
            else if (cmd.offsetX !== undefined) clone.x = sourceNode.x + cmd.offsetX;

            if (cmd.y !== undefined) clone.y = cmd.y;
            else if (cmd.offsetY !== undefined) clone.y = sourceNode.y + cmd.offsetY;

            // Handle content overrides (specifically text)
            // Handle content overrides (specifically text)
            if (cmd.overrides && typeof cmd.overrides === 'object') {
              const overrides = cmd.overrides as { [key: string]: string };
              let keysToHandle = Object.keys(overrides);

              // 1. Instance Property Optimization
              // If clone is an instance, try setting text properties directly (much faster)
              if (clone.type === 'INSTANCE') {
                const instance = clone as InstanceNode;
                try {
                  const mainComp = await (('getMainComponentAsync' in instance) ? (instance as any).getMainComponentAsync() : (instance as any).mainComponent);
                  if (mainComp) {
                    const defs = (mainComp.parent && mainComp.parent.type === 'COMPONENT_SET')
                      ? (mainComp.parent as ComponentSetNode).componentPropertyDefinitions
                      : mainComp.componentPropertyDefinitions;

                    const textProps = Object.entries(defs).filter(([_, d]) => (d as any).type === 'TEXT');
                    const propsToSet: { [key: string]: string } = {};

                    // Map override keys to property names
                    for (const key of keysToHandle) {
                      const val = overrides[key];
                      // Match property name exactly or close enough
                      // e.g. "Title" -> "Title#12:34"
                      let propKey = '';
                      // Try exact scan
                      const exact = textProps.find(([k, _]) => k.split('#')[0] === key);
                      if (exact) {
                        propKey = exact[0];
                      } else {
                        // Try loose scan (case-insensitive)
                        const loose = textProps.find(([k, _]) => k.split('#')[0].toLowerCase() === key.toLowerCase());
                        if (loose) propKey = loose[0];
                      }

                      if (propKey) {
                        propsToSet[propKey] = val;
                      }
                    }

                    if (Object.keys(propsToSet).length > 0) {
                      instance.setProperties(propsToSet);
                      // Remove handled keys so we don't try to find them as nodes later
                      // Actually, let's keep them in case there's a node with the same name that *isn't* bound?
                      // Standard practice: if bound, property takes precedence.
                      // We can remove them from keysToHandle to save time.
                      const handledKeys = new Set(Object.keys(propsToSet).map(k => k.split('#')[0])); // Approximate reverse map
                      keysToHandle = keysToHandle.filter(k => !handledKeys.has(k) && !Object.keys(propsToSet).find(pk => pk.startsWith(k + '#')));
                    }
                  }
                } catch (e) {
                  console.warn('Duplicate: instance property set failed', e);
                }
              }

              // 2. Fallback: Efficient Text Node Lookup
              // Only search if there are still keys to handle
              if (keysToHandle.length > 0) {
                // Single pass to find all candidates, instead of one pass per key
                const textNodes = (clone as any).findAll((n: any) => n.type === 'TEXT');
                const textNodeMap = new Map<string, TextNode>();
                // In case of duplicates, last one wins or first one? Usually first one in tree order is better for "title" etc.
                // so we set if not present.
                for (const tn of textNodes) {
                  if (!textNodeMap.has(tn.name)) {
                    textNodeMap.set(tn.name, tn as TextNode);
                  }
                }

                for (const key of keysToHandle) {
                  const node = textNodeMap.get(key);
                  if (node) {
                    try {
                      await loadAllFontsForTextNode(node);
                      node.characters = overrides[key];
                    } catch (e) {
                      console.warn('Duplicate: failed to set text on node', key, e);
                    }
                  }
                }
              }
            }

            applySizingConstraints(clone as SceneNode, cmd);
            node = clone;
            success++;
            continue;
          }

          if (cmd.action === 'createInstance') {
            const targetId = cmd.nodeId || cmd.refId;
            let sourceNode = await resolveNodeSmart(targetId);

            // If user referenced a component set, use its default variant
            if (sourceNode && sourceNode.type === 'COMPONENT_SET') {
              sourceNode = (sourceNode as ComponentSetNode).defaultVariant;
            }

            // If user referenced an instance, resolve to its main component (works for both local and remote/library components)
            if (sourceNode && sourceNode.type === 'INSTANCE') {
              try {
                const mainComp = await (sourceNode as InstanceNode).getMainComponentAsync();
                if (mainComp) {
                  sourceNode = mainComp;
                }
              } catch (e) {
                console.warn('createInstance: failed to resolve main component from instance', e);
              }
              if (!sourceNode || sourceNode.type !== 'COMPONENT') {
                console.error('createInstance failed: Could not resolve main component from instance (library may be inaccessible)', targetId);
                if (!firstError) firstError = { action: cmd.action, nodeId: targetId, message: 'Instance found but its main component could not be resolved. The source library may be inaccessible or the component may have been deleted.' };
                failed++;
                continue;
              }
            }

            if (!sourceNode || sourceNode.type !== 'COMPONENT') {
              console.error('createInstance failed: Source component not found', targetId);
              if (!firstError) firstError = { action: cmd.action, nodeId: targetId, message: 'Source component not found or is not a component node' };
              failed++;
              continue;
            }

            try {
              const component = sourceNode as ComponentNode;
              const instance = component.createInstance();

              // Set name if provided
              if (cmd.name) {
                instance.name = cmd.name;
              }

              // Register refId
              if (cmd.refId) {
                registerCreatedNode(instance, cmd.refId, cmd.name || instance.name);
              }
              applySizingConstraints(instance, cmd);

              // Capture source layout sizing BEFORE moving to new parent
              const srcLayoutH = ('layoutSizingHorizontal' in component) ? (component as any).layoutSizingHorizontal : null;
              const srcLayoutV = ('layoutSizingVertical' in component) ? (component as any).layoutSizingVertical : null;

              // Handle nesting if parentId provided
              if (cmd.parentId) {
                const parent = await resolveParentSmart(cmd.parentId, cmd.parentName);
                if (parent && 'appendChild' in parent) {
                  parent.appendChild(instance);

                  // Smart sizing: if the parent has auto-layout, default instance to FILL horizontal / HUG vertical
                  // This is the expected behavior for cards, list items, etc. inside auto-layout containers.
                  // Skip for icon/shape instances that would be distorted by FILL.
                  const parentLayoutMode = ('layoutMode' in parent) ? (parent as any).layoutMode : 'NONE';
                  const isIconInstance = isIconOrShapeNode(instance);
                  if (parentLayoutMode !== 'NONE' && 'layoutSizingHorizontal' in instance && !isIconInstance) {
                    try {
                      instance.layoutSizingHorizontal = 'FILL';
                    } catch (e) { /* ignore */ }
                    try {
                      if ('layoutSizingVertical' in instance) {
                        instance.layoutSizingVertical = srcLayoutV === 'FIXED' ? 'FIXED' : 'HUG';
                      }
                    } catch (e) { /* ignore */ }
                  }
                }
              } else {
                // No parent specified — restore source sizing
                if (srcLayoutH && 'layoutSizingHorizontal' in instance) {
                  try { instance.layoutSizingHorizontal = srcLayoutH; } catch (e) { /* ignore */ }
                }
                if (srcLayoutV && 'layoutSizingVertical' in instance) {
                  try { instance.layoutSizingVertical = srcLayoutV; } catch (e) { /* ignore */ }
                }
              }

              // Set position (absolute or relative)
              if (cmd.x !== undefined) instance.x = cmd.x;
              else if (cmd.offsetX !== undefined) instance.x = component.x + cmd.offsetX;

              if (cmd.y !== undefined) instance.y = cmd.y;
              else if (cmd.offsetY !== undefined) instance.y = component.y + cmd.offsetY;

              // Handle content overrides (text properties + fallback text node search)
              if (cmd.overrides && typeof cmd.overrides === 'object') {
                const overrides = cmd.overrides as { [key: string]: string };
                let keysToHandle = Object.keys(overrides);

                // 1. Instance Property Optimization: set text properties directly (much faster)
                try {
                  const mainComp = await (('getMainComponentAsync' in instance) ? (instance as any).getMainComponentAsync() : (instance as any).mainComponent);
                  if (mainComp) {
                    const defs = (mainComp.parent && mainComp.parent.type === 'COMPONENT_SET')
                      ? (mainComp.parent as ComponentSetNode).componentPropertyDefinitions
                      : mainComp.componentPropertyDefinitions;

                    const textProps = Object.entries(defs).filter(([_, d]) => (d as any).type === 'TEXT');
                    const propsToSet: { [key: string]: string } = {};

                    for (const key of keysToHandle) {
                      const val = overrides[key];
                      let propKey = '';
                      const exact = textProps.find(([k, _]) => k.split('#')[0] === key);
                      if (exact) {
                        propKey = exact[0];
                      } else {
                        const loose = textProps.find(([k, _]) => k.split('#')[0].toLowerCase() === key.toLowerCase());
                        if (loose) propKey = loose[0];
                      }
                      if (propKey) {
                        propsToSet[propKey] = val;
                      }
                    }

                    if (Object.keys(propsToSet).length > 0) {
                      instance.setProperties(propsToSet);
                      const handledKeys = new Set(Object.keys(propsToSet).map(k => k.split('#')[0]));
                      keysToHandle = keysToHandle.filter(k => !handledKeys.has(k) && !Object.keys(propsToSet).find(pk => pk.startsWith(k + '#')));
                    }
                  }
                } catch (e) {
                  console.warn('createInstance: instance property set failed', e);
                }

                // 2. Fallback: Text Node Lookup for remaining keys
                if (keysToHandle.length > 0) {
                  const textNodes = (instance as any).findAll((n: any) => n.type === 'TEXT');
                  const textNodeMap = new Map<string, TextNode>();
                  for (const tn of textNodes) {
                    if (!textNodeMap.has(tn.name)) {
                      textNodeMap.set(tn.name, tn as TextNode);
                    }
                  }

                  for (const key of keysToHandle) {
                    const textNode = textNodeMap.get(key);
                    if (textNode) {
                      try {
                        await figma.loadFontAsync(textNode.fontName as FontName);
                        textNode.characters = overrides[key];
                      } catch (fontErr) {
                        console.warn(`createInstance: Failed to set text for '${key}'`, fontErr);
                      }
                    }
                  }
                }
              }

              success++;
            } catch (error) {
              console.error('createInstance failed', error);
              if (!firstError) firstError = { action: cmd.action, nodeId: targetId, message: (error as Error)?.message || 'createInstance failed' };
              failed++;
            }
            continue;
          }

          if (cmd.action === 'createTable') {
            try {
              const rows = Math.max(1, Math.min(100, cmd.rows || 1));
              const cols = Math.max(1, Math.min(20, cmd.cols || 1));
              const data = cmd.data || [];
              const header = cmd.header !== false;
              const colWidths = cmd.colWidths || [];
              const rowHeight = cmd.rowHeight || 40;
              const defaultColWidth = cmd.defaultColWidth || 150;
              const _borderParsed = cmd.borderColor ? parseHexColor(cmd.borderColor) : { r: 0.898, g: 0.906, b: 0.922, a: 1 };
              const borderColor = { r: _borderParsed.r, g: _borderParsed.g, b: _borderParsed.b };
              const borderOpacity = _borderParsed.a ?? 1;
              const _headerParsed = cmd.headerColor ? parseHexColor(cmd.headerColor) : { r: 0.961, g: 0.965, b: 0.973, a: 1 };
              const headerColor = { r: _headerParsed.r, g: _headerParsed.g, b: _headerParsed.b };
              const headerOpacity = _headerParsed.a ?? 1;
              const _altParsed = cmd.alternateRowColor ? parseHexColor(cmd.alternateRowColor) : null;
              const alternateRowColor = _altParsed ? { r: _altParsed.r, g: _altParsed.g, b: _altParsed.b } : null;
              const alternateRowOpacity = _altParsed?.a ?? 1;

              const table = figma.createFrame();
              registerCreatedNode(table, cmd.refId, cmd.name);
              table.name = cmd.name || 'Table';
              table.layoutMode = 'VERTICAL';
              table.primaryAxisSizingMode = 'AUTO';
              table.counterAxisSizingMode = 'AUTO';
              table.itemSpacing = 0;
              table.fills = [];
              table.strokes = [{ type: 'SOLID', color: borderColor, opacity: borderOpacity }];
              table.strokeWeight = 1;
              table.clipsContent = true;

              await smartLoadFont({ family: "Inter", style: "Regular" });
              await smartLoadFont({ family: "Inter", style: "Bold" });
              if (cmd.headerFontFamily) {
                await smartLoadFont({ family: cmd.headerFontFamily, style: cmd.headerFontStyle || "Bold" });
              }

              for (let r = 0; r < rows; r++) {
                const isHeaderRow = header && r === 0;
                const rowFrame = figma.createFrame();
                rowFrame.name = isHeaderRow ? 'Header Row' : `Row ${r + 1}`;
                rowFrame.layoutMode = 'HORIZONTAL';
                rowFrame.primaryAxisSizingMode = 'AUTO';
                rowFrame.counterAxisSizingMode = 'FIXED';
                rowFrame.resize(rowFrame.width, rowHeight);
                rowFrame.counterAxisAlignItems = 'MIN';
                rowFrame.itemSpacing = 0;
                rowFrame.fills = [];

                if (r > 0) {
                  rowFrame.strokes = [{ type: 'SOLID', color: borderColor, opacity: borderOpacity }];
                  rowFrame.strokeWeight = 0;
                  rowFrame.strokeTopWeight = 1;
                  rowFrame.strokeBottomWeight = 0;
                  rowFrame.strokeLeftWeight = 0;
                  rowFrame.strokeRightWeight = 0;
                }

                table.appendChild(rowFrame);

                for (let c = 0; c < cols; c++) {
                  const cell = figma.createFrame();
                  cell.name = isHeaderRow ? `Header ${c + 1}` : `Cell ${r + 1}-${c + 1}`;
                  cell.layoutMode = 'HORIZONTAL';
                  const width = colWidths[c] || defaultColWidth;
                  cell.resize(width, rowHeight);
                  cell.paddingLeft = 12;
                  cell.paddingRight = 12;
                  cell.paddingTop = 8;
                  cell.paddingBottom = 8;
                  cell.counterAxisAlignItems = 'CENTER';

                  if (isHeaderRow) {
                    cell.fills = [{ type: 'SOLID', color: headerColor, opacity: headerOpacity }];
                  } else if (alternateRowColor && r % 2 === 0) {
                    cell.fills = [{ type: 'SOLID', color: alternateRowColor, opacity: alternateRowOpacity }];
                  } else {
                    cell.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
                  }

                  if (c > 0) {
                    cell.strokes = [{ type: 'SOLID', color: borderColor, opacity: borderOpacity }];
                    cell.strokeWeight = 0;
                    cell.strokeTopWeight = 0;
                    cell.strokeBottomWeight = 0;
                    cell.strokeLeftWeight = 1;
                    cell.strokeRightWeight = 0;
                  }

                  const text = figma.createText();
                  const headerFont = cmd.headerFontFamily
                    ? { family: cmd.headerFontFamily, style: cmd.headerFontStyle || "Bold" }
                    : { family: "Inter", style: "Bold" };
                  text.fontName = isHeaderRow ? headerFont : { family: "Inter", style: "Regular" };
                  text.characters = (data[r] && data[r][c]) ? String(data[r][c]) : "";
                  text.fontSize = isHeaderRow ? (cmd.headerFontSize || 13) : (cmd.fontSize || 13);
                  text.fills = [{
                    type: 'SOLID', color: isHeaderRow
                      ? { r: 0.067, g: 0.094, b: 0.153 }  // #111827
                      : { r: 0.122, g: 0.161, b: 0.216 }   // #1F2937
                  }];
                  text.textAutoResize = 'HEIGHT';
                  text.layoutAlign = 'STRETCH';
                  text.layoutGrow = 1;

                  cell.appendChild(text);
                  rowFrame.appendChild(cell);
                }
              }

              await appendToParent(table, cmd, { width: table.width, height: table.height });
              figma.currentPage.selection = [table];
              success++;
            } catch (error) {
              console.error('createTable failed', error);
              if (!firstError) firstError = { action: cmd.action, message: (error as Error)?.message || 'createTable failed' };
              failed++;
            }
            continue;
          }

          // createPolygon
          if (cmd.action === 'createPolygon') {
            const polygon = figma.createPolygon();
            registerCreatedNode(polygon, cmd.refId);
            polygon.pointCount = cmd.sides || 6;
            const width = cmd.width || 100;
            const height = cmd.height || 100;
            polygon.resize(width, height);
            if (cmd.name) polygon.name = cmd.name;
            if (cmd.color) {
              const color = parseHexColor(cmd.color);
              polygon.fills = [{ type: 'SOLID', color: { r: color.r, g: color.g, b: color.b } }];
            }
            applyBaseStyling(polygon, cmd);
            await appendToParent(polygon, cmd, { width, height });
            figma.currentPage.selection = [polygon];
            success++;
            continue;
          }

          // createStar
          if (cmd.action === 'createStar') {
            const star = figma.createStar();
            registerCreatedNode(star, cmd.refId);
            star.pointCount = cmd.points || 5;
            star.innerRadius = cmd.innerRadius || 0.4;
            const width = cmd.width || 100;
            const height = cmd.height || 100;
            star.resize(width, height);
            if (cmd.name) star.name = cmd.name;
            if (cmd.color) {
              const color = parseHexColor(cmd.color);
              star.fills = [{ type: 'SOLID', color: { r: color.r, g: color.g, b: color.b } }];
            }
            applyBaseStyling(star, cmd);
            await appendToParent(star, cmd, { width, height });
            figma.currentPage.selection = [star];
            success++;
            continue;
          }

          // createLine
          if (cmd.action === 'createLine') {
            const line = figma.createLine();
            registerCreatedNode(line, cmd.refId);
            const length = cmd.length || 100;
            line.resize(length, 0);
            if (cmd.angle) line.rotation = cmd.angle;
            if (cmd.name) line.name = cmd.name;
            if (cmd.color) {
              const color = parseHexColor(cmd.color);
              line.strokes = [{ type: 'SOLID', color: { r: color.r, g: color.g, b: color.b } }];
            }
            if (cmd.strokeWeight) line.strokeWeight = cmd.strokeWeight;
            await appendToParent(line, cmd, { width: length, height: 0 });
            figma.currentPage.selection = [line];
            success++;
            continue;
          }

          // FigJam sticky note creation
          if (cmd.action === 'createSticky') {
            const isFigJam = figma.editorType === 'figjam';
            let sticky: any;

            if (isFigJam) {
              sticky = figma.createSticky();
            } else {
              // Fallback for Figma design files: create an auto-layout frame that mimics a sticky
              const frame = figma.createFrame();
              frame.name = cmd.name || "Sticky";
              frame.layoutMode = "VERTICAL";
              frame.primaryAxisSizingMode = "AUTO";
              frame.counterAxisSizingMode = "FIXED";
              frame.resize(160, 160); // Default FigJam sticky size
              frame.paddingLeft = 16;
              frame.paddingRight = 16;
              frame.paddingTop = 16;
              frame.paddingBottom = 16;
              frame.itemSpacing = 8;
              frame.cornerRadius = 0; // Square corners for stickies

              // Add a shadow to mimic FigJam
              frame.effects = [{
                type: "DROP_SHADOW",
                color: { r: 0, g: 0, b: 0, a: 0.1 },
                offset: { x: 0, y: 2 },
                radius: 4,
                spread: 0,
                visible: true,
                blendMode: "NORMAL"
              }];

              // Add a text node inside
              const textNode = figma.createText();
              await smartLoadFont({ family: "Inter", style: "Medium" });
              textNode.fontName = { family: "Inter", style: "Medium" };
              textNode.characters = cmd.text || "";
              textNode.fontSize = 14;
              textNode.textAlignHorizontal = "LEFT";
              textNode.textAlignVertical = "TOP";
              textNode.layoutGrow = 1;
              textNode.layoutAlign = "STRETCH";

              frame.appendChild(textNode);
              frame.setPluginData("isFallbackSticky", "true");
              sticky = frame;
            }

            registerCreatedNode(sticky, cmd.refId);
            if (cmd.name) sticky.name = cmd.name;

            if (isFigJam && cmd.text) {
              await smartLoadFont({ family: "Inter", style: "Medium" });
              sticky.text.characters = cmd.text;
            }

            // Sticky note colors: "GRAY" | "BLUE" | "GREEN" | "YELLOW" | "ORANGE" | "PINK" | "VIOLET" | "RED" | "TEAL" | "LIGHT_GRAY"
            if (cmd.color) {
              // FigJam sticky color RGB values (from Figma's default palette)
              const colorMap: Record<string, { r: number, g: number, b: number }> = {
                'gray': { r: 0.898, g: 0.898, b: 0.898 },
                'blue': { r: 0.337, g: 0.612, b: 0.969 },
                'green': { r: 0.337, g: 0.761, b: 0.365 },
                'yellow': { r: 1, g: 0.922, b: 0.231 },
                'orange': { r: 1, g: 0.722, b: 0.318 },
                'pink': { r: 1, g: 0.522, b: 0.722 },
                'violet': { r: 0.737, g: 0.522, b: 1 },
                'purple': { r: 0.737, g: 0.522, b: 1 },
                'red': { r: 1, g: 0.721, b: 0.658 },
                'teal': { r: 0.337, g: 0.761, b: 0.761 },
                'light_gray': { r: 0.961, g: 0.961, b: 0.961 }
              };
              const stickyColor = colorMap[cmd.color.toLowerCase()] || colorMap['yellow'];
              if (stickyColor) {
                sticky.fills = [{ type: 'SOLID', color: stickyColor }];
                if (isFigJam) {
                  sticky.authorVisible = false;
                }
              }
            }
            await appendToParent(sticky, cmd, { width: 160, height: 120 });
            figma.currentPage.selection = [sticky];

            // Track created sticky for connector references
            // Support both indexed references (sticky0, sticky1) and the node's actual ID
            const stickyRef = `sticky${stickyCreationIndex}`;
            createdNodes.set(stickyRef, sticky);
            createdNodes.set(sticky.id, sticky);
            stickyCreationIndex++;

            success++;
            continue;
          }

          // FigJam connector creation
          if (cmd.action === 'createConnector') {
            const connectorSupported = typeof figma.createConnector === 'function' && figma.editorType === 'figjam';

            // Fallback for Figma design files: draw elbow-style vector path to connect nodes
            if (!connectorSupported) {
              let start: { x: number; y: number } | null = null;
              let end: { x: number; y: number } | null = null;
              let startCenter: { x: number; y: number } | null = null;
              let endCenter: { x: number; y: number } | null = null;

              if (cmd.startNodeId) {
                let startNode = await figma.getNodeByIdAsync(cmd.startNodeId) as SceneNode;

                // Fallback: check createdNodes map for recently created nodes
                if (!startNode && createdNodes.has(cmd.startNodeId)) {
                  startNode = createdNodes.get(cmd.startNodeId)!;
                }

                // Fallback: if node not found and we have a selected node, use it
                if (!startNode && firstSelectedNode) {
                  startNode = firstSelectedNode;
                }

                if (startNode) startCenter = getNodeCenter(startNode);
              } else if (cmd.startX !== undefined && cmd.startY !== undefined) {
                startCenter = { x: cmd.startX, y: cmd.startY };
              }

              if (cmd.endNodeId) {
                let endNode = await figma.getNodeByIdAsync(cmd.endNodeId) as SceneNode;

                // Fallback: check createdNodes map for recently created nodes
                if (!endNode && createdNodes.has(cmd.endNodeId)) {
                  endNode = createdNodes.get(cmd.endNodeId)!;
                }

                // Fallback: check current selection for newly created node
                if (!endNode) {
                  const currentSelection = figma.currentPage.selection;
                  if (currentSelection.length > 0) {
                    endNode = currentSelection[0];
                  }
                }

                if (endNode) endCenter = getNodeCenter(endNode);
              } else if (cmd.endX !== undefined && cmd.endY !== undefined) {
                endCenter = { x: cmd.endX, y: cmd.endY };
              }

              if (cmd.startNodeId && startCenter) {
                const target = endCenter ?? startCenter;
                const startNode = await figma.getNodeByIdAsync(cmd.startNodeId) as SceneNode;
                start = startNode ? getNearestBorderPoint(startNode, target) : startCenter;
              } else {
                start = startCenter;
              }

              if (cmd.endNodeId && endCenter) {
                const target = startCenter ?? endCenter;
                const endNode = await figma.getNodeByIdAsync(cmd.endNodeId) as SceneNode;
                end = endNode ? getNearestBorderPoint(endNode, target) : endCenter;
              } else {
                end = endCenter;
              }

              if (!start || !end) {
                if (!firstError) firstError = { action: cmd.action, message: 'Missing connector endpoints' };
                failed++;
                continue;
              }

              // Validate coordinates to avoid invalid path commands
              const numericPoints = [start, end].every(p => Number.isFinite(p.x) && Number.isFinite(p.y));
              if (!numericPoints) {
                if (!firstError) firstError = { action: cmd.action, message: 'Connector coordinates invalid' };
                failed++;
                continue;
              }

              const dx = end.x - start.x;
              const dy = end.y - start.y;

              // Build elbow path points based on alignment
              // Patterns: horizontal (same y), vertical (same x), H-V-H (more horizontal), V-H-V (more vertical)
              const points: { x: number; y: number }[] = [];
              if (dy === 0) {
                // Horizontally aligned: straight horizontal
                points.push(start, end);
              } else if (dx === 0) {
                // Vertically aligned: straight vertical
                points.push(start, end);
              } else if (Math.abs(dx) >= Math.abs(dy)) {
                // H-V-H pattern: midpoint X is center between start and end
                const midX = (start.x + end.x) / 2;
                points.push(start, { x: midX, y: start.y }, { x: midX, y: end.y }, end);
              } else {
                // V-H-V pattern: midpoint Y is center between start and end
                const midY = (start.y + end.y) / 2;
                points.push(start, { x: start.x, y: midY }, { x: end.x, y: midY }, end);
              }

              // Build SVG path data (relative to bounding box origin)
              const minX = Math.min(...points.map(p => p.x));
              const minY = Math.min(...points.map(p => p.y));
              const pointsRel = points.map(p => ({ x: p.x - minX, y: p.y - minY }));

              // Build path data with spaces after commands to satisfy Figma parser
              const pathData = pointsRel
                .map((p, i) => `${i === 0 ? 'M ' : 'L '}${p.x} ${p.y}`)
                .join(' ');

              const vector = figma.createVector();
              vector.vectorPaths = [{ windingRule: 'NONZERO', data: pathData }];
              vector.x = minX;
              vector.y = minY;
              vector.strokeCap = 'ARROW_EQUILATERAL';
              vector.strokeJoin = 'ROUND';
              vector.cornerRadius = 8;

              const strokeWeight = cmd.strokeWeight ?? 2;
              const strokeColor = cmd.strokeColor ? parseHexColor(cmd.strokeColor) : { r: 0.8, g: 0.8, b: 0.8, a: 1 };
              vector.strokes = [{ type: 'SOLID', color: { r: strokeColor.r, g: strokeColor.g, b: strokeColor.b } }];
              vector.strokeWeight = strokeWeight;

              if (cmd.name) vector.name = cmd.name;

              await appendToParent(vector, cmd, { width: vector.width, height: vector.height });
              figma.currentPage.selection = [vector];
              success++;
              continue;
            }

            const connector = figma.createConnector();

            // Set connector line type (ELBOWED, STRAIGHT, CURVED)
            if (cmd.lineType) {
              const lineTypeMap: Record<string, 'ELBOWED' | 'STRAIGHT' | 'CURVED'> = {
                'elbowed': 'ELBOWED',
                'straight': 'STRAIGHT',
                'curved': 'CURVED'
              };
              connector.connectorLineType = lineTypeMap[cmd.lineType.toLowerCase()] || 'ELBOWED';
            }

            let startSet = false;
            let endSet = false;

            // Connect to start node
            if (cmd.startNodeId) {
              let startNode = await figma.getNodeByIdAsync(cmd.startNodeId) as SceneNode;

              // Fallback: if node not found and we have a selected sticky, use it as start node
              // This helps with "Expand on idea" where the AI might reference the original sticky incorrectly
              if (!startNode && firstSelectedNode && (firstSelectedNode.type === 'STICKY' || (firstSelectedNode.type === 'FRAME' && firstSelectedNode.getPluginData("isFallbackSticky") === "true"))) {
                startNode = firstSelectedNode;
                // Update the command's startNodeId to the actual node ID
                cmd.startNodeId = startNode.id;
              }

              if (startNode) {
                connector.connectorStart = {
                  endpointNodeId: startNode.id,
                  magnet: cmd.startMagnet || 'AUTO'
                };
                startSet = true;
              } else {
                // Node not found - log error and skip connector creation
                if (!firstError) firstError = { action: cmd.action, message: `Start node not found: ${cmd.startNodeId}` };
                failed++;
                continue;
              }
            } else if (cmd.startX !== undefined && cmd.startY !== undefined) {
              // Use position if no node specified
              connector.connectorStart = {
                position: { x: cmd.startX, y: cmd.startY }
              };
              startSet = true;
            }

            // Connect to end node
            if (cmd.endNodeId) {
              // First try to get node by ID
              let endNode = await figma.getNodeByIdAsync(cmd.endNodeId) as SceneNode;

              // If not found, check if it's a reference to a recently created node (e.g., "sticky0", "sticky1")
              if (!endNode && createdNodes.has(cmd.endNodeId)) {
                endNode = createdNodes.get(cmd.endNodeId)!;
              }

              if (endNode) {
                connector.connectorEnd = {
                  endpointNodeId: endNode.id,
                  magnet: cmd.endMagnet || 'AUTO'
                };
                endSet = true;
              } else {
                // Node not found - try fallbacks:
                // 1. Check if any recently created sticky matches (search by ID pattern or use last created)
                let fallbackNode: SceneNode | null = null;

                // Try to find in created nodes map (might be referenced by index like "sticky0")
                if (createdNodes.size > 0) {
                  // If we have created stickies, try using the most recently created one
                  // This helps when AI creates stickies but doesn't know their exact IDs
                  const createdStickies = Array.from(createdNodes.values()).filter(n =>
                    n.type === 'STICKY' || (n.type === 'FRAME' && n.getPluginData("isFallbackSticky") === "true")
                  );
                  if (createdStickies.length > 0) {
                    // Use the last created sticky as fallback
                    fallbackNode = createdStickies[createdStickies.length - 1];
                  }
                }

                // 2. Check current selection as last resort
                if (!fallbackNode) {
                  const currentSelection = figma.currentPage.selection;
                  const selectedSticky = currentSelection.find(node =>
                    node.type === 'STICKY' || (node.type === 'FRAME' && node.getPluginData("isFallbackSticky") === "true")
                  );
                  if (selectedSticky) {
                    fallbackNode = selectedSticky as SceneNode;
                  }
                }

                if (fallbackNode) {
                  connector.connectorEnd = {
                    endpointNodeId: fallbackNode.id,
                    magnet: cmd.endMagnet || 'AUTO'
                  };
                  endSet = true;
                } else {
                  // Node not found - log error and skip connector creation
                  if (!firstError) firstError = { action: cmd.action, message: `End node not found: ${cmd.endNodeId}. Created ${createdNodes.size} nodes in this batch.` };
                  failed++;
                  continue;
                }
              }
            } else if (cmd.endX !== undefined && cmd.endY !== undefined) {
              // Use position if no node specified
              connector.connectorEnd = {
                position: { x: cmd.endX, y: cmd.endY }
              };
              endSet = true;
            }

            // Validate that both endpoints are set before appending connector
            if (!startSet || !endSet) {
              if (!firstError) {
                const missing = [];
                if (!startSet) missing.push('start');
                if (!endSet) missing.push('end');
                firstError = { action: cmd.action, message: `Missing connector endpoints: ${missing.join(', ')}` };
              }
              failed++;
              continue;
            }

            // Set stroke color
            if (cmd.strokeColor) {
              const color = parseHexColor(cmd.strokeColor);
              connector.strokes = [{ type: 'SOLID', color: { r: color.r, g: color.g, b: color.b } }];
            }

            // Set stroke weight
            if (cmd.strokeWeight) {
              connector.strokeWeight = cmd.strokeWeight;
            }

            if (cmd.name) connector.name = cmd.name;

            await appendToParent(connector, cmd);
            figma.currentPage.selection = [connector];
            success++;
            continue;
          }

          // FigJam shape with text creation
          if (cmd.action === 'createShapeWithText') {
            const shapeTypeMap: Record<string, 'SQUARE' | 'ELLIPSE' | 'DIAMOND' | 'TRIANGLE_UP' | 'TRIANGLE_DOWN' | 'PARALLELOGRAM_RIGHT' | 'PARALLELOGRAM_LEFT' | 'ENG_DATABASE' | 'ENG_QUEUE' | 'ENG_FILE' | 'ENG_FOLDER'> = {
              'square': 'SQUARE',
              'rectangle': 'SQUARE',
              'ellipse': 'ELLIPSE',
              'circle': 'ELLIPSE',
              'diamond': 'DIAMOND',
              'triangle': 'TRIANGLE_UP',
              'triangle_up': 'TRIANGLE_UP',
              'triangle_down': 'TRIANGLE_DOWN',
              'parallelogram': 'PARALLELOGRAM_RIGHT',
              'parallelogram_right': 'PARALLELOGRAM_RIGHT',
              'parallelogram_left': 'PARALLELOGRAM_LEFT',
              'database': 'ENG_DATABASE',
              'queue': 'ENG_QUEUE',
              'file': 'ENG_FILE',
              'folder': 'ENG_FOLDER'
            };

            const shapeType = shapeTypeMap[(cmd.shapeType || 'square').toLowerCase()] || 'SQUARE';
            const shape = figma.createShapeWithText();
            registerCreatedNode(shape, cmd.refId);
            shape.shapeType = shapeType;
            const width = cmd.width;
            const height = cmd.height;
            if (width && height) {
              shape.resize(width, height);
            }
            if (cmd.name) shape.name = cmd.name;
            if (cmd.text) {
              await smartLoadFont({ family: "Inter", style: "Medium" });
              shape.text.characters = cmd.text;
            }
            if (cmd.color) {
              const color = parseHexColor(cmd.color);
              shape.fills = [{ type: 'SOLID', color: { r: color.r, g: color.g, b: color.b } }];
            }

            await appendToParent(shape, cmd, width && height ? { width, height } : undefined);
            figma.currentPage.selection = [shape];
            success++;
            continue;
          }

          // Create Button Component Set with auto-layout and variants
          // Supports: btnTypes[] x btnStyles[] x sizes[] x states[]
          if (cmd.action === 'createButtonComponent') {
            await smartLoadFont({ family: "Inter", style: "Medium" });

            const text = cmd.text || 'Button';
            const defaultCornerRadius = cmd.cornerRadius !== undefined ? cmd.cornerRadius : 8;

            const sizeConfigs: Record<string, { fontSize: number, paddingH: number, paddingV: number, iconSize: number, iconGap: number }> = {
              'xxs': { fontSize: 10, paddingH: 8, paddingV: 4, iconSize: 10, iconGap: 4 },
              'xs': { fontSize: 11, paddingH: 10, paddingV: 6, iconSize: 12, iconGap: 4 },
              'sm': { fontSize: 12, paddingH: 12, paddingV: 8, iconSize: 14, iconGap: 6 },
              'md': { fontSize: 14, paddingH: 16, paddingV: 10, iconSize: 16, iconGap: 6 },
              'lg': { fontSize: 16, paddingH: 20, paddingV: 12, iconSize: 18, iconGap: 8 },
              'xl': { fontSize: 18, paddingH: 24, paddingV: 14, iconSize: 20, iconGap: 8 },
              'xxl': { fontSize: 20, paddingH: 32, paddingV: 16, iconSize: 24, iconGap: 10 }
            };

            const sizeFactors: Record<string, number> = {
              'xxs': 0.7,
              'xs': 0.8,
              'sm': 0.9,
              'md': 1.0,
              'lg': 1.1,
              'xl': 1.2,
              'xxl': 1.3
            };

            const themeColor = cmd.color ? parseHexColor(cmd.color) : { r: 0.23, g: 0.51, b: 0.96 };
            type RGBA = { r: number, g: number, b: number, a: number };
            const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

            // Resolve colors based on btnStyle (primary/secondary/danger) combined with btnType (solid/outline/ghost/link)
            const resolveColors = (btnType: string, btnStyle: string): {
              bg: RGBA, textColor: RGBA, strokeColor: RGBA | null, strokeWeight: number
            } => {
              const baseColor = btnStyle === 'danger'
                ? { r: 0.93, g: 0.23, b: 0.23 }
                : btnStyle === 'secondary'
                  ? { r: themeColor.r * 0.7 + 0.3, g: themeColor.g * 0.7 + 0.3, b: themeColor.b * 0.7 + 0.3 }
                  : themeColor;

              if (btnType === 'solid') {
                return {
                  bg: { ...baseColor, a: 1 },
                  textColor: { r: 1, g: 1, b: 1, a: 1 },
                  strokeColor: null, strokeWeight: 0
                };
              } else if (btnType === 'outline') {
                return {
                  bg: { r: 1, g: 1, b: 1, a: 0 },
                  textColor: { ...baseColor, a: 1 },
                  strokeColor: { ...baseColor, a: 1 }, strokeWeight: 1
                };
              } else if (btnType === 'ghost') {
                return {
                  bg: { r: 1, g: 1, b: 1, a: 0 },
                  textColor: { ...baseColor, a: 1 },
                  strokeColor: null, strokeWeight: 0
                };
              } else if (btnType === 'link') {
                return {
                  bg: { r: 0, g: 0, b: 0, a: 0 },
                  textColor: { ...baseColor, a: 1 },
                  strokeColor: null, strokeWeight: 0
                };
              } else { // iconBtn uses solid by default
                return {
                  bg: { ...baseColor, a: 1 },
                  textColor: { r: 1, g: 1, b: 1, a: 1 },
                  strokeColor: null, strokeWeight: 0
                };
              }
            };

            // Apply state modifications to base colors
            const applyState = (
              state: string, bg: RGBA, textColor: RGBA, strokeColor: RGBA | null, strokeWeight: number, baseColor: { r: number, g: number, b: number }, btnType: string
            ): { bg: RGBA, textColor: RGBA, strokeColor: RGBA | null, strokeWeight: number, opacity?: number } => {
              switch (state) {
                case 'hover': {
                  if (btnType === 'solid' || btnType === 'iconBtn') {
                    return { bg: { r: Math.max(0, bg.r - 0.1), g: Math.max(0, bg.g - 0.1), b: Math.max(0, bg.b - 0.1), a: 1 }, textColor, strokeColor, strokeWeight };
                  } else if (btnType === 'outline' || btnType === 'ghost') {
                    return { bg: { ...baseColor, a: 0.08 }, textColor, strokeColor, strokeWeight };
                  } else { // link
                    return { bg, textColor, strokeColor, strokeWeight };
                  }
                }
                case 'focus': {
                  if (btnType === 'solid' || btnType === 'iconBtn') {
                    return { bg, textColor, strokeColor: { ...baseColor, a: 1 }, strokeWeight: 2 };
                  } else {
                    return { bg, textColor, strokeColor: { ...baseColor, a: 1 }, strokeWeight: 2 };
                  }
                }
                case 'active': {
                  if (btnType === 'solid' || btnType === 'iconBtn') {
                    return { bg: { r: Math.max(0, bg.r - 0.15), g: Math.max(0, bg.g - 0.15), b: Math.max(0, bg.b - 0.15), a: 1 }, textColor, strokeColor, strokeWeight };
                  } else {
                    return { bg: { ...baseColor, a: 0.15 }, textColor, strokeColor, strokeWeight };
                  }
                }
                case 'disabled': {
                  return {
                    bg: { r: 0.9, g: 0.9, b: 0.9, a: (btnType === 'link' || btnType === 'ghost') ? 0 : 1 },
                    textColor: { r: 0.6, g: 0.6, b: 0.6, a: 1 },
                    strokeColor: (btnType === 'outline') ? { r: 0.8, g: 0.8, b: 0.8, a: 1 } : null,
                    strokeWeight: (btnType === 'outline') ? 1 : 0,
                    opacity: 0.6
                  };
                }
                case 'loading': {
                  return { bg, textColor: { ...textColor, a: 0.5 }, strokeColor, strokeWeight };
                }
                default: // normal
                  return { bg, textColor, strokeColor, strokeWeight };
              }
            };

            const insertIcon = (parent: FrameNode, svgString: string, size: number, color: RGBA) => {
              try {
                const svgNode = figma.createNodeFromSvg(svgString);

                // Scale the SVG group to the target size before extracting children
                const origW = svgNode.width;
                const origH = svgNode.height;
                if (origW > 0 && origH > 0 && (origW !== size || origH !== size)) {
                  const scale = size / Math.max(origW, origH);
                  svgNode.rescale(scale);
                }

                const iconFrame = figma.createFrame();
                iconFrame.name = 'Icon';
                iconFrame.resize(size, size);
                iconFrame.fills = [];
                iconFrame.clipsContent = false;

                // Center the (now scaled) children inside the frame and recolor
                const offsetX = (size - svgNode.width) / 2;
                const offsetY = (size - svgNode.height) / 2;
                const children = [...svgNode.children];
                for (const child of children) {
                  const childX = child.x;
                  const childY = child.y;
                  iconFrame.appendChild(child);
                  child.x = childX + offsetX;
                  child.y = childY + offsetY;
                  if ('fills' in child) {
                    const geo = child as GeometryMixin;
                    if (geo.fills && Array.isArray(geo.fills) && geo.fills.length > 0) {
                      geo.fills = [{ type: 'SOLID', color: { r: color.r, g: color.g, b: color.b }, opacity: (geo.fills[0] as any).opacity ?? 1 }];
                    }
                  }
                  if ('strokes' in child) {
                    const geo = child as GeometryMixin;
                    if (geo.strokes && Array.isArray(geo.strokes) && geo.strokes.length > 0) {
                      geo.strokes = [{ type: 'SOLID', color: { r: color.r, g: color.g, b: color.b }, opacity: (geo.strokes[0] as any).opacity ?? 1 }];
                    }
                  }
                }
                svgNode.remove();

                parent.appendChild(iconFrame);
              } catch (e) {
                console.warn('Failed to insert icon SVG', e);
              }
            };

            // Create a single button variant frame
            const loaderSvg = '<svg width="16" height="16"  stroke="currentColor" stroke-linecap="round" stroke-miterlimit="3.994" stroke-width="1.5" fill="none" viewBox="0 0 16 16"><path d="M12.62 9.913a5 5 0 1 0-9.238-3.826 5 5 0 0 0 9.237 3.826Z" opacity=".2"/><path d="M13 8a5 5 0 1 1-5-5"/></svg>';

            const createButtonVariantFrame = (opts: {
              btnType: string, bg: RGBA, txtColor: RGBA, stColor: RGBA | null, stWeight: number,
              pH: number, pV: number, fSize: number, cornerRadius: number, iconSize: number, iconGap: number,
              iconLeftSvg: string | null, iconRightSvg: string | null, isIconBtn: boolean, showText: boolean,
              isLoading: boolean, opacity?: number
            }) => {
              const frame = figma.createFrame();
              frame.cornerRadius = opts.cornerRadius;
              if (opts.bg.a > 0) {
                frame.fills = [{ type: 'SOLID', color: { r: opts.bg.r, g: opts.bg.g, b: opts.bg.b }, opacity: opts.bg.a }];
              } else {
                frame.fills = [];
              }

              if (opts.stWeight > 0 && opts.stColor) {
                frame.strokes = [{ type: 'SOLID', color: { r: opts.stColor.r, g: opts.stColor.g, b: opts.stColor.b } }];
                frame.strokeWeight = opts.stWeight;
              }

              frame.layoutMode = 'HORIZONTAL';
              frame.primaryAxisAlignItems = 'CENTER';
              frame.counterAxisAlignItems = 'CENTER';
              frame.itemSpacing = opts.iconGap;
              frame.paddingLeft = opts.pH;
              frame.paddingRight = opts.pH;
              frame.paddingTop = opts.pV;
              frame.paddingBottom = opts.pV;
              frame.primaryAxisSizingMode = 'AUTO';
              frame.counterAxisSizingMode = 'AUTO';

              if (opts.opacity !== undefined && opts.opacity < 1) {
                frame.opacity = opts.opacity;
              }

              if (opts.isIconBtn) {
                // Icon button: square padding, single icon, no text
                frame.paddingLeft = opts.pV;
                frame.paddingRight = opts.pV;

                if (opts.isLoading) {
                  insertIcon(frame, loaderSvg, opts.iconSize, opts.txtColor);
                } else {
                  const iconSvg = opts.iconLeftSvg || opts.iconRightSvg;
                  if (iconSvg) {
                    insertIcon(frame, iconSvg, opts.iconSize, opts.txtColor);
                  } else {
                    // Fallback: create a simple circle as placeholder icon
                    const placeholder = figma.createEllipse();
                    placeholder.resize(opts.iconSize, opts.iconSize);
                    placeholder.fills = [{ type: 'SOLID', color: { r: opts.txtColor.r, g: opts.txtColor.g, b: opts.txtColor.b } }];
                    frame.appendChild(placeholder);
                  }
                }
              } else {
                // Left icon
                if (opts.iconLeftSvg) {
                  insertIcon(frame, opts.iconLeftSvg, opts.iconSize, opts.txtColor);
                }

                // Text label
                if (opts.showText) {
                  const textNode = figma.createText();
                  textNode.fontName = { family: "Inter", style: "Medium" };
                  textNode.characters = text;
                  textNode.fontSize = opts.fSize;
                  textNode.lineHeight = { value: 100, unit: 'PERCENT' };
                  textNode.fills = [{ type: 'SOLID', color: { r: opts.txtColor.r, g: opts.txtColor.g, b: opts.txtColor.b } }];
                  if (opts.btnType === 'link') {
                    textNode.textDecoration = 'UNDERLINE';
                  }
                  frame.appendChild(textNode);
                }

                // Loading spinner
                if (opts.isLoading) {
                  insertIcon(frame, loaderSvg, Math.round(opts.iconSize * 0.9), opts.txtColor);
                }

                // Right icon
                if (opts.iconRightSvg) {
                  insertIcon(frame, opts.iconRightSvg, opts.iconSize, opts.txtColor);
                }
              }

              return frame;
            };

            // Parse inputs with backward compatibility
            const btnTypes: string[] = Array.isArray(cmd.btnTypes) ? cmd.btnTypes :
              (Array.isArray(cmd.styles) ? cmd.styles : [cmd.buttonType || 'solid']);
            const btnStyles: string[] = Array.isArray(cmd.btnStyles) ? cmd.btnStyles : ['primary'];
            const sizes: string[] = Array.isArray(cmd.sizes) ? cmd.sizes : [cmd.size || 'md'];
            const states: string[] = Array.isArray(cmd.states) ? cmd.states : ['normal', 'hover', 'disabled'];
            const iconLeftSvg: string | null = cmd.iconLeftSvg || null;
            const iconRightSvg: string | null = cmd.iconRightSvg || null;

            const hasMultipleAxes = btnTypes.length > 1 || btnStyles.length > 1 || sizes.length > 1;

            const variantSpecs: { node: SceneNode; properties: { [key: string]: string } }[] = [];
            for (const btnType of btnTypes) {
              const isLink = btnType === 'link';
              const isIconBtn = btnType === 'iconBtn';
              for (const btnStyle of btnStyles) {
                const baseColor = btnStyle === 'danger'
                  ? { r: 0.93, g: 0.23, b: 0.23 }
                  : btnStyle === 'secondary'
                    ? { r: themeColor.r * 0.7 + 0.3, g: themeColor.g * 0.7 + 0.3, b: themeColor.b * 0.7 + 0.3 }
                    : themeColor;
                const baseColors = resolveColors(btnType, btnStyle);

                for (const size of sizes) {
                  const cfg = sizeConfigs[size] || sizeConfigs['md'];
                  const factor = sizeFactors[size] || 1.0;
                  const pH = isLink ? 0 : (cmd.paddingH !== undefined ? Math.round(cmd.paddingH * factor) : cfg.paddingH);
                  const pV = isLink ? 0 : (cmd.paddingV !== undefined ? Math.round(cmd.paddingV * factor) : cfg.paddingV);
                  const fSize = cmd.fontSize || cfg.fontSize;
                  const cornerRadius = isLink ? 0 : defaultCornerRadius;

                  for (const state of states) {
                    const stateColors = applyState(state, baseColors.bg, baseColors.textColor, baseColors.strokeColor, baseColors.strokeWeight, baseColor, btnType);

                    const frame = createButtonVariantFrame({
                      btnType, bg: stateColors.bg, txtColor: stateColors.textColor,
                      stColor: stateColors.strokeColor, stWeight: stateColors.strokeWeight,
                      pH, pV, fSize, cornerRadius,
                      iconSize: cfg.iconSize, iconGap: cfg.iconGap,
                      iconLeftSvg: iconLeftSvg,
                      iconRightSvg: iconRightSvg,
                      isIconBtn,
                      showText: !isIconBtn,
                      isLoading: state === 'loading',
                      opacity: stateColors.opacity
                    });

                    const props: { [key: string]: string } = {};
                    if (hasMultipleAxes || btnTypes.length > 1) props['Type'] = capitalize(btnType === 'iconBtn' ? 'Icon' : btnType);
                    if (hasMultipleAxes || btnStyles.length > 1) props['Style'] = capitalize(btnStyle);
                    if (sizes.length > 1) props['Size'] = size;
                    props['State'] = capitalize(state);
                    variantSpecs.push({ node: frame, properties: props });
                  }
                }
              }
            }

            const gapX = 32;
            const gapY = 32;
            const gridPadding = 40;
            const cols = states.length;
            const rows = Math.ceil(variantSpecs.length / cols);

            // Pre-measure column widths and row heights from the live frames
            const colWidths: number[] = new Array(cols).fill(0);
            const rowHeights: number[] = new Array(rows).fill(0);
            for (let i = 0; i < variantSpecs.length; i++) {
              const col = i % cols;
              const row = Math.floor(i / cols);
              const f = variantSpecs[i].node as FrameNode;
              if (f.width > colWidths[col]) colWidths[col] = f.width;
              if (f.height > rowHeights[row]) rowHeights[row] = f.height;
            }

            const componentSet = await createComponentSetHelper(cmd.name || 'Button', variantSpecs, {
              skipInstanceCreation: true
            }, (c) => moveComponentToBatchSection(c, groupOffset));

            // Remove auto-layout so we can position children manually
            componentSet.layoutMode = 'NONE';

            // Position each variant in a grid
            const children = componentSet.children as ComponentNode[];
            for (let i = 0; i < children.length; i++) {
              const col = i % cols;
              const row = Math.floor(i / cols);
              let x = gridPadding;
              for (let c = 0; c < col; c++) x += colWidths[c] + gapX;
              let y = gridPadding;
              for (let r = 0; r < row; r++) y += rowHeights[r] + gapY;
              children[i].x = x;
              children[i].y = y;
            }

            // Resize the component set to fit the grid
            const totalWidth = colWidths.reduce((a, b) => a + b, 0) + gapX * Math.max(0, cols - 1) + gridPadding * 2;
            const totalHeight = rowHeights.reduce((a, b) => a + b, 0) + gapY * Math.max(0, rows - 1) + gridPadding * 2;
            componentSet.resize(totalWidth, totalHeight);

            const componentSetRefId = (cmd.refId || cmd.name || 'Button') + '-component';
            registerCreatedNode(componentSet, componentSetRefId);

            // Move the button component set to the Generated Components section
            moveComponentToBatchSection(componentSet, groupOffset);

            const defaultVariant = componentSet.defaultVariant as ComponentNode;
            const instance = defaultVariant.createInstance();
            registerCreatedNode(instance, cmd.refId);
            await appendToParent(instance, cmd, { width: cmd.width || 120, height: cmd.height || 40 });

            figma.currentPage.selection = [instance];
            success++;
            continue;
          }

          if (cmd.action === 'createTextStyle') {
            try {
              const style = figma.createTextStyle();
              registerCreatedNode(style, cmd.refId);
              style.name = cmd.name || 'New Text Style';
              const family = cmd.fontFamily || 'Inter';
              const fontStyle = cmd.fontStyle || 'Regular';
              await smartLoadFont({ family, style: fontStyle });
              style.fontName = { family, style: fontStyle };
              if (typeof cmd.fontSize === 'number') style.fontSize = cmd.fontSize;
              if (cmd.lineHeight) {
                style.lineHeight = cmd.lineHeight;
              }
              if (cmd.letterSpacing) {
                style.letterSpacing = cmd.letterSpacing;
              }
              if (cmd.listSpacing) {
                style.listSpacing = cmd.listSpacing;
              }
              figma.ui.postMessage({ type: 'text-style-created', id: style.id, name: style.name });
              success++;
            } catch (error) {
              console.error('createTextStyle failed', error);
              failed++;
            }
            continue;
          }

          if (cmd.action === 'createEffectStyle') {
            try {
              const style = figma.createEffectStyle();
              registerCreatedNode(style, cmd.refId);
              style.name = cmd.name || 'New Effect Style';
              const effectType = cmd.effectType || 'DROP_SHADOW';

              if (effectType === 'LAYER_BLUR' || effectType === 'BACKGROUND_BLUR') {
                style.effects = [{
                  type: effectType,
                  radius: cmd.radius ?? 8,
                  visible: true
                } as Effect];
              } else if (effectType === 'INNER_SHADOW') {
                const color = parseHexColor(cmd.color || '#00000040');
                style.effects = [{
                  type: 'INNER_SHADOW',
                  color: { r: color.r, g: color.g, b: color.b, a: color.a },
                  offset: { x: cmd.offsetX ?? 0, y: cmd.offsetY ?? 2 },
                  radius: cmd.radius ?? 8,
                  spread: cmd.spread ?? 0,
                  visible: true,
                  blendMode: cmd.blendMode || 'NORMAL'
                } as Effect];
              } else {
                const color = parseHexColor(cmd.color || '#00000040');
                const shadowEffect: DropShadowEffect = {
                  type: 'DROP_SHADOW',
                  color: { r: color.r, g: color.g, b: color.b, a: color.a },
                  offset: { x: cmd.offsetX ?? 0, y: cmd.offsetY ?? 4 },
                  radius: cmd.radius ?? 8,
                  spread: cmd.spread ?? 0,
                  visible: true,
                  blendMode: cmd.blendMode || 'NORMAL'
                };
                style.effects = [shadowEffect];
              }

              figma.ui.postMessage({ type: 'effect-style-created', id: style.id, name: style.name });
              success++;
            } catch (error) {
              console.error('createEffectStyle failed', error);
              failed++;
            }
            continue;
          }

          if (cmd.action === 'removeStyle') {
            // Delete a local style (paint, text, effect, or grid) by its style ID.
            try {
              const styleId = cmd.styleId || cmd.id;
              if (!styleId || typeof styleId !== 'string') {
                if (!firstError) firstError = { action: cmd.action, nodeId: 'N/A', message: 'styleId is required' };
                failed++;
                continue;
              }
              const style = await figma.getStyleByIdAsync(styleId);
              if (!style) {
                if (!firstError) firstError = { action: cmd.action, nodeId: styleId, message: `Style not found: ${styleId}` };
                failed++;
                continue;
              }
              const styleName = style.name;
              const styleType = style.type;
              style.remove();
              figma.ui.postMessage({ type: 'style-removed', styleId, name: styleName, styleType });
              success++;
            } catch (error) {
              console.error('removeStyle failed', error);
              if (!firstError) firstError = { action: cmd.action, nodeId: cmd.styleId || 'unknown', message: (error as Error)?.message || 'removeStyle failed' };
              failed++;
            }
            continue;
          }

          if (cmd.action === 'updateStyle') {
            // Update properties of an existing local style.
            // Works for PAINT, TEXT, and EFFECT styles.
            // cmd.styleId: the ID of the style to update
            // For all: cmd.name, cmd.description
            // For PAINT: cmd.color (hex), cmd.paints (array of paint objects)
            // For TEXT: cmd.fontFamily, cmd.fontStyle, cmd.fontSize, cmd.lineHeight, cmd.letterSpacing
            // For EFFECT: cmd.effects (array) or individual cmd.color, cmd.offsetX, cmd.offsetY, cmd.radius, cmd.spread
            try {
              const styleId = cmd.styleId || cmd.id;
              if (!styleId || typeof styleId !== 'string') {
                if (!firstError) firstError = { action: cmd.action, nodeId: 'N/A', message: 'styleId is required' };
                failed++;
                continue;
              }
              const style = await figma.getStyleByIdAsync(styleId);
              if (!style) {
                if (!firstError) firstError = { action: cmd.action, nodeId: styleId, message: `Style not found: ${styleId}` };
                failed++;
                continue;
              }

              // Update name if provided
              if (cmd.name !== undefined) {
                style.name = cmd.name;
              }

              // Update description if provided
              if (cmd.description !== undefined) {
                style.description = cmd.description;
              }

              if (style.type === 'PAINT') {
                const paintStyle = style as PaintStyle;
                if (cmd.color) {
                  const c = parseHexColor(cmd.color);
                  paintStyle.paints = [{ type: 'SOLID', color: { r: c.r, g: c.g, b: c.b }, opacity: c.a } as SolidPaint];
                } else if (cmd.paints && Array.isArray(cmd.paints)) {
                  // Allow full paint array override
                  const newPaints: Paint[] = cmd.paints.map((p: any) => {
                    if (p.type === 'SOLID' && p.color) {
                      const c = typeof p.color === 'string' ? parseHexColor(p.color) : p.color;
                      return {
                        type: 'SOLID',
                        color: { r: c.r, g: c.g, b: c.b },
                        opacity: p.opacity !== undefined ? p.opacity : (c.a !== undefined ? c.a : 1),
                        visible: p.visible !== undefined ? p.visible : true
                      } as SolidPaint;
                    }
                    return p as Paint;
                  });
                  paintStyle.paints = newPaints;
                }
              } else if (style.type === 'TEXT') {
                const textStyle = style as TextStyle;
                if (cmd.fontFamily || cmd.fontStyle) {
                  const family = cmd.fontFamily || textStyle.fontName.family;
                  const fontStyleStr = cmd.fontStyle || textStyle.fontName.style;
                  await smartLoadFont({ family, style: fontStyleStr });
                  textStyle.fontName = { family, style: fontStyleStr };
                }
                if (typeof cmd.fontSize === 'number') textStyle.fontSize = cmd.fontSize;
                if (cmd.lineHeight !== undefined) textStyle.lineHeight = cmd.lineHeight;
                if (cmd.letterSpacing !== undefined) textStyle.letterSpacing = cmd.letterSpacing;
                if (cmd.textDecoration !== undefined) textStyle.textDecoration = cmd.textDecoration;
                if (cmd.textCase !== undefined) textStyle.textCase = cmd.textCase;
                if (cmd.paragraphSpacing !== undefined) textStyle.paragraphSpacing = cmd.paragraphSpacing;
                if (cmd.paragraphIndent !== undefined) textStyle.paragraphIndent = cmd.paragraphIndent;
              } else if (style.type === 'EFFECT') {
                const effectStyle = style as EffectStyle;
                if (cmd.effects && Array.isArray(cmd.effects)) {
                  // Full effects array override
                  effectStyle.effects = cmd.effects.map((e: any) => {
                    const c = e.color ? parseHexColor(e.color) : { r: 0, g: 0, b: 0, a: 0.25 };
                    return {
                      type: e.type || 'DROP_SHADOW',
                      color: { r: c.r, g: c.g, b: c.b, a: c.a },
                      offset: { x: e.offsetX ?? 0, y: e.offsetY ?? 4 },
                      radius: e.radius ?? 8,
                      spread: e.spread ?? 0,
                      visible: e.visible !== undefined ? e.visible : true,
                      blendMode: e.blendMode || 'NORMAL'
                    } as DropShadowEffect;
                  });
                } else if (cmd.color || cmd.offsetX !== undefined || cmd.offsetY !== undefined || cmd.radius !== undefined || cmd.spread !== undefined) {
                  // Update the first effect with individual properties
                  const existingEffects = [...effectStyle.effects];
                  if (existingEffects.length > 0 && (existingEffects[0].type === 'DROP_SHADOW' || existingEffects[0].type === 'INNER_SHADOW')) {
                    const existing = existingEffects[0] as DropShadowEffect;
                    const c = cmd.color ? parseHexColor(cmd.color) : existing.color;
                    existingEffects[0] = {
                      ...existing,
                      color: { r: c.r, g: c.g, b: c.b, a: c.a !== undefined ? c.a : existing.color.a },
                      offset: { x: cmd.offsetX ?? existing.offset.x, y: cmd.offsetY ?? existing.offset.y },
                      radius: cmd.radius ?? existing.radius,
                      spread: cmd.spread ?? existing.spread
                    } as DropShadowEffect;
                    effectStyle.effects = existingEffects;
                  }
                }
              }

              figma.ui.postMessage({ type: 'style-updated', styleId, name: style.name, styleType: style.type });
              success++;
            } catch (error) {
              console.error('updateStyle failed', error);
              if (!firstError) firstError = { action: cmd.action, nodeId: cmd.styleId || 'unknown', message: (error as Error)?.message || 'updateStyle failed' };
              failed++;
            }
            continue;
          }

          if (cmd.action === 'setStyleDescription') {
            // Set or update the description on any local style.
            try {
              const styleId = cmd.styleId || cmd.id;
              if (!styleId || typeof styleId !== 'string') {
                if (!firstError) firstError = { action: cmd.action, nodeId: 'N/A', message: 'styleId is required' };
                failed++;
                continue;
              }
              const style = await figma.getStyleByIdAsync(styleId);
              if (!style) {
                if (!firstError) firstError = { action: cmd.action, nodeId: styleId, message: `Style not found: ${styleId}` };
                failed++;
                continue;
              }
              style.description = cmd.description || '';
              success++;
            } catch (error) {
              console.error('setStyleDescription failed', error);
              if (!firstError) firstError = { action: cmd.action, nodeId: cmd.styleId || 'unknown', message: (error as Error)?.message || 'setStyleDescription failed' };
              failed++;
            }
            continue;
          }

          if (cmd.action === 'duplicateStyle') {
            try {
              const sourceStyleId = cmd.styleId || cmd.id;
              if (!sourceStyleId || typeof sourceStyleId !== 'string') {
                if (!firstError) firstError = { action: cmd.action, nodeId: 'N/A', message: 'styleId is required' };
                failed++;
                continue;
              }
              const sourceStyle = await figma.getStyleByIdAsync(sourceStyleId);
              if (!sourceStyle) {
                if (!firstError) firstError = { action: cmd.action, nodeId: sourceStyleId, message: `Source style not found: ${sourceStyleId}` };
                failed++;
                continue;
              }

              const newName = cmd.name || sourceStyle.name + ' Copy';

              if (sourceStyle.type === 'PAINT') {
                const src = sourceStyle as PaintStyle;
                const newStyle = figma.createPaintStyle();
                newStyle.name = newName;
                newStyle.description = src.description;
                newStyle.paints = src.paints;
                figma.ui.postMessage({ type: 'style-duplicated', newStyleId: newStyle.id, name: newStyle.name, sourceStyleId, styleType: 'PAINT' });
              } else if (sourceStyle.type === 'TEXT') {
                const src = sourceStyle as TextStyle;
                const newStyle = figma.createTextStyle();
                newStyle.name = newName;
                newStyle.description = src.description;
                await smartLoadFont(src.fontName);
                newStyle.fontName = src.fontName;
                newStyle.fontSize = src.fontSize;
                newStyle.lineHeight = src.lineHeight;
                newStyle.letterSpacing = src.letterSpacing;
                newStyle.textDecoration = src.textDecoration;
                newStyle.textCase = src.textCase;
                newStyle.paragraphSpacing = src.paragraphSpacing;
                newStyle.paragraphIndent = src.paragraphIndent;
                if (src.listSpacing !== undefined) newStyle.listSpacing = src.listSpacing;
                figma.ui.postMessage({ type: 'style-duplicated', newStyleId: newStyle.id, name: newStyle.name, sourceStyleId, styleType: 'TEXT' });
              } else if (sourceStyle.type === 'EFFECT') {
                const src = sourceStyle as EffectStyle;
                const newStyle = figma.createEffectStyle();
                newStyle.name = newName;
                newStyle.description = src.description;
                newStyle.effects = src.effects;
                figma.ui.postMessage({ type: 'style-duplicated', newStyleId: newStyle.id, name: newStyle.name, sourceStyleId, styleType: 'EFFECT' });
              } else {
                if (!firstError) firstError = { action: cmd.action, nodeId: sourceStyleId, message: `Unsupported style type for duplication: ${sourceStyle.type}` };
                failed++;
                continue;
              }
              success++;
            } catch (error) {
              console.error('duplicateStyle failed', error);
              if (!firstError) firstError = { action: cmd.action, nodeId: cmd.styleId || 'unknown', message: (error as Error)?.message || 'duplicateStyle failed' };
              failed++;
            }
            continue;
          }

          if (cmd.action === 'createGridStyle') {
            try {
              const style = figma.createGridStyle();
              registerCreatedNode(style, cmd.refId);
              style.name = cmd.name || 'New Grid Style';
              if (cmd.description) style.description = cmd.description;

              const grids: LayoutGrid[] = [];
              if (cmd.grids && Array.isArray(cmd.grids)) {
                for (const g of cmd.grids) {
                  if (g.pattern === 'COLUMNS' || g.pattern === 'ROWS') {
                    grids.push({
                      pattern: g.pattern,
                      alignment: g.alignment || 'STRETCH',
                      gutterSize: g.gutterSize ?? 20,
                      count: g.count ?? 12,
                      sectionSize: g.sectionSize,
                      offset: g.offset ?? 0,
                      visible: g.visible !== undefined ? g.visible : true,
                      color: g.color ? (() => { const c = parseHexColor(g.color); return { r: c.r, g: c.g, b: c.b, a: c.a }; })() : { r: 1, g: 0, b: 0, a: 0.1 }
                    } as RowsColsLayoutGrid);
                  } else {
                    grids.push({
                      pattern: 'GRID',
                      sectionSize: g.sectionSize ?? 10,
                      visible: g.visible !== undefined ? g.visible : true,
                      color: g.color ? (() => { const c = parseHexColor(g.color); return { r: c.r, g: c.g, b: c.b, a: c.a }; })() : { r: 1, g: 0, b: 0, a: 0.1 }
                    } as GridLayoutGrid);
                  }
                }
              } else {
                grids.push({
                  pattern: 'COLUMNS',
                  alignment: 'STRETCH',
                  gutterSize: 20,
                  count: 12,
                  offset: 0,
                  visible: true,
                  color: { r: 1, g: 0, b: 0, a: 0.1 }
                } as RowsColsLayoutGrid);
              }
              style.layoutGrids = grids;

              figma.ui.postMessage({ type: 'grid-style-created', id: style.id, name: style.name });
              success++;
            } catch (error) {
              console.error('createGridStyle failed', error);
              if (!firstError) firstError = { action: cmd.action, nodeId: 'N/A', message: (error as Error)?.message || 'createGridStyle failed' };
              failed++;
            }
            continue;
          }

          if (cmd.action === 'updateGridStyle') {
            try {
              const styleId = cmd.styleId || cmd.id;
              if (!styleId || typeof styleId !== 'string') {
                if (!firstError) firstError = { action: cmd.action, nodeId: 'N/A', message: 'styleId is required' };
                failed++;
                continue;
              }
              const style = await figma.getStyleByIdAsync(styleId);
              if (!style || style.type !== 'GRID') {
                if (!firstError) firstError = { action: cmd.action, nodeId: styleId, message: `Grid style not found: ${styleId}` };
                failed++;
                continue;
              }
              const gridStyle = style as GridStyle;
              if (cmd.name !== undefined) gridStyle.name = cmd.name;
              if (cmd.description !== undefined) gridStyle.description = cmd.description;
              if (cmd.grids && Array.isArray(cmd.grids)) {
                const grids: LayoutGrid[] = [];
                for (const g of cmd.grids) {
                  if (g.pattern === 'COLUMNS' || g.pattern === 'ROWS') {
                    grids.push({
                      pattern: g.pattern,
                      alignment: g.alignment || 'STRETCH',
                      gutterSize: g.gutterSize ?? 20,
                      count: g.count ?? 12,
                      sectionSize: g.sectionSize,
                      offset: g.offset ?? 0,
                      visible: g.visible !== undefined ? g.visible : true,
                      color: g.color ? (() => { const c = parseHexColor(g.color); return { r: c.r, g: c.g, b: c.b, a: c.a }; })() : { r: 1, g: 0, b: 0, a: 0.1 }
                    } as RowsColsLayoutGrid);
                  } else {
                    grids.push({
                      pattern: 'GRID',
                      sectionSize: g.sectionSize ?? 10,
                      visible: g.visible !== undefined ? g.visible : true,
                      color: g.color ? (() => { const c = parseHexColor(g.color); return { r: c.r, g: c.g, b: c.b, a: c.a }; })() : { r: 1, g: 0, b: 0, a: 0.1 }
                    } as GridLayoutGrid);
                  }
                }
                gridStyle.layoutGrids = grids;
              }
              figma.ui.postMessage({ type: 'grid-style-updated', styleId, name: gridStyle.name });
              success++;
            } catch (error) {
              console.error('updateGridStyle failed', error);
              if (!firstError) firstError = { action: cmd.action, nodeId: cmd.styleId || 'unknown', message: (error as Error)?.message || 'updateGridStyle failed' };
              failed++;
            }
            continue;
          }

          if (cmd.action === 'applyAutoLayout') {
            console.log('[applyAutoLayout] Command triggered');
            const nodeIds = cmd.nodeIds || [];
            let nodes: SceneNode[] = [];
            for (const id of nodeIds) {
              const n = await resolveNodeSmart(id) as SceneNode;
              if (n) nodes.push(n);
            }

            // Fallback to current selection if no nodeIds provided
            if (nodes.length === 0 && (!nodeIds || nodeIds.length === 0)) {
              nodes.push(...currentSelection);
            }

            console.log(`[applyAutoLayout] Processing ${nodes.length} nodes:`, nodes.map(n => ({ name: n.name, type: n.type, x: n.x, y: n.y, width: n.width, height: n.height })));

            // Parent Promotion Logic: If multiple nodes share the same parent and are all its children, target the parent
            if (nodes.length > 1) {
              const firstParent = nodes[0].parent;
              const allShareParent = nodes.every(n => n.parent === firstParent);
              if (allShareParent && firstParent && (firstParent.type === 'FRAME' || firstParent.type === 'GROUP')) {
                const parentChildren = (firstParent as any).children as SceneNode[];
                const allChildrenSelected = nodes.length === parentChildren.length &&
                  nodes.every(n => parentChildren.includes(n));
                if (allChildrenSelected) {
                  console.log(`[applyAutoLayout] Promoting selection to parent ${firstParent.type}: ${firstParent.name}`);
                  nodes = [firstParent as SceneNode];
                }
              }
            }

            if (nodes.length === 1 && (nodes[0].type === 'FRAME' || nodes[0].type === 'COMPONENT' || nodes[0].type === 'INSTANCE' || nodes[0].type === 'GROUP')) {
              // Single frame or group: convert to auto layout and layout children correctly
              console.log('[applyAutoLayout] Single container detected');
              let frame: FrameNode;
              const originalNode = nodes[0];

              if (originalNode.type === 'GROUP') {
                console.log('[applyAutoLayout] Converting Group to Frame');
                const group = originalNode as GroupNode;
                const parent = group.parent || figma.currentPage;

                // Get absolute bounds before moving anything
                const absX = group.absoluteTransform[0][2];
                const absY = group.absoluteTransform[1][2];
                const width = group.width;
                const height = group.height;
                const name = group.name;

                frame = figma.createFrame();

                // Insert frame into same parent
                parent.appendChild(frame);

                // Position frame absolutely to match group
                const parentAbsX = (parent as any).absoluteTransform ? (parent as any).absoluteTransform[0][2] : 0;
                const parentAbsY = (parent as any).absoluteTransform ? (parent as any).absoluteTransform[1][2] : 0;
                frame.x = absX - parentAbsX;
                frame.y = absY - parentAbsY;
                frame.resize(Math.max(width, 1), Math.max(height, 1));
                frame.name = name;
                frame.fills = []; // Groups usually don't have fills

                // Move children
                const children = [...group.children];
                for (const child of children) {
                  const cAbsX = child.absoluteTransform[0][2];
                  const cAbsY = child.absoluteTransform[1][2];
                  frame.appendChild(child);
                  child.x = cAbsX - frame.absoluteTransform[0][2];
                  child.y = cAbsY - frame.absoluteTransform[1][2];
                }

                // Figma automatically removes empty groups. 
                // Only call remove() if it hasn't been automatically cleaned up.
                if (!group.removed) {
                  group.remove();
                }
              } else {
                frame = originalNode as FrameNode;
              }

              // If it's already an auto-layout frame, just refresh its settings
              if (frame.layoutMode !== 'NONE') {
                console.log('[applyAutoLayout] Frame already has auto layout, refreshing settings');
                applySmartAutoLayout(frame, cmd.direction);
                if (cmd.name) frame.name = cmd.name;
                success++;
              } else {
                // Non-auto-layout container: Apply smart nested layout to children
                const children = [...frame.children] as SceneNode[];
                if (children.length > 0) {
                  console.log(`[applyAutoLayout] Applying smart layout to ${children.length} children inside frame`);
                  // Detect clusters among children
                  const { groups: clusters, direction: outerDirection } = clusterNodesIntoGroups(children);

                  if (clusters.length === 1) {
                    // Simple case: just apply auto layout to the frame
                    applySmartAutoLayout(frame, cmd.direction);
                  } else {
                    // Nested case: children form distinct groups
                    console.log(`[applyAutoLayout] Found ${clusters.length} clusters inside container, direction=${outerDirection}`);

                    // Calculate overall bounds of all clusters to maintain relative offsets
                    const allNodes: SceneNode[] = [];
                    clusters.forEach(c => allNodes.push(...c));
                    const outerBounds = getNodesBounds(allNodes);

                    // Wrap each cluster in its own auto layout frame
                    for (let ci = 0; ci < clusters.length; ci++) {
                      wrapNodesInAutoLayoutFrame(clusters[ci], frame, `Group ${ci + 1}`, outerBounds, outerDirection);
                    }

                    // Apply auto layout to the outer frame (the container)
                    applySmartAutoLayout(frame, outerDirection);
                  }
                } else {
                  // Empty container
                  applySmartAutoLayout(frame, cmd.direction);
                }

                if (cmd.name) frame.name = cmd.name;
                figma.currentPage.selection = [frame];
                success++;
              }
              continue;
            } else if (nodes.length > 0) {
              // Multiple nodes: use the recursive logic to detect clusters and create a clean hierarchy

              // Determine the best parent to insert the new auto layout frame into
              let targetParent = (nodes[0].parent || figma.currentPage) as BaseNode & ChildrenMixin;
              if (targetParent.type === 'GROUP' && targetParent.parent) {
                targetParent = targetParent.parent as BaseNode & ChildrenMixin;
              }

              const masterFrame = wrapNodesInAutoLayoutFrame(nodes, targetParent, cmd.name || 'Auto Layout Frame');

              if (cmd.refId) {
                registerCreatedNode(masterFrame, cmd.refId, masterFrame.name);
              }

              figma.currentPage.selection = [masterFrame];
              success++;
            } else {
              failed++;
            }
            continue;
          }

          if (cmd.action === 'group') {
            const nodeIds = cmd.nodeIds || [];
            const nodes: SceneNode[] = [];
            for (const id of nodeIds) {
              const n = await resolveNodeSmart(id) as SceneNode;
              if (n) nodes.push(n);
            }
            if (nodes.length > 0) {
              const parent = await resolveParentSmart(cmd.parentId, cmd.parentName);
              const group = figma.group(nodes, parent || figma.currentPage);
              registerCreatedNode(group, cmd.refId, cmd.name);
              if (cmd.name) group.name = cmd.name;

              // Apply coordinates if provided (relative to parent)
              if (cmd.x !== undefined) group.x = cmd.x;
              if (cmd.y !== undefined) group.y = cmd.y;

              figma.currentPage.selection = [group];
              success++;
            } else {
              failed++;
            }
            continue;
          }

          // Boolean Operations
          if (cmd.action === 'union' || cmd.action === 'booleanUnion') {
            const nodeIds = cmd.nodeIds || [];
            const nodes: SceneNode[] = [];
            for (const id of nodeIds) {
              const n = await resolveNodeSmart(id) as SceneNode;
              if (n) nodes.push(n);
            }
            if (nodes.length >= 2) {
              const parent = await resolveParentSmart(cmd.parentId, cmd.parentName);
              const result = figma.union(nodes, parent || figma.currentPage);
              registerCreatedNode(result, cmd.refId, cmd.name);
              if (cmd.name) result.name = cmd.name;

              if (cmd.x !== undefined) result.x = cmd.x;
              if (cmd.y !== undefined) result.y = cmd.y;

              figma.currentPage.selection = [result];
              success++;
            } else {
              failed++;
            }
            continue;
          }

          if (cmd.action === 'subtract' || cmd.action === 'booleanSubtract') {
            const nodeIds = cmd.nodeIds || [];
            const nodes: SceneNode[] = [];
            for (const id of nodeIds) {
              const n = await resolveNodeSmart(id) as SceneNode;
              if (n) nodes.push(n);
            }
            if (nodes.length >= 2) {
              const parent = await resolveParentSmart(cmd.parentId, cmd.parentName);
              const result = figma.subtract(nodes, parent || figma.currentPage);
              registerCreatedNode(result, cmd.refId, cmd.name);
              if (cmd.name) result.name = cmd.name;

              if (cmd.x !== undefined) result.x = cmd.x;
              if (cmd.y !== undefined) result.y = cmd.y;

              figma.currentPage.selection = [result];
              success++;
            } else {
              failed++;
            }
            continue;
          }

          if (cmd.action === 'intersect' || cmd.action === 'booleanIntersect') {
            const nodeIds = cmd.nodeIds || [];
            const nodes: SceneNode[] = [];
            for (const id of nodeIds) {
              const n = await resolveNodeSmart(id) as SceneNode;
              if (n) nodes.push(n);
            }
            if (nodes.length >= 2) {
              const parent = await resolveParentSmart(cmd.parentId, cmd.parentName);
              const result = figma.intersect(nodes, parent || figma.currentPage);
              registerCreatedNode(result, cmd.refId, cmd.name);
              if (cmd.name) result.name = cmd.name;

              if (cmd.x !== undefined) result.x = cmd.x;
              if (cmd.y !== undefined) result.y = cmd.y;

              figma.currentPage.selection = [result];
              success++;
            } else {
              failed++;
            }
            continue;
          }

          if (cmd.action === 'exclude' || cmd.action === 'booleanExclude') {
            const nodeIds = cmd.nodeIds || [];
            const nodes: SceneNode[] = [];
            for (const id of nodeIds) {
              const n = await resolveNodeSmart(id) as SceneNode;
              if (n) nodes.push(n);
            }
            if (nodes.length >= 2) {
              const parent = await resolveParentSmart(cmd.parentId, cmd.parentName);
              const result = figma.exclude(nodes, parent || figma.currentPage);
              registerCreatedNode(result, cmd.refId, cmd.name);
              if (cmd.name) result.name = cmd.name;

              if (cmd.x !== undefined) result.x = cmd.x;
              if (cmd.y !== undefined) result.y = cmd.y;

              figma.currentPage.selection = [result];
              success++;
            } else {
              failed++;
            }
            continue;
          }

          // Alignment Commands
          if (cmd.action === 'alignNodes') {
            const nodeIds = cmd.nodeIds || [];
            const nodes: SceneNode[] = [];
            for (const id of nodeIds) {
              const n = (await resolveNodeSmart(id)) as SceneNode;
              if (n && 'x' in n) nodes.push(n);
            }
            if (nodes.length < 2) {
              failed++;
              continue;
            }

            const bounds = nodes.map(n => ({
              node: n,
              x: n.x,
              y: n.y,
              width: n.width,
              height: n.height,
              centerX: n.x + n.width / 2,
              centerY: n.y + n.height / 2,
              right: n.x + n.width,
              bottom: n.y + n.height
            }));

            switch (cmd.alignment) {
              case 'LEFT':
                const minX = Math.min(...bounds.map(b => b.x));
                nodes.forEach(n => { n.x = minX; });
                break;
              case 'RIGHT':
                const maxRight = Math.max(...bounds.map(b => b.right));
                nodes.forEach(n => { n.x = maxRight - n.width; });
                break;
              case 'TOP':
                const minY = Math.min(...bounds.map(b => b.y));
                nodes.forEach(n => { n.y = minY; });
                break;
              case 'BOTTOM':
                const maxBottom = Math.max(...bounds.map(b => b.bottom));
                nodes.forEach(n => { n.y = maxBottom - n.height; });
                break;
              case 'CENTER_H':
              case 'CENTER_HORIZONTAL':
                const avgCenterX = bounds.reduce((sum, b) => sum + b.centerX, 0) / bounds.length;
                nodes.forEach(n => { n.x = avgCenterX - n.width / 2; });
                break;
              case 'CENTER_V':
              case 'CENTER_VERTICAL':
                const avgCenterY = bounds.reduce((sum, b) => sum + b.centerY, 0) / bounds.length;
                nodes.forEach(n => { n.y = avgCenterY - n.height / 2; });
                break;
            }
            success++;
            continue;
          }

          if (cmd.action === 'distributeNodes') {
            const nodeIds = cmd.nodeIds || [];
            const nodes: SceneNode[] = [];
            for (const id of nodeIds) {
              const n = (await resolveNodeSmart(id)) as SceneNode;
              if (n && 'x' in n) nodes.push(n);
            }
            if (nodes.length < 3) {
              failed++;
              continue;
            }

            const direction = cmd.direction || 'HORIZONTAL';

            if (direction === 'HORIZONTAL') {
              // Sort by x position
              nodes.sort((a, b) => a.x - b.x);
              const firstX = nodes[0].x;
              const lastRight = nodes[nodes.length - 1].x + nodes[nodes.length - 1].width;
              const totalWidth = nodes.reduce((sum, n) => sum + n.width, 0);
              const totalSpace = lastRight - firstX - totalWidth;
              const gap = totalSpace / (nodes.length - 1);

              let currentX = firstX;
              nodes.forEach(n => {
                n.x = currentX;
                currentX += n.width + gap;
              });
            } else {
              // Sort by y position
              nodes.sort((a, b) => a.y - b.y);
              const firstY = nodes[0].y;
              const lastBottom = nodes[nodes.length - 1].y + nodes[nodes.length - 1].height;
              const totalHeight = nodes.reduce((sum, n) => sum + n.height, 0);
              const totalSpace = lastBottom - firstY - totalHeight;
              const gap = totalSpace / (nodes.length - 1);

              let currentY = firstY;
              nodes.forEach(n => {
                n.y = currentY;
                currentY += n.height + gap;
              });
            }
            success++;
            continue;
          }

          if (cmd.action === 'alignToParent') {
            // Align a single node (or multiple nodes) relative to their parent's bounds.
            // Works for any node inside a frame/group/page.
            const nodeIds = cmd.nodeIds || (cmd.nodeId ? [cmd.nodeId] : []);
            const alignment: string = cmd.alignment || 'CENTER';

            let alignedAny = false;
            for (const id of nodeIds) {
              const n = (await resolveNodeSmart(id)) as SceneNode;
              if (!n || !('x' in n)) continue;

              const parent = n.parent;
              if (!parent) continue;

              // Determine parent bounds
              let parentWidth: number;
              let parentHeight: number;

              if (parent.type === 'FRAME' || parent.type === 'COMPONENT' || parent.type === 'INSTANCE' || parent.type === 'SECTION') {
                parentWidth = (parent as any).width;
                parentHeight = (parent as any).height;
              } else if (parent.type === 'GROUP') {
                parentWidth = parent.width;
                parentHeight = parent.height;
              } else if (parent.type === 'PAGE') {
                if (!firstError) firstError = { action: cmd.action, nodeId: n.id, message: 'Cannot align to parent bounds on a page. Node must be inside a frame or group.' };
                continue;
              } else {
                continue;
              }

              switch (alignment) {
                case 'LEFT':
                  n.x = 0;
                  break;
                case 'RIGHT':
                  n.x = parentWidth - n.width;
                  break;
                case 'TOP':
                  n.y = 0;
                  break;
                case 'BOTTOM':
                  n.y = parentHeight - n.height;
                  break;
                case 'CENTER_H':
                case 'CENTER_HORIZONTAL':
                  n.x = (parentWidth - n.width) / 2;
                  break;
                case 'CENTER_V':
                case 'CENTER_VERTICAL':
                  n.y = (parentHeight - n.height) / 2;
                  break;
                case 'CENTER':
                  n.x = (parentWidth - n.width) / 2;
                  n.y = (parentHeight - n.height) / 2;
                  break;
                case 'TOP_LEFT':
                  n.x = 0;
                  n.y = 0;
                  break;
                case 'TOP_RIGHT':
                  n.x = parentWidth - n.width;
                  n.y = 0;
                  break;
                case 'BOTTOM_LEFT':
                  n.x = 0;
                  n.y = parentHeight - n.height;
                  break;
                case 'BOTTOM_RIGHT':
                  n.x = parentWidth - n.width;
                  n.y = parentHeight - n.height;
                  break;
                default:
                  if (!firstError) firstError = { action: cmd.action, nodeId: n.id, message: `Unknown alignment: ${alignment}` };
                  break;
              }

              // Apply optional margin/offset
              if (cmd.offsetX !== undefined) n.x += cmd.offsetX;
              if (cmd.offsetY !== undefined) n.y += cmd.offsetY;

              alignedAny = true;
            }

            if (alignedAny) {
              success++;
            } else {
              failed++;
            }
            continue;
          }

          if (cmd.action === 'snapToPixelGrid') {
            // Snap node position and size to the nearest whole pixels.
            // Eliminates sub-pixel values for crisp rendering.
            const nodeIds = cmd.nodeIds || (cmd.nodeId ? [cmd.nodeId] : []);

            let snappedAny = false;
            for (const id of nodeIds) {
              const n = (await resolveNodeSmart(id)) as SceneNode;
              if (!n || !('x' in n)) continue;

              // Snap position
              n.x = Math.round(n.x);
              n.y = Math.round(n.y);

              // Optionally snap size (default true)
              if (cmd.includeSize !== false && 'resize' in n) {
                const newWidth = Math.round(n.width);
                const newHeight = Math.round(n.height);
                if (newWidth > 0 && newHeight > 0 && (newWidth !== n.width || newHeight !== n.height)) {
                  (n as any).resize(newWidth, newHeight);
                }
              }

              snappedAny = true;
            }

            if (snappedAny) {
              success++;
            } else {
              failed++;
            }
            continue;
          }

          // Variables API
          if (cmd.action === 'createVariableCollection') {
            const collection = figma.variables.createVariableCollection(cmd.name || 'New Collection');
            // Store the collection ID for reference
            figma.ui.postMessage({
              type: 'variable-collection-created',
              collectionId: collection.id,
              name: collection.name
            });
            success++;
            continue;
          }

          if (cmd.action === 'renameVariableCollection') {
            try {
              const collection = await figma.variables.getVariableCollectionByIdAsync(cmd.collectionId);
              if (collection) {
                collection.name = cmd.name || collection.name;
                figma.ui.postMessage({ type: 'variable-collection-renamed', collectionId: cmd.collectionId, name: collection.name });
                success++;
              } else {
                if (!firstError) firstError = { action: cmd.action, nodeId: cmd.collectionId || 'N/A', message: `Collection not found: ${cmd.collectionId}` };
                failed++;
              }
            } catch (error) {
              console.error('renameVariableCollection failed', error);
              if (!firstError) firstError = { action: cmd.action, nodeId: cmd.collectionId || 'unknown', message: (error as Error)?.message || 'renameVariableCollection failed' };
              failed++;
            }
            continue;
          }

          if (cmd.action === 'removeVariableCollection') {
            try {
              const collection = await figma.variables.getVariableCollectionByIdAsync(cmd.collectionId);
              if (collection) {
                const name = collection.name;
                collection.remove();
                figma.ui.postMessage({ type: 'variable-collection-removed', collectionId: cmd.collectionId, name });
                success++;
              } else {
                if (!firstError) firstError = { action: cmd.action, nodeId: cmd.collectionId || 'N/A', message: `Collection not found: ${cmd.collectionId}` };
                failed++;
              }
            } catch (error) {
              console.error('removeVariableCollection failed', error);
              if (!firstError) firstError = { action: cmd.action, nodeId: cmd.collectionId || 'unknown', message: (error as Error)?.message || 'removeVariableCollection failed' };
              failed++;
            }
            continue;
          }

          if (cmd.action === 'addMode') {
            try {
              const collection = await figma.variables.getVariableCollectionByIdAsync(cmd.collectionId);
              if (collection) {
                const modeId = collection.addMode(cmd.name || 'New Mode');
                figma.ui.postMessage({ type: 'mode-added', collectionId: cmd.collectionId, modeId, name: cmd.name });
                success++;
              } else {
                if (!firstError) firstError = { action: cmd.action, nodeId: cmd.collectionId || 'N/A', message: `Collection not found: ${cmd.collectionId}` };
                failed++;
              }
            } catch (error) {
              console.error('addMode failed', error);
              if (!firstError) firstError = { action: cmd.action, nodeId: cmd.collectionId || 'unknown', message: (error as Error)?.message || 'addMode failed' };
              failed++;
            }
            continue;
          }

          if (cmd.action === 'removeMode') {
            try {
              const collection = await figma.variables.getVariableCollectionByIdAsync(cmd.collectionId);
              if (collection) {
                collection.removeMode(cmd.modeId);
                figma.ui.postMessage({ type: 'mode-removed', collectionId: cmd.collectionId, modeId: cmd.modeId });
                success++;
              } else {
                if (!firstError) firstError = { action: cmd.action, nodeId: cmd.collectionId || 'N/A', message: `Collection not found: ${cmd.collectionId}` };
                failed++;
              }
            } catch (error) {
              console.error('removeMode failed', error);
              if (!firstError) firstError = { action: cmd.action, nodeId: cmd.collectionId || 'unknown', message: (error as Error)?.message || 'removeMode failed' };
              failed++;
            }
            continue;
          }

          if (cmd.action === 'renameMode') {
            try {
              const collection = await figma.variables.getVariableCollectionByIdAsync(cmd.collectionId);
              if (collection) {
                collection.renameMode(cmd.modeId, cmd.name || 'Renamed Mode');
                figma.ui.postMessage({ type: 'mode-renamed', collectionId: cmd.collectionId, modeId: cmd.modeId, name: cmd.name });
                success++;
              } else {
                if (!firstError) firstError = { action: cmd.action, nodeId: cmd.collectionId || 'N/A', message: `Collection not found: ${cmd.collectionId}` };
                failed++;
              }
            } catch (error) {
              console.error('renameMode failed', error);
              if (!firstError) firstError = { action: cmd.action, nodeId: cmd.collectionId || 'unknown', message: (error as Error)?.message || 'renameMode failed' };
              failed++;
            }
            continue;
          }

          if (cmd.action === 'createVariable') {
            const collection = await figma.variables.getVariableCollectionByIdAsync(cmd.collectionId);
            if (collection) {
              const resolvedType = (cmd.resolvedType || 'COLOR') as VariableResolvedDataType;
              const variable = figma.variables.createVariable(cmd.name || 'New Variable', collection, resolvedType);

              // Set initial value if provided
              if (cmd.value !== undefined) {
                if (resolvedType === 'COLOR' && typeof cmd.value === 'string') {
                  const color = parseHexColor(cmd.value);
                  variable.setValueForMode(collection.defaultModeId, { r: color.r, g: color.g, b: color.b, a: color.a });
                } else {
                  variable.setValueForMode(collection.defaultModeId, cmd.value);
                }
              }

              figma.ui.postMessage({
                type: 'variable-created',
                variableId: variable.id,
                name: variable.name
              });
              success++;
            } else {
              failed++;
            }
            continue;
          }

          if (cmd.action === 'setVariableValue') {
            const variable = await figma.variables.getVariableByIdAsync(cmd.variableId);
            if (variable) {
              const collection = await figma.variables.getVariableCollectionByIdAsync(variable.variableCollectionId);
              if (collection) {
                const modeId = cmd.modeId || collection.defaultModeId;
                if (variable.resolvedType === 'COLOR' && typeof cmd.value === 'string') {
                  const color = parseHexColor(cmd.value);
                  variable.setValueForMode(modeId, { r: color.r, g: color.g, b: color.b, a: color.a });
                } else {
                  variable.setValueForMode(modeId, cmd.value);
                }
                success++;
              } else {
                failed++;
              }
            } else {
              failed++;
            }
            continue;
          }

          if (cmd.action === 'removeVariable') {
            try {
              const variable = await figma.variables.getVariableByIdAsync(cmd.variableId);
              if (variable) {
                const name = variable.name;
                variable.remove();
                figma.ui.postMessage({ type: 'variable-removed', variableId: cmd.variableId, name });
                success++;
              } else {
                if (!firstError) firstError = { action: cmd.action, nodeId: cmd.variableId || 'N/A', message: `Variable not found: ${cmd.variableId}` };
                failed++;
              }
            } catch (error) {
              console.error('removeVariable failed', error);
              if (!firstError) firstError = { action: cmd.action, nodeId: cmd.variableId || 'unknown', message: (error as Error)?.message || 'removeVariable failed' };
              failed++;
            }
            continue;
          }

          if (cmd.action === 'renameVariable') {
            try {
              const variable = await figma.variables.getVariableByIdAsync(cmd.variableId);
              if (variable) {
                variable.name = cmd.name || variable.name;
                figma.ui.postMessage({ type: 'variable-renamed', variableId: cmd.variableId, name: variable.name });
                success++;
              } else {
                if (!firstError) firstError = { action: cmd.action, nodeId: cmd.variableId || 'N/A', message: `Variable not found: ${cmd.variableId}` };
                failed++;
              }
            } catch (error) {
              console.error('renameVariable failed', error);
              if (!firstError) firstError = { action: cmd.action, nodeId: cmd.variableId || 'unknown', message: (error as Error)?.message || 'renameVariable failed' };
              failed++;
            }
            continue;
          }

          if (cmd.action === 'setVariableDescription') {
            try {
              const variable = await figma.variables.getVariableByIdAsync(cmd.variableId);
              if (variable) {
                variable.description = cmd.description || '';
                success++;
              } else {
                if (!firstError) firstError = { action: cmd.action, nodeId: cmd.variableId || 'N/A', message: `Variable not found: ${cmd.variableId}` };
                failed++;
              }
            } catch (error) {
              console.error('setVariableDescription failed', error);
              if (!firstError) firstError = { action: cmd.action, nodeId: cmd.variableId || 'unknown', message: (error as Error)?.message || 'setVariableDescription failed' };
              failed++;
            }
            continue;
          }

          if (cmd.action === 'setVariableScopes') {
            try {
              const variable = await figma.variables.getVariableByIdAsync(cmd.variableId);
              if (variable && Array.isArray(cmd.scopes)) {
                variable.scopes = cmd.scopes as VariableScope[];
                success++;
              } else {
                if (!firstError) firstError = { action: cmd.action, nodeId: cmd.variableId || 'N/A', message: variable ? 'scopes must be an array' : `Variable not found: ${cmd.variableId}` };
                failed++;
              }
            } catch (error) {
              console.error('setVariableScopes failed', error);
              if (!firstError) firstError = { action: cmd.action, nodeId: cmd.variableId || 'unknown', message: (error as Error)?.message || 'setVariableScopes failed' };
              failed++;
            }
            continue;
          }

          if (cmd.action === 'setVariableAlias') {
            try {
              const variable = await figma.variables.getVariableByIdAsync(cmd.variableId);
              const targetVariable = await figma.variables.getVariableByIdAsync(cmd.targetVariableId);
              if (variable && targetVariable) {
                const collection = await figma.variables.getVariableCollectionByIdAsync(variable.variableCollectionId);
                if (collection) {
                  const modeId = cmd.modeId || collection.defaultModeId;
                  variable.setValueForMode(modeId, { type: 'VARIABLE_ALIAS', id: targetVariable.id } as VariableAlias);
                  figma.ui.postMessage({ type: 'variable-alias-set', variableId: cmd.variableId, targetVariableId: cmd.targetVariableId, modeId });
                  success++;
                } else {
                  if (!firstError) firstError = { action: cmd.action, nodeId: cmd.variableId || 'N/A', message: 'Collection not found for variable' };
                  failed++;
                }
              } else {
                const missing = !variable ? `Variable not found: ${cmd.variableId}` : `Target variable not found: ${cmd.targetVariableId}`;
                if (!firstError) firstError = { action: cmd.action, nodeId: cmd.variableId || 'N/A', message: missing };
                failed++;
              }
            } catch (error) {
              console.error('setVariableAlias failed', error);
              if (!firstError) firstError = { action: cmd.action, nodeId: cmd.variableId || 'unknown', message: (error as Error)?.message || 'setVariableAlias failed' };
              failed++;
            }
            continue;
          }

          if (cmd.action === 'bindVariable') {
            const targetNode = node as SceneNode;
            const variable = await figma.variables.getVariableByIdAsync(cmd.variableId);
            if (targetNode && variable && 'setBoundVariable' in targetNode) {
              const field = cmd.field as string;

              // Map shorthand fields to actual Figma API fields
              let targetFields: VariableBindableNodeField[] = [];
              if (field === 'padding-all') {
                targetFields = ['paddingLeft', 'paddingRight', 'paddingTop', 'paddingBottom'];
              } else if (field === 'padding-vh') {
                targetFields = ['paddingTop', 'paddingBottom'];
              } else if (field === 'padding-hw') {
                targetFields = ['paddingLeft', 'paddingRight'];
              } else if (field === 'gap') {
                targetFields = ['itemSpacing'];
              } else {
                targetFields = [field as VariableBindableNodeField];
              }

              let anySuccess = false;
              for (const targetField of targetFields) {
                // Special handling for paint bindings: must be set on paints directly
                const isPaintField = (targetField as any) === 'fills' || (targetField as any) === 'strokes';
                const isColorVariable = variable.resolvedType === 'COLOR';

                if (isPaintField && isColorVariable && ('fills' in targetNode || 'strokes' in targetNode)) {
                  const paints = (targetNode as any)[targetField];
                  if (paints === figma.mixed) {
                    continue;
                  }
                  const newPaints = Array.isArray(paints) ? [...paints] : [];
                  if (newPaints.length === 0) {
                    newPaints.push({
                      type: 'SOLID',
                      color: { r: 0, g: 0, b: 0 },
                      opacity: 1
                    } as SolidPaint);
                  }
                  let applied = 0;
                  for (let i = 0; i < newPaints.length; i++) {
                    const paint = newPaints[i];
                    if (!paint || paint.type !== 'SOLID') continue;
                    const updatedPaint = { ...paint } as SolidPaint & { boundVariables?: any };
                    const boundVariables = { ...(updatedPaint as any).boundVariables };
                    boundVariables.color = { type: 'VARIABLE_ALIAS', id: variable.id };
                    (updatedPaint as any).boundVariables = boundVariables;
                    newPaints[i] = updatedPaint as Paint;
                    applied++;
                  }
                  if (applied > 0) {
                    (targetNode as any)[targetField] = newPaints;
                    anySuccess = true;
                  }
                } else {
                  try {
                    (targetNode as any).setBoundVariable(targetField, variable);
                    anySuccess = true;
                  } catch (e) {
                    console.warn(`Failed to bind variable to ${targetField}:`, e);
                  }
                }
              }

              if (anySuccess) {
                success++;
              } else {
                failed++;
              }
            } else {
              failed++;
            }
            continue;
          }

          if (cmd.action === 'unbindVariable') {
            const targetNode = await figma.getNodeByIdAsync(cmd.nodeId) as SceneNode;
            if (targetNode && 'setBoundVariable' in targetNode) {
              const field = cmd.field as VariableBindableNodeField;
              (targetNode as any).setBoundVariable(field, null);
              success++;
            } else {
              failed++;
            }
            continue;
          }

          if (cmd.action === 'getLocalVariables') {
            const variables = await figma.variables.getLocalVariablesAsync();
            const collections = await figma.variables.getLocalVariableCollectionsAsync();
            figma.ui.postMessage({
              type: 'local-variables',
              variables: variables.map(v => ({ id: v.id, name: v.name, resolvedType: v.resolvedType, collectionId: v.variableCollectionId })),
              collections: collections.map(c => ({ id: c.id, name: c.name, modes: c.modes }))
            });
            success++;
            continue;
          }

          if (cmd.action === 'createImage') {
            try {
              const bytes = base64ToBytes(cmd.base64 || '');
              const image = figma.createImage(bytes);
              figma.ui.postMessage({ type: 'image-created', hash: image.hash });
              success++;
            } catch (error) {
              console.error('createImage failed', error);
              failed++;
            }
            continue;
          }

          if (cmd.action === 'getImageByHash') {
            try {
              const image = figma.getImageByHash(cmd.hash);
              if (!image) {
                failed++;
                continue;
              }
              const bytes = await image.getBytesAsync();
              figma.ui.postMessage({ type: 'image-by-hash', hash: cmd.hash, bytes: Array.from(bytes) });
              success++;
            } catch (error) {
              console.error('getImageByHash failed', error);
              failed++;
            }
            continue;
          }

          if (cmd.action === 'getAvailableLibraryComponents') {
            try {
              const teamLibrary = figma.teamLibrary as any;
              if (!teamLibrary || typeof teamLibrary.getAvailableLibraryComponentsAsync !== 'function') {
                figma.ui.postMessage({ type: 'error', message: 'Team library API unavailable' });
                failed++;
              } else {
                const components = await teamLibrary.getAvailableLibraryComponentsAsync();
                figma.ui.postMessage({ type: 'library-components', data: components });
                success++;
              }
            } catch (error) {
              console.error('getAvailableLibraryComponents failed', error);
              failed++;
            }
            continue;
          }

          if (cmd.action === 'getAvailableLibraryStyles') {
            try {
              const teamLibrary = figma.teamLibrary as any;
              if (!teamLibrary || typeof teamLibrary.getAvailableLibraryStylesAsync !== 'function') {
                figma.ui.postMessage({ type: 'error', message: 'Team library styles API unavailable' });
                failed++;
              } else {
                const styles = await teamLibrary.getAvailableLibraryStylesAsync();
                figma.ui.postMessage({ type: 'library-styles', data: styles });
                success++;
              }
            } catch (error) {
              console.error('getAvailableLibraryStyles failed', error);
              failed++;
            }
            continue;
          }

          if (cmd.action === 'getAvailableLibraryVariableCollections') {
            try {
              const teamLibrary = figma.teamLibrary as any;
              if (!teamLibrary || typeof teamLibrary.getAvailableLibraryVariableCollectionsAsync !== 'function') {
                figma.ui.postMessage({ type: 'error', message: 'Team library variable API unavailable' });
                failed++;
              } else {
                const collections = await teamLibrary.getAvailableLibraryVariableCollectionsAsync();
                figma.ui.postMessage({ type: 'library-variable-collections', data: collections });
                success++;
              }
            } catch (error) {
              console.error('getAvailableLibraryVariableCollections failed', error);
              failed++;
            }
            continue;
          }

          if (cmd.action === 'getLocalStyles') {
            try {
              const simplifyPaints = (paints: ReadonlyArray<Paint> | any) => {
                if (!Array.isArray(paints)) return [];
                return paints.slice(0, 1).map(p => {
                  if (p.type === 'SOLID') {
                    return {
                      type: 'SOLID',
                      color: { r: p.color.r, g: p.color.g, b: p.color.b, a: 'opacity' in p ? (p as any).opacity ?? p.color.a ?? 1 : p.color.a ?? 1 }
                    };
                  }
                  return { type: p.type };
                });
              };

              const paintStylesRaw = await figma.getLocalPaintStylesAsync();
              const textStylesRaw = await figma.getLocalTextStylesAsync();
              const effectStylesRaw = await figma.getLocalEffectStylesAsync();

              const paintStyles = paintStylesRaw.map(s => ({
                id: s.id,
                name: s.name,
                paints: simplifyPaints(s.paints)
              }));

              const textStyles = textStylesRaw.map(s => ({
                id: s.id,
                name: s.name,
                fontName: s.fontName,
                fontSize: s.fontSize,
                lineHeight: s.lineHeight,
                letterSpacing: s.letterSpacing
              }));

              const effectStyles = effectStylesRaw.map(s => ({
                id: s.id,
                name: s.name,
                effects: Array.isArray(s.effects) && s.effects.length > 0 ? [{ type: s.effects[0].type }] : []
              }));

              let serializedVariables: any[] = [];
              let serializedCollections: any[] = [];
              if (figma.variables && typeof figma.variables.getLocalVariablesAsync === 'function') {
                try {
                  const variables = await figma.variables.getLocalVariablesAsync();
                  const collections = await figma.variables.getLocalVariableCollectionsAsync();
                  const serialized = serializeVariablesForDisplay(variables, collections);
                  serializedVariables = serialized.serializedVariables;
                  serializedCollections = serialized.serializedCollections;
                } catch (varError) {
                  console.warn('Variables not available', varError);
                }
              }

              figma.ui.postMessage({ type: 'local-styles', source: 'command', paintStyles, textStyles, effectStyles, variables: serializedVariables, collections: serializedCollections });
              success++;
            } catch (error) {
              console.error('getLocalStyles failed', error);
              failed++;
            }
            continue;
          }

          // Modification actions (those that require an existing node)
          switch (cmd.action) {
            case 'rename':
              node.name = cmd.name;
              success++;
              break;

            case 'setComponentDescription': {
              const cleanDescription = typeof cmd.description === 'string' ? cmd.description.trim() : '';
              const target = await resolveComponentTarget(node);

              if (!target) {
                failed++;
                break;
              }

              try {
                target.description = cleanDescription || '';
                success++;
              } catch (error) {
                console.error('setComponentDescription failed', error);
                if (!firstError) firstError = { action: cmd.action, nodeId: target.id, message: (error as Error)?.message || 'setComponentDescription failed' };
                failed++;
              }
              break;
            }

            case 'removeUnusedComponentProperties': {
              const target = await resolveComponentTarget(node);
              if (!target) {
                failed++;
                break;
              }

              try {
                const result = removeUnusedComponentProperties(target);
                figma.ui.postMessage({
                  type: 'remove-unused-component-properties-result',
                  nodeId: target.id,
                  removed: result.removed
                });
                success++;
              } catch (error) {
                console.error('removeUnusedComponentProperties failed', error);
                if (!firstError) {
                  firstError = {
                    action: cmd.action,
                    nodeId: target.id,
                    message: (error as Error)?.message || 'removeUnusedComponentProperties failed'
                  };
                }
                failed++;
              }
              break;
            }

            case 'resize':
              if ('resize' in node) {
                const newWidth = typeof cmd.width === 'number' ? cmd.width : (node as any).width;
                const newHeight = typeof cmd.height === 'number' ? cmd.height : (node as any).height;
                (node as any).resize(newWidth, newHeight);
                success++;
              } else {
                failed++;
              }
              break;

            case 'rescale':
              if ('rescale' in node && typeof cmd.scale === 'number') {
                (node as any).rescale(cmd.scale);
                success++;
              } else {
                failed++;
              }
              break;

            case 'move':
              if ('x' in node && 'y' in node) {
                const hasX = typeof cmd.x === 'number';
                const hasY = typeof cmd.y === 'number';

                if (!hasX && !hasY) {
                  failed++;
                  break;
                }

                let targetX = hasX ? cmd.x : node.x;
                let targetY = hasY ? cmd.y : node.y;

                // Check if node has a parent that's not the page
                // If so, coordinates need to be converted from absolute to relative
                const parent = (node as any).parent;
                if (parent && parent.type !== 'PAGE') {
                  // Node is inside a container (section, group, etc.)
                  // Convert absolute coordinates to relative by subtracting parent's absolute position
                  const parentAbsX = parent.absoluteTransform[0][2];
                  const parentAbsY = parent.absoluteTransform[1][2];
                  if (hasX) targetX = cmd.x - parentAbsX;
                  if (hasY) targetY = cmd.y - parentAbsY;
                }
                // If parent is PAGE or null, coordinates are already relative (or absolute = relative for page children)

                node.x = targetX;
                node.y = targetY;
                success++;
              } else {
                failed++;
              }
              break;

            case 'swapPaints': {
              const fromHex = normalizeHex(cmd.fromColor);
              const toHex = normalizeHex(cmd.toColor);
              if (!fromHex || !toHex) {
                failed++;
                break;
              }

              const from = parseHexColor(fromHex);
              const to = parseHexColor(toHex);
              const includeGradients = cmd.includeGradients !== false;
              const includeStrokes = cmd.includeStrokes !== false;
              const includeEffects = cmd.includeEffects !== false;

              const applySwapReplace = (target: SceneNode): { changed: boolean; found: boolean } => {
                let changed = false;
                let found = false;

                if ('fills' in target) {
                  const fills = (target as any).fills as Paint[] | typeof figma.mixed;
                  if (Array.isArray(fills)) {
                    const result = swapColorsInPaints(fills as Paint[], from, to, includeGradients);
                    found = found || result.found;
                    if (result.updated) {
                      (target as GeometryMixin).fills = result.paints as Paint[];
                      changed = true;
                    }
                  }
                }

                if (includeStrokes && 'strokes' in target) {
                  const strokes = (target as any).strokes as Paint[] | typeof figma.mixed;
                  if (Array.isArray(strokes)) {
                    const result = swapColorsInPaints(strokes as Paint[], from, to, includeGradients);
                    found = found || result.found;
                    if (result.updated) {
                      (target as GeometryMixin).strokes = result.paints as Paint[];
                      changed = true;
                    }
                  }
                }

                if (includeEffects && 'effects' in target) {
                  const effects = (target as any).effects as ReadonlyArray<Effect> | typeof figma.mixed;
                  if (Array.isArray(effects)) {
                    const result = swapColorsInEffects(effects, from, to);
                    found = found || result.found;
                    if (result.updated) {
                      (target as any).effects = result.effects;
                      changed = true;
                    }
                  }
                }

                const children = (target as any).children as ReadonlyArray<SceneNode> | undefined;
                if (Array.isArray(children)) {
                  for (const child of children) {
                    const childResult = applySwapReplace(child);
                    changed = changed || childResult.changed;
                    found = found || childResult.found;
                  }
                }

                return { changed, found };
              };

              const { changed, found } = applySwapReplace(node);

              if (changed) {
                success++;
              } else {
                failed++;
                if (!firstError) {
                  firstError = {
                    action: 'swapPaints',
                    nodeId: node.id,
                    message: found
                      ? `No fills, strokes, gradients, or effects were updated (from ${fromHex} to ${toHex})`
                      : `No matching color ${fromHex} found on the node or its children`
                  };
                }
              }
              break;
            }

            case 'swapPaintsTwoWay': {
              const fromHex = normalizeHex(cmd.fromColor);
              const toHex = normalizeHex(cmd.toColor);
              if (!fromHex || !toHex) {
                failed++;
                break;
              }

              const from = parseHexColor(fromHex);
              const to = parseHexColor(toHex);
              const includeGradients = cmd.includeGradients !== false;
              const includeStrokes = cmd.includeStrokes !== false;
              const includeEffects = cmd.includeEffects !== false;

              const applySwapTwoWay = (target: SceneNode): { changed: boolean; foundA: boolean; foundB: boolean } => {
                let changed = false;
                let foundA = false;
                let foundB = false;

                if ('fills' in target) {
                  const fills = (target as any).fills as Paint[] | typeof figma.mixed;
                  if (Array.isArray(fills)) {
                    const result = swapColorsInPaintsTwoWay(fills as Paint[], from, to, includeGradients);
                    foundA = foundA || result.foundA;
                    foundB = foundB || result.foundB;
                    if (result.updated) {
                      (target as GeometryMixin).fills = result.paints as Paint[];
                      changed = true;
                    }
                  } else if (fills === figma.mixed) {
                    // mixed fills: still scan for presence
                    const scanResult = swapColorsInPaintsTwoWay([], from, to, includeGradients);
                    foundA = foundA || scanResult.foundA;
                    foundB = foundB || scanResult.foundB;
                  }
                }

                if (includeStrokes && 'strokes' in target) {
                  const strokes = (target as any).strokes as Paint[] | typeof figma.mixed;
                  if (Array.isArray(strokes)) {
                    const result = swapColorsInPaintsTwoWay(strokes as Paint[], from, to, includeGradients);
                    foundA = foundA || result.foundA;
                    foundB = foundB || result.foundB;
                    if (result.updated) {
                      (target as GeometryMixin).strokes = result.paints as Paint[];
                      changed = true;
                    }
                  } else if (strokes === figma.mixed) {
                    const scanResult = swapColorsInPaintsTwoWay([], from, to, includeGradients);
                    foundA = foundA || scanResult.foundA;
                    foundB = foundB || scanResult.foundB;
                  }
                }

                if (includeEffects && 'effects' in target) {
                  const effects = (target as any).effects as ReadonlyArray<Effect> | typeof figma.mixed;
                  if (Array.isArray(effects)) {
                    const result = swapColorsInEffectsTwoWay(effects, from, to);
                    foundA = foundA || result.foundA;
                    foundB = foundB || result.foundB;
                    if (result.updated) {
                      (target as any).effects = result.effects;
                      changed = true;
                    }
                  } else if (effects === figma.mixed) {
                    const scanResult = swapColorsInEffectsTwoWay([], from, to);
                    foundA = foundA || scanResult.foundA;
                    foundB = foundB || scanResult.foundB;
                  }
                }

                const children = (target as any).children as ReadonlyArray<SceneNode> | undefined;
                if (Array.isArray(children)) {
                  for (const child of children) {
                    const childResult = applySwapTwoWay(child);
                    changed = changed || childResult.changed;
                    foundA = foundA || childResult.foundA;
                    foundB = foundB || childResult.foundB;
                  }
                }

                return { changed, foundA, foundB };
              };

              const { changed, foundA, foundB } = applySwapTwoWay(node);

              if (!foundA || !foundB) {
                failed++;
                if (!firstError) {
                  firstError = {
                    action: 'swapPaintsTwoWay',
                    nodeId: node.id,
                    message: `Both colors must exist in the selection to swap (${fromHex} and ${toHex})`
                  };
                }
                break;
              }

              if (changed) {
                success++;
              } else {
                failed++;
                if (!firstError) {
                  firstError = {
                    action: 'swapPaintsTwoWay',
                    nodeId: node.id,
                    message: `No fills, strokes, gradients, or effects matched ${fromHex} or ${toHex}`
                  };
                }
              }
              break;
            }

            case 'setFill':
            case 'swapPaints':
              if ('fills' in node) {
                const color = parseHexColor(cmd.color);
                const successFlag = smartSetFill(node as GeometryMixin, { r: color.r, g: color.g, b: color.b, a: color.a });
                if (successFlag) {
                  success++;
                } else {
                  failed++;
                }
              } else {
                failed++;
              }
              break;

            case 'setFillStyle':
              if ('fillStyleId' in node) {
                const styleId = cmd.styleId || cmd.id || cmd.paintStyleId;
                if (!styleId || typeof styleId !== 'string') {
                  failed++;
                  break;
                }
                try {
                  if ('setFillStyleIdAsync' in node && typeof (node as any).setFillStyleIdAsync === 'function') {
                    await (node as any).setFillStyleIdAsync(styleId);
                  } else {
                    (node as any).fillStyleId = styleId;
                  }
                  success++;
                } catch (error) {
                  console.error('setFillStyle failed', error);
                  if (!firstError) firstError = { action: cmd.action, nodeId: node.id, message: (error as Error)?.message || 'setFillStyle failed' };
                  failed++;
                }
              } else {
                failed++;
              }
              break;

            case 'setImageFill':
              if (node && 'fills' in node) {
                try {
                  const scaleMode = cmd.scaleMode || 'FILL';
                  const currentFills = (node as any).fills;
                  if (currentFills === figma.mixed) {
                    throw new Error('Mixed fills not supported for setImageFill');
                  }
                  const fills = Array.isArray(currentFills) ? [...currentFills] : [];
                  const imageFillIndex = fills.findIndex((paint) => paint.type === 'IMAGE');

                  let nextImageHash: string | null = null;
                  if (cmd.imageHash || cmd.imageData) {
                    const bytes = cmd.imageHash ? null : base64ToBytes(cmd.imageData);
                    const image = cmd.imageHash ? figma.getImageByHash(cmd.imageHash) : figma.createImage(bytes as Uint8Array);
                    if (!image) {
                      throw new Error(cmd.imageHash ? 'Image not found by hash' : 'Failed to create image from data');
                    }
                    nextImageHash = image.hash;
                  } else if (imageFillIndex !== -1) {
                    nextImageHash = (fills[imageFillIndex] as ImagePaint).imageHash;
                  } else {
                    throw new Error('No image data or existing image fill provided');
                  }

                  if (!nextImageHash) {
                    throw new Error('Failed to determine image hash');
                  }

                  if (cmd.addAsNewLayer || imageFillIndex === -1) {
                    // Always add as a new top-most fill layer
                    fills.push({
                      type: 'IMAGE',
                      imageHash: nextImageHash,
                      scaleMode
                    } as ImagePaint);
                  } else {
                    const existing = fills[imageFillIndex] as ImagePaint;
                    fills[imageFillIndex] = { ...existing, imageHash: nextImageHash, scaleMode };
                  }

                  (node as any).fills = fills;
                  success++;
                } catch (error) {
                  console.error(`setImageFill failed on node ${node.id} (${(node as any).type}):`, error);
                  if (!firstError) firstError = {
                    action: cmd.action,
                    nodeId: node.id,
                    message: `setImageFill failed: ${(error as Error)?.message} (node type: ${(node as any).type})`
                  };
                  failed++;
                }
              } else {
                if (!firstError) firstError = {
                  action: cmd.action,
                  nodeId: node?.id || 'unknown',
                  message: `Node does not support fills (node type: ${(node as any)?.type || 'unknown'})`
                };
                failed++;
              }
              break;

            case 'setLinearGradient':
              if ('fills' in node) {
                // Parse gradient stops: [{ color: "#FF0000", position: 0 }, { color: "#0000FF", position: 1 }]
                const stops = (cmd.stops || []).map((stop: { color: string, position: number }) => {
                  const c = parseHexColor(stop.color);
                  return {
                    color: { r: c.r, g: c.g, b: c.b, a: c.a },
                    position: stop.position
                  };
                });

                // Default gradient from top-left to bottom-right if not specified
                const angle = cmd.angle || 0; // degrees
                const radians = (angle * Math.PI) / 180;
                const cos = Math.cos(radians);
                const sin = Math.sin(radians);

                const gradient: GradientPaint = {
                  type: 'GRADIENT_LINEAR',
                  gradientStops: stops.length >= 2 ? stops : [
                    { color: { r: 1, g: 0, b: 0, a: 1 }, position: 0 },
                    { color: { r: 0, g: 0, b: 1, a: 1 }, position: 1 }
                  ],
                  gradientTransform: [
                    [cos, sin, 0.5 - cos * 0.5 - sin * 0.5],
                    [-sin, cos, 0.5 + sin * 0.5 - cos * 0.5]
                  ]
                };
                (node as GeometryMixin).fills = [gradient];
                success++;
              } else {
                failed++;
              }
              break;

            case 'setRadialGradient':
              if ('fills' in node) {
                const stops = (cmd.stops || []).map((stop: { color: string, position: number }) => {
                  const c = parseHexColor(stop.color);
                  return {
                    color: { r: c.r, g: c.g, b: c.b, a: c.a },
                    position: stop.position
                  };
                });

                const gradient: GradientPaint = {
                  type: 'GRADIENT_RADIAL',
                  gradientStops: stops.length >= 2 ? stops : [
                    { color: { r: 1, g: 1, b: 1, a: 1 }, position: 0 },
                    { color: { r: 0, g: 0, b: 0, a: 1 }, position: 1 }
                  ],
                  gradientTransform: [
                    [1, 0, 0],
                    [0, 1, 0]
                  ]
                };
                (node as GeometryMixin).fills = [gradient];
                success++;
              } else {
                failed++;
              }
              break;

            case 'modifyGradientStop': {
              const field: 'fills' | 'strokes' = cmd.field === 'strokes' ? 'strokes' : 'fills';

              if (!(field in node)) {
                failed++;
                break;
              }

              const paints = (node as any)[field] as Paint[] | Paint | typeof figma.mixed;
              const paintIndex = cmd.fillIndex || 0;
              const stopIndex = cmd.stopIndex;

              if (paints === figma.mixed) {
                failed++;
                break;
              }

              if (!Array.isArray(paints)) {
                failed++;
                break;
              }

              const paintsArray = paints as Paint[];
              const targetPaint = paintsArray[paintIndex];
              if (
                targetPaint &&
                (targetPaint.type === 'GRADIENT_LINEAR' ||
                  targetPaint.type === 'GRADIENT_RADIAL' ||
                  targetPaint.type === 'GRADIENT_ANGULAR' ||
                  targetPaint.type === 'GRADIENT_DIAMOND')
              ) {
                const gradientPaint = targetPaint as GradientPaint;
                const newStops = [...gradientPaint.gradientStops];

                if (stopIndex >= 0 && stopIndex < newStops.length) {
                  const existingStop = newStops[stopIndex];

                  // Update color if provided
                  if (cmd.color) {
                    const c = parseHexColor(cmd.color);
                    newStops[stopIndex] = {
                      ...existingStop,
                      color: { r: c.r, g: c.g, b: c.b, a: cmd.opacity !== undefined ? cmd.opacity : existingStop.color.a }
                    };
                  }

                  // Update position if provided
                  if (cmd.position !== undefined) {
                    newStops[stopIndex] = {
                      ...newStops[stopIndex],
                      position: cmd.position
                    };
                  }

                  // Update opacity only if provided
                  if (cmd.opacity !== undefined && !cmd.color) {
                    newStops[stopIndex] = {
                      ...newStops[stopIndex],
                      color: { ...existingStop.color, a: cmd.opacity }
                    };
                  }

                  const updatedPaints = [...paintsArray] as Paint[];
                  updatedPaints[paintIndex] = {
                    ...gradientPaint,
                    gradientStops: newStops
                  };

                  (node as any)[field] = updatedPaints;
                  success++;
                } else {
                  failed++;
                }
              } else {
                failed++;
              }
              break;
            }

            case 'addGradientStop':
              if ('fills' in node) {
                const fills = (node as GeometryMixin).fills as Paint[];
                const fillIndex = cmd.fillIndex || 0;

                if (fills[fillIndex] &&
                  (fills[fillIndex].type === 'GRADIENT_LINEAR' ||
                    fills[fillIndex].type === 'GRADIENT_RADIAL' ||
                    fills[fillIndex].type === 'GRADIENT_ANGULAR' ||
                    fills[fillIndex].type === 'GRADIENT_DIAMOND')) {
                  const gradientFill = fills[fillIndex] as GradientPaint;
                  const c = parseHexColor(cmd.color || '#888888');
                  const newStop: ColorStop = {
                    color: { r: c.r, g: c.g, b: c.b, a: cmd.opacity !== undefined ? cmd.opacity : 1 },
                    position: cmd.position !== undefined ? cmd.position : 0.5
                  };

                  const newStops = [...gradientFill.gradientStops, newStop];
                  // Sort stops by position
                  newStops.sort((a, b) => a.position - b.position);

                  const newFills = [...fills];
                  newFills[fillIndex] = {
                    ...gradientFill,
                    gradientStops: newStops
                  };
                  (node as GeometryMixin).fills = newFills;
                  success++;
                } else {
                  failed++;
                }
              } else {
                failed++;
              }
              break;

            case 'removeGradientStop':
              if ('fills' in node) {
                const fills = (node as GeometryMixin).fills as Paint[];
                const fillIndex = cmd.fillIndex || 0;
                const stopIndex = cmd.stopIndex;

                if (fills[fillIndex] &&
                  (fills[fillIndex].type === 'GRADIENT_LINEAR' ||
                    fills[fillIndex].type === 'GRADIENT_RADIAL' ||
                    fills[fillIndex].type === 'GRADIENT_ANGULAR' ||
                    fills[fillIndex].type === 'GRADIENT_DIAMOND')) {
                  const gradientFill = fills[fillIndex] as GradientPaint;

                  // Need at least 2 stops for a gradient
                  if (gradientFill.gradientStops.length > 2 &&
                    stopIndex >= 0 && stopIndex < gradientFill.gradientStops.length) {
                    const newStops = gradientFill.gradientStops.filter((_, i) => i !== stopIndex);

                    const newFills = [...fills];
                    newFills[fillIndex] = {
                      ...gradientFill,
                      gradientStops: newStops
                    };
                    (node as GeometryMixin).fills = newFills;
                    success++;
                  } else {
                    failed++;
                  }
                } else {
                  failed++;
                }
              } else {
                failed++;
              }
              break;

            case 'setGradientAngle':
              if ('fills' in node) {
                const fills = (node as GeometryMixin).fills as Paint[];
                const fillIndex = cmd.fillIndex || 0;

                if (fills[fillIndex] && fills[fillIndex].type === 'GRADIENT_LINEAR') {
                  const gradientFill = fills[fillIndex] as GradientPaint;
                  const angle = cmd.angle || 0;
                  const radians = (angle * Math.PI) / 180;
                  const cos = Math.cos(radians);
                  const sin = Math.sin(radians);

                  const newFills = [...fills];
                  newFills[fillIndex] = {
                    ...gradientFill,
                    gradientTransform: [
                      [cos, sin, 0.5 - cos * 0.5 - sin * 0.5],
                      [-sin, cos, 0.5 + sin * 0.5 - cos * 0.5]
                    ]
                  };
                  (node as GeometryMixin).fills = newFills;
                  success++;
                } else {
                  failed++;
                }
              } else {
                failed++;
              }
              break;

            case 'getGradientInfo':
              // Return gradient info for the node
              if ('fills' in node) {
                const fills = (node as GeometryMixin).fills as Paint[];
                const gradientInfo: any[] = [];

                fills.forEach((fill, index) => {
                  if (fill.type === 'GRADIENT_LINEAR' || fill.type === 'GRADIENT_RADIAL' ||
                    fill.type === 'GRADIENT_ANGULAR' || fill.type === 'GRADIENT_DIAMOND') {
                    const gradientFill = fill as GradientPaint;
                    const stops = gradientFill.gradientStops.map(stop => ({
                      color: rgbToHex(stop.color.r, stop.color.g, stop.color.b),
                      position: stop.position,
                      opacity: stop.color.a
                    }));

                    let angle: number | undefined;
                    if (fill.type === 'GRADIENT_LINEAR' && gradientFill.gradientTransform) {
                      const [[a, b]] = gradientFill.gradientTransform;
                      angle = Math.round(Math.atan2(b, a) * (180 / Math.PI));
                    }

                    gradientInfo.push({
                      fillIndex: index,
                      type: fill.type,
                      stops,
                      angle
                    });
                  }
                });

                figma.ui.postMessage({
                  type: 'gradient-info',
                  nodeId: node.id,
                  gradients: gradientInfo
                });
                success++;
              } else {
                failed++;
              }
              break;

            // === Fill Stack Management ===

            case 'addFill': {
              // Append a fill to the existing fill stack without replacing existing fills.
              // Supports: solid, linear gradient, radial gradient, angular gradient, diamond gradient.
              // Optional "index" to insert at a specific position (0-based). Omit to append at end.
              if (!('fills' in node)) {
                failed++;
                break;
              }

              const currentFills = (node as GeometryMixin).fills;
              if (currentFills === figma.mixed) {
                if (!firstError) firstError = { action: cmd.action, nodeId: node.id, message: 'Cannot add fill to node with mixed fills' };
                failed++;
                break;
              }

              const fillsArr = Array.isArray(currentFills) ? [...currentFills] : [];
              let newFill: Paint | null = null;

              const fillType: string = (cmd.type || 'SOLID').toUpperCase();

              if (fillType === 'SOLID') {
                const c = parseHexColor(cmd.color || '#000000');
                newFill = {
                  type: 'SOLID',
                  color: { r: c.r, g: c.g, b: c.b },
                  opacity: cmd.opacity !== undefined ? cmd.opacity : c.a,
                  visible: cmd.visible !== undefined ? cmd.visible : true
                } as SolidPaint;
              } else if (fillType === 'GRADIENT_LINEAR' || fillType === 'GRADIENT_RADIAL' ||
                fillType === 'GRADIENT_ANGULAR' || fillType === 'GRADIENT_DIAMOND') {
                const stops = (cmd.stops || []).map((stop: { color: string, position: number, opacity?: number }) => {
                  const c = parseHexColor(stop.color);
                  return {
                    color: { r: c.r, g: c.g, b: c.b, a: stop.opacity !== undefined ? stop.opacity : c.a },
                    position: stop.position
                  };
                });

                if (stops.length < 2) {
                  if (!firstError) firstError = { action: cmd.action, nodeId: node.id, message: 'Gradient requires at least 2 stops' };
                  failed++;
                  break;
                }

                let gradientTransform: Transform = [[1, 0, 0], [0, 1, 0]];
                if (fillType === 'GRADIENT_LINEAR' && cmd.angle !== undefined) {
                  const radians = (cmd.angle * Math.PI) / 180;
                  const cos = Math.cos(radians);
                  const sin = Math.sin(radians);
                  gradientTransform = [
                    [cos, sin, 0.5 - cos * 0.5 - sin * 0.5],
                    [-sin, cos, 0.5 + sin * 0.5 - cos * 0.5]
                  ];
                }

                newFill = {
                  type: fillType as 'GRADIENT_LINEAR' | 'GRADIENT_RADIAL' | 'GRADIENT_ANGULAR' | 'GRADIENT_DIAMOND',
                  gradientStops: stops,
                  gradientTransform,
                  visible: cmd.visible !== undefined ? cmd.visible : true
                } as GradientPaint;
              } else {
                if (!firstError) firstError = { action: cmd.action, nodeId: node.id, message: `Unsupported fill type: ${fillType}. Use SOLID, GRADIENT_LINEAR, GRADIENT_RADIAL, GRADIENT_ANGULAR, or GRADIENT_DIAMOND.` };
                failed++;
                break;
              }

              if (newFill) {
                const insertIndex = cmd.index !== undefined ? Math.max(0, Math.min(fillsArr.length, cmd.index)) : fillsArr.length;
                fillsArr.splice(insertIndex, 0, newFill);
                (node as GeometryMixin).fills = fillsArr;
                success++;
              } else {
                failed++;
              }
              break;
            }

            case 'removeFill': {
              // Remove a fill by index from the fill stack.
              // cmd.index: 0-based index of the fill to remove.
              if (!('fills' in node)) {
                failed++;
                break;
              }

              const currentFills = (node as GeometryMixin).fills;
              if (currentFills === figma.mixed) {
                if (!firstError) firstError = { action: cmd.action, nodeId: node.id, message: 'Cannot remove fill from node with mixed fills' };
                failed++;
                break;
              }

              const fillsArr = Array.isArray(currentFills) ? [...currentFills] : [];
              const removeIndex = cmd.index;

              if (removeIndex === undefined || removeIndex < 0 || removeIndex >= fillsArr.length) {
                if (!firstError) firstError = { action: cmd.action, nodeId: node.id, message: `Invalid fill index: ${removeIndex}. Node has ${fillsArr.length} fill(s) (0-indexed).` };
                failed++;
                break;
              }

              fillsArr.splice(removeIndex, 1);
              (node as GeometryMixin).fills = fillsArr;
              success++;
              break;
            }

            case 'reorderFills': {
              // Reorder fills in the fill stack.
              // cmd.order: array of current indices in desired new order. E.g. [2, 0, 1] moves fill at index 2 to first, 0 to second, 1 to third.
              if (!('fills' in node)) {
                failed++;
                break;
              }

              const currentFills = (node as GeometryMixin).fills;
              if (currentFills === figma.mixed) {
                if (!firstError) firstError = { action: cmd.action, nodeId: node.id, message: 'Cannot reorder fills on node with mixed fills' };
                failed++;
                break;
              }

              const fillsArr = Array.isArray(currentFills) ? [...currentFills] : [];
              const rawOrder: number[] = cmd.order;

              if (!Array.isArray(rawOrder)) {
                if (!firstError) firstError = { action: cmd.action, nodeId: node.id, message: 'order must be an array' };
                failed++;
                break;
              }

              // Robustly construct the new order
              const newOrder: number[] = [];
              const seen = new Set<number>();

              // 1. Add valid indices from the requested order
              for (const idx of rawOrder) {
                if (typeof idx === 'number' && idx >= 0 && idx < fillsArr.length && !seen.has(idx)) {
                  newOrder.push(idx);
                  seen.add(idx);
                }
              }

              // 2. Add any remaining indices that were not in the requested order
              for (let i = 0; i < fillsArr.length; i++) {
                if (!seen.has(i)) {
                  newOrder.push(i);
                }
              }

              const reordered = newOrder.map(i => fillsArr[i]);
              (node as GeometryMixin).fills = reordered;
              success++;
              break;
            }

            case 'updateFill': {
              // Update a specific fill in the stack by index, without affecting other fills.
              // cmd.index: 0-based index of the fill to update.
              // For SOLID fills: cmd.color, cmd.opacity, cmd.visible
              // For GRADIENT fills: cmd.stops, cmd.angle (linear only), cmd.visible
              if (!('fills' in node)) {
                failed++;
                break;
              }

              const currentFills = (node as GeometryMixin).fills;
              if (currentFills === figma.mixed) {
                if (!firstError) firstError = { action: cmd.action, nodeId: node.id, message: 'Cannot update fill on node with mixed fills' };
                failed++;
                break;
              }

              const fillsArr = Array.isArray(currentFills) ? [...currentFills] : [];
              const updateIndex = cmd.index !== undefined ? cmd.index : 0;

              if (updateIndex < 0 || updateIndex >= fillsArr.length) {
                if (!firstError) firstError = { action: cmd.action, nodeId: node.id, message: `Invalid fill index: ${updateIndex}. Node has ${fillsArr.length} fill(s) (0-indexed).` };
                failed++;
                break;
              }

              const existingFill = fillsArr[updateIndex];
              let updatedFill: Paint = { ...existingFill };

              if (existingFill.type === 'SOLID') {
                const solidBase = existingFill as SolidPaint;
                const c = cmd.color ? parseHexColor(cmd.color) : null;
                updatedFill = {
                  ...solidBase,
                  ...(c ? { color: { r: c.r, g: c.g, b: c.b } } : {}),
                  ...(cmd.opacity !== undefined ? { opacity: cmd.opacity } : (c ? { opacity: c.a } : {})),
                  ...(cmd.visible !== undefined ? { visible: cmd.visible } : {})
                } as SolidPaint;
              } else if (existingFill.type === 'GRADIENT_LINEAR' || existingFill.type === 'GRADIENT_RADIAL' ||
                existingFill.type === 'GRADIENT_ANGULAR' || existingFill.type === 'GRADIENT_DIAMOND') {
                const gradBase = existingFill as GradientPaint;
                const newStops = cmd.stops ? cmd.stops.map((stop: { color: string, position: number, opacity?: number }) => {
                  const c = parseHexColor(stop.color);
                  return {
                    color: { r: c.r, g: c.g, b: c.b, a: stop.opacity !== undefined ? stop.opacity : c.a },
                    position: stop.position
                  };
                }) : undefined;

                let newTransform: Transform | undefined;
                if (cmd.angle !== undefined && existingFill.type === 'GRADIENT_LINEAR') {
                  const radians = (cmd.angle * Math.PI) / 180;
                  const cos = Math.cos(radians);
                  const sin = Math.sin(radians);
                  newTransform = [
                    [cos, sin, 0.5 - cos * 0.5 - sin * 0.5],
                    [-sin, cos, 0.5 + sin * 0.5 - cos * 0.5]
                  ];
                }

                updatedFill = {
                  ...gradBase,
                  ...(newStops ? { gradientStops: newStops } : {}),
                  ...(newTransform ? { gradientTransform: newTransform } : {}),
                  ...(cmd.opacity !== undefined ? { opacity: cmd.opacity } : {}),
                  ...(cmd.visible !== undefined ? { visible: cmd.visible } : {})
                } as GradientPaint;
              } else if (existingFill.type === 'IMAGE') {
                const imgBase = existingFill as ImagePaint;
                updatedFill = {
                  ...imgBase,
                  ...(cmd.scaleMode ? { scaleMode: cmd.scaleMode } : {}),
                  ...(cmd.opacity !== undefined ? { opacity: cmd.opacity } : {}),
                  ...(cmd.visible !== undefined ? { visible: cmd.visible } : {})
                } as ImagePaint;
              }

              fillsArr[updateIndex] = updatedFill;
              (node as GeometryMixin).fills = fillsArr;
              success++;
              break;
            }

            case 'getVectorNetwork':
              if ('vectorNetwork' in node || node.type === 'VECTOR' || node.type === 'BOOLEAN_OPERATION') {
                const vn = (node as any).vectorNetwork;
                figma.ui.postMessage({
                  type: 'vector-network',
                  nodeId: node.id,
                  vectorNetwork: vn
                });
                success++;
              } else {
                failed++;
              }
              break;

            case 'setVectorNetwork':
              if (node.type === 'VECTOR' || node.type === 'BOOLEAN_OPERATION' || 'setVectorNetworkAsync' in node) {
                try {
                  if ('setVectorNetworkAsync' in node && typeof (node as any).setVectorNetworkAsync === 'function') {
                    await (node as any).setVectorNetworkAsync(cmd.vectorNetwork);
                  } else {
                    (node as any).vectorNetwork = cmd.vectorNetwork;
                  }
                  success++;
                } catch (error) {
                  console.error('setVectorNetwork failed', error);
                  if (!firstError) firstError = { action: cmd.action, nodeId: node.id, message: (error as Error)?.message || 'setVectorNetwork failed' };
                  failed++;
                }
              } else {
                failed++;
              }
              break;

            case 'setVectorPaths':
              if ('vectorPaths' in node) {
                try {
                  (node as any).vectorPaths = cmd.vectorPaths;
                  success++;
                } catch (error) {
                  console.error('setVectorPaths failed', error);
                  if (!firstError) firstError = { action: cmd.action, nodeId: node.id, message: (error as Error)?.message || 'setVectorPaths failed' };
                  failed++;
                }
              } else {
                failed++;
              }
              break;

            case 'delete':
              node.remove();
              success++;
              break;

            case 'ungroup':
              if (node.type === 'GROUP') {
                const parent = node.parent as ChildrenMixin;
                const children = [...(node as GroupNode).children];
                for (const child of children) {
                  parent.appendChild(child);
                }
                node.remove();
                success++;
              } else {
                failed++;
              }
              break;

            case 'flattenSingleChildGroups': {
              const shouldRecurse = (n: SceneNode) =>
                n.type !== 'COMPONENT' && n.type !== 'INSTANCE';

              const flattenChain = (group: GroupNode) => {
                let current: GroupNode | null = group;
                while (current && current.type === 'GROUP') {
                  if (current.locked) break;
                  if (current.children.length !== 1) break;
                  const parent = current.parent as ChildrenMixin | null;
                  if (!parent) break;

                  // Use Figma's native ungroup to preserve positions/constraints
                  const soleChild = current.children[0] as SceneNode;
                  try {
                    figma.ungroup(current);
                  } catch (e) {
                    // If ungroup fails (e.g., unexpected locked/instance context), stop this chain silently.
                    return;
                  }

                  // If the ungrouped child is also a single-child group, continue
                  if (soleChild.type === 'GROUP') {
                    current = soleChild;
                  } else {
                    current = null;
                  }
                }
              };

              const traverse = (n: SceneNode) => {
                if ('children' in n && shouldRecurse(n)) {
                  const snapshot = [...n.children];
                  for (const child of snapshot) {
                    traverse(child as SceneNode);
                  }
                }
                if (n.type === 'GROUP' && shouldRecurse(n)) {
                  flattenChain(n as GroupNode);
                }
              };

              traverse(node);
              success++;
              break;
            }

            case 'createComponent':
              if (node) {
                try {
                  const originalParent = node.parent;
                  const originalIndex = originalParent ? originalParent.children.indexOf(node) : -1;
                  const originalX = node.x;
                  const originalY = node.y;
                  const originalLayoutGrow = 'layoutGrow' in node ? node.layoutGrow : 0;
                  const originalLayoutAlign = 'layoutAlign' in node ? node.layoutAlign : 'INHERIT';
                  const absTransform = node.absoluteTransform;
                  const name = cmd.name || node.name;

                  // Check if node is inside an instance (cannot be moved/replaced)
                  const insideInst = isNodeInsideInstance(node);

                  const component = convertToComponentSafe(node);
                  if (cmd.name) component.name = cmd.name;
                  applySizingConstraints(component, cmd);

                  // Ensure component is moved to the Genrated Components section (orphan) if it's currently nested. 
                  // This ensures the Master Component stays outside the UI while an instance is used inside.
                  if (component.parent && component.parent.type !== 'COMPONENT_SET') {
                    moveComponentToBatchSection(component, groupOffset);
                  }

                  // Register both the original ID and the new component
                  if (node.id !== component.id) {
                    createdNodes.set(node.id, component);
                  }
                  const targetIdSearch = cmd.nodeId || cmd.refId;
                  if (targetIdSearch) {
                    createdNodes.set(targetIdSearch, component);
                  }
                  registerCreatedNode(component, cmd.refId);

                  // Replace original node with instance
                  if (!insideInst && originalParent && originalIndex !== -1 && 'insertChild' in originalParent &&
                    originalParent.type !== 'INSTANCE' && originalParent.type !== 'COMPONENT_SET' &&
                    originalParent.type !== 'PAGE' && originalParent.type !== 'SECTION') {
                    const instance = component.createInstance();
                    (originalParent as any).insertChild(originalIndex, instance);
                    instance.x = originalX;
                    instance.y = originalY;
                    if ('layoutGrow' in instance) instance.layoutGrow = originalLayoutGrow;
                    if ('layoutAlign' in instance) instance.layoutAlign = originalLayoutAlign;

                    // Ensure the original node is removed if it hasn't been already (e.g. if it was cloned)
                    // and it's not the component itself.
                    if (!node.removed && node.parent === originalParent && node.id !== component.id) {
                      try { node.remove(); } catch (e) { /* ignore */ }
                    }
                  }

                  // If user specifically wants a component set
                  if (cmd.asComponentSet) {
                    const propName = cmd.propertyName || 'State';
                    const propValue = cmd.propertyValue || 'Default';

                    // Naming component as "Prop=Value" before combineAsVariants 
                    // ensures Figma creates the property correctly.
                    component.name = `${propName}=${propValue}`;

                    const componentSet = figma.combineAsVariants([component], figma.currentPage);
                    componentSet.name = name;

                    // Apply layout to ensure it hugs contents
                    componentSet.layoutMode = 'HORIZONTAL';
                    componentSet.itemSpacing = 16;
                    const p = 24;
                    componentSet.paddingLeft = componentSet.paddingRight = componentSet.paddingTop = componentSet.paddingBottom = p;
                    componentSet.primaryAxisSizingMode = 'AUTO';
                    componentSet.counterAxisSizingMode = 'AUTO';

                    registerCreatedNode(componentSet, cmd.refId ? `${cmd.refId}_set` : undefined);

                    // Default: make icons inside the set swappable
                    await autoBindInstanceSwapProperties(componentSet, (c) => moveComponentToBatchSection(c, groupOffset));
                  } else {
                    // Default: make icons inside the component swappable
                    await autoBindInstanceSwapProperties(component, (c) => moveComponentToBatchSection(c, groupOffset));
                  }

                  success++;
                } catch (error) {
                  console.error('createComponent failed', error);
                  if (!firstError) firstError = { action: cmd.action, nodeId: node.id, message: (error as Error)?.message || 'createComponent failed' };
                  failed++;
                }
              } else {
                failed++;
              }
              break;

            case 'detachInstance':
              if (node.type === 'INSTANCE') {
                (node as InstanceNode).detachInstance();
                success++;
              } else {
                failed++;
              }
              break;

            case 'setInstanceProperties':
              if (node.type === 'INSTANCE') {
                try {
                  const properties = cmd.properties || {};

                  // Helper to normalize values (boolean to string for VARIANT properties)
                  const normalizeProperties = async (instance: InstanceNode, props: Record<string, any>) => {
                    try {
                      let mainComp: ComponentNode | null = null;
                      if ('getMainComponentAsync' in instance) {
                        mainComp = await (instance as any).getMainComponentAsync();
                      } else {
                        mainComp = (instance as any).mainComponent;
                      }

                      if (!mainComp) return props;

                      const isVariant = mainComp.parent && mainComp.parent.type === 'COMPONENT_SET';
                      const componentSet = isVariant ? mainComp.parent as ComponentSetNode : null;
                      const defs: any = isVariant
                        ? componentSet!.componentPropertyDefinitions
                        : mainComp.componentPropertyDefinitions;

                      const findPropDef = (name: string) => {
                        if (defs[name]) return { key: name, def: defs[name] };
                        const nameLower = name.toLowerCase();
                        for (const key of Object.keys(defs)) {
                          if (key.toLowerCase() === nameLower) return { key, def: defs[key] };
                          if (key.split('#')[0].toLowerCase() === nameLower) return { key, def: defs[key] };
                        }
                        // Try partial/substring match (e.g., "subject" matching "教科/subject#1:0")
                        for (const key of Object.keys(defs)) {
                          const displayName = key.split('#')[0].toLowerCase();
                          if (displayName.includes(nameLower) || nameLower.includes(displayName)) {
                            return { key, def: defs[key] };
                          }
                        }
                        return null;
                      };

                      // If the AI sends a value that matches a variant option but uses the wrong
                      // property key, try to find the right VARIANT property by its option values
                      const findVariantPropByValue = (value: string) => {
                        const valLower = String(value).toLowerCase();
                        for (const [key, def] of Object.entries(defs) as [string, any][]) {
                          if (def.type === 'VARIANT' && def.variantOptions) {
                            const match = (def.variantOptions as string[]).find(
                              (opt: string) => opt.toLowerCase() === valLower || opt === value
                            );
                            if (match) return { key, def, matchedValue: match };
                          }
                        }
                        return null;
                      };

                      const normalizedVariantProps: Record<string, string | boolean> = {};
                      const normalizedOtherProps: Record<string, any> = {};
                      const unmatchedProps: string[] = [];

                      // 1. Initial normalization and filtering
                      for (const [key, val] of Object.entries(props)) {
                        const propInfo = findPropDef(key);
                        if (!propInfo) {
                          // Fallback: if the key doesn't match a property name, check if it's a
                          // variant value — try to find which VARIANT property has this as an option
                          const valStr = String(val);
                          const variantMatch = findVariantPropByValue(valStr);
                          if (variantMatch) {
                            console.log(`setInstanceProperties: Matched value '${valStr}' to variant property '${variantMatch.key}' as '${variantMatch.matchedValue}'`);
                            normalizedVariantProps[variantMatch.key] = variantMatch.matchedValue;
                            continue;
                          }

                          // If there's only one VARIANT property, assume the AI meant that one
                          const variantDefs = Object.entries(defs).filter(([_, d]: [string, any]) => d.type === 'VARIANT');
                          if (variantDefs.length === 1) {
                            const [vKey, vDef] = variantDefs[0] as [string, any];
                            const options = (vDef.variantOptions || []) as string[];
                            const optMatch = options.find((o: string) => o.toLowerCase() === valStr.toLowerCase());
                            if (optMatch) {
                              console.log(`setInstanceProperties: Single variant property '${vKey}', matched value '${optMatch}'`);
                              normalizedVariantProps[vKey] = optMatch;
                              continue;
                            }
                          }

                          unmatchedProps.push(key);
                          console.warn(`setInstanceProperties: Property '${key}' not found in component definitions. Available: [${Object.keys(defs).map(k => k.split('#')[0]).join(', ')}]`);
                          continue;
                        }

                        const { key: actualKey, def } = propInfo;

                        if (def.type === 'VARIANT') {
                          const options = (def.variantOptions || []) as string[];
                          const valStr = String(val).toLowerCase();
                          const match = options.find((o: string) =>
                            o.toLowerCase() === valStr ||
                            (val === true && (o.toLowerCase() === 'on' || o.toLowerCase() === 'yes' || o.toLowerCase() === 'true')) ||
                            (val === false && (o.toLowerCase() === 'off' || o.toLowerCase() === 'no' || o.toLowerCase() === 'false')) ||
                            (valStr === 'true' && (o.toLowerCase() === 'on' || o.toLowerCase() === 'yes')) ||
                            (valStr === 'false' && (o.toLowerCase() === 'off' || o.toLowerCase() === 'no'))
                          );
                          normalizedVariantProps[actualKey] = match || String(val);
                        } else if (def.type === 'BOOLEAN') {
                          normalizedOtherProps[actualKey] = (val === true || val === 'true' || val === 'On' || val === 'Yes' || String(val).toLowerCase() === 'true' || String(val).toLowerCase() === 'on');
                        } else {
                          normalizedOtherProps[actualKey] = val;
                        }
                      }

                      // 2. For variants, ensure the combo exists and find closest match for variant properties
                      if (isVariant && componentSet) {
                        const currentVariantProps = instance.variantProperties || {};
                        const targetVariantCombo = { ...currentVariantProps, ...normalizedVariantProps };

                        // Try to find if this combination exists in the set
                        const variants = componentSet.children.filter(c => c.type === 'COMPONENT') as ComponentNode[];
                        const exists = variants.some(v => {
                          const vProps: any = {};
                          v.name.split(',').forEach(p => {
                            const [k, val] = p.split('=').map(s => s.trim());
                            if (k && val) vProps[k] = val;
                          });
                          return Object.keys(targetVariantCombo).every(k => vProps[k] === targetVariantCombo[k]);
                        });

                        if (!exists) {
                          console.warn('Variant combo does not exist, finding closest match for variant props');
                          let bestVariant = variants[0];
                          let maxMatches = -1;

                          for (const v of variants) {
                            const vProps: any = {};
                            v.name.split(',').forEach(p => {
                              const [k, val] = p.split('=').map(s => s.trim());
                              if (k && val) vProps[k] = val;
                            });

                            let score = 0;
                            // Match properties the user/AI actually sent (high priority)
                            for (const k of Object.keys(normalizedVariantProps)) {
                              if (vProps[k] === (normalizedVariantProps as any)[k]) score += 10;
                            }
                            // Match remaining variant properties to keep state (low priority)
                            for (const k of Object.keys(currentVariantProps)) {
                              if (!normalizedVariantProps[k] && vProps[k] === currentVariantProps[k]) score += 1;
                            }

                            if (score > maxMatches) {
                              maxMatches = score;
                              bestVariant = v;
                            }
                          }

                          // Return all properties from the best matching variant + other properties
                          const finalProps: Record<string, any> = { ...normalizedOtherProps };
                          bestVariant.name.split(',').forEach(p => {
                            const [k, val] = p.split('=').map(s => s.trim());
                            if (k && val) finalProps[k] = val;
                          });
                          return finalProps;
                        } else {
                          // Combination exists, return merged variant and other props
                          return { ...normalizedVariantProps, ...normalizedOtherProps };
                        }
                      }

                      return { ...normalizedVariantProps, ...normalizedOtherProps };
                    } catch (e) {
                      console.warn('Normalization failed', e);
                      return props;
                    }
                  };

                  const normalizedProperties = await normalizeProperties(node as InstanceNode, properties);
                  const propKeys = Object.keys(normalizedProperties);
                  if (propKeys.length === 0 && Object.keys(properties).length > 0) {
                    // All properties were dropped during normalization — this is effectively a no-op
                    console.warn('setInstanceProperties: All properties were dropped during normalization — none matched component definitions.');
                    if (!firstError) firstError = {
                      action: cmd.action,
                      nodeId: node.id,
                      message: `No matching properties found. Sent: [${Object.keys(properties).join(', ')}]. Check property names match the component definition.`
                    };
                    failed++;
                  } else {
                    (node as InstanceNode).setProperties(normalizedProperties);
                    success++;
                  }
                } catch (error) {
                  console.error('setInstanceProperties failed', error);
                  if (!firstError) firstError = { action: cmd.action, nodeId: node.id, message: (error as Error)?.message || 'setInstanceProperties failed' };
                  failed++;
                }
              } else {
                if (!firstError) firstError = { action: cmd.action, nodeId: node.id, message: 'Node is not an instance' };
                failed++;
              }
              break;

            case 'createComponentSet': {
              try {
                const variants = cmd.variants || [];
                const variantSpecs: { node: SceneNode; properties: { [key: string]: string } }[] = [];

                for (const v of variants) {
                  const vNode = await resolveNodeSmart(v.nodeId) as SceneNode | null;
                  if (vNode) {
                    variantSpecs.push({ node: vNode, properties: v.properties || {} });
                  }
                }

                if (variantSpecs.length === 0) {
                  // If we didn't find any nodes, but the user says it's done correctly,
                  // maybe the refId itself is already a component set created by a previous command.
                  if (cmd.refId && createdNodes.has(cmd.refId)) {
                    const existing = createdNodes.get(cmd.refId);
                    if (existing && (existing.type === 'COMPONENT_SET' || existing.type === 'COMPONENT')) {
                      console.log('Component/Set already exists for refId:', cmd.refId);
                      success++;
                      break;
                    }
                  }
                  throw new Error('No valid variants provided for component set');
                }

                const layoutOpts = cmd.layout || {};
                const componentSet = await createComponentSetHelper(cmd.name || 'Component Set', variantSpecs, layoutOpts, (c) => moveComponentToBatchSection(c, groupOffset));
                registerCreatedNode(componentSet, cmd.refId);

                // Update createdNodesByName for variant nodes that were converted to components.
                // createComponentSetHelper updates persistentCreatedNodes but not the local name map.
                for (const [nameKey, nameVal] of createdNodesByName.entries()) {
                  if (nameVal && 'removed' in nameVal && (nameVal as any).removed) {
                    const updated = createdNodes.get(nameKey) || createdNodes.get((nameVal as any).id);
                    if (updated && !(updated as any).removed) {
                      createdNodesByName.set(nameKey, updated);
                    }
                  }
                }

                // Arrange variants in a property-aware grid when WRAP layout is requested.
                // Parses variant names ("State=Normal, Layout=Vertical") to determine
                // a logical column axis and row axis, mirroring the Button quick action.
                if (layoutOpts.layoutWrap === 'WRAP' && componentSet.children.length > 1) {
                  const gapX = layoutOpts.itemSpacing ?? 32;
                  const gapY = layoutOpts.counterAxisSpacing ?? 32;
                  const gridPadding = layoutOpts.padding ?? 40;
                  const children = componentSet.children as ComponentNode[];

                  // Parse each variant's property map from its name
                  const childProps: { [key: string]: string }[] = children.map(c => {
                    const map: { [key: string]: string } = {};
                    c.name.split(',').forEach(part => {
                      const [k, v] = part.split('=').map(s => s.trim());
                      if (k && v) map[k] = v;
                    });
                    return map;
                  });

                  // Collect all property names and their unique ordered values
                  const propValues = new Map<string, string[]>();
                  for (const pm of childProps) {
                    for (const [k, v] of Object.entries(pm)) {
                      if (!propValues.has(k)) propValues.set(k, []);
                      const arr = propValues.get(k)!;
                      if (!arr.includes(v)) arr.push(v);
                    }
                  }

                  // Pick the column axis: prefer "State", else the property with the most values
                  const propNames = Array.from(propValues.keys());
                  let colProp = propNames.find(p => p.toLowerCase() === 'state') || propNames[0];
                  if (!colProp) colProp = propNames[0];

                  const colValues = propValues.get(colProp) || [];
                  const rowProps = propNames.filter(p => p !== colProp);

                  // Build unique row keys from the cross-product of remaining properties
                  const rowKeys: string[] = [];
                  const childRowKey = (pm: { [key: string]: string }) =>
                    rowProps.map(p => pm[p] || '').join('|');
                  for (const pm of childProps) {
                    const rk = childRowKey(pm);
                    if (!rowKeys.includes(rk)) rowKeys.push(rk);
                  }

                  const numCols = colValues.length || 1;
                  const numRows = rowKeys.length || 1;

                  // Build a 2D grid mapping [row][col] → child index
                  const grid: (number | null)[][] = Array.from({ length: numRows }, () =>
                    new Array(numCols).fill(null));
                  for (let i = 0; i < children.length; i++) {
                    const pm = childProps[i];
                    const ci = colValues.indexOf(pm[colProp]);
                    const ri = rowKeys.indexOf(childRowKey(pm));
                    if (ci >= 0 && ri >= 0) grid[ri][ci] = i;
                  }

                  // Measure column widths and row heights
                  const colWidths: number[] = new Array(numCols).fill(0);
                  const rowHeights: number[] = new Array(numRows).fill(0);
                  for (let r = 0; r < numRows; r++) {
                    for (let c = 0; c < numCols; c++) {
                      const idx = grid[r][c];
                      if (idx !== null) {
                        if (children[idx].width > colWidths[c]) colWidths[c] = children[idx].width;
                        if (children[idx].height > rowHeights[r]) rowHeights[r] = children[idx].height;
                      }
                    }
                  }

                  componentSet.layoutMode = 'NONE';
                  for (let r = 0; r < numRows; r++) {
                    for (let c = 0; c < numCols; c++) {
                      const idx = grid[r][c];
                      if (idx === null) continue;
                      let x = gridPadding;
                      for (let cc = 0; cc < c; cc++) x += colWidths[cc] + gapX;
                      let y = gridPadding;
                      for (let rr = 0; rr < r; rr++) y += rowHeights[rr] + gapY;
                      children[idx].x = x;
                      children[idx].y = y;
                    }
                  }

                  const totalWidth = colWidths.reduce((a, b) => a + b, 0) + gapX * Math.max(0, numCols - 1) + gridPadding * 2;
                  const totalHeight = rowHeights.reduce((a, b) => a + b, 0) + gapY * Math.max(0, numRows - 1) + gridPadding * 2;
                  componentSet.resize(totalWidth, totalHeight);
                }

                await appendToParent(componentSet, cmd, variantSpecs.length > 0 ? { width: componentSet.width, height: componentSet.height } : undefined);

                figma.currentPage.selection = [componentSet];
                success++;
              } catch (error) {
                console.error('createComponentSet failed', error);
                if (!firstError) firstError = { action: cmd.action, message: (error as Error)?.message || 'createComponentSet failed' };
                failed++;
              }
              break;
            }

            case 'addVariant': {
              if (node.type === 'COMPONENT_SET') {
                try {
                  const componentSet = node as ComponentSetNode;
                  const baseVariantId = cmd.baseVariantId;
                  let baseVariant: ComponentNode | null = null;

                  if (baseVariantId) {
                    baseVariant = await figma.getNodeByIdAsync(baseVariantId) as ComponentNode;
                  }

                  if (!baseVariant || baseVariant.parent !== componentSet) {
                    baseVariant = componentSet.children[0] as ComponentNode;
                  }

                  // 1. Start with base variant properties
                  const mergedProperties = { ...baseVariant.variantProperties };

                  // 2. Apply AI requested overrides
                  const overrides = cmd.properties || {};
                  for (const [key, value] of Object.entries(overrides)) {
                    mergedProperties[key] = String(value);
                  }

                  // 3. Ensure we have all properties defined in the component set
                  // Variant property names are the keys in componentPropertyDefinitions with type 'VARIANT'
                  const variantPropNames = Object.entries(componentSet.componentPropertyDefinitions)
                    .filter(([_, def]) => def.type === 'VARIANT')
                    .map(([name, _]) => name);

                  // Filter merged properties to only include valid variant properties
                  const finalProperties: { [key: string]: string } = {};
                  for (const name of variantPropNames) {
                    finalProperties[name] = mergedProperties[name] || "";
                  }

                  // 4. Check for uniqueness: compare finalProperties against existing children's variantProperties
                  const isDuplicate = componentSet.children.some(child => {
                    if (child.type !== 'COMPONENT') return false;
                    const childProps = child.variantProperties;
                    if (!childProps) return false;

                    // Check if all variant property keys and values match
                    return variantPropNames.every(name => childProps[name] === finalProperties[name]);
                  });

                  if (isDuplicate) {
                    const propString = Object.entries(finalProperties).map(([k, v]) => `${k}=${v}`).join(', ');
                    throw new Error(`Variant with properties [${propString}] already exists in the set.`);
                  }

                  // 5. Clone and apply
                  const newVariant = baseVariant.clone();
                  componentSet.appendChild(newVariant);

                  // Positioning for non-auto-layout component sets
                  if (componentSet.layoutMode === 'NONE') {
                    // Find a good spot: right of the base variant if possible
                    newVariant.x = baseVariant.x + baseVariant.width + 20;
                    newVariant.y = baseVariant.y;

                    // Check if there's already something there (optional but good)
                    const existingAtPos = componentSet.children.find(c =>
                      c !== newVariant &&
                      Math.abs(c.x - newVariant.x) < 5 &&
                      Math.abs(c.y - newVariant.y) < 5
                    );

                    if (existingAtPos) {
                      // If spot is taken, try to find the max X in the current row or just offset further
                      let maxX = -Infinity;
                      for (const child of componentSet.children) {
                        if (child === newVariant) continue;
                        if (Math.abs(child.y - baseVariant.y) < 10) {
                          maxX = Math.max(maxX, child.x + child.width);
                        }
                      }
                      newVariant.x = maxX + 20;
                    }
                  }

                  // Update the name using Figma's required "Prop1=Val1, Prop2=Val2" format
                  const nameParts = Object.entries(finalProperties).map(([k, v]) => `${k}=${v}`);
                  newVariant.name = nameParts.join(', ');

                  // 6. Apply visual overrides if provided
                  if (cmd.fills && typeof cmd.fills === 'string' && 'fills' in newVariant) {
                    const fillColor = parseHexColor(cmd.fills);
                    (newVariant as any).fills = [{ type: 'SOLID', color: { r: fillColor.r, g: fillColor.g, b: fillColor.b } }];
                  }
                  if (cmd.strokes && typeof cmd.strokes === 'string' && 'strokes' in newVariant) {
                    const color = parseHexColor(cmd.strokes);
                    (newVariant as any).strokes = [{ type: 'SOLID', color: { r: color.r, g: color.g, b: color.b } }];
                  }

                  // Map-based overrides for children: { "fillsMap": { "Background": "#FF0000", "Accent": "#CC0000" } }
                  if (cmd.fillsMap && typeof cmd.fillsMap === 'object') {
                    const allGeom = (newVariant as any).findAll((n: any) => 'fills' in n) as any[];
                    for (const [nodeName, colorHex] of Object.entries(cmd.fillsMap)) {
                      const target = allGeom.find(n => (n as any).name === nodeName || (n as any).name.toLowerCase() === nodeName.toLowerCase());
                      if (target) {
                        const c = parseHexColor(String(colorHex));
                        target.fills = [{ type: 'SOLID', color: { r: c.r, g: c.g, b: c.b } }];
                      }
                    }
                  }
                  if (cmd.strokesMap && typeof cmd.strokesMap === 'object') {
                    const allGeom = (newVariant as any).findAll((n: any) => 'strokes' in n) as any[];
                    for (const [nodeName, colorHex] of Object.entries(cmd.strokesMap)) {
                      const target = allGeom.find(n => (n as any).name === nodeName || (n as any).name.toLowerCase() === nodeName.toLowerCase());
                      if (target) {
                        const c = parseHexColor(String(colorHex));
                        target.strokes = [{ type: 'SOLID', color: { r: c.r, g: c.g, b: c.b } }];
                      }
                    }
                  }

                  if (cmd.opacity !== undefined && 'opacity' in newVariant) {
                    (newVariant as any).opacity = cmd.opacity;
                  }
                  if (cmd.cornerRadius !== undefined && 'cornerRadius' in newVariant) {
                    (newVariant as any).cornerRadius = cmd.cornerRadius;
                  }
                  // Override text content in the variant
                  if ('findAll' in newVariant) {
                    const allTextNodes = (newVariant as any).findAll((n: any) => n.type === 'TEXT') as TextNode[];

                    // "text" → update only the PRIMARY text node (largest font size)
                    if (cmd.text && allTextNodes.length > 0) {
                      let primaryText = allTextNodes[0];
                      let maxFontSize = 0;
                      for (const tn of allTextNodes) {
                        const fs = typeof tn.fontSize === 'number' ? tn.fontSize : 0;
                        if (fs > maxFontSize) {
                          maxFontSize = fs;
                          primaryText = tn;
                        }
                      }
                      try {
                        await loadAllFontsForTextNode(primaryText);
                        primaryText.characters = cmd.text;
                      } catch (e) { /* skip if can't update */ }
                    }

                    // "texts" → targeted updates by node name: { "Label": "生活", "Reading": "せいかつ" }
                    if (cmd.texts && typeof cmd.texts === 'object') {
                      for (const [nodeName, textValue] of Object.entries(cmd.texts)) {
                        const target = allTextNodes.find(tn => tn.name === nodeName || tn.name.toLowerCase() === nodeName.toLowerCase());
                        if (target) {
                          try {
                            await loadAllFontsForTextNode(target);
                            target.characters = String(textValue);
                          } catch (e) { /* skip if can't update */ }
                        }
                      }
                    }
                  }

                  success++;
                } catch (error) {
                  console.error('addVariant failed', error);
                  if (!firstError) firstError = { action: cmd.action, nodeId: node.id, message: (error as Error)?.message || 'addVariant failed' };
                  failed++;
                }
              } else {
                if (!firstError) firstError = { action: cmd.action, nodeId: node.id, message: 'Node is not a component set' };
                failed++;
              }
              break;
            }

            case 'editComponentProperty': {
              // Walk up the parent chain to find the enclosing component or component set
              let compNode: ComponentNode | ComponentSetNode | null = null;
              let walkNode: BaseNode | null = node;
              while (walkNode) {
                if (walkNode.type === 'COMPONENT' || walkNode.type === 'COMPONENT_SET') {
                  compNode = walkNode as ComponentNode | ComponentSetNode;
                  break;
                }
                walkNode = walkNode.parent;
              }

              // If we found a COMPONENT that is a variant inside a COMPONENT_SET,
              // prefer the COMPONENT_SET since property definitions live there
              // (VARIANT properties can ONLY be edited on the set, and BOOLEAN/TEXT/INSTANCE_SWAP
              // properties are typically defined at the set level too)
              if (compNode && compNode.type === 'COMPONENT' && compNode.parent && compNode.parent.type === 'COMPONENT_SET') {
                compNode = compNode.parent as ComponentSetNode;
              }

              if (compNode) {
                try {
                  const component = compNode;
                  const propertyName = cmd.propertyName;
                  const newName = cmd.newName;
                  const defaultValue = cmd.defaultValue;
                  const type = cmd.type; // VARIANT, TEXT, BOOLEAN, INSTANCE_SWAP
                  const action = cmd.propertyAction || 'edit'; // edit, add, remove

                  // Resolve display name to full property key (e.g. "カスタム" -> "カスタム#1:0")
                  // Figma's API requires the exact key from componentPropertyDefinitions
                  const resolvePropertyKey = (name: string, comp: ComponentNode | ComponentSetNode): string => {
                    const defs = comp.componentPropertyDefinitions;
                    // Exact match first
                    if (defs[name]) return name;
                    // Try matching by display name (before #)
                    for (const key of Object.keys(defs)) {
                      if (key.split('#')[0] === name) return key;
                    }
                    // Case-insensitive fallback
                    const nameLower = name.toLowerCase();
                    for (const key of Object.keys(defs)) {
                      if (key.split('#')[0].toLowerCase() === nameLower) return key;
                      if (key.toLowerCase() === nameLower) return key;
                    }
                    return name; // Return as-is if no match found
                  };

                  if (action === 'add') {
                    if (type && propertyName) {
                      // Check if a property with this name already exists to avoid duplicates
                      const existingKey = resolvePropertyKey(propertyName, component);
                      const defs = component.componentPropertyDefinitions;
                      if (existingKey !== propertyName || defs[existingKey]) {
                        // Property already exists — skip adding, just succeed silently
                        console.log(`editComponentProperty: Property '${propertyName}' already exists as '${existingKey}', skipping add.`);
                      } else {
                        component.addComponentProperty(propertyName, type, defaultValue);
                      }
                    }
                  } else if (action === 'remove' && propertyName) {
                    const fullKey = resolvePropertyKey(propertyName, component);
                    component.deleteComponentProperty(fullKey);
                  } else if (action === 'edit' && propertyName) {
                    const fullKey = resolvePropertyKey(propertyName, component);
                    const updates: any = {};
                    if (newName) updates.name = newName;
                    if (defaultValue !== undefined) updates.defaultValue = defaultValue;
                    component.editComponentProperty(fullKey, updates);
                  }

                  success++;
                } catch (error) {
                  console.error('editComponentProperty failed', error);
                  if (!firstError) firstError = { action: cmd.action, nodeId: node.id, message: (error as Error)?.message || 'editComponentProperty failed' };
                  failed++;
                }
              } else {
                if (!firstError) firstError = { action: cmd.action, nodeId: node.id, message: 'Node is not inside a component or component set' };
                failed++;
              }
              break;
            }

            case 'bindComponentProperty': {
              try {
                // 1. Find the main component
                let mainComp: ComponentNode | ComponentSetNode | null = null;
                let appNode = node;
                while (appNode) {
                  if (appNode.type === 'COMPONENT' || appNode.type === 'COMPONENT_SET') {
                    mainComp = appNode as ComponentNode | ComponentSetNode;
                    break;
                  }
                  appNode = appNode.parent as SceneNode;
                }

                // If we found a variant COMPONENT inside a COMPONENT_SET,
                // escalate to the COMPONENT_SET since property definitions live there
                // (Figma throws "Can only get component property definitions of a component set
                // or non-variant component" if you access definitions on a variant component)
                if (mainComp && mainComp.type === 'COMPONENT' && mainComp.parent && mainComp.parent.type === 'COMPONENT_SET') {
                  mainComp = mainComp.parent as ComponentSetNode;
                }

                if (!mainComp) {
                  throw new Error('Node must be inside a Component or Component Set to bind properties.');
                }

                const propertyName = cmd.propertyName;
                const bindType = cmd.bindType; // 'visible', 'characters', 'mainComponent' (for instance swap)

                // 2. Find the property ID by name
                const defs = mainComp.componentPropertyDefinitions;
                let propertyId: string | null = null;

                // Exact match first
                if (defs[propertyName]) {
                  propertyId = propertyName;
                }

                // Try matching by display name (before #)
                if (!propertyId) {
                  for (const key of Object.keys(defs)) {
                    const namePart = key.split('#')[0];
                    if (namePart === propertyName) {
                      propertyId = key;
                      break;
                    }
                  }
                }

                // Case-insensitive fallback
                if (!propertyId) {
                  const nameLower = propertyName.toLowerCase();
                  for (const key of Object.keys(defs)) {
                    if (key.split('#')[0].toLowerCase() === nameLower) {
                      propertyId = key;
                      break;
                    }
                  }
                }

                // 2b. If property doesn't exist, auto-create it based on bindType
                // This handles multi-component scenarios where the AI only sends an explicit
                // 'add' for one component but binds across multiple components
                if (!propertyId) {
                  let propType: ComponentPropertyType | null = null;
                  let propDefault: string | boolean = true;
                  if (bindType === 'visible') {
                    propType = 'BOOLEAN';
                    propDefault = true;
                  } else if (bindType === 'text' || bindType === 'characters') {
                    propType = 'TEXT';
                    propDefault = '';
                  } else if (bindType === 'instance' || bindType === 'mainComponent') {
                    propType = 'INSTANCE_SWAP';
                    // For instance swap, default must be a valid node ID; use the current node's mainComponent if available
                    propDefault = (node as any).mainComponent?.id || '';
                  }

                  if (propType) {
                    console.log(`bindComponentProperty: Property '${propertyName}' not found, auto-creating as ${propType}`);
                    const newKey = mainComp.addComponentProperty(propertyName, propType, propDefault);
                    propertyId = newKey;
                  } else {
                    throw new Error(`Property '${propertyName}' not found on component and could not auto-create for bindType '${bindType}'.`);
                  }
                }

                // 3. Determine the correct bind target.
                // Figma doesn't allow setting componentPropertyReferences on instance sublayers.
                // If the node is inside an instance that is inside the component, we need to
                // bind on the instance node itself, not the sublayer.
                let bindTarget: SceneNode = node;
                {
                  // Walk from node up to mainComp. If we encounter an INSTANCE node
                  // before reaching the component, use the INSTANCE as the bind target.
                  let check: BaseNode | null = node;
                  while (check && check !== mainComp) {
                    if (check.type === 'INSTANCE') {
                      bindTarget = check as InstanceNode;
                      break;
                    }
                    check = check.parent;
                  }
                }

                const targetNode = bindTarget as any;
                const currentRefs = targetNode.componentPropertyReferences || {};

                if (bindType === 'visible') {
                  targetNode.componentPropertyReferences = { ...currentRefs, visible: propertyId };
                } else if (bindType === 'text' || bindType === 'characters') {
                  // For text binding, prefer the original node if it's a TEXT node
                  // and is a direct child of the component (not an instance sublayer)
                  if (node.type === 'TEXT' && bindTarget !== node) {
                    // The text node is inside an instance — bind visibility on the instance instead
                    // since we can't bind characters on instance sublayers
                    console.log('bindComponentProperty: Text node is inside an instance, binding visible on instance instead');
                    targetNode.componentPropertyReferences = { ...currentRefs, visible: propertyId };
                  } else {
                    targetNode.componentPropertyReferences = { ...currentRefs, characters: propertyId };
                  }
                } else if (bindType === 'instance' || bindType === 'mainComponent') {
                  targetNode.componentPropertyReferences = { ...currentRefs, mainComponent: propertyId };
                } else {
                  // Generic fallback if we support other properties in future
                  targetNode.componentPropertyReferences = { ...currentRefs, [bindType]: propertyId };
                }

                success++;
              } catch (error) {
                console.error('bindComponentProperty failed', error);
                if (!firstError) firstError = { action: cmd.action, nodeId: node.id, message: (error as Error)?.message || 'bindComponentProperty failed' };
                failed++;
              }
              break;
            }

            case 'setCornerRadius':
              if ('cornerRadius' in node) {
                (node as RectangleNode).cornerRadius = cmd.radius || 0;
                success++;
              } else {
                failed++;
              }
              break;

            case 'setIndividualCornerRadius':
              if ('topLeftRadius' in node) {
                const cornerNode = node as RectangleNode | FrameNode;
                if (cmd.topLeft !== undefined) cornerNode.topLeftRadius = cmd.topLeft;
                if (cmd.topRight !== undefined) cornerNode.topRightRadius = cmd.topRight;
                if (cmd.bottomLeft !== undefined) cornerNode.bottomLeftRadius = cmd.bottomLeft;
                if (cmd.bottomRight !== undefined) cornerNode.bottomRightRadius = cmd.bottomRight;
                success++;
              } else {
                failed++;
              }
              break;

            case 'setClipsContent':
              if ('clipsContent' in node) {
                (node as FrameNode).clipsContent = cmd.clipsContent !== undefined ? cmd.clipsContent : true;
                success++;
              } else {
                failed++;
              }
              break;

            case 'addShadow':
              if ('effects' in node) {
                const color = parseHexColor(cmd.color || '#00000040');
                const shadow: DropShadowEffect = {
                  type: 'DROP_SHADOW',
                  color: { r: color.r, g: color.g, b: color.b, a: color.a },
                  offset: { x: cmd.offsetX || 0, y: cmd.offsetY || 4 },
                  radius: cmd.blur || 8,
                  spread: cmd.spread || 0,
                  visible: true,
                  blendMode: 'NORMAL'
                };
                (node as BlendMixin).effects = [...(node as BlendMixin).effects, shadow];
                success++;
              } else {
                failed++;
              }
              break;

            case 'addInnerShadow':
              if ('effects' in node) {
                const innerColor = parseHexColor(cmd.color || '#00000040');
                const innerShadow: InnerShadowEffect = {
                  type: 'INNER_SHADOW',
                  color: { r: innerColor.r, g: innerColor.g, b: innerColor.b, a: innerColor.a },
                  offset: { x: cmd.offsetX || 0, y: cmd.offsetY || 4 },
                  radius: cmd.blur || 8,
                  spread: cmd.spread || 0,
                  visible: true,
                  blendMode: 'NORMAL'
                };
                (node as BlendMixin).effects = [...(node as BlendMixin).effects, innerShadow];
                success++;
              } else {
                failed++;
              }
              break;

            case 'addLayerBlur':
              if ('effects' in node) {
                const layerBlur = {
                  type: 'LAYER_BLUR',
                  radius: cmd.radius || 10,
                  visible: true
                } as Effect;
                (node as BlendMixin).effects = [...(node as BlendMixin).effects, layerBlur];
                success++;
              } else {
                failed++;
              }
              break;

            case 'addBackgroundBlur':
              if ('effects' in node) {
                const bgBlur = {
                  type: 'BACKGROUND_BLUR',
                  radius: cmd.radius || 10,
                  visible: true
                } as Effect;
                (node as BlendMixin).effects = [...(node as BlendMixin).effects, bgBlur];
                success++;
              } else {
                failed++;
              }
              break;

            case 'clearEffects':
              {
                const cleared = clearEffectsDeep(node as SceneNode);
                if (cleared > 0) {
                  success += cleared;
                } else {
                  failed++;
                }
              }
              break;

            case 'setOpacity':
              if ('opacity' in node) {
                (node as BlendMixin).opacity = cmd.opacity;
                success++;
              } else {
                failed++;
              }
              break;

            case 'setBlendMode':
              if ('blendMode' in node) {
                // Supported: PASS_THROUGH, NORMAL, DARKEN, MULTIPLY, LINEAR_BURN, COLOR_BURN,
                // LIGHTEN, SCREEN, LINEAR_DODGE, COLOR_DODGE, OVERLAY, SOFT_LIGHT, HARD_LIGHT,
                // DIFFERENCE, EXCLUSION, HUE, SATURATION, COLOR, LUMINOSITY
                (node as BlendMixin).blendMode = cmd.mode || 'PASS_THROUGH';
                success++;
              } else {
                failed++;
              }
              break;

            case 'setStroke':
              if ('strokes' in node) {
                const color = parseHexColor(cmd.color || '#000000');
                const stroke: SolidPaint = {
                  type: 'SOLID',
                  color: { r: color.r, g: color.g, b: color.b }
                };
                (node as GeometryMixin).strokes = [stroke];
                if ('strokeWeight' in node && cmd.weight !== undefined) {
                  (node as GeometryMixin).strokeWeight = cmd.weight;
                }
                success++;
              } else {
                failed++;
              }
              break;

            case 'setStrokeStyle':
              if ('strokeStyleId' in node) {
                const styleId = cmd.styleId || cmd.id || cmd.paintStyleId;
                if (!styleId || typeof styleId !== 'string') {
                  failed++;
                  break;
                }
                try {
                  if ('setStrokeStyleIdAsync' in node && typeof (node as any).setStrokeStyleIdAsync === 'function') {
                    await (node as any).setStrokeStyleIdAsync(styleId);
                  } else {
                    (node as any).strokeStyleId = styleId;
                  }
                  success++;
                } catch (error) {
                  console.error('setStrokeStyle failed', error);
                  if (!firstError) firstError = { action: cmd.action, nodeId: node.id, message: (error as Error)?.message || 'setStrokeStyle failed' };
                  failed++;
                }
              } else {
                failed++;
              }
              break;

            case 'setEffectStyle':
              if ('effectStyleId' in node) {
                const styleId = cmd.styleId || cmd.id || cmd.effectStyleId;
                if (!styleId || typeof styleId !== 'string') {
                  failed++;
                  break;
                }
                try {
                  if ('setEffectStyleIdAsync' in node && typeof (node as any).setEffectStyleIdAsync === 'function') {
                    await (node as any).setEffectStyleIdAsync(styleId);
                  } else {
                    (node as any).effectStyleId = styleId;
                  }
                  success++;
                } catch (err) {
                  console.warn(`setEffectStyle failed for ${styleId}`, err);
                  if (!firstError) firstError = { action: cmd.action, nodeId: node.id, message: `setEffectStyle failed for ${styleId}: ${(err as Error)?.message || 'Unknown error'}` };
                  failed++;
                }
              } else {
                failed++;
              }
              break;

            case 'setGridStyle':
              if ('gridStyleId' in node) {
                const styleId = cmd.styleId || cmd.id || cmd.gridStyleId;
                if (!styleId || typeof styleId !== 'string') {
                  failed++;
                  break;
                }
                try {
                  if ('setGridStyleIdAsync' in node && typeof (node as any).setGridStyleIdAsync === 'function') {
                    await (node as any).setGridStyleIdAsync(styleId);
                  } else {
                    (node as any).gridStyleId = styleId;
                  }
                  success++;
                } catch (err) {
                  console.warn(`setGridStyle failed for ${styleId}`, err);
                  if (!firstError) firstError = { action: cmd.action, nodeId: node.id, message: `setGridStyle failed for ${styleId}: ${(err as Error)?.message || 'Unknown error'}` };
                  failed++;
                }
              } else {
                failed++;
              }
              break;

            case 'setStrokeOptions':
              if ('strokes' in node) {
                const geomNode = node as GeometryMixin;
                if (cmd.align) geomNode.strokeAlign = cmd.align; // INSIDE, OUTSIDE, CENTER
                if (cmd.cap) geomNode.strokeCap = cmd.cap; // NONE, ROUND, SQUARE, ARROW_LINES, ARROW_EQUILATERAL
                if (cmd.join) geomNode.strokeJoin = cmd.join; // MITER, BEVEL, ROUND
                if (cmd.dashPattern) geomNode.dashPattern = cmd.dashPattern; // e.g., [5, 5]
                if (cmd.miterLimit) geomNode.strokeMiterLimit = cmd.miterLimit;
                success++;
              } else {
                failed++;
              }
              break;

            // === Stroke Stack Management ===

            case 'addStroke': {
              // Append a stroke to the existing stroke stack without replacing existing strokes.
              // Supports: SOLID, GRADIENT_LINEAR, GRADIENT_RADIAL, GRADIENT_ANGULAR, GRADIENT_DIAMOND.
              // Optional "index" to insert at a specific position (0-based). Omit to append at end.
              if (!('strokes' in node)) {
                failed++;
                break;
              }

              const currentStrokes = (node as GeometryMixin).strokes;
              const strokesArr = Array.isArray(currentStrokes) ? [...currentStrokes] : [];
              let newStroke: Paint | null = null;

              const strokeType: string = (cmd.type || 'SOLID').toUpperCase();

              if (strokeType === 'SOLID') {
                const c = parseHexColor(cmd.color || '#000000');
                newStroke = {
                  type: 'SOLID',
                  color: { r: c.r, g: c.g, b: c.b },
                  opacity: cmd.opacity !== undefined ? cmd.opacity : c.a,
                  visible: cmd.visible !== undefined ? cmd.visible : true
                } as SolidPaint;
              } else if (strokeType === 'GRADIENT_LINEAR' || strokeType === 'GRADIENT_RADIAL' ||
                strokeType === 'GRADIENT_ANGULAR' || strokeType === 'GRADIENT_DIAMOND') {
                const stops = (cmd.stops || []).map((stop: { color: string, position: number, opacity?: number }) => {
                  const c = parseHexColor(stop.color);
                  return {
                    color: { r: c.r, g: c.g, b: c.b, a: stop.opacity !== undefined ? stop.opacity : c.a },
                    position: stop.position
                  };
                });

                if (stops.length < 2) {
                  if (!firstError) firstError = { action: cmd.action, nodeId: node.id, message: 'Gradient stroke requires at least 2 stops' };
                  failed++;
                  break;
                }

                let gradientTransform: Transform = [[1, 0, 0], [0, 1, 0]];
                if (strokeType === 'GRADIENT_LINEAR' && cmd.angle !== undefined) {
                  const radians = (cmd.angle * Math.PI) / 180;
                  const cos = Math.cos(radians);
                  const sin = Math.sin(radians);
                  gradientTransform = [
                    [cos, sin, 0.5 - cos * 0.5 - sin * 0.5],
                    [-sin, cos, 0.5 + sin * 0.5 - cos * 0.5]
                  ];
                }

                newStroke = {
                  type: strokeType as 'GRADIENT_LINEAR' | 'GRADIENT_RADIAL' | 'GRADIENT_ANGULAR' | 'GRADIENT_DIAMOND',
                  gradientStops: stops,
                  gradientTransform,
                  visible: cmd.visible !== undefined ? cmd.visible : true
                } as GradientPaint;
              } else {
                if (!firstError) firstError = { action: cmd.action, nodeId: node.id, message: `Unsupported stroke type: ${strokeType}. Use SOLID, GRADIENT_LINEAR, GRADIENT_RADIAL, GRADIENT_ANGULAR, or GRADIENT_DIAMOND.` };
                failed++;
                break;
              }

              if (newStroke) {
                const insertIndex = cmd.index !== undefined ? Math.max(0, Math.min(strokesArr.length, cmd.index)) : strokesArr.length;
                strokesArr.splice(insertIndex, 0, newStroke);
                (node as GeometryMixin).strokes = strokesArr;
                // Optionally set stroke weight if provided alongside addStroke
                if (cmd.weight !== undefined && 'strokeWeight' in node) {
                  (node as GeometryMixin).strokeWeight = cmd.weight;
                }
                success++;
              } else {
                failed++;
              }
              break;
            }

            case 'removeStroke': {
              // Remove a stroke by index from the stroke stack.
              // cmd.index: 0-based index of the stroke to remove.
              if (!('strokes' in node)) {
                failed++;
                break;
              }

              const currentStrokes = (node as GeometryMixin).strokes;
              const strokesArr = Array.isArray(currentStrokes) ? [...currentStrokes] : [];
              const removeIndex = cmd.index;

              if (removeIndex === undefined || removeIndex < 0 || removeIndex >= strokesArr.length) {
                if (!firstError) firstError = { action: cmd.action, nodeId: node.id, message: `Invalid stroke index: ${removeIndex}. Node has ${strokesArr.length} stroke(s) (0-indexed).` };
                failed++;
                break;
              }

              strokesArr.splice(removeIndex, 1);
              (node as GeometryMixin).strokes = strokesArr;
              success++;
              break;
            }

            case 'reorderStrokes': {
              // Reorder strokes in the stroke stack.
              // cmd.order: array of current indices in desired new order.
              if (!('strokes' in node)) {
                failed++;
                break;
              }

              const currentStrokes = (node as GeometryMixin).strokes;
              const strokesArr = Array.isArray(currentStrokes) ? [...currentStrokes] : [];
              const rawOrder: number[] = cmd.order;

              if (!Array.isArray(rawOrder)) {
                if (!firstError) firstError = { action: cmd.action, nodeId: node.id, message: 'order must be an array' };
                failed++;
                break;
              }

              // Robustly construct the new order
              const newOrder: number[] = [];
              const seen = new Set<number>();

              // 1. Add valid indices from the requested order
              for (const idx of rawOrder) {
                if (typeof idx === 'number' && idx >= 0 && idx < strokesArr.length && !seen.has(idx)) {
                  newOrder.push(idx);
                  seen.add(idx);
                }
              }

              // 2. Add any remaining indices that were not in the requested order
              for (let i = 0; i < strokesArr.length; i++) {
                if (!seen.has(i)) {
                  newOrder.push(i);
                }
              }

              const reordered = newOrder.map(i => strokesArr[i]);
              (node as GeometryMixin).strokes = reordered;
              success++;
              break;
            }

            case 'updateStroke': {
              // Update a specific stroke in the stack by index, without affecting other strokes.
              // cmd.index: 0-based index of the stroke to update (defaults to 0).
              // For SOLID strokes: cmd.color, cmd.opacity, cmd.visible
              // For GRADIENT strokes: cmd.stops, cmd.angle (linear only), cmd.opacity, cmd.visible
              if (!('strokes' in node)) {
                failed++;
                break;
              }

              const currentStrokes = (node as GeometryMixin).strokes;
              const strokesArr = Array.isArray(currentStrokes) ? [...currentStrokes] : [];
              const updateIndex = cmd.index !== undefined ? cmd.index : 0;

              if (updateIndex < 0 || updateIndex >= strokesArr.length) {
                if (!firstError) firstError = { action: cmd.action, nodeId: node.id, message: `Invalid stroke index: ${updateIndex}. Node has ${strokesArr.length} stroke(s) (0-indexed).` };
                failed++;
                break;
              }

              const existingStroke = strokesArr[updateIndex];
              let updatedStroke: Paint = { ...existingStroke };

              if (existingStroke.type === 'SOLID') {
                const solidBase = existingStroke as SolidPaint;
                const c = cmd.color ? parseHexColor(cmd.color) : null;
                updatedStroke = {
                  ...solidBase,
                  ...(c ? { color: { r: c.r, g: c.g, b: c.b } } : {}),
                  ...(cmd.opacity !== undefined ? { opacity: cmd.opacity } : (c ? { opacity: c.a } : {})),
                  ...(cmd.visible !== undefined ? { visible: cmd.visible } : {})
                } as SolidPaint;
              } else if (existingStroke.type === 'GRADIENT_LINEAR' || existingStroke.type === 'GRADIENT_RADIAL' ||
                existingStroke.type === 'GRADIENT_ANGULAR' || existingStroke.type === 'GRADIENT_DIAMOND') {
                const gradBase = existingStroke as GradientPaint;
                const newStops = cmd.stops ? cmd.stops.map((stop: { color: string, position: number, opacity?: number }) => {
                  const c = parseHexColor(stop.color);
                  return {
                    color: { r: c.r, g: c.g, b: c.b, a: stop.opacity !== undefined ? stop.opacity : c.a },
                    position: stop.position
                  };
                }) : undefined;

                let newTransform: Transform | undefined;
                if (cmd.angle !== undefined && existingStroke.type === 'GRADIENT_LINEAR') {
                  const radians = (cmd.angle * Math.PI) / 180;
                  const cos = Math.cos(radians);
                  const sin = Math.sin(radians);
                  newTransform = [
                    [cos, sin, 0.5 - cos * 0.5 - sin * 0.5],
                    [-sin, cos, 0.5 + sin * 0.5 - cos * 0.5]
                  ];
                }

                updatedStroke = {
                  ...gradBase,
                  ...(newStops ? { gradientStops: newStops } : {}),
                  ...(newTransform ? { gradientTransform: newTransform } : {}),
                  ...(cmd.opacity !== undefined ? { opacity: cmd.opacity } : {}),
                  ...(cmd.visible !== undefined ? { visible: cmd.visible } : {})
                } as GradientPaint;
              }

              strokesArr[updateIndex] = updatedStroke;
              (node as GeometryMixin).strokes = strokesArr;

              // Optionally update stroke weight alongside
              if (cmd.weight !== undefined && 'strokeWeight' in node) {
                (node as GeometryMixin).strokeWeight = cmd.weight;
              }
              success++;
              break;
            }

            case 'setIndividualStrokeWeights': {
              // Set per-side stroke weights on frames (like CSS border-width per side).
              // Applies to FRAME, COMPONENT, INSTANCE nodes only.
              if (!('strokeTopWeight' in node)) {
                if (!firstError) firstError = { action: cmd.action, nodeId: node.id, message: 'Individual stroke weights only supported on frames, components, and instances' };
                failed++;
                break;
              }

              const frameNode = node as FrameNode;
              if (cmd.top !== undefined) frameNode.strokeTopWeight = cmd.top;
              if (cmd.bottom !== undefined) frameNode.strokeBottomWeight = cmd.bottom;
              if (cmd.left !== undefined) frameNode.strokeLeftWeight = cmd.left;
              if (cmd.right !== undefined) frameNode.strokeRightWeight = cmd.right;
              success++;
              break;
            }

            case 'setRotation':
              if ('rotation' in node) {
                (node as LayoutMixin).rotation = cmd.angle || 0;
                success++;
              } else {
                failed++;
              }
              break;

            case 'setVisible':
              node.visible = cmd.visible !== false;
              success++;
              break;

            case 'bringToFront':
              if (node.parent && 'children' in node.parent) {
                const parent = node.parent as ChildrenMixin;
                const children = [...parent.children];
                const index = children.indexOf(node);
                if (index < children.length - 1) {
                  parent.insertChild(children.length - 1, node);
                }
                success++;
              } else {
                failed++;
              }
              break;

            case 'sendToBack':
              if (node.parent && 'children' in node.parent) {
                const parent = node.parent as ChildrenMixin;
                parent.insertChild(0, node);
                success++;
              } else {
                failed++;
              }
              break;

            case 'setConstraints':
              if ('constraints' in node) {
                const constraints: Constraints = {
                  horizontal: cmd.horizontal || 'MIN',
                  vertical: cmd.vertical || 'MIN'
                };
                (node as ConstraintMixin).constraints = constraints;
                // Optionally set constrainProportions alongside constraints
                if (cmd.constrainProportions !== undefined && 'constrainProportions' in node) {
                  (node as any).constrainProportions = cmd.constrainProportions;
                }
                success++;
              } else {
                failed++;
              }
              break;

            case 'setConstrainProportions':
              if ('constrainProportions' in node) {
                (node as any).constrainProportions = cmd.constrainProportions !== undefined ? cmd.constrainProportions : true;
                success++;
              } else {
                if (!firstError) firstError = { action: cmd.action, nodeId: node.id, message: 'Node does not support constrainProportions' };
                failed++;
              }
              break;

            case 'setReaction':
              if ('reactions' in node) {
                const trigger = buildTrigger(cmd.trigger || {});
                const actions = Array.isArray(cmd.actions)
                  ? cmd.actions.map((a: any) => buildAction(a)).filter((a: Action | null): a is Action => a !== null)
                  : [];

                if (actions.length === 0) {
                  failed++;
                  break;
                }

                try {
                  // Validate destination nodes exist
                  for (const action of actions) {
                    if (action.type === 'NODE' && action.destinationId) {
                      const destNode = await figma.getNodeByIdAsync(action.destinationId);
                      if (!destNode) {
                        throw new Error(`Destination node ${action.destinationId} does not exist`);
                      }
                    }
                  }

                  const reactions = (node as any).reactions || [];

                  // Check for duplicate reaction (simple structural comparison)
                  const isDuplicate = reactions.some((r: any) => {
                    try {
                      return JSON.stringify(r.trigger) === JSON.stringify(trigger) &&
                        JSON.stringify(r.actions) === JSON.stringify(actions);
                    } catch (e) {
                      return false;
                    }
                  });

                  if (isDuplicate) {
                    success++; // Skip but count as success
                    break;
                  }

                  const newReactions = [...reactions, { trigger, actions }];

                  // Check if node has setReactionsAsync method (required for dynamic pages)
                  if ('setReactionsAsync' in node && typeof (node as any).setReactionsAsync === 'function') {
                    await (node as any).setReactionsAsync(newReactions);
                  } else {
                    // Use direct assignment for nodes that support it
                    (node as any).reactions = newReactions;
                  }

                  // Auto-generate a flow name for the destination, if applicable
                  // Skip flow names for CHANGE_TO (variants), OVERLAY, or if the source is inside a Component Set
                  const destAction = actions.find((a: any) => a && (a as any).destinationId);
                  const destId = (destAction as any)?.destinationId;
                  const navType = (destAction as any)?.navigation;

                  const isVariant = node.parent && node.parent.type === 'COMPONENT_SET';

                  if (destId && navType !== 'CHANGE_TO' && navType !== 'OVERLAY' && !isVariant) {
                    await ensureFlowName(node as SceneNode, destId, (cmd as any).flowName);
                  }

                  success++;
                } catch (error) {
                  console.error('setReaction failed:', error);
                  if (!firstError) firstError = { action: cmd.action, nodeId: node.id, message: (error as Error)?.message || 'setReaction failed' };
                  failed++;
                }
              } else {
                failed++;
              }
              break;

            case 'getReactions': {
              // Read and return all prototype interactions (reactions) on a node.
              if ('reactions' in node) {
                const reactions = (node as any).reactions || [];
                const serializedReactions = reactions.map((r: any) => {
                  const reaction: any = {};
                  if (r.trigger) {
                    reaction.trigger = { type: r.trigger.type };
                    if (r.trigger.delay !== undefined) reaction.trigger.delay = r.trigger.delay;
                    if (r.trigger.timeout !== undefined) reaction.trigger.timeout = r.trigger.timeout;
                  }
                  if (r.actions && Array.isArray(r.actions)) {
                    reaction.actions = r.actions.map((a: any) => {
                      const actionInfo: any = { type: a.type };
                      if (a.destinationId) actionInfo.destinationId = a.destinationId;
                      if (a.navigation) actionInfo.navigation = a.navigation;
                      if (a.transition) {
                        actionInfo.transition = { type: a.transition.type };
                        if (a.transition.duration !== undefined) actionInfo.transition.duration = a.transition.duration;
                        if (a.transition.easing) actionInfo.transition.easing = a.transition.easing;
                        if (a.transition.direction) actionInfo.transition.direction = a.transition.direction;
                      }
                      if (a.url) actionInfo.url = a.url;
                      if (a.openUrlInNewTab !== undefined) actionInfo.openUrlInNewTab = a.openUrlInNewTab;
                      return actionInfo;
                    });
                  }
                  return reaction;
                });

                figma.ui.postMessage({
                  type: 'reactions-info',
                  nodeId: node.id,
                  reactions: serializedReactions
                });
                success++;
              } else {
                figma.ui.postMessage({
                  type: 'reactions-info',
                  nodeId: node.id,
                  reactions: []
                });
                success++;
              }
              break;
            }

            case 'removeReaction': {
              // Remove a reaction by index from the reactions array.
              // cmd.index: 0-based index of the reaction to remove.
              if ('reactions' in node) {
                const reactions = [...((node as any).reactions || [])];
                const removeIndex = cmd.index;

                if (removeIndex === undefined || removeIndex < 0 || removeIndex >= reactions.length) {
                  if (!firstError) firstError = { action: cmd.action, nodeId: node.id, message: `Invalid reaction index: ${removeIndex}. Node has ${reactions.length} reaction(s) (0-indexed).` };
                  failed++;
                  break;
                }

                reactions.splice(removeIndex, 1);

                if ('setReactionsAsync' in node && typeof (node as any).setReactionsAsync === 'function') {
                  await (node as any).setReactionsAsync(reactions);
                } else {
                  (node as any).reactions = reactions;
                }
                success++;
              } else {
                failed++;
              }
              break;
            }

            case 'clearReactions': {
              // Remove all reactions from a node.
              if ('reactions' in node) {
                if ('setReactionsAsync' in node && typeof (node as any).setReactionsAsync === 'function') {
                  await (node as any).setReactionsAsync([]);
                } else {
                  (node as any).reactions = [];
                }
                success++;
              } else {
                failed++;
              }
              break;
            }

            case 'setOverflowDirection': {
              // Set the scroll/overflow direction on a frame.
              // cmd.direction: "NONE" | "HORIZONTAL" | "VERTICAL" | "BOTH"
              if ('overflowDirection' in node) {
                const direction = (cmd.direction || 'NONE').toUpperCase();
                if (['NONE', 'HORIZONTAL', 'VERTICAL', 'BOTH'].includes(direction)) {
                  (node as FrameNode).overflowDirection = direction as OverflowDirection;
                  success++;
                } else {
                  if (!firstError) firstError = { action: cmd.action, nodeId: node.id, message: `Invalid direction: ${cmd.direction}. Use NONE, HORIZONTAL, VERTICAL, or BOTH.` };
                  failed++;
                }
              } else {
                if (!firstError) firstError = { action: cmd.action, nodeId: node.id, message: 'Node does not support overflowDirection (must be a frame)' };
                failed++;
              }
              break;
            }

            case 'setNumberOfFixedChildren': {
              // Set the number of fixed (non-scrolling) children at the top of the layer list.
              // These act as fixed headers/footers in a scrollable frame.
              // cmd.count: number of children to keep fixed (0 to clear).
              if ('numberOfFixedChildren' in node) {
                const count = cmd.count !== undefined ? cmd.count : 0;
                (node as FrameNode).numberOfFixedChildren = Math.max(0, count);
                success++;
              } else {
                if (!firstError) firstError = { action: cmd.action, nodeId: node.id, message: 'Node does not support numberOfFixedChildren (must be a frame)' };
                failed++;
              }
              break;
            }

            case 'setSimpleText': {
              // High-performance text setter for bulk operations (Direct UI, Realistic Data)
              // DOES NOT support:
              // - style preservation (resets to full node style)
              // - deep child search (must target node directly)
              // - instance property updates (must target text node directly)
              let textNode: TextNode | null = null;

              // 1. If it's an instance, try the fast property path first
              if (node.type === 'INSTANCE') {
                const instance = node as InstanceNode;
                try {
                  const mainComp = await (('getMainComponentAsync' in instance) ? (instance as any).getMainComponentAsync() : (instance as any).mainComponent);
                  if (mainComp) {
                    const defs = (mainComp.parent && mainComp.parent.type === 'COMPONENT_SET')
                      ? (mainComp.parent as ComponentSetNode).componentPropertyDefinitions
                      : mainComp.componentPropertyDefinitions;

                    const textPropDefs = Object.entries(defs).filter(([_, d]) => (d as any).type === 'TEXT');

                    if (textPropDefs.length > 0) {
                      let targetPropKey = '';
                      if (textPropDefs.length === 1) {
                        targetPropKey = textPropDefs[0][0];
                      } else {
                        const bestMatch = textPropDefs.find(([key, _]) => {
                          const lowKey = key.toLowerCase();
                          return lowKey.includes('label') || lowKey.includes('text') || lowKey.includes('title') || lowKey.includes('content') || lowKey.includes('button');
                        });
                        targetPropKey = bestMatch ? bestMatch[0] : textPropDefs[0][0];
                      }

                      if (targetPropKey) {
                        instance.setProperties({ [targetPropKey]: cmd.text || '' });
                        success++;
                        break;
                      }
                    }
                  }
                } catch (e) {
                  console.warn('setSimpleText: Failed instance property shortcut', e);
                }
              }

              // 2. Resolve target node
              if (node.type === 'TEXT') {
                textNode = node as TextNode;
              } else if ('children' in node) {
                const container = node as ChildrenMixin;
                textNode = container.children.find(n => n.type === 'TEXT' && isEffectivelyVisible(n as SceneNode)) as TextNode | undefined || null;
                // Recursive fallback: search deeper when shallow search fails
                if (!textNode && 'findOne' in container) {
                  textNode = (container as any).findOne((n: any) => n.type === 'TEXT' && isEffectivelyVisible(n as SceneNode)) as TextNode | null;
                }
              } else if (node.type === 'STICKY') {
                const sub = (node as StickyNode).text;
                await loadAllFontsForTextSublayerNode(sub);
                sub.characters = cmd.text || '';
                success++;
                break;
              } else if (node.type === 'SHAPE_WITH_TEXT') {
                const sub = (node as ShapeWithTextNode).text;
                await loadAllFontsForTextSublayerNode(sub);
                sub.characters = cmd.text || '';
                success++;
                break;
              }

              if (textNode) {
                try {
                  // setSimpleText resets the entire string, so we only need the primary font.
                  // If fontName is mixed, fall back to loading all fonts.
                  const fn = textNode.fontName;
                  if (fn && typeof fn !== 'symbol') {
                    await smartLoadFont(fn as FontName);
                  } else {
                    await loadAllFontsForTextNode(textNode);
                  }
                  textNode.characters = cmd.text || '';
                  success++;
                } catch (error) {
                  console.error('setSimpleText failed', error);
                  if (!firstError) firstError = { action: cmd.action, nodeId: node.id, message: (error as Error)?.message || 'setSimpleText failed' };
                  failed++;
                }
              } else {
                failed++;
              }
              break;
            }

            case 'setText':
            case 'updateText': {
              let textTarget: TextNode | StickyNode | ShapeWithTextNode | null = null;
              let instanceTextUpdated = false;

              // 1. Try to update via Instance Properties if it's an instance
              if (node.type === 'INSTANCE') {
                const instance = node as InstanceNode;
                try {
                  let mainComp: ComponentNode | null = null;
                  if ('getMainComponentAsync' in instance) {
                    mainComp = await (instance as any).getMainComponentAsync();
                  } else {
                    mainComp = (instance as any).mainComponent;
                  }

                  if (mainComp) {
                    const defs = (mainComp.parent && mainComp.parent.type === 'COMPONENT_SET')
                      ? (mainComp.parent as ComponentSetNode).componentPropertyDefinitions
                      : mainComp.componentPropertyDefinitions;

                    const textPropDefs = Object.entries(defs).filter(([_, d]) => (d as any).type === 'TEXT');

                    if (textPropDefs.length > 0) {
                      let targetPropKey = '';
                      if (textPropDefs.length === 1) {
                        targetPropKey = textPropDefs[0][0];
                      } else {
                        const bestMatch = textPropDefs.find(([key, _]) => {
                          const lowKey = key.toLowerCase();
                          return lowKey.includes('label') || lowKey.includes('text') || lowKey.includes('title') || lowKey.includes('content') || lowKey.includes('button');
                        });
                        targetPropKey = bestMatch ? bestMatch[0] : textPropDefs[0][0];
                      }

                      if (targetPropKey) {
                        instance.setProperties({ [targetPropKey]: cmd.text || '' });
                        instanceTextUpdated = true;
                        success++;
                      }
                    }
                  }
                } catch (e) {
                  console.warn('Failed to update text via instance property', e);
                }
              }

              if (instanceTextUpdated) break;

              // 2. Fallback to direct search
              if (node.type === 'TEXT' || node.type === 'STICKY' || node.type === 'SHAPE_WITH_TEXT') {
                textTarget = node as any;
              } else if ('children' in node) {
                const container = node as ChildrenMixin;
                // Fast shallow check first
                let tNode = container.children.find(n => n.type === 'TEXT' && isEffectivelyVisible(n as SceneNode)) as TextNode | undefined;
                if (!tNode) {
                  tNode = (container as any).findAll((n: SceneNode) => n.type === 'TEXT' && isEffectivelyVisible(n))[0] as TextNode;
                }
                textTarget = tNode || null;
              }

              if (textTarget) {
                const newText = cmd.text ?? '';
                if (textTarget.type === 'TEXT') {
                  const textNode = textTarget as TextNode;
                  try {
                    await loadAllFontsForTextNode(textNode);
                    if (textNode.fontName !== figma.mixed && textNode.fontSize !== figma.mixed && textNode.textStyleId === '') {
                      textNode.characters = newText;
                    } else {
                      const originalLen = textNode.characters.length;
                      const originalSegs = getTextStyleSegments(textNode);
                      textNode.characters = newText;
                      await reapplyTextStylesAfterReplace(textNode, originalSegs, originalLen, newText);
                    }
                    success++;
                  } catch (error) {
                    console.error('setText failed', error);
                    failed++;
                  }
                } else if (textTarget.type === 'STICKY') {
                  try {
                    await loadAllFontsForTextSublayerNode((textTarget as StickyNode).text);
                    (textTarget as StickyNode).text.characters = newText;
                    success++;
                  } catch (e) { failed++; }
                } else if (textTarget.type === 'SHAPE_WITH_TEXT') {
                  try {
                    await loadAllFontsForTextSublayerNode((textTarget as ShapeWithTextNode).text);
                    (textTarget as ShapeWithTextNode).text.characters = newText;
                    success++;
                  } catch (e) { failed++; }
                }
              } else {
                failed++;
              }
              break;
            }

            case 'splitText':
              if (node.type === 'TEXT') {
                const textNode = node as TextNode;
                try {
                  const delimiter = cmd.delimiter ?? '';
                  const keepDelimiter = cmd.keepDelimiter ?? false;
                  const direction = cmd.direction ?? 'VERTICAL';
                  const spacing = cmd.spacing ?? 0;

                  // Load all fonts first
                  await loadAllFontsForTextNode(textNode);

                  // Get original text and style segments
                  const originalText = textNode.characters;
                  const originalSegments = getTextStyleSegments(textNode);

                  // Split text and track indices
                  const textSegments = splitTextWithIndices(originalText, delimiter, keepDelimiter);

                  if (textSegments.length <= 1) {
                    // No splits occurred
                    success++;
                    break;
                  }

                  // Get parent and position info
                  const parent = textNode.parent;
                  const originalX = textNode.x;
                  const originalY = textNode.y;
                  const originalName = textNode.name;

                  // Create new text nodes for each segment
                  const newNodes: TextNode[] = [];

                  for (let i = 0; i < textSegments.length; i++) {
                    const seg = textSegments[i];

                    // Trim leading/trailing newlines that often cause "empty rows" in split text nodes
                    // but preserve internal newlines if any
                    const text = seg.text;
                    let startOffset = 0;
                    let endOffset = 0;

                    // Find leading newlines/carriage returns
                    const leadingMatch = text.match(/^[\n\r]+/);
                    if (leadingMatch) {
                      startOffset = leadingMatch[0].length;
                    }

                    // Find trailing newlines/carriage returns
                    const trailingMatch = text.match(/[\n\r]+$/);
                    if (trailingMatch) {
                      endOffset = trailingMatch[0].length;
                    }

                    // Check if segment is empty or only contained newlines
                    if (startOffset + endOffset >= text.length && text.length > 0) {
                      // Only contained newlines, skip this segment
                      continue;
                    }

                    if (text.length === 0) continue; // Skip empty segments

                    const processedText = text.substring(startOffset, text.length - endOffset);
                    const processedStart = seg.startIndex + startOffset;
                    const processedEnd = seg.endIndex - endOffset;

                    const newTextNode = figma.createText();

                    // Copy position and parent first so relative positioning works
                    if (parent && 'appendChild' in parent) {
                      parent.appendChild(newTextNode);
                    } else {
                      figma.currentPage.appendChild(newTextNode);
                    }

                    // Set text content
                    newTextNode.characters = processedText;

                    // Get style segments for this range
                    const styleSegments = getStyleSegmentsForRange(
                      originalSegments,
                      processedStart,
                      processedEnd
                    );

                    // Apply styles from original segments
                    await applyStyleSegmentsToTextNode(newTextNode, styleSegments);

                    // Copy other properties from original
                    if (textNode.fontSize !== figma.mixed) {
                      newTextNode.fontSize = textNode.fontSize as number;
                    }
                    newTextNode.textAlignHorizontal = textNode.textAlignHorizontal;
                    newTextNode.textAlignVertical = textNode.textAlignVertical;
                    newTextNode.textAutoResize = textNode.textAutoResize;

                    // Copy sizing and layout properties
                    if (textNode.textAutoResize === 'NONE' || textNode.textAutoResize === 'HEIGHT') {
                      newTextNode.resize(textNode.width, newTextNode.height);
                    }

                    if ('layoutAlign' in textNode) newTextNode.layoutAlign = textNode.layoutAlign;
                    if ('layoutGrow' in textNode) newTextNode.layoutGrow = textNode.layoutGrow;
                    if ('layoutPositioning' in textNode) newTextNode.layoutPositioning = textNode.layoutPositioning;
                    if ('constraints' in textNode) newTextNode.constraints = textNode.constraints;

                    if (textNode.textStyleId && textNode.textStyleId !== figma.mixed) {
                      try {
                        await newTextNode.setTextStyleIdAsync(textNode.textStyleId as string);
                      } catch (e) { /* ignore */ }
                    }

                    // Set name
                    if (textSegments.length > 1) {
                      newTextNode.name = `${originalName} ${i + 1}`;
                    } else {
                      newTextNode.name = originalName;
                    }

                    // Position nodes in stack
                    if (newNodes.length === 0) {
                      newTextNode.x = originalX;
                      newTextNode.y = originalY;
                    } else {
                      const prevNode = newNodes[newNodes.length - 1];
                      if (direction === 'VERTICAL') {
                        newTextNode.x = originalX;
                        newTextNode.y = prevNode.y + prevNode.height + spacing;
                      } else {
                        newTextNode.x = prevNode.x + prevNode.width + spacing;
                        newTextNode.y = originalY;
                      }
                    }

                    newNodes.push(newTextNode);
                  }

                  // Remove original node
                  textNode.remove();

                  // Select new nodes
                  figma.currentPage.selection = newNodes;

                  success++;
                } catch (error) {
                  console.error('splitText failed', error);
                  if (!firstError) {
                    firstError = {
                      action: cmd.action,
                      nodeId: node.id,
                      message: (error as Error)?.message || 'splitText failed'
                    };
                  }
                  failed++;
                }
              } else {
                failed++;
              }
              break;

            case 'setFontSize':
              if (node.type === 'TEXT') {
                const textNode = node as TextNode;
                await loadAllFontsForTextNode(textNode);
                textNode.fontSize = cmd.size;
                success++;
              } else {
                failed++;
              }
              break;

            case 'setTextAlign':
              if (node.type === 'TEXT') {
                const textNode = node as TextNode;
                textNode.textAlignHorizontal = cmd.align || 'LEFT';
                success++;
              } else {
                failed++;
              }
              break;

            case 'setFontFamily':
              if (node.type === 'TEXT') {
                const textNode = node as TextNode;
                const family = cmd.family || 'Inter';
                const style = normalizeFontStyle(cmd.weight || cmd.style || 'Regular');
                if (textNode.fontName === figma.mixed) {
                  await loadAllFontsForTextNode(textNode);
                }
                const loaded = await smartLoadFont({ family, style });
                textNode.fontName = loaded;
                success++;
              } else {
                failed++;
              }
              break;

            case 'setTextStyle':
              if (node.type === 'TEXT') {
                const styleId = cmd.styleId || cmd.id || cmd.textStyleId;
                if (!styleId || typeof styleId !== 'string') {
                  failed++;
                  break;
                }
                try {
                  if (typeof figma.getStyleByIdAsync === 'function') {
                    try {
                      const style = await figma.getStyleByIdAsync(styleId);
                      if (style && style.type === 'TEXT' && (style as any).fontName) {
                        await smartLoadFont((style as any).fontName as FontName);
                      }
                    } catch (err) {
                      console.warn('getStyleByIdAsync failed', err);
                    }
                  }
                  if ('setTextStyleIdAsync' in node && typeof (node as any).setTextStyleIdAsync === 'function') {
                    await (node as any).setTextStyleIdAsync(styleId);
                  } else {
                    await (node as TextNode).setTextStyleIdAsync(styleId);
                  }
                  success++;
                } catch (error) {
                  console.error('setTextStyle failed', error);
                  if (!firstError) firstError = { action: cmd.action, nodeId: node.id, message: (error as Error)?.message || 'setTextStyle failed' };
                  failed++;
                }
              } else {
                failed++;
              }
              break;

            case 'setFontWeight':
              if (node.type === 'TEXT') {
                const textNode = node as TextNode;
                const targetStyle = normalizeFontStyle(cmd.weight || 'Regular');

                if (textNode.fontName === figma.mixed) {
                  // Mixed fonts: apply weight to each segment, preserving each family
                  const segments = textNode.getStyledTextSegments(['fontName']);
                  for (const seg of segments) {
                    const family = (seg.fontName as FontName).family;
                    const loaded = await smartLoadFont({ family, style: targetStyle });
                    textNode.setRangeFontName(seg.start, seg.end, loaded);
                  }
                } else {
                  const currentFont = textNode.fontName as FontName;
                  const loaded = await smartLoadFont({ family: currentFont.family, style: targetStyle });
                  textNode.fontName = loaded;
                }
                success++;
              } else {
                failed++;
              }
              break;

            case 'setLineHeight':
              if (node.type === 'TEXT') {
                const textNode = node as TextNode;
                await loadAllFontsForTextNode(textNode);
                if (cmd.value && cmd.unit === 'PERCENT') {
                  textNode.lineHeight = { value: cmd.value, unit: 'PERCENT' };
                } else if (cmd.value) {
                  textNode.lineHeight = { value: cmd.value, unit: 'PIXELS' };
                } else {
                  textNode.lineHeight = { unit: 'AUTO' };
                }
                success++;
              } else {
                failed++;
              }
              break;

            case 'setLetterSpacing':
              if (node.type === 'TEXT') {
                const textNode = node as TextNode;
                await loadAllFontsForTextNode(textNode);
                textNode.letterSpacing = { value: cmd.value || 0, unit: 'PIXELS' };
                success++;
              } else {
                failed++;
              }
              break;

            case 'setParagraphIndent':
              if (node.type === 'TEXT') {
                const textNode = node as TextNode;
                try {
                  await loadAllFontsForTextNode(textNode);
                  const indent = typeof cmd.value === 'number' ? cmd.value : 0;
                  if (typeof cmd.start === 'number' && typeof cmd.end === 'number') {
                    textNode.setRangeParagraphIndent(cmd.start, cmd.end, indent);
                  } else {
                    textNode.paragraphIndent = indent;
                  }
                  success++;
                } catch (error) {
                  console.error('Failed to set paragraph indent', error);
                  failed++;
                }
              } else {
                failed++;
              }
              break;

            case 'setParagraphSpacing':
              if (node.type === 'TEXT') {
                const textNode = node as TextNode;
                try {
                  await loadAllFontsForTextNode(textNode);
                  const spacing = typeof cmd.value === 'number' ? cmd.value : 0;
                  if (typeof cmd.start === 'number' && typeof cmd.end === 'number') {
                    textNode.setRangeParagraphSpacing(cmd.start, cmd.end, spacing);
                  } else {
                    textNode.paragraphSpacing = spacing;
                  }
                  success++;
                } catch (error) {
                  console.error('Failed to set paragraph spacing', error);
                  failed++;
                }
              } else {
                failed++;
              }
              break;

            case 'setRangeHyperlink':
              if (node.type === 'TEXT') {
                const textNode = node as TextNode;
                try {
                  await loadAllFontsForTextNode(textNode);
                  const fullText = textNode.characters || '';

                  let rangeStart = typeof cmd.start === 'number' ? cmd.start : 0;
                  let rangeEnd = typeof cmd.end === 'number' ? cmd.end : fullText.length;

                  // If caller passed a substring to link, auto-find and override start/end
                  const substring = typeof cmd.textSubstring === 'string'
                    ? cmd.textSubstring
                    : (typeof cmd.substring === 'string' ? cmd.substring : '');
                  if (substring) {
                    const match = findTextRange(fullText, substring, cmd.occurrence ?? 0);
                    if (match) {
                      rangeStart = match.start;
                      rangeEnd = match.end;
                    }
                  }

                  // Ensure valid range
                  rangeStart = Math.max(0, Math.min(rangeStart, fullText.length));
                  rangeEnd = Math.max(rangeStart, Math.min(rangeEnd, fullText.length));

                  // Normalize URL from url/href/value and auto-prefix if missing scheme
                  const rawUrl = (cmd.url || cmd.href || cmd.value || '').trim();
                  const normalizedUrl = rawUrl && !/^https?:\/\//i.test(rawUrl)
                    ? `https://${rawUrl}`
                    : rawUrl;

                  if (rangeStart === rangeEnd) {
                    if (!firstError) firstError = { action: cmd.action, nodeId: node.id, message: 'Empty text range for hyperlink' };
                    failed++;
                    break;
                  }

                  textNode.setRangeHyperlink(rangeStart, rangeEnd, {
                    type: cmd.linkType || 'URL',
                    value: normalizedUrl || ''
                  });
                  success++;
                } catch (error) {
                  console.error('setRangeHyperlink failed', error);
                  if (!firstError) firstError = { action: cmd.action, nodeId: node.id, message: (error as Error)?.message || 'setRangeHyperlink failed' };
                  failed++;
                }
              } else {
                failed++;
              }
              break;

            case 'setRangeListOptions':
            case 'setListStyle':
              if (node.type === 'TEXT') {
                const textNode = node as TextNode;
                await loadAllFontsForTextNode(textNode);

                const fullTextLen = textNode.characters.length;
                let rangeStart = typeof cmd.start === 'number' ? cmd.start : 0;
                let rangeEnd = typeof cmd.end === 'number' ? cmd.end : fullTextLen;

                // Safety clamping
                rangeStart = Math.max(0, Math.min(rangeStart, fullTextLen));
                rangeEnd = Math.max(rangeStart, Math.min(rangeEnd, fullTextLen));

                try {
                  textNode.setRangeListOptions(rangeStart, rangeEnd, {
                    type: cmd.listType || cmd.type || 'UNORDERED'
                  });
                } catch (error) {
                  console.error('setRangeListOptions failed', error);
                  if (!firstError) firstError = { action: cmd.action, nodeId: node.id, message: (error as Error)?.message || 'setRangeListOptions failed' };
                  failed++;
                  break;
                }

                if (typeof cmd.listSpacing === 'number') {
                  textNode.listSpacing = cmd.listSpacing;
                }
                success++;
              } else {
                failed++;
              }
              break;

            case 'setListSpacing':
              if (node.type === 'TEXT') {
                const textNode = node as TextNode;
                textNode.listSpacing = typeof cmd.spacing === 'number' ? cmd.spacing : (cmd.listSpacing || 0);
                success++;
              } else {
                failed++;
              }
              break;

            case 'setRangeFills':
              if (node.type === 'TEXT') {
                const textNode = node as TextNode;
                try {
                  await loadAllFontsForTextNode(textNode);
                  const c = parseHexColor(cmd.color || '#000000');
                  const paints: Paint[] = [{ type: 'SOLID', color: { r: c.r, g: c.g, b: c.b }, opacity: c.a }];

                  const fullText = textNode.characters || '';
                  let rangeStart = typeof cmd.start === 'number' ? cmd.start : 0;
                  let rangeEnd = typeof cmd.end === 'number' ? cmd.end : fullText.length;

                  const substring = typeof cmd.textSubstring === 'string'
                    ? cmd.textSubstring
                    : (typeof cmd.substring === 'string' ? cmd.substring : '');
                  if (substring) {
                    const match = findTextRange(fullText, substring, cmd.occurrence ?? 0);
                    if (match) {
                      rangeStart = match.start;
                      rangeEnd = match.end;
                    }
                  }

                  rangeStart = Math.max(0, Math.min(rangeStart, fullText.length));
                  rangeEnd = Math.max(rangeStart, Math.min(rangeEnd, fullText.length));

                  if (rangeStart === rangeEnd) {
                    if (!firstError) firstError = { action: cmd.action, nodeId: node.id, message: 'Empty text range for fill' };
                    failed++;
                    break;
                  }

                  // Use async version for dynamic pages
                  if (
                    'setRangeFillsAsync' in textNode &&
                    typeof (textNode as any).setRangeFillsAsync === 'function'
                  ) {
                    await (textNode as any).setRangeFillsAsync(rangeStart, rangeEnd, paints);
                  } else {
                    textNode.setRangeFills(rangeStart, rangeEnd, paints);
                  }
                  success++;
                } catch (error) {
                  console.error('setRangeFills failed', error);
                  if (!firstError) firstError = { action: cmd.action, nodeId: node.id, message: (error as Error)?.message || 'setRangeFills failed' };
                  failed++;
                }
              } else {
                failed++;
              }
              break;

            case 'setTextDecoration':
              if (node.type === 'TEXT') {
                const textNode = node as TextNode;
                textNode.textDecoration = cmd.decoration || 'NONE'; // NONE, UNDERLINE, STRIKETHROUGH
                success++;
              } else {
                failed++;
              }
              break;

            case 'setStickyColor': {
              const isFallbackStickyNode = node.type === 'FRAME' && node.getPluginData("isFallbackSticky") === "true";
              if (node.type === 'STICKY' || isFallbackStickyNode) {
                // FigJam sticky color RGB values (from Figma's default palette)
                const colorMap: Record<string, { r: number, g: number, b: number }> = {
                  'gray': { r: 0.898, g: 0.898, b: 0.898 },
                  'blue': { r: 0.337, g: 0.612, b: 0.969 },
                  'green': { r: 0.337, g: 0.761, b: 0.365 },
                  'yellow': { r: 1, g: 0.922, b: 0.231 },
                  'orange': { r: 1, g: 0.722, b: 0.318 },
                  'pink': { r: 1, g: 0.522, b: 0.722 },
                  'violet': { r: 0.737, g: 0.522, b: 1 },
                  'purple': { r: 0.737, g: 0.522, b: 1 },
                  'red': { r: 1, g: 0.721, b: 0.658 },
                  'teal': { r: 0.337, g: 0.761, b: 0.365 },
                  'light_gray': { r: 0.961, g: 0.961, b: 0.961 }
                };
                const stickyColor = colorMap[(cmd.color || 'yellow').toLowerCase()];
                if (stickyColor) {
                  node.fills = [{ type: 'SOLID', color: stickyColor }];
                  if (node.type === 'STICKY') {
                    (node as StickyNode).authorVisible = false;
                  }
                  success++;
                } else {
                  failed++;
                }
              } else {
                failed++;
              }
            }
              break;

            // FigJam Connector modification commands
            case 'setConnectorLineType':
              if (node.type === 'CONNECTOR') {
                const connectorNode = node as ConnectorNode;
                const lineTypeMap: Record<string, 'ELBOWED' | 'STRAIGHT' | 'CURVED'> = {
                  'elbowed': 'ELBOWED',
                  'straight': 'STRAIGHT',
                  'curved': 'CURVED'
                };
                connectorNode.connectorLineType = lineTypeMap[(cmd.lineType || 'elbowed').toLowerCase()] || 'ELBOWED';
                success++;
              } else {
                failed++;
              }
              break;

            case 'setConnectorStroke':
              if (node.type === 'CONNECTOR') {
                const connectorNode = node as ConnectorNode;
                if (cmd.color) {
                  const color = parseHexColor(cmd.color);
                  connectorNode.strokes = [{ type: 'SOLID', color: { r: color.r, g: color.g, b: color.b } }];
                }
                if (cmd.weight !== undefined) {
                  connectorNode.strokeWeight = cmd.weight;
                }
                success++;
              } else {
                failed++;
              }
              break;

            case 'setConnectorEndpoints':
              if (node.type === 'CONNECTOR') {
                const connectorNode = node as ConnectorNode;

                let startSet = false;
                let endSet = false;

                // Update start endpoint
                if (cmd.startNodeId) {
                  let startNode = await figma.getNodeByIdAsync(cmd.startNodeId) as SceneNode;

                  // Fallback: if node not found, check createdNodes map
                  if (!startNode && createdNodes.has(cmd.startNodeId)) {
                    startNode = createdNodes.get(cmd.startNodeId)!;
                  }

                  if (startNode) {
                    connectorNode.connectorStart = {
                      endpointNodeId: startNode.id,
                      magnet: cmd.startMagnet || 'AUTO'
                    };
                    startSet = true;
                  } else {
                    if (!firstError) firstError = { action: cmd.action, nodeId: node.id, message: `Start node not found: ${cmd.startNodeId}` };
                    failed++;
                    break;
                  }
                } else if (cmd.startX !== undefined && cmd.startY !== undefined) {
                  connectorNode.connectorStart = {
                    position: { x: cmd.startX, y: cmd.startY }
                  };
                  startSet = true;
                }

                // Update end endpoint
                if (cmd.endNodeId) {
                  let endNode = await figma.getNodeByIdAsync(cmd.endNodeId) as SceneNode;

                  // Fallback: if node not found, check createdNodes map
                  if (!endNode && createdNodes.has(cmd.endNodeId)) {
                    endNode = createdNodes.get(cmd.endNodeId)!;
                  }

                  // Additional fallback: check current selection for newly created sticky
                  if (!endNode) {
                    const currentSelection = figma.currentPage.selection;
                    const selectedSticky = currentSelection.find(n =>
                      n.type === 'STICKY' || (n.type === 'FRAME' && n.getPluginData("isFallbackSticky") === "true")
                    );
                    if (selectedSticky) {
                      endNode = selectedSticky as SceneNode;
                    }
                  }

                  if (endNode) {
                    connectorNode.connectorEnd = {
                      endpointNodeId: endNode.id,
                      magnet: cmd.endMagnet || 'AUTO'
                    };
                    endSet = true;
                  } else {
                    if (!firstError) firstError = { action: cmd.action, nodeId: node.id, message: `End node not found: ${cmd.endNodeId}` };
                    failed++;
                    break;
                  }
                } else if (cmd.endX !== undefined && cmd.endY !== undefined) {
                  connectorNode.connectorEnd = {
                    position: { x: cmd.endX, y: cmd.endY }
                  };
                  endSet = true;
                }

                // Validate that at least one endpoint was set
                if (!startSet && !endSet) {
                  if (!firstError) firstError = { action: cmd.action, nodeId: node.id, message: 'No endpoints provided for connector update' };
                  failed++;
                  break;
                }

                success++;
              } else {
                failed++;
              }
              break;

            // FigJam Shape with Text modification
            case 'setShapeText':
              if (node.type === 'SHAPE_WITH_TEXT') {
                const shapeNode = node as ShapeWithTextNode;
                await smartLoadFont({ family: "Inter", style: "Medium" });
                shapeNode.text.characters = cmd.text || '';
                success++;
              } else {
                failed++;
              }
              break;

            case 'setShapeType':
              if (node.type === 'SHAPE_WITH_TEXT') {
                const shapeNode = node as ShapeWithTextNode;
                const shapeTypeMap: Record<string, 'SQUARE' | 'ELLIPSE' | 'DIAMOND' | 'TRIANGLE_UP' | 'TRIANGLE_DOWN' | 'PARALLELOGRAM_RIGHT' | 'PARALLELOGRAM_LEFT' | 'ENG_DATABASE' | 'ENG_QUEUE' | 'ENG_FILE' | 'ENG_FOLDER'> = {
                  'square': 'SQUARE',
                  'rectangle': 'SQUARE',
                  'ellipse': 'ELLIPSE',
                  'circle': 'ELLIPSE',
                  'diamond': 'DIAMOND',
                  'triangle': 'TRIANGLE_UP',
                  'triangle_up': 'TRIANGLE_UP',
                  'triangle_down': 'TRIANGLE_DOWN',
                  'parallelogram': 'PARALLELOGRAM_RIGHT',
                  'parallelogram_right': 'PARALLELOGRAM_RIGHT',
                  'parallelogram_left': 'PARALLELOGRAM_LEFT',
                  'database': 'ENG_DATABASE',
                  'queue': 'ENG_QUEUE',
                  'file': 'ENG_FILE',
                  'folder': 'ENG_FOLDER'
                };
                shapeNode.shapeType = shapeTypeMap[(cmd.shapeType || 'square').toLowerCase()] || 'SQUARE';
                success++;
              } else {
                failed++;
              }
              break;

            case 'setAutoLayout':
              if (node.type === 'FRAME' || node.type === 'COMPONENT' || node.type === 'INSTANCE') {
                const frame = node as FrameNode;

                // Pass 3: Only enable auto layout and set direction
                if (cmd.isPass3) {
                  const direction = (cmd.direction || 'VERTICAL').toUpperCase();
                  if (direction === 'GRID') {
                    frame.layoutMode = 'GRID';
                  } else if (direction === 'HORIZONTAL' || direction === 'VERTICAL') {
                    frame.layoutMode = direction;
                  } else {
                    frame.layoutMode = 'VERTICAL';
                  }
                  success++;
                  break;
                }

                // Pass 4: Configure everything else
                // FIX: If it's an "old-style" command (neither Pass 3 nor Pass 4), we MUST 
                // perform both actions (enable layout and configure) to avoid skipping it.
                if (!cmd.isPass4 && !cmd.isPass3) {
                  const direction = (cmd.direction || 'VERTICAL').toUpperCase();
                  if (direction === 'GRID') frame.layoutMode = 'GRID';
                  else if (direction === 'HORIZONTAL' || direction === 'VERTICAL') frame.layoutMode = direction;
                  else frame.layoutMode = 'VERTICAL';
                } else if (!cmd.isPass4) {
                  // If this is Pass 3, we already handled it above.
                  continue;
                }
                const intent = intentMap.get(cmd.nodeId || cmd.refId);


                if (cmd.gap !== undefined) {
                  if (frame.layoutMode === 'GRID') {
                    (frame as any).gridColumnGap = cmd.gap;
                    (frame as any).gridRowGap = cmd.gap;
                  } else {
                    frame.itemSpacing = cmd.gap;
                  }
                }

                // Grid specific settings
                if (frame.layoutMode === 'GRID') {
                  const fGrid = frame as any;

                  // Default container height to HUG
                  if ('layoutSizingVertical' in fGrid) fGrid.layoutSizingVertical = 'HUG';
                  else frame.counterAxisSizingMode = 'AUTO';

                  // Default grid cell width to FILL (FLEX) and height to HUG if not provided
                  if (cmd.gridColumnSizes === undefined) {
                    fGrid.gridColumnSizes = [{ type: 'FLEX', value: 1 }];
                  }
                  if (cmd.gridRowSizes === undefined) {
                    fGrid.gridRowSizes = [{ type: 'HUG' }];
                  }

                  if (cmd.gridColumnGap !== undefined) fGrid.gridColumnGap = cmd.gridColumnGap;
                  if (cmd.gridRowGap !== undefined) fGrid.gridRowGap = cmd.gridRowGap;

                  if (cmd.gridRowSizes !== undefined) {
                    let sizes = Array.isArray(cmd.gridRowSizes) ? cmd.gridRowSizes.map((size: any) => {
                      if (typeof size === 'number') return { type: 'FIXED', value: size };
                      if (typeof size === 'string') {
                        const type = size.toUpperCase();
                        if (type === 'HUG' || type === 'FLEX' || type === 'FIXED') return { type };
                      }
                      if (size && typeof size === 'object' && typeof size.type === 'string') {
                        return { ...size, type: size.type.toUpperCase() };
                      }
                      return size;
                    }) : null;

                    if (sizes) {
                      const targetCount = cmd.gridRowCount !== undefined ? cmd.gridRowCount : sizes.length;
                      if (sizes.length !== targetCount) {
                        if (sizes.length === 1) sizes = Array(targetCount).fill(sizes[0]);
                        else fGrid.gridRowCount = sizes.length;
                      } else {
                        fGrid.gridRowCount = targetCount;
                      }
                      fGrid.gridRowSizes = sizes;
                    }
                  } else if (cmd.gridRowCount !== undefined) {
                    fGrid.gridRowCount = cmd.gridRowCount;
                  }

                  if (cmd.gridColumnSizes !== undefined) {
                    let sizes = Array.isArray(cmd.gridColumnSizes) ? cmd.gridColumnSizes.map((size: any) => {
                      if (typeof size === 'number') return { type: 'FIXED', value: size };
                      if (typeof size === 'string') {
                        const type = size.toUpperCase();
                        if (type === 'HUG' || type === 'FLEX' || type === 'FIXED') return { type };
                      }
                      if (size && typeof size === 'object' && typeof size.type === 'string') {
                        return { ...size, type: size.type.toUpperCase() };
                      }
                      return size;
                    }) : null;

                    if (sizes) {
                      const targetCount = cmd.gridColumnCount !== undefined ? cmd.gridColumnCount : sizes.length;
                      if (sizes.length !== targetCount) {
                        if (sizes.length === 1) sizes = Array(targetCount).fill(sizes[0]);
                        else fGrid.gridColumnCount = sizes.length;
                      } else {
                        fGrid.gridColumnCount = targetCount;
                      }
                      fGrid.gridColumnSizes = sizes;
                    }
                  } else if (cmd.gridColumnCount !== undefined) {
                    fGrid.gridColumnCount = cmd.gridColumnCount;
                  }
                }

                applyAutoLayoutPadding(frame, cmd);

                if (cmd.primaryAxisAlignItems) {
                  const align = typeof cmd.primaryAxisAlignItems === 'string' ? cmd.primaryAxisAlignItems.toUpperCase() : cmd.primaryAxisAlignItems;
                  if (['MIN', 'CENTER', 'MAX', 'SPACE_BETWEEN'].includes(align)) {
                    frame.primaryAxisAlignItems = align;
                  } else if (align === 'SPACE_AROUND' || align === 'SPACE_EVENLY') {
                    // Fallback for AI hallucination
                    frame.primaryAxisAlignItems = 'SPACE_BETWEEN';
                  }
                }
                if (cmd.counterAxisAlignItems) {
                  const align = typeof cmd.counterAxisAlignItems === 'string' ? cmd.counterAxisAlignItems.toUpperCase() : cmd.counterAxisAlignItems;
                  if (['MIN', 'CENTER', 'MAX', 'BASELINE'].includes(align)) {
                    frame.counterAxisAlignItems = align;
                  }
                }

                // Sizing logic: Use modern props and respect intentMap (Pass 0 conflict resolution)
                const f = frame as any;
                const parent = f.parent;
                const parentIsAL = parent && (parent.type === 'FRAME' || parent.type === 'COMPONENT' || parent.type === 'INSTANCE') && parent.layoutMode !== 'NONE';

                const hSizing = intent?.horizontalSizing || cmd.horizontal || (cmd.primaryAxisSizingMode === 'AUTO' ? 'HUG' : (cmd.primaryAxisSizingMode === 'FIXED' ? 'FIXED' : null));
                const vSizing = intent?.verticalSizing || cmd.vertical || (cmd.counterAxisSizingMode === 'AUTO' ? 'HUG' : (cmd.counterAxisSizingMode === 'FIXED' ? 'FIXED' : null));

                if (hSizing) {
                  if (hSizing === 'FILL') {
                    if (parentIsAL) {
                      if ('layoutSizingHorizontal' in f) f.layoutSizingHorizontal = 'FILL';
                      else if (f.layoutMode === 'HORIZONTAL') f.primaryAxisSizingMode = 'FIXED';
                      else f.counterAxisSizingMode = 'FIXED';
                    } else if (parent && 'width' in parent) {
                      // Fallback: parent isn't AL yet — match parent width as FIXED
                      if ('layoutSizingHorizontal' in f) f.layoutSizingHorizontal = 'FIXED';
                      if ('resize' in f) f.resize(parent.width, f.height);
                    }
                  } else if (hSizing === 'HUG') {
                    if ('layoutSizingHorizontal' in f) f.layoutSizingHorizontal = 'HUG';
                    else if (f.layoutMode === 'HORIZONTAL') f.primaryAxisSizingMode = 'AUTO';
                    else f.counterAxisSizingMode = 'AUTO';
                  } else if (hSizing === 'FIXED') {
                    if ('layoutSizingHorizontal' in f) f.layoutSizingHorizontal = 'FIXED';
                    else if (f.layoutMode === 'HORIZONTAL') f.primaryAxisSizingMode = 'FIXED';
                    else f.counterAxisSizingMode = 'FIXED';
                  }
                }

                if (vSizing) {
                  if (vSizing === 'FILL') {
                    if (parentIsAL) {
                      if ('layoutSizingVertical' in f) f.layoutSizingVertical = 'FILL';
                      else if (f.layoutMode === 'VERTICAL') f.primaryAxisSizingMode = 'FIXED';
                      else f.counterAxisSizingMode = 'FIXED';
                    } else if (parent && 'height' in parent) {
                      // Fallback: parent isn't AL yet — match parent height as FIXED
                      if ('layoutSizingVertical' in f) f.layoutSizingVertical = 'FIXED';
                      if ('resize' in f) f.resize(f.width, parent.height);
                    }
                  } else if (vSizing === 'HUG') {
                    if ('layoutSizingVertical' in f) f.layoutSizingVertical = 'HUG';
                    else if (f.layoutMode === 'VERTICAL') f.primaryAxisSizingMode = 'AUTO';
                    else f.counterAxisSizingMode = 'AUTO';
                  } else if (vSizing === 'FIXED') {
                    if ('layoutSizingVertical' in f) f.layoutSizingVertical = 'FIXED';
                    else if (f.layoutMode === 'VERTICAL') f.primaryAxisSizingMode = 'FIXED';
                    else f.counterAxisSizingMode = 'FIXED';
                  }
                }

                if (cmd.layoutWrap) {
                  const wrap = typeof cmd.layoutWrap === 'string' ? cmd.layoutWrap.toUpperCase() : cmd.layoutWrap;
                  if (wrap === 'WRAP' || wrap === 'NO_WRAP') {
                    if (wrap === 'WRAP') {
                      frame.layoutMode = 'HORIZONTAL';
                      if (cmd.counterAxisSpacing === undefined) {
                        frame.counterAxisSpacing = frame.itemSpacing;
                      }
                    }
                    frame.layoutWrap = wrap as 'WRAP' | 'NO_WRAP';
                  }
                }
                if (cmd.counterAxisAlignContent) {
                  const align = typeof cmd.counterAxisAlignContent === 'string' ? cmd.counterAxisAlignContent.toUpperCase() : cmd.counterAxisAlignContent;
                  if (['AUTO', 'SPACE_BETWEEN'].includes(align)) {
                    if (frame.layoutWrap !== 'WRAP') {
                      frame.layoutMode = 'HORIZONTAL';
                      frame.layoutWrap = 'WRAP';
                      if (cmd.counterAxisSpacing === undefined) {
                        frame.counterAxisSpacing = frame.itemSpacing;
                      }
                    }
                    frame.counterAxisAlignContent = align as 'AUTO' | 'SPACE_BETWEEN';
                  }
                }
                if (cmd.counterAxisSpacing !== undefined) frame.counterAxisSpacing = cmd.counterAxisSpacing;

                if (cmd.layoutAlign || cmd.layoutGrow !== undefined) {
                  const parent = frame.parent;
                  const parentIsAL = parent && (parent.type === 'FRAME' || parent.type === 'COMPONENT' || parent.type === 'INSTANCE') && parent.layoutMode !== 'NONE';
                  if (parentIsAL) {
                    if (cmd.layoutAlign) {
                      const align = typeof cmd.layoutAlign === 'string' ? cmd.layoutAlign.toUpperCase() : cmd.layoutAlign;
                      if (['MIN', 'CENTER', 'MAX', 'STRETCH', 'INHERIT'].includes(align)) {
                        frame.layoutAlign = align;
                      }
                    }
                    if (cmd.layoutGrow !== undefined) {
                      frame.layoutGrow = cmd.layoutGrow ? 1 : 0;
                    }
                  }
                }

                if (frame.layoutMode === 'GRID' && 'children' in frame) {
                  const children = [...frame.children] as SceneNode[];
                  const autoChildren = children.filter(child => {
                    const childRefId = 'getPluginData' in child ? child.getPluginData('refId') : null;
                    const childIntent = intentMap.get(child.id) || (childRefId ? intentMap.get(childRefId) : null);
                    const isAbsolute = (child as any).layoutPositioning === 'ABSOLUTE' || (childIntent && childIntent.isAbsolute);
                    if (!isAbsolute && 'layoutPositioning' in child) {
                      (child as any).layoutPositioning = 'AUTO';
                    }
                    return !isAbsolute;
                  });

                  const hAlign = cmd.gridChildHorizontalAlign ? cmd.gridChildHorizontalAlign.toUpperCase() : null;
                  const vAlign = cmd.gridChildVerticalAlign ? cmd.gridChildVerticalAlign.toUpperCase() : null;
                  if (hAlign || vAlign) {
                    for (const child of autoChildren) {
                      if (hAlign && ['MIN', 'CENTER', 'MAX', 'AUTO'].includes(hAlign) && 'gridChildHorizontalAlign' in child) {
                        (child as any).gridChildHorizontalAlign = hAlign;
                      }
                      if (vAlign && ['MIN', 'CENTER', 'MAX', 'AUTO'].includes(vAlign) && 'gridChildVerticalAlign' in child) {
                        (child as any).gridChildVerticalAlign = vAlign;
                      }
                    }
                  }

                  const columnCount = Number.isFinite((frame as any).gridColumnCount) ? Math.max(1, (frame as any).gridColumnCount) : null;
                  const rowCount = Number.isFinite((frame as any).gridRowCount) ? Math.max(1, (frame as any).gridRowCount) : null;
                  if (columnCount && autoChildren.length > 0) {
                    for (let index = 0; index < autoChildren.length; index++) {
                      const child = autoChildren[index];
                      const rowIndex = Math.floor(index / columnCount);
                      const columnIndex = index % columnCount;
                      if (rowCount && rowIndex >= rowCount) break;
                      if ('setGridChildPosition' in child) {
                        try {
                          (child as any).setGridChildPosition(rowIndex, columnIndex);
                        } catch (err) {
                          // Ignore placement errors (e.g., overlaps or bounds) to avoid aborting the command
                        }
                      }
                    }
                  }
                }

                success++;
              } else {
                failed++;
              }
              break;

            case 'setSizing':
              if ('layoutSizingHorizontal' in node || 'layoutSizingVertical' in node || 'layoutAlign' in node || 'layoutGrow' in node) {
                const n = node as any;
                const parent = n.parent;
                const parentIsAL = parent && (parent.type === 'FRAME' || parent.type === 'COMPONENT' || parent.type === 'INSTANCE') && parent.layoutMode !== 'NONE';
                const parentALMode = parentIsAL ? parent.layoutMode : null;

                // Protect shapes/icons from FILL sizing which distorts their aspect ratio.
                const isShapeNode = isIconOrShapeNode(n);

                // Lookup intent for conflict resolution (Pass 0 rules)
                const intent = intentMap.get(cmd.nodeId || cmd.refId);
                let hSizing = intent?.horizontalSizing || cmd.horizontal;
                let vSizing = intent?.verticalSizing || cmd.vertical;

                // Force FIXED for shape nodes to prevent distortion
                if (isShapeNode) {
                  if (hSizing === 'FILL') hSizing = 'FIXED';
                  if (vSizing === 'FILL') vSizing = 'FIXED';
                }

                if (hSizing) {
                  if (hSizing === 'FILL') {
                    if (parentIsAL) {
                      if ('layoutSizingHorizontal' in n) n.layoutSizingHorizontal = 'FILL';
                      else if (parentALMode === 'HORIZONTAL') n.layoutGrow = 1;
                      else n.layoutAlign = 'STRETCH';
                    } else if (parent && 'width' in parent) {
                      // Fallback: parent isn't AL yet — match parent width as FIXED
                      if ('layoutSizingHorizontal' in n) n.layoutSizingHorizontal = 'FIXED';
                      if ('resize' in n) n.resize(parent.width, n.height);
                    }
                  } else if (hSizing === 'HUG') {
                    if (canSetHug(n)) {
                      if ('layoutSizingHorizontal' in n) n.layoutSizingHorizontal = 'HUG';
                      else if ('primaryAxisSizingMode' in n && n.layoutMode === 'HORIZONTAL') n.primaryAxisSizingMode = 'AUTO';
                      else if ('counterAxisSizingMode' in n && n.layoutMode === 'VERTICAL') n.counterAxisSizingMode = 'AUTO';
                    }
                  } else if (hSizing === 'FIXED') {
                    if ('layoutSizingHorizontal' in n) n.layoutSizingHorizontal = 'FIXED';
                    else if ('primaryAxisSizingMode' in n && n.layoutMode === 'HORIZONTAL') n.primaryAxisSizingMode = 'FIXED';
                    else if ('counterAxisSizingMode' in n && n.layoutMode === 'VERTICAL') n.counterAxisSizingMode = 'FIXED';
                    if (cmd.width !== undefined) {
                      if ('resize' in n) n.resize(cmd.width, n.height);
                    }
                  }
                }
                if (vSizing) {
                  if (vSizing === 'FILL') {
                    if (parentIsAL) {
                      if ('layoutSizingVertical' in n) n.layoutSizingVertical = 'FILL';
                      else if (parentALMode === 'VERTICAL') n.layoutGrow = 1;
                      else n.layoutAlign = 'STRETCH';
                    } else if (parent && 'height' in parent) {
                      // Fallback: parent isn't AL yet — match parent height as FIXED
                      if ('layoutSizingVertical' in n) n.layoutSizingVertical = 'FIXED';
                      if ('resize' in n) n.resize(n.width, parent.height);
                    }
                  } else if (vSizing === 'HUG') {
                    if (canSetHug(n)) {
                      if ('layoutSizingVertical' in n) n.layoutSizingVertical = 'HUG';
                      else if ('primaryAxisSizingMode' in n && n.layoutMode === 'VERTICAL') n.primaryAxisSizingMode = 'AUTO';
                      else if ('counterAxisSizingMode' in n && n.layoutMode === 'HORIZONTAL') n.counterAxisSizingMode = 'AUTO';
                    }
                  } else if (vSizing === 'FIXED') {
                    if ('layoutSizingVertical' in n) n.layoutSizingVertical = 'FIXED';
                    else if ('primaryAxisSizingMode' in n && n.layoutMode === 'VERTICAL') n.primaryAxisSizingMode = 'FIXED';
                    else if ('counterAxisSizingMode' in n && n.layoutMode === 'HORIZONTAL') n.counterAxisSizingMode = 'FIXED';
                    if (cmd.height !== undefined) {
                      if ('resize' in n) n.resize(n.width, cmd.height);
                    }
                  }
                }

                if (cmd.layoutAlign) {
                  const align = typeof cmd.layoutAlign === 'string' ? cmd.layoutAlign.toUpperCase() : cmd.layoutAlign;
                  if (['MIN', 'CENTER', 'MAX', 'STRETCH', 'INHERIT'].includes(align)) {
                    n.layoutAlign = align;
                  }
                }
                if (cmd.layoutGrow !== undefined) {
                  // Explicitly coerce to 0 or 1 to avoid validation errors
                  n.layoutGrow = cmd.layoutGrow ? 1 : 0;
                }
                if (cmd.layoutPositioning) {
                  const pos = typeof cmd.layoutPositioning === 'string' ? cmd.layoutPositioning.toUpperCase() : cmd.layoutPositioning;
                  if (pos === 'ABSOLUTE' || pos === 'AUTO') {
                    // Only set ABSOLUTE if parent is Auto Layout
                    if (pos === 'ABSOLUTE') {
                      if (parentIsAL) n.layoutPositioning = 'ABSOLUTE';
                    } else {
                      n.layoutPositioning = pos;
                    }
                  }
                }

                // Sizing constraints (min/max)
                applySizingConstraints(n, cmd);

                success++;
              } else {
                failed++;
              }
              break;

            case 'setLayoutWrap':
              if ('layoutWrap' in node) {
                const wrapVal = cmd.value !== undefined ? cmd.value : (cmd.wrap !== undefined ? cmd.wrap : cmd.layoutWrap);
                const wrap = typeof wrapVal === 'string' ? wrapVal.toUpperCase() : wrapVal;
                if (wrap === 'WRAP' || wrap === 'NO_WRAP') {
                  const frame = node as FrameNode;
                  if (wrap === 'WRAP') {
                    frame.layoutMode = 'HORIZONTAL';
                    // Default counterAxisSpacing to itemSpacing if not provided
                    if (cmd.counterAxisSpacing === undefined) {
                      frame.counterAxisSpacing = frame.itemSpacing;
                    }
                  }
                  frame.layoutWrap = wrap as 'WRAP' | 'NO_WRAP';
                  success++;
                } else {
                  failed++;
                }
              } else {
                failed++;
              }
              break;

            case 'setCounterAxisAlignContent':
              if ('counterAxisAlignContent' in node) {
                const alignVal = cmd.value !== undefined ? cmd.value : (cmd.align !== undefined ? cmd.align : cmd.counterAxisAlignContent);
                const align = typeof alignVal === 'string' ? alignVal.toUpperCase() : alignVal;
                if (['AUTO', 'SPACE_BETWEEN'].includes(align)) {
                  const frame = node as FrameNode;
                  if (frame.layoutWrap !== 'WRAP') {
                    frame.layoutMode = 'HORIZONTAL';
                    frame.layoutWrap = 'WRAP';
                    // Default counterAxisSpacing to itemSpacing if not provided
                    if (cmd.counterAxisSpacing === undefined) {
                      frame.counterAxisSpacing = frame.itemSpacing;
                    }
                  }
                  frame.counterAxisAlignContent = align as 'AUTO' | 'SPACE_BETWEEN';
                  success++;
                } else {
                  failed++;
                }
              } else {
                failed++;
              }
              break;

            case 'setMinWidth':
              if ('minWidth' in node) {
                const val = cmd.value !== undefined ? cmd.value : cmd.minWidth;
                if (val !== undefined) {
                  applySizingConstraints(node, { minWidth: val });
                  success++;
                } else {
                  failed++;
                }
              } else {
                failed++;
              }
              break;

            case 'setMaxWidth':
              if ('maxWidth' in node) {
                const val = cmd.value !== undefined ? cmd.value : cmd.maxWidth;
                if (val !== undefined) {
                  applySizingConstraints(node, { maxWidth: val });
                  success++;
                } else {
                  failed++;
                }
              } else {
                failed++;
              }
              break;

            case 'setMinHeight':
              if ('minHeight' in node) {
                const val = cmd.value !== undefined ? cmd.value : cmd.minHeight;
                if (val !== undefined) {
                  applySizingConstraints(node, { minHeight: val });
                  success++;
                } else {
                  failed++;
                }
              } else {
                failed++;
              }
              break;

            case 'setMaxHeight':
              if ('maxHeight' in node) {
                const val = cmd.value !== undefined ? cmd.value : cmd.maxHeight;
                if (val !== undefined) {
                  applySizingConstraints(node, { maxHeight: val });
                  success++;
                } else {
                  failed++;
                }
              } else {
                failed++;
              }
              break;

            case 'removeAutoLayout':
              if (node.type === 'FRAME') {
                (node as FrameNode).layoutMode = 'NONE';
                success++;
              } else {
                failed++;
              }
              break;

            case 'addLayoutGrid':
              if (node.type === 'FRAME' || node.type === 'COMPONENT') {
                const gridFrame = node as FrameNode;
                const gridColor = cmd.color ? parseHexColor(cmd.color) : { r: 1, g: 0, b: 0, a: 0.1 };

                let newGrid: LayoutGrid;
                if (cmd.pattern === 'COLUMNS') {
                  newGrid = {
                    pattern: 'COLUMNS',
                    alignment: cmd.alignment || 'STRETCH',
                    gutterSize: cmd.gutter || 20,
                    count: cmd.count || 12,
                    offset: cmd.offset || 0,
                    visible: cmd.visible !== false,
                    color: { r: gridColor.r, g: gridColor.g, b: gridColor.b, a: gridColor.a }
                  } as RowsColsLayoutGrid;
                } else if (cmd.pattern === 'ROWS') {
                  newGrid = {
                    pattern: 'ROWS',
                    alignment: cmd.alignment || 'STRETCH',
                    gutterSize: cmd.gutter || 20,
                    count: cmd.count || 12,
                    offset: cmd.offset || 0,
                    visible: cmd.visible !== false,
                    color: { r: gridColor.r, g: gridColor.g, b: gridColor.b, a: gridColor.a }
                  } as RowsColsLayoutGrid;
                } else {
                  newGrid = {
                    pattern: 'GRID',
                    sectionSize: cmd.size || 8,
                    visible: cmd.visible !== false,
                    color: { r: gridColor.r, g: gridColor.g, b: gridColor.b, a: gridColor.a }
                  } as GridLayoutGrid;
                }
                gridFrame.layoutGrids = [...gridFrame.layoutGrids, newGrid];
                success++;
              } else {
                failed++;
              }
              break;

            case 'clearLayoutGrids':
              if ('layoutGrids' in node) {
                (node as FrameNode).layoutGrids = [];
                success++;
              } else {
                failed++;
              }
              break;

            case 'addExportSetting':
              if ('exportSettings' in node) {
                const exportNode = node as SceneNode & ExportMixin;
                const format = cmd.format || 'PNG';
                let newSetting: ExportSettings;

                if (format === 'SVG') {
                  newSetting = {
                    format: 'SVG',
                    suffix: cmd.suffix || '',
                    contentsOnly: cmd.contentsOnly || false,
                    svgIdAttribute: cmd.svgIdAttribute || false,
                    svgOutlineText: cmd.svgOutlineText !== false,
                    svgSimplifyStroke: cmd.svgSimplifyStroke !== false
                  } as ExportSettingsSVG;
                } else if (format === 'PDF') {
                  newSetting = {
                    format: 'PDF',
                    suffix: cmd.suffix || '',
                    contentsOnly: cmd.contentsOnly || false
                  } as ExportSettingsPDF;
                } else {
                  // PNG or JPG
                  newSetting = {
                    format: format as 'PNG' | 'JPG',
                    suffix: cmd.suffix || '',
                    contentsOnly: cmd.contentsOnly || false,
                    constraint: cmd.scale ? { type: 'SCALE', value: cmd.scale } : { type: 'SCALE', value: 1 }
                  } as ExportSettingsImage;
                }

                exportNode.exportSettings = [...exportNode.exportSettings, newSetting];
                success++;
              } else {
                failed++;
              }
              break;

            case 'clearExportSettings':
              if ('exportSettings' in node) {
                (node as SceneNode & ExportMixin).exportSettings = [];
                success++;
              } else {
                failed++;
              }
              break;

            case 'setMask':
              if ('isMask' in node) {
                (node as any).isMask = cmd.isMask !== false;
                success++;
              } else {
                failed++;
              }
              break;

            case 'appendChild':
            case 'moveTo': {
              const targetParent = await resolveParentSmart(cmd.parentId, cmd.parentName);
              if (targetParent && 'appendChild' in targetParent) {
                (targetParent as ChildrenMixin).appendChild(node);

                // Only apply intended coordinates if parent is NOT auto layout (or child is absolute)
                if (shouldForcePosition(node, targetParent, cmd)) {
                  const intended = (cmd.x !== undefined || cmd.y !== undefined)
                    ? { x: cmd.x, y: cmd.y }
                    : intendedRelativePositions.get(node.id);

                  if (intended) {
                    if (typeof intended.x === 'number') node.x = intended.x;
                    if (typeof intended.y === 'number') node.y = intended.y;
                  }
                }

                success++;
              } else {
                failed++;
              }
              break;
            }

            case 'select':
            case 'selectNodes':
              if (Array.isArray(cmd.nodeIds)) {
                for (const id of cmd.nodeIds) {
                  const targetNode = await resolveNodeSmart(id) as SceneNode | null;
                  if (targetNode) nodesToSelect.push(targetNode);
                }
                success++;
              } else if (node) {
                nodesToSelect.push(node);
                success++;
              } else {
                failed++;
              }
              break;

            case 'flatten':
              if (node.type === 'GROUP' || node.type === 'FRAME' || node.type === 'BOOLEAN_OPERATION') {
                const flattened = figma.flatten([node]);
                if (cmd.name) flattened.name = cmd.name;
                success++;
              } else {
                failed++;
              }
              break;

            case 'setLocked':
              node.locked = cmd.locked !== false;
              success++;
              break;

            case 'focusNode':
            case 'focus-node': {
              const targetNode = node || (cmd.id ? await resolveNodeSmart(cmd.id) : null);
              if (targetNode && targetNode.type !== 'PAGE' && targetNode.type !== 'DOCUMENT') {
                // Find the page this node belongs to and switch if needed
                let current: BaseNode | null = targetNode;
                while (current && current.type !== 'PAGE') {
                  current = current.parent;
                }
                if (current && current.type === 'PAGE' && current !== figma.currentPage) {
                  await figma.setCurrentPageAsync(current as PageNode);
                }

                // Select and scroll into view
                const sceneNode = targetNode as SceneNode;
                figma.currentPage.selection = [sceneNode];
                figma.viewport.scrollAndZoomIntoView([sceneNode]);

                // Ensure it stays selected at the end of execute-commands
                if (!nodesToSelect.includes(sceneNode)) {
                  nodesToSelect.push(sceneNode);
                }
                success++;
              } else {
                failed++;
              }
              break;
            }

            case 'zoomToSelection':
            case 'zoom-to-selection': {
              if (figma.currentPage.selection.length > 0) {
                figma.viewport.scrollAndZoomIntoView(figma.currentPage.selection as SceneNode[]);
                success++;
              } else {
                failed++;
              }
              break;
            }

            case 'setViewport':
            case 'set-viewport': {
              if (cmd.center && typeof cmd.center.x === 'number' && typeof cmd.center.y === 'number') {
                figma.viewport.center = { x: cmd.center.x, y: cmd.center.y };
              }
              if (typeof cmd.zoom === 'number') {
                figma.viewport.zoom = cmd.zoom;
              }
              success++;
              break;
            }

            case 'addRuby':
              if (node.type === 'TEXT') {
                const textNode = node as TextNode;
                const rubyPairs = cmd.rubyPairs || [];

                if (rubyPairs.length === 0) {
                  failed++;
                  break;
                }

                // Get text properties from original
                const baseFontSize = typeof textNode.fontSize === 'number' ? textNode.fontSize : 16;
                const baseFontName = typeof textNode.fontName !== 'symbol' ? textNode.fontName : { family: "Inter", style: "Regular" };
                // Extract text color - always use the actual text node color
                let textColor = { r: 0, g: 0, b: 0 };
                if (textNode.fills && Array.isArray(textNode.fills) && textNode.fills.length > 0) {
                  const firstFill = textNode.fills[0];
                  if (firstFill.type === 'SOLID' && firstFill.color) {
                    textColor = firstFill.color;
                  }
                }
                // Always use text color for ruby to ensure it matches the base text
                // Ignore cmd.rubyColor to prevent color mismatches

                // Load fonts
                await smartLoadFont(baseFontName);

                // Create a hidden measurement node for consistent sizing calculations
                const measurementNode = figma.createText();
                measurementNode.visible = false;
                measurementNode.fontName = baseFontName;
                measurementNode.fontSize = baseFontSize;
                if (typeof textNode.letterSpacing !== 'symbol') {
                  measurementNode.letterSpacing = textNode.letterSpacing as LetterSpacing;
                }
                figma.currentPage.appendChild(measurementNode);
                const measureWidth = (text: string): number => {
                  measurementNode.characters = text || '';
                  return measurementNode.width;
                };

                // Get parent for inserting ruby text nodes
                const parent = textNode.parent;
                if (!parent || !('insertChild' in parent)) {
                  measurementNode.remove();
                  failed++;
                  break;
                }
                let parentHasAutoLayout = false;
                if (parent.type === 'FRAME' || parent.type === 'COMPONENT' || parent.type === 'COMPONENT_SET') {
                  parentHasAutoLayout = parent.layoutMode !== 'NONE';
                }

                // Get the original text content and absolute position
                const originalText = textNode.characters;
                const textNodeLocalX = textNode.relativeTransform[0][2];
                const textNodeLocalY = textNode.relativeTransform[1][2];

                // Ruby positioning settings
                const rubyGap = cmd.rubyGap || 2; // Gap between ruby and base text
                const defaultRubyRatio = cmd.rubyFontSizeRatio || 0.5; // Default ruby size ratio

                // Determine wrapping width based on auto-resize mode
                const autoResizeMode = textNode.textAutoResize || 'NONE';
                const maxLineWidth = (autoResizeMode === 'HEIGHT' || autoResizeMode === 'NONE') ? textNode.width : Infinity;

                // Build maps for line info (supports manual line breaks + auto wrapping)
                const charToLineMap: { lineIndex: number; posInLine: number }[] = [];
                const lineTexts: string[] = [''];
                const lineWidths: number[] = [];
                const lineStartIndices: number[] = [0];

                let lineIndex = 0;
                const wrapTolerance = 0.5;

                for (let i = 0; i < originalText.length; i++) {
                  const ch = originalText[i];

                  if (ch === '\n') {
                    lineWidths[lineIndex] = measureWidth(lineTexts[lineIndex]);
                    charToLineMap[i] = { lineIndex, posInLine: lineTexts[lineIndex].length };
                    lineIndex++;
                    lineTexts[lineIndex] = '';
                    lineStartIndices[lineIndex] = i + 1;
                    continue;
                  }

                  const prospectiveText = lineTexts[lineIndex] + ch;
                  const prospectiveWidth = measureWidth(prospectiveText);

                  if (maxLineWidth !== Infinity && prospectiveWidth > maxLineWidth + wrapTolerance && lineTexts[lineIndex].length > 0) {
                    // Wrap before adding this character
                    lineWidths[lineIndex] = measureWidth(lineTexts[lineIndex]);
                    lineIndex++;
                    lineTexts[lineIndex] = ch;
                    lineStartIndices[lineIndex] = i;
                    charToLineMap[i] = { lineIndex, posInLine: lineTexts[lineIndex].length - 1 };
                  } else {
                    lineTexts[lineIndex] = prospectiveText;
                    charToLineMap[i] = { lineIndex, posInLine: lineTexts[lineIndex].length - 1 };
                  }
                }

                // Capture last line width
                lineWidths[lineIndex] = measureWidth(lineTexts[lineIndex]);

                // Compute per-line heights (respecting text styles)
                const lineHeights: number[] = [];
                const naturalHeights: number[] = []; // Actual glyph height (auto line height)
                const topLeadingOffsets: number[] = []; // Leading above glyphs per line
                const lineYOffsets: number[] = [];
                let cumulativeY = 0;
                const defaultLineHeight = baseFontSize * 1.2;

                // Create a temporary text node to measure actual line height when AUTO
                const lineHeightMeasureNode = figma.createText();
                lineHeightMeasureNode.visible = false;
                lineHeightMeasureNode.fontName = baseFontName;
                lineHeightMeasureNode.fontSize = baseFontSize;
                if (typeof textNode.letterSpacing !== 'symbol') {
                  lineHeightMeasureNode.letterSpacing = textNode.letterSpacing as LetterSpacing;
                }
                // Copy line height setting to match the original
                if (typeof textNode.lineHeight !== 'symbol') {
                  lineHeightMeasureNode.lineHeight = textNode.lineHeight;
                }
                figma.currentPage.appendChild(lineHeightMeasureNode);

                for (let idx = 0; idx <= lineIndex; idx++) {
                  const startCharIndex = lineStartIndices[idx] ?? 0;
                  let lineHeight = defaultLineHeight;
                  let naturalHeight = defaultLineHeight;

                  if (startCharIndex < originalText.length) {
                    const lh = textNode.getRangeLineHeight(startCharIndex, Math.min(startCharIndex + 1, originalText.length));
                    if (lh !== figma.mixed && typeof lh !== 'symbol') {
                      if (lh.unit === 'PIXELS') {
                        lineHeight = lh.value;
                      } else if (lh.unit === 'PERCENT') {
                        lineHeight = baseFontSize * (lh.value / 100);
                      } else if (lh.unit === 'AUTO') {
                        // When AUTO, measure actual rendered line height
                        const lineText = lineTexts[idx] || 'A';
                        lineHeightMeasureNode.characters = lineText;
                        lineHeight = lineHeightMeasureNode.height;
                      }
                    } else if (typeof textNode.lineHeight !== 'symbol') {
                      // fallback to node-level line height if set
                      if (textNode.lineHeight.unit === 'PIXELS') {
                        lineHeight = textNode.lineHeight.value;
                      } else if (textNode.lineHeight.unit === 'PERCENT') {
                        lineHeight = baseFontSize * (textNode.lineHeight.value / 100);
                      } else if (textNode.lineHeight.unit === 'AUTO') {
                        // When AUTO, measure actual rendered line height
                        const lineText = lineTexts[idx] || 'A';
                        lineHeightMeasureNode.characters = lineText;
                        lineHeight = lineHeightMeasureNode.height;
                      }
                    } else {
                      // No line height specified, measure actual rendered height
                      const lineText = lineTexts[idx] || 'A';
                      lineHeightMeasureNode.characters = lineText;
                      lineHeight = lineHeightMeasureNode.height;
                    }
                  }
                  // Measure natural glyph height (AUTO line height) to compute leading
                  const naturalText = lineTexts[idx] || 'A';
                  lineHeightMeasureNode.lineHeight = { unit: 'AUTO' };
                  lineHeightMeasureNode.characters = naturalText;
                  naturalHeight = lineHeightMeasureNode.height;
                  // Restore the node's line height so subsequent measurements remain accurate
                  if (typeof textNode.lineHeight !== 'symbol') {
                    lineHeightMeasureNode.lineHeight = textNode.lineHeight;
                  }

                  lineHeights[idx] = lineHeight;
                  naturalHeights[idx] = naturalHeight;
                  topLeadingOffsets[idx] = Math.max(0, (lineHeight - naturalHeight) / 2);
                  lineYOffsets[idx] = cumulativeY;
                  cumulativeY += lineHeight;
                }

                // Clean up line height measurement node
                lineHeightMeasureNode.remove();

                // Precompute line origin X positions accounting for alignment
                const nodeBaseX = textNodeLocalX;
                const nodeBaseY = textNodeLocalY;
                const nodeWidth = textNode.width;
                const textAlign = textNode.textAlignHorizontal || 'LEFT';
                const lineOriginXs: number[] = [];

                for (let idx = 0; idx <= lineIndex; idx++) {
                  const currentLineWidth = lineWidths[idx] || 0;
                  let originX = nodeBaseX;
                  if (textAlign === 'CENTER') {
                    originX = nodeBaseX + (nodeWidth / 2) - (currentLineWidth / 2);
                  } else if (textAlign === 'RIGHT') {
                    originX = nodeBaseX + nodeWidth - currentLineWidth;
                  }
                  lineOriginXs[idx] = originX;
                }

                // Track search position for finding each kanji in text
                let searchPos = 0;

                // Process each ruby pair
                for (const pair of rubyPairs) {
                  const baseText = pair.base || '';
                  const rubyText = pair.ruby || '';

                  if (!baseText || !rubyText) continue;

                  // Skip placeholder/unknown readings
                  if (rubyText.toLowerCase() === 'unknown' || rubyText === '???') continue;

                  // Find this kanji in the original text
                  const foundIndex = originalText.indexOf(baseText, searchPos);
                  if (foundIndex === -1) continue;

                  // Get line info for this character position
                  const lineInfo = charToLineMap[foundIndex];
                  if (!lineInfo) {
                    searchPos = foundIndex + baseText.length;
                    continue;
                  }

                  const currentLineIndex = lineInfo.lineIndex;
                  const lineText = lineTexts[currentLineIndex] || '';
                  const positionInLine = lineInfo.posInLine;

                  // Calculate x-offset by measuring characters before this position ON THE SAME LINE
                  const prefix = positionInLine > 0 ? lineText.substring(0, positionInLine) : '';
                  const xOffset = prefix ? measureWidth(prefix) : 0;

                  // Calculate y-offset based on line number
                  const yOffset = lineYOffsets[currentLineIndex] || 0;
                  const topLeading = topLeadingOffsets[currentLineIndex] || 0;

                  // Calculate the width of this kanji group
                  const tempBaseText = figma.createText();
                  tempBaseText.fontName = baseFontName;
                  tempBaseText.fontSize = baseFontSize;
                  tempBaseText.characters = baseText;
                  const baseWidth = tempBaseText.width;
                  tempBaseText.remove();

                  // Calculate dynamic ruby font size based on base kanji width
                  // Start with default ratio, then scale down if ruby is too wide
                  const rubyFontSize = cmd.rubyFontSize || Math.round(baseFontSize * defaultRubyRatio);

                  // Create ruby text node
                  const rubyNode = figma.createText();
                  rubyNode.fontName = baseFontName;
                  rubyNode.fontSize = rubyFontSize;
                  rubyNode.characters = rubyText;
                  // Always use the same color as the base text
                  rubyNode.fills = [{ type: 'SOLID', color: { r: textColor.r, g: textColor.g, b: textColor.b } }];
                  rubyNode.name = `ruby: ${rubyText}`;

                  // If ruby is wider than base, scale down the font size dynamically
                  if (rubyNode.width > baseWidth && baseWidth > 0) {
                    const scaleFactor = baseWidth / rubyNode.width;
                    const adjustedFontSize = Math.max(6, Math.floor(rubyFontSize * scaleFactor));
                    rubyNode.fontSize = adjustedFontSize;
                  }

                  const rubyWidth = rubyNode.width;
                  const rubyHeight = rubyNode.height;

                  // Determine line origin considering alignment
                  const lineOriginX = lineOriginXs[currentLineIndex] ?? nodeBaseX;

                  // Calculate target position
                  const targetX = lineOriginX + xOffset + (baseWidth - rubyWidth) / 2;
                  const targetY = nodeBaseY + yOffset + topLeading - rubyHeight - rubyGap;

                  // Insert ruby node into the same parent as the text node FIRST
                  // (layoutPositioning can only be set after node is a child of auto-layout parent)
                  const textNodeIndex = (parent as ChildrenMixin).children.indexOf(textNode);
                  (parent as ChildrenMixin).insertChild(textNodeIndex, rubyNode);

                  // Now set positioning properties after insertion
                  if (parentHasAutoLayout) {
                    rubyNode.layoutPositioning = 'ABSOLUTE';
                    rubyNode.constraints = { horizontal: 'MIN', vertical: 'MIN' };
                  } else {
                    rubyNode.constraints = {
                      horizontal: textNode.constraints.horizontal,
                      vertical: textNode.constraints.vertical
                    };
                  }

                  // Set position after layoutPositioning is configured
                  rubyNode.x = targetX;
                  rubyNode.y = targetY;

                  // Move search position past this kanji
                  searchPos = foundIndex + baseText.length;
                }

                // Clean up measurement node
                measurementNode.remove();

                // Original text is kept as-is with all non-kanji parts intact
                success++;
              } else {
                failed++;
              }
              break;

            case 'addAnnotation': {
              if ('annotations' in (node as any)) {
                // Fetch and clean existing annotations to satisfy Figma's validation (Only one of label or labelMarkdown)
                const existingRaw = ((node as any).annotations || []) as any[];
                const existing = existingRaw.map(ann => {
                  const cleaned = { ...ann };
                  // If both are present, prioritize labelMarkdown as it's the newer/richer format
                  if (cleaned.label !== undefined && cleaned.labelMarkdown !== undefined) {
                    delete cleaned.label;
                  }
                  return cleaned;
                });

                // Allow labelMarkdown for richer content; use only one of label or labelMarkdown
                const hasMarkdown = typeof cmd.labelMarkdown === 'string' && cmd.labelMarkdown.length > 0;
                const annotationEntry: any = {};
                if (hasMarkdown) {
                  annotationEntry.labelMarkdown = cmd.labelMarkdown;
                } else {
                  annotationEntry.label = cmd.label || 'Note';
                }

                // Sanitize annotation properties to only allow recognized types
                const allowedAnnotationTypes = new Set([
                  'width',
                  'height',
                  'maxWidth',
                  'minWidth',
                  'maxHeight',
                  'minHeight',
                  'fills',
                  'strokes',
                  'effects',
                  'strokeWeight',
                  'cornerRadius',
                  'textStyleId',
                  'textAlignHorizontal',
                  'fontFamily',
                  'fontStyle',
                  'fontSize',
                  'fontWeight',
                  'lineHeight',
                  'letterSpacing',
                  'itemSpacing',
                  'counterAxisSpacing',
                  'padding',
                  'layoutMode',
                  'layoutWrap',
                  'alignItems',
                  'counterAxisAlignContent',
                  'opacity',
                  'mainComponent',
                  'gridRowGap',
                  'gridColumnGap',
                  'gridRowCount',
                  'gridColumnCount',
                  'gridRowAnchorIndex',
                  'gridColumnAnchorIndex',
                  'gridRowSpan',
                  'gridColumnSpan'
                ]);

                const incomingProps = Array.isArray(cmd.properties) ? cmd.properties : [];
                const safeProps = incomingProps.filter((p: any) => p && allowedAnnotationTypes.has(p.type));
                annotationEntry.properties = safeProps;

                (node as any).annotations = [...existing, annotationEntry];
                success++;
              } else {
                failed++;
              }
              break;
            }

            case 'removeAnnotation':
              if ('annotations' in (node as any)) {
                const existing = ((node as any).annotations || []) as any[];
                const index = cmd.index ?? -1;
                if (index >= 0 && index < existing.length) {
                  existing.splice(index, 1);
                  (node as any).annotations = existing;
                  success++;
                } else {
                  failed++;
                }
              } else {
                failed++;
              }
              break;

            case 'clearAnnotations':
              if ('annotations' in (node as any)) {
                (node as any).annotations = [];
                success++;
              } else {
                failed++;
              }
              break;

            default:
              failed++;
          }
        } catch (error) {
          console.error('Command execution error:', error);
          if (!firstError) {
            firstError = { action: cmd?.action, nodeId: cmd?.nodeId, message: (error as Error)?.message || 'Command execution error' };
          }
          failed++;
        } finally {
          const status = success > initialSuccess ? 'success' : (failed > initialFailed ? 'failed' : 'skipped');
          const nodeSafeId = (node && !node.removed) ? node.id : null;
          const refNode = cmd.refId ? createdNodes.get(cmd.refId) : null;
          const refSafeId = (refNode && !refNode.removed) ? refNode.id : null;
          const idNode = cmd.nodeId ? createdNodes.get(cmd.nodeId) : null;
          const idSafeId = (idNode && !idNode.removed) ? idNode.id : null;

          const resolvedId = nodeSafeId || refSafeId || idSafeId;
          const afterValue = getBeforeValue(node, cmd.action);

          // Use the node's actual name if available for modifications to avoid redundancy with values
          let displayName = cmd.name || '';
          if (!displayName && node && !node.removed && !creationActions.has(cmd.action)) {
            try {
              displayName = node.name;
            } catch (e) {
              displayName = cmd.refId || 'Deleted Node';
            }
          }
          if (!displayName) {
            displayName = cmd.refId || '';
          }
          // Only fallback to text/payload if we don't have a better identity and aren't showing a change
          if (!displayName && !beforeValue) {
            displayName = cmd.text || '';
          }

          const duration = Date.now() - startTime;

          commandDetails.push({
            action: cmd.action,
            name: displayName,
            status: status,
            nodeId: resolvedId,
            preview: getCommandPreview(cmd),
            before: beforeValue,
            after: afterValue,
            duration: duration
          });
        }
      }

      // Pass 4.5: Auto-fix text sizing and icon sizing for created nodes
      // Text nodes in auto-layout parents should use FILL horizontal for multi-line content.
      // Icon nodes should always use FIXED sizing.
      if (!executionCancelled) {
        let pass45Count = 0;
        for (const [refId, node] of createdNodes) {
          if (executionCancelled) break;
          if (!node || node.removed) continue;

          // A. Text node auto-FILL: If a text node is in an auto-layout parent and
          // still has HUG horizontal, but its content is likely multi-line, switch to FILL.
          if (node.type === 'TEXT' && node.parent && node.parent.type === 'FRAME') {
            const parent = node.parent as FrameNode;
            if (parent.layoutMode !== 'NONE') {
              const textNode = node as TextNode;
              if (textNode.layoutSizingHorizontal === 'HUG') {
                const chars = textNode.characters || '';
                if (chars.length > 40 || chars.includes('\n')) {
                  try {
                    textNode.layoutSizingHorizontal = 'FILL';
                  } catch (e) {
                    // Ignore if the node doesn't support this
                  }
                }
              }
            }
          }

          // B. Icon/shape node auto-FIXED: Ensure icon-like and shape nodes retain FIXED sizing
          // so they don't get stretched inside auto-layout parents.
          const intent = intentMap.get(refId) || Array.from(intentMap.values()).find(i => createdNodes.get(i.refId)?.id === node.id);
          const shouldForceFixed = (intent && intent.isIcon) || isIconOrShapeNode(node);
          if (shouldForceFixed && 'layoutSizingHorizontal' in node) {
            const n = node as any;
            if (n.layoutSizingHorizontal === 'FILL' || n.layoutSizingVertical === 'FILL') {
              try {
                n.layoutSizingHorizontal = 'FIXED';
                n.layoutSizingVertical = 'FIXED';
              } catch (e) {
                // Ignore if the node doesn't support this
              }
            }
          }
          // Yield periodically to keep Figma responsive
          pass45Count++;
          if (pass45Count % 10 === 0) {
            await yieldAndCheck();
          }
        }
      }

      // Pass 5: Minimal Safety Enforcement (Linter Pass)
      // Only fix missing auto layout, never override explicit intent.
      if (!executionCancelled) {
        for (const node of createdNodes.values()) {
          if (executionCancelled) break;
          if (node && !node.removed && typeof node === 'object' && node.type === 'FRAME') {
            const frame = node as FrameNode;
            const intent = intentMap.get(frame.id) || Array.from(intentMap.values()).find(i => createdNodes.get(i.refId)?.id === frame.id);

            if (!intent) continue;
            if (intent.isIcon || isIconOrShapeNode(frame)) continue;

            // Only apply if frame has children and NO layout mode was set by Pass 3
            if (frame.children.length > 0 && frame.layoutMode === 'NONE') {
              console.log(`Safety Net: Applying fallback Auto Layout to orphan frame ${frame.name}`);
              const beforeValue = 'None';

              // Guess direction ONLY as a last resort
              let fallbackMode: 'HORIZONTAL' | 'VERTICAL' = 'VERTICAL';
              if (frame.children.length > 1) {
                const children = [...frame.children];
                let xDiffTotal = 0;
                let yDiffTotal = 0;
                for (let j = 0; j < children.length - 1; j++) {
                  xDiffTotal += Math.abs(children[j + 1].x - children[j].x);
                  yDiffTotal += Math.abs(children[j + 1].y - children[j].y);
                }
                if (xDiffTotal > yDiffTotal) fallbackMode = 'HORIZONTAL';
              }

              frame.layoutMode = fallbackMode;

              // Only set HUG if it's not a root
              if (!intent.isRoot) {
                frame.primaryAxisSizingMode = 'AUTO';
                frame.counterAxisSizingMode = 'AUTO';
              }

              frame.itemSpacing = 16;
              frame.paddingTop = 16;
              frame.paddingRight = 16;
              frame.paddingBottom = 16;
              frame.paddingLeft = 16;

              const afterValue = `${fallbackMode} (p:16, gap:16)`;
              commandDetails.push({
                action: 'autoLayoutSafetyNet',
                name: frame.name,
                status: 'success',
                nodeId: frame.id,
                preview: 'p:16 gap:16',
                before: beforeValue,
                after: afterValue
              });
            }
          }
        }
      }

      // Toast notification for errors
      if (failed > 0 && success === 0) {
        const detail = firstError ? ` (${firstError.action || 'unknown'}: ${firstError.message})` : '';
        figma.notify(`${failed} command(s) failed${detail}`, { error: true });
      } else if (failed > 0) {
        const detail = firstError ? ` (${firstError.action || 'unknown'}: ${firstError.message})` : '';
        figma.notify(`${success} succeeded, ${failed} failed${detail}`, { timeout: 2000 });
      }

      // Select the rectangle frame if one was created, or apply explicit selections
      if (nodesToSelect.length > 0) {
        figma.currentPage.selection = nodesToSelect;
      } else if (rectangleFrame) {
        figma.currentPage.selection = [rectangleFrame];
      }

      // Post-execution: Create responsive clones if metadata provided
      if (metadata && metadata.additionalSizes && Array.isArray(metadata.additionalSizes) && metadata.additionalSizes.length > 0) {
        // Find the root frame from created nodes
        // A root is a frame that has no parent in our intent graph
        const rootNode = Array.from(createdNodes.values()).find(node => {
          if (node && typeof node === 'object' && node.type === 'FRAME') {
            const frameId = node.id;
            // Check intentMap for this ID or its refId
            const intent = Array.from(intentMap.values()).find(i => i.isRoot && (i.refId === frameId || (createdNodes.get(i.refId)?.id === frameId)));
            return !!intent;
          }
          return false;
        }) as FrameNode | undefined;

        if (rootNode) {
          console.log('Generating responsive clones for sizes:', metadata.additionalSizes);
          let currentX = rootNode.x + rootNode.width + 100;
          for (const sizeStr of metadata.additionalSizes) {
            const parts = sizeStr.split('x');
            const w = parseInt(parts[0]);
            const h = parts.length > 1 ? parseInt(parts[1]) : rootNode.height;
            if (isNaN(w)) continue;

            const clone = rootNode.clone();
            clone.x = currentX;
            clone.y = rootNode.y;
            clone.resize(w, h);
            clone.name = `${rootNode.name} (${sizeStr})`;

            currentX += w + 100;
            if (rootNode.parent) {
              rootNode.parent.appendChild(clone);
            }
          }
        }
      }

      // Multi-page horizontal spacing: position top-level page frames side by side
      if (metadata && metadata.multiPageHorizontalSpacing) {
        const screenWidth = (metadata.screenWidth as number) || 1440;
        const GAP = 200;

        const pageFrames: FrameNode[] = [];
        for (const [, node] of createdNodes) {
          if (node && !node.removed && node.type === 'FRAME' && node.parent === figma.currentPage) {
            pageFrames.push(node as FrameNode);
          }
        }

        if (pageFrames.length > 1) {
          // Sort by current x position so the leftmost frame is index 0
          pageFrames.sort((a, b) => a.x - b.x);
          const baseX = pageFrames[0].x;
          const baseY = pageFrames[0].y;
          for (let i = 0; i < pageFrames.length; i++) {
            pageFrames[i].x = baseX + i * (screenWidth + GAP);
            pageFrames[i].y = baseY;
          }
        }
      }


      // Commit this batch of commands to undo history
      figma.commitUndo();

      figma.ui.postMessage({
        type: 'commands-executed',
        success,
        failed,
        error: firstError,
        commands: commandDetails
      });
      break;
    }

    case 'save-audit-settings': {
      try {
        const settings = (msg as any).settings;
        await figma.clientStorage.setAsync(SETTINGS_KEYS.AUDIT_SETTINGS, settings);
        figma.ui.postMessage({ type: 'audit-settings-saved' });
      } catch (error) {
        console.error('Failed to save audit settings:', error);
        figma.ui.postMessage({ type: 'error', message: 'Failed to save audit settings' });
      }
      break;
    }

    case 'save-audit-presets': {
      try {
        const presets = (msg as any).presets;
        await figma.clientStorage.setAsync(SETTINGS_KEYS.AUDIT_PRESETS, presets);
        figma.ui.postMessage({ type: 'audit-presets-saved' });
      } catch (error) {
        console.error('Failed to save audit presets:', error);
        figma.ui.postMessage({ type: 'error', message: 'Failed to save audit presets' });
      }
      break;
    }

    case 'save-chat-archives': {
      try {
        const archives = (msg as any).archives;
        await figma.clientStorage.setAsync(SETTINGS_KEYS.CHAT_ARCHIVES, archives);
        
        // Calculate approximate size to send back for usage meter
        const archivesJson = JSON.stringify(archives);
        const size = archivesJson.length;
        
        figma.ui.postMessage({ 
          type: 'chat-archives-saved',
          size: size
        });
      } catch (error) {
        console.error('Failed to save chat archives:', error);
        figma.ui.postMessage({ type: 'error', message: 'Failed to save chat archives' });
      }
      break;
    }

    case 'save-last-chat-id': {
      try {
        const chatId = (msg as any).chatId;
        await figma.clientStorage.setAsync(SETTINGS_KEYS.LAST_CHAT_ID, chatId);
      } catch (error) {
        console.error('Failed to save last chat ID:', error);
      }
      break;
    }

    case 'save-last-commands-category': {
      try {
        const category = (msg as any).category;
        await figma.clientStorage.setAsync(SETTINGS_KEYS.LAST_COMMANDS_CATEGORY, category);
      } catch (error) {
        console.error('Failed to save last commands category:', error);
      }
      break;
    }

    case 'save-maximized-drawer': {
      try {
        await figma.clientStorage.setAsync(SETTINGS_KEYS.MAXIMIZED_PROMPT_DRAWER_DATA, (msg as any).data);
      } catch (error) {
        console.error('Failed to save maximized drawer data:', error);
      }
      break;
    }

    case 'clear-maximized-drawer': {
      try {
        await figma.clientStorage.setAsync(SETTINGS_KEYS.MAXIMIZED_PROMPT_DRAWER_DATA, null);
      } catch (error) {
        console.error('Failed to clear maximized drawer data:', error);
      }
      break;
    }

    case 'select-node': {
      try {
        const nodeId = (msg as any).nodeId;
        const node = await figma.getNodeByIdAsync(nodeId);
        if (node && node.type !== 'DOCUMENT' && node.type !== 'PAGE') {
          // Switch to page if needed
          let current: BaseNode | null = node;
          while (current && current.type !== 'PAGE') {
            current = current.parent;
          }
          if (current && current.type === 'PAGE' && current !== figma.currentPage) {
            await figma.setCurrentPageAsync(current as PageNode);
          }

          const sceneNode = node as SceneNode;
          figma.currentPage.selection = [sceneNode];
          figma.viewport.scrollAndZoomIntoView([sceneNode]);
        }
      } catch (error) {
        console.error('Failed to select node:', error);
      }
      break;
    }

    case 'get-selection-for-fill': {
      const sel = figma.currentPage.selection;
      const nodes = sel.map(node => {
        const w = 'width' in node ? (node as any).width : 400;
        const h = 'height' in node ? (node as any).height : 400;
        const parentName = node.parent ? node.parent.name : '';
        return {
          id: node.id,
          name: node.name,
          type: node.type,
          width: Math.round(w),
          height: Math.round(h),
          parentName
        };
      });
      figma.ui.postMessage({ type: 'selection-for-fill', nodes });
      break;
    }
  }
};

// Listen for selection changes
figma.on('selectionchange', () => {
  const selection = figma.currentPage.selection;
  const info = selection.map(node => {
    let hasImageFill = false;
    if ('fills' in node && Array.isArray(node.fills)) {
      hasImageFill = node.fills.some((fill: any) => fill.type === 'IMAGE');
    }
    return {
      name: node.name,
      type: node.type,
      id: node.id,
      description: typeof (node as any).description === 'string' ? (node as any).description : undefined,
      hasImageFill
    };
  });
  figma.ui.postMessage({ type: 'selection-changed', data: info });
});
