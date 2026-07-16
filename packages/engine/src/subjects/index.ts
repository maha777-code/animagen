import type { SubjectSpec, SubjectType } from '@animagen/scene-schema';
import * as THREE from 'three';
import { createStandardMaterial, parseColor } from '../colors.js';
import type { SeededRandom } from '../rng.js';

export interface SubjectBuildOptions {
  spec: SubjectSpec;
  rng: SeededRandom;
  index: number;
}

function mesh(geo: THREE.BufferGeometry, mat: THREE.Material): THREE.Mesh {
  const m = new THREE.Mesh(geo, mat);
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
}

function group(name: string): THREE.Group {
  const g = new THREE.Group();
  g.name = name;
  return g;
}

function buildDragon(color: THREE.Color, scale: number): THREE.Group {
  const g = group('dragon');
  const mat = createStandardMaterial(color, { emissive: color.getHex(), roughness: 0.4 });
  const body = mesh(new THREE.SphereGeometry(1.2 * scale, 12, 10), mat);
  body.scale.set(1.8, 1, 1);
  g.add(body);
  const head = mesh(new THREE.SphereGeometry(0.7 * scale, 10, 8), mat);
  head.position.set(2 * scale, 0.4 * scale, 0);
  g.add(head);
  for (const side of [-1, 1]) {
    const wing = mesh(new THREE.ConeGeometry(1.5 * scale, 0.1 * scale, 4), mat);
    wing.rotation.x = Math.PI / 2;
    wing.rotation.z = side * 0.4;
    wing.position.set(0, 0.3 * scale, side * 1.2 * scale);
    g.add(wing);
  }
  const tail = mesh(new THREE.ConeGeometry(0.4 * scale, 2 * scale, 6), mat);
  tail.rotation.z = Math.PI / 2;
  tail.position.set(-2.2 * scale, 0, 0);
  g.add(tail);
  return g;
}

function buildBird(color: THREE.Color, scale: number): THREE.Group {
  const g = group('bird');
  const mat = createStandardMaterial(color);
  g.add(mesh(new THREE.SphereGeometry(0.35 * scale, 8, 8), mat));
  const beak = mesh(new THREE.ConeGeometry(0.12 * scale, 0.3 * scale, 4), createStandardMaterial(new THREE.Color(0xffaa00)));
  beak.rotation.z = -Math.PI / 2;
  beak.position.set(0.35 * scale, 0, 0);
  g.add(beak);
  for (const side of [-1, 1]) {
    const wing = mesh(new THREE.BoxGeometry(0.8 * scale, 0.05 * scale, 0.4 * scale), mat);
    wing.position.set(-0.1 * scale, 0, side * 0.35 * scale);
    wing.rotation.x = side * 0.3;
    g.add(wing);
  }
  return g;
}

function buildFish(color: THREE.Color, scale: number): THREE.Group {
  const g = group('fish');
  const mat = createStandardMaterial(color, { metalness: 0.4 });
  const body = mesh(new THREE.SphereGeometry(0.5 * scale, 10, 8), mat);
  body.scale.set(1.8, 0.8, 0.6);
  g.add(body);
  const tail = mesh(new THREE.ConeGeometry(0.35 * scale, 0.5 * scale, 3), mat);
  tail.rotation.y = Math.PI / 2;
  tail.position.set(-0.7 * scale, 0, 0);
  g.add(tail);
  return g;
}

function buildCar(color: THREE.Color, scale: number): THREE.Group {
  const g = group('car');
  const mat = createStandardMaterial(color, { metalness: 0.6, roughness: 0.3 });
  const body = mesh(new THREE.BoxGeometry(2 * scale, 0.5 * scale, 1 * scale), mat);
  body.position.y = 0.35 * scale;
  g.add(body);
  const cabin = mesh(new THREE.BoxGeometry(1 * scale, 0.4 * scale, 0.9 * scale), mat);
  cabin.position.set(-0.1 * scale, 0.7 * scale, 0);
  g.add(cabin);
  const wheelMat = createStandardMaterial(new THREE.Color(0x222222));
  for (const [x, z] of [[-0.6, 0.45], [-0.6, -0.45], [0.6, 0.45], [0.6, -0.45]] as const) {
    const w = mesh(new THREE.CylinderGeometry(0.2 * scale, 0.2 * scale, 0.15 * scale, 12), wheelMat);
    w.rotation.z = Math.PI / 2;
    w.position.set(x * scale, 0.2 * scale, z * scale);
    g.add(w);
  }
  return g;
}

