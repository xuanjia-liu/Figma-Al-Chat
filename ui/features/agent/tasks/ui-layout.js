import {
  CHART_PRESETS,
  ContextMode,
  LANDING_PATTERNS,
  STYLE_CATEGORIES,
  UX_GUIDELINES,
} from '../../../config/agent-data.js';

export const uiLayoutTasks = [
{
          name: 'Apply Auto Layout',
          desc: 'Convert selection to smart auto layout',
          requiredContext: ContextMode.LAYOUT_ONLY,
          prompt: 'Apply smart auto layout to the current selection. Analyze spatial relationships to create nested structures and intelligent gaps/paddings. Return ONLY JSON: [{"action":"applyAutoLayout"}]'
        },
{
          name: 'Direct UI Creation',
          desc: 'Generate hierarchical UI from structure',
          noSelection: true,
          includeTokens: true,
          requiredContext: ContextMode.ALL,
          fields: [
            { key: 'screenType', type: 'text', label: 'Screen type', placeholder: 'e.g. Landing page / App dashboard', default: 'App dashboard' },
            {
              type: 'row',
              fields: [
                {
                  key: 'platform', type: 'select', label: 'Platform', default: 'Web', options: [
                    { value: 'Web', label: 'Web' },
                    { value: 'iOS', label: 'iOS' },
                    { value: 'Android', label: 'Android' }
                  ]
                },
                {
                  key: 'screenSizeWeb',
                  type: 'select',
                  label: 'Screen Sizes',
                  multi: false,
                  searchable: true,
                  default: '1440x900',
                  showWhen: { field: 'platform', equals: 'Web' },
                  options: [
                    { value: '1920x1080', label: 'xl (1920×1080)' },
                    { value: '1728x1117', label: 'xl (1728×1117)' },
                    { value: '1536x864', label: 'lg (1536×864)' },
                    { value: '1440x900', label: 'lg (1440×900)' },
                    { value: '1366x768', label: 'md (1366×768)' },
                    { value: '1280x800', label: 'md (1280×800)' },
                    { value: '1024x768', label: 'sm (1024×768)' },
                    { value: '834x1194', label: 'tablet (834×1194)' },
                    { value: '768x1024', label: 'xs (768×1024)' },
                    { value: '375x812', label: 'mobile (375×812)' },
                    { value: '__custom__', label: 'Custom...', inputKey: 'customScreenSizeWeb', inputDefault: '', inputType: 'text', inputPlaceholder: 'WxH e.g. 1440x900' }
                  ]
                },
                {
                  key: 'screenSizeIOS',
                  type: 'select',
                  label: 'Screen Sizes',
                  multi: false,
                  searchable: true,
                  default: '393x852',
                  showWhen: { field: 'platform', equals: 'iOS' },
                  options: [
                    { value: '430x932', label: '15Pro Max (430×932)' },
                    { value: '393x852', label: '15Pro (393×852)' },
                    { value: '375x812', label: '13mini (375×812)' },
                    { value: '1024x1366', label: 'iPad Pro 12.9 (1024×1366)' },
                    { value: '__custom__', label: 'Custom...', inputKey: 'customScreenSizeIOS', inputDefault: '', inputType: 'text', inputPlaceholder: 'WxH e.g. 393x852' }
                  ]
                },
                {
                  key: 'screenSizeAndroid',
                  type: 'select',
                  label: 'Screen Sizes',
                  multi: false,
                  searchable: true,
                  default: '412x915',
                  showWhen: { field: 'platform', equals: 'Android' },
                  options: [
                    { value: '412x915', label: 'Pixel 8 (412×915)' },
                    { value: '360x800', label: '360×800' },
                    { value: '800x1280', label: 'Tablet (800×1280)' },
                    { value: '__custom__', label: 'Custom...', inputKey: 'customScreenSizeAndroid', inputDefault: '', inputType: 'text', inputPlaceholder: 'WxH e.g. 412x915' }
                  ]
                }
              ]
            },
            { key: 'description', type: 'textarea', label: 'Description', placeholder: 'What should the user achieve?', default: '', aiButtons: true },
            { key: 'multiPage', type: 'checkbox', label: 'Multi-page creation', default: false },
            {
              key: 'styleCategory',
              type: 'select',
              label: 'Design Style',
              searchable: true,
              default: 'Auto',
              options: STYLE_CATEGORIES.map(s => ({ value: s.name, label: s.name }))
            },
            {
              key: 'layoutPattern',
              type: 'select',
              label: 'Layout Pattern (Optional)',
              searchable: true,
              default: 'None',
              options: [{ value: 'None', label: 'None' }, ...LANDING_PATTERNS.map(p => ({ value: p.name, label: p.name }))]
            },

            {
              key: 'imageInput',
              type: 'image',
              label: 'Reference Image (Optional)',
              hint: 'Upload a screenshot or wireframe to use as reference for recreating the UI structure'
            },

            { key: 'showAdvanced', type: 'checkbox', label: 'Show advanced constraints', default: false },

            // Design System Tokens (Moved back to advanced)
            {
              key: 'baseTokens',
              type: 'select',
              label: 'Base Design Tokens',
              multi: true,
              showThumbnails: false,
              default: ['background', 'accent-primary', 'local-tokens'],
              showWhen: { field: 'showAdvanced', equals: true },
              options: [
                { value: 'background', label: 'Background', inputKey: 'backgroundColor', inputDefault: '#F8FAFC', inputType: 'text' },
                { value: 'accent-primary', label: 'Accent Primary', inputKey: 'primaryColor', inputDefault: '#0066FF', inputType: 'text' },
                { value: 'accent-secondary', label: 'Accent Secondary', inputKey: 'secondaryColor', inputDefault: '#64748B', inputType: 'text' },
                { value: 'local-tokens', label: 'Use local styles & variables', detail: 'Prioritize tokens defined in this Figma file' }
              ]
            },

            // Platform-specific UX Guidelines (Advanced)
            {
              key: 'uxGuidelinesWeb',
              type: 'select',
              label: 'UX Guidelines (Web)',
              multi: true,
              searchable: true,
              showThumbnails: false,
              showWhen: [
                { field: 'platform', equals: 'Web' },
                { field: 'showAdvanced', equals: true }
              ],
              options: () => UX_GUIDELINES
                .filter(g => g.platform === 'Web' || g.platform === 'All')
                .map(g => ({
                  value: `${g.category}: ${g.issue}`,
                  label: `${g.category}: ${g.issue}`,
                  detail: `${g.rule} (AVOID: ${g.avoid})`
                })),
              default: UX_GUIDELINES
                .filter(g => (g.platform === 'Web' || g.platform === 'All') && g.severity === 'High')
                .map(g => `${g.category}: ${g.issue}`)
            },
            {
              key: 'uxGuidelinesIOS',
              type: 'select',
              label: 'UX Guidelines (iOS)',
              multi: true,
              searchable: true,
              showThumbnails: false,
              showWhen: [
                { field: 'platform', equals: 'iOS' },
                { field: 'showAdvanced', equals: true }
              ],
              options: () => UX_GUIDELINES
                .filter(g => g.platform === 'iOS' || g.platform === 'All' || g.platform === 'Mobile')
                .map(g => ({
                  value: `${g.category}: ${g.issue}`,
                  label: `${g.category}: ${g.issue}`,
                  detail: `${g.rule} (AVOID: ${g.avoid})`
                })),
              default: UX_GUIDELINES
                .filter(g => (g.platform === 'iOS' || g.platform === 'All' || g.platform === 'Mobile') && g.severity === 'High')
                .map(g => `${g.category}: ${g.issue}`)
            },
            {
              key: 'uxGuidelinesAndroid',
              type: 'select',
              label: 'UX Guidelines (Android)',
              multi: true,
              searchable: true,
              showThumbnails: false,
              showWhen: [
                { field: 'platform', equals: 'Android' },
                { field: 'showAdvanced', equals: true }
              ],
              options: () => UX_GUIDELINES
                .filter(g => g.platform === 'Android' || g.platform === 'All' || g.platform === 'Mobile')
                .map(g => ({
                  value: `${g.category}: ${g.issue}`,
                  label: `${g.category}: ${g.issue}`,
                  detail: `${g.rule} (AVOID: ${g.avoid})`
                })),
              default: UX_GUIDELINES
                .filter(g => (g.platform === 'Android' || g.platform === 'All' || g.platform === 'Mobile') && g.severity === 'High')
                .map(g => `${g.category}: ${g.issue}`)
            },

            { key: 'designLayoutRules', type: 'textarea', label: 'Design & Layout rules', placeholder: 'e.g. Auto Layout only, clear hierarchy. Root frame: Vertical, Padding: 24, Spacing between sections: 32. Grid: 12 columns, 24 gutter.', default: '', showWhen: { field: 'showAdvanced', equals: true } },
            { key: 'contentRules', type: 'textarea', label: 'Content Rules', placeholder: 'e.g. Headings: concise, max 1 line. Body text: max 2 lines. CTA labels: verb + object. Use realistic UX copy.', default: '', showWhen: { field: 'showAdvanced', equals: true } }
          ]
        },
{
          name: 'UI Section Outline',
          desc: 'Generate UI directly from section outline',
          noSelection: true,
          includeTokens: true,
          requiredContext: ContextMode.ALL,
          fields: [
            { key: 'screenType', type: 'text', label: 'Screen type', placeholder: 'e.g. Landing page / App dashboard', default: 'App dashboard' },
            {
              type: 'row',
              fields: [
                {
                  key: 'platform', type: 'select', label: 'Platform', default: 'Web', options: [
                    { value: 'Web', label: 'Web' },
                    { value: 'iOS', label: 'iOS' },
                    { value: 'Android', label: 'Android' }
                  ]
                },
                {
                  key: 'screenSizeWeb',
                  type: 'select',
                  label: 'Screen Sizes',
                  multi: false,
                  searchable: true,
                  default: '1440x900',
                  showWhen: { field: 'platform', equals: 'Web' },
                  options: [
                    { value: '1920x1080', label: 'xl (1920×1080)' },
                    { value: '1728x1117', label: 'xl (1728×1117)' },
                    { value: '1536x864', label: 'lg (1536×864)' },
                    { value: '1440x900', label: 'lg (1440×900)' },
                    { value: '1366x768', label: 'md (1366×768)' },
                    { value: '1280x800', label: 'md (1280×800)' },
                    { value: '1024x768', label: 'sm (1024×768)' },
                    { value: '834x1194', label: 'tablet (834×1194)' },
                    { value: '768x1024', label: 'xs (768×1024)' },
                    { value: '375x812', label: 'mobile (375×812)' },
                    { value: '__custom__', label: 'Custom...', inputKey: 'customScreenSizeWeb', inputDefault: '', inputType: 'text', inputPlaceholder: 'WxH e.g. 1440x900' }
                  ]
                },
                {
                  key: 'screenSizeIOS',
                  type: 'select',
                  label: 'Screen Sizes',
                  multi: false,
                  searchable: true,
                  default: '393x852',
                  showWhen: { field: 'platform', equals: 'iOS' },
                  options: [
                    { value: '430x932', label: '15Pro Max (430×932)' },
                    { value: '393x852', label: '15Pro (393×852)' },
                    { value: '375x812', label: '13mini (375×812)' },
                    { value: '1024x1366', label: 'iPad Pro 12.9 (1024×1366)' },
                    { value: '__custom__', label: 'Custom...', inputKey: 'customScreenSizeIOS', inputDefault: '', inputType: 'text', inputPlaceholder: 'WxH e.g. 393x852' }
                  ]
                },
                {
                  key: 'screenSizeAndroid',
                  type: 'select',
                  label: 'Screen Sizes',
                  multi: false,
                  searchable: true,
                  default: '412x915',
                  showWhen: { field: 'platform', equals: 'Android' },
                  options: [
                    { value: '412x915', label: 'Pixel 8 (412×915)' },
                    { value: '360x800', label: '360×800' },
                    { value: '800x1280', label: 'Tablet (800×1280)' },
                    { value: '__custom__', label: 'Custom...', inputKey: 'customScreenSizeAndroid', inputDefault: '', inputType: 'text', inputPlaceholder: 'WxH e.g. 412x915' }
                  ]
                }
              ]
            }
          ]
        },
{
          name: 'Create grid',
          desc: 'Advanced grid generator with patterns & shapes',
          prompt: '',
          help: 'Create grids with different patterns (Grid, Brick, Radial, Spiral) and shapes (Rectangle, Ellipse, Polygon, Star, Line, Arrow, Frame).',
          noSelection: true,
          requiredContext: ContextMode.LAYOUT_ONLY,
          directAction: 'createAdvancedGrid',
          fields: [
            {
              key: 'pattern', type: 'select', label: 'Grid Pattern', default: 'grid', options: [
                { value: 'grid', label: 'Grid (Rows × Columns)' },
                { value: 'brick', label: 'Brick Pattern' },
                { value: 'radial', label: 'Radial Pattern' },
                { value: 'spiral', label: 'Spiral Pattern' }
              ]
            },
            {
              key: 'shape', type: 'select', label: 'Shape Type', default: 'rectangle', options: [
                { value: 'rectangle', label: 'Rectangle' },
                { value: 'ellipse', label: 'Ellipse' },
                { value: 'polygon', label: 'Polygon' },
                { value: 'star', label: 'Star' },
                { value: 'line', label: 'Line' },
                { value: 'arrow', label: 'Arrow' },
                { value: 'frame', label: 'Frame' },
                { value: 'selectedLayer', label: 'Selected Layer (clone)' }
              ]
            },

            // Grid/Brick pattern dimensions
            {
              type: 'row',
              fields: [
                { key: 'cols', type: 'number', label: 'Columns', default: 8, min: 1, max: 50 },
                { key: 'rows', type: 'number', label: 'Rows', default: 4, min: 1, max: 50 }
              ]
            },

            // Radial pattern settings
            {
              type: 'row',
              fields: [
                { key: 'radialRadius', type: 'number', label: 'Pattern Radius', default: 200, min: 10, max: 1000, showWhen: { field: 'pattern', equals: 'radial' } },
                { key: 'radialInnerRadius', type: 'number', label: 'Inner Ring Radius', default: 0, min: 0, max: 500, showWhen: { field: 'pattern', equals: 'radial' } }
              ]
            },
            {
              type: 'row',
              fields: [
                { key: 'radialAngle', type: 'number', label: 'Rotation Angle (°)', default: 0, min: 0, max: 360, showWhen: { field: 'pattern', equals: 'radial' } },
                { key: 'radialRings', type: 'number', label: 'Number of Rings', default: 3, min: 1, max: 10, showWhen: { field: 'pattern', equals: 'radial' } }
              ]
            },
            { key: 'radialItems', type: 'number', label: 'Number of Items', default: 20, min: 1, max: 100, showWhen: { field: 'pattern', equals: 'radial' } },

            // Spiral pattern settings
            {
              type: 'row',
              fields: [
                { key: 'spiralRadius', type: 'number', label: 'Pattern Radius', default: 200, min: 10, max: 1000, showWhen: { field: 'pattern', equals: 'spiral' } },
                { key: 'spiralAngle', type: 'number', label: 'Rotation Angle (°)', default: 0, min: 0, max: 360, showWhen: { field: 'pattern', equals: 'spiral' } }
              ]
            },
            {
              type: 'row',
              fields: [
                { key: 'spiralTurns', type: 'number', label: 'Spiral Turns', default: 3, min: 0.1, max: 10, step: 0.1, showWhen: { field: 'pattern', equals: 'spiral' } },
                { key: 'spiralItems', type: 'number', label: 'Number of Items', default: 20, min: 1, max: 100, showWhen: { field: 'pattern', equals: 'spiral' } }
              ]
            },

            // Brick pattern settings
            { key: 'brickOffset', type: 'number', label: 'Brick Offset', default: 0.5, min: 0, max: 1, step: 0.1, showWhen: { field: 'pattern', equals: 'brick' } },

            // Cell dimensions
            {
              type: 'row',
              fields: [
                { key: 'cellWidth', type: 'number', label: 'Cell Width (px)', default: 24, min: 1, max: 500 },
                { key: 'cellHeight', type: 'number', label: 'Cell Height (px)', default: 24, min: 1, max: 500 }
              ]
            },
            { key: 'spacing', type: 'number', label: 'Spacing (px)', default: 16, min: 0, max: 100 },

            // Shape styling
            { key: 'color', type: 'color', label: 'Fill Color', default: '#E5E7EB', showWhen: { field: 'shape', notEquals: 'line' } },
            {
              type: 'row',
              fields: [
                { key: 'strokeColor', type: 'color', label: 'Stroke Color', default: '#000000' },
                { key: 'strokeWeight', type: 'number', label: 'Stroke Weight (px)', default: 0, min: 0, max: 20 }
              ]
            },

            // Rectangle/Frame specific settings
            { key: 'cornerRadius', type: 'number', label: 'Corner Radius (px)', default: 0, min: 0, max: 50, showWhen: { field: 'shape', equals: 'rectangle' } },
            { key: 'cornerRadius', type: 'number', label: 'Corner Radius (px)', default: 0, min: 0, max: 50, showWhen: { field: 'shape', equals: 'frame' } },

            // Polygon specific settings
            { key: 'sides', type: 'number', label: 'Polygon Sides', default: 6, min: 3, max: 20, showWhen: { field: 'shape', equals: 'polygon' } },

            // Star specific settings
            {
              type: 'row',
              fields: [
                { key: 'points', type: 'number', label: 'Star Points', default: 5, min: 3, max: 20, showWhen: { field: 'shape', equals: 'star' } },
                { key: 'innerRadius', type: 'number', label: 'Star Inner Radius', default: 0.4, min: 0, max: 1, step: 0.1, showWhen: { field: 'shape', equals: 'star' } }
              ]
            }
          ],
          directAction: 'createAdvancedGrid'
        },
{
          name: 'Flatten structure (clean up)',
          desc: 'Remove 1-child groups',
          help: 'Uses native ungroup to safely collapse chains of single-child GROUP wrappers; skips components/instances/locked groups.',
          requiredContext: ContextMode.HIERARCHY,
          directAction: 'flattenStructure',
        },
{
          name: 'Split text',
          desc: 'Split text into layers by line breaks or pattern',
          requiredContext: ContextMode.TEXT_ONLY,
          directAction: 'splitTextLocal',
          fields: [
            {
              key: 'splitMode',
              type: 'select',
              label: 'Mode',
              default: 'lines',
              options: [
                { value: 'lines', label: 'Split into lines' },
                { value: 'autolayout', label: 'Lines in auto layout' },
                { value: 'custom', label: 'Split by symbol' },
              ],
            },
            {
              key: 'customPattern',
              type: 'text',
              label: 'What to split by',
              selectionPicker: 'splitPattern',
              placeholder: 'e.g. , or -',
              hint: 'Enter the symbol or text to split by.',
              showWhen: { field: 'splitMode', equals: 'custom' },
            },
            {
              key: 'removeLeadingSpace',
              type: 'checkbox',
              label: 'Remove leading spaces',
              default: false,
              hint: 'Removes spaces at the start of each result.',
            },
            {
              key: 'keepInputCharacter',
              type: 'checkbox',
              label: 'Keep the symbol',
              default: false,
              hint: 'Keeps the matched symbol with the text before it.',
              showWhen: { field: 'splitMode', equals: 'custom' },
            },
          ],
        },
{
          name: 'Easy wrapper',
          desc: 'Wrap or convert frames, groups, and auto layout',
          help: 'Wrap each selected layer separately, or wrap selected sibling layers together per parent, using group, frame, or auto layout. Convert mode turns existing frames/groups into auto layout. Wrapped rows are available for auto layout where applicable. Works in No AI mode.',
          requiredContext: ContextMode.LAYOUT_ONLY,
          directAction: 'easyWrapper',
          fields: [
            {
              key: 'mode',
              type: 'select',
              label: 'Mode',
              default: 'each',
              options: [
                { value: 'each', label: 'Wrap each selected layer separately' },
                { value: 'sameParentTogether', label: 'Wrap selected sibling layers together (per parent)' },
                { value: 'convert', label: 'Convert to auto layout (existing frame/group)' },
              ],
            },
            {
              key: 'wrapper',
              type: 'select',
              label: 'Container',
              default: 'autoLayout',
              options: [
                { value: 'group', label: 'Group' },
                { value: 'frame', label: 'Frame' },
                { value: 'autoLayout', label: 'Auto layout' },
              ],
              showWhen: {
                anyOf: [
                  [{ field: 'mode', equals: 'each' }],
                  [{ field: 'mode', equals: 'sameParentTogether' }],
                ],
              },
            },
            {
              key: 'direction',
              type: 'select',
              label: 'Auto layout direction',
              default: 'AUTO',
              options: [
                { value: 'AUTO', label: 'Auto' },
                { value: 'HORIZONTAL', label: 'Horizontal' },
                { value: 'VERTICAL', label: 'Vertical' },
              ],
              showWhen: [
                { field: 'mode', equals: 'sameParentTogether' },
                { field: 'wrapper', equals: 'autoLayout' },
              ],
            },
            {
              key: 'layoutWrap',
              type: 'checkbox',
              label: 'Wrap rows (layout wrap)',
              default: false,
              hint: 'Figma auto-layout wrap: items flow onto new rows when space is tight.',
              showWhen: [
                { field: 'mode', equals: 'sameParentTogether' },
                { field: 'wrapper', equals: 'autoLayout' },
              ],
            },
            {
              key: 'counterAxisSpacing',
              type: 'number',
              label: 'Row gap (px)',
              default: 0,
              min: 0,
              max: 500,
              hint: 'Vertical gap between wrapped rows; 0 uses the frame’s item spacing.',
              showWhen: [
                { field: 'mode', equals: 'sameParentTogether' },
                { field: 'wrapper', equals: 'autoLayout' },
                { field: 'layoutWrap', equals: 'true' },
              ],
            },
            {
              key: 'wrapperName',
              type: 'text',
              label: 'Name (optional)',
              placeholder: 'e.g. Container',
              default: '',
            },
            {
              key: 'convertLayoutWrap',
              type: 'checkbox',
              label: 'Wrap rows after convert',
              default: false,
              hint: 'Applies layout wrap on the converted auto-layout frame.',
              showWhen: { field: 'mode', equals: 'convert' },
            },
            {
              key: 'convertCounterAxisSpacing',
              type: 'number',
              label: 'Row gap after convert (px)',
              default: 0,
              min: 0,
              max: 500,
              hint: '0 uses the frame’s item spacing.',
              showWhen: [
                { field: 'mode', equals: 'convert' },
                { field: 'convertLayoutWrap', equals: 'true' },
              ],
            },
          ],
        },
{
          name: 'Add Description',
          desc: 'Add comprehensive component description',
          prompt: '',
          help: 'Adds a detailed description to the selected component with customizable sections.',
          requiredContext: ContextMode.ALL,
          fields: [
            {
              key: 'descriptionRequest',
              type: 'textarea',
              label: 'Description',
              placeholder: 'Describe the specific component description you want, such as what to emphasize, explain, or document.',
              default: ''
            },
            { key: 'includePurpose', type: 'checkbox', label: 'Component purpose/role', default: true, hint: 'Describe what the component does and its primary function' },
            { key: 'includeGuidelines', type: 'checkbox', label: 'Usage Guidelines', default: true, hint: '2-3 ✅ Do items and 2-3 ❌ Don\'t items (no redundant items)' },
            { key: 'includeVariants', type: 'checkbox', label: 'Variants and states', default: false, hint: 'List available variants and key states' },
            { key: 'includeResponsiveness', type: 'checkbox', label: 'Responsiveness/behavior', default: false },
            { key: 'includeContent', type: 'checkbox', label: 'Content guidelines', default: false, hint: 'Guidelines for text length, icons, or placeholder content (e.g., \'Limit labels to 2-3 words\')' }
          ],
          promptTemplate: (values) => {
            const sections = [];
            if (values.includePurpose) {
              sections.push('- COMPONENT PURPOSE/ROLE: describe what the component does and its primary function with precise wording.');
            }
            if (values.includeGuidelines) {
              sections.push("- USAGE GUIDELINES: exactly 2-3 ✅ Do items and 2-3 ❌ Don't items. Tailor to the component's role, prominence, variant, size, label length, and page hierarchy. Avoid redundant items.");
            }
            if (values.includeVariants) {
              sections.push('- VARIANTS AND STATES: list available variants and key states.');
            }
            if (values.includeResponsiveness) {
              sections.push('- RESPONSIVENESS/BEHAVIOR: describe how the component behaves across different screen sizes or interactions.');
            }
            if (values.includeContent) {
              sections.push("- CONTENT GUIDELINES: provide guidelines for text length, icons, or placeholder content (for example, 'Limit labels to 2-3 words').");
            }

            const promptParts = [
              'Generate a description for the selected component(s) and write it into the component description instead of replying in chat.',
              'Only include the sections explicitly requested below. If a section is not requested, omit it completely. Do not add any extra sections on your own.'
            ];

            if (values.descriptionRequest && String(values.descriptionRequest).trim()) {
              promptParts.push(`Custom user request:\n${String(values.descriptionRequest).trim()}`);
            }

            if (sections.length > 0) {
              promptParts.push(`Requested sections:\n${sections.join('\n')}`);
            } else if (values.descriptionRequest && String(values.descriptionRequest).trim()) {
              promptParts.push('No preset sections were selected. Write a concise component description that follows only the custom user request.');
            } else {
              promptParts.push('No preset sections were selected. Write a short neutral component description with no extra breakdown sections.');
            }

            return promptParts.join('\n\n');
          },
        },
{
          name: 'Add annotation',
          desc: 'Attach detailed notes to selected node',
          requiredContext: ContextMode.ALL,
          fields: [
            {
              key: 'annotationRequest',
              type: 'textarea',
              label: 'Description',
              placeholder: 'Describe the specific annotation you want, such as what to explain, emphasize, or warn about.',
              default: ''
            },
            {
              key: 'includeNodeName',
              type: 'checkbox',
              label: 'Node name',
              default: false
            },
            {
              key: 'includeDescription',
              type: 'checkbox',
              label: 'Generated description',
              default: true
            },
            {
              key: 'includeUsageGuidelines',
              type: 'checkbox',
              label: 'Usage guidelines',
              hint: 'Format: 2-3 ✅ Do: items and 2-3 ❌ Don\'t: items based on component role, prominence, variant, size, label length, and page hierarchy',
              default: false
            },
            {
              key: 'includeDimensions',
              type: 'checkbox',
              label: 'Dimensions',
              default: false
            },
            {
              key: 'includeTextCounts',
              type: 'checkbox',
              label: 'Text counts',
              default: false
            },
            {
              key: 'includeHandOffNote',
              type: 'checkbox',
              label: 'Hand off note',
              hint: 'Explicit but complete description for developer to understand designer intention',
              default: false
            },
            {
              key: 'replaceExisting',
              type: 'checkbox',
              label: 'Replace existing annotations',
              hint: 'If checked, clear current annotations before adding the new one.',
              default: false
            }
          ],
          includeTokens: true,
          // Use promptTemplate so the drawer can build the prompt dynamically.
          // We store the generated content in labelMarkdown to avoid invalid annotation properties.
          promptTemplate: (values) => {
            const parts = [];
            if (values.includeNodeName) {
              parts.push('- Node name');
            }
            if (values.includeDescription) {
              parts.push('- Detailed description of what this element is');
            }
            if (values.includeUsageGuidelines) {
              parts.push("- Usage guidelines: 2-3 ✅ Do items and 2-3 ❌ Don't items tailored to the component's role, prominence, variant, size, label length, and page hierarchy");
            }
            if (values.includeHandOffNote) {
              parts.push('- Hand off note for developers. For each implemented property (fills, padding, spacing, radius, etc.), check if a human-readable design token name exists in the \'tokens\' object. If a token name is found, use it (e.g., \'Use token "Primary/Blue-500"\'). If NO token name is found in the \'tokens\' object, use the raw numeric or hex value from the node data (e.g., \'Use 16px\' or \'Use #FFFFFF\'). NEVER output names starting with \'tokens.\' or use raw IDs. Focus on implementation details, edge cases, and behavior.');
            }
            if (values.includeDimensions) {
              parts.push('- Node dimensions (width × height px)');
            }
            if (values.includeTextCounts) {
              parts.push('- Text counts for different languages separately and a total count');
            }

            const promptParts = [
              'Generate annotation content for the selected node.',
              'Write ANNOTATION_CONTENT in the same primary language as the selected node. Do not translate; if the selection is mixed-language, use the majority language.',
              'Only include the parts explicitly requested below. If a part is not requested, omit it completely. Do not add any extra sections on your own.'
            ];

            if (values.annotationRequest && String(values.annotationRequest).trim()) {
              promptParts.push(`Custom user request:\n${String(values.annotationRequest).trim()}`);
            }

            if (parts.length > 0) {
              promptParts.push(`Requested parts:\n${parts.join('\n')}`);
            } else if (values.annotationRequest && String(values.annotationRequest).trim()) {
              promptParts.push('No preset parts were selected. Create a concise annotation that follows only the custom user request.');
            } else {
              promptParts.push('No preset parts were selected. Create a short neutral annotation with no extra breakdown sections.');
            }

            promptParts.push(`Return ONLY JSON with commands: [
              { replaceExisting? { "action": "clearAnnotations" } : null},
  { "action": "addAnnotation", "labelMarkdown": "ANNOTATION_CONTENT", "properties": [] }
      ]
        `);

            return promptParts.join('\n\n');
          }
        },
{
          name: 'Add interaction',
          desc: 'Connect elements via click/hover',
          requiredContext: ContextMode.ALL,
          prompt: 'Connect elements logically. For Component Sets, use variant names (e.g., "State=Hover") to detect state transitions (use navigation: "CHANGE_TO"). For buttons/links, find a matching destination frame. Return ONLY JSON: [{"action":"setReaction","nodeId":"<SOURCE_ID>","trigger":{"type":"ON_CLICK"},"actions":[{"type":"NODE","destinationId":"<DEST_ID>","navigation":"NAVIGATE/CHANGE_TO","transition":{"type":"SMART_ANIMATE"}}]}]'
        },
{
          name: 'Create Graph',
          desc: 'Generate data visualizations and charts',
          noSelection: true,
          includeTokens: true,
          requiredContext: ContextMode.ALL,
          fields: [
            {
              key: 'chartType',
              type: 'select',
              label: 'Chart Type',
              searchable: true,
              default: 'Line Chart',
              options: [] // Hydrated dynamically
            },
            {
              key: 'chartSize',
              type: 'select',
              label: 'Chart Size',
              default: 'Auto',
              options: [
                { value: 'Auto', label: 'Auto (selection)' },
                { value: '__custom__', label: 'Custom...', inputKey: 'customChartSize', inputDefault: '', inputType: 'text', inputPlaceholder: 'WxH' }
              ]
            },
            { key: 'description', type: 'textarea', label: 'Description (Optional)', placeholder: 'Describe custom prompt or data...', default: '', aiButtons: true },
            {
              key: 'imageInput',
              type: 'image',
              label: 'Reference Image (Optional)',
              hint: 'Upload a style or data reference image'
            }
          ],
          promptTemplate: function (values) {
            const chartType = values.chartType;
            // Find the original preset for data type, keywords and color guidance
            const preset = CHART_PRESETS.find(p => {
              const types = [p.bestChartType, ...p.secondaryOptions];
              return types.some(type => {
                const splitTypes = type.split(/ or | \/ |, /).map(s => s.trim());
                if (splitTypes.includes(chartType)) return true;
                if (type.includes('Horizontal or Vertical')) {
                  return chartType === 'Bar Chart (Horizontal)' || chartType === 'Bar Chart (Vertical)';
                }
                return false;
              });
            });

            let prompt = `Create a ${chartType} in Figma.`;
            if (preset) {
              prompt += `\n- Data Type: ${preset.dataType}`;
              prompt += `\n- Keywords: ${preset.keywords}`;
              prompt += `\n- Color Guidance: ${preset.colorGuidance}`;
            }

            let size = values.chartSize;
            if (size === 'Auto' && values.customChartSize) {
              // If we have customChartSize but size is Auto, it means we hydrated it
              size = values.customChartSize;
            } else if (size === '__custom__' && values.customChartSize) {
              size = values.customChartSize;
            }

            if (size && size !== 'Auto') {
              prompt += `\n- Target Dimensions: ${size}`;
            }

            if (values.description) {
              prompt += `\n- User Description/Data: ${values.description}`;
            }

            prompt += `\n\nGenerate a clean, professional visualization. Use only plain Figma frames, rectangles, vectors, and text nodes with manual positioning. DO NOT use auto layout anywhere in this chart, including wrappers, titles, legends, labels, or containers. DO NOT emit setAutoLayout. DO NOT emit applyAutoLayout. DO NOT emit easyWrapper with wrapper "autoLayout" or mode "convert". Do not set auto-layout-only properties such as layoutWrap, counterAxisSpacing, counterAxisAlignContent, primaryAxisAlignItems, counterAxisAlignItems, primaryAxisSizingMode, counterAxisSizingMode, or FILL/HUG sizing that depends on auto layout. Every chart element must be positioned with explicit x/y coordinates inside normal frames so radar charts and other plotted visuals stay precisely aligned. Return ONLY JSON commands.`;
            return prompt;
          }
        }
];

