/**
 * Font mapping — rules-based prompt drawer mount.
 *
 * Each rule has its own target (script type / substring / whole) and its own
 * typography + style + decoration settings. Presets auto-populate two rules
 * (Japanese all + Latin/Numbers). Users can add/remove rules freely.
 * Long-form help is shown in promptDrawerHelp (not duplicated here).
 */

import {
  buildFontMappingFamilyStyleMap,
  getFontMappingCuratedFamilyOrder,
} from './font-mapping-fonts.js';

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

const PRESETS = {
  iosDefault: {
    label: 'iOS (Hiragino Sans + SF Pro Display)',
    rules: [
      { target: 'japanese_all', fontFamily: 'Hiragino Sans', fontStyle: 'W4', matchWeight: true },
      { target: 'latin_and_numbers', fontFamily: 'SF Pro Display', fontStyle: 'Regular', matchWeight: true },
    ],
  },
  androidDefault: {
    label: 'Android (Noto Sans CJK JP + Roboto)',
    rules: [
      { target: 'japanese_all', fontFamily: 'Noto Sans CJK JP', fontStyle: 'Regular', matchWeight: true },
      { target: 'latin_and_numbers', fontFamily: 'Roboto', fontStyle: 'Regular', matchWeight: true },
    ],
  },
};

const TARGET_OPTIONS = [
  { value: 'whole', labelKey: 'actions.fontMapping.tgtWhole' },
  { value: 'japanese_all', labelKey: 'actions.fontMapping.tgtJapaneseAll' },
  { value: 'han_jp_cn', labelKey: 'actions.fontMapping.tgtHanJpCn' },
  { value: 'kana_only', labelKey: 'actions.fontMapping.tgtKanaOnly' },
  { value: 'korean', labelKey: 'actions.fontMapping.tgtKorean' },
  { value: 'latin', labelKey: 'actions.fontMapping.tgtLatin' },
  { value: 'numbers', labelKey: 'actions.fontMapping.tgtNumbers' },
  { value: 'latin_and_numbers', labelKey: 'actions.fontMapping.tgtLatinNum' },
  { value: 'substring', labelKey: 'actions.fontMapping.tgtSubstring' },
];

/** Script targets grouped under an optgroup (whole + substring sit outside). */
const TARGET_SCRIPT_VALUES = [
  'japanese_all',
  'han_jp_cn',
  'kana_only',
  'korean',
  'latin',
  'numbers',
  'latin_and_numbers',
];

let ruleIdCounter = 0;

function buildTargetSelectHtml(rule, tu) {
  const byVal = new Map(TARGET_OPTIONS.map(x => [x.value, x]));
  const optLine = (o) =>
    `<option value="${escapeHtml(o.value)}"${rule.target === o.value ? ' selected' : ''}>${escapeHtml(
      tu(o.labelKey)
    )}</option>`;
  const whole = byVal.get('whole');
  const sub = byVal.get('substring');
  const scripts = TARGET_SCRIPT_VALUES.map(v => byVal.get(v)).filter(Boolean);
  const ogLabel = escapeHtml(tu('actions.fontMapping.optgroupScripts'));
  return `${optLine(whole)}<optgroup label="${ogLabel}">${scripts.map(optLine).join('')}</optgroup>${optLine(sub)}`;
}

function stylesForFamily(familyStylesMap, familyRaw) {
  const fam = String(familyRaw || '').trim();
  if (!fam) return null;
  const lower = fam.toLowerCase();
  for (const [k, styles] of familyStylesMap) {
    if (k.toLowerCase() === lower) return styles;
  }
  return null;
}

function familiesForSuggest(familyStylesMap, curatedOrder, query) {
  const t = String(query || '').trim().toLowerCase();
  const allKeys = [...familyStylesMap.keys()].sort((a, b) => a.localeCompare(b));
  if (!t) {
    const out = [];
    const seen = new Set();
    for (const f of curatedOrder) {
      if (familyStylesMap.has(f) && !seen.has(f)) {
        out.push(f);
        seen.add(f);
      }
    }
    for (const f of allKeys) {
      if (!seen.has(f)) {
        out.push(f);
        seen.add(f);
      }
    }
    return out.slice(0, 40);
  }
  const hits = allKeys.filter(f => f.toLowerCase().includes(t));
  const orderIdx = new Map(curatedOrder.map((f, i) => [f, i]));
  hits.sort((a, b) => {
    const ia = orderIdx.has(a) ? orderIdx.get(a) : 9999;
    const ib = orderIdx.has(b) ? orderIdx.get(b) : 9999;
    if (ia !== ib) return ia - ib;
    return a.localeCompare(b);
  });
  return hits.slice(0, 50);
}

