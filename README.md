# Figma AI Chat - AI Agent Instructions

## Purpose

This repository contains **Figma AI Chat**, a Figma/FigJam plugin that brings AI-assisted chat, design review, and canvas automation into the editor.

Use this README as the operating guide for AI coding agents working on the repo. It is intentionally focused on maintenance, architecture, generated files, and safe edit workflows rather than end-user installation copy.

The plugin has three primary user modes:

- **Ask**: chat with AI using selection context, exported CSS/SVG/text, and staged images.
- **Agent**: convert natural-language instructions into Figma/FigJam canvas actions.
- **Audit**: review selected UI for accessibility, spacing, consistency, usability, and practical improvement opportunities.

## Repository Map

- `manifest.json`: Figma plugin manifest. Defines plugin name, editor support, network domains, permissions, `code.js` as the plugin entry, and `ui.html` as the UI bundle.
- `code.ts`: main Figma plugin controller. This is the source of truth for Figma API access, client storage, selection export, command execution, comments, FigJam stickies/connectors, local utility actions, and provider proxy requests.
- `code.js`: generated JavaScript output from TypeScript. Do not edit directly.
- `ui.source.html`: source HTML shell for the plugin UI.
- `ui.css`: source CSS for the plugin UI.
- `ui/`: source JavaScript modules and data used by the plugin UI.
- `ui/main.js`: main UI application module. Handles chat, settings, prompt drawers, quick actions, provider calls, audit flow, attachments, and message handling.
- `ui/state.js`: shared UI constants, default models, non-AI task lists, base image dimensions, and the plugin capability prompt.
- `ui/config/`: task presets, audit presets, style categories, UX guidelines, image presets, chart presets, and other configuration data.
- `ui/features/agent/tasks/`: quick-action task definitions grouped by feature area.
- `ui/features/comments/`: file comment API helpers, drawer UI, and actions.
- `ui/features/stickies/`: FigJam sticky inventory, drawer UI, and actions.
- `ui/features/font-preview/`: Google Fonts preview and pairing helpers.
- `ui/features/font-mapping/`: text range parsing and typography/style application helpers.
- `ui/features/hue-shift/`: interactive color hue shifting and contrast helpers.
- `ui/i18n/`: settings/action translations and exact task-field translations.
- `ui/data/`: bundled glyph/font data used by the UI. Treat these as data assets, not casual edit targets.
- `scripts/build-ui.mjs`: bundles `ui/main.js`, inlines `ui.css`, and writes generated `ui.html`.
- `scripts/fetch-google-fonts-catalog.mjs`: refreshes the slim Google Fonts catalog in `ui/data/`.
- `tools/emit-task-field-translations.mjs`: maintenance tool for regenerating task-field translation data.
- `publish-info.md`: Figma Community listing copy in English, Japanese, and Simplified Chinese.
- `.cursor/rules/build.mdc`: local agent/editor rule reminding maintainers to build after source changes.

## Build And Generated Files

The plugin runs from generated files, but source edits should happen in the split source files.

- Edit `code.ts`, then build to regenerate `code.js`.
- Edit `ui.source.html`, `ui.css`, or `ui/**/*.js`, then build to regenerate `ui.html`.
- Do not edit `code.js` directly.
- Do not edit `ui.html` directly.
- Do not rewrite generated/data files unless the task is explicitly to regenerate or refresh them.

Commands:

```sh
npm run build
npm run build:ui
npm run build:code
npm run watch
npm run lint
```

Command meanings:

- `npm run build`: builds UI first, then compiles plugin TypeScript. Run this after any UI or `code.ts` change.
- `npm run build:ui`: runs `scripts/build-ui.mjs` and writes `ui.html`.
- `npm run build:code`: runs `tsc -p tsconfig.json` and writes `code.js`.
- `npm run watch`: builds once, then watches TypeScript. It does not watch the split UI bundle.
- `npm run lint`: runs ESLint over TypeScript/TSX files.

No build is required for documentation-only changes such as this README.

## How The Plugin Works

`code.ts` shows the UI with `figma.showUI(__html__)`, listens for `figma.ui.onmessage`, calls Figma APIs, and sends structured responses back to the UI with `figma.ui.postMessage`.

The UI posts messages through `parent.postMessage({ pluginMessage })`. Small helpers live in `ui/bridge.js` and `ui/dom.js`, while most application behavior lives in `ui/main.js`.

Important message categories handled by `code.ts` include:

- settings load/save and client-storage persistence
- model/provider selection
- selection context, CSS, SVG, PNG, image, text, style, variable, component, and page exports
- Figma REST-backed comments through a user-provided personal access token
- FigJam sticky scanning and navigation
- local actions such as naming, vertical text, quick detach, shape cleanup, font preview, color inspection, hue shifting, and contrast checks
- image/vector integrations such as stock-image fills and Quiver vector requests
- `execute-commands`, the main bridge for AI-generated canvas actions

The agent command executor supports creation and editing for frames, sections, pages, shapes, SVG nodes, text, components, component sets, instances, fills, strokes, gradients, effects, variables/styles, auto layout, layout grids, constraints, text ranges, hyperlinks, lists, annotations, reactions/prototypes, exports, masks, selection, viewport focus, FigJam stickies, FigJam shapes, and connectors.

Context modes are defined in `ui/config/agent-data.js` and referenced by task definitions. Current public modes include smart, all, minimal, text-only, layout-only, style-only, hierarchy, typography-only, effects-only, and index-only variants. Large selections may fall back to lighter internal context.

