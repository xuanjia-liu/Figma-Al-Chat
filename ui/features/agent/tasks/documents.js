import { ContextMode } from '../../../config/agent-data.js';

export const documentTasks = [
{
          name: 'Design proposal deck',
          desc: 'Create a persuasive design proposal for a client',
          icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></svg>',
          askMode: true,
          requiredContext: ContextMode.ALL,
          fields: [
            { key: 'designType', type: 'text', label: 'Design type', placeholder: 'Corporate website redesign', default: 'Corporate website redesign' },
            { key: 'clientName', type: 'text', label: 'Client name', placeholder: 'Design OK Inc.', default: 'Design OK Inc.' },
            { key: 'purpose', type: 'text', label: 'Project goal', placeholder: 'Improve brand perception and usability', default: 'Improve brand perception and usability' },
            { key: 'targetAudience', type: 'text', label: 'Target audience', placeholder: 'Business professionals in their 30s to 50s', default: 'Business professionals in their 30s to 50s' }
          ],
          promptTemplate: function (values) {
            return `# 前提条件:
- タイトル: デザイン提案書の作成
- 依頼者条件: クライアントに対してデザイン提案を効果的に伝えたい人
- 制作者条件: デザインのコンセプト立案や資料作成に長けたデザイナー
- 目的と目標: クライアントに対して視覚的に分かりやすく、説得力のあるデザイン提案書を作成し、合意形成をスムーズに進めること

# 実行指示:
${values.designType || '企業のコーポレートサイトのリニューアル'}のデザイン提案書を作成してください。
クライアントは${values.clientName || '株式会社デザインOK'}で、目的は${values.purpose || 'ブランドイメージの向上とユーザーの利便性向上'}です。
ターゲット層は${values.targetAudience || '30〜50代のビジネスパーソン'}です。
クライアントにわかりやすく伝わるように構成してください。
クライアントに納得してもらいやすいように、論理的かつ説得力のある内容にしてください。

デザインの種類=“
${values.designType || '企業のコーポレートサイトのリニューアル'}
“

クライアント名=“
${values.clientName || '株式会社デザインOK'}
“

デザインの目的=“
${values.purpose || 'ブランドイメージの向上とユーザーの利便性向上'}
“

ターゲット層=“
${values.targetAudience || '30〜50代のビジネスパーソン'}
“

# 出力フォーマット:
## [デザインの種類]のご提案

### 1. プロジェクト概要
| クライアント名 | [クライアント名] |
| プロジェクト名 | [デザイン種類] |
| 目的 | [デザインの目的] |

### 2. ターゲット分析
ターゲット層 : [ターゲット層]
課題 : 
解決策 : 

### 3. デザインコンセプト
コンセプトキーワード : 
- 
- 
- 
- 
デザインの方向性 : 
- 
- 
- 
- 

### 4. カラーパレットとフォント
- [メインカラー] → [メインカラーの意味]
- [アクセントカラー] → [アクセントカラーの意味]
- フォント選定
- 見出し [見出しフォント] → [見出しフォントの意味]
- 本文 [本文フォント] → [本文フォントの意味]

### 5. デザイン案の説明
- 
- 
- 
- 

### 6. 期待できる効果
- 
- 
- 
- 

### 7. スケジュールと納品形式
| フェーズ | タスク | 期間 |  
|----|------|----|  
| 1 | [フェーズ1] | [フェーズ1期間] |  
| 2 | [フェーズ2] | [フェーズ2期間] |  
| 3 | [フェーズ3] | [フェーズ3期間] |  
| 4 | [フェーズ4] | [フェーズ4期間] |
| 5 | [フェーズ5] | [フェーズ5期間] |

納品形式 : 

### 8. 予算と追加オプション  
- 基本プラン： ¥[基本プラン料金]（[基本プラン内容]）  
- オプション（[オプション名]）：¥[オプション料金]

# 補足
- 指示の復唱はしないてください。
- 自己評価はしないでください。
- 結論やまとめは書かないください。`;
          },
          noSelection: true
        },
{
          name: 'Character naming ideas',
          desc: 'Suggest memorable names that fit the character',
          icon: '<svg viewBox="0 0 24 24" fill="none"><path stroke="currentColor" stroke-width="2" d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10Z"/><path stroke="currentColor" stroke-width="2" d="M8 14s1.5 2 4 2 4-2 4-2"/><path stroke="currentColor" stroke-linecap="square" stroke-width="2" d="M9 9h0m6 0h0"/></svg>',
          askMode: true,
          requiredContext: ContextMode.ALL,
          fields: [
            { key: 'charSummary', type: 'text', label: 'Character summary', placeholder: 'A young mage girl in a fantasy world', default: 'A young mage girl in a fantasy world' },
            { key: 'sound', type: 'text', label: 'Name style', placeholder: 'Japanese-inspired', default: 'Japanese-inspired' },
            { key: 'targetAudience', type: 'text', label: 'Target audience', placeholder: 'Teenagers', default: 'Teenagers' }
          ],
          promptTemplate: function (values) {
            return `# 前提条件:
- タイトル: キャラクターのネーミング案作成
- 依頼者条件: キャラクターの魅力を最大限に引き出す名前を考えたい人
- 制作者条件: 言葉の響きや意味を考慮し、キャラクターに合ったネーミングを提案できる人
- 目的と目標: キャラクターの個性や設定にマッチした、印象的で覚えやすいネーミングを作成する

# 実行指示:
${values.charSummary || 'ファンタジー世界の魔法使いの女の子'}のネーミング案を考えてください。名前の響きは${values.sound || '和風'}で、ターゲットは${values.targetAudience || '10代'}です。3〜5案ほど提案してください。

キャラクターの概要=“
${values.charSummary || 'ファンタジー世界の魔法使いの女の子'}
“

名前の響き=“
${values.sound || '和風'}
“

ターゲット層=“
${values.targetAudience || '10代'}
“

# 出力フォーマット:
1.
2.
3.
4.
5.

# 補足：
- 指示の復唱はしないでください。
- 自己評価はしないでください。
- 結論やまとめは書かないでください。
- [# 出力フォーマット]のフォーマット形式を厳守してください。`;
          },
          noSelection: true
        },
{
          name: 'Designer portfolio bio',
          desc: 'Write a compelling self-introduction for a designer portfolio',
          icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
          askMode: true,
          requiredContext: ContextMode.ALL,
          fields: [
            { key: 'name', type: 'text', label: 'Name (or handle)', placeholder: 'Your name', default: 'Your name' },
            { key: 'exp', type: 'text', label: 'Years of design experience', placeholder: '15 years in design, 3 years freelance, etc.', default: '15 years in design, 3 years freelance' },
            { key: 'job', type: 'text', label: 'Role', placeholder: 'Graphic designer / UI designer / Illustrator, etc.', default: 'Graphic designer / UI designer / Illustrator' },
            { key: 'specialty', type: 'text', label: 'Specialties', placeholder: 'Logo design / Packaging / Web design, etc.', default: 'Logo design / Packaging / Web design' },
            { key: 'tools', type: 'text', label: 'Tools used', placeholder: 'Photoshop / Illustrator / Figma / Procreate, etc.', default: 'Photoshop / Illustrator / Figma / Procreate' }
          ],
          promptTemplate: function (values) {
            return `# 前提条件:
- タイトル: デザイナーポートフォリオ用の自己紹介文作成
- 依頼者条件: ポートフォリオを通じて案件獲得を目指すデザイナー。
- 制作者条件: 効果的な自己紹介文を作成できる文章力とデザイン業界の知識を持つ人。
- 目的と目標: ポートフォリオに適した魅力的な自己紹介文を作成し、デザイナーとしての強みを明確に伝えることで案件獲得の可能性を高める。

# 実行指示:
デザイナーポートフォリオ用の自己紹介文を作成してください。名前は${values.name || '名前'}、デザイナー歴は${values.exp || 'デザイン歴15年'}、職種は${values.job || 'グラフィックデザイナー'}で、得意分野は${values.specialty || 'ロゴデザイン'}です。使用できるツールは${values.tools || 'Figma'}です。親しみやすいが信頼感のある文章にしてください。

名前(ハンドルネーム可)=“
${values.name || '名前'}
“

デザイナー歴=“
${values.exp || 'デザイン歴15年'}
“

職種=“
${values.job || 'UIデザイナー'}
“

得意分野=“
${values.specialty || 'Webデザイン'}
“

使用ツール=“
${values.tools || 'Figma'}
“

クライアントが分かりやすいように、記述欄を適宜入れてください。

# 出力フォーマット:
## はじめまして、[職種]の[名前(ハンドルネーム可)]です。
デザイン歴[デザイン歴]です。

### 【得意分野】
- 
- 
- 
- 

### 【使用ツール】
- 
- 
- 
- 

#補足:
- 指示の再確認は不要です。`;
          },
          noSelection: true
        },
{
          name: 'Design project intake sheet',
          desc: 'Create a client questionnaire for a design request',
          icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M12 11h4"/><path d="M12 16h4"/><path d="M8 11h.01"/><path d="M8 16h.01"/></svg>',
          askMode: true,
          requiredContext: ContextMode.ALL,
          fields: [
            { key: 'projectContent', type: 'text', label: 'Project type', placeholder: 'Logo / Website / Flyer / Packaging, etc.', default: 'Logo / Website / Flyer / Packaging' }
          ],
          promptTemplate: function (values) {
            return `# 前提条件:
- タイトル: デザイン依頼のヒアリングシート作成
- 依頼者条件: クライアントからデザインの依頼を受ける際に、円滑なヒアリングを行いたいデザイナーやディレクター。
- 制作者条件: クライアントの要望を整理し、効果的なヒアリングシートを作成できるデザイナーまたはディレクター。
- 目的と目標: クライアントの要望や課題を明確にし、スムーズなデザイン制作を実現するためのヒアリングシートを作成する。

# 実行指示:
${values.projectContent || 'ロゴ/ウェブサイト/チラシ/パッケージ'}のデザイン依頼に関するヒアリングシートを作成してください。以下は必ず含めてください。

- クライアントの基本情報（会社名、担当者名、連絡先など）
- デザインの目的（何のために必要か）
- ターゲット層（性別、年齢、趣味・嗜好など）
- 希望するデザインの方向性（例：シンプル、かわいい、スタイリッシュ など）
- 使用するカラーやフォントの希望
- 参考にしたいデザイン例（URLや画像の指定）
- 納期や予算
- 納品形式（AI, PSD, PNG, PDF など）
- その他特記事項（制約、使用シーンなど）

クライアントが答えやすいように、選択肢や記述欄を適宜入れてください。

案件内容=“
${values.projectContent || 'ロゴ/ウェブサイト/チラシ/パッケージ'}
“

# 出力フォーマット:
## [案件内容]に対するヒアリングシート

# 補足:
- 指示の復唱はしないでください。
- 自己評価はしないでください。
- 結論やまとめは書かないでください。`;
          },
          noSelection: true
        },
{
          name: 'Project schedule / timeline',
          desc: 'Create a project schedule or timeline in table format',
          icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M3 15h18"/><path d="M9 3v18"/><path d="M15 3v18"/></svg>',
          askMode: true,
          requiredContext: ContextMode.ALL,
          fields: [
            { key: 'projectTitle', type: 'text', label: 'Project name', placeholder: 'Website redesign', default: 'Website redesign' },
            { key: 'duration', type: 'text', label: 'Duration', placeholder: '3 months', default: '3 months' },
            { key: 'phases', type: 'text', label: 'Main phases', placeholder: 'Requirements, design, development, testing', default: 'Requirements, design, development, testing' }
          ],
          promptTemplate: function (values) {
            return `# プロジェクトスケジュール作成依頼

以下の内容でプロジェクトの工程表（スケジュール）を作成してください。

- プロジェクト名: ${values.projectTitle}
- 期間: ${values.duration}
- 主なフェーズ: ${values.phases}

## 出力指示
1. まず、各フェーズの具体的なタスクと日程感を検討してください。
2. その後、作成した工程表をMarkdownのテーブル形式を使用して、分かりやすくチャット内に作成してください。
3. テーブルの構成:
   - 列: フェーズ、タスク内容、担当、期間、備考
4. 全体のサマリーをチャットで説明してください。
5. 指示の復唱はしないでください。
6. 自己評価はしないでください。
7. 結論やまとめは書かないでください。`;
          },
          noSelection: true
        },
];