function renderFamilySuggestPanel(panel, tu, familyStylesMap, curatedOrder, query) {
  if (!panel) return [];
  const opts = familiesForSuggest(familyStylesMap, curatedOrder, query);
  if (opts.length === 0) {
    panel.innerHTML = `<div class="fm-fam-suggest-empty" role="option">${escapeHtml(
      tu('actions.fontMapping.noFontMatches')
    )}</div>`;
    return [];
  }
  panel.innerHTML = opts
    .map(
      (f, i) =>
        `<button type="button" class="fm-fam-suggest-item" role="option" data-fm-fam-ix="${i}">${escapeHtml(f)}</button>`
    )
    .join('');
  return opts;
}

function syncStyleControls(card, familyStylesMap, tu) {
  const famInput = card.querySelector('[data-fm-r="fontFamily"]');
  const styleInput = card.querySelector('[data-fm-r="fontStyle"]');
  const styleSelect = card.querySelector('[data-fm-r="fontStyleSelect"]');
  if (!famInput || !styleInput || !styleSelect) return;

  const styles = stylesForFamily(familyStylesMap, famInput.value);
  const cur = String(styleInput.value || '').trim();
  const customLabel = tu('actions.fontMapping.styleCustom');

  if (styles && styles.length > 0) {
    styleSelect.style.display = '';
    let inner = `<option value="">${escapeHtml(customLabel)}</option>`;
    for (const s of styles) {
      const sel = s === cur ? ' selected' : '';
      inner += `<option value="${escapeHtml(s)}"${sel}>${escapeHtml(s)}</option>`;
    }
    styleSelect.innerHTML = inner;
    const match = styles.includes(cur);
    styleSelect.value = match ? cur : '';
  } else {
    styleSelect.style.display = 'none';
    styleSelect.innerHTML = '';
  }
}