## Feature Areas

- **AI providers**: Gemini, OpenAI, Ollama-compatible local endpoints, and Anthropic. Defaults and model lists live in `ui/state.js`; user settings are persisted from `code.ts`.
- **Ask mode**: sends user text, selected design context, staged images, and exported code attachments to the selected provider.
- **Agent mode**: builds quick actions from `ui/features/agent/tasks/`, assembles selection context, asks the model for commands, parses command JSON, and sends it to `execute-commands`.
- **Audit mode**: uses presets from `ui/config/audit-config.js` to generate structured design reviews.
- **Comments**: comment browser, filtering, bookmarks/hidden comments, replies, AI rewrite, solve-comment flows, and summaries.
- **Stickies**: FigJam sticky inventory, search/sort/filter, batch summarize, CSV export, navigation, and chat insertion.
- **Design system**: local styles/variables browsing, component inventory, component property cleanup, token extraction, and design-system output.
- **Images and vectors**: image fill tools, stock image fills, image-to-ASCII, perspective mapping, AI restyle, image generation, icon search/import, and Quiver vector generation.
- **Typography**: Google Fonts preview, font pairing recommendations, font mapping, text links/colors, translation, ruby/furigana, vertical text, and text splitting.
- **Layout and components**: auto-layout conversion, UI creation, section outlines, grids, wrappers, component factories, variants, buttons, cards, dialogs, graph/chart generation, annotations, and prototypes.
- **Internationalization**: settings and action UI strings are localized for English, Japanese, and Simplified Chinese.

## Settings And External Services

Settings are stored with `figma.clientStorage` using keys defined near the top of `code.ts`. When adding settings:

- add a stable key to `SETTINGS_KEYS`
- load it in the `load-settings` message handler
- save it in the relevant save handler
- send it to the UI in the `settings-loaded` payload
- keep defaults aligned with `ui/state.js` when the setting affects provider/model behavior

External services used by the plugin include:

- Gemini API
- OpenAI API
- Anthropic API
- Ollama or other local OpenAI-compatible endpoints
- Google Translate and Google Fonts metadata
- Figma REST API for comments
- Iconify and icon font data
- Quiver vector generation
- Unsplash, Pixabay, Pexels, Picsum, and placeholder image sources

Keep `manifest.json` `networkAccess.allowedDomains` in sync with any new browser-side or plugin-side network endpoint.

## Agent Editing Rules

- Prefer existing patterns. This repo is mostly plain JavaScript UI modules plus a TypeScript Figma controller.
- Keep UI changes in `ui.source.html`, `ui.css`, and `ui/**/*.js`.
- Keep Figma API changes in `code.ts`.
- Preserve the message contract between `ui/main.js` and `code.ts`; update both sides together when adding or changing a message type.
- Keep quick actions in the correct task module under `ui/features/agent/tasks/`.
- Use existing field schema patterns for task drawers: `text`, `textarea`, `select`, `checkbox`, `number`, `slider`, `image`, `row`, and specialized controls already present in nearby tasks.
- If adding visible UI copy, update i18n files when the surrounding area is localized.
- If adding a new provider, model, or external service, update settings, defaults, network access, and any capability text that mentions supported providers.
- If touching generated outputs, explain why. Routine feature work should modify sources and rebuild.
- After UI or `code.ts` edits, run `npm run build` before handing off.

## Common Tasks

Adding a quick action:

1. Choose the matching module in `ui/features/agent/tasks/`.
2. Add the task definition with `name`, `desc`, `prompt` or `promptTemplate`, `fields`, `requiredContext`, and `noSelection` where appropriate.
3. Add an icon mapping in `ui/features/agent/quick-actions.js` if the action needs a custom icon.
4. Add or update exact translations if new drawer labels/placeholders are visible.
5. Build with `npm run build`.

Adding a canvas command:

1. Add the command shape expected by the agent prompt in `ui/main.js`.
2. Add execution support in the `execute-commands` switch in `code.ts`.
3. Resolve nodes using existing `refId`, `nodeId`, created-node, and selection patterns.
4. Return useful progress or error messages through the existing `commands-executed` flow.
5. Build with `npm run build`.

Adding a settings field:

1. Add the storage key in `code.ts`.
2. Load and save it in `code.ts`.
3. Add UI controls and state handling in `ui/main.js` or the relevant UI module.
4. Add translations in `ui/i18n/` if the field is localized.
5. Build with `npm run build`.

Refreshing Google Fonts data:

```sh
node scripts/fetch-google-fonts-catalog.mjs
npm run build
```

Regenerating task-field translations:

```sh
node tools/emit-task-field-translations.mjs
npm run build
```

Preparing publish copy:

- Use `publish-info.md`.
- Keep README focused on maintenance instructions, not marketplace copy.

## Validation Checklist

Before finishing a code change:

- Source files were edited instead of generated artifacts.
- `npm run build` was run after UI or `code.ts` changes.
- The plugin message contract still matches on both UI and controller sides.
- New network endpoints are reflected in `manifest.json`.
- New settings are loaded, saved, defaulted, and sent to the UI.
- New visible UI copy is localized where the surrounding UI is localized.
- Quick actions have sensible context requirements and no-selection behavior.
- Local actions that do not require AI remain compatible with AI-off mode when appropriate.
- Documentation-only changes do not require a build.
