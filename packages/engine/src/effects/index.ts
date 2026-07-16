import type { EffectType } from '@animagen/scene-schema';
import * as THREE from 'three';
import type { SeededRandom } from '../rng.js';

export interface EffectResult {
  object: THREE.Object3D;
  update: (delta: number) => void;
}

function particleSystem(
  count: number,
  color: number,
  size: number,
  rng: SeededRandom,
  spread: number,
): { points: THREE.Points; velocities: Float32Array } {
  const positions = new Float32Array(count * 3);
  const velocities = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    positions[i * 3] = rng.range(-spread, spread);
    positions[i * 3 + 1] = rng.range(0, spread);
    positions[i * 3 + 2] = rng.range(-spread, spread);
    velocities[i * 3] = rng.range(-0.5, 0.5);
    velocities[i * 3 + 1] = rng.range(-2, -0.2);
    velocities[i * 3 + 2] = rng.range(-0.5, 0.5);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const points = new THREE.Points(
    geo,
    new THREE.PointsMaterial({ color, size, transparent: true, opacity: 0.8, depthWrite: false }),
  );
  return { points, velocities };
}

function buildRain(rng: SeededRandom): EffectResult {
  const count = 800;
  const { points, velocities } = particleSystem(count, 0xaaccff, 0.08, rng, 40);
  points.name = 'effect-rain';
  const update = (delta: number) => {
    const pos = points.geometry.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < count; i++) {
      let y = pos.getY(i) + velocities[i * 3 + 1]! * delta * 20;
      if (y < 0) y = 30 + rng.next() * 10;
      pos.setY(i, y);
    }
    pos.needsUpdate = true;
  };
  return { object: points, update };
}

function buildSnow(rng: SeededRandom): EffectResult {
  const count = 600;
  const { points, velocities } = particleSystem(count, 0xffffff, 0.12, rng, 40);
  points.name = 'effect-snow';
  const update = (delta: number) => {
    const pos = points.geometry.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < count; i++) {
      let x = pos.getX(i) + Math.sin(Date.now() * 0.001 + i) * delta * 0.5;
      let y = pos.getY(i) + velocities[i * 3 + 1]! * delta * 5;
      if (y < 0) y = 25 + rng.next() * 5;
      pos.setX(i, x);
      pos.setY(i, y);
    }
    pos.needsUpdate = true;
  };
  return { object: points, update };
}

function buildSparkles(rng: SeededRandom): EffectResult {
  const count = 200;
  const { points } = particleSystem(count, 0xffff88, 0.15, rng, 25);
  points.name = 'effect-sparkles';
  const update = (_delta: number) => {
    const mat = points.material as THREE.PointsMaterial;
    mat.opacity = 0.5 + Math.sin(Date.now() * 0.003) * 0.3;
  };
  return { object: points, update };
}

function buildFire(rng: SeededRandom): EffectResult {
  const group = new THREE.Group();
  group.name = 'effect-fire';
  const count = 150;
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    positions[i * 3] = rng.range(-0.5, 0.5);
    positions[i * 3 + 1] = rng.range(0, 2);
    positions[i * 3 + 2] = rng.range(-0.5, 0.5);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const fire = new THREE.Points(
    geo,
    new THREE.PointsMaterial({ color: 0xff6622, size: 0.2, transparent: true, opacity: 0.9 }),
  );
  group.add(fire);
  const update = (delta: number) => {
    const pos = fire.geometry.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < count; i++) {
      let y = pos.getY(i) + delta * (2 + rng.next());
      if (y > 3) y = rng.next() * 0.5;
      pos.setY(i, y);
    }
    pos.needsUpdate = true;
  };
  return { object: group, update };
}

function buildBubbles(rng: SeededRandom): EffectResult {
  const count = 100;
  const { points, velocities } = particleSystem(count, 0x88ddff, 0.1, rng, 15);
  points.name = 'effect-bubbles';
  const update = (delta: number) => {
    const pos = points.geometry.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < count; i++) {
      let y = pos.getY(i) - velocities[i * 3 + 1]! * delta * 3;
      if (y > 20) y = rng.next() * 2;
      pos.setY(i, y);
    }
    pos.needsUpdate = true;
  };
  return { object: points, update };
}

function buildDust(rng: SeededRandom): EffectResult {
  const count = 300;
  const { points } = particleSystem(count, 0xccaa77, 0.06, rng, 30);
  points.name = 'effect-dust';
  return { object: points, update: () => {} };
}

function buildLeaves(rng: SeededRandom): EffectResult {
  const count = 120;
  const { points, velocities } = particleSystem(count, 0xcc8833, 0.1, rng, 25);
  points.name = 'effect-leaves';
  const update = (delta: number) => {
    const pos = points.geometry.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < count; i++) {
      pos.setX(i, pos.getX(i) + Math.sin(Date.now() * 0.002 + i) * delta);
      pos.setY(i, pos.getY(i) + velocities[i * 3 + 1]! * delta * 2);
      if (pos.getY(i) < 0) pos.setY(i, 15);
    }
    pos.needsUpdate = true;
  };
  return { object: points, update };
}

function buildFogEffect(): EffectResult {
  const obj = new THREE.Group();
  obj.name = 'effect-fog';
  return { object: obj, update: () => {} };
}

function buildStorm(rng: SeededRandom): EffectResult {
  const rain = buildRain(rng);
  rain.object.name = 'effect-storm';
  let flash = 0;
  const update = (delta: number) => {
    rain.update(delta);
    flash -= delta;
    if (rng.next() < 0.002) flash = 0.15;
  };
  return { object: rain.object, update };
}

function buildLightning(): EffectResult {
  const group = new THREE.Group();
  group.name = 'effect-lightning';
  return { object: group, update: () => {} };
}

export function buildEffect(type: EffectType, rng: SeededRandom): EffectResult {
  switch (type) {
    case 'rain':
      return buildRain(rng);
    case 'snow':
      return buildSnow(rng);
    case 'fog':
      return buildFogEffect();
    case 'fire':
      return buildFire(rng);
    case 'sparkles':
      return buildSparkles(rng);
    case 'storm':
      return buildStorm(rng);
    case 'lightning':
      return buildLightning();
    case 'bubbles':
      return buildBubbles(rng);
    case 'dust':
      return buildDust(rng);
    case 'leaves':
      return buildLeaves(rng);
    default:
      return buildFogEffect();
  }
}

export function buildEffects(types: EffectType[], rng: SeededRandom): EffectResult[] {
  return types.map((t) => buildEffect(t, rng));
}