function buildRobot(color: THREE.Color, scale: number): THREE.Group {
  const g = group('robot');
  const mat = createStandardMaterial(color, { metalness: 0.7, roughness: 0.25 });
  const torso = mesh(new THREE.BoxGeometry(0.8 * scale, 1.2 * scale, 0.5 * scale), mat);
  torso.position.y = 1.2 * scale;
  g.add(torso);
  const head = mesh(new THREE.BoxGeometry(0.5 * scale, 0.5 * scale, 0.5 * scale), mat);
  head.position.y = 2 * scale;
  g.add(head);
  const eyeMat = createStandardMaterial(new THREE.Color(0x00ffff), { emissive: 0x00ffff });
  for (const side of [-1, 1]) {
    const eye = mesh(new THREE.SphereGeometry(0.06 * scale, 6, 6), eyeMat);
    eye.position.set(0.26 * scale, 2.05 * scale, side * 0.15 * scale);
    g.add(eye);
  }
  for (const side of [-1, 1]) {
    const arm = mesh(new THREE.BoxGeometry(0.15 * scale, 0.8 * scale, 0.15 * scale), mat);
    arm.position.set(side * 0.55 * scale, 1.2 * scale, 0);
    g.add(arm);
    const leg = mesh(new THREE.BoxGeometry(0.2 * scale, 0.7 * scale, 0.2 * scale), mat);
    leg.position.set(side * 0.2 * scale, 0.35 * scale, 0);
    g.add(leg);
  }
  return g;
}

function buildHuman(color: THREE.Color, scale: number): THREE.Group {
  const g = group('human');
  const mat = createStandardMaterial(color);
  const torso = mesh(new THREE.CylinderGeometry(0.35 * scale, 0.3 * scale, 0.9 * scale, 8), mat);
  torso.position.y = 1.1 * scale;
  g.add(torso);
  const head = mesh(new THREE.SphereGeometry(0.25 * scale, 10, 10), mat);
  head.position.y = 1.75 * scale;
  g.add(head);
  for (const side of [-1, 1]) {
    const leg = mesh(new THREE.CylinderGeometry(0.1 * scale, 0.1 * scale, 0.8 * scale, 6), mat);
    leg.position.set(side * 0.15 * scale, 0.4 * scale, 0);
    g.add(leg);
    const arm = mesh(new THREE.CylinderGeometry(0.07 * scale, 0.07 * scale, 0.65 * scale, 6), mat);
    arm.position.set(side * 0.45 * scale, 1.2 * scale, 0);
    g.add(arm);
  }
  return g;
}

function buildTree(color: THREE.Color, scale: number): THREE.Group {
  const g = group('tree');
  const trunk = mesh(new THREE.CylinderGeometry(0.2 * scale, 0.3 * scale, 1.5 * scale, 8), createStandardMaterial(new THREE.Color(0x8b4513)));
  trunk.position.y = 0.75 * scale;
  g.add(trunk);
  const foliage = mesh(new THREE.ConeGeometry(1.2 * scale, 2.5 * scale, 8), createStandardMaterial(color));
  foliage.position.y = 2.2 * scale;
  g.add(foliage);
  return g;
}

function buildPlanet(color: THREE.Color, scale: number): THREE.Group {
  const g = group('planet');
  const mat = createStandardMaterial(color, { roughness: 0.8 });
  g.add(mesh(new THREE.SphereGeometry(1.5 * scale, 24, 24), mat));
  return g;
}

