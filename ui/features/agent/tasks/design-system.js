import { ContextMode } from '../../../config/agent-data.js';

export const designSystemTasks = [
{
          name: 'Styles and variables',
          desc: 'Local colors, text and effects tokens.',
          prompt: '',
          noSelection: true,
          directAction: 'browseStyles'
        },
{
          name: 'List All Components',
          desc: 'Browse components, sets, and instances in selection, page, or file',
          prompt: '',
          noSelection: true,
          directAction: 'listAllComponents',
          help: 'Lists local and library-backed components, component sets, and instances with usage counts and grouping tools.',
          fields: [
            {
              key: 'componentsBrowser',
              type: 'componentsBrowser',
              label: 'Components'
            }
          ]
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
          name: 'Remove unused properties',
          desc: 'Delete unused component properties',
          requiredContext: ContextMode.COMPONENT_ONLY,
          directAction: 'removeUnusedProperties',
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
