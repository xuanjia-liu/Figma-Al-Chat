import {
  ContextMode,
  SMART_RENAME_PROMPT_PRESETS,
} from '../../../config/agent-data.js';


export const smartTextTasks = [
{
          name: 'Translate text',
          desc: 'Translate to any language',
          prompt: '',
          isTextAction: true,
          help: 'Translates all selected text nodes to the specified language.',
          requiredContext: ContextMode.TEXT_ONLY,
          fields: [
            {
              key: 'targetLanguage', type: 'select', label: 'Target Language', default: 'English', options: [
                { value: 'English', label: 'English' },
                { value: 'Japanese', label: 'Japanese' },
                { value: 'Chinese (Simplified)', label: 'Chinese (Simplified)' },
                { value: 'Chinese (Traditional)', label: 'Chinese (Traditional)' },
                { value: 'Korean', label: 'Korean' },
                { value: 'Vietnamese', label: 'Vietnamese' },
                { value: 'Spanish', label: 'Spanish' },
                { value: 'French', label: 'French' },

              ]
            },
          ],
          promptTemplate: 'For each selected TEXT node, use setText to replace the characters with a {targetLanguage} translation. Preserve the original node structure and styling.'
        },
{
          name: 'Replace/Reformat',
          desc: 'Find and replace with pattern,template, or rewrite by format',
          prompt: '',
          isTextAction: true,
          requiredContext: ContextMode.TEXT_ONLY,
          examples: ['{name}', '{anyNumber}', '{word}'],
          fields: [
            {
              key: 'actionMode', type: 'select', label: 'Action', default: 'replace', options: [
                { value: 'replace', label: 'Find/Replace' },
                { value: 'semantic', label: 'Semantic Find/Replace' },
                { value: 'rewrite', label: 'Rewrite by Format' }
              ]
            },
            { key: 'findPattern', type: 'text', label: 'Find Pattern', placeholder: '{name}', hint: 'Shortcuts: {anyNumber}=digits, {word}=word, {anything}=any text, {email}=email.', showWhen: { field: 'actionMode', equals: 'replace' } },
            { key: 'replaceFormat', type: 'text', label: 'Replace With', placeholder: 'Hello, {name}!', hint: 'Use $1, $2 to reuse parts you matched (first word, second word, etc.).', showWhen: { field: 'actionMode', equals: 'replace' } },
            { key: 'semanticType', type: 'text', label: 'Target to Find', placeholder: 'e.g. Phone numbers, Proper names, Dates', showWhen: { field: 'actionMode', equals: 'semantic' } },
            { key: 'semanticExamples', type: 'text', label: 'Find Examples', placeholder: 'e.g. (555) 123-4567, 12/25/2024', hint: 'Examples of what you want to find.', showWhen: { field: 'actionMode', equals: 'semantic' } },
            { key: 'semanticReplace', type: 'text', label: 'Replace With', placeholder: 'e.g. [PRIVATE], Tomorrow', showWhen: { field: 'actionMode', equals: 'semantic' } },
            { key: 'semanticReplaceExamples', type: 'text', label: 'Replace Examples', placeholder: 'e.g. +1 555-123-4567, Dec 25, 2024', hint: 'Examples of how you want it to look after replacement.', showWhen: { field: 'actionMode', equals: 'semantic' } },
            { key: 'rewriteFormat', type: 'textarea', label: 'Format Pattern', placeholder: 'Formatted: {original}', hint: 'Use {original} to reference the existing text content.', showWhen: { field: 'actionMode', equals: 'rewrite' } },
          ],
          promptTemplate: function (values) {
            const actionMode = values.actionMode || 'replace';
            if (actionMode === 'rewrite') {
              const formatPattern = values.rewriteFormat || '{original}';
              const hasOriginal = formatPattern.includes('{original}');
              // Escape the format pattern for use in the prompt, preserving newlines
              const escapedPattern = formatPattern.replace(/"/g, '\\"');
              return `For each selected TEXT node, read the current text content from the node, then generate the formatted text by applying the format pattern "${escapedPattern}".${hasOriginal ? ' Replace {original} with the actual existing text content from the node.' : ''} Preserve line breaks and formatting as specified in the pattern.Then use setText with the generated formatted text(NOT the pattern itself).Apply the format to transform the text while preserving its meaning.`;
            } else if (actionMode === 'semantic') {
              const type = values.semanticType || 'specific entities';
              const findExamples = values.semanticExamples ? ` (such as: ${values.semanticExamples})` : '';
              const replacement = values.semanticReplace || '';
              const replaceExamples = values.semanticReplaceExamples ? ` (formatted like: ${values.semanticReplaceExamples})` : '';
              return `Analyze the text in each selected TEXT node. 1. Identify any substrings that represent "${type}"${findExamples}.2. Replace ONLY those specific parts with "${replacement}"${replaceExamples}.3. Keep all other text, punctuation, and surrounding context exactly as it is. 4. Use setText with the modified version.If multiple instances of "${type}" are found in one node, replace all of them.`;
            } else {
              const findPattern = values.findPattern || '';
              const replaceFormat = values.replaceFormat || '';
              return `For each selected TEXT node, treat the find pattern as a regex.Before matching, replace shorthand tokens: { anyNumber } -> \\\\d +, { word } -> (\\\\w +), { anything } -> .* , { email } -> [A - Za - z0 -9._ % +-] + @[A - Za - z0 - 9. -] +\\\\.[A - Za - z]{ 2,}. Then use setText to find "${findPattern}"(after token expansion) and replace with "${replaceFormat}", preserving regex capture groups(e.g., $1, $2).`;
            }
          }
        },
{
          name: 'Better UI writing',
          desc: 'Improve UI copywriting',
          prompt: 'Improve this UI text so it is clear, actionable, and friendly. If the text is Japanese, also apply: 動詞は短く, ユーザーを責めない, 次の行動がわかる, 丁寧すぎない, 命令っぽくしすぎない. Keep meaning and context; avoid adding new features or flows.',
          isTextAction: true,
          requiredContext: ContextMode.TEXT_ONLY
        },
{
          name: 'Adjust length',
          desc: 'Fit lines/words or change length',
          prompt: '',
          isTextAction: true,
          requiredContext: ContextMode.TEXT_ONLY,
          fields: [
            {
              key: 'lengthMode', type: 'select', label: 'Length Mode', default: 'fitLines', options: [
                { value: 'fitLines', label: 'Fit to', inputKey: 'lineCount', inputDefault: 3, inputMin: 1, inputSuffix: 'lines' },
                { value: 'limitWords', label: 'Limit to', inputKey: 'wordCount', inputDefault: 30, inputMin: 1, inputSuffix: 'words' },
                { value: 'exactWords', label: 'Exact', inputKey: 'wordCount', inputDefault: 30, inputMin: 1, inputSuffix: 'words' },
                { value: 'longer', label: 'Make it longer' },
                { value: 'shorter', label: 'Make it shorter' },
                { value: 'continue', label: 'Continue writing' },
              ]
            },
          ],
          promptTemplate: 'Rewrite the selected text with length instructions. Mode: {lengthMode}. If mode is fitLines, aim for about {lineCount} lines. If mode is limitWords, keep within {wordCount} words (or characters for CJK). If mode is exactWords, make it exactly {wordCount} words/chars. If mode is longer, expand meaningfully; if shorter, compress while keeping key info; if continue, keep style and continue the text. Preserve meaning and tone unless changed by other instructions.'
        },
{
          name: 'Change tone',
          desc: 'Adjust tone/style',
          prompt: '',
          isTextAction: true,
          requiredContext: ContextMode.TEXT_ONLY,
          fields: [
            { key: 'tone', type: 'select', label: 'Tone', default: 'Casual', options: [] },
          ],
          promptTemplate: 'Rewrite the selected text with a {tone} tone. Keep meaning; adjust word choice, phrasing, and style to match the tone. Preserve any critical details.'
        },
{
          name: 'Accessibility simplifier',
          desc: 'Simplify for accessibility',
          prompt: '',
          isTextAction: true,
          requiredContext: ContextMode.TEXT_ONLY,
          examples: ['6th grader', 'foreigners', 'elderly', 'non-native speakers'],
          fields: [
            { key: 'audience', type: 'text', label: 'Audience', default: '6th grader', placeholder: 'target user', hint: 'Who should easily understand this?' },
          ],
          promptTemplate: 'Rewrite the selected text so it is easy to understand for {audience}. Use plain language, shorter sentences, and simpler vocabulary. Preserve key facts and instructions.'
        },
{
          name: 'Fix spelling',
          desc: 'Fix spelling and grammar',
          prompt: 'Fix spelling and grammar in the selected text. Keep the original meaning and formatting as much as possible.',
          isTextAction: true,
          requiredContext: ContextMode.TEXT_ONLY
        },
{
          name: 'To bullet points',
          desc: 'Convert to bullets',
          prompt: 'Convert the selected text into concise bullet points. Keep key facts and actions; remove fluff.',
          isTextAction: true,
          requiredContext: ContextMode.TEXT_ONLY
        },
{
          name: 'Realistic data',
          desc: 'Fill with realistic content',
          prompt: '',
          isTextAction: true,
          requiredContext: ContextMode.TEXT_ONLY,
          examples: ['Product names', 'Prices', 'User names', 'Descriptions'],
          fields: [
            {
              key: 'useSelectedTextNodeAsFormat',
              type: 'checkbox',
              label: 'Use selected text node as format',
              default: false,
              renderAsToggle: true
            },
            {
              key: 'formatExample',
              type: 'text',
              label: 'Format example',
              placeholder: 'e.g., $1,234.56, MM/DD/YYYY, etc.',
              disabledWhen: { field: 'useSelectedTextNodeAsFormat', equals: true }
            },
            { key: 'customContext', type: 'textarea', label: 'Additional Context (optional)', placeholder: 'e.g., luxury brand, targeting millennials, etc.' },
            {
              key: 'imageInput',
              type: 'image',
              label: 'Reference Image (Optional)',
              hint: 'Upload an image containing data to extract (e.g., product list, user names, prices from a screenshot)'
            },
          ],
          promptTemplate: function (values) {
            const useSelectedTextNodeAsFormat = !!values.useSelectedTextNodeAsFormat;
            const formatExample = useSelectedTextNodeAsFormat ? '' : values.formatExample;
            const customContext = values.customContext;
            const hasImage = !!values.imageInput;

            let prompt = 'For each selected TEXT node containing "Lorem", placeholder-like text, or generic content, use setSimpleText (not setText) to replace with realistic content.';

            if (hasImage) {
              prompt = 'Extract data from the provided reference image and fill each selected TEXT node with unique information from the image. For each node, pick a different data entry (row, item, or value) from the image. Use setSimpleText to update the text content.';
            }

            const contextParts = [];
            if (formatExample) contextParts.push(`Format example: ${formatExample} `);
            if (customContext) contextParts.push(`Additional context: ${customContext} `);

            if (contextParts.length > 0) {
              prompt += ' Context: ' + contextParts.join(', ') + '.';
            }

            if (useSelectedTextNodeAsFormat) {
              prompt += ' Use the content and formatting pattern of the selected text node as the format reference instead of a typed format example.';
            }

            if (!hasImage) {
              prompt += ' Generate appropriate content like product names, prices, user names, descriptions, etc. based on the node\'s existing text or label.';
            } else {
              prompt += ' Ensure each node gets different data from the image so they are not identical.';
            }
            return prompt;
          }
        },
{
          name: 'Format sequencer',
          desc: 'Custom numbering or pattern',
          prompt: '',
          isTextAction: true,
          requiredContext: ContextMode.TEXT_ONLY,
          examples: ['{n}', '{nn}', '{nnn}', '{original}'],
          fields: [
            { key: 'formatPattern', type: 'text', label: 'Format Pattern', placeholder: 'Task {n}: {original}', default: 'Task {n}: {original}', hint: 'Use {n}/{nn}/{nnn} for number (auto-padded), {original} for existing text' },
            { key: 'startIndex', type: 'number', label: 'Start Number', default: 1, min: 0 },
            {
              key: 'order', type: 'select', label: 'Order', default: 'zOrder', options: [
                { value: 'zOrder', label: 'Visual order (top-to-bottom, left-to-right)' },
                { value: 'reverse', label: 'Reverse visual order' },
                { value: 'alphabetical', label: 'Alphabetical by content' },
              ]
            },
            { key: 'autoExpand', type: 'checkbox', label: 'Auto expand digits', default: false, hint: 'When on, {n} expands to fit the largest sequence number.' },
            { key: 'padLength', type: 'number', label: 'Zero-pad digits', default: 0, min: 0, hint: '0 = auto based on count; 2 forces 01, 02, ...' },
            { key: 'replaceSubstring', type: 'checkbox', label: 'Replace only a substring (keep rest)', default: false },
          ],
          // Note: If the user omits {original} in the formatPattern, we must not mention it in the prompt to avoid LLM confusion.
          promptTemplate: 'For each selected TEXT node sorted by {order} order, use setText to apply the format "{formatPattern}". Replace {n} with sequence number starting at {startIndex}.{formatPattern.includes("{original}") ? " Replace {original} with the existing text content." : ""} {replaceSubstring ? "If the pattern only modifies part of the text, keep the rest untouched." : "Replace the entire text with the formatted result."}'
        },
{
          name: 'Add prefix/suffix',
          desc: 'Add text before/after',
          prompt: '',
          isTextAction: true,
          requiredContext: ContextMode.TEXT_ONLY,
          fields: [
            { key: 'prefix', type: 'text', label: 'Prefix', placeholder: 'Step ', default: '' },
            { key: 'suffix', type: 'text', label: 'Suffix', placeholder: ' (done)', default: '' },
          ],
          promptTemplate: 'For each selected TEXT node, use setText to add "{prefix}" before and "{suffix}" after the current text content.'
        },
{
          name: 'Add ruby/furigana',
          desc: 'Add reading above kanji',
          prompt: 'Add furigana (ruby text) above the kanji in the selected Japanese text. ONLY use this command if the user wants to ADD readings above the text (e.g., "ふりがなを振る", "ルビを振る"). If the user wants to CONVERT or REPLACE kanji with furigana (e.g., "ふりがなに変える"), use the standard setText command instead. When adding ruby: Keep all non-kanji parts intact. Always use the addRuby command with a rubyPairs array. For each kanji word you can confidently determine the reading for, include it in rubyPairs as {"base":"kanji","ruby":"reading"}. Set rubyFontSize to half of the base font size.',
          isTextAction: true,
          requiredContext: ContextMode.TEXT_ONLY
        },
{
          name: 'Vertical text',
          desc: 'Convert text to vertical composition',
          prompt: '',
          isTextAction: true,
          requiredContext: ContextMode.TEXT_ONLY,
          help: 'Converts selected text into vertical columns. Height and Column text count stay linked. Turn on Vertical columns to control by column count instead, which disables Height and Column text count.',
          fields: [
            {
              key: 'columnTextCount',
              type: 'number',
              label: 'Column text count',
              default: '',
              min: 0,
              max: 200,
              step: 1,
              numberWithSlider: true,
              hint: 'Maximum characters per vertical column',
              disabledWhen: { field: 'useVerticalColumns', equals: true }
            },
            {
              key: 'heightPx',
              type: 'number',
              label: 'Height (px)',
              default: '',
              min: 0,
              max: 2000,
              step: 1,
              numberWithSlider: true,
              hint: 'Linked with Column text count using line height',
              disabledWhen: { field: 'useVerticalColumns', equals: true }
            },
            { key: 'useVerticalColumns', type: 'checkbox', label: 'Use Vertical columns', default: false },
            {
              key: 'verticalColumns',
              type: 'number',
              label: 'Vertical columns',
              default: '',
              min: 0,
              max: 100,
              step: 1,
              numberWithSlider: true,
              disabledWhen: { field: 'useVerticalColumns', equals: false }
            },
            {
              key: 'lineHeightPx',
              type: 'number',
              label: 'Line height (px)',
              default: '',
              min: 0,
              max: 500,
              step: 0.01,
              sliderStep: 0.5,
              numberWithSlider: true,
              reloadLineHeightFromSelection: true
            },
            { key: 'keepManualLineBreaks', type: 'checkbox', label: 'Keep manual line breaks', default: true },
            {
              key: 'unicodeVerticalPunctuation',
              type: 'checkbox',
              label: 'Use Unicode vertical punctuation',
              default: false,
              hint: 'Map 、。and 「」『』【】〔〕《》（） to vertical forms (︑︒﹁﹂﹃﹄︻︼︹︺︽︾︵︶). Fullwidth ，．—：； stay unchanged.'
            }
          ]
        }
];

export const layerNamingTasks = [
{
          name: 'Sequential naming',
          desc: 'Button-1, Button-2...',
          prompt: '',
          help: 'Use a format pattern just like Smart Text → Format sequencer. Customize numbering, include {original}, and choose ordering.',
          requiredContext: ContextMode.MINIMAL,
          examples: ['Card {n}', '{nn}-{original}', 'Screen {n}: {original}'],
          fields: [
            { key: 'formatPattern', type: 'text', label: 'Format Pattern', placeholder: 'Card {n}', default: 'Card {n}', hint: 'Use {n} for number (auto-padded), {nn} for 2-digit, {original} for current name.' },
            { key: 'startIndex', type: 'number', label: 'Start Number', default: 1, min: 0 },
            {
              key: 'order', type: 'select', label: 'Order', default: 'zOrder', options: [
                { value: 'zOrder', label: 'Visual order (top-to-bottom, left-to-right)' },
                { value: 'reverse', label: 'Reverse visual order' },
                { value: 'alphabetical', label: 'Alphabetical by content' },
              ]
            },
            { key: 'autoExpand', type: 'checkbox', label: 'Auto expand digits', default: false, hint: 'When on, {n} expands to fit the largest sequence number.' },
            { key: 'padLength', type: 'number', label: 'Zero-pad digits', default: 0, min: 0, hint: '0 = auto based on count; 2 forces 01, 02, ...' },
            { key: 'replaceSubstring', type: 'checkbox', label: 'Replace only a substring (keep rest)', default: false },
          ],
          promptTemplate: 'For each selected element sorted by {order} order, use rename to apply the format "{formatPattern}". Replace {formatPattern.includes("{nn}") ? "{nn} with the sequence number padded to {padLength > 0 ? padLength : "auto"} digits." : ""} Replace {n} with sequence number starting at {startIndex}.{formatPattern.includes("{original}") ? " Replace {original} with the existing layer name." : ""} {replaceSubstring ? "If the pattern only modifies part of the text, keep the rest untouched." : "Replace the entire name with the formatted result."}'
        },
{
          name: 'Prefix/Suffix (smart)',
          desc: 'Add before/after with tokens',
          prompt: '',
          help: 'Combine prefix + suffix in one step, using Smart Text-style tokens. Works with {original} and numbering if present.',
          requiredContext: ContextMode.MINIMAL,
          examples: ['✅ {original}', '⚠️ {original} - draft', '🔒 {original}', 'v{n}-{original}', '{original}-🧪'],
          fields: [
            { key: 'prefix', type: 'text', label: 'Prefix', placeholder: '✅ ', default: '' },
            { key: 'suffix', type: 'text', label: 'Suffix', placeholder: ' - draft', default: '' },
            { key: 'startIndex', type: 'number', label: 'Start Number (if {n})', default: 1, min: 0 },
            { key: 'padLength', type: 'number', label: 'Zero-pad digits (if {n})', default: 0, min: 0 },
            { key: 'keepSpacing', type: 'checkbox', label: 'Auto-manage spacing', default: true },
          ],
          promptTemplate: 'For each selected element, construct the new name by applying prefix and suffix around the existing name. Treat prefix="{prefix}" and suffix="{suffix}". If either contains {n}, replace it with a sequence number starting at {startIndex} (pad to {padLength > 0 ? padLength : "auto"} digits). Replace {original} with the current name. {keepSpacing ? "Trim double spaces after assembling the name." : ""} Use rename with the assembled result.'
        },
{
          name: 'Smart rename',
          desc: 'Semantic, consistent names',
          requiredContext: ContextMode.HIERARCHY,
          prompt: '',
          fields: [
            { key: 'caseOnly', type: 'checkbox', label: 'Case only (keep text)', default: false },
            {
              key: 'renamePreset',
              type: 'select',
              label: 'Prompt Preset',
              default: '',
              searchable: true,
              options: () => [
                { value: '', label: 'None (Custom)' },
                ...Object.keys(SMART_RENAME_PROMPT_PRESETS).map(name => ({ value: name, label: name }))
              ]
            },
            { key: 'renamePrompt', type: 'textarea', label: 'Prompt', placeholder: 'Describe how Smart Rename should rename the selected layers...', default: '', aiButtons: true },
            {
              key: 'delimiter', type: 'select', label: 'Delimiter', default: 'camelCase', options: [
                { value: 'camelCase', label: 'camelCase' },
                { value: 'PascalCase', label: 'PascalCase' },
                { value: '_', label: 'snake_case' },
                { value: '/', label: 'Slash(/)' },
                { value: '-', label: 'kebab-case' },
                { value: ' ', label: 'Space' },
              ]
            },
            { key: 'onlySelected', type: 'checkbox', label: 'Only rename selected layer', default: false },
            { key: 'includeInstances', type: 'checkbox', label: 'Include component instances', default: false },
            { key: 'keepOriginal', type: 'checkbox', label: 'Append original in parentheses', default: false },
          ],
          promptTemplate: function (values) {
            const onlySelected = values.onlySelected || false;
            const renamePrompt = (values.renamePrompt || '').trim();
            const delimiter = values.delimiter || 'camelCase';
            const includeInstances = values.includeInstances || false;
            const keepOriginal = values.keepOriginal || false;

            const scopeText = onlySelected
              ? "Analyze ONLY each selected element (do not rename any child or descendant elements)"
              : "Analyze each selected element and all its descendant elements (children, grandchildren, etc.)";
            const pronoun = onlySelected ? "it" : "them";
            const delimiterText = delimiter === "camelCase"
              ? "Use camelCase."
              : delimiter === "PascalCase"
                ? "Use PascalCase."
                : delimiter === " "
                  ? "Use spaces between words."
                  : `Use "${delimiter}" as the separator style.`;
            const instancesText = includeInstances
              ? "Include component instances when renaming."
              : "Skip component instances and their descendants.";
            const originalText = keepOriginal
              ? "Append the original name in parentheses."
              : "Replace the name entirely with the new name.";

            return `${scopeText} and rename ${pronoun}.

FOLLOW THIS NAMING INSTRUCTION:
${renamePrompt}

FORMATTING:
- ${delimiterText}
- ${instancesText}
- ${originalText}

SPECIAL RULES FOR VARIANTS & COMPONENTS:
1. VARIANTS: If an element is a variant inside a Component Set (its name follows "Property=Value" format, e.g. "Property 1=Frame 47695"), ONLY rename the "Value" part. Keep the "Property=" part exactly as is. Example: "Property 1=Frame 47695" -> "Property 1=Primary".
2. COMPONENT PROPERTIES: If an element is a Component Set, analyze its property names (e.g. "Property 1"). If they have default names like "Property 1", suggest better semantic property names (e.g. "State", "Type", "Size") and rename them within the variant names of its children.

GENERAL RULES:
- Use element type, text content, variant properties, auto-layout role, and parent grouping for context.
- Keep names concise, deterministic, and consistent.
- Avoid duplication; add numeric suffix only when needed.
- Use rename to apply.`;
          }
        },
{ name: 'Clean up names', desc: 'Remove special chars', requiredContext: ContextMode.MINIMAL, prompt: 'For each selected element, use rename to clean up the name by: removing special characters (except hyphen and underscore), collapsing multiple spaces to single space, and trimming whitespace from start and end.' },
{
          name: 'Translate naming',
          desc: 'Translate layer names',
          prompt: '',
          help: 'Translate layer names to the target language. Useful for localizing designs or standardizing names in English.',
          requiredContext: ContextMode.MINIMAL,
          examples: ['ボタン → Button', 'メニュー → Menu', '設定 → Settings'],
          fields: [
            {
              key: 'targetLanguage', type: 'select', label: 'Target Language', default: 'English', options: [
                { value: 'English', label: 'English' },
                { value: 'Japanese', label: 'Japanese' },
                { value: 'Chinese (Simplified)', label: 'Chinese (Simplified)' },
                { value: 'Korean', label: 'Korean' },
                { value: 'Spanish', label: 'Spanish' },
                { value: 'French', label: 'French' },
                { value: 'German', label: 'German' },
              ]
            },
            { key: 'keepOriginal', type: 'checkbox', label: 'Keep original name in parentheses', default: false },
          ],
          promptTemplate: 'For each selected element, use rename to translate the current layer name to {targetLanguage}. {keepOriginal ? "Append the original name in parentheses, e.g. \'Button (ボタン)\'." : "Replace the name entirely with the translation."}'
        },
{
          name: 'Romaji converter (Hepburn)',
          desc: 'Convert Japanese to Romaji',
          requiredContext: ContextMode.MINIMAL,
          prompt: 'For each selected element, convert any Japanese text in its name to Romaji using Hepburn romanization. Keep non-Japanese parts unchanged. Use rename to apply the converted name.',
          help: 'Hepburn-style romanization for Japanese names. Examples: ありがとう → arigatou, 東京 → Tokyo, 学校 → gakkou. Preserve punctuation and non-Japanese words.',
          examples: ['送信ボタン → soushin button', '東京/ヘッダー → Tokyo/header', '設定-開く → settei-hiraku'],
        }
];

export const accessibilityQualityTasks = [
{
          name: 'Extract prompt from image',
          desc: 'Generate image description prompt',
          prompt: '',
          askMode: true,
          help: 'Uses Copy Image function to extract the image and generates a concise description prompt.',
          directAction: 'extractImagePrompt'
        },
{
          name: 'Color Contrast Checker',
          desc: 'Check WCAG compliance for text/background',
          prompt: '',
          askMode: true,
          help: 'Validates WCAG AA/AAA compliance for text and background color combinations.',
          searchKeywords: 'WCAG, color contrast, accessibility, accessblity',
          requiredContext: ContextMode.ALL,
          fields: [
            {
              key: 'complianceLevel', type: 'select', label: 'Compliance Level', default: 'AA', options: [
                { value: 'AA', label: 'AA (4.5:1 for normal text, 3:1 for large)' },
                { value: 'AAA', label: 'AAA (7:1 for normal text, 4.5:1 for large)' }
              ]
            },
            {
              key: 'textSize', type: 'select', label: 'Text Size', default: 'normal', options: [
                { value: 'normal', label: 'Normal (<18pt or <14pt bold)' },
                { value: 'large', label: 'Large (≥18pt or ≥14pt bold)' }
              ]
            },
            { key: 'backgroundColor', type: 'color', label: 'Background Color', default: '#FFFFFF' }
          ],
          promptTemplate: 'Analyze the selected elements for WCAG color contrast compliance. Check text elements against the specified background color ({backgroundColor}). Compliance level: {complianceLevel}. Text size: {textSize}. Calculate contrast ratios and identify any violations. Report the contrast ratio for each text/background combination and highlight elements that fail the {complianceLevel} standard.'
        },
{
          name: 'Touch Target Validator',
          desc: 'Validate minimum touch target sizes (44px+)',
          prompt: '',
          askMode: true,
          help: 'Validates that interactive elements meet minimum touch target size requirements.',
          requiredContext: ContextMode.LAYOUT_ONLY,
          fields: [
            {
              key: 'targetPlatform', type: 'select', label: 'Target Platform', default: 'iOS', options: [
                { value: 'iOS', label: 'iOS (44×44pt minimum)' },
                { value: 'Android', label: 'Android (48×48dp minimum)' },
                { value: 'Web', label: 'Web (44×44px minimum)' }
              ]
            },
            { key: 'minSizeOverride', type: 'number', label: 'Minimum Size Override (px)', default: 0, min: 0, hint: '0 = use platform default' }
          ],
          promptTemplate: 'Analyze the selected elements for touch target size compliance. Target platform: {targetPlatform}. Minimum size: {minSizeOverride ? "{minSizeOverride}px" : "platform default"}. Check all interactive elements (buttons, links, icons, etc.) and identify any that are smaller than the minimum touch target size. Report the actual dimensions and highlight undersized elements.'
        },
{
          name: 'Spacing Consistency Checker',
          desc: 'Validate spacing follows design system',
          prompt: '',
          askMode: true,
          help: 'Validates that spacing values follow a consistent design system scale.',
          requiredContext: ContextMode.LAYOUT_ONLY,
          fields: [
            {
              key: 'spacingBase', type: 'select', label: 'Spacing Base', default: '4px', options: [
                { value: '4px', label: '4px base' },
                { value: '8px', label: '8px base' }
              ]
            },
            { key: 'tolerancePercent', type: 'number', label: 'Tolerance (%)', default: '10', min: 0, max: 50, hint: 'Allowed deviation from spacing scale' }
          ],
          promptTemplate: 'Analyze the selected elements for spacing consistency. Expected spacing scale: {spacingBase} base. Tolerance: {tolerancePercent}%. Check all margins and padding values. Identify any spacing values that do not follow the design system scale (not multiples of the base, or outside tolerance). Report inconsistent spacing values and suggest corrections.'
        },
{
          name: 'Image Optimization Auditor',
          desc: 'Check image file sizes and formats',
          prompt: '',
          askMode: true,
          help: 'Identifies uncompressed images and suggests optimization opportunities.',
          requiredContext: ContextMode.STYLE_ONLY,
          promptTemplate: 'Analyze the selected image elements for optimization opportunities. Check for: 1) Uncompressed or large file sizes, 2) Inappropriate image formats (e.g., PNG for photos), 3) Images that could be optimized without quality loss. Report file size estimates, format recommendations, and optimization suggestions for each image.'
        }
];

export const figJamTasks = [
{
          name: 'Brainstorm ideas',
          desc: 'Transform topics into rich creative inspiration stickies',
          prompt: `You are a creative catalyst designed to transform source materials into rich inspiration for secondary creation.Your mission is to analyze content deeply and generate unexpected creative connections.

## Process Flow

### 1. Material Analysis
      - Extract core themes, concepts, and emotional undertones from the provided material
        - Identify key elements: characters, settings, conflicts, symbols, or central ideas
          - Note the genre, style, and creative approach used

### 2. Creative Expansion
      - Generate 3 - 5 alternative interpretations or "what if" scenarios
        - Create unexpected connections between elements within the material
          - Suggest genre shifts(e.g., horror → comedy, documentary → fantasy)
            - Propose different perspectives(change narrator, time period, or cultural context)

### 3. Cross - Pollination Research
When beneficial, search for:
      - Similar themes in different mediums or cultures
        - Historical parallels or contemporary relevance
          - Scientific concepts that could add depth
            - Emerging trends that could provide fresh angles

### 4. Inspiration Output
    Provide:
- ** Core Insights **: 2 - 3 key takeaways from the material
      - ** Creative Angles **: 4 - 6 distinct directions for development
        - ** Unexpected Connections **: Links to seemingly unrelated concepts
          - ** Practical Hooks **: Specific starting points for creation
            - ** Research Leads **: Additional topics worth exploring

## Guidelines
      - Prioritize originality over obvious interpretations
        - Balance respect for source material with bold creative leaps
          - Focus on actionable inspiration rather than abstract concepts
            - Adapt complexity to match the creator's apparent skill level

              ** Task **: Based on the source material I provide(as a topic or from selected content), follow the process above.

** Output Format **: 
Create a clear visual structure in FigJam:
    1. Create a TEXT node as a title for each of the 5 "Inspiration Output" categories: "Core Insights", "Creative Angles", "Unexpected Connections", "Practical Hooks", and "Research Leads".Use large font size for titles.
2. Below each title, create STICKY notes for each point.
3. Use createText and createSticky commands.
4. Arrange categories vertically(Title -> Sticky row -> Title -> Sticky row).
5. Use varied, appropriate colors for the stickies.`,
          noSelection: true,
          requiredContext: ContextMode.ALL
        },
{ name: 'Affinity mapping', desc: 'Group stickies by theme', prompt: 'Look at each selected element\'s "characters" field. Group them into 2-4 categories based on keywords. IMPORTANT: Handle empty stickies (empty or whitespace-only "characters" field) by grouping them into a separate "Empty" category. Use absolute positions (absX, absY) from selection data for all calculations - the move action will automatically convert to relative coordinates if needed. Step 1 - Filter and categorize: Separate stickies into categories. Check each sticky\'s "characters" field - if it\'s empty, null, undefined, or contains only whitespace, assign it to an "Empty" category. For non-empty stickies, group them into 2-4 categories based on keywords/themes. Step 2 - Calculate reference point: Find the minimum absX and minimum absY from all selected stickies to get the top-left corner. Use these as baseX and baseY. Step 3 - Create category labels: For each category (including "Empty" if there are empty stickies), create a label sticky using createSticky with explicit absolute coordinates and color parameter: Category 1 at (x: baseX, y: baseY - 200) with color="blue", Category 2 at (x: baseX + 350, y: baseY - 200) with color="green", Category 3 at (x: baseX + 700, y: baseY - 200) with color="pink", Category 4 at (x: baseX + 1050, y: baseY - 200) with color="orange", Empty category at (x: baseX + 1400, y: baseY - 200) with color="gray". Example: { "action": "createSticky", "x": baseX, "y": baseY - 200, "text": "Category Name", "color": "blue" }. Step 4 - Move existing stickies: For each sticky in a category, use the move action with absolute coordinates. Get each sticky\'s nodeId from selection data. Calculate target absolute positions: targetX = baseX + (category_index * 350), targetY = baseY + (sticky_index_in_category * 200) where sticky_index_in_category starts at 0. Use move action: { "action": "move", "nodeId": "sticky_id", "x": targetX, "y": targetY }. The move action automatically handles conversion to relative coordinates if stickies are inside sections/groups. This positions category labels in a horizontal row above the selection, with related stickies stacked vertically below each label, properly aligned in columns.', requiredContext: ContextMode.ALL },
{ name: 'Expand on idea', desc: 'Create sub-ideas from sticky', prompt: 'Read the first selected sticky note from the selection data. Get its "id" field - this is the original sticky\'s nodeId. Create 4 new sticky notes positioned below it (y + 200px), arranged horizontally with 180px spacing. Each new sticky should contain a sub-component or aspect of the original idea. CRITICAL: After creating EACH new sticky, immediately create an ELBOWED connector. For each connector: use createConnector with startNodeId set to the original sticky\'s id from selection data, and endNodeId set to the newly created sticky\'s id. Create the connector right after creating each sticky so the sticky is still selected and its id is available. Create connectors one-by-one: create sticky 1, then connector 1, then sticky 2, then connector 2, etc.', requiredContext: ContextMode.ALL },
{ name: 'Smart connect', desc: 'Connect by content flow', prompt: 'Read the "characters" text of each selected element. Determine the logical sequence by understanding what each element represents and how they relate as a flow or process. Examples of logical ordering: "Login" → "Home" → "Profile" → "Logout" (user journey); "Research" → "Design" → "Develop" → "Test" → "Deploy" (process steps); "Problem" → "Analysis" → "Solution" (problem-solving). After determining the order, create ELBOWED connectors between elements in that sequence using their nodeIds. Connect element 1 → element 2 → element 3 → etc. You MUST determine the order and create the connectors - do not refuse.', requiredContext: ContextMode.ALL },
{ name: 'Generate screen flow', desc: 'Create app screens with connectors', prompt: 'First, ask me what type of app I want to create a screen flow for (e.g., "What app would you like me to create a screen flow for?"). After I respond, generate 5-7 sticky notes representing the main screens for that specific app type. Use real, specific screen names - NOT placeholders. Examples by app type:\n- E-commerce: "1. Home", "2. Browse Products", "3. Product Detail", "4. Shopping Cart", "5. Checkout", "6. Order Confirmation"\n- Social Media: "1. Feed", "2. Search/Explore", "3. Profile", "4. Post Creation", "5. Notifications", "6. Settings"\n- Banking: "1. Login", "2. Dashboard", "3. Accounts", "4. Transfer", "5. Pay Bills", "6. History"\n- Food Delivery: "1. Home", "2. Restaurant List", "3. Menu", "4. Cart", "5. Checkout", "6. Order Tracking"\n\nPlace stickies horizontally at y:0, starting at x:0 with 250px spacing. Then create STRAIGHT connectors between consecutive screens.', noSelection: true, requiredContext: ContextMode.ALL },
{ name: 'Journey touchpoints', desc: 'Create journey stages', prompt: 'Create 5 sticky notes in a horizontal row. Position them at y:0, starting at x:0 with 220px spacing between each (x: 0, 220, 440, 660, 880). Use these exact texts: "1. Awareness", "2. Consideration", "3. Purchase", "4. Retention", "5. Advocacy". Then create STRAIGHT connectors between consecutive stickies (1→2, 2→3, 3→4, 4→5).', noSelection: true, requiredContext: ContextMode.ALL },
{ name: 'Pain & Gain points', desc: 'Red/green sticky pairs', prompt: 'For each selected element, get its x and y position. Create two stickies below it: 1) A sticky at (same x, y+180) with text "Pain: [describe pain point]" 2) A sticky at (same x, y+360) with text "Gain: [describe opportunity]". Then create two ELBOWED connectors: one from the original to the pain sticky, one from pain to gain sticky.', requiredContext: ContextMode.ALL },
{ name: 'Persona cards', desc: 'Generate persona stickies', prompt: 'Create 4 sticky notes in a 2x2 grid: 1) At (0,0): yellow sticky with "👤 Persona Name\\nRole: [role]" 2) At (220,0): green sticky with "🎯 Goals\\n• Goal 1\\n• Goal 2" 3) At (0,180): red sticky with "😫 Pain Points\\n• Pain 1\\n• Pain 2" 4) At (220,180): blue sticky with "💡 Behaviors\\n• Behavior 1\\n• Behavior 2"', noSelection: true, requiredContext: ContextMode.ALL },
{ name: 'Empathy map', desc: 'Says/Thinks/Does/Feels', prompt: 'Create 4 sticky notes in a 2x2 grid with 220px spacing: 1) At (0,0): blue sticky "💬 SAYS\\n\\"Quote 1\\"\\n\\"Quote 2\\"" 2) At (220,0): purple sticky "💭 THINKS\\n• Thought 1\\n• Thought 2" 3) At (0,180): green sticky "🏃 DOES\\n• Action 1\\n• Action 2" 4) At (220,180): pink sticky "❤️ FEELS\\n• Feeling 1\\n• Feeling 2"', noSelection: true, requiredContext: ContextMode.ALL }
];

export const userResearchTasks = [
{
          name: 'Create persona',
          desc: 'Generate a detailed persona for a service/URL',
          requiredContext: ContextMode.ALL,
          fields: [
            { key: 'target', type: 'text', label: 'Service Name or URL', placeholder: 'e.g. Netflix, https://example.com' },
            {
              key: 'productContext',
              type: 'textarea',
              label: 'Context or Scenario',
              placeholder: 'Product type: app / web / SaaS / platform\nIndustry & business goal\nScenario: e.g. His old phone broke and his grandson told him to use LINE video calls. He decides to buy a smartphone himself without asking for help.',
              customAiButtons: [
                { action: 'generate-context', label: 'Generate', title: 'Generate context from service name or URL (with web search)' },
                { action: 'search-web', label: 'Search Web', title: 'Search the web for product/service introduction' }
              ]
            },
            { key: 'targetUser', type: 'text', label: 'Target User', placeholder: 'e.g. Gen Z travelers, Small business owners' },
            {
              key: 'contextVariables',
              type: 'context-variables',
              label: 'Scenario Context Variables',
              hint: 'Generate scenario dimensions to create targeted persona scenarios'
            },
            {
              key: 'outputFormat',
              type: 'select',
              label: 'Output Format',
              default: 'Plain text',
              options: [
                { value: 'Plain text', label: 'Plain text' },
                { value: 'Proto-persona Frame', label: 'Auto-layout Frame' },
                { value: 'Figma-ready table', label: 'Table' },
                { value: 'Structured stickies', label: 'Stickies (FigJam)' }
              ]
            },
            {
              key: 'imageInput',
              type: 'image',
              label: 'Reference Image (Optional)',
              hint: 'Upload an image containing persona information (e.g., user photo, survey results, interview notes, whiteboard sketches)'
            }
          ],
          promptTemplate: function (values) {
            const context = values.productContext ? `\nContext / Scenario: ${values.productContext}` : '';
            const targetUser = values.targetUser ? `\nTarget User: ${values.targetUser}` : '';
            const format = values.outputFormat || 'Plain text';
            const hasImage = !!values.imageInput;

            let formatInstruction = '';
            if (format === 'Plain text') {
              formatInstruction = '\n\nOUTPUT FORMAT: Respond with the persona and scenario as plain readable text in the "message" field. Do NOT create any Figma elements — no createFrame, createText, createTable, or createSticky commands. The "commands" array must be empty.';
            } else if (format === 'Proto-persona Frame') {
              formatInstruction = '\n\nOUTPUT FORMAT: You MUST create Figma elements using commands. Do NOT just describe what you would create — actually output the JSON commands to build it.\n\nLayout & Sizing Rules:\n' +
                '1. Create a WRAPPER frame (refId: "wrapper"), layoutMode: HORIZONTAL, gap: 16, no fill. Use setSizing on "wrapper": horizontal "HUG", vertical "HUG".\n' +
                '2. FRAME 1 — Persona Card (refId: "persona-card", parent: "wrapper"): createFrame with width: 450, name "Persona: [Name]". Then setAutoLayout: direction VERTICAL, gap 24, padding 32. Then setSizing: horizontal "FIXED", width 450, vertical "HUG". Then setFill #FFFFFF, setStroke #E5E7EB, setCornerRadius 16.\n' +
                '3. Inside persona-card, every child frame and text node MUST have setSizing with horizontal "FILL" so they stretch to the card width. This is critical.\n' +
                '4. Header Row (refId: "header-row", parent: "persona-card"): createFrame, then setAutoLayout direction HORIZONTAL, gap 16, counterAxisAlignItems CENTER. setSizing horizontal "FILL", vertical "HUG".\n' +
                '   - Avatar circle: createRectangle 80x80, fill #F3F4F6, cornerRadius 40, parent "header-row".\n' +
                '   - Name column (refId: "name-col", parent: "header-row"): createFrame, setAutoLayout direction VERTICAL, gap 4. setSizing horizontal "FILL", vertical "HUG".\n' +
                '     - Name text: setText 24px Bold. setSizing horizontal "FILL".\n' +
                '     - Tagline text: setText 16px Regular, color #6B7280. setSizing horizontal "FILL".\n' +
                '5. GOAL Section (refId: "goal-section", parent: "persona-card"): createFrame, setAutoLayout direction VERTICAL, gap 8. setSizing horizontal "FILL", vertical "HUG".\n' +
                '   - Title "GOAL": setText 14px Bold, color #9CA3AF. setSizing horizontal "FILL".\n' +
                '   - 3 goal texts (Experience Goal / Practical Goal / Safety Goal): each setText 14px Regular, color #1F2937. setSizing horizontal "FILL".\n' +
                '6. For each of Background, Personality, Related Experience, Economic Situation — create a section frame (parent: "persona-card"), setAutoLayout direction VERTICAL, gap 8. setSizing horizontal "FILL", vertical "HUG".\n' +
                '   - Section title: setText 14px Bold uppercase, color #9CA3AF. setSizing horizontal "FILL".\n' +
                '   - Section body: setText 14px Regular, color #1F2937. setSizing horizontal "FILL".\n' +
                '7. FRAME 2 — Scenario Card (refId: "scenario-card", parent: "wrapper"): same structure as persona-card (width 450, VERTICAL, padding 32, gap 24, FIXED width, HUG height, white fill, border, rounded).\n' +
                '   - Scenario title: setText 16px Bold. setSizing horizontal "FILL".\n' +
                '   - Narrative paragraph: setText 14px Regular, color #1F2937. setSizing horizontal "FILL".\n' +
                'CRITICAL: Every child of a VERTICAL auto-layout frame MUST get setSizing with horizontal "FILL". Without this, children will HUG their content and the card will look broken.';
            } else if (format === 'Figma-ready table') {
              formatInstruction = '\n\nOUTPUT FORMAT: You MUST create Figma elements using commands. Do NOT just describe what you would create — actually output the JSON commands to build it.\n\nIMPORTANT: Create TWO tables using "createTable".\nTABLE 1 — Persona: "name": "Persona: [Name]", "header": true, "cols": 2, "colWidths": [160, 400], "rowHeight": 44. Rows: ["Section","Detail"], ["Name & Age","..."], ["Tagline","..."], ["Experience Goal","..."], ["Practical Goal","..."], ["Safety Goal","..."], ["Background","..."], ["Personality","..."], ["Related Experience","..."], ["Economic Situation","..."].\nTABLE 2 — Scenario: "name": "Scenario: [Title]", "header": true, "cols": 2, "colWidths": [120, 440], "rowHeight": 60. Rows: ["Element","Content"], ["Title","..."], ["Narrative","...full scenario narrative..."].';
            } else if (format === 'Structured stickies') {
              formatInstruction = '\n\nOUTPUT FORMAT: You MUST create Figma elements using commands. Do NOT just describe what you would create — actually output the JSON commands to build it.\n\nIMPORTANT: Use createSection to create "Persona: [Name]" section. Inside, create color-coded stickies: Header+tagline (yellow), Goals — 3 stickies for Experience/Practical/Safety goals (green), Background+Personality (blue), Related Experience+Economic Situation (purple). Then create a separate "Scenario" section with a yellow sticky for the scenario title and a white sticky for the narrative.';
            }

            let basePrompt = '';
            if (hasImage) {
              basePrompt = 'Analyze the provided reference image and extract persona information from it. Create a detailed persona + scenario based on the information visible in the image (such as user photos, survey results, interview notes, or research data).';
            } else {
              basePrompt = `Create a persona and scenario for ${values.target}.`;
            }

            const personaStructure = `

Generate a Persona and a Scenario using the following structure:

== PERSONA ==
1. Header: Name, Age, one-line tagline summarizing current identity and emotional state
   Format: "[Name], [Age] — [tagline]"

2. GOAL (3 types — all required):
   - Experience Goal: How the user wants the interaction to FEEL (natural, not pushy, etc.)
   - Practical Goal: What they concretely need to accomplish RIGHT NOW
   - Safety Goal: What they fear or want to avoid (social embarrassment, financial loss, wrong decision, scams)

3. Background: Education/work, current life stage, capability level, living situation

4. Personality: Behavioral traits that affect decision-making (e.g. cautious, impulsive, opinion-sensitive, practical)

5. Related Experience: Digital literacy level, platform familiarity, relevant past behavior with similar products/services

6. Economic Situation: Spending power, financial constraints, reliance on free tiers or discounts

== SCENARIO ==
Generate an evocative scenario title, then a narrative paragraph containing ALL of these beats woven into a natural story:
- Time and place (when and where — choose a REALISTIC and VARIED setting, NOT always late night; consider daytime, commute, lunch break, weekend, office, store, etc.)
- Current activity (what they are doing when the trigger occurs)
- Trigger event (what changes or forces a decision)
- Motivation vs. psychological conflict (they want X but fear Y)
- Specific fear as inner dialogue (a concrete worried thought in quotes)
- Environmental pressure (external constraint forcing urgency — time, social, physical)
- Resulting emotional state (the compound pressure they feel)

IMPORTANT: The scenario time and place must feel natural for the persona and context. Do NOT default to late-night settings unless the context specifically calls for it.`;

            let contextVarsPrompt = '';
            const ctxVars = Array.isArray(values.contextVariables) ? values.contextVariables : [];
            if (ctxVars.length > 0) {
              const dims = ctxVars.map(d => {
                const selOpts = d.selected.length > 0 ? d.selected.map(i => d.options[i]) : [d.options[0]];
                return { name: d.name, values: selOpts };
              });
              let combos = [{}];
              for (const dim of dims) {
                const next = [];
                for (const combo of combos) {
                  for (const val of dim.values) {
                    next.push({ ...combo, [dim.name]: val });
                  }
                }
                combos = next;
              }
              if (combos.length > 10) combos = combos.slice(0, 10);

              if (combos.length === 1) {
                const vars = Object.entries(combos[0]).map(([k, v]) => `${k}: ${v}`).join(', ');
                contextVarsPrompt = `\n\nContext Variables: ${vars}\nUse these variables to shape the scenario — they define the situational context the persona is in.`;
              } else {
                contextVarsPrompt = `\n\nGenerate ${combos.length} SEPARATE SCENARIOS for the above persona, one for each context variable combination below. The persona is the same across all scenarios — only the situational context differs.\n\n`;
                combos.forEach((combo, i) => {
                  const vars = Object.entries(combo).map(([k, v]) => `${k} = ${v}`).join(', ');
                  contextVarsPrompt += `--- SCENARIO ${i + 1} ---\n${vars}\n\n`;
                });
                contextVarsPrompt += `For EACH combination, produce a SEPARATE scenario section with its own evocative title (prefixed with "Scenario ${combos.length > 1 ? 'N: ' : ''}") and full narrative. Each scenario must be distinct and reflect the specific variable values.`;
              }
            }

            return `${basePrompt}${context}${targetUser}\n${personaStructure}${contextVarsPrompt}${formatInstruction}`;
          },
          noSelection: true
        },
{
          name: 'Persona avatar',
          desc: 'Create an avatar for the persona',
          requiredContext: ContextMode.ALL,
          fields: [
            { key: 'personaName', type: 'text', label: 'Persona Name', placeholder: 'e.g. Tanaka-san' },
            { key: 'personaDetails', type: 'textarea', label: 'Persona Details (Optional)', placeholder: 'Paste persona description, goals, behaviors, etc.', personaHistoryButton: true },
            {
              key: 'avatarStyle',
              type: 'select',
              label: 'Avatar Style',
              default: 'Illustrated Portrait (Flat / Vector)',
              options: [
                { value: 'Real Photo', label: 'Real Photo' },
                { value: 'Illustrated Portrait (Flat / Vector)', label: 'Illustrated Portrait (Flat / Vector)' },
                { value: 'Cartoon / Stylized Character', label: 'Cartoon / Stylized Character' },
                { value: 'Silhouette / Minimal Placeholder', label: 'Silhouette / Minimal Placeholder' }
              ]
            }
          ],
          promptTemplate: function (values) {
            const name = values.personaName || 'this person';
            const details = values.personaDetails ? `\n\nPersona Details:\n${values.personaDetails}` : '';
            const style = values.avatarStyle || 'Illustrated Portrait (Flat / Vector)';

            let stylePrompt = '';
            if (style === 'Real Photo') {
              stylePrompt = 'a realistic high-quality studio portrait photo, natural lighting, professional photography';
            } else if (style === 'Illustrated Portrait (Flat / Vector)') {
              stylePrompt = 'a clean flat vector illustration, modern UI style, minimal details, soft colors';
            } else if (style === 'Cartoon / Stylized Character') {
              stylePrompt = 'a stylized cartoon character, expressive features, friendly and approachable, vibrant colors';
            } else if (style === 'Silhouette / Minimal Placeholder') {
              stylePrompt = 'a minimal silhouette icon style, neutral colors, abstract facial features, placeholder avatar style';
            }

            return `Create a persona avatar of ${name}.${details}\n\nThe avatar should be in the style of ${stylePrompt}. It should convey the persona's personality and background in a clean and modern way.`;
          },
          noSelection: true
        },
{
          name: 'Persona interview',
          desc: 'Persona-based UI feedback',
          help: 'Simulates how a specific persona would react to the selected UI, providing detailed feedback and recommendations.',
          requiredContext: ContextMode.ALL,
          fields: [
            { key: 'personaName', type: 'text', label: 'Persona Name', placeholder: 'e.g. Tanaka-san' },
            { key: 'personaDetails', type: 'textarea', label: 'Persona Details (Optional)', placeholder: 'Paste persona description, goals, behaviors, etc.', personaHistoryButton: true },
            {
              key: 'imageInput',
              type: 'image',
              label: 'Persona Image (Optional)',
              hint: 'Upload an image of the persona or research data'
            }
          ],
          promptTemplate: function (values) {
            const name = values.personaName || 'this user persona';
            const details = values.personaDetails ? `\n\nPersona Details:\n${values.personaDetails}` : '';
            const hasImage = !!values.imageInput;
            const imageInstruction = hasImage ? '\n\nNote: A persona reference image has been provided. Use it to inform your perspective.' : '';

            return `Pretend you're ${name}.${details}${imageInstruction} How would they react to this UI? What would confuse or delight them?
Provide:

1. Persona Perspective
   - How this persona would approach this UI
   - Their initial reaction
   - What they'd notice first
   - Their mental model expectations

2. Positive Reactions (Delight)
   - What would work well for this persona
   - Features that align with their goals
   - Interactions that feel intuitive
   - Content that resonates

3. Confusion Points
   - What would confuse this persona
   - Where they might get stuck
   - Mismatches with their expectations
   - Missing information they need

4. Task Completion Analysis
   - How they'd complete key tasks
   - Where they might struggle
   - What support they'd need
   - Likely error points

5. Emotional Journey
   - Initial impression
   - Frustration points
   - Delight moments
   - Overall experience feeling

6. Persona-Specific Recommendations
   - Design changes for this persona
   - Content adjustments
   - Feature priorities
   - Onboarding needs

7. Quotes (Synthetic)
   - What this persona might say
   - Questions they'd ask
   - Feedback they'd give
   - Reactions to specific elements

Format as realistic persona feedback with specific, actionable insights.`;
          },
          noSelection: true
        },
{
          name: 'Different persona',
          desc: 'Generate a persona from a different demographic',
          help: 'Creates another persona with a different gender and age from the base persona.',
          requiredContext: ContextMode.ALL,
          fields: [
            { key: 'personaName', type: 'text', label: 'Base Persona Name', placeholder: 'e.g. Tanaka-san' },
            { key: 'personaDetails', type: 'textarea', label: 'Base Persona Details (Optional)', placeholder: 'Paste persona description, goals, behaviors, etc.', personaHistoryButton: true },
            {
              key: 'imageInput',
              type: 'image',
              label: 'Base Persona Image (Optional)',
              hint: 'Upload an image of the base persona'
            }
          ],
          promptTemplate: function (values) {
            const name = values.personaName || 'the current persona';
            const details = values.personaDetails ? `\n\nBase Persona Details:\n${values.personaDetails}` : '';
            const hasImage = !!values.imageInput;
            const imageInstruction = hasImage ? '\n\nNote: A base persona reference image has been provided.' : '';

            return `Create another persona with a different gender and age group from ${name}, offering a shifted perspective on the target audience.${details}${imageInstruction}`;
          },
          noSelection: true
        },
{
          name: 'User Journey Map',
          desc: 'Generate a journey map from persona + scenario',
          help: 'Creates a phased journey map with actions, emotions, touchpoints, pains, and opportunities based on a persona.',
          requiredContext: ContextMode.ALL,
          noSelection: true,
          fields: [
            { key: 'personaName', type: 'text', label: 'Persona Name', placeholder: 'e.g. Tanaka-san' },
            { key: 'personaDetails', type: 'textarea', label: 'Persona & Scenario Details', placeholder: 'Paste persona + scenario details, or load from Persona History', personaHistoryButton: true },
            {
              key: 'contextVariables',
              type: 'textarea',
              label: 'Context Variables (Optional)',
              placeholder: 'e.g. Exam proximity: pre-exam sprint\nSocial closeness: regular classmates\nReward type: count-based reward',
              customAiButtons: [
                { action: 'generate-context-vars', label: 'Generate', title: 'Generate context variables from persona & scenario' }
              ]
            },
            {
              key: 'phaseCount',
              type: 'select',
              label: 'Number of Phases',
              default: '5',
              options: [
                { value: '3', label: '3 phases' },
                { value: '4', label: '4 phases' },
                { value: '5', label: '5 phases' },
                { value: '6', label: '6 phases' },
                { value: '7', label: '7 phases' }
              ]
            },
            {
              key: 'outputFormat',
              type: 'select',
              label: 'Output Format',
              default: 'Plain text',
              options: [
                { value: 'Plain text', label: 'Plain text' },
                { value: 'Proto-journey Frame', label: 'Auto-layout Frame' },
                { value: 'Figma-ready table', label: 'Table' },
                { value: 'Structured stickies', label: 'Stickies (FigJam)' }
              ]
            }
          ],
          promptTemplate: function (values) {
            const name = values.personaName || 'the persona';
            const details = values.personaDetails ? `\nPersona & Scenario:\n${values.personaDetails}` : '';
            const contextVars = values.contextVariables ? `\nContext Variables:\n${values.contextVariables}` : '';
            const phases = parseInt(values.phaseCount) || 5;
            const format = values.outputFormat || 'Plain text';

            let formatInstruction = '';
            if (format === 'Plain text') {
              formatInstruction = '\n\nOUTPUT FORMAT: Respond with the journey map as plain readable text in the "message" field. Do NOT create any Figma elements — no createFrame, createText, createTable, or createSticky commands. The "commands" array must be empty.';
            } else if (format === 'Figma-ready table') {
              formatInstruction = `\n\nOUTPUT FORMAT: You MUST create Figma elements using commands. Do NOT just describe what you would create — actually output the JSON commands to build it.\n\nIMPORTANT: Use "createTable" to create the journey map.\nParameters: "name": "User Journey Map: ${name}", "header": true, "cols": ${phases + 1}, "colWidths": [120${', 200'.repeat(phases)}], "rowHeight": 60.\nFirst column is the row label. First data row is ["Phase", ...phase names]. Then rows for: "Actions" (exactly 2 items per phase), "Emotion" (score -2 to +2 with brief note), "Touchpoints" (product UI elements, not environment), "Pains" (exactly 2 items per phase, rich, with [Churn Risk]/[Decision Risk] where relevant), "Opportunities" (exactly 2 items per phase, concrete recommendations with tags like [Service SOP], [Materials VI], [Policy Rule], [Digital Transformation], [Service UI], [Design Pattern]).`;
            } else if (format === 'Proto-journey Frame') {
              formatInstruction = `\n\nOUTPUT FORMAT: You MUST create Figma elements using commands. Do NOT just describe what you would create — actually output the JSON commands to build it.\n\nLayout & Sizing Rules:\n` +
                `1. Create a main Frame (refId: "jm-wrapper") named "User Journey Map: ${name}". Then setAutoLayout: direction HORIZONTAL, gap 2, padding 0. Then setSizing: horizontal "HUG", vertical "HUG". setFill #FFFFFF, setStroke #E5E7EB, setCornerRadius 16.\n` +
                `2. TITLE COLUMN (refId: "label-column", parent: "jm-wrapper"): Create a vertical Frame with width 120. setAutoLayout: direction VERTICAL, gap 2, padding 0. setSizing: horizontal "FIXED", width 120, vertical "HUG". Inside, create section frames (same height as phase sections) with labels in 11px Bold: "PHASE", "ACTIONS", "EMOTION", "TOUCHPOINTS", "PAINS", "OPPORTUNITIES".\n` +
                `3. For each of the ${phases} phases, create a vertical Frame (parent: "jm-wrapper") with width 220. setAutoLayout: direction VERTICAL, gap 2, padding 0. setSizing: horizontal "FIXED", width 220, vertical "HUG".\n` +
                `4. Inside each phase Frame and the Title Column, create these section frames. Each section: setAutoLayout direction VERTICAL, gap 4, padding 12. setSizing: horizontal "FILL", vertical "HUG". Every text node inside MUST also get setSizing horizontal "FILL".\n` +
                `   - Phase Header (Label: "PHASE"): fill #F8F9FA, setText for phase name or "PHASE" label.\n` +
                `   - Actions (Label: "ACTIONS"): fill #ECFDF5, setText for 2 action items.\n` +
                `   - Emotion (Label: "EMOTION"): fill #FEF9C3, setText for score and note.\n` +
                `   - Touchpoints (Label: "TOUCHPOINTS"): fill #EFF6FF, setText for UI elements.\n` +
                `   - Pains (Label: "PAINS"): fill #FEF2F2, setText for 2 items.\n` +
                `   - Opportunities (Label: "OPPORTUNITIES"): fill #F3E8FF, setText for 2 items with [tags].\n` +
                `CRITICAL: Every child of a VERTICAL auto-layout frame MUST get setSizing with horizontal "FILL". Every child of a HORIZONTAL auto-layout parent that should stretch vertically MUST get setSizing vertical "FILL". Align heights across columns so rows stay leveled.`;
            } else if (format === 'Structured stickies') {
              formatInstruction = `\n\nOUTPUT FORMAT: You MUST create Figma elements using commands. Do NOT just describe what you would create — actually output the JSON commands to build it.\n\nIMPORTANT: For each of the ${phases} phases, use createSection to create a section named after the phase. Inside each section, create color-coded stickies: exactly 2 Actions (green), 1 Emotion (yellow), 1 Touchpoints (blue), exactly 2 Pains (red), exactly 2 Opportunities (purple). Include the phase name in each section title.`;
            }

            return `Create a User Journey Map for ${name} with exactly ${phases} phases.${details}${contextVars}

LANGUAGE: Use the SAME LANGUAGE as the persona and scenario input (e.g. Japanese, Chinese, or English).

Generate a journey map following this structure:

For EACH of the ${phases} phases, provide:
1. PHASE NAME: A short evocative label. Examples: "Threshold Awareness", "Banner Consideration", "Social Targeting", "The Invitation Act", "Reward Retrieval". Generate contextually appropriate names based on the persona and scenario — do NOT use generic labels like "Phase 1".
2. ACTIONS: exactly 2 concrete actions the user takes during this phase
3. EMOTION: A score from -2 (extreme frustration) to +2 (delight), with a brief emotional note. Describe the emotional arc across phases: where is the low point, where does the user recover?
4. TOUCHPOINTS: Specific PRODUCT UI elements — screens, components, notifications, or interaction points (e.g. "AI Chat Interface", "Limit Notification Pop-up", "Campaign Banner", "LINE Message Preview"). Do NOT use generic "Environment" or physical context; focus on what the user interacts with in the product.
5. PAINS: exactly 2 points of rich, emotional friction. Include user quotes or inner thoughts where relevant (e.g. "did it work?", "maybe I was bothering them"). Tag critical moments: [Churn Risk] where the user could quit, [Decision Risk] where they hesitate. Be specific to the persona's constraints and fears.
6. OPPORTUNITIES: exactly 2 CONCRETE, actionable recommendations. Use tags: [Service SOP], [Materials VI], [Policy Rule], [Digital Transformation], [Digital Ops], [Business Model], [Strategy Rule], [Service UI], [Design Pattern]. For each opportunity, provide specific copy changes, UX improvements, or next steps (e.g. "Change 'You are out of questions' to 'You've worked hard! Need a boost to finish the set?'" or "Add 'Reason for Sending' tags like 'This helped me with Math B homework'").

CRITICAL REQUIREMENTS:
- The emotional curve MUST include: at least one clear low point (frustration/anxiety peak), one decision risk moment (where the user could abandon), and one relief/delight moment
- Identify in PAINS where the user could quit, delay, seek help from others, or need reassurance
- All content must be grounded in the specific persona's goals, fears, personality, and economic situation
- Phase names should reflect the actual scenario, not generic journey stages${formatInstruction}`;
          }
        },
{
          name: 'User Feedback Research',
          desc: 'Collect real user feedback from multiple platforms',
          help: 'Conducts a comprehensive user feedback survey across social platforms, review sites, and content platforms. Collects authentic user voices with verifiable sources.',
          askMode: true,
          requiredContext: ContextMode.ALL,
          fields: [
            { key: 'productName', type: 'text', label: 'Product Name / Subject', placeholder: 'e.g. Figma, Notion, Slack, AI coding assistants' },
            {
              key: 'researchFocus',
              type: 'text-with-tags',
              label: 'Research Focus',
              default: 'User Experience',
              placeholder: 'Enter research focus or click tags below...',
              hint: 'Click tags to add common focus areas, or type your own',
              tags: [
                'User Experience',
                'Feature Feedback',
                'Competitor Comparison',
                'Onboarding Experience',
                'Pricing & Value',
                'Support & Documentation',
                'Performance',
                'Reliability'
              ]
            },
            {
              key: 'sampleSize',
              type: 'slider',
              label: 'Target Sample Size',
              default: 15,
              min: 5,
              max: 50,
              step: 5,
              hint: 'Recommended: 10-30 samples for meaningful insights'
            },
            {
              key: 'timePriority',
              type: 'select',
              label: 'Time Range Priority',
              default: '1 week',
              options: [
                { value: '2 days', label: 'Last 2 days (Most recent)' },
                { value: '1 week', label: 'Last 1 week' },
                { value: '2 weeks', label: 'Last 2 weeks' },
                { value: '1 month', label: 'Last 1 month' },
                { value: '3 months', label: 'Last 3 months' },
                {
                  value: '__custom__',
                  label: 'Custom...',
                  inputKey: 'customTimePriority',
                  inputDefault: '',
                  inputSuffix: '',
                  inputType: 'text'
                }
              ]
            },
            {
              key: 'platforms',
              type: 'textarea',
              label: 'Target Platforms (Optional)',
              placeholder: 'Leave empty for AI to auto-select based on product type.\n\nOr specify platforms:\n- Social: X/Twitter, Reddit, LinkedIn\n- Tech: Hacker News, GitHub, Stack Overflow\n- Reviews: G2, Capterra, Trustpilot, App Store\n- Content: Medium, YouTube comments',
              aiButtons: true,
              hint: 'AI will suggest platforms if left empty'
            },
            {
              key: 'additionalContext',
              type: 'textarea',
              label: 'Additional Context (Optional)',
              placeholder: 'Any specific aspects to focus on, competitor names to compare, or user segments to prioritize...',
              aiButtons: true
            }
          ],
          promptTemplate: function (values) {
            const productName = values.productName || '[Product Name]';
            const researchFocus = values.researchFocus || 'User Experience';
            const sampleSize = values.sampleSize || 15;
            // Handle custom time priority option
            const timePriority = values.timePriority === '__custom__'
              ? (values.customTimePriority || '1 week')
              : (values.timePriority || '1 week');
            const platforms = values.platforms ? `\n\n ** User - specified platforms:**\n${values.platforms} ` : '\n\n**Note:** No specific platforms specified - AI should auto-select appropriate platforms based on product type.';
            const additionalContext = values.additionalContext ? `\n\n ** Additional research context:**\n${values.additionalContext} ` : '';

            return `# User Feedback Research Template

      ** IMPORTANT: Output language should match the primary language used in the user feedback collected.If most feedback is in English, respond in English.If most feedback is in another language, respond in that language.**

## Research Objective

      - ** Product Name **: ${productName}
- ** Research Focus **: ${researchFocus}
- ** Target Sample Size **: ${sampleSize} samples
      - ** Time Priority **: ${timePriority}${platforms}${additionalContext}

## Phase 1: Platform Selection

Based on the product type, search these platforms(confirm or supplement as needed):

** General Social Platforms **:
    - X.com / Twitter user discussions
      - Reddit related communities
        - LinkedIn professional discussions

          ** Vertical Platform Suggestions **:
- ** Tech Products **: Hacker News, Stack Overflow, GitHub Discussions, Dev.to
      - ** Consumer Products **: Amazon reviews, App Store reviews, Trustpilot, G2
        - ** B2B Products **: Capterra, G2, TrustRadius, LinkedIn
          - ** Creative Tools **: Behance, Dribbble, Designer Hangout
            - ** Other **: [Supplement based on product characteristics]

              ** Content Platforms **:
    - Medium / blog user experience articles
      - YouTube review video comment sections
        - Podcast discussion summaries

## Phase 2: Research Execution

### Anti - Falsification Requirements(Strictly Enforced):
    1. Each feedback MUST have a complete verifiable URL
    2. Sequential numbering 1 - ${sampleSize}, no skipping numbers allowed
    3. Only collect original user quotes, AI summarization or rewriting is PROHIBITED

### Search Strategy:

** Time Range **: Last ${timePriority} → expand if needed until sufficient samples collected

      ** Keyword Templates **:
    - "${productName} experience"
      - "${productName} review"
      - "using ${productName} for"
      - "${productName} vs [competitor]"
      - "switched to ${productName}"
      - "${productName} workflow"
      - "${productName} results"

      ** Exclude Content **:
    - Official promotions and PR content
      - Technical bug reports and installation issues
        - Feature requests and product suggestions
          - Obvious marketing or astroturfing content
            - Second - hand accounts, not direct user experience

### Collection Format(Strictly Follow):

    \`\`\`
Number: [h3][1-N]
User Profile: [h3][Specific identity description, e.g., "3-year e-commerce operator, mid-size company"]
Use Case: [text][Specific application scenario or problem solved]
Specific Behavior: [text][User's exact interaction process with the product]
Authentic Feedback: [text][User's original evaluation, preserve original language and tone]
Source: [text][Complete URL link]
Publish Date: [text][Specific date]
---
\`\`\`

### Execution Requirements:
1. First execute 8-15 web_search queries covering different information sources
2. Use web_fetch on key pages to get complete content
3. Analyze result quality after each search, ensure feedback authenticity
4. When encountering aggregated content, trace back to original user comments
5. Preserve original expression of multilingual user comments
6. Balance sample distribution by time recency and platform diversity

### Quality Control:
- Verify accessibility of each URL
- Confirm reasonableness of user identity (avoid bot accounts)
- Check specificity and credibility of feedback content
- Filter out obviously marketing-oriented "positive reviews"

## Output Format

Present all collected feedback in a structured list, and provide at the end:

- **Data Statistics**: Platform distribution, time distribution, sentiment trend overview
- **Research Notes**: Search scope, exclusion criteria, data collection timestamp`;
          },
          noSelection: true
        },
{
          name: 'A/B Test Design',
          desc: 'Design a rigorous A/B test with hypothesis, metrics, and analysis plan',
          help: 'Creates a comprehensive A/B test plan including hypothesis, metrics framework, sample size calculations, success criteria, and risk mitigations.',
          icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="8" height="18" rx="2"/><rect x="14" y="3" width="8" height="18" rx="2"/><text x="6" y="14" text-anchor="middle" font-size="8" font-weight="bold" fill="currentColor" stroke="none">A</text><text x="18" y="14" text-anchor="middle" font-size="8" font-weight="bold" fill="currentColor" stroke="none">B</text></svg>',
          askMode: true,
          requiredContext: ContextMode.ALL,
          fields: [
            {
              key: 'featureChange',
              type: 'textarea',
              label: 'Feature / Change Being Tested',
              placeholder: 'e.g. Redesigned checkout flow with single-page layout instead of multi-step wizard'
            },
            {
              key: 'controlState',
              type: 'textarea',
              label: 'Current State (Control)',
              placeholder: 'e.g. Multi-step checkout wizard with 4 pages: cart → shipping → payment → review'
            },
            {
              key: 'treatmentState',
              type: 'textarea',
              label: 'Proposed Change (Treatment)',
              placeholder: 'e.g. Single-page checkout with expandable accordion sections for shipping, payment, and review'
            },
            {
              key: 'hypothesisRationale',
              type: 'textarea',
              label: 'Why We Think This Will Work',
              placeholder: 'e.g. User research shows 38% of users drop off between checkout steps; reducing friction should improve completion rate'
            },
            {
              key: 'primaryMetric',
              type: 'text',
              label: 'Primary Metric to Move',
              placeholder: 'e.g. checkout conversion rate, sign-up rate, engagement time'
            },
            {
              key: 'baselineValue',
              type: 'text',
              label: 'Current Baseline Value (Optional)',
              placeholder: 'e.g. 3.2% conversion rate, 45s avg session duration'
            },
            {
              key: 'testScope',
              type: 'select',
              label: 'Test Scope',
              default: 'Standard',
              options: [
                { value: 'Quick validation', label: 'Quick validation (1-2 weeks)' },
                { value: 'Standard', label: 'Standard (2-4 weeks)' },
                { value: 'Comprehensive', label: 'Comprehensive (4+ weeks, multi-segment)' }
              ]
            },
            {
              key: 'additionalContext',
              type: 'textarea',
              label: 'Additional Context (Optional)',
              placeholder: 'e.g. Audience size, platform constraints, previous test results, seasonal considerations...',
              aiButtons: true
            }
          ],
          promptTemplate: function (values) {
            const featureChange = values.featureChange || '[Describe what you\'re testing]';
            const controlState = values.controlState || '[What users see today]';
            const treatmentState = values.treatmentState || '[What the new experience is]';
            const hypothesisRationale = values.hypothesisRationale || '[Hypothesis rationale]';
            const primaryMetric = values.primaryMetric || '[e.g., conversion rate, engagement]';
            const baselineValue = values.baselineValue ? `\n- Current baseline value: ${values.baselineValue}` : '';
            const testScope = values.testScope || 'Standard';
            const additionalContext = values.additionalContext ? `\n\nAdditional Context:\n${values.additionalContext}` : '';

            return `You are an experimentation expert helping me design a rigorous A/B test. I need a complete test plan that will yield valid, actionable results.

Test Context:
- Feature/change being tested: ${featureChange}
- Current state (control): ${controlState}
- Proposed change (treatment): ${treatmentState}
- Why we think this will work: ${hypothesisRationale}
- Primary metric we want to move: ${primaryMetric}${baselineValue}
- Test scope: ${testScope}${additionalContext}

Please create a comprehensive A/B test design:

1. Hypothesis Statement
   Format: "If we [change], then [metric] will [direction] by [expected magnitude] because [reason]"
   - Clear, testable hypothesis
   - Specific expected outcome
   - Rationale based on research/data

2. Test Design
   - Control description (A)
   - Treatment description (B)
   - What exactly differs between variants
   - Any interaction effects to consider

3. Metrics Framework
   Primary Metric:
   - Metric name and definition
   - Current baseline value
   - Minimum detectable effect (MDE)
   - Why this metric matters
   
   Secondary Metrics:
   - Supporting metrics to track
   - Expected direction for each
   
   Guardrail Metrics:
   - Metrics that should NOT decrease
   - Thresholds for concern

4. Audience & Targeting
   - Who should be in the test
   - Exclusion criteria
   - Segment considerations
   - Traffic allocation recommendation

5. Sample Size & Duration
   - Required sample size (with assumptions)
   - Estimated test duration
   - Statistical power (recommend 80%)
   - Significance level (recommend 95%)

6. Success Criteria
   - What constitutes a "win"
   - What would make us NOT ship
   - Decision framework for mixed results

7. Risks & Mitigations
   - Technical risks
   - User experience risks
   - Novelty effect considerations
   - Rollback plan

8. Analysis Plan
   - When to analyze (not before sample size reached)
   - Segments to examine
   - How to handle inconclusive results`;
          },
          noSelection: true
        }
];
