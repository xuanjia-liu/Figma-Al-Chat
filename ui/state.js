export const INITIAL_BOT_MESSAGE_HTML = `
          <div class="message bot">
            <div class="message-content initial-message">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="none" viewBox="0 0 24 24">
                <path class="initial-message-star-large" fill="currentColor"
                  d="M9.107 5.448c.598-1.75 3.016-1.803 3.725-.159l.06.16.807 2.36a4 4 0 0 0 2.276 2.411l.217.081 2.36.806c1.75.598 1.803 3.016.16 3.725l-.16.06-2.36.807a4 4 0 0 0-2.412 2.276l-.08.216-.807 2.361c-.598 1.75-3.016 1.803-3.724.16l-.062-.16-.806-2.36a4 4 0 0 0-2.276-2.412l-.216-.081-2.36-.806c-1.75-.598-1.804-3.016-.16-3.724l.16-.062 2.36-.806A4 4 0 0 0 8.22 8.025l.081-.216.806-2.361ZM11 6.094l-.806 2.36a6 6 0 0 1-3.49 3.649l-.25.091-2.36.806 2.36.806a5.999 5.999 0 0 1 3.65 3.49l.09.25.806 2.36.806-2.36a6 6 0 0 1 3.49-3.649l.25-.09 2.36-.807-2.36-.806a6 6 0 0 1-3.649-3.49l-.09-.25L11 6.094Z" />
                <path class="initial-message-star-small" fill="currentColor"
                  d="M19 2a1 1 0 0 1 .898.56l.048.117.35 1.026 1.027.35a1 1 0 0 1 .118 1.845l-.118.048-1.026.35-.35 1.027a1 1 0 0 1-1.845.117l-.048-.117-.35-1.026-1.027-.35a1 1 0 0 1-.118-1.845l.118-.048 1.026-.35.35-1.027A1 1 0 0 1 19 2Z" />
              </svg>
              <span class="initial-message-title" data-i18n="settings.chat.initialMessageTitle">Hello! I'm your Figma AI assistant.</span>
              <span class="initial-message-body" data-i18n="settings.chat.initialMessageBody">Select Figma elements and ask a question, or just type directly.</span>
            </div>
          </div>
        `;

export const DEFAULT_GEMINI_CHAT_MODEL = 'gemini-3-flash-preview';
export const DEFAULT_GEMINI_TITLE_MODEL = 'gemini-3.1-flash-lite-preview';
export const DEFAULT_OPENAI_CHAT_MODEL = 'gpt-5';
export const DEFAULT_OLLAMA_CHAT_MODEL = 'llama3.2';
export const DEFAULT_OLLAMA_API_BASE = 'http://localhost:11434/v1';

export const DEFAULT_GEMINI_MODELS = [
  { id: DEFAULT_GEMINI_TITLE_MODEL, displayName: 'Gemini 3.1 Flash Lite Preview' },
  { id: DEFAULT_GEMINI_CHAT_MODEL, displayName: 'Gemini 3 Flash Preview' }
];

export const DEFAULT_IMAGE_MODELS = [
  { id: 'imagen-4.0-fast-generate-001', displayName: 'Imagen 4 Fast', description: 'Ultra-fast image generation' },
  { id: 'imagen-4.0-generate-001', displayName: 'Imagen 4 (Balanced)', description: 'High quality image generation' },
  { id: 'imagen-3.0-generate-002', displayName: 'Imagen 3 (Balanced)', description: 'High quality image generation' },
  { id: 'imagen-3.0-fast-generate-001', displayName: 'Imagen 3 Fast', description: 'Fast image generation' }
];

export const DEFAULT_OPENAI_MODELS = [
  { id: 'gpt-5-nano', displayName: 'GPT-5 Nano' },
  { id: DEFAULT_OPENAI_CHAT_MODEL, displayName: 'GPT-5' }
];

export const DEFAULT_OLLAMA_MODELS = [
  { id: DEFAULT_OLLAMA_CHAT_MODEL, displayName: 'Llama 3.2' }
];

export const DEFAULT_ANTHROPIC_MODELS = [
  { id: 'claude-3-5-sonnet-20241022', displayName: 'Claude 3.5 Sonnet' },
  { id: 'claude-3-5-haiku-20241022', displayName: 'Claude 3.5 Haiku (Fast)' },
  { id: 'claude-3-opus-20240229', displayName: 'Claude 3 Opus (Advanced)' }
];

