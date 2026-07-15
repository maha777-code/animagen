import type { SceneSpec } from '@animagen/scene-schema';
import type * as THREE from 'three';

export interface SceneBuildResult {
  scene: THREE.Scene;
  dispose: () => void;
}

/** Placeholder — implemented in Phase 3. */
export function buildSceneFromSpec(_spec: SceneSpec): SceneBuildResult {
  throw new Error('buildSceneFromSpec not implemented — see Phase 3');
}
