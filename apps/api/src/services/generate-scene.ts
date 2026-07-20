import { parsePrompt, PARSER_CONFIDENCE_THRESHOLD } from '@animagen/parser';
import { normalizePrompt, parseSceneSpec, seedFromPrompt, type SceneSpec } from '@animagen/scene-schema';
import { cacheKey, type SceneCache } from '../cache/scene-cache.js';
import { requestInferenceSpec } from '../clients/inference-client.js';
import { config } from '../config.js';
import { enrichSceneSpec } from './enrich-spec.js';

export interface GenerateRequest {
  prompt: string;
  seed?: number;
  forceLlm?: boolean;
}

export interface GenerateResponse {
  tier: 'cache' | 'parser' | 'llm' | 'enhanced';
  spec: SceneSpec;
  confidence: number;
  matchedEntities: string[];
  needsLlmFallback: boolean;
  cached: boolean;
}

export async function generateScene(
  cache: SceneCache,
  input: GenerateRequest,
): Promise<GenerateResponse> {
  const prompt = input.prompt.trim();
  if (!prompt) {
    throw new Error('Prompt cannot be empty');
  }

  const seed = input.seed ?? seedFromPrompt(prompt);
  const key = cacheKey(normalizePrompt(prompt), seed);

  const cached = await cache.get(key);
  if (cached) {
    return {
      tier: 'cache',
      spec: cached,
      confidence: cached.metadata?.confidence ?? 1,
      matchedEntities: [],
      needsLlmFallback: false,
      cached: true,
    };
  }

  const parsed = parsePrompt(prompt, { seed });
  const threshold = config.parserConfidenceThreshold || PARSER_CONFIDENCE_THRESHOLD;
  const useParserOnly = !input.forceLlm && parsed.confidence >= threshold && !parsed.needsLlmFallback;

  if (useParserOnly) {
    const spec = enrichSceneSpec({
      ...parsed.spec,
      metadata: { ...parsed.spec.metadata, source: 'parser', confidence: parsed.confidence },
    });
    await cache.set(key, spec, config.cacheTtlSec);
    return {
      tier: 'parser',
      spec,
      confidence: parsed.confidence,
      matchedEntities: parsed.matchedEntities,
      needsLlmFallback: false,
      cached: false,
    };
  }

  try {
    const inference = await requestInferenceSpec(config.inferenceUrl, {
      prompt,
      seed,
      hint: parsed.spec,
    });
    const spec = enrichSceneSpec({
      ...inference.spec,
      seed,
      prompt,
      metadata: {
        ...inference.spec.metadata,
        source: inference.source === 'llm' ? 'llm' : 'fallback',
        confidence: Math.max(parsed.confidence, inference.source === 'llm' ? 0.85 : 0.65),
        normalizedPrompt: normalizePrompt(prompt),
        generatedAt: new Date().toISOString(),
      },
    });
    await cache.set(key, spec, config.cacheTtlSec);
    return {
      tier: inference.source === 'llm' ? 'llm' : 'enhanced',
      spec,
      confidence: spec.metadata?.confidence ?? 0.85,
      matchedEntities: parsed.matchedEntities,
      needsLlmFallback: false,
      cached: false,
    };
  } catch {
    const spec = enrichSceneSpec({
      ...parsed.spec,
      metadata: {
        ...parsed.spec.metadata,
        source: 'fallback',
        confidence: Math.max(parsed.confidence, 0.5),
        normalizedPrompt: normalizePrompt(prompt),
        generatedAt: new Date().toISOString(),
      },
    });
    await cache.set(key, spec, config.cacheTtlSec);
    return {
      tier: 'enhanced',
      spec,
      confidence: spec.metadata?.confidence ?? parsed.confidence,
      matchedEntities: parsed.matchedEntities,
      needsLlmFallback: parsed.needsLlmFallback,
      cached: false,
    };
  }
}

export function validateGenerateBody(body: unknown): GenerateRequest {
  if (!body || typeof body !== 'object') throw new Error('Invalid JSON body');
  const b = body as Record<string, unknown>;
  if (typeof b.prompt !== 'string' || !b.prompt.trim()) throw new Error('prompt is required');
  if (b.seed !== undefined && typeof b.seed !== 'number') throw new Error('seed must be a number');
  if (b.forceLlm !== undefined && typeof b.forceLlm !== 'boolean') throw new Error('forceLlm must be boolean');
  return {
    prompt: b.prompt.trim(),
    seed: typeof b.seed === 'number' ? b.seed : undefined,
    forceLlm: b.forceLlm === true,
  };
}