export const NON_AI_DIRECT_ACTIONS = new Set([
  'addProperty',
  'swapColors',
  'removeAllEffects',
  'textLinkColor',
  'removeUnusedProperties',
  'createIcon',
  'browseIconSet',
  'createGridLines',
  'placeholderSet',
  'createAdvancedGrid',
  'turnIntoComponentSet',
  'createButtonComponentSet',
  'duplicateWithInstructions',
  'randomizeSelectedInstances',
  'flattenStructure',
  'easyWrapper',
  'extractDesignSystem',
  'setImageFillFromSelection',
  'fillFromOnlineImage',
  'imageToAscii',
  'listAllComments',
  'listAllComponents',
  'listAllStickies',
  'browseStyles',
  'googleFontPreview',
  'splitTextLocal'
]);

export const NON_AI_LOCAL_TASKS = new Set([
  'Smart rename',
  'Sequential naming',
  'Prefix/Suffix (smart)',
  'Clean up names',
  'Format sequencer',
  'Add prefix/suffix',
  'Vertical text'
]);

export const COMMENTS_CACHE_TTL = 60000;
export const STICKIES_CACHE_TTL = 60000;
export const MAX_CHAT_ARCHIVES = 30;

export const ASK_BACK_GUIDANCE = `\n\nFOLLOW-UP FORMAT:\nIf you need more information or want the user to pick from options, respond with:\n[ASK_USER_BACK]\n\`\`\`json\n{\"question\":\"<your question>\",\"options\":[\"option A\",\"option B\"],\"type\":\"list|grid\"}\n\`\`\`\nUse type:"grid" for icons/visual choices, "list" (default) for text. Omit explanatory text besides the question/options.`;

export const PLUGIN_SYSTEM_PROMPT = `You are a helpful AI assistant integrated into a Figma plugin called "Figma AI Chat". Use this capabilities reference ONLY when the user asks what you/plugin can do (capabilities, skills, features). For all other questions, answer normally and do not deflect. When sharing capabilities, respond in the user's language.

Plugin capabilities:

**Ask Mode (Chat + Vision):**
- General design/UX/Figma Q&A; explain principles and best practices
- Analyze exported selection data (CSS/structure/JSON) and staged/pasted images or PNGs
- Provide design feedback, color/typography/layout guidance, token suggestions
- Works with Gemini, OpenAI, Ollama (local), and Anthropic models; supports model selection

**Agent Mode (Figma actions):**
- Create/edit shapes, frames, sections, pages, text, auto-layout containers, and button components
- Generate icons/graphics via inline SVG; create/apply images and masks
- Style with paint/text/effect styles, gradients, strokes, blend/opacity; manage variables/design tokens
- Layout and structure: constraints, auto-layout, layout grids, alignment/distribution, reparenting, z-order, export settings
- Text ops: hyperlinks, lists, fills, typography tweaks, translation, ruby/furigana, split text (preserves formatting/styles)
- Components and prototyping: components/instances, reactions, annotations
- Boolean ops; group/ungroup/duplicate/delete/flatten
- FigJam: stickies, connectors, shapes with text

**Audit Mode (Design review):**
- Inspect selected elements for accessibility (contrast/touch), spacing, color/typography consistency, usability issues, and improvement suggestions

**Export & context capture:**
- One-click export CSS (classes/inline/Tailwind), SVG, text content, and PNG snapshots of selection
- Stage multiple exported images or local uploads for vision analysis
- Send rich selection metadata (geometry, styles, text, gradients, variables/tokens) for context

Answer capability questions with the above (in the user's language); otherwise respond normally.`;

export const FIGMA_MAX_IMAGE_DIMENSION = 2048;

export const baseImageDimensions = {
  '1:1': { w: 1024, h: 1024 },
  '16:9': { w: 1408, h: 792 },
  '9:16': { w: 792, h: 1408 },
  '4:3': { w: 1152, h: 864 },
  '3:4': { w: 864, h: 1152 },
  '2:3': { w: 832, h: 1248 },
  '3:2': { w: 1248, h: 832 },
  '4:5': { w: 896, h: 1120 },
  '5:4': { w: 1120, h: 896 },
  '21:9': { w: 1568, h: 672 },
  '4:1': { w: 1536, h: 384 },
  '1:4': { w: 384, h: 1536 },
  '8:1': { w: 1792, h: 224 },
  '1:8': { w: 224, h: 1792 }
};
