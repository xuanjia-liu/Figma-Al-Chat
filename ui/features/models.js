import {
  DEFAULT_ANTHROPIC_MODELS,
  DEFAULT_GEMINI_MODELS,
  DEFAULT_OPENAI_MODELS,
} from '../state.js';

function toMetadata(models) {
  return Object.fromEntries(models.map((model) => [model.id, { ...model }]));
}

export function createInitialModelMetadata() {
  return {
    gemini: toMetadata(DEFAULT_GEMINI_MODELS),
    openai: toMetadata(DEFAULT_OPENAI_MODELS),
    anthropic: toMetadata(DEFAULT_ANTHROPIC_MODELS),
  };
}
