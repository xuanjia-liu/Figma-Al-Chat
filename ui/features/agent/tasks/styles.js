import { ContextMode } from '../../../config/agent-data.js';

export const stylingTasks = [
{
          name: 'Swap colors',
          desc: 'Replace or swap two colors across selection',
          prompt: '', // Not used when fields are present
          help: 'One-way replace or two-way swap across fills, strokes, gradients, and effects.',
          requiredContext: ContextMode.STYLE_ONLY,
          fields: [
            { key: 'fromColor', type: 'color', label: 'From Color', default: '#3B82F6' },
            { key: 'toColor', type: 'color', label: 'To Color', default: '#8B5CF6' },
            {
              key: 'swapMode',
              type: 'select',
              label: 'Mode',
              default: 'replace',
              options: [
                { value: 'replace', label: 'Replace (A → B)' },
                { value: 'swap', label: 'Swap (A ↔ B inside selection)' }
              ]
            },
            { key: 'includeGradients', type: 'checkbox', label: 'Include gradient stops', default: true },
            { key: 'includeStrokes', type: 'checkbox', label: 'Include strokes', default: true },
            { key: 'includeEffects', type: 'checkbox', label: 'Include shadows', default: true },
          ],
          promptTemplate: function (values) {
            const mode = values.swapMode || 'replace';
            if (mode === 'swap') {
              return 'For each selected node, only if BOTH colors are present somewhere in that node (including its children), output ONE command: {"action":"swapPaintsTwoWay","fromColor":"{fromColor}","toColor":"{toColor}","includeStrokes":{includeStrokes},"includeGradients":{includeGradients},"includeEffects":{includeEffects}}. If a node is missing either color, skip it and mention it in the message. Do NOT use setFill/setStroke/modifyGradientStop here—the plugin handles swapping all matching fills, strokes, gradient stops, and shadow colors without rebuilding gradients.';
            }
            return 'For each selected node, output one command: {"action":"swapPaints","fromColor":"{fromColor}","toColor":"{toColor}","includeStrokes":{includeStrokes},"includeGradients":{includeGradients},"includeEffects":{includeEffects}}. Do NOT use setFill/setStroke/modifyGradientStop here—the plugin handles swapping all matching fills, strokes, gradient stops, and shadow colors without rebuilding gradients.';
          }
        },
{
          name: 'Remove all effects',
          desc: 'Strip shadows & blur',
          requiredContext: ContextMode.STYLE_ONLY,
          prompt: 'For each selected element (and all descendants), use clearEffects to remove all effects including drop shadows, inner shadows, layer blur, and background blur.'
        },
{
          name: 'Styles and variables',
          desc: 'Local colors, text and effects tokens.',
          prompt: '',
          noSelection: true,
          directAction: 'browseStyles'
        },
{
          name: 'Font preview',
          desc: 'Browse Google Fonts with live preview and filters.',
          prompt: '',
          noSelection: true,
          directAction: 'googleFontPreview',
          help: 'Loads the public Google Fonts catalog (fonts.google.com metadata). Language filters use script subsets; Feeling and Appearance use on-device heuristics inspired by the Google Fonts site — results are approximate.',
        },
{
          name: 'Map raw values to tokens',
          desc: 'Swap raw color/size to design tokens',
          prompt: 'Map the current selection to design tokens and APPLY them. Use the provided tokenContext (colorVariables, paintStyles, textStyles) and any style IDs on the nodes. For each selected node: prefer exact value matches first. Bind color variables to ALL fills/strokes with {"action":"bindVariable","nodeId":"<ID>","field":"fills","variableId":"<VAR_ID>"} (and strokes) using the collection default mode; do not substitute “closest” colors if an exact match exists. If no variable matches, apply paint styles with {"action":"setFillStyle","nodeId":"<ID>","styleId":"<PAINT_STYLE_ID>"} or {"action":"setStrokeStyle","nodeId":"<ID>","styleId":"<PAINT_STYLE_ID>"}. For TEXT nodes, also map the text fill color with an exact match first (bind variable or apply paint style) in addition to text styles. For typography, prefer text styles and apply {"action":"setTextStyle","nodeId":"<ID>","styleId":"<TEXT_STYLE_ID>"}; for effects, apply {"action":"setEffectStyle","nodeId":"<ID>","styleId":"<EFFECT_STYLE_ID>"}. Only fall back to direct hex fills/strokes or manual font values when no exact token/style matches. Respond ONLY with JSON: {"message":"short summary of replacements","commands":[...]} and include a command per node you change. If nothing can be mapped, return a message and an empty commands array.',
          isTextAction: true,
          includeTokens: true,
          requiredContext: ContextMode.ALL,
        },
{
          name: 'text link/color',
          desc: 'Add link or recolor text substrings (one per line)',
          isTextAction: true,
          requiredContext: ContextMode.TEXT_ONLY,
          promptTemplate: function (values) {
            const textAction = values.textAction || 'link';
            const substrings = (values.textSubstring || '').split('\n').map(s => s.trim()).filter(s => s.length > 0);

            if (textAction === 'link') {
              if (substrings.length === 0) {
                return 'Ask for the text node id if missing. Ask for missing URL and return ONLY JSON with commands: [{"action":"setRangeHyperlink","nodeId":"<TEXT_NODE_ID>","start":0,"end":9999,"linkType":"URL","url":"{linkUrl}"}]. Apply to the entire text.';
              } else if (substrings.length === 1) {
                return 'Ask for the text node id if missing. Target text: "' + substrings[0] + '". Ask for missing URL and return ONLY JSON with commands: [{"action":"setRangeHyperlink","nodeId":"<TEXT_NODE_ID>","start":0,"end":9999,"linkType":"URL","url":"{linkUrl}","textSubstring":"' + substrings[0] + '"}]. If the substring is not found, apply to the entire text. If multiple matches exist, use the first occurrence.';
              } else {
                const commands = substrings.map(substring => '{"action":"setRangeHyperlink","nodeId":"<TEXT_NODE_ID>","start":0,"end":9999,"linkType":"URL","url":"{linkUrl}","textSubstring":"' + substring + '"}').join(',');
                return 'Ask for the text node id if missing. Target multiple substrings: ' + substrings.map(s => '"' + s + '"').join(', ') + '. Ask for missing URL and return ONLY JSON with commands: [' + commands + ']. For each substring, if not found, skip it. If multiple matches exist, use the first occurrence.';
              }
            } else if (textAction === 'color') {
              if (substrings.length === 0) {
                return 'Ask for the text node id if missing. Ask for missing hex and return ONLY JSON with commands: [{"action":"setRangeFills","nodeId":"<TEXT_NODE_ID>","start":0,"end":9999,"color":"{color}"}]. Apply to the entire text.';
              } else if (substrings.length === 1) {
                return 'Ask for the text node id if missing. Target text: "' + substrings[0] + '". Ask for missing hex and return ONLY JSON with commands: [{"action":"setRangeFills","nodeId":"<TEXT_NODE_ID>","start":0,"end":9999,"color":"{color}","textSubstring":"' + substrings[0] + '"}]. If the substring is not found, apply to the entire text. If multiple matches exist, use the first occurrence.';
              } else {
                const commands = substrings.map(substring => '{"action":"setRangeFills","nodeId":"<TEXT_NODE_ID>","start":0,"end":9999,"color":"{color}","textSubstring":"' + substring + '"}').join(',');
                return 'Ask for the text node id if missing. Target multiple substrings: ' + substrings.map(s => '"' + s + '"').join(', ') + '. Ask for missing hex and return ONLY JSON with commands: [' + commands + ']. For each substring, if not found, skip it. If multiple matches exist, use the first occurrence.';
              }
            }
            return '';
          },
          fields: [
            { key: 'textSubstring', type: 'textarea', label: 'Text to modify (one per line)', placeholder: 'First substring\nSecond substring\nThird substring' },
            {
              key: 'textAction', type: 'select', label: 'Action', default: 'link', options: [
                { value: 'link', label: 'Set link' },
                { value: 'color', label: 'Set text color' }
              ]
            },
            { key: 'linkUrl', type: 'text', label: 'Link URL', placeholder: 'https://example.com', showWhen: { field: 'textAction', equals: 'link' } },
            { key: 'color', type: 'color', label: 'Text color', default: '#3B82F6', showWhen: { field: 'textAction', equals: 'color' } }
          ]
        },
{
          name: 'Remove unused properties',
          desc: 'Delete unused component properties',
          requiredContext: ContextMode.HIERARCHY,
          prompt: 'Identify the current selection. If it is a component, component set, or instance, return ONLY JSON: [{"action":"removeUnusedComponentProperties","nodeId":"<SELECTED_ID>"}]. This helper scans for usage of component properties (text, boolean, instance swap) and deletes those that are not linked to any descendant node. Variant properties are never removed. Return a list of commands, one for each component or component set you find in the selection or its ancestors.'
        },
{
          name: 'Extract Design System',
          desc: 'Extract colors, typography, components, effects, spacing from your design',
          noSelection: false,
          directAction: 'extractDesignSystem',
          help: 'Scans your selection, current page, or entire file to extract a comprehensive design system including colors, typography, components, effects, and spacing. Supports output to design tokens, downloadable files, chat, or a visual Figma document.',
          fields: [
            {
              key: 'source', type: 'select', label: 'Source', default: 'selection',
              options: [
                { value: 'selection', label: 'Selection' },
                { value: 'page', label: 'Current Page' },
                { value: 'file', label: 'Whole File' }
              ]
            },
            {
              key: 'referenceImage', type: 'image', label: 'Or extract from image (optional)',
              showWhen: { field: 'source', equals: 'selection' }
            },
            {
              key: 'categories', type: 'select', label: 'Categories to Extract', multi: true,
              default: ['colors', 'typography', 'components', 'effects', 'spacing'],
              options: [
                { value: 'colors', label: 'Color Styles' },
                { value: 'typography', label: 'Typography Styles' },
                { value: 'components', label: 'Component Library' },
                { value: 'effects', label: 'Effects & Styles' },
                { value: 'spacing', label: 'Spacing System' }
              ]
            },
            {
              key: 'outputTo', type: 'select', label: 'Output To', default: 'file',
              options: [
                { value: 'tokens', label: 'Design Tokens (Variables + Styles)' },
                { value: 'file', label: 'Download File' },
                { value: 'chat', label: 'Ask Mode Chat Reply' },
                { value: 'figma', label: 'Figma Document' }
              ]
            },
            {
              key: 'fileFormat', type: 'select', label: 'File Format', default: 'md',
              showWhen: { field: 'outputTo', equals: 'file' },
              options: [
                { value: 'md', label: 'Markdown (Design System Doc)' },
                { value: 'json', label: 'JSON (Design Tokens)' },
                { value: 'css', label: 'CSS (Custom Properties)' }
              ]
            }
          ]
        }
];

