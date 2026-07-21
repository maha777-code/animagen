import type { AnimationSpec, EnvironmentType, PathType } from '@animagen/scene-schema';
import * as THREE from 'three';
import { updateSubjectParts } from './part-animations.js';

export interface AnimatedSubject {
  group: THREE.Group;
  mixer: THREE.AnimationMixer;
  pathOffset: number;
  spec: AnimationSpec;
}

export interface MotionContext {
  environment: EnvironmentType;
}

const PATH_MOTIONS = new Set<AnimationSpec['motion']>(['fly', 'swim', 'walk', 'run', 'orbit', 'patrol', 'dive']);

function isUnderwater(ctx: MotionContext): boolean {
  return ctx.environment === 'underwater';
}

function pathProfile(ctx: MotionContext, motion: AnimationSpec['motion']) {
  if (isUnderwater(ctx) || motion === 'swim') {
    return { baseY: -2.2, yAmp: 1.2, radius: 7, speedMul: 0.35 };
  }
  if (motion === 'fly') {
    return { baseY: 4.5, yAmp: 2.5, radius: 9, speedMul: 0.55 };
  }
  return { baseY: 2.5, yAmp: 1.5, radius: 8, speedMul: 0.5 };
}

export function samplePath(
  path: PathType | undefined,
  t: number,
  speed: number,
  ctx: MotionContext,
  motion: AnimationSpec['motion'] = 'float',
): THREE.Vector3 {
  const profile = pathProfile(ctx, motion);
  const time = t * speed * profile.speedMul;
  const y = (offset: number) => profile.baseY + Math.sin(time * 0.5 + offset) * profile.yAmp * 0.35;
  const r = profile.radius;

  switch (path) {
    case 'circle':
      return new THREE.Vector3(Math.cos(time) * r, y(0), Math.sin(time) * r);
    case 'figure8':
      return new THREE.Vector3(Math.sin(time) * r, profile.baseY, Math.sin(time * 2) * (r * 0.5));
    case 'line':
      return new THREE.Vector3((time % 20) - 10, profile.baseY, 0);
    case 'sine':
      return new THREE.Vector3((time % 16) - 8, y(1), Math.cos(time) * (r * 0.5));
    case 'spiral':
      return new THREE.Vector3(
        Math.cos(time) * (time * 0.25),
        profile.baseY + time * 0.06,
        Math.sin(time) * (time * 0.25),
      );
    case 'random':
      return new THREE.Vector3(
        Math.sin(time * 1.1) * r * 1.2,
        y(2),
        Math.cos(time * 0.9) * r * 1.2,
      );
    default:
      return new THREE.Vector3(Math.cos(time) * (r * 0.75), y(0.3), Math.sin(time) * (r * 0.75));
  }
}

