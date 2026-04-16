import {
  ContextMode,
  IMAGE_GEN_PRESETS,
  RE_STYLE_PRESETS,
} from '../../../config/agent-data.js';

export const stylingImageTasks = [
{
          name: 'Set image fill',
          desc: 'Apply image fill to selected node',
          requiredContext: ContextMode.STYLE_ONLY,
          directAction: 'setImageFillFromSelection',
          fields: [
            {
              key: 'scaleMode', type: 'select', label: 'Image fill type', default: 'FILL', options: [
                { value: 'FILL', label: 'Fill' },
                { value: 'FIT', label: 'Fit' },
                { value: 'CROP', label: 'Crop' },
                { value: 'TILE', label: 'Tile' }
              ]
            },
            {
              key: 'tileScale',
              type: 'number',
              label: 'Tile scale (%)',
              default: 100,
              min: 1,
              max: 500,
              step: 1,
              numberWithSlider: true,
              hint: '10 means 10%, 100 means original size',
              showWhen: { field: 'scaleMode', equals: 'TILE' }
            },
            {
              key: 'exposure',
              type: 'slider',
              label: 'Exposure',
              default: 0,
              min: -100,
              max: 100,
              step: 1
            },
            {
              type: 'row',
              fields: [
                {
                  key: 'contrast',
                  type: 'slider',
                  label: 'Contrast',
                  default: 0,
                  min: -100,
                  max: 100,
                  step: 1
                },
                {
                  key: 'saturation',
                  type: 'slider',
                  label: 'Saturation',
                  default: 0,
                  min: -100,
                  max: 100,
                  step: 1
                }
              ]
            },
            {
              type: 'row',
              fields: [
                {
                  key: 'temperature',
                  type: 'slider',
                  label: 'Temperature',
                  default: 0,
                  min: -100,
                  max: 100,
                  step: 1
                },
                {
                  key: 'tint',
                  type: 'slider',
                  label: 'Tint',
                  default: 0,
                  min: -100,
                  max: 100,
                  step: 1
                }
              ]
            },
            {
              type: 'row',
              fields: [
                {
                  key: 'highlights',
                  type: 'slider',
                  label: 'Highlights',
                  default: 0,
                  min: -100,
                  max: 100,
                  step: 1
                },
                {
                  key: 'shadows',
                  type: 'slider',
                  label: 'Shadows',
                  default: 0,
                  min: -100,
                  max: 100,
                  step: 1
                }
              ]
            }
          ]
        },
{
          name: 'Fill with stock photos',
          desc: 'Fill selected nodes with free stock photos / images',
          directAction: 'fillFromOnlineImage',
          fields: [
            {
              key: 'service', type: 'select', label: 'Image source',
              default: 'unsplash',
              options: [
                { value: 'unsplash', label: 'Unsplash (high-quality, needs API key)' },
                { value: 'pixabay', label: 'Pixabay (free, needs API key)' },
                { value: 'pexels', label: 'Pexels (free, needs API key)' },
                { value: 'loremflickr', label: 'LoremFlickr (keyword search)' },
                { value: 'picsum', label: 'Lorem Picsum (random high-quality)' },
                { value: 'placehold', label: 'Placeholder (solid color)' }
              ]
            },
            {
              key: 'autoDetect', type: 'checkbox',
              label: 'AI auto-detect keywords from selection',
              default: false,
              showWhen: { field: 'service', equalsAny: ['loremflickr', 'unsplash', 'pixabay', 'pexels'] }
            },
            {
              key: 'keywords', type: 'text',
              label: 'Subject / Keywords',
              placeholder: 'e.g. nature, city, food',
              showWhen: [
                { field: 'service', equalsAny: ['loremflickr', 'unsplash', 'pixabay', 'pexels'] },
                { field: 'autoDetect', equals: 'false' }
              ]
            },
            {
              key: 'scaleMode', type: 'select', label: 'Fill mode',
              default: 'FILL',
              options: [
                { value: 'FILL', label: 'Fill' },
                { value: 'FIT', label: 'Fit' },
                { value: 'CROP', label: 'Crop' },
                { value: 'TILE', label: 'Tile' }
              ]
            }
          ]
        }
];

