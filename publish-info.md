# Figma Community — publish copy (EN / JA / ZH)

Use this file when filling in the plugin listing. Field labels below mirror the publish form (`*` = required).

---

## Name *

| Language | Text |
| -------- | ---- |
| **English** | Figma AI Chat |
| **Japanese** | Figma AI Chat |
| **Chinese (Simplified)** | Figma AI Chat |

*Plugin display name is usually kept in English for consistency with the in-editor name; localize only if your listing strategy requires it.*

---

## Tagline *

*Figma hint: Describe your plugin in a few words (max 100 characters).*

| Language | Text | Char note |
| -------- | ---- | --------- |
| **English** | Chat with AI inside Figma—get design help, analyze selections, and run canvas actions. | ≤100 |
| **Japanese** | Figma内でAIとチャット。デザイン相談、選択の分析、キャンバス操作まで。 | ≤100 |
| **Chinese (Simplified)** | 在 Figma 内与 AI 对话：设计问答、分析选区、执行画布操作。 | ≤100 |

**Alternate shorter lines (if you need to trim):**

- **EN:** AI assistant in Figma: chat, vision on exports, and agent mode for edits.
- **JA:** Figma上のAIアシスタント。チャット・画像解析・エージェント編集。
- **ZH:** Figma 内的 AI 助手：对话、图像理解、智能编辑。

---

## Description *

*Figma hint: What can people find or learn from this file? Get specific, so the community knows what to expect.*

### English

**Figma AI Chat** brings large language models into Figma and FigJam so you can stay in context while you design.

**What you can do**

- **Ask mode — chat and vision:** Ask design and UX questions, get feedback on layout, color, and typography, and analyze your selection (structure, styles, text). Paste or stage images and PNG snapshots for vision-capable models. Works with your own API keys for **Google Gemini**, **OpenAI**, and **Anthropic**, with model selection.
- **Agent mode:** Describe changes in natural language; the plugin can create and edit frames, text, auto layout, components, styles, variables, icons (including SVG), images, and more—including **FigJam** stickies and connectors.
- **Audit mode:** Review selected UI for accessibility (e.g. contrast), spacing, consistency, and practical improvements.
- **Export and context:** Export CSS (including Tailwind-oriented options), SVG, text, and snapshots to feed the model rich context from your file.

**What to expect**

- You’ll need to add an API key in the plugin settings (the plugin calls the providers you configure).
- Features depend on the model you choose (e.g. vision where the model supports it).

---

### Japanese

**Figma AI Chat** は、Figma / FigJam 上で大規模言語モデルを使い、作業コンテキストを切らずに相談・実行できるプラグインです。

**できること**

- **Ask（チャット／ビジョン）:** デザイン・UX の質問、レイアウト・カラー・タイポのフィードバック、選択範囲（構造・スタイル・テキスト）の分析。画像やPNGの貼り付け・ステージングでビジョン対応モデルと連携。**Google Gemini**、**OpenAI**、**Anthropic** の API キー（ユーザー設定）とモデル選択に対応。
- **Agent:** 自然言語で指示し、フレーム・テキスト・オートレイアウト・コンポーネント・スタイル・変数・アイコン（SVG 含む）・画像などの作成・編集。**FigJam** の付箋やコネクタにも対応。
- **Audit:** 選択 UI のアクセシビリティ（コントラストなど）、余白、一貫性、改善提案のレビュー。
- **エクスポートと文脈:** CSS（Tailwind 向けオプション含む）、SVG、テキスト、スナップショットの出力で、ファイルからリッチなコンテキストをモデルに渡せます。

**利用時の注意**

- プラグイン設定で API キーの設定が必要です（設定したプロバイダへリクエストします）。
- 利用できる機能は選んだモデルに依存します（ビジョンはモデル対応時）。

---

### Chinese (Simplified)

**Figma AI Chat** 在 Figma 与 FigJam 中接入大语言模型，让你在设计流程里就地提问与操作，无需离开画布。

**你能做什么**

- **Ask（对话 / 视觉）：** 设计、UX 问答；版式、色彩、字体反馈；分析当前选中内容（结构、样式、文字）。可粘贴或暂存图片与 PNG 截图，由支持视觉的模型理解。使用你自行配置的 **Google Gemini**、**OpenAI**、**Anthropic** API 密钥，并可选择模型。
- **Agent：** 用自然语言描述需求，插件可创建与编辑画板、文本、自动布局、组件、样式、变量、图标（含 SVG）、图片等，并支持 **FigJam** 便利贴与连接线。
- **Audit：** 对选中界面做可访问性（如对比度）、间距、一致性等方面的检查与改进建议。
- **导出与上下文：** 导出 CSS（含面向 Tailwind 的选项）、SVG、文本与截图，把文件中的信息更完整地交给模型。