function buildSpaceship(color: THREE.Color, scale: number): THREE.Group {
  const g = group('spaceship');
  const mat = createStandardMaterial(color, { metalness: 0.8, roughness: 0.2 });
  const body = mesh(new THREE.CylinderGeometry(0.4 * scale, 0.6 * scale, 2 * scale, 8), mat);
  body.rotation.x = Math.PI / 2;
  g.add(body);
  const nose = mesh(new THREE.ConeGeometry(0.4 * scale, 0.8 * scale, 8), mat);
  nose.rotation.x = -Math.PI / 2;
  nose.position.z = 1.4 * scale;
  g.add(nose);
  for (const side of [-1, 1]) {
    const fin = mesh(new THREE.BoxGeometry(0.05 * scale, 0.8 * scale, 0.4 * scale), mat);
    fin.position.set(side * 0.5 * scale, 0, -0.5 * scale);
    g.add(fin);
  }
  return g;
}

function buildButterfly(color: THREE.Color, scale: number): THREE.Group {
  const g = group('butterfly');
  const mat = createStandardMaterial(color, { emissive: color.getHex() });
  g.add(mesh(new THREE.CapsuleGeometry(0.08 * scale, 0.3 * scale, 4, 8), createStandardMaterial(new THREE.Color(0x333333))));
  for (const side of [-1, 1]) {
    const wing = mesh(new THREE.CircleGeometry(0.5 * scale, 8), mat);
    wing.rotation.y = side * 0.5;
    wing.position.set(0, 0.1 * scale, side * 0.3 * scale);
    g.add(wing);
  }
  return g;
}

function buildWhale(color: THREE.Color, scale: number): THREE.Group {
  const g = group('whale');
  const mat = createStandardMaterial(color);
  const body = mesh(new THREE.SphereGeometry(1 * scale, 12, 10), mat);
  body.scale.set(2.5, 0.8, 0.9);
  g.add(body);
  const tail = mesh(new THREE.ConeGeometry(0.5 * scale, 0.8 * scale, 4), mat);
  tail.rotation.z = Math.PI / 2;
  tail.position.set(-2 * scale, 0.2 * scale, 0);
  g.add(tail);
  return g;
}

function buildHorse(color: THREE.Color, scale: number): THREE.Group {
  const g = group('horse');
  const mat = createStandardMaterial(color);
  const body = mesh(new THREE.BoxGeometry(1.4 * scale, 0.7 * scale, 0.5 * scale), mat);
  body.position.y = 1 * scale;
  g.add(body);
  const neck = mesh(new THREE.CylinderGeometry(0.15 * scale, 0.2 * scale, 0.7 * scale, 6), mat);
  neck.rotation.z = -0.4;
  neck.position.set(0.7 * scale, 1.5 * scale, 0);
  g.add(neck);
  const head = mesh(new THREE.BoxGeometry(0.35 * scale, 0.25 * scale, 0.2 * scale), mat);
  head.position.set(1 * scale, 1.85 * scale, 0);
  g.add(head);
  for (const [x, z] of [[-0.4, 0.2], [-0.4, -0.2], [0.4, 0.2], [0.4, -0.2]] as const) {
    const leg = mesh(new THREE.CylinderGeometry(0.08 * scale, 0.08 * scale, 0.9 * scale, 6), mat);
    leg.position.set(x * scale, 0.45 * scale, z * scale);
    g.add(leg);
  }
  return g;
}

function buildQuadruped(name: string, color: THREE.Color, scale: number, bodyScale: number): THREE.Group {
  const g = group(name);
  const mat = createStandardMaterial(color);
  const body = mesh(new THREE.SphereGeometry(0.4 * bodyScale * scale, 10, 8), mat);
  body.scale.set(1.4, 1, 0.9);
  body.position.y = 0.45 * scale;
  g.add(body);
  const head = mesh(new THREE.SphereGeometry(0.25 * scale, 8, 8), mat);
  head.position.set(0.55 * scale, 0.55 * scale, 0);
  g.add(head);
  for (const [x, z] of [[-0.25, 0.2], [-0.25, -0.2], [0.25, 0.2], [0.25, -0.2]] as const) {
    const leg = mesh(new THREE.CylinderGeometry(0.05 * scale, 0.05 * scale, 0.35 * scale, 6), mat);
    leg.position.set(x * scale, 0.17 * scale, z * scale);
    g.add(leg);
  }
  return g;
}