export function createQuickCreateUiTasks({ getCustomStyleCategories } = {}) {
  return [
{
          name: 'Placeholder set',
          desc: 'Create N placeholder boxes',
          prompt: '',
          directAction: 'placeholderSet',
          help: 'Creates multiple placeholder rectangles arranged in a row or column.',
          noSelection: true,
          fields: [
            {
              key: 'nodeType', type: 'select', label: 'Node type', default: 'rectangle', options: [
                { value: 'rectangle', label: 'Rectangle' },
                { value: 'frame', label: 'Frame' },
                { value: 'autoLayout', label: 'Auto-layout frame' },
                { value: 'matchSelection', label: 'Match current shape' },
              ], hint: 'Choose the element type for each placeholder. "Match current shape" will reuse the first selected node type when available.'
            },

            {
              type: 'row',
              fields: [
                { key: 'count', type: 'number', label: 'Count', default: 5, min: 1, max: 50 },
                { key: 'spacing', type: 'number', label: 'Spacing (px)', default: 16, min: 0 }
              ]
            },
            {
              type: 'row',
              fields: [
                { key: 'width', type: 'number', label: 'Width (px)', default: 200, min: 10 },
                { key: 'height', type: 'number', label: 'Height (px)', default: 150, min: 10 }
              ]
            },
            {
              key: 'direction', type: 'select', label: 'Direction', default: 'horizontal', options: [
                { value: 'horizontal', label: 'Horizontal row' },
                { value: 'vertical', label: 'Vertical column' },
              ]
            },
            { key: 'color', type: 'color', label: 'Fill Color', default: '#9CA3AF' },
          ],
        },
{
          name: 'Turn into Component Set',
          desc: 'Convert selection to component with property',
          help: 'Converts the selected node into a component, puts it inside a component set, and replaces the original with an instance.',
          directAction: 'turnIntoComponentSet',
          fields: [
            { key: 'name', type: 'text', label: 'Component Name', placeholder: 'e.g., Primary Button' },
            { key: 'propertyName', type: 'text', label: 'Property Name', default: 'State', placeholder: 'e.g., State, Type, Size' },
            { key: 'propertyValue', type: 'text', label: 'Property Value', default: 'Default', placeholder: 'e.g., Normal, Primary, Large' }
          ]
        },
{
          name: 'AI Component Factory',
          desc: 'Generate any complex component with variants',
          help: 'Describe a component (e.g. Card, Modal, Input) and AI will build a complete component set with variants for you.',
          noSelection: true,
          includeTokens: true,
          requiredContext: ContextMode.ALL,
          fields: [
            { key: 'componentName', type: 'text', label: 'Component Name', default: 'CustomComponent' },
            {
              key: 'variants', type: 'text', label: 'Variant States (Comma separated)', default: 'Normal, Hover, Pressed, Disabled', placeholder: 'e.g. Normal, Hover, Active, Loading'
            },
            {
              key: 'style',
              type: 'select',
              label: 'Design Style',
              searchable: true,
              default: 'Auto',
              options: STYLE_CATEGORIES.map(s => ({ value: s.name, label: s.name }))
            },
            { key: 'description', type: 'textarea', label: 'Component Details', placeholder: 'e.g. A user profile card with avatar, name, bio, and heart icon. Include: avatar image, username, bio text, follow button, and heart icon.', default: '', aiButtons: true },
            {
              key: 'imageInput',
              type: 'image',
              label: 'Style Reference (Optional)',
              hint: 'Upload an image to guide the visual style'
            }
          ],
          promptTemplate: (values) => {
            const variantStates = (values.variants || 'Normal, Hover, Pressed, Disabled').split(',').map(s => s.trim()).filter(Boolean);
            const styleName = values.style || 'Auto';
            const resolvedCustomStyleCategories = getCustomStyleCategories ? getCustomStyleCategories() : [];
          const styleData = STYLE_CATEGORIES.find(s => s.name === styleName) || resolvedCustomStyleCategories.find(s => s.name === styleName);

            const variantDescriptions = variantStates.map(state => {
              const s = state.toLowerCase();
              let desc = '';
              if (s === 'normal' || s === 'default') {
                desc = 'base/resting state with standard styling — full colors, standard shadow/elevation, normal opacity';
              } else if (s === 'hover') {
                desc = 'hover state: slightly darker or accent-tinted background fill, elevated shadow (increase blur/offset by ~2-4px), subtle scale or border highlight';
              } else if (s === 'pressed' || s === 'active') {
                desc = 'pressed/active state: noticeably darker background, reduced or flattened shadow, inset feel, slight scale-down effect';
              } else if (s === 'disabled') {
                desc = 'disabled state: set opacity to 0.4-0.5 on the root frame, muted/desaturated colors, no shadow, no interactive affordance';
              } else if (s === 'selected') {
                desc = 'selected state: accent-colored border (2px stroke), highlighted or tinted background, stronger visual weight';
              } else if (s === 'focused' || s === 'focus') {
                desc = 'focused state: visible focus ring (2-3px accent-colored border or outline with offset), standard background';
              } else if (s === 'loading') {
                desc = 'loading state: placeholder shimmer rectangles or skeleton layout replacing content, muted colors, animated feel';
              } else if (s === 'error') {
                desc = 'error state: red/danger-colored border or background tint (#EF4444 / #FEE2E2), error icon, warning text color';
              } else if (s === 'success') {
                desc = 'success state: green/success-colored border or background tint (#22C55E / #DCFCE7), checkmark icon, success text color';
              } else {
                desc = `${state} state: apply visually distinct styling appropriate for "${state}" — adjust background, border, shadow, or opacity to clearly differentiate from Normal`;
              }
              return `  "State=${state}" → ${desc}`;
            }).join('\n');

            let styleGuide = '';
            if (styleData) {
              styleGuide = `\nSTYLE GUIDELINES (${styleData.name}):
- Keywords: ${styleData.keywords || 'modern, clean'}
- Primary Colors: ${styleData.primaryColors || '#000000, #FFFFFF'}
- Secondary/Accent Colors: ${styleData.secondaryColors || 'neutral greys'}
- Effects: ${styleData.effects || 'subtle shadows'}
- IMPORTANT: Apply these colors, effects, and design language throughout the component. Use the primary colors for backgrounds and key elements, secondary/accent for interactive elements, buttons, and highlights. The component should LOOK like it belongs in a ${styleData.name} design system.`;
            } else {
              styleGuide = `\nSTYLE GUIDELINES (${styleName}):
- Apply design language consistent with "${styleName}" throughout the component.
- Use appropriate colors, spacing, shadows, and typography that match this style.`;
            }

            return `Create a high-quality, production-ready Figma component set named "{componentName}" with ${variantStates.length} variants.
Description & Contents: {description}.
${styleGuide}

VARIANT MATRIX — You MUST create exactly ${variantStates.length} variants:
${variantDescriptions}

Component set properties:
- "State" property with values: ${variantStates.join(', ')}


COMPONENT SET LAYOUT (CRITICAL):
When using "createComponentSet", pass this layout option to arrange variants in a grid:
{"layoutMode":"HORIZONTAL","layoutWrap":"WRAP","itemSpacing":32,"counterAxisSpacing":32,"padding":40,"skipInstanceCreation":true}

INSTANCE RULES (CRITICAL):
- Do NOT create instances for every variant. After creating the component set, create only ONE instance from the default variant.
- The component set itself already displays all variants in its grid. Only one instance is needed for placement on the canvas.

Return ONLY JSON.`;
          }
        },
{
          name: 'Card Component',
          desc: 'Rich UI card with image and content',
          help: 'Generates a modern, responsive card component with variants, layout orientations, and media options.',
          noSelection: true,
          includeTokens: true,
          requiredContext: ContextMode.ALL,
          fields: [
            { key: 'title', type: 'text', label: 'Card Title', default: 'Product Title' },
            { key: 'description', type: 'textarea', label: 'Card Content', default: 'Modern, minimal product description with price and rating.', placeholder: 'e.g. A product card with price, reviews, and "Add to cart" button.' },
            {
              key: 'variants', type: 'select', label: 'States', multi: true, default: ['Normal', 'Hover'], options: [
                { value: 'Normal', label: 'Normal' },
                { value: 'Hover', label: 'Hover' },
                { value: 'Pressed', label: 'Pressed' },
                { value: 'Disabled', label: 'Disabled' },
                { value: 'Selected', label: 'Selected' }
              ]
            },
            {
              key: 'layout', type: 'select', label: 'Layout', multi: true, default: ['Vertical'], options: [
                { value: 'Vertical', label: 'Vertical (Stacked)' },
                { value: 'Horizontal', label: 'Horizontal (Side-by-side)' }
              ]
            },
            {
              key: 'media', type: 'select', label: 'Image', multi: true, default: ['With Image'], options: [
                { value: 'With Image', label: 'With Image' },
                { value: 'No Image', label: 'Without Image' }
              ]
            },
            {
              key: 'style', type: 'select', label: 'Style', default: 'elevated', options: [
                { value: 'elevated', label: 'Elevated (Soft Shadow)' },
                { value: 'outlined', label: 'Outlined (Bordered)' },
                { value: 'flat', label: 'Flat / Minimal' },
                { value: 'glassmorphism', label: 'Glassmorphism' }
              ]
            },
            { key: 'color', type: 'color', label: 'Accent Color', default: '#3B82F6' },
            { key: 'imageInput', type: 'image', label: 'Style Reference (Optional)' }
          ],
          promptTemplate: (values) => {
            const layouts = Array.isArray(values.layout) ? values.layout : [values.layout];
            const mediaOpts = Array.isArray(values.media) ? values.media : [values.media];
            const variants = Array.isArray(values.variants) ? values.variants : [values.variants];

            const totalVariants = variants.length * layouts.length * mediaOpts.length;

            // Build the explicit variant matrix so the AI knows exactly what to create
            const variantList = [];
            for (const state of variants) {
              for (const layout of layouts) {
                for (const media of mediaOpts) {
                  const props = [`State=${state}`];
                  if (layouts.length > 1) props.push(`Layout=${layout}`);
                  if (mediaOpts.length > 1) props.push(`Media=${media}`);
                  const name = props.join(', ');

                  const desc = [];
                  // Layout description
                  if (layout === 'Vertical') {
                    desc.push('VERTICAL auto-layout (stacked: image on top, content below)');
                  } else {
                    desc.push('HORIZONTAL auto-layout (side-by-side: image left, content right)');
                  }
                  // Media description
                  if (media === 'With Image') {
                    desc.push('includes an image placeholder rectangle');
                  } else {
                    desc.push('NO image element at all — content only');
                  }
                  // State description
                  if (state === 'Hover') {
                    desc.push('subtle hover effect: slightly darker background or elevated shadow');
                  } else if (state === 'Pressed') {
                    desc.push('pressed/active effect: darker background, reduced shadow');
                  } else if (state === 'Disabled') {
                    desc.push('disabled look: opacity 0.5 on the entire card, muted colors');
                  } else if (state === 'Selected') {
                    desc.push('selected state: accent-colored border or highlighted background');
                  }

                  variantList.push(`  "${name}" → ${desc.join('; ')}`);
                }
              }
            }

            let propRules = '';
            if (layouts.length > 1) {
              propRules += '- "Layout" property with values: "Vertical", "Horizontal"\n';
            }
            if (mediaOpts.length > 1) {
              propRules += '- "Media" property with values: "With Image", "No Image"\n';
            }

            return `Create a high-quality card component set named "{title}" in Figma.
Style: {style}. Accent color: {color}.
Contents: {description}.
Include title, body text, and a primary action button. Use auto-layout for everything.

VARIANT MATRIX — You MUST create exactly ${totalVariants} variants:
${variantList.join('\n')}

Component set properties:
- "State" property with values: ${variants.join(', ')}
${propRules}
BUILD EACH VARIANT FROM SCRATCH (CRITICAL):
- Do NOT use "duplicate" commands to create variants. Each variant MUST be built as its own independent createFrame with its own child elements (createText, createRectangle, etc.), its own setAutoLayout, and its own styling.
- Vertical variants: the card's root frame uses VERTICAL auto-layout (image on top, content stacked below).
- Horizontal variants: the card's root frame uses HORIZONTAL auto-layout (image on the left side, content on the right side). The image should be a fixed-width rectangle and the content frame should fill the remaining space.
- "With Image" variants: include a createRectangle as the image placeholder (with a subtle fill color like #E5E7EB).
- "No Image" variants: do NOT create any image rectangle at all. The card has only the content area.
- Disabled variants: set opacity to 0.5 on the root frame after building it.
- Hover variants: apply a slightly darker or accent-tinted background, or a stronger shadow effect.
- Pressed variants: apply a noticeably darker background and flatten/remove the shadow.
- Selected variants: add an accent-colored border (stroke) around the card.

COMPONENT SET LAYOUT (CRITICAL):
When using "createComponentSet", pass this layout option to arrange variants in a grid:
{"layoutMode":"HORIZONTAL","layoutWrap":"WRAP","itemSpacing":32,"counterAxisSpacing":32,"padding":40,"skipInstanceCreation":true}

INSTANCE RULES (CRITICAL):
- Do NOT create instances for every variant. After creating the component set, create only ONE instance from the default variant.
- The component set itself already displays all variants in its grid. Only one instance is needed for placement on the canvas.

Return ONLY JSON.`;
          }
        },
{
          name: 'Modal / Dialog',
          desc: 'Popup window with header and actions',
          help: 'Generates a centered modal component with customizable header, body and buttons.',
          noSelection: true,
          includeTokens: true,
          requiredContext: ContextMode.ALL,
          fields: [
            { key: 'title', type: 'text', label: 'Modal Title', default: 'Confirmation' },
            { key: 'content', type: 'textarea', label: 'Content description', default: 'Are you sure you want to proceed with this action? This cannot be undone.' },
            {
              type: 'row',
              fields: [
                { key: 'primaryBtn', type: 'text', label: 'Primary Button', default: 'Confirm' },
                { key: 'secondaryBtn', type: 'text', label: 'Secondary Button', default: 'Cancel' }
              ]
            },
            { key: 'color', type: 'color', label: 'Primary Color', default: '#3B82F6' },
            { key: 'showCloseIcon', type: 'checkbox', label: 'Include close icon', default: true }
          ],
          promptTemplate: 'Create a modal dialog component named "Modal / {title}". Title: {title}. Content: {content}. Buttons: {primaryBtn} (primary, color:{color}), {secondaryBtn} (secondary). {showCloseIcon ? "Include a close (X) icon in the top right." : ""} Use auto-layout.\n\nCOMPONENT SET LAYOUT: When using "createComponentSet", pass this layout option to arrange variants in a grid: {"layoutMode":"HORIZONTAL","layoutWrap":"WRAP","itemSpacing":32,"counterAxisSpacing":32,"padding":40,"skipInstanceCreation":true}\n\nINSTANCE RULES: Do NOT create instances for every variant. After creating the component set, create only ONE instance from the default variant. The component set itself already displays all variants in its grid.\n\nReturn ONLY JSON.'
        },
{
          name: 'Button',
          desc: 'Smart button component set with states',
          noSelection: true,
          directAction: 'createButtonComponentSet',
          fields: [
            { key: 'buttonText', type: 'text', label: 'Button Text', default: 'Action' },
            {
              key: 'btnType', type: 'select', label: 'Button Type', multi: true, default: ['solid'], options: [
                { value: 'solid', label: 'Solid' },
                { value: 'outline', label: 'Outline' },
                { value: 'ghost', label: 'Ghost' },
                { value: 'link', label: 'Link' },
                { value: 'iconBtn', label: 'Icon Button' }
              ]
            },
            {
              key: 'buttonStyle', type: 'select', label: 'Button Style', multi: true, default: ['primary'], options: [
                { value: 'primary', label: 'Primary' },
                { value: 'secondary', label: 'Secondary' },
                { value: 'danger', label: 'Danger' }
              ]
            },
            {
              key: 'size', type: 'select', label: 'Size', multi: true, default: ['md'], options: [
                { value: 'xxs', label: 'xxs' },
                { value: 'xs', label: 'xs' },
                { value: 'sm', label: 'sm' },
                { value: 'md', label: 'md' },
                { value: 'lg', label: 'lg' },
                { value: 'xl', label: 'xl' },
                { value: 'xxl', label: 'xxl' }
              ]
            },
            {
              key: 'states', type: 'select', label: 'State Behavior', multi: true, default: ['normal', 'hover', 'disabled'], options: [
                { value: 'normal', label: 'Normal' },
                { value: 'hover', label: 'Hover' },
                { value: 'focus', label: 'Focus' },
                { value: 'active', label: 'Active' },
                { value: 'disabled', label: 'Disabled' },
                { value: 'loading', label: 'Loading' }
              ]
            },
            {
              type: 'row',
              fields: [
                { key: 'iconLeft', type: 'text', label: 'Left Icon (Iconify ID)', placeholder: 'e.g. mdi:arrow-left' },
                { key: 'iconRight', type: 'text', label: 'Right Icon (Iconify ID)', placeholder: 'e.g. mdi:arrow-right' }
              ]
            },
            {
              type: 'row',
              fields: [
                { key: 'color', type: 'color', label: 'Theme Color', default: '#3B82F6' },
                { key: 'cornerRadius', type: 'slider', label: 'Radius', default: 8, min: 0, max: 48, step: 2 }
              ]
            },
            {
              type: 'row',
              fields: [
                {
                  key: 'paddingH', type: 'slider', label: 'Horizontal Padding', default: 16, min: 4, max: 64, step: 2
                },
                {
                  key: 'paddingV', type: 'slider', label: 'Vertical Padding', default: 10, min: 4, max: 48, step: 2
                }
              ]
            }
          ]
        },
{
          name: 'Create grid line',
          desc: 'Create evenly spaced lines',
          prompt: '',
          directAction: 'createGridLines',
          noSelection: true,
          fields: [
            {
              key: 'mode', type: 'select', label: 'Grid Mode', default: 'totalSize', options: [
                { value: 'totalSize', label: 'Lines with total size' },
                { value: 'squareGrid', label: 'N x M squares' },
              ]
            },
            {
              type: 'row',
              fields: [
                { key: 'count', type: 'number', label: 'Lines per direction', default: 5, min: 1, max: 50, showWhen: { field: 'mode', equals: 'totalSize' } },
                { key: 'length', type: 'number', label: 'Grid Size (px)', default: 400, min: 10, showWhen: { field: 'mode', equals: 'totalSize' } }
              ]
            },
            {
              type: 'row',
              fields: [
                { key: 'rows', type: 'number', label: 'Rows (M)', default: 6, min: 1, max: 200, showWhen: { field: 'mode', equals: 'squareGrid' } },
                { key: 'cols', type: 'number', label: 'Columns (N)', default: 6, min: 1, max: 200, showWhen: { field: 'mode', equals: 'squareGrid' } }
              ]
            },
            { key: 'squareSize', type: 'number', label: 'Square size (px)', default: 50, min: 1, max: 10000, showWhen: { field: 'mode', equals: 'squareGrid' } },
            { key: 'color', type: 'color', label: 'Line Color', default: '#E5E7EB' },
            { key: 'strokeWeight', type: 'number', label: 'Stroke Weight', default: 1, min: 0.5, step: 0.5 },
          ]
        },
{
          name: 'Add property',
          desc: 'Batch add component properties to the selection',
          help: 'Adds a Boolean, Text, or Instance Swap property to every valid component or component set in the current selection. Mixed selections are allowed and unsupported items will be warned about before running.',
          directAction: 'addProperty',
          fields: [
            {
              key: 'propertyKind',
              type: 'select',
              label: 'Property Type',
              default: 'boolean',
              options: [
                { value: 'boolean', label: 'Boolean Property' },
                { value: 'text', label: 'Text Property' },
                { value: 'instanceSwap', label: 'Instance Swap Property' }
              ]
            },
            {
              key: 'propertyName',
              type: 'text',
              label: 'Property Name',
              placeholder: 'e.g., Show Icon, Label, Leading Icon'
            },
            {
              key: 'booleanDefault',
              type: 'checkbox',
              label: 'Default Value',
              default: true,
              showWhen: { field: 'propertyKind', equals: 'boolean' }
            },
            {
              key: 'textDefault',
              type: 'text',
              label: 'Default String',
              default: '',
              placeholder: 'e.g., Button',
              showWhen: { field: 'propertyKind', equals: 'text' }
            },
            {
              key: 'instanceDefault',
              type: 'select',
              label: 'Default Instance',
              searchable: true,
              default: '',
              options: [],
              hint: 'Choose a concrete component from the current selection.',
              actionButton: {
                action: 'refresh-add-property-fields',
                label: 'Refresh'
              },
              showWhen: { field: 'propertyKind', equals: 'instanceSwap' }
            }
          ]
        },
{
          name: 'Create variants',
          desc: 'Duplicate with color variations',
          requiredContext: ContextMode.MINIMAL,
          prompt: 'Duplicate the selected element twice using duplicate command with offsetX:120. Then use setFill on the first copy with color:#3B82F6 (primary blue), and on the second copy with color:#6B7280 (secondary gray). Use rename to add "-primary" and "-secondary" suffixes to the copies.'
        },
{
          name: 'Duplicate with instructions',
          desc: 'Duplicate selected nodes with custom modifications',
          directAction: 'duplicateWithInstructions',
          fields: [
            {
              key: 'duplicateCount',
              type: 'number',
              label: 'Number of Copies',
              default: 8,
              hint: 'How many copies to create (used when no custom instructions provided)'
            },
            {
              key: 'sequentialFull',
              type: 'checkbox',
              label: 'Sequential Full',
              default: false,
              hint: 'Sequentially change any number text nodes in each copy, preserving format (e.g., 001 -> 002, 003)'
            },
            {
              key: 'realityData',
              type: 'checkbox',
              label: 'Reality Data',
              default: false,
              hint: 'Change text data based on current text or layer name to realistic data'
            },
            {
              key: 'randomizeInstance',
              type: 'checkbox',
              label: 'Randomize Component Instance',
              default: false,
              hint: 'Randomize component instance property values and update text based on that instance'
            },
            {
              key: 'randomizeNestedInstances',
              type: 'checkbox',
              label: 'Randomize Nested Instances',
              default: false,
              hint: 'Randomize properties of instances inside the main component as well'
            },
            {
              key: 'customInstructions',
              type: 'textarea',
              label: 'Custom Instructions (one per copy)',
              placeholder: 'Replace {text} with New Text 1\nReplace {text} with New Text 2\nReplace {text} with New Text 3',
              hint: 'Enter one instruction per line. Use {text} as placeholder for text to replace. Each line creates one copy.'
            },
            {
              key: 'imageInput',
              type: 'image',
              label: 'Reference Image (Optional)',
              hint: 'Upload an image for the AI to extract information from (e.g., a list of items or a screenshot of data)'
            },
          ]
        },
{
          name: 'Randomize selected instance',
          desc: 'Randomize selected instances without duplicating',
          directAction: 'randomizeSelectedInstances',
          icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 3h5v5"/><path d="M4 20 21 3"/><path d="M21 16v5h-5"/><path d="M15 15 21 21"/><path d="M4 4l5 5"/></svg>`,
          help: 'Randomizes selected component instances in place. No duplicates are created.',
          fields: [
            {
              key: 'randomizeInstance',
              type: 'checkbox',
              label: 'Randomize Component Instance',
              default: true,
              hint: 'Randomize the selected top-level component instance property values in place'
            },
            {
              key: 'randomizeNestedInstances',
              type: 'checkbox',
              label: 'Randomize Nested Instances',
              default: false,
              hint: 'Randomize properties of instances nested inside the current selection as well'
            },
          ]
        }
  ];
}
