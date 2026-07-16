import { describe, expect, it } from 'vitest';
import { buildSceneFromSpec } from './index.js';

describe('@animagen/engine', () => {
  it('exports buildSceneFromSpec', () => {
    expect(typeof buildSceneFromSpec).toBe('function');
  });
});