function buildSnake(color: THREE.Color, scale: number): THREE.Group {
  const g = group('snake');
  const mat = createStandardMaterial(color);
  for (let i = 0; i < 8; i++) {
    const seg = mesh(new THREE.SphereGeometry(0.2 * scale - i * 0.015 * scale, 8, 6), mat);
    seg.position.set(-i * 0.25 * scale, Math.sin(i * 0.5) * 0.15 * scale, 0);
    g.add(seg);
  }
  return g;
}

function buildCube(color: THREE.Color, scale: number): THREE.Group {
  const g = group('cube');
  g.add(mesh(new THREE.BoxGeometry(1 * scale, 1 * scale, 1 * scale), createStandardMaterial(color)));
  return g;
}

function buildSphereSubject(color: THREE.Color, scale: number): THREE.Group {
  const g = group('sphere');
  g.add(mesh(new THREE.SphereGeometry(0.7 * scale, 16, 16), createStandardMaterial(color, { metalness: 0.5 })));
  return g;
}

function buildFlower(color: THREE.Color, scale: number): THREE.Group {
  const g = group('flower');
  const stem = mesh(new THREE.CylinderGeometry(0.03 * scale, 0.03 * scale, 1 * scale, 6), createStandardMaterial(new THREE.Color(0x228822)));
  stem.position.y = 0.5 * scale;
  g.add(stem);
  for (let i = 0; i < 6; i++) {
    const petal = mesh(new THREE.SphereGeometry(0.15 * scale, 6, 6), createStandardMaterial(color, { emissive: color.getHex() }));
    const a = (i / 6) * Math.PI * 2;
    petal.position.set(Math.cos(a) * 0.2 * scale, 1.05 * scale, Math.sin(a) * 0.2 * scale);
    g.add(petal);
  }
  return g;
}

function buildHouse(color: THREE.Color, scale: number): THREE.Group {
  const g = group('house');
  const walls = mesh(new THREE.BoxGeometry(1.5 * scale, 1 * scale, 1.5 * scale), createStandardMaterial(color));
  walls.position.y = 0.5 * scale;
  g.add(walls);
  const roof = mesh(new THREE.ConeGeometry(1.2 * scale, 0.7 * scale, 4), createStandardMaterial(new THREE.Color(0x883333)));
  roof.position.y = 1.35 * scale;
  roof.rotation.y = Math.PI / 4;
  g.add(roof);
  return g;
}

function buildBoat(color: THREE.Color, scale: number): THREE.Group {
  const g = group('boat');
  const hull = mesh(new THREE.BoxGeometry(1.5 * scale, 0.4 * scale, 0.7 * scale), createStandardMaterial(color));
  hull.position.y = 0.2 * scale;
  g.add(hull);
  const mast = mesh(new THREE.CylinderGeometry(0.03 * scale, 0.03 * scale, 1.5 * scale, 6), createStandardMaterial(new THREE.Color(0x8b4513)));
  mast.position.set(0, 1 * scale, 0);
  g.add(mast);
  return g;
}

function buildAirplane(color: THREE.Color, scale: number): THREE.Group {
  const g = group('airplane');
  const mat = createStandardMaterial(color, { metalness: 0.5 });
  const fuselage = mesh(new THREE.CylinderGeometry(0.2 * scale, 0.25 * scale, 2 * scale, 8), mat);
  fuselage.rotation.z = Math.PI / 2;
  g.add(fuselage);
  const wing = mesh(new THREE.BoxGeometry(0.1 * scale, 2.5 * scale, 0.6 * scale), mat);
  wing.position.y = 0.05 * scale;
  g.add(wing);
  const tail = mesh(new THREE.BoxGeometry(0.08 * scale, 0.6 * scale, 0.4 * scale), mat);
  tail.position.set(-0.9 * scale, 0.3 * scale, 0);
  g.add(tail);
  return g;
}