function wireFontFamilyStyleCombos(container, familyStylesMap, tu) {
  const curatedOrder = getFontMappingCuratedFamilyOrder();

  container.querySelectorAll('.fm-rule-card').forEach(card => {
    const wrap = card.querySelector('.fm-font-family-wrap');
    const famInput = card.querySelector('[data-fm-r="fontFamily"]');
    const panel = card.querySelector('[data-fm-fam-suggest]');
    const styleInput = card.querySelector('[data-fm-r="fontStyle"]');
    const styleSelect = card.querySelector('[data-fm-r="fontStyleSelect"]');
    if (!wrap || !famInput || !panel || !styleInput || !styleSelect) return;

    /** @type {string[] | null} */
    let lastSuggestOpts = null;
    let blurCloseTimer = null;
    /** @type {((e: Event) => void) | null} */
    let docClose = null;
    let skipOpenOnNextFocus = false;
    const scrollParent = famInput.closest('.font-mapping-scroll');

    function syncSuggestPanelGeometry() {
      if (panel.hidden) return;
      const r = famInput.getBoundingClientRect();
      const gap = 2;
      const spaceBelow = window.innerHeight - r.bottom - gap - 8;
      const maxH = Math.min(240, Math.max(72, spaceBelow));
      panel.style.left = `${r.left}px`;
      panel.style.top = `${r.bottom + gap}px`;
      panel.style.width = `${r.width}px`;
      panel.style.maxHeight = `${maxH}px`;
    }

    function onScrollOrResize() {
      syncSuggestPanelGeometry();
    }

    function removeDocClose() {
      if (docClose) {
        document.removeEventListener('pointerdown', docClose, true);
        docClose = null;
      }
    }

    function closeFamilySuggest() {
      clearTimeout(blurCloseTimer);
      panel.hidden = true;
      panel.removeAttribute('data-fm-fam-suggest-open');
      wrap.classList.remove('fm-font-family-wrap--open');
      lastSuggestOpts = null;
      removeDocClose();
      window.removeEventListener('resize', onScrollOrResize);
      if (scrollParent) scrollParent.removeEventListener('scroll', onScrollOrResize, true);
      panel.style.left = '';
      panel.style.top = '';
      panel.style.width = '';
      panel.style.maxHeight = '';
    }

    function openFamilySuggest() {
      window.removeEventListener('resize', onScrollOrResize);
      if (scrollParent) scrollParent.removeEventListener('scroll', onScrollOrResize, true);

      lastSuggestOpts = renderFamilySuggestPanel(
        panel,
        tu,
        familyStylesMap,
        curatedOrder,
        famInput.value
      );
      panel.hidden = false;
      panel.setAttribute('data-fm-fam-suggest-open', '1');
      wrap.classList.add('fm-font-family-wrap--open');
      syncSuggestPanelGeometry();
      window.addEventListener('resize', onScrollOrResize);
      if (scrollParent) scrollParent.addEventListener('scroll', onScrollOrResize, true);

      removeDocClose();
      docClose = (e) => {
        const t = e.target;
        if (wrap.contains(t)) return;
        closeFamilySuggest();
      };
      setTimeout(() => document.addEventListener('pointerdown', docClose, true), 0);
    }

    famInput.addEventListener('focus', () => {
      if (skipOpenOnNextFocus) {
        skipOpenOnNextFocus = false;
        return;
      }
      clearTimeout(blurCloseTimer);
      openFamilySuggest();
    });

    famInput.addEventListener('input', () => {
      if (!panel.hidden) {
        lastSuggestOpts = renderFamilySuggestPanel(
          panel,
          tu,
          familyStylesMap,
          curatedOrder,
          famInput.value
        );
        syncSuggestPanelGeometry();
      } else if (document.activeElement === famInput) {
        openFamilySuggest();
      }
    });

    famInput.addEventListener('blur', () => {
      blurCloseTimer = setTimeout(() => closeFamilySuggest(), 150);
    });

    famInput.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeFamilySuggest();
    });

    panel.addEventListener('mousedown', (e) => {
      e.preventDefault();
    });

    panel.addEventListener('click', (e) => {
      const btn = e.target && e.target.closest && e.target.closest('[data-fm-fam-ix]');
      if (!btn || !panel.contains(btn)) return;
      const ix = Number(btn.getAttribute('data-fm-fam-ix'));
      const picked = Array.isArray(lastSuggestOpts) ? lastSuggestOpts[ix] : null;
      if (!picked) return;
      famInput.value = picked;
      famInput.dispatchEvent(new Event('input', { bubbles: true }));
      famInput.dispatchEvent(new Event('change', { bubbles: true }));
      syncStyleControls(card, familyStylesMap, tu);
      skipOpenOnNextFocus = true;
      closeFamilySuggest();
      famInput.focus();
    });

    const onFamCommit = () => {
      syncStyleControls(card, familyStylesMap, tu);
    };
    famInput.addEventListener('change', onFamCommit);

    styleSelect.addEventListener('change', () => {
      if (styleSelect.value) styleInput.value = styleSelect.value;
    });

    styleInput.addEventListener('input', () => {
      const v = String(styleInput.value || '').trim();
      if (styleSelect.style.display === 'none') return;
      const opt = Array.from(styleSelect.options).find(o => o.value === v);
      styleSelect.value = opt ? v : '';
    });

    syncStyleControls(card, familyStylesMap, tu);
  });
}