export const quickCreateImageTasks = [
{
          name: 'Create icon',
          desc: 'Icon fonts (search all sets via Iconify); glyph if font is active, else SVG',
          promptTemplate: 'Create icon for {iconDescription}',
          noSelection: true,
          directAction: 'createIcon',
          fields: [
            {
              type: 'row',
              fields: [
                { key: 'iconDescription', type: 'text', label: 'Concept/Description', placeholder: 'A calendar with a checkmark (completed event)', translate: true },
                { key: 'size', type: 'number', label: 'Size (px)', default: 24, min: 8, max: 512, wrapperClass: 'prompt-field--compact', alignHeader: true, headerClass: 'prompt-field-header--with-actions' }
              ]
            },
            {
              key: 'iconSource', type: 'select', label: 'Icon Source', default: 'iconify', options: [
                { value: 'iconify', label: 'Iconify' },
                { value: 'antv', label: 'AntV Infographic' },
                { value: 'iconfont', label: 'Icon Font' }
              ]
            },
            {
              key: 'strokeWidth', type: 'number', label: 'AI stroke width', default: 2, min: 0.5, step: 0.5, showWhen: { field: 'useAiFallback', equals: true }
            },
            { key: 'showResultsInDrawer', type: 'checkbox', label: 'Show search results in drawer', default: true },
            { key: 'useAiFallback', type: 'checkbox', label: 'Generate fallback if missing', default: true }
          ]
        },
{
          name: 'Import icon sets',
          desc: 'Explore and batch import icons from standard sets',
          noSelection: true,
          directAction: 'browseIconSet',
          fields: [
            { key: 'iconSet', type: 'select', label: 'Icon set', default: '', options: [], searchable: true },
            {
              type: 'row',
              fields: [
                { key: 'size', type: 'number', label: 'Size (px)', default: 24, min: 8, max: 512 },
                { key: 'color', type: 'color', label: 'Color', default: '#111827' }
              ]
            },
            {
              key: 'importMode', type: 'select', label: 'Import as', default: 'frame', options: [
                { value: 'frame', label: 'Frames' },
                { value: 'component', label: 'Multiple components' },
                { value: 'componentSet', label: 'Component Set' }
              ]
            }
          ]
        },
{
          name: 'Image to ASCII',
          desc: 'Convert an image to ASCII text or an ASCII bitmap result',
          noSelection: true,
          directAction: 'imageToAscii',
          fields: [
            {
              key: 'imageInput',
              type: 'image',
              label: 'Source Image',
              maxImages: 1
            },
            {
              type: 'row',
              fields: [
                {
                  key: 'width',
                  type: 'slider',
                  label: 'Width',
                  default: 80,
                  min: 16,
                  max: 200,
                  step: 1
                },
                {
                  key: 'density',
                  type: 'slider',
                  label: 'Density',
                  default: 70,
                  min: 0,
                  max: 100,
                  step: 1
                }
              ]
            },
            {
              type: 'row',
              fields: [
                {
                  key: 'charsetPreset',
                  type: 'select',
                  label: 'Charset',
                  labelRowCheckboxes: [
                    {
                      key: 'edgesOnly',
                      label: 'Edges only',
                      default: false,
                    },
                    {
                      key: 'invert',
                      label: 'Invert',
                      default: false
                    },
                    {
                      key: 'colorOutput',
                      label: 'Color output',
                      default: false
                    }
                  ],
                  hint: ' .:-=+*#%@',
                  default: 'standard',
                  options: [
                    { value: 'standard', label: 'Standard', hintText: ' .:-=+*#%@' },
                    { value: 'blocks', label: 'Blocks', hintText: '　░▒▓█' },
                    { value: 'codeStyle', label: 'Code Style', hintText: ' *2/e+=' },
                    { value: 'airy', label: 'Airy', hintText: '  .·°*+' },
                    { value: 'symbols', label: 'Symbols', hintText: '　・○◇□◆■' },
                    { value: 'minimal', label: 'Minimal', hintText: ' .oO#' },
                    { value: 'dense', label: 'Dense', hintText: ' `^",:;Il!i~+_-?][}{1)(|\\/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$' },
                    { value: 'emoji', label: 'Emoji', hintText: 'Auto-randomized emoji set based on Color output' },
                    { value: 'custom', label: 'Custom', hintText: 'Use Custom Charset below' }
                  ]
                }
              ]
            },
            {
              key: 'customCharset',
              type: 'text',
              label: 'Custom Charset',
              hint: 'Editable. Emoji mode auto-fills this field and Randomize regenerates it.',
              placeholder: 'Light to dark, e.g. .:-=+*#%@ or auto-generated emoji',
              headerActions: [
                {
                  key: 'randomizeAsciiEmojiCharset',
                  label: 'Randomize',
                  title: 'Randomize emoji charset'
                }
              ],
              showWhen: { field: 'charsetPreset', equalsAny: ['custom', 'emoji'] }
            },
            {
              key: 'edgeThickness',
              type: 'slider',
              label: 'Edge thickness',
              default: 1,
              min: 1,
              max: 12,
              step: 1,
              showWhen: { field: 'edgesOnly', equals: true },
            },
            {
              type: 'row',
              fields: [
                {
                  key: 'emojiCharsetCount',
                  type: 'slider',
                  label: 'Emoji Count',
                  default: 7,
                  min: 2,
                  max: 100,
                  step: 1,
                  showWhen: { field: 'charsetPreset', equals: 'emoji' }
                },
                {
                  key: 'colorMaxColors',
                  type: 'slider',
                  label: 'Number of colors',
                  default: 120,
                  min: 8,
                  max: 512,
                  step: 1,
                  showWhen: { field: 'colorOutput', equals: true },
                }
              ]
            },
            {
              key: 'asciiPreview',
              type: 'asciiPreview',
              label: 'Preview'
            },
            {
              key: 'targetMode',
              type: 'select',
              label: 'Apply Result',
              default: 'text',
              options: [
                { value: 'text', label: 'Text' },
                { value: 'createNew', label: 'Create new result node' },
                { value: 'replaceSelection', label: 'Replace selected fill' }
              ]
            }
          ]
        },
{
          name: 'Perspective tool',
          desc: 'Warp an image onto a four-corner target with perspective.',
          help:
            'Perspective warp: map an image to four corners (image to 4-point vector).',
          searchKeywords: 'perspective, image warp, distort, mockup',
          directAction: 'imageTo4PointVector',
          fields: [
            {
              type: 'row',
              rowClass: 'prompt-field-row--perspective-source-target',
              fields: [
                {
                  key: 'imageInput',
                  type: 'image',
                  label: 'Source Image',
                  maxImages: 1
                },
                {
                  type: 'quadTargetPreview',
                  label: 'Target shape'
                }
              ]
            },
            {
              key: 'rotateSteps',
              type: 'select',
              label: 'Rotate',
              default: '0',
              options: [
                { value: '-90', label: 'Left 90°' },
                { value: '0', label: 'None' },
                { value: '90', label: 'Right 90°' },
                { value: '180', label: '180°' }
              ]
            },
            {
              type: 'row',
              fields: [
                {
                  key: 'flipHorizontal',
                  type: 'select',
                  label: 'Flip Horizontal',
                  default: 'off',
                  options: [
                    { value: 'off', label: 'Off' },
                    { value: 'on', label: 'On' }
                  ]
                },
                {
                  key: 'flipVertical',
                  type: 'select',
                  label: 'Flip Vertical',
                  default: 'off',
                  options: [
                    { value: 'off', label: 'Off' },
                    { value: 'on', label: 'On' }
                  ]
                }
              ]
            },
            {
              key: 'outputScale',
              type: 'number',
              label: 'Output Scale',
              default: 1,
              min: 0.5,
              max: 10,
              inputMax: 50,
              step: 0.5,
              sliderStep: 0.5,
              numberWithSlider: true
            }
          ]
        },
{
          name: 'Re-style',
          desc: 'Transform / restyle an image into a new style using AI',
          promptTemplate: 'Re-style image: {imageStyle}{aspectRatio ? \" [Aspect Ratio: {aspectRatio}]\" : \"\"}{imageResolution ? \" [Resolution: {imageResolution}]\" : \"\"}{imageVariations ? \" [Variations: {imageVariations}]\" : \"\"}',
          noSelection: true,
          directAction: 'generateImage',
          fields: [
            {
              key: 'imageInput',
              type: 'image',
              label: 'Reference Image (Required)'
            },
            {
              key: 'reStylePreset',
              type: 'select',
              label: 'Style Preset (Optional)',
              default: '',
              searchable: true,
              options: () => [
                { value: '', label: 'None (Custom)' },
                ...Object.keys(RE_STYLE_PRESETS).map(name => ({ value: name, label: name }))
              ]
            },
            { key: 'imageStyle', type: 'textarea', label: 'Prompt', placeholder: 'Artistic style, medium, lighting, mood...', aiButtons: true },
            {
              key: 'cameraControl',
              type: 'cameraControl',
              label: '3D Camera Control',
              hint: 'Drag to adjust rotation, tilt, and distance'
            },
            {
              key: 'imageModel', type: 'select', label: 'Model', searchable: true, default: 'gemini-3-pro-image-preview', dynamicOptions: 'imageGenModels', options: [
                { value: 'gemini-3-pro-image-preview', label: 'Gemini 3 Pro (Preview)' },
                { value: 'imagen-4.0-fast-generate-001', label: 'Imagen 4 Fast' },
                { value: 'imagen-4.0-generate-001', label: 'Imagen 4 (Balanced)' },
                { value: 'imagen-3.0-generate-002', label: 'Imagen 3 (Balanced)' },
              ]
            },
            {
              key: 'aspectRatio', type: 'select', label: 'Aspect Ratio', default: '1:1', options: [
                { value: '1:1', label: '1:1' },
                { value: '16:9', label: '16:9' },
                { value: '9:16', label: '9:16' },
                { value: '4:3', label: '4:3' },
                { value: '3:4', label: '3:4' },
                { value: '2:3', label: '2:3' },
                { value: '3:2', label: '3:2' },
                { value: '4:5', label: '4:5' },
                { value: '5:4', label: '5:4' },
                { value: '21:9', label: '21:9 (Ultra-wide)' },
                { value: '4:1', label: '4:1' },
                { value: '1:4', label: '1:4' },
                { value: '8:1', label: '8:1' },
                { value: '1:8', label: '1:8' },
              ]
            },
            {
              type: 'row',
              fields: [
                {
                  key: 'imageResolution', type: 'select', label: 'Resolution', default: '1K', options: [
                    { value: '0.5K', label: '0.5K' },
                    { value: '1K', label: '1K' },
                    { value: '2K', label: '2K' },
                    { value: '4K', label: '4K' },
                  ]
                },
                {
                  key: 'imageVariations', type: 'select', label: 'Variations', default: '1', options: [
                    { value: '1', label: '1' },
                    { value: '2', label: '2' },
                    { value: '4', label: '4' },
                    { value: '8', label: '8' },
                  ]
                },
              ]
            },
            {
              key: 'thinkingLevel', type: 'select', label: 'Thinking Level', default: 'minimal', options: [
                { value: 'minimal', label: 'Minimal (Fast)' },
                { value: 'high', label: 'High (Better Quality)' },
              ]
            },
            { key: 'applyToSelection', type: 'checkbox', label: 'Apply to selected node', default: false, hideWhenNoSelection: true },
          ]
        },
{
          name: 'Generate image',
          desc: 'Create image from text prompt using AI',
          promptTemplate: 'Generate image: {imageSubject} {imageStyle ? "(Style: {imageStyle})" : ""}{aspectRatio ? " [Aspect Ratio: {aspectRatio}]" : ""}{imageResolution ? " [Resolution: {imageResolution}]" : ""}{imageVariations ? " [Variations: {imageVariations}]" : ""}',
          noSelection: true,
          directAction: 'generateImage',
          fields: [
            {
              key: 'imagePreset',
              type: 'select',
              label: 'Style Preset (Optional)',
              default: '',
              searchable: true,
              options: () => [
                { value: '', label: 'None (Custom)' },
                ...Object.keys(IMAGE_GEN_PRESETS).map(name => ({ value: name, label: name }))
              ]
            },
            { key: 'imageSubject', type: 'textarea', label: 'Subject / Content', placeholder: 'A serene mountain landscape at sunset with golden light...', aiButtons: true },
            { key: 'imageStyle', type: 'textarea', label: 'Artistic Style / Direction', placeholder: 'Cinematic lighting, 8k, photorealistic, wide angle...', aiButtons: true },
            {
              key: 'cameraControl',
              type: 'cameraControl',
              label: '3D Camera Control',
              hint: 'Drag to adjust rotation, tilt, and distance'
            },
            {
              key: 'imageInput',
              type: 'image',
              label: 'Reference Image (Optional)'
            },
            {
              key: 'imageModel', type: 'select', label: 'Model', searchable: true, default: 'gemini-3-pro-image-preview', dynamicOptions: 'imageGenModels', options: [
                { value: 'gemini-3-pro-image-preview', label: 'Gemini 3 Pro (Preview)' },
                { value: 'imagen-4.0-fast-generate-001', label: 'Imagen 4 Fast' },
                { value: 'imagen-4.0-generate-001', label: 'Imagen 4 (Balanced)' },
                { value: 'imagen-3.0-generate-002', label: 'Imagen 3 (Balanced)' },
              ]
            },
            {
              key: 'aspectRatio', type: 'select', label: 'Aspect Ratio', default: '1:1', options: [
                { value: '1:1', label: '1:1' },
                { value: '16:9', label: '16:9' },
                { value: '9:16', label: '9:16' },
                { value: '4:3', label: '4:3' },
                { value: '3:4', label: '3:4' },
                { value: '2:3', label: '2:3' },
                { value: '3:2', label: '3:2' },
                { value: '4:5', label: '4:5' },
                { value: '5:4', label: '5:4' },
                { value: '21:9', label: '21:9 (Ultra-wide)' },
                { value: '4:1', label: '4:1' },
                { value: '1:4', label: '1:4' },
                { value: '8:1', label: '8:1' },
                { value: '1:8', label: '1:8' },
              ]
            },
            {
              type: 'row',
              fields: [
                {
                  key: 'imageResolution', type: 'select', label: 'Resolution', default: '1K', options: [
                    { value: '0.5K', label: '0.5K' },
                    { value: '1K', label: '1K' },
                    { value: '2K', label: '2K' },
                    { value: '4K', label: '4K' },
                  ]
                },
                {
                  key: 'imageVariations', type: 'select', label: 'Variations', default: '1', options: [
                    { value: '1', label: '1' },
                    { value: '2', label: '2' },
                    { value: '4', label: '4' },
                    { value: '8', label: '8' },
                  ]
                },
              ]
            },
            {
              key: 'thinkingLevel', type: 'select', label: 'Thinking Level', default: 'minimal', options: [
                { value: 'minimal', label: 'Minimal (Fast)' },
                { value: 'high', label: 'High (Better Quality)' },
              ]
            },
            { key: 'applyToSelection', type: 'checkbox', label: 'Apply to selected node', default: false, hideWhenNoSelection: true },
          ]
        },
{
          name: 'Generate Vector',
          desc: 'Create SVG vector from text/reference via Quiver',
          promptTemplate: 'Generate vector: {vectorSubject} {vectorStyle ? "(Style: {vectorStyle})" : ""}{vectorVariations ? " [Variations: {vectorVariations}]" : ""}',
          noSelection: true,
          directAction: 'generateVector',
          fields: [
            { key: 'vectorSubject', type: 'textarea', label: 'Subject / Content', placeholder: 'A modern geometric app logo with a lightning bolt...', aiButtons: true },
            { key: 'vectorStyle', type: 'textarea', label: 'Artistic Style / Direction', placeholder: 'Flat minimal vector, clean strokes, rounded corners...', aiButtons: true },
            {
              key: 'vectorReferenceImage',
              type: 'image',
              label: 'Reference Image (Optional)'
            },
            {
              key: 'vectorVariations', type: 'select', label: 'Variations', default: '1', options: [
                { value: '1', label: '1' },
                { value: '2', label: '2' },
                { value: '4', label: '4' },
                { value: '8', label: '8' },
                { value: '16', label: '16' },
              ]
            }
          ]
        }
];