function buildRocket(color: THREE.Color, scale: number): THREE.Group {
  const g = group('rocket');
  const mat = createStandardMaterial(color, { metalness: 0.6 });
  const body = mesh(new THREE.CylinderGeometry(0.3 * scale, 0.35 * scale, 1.8 * scale, 10), mat);
  body.position.y = 0.9 * scale;
  g.add(body);
  const nose = mesh(new THREE.ConeGeometry(0.3 * scale, 0.6 * scale, 10), mat);
  nose.position.y = 2.1 * scale;
  g.add(nose);
  for (const side of [-1, 1]) {
    const fin = mesh(new THREE.BoxGeometry(0.05 * scale, 0.4 * scale, 0.3 * scale), mat);
    fin.position.set(side * 0.25 * scale, 0.3 * scale, 0);
    fin.rotation.z = side * 0.5;
    g.add(fin);
  }
  return g;
}

function buildCloud(color: THREE.Color, scale: number): THREE.Group {
  const g = group('cloud');
  const mat = createStandardMaterial(color, { roughness: 1 });
  for (const [x, y, z, r] of [[0, 0, 0, 0.5], [0.4, 0.1, 0, 0.4], [-0.35, 0, 0.1, 0.35], [0.1, 0.15, -0.2, 0.3]] as const) {
    const puff = mesh(new THREE.SphereGeometry(r * scale, 10, 10), mat);
    puff.position.set(x * scale, y * scale, z * scale);
    g.add(puff);
  }
  return g;
}

function buildMountain(color: THREE.Color, scale: number): THREE.Group {
  const g = group('mountain');
  g.add(mesh(new THREE.ConeGeometry(2 * scale, 3 * scale, 6), createStandardMaterial(color, { roughness: 0.9 })));
  return g;
}

function buildCrystal(color: THREE.Color, scale: number): THREE.Group {
  const g = group('crystal');
  const mat = createStandardMaterial(color, { metalness: 0.3, emissive: color.getHex() });
  const geo = new THREE.OctahedronGeometry(0.8 * scale, 0);
  g.add(mesh(geo, mat));
  return g;
}

function buildUnknown(color: THREE.Color, scale: number): THREE.Group {
  const g = group('unknown');
  g.add(mesh(new THREE.IcosahedronGeometry(0.6 * scale, 1), createStandardMaterial(color, { emissive: color.getHex() })));
  return g;
}

const BUILDERS: Record<SubjectType, (color: THREE.Color, scale: number) => THREE.Group> = {
  dragon: buildDragon,
  bird: buildBird,
  fish: buildFish,
  car: buildCar,
  robot: buildRobot,
  human: buildHuman,
  tree: buildTree,
  planet: buildPlanet,
  spaceship: buildSpaceship,
  butterfly: buildButterfly,
  whale: buildWhale,
  horse: buildHorse,
  cat: (c, s) => buildQuadruped('cat', c, s, 0.9),
  dog: (c, s) => buildQuadruped('dog', c, s, 1),
  snake: buildSnake,
  cube: buildCube,
  sphere: buildSphereSubject,
  flower: buildFlower,
  house: buildHouse,
  boat: buildBoat,
  airplane: buildAirplane,
  rocket: buildRocket,
  cloud: buildCloud,
  mountain: buildMountain,
  crystal: buildCrystal,
  unknown: buildUnknown,
};

export function buildSubject(opts: SubjectBuildOptions): THREE.Group {
  const { spec, index } = opts;
  const scale = (spec.scale ?? 1) * (0.8 + opts.rng.next() * 0.4);
  const color = parseColor(spec.color);
  const builder = BUILDERS[spec.type] ?? buildUnknown;
  const root = builder(color, scale);
  root.name = spec.name ?? spec.type;

  const count = spec.count ?? 1;
  if (count <= 1) {
    root.position.set(index * 3, 2, 0);
    return root;
  }

  const container = group(root.name);
  for (let i = 0; i < Math.min(count, 10); i++) {
    const clone = root.clone(true);
    clone.position.set((i - count / 2) * 2.5, 2 + opts.rng.range(-0.5, 0.5), opts.rng.range(-2, 2));
    container.add(clone);
  }
  return container;
}

export const ALL_SUBJECT_TYPES = Object.keys(BUILDERS) as SubjectType[];
