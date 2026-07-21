import type { SceneSpec } from '@animagen/scene-schema';
import * as THREE from 'three';
import { setupSubjectAnimation, updateAnimatedSubjects, type MotionContext } from './animation/index.js';
import type { AnimatedSubject } from './animation/index.js';
import { createCamera, createCameraController } from './camera/index.js';
import { buildEnvironment } from './environments/index.js';
import { buildBubbleTrail } from './effects/bubble-trail.js';
import { buildEffects } from './effects/index.js';
import { applyLightingToScene, buildLighting } from './lighting.js';
import { SeededRandom } from './rng.js';
import { buildSubject } from './subjects/index.js';

export interface SceneBuildOptions {
  aspect?: number;
}

export interface SceneBuildResult {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  update: (delta: number) => void;
  dispose: () => void;
}

export function buildSceneFromSpec(spec: SceneSpec, options: SceneBuildOptions = {}): SceneBuildResult {
  const rng = new SeededRandom(spec.seed);
  const scene = new THREE.Scene();
  scene.name = 'animagen-scene';

  const disposables: (() => void)[] = [];
  const updaters: ((delta: number, elapsed: number) => void)[] = [];
  let elapsed = 0;

  const lighting = buildLighting(spec.lighting);
  applyLightingToScene(scene, lighting);

  if (spec.environment === 'underwater') {
    scene.background = new THREE.Color(0x001a33);
    scene.fog = new THREE.FogExp2(0x003355, 0.04);
  }

  const motionCtx: MotionContext = { environment: spec.environment };

  const env = buildEnvironment(spec.environment, rng);
  scene.add(env.group);
  if (env.update) updaters.push((delta, el) => env.update!(el));

  const effects = buildEffects(spec.effects, rng);
  for (const fx of effects) {
    scene.add(fx.object);
    updaters.push((delta) => fx.update(delta));
  }

  const animated: AnimatedSubject[] = [];
  spec.subjects.forEach((subjectSpec, index) => {
    const subject = buildSubject({ spec: subjectSpec, rng, index });
    if (spec.environment === 'underwater') {
      subject.position.y = -1.5 + index * 0.3;
    }
    scene.add(subject);

    const anims = spec.animations.filter(
      (a) =>
        a.target === subject.name ||
        a.target === subjectSpec.type ||
        a.target === (subjectSpec.name ?? ''),
    );

    if (anims.length > 0) {
      for (const animSpec of anims) {
        animated.push(setupSubjectAnimation(subject, animSpec, motionCtx));
        if (animSpec.motion === 'swim' && spec.environment === 'underwater') {
          const trail = buildBubbleTrail(subject, rng);
          scene.add(trail.object);
          updaters.push((delta) => trail.update(delta));
        }
      }
    } else if (index === 0 && spec.animations.length > 0) {
      const animSpec = spec.animations[0]!;
      animated.push(setupSubjectAnimation(subject, animSpec, motionCtx));
      if (animSpec.motion === 'swim' && spec.environment === 'underwater') {
        const trail = buildBubbleTrail(subject, rng);
        scene.add(trail.object);
        updaters.push((delta) => trail.update(delta));
      }
    }
  });

  const camera = createCamera(options.aspect ?? 16 / 9);
  const camCtrl = createCameraController(spec.camera, camera);

  const update = (delta: number) => {
    elapsed += delta;
    updateAnimatedSubjects(animated, delta, elapsed, motionCtx);
    for (const fn of updaters) fn(delta, elapsed);
    camCtrl.update(delta, elapsed, scene);
  };

  const dispose = () => {
    scene.traverse((obj) => {
      if (obj instanceof THREE.Mesh) {
        obj.geometry.dispose();
        const mat = obj.material;
        if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
        else mat.dispose();
      }
    });
    for (const d of disposables) d();
  };

  return { scene, camera, update, dispose };
}