**使用前请知悉**

- 需在插件设置中配置 API 密钥（插件会向你配置的供应商发起请求）。
- 具体能力取决于所选模型（例如视觉能力需模型支持）。

---

## Key quick actions (detailed)

Agent mode includes one-tap **quick actions** (grouped by category). Below are deeper descriptions for some of the most used ones, in **English**, **Japanese**, and **Chinese (Simplified)**.

### English

#### List All Comments

Opens a **file-wide comment browser** so you can see and work with feedback without hunting on the canvas. No selection is required. You get a structured list of comments in the plugin UI to **review and manage** discussion on the current file.

#### Generate image

Creates **new images from a text prompt** using configured **image generation models** (for example Gemini image preview or **Google Imagen** variants—options depend on your setup and API access). You can set **subject/content** and **style/direction**, optionally add a **reference image**, choose **aspect ratio**, **resolution** (e.g. up to 4K where supported), **multiple variations**, and a **thinking level** tradeoff for quality vs speed. If something is selected, you can optionally **apply the result to the selected node** as a fill. Image generation uses your **own API credentials** as configured in settings.

#### Create icon

Turns a short **concept or description** into an icon on the canvas. The plugin searches **Iconify** (with optional **AntV Infographic** or **icon font** sources), respects your chosen **size in pixels**, and can **show search results in a drawer** for picking a match. If no suitable asset is found, you can enable **AI-generated SVG fallback** so the model produces a vector icon instead (with configurable stroke weight for that path).

#### Import icon sets

Browse **standard icon sets** and **import many icons at once** as frames, separate components, or a **component set**, with control over **size** and **color**.

#### Re-style

Takes a **reference image** and **re-styles** it with AI (custom prompt and optional **style presets**), with similar controls to Generate image: aspect ratio, resolution, variations, model choice, optional **apply to selection**, and **3D camera-style** controls where available.

#### Solve Comment & Summarize Comments

**Solve Comment** uses your **current selection**: the AI finds **comments attached to those nodes** and applies edits to address the feedback, with a summary in the **same language as the comments** when possible. **Summarize Comments** (Ask-style flow) produces an **AI summary** of comments—either **across the whole file** or **only on selected nodes**—useful for triage and standups.

#### Apply Auto Layout

With a **layout-relevant selection**, the AI **converts the selection into auto layout**, inferring nesting, spacing, and padding from how elements are arranged.

#### Direct UI Creation

From **screen type** and **platform** (Web, iOS, Android) plus **preset frame sizes**, the agent **builds a hierarchical UI** on the canvas, using your file’s **design tokens** when included for consistency.

#### Generate Vector

Creates **SVG-style vector artwork** from a text description (and optional reference image), with multiple **variations**, via the plugin’s **vector generation** integration (e.g. Quiver—per your configuration).

---

### Japanese

#### すべてのコメントを表示（List All Comments）

キャンバス上を探し回らず、**ファイル内のコメントを一覧**できるビューを開きます。選択は不要で、プラグイン内でコメントを**確認・整理**しやすくします。

#### 画像生成（Generate image）

**テキストプロンプトから画像を生成**します。利用する**画像生成モデル**（例: Gemini 画像プレビュー、**Imagen** 系など）は設定と API に依存します。**被写体／内容**と**スタイル・演出**、任意の**参照画像**、**アスペクト比**、**解像度**（対応時は 4K など）、**バリエーション数**、品質と速度の**思考レベル**を指定できます。選択がある場合は、生成結果を**選択ノードに適用**するオプションもあります。画像生成には**ユーザーが設定した API キー**が必要です。

#### アイコン作成（Create icon）

**コンセプトや説明**からアイコンをキャンバスに配置します。**Iconify** を基本に、**AntV Infographic** や **アイコンフォント** などソースを選べ、**ピクセルサイズ**を指定可能です。**検索結果をドロワーで表示**し、候補から選べます。見つからない場合は **AI による SVG フォールバック**（線の太さ調整可）でベクターアイコンを生成できます。