function createMotionClip(motion: AnimationSpec['motion'], duration: number, ctx: MotionContext): THREE.AnimationClip {
  const tracks: THREE.KeyframeTrack[] = [];
  const times = [0, duration / 4, duration / 2, (duration * 3) / 4, duration];
  const low = isUnderwater(ctx);

  switch (motion) {
    case 'fly':
      tracks.push(new THREE.NumberKeyframeTrack('.position[y]', times, [3, 5.5, 4, 6, 3]));
      tracks.push(new THREE.NumberKeyframeTrack('.rotation[x]', times, [0, -0.25, 0.12, -0.2, 0]));
      break;
    case 'swim':
      tracks.push(
        new THREE.NumberKeyframeTrack('.position[y]', times, low ? [-2.5, -1.2, -2, -1, -2.5] : [0.5, 1.5, 0.8, 1.8, 0.5]),
      );
      tracks.push(new THREE.NumberKeyframeTrack('.rotation[x]', times, [0, 0.08, -0.05, 0.06, 0]));
      tracks.push(new THREE.NumberKeyframeTrack('.rotation[z]', times, [0, 0.06, -0.04, 0.05, 0]));
      break;
    case 'walk':
    case 'run':
      tracks.push(new THREE.NumberKeyframeTrack('.position[y]', times, [0, 0.3, 0, 0.3, 0]));
      tracks.push(new THREE.NumberKeyframeTrack('.rotation[z]', times, [0, 0.1, 0, -0.1, 0]));
      break;
    case 'bounce':
      tracks.push(new THREE.NumberKeyframeTrack('.position[y]', times, [1, 4, 1, 4, 1]));
      break;
    case 'spin':
      tracks.push(new THREE.NumberKeyframeTrack('.rotation[y]', times, [0, Math.PI, Math.PI * 2, Math.PI * 3, Math.PI * 4]));
      break;
    case 'float':
    case 'hover':
      tracks.push(
        new THREE.NumberKeyframeTrack('.position[y]', times, low ? [-1.5, -0.5, -1.5, -0.5, -1.5] : [3, 4.5, 3, 4.5, 3]),
      );
      break;
    case 'orbit':
      tracks.push(new THREE.NumberKeyframeTrack('.rotation[y]', times, [0, Math.PI / 2, Math.PI, (Math.PI * 3) / 2, Math.PI * 2]));
      break;
    case 'pulse':
    case 'grow':
      tracks.push(
        new THREE.VectorKeyframeTrack('.scale', times, [
          1, 1, 1, 1.2, 1.2, 1.2, 1, 1, 1, 1.15, 1.15, 1.15, 1, 1, 1,
        ]),
      );
      break;
    default:
      tracks.push(new THREE.NumberKeyframeTrack('.position[y]', times, [2, 2.2, 2, 2.2, 2]));
  }

  return new THREE.AnimationClip(motion, duration, tracks);
}

export function setupSubjectAnimation(
  group: THREE.Group,
  spec: AnimationSpec,
  ctx: MotionContext,
): AnimatedSubject {
  const duration = spec.duration ?? 4 / spec.speed;
  const clip = createMotionClip(spec.motion, duration, ctx);
  const mixer = new THREE.AnimationMixer(group);
  const action = mixer.clipAction(clip);
  action.setLoop(THREE.LoopRepeat, Infinity);
  action.play();

  if (!group.userData.prevPos) {
    group.userData.prevPos = group.position.clone();
  }

  return { group, mixer, pathOffset: Math.random() * 10, spec };
}

export function updateAnimatedSubjects(
  subjects: AnimatedSubject[],
  delta: number,
  elapsed: number,
  ctx: MotionContext,
): void {
  for (const sub of subjects) {
    sub.mixer.update(delta * sub.spec.speed);
    updateSubjectParts(sub.group, sub.spec.motion, elapsed);

    if (!PATH_MOTIONS.has(sub.spec.motion)) continue;

    const pos = samplePath(sub.spec.path, elapsed + sub.pathOffset, sub.spec.speed, ctx, sub.spec.motion);
    const lerp = sub.spec.motion === 'swim' ? 0.04 : 0.05;
    const prev = (sub.group.userData.prevPos as THREE.Vector3) ?? sub.group.position.clone();
    sub.group.position.lerp(pos, lerp);

    const tangent = new THREE.Vector3().subVectors(sub.group.position, prev);
    prev.copy(sub.group.position);
    sub.group.userData.prevPos = prev;

    if (tangent.lengthSq() > 0.0001) {
      const lookTarget = pos.clone().add(tangent.normalize().multiplyScalar(2));
      lookTarget.y = sub.group.position.y;
      sub.group.lookAt(lookTarget);
    }

    if (sub.spec.motion === 'swim' && isUnderwater(ctx)) {
      sub.group.rotation.z = THREE.MathUtils.lerp(sub.group.rotation.z, -tangent.x * 0.12, 0.08);
    }
  }
}

export function findSubjectGroup(scene: THREE.Scene, name: string): THREE.Group | undefined {
  let found: THREE.Group | undefined;
  scene.traverse((obj) => {
    if (obj.name === name && obj instanceof THREE.Group) found = obj;
  });
  return found;
}