function buildRuleHtml(rule, tu, cache, displayIndex) {
  const id = rule._id;
  const noneOpt = `<option value="">${escapeHtml(tu('actions.fontMapping.none'))}</option>`;

  const targetOpts = buildTargetSelectHtml(rule, tu);

  const styleOpts = (list, selected) => noneOpt + (list || []).map(s =>
    `<option value="${escapeHtml(s.id)}"${s.id === selected ? ' selected' : ''}>${escapeHtml(s.name || s.id)}</option>`
  ).join('');

  const varOpts = noneOpt + (cache.variables || []).map(v =>
    `<option value="${escapeHtml(v.id)}"${v.id === (rule.fillVariableId || '') ? ' selected' : ''}>${escapeHtml(v.name || v.id)}</option>`
  ).join('');

  const famPlaceholder = escapeHtml(tu('actions.fontMapping.fontTypeOrPick'));

  return `
  <div class="fm-rule-card" data-fm-rule-id="${id}">
    <div class="fm-rule-header">
      <span class="fm-rule-badge">#${displayIndex}</span>
      <select class="font-mapping-select fm-rule-target" data-fm-r="target" style="flex:1">
        ${targetOpts}
      </select>
      <button type="button" class="fm-rule-remove" data-fm-remove title="${escapeHtml(tu('actions.fontMapping.removeRule'))}">&times;</button>
    </div>

    <div class="fm-rule-substr-row" style="display:${rule.target === 'substring' ? '' : 'none'}">
      <input type="text" class="font-mapping-input" data-fm-r="substring" value="${escapeHtml(rule.substring || '')}" placeholder="${escapeHtml(tu('actions.fontMapping.substrPlaceholder'))}" />
      <label class="font-mapping-check"><input type="checkbox" data-fm-r="allOcc"${rule.allOccurrences ? ' checked' : ''} /> ${escapeHtml(tu('actions.fontMapping.allOccurrences'))}</label>
    </div>

    <details class="fm-rule-section" open>
      <summary>${escapeHtml(tu('actions.fontMapping.sectionFont'))}</summary>
      <label class="font-mapping-check"><input type="checkbox" data-fm-r="fontEnabled"${rule.fontEnabled !== false ? ' checked' : ''} /> ${escapeHtml(tu('actions.fontMapping.enableFont'))}</label>
      <div class="fm-rule-font-fields">
        <div class="fm-rule-grid">
          <label class="font-mapping-label">${escapeHtml(tu('actions.fontMapping.fontFamily'))}</label>
          <div class="fm-font-family-wrap">
            <input type="text" class="font-mapping-input" data-fm-r="fontFamily" autocomplete="off" placeholder="${famPlaceholder}" value="${escapeHtml(rule.fontFamily || '')}" />
            <div class="fm-fam-suggest" data-fm-fam-suggest hidden role="listbox" aria-label="${escapeHtml(tu('actions.fontMapping.fontSuggestAria'))}"></div>
          </div>
          <label class="font-mapping-label">${escapeHtml(tu('actions.fontMapping.fontStyle'))}</label>
          <div class="fm-font-style-row">
            <select class="font-mapping-select fm-style-preset-select" data-fm-r="fontStyleSelect" aria-label="${escapeHtml(tu('actions.fontMapping.stylePresetAria'))}" style="display:none"></select>
            <input type="text" class="font-mapping-input fm-style-text-input" data-fm-r="fontStyle" value="${escapeHtml(rule.fontStyle || '')}" placeholder="Regular" />
          </div>
        </div>
        <label class="font-mapping-check"><input type="checkbox" data-fm-r="matchWeight"${rule.matchWeight ? ' checked' : ''} /> ${escapeHtml(tu('actions.fontMapping.matchWeight'))}</label>
        <div class="fm-rule-grid">
          <label class="font-mapping-label">${escapeHtml(tu('actions.fontMapping.fontSize'))}</label>
          <input type="number" class="font-mapping-input" data-fm-r="fontSize" min="1" step="0.5" value="${rule.fontSize != null ? rule.fontSize : ''}" />
          <label class="font-mapping-label">${escapeHtml(tu('actions.fontMapping.lineHeight'))}</label>
          <div class="font-mapping-row" style="gap:4px;margin:0">
            <select class="font-mapping-select" data-fm-r="lhUnit" style="width:auto;flex:0 0 auto">
              <option value="AUTO"${(rule.lhUnit || 'AUTO') === 'AUTO' ? ' selected' : ''}>AUTO</option>
              <option value="PIXELS"${rule.lhUnit === 'PIXELS' ? ' selected' : ''}>PX</option>
              <option value="PERCENT"${rule.lhUnit === 'PERCENT' ? ' selected' : ''}>%</option>
            </select>
            <input type="number" class="font-mapping-input" data-fm-r="lhVal" value="${rule.lhVal != null ? rule.lhVal : ''}" placeholder="—" style="flex:1" />
          </div>
        </div>
      </div>
    </details>

    <details class="fm-rule-section">
      <summary>${escapeHtml(tu('actions.fontMapping.sectionStyles'))}</summary>
      <div class="fm-rule-grid">
        <label class="font-mapping-label">${escapeHtml(tu('actions.fontMapping.textStyle'))}</label>
        <select class="font-mapping-select" data-fm-r="textStyleId">${styleOpts(cache.textStyles, rule.textStyleId)}</select>
        <label class="font-mapping-label">${escapeHtml(tu('actions.fontMapping.fillStyle'))}</label>
        <select class="font-mapping-select" data-fm-r="fillStyleId">${styleOpts(cache.paintStyles, rule.fillStyleId)}</select>
        <label class="font-mapping-label">${escapeHtml(tu('actions.fontMapping.fillHex'))}</label>
        <input type="text" class="font-mapping-input" data-fm-r="fillHex" value="${escapeHtml(rule.fillHex || '')}" placeholder="#000000" />
        <label class="font-mapping-label">${escapeHtml(tu('actions.fontMapping.colorVariable'))}</label>
        <select class="font-mapping-select" data-fm-r="fillVariableId">${varOpts}</select>
      </div>
    </details>

    <details class="fm-rule-section">
      <summary>${escapeHtml(tu('actions.fontMapping.sectionDeco'))}</summary>
      <label class="font-mapping-check"><input type="checkbox" data-fm-r="decoEnabled"${rule.decoEnabled ? ' checked' : ''} /> ${escapeHtml(tu('actions.fontMapping.enableDeco'))}</label>
      <div class="fm-rule-grid">
        <label class="font-mapping-label">${escapeHtml(tu('actions.fontMapping.textDecoration'))}</label>
        <select class="font-mapping-select" data-fm-r="textDecoration">
          <option value="NONE"${(rule.textDecoration || 'NONE') === 'NONE' ? ' selected' : ''}>NONE</option>
          <option value="UNDERLINE"${rule.textDecoration === 'UNDERLINE' ? ' selected' : ''}>UNDERLINE</option>
          <option value="STRIKETHROUGH"${rule.textDecoration === 'STRIKETHROUGH' ? ' selected' : ''}>STRIKETHROUGH</option>
        </select>
        <label class="font-mapping-label">${escapeHtml(tu('actions.fontMapping.decoColor'))}</label>
        <input type="text" class="font-mapping-input" data-fm-r="decoHex" value="${escapeHtml(rule.decorationColorHex || '')}" placeholder="#000000" />
      </div>
    </details>
  </div>`;
}

