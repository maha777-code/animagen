'use client';

import { OrbitControls } from '@react-three/drei';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Bloom, EffectComposer } from '@react-three/postprocessing';
import { buildSceneFromSpec, type SceneBuildResult } from '@animagen/engine';
import type { SceneSpec } from '@animagen/scene-schema';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface SceneCanvasProps {
  spec: SceneSpec;
  isPlaying: boolean;
  orbitMode: boolean;
  playbackKey: number;
}

function SceneContent({
  spec,
  isPlaying,
  orbitMode,
  playbackKey,
  buildRef,
}: {
  spec: SceneSpec;
  isPlaying: boolean;
  orbitMode: boolean;
  playbackKey: number;
  buildRef: React.MutableRefObject<SceneBuildResult | null>;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const { camera, size } = useThree();

  useEffect(() => {
    buildRef.current?.dispose();
    const aspect = size.width / Math.max(size.height, 1);
    const built = buildSceneFromSpec(spec, { aspect });
    buildRef.current = built;

    const group = groupRef.current;
    if (group) {
      group.clear();
      while (built.scene.children.length > 0) {
        group.add(built.scene.children[0]!);
      }
    }

    return () => built.dispose();
  }, [spec, playbackKey, buildRef, size.width, size.height]);

  useFrame((_, delta) => {
    const built = buildRef.current;
    if (!built) return;

    if (isPlaying) {
      built.update(delta);
    }

    if (!orbitMode) {
      const engineCam = built.camera;
      camera.position.copy(engineCam.position);
      camera.quaternion.copy(engineCam.quaternion);
      if (camera instanceof THREE.PerspectiveCamera && engineCam instanceof THREE.PerspectiveCamera) {
        camera.fov = engineCam.fov;
        camera.near = engineCam.near;
        camera.far = engineCam.far;
        camera.updateProjectionMatrix();
      }
    }
  });

  return (
    <>
      <group ref={groupRef} />
      <EffectComposer multisampling={0}>
        <Bloom
          intensity={spec.environment === 'underwater' ? 0.55 : 0.35}
          luminanceThreshold={0.15}
          luminanceSmoothing={0.85}
          mipmapBlur
        />
      </EffectComposer>
      {orbitMode ? <OrbitControls makeDefault /> : null}
    </>
  );
}

export function SceneCanvas({ spec, isPlaying, orbitMode, playbackKey }: SceneCanvasProps) {
  const buildRef = useRef<SceneBuildResult | null>(null);

  return (
    <Canvas
      shadows
      className="h-full w-full rounded-lg bg-black"
      camera={{ position: [0, 8, 18], fov: 55 }}
      gl={{ preserveDrawingBuffer: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.1 }}
    >
      <SceneContent
        spec={spec}
        isPlaying={isPlaying}
        orbitMode={orbitMode}
        playbackKey={playbackKey}
        buildRef={buildRef}
      />
    </Canvas>
  );
}
