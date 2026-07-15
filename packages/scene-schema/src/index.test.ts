import { describe, expect, it } from 'vitest';
import {
  SceneSpecSchema,
  createDefaultSceneSpec,
  hashPrompt,
  normalizePrompt,
  parseSceneSpec,
  safeParseSceneSpec,
  seedFromPrompt,
} from './index.js';

describe('SceneSpecSchema', () => {
  const validSpec = {
    version: 1 as const,
    seed: 42,
    prompt: 'a red dragon flying over the ocean at sunset',
    subjects: [{ type: 'dragon' as const, color: 'red', scale: 1.5, count: 1 }],
    environment: 'ocean' as const,
    lighting: { timeOfDay: 'sunset' as const, mood: 'dramatic' as const },
    animations: [{ target: 'dragon', motion: 'fly' as const, speed: 1.2, path: 'circle' as const }],
    camera: { movement: 'follow' as const, duration: 15, target: 'dragon' },
    effects: ['storm' as const, 'rain' as const],
  };

  it('parses a valid SceneSpec', () => {
    const result = parseSceneSpec(validSpec);
    expect(result.prompt).toBe(validSpec.prompt);
    expect(result.subjects).toHaveLength(1);
    expect(result.subjects[0]?.type).toBe('dragon');
  });

  it('rejects invalid environment', () => {
    const result = safeParseSceneSpec({ ...validSpec, environment: 'underwater_city' });
    expect(result.success).toBe(false);
  });

  it('rejects empty prompt', () => {
    const result = safeParseSceneSpec({ ...validSpec, prompt: '' });
    expect(result.success).toBe(false);
  });

  it('rejects speed out of range', () => {
    const result = safeParseSceneSpec({
      ...validSpec,
      animations: [{ target: 'dragon', motion: 'fly', speed: 99 }],
    });
    expect(result.success).toBe(false);
  });

  it('applies defaults via createDefaultSceneSpec', () => {
    const spec = createDefaultSceneSpec({ prompt: 'test', seed: 1 });
    expect(spec.environment).toBe('abstract');
    expect(spec.camera.movement).toBe('orbit');
    expect(spec.version).toBe(1);
  });

  it('validates all 26 subject types', () => {
    const types = SceneSpecSchema.shape.subjects.element.shape.type.options;
    expect(types.length).toBeGreaterThanOrEqual(20);
    for (const type of types) {
      const spec = createDefaultSceneSpec({
        prompt: `a ${type}`,
        seed: 1,
        subjects: [{ type }],
      });
      expect(spec.subjects[0]?.type).toBe(type);
    }
  });
});

describe('prompt utilities', () => {
  it('normalizes whitespace and case', () => {
    expect(normalizePrompt('  A   Red   Dragon!!!  ')).toBe('a red dragon');
  });

  it('produces deterministic hash', () => {
    expect(hashPrompt('hello world')).toBe(hashPrompt('hello world'));
    // Punctuation is stripped during normalization — equivalent cache keys
    expect(hashPrompt('hello world')).toBe(hashPrompt('hello world!'));
    expect(hashPrompt('hello world')).not.toBe(hashPrompt('hello dragon'));
  });

  it('derives seed from prompt', () => {
    expect(seedFromPrompt('dragon')).toBe(seedFromPrompt('dragon'));
    expect(typeof seedFromPrompt('dragon')).toBe('number');
  });
});
