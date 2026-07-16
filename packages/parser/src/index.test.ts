import { describe, expect, it } from 'vitest';
import { parsePrompt, PARSER_CONFIDENCE_THRESHOLD } from './index.js';

describe('@animagen/parser', () => {
  it('exports parsePrompt', () => {
    expect(typeof parsePrompt).toBe('function');
    expect(PARSER_CONFIDENCE_THRESHOLD).toBeGreaterThan(0);
  });
});
