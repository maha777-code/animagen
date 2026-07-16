import type { LightingSpec, TimeOfDay } from '@animagen/scene-schema';
import * as THREE from 'three';

export interface LightingSetup {
  ambient: THREE.AmbientLight;
  directional: THREE.DirectionalLight;
  hemisphere?: THREE.HemisphereLight;
  fog?: THREE.Fog;
  skyColor: THREE.Color;
  groundColor: THREE.Color;
}

const TIME_SKY: Record<TimeOfDay, number> = {
  dawn: 0xffaa77,
  morning: 0x88ccff,
  noon: 0x87ceeb,
  afternoon: 0x99bbee,
  sunset: 0xff7744,
  dusk: 0x664466,
  night: 0x0a0a20,
  midnight: 0x050510,
};

const TIME_SUN: Record<TimeOfDay, number> = {
  dawn: 0xffaa55,
  morning: 0xffffee,
  noon: 0xffffff,
  afternoon: 0xffffdd,
  sunset: 0xff6622,
  dusk: 0xaa4466,
  night: 0x223355,
  midnight: 0x111122,
};

const MOOD_INTENSITY: Record<string, number> = {
  calm: 0.8,
  dramatic: 1.2,
  mysterious: 0.5,
  cheerful: 1.0,
  dark: 0.35,
  epic: 1.3,
  peaceful: 0.75,
  stormy: 0.45,
  romantic: 0.7,
  eerie: 0.4,
};

export function buildLighting(lighting: LightingSpec): LightingSetup {
  const { timeOfDay, mood } = lighting;
  const intensity = MOOD_INTENSITY[mood] ?? 0.8;
  const skyColor = new THREE.Color(TIME_SKY[timeOfDay]);
  const groundColor = new THREE.Color(mood === 'dark' || timeOfDay === 'night' ? 0x111111 : 0x3d5c3d);

  const ambient = new THREE.AmbientLight(skyColor, 0.25 * intensity);
  const directional = new THREE.DirectionalLight(new THREE.Color(TIME_SUN[timeOfDay]), 0.9 * intensity);
  directional.position.set(50, 80, 40);
  directional.castShadow = true;
  directional.shadow.mapSize.set(1024, 1024);

  const hemisphere = new THREE.HemisphereLight(skyColor, groundColor, 0.4 * intensity);

  let fog: THREE.Fog | undefined;
  if (mood === 'stormy' || mood === 'mysterious' || mood === 'eerie') {
    fog = new THREE.Fog(skyColor.getHex(), 20, 120);
  }

  return { ambient, directional, hemisphere, fog, skyColor, groundColor };
}

export function applyLightingToScene(scene: THREE.Scene, setup: LightingSetup): void {
  scene.add(setup.ambient);
  scene.add(setup.directional);
  if (setup.hemisphere) scene.add(setup.hemisphere);
  if (setup.fog) scene.fog = setup.fog;
  scene.background = setup.skyColor;
}
