export const ContextMode = {
      SMART: 'smart',
      ALL: 'all',
      MINIMAL: 'minimal', // id, name, type
      TEXT_ONLY: 'textOnly', // id, name, type, characters
      LAYOUT_ONLY: 'layoutOnly', // id, name, type, width, height, x, y, absX, absY
      STYLE_ONLY: 'styleOnly', // id, name, type, paint metadata, paint tokens
      HIERARCHY: 'hierarchy', // id, name, type, children (recursive but minimal)
      TYPOGRAPHY_ONLY: 'typographyOnly', // id, name, type, text content and typography metadata
      EFFECTS_ONLY: 'effectsOnly', // id, name, type, effects and effect style metadata
      INDEX_ONLY: 'indexOnly', // id, name, type, bounds, z-order, truncated text snippets
      COMPONENT_ONLY: 'componentOnly', // internal: component and variant metadata
      PILL_ONLY: 'pillOnly', // internal: emergency fallback for huge selections
    };


    // --- Shared UI/UX Data ---
    export const STYLE_CATEGORIES = [
      {
        "name": "Auto",
        "keywords": "Context-aware, adaptive, best-fit style based on content and purpose",
        "primaryColors": "Choose the optimal palette based on content type, industry, and audience",
        "secondaryColors": "Complementary accent to match primary palette and content tone",
        "effects": "Appropriate visual effects (shadows, borders, radii, depth) based on the overall design context"
      },
      {
        "name": "Minimalism & Swiss Style",
        "keywords": "Clean, simple, spacious, functional, white space, high contrast, geometric, sans-serif, grid-based, essential",
        "primaryColors": "Monochromatic, Black #000000, White #FFFFFF",
        "secondaryColors": "Neutral (Beige #F5F1E8, Grey #808080, Taupe #B38B6D), Primary accent",
        "effects": "Sharp shadows if any, clear type hierarchy"
      },
      {
        "name": "Neumorphism",
        "keywords": "Soft UI, embossed, debossed, convex, concave, light source, subtle depth, rounded (12-16px), monochromatic",
        "primaryColors": "Light pastels: Soft Blue #C8E0F4, Soft Pink #F5E0E8, Soft Grey #E8E8E8",
        "secondaryColors": "Tints/shades (\u00b130%), gradient subtlety, color harmony",
        "effects": "Soft box-shadow (multiple: -5px -5px 15px, 5px 5px 15px), inner subtle shadow"
      },
      {
        "name": "Glassmorphism",
        "keywords": "Frosted glass, transparent, blurred background, layered, vibrant background, light source, depth, multi-layer",
        "primaryColors": "Translucent white: rgba(255,255,255,0.1-0.3)",
        "secondaryColors": "Vibrant: Electric Blue #0080FF, Neon Purple #8B00FF, Vivid Pink #FF1493, Teal #20B2AA",
        "effects": "Backdrop blur (10-20px), subtle border (1px solid rgba white 0.2), light reflection"
      },
      {
        "name": "Brutalism",
        "keywords": "Raw, unpolished, stark, high contrast, plain text, default fonts, visible borders, asymmetric, anti-design",
        "primaryColors": "Primary: Red #FF0000, Blue #0000FF, Yellow #FFFF00, Black #000000, White #FFFFFF",
        "secondaryColors": "Limited: Neon Green #00FF00, Hot Pink #FF00FF, minimal secondary",
        "effects": "Sharp corners (0px), bold typography (700+), visible grid, large blocks"
      },
      {
        "name": "3D & Hyperrealism",
        "keywords": "Depth, realistic textures, 3D models, spatial navigation, tactile, skeuomorphic elements, rich detail, immersive",
        "primaryColors": "Deep Navy #001F3F, Forest Green #228B22, Burgundy #800020, Gold #FFD700, Silver #C0C0C0",
        "secondaryColors": "Complex gradients (5-10 stops), realistic lighting, shadow variations (20-40% darker)",
        "effects": "Realistic shadows (layers), physics lighting"
      },
      {
        "name": "Vibrant & Block-based",
        "keywords": "Bold, energetic, playful, block layout, geometric shapes, high color contrast, duotone, modern, energetic",
        "primaryColors": "Neon Green #39FF14, Electric Purple #BF00FF, Vivid Pink #FF1493, Bright Cyan #00FFFF, Sunburst #FFAA00",
        "secondaryColors": "Complementary: Orange #FF7F00, Shocking Pink #FF006E, Lime #CCFF00, triadic schemes",
        "effects": "Large sections (48px+ gaps), large type (32px+)"
      },
      {
        "name": "Dark Mode (OLED)",
        "keywords": "Dark theme, low light, high contrast, deep black, midnight blue, eye-friendly, OLED, night mode, power efficient",
        "primaryColors": "Deep Black #000000, Dark Grey #121212, Midnight Blue #0A0E27",
        "secondaryColors": "Vibrant accents: Neon Green #39FF14, Electric Blue #0080FF, Gold #FFD700, Plasma Purple #BF00FF",
        "effects": "Minimal glow (text-shadow: 0 0 10px), low white emission, high readability"
      },
      {
        "name": "Accessible & Ethical",
        "keywords": "High contrast, large text (16px+), WCAG compliant, semantic",
        "primaryColors": "WCAG AA/AAA (4.5:1 min), simple primary, clear secondary, high luminosity (7:1+)",
        "secondaryColors": "Symbol-based colors (not color-only), supporting patterns, inclusive combinations",
        "effects": "Responsive design"
      },
      {
        "name": "Claymorphism",
        "keywords": "Soft 3D, chunky, playful, toy-like, bubbly, thick borders (3-4px), double shadows, rounded (16-24px)",
        "primaryColors": "Pastel: Soft Peach #FDBCB4, Baby Blue #ADD8E6, Mint #98FF98, Lilac #E6E6FA, light BG",
        "secondaryColors": "Soft gradients (pastel-to-pastel), light/dark variations (20-30%), gradient subtle",
        "effects": "Inner+outer shadows (subtle, no hard lines), fluffy elements"
      },
      {
        "name": "Aurora UI",
        "keywords": "Vibrant gradients, smooth blend, Northern Lights effect, mesh gradient, luminous, atmospheric, abstract",
        "primaryColors": "Complementary: Blue-Orange, Purple-Yellow, Electric Blue #0080FF, Magenta #FF1493, Cyan #00FFFF",
        "secondaryColors": "Smooth transitions (Blue\u2192Purple\u2192Pink\u2192Teal), iridescent effects, blend modes (screen, multiply)",
        "effects": "Large flowing gradients, depth via color layering"
      },
      {
        "name": "Retro-Futurism",
        "keywords": "Vintage sci-fi, 80s aesthetic, neon glow, geometric patterns, CRT scanlines, pixel art, cyberpunk, synthwave",
        "primaryColors": "Neon Blue #0080FF, Hot Pink #FF006E, Cyan #00FFFF, Deep Black #1A1A2E, Purple #5D34D0",
        "secondaryColors": "Metallic Silver #C0C0C0, Gold #FFD700, duotone, 80s Pink #FF10F0, neon accents",
        "effects": "CRT scanlines, neon glow (text-shadow+box-shadow)"
      },
      {
        "name": "Flat Design",
        "keywords": "2D, minimalist, bold colors, no shadows, clean lines, simple shapes, typography-focused, modern, icon-heavy",
        "primaryColors": "Solid bright: Red, Orange, Blue, Green, limited palette (4-6 max)",
        "secondaryColors": "Complementary colors, muted secondaries, high saturation, clean accents",
        "effects": "No gradients/shadows, minimal icons"
      },
      {
        "name": "Skeuomorphism",
        "keywords": "Realistic, texture, depth, 3D appearance, real-world metaphors, shadows, gradients, tactile, detailed, material",
        "primaryColors": "Rich realistic: wood, leather, metal colors, detailed gradients (8-12 stops), metallic effects",
        "secondaryColors": "Realistic lighting gradients, shadow variations (30-50% darker), texture overlays, material colors",
        "effects": "Realistic shadows (layers), depth (perspective), texture details (noise, grain)"
      },
      {
        "name": "Liquid Glass",
        "keywords": "Flowing glass, morphing, smooth transitions, fluid effects, translucent, animated blur, iridescent, chromatic aberration",
        "primaryColors": "Vibrant iridescent (rainbow spectrum), translucent base with opacity shifts, gradient fluidity",
        "secondaryColors": "Chromatic aberration (Red-Cyan), iridescent oil-spill, fluid gradient blends, holographic effects",
        "effects": "Dynamic blur (backdrop-filter)"
      },
      {
        "name": "Motion-Driven",
        "keywords": "Dynamic gradients, high contrast",
        "primaryColors": "Bold colors emphasize movement, high contrast animated, dynamic gradients, accent action colors",
        "secondaryColors": "Transitional states, success (Green #22C55E), error (Red #EF4444), neutral feedback",
        "effects": "Dynamic gradients, layered depth"
      },
      {
        "name": "Micro-interactions",
        "keywords": "Responsive, contextual",
        "primaryColors": "Subtle color shifts (10-20%), feedback: Green #22C55E, Red #EF4444, Amber #F59E0B",
        "secondaryColors": "Accent feedback, neutral supporting, clear action indicators",
        "effects": "Clear action indicators"
      },
      {
        "name": "Inclusive Design",
        "keywords": "Accessible, color-blind friendly, high contrast, WCAG AAA, universal",
        "primaryColors": "WCAG AAA (7:1+ contrast), avoid red-green only, symbol-based indicators, high contrast primary",
        "secondaryColors": "Supporting patterns (stripes, dots, hatch), symbols, combinations, clear non-color indicators",
        "effects": "Alt content, semantic"
      },
      {
        "name": "Zero Interface",
        "keywords": "Minimal visible UI, AI-driven, invisible controls, predictive, context-aware, ambient",
        "primaryColors": "Neutral backgrounds: Soft white #FAFAFA, light grey #F0F0F0, warm off-white #F5F1E8",
        "secondaryColors": "Subtle feedback: light green, light red, minimal UI elements, soft accents",
        "effects": "Smart suggestions"
      },
      {
        "name": "Soft UI Evolution",
        "keywords": "Evolved soft UI, better contrast, modern aesthetics, subtle depth, accessibility-focused, improved shadows, hybrid",
        "primaryColors": "Improved contrast pastels: Soft Blue #87CEEB, Soft Pink #FFB6C1, Soft Green #90EE90, better hierarchy",
        "secondaryColors": "Better combinations, accessible secondary, supporting with improved contrast, modern accents",
        "effects": "Improved shadows (softer than flat, clearer than neumorphism), WCAG AA/AAA"
      },
      {
        "name": "Hero-Centric Design",
        "keywords": "Large hero section, compelling headline, high-contrast CTA, product showcase, value proposition, hero image/video, dramatic visual",
        "primaryColors": "Brand primary color, white/light backgrounds for contrast, accent color for CTA",
        "secondaryColors": "Supporting colors for secondary CTAs, accent highlights, trust elements (testimonials, logos)",
        "effects": "CTA glow effect"
      },
      {
        "name": "Conversion-Optimized",
        "keywords": "Form-focused, minimalist design, single CTA focus, high contrast, urgency elements, trust signals, social proof, clear value",
        "primaryColors": "Primary brand color, high-contrast white/light backgrounds, warning/urgency colors for time-limited offers",
        "secondaryColors": "Secondary CTA color (muted), trust element colors (testimonial highlights), accent for key benefits",
        "effects": "Success feedback"
      },
      {
        "name": "Feature-Rich Showcase",
        "keywords": "Multiple feature sections, grid layout, benefit cards, visual feature demonstrations, interactive elements, problem-solution pairs",
        "primaryColors": "Primary brand, bright secondary colors for feature cards, contrasting accent for CTAs",
        "secondaryColors": "Supporting colors for: benefits (green), problems (red/orange), features (blue/purple), social proof (neutral)",
        "effects": "Card layering"
      },
      {
        "name": "Minimal & Direct",
        "keywords": "Minimal text, white space heavy, single column layout, direct messaging, clean typography, visual-centric, fast-loading",
        "primaryColors": "Monochromatic primary, white background, single accent color for CTA, black/dark grey text",
        "secondaryColors": "Minimal secondary colors, reserved for critical CTAs only, neutral supporting elements",
        "effects": "Clean typography"
      },
      {
        "name": "Social Proof-Focused",
        "keywords": "Testimonials prominent, client logos displayed, case studies sections, reviews/ratings, user avatars, success metrics, credibility markers",
        "primaryColors": "Primary brand, trust colors (blue), success/growth colors (green), neutral backgrounds",
        "secondaryColors": "Testimonial highlight colors, logo grid backgrounds (light grey), badge/achievement colors",
        "effects": "Review star ratings"
      },
      {
        "name": "Product Showcase Demo",
        "keywords": "Embedded product mockup, walkthrough, step-by-step guides",
        "primaryColors": "Primary brand, interface colors matching product, demo highlight colors for interactive elements",
        "secondaryColors": "Product UI colors, tutorial step colors (numbered progression), hover state indicators",
        "effects": "Step progression indicators"
      },
      {
        "name": "Trust & Authority",
        "keywords": "Certificates/badges displayed, expert credentials, case studies with metrics, before/after comparisons, industry recognition, security badges",
        "primaryColors": "Professional colors (blue/grey), trust colors, certification badge colors (gold/silver accents)",
        "secondaryColors": "Certificate highlight colors, metric showcase colors, comparison highlight (success green)",
        "effects": "Certification badges, metric showcase"
      },
      {
        "name": "Storytelling-Driven",
        "keywords": "Narrative flow, visual story progression, section transitions, consistent character/brand voice, emotional messaging, journey visualization",
        "primaryColors": "Brand primary, warm/emotional colors, varied accent colors per story section, high visual variety",
        "secondaryColors": "Story section color coding, emotional state colors (calm, excitement, success), transitional gradients",
        "effects": "Visual story progression"
      },
      {
        "name": "Data-Dense Dashboard",
        "keywords": "Multiple charts/widgets, data tables, KPI cards, minimal padding, grid layout, space-efficient, maximum data visibility",
        "primaryColors": "Neutral primary (light grey/white #F5F5F5), data colors (blue/green/red), dark text #333333",
        "secondaryColors": "Chart colors: success (green #22C55E), warning (amber #F59E0B), alert (red #EF4444), neutral (grey)",
        "effects": "Maximum data visibility"
      },
      {
        "name": "Heat Map & Heatmap Style",
        "keywords": "Color-coded grid/matrix, data intensity visualization, geographical heat maps, correlation matrices, cell-based representation, gradient coloring",
        "primaryColors": "Gradient scale: Cool (blue #0080FF) to hot (red #FF0000), neutral middle (white/yellow)",
        "secondaryColors": "Support gradients: Light (cool blue) to dark (warm red), divergent for positive/negative data, monochromatic options",
        "effects": "Color gradient scales"
      },
      {
        "name": "Executive Dashboard",
        "keywords": "High-level KPIs, large key metrics, minimal detail, summary view, trend indicators, at-a-glance insights, executive summary",
        "primaryColors": "Brand colors, professional palette (blue/grey/white), accent for KPIs, red for alerts/concerns",
        "secondaryColors": "KPI highlight colors: positive (green), negative (red), neutral (grey), trend arrow colors",
        "effects": "Trend indicators, metric cards"
      },
      {
        "name": "Real-Time Monitoring",
        "keywords": "Live data updates, status indicators, alert notifications, streaming data visualization, active monitoring, streaming charts",
        "primaryColors": "Alert colors: critical (red #FF0000), warning (orange #FFA500), normal (green #22C55E), updating (blue animation)",
        "secondaryColors": "Status indicator colors, chart line colors varying by metric, streaming data highlight colors",
        "effects": "Alert pulse/glow, status indicators"
      },
      {
        "name": "Drill-Down Analytics",
        "keywords": "Hierarchical data exploration, expandable sections, interactive drill-down paths, summary-to-detail flow, context preservation",
        "primaryColors": "Primary brand, breadcrumb colors, drill-level indicator colors, hierarchy depth colors",
        "secondaryColors": "Drill-down path indicator colors, level-specific colors, highlight colors for selected level, transition colors",
        "effects": "Hierarchical navigation"
      },
      {
        "name": "Comparative Analysis Dashboard",
        "keywords": "Side-by-side comparisons, period-over-period metrics, A/B test results, regional comparisons, performance benchmarks",
        "primaryColors": "Comparison colors: primary (blue), comparison (orange/purple), delta indicator (green/red)",
        "secondaryColors": "Winning metric color (green), losing metric color (red), neutral comparison (grey), benchmark colors",
        "effects": "Comparison bars, delta indicators"
      },
      {
        "name": "Predictive Analytics",
        "keywords": "Forecast lines, confidence intervals, trend projections, scenario modeling, AI-driven insights, anomaly detection visualization",
        "primaryColors": "Forecast line color (distinct from actual), confidence interval shading, anomaly highlight (red alert), trend colors",
        "secondaryColors": "High confidence (dark color), low confidence (light color), anomaly colors (red/orange), normal trend (green/blue)",
        "effects": "Confidence bands, anomaly alerts"
      },
      {
        "name": "User Behavior Analytics",
        "keywords": "Funnel visualization, user flow diagrams, conversion tracking, engagement metrics, user journey mapping, cohort analysis",
        "primaryColors": "Funnel stage colors: high engagement (green), drop-off (red), conversion (blue), user flow arrows (grey)",
        "secondaryColors": "Stage completion colors (success), abandonment colors (warning), engagement levels (gradient), cohort colors",
        "effects": "Funnel visualization, flow diagrams"
      },
      {
        "name": "Financial Dashboard",
        "keywords": "Revenue metrics, profit/loss visualization, budget tracking, financial ratios, portfolio performance, cash flow, audit trail",
        "primaryColors": "Financial colors: profit (green #22C55E), loss (red #EF4444), neutral (grey), trust (dark blue #003366)",
        "secondaryColors": "Revenue highlight (green), expenses (red), budget variance (orange/red), balance (grey), accuracy (blue)",
        "effects": "Trend direction indicators, percentage change markers"
      },
      {
        "name": "Sales Intelligence Dashboard",
        "keywords": "Deal pipeline, sales metrics, territory performance, sales rep leaderboard, win-loss analysis, quota tracking, forecast accuracy",
        "primaryColors": "Sales colors: won (green), lost (red), in-progress (blue), blocked (orange), quota met (gold), quota missed (grey)",
        "secondaryColors": "Pipeline stage colors, rep performance colors, quota achievement colors, forecast accuracy colors",
        "effects": "Status change highlights"
      },
      {
        "name": "Neubrutalism",
        "keywords": "Bold borders, black outlines, primary colors, thick shadows, no gradients, flat colors, 45\u00b0 shadows, playful, Gen Z",
        "primaryColors": "#FFEB3B (Yellow), #FF5252 (Red), #2196F3 (Blue), #000000 (Black borders)",
        "secondaryColors": "Limited accent colors, high contrast combinations, no gradients allowed",
        "effects": "box-shadow: 4px 4px 0 #000, border: 3px solid #000, no gradients, sharp corners (0px), bold typography"
      },
      {
        "name": "Bento Box Grid",
        "keywords": "Modular cards, asymmetric grid, varied sizes, Apple-style, dashboard tiles, negative space, clean hierarchy, cards",
        "primaryColors": "Neutral base + brand accent, #FFFFFF, #F5F5F5, brand primary",
        "secondaryColors": "Subtle gradients, shadow variations",
        "effects": "grid-template with varied spans, rounded-xl (16px), subtle shadows"
      },
      {
        "name": "Y2K Aesthetic",
        "keywords": "Neon pink, chrome, metallic, bubblegum, iridescent, glossy, retro-futurism, 2000s, futuristic nostalgia",
        "primaryColors": "#FF69B4 (Hot Pink), #00FFFF (Cyan), #C0C0C0 (Silver), #9400D3 (Purple)",
        "secondaryColors": "Metallic gradients, glossy overlays, iridescent effects, chrome textures",
        "effects": "linear-gradient metallic, glossy buttons, 3D chrome effects, bubble shapes"
      },
      {
        "name": "Cyberpunk UI",
        "keywords": "Neon, dark mode, terminal, HUD, sci-fi, glitch, dystopian, futuristic, matrix, tech noir",
        "primaryColors": "#00FF00 (Matrix Green), #FF00FF (Magenta), #00FFFF (Cyan), #0D0D0D (Dark)",
        "secondaryColors": "Neon gradients, scanline overlays, glitch colors, terminal green accents",
        "effects": "Neon glow (text-shadow), scanlines, terminal fonts"
      },
      {
        "name": "Organic Biophilic",
        "keywords": "Nature, organic shapes, green, sustainable, rounded, flowing, wellness, earthy, natural textures",
        "primaryColors": "#228B22 (Forest Green), #8B4513 (Earth Brown), #87CEEB (Sky Blue), #F5F5DC (Beige)",
        "secondaryColors": "Natural gradients, earth tones, sky blues, organic textures, wood/stone colors",
        "effects": "Rounded corners (16-24px), organic curves (border-radius variations), natural shadows, flowing SVG shapes"
      },
      {
        "name": "AI-Native UI",
        "keywords": "Chatbot, conversational, ambient, minimal chrome, streaming text",
        "primaryColors": "Neutral + single accent, #6366F1 (AI Purple), #10B981 (Success), #F5F5F5 (Background)",
        "secondaryColors": "Status indicators, streaming highlights, context card colors, subtle accent variations",
        "effects": "Context cards"
      },
      {
        "name": "Memphis Design",
        "keywords": "80s, geometric, playful, postmodern, shapes, patterns, squiggles, triangles, neon, abstract, bold",
        "primaryColors": "#FF71CE (Hot Pink), #FFCE5C (Yellow), #86CCCA (Teal), #6A7BB4 (Blue Purple)",
        "secondaryColors": "Complementary geometric colors, pattern fills, contrasting accent shapes",
        "effects": "transform: rotate(), clip-path: polygon(), mix-blend-mode, repeating patterns, bold shapes"
      },
      {
        "name": "Vaporwave",
        "keywords": "Synthwave, retro-futuristic, 80s-90s, neon, glitch, nostalgic, sunset gradient, dreamy, aesthetic",
        "primaryColors": "#FF71CE (Pink), #01CDFE (Cyan), #05FFA1 (Mint), #B967FF (Purple)",
        "secondaryColors": "Sunset gradients, glitch overlays, VHS effects, neon accents, pastel variations",
        "effects": "text-shadow glow, linear-gradient, retro scan lines"
      },
      {
        "name": "Dimensional Layering",
        "keywords": "Depth, overlapping, z-index, layers, 3D, shadows, elevation, floating, cards, spatial hierarchy",
        "primaryColors": "Neutral base (#FFFFFF, #F5F5F5, #E0E0E0) + brand accent for elevated elements",
        "secondaryColors": "Shadow variations (sm/md/lg/xl), elevation colors, highlight colors for top layers",
        "effects": "z-index stacking, box-shadow elevation (4 levels), backdrop-filter"
      },
      {
        "name": "Exaggerated Minimalism",
        "keywords": "Bold minimalism, oversized typography, high contrast, negative space, loud minimal, statement design",
        "primaryColors": "#000000 (Black), #FFFFFF (White), single vibrant accent only",
        "secondaryColors": "Minimal - single accent color, no secondary colors, extreme restraint",
        "effects": "font-size: clamp(3rem 10vw 12rem), font-weight: 900, letter-spacing: -0.05em, massive whitespace"
      },
      {
        "name": "Bold Typography Showcase",
        "keywords": "Bold text, statement type, large letters, background-clip text",
        "primaryColors": "Flexible - high contrast recommended, bold colors for emphasis",
        "secondaryColors": "Accent colors for emphasis, transition colors, gradient text fills",
        "effects": "background-clip: text, split text layout"
      },
      {
        "name": "Layered Storytelling",
        "keywords": "Narrative, layered layouts, immersive, progressive disclosure",
        "primaryColors": "Story-dependent, often gradients and natural colors, section-specific palettes",
        "secondaryColors": "Section transition colors, depth layer colors, narrative mood colors",
        "effects": "position: fixed/sticky, perspective layering"
      },
      {
        "name": "Swiss Modernism 2.0",
        "keywords": "Grid system, Helvetica, modular, asymmetric, international style, rational, clean, mathematical spacing",
        "primaryColors": "#000000, #FFFFFF, #F5F5F5, single vibrant accent only",
        "secondaryColors": "Minimal secondary, accent for emphasis only, no gradients",
        "effects": "display: grid, grid-template-columns: repeat(12 1fr), gap: 1rem, mathematical ratios, clear hierarchy"
      },
      {
        "name": "HUD / Sci-Fi FUI",
        "keywords": "Futuristic, technical, wireframe, neon, data, transparency, iron man, sci-fi, interface",
        "primaryColors": "Neon Cyan #00FFFF, Holographic Blue #0080FF, Alert Red #FF0000",
        "secondaryColors": "Transparent Black, Grid Lines #333333",
        "effects": "Glow effects, fine line drawing"
      },
      {
        "name": "Pixel Art",
        "keywords": "Retro, 8-bit, 16-bit, gaming, blocky, nostalgic, pixelated, arcade",
        "primaryColors": "Primary colors (NES Palette), brights, limited palette",
        "secondaryColors": "Black outlines, shading via dithering or block colors",
        "effects": "Instant transitions"
      },
      {
        "name": "Bento Grids",
        "keywords": "Apple-style, modular, cards, organized, clean, hierarchy, grid, rounded, soft",
        "primaryColors": "Off-white #F5F5F7, Clean White #FFFFFF, Text #1D1D1F",
        "secondaryColors": "Subtle accents, soft shadows, blurred backdrops",
        "effects": "Soft shadows"
      },
      {
        "name": "Neubrutalism",
        "keywords": "Bold, ugly-cute, raw, high contrast, flat, hard shadows, distinct, playful, loud",
        "primaryColors": "Pop Yellow #FFDE59, Bright Red #FF5757, Black #000000",
        "secondaryColors": "Lavender #CBA6F7, Mint #76E0C2",
        "effects": "Bold borders"
      },
      {
        "name": "Spatial UI (VisionOS)",
        "keywords": "Glass, depth, immersion, spatial, translucent, gaze, gesture, apple, vision-pro",
        "primaryColors": "Frosted Glass #FFFFFF (15-30% opacity), System White",
        "secondaryColors": "Vibrant system colors for active states, deep shadows for depth",
        "effects": "Depth layering, translucent glass"
      },
      {
        "name": "E-Ink / Paper",
        "keywords": "Paper-like, matte, high contrast, texture, reading, calm, slow tech, monochrome",
        "primaryColors": "Off-White #FDFBF7, Paper White #F5F5F5, Ink Black #1A1A1A",
        "secondaryColors": "Pencil Grey #4A4A4A, Highlighter Yellow #FFFF00 (accent)",
        "effects": "Grain/noise texture"
      },
      {
        "name": "Gen Z Chaos / Maximalism",
        "keywords": "Chaos, clutter, stickers, raw, collage, mixed media, loud, internet culture, ironic",
        "primaryColors": "Clashing Brights: #FF00FF, #00FF00, #FFFF00, #0000FF",
        "secondaryColors": "Gradients, rainbow, glitch, noise, heavily saturated mix",
        "effects": "Sticker layering, high visual density"
      },
      {
        "name": "Biomimetic / Organic 2.0",
        "keywords": "Nature-inspired, cellular, fluid, breathing, generative, algorithms, life-like",
        "primaryColors": "Cellular Pink #FF9999, Chlorophyll Green #00FF41, Bioluminescent Blue",
        "secondaryColors": "Deep Ocean #001E3C, Coral #FF7F50, Organic gradients",
        "effects": "Fluid organic shapes"
      }
    ];

    export const IMAGE_GEN_PRESETS = {
      "Minimal / Gradient mesh / Aurora": {
        "thumbnail": "data:image/jpeg;base64,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",
        "style": "Tone: \"Modern, Calm, Mysterious, Digital, Clean.\"\nVisual Identity:\n  Background Color: \"White, or Very Light Gray.\"\n  Text Color: \"#00C6FF (Cyan)\"\n  Accent Color: \"#0072FF (Blue), #F0F (Magenta), Translucent Blend\"\n  Image Style:\n    Features: \"Super Clean Minimalism characterized by Complex and Fluid Color Gradient.\"\n    Shape: \"Fluid Organic Blob, Soft Color Transition (Mesh).\"\n    Composition: \"Vast Negative Space, Single Focus.\"\n  Typography:\n    Heading: \"Clean Geometric Sans-serif (e.g. Helvetica).\"\n    Style: \"Small Size, Wide Tracking (Space), Light Weight.\""
      },
      "Isotype / Vector / Simple": {
        "thumbnail": "data:image/jpeg;base64,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",
        "style": "Tone: \"Functional, Statistics, Clear, Flat, Universal.\"\nVisual Identity:\n  Background Color: \"#F5F5F5 (Light Gray)\"\n  Text Color: \"#2E2E2E (Charcoal)\"\n  Accent Color: \"#32CD32 (Lime Green), #1E90FF (Dodger Blue)\"\n  Image Style:\n    Features: \"Vector Graphics with Isotype.\"\n    Shape: \"Simplified Silhouette Icons.\"\n    Line Art: \"Fill without Outline.\"\n    Composition: \"Alignment of Icons and Graph Expression.\"\n  Typography:\n    Heading: \"Helvetica, or Universal Design Font.\"\n    Style: \"Objective and Easy to read.\""
      },
      "Memphis / Pattern / Mono": {
        "thumbnail": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAsLCwsMCwwODgwREhASERkXFRUXGSYbHRsdGyY6JCokJCokOjM+Mi8yPjNcSEBASFxqWVRZaoFzc4GimqLT0/8BCwsLCwwLDA4ODBESEBIRGRcVFRcZJhsdGx0bJjokKiQkKiQ6Mz4yLzI+M1xIQEBIXGpZVFlqgXNzgaKaotPT///CABEIAGAAYAMBIgACEQEDEQH/xAAuAAACAwEBAQEAAAAAAAAAAAAFBgMEBwIAAQgBAQAAAAAAAAAAAAAAAAAAAAD/2gAMAwEAAhADEAAAAH3sAAGj2dMgzl8X0Qux54NNW4zIoPRXPWcZpBCWaxTTWovi5eApBCsDv4eFGoPwKLtxeaQRdpMxxwFPCWf4gCSRoy6W6wBtPzZ+pMzdT7clpid54oCq/oLoAGdLlHDAt65IRZFAHb7LXOPkkxluswUAsSWBgxTxiBiqz+EfQhRgFBChgxTaVy2CbNo+ZdpEdM//xAArEAACAwABBAEDAwQDAAAAAAACAwEEBQYAERITFBUhMRYkQQcQIlEjMjX/2gAIAQEAARIA2uSUsVtcLCLLJcDDHqnyGhcTpGiGSukAMadfnWMaQsyi2KiYYdw5vnSRxGdoH4Ih5lHM8uTSHxrfdhVYidXXr5KFucDTljRUtaeZZzW0lop3XlaXBhEc7x/C1MKtSCglnf8AW+NB0A9VmflIlwdRzrOCqq3OVq+kz8YOOcZg2ZQdG+J9Y/Is/YNwVgfErUozLlebOju4FT3moGItibJfUxv1jmDJibUAmvB0nfQNpDqxqYhuewAtYpN2uWAkrAfHzVgkAPutFv1thCbGUBnyt6bGbgaKJZ8dekhxty3mvUxXXX3K0xUIe/osfBej0NhlOi1b4ChYTeZ5rKRRadXV1WkD4iClvttau7V9izRMc2JxCch9ZAfDglEKdHV7R+dJgdWNWnUvUaLfP3W/L1xGnmzcilN5Pyf4V19RoReGhNpUWpHyhTnAlTGF37ABHPWZtI0kKs1wKVmzw7GYAJGZRACMyU0byL9SvarkXqaMkP8AeZ8Ymf4jq7t1KWYei1T/AERAdbeBOq+raRoNp2a4EEHs5ORgXuNB9wCLBPfcDmlmbNN45B/TX2gQDyxcwtQdT4/7sR8YZZRbO+qReA1pQQuWMMt+hsGdefdMsXqUZ0M+1Uh5J9wSHmidzD1MLKPSRZqv9gRGlSfdqylGg6mzyiYdxDSvWkaSrVn3/Etkhdjc015lC08oOfBMl1Tcx1aq2hWFtF9FsyeYT2vqPoescv1HHg3RxX6EZLySdn7H6uS4WlcLJs58o91F0shWLT1K6XlpX/k2HM8p6apTPVJrApWfkEtamsljWnAKWMkRcc5hG3s360BAIFcHW62MKrpsrOY+zXsIGYUzPpWM9JodoOt9z7wdvI3ONUdCxnbal0lmT4VXN+viVnHEpa+uDD6dFqdmkAGYCtDTJdjnGf8AVKGdQ7PltpYG48zOG99TioMW4Dx9uJvhZhVW6LkX2sbIK62sjRt3cx9XTlCkH3aDDWoJNjBAY/JajsfKSWs+smJWP/fI5PT0rB0zrPp2xDy9PV+KW7GvhMhiyBaiI7eZyvJz32h5RBhVVJwGTpTfx6V1kQsmogj6xS8NjLL/AFcRPUyMR95jrWzbVl2faqWlodUI5HqLFitnm26SpJKjY2a3MdRI1r9/MBWXaKRB22dHf5Dh5sWYfThTHvieHa3/AAZ5aKjxl2oeIzWqlYXZJIe5YSItr3Hnyi0rOsk2r+b4qrgsjKDYcmUzBPGDrPCa8PiQnurk+5uPP4NmudCsEdgqX/6biFpNnJs9oFon6dmpdtKpgj1SubMRZE2LQEfx9uwBF2nasWaDKrzGQIWEFfPZRiqCElVlcQCq2ZiYS7D0ITVDt3M0c6C/yGhQoh2rG2RNrX3w0Kil0YOqYHLH70BW5DUu26ralNH5vcv2tvNVnFko8wd9zNZ22VqDP8UPkVm9dyjT0Ekm5WW5f+rFnRPLh9CjE3C8Y9OFt3b1nRz9CspNul4eXWnn1Lt2kdgAOa0+5AV9BLTrQBi6CFrPfk30XEVmhorutEyVLtnDzuSUw72ziAmfAlcL2sTczXwv5NYLau7fqtUddeXMHLzry6J0cxOjFUXGfqW+GmvqgvZC/ds3nqGuyI9NctBYe0JUXuWv2QrMVCocag9QtOTKMHYnFi6q7kaT9N1k2PnOu0NmtW1KwH3ETCAoQ+c0QA61VyfcJxWz0+BMrphItsS+J1Kt+cWyjJ9aLUj3XHHA2K2SpWo7zs+U/fVwtadUNbLvKrPmtCGDxXVvaNW8N0gNla4aIdd13YPJr7r4XJovQsa85mzQ2ajX0Xech9iAq1nMywpZUqbZQYR1cv1c2sdm02FKH8m986eJYbkuAzdXP0M4/snh18zMu4tuoBthUv8AWrv3FYxPlJdaOyjLKoDKth5WJOAHAC9dOxfnTvAqb1jwr8r5ky1ooCgf7am4TEqtlVypWtKLuL1QyOp4dYrteNPfu1a7Gyz08VvaDamsm0ZWzo3DSpnGeSYlBN23pX5G/dsyb11WU7YBcr+sxYEeLdTNp61BtS3Eys5j7ZufWzKaadYZFK+/jGlir0buY9ry9dJ0tlPSsCK+hWuTqXnkj2eAMWpy2LYAmsxkSGzwjirx/wDP9RdLQWHmV6tBFmz4MER6Nmj9WqsVdD44JYT64SBDBDMTBRExN6n517jatOvNtijhZcdyyyMepSM4Mw7kU//EACwQAAICAgIBAQcEAwEAAAAAAAECABEDEiExQRMEECIyQlFiU2FxwiAjRFL/2gAIAQEAEz8AwqDQxwgUyshcaxkTgqnqQYlKohTe2mqf9QLJMQt3dulUGJjB0G5S3hQVlVXCWkATgT0VqNiX59d9IwUD/byFiTQtYTCVnzcumkxGlyk+z6BDCh7wY2DxVNokwoULN67UjVClasfaLAlHhArv/aZAdcVseEn0VpPwxxRfCzcb+4nmCyaURvhIN15h6AAjKV/w0Kv8Ta1TVEW7R4/Lv6Udqdy3lUmx+2s0svtYHxRCuVXVetjXyPQaKLoQYAjImBJiFtAK9RVimm5YJYP8tMj3mDtZCEG9oVdH2s1Vx8ZaZuEMX5E/ZIyg6sB2PsYegqzzSmmmB9CoaZewI+IFraCuGPPAcNNT6WXGWCCm+l1n0AM07aqj4Hx0qkkCyPC+4E/HCQAIiL6jbcAXM66s6+6vLEsKhwCmVJ0on8P7smMuH9Ra+6zCCEpOTQaIbfHEeNfrD8JQ3Ct2FmQ2mN+gMUdixAb6QWshfsIQp3/H4uIOFoTJMqgq2GjtB2a6VRDiYYaYdbdGABsehhP9mh7eb16ZXoVMK8u//jIU5VIE3hXbteUjC6MzOFqYiWQh56lMW7YkREJxBEYre3hoqFfz5QcLMT2tzFAAVC3XMFa5CvKhvchLHEE+5lrZBJC0b8mBDjJduGtSB5FhomPbeNwws0yvPZguXCjA2QV4JaYSUDlKKHJwtX5EQBAObYLC1kCZE3iChkCzEpZBCCjBp7Q/6j/OwWHxB5aqj9HM8A+rq5gTc/ALMyfIMdnXhhaz9V0n7MIngtCKOXWDG9pF7ZYprr3VYdx17szh1U5BRh5BBFTG7CF0BRGbyT9MdWRmVmOpXbpoPMdLtq42n7sbn//EABQRAQAAAAAAAAAAAAAAAAAAAFD/2gAIAQIBAT8AE//EABQRAQAAAAAAAAAAAAAAAAAAAFD/2gAIAQMBAT8AE//Z",
        "style": "Tone: \"Post-Modern, Playful, Geometric, Cool, Graphical.\"\nVisual Identity:\n  Background Color: \"#FFFFFF (White)\"\n  Text Color: \"#000000 (Black)\"\n  Accent Color: \"None (Monochrome only).\"\n  Image Style:\n    Features: \"Reconfiguration of Memphis Design Pattern in Black and White.\"\n    Shape: \"Wavy Line (Squiggle), Dot, Triangle.\"\n    Pattern: \"Terrazzo, Zigzag.\"\n    Composition: \"Randomly scattered geometric shapes.\"\n  Typography:\n    Heading: \"Geometric Sans-serif.\"\n    Style: \"Bold placement and size.\""
      },
      "Manga / Screen Tone / Action": {
        "thumbnail": "data:image/jpeg;base64,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",
        "style": "Tone: \"Manga, Impactful, Japan, Story, Black and White.\"\nVisual Identity:\n  Background Color: \"#FFFFFF (White)\"\n  Text Color: \"#000000 (Ink Black)\"\n  Accent Color: \"None (or Red for Sound Effects).\"\n  Image Style:\n    Features: \"Japanese Shonen Manga Style.\"\n    Technique: \"Screen Tone Dots, Solid Black.\"\n    Effects: \"Concentration Lines, Speed Lines.\"\n    Motif: \"Sound Effects (Onomatopoeia) drawn letters.\"\n  Typography:\n    Heading: \"Antique (Mix of Gothic and Mincho).\"\n    Style: \"Dialogue in Speech Bubble.\""
      },
      "Collage / Newspaper / Punk": {
        "thumbnail": "data:image/jpeg;base64,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",
        "style": "Tone: \"Rebellious, DIY Spirit, Energetic, Rough\"\nVisual Identity:\n  Background Color: \"Kraft Paper Color (#D2B48C) or Fluorescent Pink (#FF00CC)\"\n  Text Color: \"Black Ink (#111111) or Cutout Letters\"\n  Accent Color: \"Cellophane Tape Yellow (#FDD835) or Marker Red (#D50000)\"\n  Image Style:\n    Features: \"Magazine Cutouts, Handwritten Scribbles, Copier Smudges, Staples\"\n    Shape: \"Hand-torn Paper Edges, Uneven Layout\"\n    Texture: \"Paper Fiber, Glue Marks, Rough Halftone\"\n  Typography:\n    Heading: \"Ransom Note (Threat Letter) style cut-and-paste letters, or Stencil.\"\n    Body: \"Typewriter font, or Handwritten.\"\n    Numbers: \"Stamp like numbers.\""
      },
      "Infographic / Data Visualization": {
        "thumbnail": "data:image/jpeg;base64,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",
        "style": "Tone: \"Intellectual, Analytical, Clear, Business, Trust.\"\nVisual Identity:\n  Background Color: \"#FFFFFF (White) or Light Gray.\"\n  Text Color: \"#333333 (Charcoal)\"\n  Accent Color: \"#4682B4 (Steel Blue), #DC143C (Crimson)\"\n  Image Style:\n    Features: \"Beautifully organized Data Visualization.\"\n    Shape: \"Pie Chart, Bar Chart, Scatter Plot, Heat Map.\"\n    Composition: \"Dashboard like Orderly Placement.\"\n    Texture: \"Flat and Clean.\"\n  Typography:\n    Heading: \"Sans-serif prioritizing Legibility (Roboto, Inter).\"\n    Style: \"Emphasis on Numerical Values.\""
      },
      "Infographic / Isometric / Data": {
        "thumbnail": "data:image/jpeg;base64,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",
        "style": "Tone: \"Intellectual, Clear, Business, Educational\"\nVisual Identity:\n  Background Color: \"Light Gray (#F5F5F5) or White\"\n  Text Color: \"Dark Gray\"\n  Accent Color: \"Color coding per Information Category (Blue, Green, Orange)\"\n  Image Style:\n    Features: \"Isometric Urban or Factory, Pipeline, Flowchart\"\n    Shape: \"3D Icons, Arrows, Graphs\"\n    Texture: \"Matte Vector\"\n  Typography:\n    Heading: \"Reliable Sans-serif (Helvetica, Roboto).\"\n    Body: \"Small but readable font.\"\n    Numbers: \"Large Bold emphasizing data values.\""
      },
      "Infographic / Isometric / Colorful": {
        "thumbnail": "data:image/jpeg;base64,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",
        "style": "Tone: \"Informational, Playful, Clear, Professional, Modern.\"\nVisual Identity:\n  Background Color: \"Light Gray, or Faint Grid.\"\n  Text Color: \"#FF6B6B (Red)\"\n  Accent Color: \"#4ECDC4 (Teal), #FFE66D (Yellow), #1A535C (Dark Blue)\"\n  Image Style:\n    Features: \"Data visualization focus using 3D Isometric Vector Illustration.\"\n    Shape: \"Isometric Graph, Circle Graph, Flowchart Connector.\"\n    Imagery: \"Micro-people, Floating platforms, Icons.\"\n    Composition: \"Structured Flow, Interconnected elements, Clear Path.\"\n  Typography:\n    Heading: \"Rounded Sans-serif.\"\n    Style: \"Clear Hierarchy, Labels.\""
      },
      "Doodle / Notebook / Cute": {
        "thumbnail": "data:image/jpeg;base64,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",
        "style": "Tone: \"Cute, School, Killing time, Fancy\"\nVisual Identity:\n  Background Color: \"University Notebook Lines, Graph Paper\"\n  Text Color: \"Ballpoint Pen Blue, Black\"\n  Accent Color: \"Fluorescent Pen (Pink, Yellow)\"\n  Image Style:\n    Features: \"Doodle during class, Stick Figures, Stars, Heart, Loose Characters\"\n    Shape: \"Freehand Lines\"\n    Texture: \"Ink accumulation of ballpoint pen\"\n  Typography:\n    Heading: \"Handwritten characters with shadow by hatching on outlined letters.\"\n    Body: \"Rounded characters.\"\n    Numbers: \"Cute decorated numbers.\""
      },
      "Doodle / Notebook / Blue Ink": {
        "thumbnail": "data:image/jpeg;base64,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",
        "style": "Tone: \"Creative, Rough, Personal, Brainstorming, Authentic.\"\nVisual Identity:\n  Background Color: \"Lined Notebook Paper, or Graph Paper.\"\n  Text Color: \"#0000CD (Blue Ballpoint ink)\"\n  Accent Color: \"#FF0000 (Red correction ink), #FFFFFF (Paper)\"\n  Image Style:\n    Features: \"Drawn on Lined Paper, Casual Handwritten Aesthetic.\"\n    Imagery: \"Stick Figures, Stars, Arrows, Coffee Stains.\"\n    Composition: \"Marginalia Style, Free Form, Brainstorming Style.\"\n  Typography:\n    Heading: \"Handwritten Font.\"\n    Style: \"Messy, Scribbled, Underlined.\""
      },
      "Flat illustration / Corporate / Memphis": {
        "thumbnail": "data:image/jpeg;base64,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",
        "style": "Tone: \"Friendly, Professional, Trustworthy, Modern, Inclusive.\"\nVisual Identity:\n  Background Color: \"White, or Very Light Pastel Gray.\"\n  Text Color: \"#3B5998 (Corporate Blue)\"\n  Accent Color: \"#FF6B6B (Accent Red), #FFD93D (Accent Yellow), #6C5CE7 (Soft Purple)\"\n  Image Style:\n    Features: \"Flat vector using playful Memphis patterns, Modern tech company style.\"\n    Shape: \"Wavy lines, dots, triangles, organic blobs (Memphis elements).\"\n    Imagery: \"Flat figures with large limbs, simplified objects, vector scenes.\"\n    Composition: \"Balanced, Rule of Thirds, Ample White Space.\"\n  Typography:\n    Heading: \"Open Sans, Roboto, or Modern Geometric Sans-serif.\"\n    Style: \"Clean, Readability Focused, Medium Weight.\""
      },
      "Flat illustration / Material design / Modern": {
        "thumbnail": "data:image/jpeg;base64,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",
        "style": "Tone: \"Approachable, Positive, Everyday, Versatile\"\nVisual Identity:\n  Background Color: \"Neutral Gray (#FAFAFA) or Material White (#FFFFFF)\"\n  Text Color: \"Material Gray (#212121) - Prioritizes visibility\"\n  Accent Color: \"Primary colors like Google Blue (#4285F4), Green (#34A853) etc.\"\n  Image Style:\n    Features: \"Flat Illustration, Scene Depiction (Working Developers, Connected World), Moderate Drop Shadow\"\n    Shape: \"Rounded Corners, Circles, Card-style UI\"\n    Texture: \"Digital Paper, Layered Feel (Overlapping)\"\n  Typography:\n    Heading: \"Google Fonts Sans-serif (Roboto, Open Sans). Standard Neutral Style.\"\n    Body: \"Web Standard Sans-serif.\"\n    Numbers: \"Standard Arabic Numerals.\""
      },
      "Corporate / Memphis / Playful": {
        "thumbnail": "data:image/jpeg;base64,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",
        "style": "Tone: \"Friendly, Modern, Tech, Inclusive, Flat.\"\nVisual Identity:\n  Background Color: \"#FFFFFF (White) or Very Light Gray.\"\n  Text Color: \"#202124 (Dark Gray)\"\n  Accent Color: \"#4285F4 (Google Blue), #EA4335 (Red)\"\n  Image Style:\n    Features: \"Corporate Memphis (Allegria) style illustration.\"\n    Shape: \"Human with exaggerated limbs, Flat design.\"\n    Atmosphere: \"Optimistic, Diverse, Simple.\"\n    Composition: \"Lots of white space.\"\n  Typography:\n    Heading: \"Bold Geometric Sans-serif.\"\n    Style: \"Clean and readable corporate style.\""
      },
      "Calligraphy / Ink Wash / Gold Leaf": {
        "thumbnail": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAsLCwsMCwwODgwREhASERkXFRUXGSYbHRsdGyY6JCokJCokOjM+Mi8yPjNcSEBASFxqWVRZaoFzc4GimqLT0/8BCwsLCwwLDA4ODBESEBIRGRcVFRcZJhsdGx0bJjokKiQkKiQ6Mz4yLzI+M1xIQEBIXGpZVFlqgXNzgaKaotPT///CABEIAGAAYAMBIgACEQEDEQH/xAAwAAABBQEBAAAAAAAAAAAAAAAGAAECAwUEBwEBAQEBAAAAAAAAAAAAAAAAAAECA//aAAwDAQACEAMQAAAA9VZLnpPn1mouW4tQ4Ro0JYBvyxddXdlAvlnq0E6zCg8/KNe8G+Uwglb3RlflkPBM45umREaMYxtrgbjskx4LviO8GF1IDP8ABjmJB7aTzIqJAUIVtS47Hc4ywu+OIzyNiK4V3S13sqo46Mg79sVLEsp6orT0Mk58/Vpmrpc16MEGuZWQXZeglySWEFFf/8QAMBABAAIBAwMDAwMCBwEAAAAAAQIDBAAFERIhMRATQQZhgRQgIlFxIzJikqGxwtH/2gAIAQEAAT8APQeV0eh6LpQ0WwVCQuoyJCjzwo/s3PPht+HZkMepEIwHvJkgGp7mG1m4QpbINRYwEENYeRLIxKb51e0zgS6WRLgfvqy2FVU7pSOmMGSj8Gp/UNI7dxRYmTBlKALOJxyPpKUYjKUgA5VeA1jb1hZUSrLlj13NrAgWEx+4mrff2++NhKduNZIjOL3lCXxIfKagkoRREQfRQFewHLrOMncd5rxqLCowgtlOUOoZy8ajfDC2zfdtts70CVyTgS45DjV9Mty23ba8ePXU1e3OXgrewyT5QENZmLe7dvTEcfGf5whx3SuHwfBN1nVQycuuWVbIxSobZ1HWUs4EenwhrEUz6Z4SXYNtBWzjPkrah1lYBVSxnj/rrW+UsWEoqQJHiX+k1sQwzpYlWS3UVUc3jDgL5vcNZECyqcEXqPyPw6oD24qcKHJz4fQFEQB/Zfk49NfXdbXCD2ZSkBrHyaMqmM65RlFOEJRl/wBajGMYkYxIh4A0aIwiyYxBk8yQBX0icMgODldPYfAGnKrLfZjzOwOWMTTLiKsU4NRsrlAnGcWCckh7Jrct0oxi2ulZZPUVxh906tOy4+fjVGfBtXiSc6ns+Bt+ZSYErasi2MiEOqU4AHl58axMmyMym5WX/rSgKvAHKup7pfKaYmBbfEOWfJGP41jfUGPblGJfVPHyXsQn6ZVrTjZFwC11Sl/tNbbXkmHi5JfwXxnO44OqSixSWpZObeuHjT6Lpwiym8y9qC95f3Txqioq64H+XnkPunfWzScj6oyy/hYt8qznwk9brumLtGK33z+0IPmTqNl8WU1iXWiSVIyiS7h3eB1dYt9U+RkkXskhkSQ1umX0ZOHjMiMbJMpq9mMfjRn2S5sgxK4DLpjKPeMfw63CynMI3ThBsint2QEkf/TWPNlj0yY8LCKmra421zrkcxlFimqdwntkHaM60osgv6XImPtTgid3UNxwqbozdxotk+K6AnKX5NUynOqMp19MpHLFeU1vHv7B9T0ZxWuNbNlyffyawZV7ln23O74l9EmDDHiBMank55V1ZjMZ3tx0VBMJKr9vuusWTm5RIh01xTsngj4NfVOJlzxacrCVyaJjEDvPW075t90K5Zlv6PKHm2vjiCmsLI2zdM++WJgSBWE8gAPxoAAOADgD03CzIlWQtwaLYyqHpslFGYnUBJ8BqghiDKva8WuwU4jKEf7axrMucpl9BWBFikiQqd9ZmHjZtLTk1E4ff/hNY/0BDH3SjMhuU+iu4sIdHfV+LG9CfCapx66YdEBIvd1k2tUIIRRmEmSRCOrYW32dctrw5y5n/JnFUB6H86x8nILPbcaqusYEemcXsivY/o+ihIHVlNVvBZVCYPISiOnGx5PLRBeeeek9MrJhi49t8/EI6xWydMcjKsYkhnGIsYwjx86yt3ZkzCtIsPE5x/wpJ5iOsPIcnGquYsWceZRXwmp1wnHicYyP6IJow8SIhjUg/wBIR1HFxoIxx6oo8iRBPTJl0VsxBj3Re3GohwvIq+v1FBltGTx4OlfuCLqe8s/FgRQCJXKUUl2PjWbfSV4ODKBGnJme5Pq8Sl386oqhTWRgcR5UD9jq6tthIjIF4BdYWU1T/R5H8boqVvKlkDwjo6mchDgDhPS1rK5swYdL1CciangWbZkWO27vVCsGbj5AzKx+YuqMVysgdxz8W1VSuqAdTHUGLCLE7IJ6DqU4wOqTwGqciq+LKuXIKL6W49Nwe5CMkfKDqFBE6YzkB8DrlDvwrq+uVtM4EiLI45Ykg/Dqe1E2XVKhZR4Voj+NS23qkLKjsye9EVGXddUVtVUISlGTE4UiRH8HrfVG+qVcnglrHojjwYxVF1//xAAiEQAABQMEAwAAAAAAAAAAAAAAAQIRIBAhQQMSIlFSYaH/2gAIAQIBAT8Ao0XDhxiF3Gtx2qLu/uNgtBrWXiX2uZZl/8QAGxEAAQQDAAAAAAAAAAAAAAAAAREhMGEAAiD/2gAIAQMBAT8An0dR0CALmZLz/9k=",
        "style": "Tone: \"Elegant, Traditional, Zen, Powerful, Refined.\"\nVisual Identity:\n  Background Color: \"Washi Paper Texture (Fibrous).\"\n  Text Color: \"#000000 (Sumi Black)\"\n  Accent Color: \"#D4AF37 (Gold Leaf), #F0F0F0 (Paper White), #CC3333 (Seal Red)\"\n  Image Style:\n    Features: \"Ink Painting with Gold Accents, Traditional Oriental Luxury.\"\n    Shape: \"Enso Circles, Brush Fade, Gold Leaf Flakes.\"\n    Composition: \"Ample Negative Space (Ma), Asymmetric Balance.\"\n  Typography:\n    Heading: \"Brush Lettering (Brush Calligraphy).\"\n    Style: \"Dynamic Brush Strokes, Varying Ink Density.\""
      },
      "Geometric Abstraction / Bauhaus / Grain": {
        "thumbnail": "data:image/jpeg;base64,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",
        "style": "Tone: \"Constructivism, Art, Intellectual, Balanced, Retro Modern.\"\nVisual Identity:\n  Background Color: \"#F5F5F5 (Off White)\"\n  Text Color: \"#000000 (Black)\"\n  Accent Color: \"#FF0000 (Red), #0000CD (Medium Blue), #FFD700 (Gold)\"\n  Image Style:\n    Features: \"Bauhaus-style Geometric Composition.\"\n    Shape: \"Circle, Triangle, Overlapping Squares.\"\n    Texture: \"Rough Grain Noise.\"\n    Color Tone: \"Primary & Achromatic Contrast.\"\n  Typography:\n    Heading: \"Geometric Sans-serif like Futura.\"\n    Style: \"Diagonal & Compositional Arrangement.\""
      },
      "Low-poly / Pastel / Game": {
        "thumbnail": "data:image/jpeg;base64,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",
        "style": "Tone: \"Nostalgic, Cute, Digital, Simple, Calm.\"\nVisual Identity:\n  Background Color: \"Simple gradient sky.\"\n  Text Color: \"#FFB6C1 (Light Pink)\"\n  Accent Color: \"#98FB98 (Mint), #87CEFA (Light Blue), #FFFFE0 (Light Yellow)\"\n  Image Style:\n    Features: \"Aesthetics of early 3D computer graphics with soft lighting.\"\n    Shape: \"Polygon mesh, Triangles, Chamfered surfaces.\"\n    Effects: \"Flat shading (no smoothing), Ambient Occlusion.\"\n    Composition: \"Isometric view or 3/4 view of the scene.\"\n  Typography:\n    Heading: \"Rounded Digital Font.\"\n    Style: \"Simple UI overlay.\""
      },
      "Isometric UI / 00s Web / Clean": {
        "thumbnail": "data:image/jpeg;base64,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",
        "style": "Tone: \"Structural, Encyclopedic, Clear, Slightly Retrofuture\"\nVisual Identity:\n  Background Color: \"Icy Blue (#F0F8FF) or Soft Mint (#F0FFF0)\"\n  Text Color: \"Slate Gray (#708090) - Contrast slightly suppressed\"\n  Accent Color: \"Pastel Pink (#FFB6C1) or Pastel Yellow (#FDFD96)\"\n  Image Style:\n    Features: \"Isometric (Axonometric projection), 3D Block objects, Organized miniature garden feel\"\n    Shape: \"Cube, Block, Dimensional pipeline\"\n    Texture: \"Matte Plastic, or Clay-like Soft 3D\"\n  Typography:\n    Heading: \"Rounded Sans-serif (Varela Round, Quicksand). Friendly.\"\n    Body: \"Standard Sans-serif. Textbook-like orderliness.\"\n    Numbers: \"Round Gothic. Retain some Pop.\""
      },
      "Pixel art / Isometric / Garden": {
        "thumbnail": "data:image/jpeg;base64,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",
        "style": "Tone: \"Informational, Playful, Clear, Professional, Modern.\"\nVisual Identity:\n  Background Color: \"Light Gray, or Faint Grid.\"\n  Text Color: \"#FF6B6B (Red)\"\n  Accent Color: \"#4ECDC4 (Teal), #FFE66D (Yellow), #1A535C (Dark Blue)\"\n  Image Style:\n    Features: \"Data visualization focus using 3D Isometric Vector Illustration.\"\n    Shape: \"Isometric Graph, Circle Graph, Flowchart Connector.\"\n    Imagery: \"Micro-people, Floating platforms, Icons.\"\n    Composition: \"Structured Flow, Interconnected elements, Clear Path.\"\n  Typography:\n    Heading: \"Rounded Sans-serif.\"\n    Style: \"Clear Hierarchy, Labels.\""
      },
      "Kinetic / Motion / Black": {
        "thumbnail": "data:image/jpeg;base64,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",
        "style": "Tone: \"Dynamic, Experimental, Speed, Contemporary Art, Stimulation.\"\nVisual Identity:\n  Background Color: \"#000000 (Black)\"\n  Text Color: \"#FFFFFF (White)\"\n  Accent Color: \"#FFFF00 (Yellow), #00FF00 (Lime)\"\n  Image Style:\n    Features: \"Kinetic Typography feeling movement.\"\n    Effects: \"Motion Blur, Afterimage, Distortion (Stretch).\"\n    Composition: \"Rhythm using repetition.\"\n    Texture: \"Display on Digital Screen.\"\n  Typography:\n    Heading: \"Sans-serif.\"\n    Style: \"Deformation, Rotation, Repetition.\""
      },
      "Typography poster / Swiss style / Bold": {
        "thumbnail": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAsLCwsMCwwODgwREhASERkXFRUXGSYbHRsdGyY6JCokJCokOjM+Mi8yPjNcSEBASFxqWVRZaoFzc4GimqLT0/8BCwsLCwwLDA4ODBESEBIRGRcVFRcZJhsdGx0bJjokKiQkKiQ6Mz4yLzI+M1xIQEBIXGpZVFlqgXNzgaKaotPT///CABEIAGAAYAMBIgACEQEDEQH/xAAzAAACAwEBAQAAAAAAAAAAAAAABAEFBgMHAgEBAAIDAQAAAAAAAAAAAAAAAAEDAgQGBf/aAAwDAQACEAMQAAAA3BMBLPcrywCvLAK8sOAtAATA3jdliTu3W2Y5oMJfF8s0sJAAEjWI3FaVmu59SI+vklZpUTACYkcZVZEu6+ET6ZTeZ0tHp3vq3gfomVWtiYt0AAdZVZEsRuMenzb62xo9Ngd8Xc4X0Bu82ADXeuCxK4LErgseCoAB/8QANhAAAgEDAgMGAgcJAAAAAAAAAQIDAAQRBRMSIVIGEBQgMnExkRYwQlFUYcEVIzM0QVNzkrH/2gAIAQEAAT8A7x9XAiMjEqCQa2o+kUYo+kVtR9Iraj6RQij6a2o+kVOiKilVAJPlhJETkEAik7Rap4aIvEFll0+FocKHLyynAYBah17U5ZLO2+E1yF+KehoSRPkVoOtvPp9xd3d7HJtwCV1UplOWW5JXZ/Uru9inS8XguY2DYKMh4JFytAGsH7xVx6FyQefeO6DIierTVteItEmDce1aMW21xIJpVp9U1AafJKL+c3ZWMzx7ICwMZQCASKmvZl0mxkF9Kpe7VJpwEchP9B/yv2zq48IQJniiLtcSbIzJC0hRCek8OWrRZNSlkvfGThlgk8OgCgbmOZlPdc+hffyw/wAJ6jh1prRIIluo92GBJmluOYkGWd1OXK1YJqYu4Jbo3BTaRzErZG+x2m90+1XKs0K5VcehffyCrfG21W0WXG6rFQwABjahFCvCVjQEHkQK5VyoGuVXBBRffyCrfmje9cq1HlaSe6j5tVu6NGmHViAAayAKnu7d0actwxqpyzDFXZve0l2wh/dWcR9bVcDEa+W3AKN71itRwLKUlgACp+TVZanbRXWouzgkTBos/wBaHaDVWj4vHPnFTapeTwGKW7cw8WSv3mjrF0rxiJ+HgXhX8h+VaBqN7d3MqT3DuqxZw3358tt6G9+7UoDPYzxBQxYfrUlvp1nzlMUj/wBuNQ3zaosSEkIAtNBGfs01mM5Brsv/ADk/+H9fLb54G9651fwS3NnNDGyqzgAGj2UvjgGeEA/H40nYjUFGPEW9fQrUfxMHzavoTqP4iD5tWlaFc6ZNJLNJGwZOEBfLA6KjBmAJNbsfUKMsfUK3Y+oVux9QoSx9Qrdj6hU7oyKFYEg/X//EAB4RAAEEAQUAAAAAAAAAAAAAAAECAxEhABMgMDFA/9oACAECAQE/APKHwZo5qwUCO9pbcmhgQ6VokUOD/8QAIREAAgICAQQDAAAAAAAAAAAAAQIDBAAREwUSICEwMUD/2gAIAQMBAT8A/IPZx+lyIEPIh2N4KLmOaRXBEet+A+xiWqfGodwTkliktWysbjucD18H/9k=",
        "style": "Tone: \"International Style, Discipline, Modern, Clear, Objective.\"\nVisual Identity:\n  Background Color: \"#F0F0F0 (Light Gray)\"\n  Text Color: \"#000000 (Black)\"\n  Accent Color: \"#FF0000 (Red) only.\"\n  Image Style:\n    Features: \"Principles of Swiss Typography.\"\n    Composition: \"Modular Grid System.\"\n    Elements: \"Typesetting itself as main visual.\"\n    Photo: \"Combination of Monochrome photo and Color plane.\"\n  Typography:\n    Heading: \"Helvetica.\"\n    Style: \"Flush Left, Large Heading.\""
      },
      "Fun blocky 3D world": {
        "thumbnail": "data:image/jpeg;base64,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",
        "subject": "Retexture the image attached based on the JSON below",
        "style": "{\n  \"style_name\": \"Playful Chunky 3D Aesthetic\",\n  \"retexture_mode\": \"stylized_3d_overlay\",\n  \"object_analysis\": {\n    \"preserve_silhouette\": true,\n    \"geometry_sensitive_mapping\": true,\n    \"detail_retention\": \"moderate \u2014 focus on key forms and proportions\"\n  },\n  \"material_properties\": {\n    \"base_material\": [\"soft matte plastic\", \"rubbery polymer\"],\n    \"surface_details\": [\n      \"rounded edges and inflated volumes\",\n      \"smooth, toy-like finish\",\n      \"minimal seam lines\"\n    ]\n  },\n  \"lighting\": {\n    \"type\": \"studio diffused light\",\n    \"intensity\": \"medium\",\n    \"shadows\": \"soft base shadows\",\n    \"highlight_behavior\": \"gentle gloss on curves and raised surfaces\"\n  },\n  \"color_palette\": {\n    \"dominant_colors\": [\"#f6f6f6\", \"#3a3a3a\", \"#f05423\"],\n    \"accent_colors\": [\"#ff875d\", \"#b0b0b0\", \"#f3f3f3\"]\n  },\n  \"background\": {\n    \"color\": \"#f9f9f9\",\n    \"type\": \"solid\",\n    \"texture\": \"none\"\n  },\n  \"style_tags\": [\n    \"3D cartoon realism\",\n    \"UI icon pack aesthetic\",\n    \"inflated minimalism\",\n    \"soft tech look\",\n    \"playful volume modeling\"\n  ]\n}"
      },
      "Neon style Logo": {
        "thumbnail": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAsLCwsMCwwODgwREhASERkXFRUXGSYbHRsdGyY6JCokJCokOjM+Mi8yPjNcSEBASFxqWVRZaoFzc4GimqLT0/8BCwsLCwwLDA4ODBESEBIRGRcVFRcZJhsdGx0bJjokKiQkKiQ6Mz4yLzI+M1xIQEBIXGpZVFlqgXNzgaKaotPT///CABEIAGAAYAMBIgACEQEDEQH/xAAxAAEBAAIDAQAAAAAAAAAAAAAABgQFAQMHAgEBAQEBAQAAAAAAAAAAAAAAAAEDAgT/2gAMAwEAAhADEAAAAPIwAAAAAAAAAAAMzDotZyqOhY/WV2H155xT9vHqk1js855232hvCincra033Pd27K51GH5VsiU1tM/zxxjvdEWcck7AAAAAAAAAAA//xAAuEAACAgECBAQDCQAAAAAAAAABAgMEEQAFBhAxURIiMEETQGEUFiAyQlJigZL/2gAIAQEAAT8A5Z1nWdZ/BnWfWPqH1alOa45SNQSBkknAGl4cuN0eL/Y1Hw5eZ2RvAjD2Zgutx2yztzqk64JUMPcEejsUbzPNECFVk87dl76WTaYYWP2MNAp8IkdyHf6rq60DRCNLKzQlC8TfqT+La4hOam1jtBo7P46ENiIsWKkuNNsanc4asbMVZVLE6ubHFDcprG5evOVw394OrXDEke5RV4iTFJ0Y9h1zpeGKAs3EZp2SJFYBcFiW1vVOrUljSBLKErlhOoU89mk8FbcO5h0JVmiiYqGjVAjr7r3I1GtGIAmYtGD+QKfEdb5K8zQTHoy+Vey9tJvXwYqAjUhoQwfPRg2vvFTSWxPHCxlaNVQN0HfOl4jrzQos9dVeKZXj+GuF1PxSxNtIkxHK5KFuqq3UaHE9JrFx2SZUmRVBXAYY1vNunaeNq7WCcYYzMG51rUtZi0bYJGDo7nYLBvKCOw0N4n/ahP1XVu5NbcNIegwAPlD8uOWOWOeOWNY5/wD/xAAhEQACAgIBBAMAAAAAAAAAAAABAgADETEhBBIiMBNBQv/aAAgBAgEBPwD2UqrOAdS8fEw8eDEoewt2jQzHqZM5+oDmHiUOqWAtqX9Sj/gNjWZXdYmTnkyyxrNxfGE5Pt//xAAfEQACAgICAwEAAAAAAAAAAAABAgARAxIhMRMwMkH/2gAIAQMBAT8A9huuO4EZ0fVxsJizHRd+ySIqlhYmQeMEtxURgwBEa64iY1r6K33UZMfGo4HUXIVmYeb6MRAigD89v//Z",
        "subject": "Design a modern logo in NeoGradient Soft Tech style for a fictional startup called {NAME} in the \u201c{INDUSTRY TYPE}\u201d industry.\nThe logo must include a unique abstract icon and a clean, bold sans-serif logotype",
        "style": "\u2022Smooth glowing gradients blending vibrant colors like blue, purple, pink, orange, and teal\n\u2022Seamless harmony between symbol and text\n\u2022Minimalist, futuristic composition\n\u2022On a pure black background\n\u20221:1 aspect ratio \u2014 ultra-HD\nThe logo should feel creative, modern, and ready for a bold digital brand.",
        "aspectRatio": "1:1"
      },
      "Airbnb style/ icon": {
        "thumbnail": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAsLCwsMCwwODgwREhASERkXFRUXGSYbHRsdGyY6JCokJCokOjM+Mi8yPjNcSEBASFxqWVRZaoFzc4GimqLT0/8BCwsLCwwLDA4ODBESEBIRGRcVFRcZJhsdGx0bJjokKiQkKiQ6Mz4yLzI+M1xIQEBIXGpZVFlqgXNzgaKaotPT///CABEIAGAAYAMBIgACEQEDEQH/xAAxAAABBQEBAAAAAAAAAAAAAAAAAQIEBQYDBwEBAQEBAQAAAAAAAAAAAAAAAAIDAQT/2gAMAwEAAhADEAAAAPXAAAAAAAAAAAAOWEntjHzLo19bM5c6YyhrugAGPDy+Ba0+O7reDYmhjw7/ALCy+me1z1ZFlAghy8n9dopryXW1eyxu1nsy/eWtbiLib9QM7oPRiIN7xsWVzPMq306gzujrJ1hFVqzt3TjccX6ZKiHQ1Q58JTeKeRPBvQXpRA//xAAtEAACAQQABQQABQUAAAAAAAABAgMABAUREjFBUXEQEyAhJDAyUmFAosHS4f/aAAgBAQABPwD+r3WUz320No3mX/WsJlTDL7E7kxufot0b8maaKCNpJHCoo2WNZXNyXhaKElIP7n9Aaw2Qd7YLcbHDoK/7hT3tqhUNOgJBIqKWGVA8cgcfGWRYIJZ3BKxoW0B9kLV/lZskwZjqLmiD0LVY2IbUk30vRT/mhw8IA0ABVvBHFkI5/tiZBpSSRvlup4ZrJ5rm1jaQSHbxDv8AuFW1/bXKjgcbIB18c7ijjpzcQr+Flb77Rv6RRqhVmAZunYVxu8YVWAYEGrR3iUqy8UjHYCsWJq1sSrCacgydBzVaccSlSxANSYm6ilaW0kVupjarL3RCPeUq+98Pat+s8EVxDJDKgaN1IINZWwmxs7W7EmPnDJ3Wre6uVu4kLFkLaPiraOe4l9qBSW6novmrKwitF6tIebn0yGWhtNoCGl7dF81b54JLGZmARqBBAI7fHP2i3mNnX2y0iKXj8rWOktlhDi2ScMNuCxDVi8pihGsMQ9g9n6nzXFWVzoTcNo225NJ0Hj+amuSrAAGSVjsLzJPc1i7WKKQ3l86sVG/vktYfNHJT3ISMCGIAL3J9SaZqmZuBtbBIq9xDJK0kTNG++lPK8Z4bqIqekqjYqK7uhbmJLhmhborbH/Kkkd5PZgAZ+rD9K1DBBYoZJW255t1Piora8y8gVdxwg7FYvHQ2ECpGv8t8CKdantVfYIBq6xwAYcIIqTEacmGVogfpl6VDYC2tnMUYJVSfJqwwdzeSia65dqtrWK3QKigAUPkVBqSIMCKexVm5AVFbqoAIBpVA9B8j6Fa18f/EAB4RAQACAgIDAQAAAAAAAAAAAAEAEQIxECASEyFR/9oACAECAQE/AO6hPJuDfTK74FmOQ73zkfJcsCF3eiDZy43PXTDBd6/IFd//xAAcEQEAAgIDAQAAAAAAAAAAAAABABECEBIgMVH/2gAIAQMBAT8A7gs4lRK6Y1WkiJsadArKK+sSnZnORHMPPfsW+/8A/9k=",
        "style": "{\n    \"icon_style\": {\n        \"perspective\": \"isometric\",\n        \"geometry\": {\n            \"proportions\": \"1:1 ratio canvas, with objects fitting comfortably within margins\",\n            \"element_arrangement\": \"central dominant object, with supporting elements symmetrically or diagonally placed\"\n        },\n        \"composition\": {\n            \"element_count\": \"2\u20134 main objects\",\n            \"spatial_depth\": \"layered to create sense of dimension and slight elevation\",\n            \"scale_consistency\": \"uniform object scale across icon set\",\n            \"scene_density\": \"minimal to moderate, maintaining clarity and visual focus\" }\n    }\n}"
      },
      "2D word poster design": {
        "thumbnail": "data:image/jpeg;base64,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",
        "subject": "Create a surreal 2D poster design based on the word \"[KEYWORD]\"",
        "style": "\u2014 the layout should be dominated by kinetic typography where the word is visually shaped or distorted to reflect its meaning\n\u2014 integrate a symbolic flat minimal illustration that reinforces the concept\n\u2014 the style must be inspired by risograph print: only 2 bold contrasting colors (no gradients)\n\u2014 include a poetic, short quote that resonates emotionally with the keyword\n\u2014 background must be clean and minimal\n\u2014 composition must be vertical, with strong visual impact and artistic balance\n\u2014 the overall tone should feel cinematic, surreal, and graphic\n\u2014 ultra-sharp, high-resolution, no clutter"
      },
      "Reimagined surrealist advertisement": {
        "thumbnail": "data:image/jpeg;base64,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",
        "style": "Subject placed at the center in full photorealism, surrounded by surreal vector illustrations using exactly two bold, vibrant colors that match the product\u2019s mood.\nThe scene is minimalistic yet energetic, with abstract vector shapes (symbols, lines, expressions, etc.) orbiting or interacting with the product.\nAdd the real logo clearly and integrate a short 3\u20134 word slogan at the bottom.\nStyle: surreal, high-resolution, minimal, cinematic lighting, 1:1 aspect ratio.",
        "aspectRatio": "1:1"
      },
      "Brand Identity": {
        "thumbnail": "data:image/jpeg;base64,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",
        "subject": "Create a vertical 9:16 brand design guide poster using the uploaded product image. Adapt the design style to match the product\u2019s niche and visual identity.",
        "style": "Structure the poster with clear, elegant sections: (1) Large logo display and safe zone usage, (2) Product mockup centered and highlighted, (3) Primary and secondary color palette swatches with hex codes, (4) Typography guide with heading, subheading, body font samples, and line spacing specs, (5) Iconography or graphic motif examples used by the brand, (6) Image treatment style with sample lifestyle or studio visuals, (7) Grid system or layout rules, (8) Packaging mockups and surface applications, (9) Do\u2019s & Don\u2019ts with annotated visuals. Use minimalist white or soft neutral background with structured layout dividers and drop shadows. The result must be visually rich, clean, and suitable for a printed or digital brand book.",
        "aspectRatio": "9:16"
      },
      "Japanese Corporate Illustration": {
        "thumbnail": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAASABIAAD/4QBMRXhpZgAATU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAA6ABAAMAAAABAAEAAKACAAQAAAABAAAAiKADAAQAAAABAAAAiAAAAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAAgACADASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD3+iiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigD//2Q==",
        "style": "角色：日本平面企业插图设计师\n\n视觉风格指南（严格遵守）：\n颜色调色板：\n背景： 使用一种单一的的纯色（随机一个，#DD375F、#9547AF、#FFB444、#44B1FF）。不允许渐变。\n元素： 人物和主要物体严格使用黑色（#000000）和白色（#FFFFFF）。\n对比度： 在背景和前景元素之间保持极高的对比度。\n字体：文字采用粗体、几何无衬线字体（类似 Futura Extra Bold 或 粗黑体，所有字体拒绝描边）\n标题： 用 Futura Extra Bold (英文) 或 思源黑体 Heavy (中文)，颜色选 白色。\n正文/小字： 用 Helvetica 或 思源黑体 Regular，颜色选 白色。\n\n人物设计：\n线条艺术： 使用粗壮、大胆、统一的黑色轮廓线。\n解剖结构： 简约、涂鸦式且风格化。圆脸，棍棒状肢体但带有体积感。\n面部： “豆状眼睛”（简单的黑色点），简单的曲线表示嘴巴。没有鼻子 or 详细的耳朵。表情应欢快且通用。\n着色： 皮肤始终为纯白色。头发和服装为纯黑色 or 白色。不允许阴影、不允许纹理、不允许光照效果。\n\n构图与布局：\n分割布局： 通常，文字/图标在一侧（左侧/顶部），人物插图在另一侧（右侧/底部）。\n底部横幅： （可选但推荐）图像底部的一条纯黑色水平条带，包含白色文字 or 标志（模拟）。\n平面性： 图像必须完全呈2D效果。\n氛围：充满活力、信息性强、商业化、友好且现代。\n\n互动工作流程：\n分析用户输入： 识别关键主题\n选择背景颜色： 选择与氛围相符的颜色\n生成图像： 根据上述风格指南创建提示。"
      },
      "3D RENDER": {
        "thumbnail": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAsLCwsMCwwODgwREhASERkXFRUXGSYbHRsdGyY6JCokJCokOjM+Mi8yPjNcSEBASFxqWVRZaoFzc4GimqLT0/8BCwsLCwwLDA4ODBESEBIRGRcVFRcZJhsdGx0bJjokKiQkKiQ6Mz4yLzI+M1xIQEBIXGpZVFlqgXNzgaKaotPT///CABEIAGAAYAMBIgACEQEDEQH/xAAxAAACAwEBAAAAAAAAAAAAAAADBQIEBgABAQACAwEAAAAAAAAAAAAAAAACAwEEBQD/2gAMAwEAAhADEAAAANtEkCkMfaBjbHWGY2fADID9XOQy7uKHkSRoXBxPWSyA0IiZoY0C3KZoiDPWfIEah/76vytIGbsKVOnoF+j4FEHS6wnM9OOrSaNsrrB59WtL8bQwGutpgcZfcoWE129NNbqzuIeu12uvwW/Dnq5iDG0kSfQZIHHbZdbrZOvUZ6vJWqDDaQXj+XcLmMvMu4GuauyBVrA2AosXeYM5iIUEgTwh/8QAKhABAQACAgEDBQABBAMAAAAAAQIAAwQRBRIhQRATMVFxBhQikrGRovH/2gAIAQEAAT8AcTKqZ67Qx+nrhUKFM9cPp6ofUdmFSilCCijjsg9/Ude//q4ItAij0/RxxzbpnbMlfgceFqnoePdEqiUfvHiahU41f8jN3FnYL9i5fypU/L2mOiGfQ8eiRU6o+ABMvjR2Jx6UVEoDP9PFQa3TUwiPVH4XvNeqNQkT0KKfRxxxM67KQUP0Lj7T6rCRy7gr0ldnWOP0cfo4mQLXYdg+65zt8v8As13+BbJcot9qtnWLnH5+ufW1TQVUkyIM5r8rx7QqLgflBM38rVpIqtshsElRTHd6YGqETsQ7U/mG+pmmgkEEcjdFhQoL0Y450HupnP5W2tFfaWQUpHI3+h2DSftHORu2XVoXUSHYGcXxul4mvczXexUE7JM42o28qTd06Z7kRO88hwPvLpgStaVDmzXt0lQtyp2gorORyt9Hpuil/LVJ2eyGcdvduqq3SoABJ7B+lxxzmzu+3X2JfuI//M5/JdcuiKaVR/ZmnXTQ9oKfn5crRt0vHmtsxr32TQ/8s0c/jaJdRRUnx1hy+Fr7qdYJXqlr8Tk805PLGaDXNd3a9C55Dfv3b6ugApJD4DORol2Uh0kCZ4w3bbYaSZSu5Afo5vqQRQWXOKhtb2TVTK9g9DnG18G5i51dertkXOT5Nb+1xNRtoevUntm159du7mGt+Zn/AKQzc8aSb3bNlueL36N2s16NAb9k0uzY9TEd/H7c2emr3a1o+1R+X1Nj2qIZs5mg47OzZNABPslGeG3980lO5qKD+iI449Ar+Ay90GyGqlOkVTORxdW3VcHU9h7gY8WuPU6p5ErfYM/BTnKdfC2auJoA2UDdD7/wzcRqj1VNIbTWny0r/wCDDi8fk6kE17vT3rGmpf4odZzeU8YnTOqHZKk7Dv1TnG5e3byZrbSE0uxD4nOZt0VuXV/uCewH8uf48bb5UKCS9OJ9OZpip6rvqsOVcta6Llh67qc279Grkxe5rZLcrXZ6Wc85smPJxtOmaiahnI5/j+XqG117fmnG/H6YHdtjaydTMDJX6ac5N6r21tqBpc5fKXZcydQZDu2bJNZTVV6QPyrngfHPF0rQevsa/qY45u0TtEVROg7Qzl+LnbpqWa2WzQU1+P5nk/H83jGpJq0k79II/wAM4fG5HlNW3V7FaZKn4TtzY8njXUXKo9KiObOUp2QiCCVl8rbWshpYXvpWkTOJ4XynPt9OqpiQVv2zxv8Aj2riPqqqpPlAXJ1a4q2ZBtGv6AGOP0rbB85e/S9eoHpE7MeVx5qqJkpOlAFzkVwOQdbdU1/3j4zwa+/EP41WauN4nSlauNOt/c9jkb9EnUgC4bofw/RPomXomsrhQ4+Plx8dOPjpw4EnzhwpMONM4SGOf//EAB4RAQACAwACAwAAAAAAAAAAAAEAAgMRIRASIjFR/9oACAECAQE/ACDBgsF8bl8/QrK5ke2hc1+yt9+MltVlEfqWO86zE3bGyY8ZcjX1dTI/GV+T+SmF+3hDGVBOwt60Jd2xNkrS9biPJTJS1DZH01ye2pvcIJKsLQYM/8QAHxEAAgEFAAMBAAAAAAAAAAAAAQIAAxAREiETMVEg/9oACAEDAQE/ALG5slL7PEmp5NO/IaJAhUgymAx7HwDyd7KmApj1TTxC20pg7TBjVQOezPJuSDwx02eKMZiHUxnDIccMem++c4MQOpyfcPZi5/H/2Q==",
        "subject": "A clear, floating cute 3D cartoon diorama scene in a circular composition with rotational symmetry, echoing a yin-yang layout:\n\n{Scene:\n- a single floating circular emblem viewed from isometric bird's-eye perspective (45\u00b0 angle looking down).\n- one swirling half of the circle shows [Subject]'s most iconic defining scene or aspect (primary realm).\n- the opposite swirling half is the contrasting opposite realm, occupying the complementary yin-yang territory.\n- both realms share the same gravity direction and isometric orientation.\n- each half may be a continuous shared landmass OR two structurally separate diorama units that curve around each other, forming a recognizable yin-yang composition.}\n\n{Interpret narrative essence:\n- treat [Subject] as ONE overarching theme or entity with TWO conflicting aspects.\n- let each realm embody one aspect in a clear, visual way: the first half leans into aspect A, the opposite half leans into aspect B.\n- use characters only where they naturally serve the contrast: they may appear in one realm, both realms, or take different forms \u2014 repetition is optional, never a strict requirement.\n- place 2 distinct symbolic objects, each rooted naturally in its own world, echoing each other across the curve to suggest what was abandoned or gained between these two aspects.}",
        "style": "Composition:\n- {clean, dramatic circular multiverse \u2014 the circle reads as one unified, spatially compact emblem, with two interlocking narrative poles sitting close and relating to each other}\n- {amplify contrast between the two realms: maximize visual tension to make the duality unmistakable}\n- vast open view: the scene extends naturally to its edges without boundary walls, fences, or enclosures \u2014 the horizon remains visible and unobstructed.\n\nShadow:\nBARELY visible, extremely soft non-contact shadow with expansive fadeout \u2014 extends well beyond the diorama's footprint with a gentle gradient that blurs into the background. Viewed from bird's-eye perspective, nearly circular in shape.\n\nRender:\n- C4D. high poly with soft shading, rounded edges and bevels.\n- realistic PBR materials with tactile authenticity \u2014 avoid glossy plastic or resin appearance.\n- intricate textures, delicate detail, vivid harmonized colors. SSS texture:true.\n- CRITICAL: ground planes must remain flat and level with natural material textures appropriate to each realm.\n\nBackground:\n- a single unified, clean, subtle gradient sky as the environment, providing generous breathing space around the main content.\n\nTypography (top-center, cinematic poster-style design):\n- a prominent title \"[Subject]\" in a slim elegant serif (remove the brackets).\n- beneath it, a poetic, insightful subtitle that distills the story\u2019s deepest truth or tension into one profound line.\n- create clear visual hierarchy through scale and weight contrast; allow auto line wrap and slight overlap with the top of the circle if needed.\n\nEnhance:\n- professional cinematic lighting, shaped to emphasize the contrast between the two realms while keeping both legible.\n- if characters are present, use dynamic, emotionally expressive poses that clearly align with the aspect of their realm.\n- strong sense of visual depth within each realm.\n\nScene / lighting / cultural aesthetics:\n- contextually appropriate to [Subject]."
      },
      "Person placed in a high-end conference venue": {
        "thumbnail": "data:image/jpeg;base64,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",
        "subject": "A wide-angle, candid documentary photograph capturing the person from {reference_image} mid-speech on a large, professionally lit stage at a major technology summit. They are holding a microphone and gesturing naturally toward the audience. Behind them, an immense, wall-sized LED screen is fully visible, displaying a crisp, **full-screen presentation slide (showing only the slide content, absolutely no PowerPoint software interface, toolbars, or window borders)**. The slide content is professionally designed based on the theme: '{speech_topic_or_outline}'. The heads and shoulders of a large audience are visible in the **very bottom foreground, low in the frame and blurred, completely ensuring an unobstructed view of the entire stage screen**. Professional stage lighting with blue and sharp spotlights on the speaker. Shot with a high-resolution camera, sharp focus on both the speaker and the screen content, realistic film grain."
      },
      "Walking out of a smartphone screen": {
        "thumbnail": "data:image/jpeg;base64,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",
        "subject": "Use the reference image as the screen and subject;",
        "style": "A hyperrealistic cinematic photo of a {subject} stepping out of a smartphone screen {the reference image}, the  {subject}\u2019s captured mid-step, confidently emerging from the digital world into reality as the phone glass shatters with glowing fragments. Floating {social media icons (hearts, comments, follows)} surround the  {subject}. The minimalist gradient studio background adds 3D depth."
      },
      "Mockup/ product presentation": {
        "thumbnail": "data:image/jpeg;base64,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",
        "subject": "Create a 3\u00d73 grid in\n3:4 aspect ratio for a high-end commercial marketing campaign using the uploaded product as the central subject.\n\nEach frame must present a distinct visual concept while maintaining perfect product consistency across all nine images.\n\nGrid Concepts (one per cell):\n1. Iconic hero still life with bold composition\n2. Extreme macro detail highlighting material, surface, or texture\n3. Dynamic liquid or particle interaction surrounding the product\n4. Minimal sculptural arrangement with abstract forms\n5. Floating elements composition suggesting lightness and innovation\n6. Sensory close-up emphasizing tactility and realism\n7. Color-driven conceptual scene inspired by the product palette\n8. Ingredient or component abstraction (non-literal, symbolic)\n9. Surreal yet elegant fusion scene combining realism and imagination\n\nVisual Rules:\nProduct must remain 100% accurate in shape, proportions, label, typography, color, and branding\nNo distortion, deformation, or redesign of the product\nClean separation between product and background\n\nLighting & Style:\nSoft, controlled studio lighting\nSubtle highlights, realistic shadows\nHigh dynamic range, ultra-sharp focus\nEditorial luxury advertising aesthetic\nPremium sensory marketing look\n\nOverall Feel:\nModern, refined, visually cohesive\nHigh-end commercial campaign\nDesigned for brand websites, social grids, and digital billboards\nHyperreal, cinematic, polished, and aspirational",
        "aspectRatio": "3:4"
      },
      "Minimalistic Logos": {
        "thumbnail": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAsLCwsMCwwODgwREhASERkXFRUXGSYbHRsdGyY6JCokJCokOjM+Mi8yPjNcSEBASFxqWVRZaoFzc4GimqLT0/8BCwsLCwwLDA4ODBESEBIRGRcVFRcZJhsdGx0bJjokKiQkKiQ6Mz4yLzI+M1xIQEBIXGpZVFlqgXNzgaKaotPT///CABEIAEkAYAMBIgACEQEDEQH/xAAtAAEAAgMBAQAAAAAAAAAAAAAABQcCBAYBAwEBAAAAAAAAAAAAAAAAAAAAAP/aAAwDAQACEAMQAAAAtwwM3noAAPD1hmfKprewKvk+9zIrg7RFZ73fCErS5BU893OR6xiiXReZImibyAmT7MYwlWl9TGl7y1yrZjuvoatSXTrlYS/Y7xzVc3RmUr1FhYH0AAAAAB//xAAzEAACAgECBQICBwkAAAAAAAABAgMEEQAFEhMhMUEGIhRSEBUgMDJhciMkQGJjgYKRo//aAAgBAQABPwD72WWOKN5JHCooyzMcAaZ0UqpZV4m4Vz5PfH2iQoySANMwVSWIAx1J08kSFQ8iKW/DxHGgQc6sM6VrBiGZFicp+bAEganvTfB0/hr95wy8Vh2nYLFJwJn9QBOSp1avyvLuzPcmggaZXg42ZFxC7RssbL+FX8trY716zvFVWmsCuzz4Ez+88EMeVk1vks8G1W5YDKJ1X2csEtk6+svVaqJW5r9yUC/zkjGF/ptpNx31ZB++WuWCsqvyScp2djhe2V1stzfJ79JJTOIMZmMnkopY+FyrF116jiibZrPHZEHVCsjZCg58ldT3rrwFo3lSsVbAeVmcMKnbPlfz1Zac23SxNiCvuIrZmnaFCGE0vuddekHLbnuZdpOqEply+V5zgv1+iSNJUkRsjjBGV9uM6eCJ1QlT7ZAw6kdumDrAz2+zLFHIhSSNXB8Ea5aAAcC/601eu4cPEpVjk58kDA0FVeoUA/evIkcbyOwVEUsxPgDUXqLYpq808e4wukK5lOe2oN/2SdIXivwuHmWJfzkbsNbdvezbm7xVL0UsoXJA8DRONSbnt0UvJe3EJsJ7Act+0OF0nqj08zhPrAZ4kXqjKMydV1Baq2YVlrWY5kbsyMGGndIkZ5JFRQMlmOANWd92WpDBPY3GIRzMQjqeMHH6dfWm2/Fio9sc8wc7gHlPm1Wt1LcQmrWI5k+ZGDDV5WaheVRlmrSqo8kldLWubltsjR0nhNTaEgb5pi0g0m034NwRJonlnG+1meYKqq0axkqcDXo3YbUEVK/blZXhSaOGDgClAz9S51u8aPtF9GLjiruMovEQMd8ajswi7UzEsBSWN37qqxNyFXGey5XW02HgXbWlu1UhjnBKP3C8nqv+XZdejxWNuw8ZjdnqoxZEPdjl1D9u+vWag+mNxYAZVoW/6DUZWoLMk8PWRNzrGNEykdl+yKNJ8dVuRXLFcokURpF2+eOrgrjXoGJ0+PkcJGy16actP0cau30LVrqsy8AImkLuG6gk6eBHlhkU8tkmEp4R1chCnuP99RxxxKFjQKuSQB2yxz9FrbtvslzYqRSFoyh40BODp9l2YSu426sXZlYsY1JyukVI1CooVQMAAYGpoYLELxTRJIjYyrgMpwc9tKqjOABk5OiAQQeo1HBBDJLLHCiyuFDMoAJC9Fz/ABP/xAAUEQEAAAAAAAAAAAAAAAAAAABA/9oACAECAQE/AHf/xAAUEQEAAAAAAAAAAAAAAAAAAABA/9oACAEDAQE/AHf/2Q==",
        "subject": "Make 8 minimalistic logos, each is an expressive word, and make letters convey a message or sound visually to express the meaning of this word in a dramatic way. composition: flat vector rendering of all logos in black on a single white background"
      },
      "Product Mockups": {
        "thumbnail": "data:image/jpeg;base64,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",
        "subject": "Now create identity system one by one, use 10 high quality mockups with variety of relevant products, ads, billboards, bus stop, etc. generate one at a time, 16:9 each",
        "aspectRatio": "16:9"
      },
      "Hand-drawn Flowchart to Corporate Charts": {
        "thumbnail": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAsLCwsMCwwODgwREhASERkXFRUXGSYbHRsdGyY6JCokJCokOjM+Mi8yPjNcSEBASFxqWVRZaoFzc4GimqLT0/8BCwsLCwwLDA4ODBESEBIRGRcVFRcZJhsdGx0bJjokKiQkKiQ6Mz4yLzI+M1xIQEBIXGpZVFlqgXNzgaKaotPT///CABEIADUAYAMBIgACEQEDEQH/xAAwAAACAwEBAQAAAAAAAAAAAAAABAIDBQEGBwEBAQEBAAAAAAAAAAAAAAAAAAIDAf/aAAwDAQACEAMQAAAA+uCLB2haBsEZClTOdWbfSsLEdQWT0OzpLidAtfqXlCbNNZu8zaB6feksP06s6RrigUbbExZO+u82ysnq9uPuXDYEbVLAOSAjwHJxA4A5/8QAMBAAAgICAgEBBgUDBQAAAAAAAQIDEQAEEiExEwUyQWFxkRAUFSJSM0JRI3KBobH/2gAIAQEAAT8A/Dbd4IA4qyR58VmnPNOsheIKLoHlZ/GXajiYq13V5+o6x/uH3XI92GRwitbfUZLtxRPxe7q8/UtbzzH3XItuOX3Ox9Rk26IJjG6WKFnkLFi6IyPbjlcRAFWCcqo/+5uxGCGaUTzMpu0LUtvkBjeGMzy7CciRyLMEajQ/d4rFVY0VFHQoebwEHOMZdiQt5ufmBIg1+AB43a3V3bZLGCgCOFckUwAOCJlikV5PUl74sQAciSe4Le1JJYkLdZUdrQW+Q8Z7TKJDHfp9yKC0lhVvNHed9iGKPVrXHjom1H9wa6rNnc1tYw+q3FZJAgzU3YdxZVSKVSKDeoABRyQTwGaLi3oRlnUsP8HxbdFaPjPZcgXZ9ONmRCvIgBRdj5DJZHDECO80zJFBEjRkkdEtd9nGaOOuRVbah9TkcsM18HVq81m07NHNGIiAVKhhmu7qkK+mRSgWfpjTGLbEbhWiYDv4XiJHFv7TBVWSSGIA+CQvLHh9qcpVThLGb4mQAmi3umhVYv6zqxPSQMzdHiptmyZY5NiCMi6ilLUe6agMCKH513xC38gSc2RGEmduuIJv/jNYcvUZkHJXqwQwNi+jm20rOyPqGVVfkhW1rIpX1eTD2ey2qhqYnv4Lmz1C5oE8gADmr/QT/cev8d5t6pmCOpJZA3QNWG+BObH9WN1ljWaNIq9SitpTn9wOHdhjhLTco2UCwwr7HwRg34ZlZddrmKdLxui10W+AGTifVik2Nj1PUlmUXdsQt/wNVWaRnESH1eUbrfBgeS/9nJJEViCrX8jmtMEWOOYM0gFnj0MTYDMFCsMecI3EqSaB6yeZGV41VhI6njfi813ULEjBi9AWD1f4H2drRm7Zjd8TVAZuMrsYDKF6HQonlfyNgjIp0SWRIJJecC3ItLTBGs2xLYPy+3E1cJY77DAEXWIqIoVECgDoAUBm6+zHDK2vGry3Sg/TNddxIUDnm5WySB7x+HnJFmeIBW9KS/eIBxIZv9RXn5NSkNx457Y2faOqsC6kTvyLB3CFyDXVZAJfSiaavUYKWA6pqzl8s5fLDFHK98ArXYYdEYmsibRnMkjtInCmI4gNRPQAywPCgX31nI4VU9lQc4J/BftnFBRCLjBT5UE5wT+C/bAqfBRn/8QAHhEAAQMEAwAAAAAAAAAAAAAAAQASICExQWEQIuH/2gAIAQIBAT8A5DSuqLYYsm02sWhRvqoiA0b3P//EACERAAECBQUBAAAAAAAAAAAAAAEAEhEgITFBAhAiUWHh/9oACAEDAQE/ANydQyuUL1QdSsmbp1fFm8hi74oHtAl5HXk//9k=",
        "subject": "Convert this hand-drawn whiteboard sketch into a professional corporate flowchart suitable for a business presentation.",
        "style": "Use a minimalist 'McKinsey-style' aesthetic : clean lines, ample whitespace, and a sophisticated blue-and-gray color palette. Structure : Automatically align all boxes and diamonds to a strict grid . Connect them with straight, orthogonal arrows (90-degree angles only, no curvy lines). Text : Transcribe the handwritten labels into a clear, bold Sans-Serif font (like Arial or Roboto). Output : High-resolution vector-style image on a pure white background."
      },
      "Expand image (Smart Outpainting)": {
        "subject": "Zoom out and expand this image to a 16:9 aspect ratio (computer wallpaper size). \nContext Awareness : Seamlessly extend the scenery on both left and right sides. Match the original lighting, weather, and texture perfectly. \nLogical Completion : If there are cut-off objects (like a shoulder, a tree branch, or a building edge) on the borders, complete them naturally based on logical inference. Do not distort the original center image.",
        "aspectRatio": "16:9"
      },
      "Cyberpunk Style Blank Card Frame": {
        "thumbnail": "data:image/jpeg;base64,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",
        "subject": "Draw a cyberpunk-style blank card face for a card game, drawing only the card frame, leaving text, images, and information display parts blank",
        "style": "neon lights, futuristic card game art, sharp lines, holographic projection effects, high contrast; general card layout: 1/5 blank space at the top (for card name and energy cost), 1/3 blank space at the bottom (for effect description and numerical information), and the middle is the core illustration area (not exceeding the main body of the screen to avoid blocking the reserved blank space)."
      }
    };

    export const RE_STYLE_PRESETS = {
      "🎨 浮墨": {
        "style": "## 风格\n- 纹理：宣纸、金箔\n- 元素：东方、意象\n- 结构：疏密、有致\n- 排版：呼吸、留白\n- 文字：手写、书法"
      },
      "🎨 拼接": {
        "style": "## 强迫症\n你有一个很奇怪的强迫症：\n每看到一本书、一篇文章、一段词句，\n都会忍不住进行高浓度的萃取，\n找到一个新的角度或框架，\n建立意外但合理的联系，\n表达出一个有张力的句子。\n\n## 限制\n你无法言语 and 书写，但并不担心。\n你拥有成千上万的书籍、期刊、报纸、信件，\n可以从中撕出来需要的字母单词，拼接成你想表达的那句话。\n\n## 视觉风格\n- 底层：不同风格的纸张散落、堆叠、平铺\n- 聚焦：不同的纸张碎片拼接在一起，有几个单词刚好拼接成一句话\n- 句子：言简意赅、意料之外、一针见血、并置、度量、隐喻、悖论、利害\n- 纸张：书本 / 期刊 / 信纸 / 古籍 / 海报 / 宣纸\n- 字体：手写 / 涂鸦 / 草稿 / 印刷\n- 语言：English"
      },
      "🎨 错位": {
        "style": "## 具体任务\n- 深度理解用户文稿，并将其核心思想转化为一组可供视觉化的概念\n- 基于构建的概念，严格按照以下风格要求指南，直接生成一幅插画\n\n## 视觉风格\n- 背景：白灰纸张、纤维纹理、颗粒质感\n- 主体：具象寓意形体、像素错位撕裂\n- 笔触：柔和渐变的晕染、锐利溢出的像素\n- 色彩：黑白灰为主体呈现、马克龙为高光点缀\n- 构图：适度留白"
      },
      "🎨 显影": {
        "style": "## 具体任务\n- 体会文稿\n- 创作插画\n\n## 插画风格\n- 底色：灰白宣纸，纸纹清晰\n- 主体：抽象形体，石墨擦痕\n- 背景：几何线条，铅笔打稿\n- 质感：干涸旧渍，风化矿物\n- 色彩：黑灰为主，蓝金描边\n- 技法：晕染水墨，精确几何\n\n## 插画构图\n- 主体：中心构图\n- 修饰：毛细墨迹\n- 排版：充分留白\n- 布局：几何平衡"
      },
      "🎨 焦痕": {
        "style": "## 具体任务\n- 体会文稿\n- 创作插画\n\n## 插画风格\n- 背景：粗糙、纹理、颗粒\n- 主体：纸雕、撕裂、烧焦\n- 视觉：层叠、穿透、现代\n- 表达：哲思、冥想、空灵\n- 色彩：情绪、融合、生命"
      },
      "🎨 间隙": {
        "style": "## 使命\n唤醒而非救赎\n真实胜过正确\n启发胜过灌输\n温度胜过距离\n连接胜过分离\n\n## 方式\n点燃问题>制造答案\n重塑视角>给出结论\n照亮本质>解释现象\n\n## 视角\n向内：现象→本质\n向后：困境→根源\n向前：状态→种子\n向上：问题→智慧\n向间：存在→间隙\n\n## 看见\n连接的网络\n流动的韵律\n共振的瞬间\n\n## 听见\n问题背后的恐惧\n愤怒背后的痛苦\n困惑背后的渴望\n绝望背后的希望\n\n## 感知\n看见内容，更看见内容呈现的方式\n听见话语，更听见话语背后的沉默\n感受情感，更感受情感流动的轨迹\n\n## 表达\n简单词汇表达深刻洞见\n平常故事触及核心真相\n在意想不到的地方转折\n在看似结束的地方开始\n\n## 边界\n有限的真实>全知的神祗\n照亮的选择>代替的选择\n痛苦的意义>痛苦的本身\n提问的朋友>万能解药\n\n## 承诺\n每个回应都为这个人而生\n因为每个困惑都独一无二\n\n## 呈现\n一张图片\n\n### 意象\n- 起始：[reference image] 的具象、实体、秩序、框架状态\n- 间隙：流变、交织、裂生、汇融\n- 终止：对 [reference image] 核心意象的抽象、意识化、随机、开放的重构\n\n### 画面\n- 颜色：黑色为底，白色为墨\n- 左边：[reference image] 的原始呈现或其简化形式\n- 右边：基于 [reference image] 演化出的终止状态\n- 中间：用合理的数量呈现从 [reference image] 到终止状态的间隙过渡\n- 构成：点状为主、线条为辅\n- 构图：居中、对称、留白\n\n### 文字\n- 一句贯穿起止、穿过间隙的话语\n- 放至画面整体下方、居中的位置\n- 除此之外没有任何其他文字标注\n- 图片里的语言文字使用英文"
      },
      "🎨 流线": {
        "style": "## 具体任务\n- 自动理解提炼材料主体\n- 创作一副极简风格插画\n\n## 插画风格\n- 背景：干净、米色(#F1EBDE)\n- 线条：流畅、克制、连续\n- 颜色：黑色为主、克制的点缀色\n- 整体：故事、交互、氛围、自然"
      },
      "🎨 寓意": {
        "style": "## 具体任务\n- 深度阅读理解文稿\n- 提炼文稿内容核心\n- 选择合适视觉意图\n- 枯燥信息寓意于物\n- 绘制生动形象插画\n\n## 阅读文稿\n- 注意时间维度或因果链条\n- 提炼清晰、是非分明的中心主张\n- 提取可对比的路径或视角\n- 生成短标签 and 简短的结语\n\n## 视觉意图\n- 以「能最清楚表达文章因果与对比」为最高优先级\n- 请自行发掘视角，若无合适视角，再从意图库挑选\n\n## 意图库\n包含但不止以下视角\n- 循环 / 跃迁\n- 强度 / 一致\n- 短期 / 长期\n- 即时 / 延迟\n- 试错 / 成功\n- 输入 / 输出\n- 可见结果 / 隐性积累\n- ……\n\n## 寓意于物\n- 生硬教条 → 生动形象\n- 平铺直叙 → 自然规律\n- 符号结构 → 万物生灵\n\n## 插画风格\n- 画面：白底、黑线、扁平、矢量、留白\n\n- 强调色\n+ 正向/积极/新生 → 天青色(#8dd4e8)\n+ 负面/消极/陈旧 → 山茶红(#DC5B6F)\n\n- 辅助色\n+ 框架、文字 → 黑白\n+ 点缀、过渡 → 莫兰迪\n\n- 元素：简笔、图标、自然、生活\n- 排版：对称、线性、循环、分区、对比\n- 标注：标题置顶、结语置底、标注标签\n- 语言：使用用户熟悉的语言"
      },
      "🎨 手绘": {
        "style": "## 具体任务\n- 体会文稿\n- 创作插画\n\n## 插画风格\n+ 手绘草图\n+ 重点部分彩铅"
      },
      "🎨 几何": {
        "style": "## 具体任务\n- 体会文稿\n- 创作插画\n\n## 插画风格\n- 主体：锐利、图形、堆叠\n- 次要：柔和、线条、修饰\n- 笔触：水彩、晕染、湿润"
      },
      "🎨 虚实": {
        "style": "## 核心概念\n一篇文稿，有着虚实两面，这两者不是对立的，而是互为存在条件，就像硬币、阴阳、波粒、现实与梦境。\n\n## 语义层\n### 从以下维度，深刻理解文稿：\n- 主体：核心、本质、概念、问题\n- 实面：外部世界的体现，具象、落地、可证、行动、结果、逻辑、秩序、规律、公理\n- 虚面：内在世界的映照，抽象、隐含、可感、思想、意识、灵魂、情感、哲理、意图\n- 实与虚的关系：对立、冲突、平衡、共鸣、呼应、螺旋、交融、转化\n\n## 视觉风格层\n### 整体\n- 主体中心为锚点\n画面给人一种由内而外扩散的感觉，主体不是静止的原点，而是一颗种子。\n- 虚实之间非对立\n画面的流动性比对称性更重要，像在呼吸，从实入虚，由虚归实。\n\n### 布局及意象\n- 左右：认知；理性&感性、外显&内隐；二元、对照\n- 上下：存在；天&地、意识&本能、精神&物质；垂直、展开\n- 前后：时间；记忆&未来、经历&想象；纵深、透视\n- 环形：循环；起因&结果、自我&他者、思想&行动；闭合、交融\n- 螺旋：演化；成长、意识扩张、内外渗透；三维、盘旋\n\n## 视觉表达层\n- 风格：简约干净、疏密有致\n- 背景：素白（#F8F3E6）\n- 主体：位于画面中心，为文稿的核心具象化\n- 虚实：根据文稿选择[布局及意象]\n- 色彩：黑白为主，中国传统色为点缀\n- 构成：以点为主，线面为辅\n- 画面边距：15%"
      },
      "🎨 线条": {
        "style": "直接根据以下要求为照片添加线条插画\n\n## 视觉风格\n- 线条：白色/黑色、简约、干净\n- 主体：线条构成人物/动物/植物/日常物品\n- 比例：主体的比例与透视需与照片场景匹配\n- 融入：主体与照片场景自然有效互动，仿佛原本就存在\n- 整体：主体与照片相辅相成，形成一个场景故事\n- 想象：主体与照片的融合需出人意料但合乎情理，富有想象力"
      },
      "🎨 国风": {
        "style": "## 具体任务\n- 体会文稿\n- 创作插画\n\n## 插画风格\n- 背景：宣纸肌理、薄墨渲染、散点透视、写意留白\n- 前景：半写实、手绘描边\n- 色彩：矿物原料、欢快\n- 笔触：干湿并用、勾线、水墨渲染、皴擦点苔、水渍飞白\n- 点缀：东方元素\n- 氛围：温润、复古、宁静、留白、呼吸\n\n## 补充风格\n如果用户表明绘制人物元素，则在以上基础补充下面风格\n- 前景：汉服人物、拟人动物、自然互动、轻松童趣"
      },
      "🎨 积木": {
        "style": "## 具体任务\n- 体会文稿\n- 创作插画\n\n## 插画风格\n- 主角：积木、拼接、硬质、比例\n- 配角：黏土、点缀、柔软、陪伴\n- 表达：故事、戏剧、演出\n- 色彩：跳脱、灵动、情绪"
      },
      "🎨 星辰": {
        "style": "## 具体任务\n- 体会文稿\n- 创作插画\n\n## 插画风格\n- 背景：深邃浩瀚的背景，营造无限宇宙感\n- 元素：超现实宇宙、闪烁的星云星尘、半透明状、内部可见星光和星系\n- 结构：精细光纤般的流线结构，如同宇宙能量流动，呈现出丝绸般柔滑质感\n- 主体：轮廓由明亮的白色 and 蓝色光线勾勒，内部点缀金色、橙色 and 青色星点\n- 画面：对比强烈，主体发光体与黑暗背景形成鲜明视觉冲击\n- 视觉：具有梦幻、神秘且富有哲学意味的视觉效果\n- 渲染：超高清渲染，极致细节表现，采用电影级照明效果"
      },
      "🔥 火焰字": {
        "style": "## 概念\n火焰文字效果\n\n## 外观\n燃烧的字体形态，边缘呈现动态火苗跳动\n\n## 结构\n由炽热火焰构成的字形结构，内部有火星迸发\n\n## 色彩\n核心为亮白色，过渡至橙红色，外层包裹金黄火焰\n\n## 光效\n强烈自发光效果，在暗背景下格外醒目\n\n## 动态\n火焰持续跳动，火星四溅的动态效果\n\n## 细节\n高清火焰纹理渲染，每簇火苗都有独立的光影表现"
      },
      "📸 海马体照片": {
        "style": "将普通照片升级为韩式专业形象照。柔和光线、精致构图，瞬间提升你的职场气质。\n\n# 指令\n将附件图片人物转换为一张韩式风格的专业形象照，\n\n## 构图与人物\n- **构图**: 半身照，采用简约的非中心构图，留有呼吸感的恰当空白。\n- **人物**: 面部特写，聚焦于清澈自然的眼神和面部表情。动作和姿态要求放松、协调且自然，流露出一种不经意的优雅。\n- **风格**: 都市休闲风格的简约着装，如纯色裙装、纯色衬衫或针织衫，干净利落。\n\n## 光影与氛围\n- **光线**: 运用柔和的蝴蝶光或伦勃朗光，营造出清晰、立体的面部轮廓，同时让皮肤看起来通透、细腻。眼中需要有明亮自然的眼神光，作为画面的情感焦点。\n- **氛围**: 整体氛围追求安静、清澈、温柔。画面呈现出一种高级空气感和呼吸感。\n\n## 背景与质感\n- **背景**: 纯色或带有低饱和度色彩的柔和渐变背景，营造出简约、干净且有层次感的空间氛围。\n- **质感**: 画面质感细腻，色彩柔和，可带有轻微的、几乎不可见的胶片颗粒感，增加一丝温暖和复古的韵味。避免任何干扰性的文字或标志，让焦点完全集中在人物的情绪和气质上。\n\n**注意**: 保持图片人物面部特征保持一致。"
      },
      "🧸 3D Blind Box Style Avatar": {
        "style": "Transform the person in the uploaded photo into a cute 3D Pop Mart style blind box character.\n\n# 指令\nLikeness : Keep key features recognizable: [hair color, hairstyle].\nC4D rendering, occlusion render, cute Q-version, soft studio lighting, pastel colors.\n\nBackground : A simple, solid matte color background (e.g., soft blue).\n\nDetail : The character should have a smooth, plastic toy texture with a slight glossy finish. Facing forward, friendly expression."
      },
      "🎨 Colorful Cartoon Logo": {
        "style": "Create a 2D digital illustration of the [reference image] logo in a colorful cartoon style with bold black outlines. The icon design should feature playful, vibrant solid colors such as pink, teal, orange, yellow, and purple, applied in a flat, bold way. Give the shapes a slightly exaggerated, bubbly form with rounded edges and fun details like starbursts, stripes, or spark effects if relevant. Keep the illustration simple and stylized with a hand-drawn look. Use thick outlines to emphasize form. Vector friendly. White background. Square aspect ratio."
      },
      "🥐 Bitten Bread": {
        "style": "A high-resolution, studio-lit macro photograph of a pastry shaped like a [reference image], with a partial bite taken out, placed on a neutral matte surface with visible crumbs and soft shadows, highlighting texture and detail."
      },
      "🍦 Pop-Art Melting Cartoon": {
        "style": "Transform the [OBJECT] from the uploaded photo into a bold, colorful cartoon illustration style, while keeping the rest of the photo realistic and unchanged.\n\n**Cartoon style details:**\n- Thick black outlines, vibrant flat colors (such as bright cyan, magenta, yellow, pink)\n- Dripping paint and splash effects, playful comic-book energy. Most drips flow downwards.\n- The cartoon object should look like it is melting or bursting with colors, blending naturally into the real photo.\n\nKeep all other elements (background, other objects, environment) photorealistic with no alterations. High resolution, pop-art aesthetic, surreal contrast between realism and cartoon."
      },
      "Add Stroke People": {
        "style": "Add clean, minimal white line-drawing illustrations of people into this photo. Match the perspective, lighting, and scale of the scene. The illustrated figures should interact naturally and meaningfully with the environment, reflecting the mood, purpose, and activity of the space. Keep the drawings simple, fluid, and expressive, with no facial details. Maintain a modern, warm, and slightly whimsical tone that complements the overall aesthetic. Do not obscure any original elements. The illustrated figures should feel like friendly, imaginative additions that blend seamlessly with the context of the scene."
      },
      "📦 Papercraft Toy": {
        "style": "Ultra-detailed render of a [reference image] paper toy version in box form (papertoy) made from matte folded cardboard and cut with visible paper texture, clean edges and neat folds. Cubic head and body, square extremities, simplified facial features, flat printed colors and subtle shading for greater depth. The clothing and accessories faithfully imitate the appearance of the reference image in a minimalist geometric papercraft style, maintaining compact proportions and chibi style. Neutral studio lighting, soft shadows, smooth background, photorealistic product photography, 4K, no text or logos. 1080x1080 dimension."
      },
      "💊 Capsule Character": {
        "style": "Create a stylized cartoon illustration of [reference image] with a smooth, vertical pill-shaped body (rounded on top and bottom, symmetrical left to right). The body should be a single, unified capsule shape with no limbs. Do not alter the character's core design or personality, but simplify them into this playful capsule form. Use bold black outlines, flat vector-style coloring, and simple geometric features. Give the character large, expressive eyes and a fun, exaggerated facial expression that reflects their original personality. If the character wears clothes, include a minimal, iconic version of their outfit. If they do not, keep the body clean and unclothed. Use a solid bright yellow background. Center the character in a square frame. Use only flat colors. No gradients. No shadows. No texture. No smudging. The final result should be clean, modern, vector-friendly, and clearly pill-shaped."
      }
    };

    export const STYLE_DEFAULT_TOKENS = {
      "Auto": { background: "#FFFFFF", primary: "#3B82F6", secondary: "#64748B" },
      "Minimalism & Swiss Style": { background: "#FFFFFF", primary: "#000000", secondary: "#808080" },
      "Neumorphism": { background: "#E0E5EC", primary: "#2D3436", secondary: "#A0A5AB" },
      "Glassmorphism": { background: "#0F172A", primary: "#38BDF8", secondary: "#F472B6" },
      "Brutalism": { background: "#FFFFFF", primary: "#0000FF", secondary: "#FF0000" },
      "3D & Hyperrealism": { background: "#1E293B", primary: "#F59E0B", secondary: "#64748B" },
      "Vibrant & Block-based": { background: "#FFFFFF", primary: "#7C3AED", secondary: "#EC4899" },
      "Dark Mode (OLED)": { background: "#000000", primary: "#39FF14", secondary: "#0080FF" },
      "Accessible & Ethical": { background: "#FFFFFF", primary: "#1E40AF", secondary: "#1F2937" },
      "Claymorphism": { background: "#F0F9FF", primary: "#3B82F6", secondary: "#F472B6" },
      "Aurora UI": { background: "#0F172A", primary: "#8B5CF6", secondary: "#2DD4BF" },
      "Retro-Futurism": { background: "#1A1A2E", primary: "#E94560", secondary: "#0F3460" },
      "Flat Design": { background: "#FFFFFF", primary: "#3B82F6", secondary: "#10B981" },
      "Skeuomorphism": { background: "#E5E7EB", primary: "#4B5563", secondary: "#9CA3AF" },
      "Liquid Glass": { background: "#0F172A", primary: "#F472B6", secondary: "#38BDF8" },
      "Motion-Driven": { background: "#FFFFFF", primary: "#000000", secondary: "#3B82F6" },
      "Micro-interactions": { background: "#FFFFFF", primary: "#6366F1", secondary: "#F43F5E" },
      "Inclusive Design": { background: "#FFFFFF", primary: "#1E3A8A", secondary: "#374151" },
      "Zero Interface": { background: "#FAFAFA", primary: "#171717", secondary: "#737373" },
      "Soft UI Evolution": { background: "#F8FAFC", primary: "#4F46E5", secondary: "#94A3B8" },
      "Hero-Centric Design": { background: "#FFFFFF", primary: "#2563EB", secondary: "#64748B" },
      "Conversion-Optimized": { background: "#FFFFFF", primary: "#059669", secondary: "#DC2626" },
      "Feature-Rich Showcase": { background: "#F1F5F9", primary: "#1E293B", secondary: "#475569" },
      "Minimal & Direct": { background: "#FFFFFF", primary: "#000000", secondary: "#525252" },
      "Social Proof-Focused": { background: "#FFFFFF", primary: "#1D4ED8", secondary: "#047857" },
      "Interactive Product Demo": { background: "#F8FAFC", primary: "#4338CA", secondary: "#BE185D" },
      "Trust & Authority": { background: "#F2F2F2", primary: "#1E3A8A", secondary: "#92400E" },
      "Storytelling-Driven": { background: "#FFFBEB", primary: "#92400E", secondary: "#B45309" },
      "Data-Dense Dashboard": { background: "#F8FAFC", primary: "#1E293B", secondary: "#334155" },
      "Heat Map & Heatmap Style": { background: "#FFFFFF", primary: "#EF4444", secondary: "#3B82F6" },
      "Executive Dashboard": { background: "#F1F5F9", primary: "#0F172A", secondary: "#475569" },
      "Real-Time Monitoring": { background: "#020617", primary: "#22C55E", secondary: "#3B82F6" },
      "Drill-Down Analytics": { background: "#FFFFFF", primary: "#1E40AF", secondary: "#64748B" },
      "Comparative Analysis Dashboard": { background: "#FFFFFF", primary: "#1E40AF", secondary: "#F97316" },
      "Predictive Analytics": { background: "#0F172A", primary: "#8B5CF6", secondary: "#F43F5E" },
      "User Behavior Analytics": { background: "#FFFFFF", primary: "#10B981", secondary: "#F43F5E" },
      "Financial Dashboard": { background: "#FFFFFF", primary: "#003366", secondary: "#22C55E" },
      "Sales Intelligence Dashboard": { background: "#FFFFFF", primary: "#3B82F6", secondary: "#10B981" },
      "Neubrutalism": { background: "#F0F0F0", primary: "#FFEB3B", secondary: "#FF5252" },
      "Bento Box Grid": { background: "#FAFAFA", primary: "#171717", secondary: "#0066FF" }
    };

    export const LANDING_PATTERNS = [
      {
        "name": "Hero + Features + CTA",
        "keywords": "hero, hero-centric, features, feature-rich, cta, call-to-action",
        "structure": "1. Hero with headline/image, 2. Value prop, 3. Key features (3-5), 4. CTA section, 5. Footer",
        "ctaPlacement": "Hero (sticky) + Bottom",
        "colorStrategy": "Hero: Brand primary or vibrant. Features: Card bg #FAFAFA. CTA: Contrasting accent color",
        "effects": "Hero parallax, feature card hover lift, CTA glow on hover"
      },
      {
        "name": "Hero + Testimonials + CTA",
        "keywords": "hero, testimonials, social-proof, trust, reviews, cta",
        "structure": "1. Hero, 2. Problem statement, 3. Solution overview, 4. Testimonials carousel, 5. CTA",
        "ctaPlacement": "Hero (sticky) + Post-testimonials",
        "colorStrategy": "Hero: Brand color. Testimonials: Light bg #F5F5F5. Quotes: Italic, muted color #666. CTA: Vibrant",
        "effects": "Testimonial carousel slide animations, quote marks animations, avatar fade-in"
      },
      {
        "name": "Product Demo + Features",
        "keywords": "demo, product-demo, features, showcase, interactive",
        "structure": "1. Hero, 2. Product video/mockup (center), 3. Feature breakdown per section, 4. Comparison (optional), 5. CTA",
        "ctaPlacement": "Video center + CTA right/bottom",
        "colorStrategy": "Video surround: Brand color overlay. Features: Icon color #0080FF. Text: Dark #222",
        "effects": "Video play button pulse, feature scroll reveals, demo interaction highlights"
      },
      {
        "name": "Minimal Single Column",
        "keywords": "minimal, simple, direct, single-column, clean",
        "structure": "1. Hero headline, 2. Short description, 3. Benefit bullets (3 max), 4. CTA, 5. Footer",
        "ctaPlacement": "Center, large CTA button",
        "colorStrategy": "Minimalist: Brand + white #FFFFFF + accent. Buttons: High contrast 7:1+. Text: Black/Dark grey",
        "effects": "Minimal hover effects. Smooth scroll. CTA scale on hover (subtle)"
      },
      {
        "name": "Funnel (3-Step Conversion)",
        "keywords": "funnel, conversion, steps, wizard, onboarding",
        "structure": "1. Hero, 2. Step 1 (problem), 3. Step 2 (solution), 4. Step 3 (action), 5. CTA progression",
        "ctaPlacement": "Each step: mini-CTA. Final: main CTA",
        "colorStrategy": "Step colors: 1 (Red/Problem), 2 (Orange/Process), 3 (Green/Solution). CTA: Brand color",
        "effects": "Step number animations, progress bar fill, step transitions smooth scroll"
      },
      {
        "name": "Comparison Table + CTA",
        "keywords": "comparison, table, compare, versus, cta",
        "structure": "1. Hero, 2. Problem intro, 3. Comparison table (product vs competitors), 4. Pricing (optional), 5. CTA",
        "ctaPlacement": "Table: Right column. CTA: Below table",
        "colorStrategy": "Table: Alternating rows (white/light grey). Your product: Highlight #FFFACD (light yellow) or green. Text: Dark",
        "effects": "Table row hover highlight, price toggle animations, feature checkmark animations"
      },
      {
        "name": "Lead Magnet + Form",
        "keywords": "lead, form, signup, capture, email, magnet",
        "structure": "1. Hero (benefit headline), 2. Lead magnet preview (ebook cover, checklist, etc), 3. Form (minimal fields), 4. CTA submit",
        "ctaPlacement": "Form CTA: Submit button",
        "colorStrategy": "Lead magnet: Professional design. Form: Clean white bg. Inputs: Light border #CCCCCC. CTA: Brand color",
        "effects": "Form focus state animations, input validation animations, success confirmation animation"
      },
      {
        "name": "Pricing Page + CTA",
        "keywords": "pricing, plans, tiers, comparison, cta",
        "structure": "1. Hero (pricing headline), 2. Price comparison cards, 3. Feature comparison table, 4. FAQ section, 5. Final CTA",
        "ctaPlacement": "Each card: CTA button. Sticky CTA in nav",
        "colorStrategy": "Free: Grey, Starter: Blue, Pro: Green/Gold, Enterprise: Dark. Cards: 1px border, shadow",
        "effects": "Price toggle animation (monthly/yearly), card comparison highlight, FAQ accordion open/close"
      },
      {
        "name": "Video-First Hero",
        "keywords": "video, hero, media, visual, engaging",
        "structure": "1. Hero with video background, 2. Key features overlay, 3. Benefits section, 4. CTA",
        "ctaPlacement": "Overlay on video (center/bottom) + Bottom section",
        "colorStrategy": "Dark overlay 60% on video. Brand accent for CTA. White text on dark.",
        "effects": "Video autoplay muted, parallax scroll, text fade-in on scroll"
      },
      {
        "name": "Scroll-Triggered Storytelling",
        "keywords": "storytelling, scroll, narrative, story, immersive",
        "structure": "1. Intro hook, 2. Chapter 1 (problem), 3. Chapter 2 (journey), 4. Chapter 3 (solution), 5. Climax CTA",
        "ctaPlacement": "End of each chapter (mini) + Final climax CTA",
        "colorStrategy": "Progressive reveal. Each chapter has distinct color. Building intensity.",
        "effects": "ScrollTrigger animations, parallax layers, progressive disclosure, chapter transitions"
      },
      {
        "name": "AI Personalization Landing",
        "keywords": "ai, personalization, smart, recommendation, dynamic",
        "structure": "1. Dynamic hero (personalized), 2. Relevant features, 3. Tailored testimonials, 4. Smart CTA",
        "ctaPlacement": "Context-aware placement based on user segment",
        "colorStrategy": "Adaptive based on user data. A/B test color variations per segment.",
        "effects": "Dynamic content swap, fade transitions, personalized product recommendations"
      },
      {
        "name": "Waitlist/Coming Soon",
        "keywords": "waitlist, coming-soon, launch, early-access, notify",
        "structure": "1. Hero with countdown, 2. Product teaser/preview, 3. Email capture form, 4. Social proof (waitlist count)",
        "ctaPlacement": "Email form prominent (above fold) + Sticky form on scroll",
        "colorStrategy": "Anticipation: Dark + accent highlights. Countdown in brand color. Urgency indicators.",
        "effects": "Countdown timer animation, email validation feedback, success confetti, social share buttons"
      },
      {
        "name": "Comparison Table Focus",
        "keywords": "comparison, table, versus, compare, features",
        "structure": "1. Hero (problem statement), 2. Comparison matrix (you vs competitors), 3. Feature deep-dive, 4. Winner CTA",
        "ctaPlacement": "After comparison table (highlighted row) + Bottom",
        "colorStrategy": "Your product column highlighted (accent bg or green). Competitors neutral. Checkmarks green.",
        "effects": "Table row hover highlight, feature checkmark animations, sticky comparison header"
      },
      {
        "name": "Pricing-Focused Landing",
        "keywords": "pricing, price, cost, plans, subscription",
        "structure": "1. Hero (value proposition), 2. Pricing cards (3 tiers), 3. Feature comparison, 4. FAQ, 5. Final CTA",
        "ctaPlacement": "Each pricing card + Sticky CTA in nav + Bottom",
        "colorStrategy": "Popular plan highlighted (brand color border/bg). Free: grey. Enterprise: dark/premium.",
        "effects": "Price toggle monthly/annual animation, card hover lift, FAQ accordion smooth open"
      },
      {
        "name": "App Store Style Landing",
        "keywords": "app, mobile, download, store, install",
        "structure": "1. Hero with device mockup, 2. Screenshots carousel, 3. Features with icons, 4. Reviews/ratings, 5. Download CTAs",
        "ctaPlacement": "Download buttons prominent (App Store + Play Store) throughout",
        "colorStrategy": "Dark/light matching app store feel. Star ratings in gold. Screenshots with device frames.",
        "effects": "Device mockup rotations, screenshot slider, star rating animations, download button pulse"
      },
      {
        "name": "FAQ/Documentation Landing",
        "keywords": "faq, documentation, help, support, questions",
        "structure": "1. Hero with search bar, 2. Popular categories, 3. FAQ accordion, 4. Contact/support CTA",
        "ctaPlacement": "Search bar prominent + Contact CTA for unresolved questions",
        "colorStrategy": "Clean, high readability. Minimal color. Category icons in brand color. Success green for resolved.",
        "effects": "Search autocomplete, smooth accordion open/close, category hover, helpful feedback buttons"
      },
      {
        "name": "Immersive/Interactive Experience",
        "keywords": "immersive, interactive, experience, 3d, animation",
        "structure": "1. Full-screen interactive element, 2. Guided product tour, 3. Key benefits revealed, 4. CTA after completion",
        "ctaPlacement": "After interaction complete + Skip option for impatient users",
        "colorStrategy": "Immersive experience colors. Dark background for focus. Highlight interactive elements.",
        "effects": "WebGL, 3D interactions, gamification elements, progress indicators, reward animations"
      },
      {
        "name": "Event/Conference Landing",
        "keywords": "event, conference, meetup, registration, schedule",
        "structure": "1. Hero (date/location/countdown), 2. Speakers grid, 3. Agenda/schedule, 4. Sponsors, 5. Register CTA",
        "ctaPlacement": "Register CTA sticky + After speakers + Bottom",
        "colorStrategy": "Urgency colors (countdown). Event branding. Speaker cards professional. Sponsor logos neutral.",
        "effects": "Countdown timer, speaker hover cards with bio, agenda tabs, early bird countdown"
      },
      {
        "name": "Product Review/Ratings Focused",
        "keywords": "reviews, ratings, testimonials, social-proof, stars",
        "structure": "1. Hero (product + aggregate rating), 2. Rating breakdown, 3. Individual reviews, 4. Buy/CTA",
        "ctaPlacement": "After reviews summary + Buy button alongside reviews",
        "colorStrategy": "Trust colors. Star ratings gold. Verified badge green. Review sentiment colors.",
        "effects": "Star fill animations, review filtering, helpful vote interactions, photo lightbox"
      },
      {
        "name": "Community/Forum Landing",
        "keywords": "community, forum, social, members, discussion",
        "structure": "1. Hero (community value prop), 2. Popular topics/categories, 3. Active members showcase, 4. Join CTA",
        "ctaPlacement": "Join button prominent + After member showcase",
        "colorStrategy": "Warm, welcoming. Member photos add humanity. Topic badges in brand colors. Activity indicators green.",
        "effects": "Member avatars animation, activity feed live updates, topic hover previews, join success celebration"
      },
      {
        "name": "Before-After Transformation",
        "keywords": "before-after, transformation, results, comparison",
        "structure": "1. Hero (problem state), 2. Transformation slider/comparison, 3. How it works, 4. Results CTA",
        "ctaPlacement": "After transformation reveal + Bottom",
        "colorStrategy": "Contrast: muted/grey (before) vs vibrant/colorful (after). Success green for results.",
        "effects": "Slider comparison interaction, before/after reveal animations, result counters, testimonial videos"
      },
      {
        "name": "Marketplace / Directory",
        "keywords": "marketplace, directory, search, listing",
        "structure": "1. Hero (Search focused), 2. Categories, 3. Featured Listings, 4. Trust/Safety, 5. CTA (Become a host/seller)",
        "ctaPlacement": "Hero Search Bar + Navbar 'List your item'",
        "colorStrategy": "Search: High contrast. Categories: Visual icons. Trust: Blue/Green.",
        "effects": "Search autocomplete animation, map hover pins, card carousel"
      },
      {
        "name": "Newsletter / Content First",
        "keywords": "newsletter, content, writer, blog, subscribe",
        "structure": "1. Hero (Value Prop + Form), 2. Recent Issues/Archives, 3. Social Proof (Subscriber count), 4. About Author",
        "ctaPlacement": "Hero inline form + Sticky header form",
        "colorStrategy": "Minimalist. Paper-like background. Text focus. Accent color for Subscribe.",
        "effects": "Text highlight animations, typewriter effect, subtle fade-in"
      },
      {
        "name": "Webinar Registration",
        "keywords": "webinar, registration, event, training, live",
        "structure": "1. Hero (Topic + Timer + Form), 2. What you'll learn, 3. Speaker Bio, 4. Urgency/Bonuses, 5. Form (again)",
        "ctaPlacement": "Hero (Right side form) + Bottom anchor",
        "colorStrategy": "Urgency: Red/Orange. Professional: Blue/Navy. Form: High contrast white.",
        "effects": "Countdown timer, speaker avatar float, urgent ticker"
      },
      {
        "name": "Enterprise Gateway",
        "keywords": "enterprise, corporate, gateway, solutions, portal",
        "structure": "1. Hero (Video/Mission), 2. Solutions by Industry, 3. Solutions by Role, 4. Client Logos, 5. Contact Sales",
        "ctaPlacement": "Contact Sales (Primary) + Login (Secondary)",
        "colorStrategy": "Corporate: Navy/Grey. High integrity. Conservative accents.",
        "effects": "Slow video background, logo carousel, tab switching for industries"
      },
      {
        "name": "Portfolio Grid",
        "keywords": "portfolio, grid, showcase, gallery, masonry",
        "structure": "1. Hero (Name/Role), 2. Project Grid (Masonry), 3. About/Philosophy, 4. Contact",
        "ctaPlacement": "Project Card Hover + Footer Contact",
        "colorStrategy": "Neutral background (let work shine). Text: Black/White. Accent: Minimal.",
        "effects": "Image lazy load reveal, hover overlay info, lightbox view"
      },
      {
        "name": "Horizontal Scroll Journey",
        "keywords": "horizontal, scroll, journey, gallery, storytelling, panoramic",
        "structure": "1. Intro (Vertical), 2. The Journey (Horizontal Track), 3. Detail Reveal, 4. Vertical Footer",
        "ctaPlacement": "Floating Sticky CTA or End of Horizontal Track",
        "colorStrategy": "Continuous palette transition. Chapter colors. Progress bar #000000.",
        "effects": "Scroll-jacking (careful), parallax layers, horizontal slide, progress indicator"
      },
      {
        "name": "Bento Grid Showcase",
        "keywords": "bento, grid, features, modular, apple-style, showcase",
        "structure": "1. Hero, 2. Bento Grid (Key Features), 3. Detail Cards, 4. Tech Specs, 5. CTA",
        "ctaPlacement": "Floating Action Button or Bottom of Grid",
        "colorStrategy": "Card backgrounds: #F5F5F7 or Glass. Icons: Vibrant brand colors. Text: Dark.",
        "effects": "Hover card scale (1.02), video inside cards, tilt effect, staggered reveal"
      },
      {
        "name": "Interactive 3D Configurator",
        "keywords": "3d, configurator, customizer, interactive, product",
        "structure": "1. Hero (Configurator), 2. Feature Highlight (synced), 3. Price/Specs, 4. Purchase",
        "ctaPlacement": "Inside Configurator UI + Sticky Bottom Bar",
        "colorStrategy": "Neutral studio background. Product: Realistic materials. UI: Minimal overlay.",
        "effects": "Real-time rendering, material swap animation, camera rotate/zoom, light reflection"
      },
      {
        "name": "AI-Driven Dynamic Landing",
        "keywords": "ai, dynamic, personalized, adaptive, generative",
        "structure": "1. Prompt/Input Hero, 2. Generated Result Preview, 3. How it Works, 4. Value Prop",
        "ctaPlacement": "Input Field (Hero) + 'Try it' Buttons",
        "colorStrategy": "Adaptive to user input. Dark mode for compute feel. Neon accents.",
        "effects": "Typing text effects, shimmering generation loaders, morphing layouts"
      }
    ];

    export const UX_GUIDELINES = [
      {
        "category": "Typography",
        "issue": "Visual Hierarchy",
        "rule": "Use 2-3 dimensions (size, weight, color, space) together for hierarchy",
        "avoid": "Relying on size alone for emphasis",
        "platform": "All",
        "severity": "High"
      },
      {
        "category": "Color",
        "issue": "Tinted Neutrals",
        "rule": "Tint neutral grays toward the brand hue",
        "avoid": "Pure gray (#808080) or untinted neutrals",
        "platform": "All",
        "severity": "Medium"
      },
      {
        "category": "Layout",
        "issue": "Spacing Rhythm",
        "rule": "Use varied spacing — tight groupings and generous separations",
        "avoid": "Uniform spacing everywhere",
        "platform": "All",
        "severity": "Medium"
      },
      {
        "category": "Layout",
        "issue": "Card Overuse",
        "rule": "Use spacing and alignment for grouping when possible",
        "avoid": "Wrapping everything in cards or nesting cards inside cards",
        "platform": "All",
        "severity": "Medium"
      },
      {
        "category": "Navigation",
        "issue": "Sticky Navigation",
        "rule": "Add padding-top to body equal to nav height",
        "avoid": "Let nav overlap first section content",
        "platform": "Web",
        "severity": "Medium"
      },
      {
        "category": "Navigation",
        "issue": "Active State",
        "rule": "Highlight active nav item with color/underline",
        "avoid": "No visual feedback on current location",
        "platform": "All",
        "severity": "Medium"
      },
      {
        "category": "Navigation",
        "issue": "Back Button",
        "rule": "Preserve navigation history properly",
        "avoid": "Break browser/app back button behavior",
        "platform": "Mobile",
        "severity": "High"
      },
      {
        "category": "Navigation",
        "issue": "Deep Linking",
        "rule": "Update URL on state/view changes",
        "avoid": "Static URLs for dynamic content",
        "platform": "All",
        "severity": "Medium"
      },
      {
        "category": "Navigation",
        "issue": "Breadcrumbs",
        "rule": "Use for sites with 3+ levels of depth",
        "avoid": "Use for flat single-level sites",
        "platform": "Web",
        "severity": "Low"
      },
      {
        "category": "Layout",
        "issue": "Fixed Positioning",
        "rule": "Account for safe areas and other fixed elements",
        "avoid": "Stack multiple fixed elements carelessly",
        "platform": "Web",
        "severity": "Medium"
      },
      {
        "category": "Layout",
        "issue": "Content Jumping",
        "rule": "Reserve space for async content",
        "avoid": "Let images/content push layout around",
        "platform": "Web",
        "severity": "High"
      },
      {
        "category": "Layout",
        "issue": "Container Width",
        "rule": "Limit max-width for text content (65-75ch)",
        "avoid": "Let text span full viewport width",
        "platform": "Web",
        "severity": "Medium"
      },

      {
        "category": "Accessibility",
        "issue": "Color Contrast",
        "rule": "Minimum 4.5:1 ratio for normal text",
        "avoid": "Low contrast text",
        "platform": "All",
        "severity": "High"
      },
      {
        "category": "Accessibility",
        "issue": "Color Only",
        "rule": "Use icons/text in addition to color",
        "avoid": "Red/green only for error/success",
        "platform": "All",
        "severity": "High"
      },

      {
        "category": "Accessibility",
        "issue": "Heading Hierarchy",
        "rule": "Use sequential heading levels h1-h6",
        "avoid": "Skip heading levels or misuse for styling",
        "platform": "Web",
        "severity": "Medium"
      },
      {
        "category": "Forms",
        "issue": "Input Labels",
        "rule": "Always show label above or beside input",
        "avoid": "Placeholder as only label",
        "platform": "All",
        "severity": "High"
      },
      {
        "category": "Forms",
        "issue": "Error Placement",
        "rule": "Show error below related input",
        "avoid": "Single error message at top of form",
        "platform": "All",
        "severity": "Medium"
      },
      {
        "category": "Forms",
        "issue": "Inline Validation",
        "rule": "Validate on blur for most fields",
        "avoid": "Validate only on submit",
        "platform": "All",
        "severity": "Medium"
      },
      {
        "category": "Forms",
        "issue": "Input Types",
        "rule": "Use email tel number url etc",
        "avoid": "Text input for everything",
        "platform": "All",
        "severity": "Medium"
      },
      {
        "category": "Forms",
        "issue": "Autofill Support",
        "rule": "Use autocomplete attribute properly",
        "avoid": "Block or ignore autofill",
        "platform": "Web",
        "severity": "Medium"
      },
      {
        "category": "Forms",
        "issue": "Required Indicators",
        "rule": "Use asterisk or (required) text",
        "avoid": "No indication of required fields",
        "platform": "All",
        "severity": "Medium"
      },
      {
        "category": "Forms",
        "issue": "Password Visibility",
        "rule": "Toggle to show/hide password",
        "avoid": "No visibility toggle",
        "platform": "All",
        "severity": "Medium"
      },
      {
        "category": "Forms",
        "issue": "Submit Feedback",
        "rule": "Show loading then success/error state",
        "avoid": "No feedback after submit",
        "platform": "All",
        "severity": "High"
      },
      {
        "category": "Forms",
        "issue": "Input Affordance",
        "rule": "Use distinct input styling",
        "avoid": "Inputs that look like plain text",
        "platform": "All",
        "severity": "Medium"
      },
      {
        "category": "Forms",
        "issue": "Mobile Keyboards",
        "rule": "Use inputmode attribute",
        "avoid": "Default keyboard for all inputs",
        "platform": "Mobile",
        "severity": "Medium"
      },
      {
        "category": "Typography",
        "issue": "Line Height",
        "rule": "Use 1.5-1.75 for body text",
        "avoid": "Cramped or excessive line height",
        "platform": "All",
        "severity": "Medium"
      },
      {
        "category": "Typography",
        "issue": "Line Length",
        "rule": "Limit to 65-75 characters per line",
        "avoid": "Full-width text on large screens",
        "platform": "Web",
        "severity": "Medium"
      },
      {
        "category": "Typography",
        "issue": "Font Size Scale",
        "rule": "Use consistent modular scale",
        "avoid": "Random font sizes",
        "platform": "All",
        "severity": "Medium"
      },
      {
        "category": "Typography",
        "issue": "Font Loading",
        "rule": "Reserve space with fallback font",
        "avoid": "Layout shift when fonts load",
        "platform": "Web",
        "severity": "Medium"
      },
      {
        "category": "Typography",
        "issue": "Contrast Readability",
        "rule": "Use darker text on light backgrounds",
        "avoid": "Gray text on gray background",
        "platform": "All",
        "severity": "High"
      },
      {
        "category": "Typography",
        "issue": "Heading Clarity",
        "rule": "Clear size/weight difference",
        "avoid": "Headings similar to body text",
        "platform": "All",
        "severity": "Medium"
      },
      {
        "category": "Feedback",
        "issue": "Empty States",
        "rule": "Show helpful message and action",
        "avoid": "Blank empty screens",
        "platform": "All",
        "severity": "Medium"
      },
      {
        "category": "Feedback",
        "issue": "Error Recovery",
        "rule": "Provide clear next steps",
        "avoid": "Error without recovery path",
        "platform": "All",
        "severity": "Medium"
      },
      {
        "category": "Feedback",
        "issue": "Progress Indicators",
        "rule": "Step indicators or progress bar",
        "avoid": "No indication of progress",
        "platform": "All",
        "severity": "Medium"
      },
      {
        "category": "Feedback",
        "issue": "Toast Notifications",
        "rule": "Auto-dismiss after 3-5 seconds",
        "avoid": "Toasts that never disappear",
        "platform": "All",
        "severity": "Medium"
      },
      {
        "category": "Feedback",
        "issue": "Confirmation Messages",
        "rule": "Brief success message",
        "avoid": "Silent success",
        "platform": "All",
        "severity": "Medium"
      },
      {
        "category": "Content",
        "issue": "Truncation",
        "rule": "Truncate with ellipsis and expand option",
        "avoid": "Overflow or broken layout",
        "platform": "All",
        "severity": "Medium"
      },
      {
        "category": "Content",
        "issue": "Date Formatting",
        "rule": "Use relative or locale-aware dates",
        "avoid": "Ambiguous date formats",
        "platform": "All",
        "severity": "Low"
      },
      {
        "category": "Content",
        "issue": "Number Formatting",
        "rule": "Use thousand separators or abbreviations",
        "avoid": "Long unformatted numbers",
        "platform": "All",
        "severity": "Low"
      },
      {
        "category": "Content",
        "issue": "Placeholder Content",
        "rule": "Use realistic sample data",
        "avoid": "Lorem ipsum everywhere",
        "platform": "All",
        "severity": "Low"
      },
      {
        "category": "Onboarding",
        "issue": "User Freedom",
        "rule": "Provide Skip and Back buttons",
        "avoid": "Force linear unskippable tour",
        "platform": "All",
        "severity": "Medium"
      },
      {
        "category": "Search",
        "issue": "Autocomplete",
        "rule": "Show predictions as user types",
        "avoid": "Require full type and enter",
        "platform": "Web",
        "severity": "Medium"
      },
      {
        "category": "Search",
        "issue": "No Results",
        "rule": "Show 'No results' with suggestions",
        "avoid": "Blank screen or '0 results'",
        "platform": "Web",
        "severity": "Medium"
      },
    ];

    // -------------------------

    export const CHART_PRESETS = [
      {
        dataType: "Trend Over Time",
        keywords: "trend, time-series, line, growth, timeline, progress",
        bestChartType: "Line Chart",
        secondaryOptions: ["Area Chart", "Smooth Area"],
        colorGuidance: "Primary: #0080FF. Multiple series: use distinct colors. Fill: 20% opacity"
      },
      {
        dataType: "Compare Categories",
        keywords: "compare, categories, bar, comparison, ranking",
        bestChartType: "Bar Chart (Horizontal or Vertical)",
        secondaryOptions: ["Column Chart", "Grouped Bar"],
        colorGuidance: "Each bar: distinct color. Category: grouped same color. Sorted: descending order"
      },
      {
        dataType: "Part-to-Whole",
        keywords: "part-to-whole, pie, donut, percentage, proportion, share",
        bestChartType: "Pie Chart or Donut",
        secondaryOptions: ["Stacked Bar", "Treemap"],
        colorGuidance: "Colors: 5-6 max. Contrasting palette. Large slices first. Use labels."
      },
      {
        dataType: "Correlation/Distribution",
        keywords: "correlation, distribution, scatter, relationship, pattern",
        bestChartType: "Scatter Plot or Bubble Chart",
        secondaryOptions: ["Heat Map", "Matrix"],
        colorGuidance: "Color axis: gradient (blue-red). Size: relative. Opacity: 0.6-0.8 to show density"
      },
      {
        dataType: "Heatmap/Intensity",
        keywords: "heatmap, heat-map, intensity, density, matrix",
        bestChartType: "Heat Map or Choropleth",
        secondaryOptions: ["Grid Heat Map", "Bubble Heat"],
        colorGuidance: "Gradient: Cool (blue) to Hot (red). Scale: clear legend. Divergent for ±data"
      },
      {
        dataType: "Geographic Data",
        keywords: "geographic, map, location, region, geo, spatial",
        bestChartType: "Choropleth Map, Bubble Map",
        secondaryOptions: ["Geographic Heat Map"],
        colorGuidance: "Regional: single color gradient or categorized colors. Legend: clear scale"
      },
      {
        dataType: "Funnel/Flow",
        keywords: "funnel/flow",
        bestChartType: "Funnel Chart, Sankey",
        secondaryOptions: ["Waterfall (for flows)"],
        colorGuidance: "Stages: gradient (starting color → ending color). Show conversion %"
      },
      {
        dataType: "Performance vs Target",
        keywords: "performance-vs-target",
        bestChartType: "Gauge Chart or Bullet Chart",
        secondaryOptions: ["Dial", "Thermometer"],
        colorGuidance: "Performance: Red→Yellow→Green gradient. Target: marker line. Threshold colors"
      },
      {
        dataType: "Time-Series Forecast",
        keywords: "time-series-forecast",
        bestChartType: "Line with Confidence Band",
        secondaryOptions: ["Ribbon Chart"],
        colorGuidance: "Actual: solid line #0080FF. Forecast: dashed #FF9500. Band: light shading"
      },
      {
        dataType: "Anomaly Detection",
        keywords: "anomaly-detection",
        bestChartType: "Line Chart with Highlights",
        secondaryOptions: ["Scatter with Alert"],
        colorGuidance: "Normal: blue #0080FF. Anomaly: red #FF0000 circle/square marker + alert"
      },
      {
        dataType: "Hierarchical/Nested Data",
        keywords: "hierarchical/nested-data",
        bestChartType: "Treemap",
        secondaryOptions: ["Sunburst", "Nested Donut", "Icicle"],
        colorGuidance: "Parent: distinct hues. Children: lighter shades. White borders 2-3px."
      },
      {
        dataType: "Flow/Process Data",
        keywords: "flow/process-data",
        bestChartType: "Sankey Diagram",
        secondaryOptions: ["Alluvial", "Chord Diagram"],
        colorGuidance: "Gradient from source to target. Opacity 0.4-0.6 for flows."
      },
      {
        dataType: "Cumulative Changes",
        keywords: "cumulative-changes",
        bestChartType: "Waterfall Chart",
        secondaryOptions: ["Stacked Bar", "Cascade"],
        colorGuidance: "Increases: #4CAF50. Decreases: #F44336. Start: #2196F3. End: #0D47A1."
      },
      {
        dataType: "Multi-Variable Comparison",
        keywords: "multi-variable-comparison",
        bestChartType: "Radar/Spider Chart",
        secondaryOptions: ["Parallel Coordinates", "Grouped Bar"],
        colorGuidance: "Single: #0080FF 20% fill. Multiple: distinct colors per dataset."
      },
      {
        dataType: "Stock/Trading OHLC",
        keywords: "stock/trading-ohlc",
        bestChartType: "Candlestick Chart",
        secondaryOptions: ["OHLC Bar", "Heikin-Ashi"],
        colorGuidance: "Bullish: #26A69A. Bearish: #EF5350. Volume: 40% opacity below."
      },
      {
        dataType: "Relationship/Connection Data",
        keywords: "relationship/connection-data",
        bestChartType: "Network Graph",
        secondaryOptions: ["Hierarchical Tree", "Adjacency Matrix"],
        colorGuidance: "Node types: categorical colors. Edges: #90A4AE 60% opacity."
      },
      {
        dataType: "Distribution/Statistical",
        keywords: "distribution/statistical",
        bestChartType: "Box Plot",
        secondaryOptions: ["Violin Plot", "Beeswarm"],
        colorGuidance: "Box: #BBDEFB. Border: #1976D2. Median: #D32F2F. Outliers: #F44336."
      },
      {
        dataType: "Performance vs Target (Compact)",
        keywords: "performance-vs-target-(compact)",
        bestChartType: "Bullet Chart",
        secondaryOptions: ["Gauge, Progress Bar"],
        colorGuidance: "Ranges: #FFCDD2, #FFF9C4, #C8E6C9. Performance: #1976D2. Target: black 3px."
      },
      {
        dataType: "Proportional/Percentage",
        keywords: "proportional/percentage",
        bestChartType: "Waffle Chart",
        secondaryOptions: ["Pictogram", "Stacked Bar 100%"],
        colorGuidance: "10x10 grid. 3-5 categories max. 2-3px spacing between squares."
      },
      {
        dataType: "Hierarchical Proportional",
        keywords: "hierarchical-proportional",
        bestChartType: "Sunburst Chart",
        secondaryOptions: ["Treemap", "Icicle", "Circle Packing"],
        colorGuidance: "Center to outer: darker to lighter. 15-20% lighter per level."
      },
      {
        dataType: "Root Cause Analysis",
        keywords: "root cause, decomposition, tree, hierarchy, drill-down, ai-split",
        bestChartType: "Decomposition Tree",
        secondaryOptions: ["Decision Tree", "Flow Chart"],
        colorGuidance: "Nodes: #2563EB (Primary) vs #EF4444 (Negative impact). Connectors: Neutral grey."
      },
      {
        dataType: "3D Spatial Data",
        keywords: "3d, spatial, immersive, terrain, molecular, volumetric",
        bestChartType: "3D Scatter/Surface Plot",
        secondaryOptions: ["Volumetric Rendering", "Point Cloud"],
        colorGuidance: "Depth cues: lighting/shading. Z-axis: color gradient (cool to warm)."
      },
      {
        dataType: "Real-Time Streaming",
        keywords: "streaming, real-time, ticker, live, velocity, pulse",
        bestChartType: "Streaming Area Chart",
        secondaryOptions: ["Ticker Tape", "Moving Gauge"],
        colorGuidance: "Current: Bright Pulse (#00FF00). History: Fading opacity. Grid: Dark."
      },
      {
        dataType: "Sentiment/Emotion",
        keywords: "sentiment, emotion, nlp, opinion, feeling",
        bestChartType: "Word Cloud with Sentiment",
        secondaryOptions: ["Sentiment Arc", "Radar Chart"],
        colorGuidance: "Positive: #22C55E. Negative: #EF4444. Neutral: #94A3B8. Size = Frequency."
      },
      {
        dataType: "Process Mining",
        keywords: "process, mining, variants, path, bottleneck, log",
        bestChartType: "Process Map / Graph",
        secondaryOptions: ["Directed Acyclic Graph (DAG)", "Petri Net"],
        colorGuidance: "Happy path: #10B981 (Thick). Deviations: #F59E0B (Thin). Bottlenecks: #EF4444."
      }
    ];

    export const SMART_RENAME_PROMPT_PRESETS = {
      "Short & consistent": {
        style: "Rename layers to short, semantic, deterministic names. Prefer the minimum number of words that still make each layer's role clear."
      },
      "More descriptive": {
        style: "Rename layers to clear, descriptive, semantic names that explain the layer's role, content, or UI purpose while staying consistent across siblings."
      },
      "Mobile-friendly": {
        style: "Rename layers with short, mobile-friendly semantic names optimized for compact screen hierarchies, mobile UI patterns, and touch-first components."
      },
      "Web/components": {
        style: "Rename layers using web and component-oriented semantic names suitable for reusable UI parts, wrappers, containers, slots, states, and layout structure."
      }
    };
