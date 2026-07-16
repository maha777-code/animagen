import { describe, expect, it } from 'vitest';
import { seedFromPrompt } from '@animagen/scene-schema';
import { PROMPT_FIXTURES } from './fixtures.js';
import { parsePrompt, PARSER_CONFIDENCE_THRESHOLD } from './index.js';
import { tokenize } from './tokenize.js';
import { extractEntities } from './extract.js';

describe('parsePrompt', () => {
  it('parses the canonical dragon prompt', () => {
    const result = parsePrompt('a red dragon flying over a stormy ocean at sunset');
    expect(result.spec.subjects[0]?.type).toBe('dragon');
    expect(result.spec.subjects[0]?.color).toBe('red');
    expect(result.spec.environment).toBe('ocean');
    expect(result.spec.lighting.timeOfDay).toBe('sunset');
    expect(result.spec.animations[0]?.motion).toBe('fly');
    expect(result.spec.effects).toContain('storm');
    expect(result.confidence).toBeGreaterThan(PARSER_CONFIDENCE_THRESHOLD);
    expect(result.needsLlmFallback).toBe(false);
    expect(result.spec.metadata?.source).toBe('parser');
  });

  it('is deterministic for same prompt', () => {
    const a = parsePrompt('a blue bird in the forest');
    const b = parsePrompt('a blue bird in the forest');
    expect(a.spec.seed).toBe(b.spec.seed);
    expect(a.spec).toEqual(b.spec);
    expect(a.spec.seed).toBe(seedFromPrompt('a blue bird in the forest'));
  });

  it('supports seed override', () => {
    const result = parsePrompt('a dragon flying', { seed: 999 });
    expect(result.spec.seed).toBe(999);
  });

  it('rejects empty prompt', () => {
    expect(() => parsePrompt('   ')).toThrow(/empty/i);
  });

  it('flags low-confidence prompts for LLM fallback', () => {
    const result = parsePrompt('quantum flux harmonizing with ethereal resonance');
    expect(result.needsLlmFallback).toBe(true);
    expect(result.confidence).toBeLessThan(PARSER_CONFIDENCE_THRESHOLD);
  });
});

describe('tokenize', () => {
  it('splits words and preserves hyphenated tokens', () => {
    const tokens = tokenize('A red dragon-fly over the sea!');
    expect(tokens.map((t) => t.value)).toContain('red');
    expect(tokens.map((t) => t.value)).toContain('dragon-fly');
    expect(tokens.map((t) => t.value)).toContain('sea');
  });
});

describe('extractEntities', () => {
  it('extracts multiple subjects', () => {
    const entities = extractEntities('a cat and a dog running in a meadow');
    expect(entities.subjects.map((s) => s.type)).toEqual(['cat', 'dog']);
    expect(entities.environment).toBe('meadow');
    expect(entities.animations[0]?.motion).toBe('run');
  });
});

describe('PROMPT_FIXTURES', () => {
  it('contains at least 30 fixtures', () => {
    expect(PROMPT_FIXTURES.length).toBeGreaterThanOrEqual(30);
  });

  it.each(PROMPT_FIXTURES)('$id — $prompt', (fixture) => {
    const result = parsePrompt(fixture.prompt);
    const { expect: exp } = fixture;

    if (exp.subjectTypes) {
      const types = result.spec.subjects.map((s) => s.type);
      for (const type of exp.subjectTypes) {
        expect(types).toContain(type);
      }
    }

    if (exp.colors) {
      const colors = result.spec.subjects.map((s) => s.color).filter(Boolean);
      for (const color of exp.colors) {
        expect(colors).toContain(color);
      }
    }

    if (exp.environment) {
      expect(result.spec.environment).toBe(exp.environment);
    }

    if (exp.timeOfDay) {
      expect(result.spec.lighting.timeOfDay).toBe(exp.timeOfDay);
    }

    if (exp.mood) {
      expect(result.spec.lighting.mood).toBe(exp.mood);
    }

    if (exp.motions) {
      const motions = result.spec.animations.map((a) => a.motion);
      for (const motion of exp.motions) {
        expect(motions).toContain(motion);
      }
    }

    if (exp.effects) {
      for (const effect of exp.effects) {
        expect(result.spec.effects).toContain(effect);
      }
    }

    if (exp.camera) {
      expect(result.spec.camera.movement).toBe(exp.camera);
    }

    if (exp.minConfidence !== undefined) {
      expect(result.confidence).toBeGreaterThanOrEqual(exp.minConfidence);
    }

    if (exp.maxConfidence !== undefined) {
      expect(result.confidence).toBeLessThanOrEqual(exp.maxConfidence);
    }

    if (exp.needsLlmFallback !== undefined) {
      expect(result.needsLlmFallback).toBe(exp.needsLlmFallback);
    }

    expect(result.spec.version).toBe(1);
    expect(result.matchedEntities.length).toBeGreaterThanOrEqual(0);
  });
});
