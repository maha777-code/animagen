import {
  normalizePrompt,
  parseSceneSpec,
  seedFromPrompt,
  type SceneSpec,
} from '@animagen/scene-schema';
import { PARSER_CONFIDENCE_THRESHOLD } from './dictionaries.js';
import { computeConfidence, extractEntities } from './extract.js';
import { tokenize } from './tokenize.js';

export interface ParseOptions {
  seed?: number;
}

export interface ParseResult {
  spec: SceneSpec;
  confidence: number;
  matchedEntities: string[];
  needsLlmFallback: boolean;
}

export function parsePrompt(prompt: string, options: ParseOptions = {}): ParseResult {
  const trimmed = prompt.trim();
  if (!trimmed) throw new Error('Prompt cannot be empty');

  const entities = extractEntities(trimmed);
  const tokens = tokenize(trimmed);
  const confidence = computeConfidence({
    subjects: entities.subjects,
    environment: entities.environment,
    lighting: entities.lighting,
    animations: entities.animations,
    effects: entities.effects,
    tokenCount: tokens.length,
  });

  const seed = options.seed ?? seedFromPrompt(trimmed);
  const spec = parseSceneSpec({
    version: 1,
    seed,
    prompt: trimmed,
    subjects: entities.subjects,
    environment: entities.environment,
    lighting: entities.lighting,
    animations: entities.animations,
    camera: entities.camera,
    effects: entities.effects,
    metadata: {
      source: 'parser',
      confidence,
      normalizedPrompt: normalizePrompt(trimmed),
      generatedAt: new Date().toISOString(),
    },
  });

  return {
    spec,
    confidence,
    matchedEntities: entities.matchedEntities,
    needsLlmFallback: confidence < PARSER_CONFIDENCE_THRESHOLD,
  };
}

export { PARSER_CONFIDENCE_THRESHOLD };