#### アイコンセットのインポート（Import icon sets）

**標準的なアイコンセット**を閲覧し、**複数アイコンを一括インポート**します。フレーム、複数コンポーネント、**コンポーネントセット**として取り込み、**サイズ**と**色**を指定できます。

#### Re-style

**参照画像**を基に、AI で**スタイル変換・再スタイル**します。カスタムプロンプトや**プリセット**、アスペクト比・解像度・バリエーション・モデル選択、任意の**選択への適用**、利用可能な場合は**3D カメラ風**の調整に対応します。

#### コメントの解決・要約（Solve Comment / Summarize Comments）

**Solve Comment** は**選択範囲**に紐づくコメントを AI が読み、フィードバックに沿って**修正を実行**します。要約は**コメントと同じ言語**になるよう配慮されます。**Summarize Comments** は、**ファイル全体**または**選択ノード上**のコメントを AI が**要約**します（整理・共有に便利）。

#### オートレイアウトの適用（Apply Auto Layout）

**レイアウトとして意味のある選択**に対し、配置関係から**オートレイアウト化**し、ネストや余白・ギャップを推論します。

#### Direct UI Creation

**画面タイプ**と**プラットフォーム**（Web / iOS / Android）、**プリセットのフレームサイズ**から、キャンバス上に**階層的な UI** を生成します。**デザイントークン**を文脈に含めると一貫性を保ちやすくなります。

#### Generate Vector

テキスト（と任意の参照画像）から **SVG 的なベクター**を生成し、**複数バリエーション**を選べます（**Quiver** など、設定によるベクター生成フロー）。

---

### Chinese (Simplified)

#### 列出全部评论（List All Comments）

在插件内打开**全文件评论浏览**，不必在画布上逐条查找。无需选区，便于**查看与处理**当前文件上的讨论。

#### 生成图片（Generate image）

用**文字描述生成新图像**。具体**图像模型**（如 Gemini 图像预览、**Imagen** 系列等）取决于你的配置与 API。可填写**主体/内容**与**风格/方向**，可选**参考图**，并设置**宽高比**、**分辨率**（在支持范围内可到更高如 4K）、**出图数量**、以及偏重速度或质量的**思考级别**。有选中图层时，可将结果**应用到选中节点**。图像能力依赖你在设置中配置的 **API 密钥**。

#### 创建图标（Create icon）

根据**概念或简短描述**在画布上放置图标。默认检索 **Iconify**，也可选 **AntV 信息图**或**图标字体**等来源，并指定**像素尺寸**。可**在抽屉中展示搜索结果**以便挑选；若无匹配，可开启 **AI 生成 SVG 备用方案**（并可调节描边粗细）。

#### 导入图标集（Import icon sets）

浏览**标准图标库**，**批量导入**图标，支持导入为画框、多个组件或**组件集**，并可设**尺寸**与**颜色**。

#### Re-style

基于**参考图**，用 AI **改风格 / 重绘样式**；支持自定义提示与**风格预设**，以及宽高比、分辨率、张数、模型、可选**应用到选中图层**，在可用时还有**类 3D 镜头**调节。

#### 解决评论与评论摘要（Solve Comment / Summarize Comments）

**Solve Comment** 针对**当前选中**节点上的评论，由 AI **分析并改稿**以回应反馈；总结会尽量与**评论语言**一致。**Summarize Comments** 可对**整文件**或**仅选中节点上的评论**做 AI **摘要**，适合排期与同步。

#### 应用自动布局（Apply Auto Layout）

在**适合作为布局的选区**上，根据相对位置推断**自动布局**、嵌套结构与间距。

#### Direct UI Creation

按**界面类型**、**平台**（Web / iOS / Android）与**预设画板尺寸**，在画布上**生成层级化界面**；带入**设计变量/令牌**时更易与现有体系统一。

#### Generate Vector

根据文字（及可选参考图）生成 **SVG 类矢量**，可选多组**变体**；通过插件配置的矢量生成能力（如 **Quiver**）完成。

---

## Quick copy-paste blocks

**English — Tagline**

```
Chat with AI inside Figma—get design help, analyze selections, and run canvas actions.
```

**English — Description**

