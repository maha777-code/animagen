import { describe, expect, it } from 'vitest';
import { samplePath } from './index.js';

describe('samplePath', () => {
  it('uses lower Y for underwater swim paths', () => {
    const air = samplePath('circle', 1, 1, { environment: 'ocean' }, 'fly');
    const water = samplePath('circle', 1, 1, { environment: 'underwater' }, 'swim');
    expect(water.y).toBeLessThan(air.y);
    expect(water.y).toBeLessThan(0);
  });

  it('uses higher Y for fly than swim in same environment', () => {
    const fly = samplePath('circle', 1, 1, { environment: 'ocean' }, 'fly');
    const swim = samplePath('circle', 1, 1, { environment: 'ocean' }, 'swim');
    expect(fly.y).toBeGreaterThan(swim.y);
  });
});
