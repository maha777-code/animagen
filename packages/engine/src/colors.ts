import * as THREE from 'three';

const NAMED: Record<string, number> = {
  red: 0xff3333,
  blue: 0x3388ff,
  green: 0x33cc66,
  yellow: 0xffdd33,
  orange: 0xff8833,
  purple: 0x9944ff,
  violet: 0xaa55ff,
  pink: 0xff66aa,
  white: 0xffffff,
  black: 0x222222,
  gold: 0xffcc00,
  golden: 0xffcc00,
  silver: 0xccccdd,
  bronze: 0xcd7f32,
  cyan: 0x33ddff,
  teal: 0x008877,
  crimson: 0xdc143c,
  emerald: 0x50c878,
  azure: 0x007fff,
  coral: 0xff7f50,
  navy: 0x001f3f,
  lavender: 0xe6e6fa,
  amber: 0xffbf00,
  ivory: 0xfffff0,
  charcoal: 0x36454f,
  lime: 0xbfff00,
  rust: 0xb7410e,
  copper: 0xb87333,
};

export function parseColor(name: string | undefined, fallback = 0x88aaff): THREE.Color {
  if (!name) return new THREE.Color(fallback);
  const hex = NAMED[name.toLowerCase()];
  if (hex !== undefined) return new THREE.Color(hex);
  return new THREE.Color(fallback);
}

export function createStandardMaterial(color: THREE.Color, opts?: { metalness?: number; roughness?: number; emissive?: number }): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    color,
    metalness: opts?.metalness ?? 0.2,
    roughness: opts?.roughness ?? 0.6,
    emissive: opts?.emissive ? new THREE.Color(opts.emissive) : new THREE.Color(0x000000),
    emissiveIntensity: opts?.emissive ? 0.3 : 0,
  });
}
