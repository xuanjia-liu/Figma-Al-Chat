import {
  IMAGE_GEN_PRESETS,
  RE_STYLE_PRESETS,
  SMART_RENAME_PROMPT_PRESETS,
  STYLE_DEFAULT_TOKENS,
} from '../../../config/agent-data.js';

function findPresetByName(presets, presetName) {
  if (!presetName || !Array.isArray(presets) || presets.length === 0) return null;
  return presets.find(p => p.value === presetName || p.label === presetName) || null;
}

export function createPromptDrawerHelpers({
  promptDrawerFields,
  getCurrentPromptAction,
  isAiOffModeEnabled,
  getIsApplyingPreset,
  setIsApplyingPreset,
  getCustomImagePresets,
  getCustomReStylePresets,
  getCustomSmartRenamePresets,
  savePromptHistory,
  applyPromptFieldVisibility,
  getIsPromptComposing,
  escapeHtml,
  getPersonaContextVars,
}) {
  function getStockPhotoPreviewSettingsMount() {
    return document.getElementById('stockPhotoPreviewSettings');
  }

  function forEachPromptFieldValuesRoot(fn) {
    fn(promptDrawerFields);
    const stockMount = getStockPhotoPreviewSettingsMount();
    if (stockMount) fn(stockMount);
  }
  function syncSelectState(selectEl) {
    const isMulti = selectEl.dataset.multi === 'true';
    const fieldKeyEarly = selectEl.dataset.fieldKey;
    const selectedNodes = Array.from(selectEl.querySelectorAll('.prompt-custom-select-option.selected'));
    const selectedValues = selectedNodes.map(opt => opt.dataset.value);
    selectEl.dataset.selected = isMulti ? JSON.stringify(selectedValues) : (selectedValues[0] || '');

    const searchInput = selectEl.querySelector('[data-select-search]');
    if (searchInput && !isMulti && document.activeElement !== searchInput) {
      if (selectedNodes.length > 0) {
        const opt = selectedNodes[0];
        if (fieldKeyEarly === 'beforeClickScreenshotRef' && !opt.dataset.value) {
          searchInput.value = '';
        } else {
          searchInput.value = opt.dataset.text || opt.textContent || opt.dataset.value;
        }
      } else {
        searchInput.value = '';
      }
    }

    const fieldKey = selectEl.dataset.fieldKey;
    if (fieldKey) {
      const hintEl = promptDrawerFields.querySelector(`[data-dynamic-hint-for="${fieldKey}"]`)
        || getStockPhotoPreviewSettingsMount()?.querySelector(`[data-dynamic-hint-for="${fieldKey}"]`);
      if (hintEl && !isMulti) {
        const opt = selectedNodes[0];
        if (opt?.dataset.hintText) {
          hintEl.textContent = opt.dataset.hintText;
        }
      }
    }

    const pillsContainer = document.getElementById(`${selectEl.id}-pills`);
    if (pillsContainer) {
      pillsContainer.innerHTML = selectedNodes.map(opt => {
        const label = opt.dataset.text || opt.textContent || opt.dataset.value;
        return `
            <div class="prompt-pill" data-value="${escapeHtml(opt.dataset.value)}">
              <span>${escapeHtml(label)}</span>
              <svg class="prompt-pill-remove" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </div>`;
      }).join('');

      pillsContainer.querySelectorAll('.prompt-pill-remove').forEach(removeBtn => {
        removeBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          const val = removeBtn.closest('.prompt-pill').dataset.value;
          const opt = selectEl.querySelector(`.prompt-custom-select-option[data-value="${escapeHtml(val)}"]`);
          if (opt) opt.classList.remove('selected');
          syncSelectState(selectEl);
          applyPromptFieldVisibility();
          selectEl.dispatchEvent(new Event('change', { bubbles: true }));
          savePromptHistory();
        });
      });
    }

    savePromptHistory();
  }

  function applyStyleDefaults(styleName) {
    const defaults = STYLE_DEFAULT_TOKENS[styleName];
    if (!defaults) return;

    const baseTokensSelect = promptDrawerFields.querySelector('[data-field-key="baseTokens"]');
    if (!baseTokensSelect) return;

    const bgInput = baseTokensSelect.querySelector('input[data-embedded-key="backgroundColor"]');
    const primaryInput = baseTokensSelect.querySelector('input[data-embedded-key="primaryColor"]');
    const secondaryInput = baseTokensSelect.querySelector('input[data-embedded-key="secondaryColor"]');

    if (bgInput) bgInput.value = defaults.background;
    if (primaryInput) primaryInput.value = defaults.primary;
    if (secondaryInput) secondaryInput.value = defaults.secondary;

    ['background', 'accent-primary', 'accent-secondary'].forEach(val => {
      const opt = baseTokensSelect.querySelector(`.prompt-custom-select-option[data-value="${val}"]`);
      if (opt) opt.classList.add('selected');
    });

    syncSelectState(baseTokensSelect);
    baseTokensSelect.dispatchEvent(new Event('change', { bubbles: true }));
  }

  function applyImageGenPreset(presetName) {
    setIsApplyingPreset(true);
    try {
      let preset = IMAGE_GEN_PRESETS[presetName];
      if (!preset) {
        preset = findPresetByName(getCustomImagePresets(), presetName);
      }

      const subjectTextarea = promptDrawerFields.querySelector('textarea[data-field-key="imageSubject"]');
      const styleTextarea = promptDrawerFields.querySelector('textarea[data-field-key="imageStyle"]');
      const aspectRatioSelect = promptDrawerFields.querySelector('[data-field-key="aspectRatio"]');

      const updateIndicator = (textarea, presetValue) => {
        if (!textarea) return;
        const fieldEl = textarea.closest('.prompt-field');
        const indicator = fieldEl.querySelector('.prompt-field-indicator');
        if (!indicator) return;

        if (!preset) {
          indicator.classList.remove('visible');
          return;
        }

        if (presetValue !== undefined && presetValue !== '') {
          textarea.value = presetValue;
          textarea.dispatchEvent(new Event('input', { bubbles: true }));
          indicator.classList.remove('visible');
        } else if (textarea.value.trim() !== '') {
          indicator.classList.add('visible');
        } else {
          indicator.classList.remove('visible');
        }
      };

      updateIndicator(subjectTextarea, preset ? preset.subject : undefined);
      updateIndicator(styleTextarea, preset ? preset.style : undefined);

      if (preset && aspectRatioSelect && preset.aspectRatio !== undefined) {
        aspectRatioSelect.querySelectorAll('.prompt-custom-select-option').forEach(o => o.classList.remove('selected'));
        const opt = aspectRatioSelect.querySelector(`.prompt-custom-select-option[data-value="${preset.aspectRatio}"]`);
        if (opt) {
          opt.classList.add('selected');
          const hidden = aspectRatioSelect.querySelector('input[type="hidden"]');
          if (hidden) hidden.value = preset.aspectRatio;
        }
        syncSelectState(aspectRatioSelect);
        aspectRatioSelect.dispatchEvent(new Event('change', { bubbles: true }));
      }
    } finally {
      setIsApplyingPreset(false);
    }
  }

  function applyReStylePreset(presetName) {
    setIsApplyingPreset(true);
    try {
      let preset = RE_STYLE_PRESETS[presetName];
      if (!preset) {
        preset = findPresetByName(getCustomReStylePresets(), presetName);
      }

      const styleTextarea = promptDrawerFields.querySelector('textarea[data-field-key="imageStyle"]');
      const aspectRatioSelect = promptDrawerFields.querySelector('[data-field-key="aspectRatio"]');

      const updateIndicator = (textarea, presetValue) => {
        if (!textarea) return;
        const fieldEl = textarea.closest('.prompt-field');
        const indicator = fieldEl.querySelector('.prompt-field-indicator');
        if (!indicator) return;

        if (!preset) {
          indicator.classList.remove('visible');
          return;
        }

        if (presetValue !== undefined && presetValue !== '') {
          textarea.value = presetValue;
          textarea.dispatchEvent(new Event('input', { bubbles: true }));
          indicator.classList.remove('visible');
        } else if (textarea.value.trim() !== '') {
          indicator.classList.add('visible');
        } else {
          indicator.classList.remove('visible');
        }
      };

      updateIndicator(styleTextarea, preset ? preset.style : undefined);

      if (preset && aspectRatioSelect && preset.aspectRatio !== undefined) {
        aspectRatioSelect.querySelectorAll('.prompt-custom-select-option').forEach(o => o.classList.remove('selected'));
        const opt = aspectRatioSelect.querySelector(`.prompt-custom-select-option[data-value="${preset.aspectRatio}"]`);
        if (opt) {
          opt.classList.add('selected');
          const hidden = aspectRatioSelect.querySelector('input[type="hidden"]');
          if (hidden) hidden.value = preset.aspectRatio;
        }
        syncSelectState(aspectRatioSelect);
        aspectRatioSelect.dispatchEvent(new Event('change', { bubbles: true }));
      }
    } finally {
      setIsApplyingPreset(false);
    }
  }

  function updatePromptFieldIndicator(fieldKey, { visible = false, text = 'Custom text', buttonText = 'Clear' } = {}) {
    if (!promptDrawerFields || !fieldKey) return;
    const textarea = promptDrawerFields.querySelector(`textarea[data-field-key="${fieldKey}"]`);
    if (!textarea) return;

    const fieldEl = textarea.closest('.prompt-field');
    const indicator = fieldEl?.querySelector('.prompt-field-indicator');
    if (!indicator) return;

    const textEl = indicator.querySelector('.prompt-indicator-text');
    const buttonEl = indicator.querySelector('.prompt-indicator-delete');
    if (textEl) textEl.textContent = text;
    if (buttonEl) buttonEl.textContent = buttonText;
    indicator.classList.toggle('visible', !!visible);
  }

  function applySmartRenamePreset(presetName) {
    setIsApplyingPreset(true);
    try {
      let preset = SMART_RENAME_PROMPT_PRESETS[presetName];
      if (!preset) {
        preset = findPresetByName(getCustomSmartRenamePresets(), presetName);
      }

      const promptTextarea = promptDrawerFields.querySelector('textarea[data-field-key="renamePrompt"]');
      if (!promptTextarea) return;

      if (!preset) {
        updatePromptFieldIndicator('renamePrompt', { visible: false });
        return;
      }

      promptTextarea.value = preset.style || '';
      promptTextarea.dispatchEvent(new Event('input', { bubbles: true }));
      updatePromptFieldIndicator('renamePrompt', { visible: false, text: 'Preset modified', buttonText: 'Reset' });
    } finally {
      setIsApplyingPreset(false);
    }
  }

  function parseSelectedValues(data) {
    if (!data) return [];
    try {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) return parsed;
    } catch (err) {
      // fall through to string parsing
    }
    if (typeof data === 'string') {
      return data.split(',').map(s => s.trim()).filter(Boolean);
    }
    return [];
  }

  function getPromptFieldValues() {
    const values = {};

    forEachPromptFieldValuesRoot((root) => {
      if (!root) return;
      root.querySelectorAll('[data-field-key]').forEach(el => {
      if (el.tagName === 'BUTTON') return;
      if (el.type === 'range') return;

      const key = el.dataset.fieldKey;
      const wrapper = el.closest('.prompt-field');
      if (wrapper && wrapper.style.display === 'none') {
        if (
          wrapper.dataset.showWhenField ||
          wrapper.dataset.showWhenJson ||
          wrapper.dataset.showWhenNoSelection === 'true' ||
          wrapper.dataset.hideWhenNoSelection === 'true'
        ) {
          return;
        }
      }

      if (el.classList.contains('prompt-custom-select')) {
        const isMulti = el.dataset.multi === 'true';
        values[key] = isMulti ? parseSelectedValues(el.dataset.selected) : (el.dataset.selected || '');

        const selectedOptions = el.querySelectorAll('.prompt-custom-select-option.selected');
        selectedOptions.forEach(selectedOption => {
          if (selectedOption && selectedOption.dataset.hasInput === 'true') {
            const embeddedInput = selectedOption.querySelector('.embedded-input');
            if (embeddedInput && embeddedInput.dataset.embeddedKey) {
              if (embeddedInput.type === 'number') {
                values[embeddedInput.dataset.embeddedKey] = embeddedInput.value ? Number(embeddedInput.value) : null;
              } else {
                values[embeddedInput.dataset.embeddedKey] = embeddedInput.value || '';
              }
            }
          }
        });
        return;
      }

      if (el.classList.contains('prompt-color-picker')) {
        const selectedSourceRaw = el.closest('.prompt-color-input-wrapper')?.dataset.selectedSource;
        let nextValue;
        if (selectedSourceRaw) {
          try {
            nextValue = JSON.parse(selectedSourceRaw);
          } catch (error) {
            nextValue = el.value;
          }
        } else {
          nextValue = el.value;
        }
        if (values[key] !== undefined) {
          if (Array.isArray(values[key])) {
            values[key].push(nextValue);
          } else {
            values[key] = [values[key], nextValue];
          }
        } else {
          values[key] = nextValue;
        }
        return;
      }

      if (el.type === 'checkbox') {
        const stockExplicitWrap = el.closest('[data-stock-explicit-toggle-wrap="true"]');
        if (stockExplicitWrap && stockExplicitWrap.style.display === 'none') {
          values[key] = false;
        } else {
          values[key] = el.checked;
        }
      } else if (el.type === 'number') {
        values[key] = el.value ? Number(el.value) : null;
      } else if (el.classList.contains('prompt-image-upload-container')) {
        const images = [];
        el.querySelectorAll('.prompt-image-upload-slot.has-image').forEach(slot => {
          images.push({
            number: parseInt(slot.dataset.slotNumber),
            data: slot.dataset.imageData
          });
        });
        values[key] = images.length > 0 ? images : null;
      } else if (el.classList.contains('prompt-image-upload')) {
        values[key] = el.dataset.imageData || null;
      } else {
        values[key] = el.value;
      }
    });
    });

    const personaContextVars = getPersonaContextVars();
    if (personaContextVars.length > 0) {
      values.contextVariables = JSON.parse(JSON.stringify(personaContextVars));
    }

    // Checkboxes must win over any other control that reused the same data-field-key (document order
    // can leave a stale value from a non-checkbox element).
    forEachPromptFieldValuesRoot((root) => {
      if (!root) return;
      root.querySelectorAll('input[type="checkbox"][data-field-key]').forEach((el) => {
        const key = el.dataset.fieldKey;
        if (!key) return;
        const wrapper = el.closest('.prompt-field');
        if (wrapper && wrapper.dataset.showWhenField && wrapper.style.display === 'none') {
          return;
        }
        const stockExplicitWrap = el.closest('[data-stock-explicit-toggle-wrap="true"]');
        if (stockExplicitWrap && stockExplicitWrap.style.display === 'none') {
          values[key] = false;
          return;
        }
        values[key] = el.checked;
      });
    });

    return values;
  }

  function setupCustomSelectListeners() {
    const selectRoots = [promptDrawerFields, getStockPhotoPreviewSettingsMount()].filter(Boolean);
    selectRoots.forEach((root) => {
      root.querySelectorAll('.prompt-custom-select').forEach(selectEl => {
      const isMulti = selectEl.dataset.multi === 'true';
      const searchInput = selectEl.querySelector('.prompt-select-search input');
      const isDisabled = () => selectEl.hasAttribute('disabled') || selectEl.classList.contains('disabled');

      const openSelect = () => {
        if (isDisabled()) return;
        selectEl.classList.remove('collapsed');
        const fieldEl = selectEl.closest('.prompt-field');
        if (fieldEl) fieldEl.classList.add('has-open-select');
      };

      const closeSelect = () => {
        setTimeout(() => {
          if (selectEl.contains(document.activeElement)) return;

          selectEl.classList.add('collapsed');
          const fieldEl = selectEl.closest('.prompt-field');
          if (fieldEl) fieldEl.classList.remove('has-open-select');
        }, 120);
      };

      if (!isMulti && searchInput) {
        const selectedOpt = selectEl.querySelector('.prompt-custom-select-option.selected');
        if (selectedOpt) {
          searchInput.value = selectedOpt.dataset.text || selectedOpt.textContent || '';
        }
      }

      if (searchInput) {
        searchInput.addEventListener('input', () => {
          const query = searchInput.value.toLowerCase().trim();
          selectEl.querySelectorAll('.prompt-custom-select-option').forEach(opt => {
            const label = (opt.dataset.label || '').toLowerCase();
            opt.style.display = label.includes(query) ? '' : 'none';
          });
        });

        const searchWrapper = selectEl.querySelector('.prompt-select-search-wrapper');
        if (searchWrapper) {
          searchWrapper.addEventListener('click', (e) => {
            if (isDisabled()) return;
            const isChevron = e.target.closest('.prompt-select-chevron');
            if (isChevron && !selectEl.classList.contains('collapsed')) {
              e.stopPropagation();
              selectEl.classList.add('collapsed');
              const fieldEl = selectEl.closest('.prompt-field');
              if (fieldEl) fieldEl.classList.remove('has-open-select');
              searchInput?.blur();
            } else {
              openSelect();
              if (searchInput && e.target !== searchInput) {
                searchInput.focus();
              }
            }
          });
        }

        searchInput.addEventListener('focus', openSelect);
        searchInput.addEventListener('blur', closeSelect);
      }

      selectEl.querySelectorAll('.prompt-custom-select-option').forEach(optionEl => {
        optionEl.addEventListener('click', (e) => {
          if (isDisabled()) return;
          if (e.target.closest('.option-more-btn')) return;
          if (optionEl.dataset.disabled === 'true') return;
          if (e.target.classList.contains('embedded-input')) return;

          if (isMulti) {
            optionEl.classList.toggle('selected');
          } else {
            selectEl.querySelectorAll('.prompt-custom-select-option').forEach(opt => {
              opt.classList.remove('selected');
            });
            optionEl.classList.add('selected');
          }

          syncSelectState(selectEl);
          selectEl.dispatchEvent(new Event('change', { bubbles: true }));
          if (searchInput) {
            if (isMulti) {
              searchInput.value = '';
            } else {
              const text = optionEl.dataset.text || optionEl.textContent || '';
              searchInput.value = text;
            }
            if (selectEl.dataset.fieldKey === 'beforeClickScreenshotRef' && !optionEl.dataset.value) {
              searchInput.value = '';
            }
          }

          if (selectEl.dataset.fieldKey === 'styleCategory') {
            applyStyleDefaults(optionEl.dataset.value);
          }
          if (selectEl.dataset.fieldKey === 'imagePreset') {
            applyImageGenPreset(optionEl.dataset.value);
          }
          if (selectEl.dataset.fieldKey === 'reStylePreset') {
            applyReStylePreset(optionEl.dataset.value);
          }
          if (selectEl.dataset.fieldKey === 'renamePreset') {
            applySmartRenamePreset(optionEl.dataset.value);
          }
          if (selectEl.dataset.fieldKey === 'beforeClickScreenshotRef') {
            const picked = optionEl.dataset.value;
            if (picked) {
              forEachPromptFieldValuesRoot((root) => {
                const kw = root.querySelector('input[data-field-key="keywords"]');
                if (kw && !kw.readOnly && !kw.hasAttribute('disabled')) {
                  kw.value = picked;
                  kw.dispatchEvent(new Event('input', { bubbles: true }));
                }
              });
            }
          }

          applyPromptFieldVisibility();
          if (searchInput) {
            setTimeout(() => {
              if (!selectEl.contains(document.activeElement)) {
                selectEl.classList.add('collapsed');
              }
            }, 50);
          }
          optionEl.focus();
        });

        const embeddedInput = optionEl.querySelector('.embedded-input');
        if (embeddedInput) {
          embeddedInput.addEventListener('click', (e) => {
            e.stopPropagation();
            if (isDisabled()) return;
            if (optionEl.dataset.disabled === 'true') return;
            if (isMulti) {
              optionEl.classList.add('selected');
            } else {
              selectEl.querySelectorAll('.prompt-custom-select-option').forEach(opt => {
                opt.classList.remove('selected');
              });
              optionEl.classList.add('selected');
            }
            syncSelectState(selectEl);
            applyPromptFieldVisibility();
            selectEl.dispatchEvent(new Event('change', { bubbles: true }));
          });

          embeddedInput.addEventListener('focus', openSelect);
          embeddedInput.addEventListener('blur', closeSelect);
          embeddedInput.addEventListener('keydown', (e) => {
            e.stopPropagation();
          });
        }
      });

      selectEl.addEventListener('keydown', (e) => {
        if (e.target.classList.contains('embedded-input')) return;
        if (isDisabled()) return;

        const targetOption = e.target.closest('.prompt-custom-select-option');
        const isOptionContext = !!targetOption;
        const isSearchInput = e.target.closest('.prompt-select-search');
        if (getIsPromptComposing()) return;

        if (isOptionContext && (e.key === 'Enter' || e.key === ' ')) {
          if (e.metaKey || e.ctrlKey) return;
          e.preventDefault();
          if (targetOption.dataset.disabled === 'true') return;
          targetOption.click();
          return;
        }

        if (['ArrowDown', 'ArrowUp', 'ArrowRight', 'ArrowLeft'].includes(e.key)) {
          e.preventDefault();
          const visibleOptions = Array.from(selectEl.querySelectorAll('.prompt-custom-select-option'))
            .filter(opt => opt.style.display !== 'none' && opt.dataset.disabled !== 'true');
          if (visibleOptions.length === 0) return;

          const current = targetOption || (isSearchInput ? null : null);
          const currentIndex = current ? visibleOptions.indexOf(current) : -1;
          const delta = (e.key === 'ArrowDown' || e.key === 'ArrowRight') ? 1 : -1;
          const nextIndex = currentIndex === -1
            ? (delta === 1 ? 0 : visibleOptions.length - 1)
            : (currentIndex + delta + visibleOptions.length) % visibleOptions.length;

          const nextOpt = visibleOptions[nextIndex];
          if (nextOpt) {
            nextOpt.focus();
          }
        }
      });

      syncSelectState(selectEl);
    });
    });
  }

  return {
    syncSelectState,
    applyStyleDefaults,
    applyImageGenPreset,
    applyReStylePreset,
    updatePromptFieldIndicator,
    applySmartRenamePreset,
    parseSelectedValues,
    getPromptFieldValues,
    setupCustomSelectListeners,
  };
}
