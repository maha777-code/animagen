import type { SceneSpec } from '@animagen/scene-schema';

export interface ParseResult {
  spec: SceneSpec;
  confidence: number;
  matchedEntities: string[];
}

/** Placeholder — implemented in Phase 2. */
export function parsePrompt(_prompt: string): ParseResult {
  throw new Error('parsePrompt not implemented — see Phase 2');
}
