import type { EnvironmentType } from '@animagen/scene-schema';
import * as THREE from 'three';
import type { SeededRandom } from '../rng.js';

export interface EnvironmentResult {
  group: THREE.Group;
  update?: (elapsed: number) => void;
}

function groundPlane(color: number, size = 200): THREE.Mesh {
  const geo = new THREE.PlaneGeometry(size, size, 32, 32);
  geo.rotateX(-Math.PI / 2);
  const mat = new THREE.MeshStandardMaterial({ color, roughness: 0.9 });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.receiveShadow = true;
  return mesh;
}

function buildOcean(): EnvironmentResult {
  const group = new THREE.Group();
  group.name = 'environment-ocean';

  const geo = new THREE.PlaneGeometry(300, 300, 64, 64);
  geo.rotateX(-Math.PI / 2);
  const mat = new THREE.MeshStandardMaterial({ color: 0x006994, roughness: 0.3, metalness: 0.4 });
  const water = new THREE.Mesh(geo, mat);
  water.receiveShadow = true;
  group.add(water);

  const positions = geo.attributes.position!;
  const update = (elapsed: number) => {
    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i);
      const z = positions.getZ(i);
      const wave =
        Math.sin(x * 0.08 + elapsed * 1.2) * 0.4 +
        Math.sin(z * 0.06 + elapsed * 0.9) * 0.3 +
        Math.sin((x + z) * 0.05 + elapsed * 1.5) * 0.2;
      positions.setY(i, wave);
    }
    positions.needsUpdate = true;
    geo.computeVertexNormals();
  };

  return { group, update };
}

function buildForest(rng: SeededRandom): EnvironmentResult {
  const group = new THREE.Group();
  group.name = 'environment-forest';
  group.add(groundPlane(0x2d5a27));

  const trunkGeo = new THREE.CylinderGeometry(0.15, 0.2, 1.5, 6);
  const trunkMat = new THREE.MeshStandardMaterial({ color: 0x8b4513 });
  const leafGeo = new THREE.ConeGeometry(1, 2.5, 6);
  const leafMat = new THREE.MeshStandardMaterial({ color: 0x228833 });

  for (let i = 0; i < 40; i++) {
    const tree = new THREE.Group();
    const trunk = new THREE.Mesh(trunkGeo, trunkMat);
    trunk.position.y = 0.75;
    tree.add(trunk);
    const leaves = new THREE.Mesh(leafGeo, leafMat);
    leaves.position.y = 2.2;
    tree.add(leaves);
    tree.position.set(rng.range(-40, 40), 0, rng.range(-40, 40));
    tree.scale.setScalar(0.6 + rng.next() * 0.8);
    group.add(tree);
  }
  return { group };
}

function buildDesert(rng: SeededRandom): EnvironmentResult {
  const group = new THREE.Group();
  group.name = 'environment-desert';
  const geo = new THREE.PlaneGeometry(200, 200, 48, 48);
  geo.rotateX(-Math.PI / 2);
  const positions = geo.attributes.position!;
  for (let i = 0; i < positions.count; i++) {
    const x = positions.getX(i);
    const z = positions.getZ(i);
    positions.setY(i, Math.sin(x * 0.1) * Math.cos(z * 0.08) * 2 + rng.next() * 0.3);
  }
  positions.needsUpdate = true;
  geo.computeVertexNormals();
  group.add(new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: 0xc2b280, roughness: 1 })));
  return { group };
}

function buildSpace(rng: SeededRandom): EnvironmentResult {
  const group = new THREE.Group();
  group.name = 'environment-space';
  const count = 3000;
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    positions[i * 3] = rng.range(-100, 100);
    positions[i * 3 + 1] = rng.range(-50, 80);
    positions[i * 3 + 2] = rng.range(-100, 100);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const stars = new THREE.Points(
    geo,
    new THREE.PointsMaterial({ color: 0xffffff, size: 0.15, sizeAttenuation: true }),
  );
  group.add(stars);
  return { group };
}

function buildCity(rng: SeededRandom): EnvironmentResult {
  const group = new THREE.Group();
  group.name = 'environment-city';
  group.add(groundPlane(0x333344, 120));

  const boxGeo = new THREE.BoxGeometry(1, 1, 1);
  for (let i = 0; i < 80; i++) {
    const h = 2 + rng.next() * 12;
    const mat = new THREE.MeshStandardMaterial({
      color: new THREE.Color().setHSL(0.6, 0.1, 0.2 + rng.next() * 0.3),
      emissive: new THREE.Color(0x112244),
      emissiveIntensity: rng.next() * 0.3,
    });
    const building = new THREE.Mesh(boxGeo, mat);
    building.scale.set(1 + rng.next() * 2, h, 1 + rng.next() * 2);
    building.position.set(rng.range(-45, 45), h / 2, rng.range(-45, 45));
    building.castShadow = true;
    group.add(building);
  }
  return { group };
}

function buildMountains(rng: SeededRandom): EnvironmentResult {
  const group = new THREE.Group();
  group.name = 'environment-mountains';
  group.add(groundPlane(0x4a6741));
  for (let i = 0; i < 12; i++) {
    const h = 5 + rng.next() * 10;
    const mountain = new THREE.Mesh(
      new THREE.ConeGeometry(3 + rng.next() * 4, h, 6),
      new THREE.MeshStandardMaterial({ color: 0x888899, roughness: 0.95 }),
    );
    mountain.position.set(rng.range(-50, 50), h / 2, rng.range(-50, 50));
    group.add(mountain);
  }
  return { group };
}

