import type { CameraSpec } from '@animagen/scene-schema';
import * as THREE from 'three';

export interface CameraController {
  camera: THREE.PerspectiveCamera;
  update: (delta: number, elapsed: number, scene: THREE.Scene) => void;
}

export function createCamera(aspect = 16 / 9): THREE.PerspectiveCamera {
  const camera = new THREE.PerspectiveCamera(55, aspect, 0.1, 500);
  camera.position.set(0, 8, 18);
  return camera;
}

export function createCameraController(spec: CameraSpec, camera: THREE.PerspectiveCamera): CameraController {
  const targetName = spec.target;
  let orbitAngle = 0;
  let flyIndex = 0;
  const flyPoints = [
    new THREE.Vector3(0, 5, 20),
    new THREE.Vector3(15, 8, 10),
    new THREE.Vector3(10, 12, -10),
    new THREE.Vector3(-10, 6, -15),
    new THREE.Vector3(-15, 5, 5),
  ];

  const update = (delta: number, elapsed: number, scene: THREE.Scene) => {
    let target = new THREE.Vector3(0, 2, 0);
    if (targetName) {
      const obj = scene.getObjectByName(targetName);
      if (obj) target = obj.getWorldPosition(new THREE.Vector3());
    }

    switch (spec.movement) {
      case 'orbit': {
        orbitAngle += delta * 0.3;
        const dist = spec.distance ?? 18;
        camera.position.set(
          target.x + Math.sin(orbitAngle) * dist,
          target.y + (spec.height ?? 6),
          target.z + Math.cos(orbitAngle) * dist,
        );
        camera.lookAt(target);
        break;
      }
      case 'follow': {
        const dist = spec.distance ?? 12;
        camera.position.lerp(
          new THREE.Vector3(target.x - dist * 0.5, target.y + 5, target.z + dist),
          0.05,
        );
        camera.lookAt(target);
        break;
      }
      case 'flythrough': {
        flyIndex = (elapsed * 0.15) % flyPoints.length;
        const idx = Math.floor(flyIndex);
        const next = (idx + 1) % flyPoints.length;
        const t = flyIndex - idx;
        const p0 = flyPoints[idx]!;
        const p1 = flyPoints[next]!;
        camera.position.lerpVectors(p0, p1, t);
        camera.lookAt(target);
        break;
      }
      case 'static':
      default:
        camera.position.set(0, spec.height ?? 8, spec.distance ?? 18);
        camera.lookAt(target);
        break;
    }
  };

  return { camera, update };
}
