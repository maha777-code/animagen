import type { MotionType } from '@animagen/scene-schema';
import * as THREE from 'three';

/** Procedural motion on named child meshes (wings, tail, fins). */
export function updateSubjectParts(group: THREE.Group, motion: MotionType, elapsed: number): void {
  group.traverse((obj) => {
    if (!(obj instanceof THREE.Mesh)) return;

    if (obj.name === 'wing-left' || obj.name === 'wing-right') {
      const side = obj.name === 'wing-left' ? 1 : -1;
      if (motion === 'fly') {
        obj.rotation.z = side * (0.35 + Math.sin(elapsed * 10) * 0.45);
      } else if (motion === 'swim') {
        obj.rotation.z = side * (0.12 + Math.sin(elapsed * 5.5) * 0.18);
      }
      return;
    }

    if (obj.name === 'tail') {
      if (motion === 'swim') {
        obj.rotation.y = (obj.userData.restY as number | undefined ?? 0) + Math.sin(elapsed * 7) * 0.55;
        obj.rotation.x = Math.sin(elapsed * 3.5) * 0.1;
      } else if (motion === 'fly') {
        const restZ = (obj.userData.restZ as number | undefined) ?? 0;
        obj.rotation.z = restZ + Math.sin(elapsed * 4) * 0.22;
      }
      return;
    }

    if (obj.name === 'fin-dorsal' && motion === 'swim') {
      obj.rotation.x = Math.sin(elapsed * 6) * 0.15;
    }
  });
}
