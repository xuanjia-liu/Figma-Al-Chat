/**
 * Hue Shift quick action.
 * Supports HSL / HSB wheel editing and OKLCH slider editing with realtime sync.
 */

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function mod(value, max) {
  return ((value % max) + max) % max;
}

function srgbToLinear(x) {
  return x <= 0.04045 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4);
}

function linearToSrgb(x) {
  return x <= 0.0031308 ? x * 12.92 : 1.055 * Math.pow(x, 1 / 2.4) - 0.055;
}

function cbrt(x) {
  return x < 0 ? -Math.pow(-x, 1 / 3) : Math.pow(x, 1 / 3);
}

function rgbToOklch(r, g, b) {
  const lr = srgbToLinear(r);
  const lg = srgbToLinear(g);
  const lb = srgbToLinear(b);
  const l = 0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb;
  const m = 0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb;
  const s = 0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb;
  const l_ = cbrt(l);
  const m_ = cbrt(m);
  const s_ = cbrt(s);
  const okL = 0.2104542553 * l_ + 0.793617785 * m_ - 0.0040720468 * s_;
  const a = 1.9779984951 * l_ - 2.428592205 * m_ + 0.4505937099 * s_;
  const b_ = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.808675766 * s_;
  const c = Math.sqrt(a * a + b_ * b_);
  const h = Math.atan2(b_, a) * (180 / Math.PI);
  return { l: okL * 100, c, h: h < 0 ? h + 360 : h };
}

function oklchToRgb(l, c, h) {
  const lN = l / 100;
  const hRad = (h * Math.PI) / 180;
  const a = c * Math.cos(hRad);
  const b_ = c * Math.sin(hRad);
  const l_ = lN + 0.3963377774 * a + 0.2158037573 * b_;
  const m_ = lN - 0.1055613458 * a - 0.0638541728 * b_;
  const s_ = lN - 0.0894841775 * a - 1.291485548 * b_;
  const lC = l_ * l_ * l_;
  const mC = m_ * m_ * m_;
  const sC = s_ * s_ * s_;
  const linR = 4.0767416621 * lC - 3.3077115913 * mC + 0.2309699292 * sC;
  const linG = -1.2684380046 * lC + 2.6097574011 * mC - 0.3413193965 * sC;
  const linB = -0.0041960863 * lC - 0.7034186147 * mC + 1.707614701 * sC;
  return {
    r: clamp(linearToSrgb(linR), 0, 1),
    g: clamp(linearToSrgb(linG), 0, 1),
    b: clamp(linearToSrgb(linB), 0, 1),
  };
}

function rgbToHsl(r, g, b) {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;
  let h = 0;
  const l = (max + min) / 2;
  let s = 0;

  if (delta > 0) {
    s = delta / (1 - Math.abs(2 * l - 1));
    switch (max) {
      case r:
        h = 60 * mod((g - b) / delta, 6);
        break;
      case g:
        h = 60 * (((b - r) / delta) + 2);
        break;
      default:
        h = 60 * (((r - g) / delta) + 4);
        break;
    }
  }

  return { h, s: s * 100, l: l * 100 };
}

function hueToRgb(p, q, t) {
  const wrapped = mod(t, 1);
  if (wrapped < 1 / 6) return p + (q - p) * 6 * wrapped;
  if (wrapped < 1 / 2) return q;
  if (wrapped < 2 / 3) return p + (q - p) * (2 / 3 - wrapped) * 6;
  return p;
}

function hslToRgb(h, s, l) {
  const hh = mod(h, 360) / 360;
  const ss = clamp(s / 100, 0, 1);
  const ll = clamp(l / 100, 0, 1);

  if (ss === 0) {
    return { r: ll, g: ll, b: ll };
  }

  const q = ll < 0.5 ? ll * (1 + ss) : ll + ss - ll * ss;
  const p = 2 * ll - q;
  return {
    r: clamp(hueToRgb(p, q, hh + 1 / 3), 0, 1),
    g: clamp(hueToRgb(p, q, hh), 0, 1),
    b: clamp(hueToRgb(p, q, hh - 1 / 3), 0, 1),
  };
}

function rgbToHsv(r, g, b) {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;
  let h = 0;
  const v = max;
  const s = max === 0 ? 0 : delta / max;

  if (delta > 0) {
    switch (max) {
      case r:
        h = 60 * mod((g - b) / delta, 6);
        break;
      case g:
        h = 60 * (((b - r) / delta) + 2);
        break;
      default:
        h = 60 * (((r - g) / delta) + 4);
        break;
    }
  }

  return { h, s: s * 100, v: v * 100 };
}

function hsvToRgb(h, s, v) {
  const hh = mod(h, 360);
  const ss = clamp(s / 100, 0, 1);
  const vv = clamp(v / 100, 0, 1);
  const c = vv * ss;
  const x = c * (1 - Math.abs(((hh / 60) % 2) - 1));
  const m = vv - c;
  let rgbPrime;

  if (hh < 60) rgbPrime = { r: c, g: x, b: 0 };
  else if (hh < 120) rgbPrime = { r: x, g: c, b: 0 };
  else if (hh < 180) rgbPrime = { r: 0, g: c, b: x };
  else if (hh < 240) rgbPrime = { r: 0, g: x, b: c };
  else if (hh < 300) rgbPrime = { r: x, g: 0, b: c };
  else rgbPrime = { r: c, g: 0, b: x };

  return {
    r: clamp(rgbPrime.r + m, 0, 1),
    g: clamp(rgbPrime.g + m, 0, 1),
    b: clamp(rgbPrime.b + m, 0, 1),
  };
}

function hexToRgb(hex) {
  let value = String(hex || '').replace('#', '');
  if (value.length === 3) {
    value = value[0] + value[0] + value[1] + value[1] + value[2] + value[2];
  }
  const intValue = parseInt(value, 16);
  return {
    r: ((intValue >> 16) & 255) / 255,
    g: ((intValue >> 8) & 255) / 255,
    b: (intValue & 255) / 255,
  };
}

function rgbToHex(r, g, b) {
  const toHex = (value) => {
    const result = Math.round(clamp(value, 0, 1) * 255).toString(16);
    return result.length === 1 ? '0' + result : result;
  };
  return ('#' + toHex(r) + toHex(g) + toHex(b)).toUpperCase();
}

function circularAverage(values) {
  if (!Array.isArray(values) || values.length === 0) return 0;
  let sumX = 0;
  let sumY = 0;
  for (const value of values) {
    const radians = (value * Math.PI) / 180;
    sumX += Math.cos(radians);
    sumY += Math.sin(radians);
  }
  if (sumX === 0 && sumY === 0) return values[0] || 0;
  return mod(Math.atan2(sumY, sumX) * (180 / Math.PI), 360);
}

function angularDelta(start, current) {
  return mod(current - start + 180, 360) - 180;
}

const COLOR_MODES = ['hsl', 'hsb', 'oklch'];
const DEFAULT_ADJUST_OPTIONS = {
  fills: true,
  strokes: true,
  dropShadow: true,
  innerShadow: true,
};
const DEFAULT_PRESERVE_OPTIONS = {
  white: true,
  black: true,
  grayscale: true,
};
const MAX_OKLCH_CHROMA = 0.4;
const MIN_HANDLE_RADIUS = 8;
const MAX_HANDLE_RADIUS = 14;
const INNER_RING = 0.15;
const MAX_MERGE_NEAR = 100;
const MAX_MERGE_HUE_DELTA = 48;

