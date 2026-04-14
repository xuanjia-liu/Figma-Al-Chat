/**
 * Font mapping — rules-based prompt drawer mount.
 *
 * Each rule has its own target (script type / substring / whole) and its own
 * typography + style + decoration settings. Presets auto-populate two rules
 * (Japanese + Latin/Numbers). Users can add/remove rules freely.
 * Long-form help is shown in promptDrawerHelp (not duplicated here).
 */

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
      { target: 'japanese', fontFamily: 'Hiragino Sans', fontStyle: 'W4', matchWeight: true },
      { target: 'latin_and_numbers', fontFamily: 'SF Pro Display', fontStyle: 'Regular', matchWeight: true },
    ],
  },
  androidDefault: {
    label: 'Android (Noto Sans CJK JP + Roboto)',
    rules: [
      { target: 'japanese', fontFamily: 'Noto Sans CJK JP', fontStyle: 'Regular', matchWeight: true },
      { target: 'latin_and_numbers', fontFamily: 'Roboto', fontStyle: 'Regular', matchWeight: true },
    ],
  },
};

const TARGET_OPTIONS = [
  { value: 'whole', labelKey: 'actions.fontMapping.tgtWhole' },
  { value: 'japanese', labelKey: 'actions.fontMapping.tgtJapanese' },
  { value: 'latin', labelKey: 'actions.fontMapping.tgtLatin' },
  { value: 'numbers', labelKey: 'actions.fontMapping.tgtNumbers' },
  { value: 'latin_and_numbers', labelKey: 'actions.fontMapping.tgtLatinNum' },
  { value: 'substring', labelKey: 'actions.fontMapping.tgtSubstring' },
];

let ruleIdCounter = 0;

function buildRuleHtml(rule, tu, cache, displayIndex) {
  const id = rule._id;
  const noneOpt = `<option value="">${escapeHtml(tu('actions.fontMapping.none'))}</option>`;

  const targetOpts = TARGET_OPTIONS.map(o =>
    `<option value="${escapeHtml(o.value)}"${rule.target === o.value ? ' selected' : ''}>${escapeHtml(tu(o.labelKey))}</option>`
  ).join('');

  const styleOpts = (list, selected) => noneOpt + (list || []).map(s =>
    `<option value="${escapeHtml(s.id)}"${s.id === selected ? ' selected' : ''}>${escapeHtml(s.name || s.id)}</option>`
  ).join('');

  const varOpts = noneOpt + (cache.variables || []).map(v =>
    `<option value="${escapeHtml(v.id)}"${v.id === (rule.fillVariableId || '') ? ' selected' : ''}>${escapeHtml(v.name || v.id)}</option>`
  ).join('');

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
          <input type="text" class="font-mapping-input" data-fm-r="fontFamily" value="${escapeHtml(rule.fontFamily || '')}" />
          <label class="font-mapping-label">${escapeHtml(tu('actions.fontMapping.fontStyle'))}</label>
          <input type="text" class="font-mapping-input" data-fm-r="fontStyle" value="${escapeHtml(rule.fontStyle || '')}" placeholder="Regular" />
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

  container.classList.add('font-mapping-mount');

  let cache = { textStyles: [], paintStyles: [], effectStyles: [], variables: [] };
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
    if (typeof requestLocalStyles !== 'function') return;
    try {
      const msg = await requestLocalStyles();
      cache = {
        textStyles: msg.textStyles || [],
        paintStyles: msg.paintStyles || [],
        effectStyles: msg.effectStyles || [],
        variables: (msg.variables || []).filter(v => v && v.resolvedType === 'COLOR'),
      };
      render();
    } catch (e) {
      console.warn('Font mapping: failed to load styles', e);
    }
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
