import type { AnimationSpec, PathType } from '@animagen/scene-schema';
import * as THREE from 'three';

export interface AnimatedSubject {
  group: THREE.Group;
  mixer: THREE.AnimationMixer;
  pathOffset: number;
  spec: AnimationSpec;
}

function samplePath(path: PathType | undefined, t: number, speed: number): THREE.Vector3 {
  const time = t * speed;
  switch (path) {
    case 'circle':
      return new THREE.Vector3(Math.cos(time) * 8, 3 + Math.sin(time * 0.5), Math.sin(time) * 8);
    case 'figure8':
      return new THREE.Vector3(Math.sin(time) * 8, 3, Math.sin(time * 2) * 4);
    case 'line':
      return new THREE.Vector3((time % 20) - 10, 3, 0);
    case 'sine':
      return new THREE.Vector3(time % 16 - 8, 3 + Math.sin(time * 2) * 2, Math.cos(time) * 4);
    case 'spiral':
      return new THREE.Vector3(Math.cos(time) * (time * 0.3), 2 + time * 0.1, Math.sin(time) * (time * 0.3));
    case 'random':
      return new THREE.Vector3(Math.sin(time * 1.1) * 10, 3 + Math.cos(time * 0.7) * 2, Math.cos(time * 0.9) * 10);
    default:
      return new THREE.Vector3(Math.cos(time) * 6, 4 + Math.sin(time * 0.3) * 2, Math.sin(time) * 6);
  }
}

function createMotionClip(motion: AnimationSpec['motion'], duration: number): THREE.AnimationClip {
  const tracks: THREE.KeyframeTrack[] = [];
  const times = [0, duration / 4, duration / 2, (duration * 3) / 4, duration];

  switch (motion) {
    case 'fly':
    case 'swim':
      tracks.push(new THREE.NumberKeyframeTrack('.position[y]', times, [2, 4, 3, 5, 2]));
      tracks.push(new THREE.NumberKeyframeTrack('.rotation[x]', times, [0, -0.2, 0.1, -0.15, 0]));
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
      tracks.push(new THREE.NumberKeyframeTrack('.position[y]', times, [3, 4.5, 3, 4.5, 3]));
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

export function setupSubjectAnimation(group: THREE.Group, spec: AnimationSpec): AnimatedSubject {
  const duration = spec.duration ?? 4 / spec.speed;
  const clip = createMotionClip(spec.motion, duration);
  const mixer = new THREE.AnimationMixer(group);
  const action = mixer.clipAction(clip);
  action.setLoop(THREE.LoopRepeat, Infinity);
  action.play();

  return { group, mixer, pathOffset: Math.random() * 10, spec };
}

export function updateAnimatedSubjects(subjects: AnimatedSubject[], delta: number, elapsed: number): void {
  for (const sub of subjects) {
    sub.mixer.update(delta * sub.spec.speed);

    const pos = samplePath(sub.spec.path, elapsed + sub.pathOffset, sub.spec.speed * 0.5);
    if (['fly', 'swim', 'walk', 'run', 'orbit', 'patrol', 'dive'].includes(sub.spec.motion)) {
      sub.group.position.lerp(pos, 0.05);
      sub.group.lookAt(pos.x + 1, pos.y, pos.z);
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