function isNear(value, target, epsilon = 0.0001) {
  return Math.abs(value - target) <= epsilon;
}

function isPreservedRgb(rgb, preserveOptions) {
  if (preserveOptions.white && isNear(rgb.r, 1) && isNear(rgb.g, 1) && isNear(rgb.b, 1)) {
    return true;
  }
  if (preserveOptions.black && isNear(rgb.r, 0) && isNear(rgb.g, 0) && isNear(rgb.b, 0)) {
    return true;
  }
  if (preserveOptions.grayscale && isNear(rgb.r, rgb.g) && isNear(rgb.g, rgb.b)) {
    return true;
  }
  return false;
}

function getModeModel(rgb, mode) {
  if (mode === 'hsb') return rgbToHsv(rgb.r, rgb.g, rgb.b);
  if (mode === 'oklch') return rgbToOklch(rgb.r, rgb.g, rgb.b);
  return rgbToHsl(rgb.r, rgb.g, rgb.b);
}

function modelToRgb(mode, model) {
  if (mode === 'hsb') {
    return hsvToRgb(model.h, model.s, model.v);
  }
  if (mode === 'oklch') {
    return oklchToRgb(model.l, model.c, model.h);
  }
  return hslToRgb(model.h, model.s, model.l);
}

export function mountHueShift(container, options = {}) {
  const { postMessage, showToast, onValuesChanged, tu } = options;
  const sendMessage = typeof postMessage === 'function'
    ? postMessage
    : (msg) => parent.postMessage({ pluginMessage: msg }, '*');
  const translate = typeof tu === 'function' ? tu : (key, fallback) => fallback || key;

  let disposed = false;
  let colorMode = 'hsl';
  let linked = true;
  let colors = [];
  let mergeNear = 0;
  let mergeGroupingBasis = [];
  let mergeGroupDefs = [];
  let activePaletteIndex = -1;
  let adjustOptions = { ...DEFAULT_ADJUST_OPTIONS };
  let preserveOptions = { ...DEFAULT_PRESERVE_OPTIONS };
  let dragSession = null;
  let controlSession = null;
  let requestId = 0;
  let pendingColorRequest = null;
  let wheelCanvas = null;
  let overlayCanvas = null;
  let wheelCtx = null;
  let overlayCtx = null;
  let wheelSize = 0;
  let wheelRadius = 0;
  let centerX = 0;
  let centerY = 0;
  let controlsWrap = null;
  let settingsPopover = null;
  let settingsBtn = null;
  let resetBtn = null;
  let colorPickerPopover = null;
  let paletteSelect = null;
  let linkBtn = null;
  let linkLabelText = null;
  let wheelWrap = null;
  let paletteBar = null;
  let paletteBarLockMask = null;
  let settingsSections = {};
  let modeButtons = {};
  let targetButtons = {};
  let preserveButtons = {};
  let controlEls = {};

  container.innerHTML = '';

  const modeRow = document.createElement('div');
  modeRow.className = 'hue-shift-mode-row';
  const modeSegmented = document.createElement('div');
  modeSegmented.className = 'pill-tab-container';
  modeRow.appendChild(modeSegmented);

  const topActions = document.createElement('div');
  topActions.className = 'hue-shift-toolbar-right';
  settingsBtn = document.createElement('button');
  settingsBtn.type = 'button';
  settingsBtn.className = 'hue-shift-btn hue-shift-settings-btn';
  settingsBtn.title = translate('actions.hueShift.settings', 'Settings');
  settingsBtn.setAttribute('aria-label', translate('actions.hueShift.settings', 'Settings'));
  settingsBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"></path></svg>';
  topActions.appendChild(settingsBtn);
  resetBtn = document.createElement('button');
  resetBtn.className = 'hue-shift-btn';
  resetBtn.textContent = translate('actions.hueShift.resetColor', 'Reset Color');
  resetBtn.addEventListener('click', () => {
    if (resetBtn.disabled) return;
    resetColorsToOriginal();
    notifyChanged();
  });
  topActions.appendChild(resetBtn);
  modeRow.appendChild(topActions);
  container.appendChild(modeRow);

  for (const mode of COLOR_MODES) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'pill-tab';
    button.textContent = mode.toUpperCase();
    button.addEventListener('click', () => {
      if (colorMode === mode) return;
      colorMode = mode;
      endInteractiveSessions();
      syncModeUI();
    });
    modeButtons[mode] = button;
    modeSegmented.appendChild(button);
  }

  function createOptionGroup(labelText) {
    const group = document.createElement('div');
    group.className = 'hue-shift-option-group';
    const label = document.createElement('div');
    label.className = 'hue-shift-option-group-label';
    label.textContent = labelText;
    const optionsEl = document.createElement('div');
    optionsEl.className = 'prompt-custom-select-options hue-shift-target-row';
    group.appendChild(label);
    group.appendChild(optionsEl);
    return { group, optionsEl };
  }

  const targetGroup = createOptionGroup('Adjust');
  targetGroup.group.querySelector('.hue-shift-option-group-label').textContent = translate('actions.hueShift.adjust', 'Adjust');
  const targetRow = targetGroup.optionsEl;
  settingsSections.adjust = targetGroup.group;

  const targetDefs = [
    { key: 'fills', label: translate('actions.hueShift.fills', 'Fills') },
    { key: 'strokes', label: translate('actions.hueShift.strokes', 'Strokes') },
    { key: 'dropShadow', label: translate('actions.hueShift.dropShadow', 'Drop shadow') },
    { key: 'innerShadow', label: translate('actions.hueShift.innerShadow', 'Inner shadow') },
  ];

  for (const def of targetDefs) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'prompt-custom-select-option selected';
    button.textContent = def.label;
    button.addEventListener('click', () => {
      adjustOptions[def.key] = !adjustOptions[def.key];
      button.classList.toggle('selected', adjustOptions[def.key]);
      requestColors({ preserveExisting: true, notifyAfterLoad: true });
    });
    targetButtons[def.key] = button;
    targetRow.appendChild(button);
  }

  const preserveGroup = createOptionGroup('Preserve Color');
  preserveGroup.group.querySelector('.hue-shift-option-group-label').textContent = translate('actions.hueShift.preserveColor', 'Preserve Color');
  const preserveRow = preserveGroup.optionsEl;
  settingsSections.preserve = preserveGroup.group;

  const preserveDefs = [
    { key: 'white', label: translate('actions.hueShift.white', 'White') },
    { key: 'black', label: translate('actions.hueShift.black', 'Black') },
    { key: 'grayscale', label: translate('actions.hueShift.grayscale', 'Grayscale') },
  ];

  for (const def of preserveDefs) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `prompt-custom-select-option${preserveOptions[def.key] ? ' selected' : ''}`;
    button.textContent = def.label;
    button.addEventListener('click', () => {
      preserveOptions[def.key] = !preserveOptions[def.key];
      button.classList.toggle('selected', preserveOptions[def.key]);
      requestColors({ preserveExisting: true, notifyAfterLoad: true });
    });
    preserveButtons[def.key] = button;
    preserveRow.appendChild(button);
  }

  const toolbar = document.createElement('div');
  toolbar.className = 'hue-shift-toolbar';

  const paletteLabel = document.createElement('label');
  paletteLabel.className = 'hue-shift-palette-label';
  paletteLabel.textContent = translate('actions.hueShift.palette', 'Palette');

  paletteSelect = document.createElement('select');
  paletteSelect.className = 'hue-shift-palette-select';
  paletteSelect.addEventListener('change', () => {
    if (linked) return;
    const nextValue = paletteSelect.value;
    if (!linked && nextValue === 'all') {
      activePaletteIndex = colors.length > 0 ? 0 : -1;
    } else {
      activePaletteIndex = nextValue === 'all' ? -1 : Number(nextValue);
    }
    endInteractiveSessions();
    refreshSelectionUI();
  });
  paletteLabel.appendChild(paletteSelect);
  toolbar.appendChild(paletteLabel);

  const toolbarActions = document.createElement('div');
  toolbarActions.className = 'hue-shift-toolbar-right';

  linkBtn = document.createElement('label');
  linkBtn.className = 'camera-toggle-switch hue-shift-link-toggle';
  const linkInput = document.createElement('input');
  linkInput.type = 'checkbox';
  linkInput.checked = linked;
  linkLabelText = document.createElement('span');
  linkLabelText.className = 'camera-toggle-label';
  linkBtn.appendChild(linkInput);
  linkBtn.appendChild(linkLabelText);
  linkInput.addEventListener('change', () => {
    linked = !!linkInput.checked;
    if (!linked && activePaletteIndex < 0 && colors.length > 0) {
      activePaletteIndex = 0;
    }
    endInteractiveSessions();
    refreshSelectionUI();
  });
  toolbarActions.appendChild(linkBtn);
  toolbar.appendChild(toolbarActions);

  container.appendChild(toolbar);

  settingsPopover = document.createElement('div');
  settingsPopover.className = 'hue-shift-settings-popover hidden';
  settingsPopover.addEventListener('pointerdown', (event) => event.stopPropagation());
  settingsPopover.appendChild(settingsSections.adjust);
  settingsPopover.appendChild(settingsSections.preserve);
  topActions.appendChild(settingsPopover);

  wheelWrap = document.createElement('div');
  wheelWrap.className = 'hue-shift-wheel-wrap';

  wheelCanvas = document.createElement('canvas');
  wheelCanvas.className = 'hue-shift-wheel-canvas';
  wheelWrap.appendChild(wheelCanvas);

  overlayCanvas = document.createElement('canvas');
  overlayCanvas.className = 'hue-shift-overlay-canvas';
  wheelWrap.appendChild(overlayCanvas);

  container.appendChild(wheelWrap);

  paletteBar = document.createElement('div');
  paletteBar.className = 'hue-shift-palette-bar';
  paletteBarLockMask = document.createElement('div');
  paletteBarLockMask.className = 'hue-shift-palette-mask hidden';
  const unlockPaletteBtn = document.createElement('button');
  unlockPaletteBtn.type = 'button';
  unlockPaletteBtn.className = 'hue-shift-btn hue-shift-palette-mask-btn';
  unlockPaletteBtn.textContent = translate('actions.hueShift.unlockSingleSelect', 'Unlock single select');
  unlockPaletteBtn.addEventListener('click', () => {
    linked = false;
    if (activePaletteIndex < 0 && colors.length > 0) {
      activePaletteIndex = 0;
    }
    endInteractiveSessions();
    refreshSelectionUI();
  });
  paletteBarLockMask.appendChild(unlockPaletteBtn);
  paletteBar.appendChild(paletteBarLockMask);
  container.appendChild(paletteBar);

  controlsWrap = document.createElement('div');
  controlsWrap.className = 'hue-shift-sliders';
  container.appendChild(controlsWrap);

  function setSettingsOpen(isOpen) {
    if (!settingsPopover || !settingsBtn) return;
    settingsPopover.classList.toggle('hidden', !isOpen);
    settingsBtn.classList.toggle('active', isOpen);
    settingsBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  }

  function toggleSettingsOpen() {
    setSettingsOpen(settingsPopover?.classList.contains('hidden'));
  }

  settingsBtn.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    toggleSettingsOpen();
  });

  function notifyChanged() {
    if (typeof onValuesChanged === 'function') {
      onValuesChanged();
    }
  }

  function clearPluginCache() {
    sendMessage({ type: 'clear-hue-shift-cache' });
  }

  function cloneRgb(rgb) {
    return { r: rgb.r, g: rgb.g, b: rgb.b };
  }

  function getCurrentHex(color) {
    return rgbToHex(color.currentRgb.r, color.currentRgb.g, color.currentRgb.b);
  }

  function hasColorChanges() {
    return colors.some((color) => getCurrentHex(color) !== color.originalHex);
  }

  function updateResetButtonState() {
    if (!resetBtn) return;
    const enabled = colors.length > 0 && hasColorChanges();
    resetBtn.disabled = !enabled;
    resetBtn.classList.toggle('inactive', !enabled);
  }

  function closeColorPickerPopover() {
    if (colorPickerPopover) {
      colorPickerPopover.remove();
      colorPickerPopover = null;
    }
  }

  function openColorPickerPopover(anchorRect, initialColor, onUpdate) {
    closeColorPickerPopover();

    const popover = document.createElement('div');
    popover.className = 'color-picker-popover';

    const label = document.createElement('div');
    label.className = 'popover-title';
    label.textContent = translate('actions.hueShift.pickColor', 'Pick a color');
    popover.appendChild(label);

    const previewRow = document.createElement('div');
    previewRow.className = 'color-preview-row';

    const colorWrapper = document.createElement('div');
    colorWrapper.className = 'color-input-wrapper';

    const colorInput = document.createElement('input');
    colorInput.type = 'color';
    colorInput.value = initialColor;
    colorWrapper.appendChild(colorInput);

    const hexInput = document.createElement('input');
    hexInput.type = 'text';
    hexInput.className = 'hex-input';
    hexInput.value = initialColor;
    hexInput.maxLength = 7;

    previewRow.appendChild(colorWrapper);
    previewRow.appendChild(hexInput);
    popover.appendChild(previewRow);

    colorInput.oninput = () => {
      hexInput.value = colorInput.value.toUpperCase();
    };

    hexInput.oninput = () => {
      let value = hexInput.value.trim();
      if (!value.startsWith('#')) value = '#' + value;
      if (/^#[0-9A-Fa-f]{6}$/.test(value)) {
        colorInput.value = value;
      }
    };

    const actions = document.createElement('div');
    actions.className = 'color-picker-actions';

    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'placeholder-popover-btn cancel';
    cancelBtn.textContent = translate('aux.code.cancel', 'Cancel');
    cancelBtn.onclick = () => {
      closeColorPickerPopover();
      document.removeEventListener('mousedown', clickOutside);
    };

    const applyBtn = document.createElement('button');
    applyBtn.className = 'placeholder-popover-btn submit';
    applyBtn.textContent = translate('aux.code.apply', 'Apply');

    const submit = () => {
      let finalColor = hexInput.value.trim().toUpperCase();
      if (!finalColor.startsWith('#')) finalColor = '#' + finalColor;
      if (/^#[0-9A-Fa-f]{6}$/.test(finalColor)) {
        onUpdate(finalColor);
        closeColorPickerPopover();
        document.removeEventListener('mousedown', clickOutside);
      }
    };

    applyBtn.onclick = submit;
    hexInput.onkeydown = (event) => {
      if (event.key === 'Enter') submit();
      if (event.key === 'Escape') {
        closeColorPickerPopover();
        document.removeEventListener('mousedown', clickOutside);
      }
    };

    actions.appendChild(cancelBtn);
    actions.appendChild(applyBtn);
    popover.appendChild(actions);

    popover.addEventListener('click', (event) => event.stopPropagation());
    popover.addEventListener('mousedown', (event) => event.stopPropagation());

    document.body.appendChild(popover);
    colorPickerPopover = popover;

    const popoverRect = popover.getBoundingClientRect();
    let top = anchorRect.bottom + 8;
    let left = anchorRect.left;

    if (left + popoverRect.width > window.innerWidth) {
      left = window.innerWidth - popoverRect.width - 16;
    }
    if (top + popoverRect.height > window.innerHeight) {
      top = anchorRect.top - popoverRect.height - 8;
    }
    if (left < 8) left = 8;
    if (top < 8) top = 8;

    popover.style.top = `${top}px`;
    popover.style.left = `${left}px`;

    hexInput.focus();
    hexInput.select();

    function clickOutside(event) {
      if (!popover.contains(event.target)) {
        closeColorPickerPopover();
        document.removeEventListener('mousedown', clickOutside);
      }
    }

    setTimeout(() => {
      document.addEventListener('mousedown', clickOutside);
    }, 0);
  }

  function applyColorToIndices(indices, nextHex) {
    const nextRgb = hexToRgb(nextHex);
    indices.forEach((index) => {
      if (index < 0 || index >= colors.length) return;
      colors[index].currentRgb = cloneRgb(nextRgb);
    });
    updatePaletteBar();
    drawOverlay();
    updateResetButtonState();
    notifyChanged();
  }

  function getHandleRadius() {
    const t = clamp(mergeNear / MAX_MERGE_NEAR, 0, 1);
    return MIN_HANDLE_RADIUS + (MAX_HANDLE_RADIUS - MIN_HANDLE_RADIUS) * t;
  }

  function getMergeThresholdDegrees() {
    return clamp((mergeNear / MAX_MERGE_NEAR) * MAX_MERGE_HUE_DELTA, 0, MAX_MERGE_HUE_DELTA);
  }

  function getColorWheelModel(index) {
    const model = getModeModel(colors[index].currentRgb, colorMode);
    return { index, h: model.h, s: model.s };
  }

  function materializeDisplayGroups(groupDefs) {
    return (groupDefs || [])
      .map((groupDef) => {
        const indices = (groupDef.indices || []).filter((index) => index >= 0 && index < colors.length);
        if (indices.length === 0) return null;
        const entries = indices.map((index) => getColorWheelModel(index));
        return {
          indices: [...indices],
          representativeIndex: indices.includes(groupDef.representativeIndex)
            ? groupDef.representativeIndex
            : indices[0],
          h: circularAverage(entries.map((entry) => entry.h)),
          s: entries.reduce((sum, entry) => sum + entry.s, 0) / entries.length,
        };
      })
      .filter(Boolean);
  }

  function rebuildMergeGroupsFromBasis() {
    const baseEntries = mergeGroupingBasis
      .map((entry, index) => ({
        index,
        h: entry.h,
        s: entry.s,
      }))
      .filter((entry) => entry.index < colors.length);
    const mergeThreshold = getMergeThresholdDegrees();

    if (baseEntries.length === 0) {
      mergeGroupDefs = [];
      return;
    }

    if (mergeThreshold <= 0.0001 || baseEntries.length <= 1) {
      mergeGroupDefs = baseEntries.map((entry) => ({
        indices: [entry.index],
        representativeIndex: entry.index,
      }));
      return;
    }

    const sorted = [...baseEntries].sort((a, b) => a.h - b.h);
    const groups = [];
    let currentGroup = [sorted[0]];

    for (let i = 1; i < sorted.length; i += 1) {
      const previous = sorted[i - 1];
      const next = sorted[i];
      const delta = Math.abs(angularDelta(previous.h, next.h));
      if (delta <= mergeThreshold) {
        currentGroup.push(next);
      } else {
        groups.push(currentGroup);
        currentGroup = [next];
      }
    }
    groups.push(currentGroup);

    if (groups.length > 1) {
      const first = groups[0][0];
      const lastGroup = groups[groups.length - 1];
      const last = lastGroup[lastGroup.length - 1];
      const wrapDelta = Math.abs(angularDelta(last.h, first.h));
      if (wrapDelta <= mergeThreshold) {
        groups[0] = [...lastGroup, ...groups[0]];
        groups.pop();
      }
    }

    mergeGroupDefs = groups.map((group) => {
      const originalOrderIndices = group.map((entry) => entry.index).sort((a, b) => a - b);
      return {
        indices: originalOrderIndices,
        representativeIndex: originalOrderIndices[0],
      };
    });
  }

  function snapshotMergeGroupingBasis() {
    if (colorMode === 'oklch' || colors.length === 0) {
      mergeGroupingBasis = [];
      mergeGroupDefs = [];
      return;
    }
    mergeGroupingBasis = colors.map((_, index) => {
      const model = getColorWheelModel(index);
      return { h: model.h, s: model.s };
    });
    rebuildMergeGroupsFromBasis();
  }

  function ensureMergeGroupDefs() {
    if (colorMode === 'oklch' || colors.length === 0) return [];
    if (mergeGroupingBasis.length !== colors.length) {
      snapshotMergeGroupingBasis();
    }
    return mergeGroupDefs;
  }

  function getDisplayHandleGroups() {
    if (colorMode === 'oklch' || colors.length === 0) return [];
    return materializeDisplayGroups(ensureMergeGroupDefs());
  }

  function getRenderableHandleGroups() {
    return getDisplayHandleGroups().map((group) => {
      const pos = wheelModelToPos(group.h, group.s);
      return {
        ...group,
        x: pos.x,
        y: pos.y,
      };
    });
  }

  function getSelectedGroupIndex(groups) {
    if (linked || activePaletteIndex < 0) return -1;
    return groups.findIndex((group) => group.indices.includes(activePaletteIndex));
  }

  function getDisplayHandleGroupAt(x, y) {
    const groups = getRenderableHandleGroups();
    const handleRadius = getHandleRadius();
    const selectedGroupIndex = getSelectedGroupIndex(groups);
    const groupOrder = groups.map((_, index) => index);
    if (selectedGroupIndex >= 0) {
      groupOrder.splice(selectedGroupIndex, 1);
      groupOrder.push(selectedGroupIndex);
    }

    for (let orderIndex = groupOrder.length - 1; orderIndex >= 0; orderIndex -= 1) {
      const index = groupOrder[orderIndex];
      const group = groups[index];
      const dx = x - group.x;
      const dy = y - group.y;
      if (dx * dx + dy * dy <= (handleRadius + 4) * (handleRadius + 4)) {
        return group;
      }
    }
    return null;
  }

  function syncPaletteSelect() {
    const previousValue = paletteSelect.value;
    paletteSelect.innerHTML = '';

    const allOption = document.createElement('option');
    allOption.value = 'all';
    allOption.textContent = translate('actions.hueShift.all', 'All');
    allOption.disabled = !linked;
    paletteSelect.appendChild(allOption);

    colors.forEach((color, index) => {
      const option = document.createElement('option');
      option.value = String(index);
      option.textContent = `${translate('actions.hueShift.color', 'Color')} ${index + 1} • ${getCurrentHex(color)}`;
      paletteSelect.appendChild(option);
    });

    let nextValue = previousValue;
    if (!linked && (nextValue === 'all' || nextValue === '')) {
      nextValue = colors.length > 0 ? '0' : 'all';
    }
    if (activePaletteIndex >= 0 && activePaletteIndex < colors.length) {
      nextValue = String(activePaletteIndex);
    }
    if (activePaletteIndex < 0 && linked) {
      nextValue = 'all';
    }
    if (!Array.from(paletteSelect.options).some((option) => option.value === nextValue)) {
      nextValue = !linked && colors.length > 0 ? '0' : 'all';
    }
    paletteSelect.value = nextValue;
    activePaletteIndex = paletteSelect.value === 'all' ? -1 : Number(paletteSelect.value);
  }

  function updateLinkButton() {
    const input = linkBtn?.querySelector('input');
    if (input) {
      input.checked = linked;
    }
    if (linkLabelText) {
      linkLabelText.textContent = linked
        ? translate('actions.hueShift.linked', 'Linked')
        : translate('actions.hueShift.single', 'Single');
    }
    if (linkBtn) {
      linkBtn.title = linked
        ? translate('actions.hueShift.linkedTitle', 'Linked palette adjustments')
        : translate('actions.hueShift.singleTitle', 'Adjust one palette color');
    }
  }

  function updateSelectionAffordances() {
    const hasSingleSelection = !linked && activePaletteIndex >= 0 && activePaletteIndex < colors.length;
    paletteSelect.disabled = linked;
    paletteSelect.classList.toggle('inactive', linked);
    wheelWrap.classList.toggle('single-selected', hasSingleSelection);
    paletteBar.classList.toggle('inactive', linked);
    if (paletteBarLockMask) {
      paletteBarLockMask.classList.toggle('hidden', !linked);
    }
  }

  function refreshSelectionUI() {
    updateLinkButton();
    updateResetButtonState();
    syncPaletteSelect();
    updatePaletteBar();
    updateControlDisplayValues();
    drawOverlay();
    updateSelectionAffordances();
  }

  function getDisplayColorIndices() {
    if (colors.length === 0) return [];
    if (activePaletteIndex >= 0 && activePaletteIndex < colors.length) {
      return [activePaletteIndex];
    }
    return colors.map((_, index) => index);
  }

  function getControlTargetIndices(anchorIndex = null) {
    if (colors.length === 0) return [];
    if (linked) {
      return colors.map((_, index) => index);
    }
    if (anchorIndex !== null && anchorIndex >= 0 && anchorIndex < colors.length) {
      activePaletteIndex = anchorIndex;
      syncPaletteSelect();
      return [anchorIndex];
    }
    if (activePaletteIndex < 0 || activePaletteIndex >= colors.length) {
      activePaletteIndex = 0;
      syncPaletteSelect();
    }
    return [activePaletteIndex];
  }

  function getDisplayModel() {
    const indices = getDisplayColorIndices();
    if (indices.length === 0) {
      if (colorMode === 'oklch') {
        return { l: 50, c: 0, h: 0 };
      }
      if (colorMode === 'hsb') {
        return { h: 0, s: 0, v: 100 };
      }
      return { h: 0, s: 0, l: 50 };
    }

    const models = indices.map((index) => getModeModel(colors[index].currentRgb, colorMode));
    if (colorMode === 'oklch') {
      return {
        l: models.reduce((sum, model) => sum + model.l, 0) / models.length,
        c: models.reduce((sum, model) => sum + model.c, 0) / models.length,
        h: circularAverage(models.map((model) => model.h)),
      };
    }
    if (colorMode === 'hsb') {
      return {
        h: circularAverage(models.map((model) => model.h)),
        s: models.reduce((sum, model) => sum + model.s, 0) / models.length,
        v: models.reduce((sum, model) => sum + model.v, 0) / models.length,
      };
    }
    return {
      h: circularAverage(models.map((model) => model.h)),
      s: models.reduce((sum, model) => sum + model.s, 0) / models.length,
      l: models.reduce((sum, model) => sum + model.l, 0) / models.length,
    };
  }

  function formatControlValue(key, value) {
    if (key === 'c') return value.toFixed(3);
    if (key === 'h') return `${Math.round(value)}°`;
    return `${Math.round(value)}`;
  }

  function createSliderControl(config) {
    const row = document.createElement('div');
    row.className = 'hue-shift-slider-row';

    const label = document.createElement('span');
    label.className = 'hue-shift-slider-label hue-shift-slider-label--wide';
    label.textContent = config.label;
    row.appendChild(label);

    const slider = document.createElement('input');
    slider.type = 'range';
    slider.className = 'hue-shift-slider';
    slider.min = String(config.min);
    slider.max = String(config.max);
    slider.step = String(config.step);
    row.appendChild(slider);

    const valueEl = document.createElement('span');
    valueEl.className = 'hue-shift-slider-value';
    row.appendChild(valueEl);

    const beginSession = () => {
      controlSession = {
        key: config.key,
        mode: colorMode,
        targetIndices: getControlTargetIndices(),
        referenceValue: Number(slider.dataset.referenceValue || slider.value || 0),
        models: new Map(
          getControlTargetIndices().map((index) => [index, { ...getModeModel(colors[index].currentRgb, colorMode) }])
        ),
      };
    };

    slider.addEventListener('pointerdown', () => {
      if (colors.length === 0) return;
      beginSession();
    });

    slider.addEventListener('input', () => {
      if (colors.length === 0) return;
      if (!controlSession || controlSession.key !== config.key || controlSession.mode !== colorMode) {
        beginSession();
      }
      const nextValue = Number(slider.value);
      const delta = nextValue - controlSession.referenceValue;

      for (const index of controlSession.targetIndices) {
        const baseModel = controlSession.models.get(index);
        if (!baseModel) continue;
        const nextModel = { ...baseModel };
        if (colorMode === 'oklch') {
          if (config.key === 'l') nextModel.l = clamp(baseModel.l + delta, 0, 100);
          if (config.key === 'c') nextModel.c = clamp(baseModel.c + delta, 0, MAX_OKLCH_CHROMA);
          if (config.key === 'h') nextModel.h = mod(baseModel.h + delta, 360);
        } else if (colorMode === 'hsb') {
          if (config.key === 's') nextModel.s = clamp(baseModel.s + delta, 0, 100);
          if (config.key === 'v') nextModel.v = clamp(baseModel.v + delta, 0, 100);
        } else {
          if (config.key === 's') nextModel.s = clamp(baseModel.s + delta, 0, 100);
          if (config.key === 'l') nextModel.l = clamp(baseModel.l + delta, 0, 100);
        }
        colors[index].currentRgb = cloneRgb(modelToRgb(colorMode, nextModel));
      }

    updatePaletteBar();
    if (colorMode !== 'oklch') {
      drawOverlay();
    }
    valueEl.textContent = formatControlValue(config.key, nextValue);
    updateResetButtonState();
    notifyChanged();
  });

    slider.addEventListener('change', () => {
      controlSession = null;
      refreshSelectionUI();
    });

    controlEls[config.key] = { slider, valueEl };
    row.dataset.controlKey = config.key;
    return row;
  }

  function createMergeControlRow() {
    const row = document.createElement('div');
    row.className = 'hue-shift-slider-row';

    const label = document.createElement('span');
    label.className = 'hue-shift-slider-label hue-shift-slider-label--wide';
    label.textContent = translate('actions.hueShift.mergeNear', 'Merge Near');
    row.appendChild(label);

    const slider = document.createElement('input');
    slider.type = 'range';
    slider.className = 'hue-shift-slider';
    slider.min = '0';
    slider.max = String(MAX_MERGE_NEAR);
    slider.step = '1';
    slider.value = String(mergeNear);
    row.appendChild(slider);

    const valueEl = document.createElement('span');
    valueEl.className = 'hue-shift-slider-value';
    valueEl.textContent = `${Math.round(mergeNear)}`;
    row.appendChild(valueEl);

    slider.addEventListener('input', () => {
      mergeNear = Number(slider.value);
      snapshotMergeGroupingBasis();
      valueEl.textContent = `${Math.round(mergeNear)}`;
      drawOverlay();
      updateResetButtonState();
    });

    controlEls.mergeNear = { slider, valueEl };
    return row;
  }

  function renderModeControls() {
    controlsWrap.innerHTML = '';
    controlEls = {};
    settingsSections.merge?.remove();
    settingsSections.merge = null;

    if (colorMode === 'oklch') {
      controlsWrap.appendChild(createSliderControl({ key: 'l', label: translate('actions.hueShift.lightness', 'Lightness'), min: 0, max: 100, step: 1 }));
      controlsWrap.appendChild(createSliderControl({ key: 'c', label: translate('actions.hueShift.chroma', 'Chroma'), min: 0, max: MAX_OKLCH_CHROMA, step: 0.001 }));
      controlsWrap.appendChild(createSliderControl({ key: 'h', label: translate('actions.hueShift.hue', 'Hue'), min: 0, max: 360, step: 1 }));
      setSettingsOpen(false);
      return;
    }

    const mainRow = document.createElement('div');
    mainRow.className = 'hue-shift-inline-controls';
    if (colorMode === 'hsb') {
      mainRow.appendChild(createSliderControl({ key: 's', label: translate('actions.hueShift.strength', 'Strength'), min: 0, max: 100, step: 1 }));
      mainRow.appendChild(createSliderControl({ key: 'v', label: translate('actions.hueShift.brightness', 'Brightness'), min: 0, max: 100, step: 1 }));
      controlsWrap.appendChild(mainRow);
    {
      const mergeGroup = createOptionGroup(translate('actions.hueShift.mergeSettings', 'Merge Near'));
      mergeGroup.group.querySelector('.hue-shift-option-group-label').textContent = translate('actions.hueShift.mergeSettings', 'Merge Near');
      mergeGroup.optionsEl.replaceWith(createMergeControlRow());
      settingsSections.merge = mergeGroup.group;
    }
    settingsPopover.appendChild(settingsSections.merge);
      return;
    }

    mainRow.appendChild(createSliderControl({ key: 's', label: translate('actions.hueShift.strength', 'Strength'), min: 0, max: 100, step: 1 }));
    mainRow.appendChild(createSliderControl({ key: 'l', label: translate('actions.hueShift.lightness', 'Lightness'), min: 0, max: 100, step: 1 }));
    controlsWrap.appendChild(mainRow);
    {
      const mergeGroup = createOptionGroup(translate('actions.hueShift.mergeSettings', 'Merge Near'));
      mergeGroup.group.querySelector('.hue-shift-option-group-label').textContent = translate('actions.hueShift.mergeSettings', 'Merge Near');
      mergeGroup.optionsEl.replaceWith(createMergeControlRow());
      settingsSections.merge = mergeGroup.group;
    }
    settingsPopover.appendChild(settingsSections.merge);
  }

  function updateControlDisplayValues() {
    const model = getDisplayModel();

    Object.entries(controlEls).forEach(([key, entry]) => {
      if (key === 'mergeNear') {
        entry.slider.value = String(mergeNear);
        entry.valueEl.textContent = `${Math.round(mergeNear)}`;
        return;
      }
      let value = 0;
      if (colorMode === 'oklch') {
        value = key === 'l' ? model.l : key === 'c' ? model.c : model.h;
      } else if (colorMode === 'hsb') {
        value = key === 's' ? model.s : key === 'v' ? model.v : 0;
      } else {
        value = key === 's' ? model.s : key === 'l' ? model.l : 0;
      }
      entry.slider.value = String(value);
      entry.slider.dataset.referenceValue = String(value);
      entry.valueEl.textContent = formatControlValue(key, value);
    });
  }

  function resetColorsToOriginal() {
    controlSession = null;
    dragSession = null;
    colors = colors.map((color) => ({
      ...color,
      currentRgb: hexToRgb(color.originalHex),
    }));
    refreshSelectionUI();
  }

  function loadColors(hexList, options = {}) {
    const unique = [...new Set((hexList || []).map((hex) => String(hex).toUpperCase()))]
      .filter((hex) => !isPreservedRgb(hexToRgb(hex), preserveOptions));
    const existingByOriginal = new Map(
      (options.preserveExisting ? colors : []).map((color) => [color.originalHex, cloneRgb(color.currentRgb)])
    );

    colors = unique.map((hex) => ({
      originalHex: hex,
      currentRgb: existingByOriginal.get(hex) || hexToRgb(hex),
    }));
    snapshotMergeGroupingBasis();

    if (!linked && activePaletteIndex < 0 && colors.length > 0) {
      activePaletteIndex = 0;
    }
    if (activePaletteIndex >= colors.length) {
      activePaletteIndex = linked ? -1 : (colors.length > 0 ? 0 : -1);
    }

    syncPaletteSelect();
    updatePaletteBar();
    drawWheel();
    drawOverlay();
    updateControlDisplayValues();
    updateSelectionAffordances();

    if (options.notifyAfterLoad) {
      notifyChanged();
    }
  }

  function requestColors(options = {}) {
      requestId += 1;
    pendingColorRequest = {
      id: requestId,
      preserveExisting: options.preserveExisting !== false,
      notifyAfterLoad: options.notifyAfterLoad === true,
      quiet: options.quiet === true,
    };
    sendMessage({
      type: 'get-selection-colors-hueshift',
      requestId,
      includeFills: adjustOptions.fills,
      includeStrokes: adjustOptions.strokes,
      includeDropShadow: adjustOptions.dropShadow,
      includeInnerShadow: adjustOptions.innerShadow,
      preserveWhite: preserveOptions.white,
      preserveBlack: preserveOptions.black,
      preserveGrayscale: preserveOptions.grayscale,
    });
  }

  function updatePaletteBar() {
    paletteBar.innerHTML = '';
    if (colors.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'hue-shift-empty';
      empty.textContent = translate('actions.hueShift.noColorsForTargets', 'No colors found for the current targets');
      paletteBar.appendChild(empty);
      if (paletteBarLockMask) {
        paletteBar.appendChild(paletteBarLockMask);
      }
      return;
    }

    colors.forEach((color, index) => {
      const swatch = document.createElement('button');
      swatch.type = 'button';
      swatch.className = 'hue-shift-swatch';
      swatch.style.backgroundColor = getCurrentHex(color);
      swatch.title = `${color.originalHex} → ${getCurrentHex(color)}`;
      swatch.classList.toggle('active', activePaletteIndex === index && !linked);
      swatch.addEventListener('click', () => {
        if (linked) return;
        activePaletteIndex = index;
        refreshSelectionUI();
      });
      swatch.addEventListener('dblclick', (event) => {
        event.preventDefault();
        event.stopPropagation();
        activePaletteIndex = index;
        const anchorRect = {
          left: event.clientX,
          right: event.clientX,
          top: event.clientY,
          bottom: event.clientY,
        };
        openColorPickerPopover(anchorRect, getCurrentHex(color), (nextHex) => {
          applyColorToIndices([index], nextHex);
          refreshSelectionUI();
        });
      });
      paletteBar.appendChild(swatch);
    });
    if (paletteBarLockMask) {
      paletteBar.appendChild(paletteBarLockMask);
    }
  }

  function initWheel() {
    const rect = wheelWrap.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    wheelSize = Math.max(0, Math.min(rect.width, rect.height || rect.width));
    wheelRadius = Math.max(0, wheelSize / 2 - 12);
    centerX = wheelSize / 2;
    centerY = wheelSize / 2;

    for (const canvas of [wheelCanvas, overlayCanvas]) {
      canvas.width = wheelSize * dpr;
      canvas.height = wheelSize * dpr;
      canvas.style.width = `${wheelSize}px`;
      canvas.style.height = `${wheelSize}px`;
      const ctx = canvas.getContext('2d');
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    }

    wheelCtx = wheelCanvas.getContext('2d');
    overlayCtx = overlayCanvas.getContext('2d');
    drawWheel();
    drawOverlay();
  }

  function drawWheel() {
    if (!wheelCtx) return;
    const ctx = wheelCtx;
    ctx.clearRect(0, 0, wheelSize, wheelSize);
    if (colorMode === 'oklch' || wheelSize <= 0) return;

    const dpr = window.devicePixelRatio || 1;
    const imageSize = Math.round(wheelSize * dpr);
    const image = ctx.createImageData(imageSize, imageSize);
    const data = image.data;
    const outerRadius = wheelRadius * dpr;
    const innerRadius = outerRadius * INNER_RING;
    const cx = imageSize / 2;
    const cy = imageSize / 2;

    for (let y = 0; y < imageSize; y++) {
      for (let x = 0; x < imageSize; x++) {
        const dx = x - cx;
        const dy = y - cy;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance > outerRadius + 1 || distance < innerRadius - 1) continue;

        const hue = mod(Math.atan2(dy, dx) * (180 / Math.PI), 360);
        const saturation = clamp((distance - innerRadius) / Math.max(outerRadius - innerRadius, 1), 0, 1) * 100;
        const rgb = colorMode === 'hsb'
          ? hsvToRgb(hue, saturation, 100)
          : hslToRgb(hue, saturation, 50);
        const idx = (y * imageSize + x) * 4;

        let alpha = 1;
        if (distance > outerRadius - 1) alpha = clamp(outerRadius + 1 - distance, 0, 1);
        if (distance < innerRadius + 1) alpha = clamp(distance - innerRadius + 1, 0, 1);

        data[idx] = Math.round(rgb.r * 255);
        data[idx + 1] = Math.round(rgb.g * 255);
        data[idx + 2] = Math.round(rgb.b * 255);
        data[idx + 3] = Math.round(alpha * 255);
      }
    }

    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.putImageData(image, 0, 0);
    ctx.restore();

    ctx.strokeStyle = 'rgba(0,0,0,0.5)';
    ctx.lineWidth = 3;

    ctx.beginPath();
    ctx.arc(centerX, centerY, wheelRadius + 2, 0, Math.PI * 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(centerX, centerY, wheelRadius * INNER_RING - 2, 0, Math.PI * 2);
    ctx.stroke();
  }

  function wheelModelToPos(hue, saturation) {
    const angle = (hue * Math.PI) / 180;
    const normalized = clamp(saturation / 100, 0, 1);
    const radius = wheelRadius * INNER_RING + normalized * (wheelRadius - wheelRadius * INNER_RING);
    return {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle),
    };
  }

  function posToWheelModel(x, y) {
    const dx = x - centerX;
    const dy = y - centerY;
    const angle = mod(Math.atan2(dy, dx) * (180 / Math.PI), 360);
    const distance = Math.sqrt(dx * dx + dy * dy);
    const innerRadius = wheelRadius * INNER_RING;
    const saturation = clamp((distance - innerRadius) / Math.max(wheelRadius - innerRadius, 1), 0, 1) * 100;
    return { h: angle, s: saturation };
  }

  function drawOverlay() {
    if (!overlayCtx) return;
    const ctx = overlayCtx;
    ctx.clearRect(0, 0, wheelSize, wheelSize);
    if (colorMode === 'oklch' || colors.length === 0) return;

    const groups = getRenderableHandleGroups();
    const handleRadius = getHandleRadius();
    const selectedGroupIndex = getSelectedGroupIndex(groups);

    ctx.lineWidth = 1.5;
    ctx.strokeStyle = 'rgba(255,255,255,0.5)';
    groups.forEach((group) => {
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(group.x, group.y);
      ctx.stroke();
    });

    ctx.beginPath();
    ctx.arc(centerX, centerY, 6, 0, Math.PI * 2);
    ctx.fillStyle = '#fff';
    ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.4)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    const handleEntries = groups.map((group, index) => ({ group, index }));
    if (selectedGroupIndex >= 0 && selectedGroupIndex < handleEntries.length) {
      const [selectedEntry] = handleEntries.splice(selectedGroupIndex, 1);
      handleEntries.push(selectedEntry);
    }

    handleEntries.forEach(({ group, index }) => {
      const representativeColor = colors[group.representativeIndex];
      const isSelected = selectedGroupIndex === index && !linked;

      ctx.save();
      ctx.shadowColor = isSelected ? 'rgba(0, 0, 0, 0.28)' : 'rgba(0, 0, 0, 0.14)';
      ctx.shadowBlur = isSelected ? 12 : 6;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = isSelected ? 4 : 2;
      ctx.beginPath();
      ctx.arc(group.x, group.y, handleRadius, 0, Math.PI * 2);
      ctx.fillStyle = getCurrentHex(representativeColor);
      ctx.fill();
      ctx.shadowColor = 'transparent';
      ctx.strokeStyle = isSelected ? 'rgba(255,255,255,1)' : 'rgba(255,255,255,0.5)';
      ctx.lineWidth = isSelected ? 2 : 1;
      ctx.stroke();
      ctx.restore();
    });
  }

  function findHandleAt(x, y) {
    return getDisplayHandleGroupAt(x, y)?.representativeIndex ?? -1;
  }

  function onPointerDown(event) {
    if (colorMode === 'oklch' || colors.length === 0) return;
    const rect = overlayCanvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const handleGroup = getDisplayHandleGroupAt(x, y);
    if (!handleGroup) return;
    const handleIndex = handleGroup.representativeIndex;

    const pointerModel = posToWheelModel(x, y);
    const targetIndices = linked ? getControlTargetIndices(handleIndex) : [...handleGroup.indices];
    dragSession = {
      pointerId: event.pointerId,
      handleIndex,
      startPointerModel: pointerModel,
      targetIndices,
      models: new Map(
        targetIndices.map((index) => [index, { ...getModeModel(colors[index].currentRgb, colorMode) }])
      ),
    };
    activePaletteIndex = linked ? activePaletteIndex : handleIndex;
    refreshSelectionUI();
    overlayCanvas.setPointerCapture(event.pointerId);
    event.preventDefault();
  }

  function onPointerMove(event) {
    if (!dragSession || colorMode === 'oklch') return;
    const rect = overlayCanvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const pointerModel = posToWheelModel(x, y);
    const hueDelta = angularDelta(dragSession.startPointerModel.h, pointerModel.h);
    const satDelta = pointerModel.s - dragSession.startPointerModel.s;

    for (const index of dragSession.targetIndices) {
      const baseModel = dragSession.models.get(index);
      if (!baseModel) continue;
      const nextModel = { ...baseModel };
      nextModel.h = mod(baseModel.h + hueDelta, 360);
      nextModel.s = clamp(baseModel.s + satDelta, 0, 100);
      colors[index].currentRgb = cloneRgb(modelToRgb(colorMode, nextModel));
    }

    updatePaletteBar();
    drawOverlay();
    updateResetButtonState();
    notifyChanged();
  }

  function onOverlayDoubleClick(event) {
    if (colorMode === 'oklch' || colors.length === 0) return;
    const rect = overlayCanvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const handleGroup = getDisplayHandleGroupAt(x, y);
    if (!handleGroup) return;

    event.preventDefault();
    event.stopPropagation();
    activePaletteIndex = handleGroup.representativeIndex;
    const anchorRect = {
      left: event.clientX,
      right: event.clientX,
      top: event.clientY,
      bottom: event.clientY,
    };
    openColorPickerPopover(anchorRect, getCurrentHex(colors[handleGroup.representativeIndex]), (nextHex) => {
      applyColorToIndices(handleGroup.indices, nextHex);
      refreshSelectionUI();
    });
  }

  function onPointerUp() {
    if (!dragSession) return;
    dragSession = null;
    refreshSelectionUI();
  }

  function endInteractiveSessions() {
    dragSession = null;
    controlSession = null;
  }

  function syncModeUI() {
    Object.entries(modeButtons).forEach(([mode, button]) => {
      button.classList.toggle('active', mode === colorMode);
    });
    wheelWrap.style.display = colorMode === 'oklch' ? 'none' : '';
    snapshotMergeGroupingBasis();
    if (colorMode !== 'oklch') {
      initWheel();
    }
    renderModeControls();
    drawWheel();
    refreshSelectionUI();
  }

  function handlePluginMessage(event) {
    const msg = event.data?.pluginMessage;
    if (!msg) return;

    if (msg.type === 'hueshift-colors') {
      if (!pendingColorRequest || msg.requestId !== pendingColorRequest.id) return;
      const requestMeta = pendingColorRequest;
      pendingColorRequest = null;
      if (Array.isArray(msg.data) && msg.data.length > 0) {
        loadColors(msg.data, requestMeta);
      } else {
        colors = [];
        syncPaletteSelect();
        updatePaletteBar();
        drawWheel();
        drawOverlay();
        updateControlDisplayValues();
        updateSelectionAffordances();
        if (requestMeta.notifyAfterLoad) notifyChanged();
        if (!requestMeta.quiet && showToast) showToast(translate('actions.hueShift.noColorsInSelection', 'No colors found in selection'), 'info');
      }
      return;
    }

    if (msg.type === 'selection-changed') {
      clearPluginCache();
      pendingColorRequest = null;
      colors = [];
      activePaletteIndex = linked ? -1 : 0;
      endInteractiveSessions();
      syncPaletteSelect();
      updatePaletteBar();
      drawWheel();
      drawOverlay();
      updateControlDisplayValues();
      requestColors({ preserveExisting: false, notifyAfterLoad: false, quiet: true });
    }
  }

  overlayCanvas.addEventListener('pointerdown', onPointerDown);
  overlayCanvas.addEventListener('pointermove', onPointerMove);
  overlayCanvas.addEventListener('pointerup', onPointerUp);
  overlayCanvas.addEventListener('pointercancel', onPointerUp);
  overlayCanvas.addEventListener('dblclick', onOverlayDoubleClick);
  window.addEventListener('message', handlePluginMessage);
  window.addEventListener('pointerup', onPointerUp);
  window.addEventListener('pointerdown', handleOutsidePointerDown);

  function handleOutsidePointerDown(event) {
    if (!settingsPopover || settingsPopover.classList.contains('hidden')) return;
    const target = event.target;
    if (settingsPopover.contains(target) || settingsBtn?.contains(target)) return;
    setSettingsOpen(false);
  }

  const resizeObserver = new ResizeObserver(() => {
    if (disposed) return;
    initWheel();
  });
  resizeObserver.observe(wheelWrap);

  function getValues() {
      return {
        colorMode,
        adjustOptions: { ...adjustOptions },
        preserveOptions: { ...preserveOptions },
        hueShiftColorMap: colors.map((color) => ({
          from: color.originalHex,
          to: getCurrentHex(color),
        })),
      };
  }

  container._hueShiftGetValues = getValues;

  requestAnimationFrame(() => {
    if (disposed) return;
    initWheel();
    syncModeUI();
    requestColors({ preserveExisting: false, notifyAfterLoad: false, quiet: false });
  });

  return function dispose() {
    disposed = true;
    resizeObserver.disconnect();
    overlayCanvas.removeEventListener('pointerdown', onPointerDown);
    overlayCanvas.removeEventListener('pointermove', onPointerMove);
    overlayCanvas.removeEventListener('pointerup', onPointerUp);
    overlayCanvas.removeEventListener('pointercancel', onPointerUp);
    overlayCanvas.removeEventListener('dblclick', onOverlayDoubleClick);
    window.removeEventListener('message', handlePluginMessage);
    window.removeEventListener('pointerup', onPointerUp);
    window.removeEventListener('pointerdown', handleOutsidePointerDown);
    container._hueShiftGetValues = null;
    closeColorPickerPopover();
    clearPluginCache();
  };
}