```
Figma AI Chat brings large language models into Figma and FigJam so you can stay in context while you design.

Ask mode: design/UX Q&A, feedback on layout/color/type, selection analysis, and vision on pasted or staged images. Use your API keys for Google Gemini, OpenAI, and Anthropic.

Agent mode: natural-language creation and editing of frames, text, auto layout, components, styles, variables, SVG/icons, images, and FigJam stickies/connectors.

Audit mode: accessibility, spacing, and consistency checks on selections.

Export CSS/SVG/text/snapshots to give models rich file context. You configure API keys in settings; capabilities depend on the model you pick.
```

**Japanese — Tagline**

```
Figma内でAIとチャット。デザイン相談、選択の分析、キャンバス操作まで。
```

**Japanese — Description**

```
Figma / FigJam 上で LLM を使い、デザイン中にその場で相談・実行できるプラグインです。

Ask：デザイン・UX の質問、フィードバック、選択の分析、画像・PNG のビジョン解析。Gemini / OpenAI / Anthropic の API キーとモデル選択。

Agent：自然言語でのフレーム・テキスト・オートレイアウト・コンポーネント・スタイル・変数・SVG・画像などの作成・編集、FigJam 対応。

Audit：選択 UI の a11y・余白・一貫性のレビュー。CSS/SVG/テキスト/スナップショットで文脈を渡せます。API キーは設定が必要で、機能はモデル依存です。
```

**Chinese (Simplified) — Tagline**

```
在 Figma 内与 AI 对话：设计问答、分析选区、执行画布操作。
```

**Chinese (Simplified) — Description**

```
在 Figma 与 FigJam 中接入大语言模型，就地完成咨询与操作。

Ask：设计/UX 问答、版式与视觉反馈、选中内容分析、图片与截图的视觉理解；支持 Gemini、OpenAI、Anthropic 的 API 密钥与模型选择。

Agent：用自然语言创建/编辑画板、文本、自动布局、组件、样式、变量、SVG/图标、图片等，并支持 FigJam。

Audit：对选中界面做可访问性、间距与一致性检查。可导出 CSS/SVG/文本/截图丰富上下文。需在设置中配置 API 密钥，能力随模型而异。
```

**English — Key quick actions (short, for listing body)**

```
Key quick actions (examples):
• List All Comments — Browse every file comment in the plugin; manage feedback without scanning the canvas.
• Generate image — Text-to-image with optional reference, aspect ratio, resolution, variations, and models such as Gemini / Imagen (per your API setup); optional apply to selection.
• Create icon — Search Iconify (or AntV / icon fonts), pick from drawer results, optional AI SVG fallback.
• Import icon sets — Batch import as frames, components, or a component set.
• Re-style — AI restyle from a reference image with presets and export options.
• Solve Comment / Summarize Comments — AI fixes feedback on selected nodes, or summarizes all vs selection-scoped comments.
• Apply Auto Layout, Direct UI Creation, Generate Vector — Smarter layout, full screens from platform presets, and SVG generation (e.g. Quiver).
```

**Japanese — Key quick actions (short)**

```
主なクイックアクション例:
• すべてのコメントを表示 — ファイル内コメントをプラグインで一覧・管理。
• 画像生成 — プロンプト＋任意参照、比率・解像度・バリエーション、Gemini/Imagen 等（API 設定次第）。選択への適用可。
• アイコン作成 — Iconify 等を検索、ドロワーで選択、未ヒット時は AI の SVG フォールバック。
• アイコンセットのインポート — フレーム／コンポーネント／セットで一括取り込み。
• Re-style — 参照画像から AI で再スタイル。
• コメント解決／要約 — 選択に紐づく修正、またはファイル全体／選択範囲の要約。
• オートレイアウト適用、Direct UI Creation、Generate Vector — レイアウト化、プラットフォーム別 UI 生成、ベクター生成。
```

**Chinese (Simplified) — Key quick actions (short)**

```
部分快捷操作示例:
• 列出全部评论 — 在插件内浏览全文件评论，便于处理反馈。
• 生成图片 — 文生图，可选参考图、比例、分辨率、张数；模型如 Gemini/Imagen（视 API 配置）；可应用到选中图层。
• 创建图标 — Iconify 等检索、抽屉选图，无结果可用 AI 生成 SVG。
• 导入图标集 — 批量导入为画框、组件或组件集。
• Re-style — 参考图 AI 改风格。
• 解决评论 / 评论摘要 — 针对选中图层落实反馈，或整文件/仅选区评论摘要。
• 应用自动布局、Direct UI Creation、Generate Vector — 智能布局、按平台生成界面、矢量生成。
```
