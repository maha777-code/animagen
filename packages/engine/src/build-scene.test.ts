import { describe, expect, it } from 'vitest';
import { createDefaultSceneSpec } from '@animagen/scene-schema';
import { SeededRandom } from './rng.js';
import { buildSceneFromSpec } from './build-scene.js';
import { ALL_SUBJECT_TYPES } from './subjects/index.js';

describe('SeededRandom', () => {
  it('is deterministic for same seed', () => {
    const a = new SeededRandom(42);
    const b = new SeededRandom(42);
    expect(a.next()).toBe(b.next());
    expect(a.next()).toBe(b.next());
  });

  it('differs for different seeds', () => {
    const a = new SeededRandom(1);
    const b = new SeededRandom(2);
    expect(a.next()).not.toBe(b.next());
  });
});

describe('buildSceneFromSpec', () => {
  it('builds a scene from default spec', () => {
    const spec = createDefaultSceneSpec({ prompt: 'test', seed: 123 });
    const result = buildSceneFromSpec(spec);
    expect(result.scene).toBeDefined();
    expect(result.camera).toBeDefined();
    expect(typeof result.update).toBe('function');
    expect(typeof result.dispose).toBe('function');
    result.dispose();
  });

  it('builds dragon ocean scene', () => {
    const spec = createDefaultSceneSpec({
      prompt: 'a red dragon flying over the ocean',
      seed: 999,
      subjects: [{ type: 'dragon', color: 'red', name: 'dragon' }],
      environment: 'ocean',
      animations: [{ target: 'dragon', motion: 'fly', speed: 1 }],
      camera: { movement: 'follow', duration: 10, target: 'dragon' },
      effects: ['storm'],
    });
    const { scene, update, dispose } = buildSceneFromSpec(spec);
    expect(scene.children.length).toBeGreaterThan(0);
    update(0.016);
    dispose();
  });

  it('supports all subject types', () => {
    for (const type of ALL_SUBJECT_TYPES) {
      const spec = createDefaultSceneSpec({
        prompt: `a ${type}`,
        seed: 1,
        subjects: [{ type }],
        environment: 'abstract',
      });
      const { scene, dispose } = buildSceneFromSpec(spec);
      expect(scene.children.length).toBeGreaterThan(0);
      dispose();
    }
  });
});