export const stylingImageInsertIndex = 2;

export const quickCreateStyleTasks = [
{
          name: 'SVG UI Pattern',
          desc: 'Generate seamless, UI-safe background textures',
          noSelection: true,
          fields: [
            {
              key: 'patternSystem', type: 'select', label: 'Pattern System (WHAT)', default: 'Dot System', options: [
                { value: 'Dot System', label: 'Dot' },
                { value: 'Grid System', label: 'Grid' },
                { value: 'Line System', label: 'Line' },
                { value: 'Stripe Field', label: 'Stripe Field' },
                { value: 'Typographic Unit', label: 'Typographic Unit' },
                { value: 'Wave / Flow', label: 'Wave / Flow' },
                { value: 'Noise Overlay', label: 'Noise Overlay' }
              ]
            },
            {
              key: 'distributionLogic', type: 'select', label: 'Distribution Logic (HOW)', default: 'Uniform', options: [
                { value: 'Uniform', label: 'Uniform' },
                { value: 'Offset', label: 'Offset' },
                { value: 'Progressive', label: 'Progressive' },
                { value: 'Clustered', label: 'Clustered' },
                { value: 'Directional', label: 'Directional' },
                { value: 'Modular', label: 'Modular' }
              ]
            },
            {
              key: 'densityScale', type: 'select', label: 'Density / Scale (HOW MUCH)', default: 'Soft', options: [
                { value: 'Micro', label: 'Micro' },
                { value: 'Soft', label: 'Soft' },
                { value: 'Medium', label: 'Medium' },
                { value: 'Sparse', label: 'Sparse' },
                { value: 'Dense', label: 'Dense' }
              ]
            },
            {
              key: 'toneContrast', type: 'select', label: 'Tone / Contrast (HOW LOUD)', default: 'Subtle', options: [
                { value: 'Ultra subtle', label: 'Ultra subtle (2–4% contrast)' },
                { value: 'Subtle', label: 'Subtle (4–8%)' },
                { value: 'Balanced', label: 'Balanced (8–12%)' },
                { value: 'Expressive', label: 'Expressive (12–18%)' }
              ]
            },
            { key: 'customModifiers', type: 'text', label: 'Custom Modifiers (Optional)', placeholder: 'e.g., more horizontal rhythm, avoid perfect alignment' }
          ],
          promptTemplate: 'Generate a seamless, tileable SVG background texture for modern UI use.\n\nBase system:\n{patternSystem}\n\nDistribution logic:\n{distributionLogic}\n\nDensity and scale:\n{densityScale}\n\nTone and contrast:\n{toneContrast}\n\nDesign constraints:\n• modern UI texture (2024–2025)\n• flat vector, SVG only\n• low contrast, background-safe\n• system-driven, not decorative\n• no gradients, no shadows\n• no illustration style\n• no retro or ornamental patterns\n• seamless repetition required\n\nOptional modifiers:\n{customModifiers}\n\nThe result should feel suitable for SaaS, design systems, or product UI backgrounds. Return ONLY a JSON command using createNodeFromSvg.'
        },
{
          name: 'Color palette',
          desc: 'Generate color palettes using AI',
          prompt: '',
          help: 'Create color palettes as styles or variables using AI - primary shades, semantic colors, or complete design systems.',
          noSelection: true,
          directAction: 'generatePalette',
          fields: [
            {
              key: 'paletteType', type: 'select', label: 'Palette Type', default: 'primary', options: [
                { value: 'primary', label: 'Primary Palette (50-950 shades)' },
                { value: 'semantic', label: 'Semantic Colors (success/warning/error/info)' },
                { value: 'hueVariation', label: 'Hue Variations (for data viz)' },
                { value: 'fullSystem', label: 'Full Color System (AI decides structure)' },
              ]
            },
            { key: 'baseColor', type: 'color', label: 'Base Color', default: '#3B82F6', showWhen: { field: 'paletteType', equals: 'primary' }, hint: 'The color to generate shades from' },
            { key: 'primaryColor', type: 'color', label: 'Primary Color', default: '#3B82F6', showWhen: { field: 'paletteType', equals: 'semantic' }, hint: 'The primary color to harmonize semantic colors with' },
            { key: 'vizColor', type: 'color', label: 'Base Color', default: '#3B82F6', showWhen: { field: 'paletteType', equals: 'hueVariation' }, hint: 'The color to generate complementary variations from' },
            { key: 'systemDescription', type: 'textarea', label: 'Design System Description', placeholder: 'e.g., Modern SaaS app for healthcare, professional tone, accessible colors, blue and green theme', showWhen: { field: 'paletteType', equals: 'fullSystem' }, hint: 'Describe your app/product and desired color scheme' },
            { key: 'groupName', type: 'text', label: 'Group Name', default: 'Primary', showWhen: { field: 'paletteType', notEquals: 'fullSystem' }, hint: 'Name for the color group (used as prefix in style/variable names)' },
            { key: 'collectionName', type: 'select', label: 'Variable Collection', default: '', options: [], showWhen: { field: 'createAsVariables', equals: true }, hint: 'Collection for variables (leave empty for new collection)', searchable: true, allowCustom: true },
            { key: 'createAsStyles', type: 'checkbox', label: 'Create as Paint Styles', default: true, hint: 'Create Figma paint styles instead of just variables' },
            { key: 'createAsVariables', type: 'checkbox', label: 'Create as Variables', default: true, hint: 'Create Figma color variables' },
          ]
        }
];