function buildMeadow(rng: SeededRandom): EnvironmentResult {
  const group = new THREE.Group();
  group.name = 'environment-meadow';
  group.add(groundPlane(0x5a9e4b));
  for (let i = 0; i < 30; i++) {
    const flower = new THREE.Mesh(
      new THREE.SphereGeometry(0.1, 6, 6),
      new THREE.MeshStandardMaterial({ color: new THREE.Color().setHSL(rng.next(), 0.7, 0.6) }),
    );
    flower.position.set(rng.range(-30, 30), 0.1, rng.range(-30, 30));
    group.add(flower);
  }
  return { group };
}

function buildUnderwater(): EnvironmentResult {
  const group = new THREE.Group();
  group.name = 'environment-underwater';
  group.add(groundPlane(0xc2b280, 150));
  const coralMat = new THREE.MeshStandardMaterial({ color: 0xff6688, emissive: 0x441122, emissiveIntensity: 0.2 });
  for (let i = 0; i < 20; i++) {
    const coral = new THREE.Mesh(new THREE.ConeGeometry(0.3, 1.5, 5), coralMat);
    coral.position.set(Math.sin(i) * 15, 0.75, Math.cos(i) * 15);
    group.add(coral);
  }
  return { group };
}

function buildVolcano(): EnvironmentResult {
  const group = new THREE.Group();
  group.name = 'environment-volcano';
  group.add(groundPlane(0x3d3d3d));
  const volcano = new THREE.Mesh(
    new THREE.ConeGeometry(8, 12, 8),
    new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 1 }),
  );
  volcano.position.y = 6;
  group.add(volcano);
  const lava = new THREE.Mesh(
    new THREE.SphereGeometry(1.5, 12, 12),
    new THREE.MeshStandardMaterial({ color: 0xff4400, emissive: 0xff2200, emissiveIntensity: 1 }),
  );
  lava.position.y = 11;
  group.add(lava);
  return { group };
}

function buildArctic(rng: SeededRandom): EnvironmentResult {
  const group = new THREE.Group();
  group.name = 'environment-arctic';
  group.add(groundPlane(0xeef4ff));
  for (let i = 0; i < 8; i++) {
    const iceberg = new THREE.Mesh(
      new THREE.BoxGeometry(2 + rng.next() * 3, 1 + rng.next() * 2, 2 + rng.next() * 3),
      new THREE.MeshStandardMaterial({ color: 0xaaccff, roughness: 0.2, metalness: 0.1 }),
    );
    iceberg.position.set(rng.range(-30, 30), 0.5, rng.range(-30, 30));
    group.add(iceberg);
  }
  return { group };
}

function buildCave(): EnvironmentResult {
  const group = new THREE.Group();
  group.name = 'environment-cave';
  const floor = groundPlane(0x3d3428, 80);
  group.add(floor);
  for (let i = 0; i < 8; i++) {
    const stalactite = new THREE.Mesh(
      new THREE.ConeGeometry(0.5, 3, 5),
      new THREE.MeshStandardMaterial({ color: 0x776655 }),
    );
    stalactite.position.set(Math.sin(i * 1.2) * 10, 5, Math.cos(i * 1.2) * 10);
    group.add(stalactite);
  }
  return { group };
}

function buildSkyEnv(): EnvironmentResult {
  const group = new THREE.Group();
  group.name = 'environment-sky';
  group.add(groundPlane(0x88cc88, 100));
  return { group };
}

function buildBeach(): EnvironmentResult {
  const group = new THREE.Group();
  group.name = 'environment-beach';
  group.add(groundPlane(0xf4e4bc, 100));
  const water = groundPlane(0x006994, 100);
  water.position.set(0, -0.01, -60);
  group.add(water);
  return { group };
}

function buildJungle(rng: SeededRandom): EnvironmentResult {
  return buildForest(rng);
}

function buildAbstract(): EnvironmentResult {
  const group = new THREE.Group();
  group.name = 'environment-abstract';
  const grid = new THREE.GridHelper(60, 30, 0x444466, 0x222233);
  group.add(grid);
  return { group };
}

export function buildEnvironment(type: EnvironmentType, rng: SeededRandom): EnvironmentResult {
  switch (type) {
    case 'ocean':
      return buildOcean();
    case 'forest':
      return buildForest(rng);
    case 'desert':
      return buildDesert(rng);
    case 'space':
      return buildSpace(rng);
    case 'city':
      return buildCity(rng);
    case 'mountains':
      return buildMountains(rng);
    case 'meadow':
      return buildMeadow(rng);
    case 'underwater':
      return buildUnderwater();
    case 'volcano':
      return buildVolcano();
    case 'arctic':
      return buildArctic(rng);
    case 'cave':
      return buildCave();
    case 'sky':
      return buildSkyEnv();
    case 'beach':
      return buildBeach();
    case 'jungle':
      return buildJungle(rng);
    case 'abstract':
      return buildAbstract();
    default:
      return buildAbstract();
  }
}
