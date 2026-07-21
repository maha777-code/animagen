import * as THREE from 'three';
import type { SeededRandom } from '../rng.js';
import type { EffectResult } from './index.js';

interface TrailBubble {
  mesh: THREE.Mesh;
  life: number;
  maxLife: number;
}

const sharedGeo = new THREE.SphereGeometry(0.07, 6, 6);

/** Bubbles spawned behind a moving subject (swim / underwater). */
export function buildBubbleTrail(follow: THREE.Object3D, rng: SeededRandom): EffectResult {
  const group = new THREE.Group();
  group.name = 'effect-bubble-trail';
  const bubbles: TrailBubble[] = [];
  let spawnAcc = 0;

  const update = (delta: number) => {
    spawnAcc += delta;
    while (spawnAcc >= 0.07) {
      spawnAcc -= 0.07;
      const mat = new THREE.MeshBasicMaterial({
        color: 0x88ddff,
        transparent: true,
        opacity: 0.6,
        depthWrite: false,
      });
      const mesh = new THREE.Mesh(sharedGeo, mat);
      const wp = new THREE.Vector3();
      follow.getWorldPosition(wp);
      mesh.position.copy(wp);
      mesh.position.x += rng.range(-0.35, 0.35);
      mesh.position.y += rng.range(-0.25, 0.2);
      mesh.position.z += rng.range(-0.35, 0.35);
      mesh.scale.setScalar(0.4 + rng.next() * 0.9);
      group.add(mesh);
      bubbles.push({ mesh, life: 0, maxLife: 1 + rng.next() * 1.2 });
    }

    for (let i = bubbles.length - 1; i >= 0; i--) {
      const b = bubbles[i]!;
      b.life += delta;
      b.mesh.position.y += delta * (0.5 + b.mesh.scale.x * 0.4);
      b.mesh.position.x += Math.sin(b.life * 8 + i) * delta * 0.15;
      const mat = b.mesh.material as THREE.MeshBasicMaterial;
      mat.opacity = Math.max(0, 0.6 * (1 - b.life / b.maxLife));
      if (b.life >= b.maxLife) {
        group.remove(b.mesh);
        mat.dispose();
        bubbles.splice(i, 1);
      }
    }
  };

  return { object: group, update };
}