export function mountFontMapping(container, options = {}) {
  const tu = typeof options.tu === 'function' ? options.tu : (k) => k;
  const requestLocalStyles = options.requestLocalStyles;
  const requestFontFamilies = options.requestFontFamilies;

  container.classList.add('font-mapping-mount');

  let cache = { textStyles: [], paintStyles: [], effectStyles: [], variables: [] };
  /** @type {Map<string, string[]>} */
  let familyStylesMap = buildFontMappingFamilyStyleMap(null);
  let rules = [{ _id: ++ruleIdCounter, target: 'whole', fontEnabled: true, fontFamily: '', fontStyle: '', matchWeight: false }];

  function render() {
    const noneOpt = `<option value="">${escapeHtml(tu('actions.fontMapping.none'))}</option>`;
    const effectOpts = noneOpt + cache.effectStyles.map(s =>
      `<option value="${escapeHtml(s.id)}">${escapeHtml(s.name || s.id)}</option>`
    ).join('');
    const strokeOpts = noneOpt + cache.paintStyles.map(s =>
      `<option value="${escapeHtml(s.id)}">${escapeHtml(s.name || s.id)}</option>`
    ).join('');

    container.innerHTML = `
      <div class="font-mapping-scroll">
        <label class="font-mapping-label">${escapeHtml(tu('actions.fontMapping.preset'))}</label>
        <div class="fm-preset-row">
          <select class="font-mapping-select" data-fm="preset">
            <option value="none">${escapeHtml(tu('actions.fontMapping.presetNone'))}</option>
            ${Object.entries(PRESETS).map(([k, v]) => `<option value="${escapeHtml(k)}">${escapeHtml(v.label)}</option>`).join('')}
          </select>
          <button type="button" class="fm-add-rule-btn" data-fm-add-rule>+ ${escapeHtml(tu('actions.fontMapping.addRule'))}</button>
        </div>

        <div class="fm-rules-list" data-fm-rules-list>
          ${rules.map((r, i) => buildRuleHtml(r, tu, cache, i + 1)).join('')}
        </div>

        <details class="fm-rule-section fm-layer-section">
          <summary>${escapeHtml(tu('actions.fontMapping.layerStyles'))}</summary>
          <p class="font-mapping-note">${escapeHtml(tu('actions.fontMapping.layerOnlyNote'))}</p>
          <div class="fm-rule-grid">
            <label class="font-mapping-label">${escapeHtml(tu('actions.fontMapping.effectStyleLayer'))}</label>
            <select class="font-mapping-select" data-fm="effectStyle">${effectOpts}</select>
            <label class="font-mapping-label">${escapeHtml(tu('actions.fontMapping.strokeStyleLayer'))}</label>
            <select class="font-mapping-select" data-fm="strokeStyle">${strokeOpts}</select>
          </div>
        </details>
      </div>
    `;

    attachEvents();
    wireFontFamilyStyleCombos(container, familyStylesMap, tu);
  }

  function attachEvents() {
    const presetEl = container.querySelector('[data-fm="preset"]');
    if (presetEl) {
      presetEl.addEventListener('change', () => {
        const def = PRESETS[presetEl.value];
        if (def) {
          rules = def.rules.map(r => ({ ...r, _id: ++ruleIdCounter, fontEnabled: true }));
        }
        render();
        if (presetEl) {
          const sel = container.querySelector('[data-fm="preset"]');
          if (sel) sel.value = def ? presetEl.value : 'none';
        }
      });
    }

    container.querySelector('[data-fm-add-rule]')?.addEventListener('click', () => {
      rules.push({ _id: ++ruleIdCounter, target: 'whole', fontEnabled: true, fontFamily: '', fontStyle: '', matchWeight: false });
      render();
    });

    container.querySelectorAll('.fm-rule-remove').forEach(btn => {
      btn.addEventListener('click', () => {
        if (rules.length <= 1) return;
        const card = btn.closest('.fm-rule-card');
        const id = Number(card?.dataset?.fmRuleId);
        rules = rules.filter(r => r._id !== id);
        render();
      });
    });

    container.querySelectorAll('.fm-rule-target').forEach(sel => {
      sel.addEventListener('change', () => {
        const card = sel.closest('.fm-rule-card');
        const row = card?.querySelector('.fm-rule-substr-row');
        if (row) row.style.display = sel.value === 'substring' ? '' : 'none';
      });
    });
  }

  function readRuleFromCard(card) {
    const q = (s) => card.querySelector(`[data-fm-r="${s}"]`);
    const val = (s) => q(s)?.value?.trim() || '';
    const checked = (s) => !!q(s)?.checked;
    const numOrNull = (s) => { const v = q(s)?.value; return v === '' || v == null ? null : Number(v); };
    return {
      target: val('target') || 'whole',
      substring: val('substring'),
      allOccurrences: checked('allOcc'),
      fontEnabled: checked('fontEnabled'),
      fontFamily: val('fontFamily'),
      fontStyle: val('fontStyle'),
      matchWeight: checked('matchWeight'),
      fontSize: numOrNull('fontSize'),
      lhUnit: val('lhUnit') || 'AUTO',
      lhVal: numOrNull('lhVal'),
      textStyleId: val('textStyleId'),
      fillStyleId: val('fillStyleId'),
      fillHex: val('fillHex'),
      fillVariableId: val('fillVariableId'),
      decoEnabled: checked('decoEnabled'),
      textDecoration: val('textDecoration') || 'NONE',
      decorationColorHex: val('decoHex'),
    };
  }

  function getPayload() {
    const cards = container.querySelectorAll('.fm-rule-card');
    const rulesOut = [];
    cards.forEach(card => rulesOut.push(readRuleFromCard(card)));

    return {
      rules: rulesOut,
      layerEffectStyleId: container.querySelector('[data-fm="effectStyle"]')?.value || '',
      layerStrokeStyleId: container.querySelector('[data-fm="strokeStyle"]')?.value || '',
    };
  }

  async function loadLists() {
    let msg = null;
    if (typeof requestLocalStyles === 'function') {
      try {
        msg = await requestLocalStyles();
      } catch (e) {
        console.warn('Font mapping: failed to load styles', e);
      }
    }

    let fontMsg = null;
    if (typeof requestFontFamilies === 'function') {
      try {
        fontMsg = await requestFontFamilies();
      } catch (e) {
        console.warn('Font mapping: failed to load local font list', e);
      }
    }

    const localFams = fontMsg && Array.isArray(fontMsg.families) ? fontMsg.families : [];
    familyStylesMap = buildFontMappingFamilyStyleMap(localFams);

    if (msg) {
      cache = {
        textStyles: msg.textStyles || [],
        paintStyles: msg.paintStyles || [],
        effectStyles: msg.effectStyles || [],
        variables: (msg.variables || []).filter(v => v && v.resolvedType === 'COLOR'),
      };
    }
    render();
  }

  render();
  void loadLists();

  container._fontMappingGetPayload = getPayload;

  return () => {
    delete container._fontMappingGetPayload;
    container.innerHTML = '';
    container.classList.remove('font-mapping-mount');
  };
}
