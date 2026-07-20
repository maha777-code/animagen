import { describe, expect, it } from 'vitest';
import { createDefaultSceneSpec } from '@animagen/scene-schema';
import { enrichSceneSpec } from './enrich-spec.js';

describe('enrichSceneSpec', () => {
  it('adds subject, animation, and cinematic camera when sparse', () => {
    const sparse = createDefaultSceneSpec({
      prompt: 'a shell swimming underwater with bubbles',
      seed: 42,
      subjects: [],
      environment: 'underwater',
      animations: [],
      effects: [],
    });
    const enriched = enrichSceneSpec(sparse);
    expect(enriched.subjects.length).toBeGreaterThan(0);
    expect(enriched.animations.length).toBeGreaterThan(0);
    expect(enriched.effects.length).toBeGreaterThan(0);
    expect(enriched.camera.duration).toBeGreaterThanOrEqual(15);
  });
});
