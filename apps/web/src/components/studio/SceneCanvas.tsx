'use client';

import { OrbitControls } from '@react-three/drei';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { buildSceneFromSpec, type SceneBuildResult } from '@animagen/engine';
import type { SceneSpec } from '@animagen/scene-schema';
import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import * as THREE from 'three';
import { exportObjectToGlb } from '../../lib/export-glb';
import { recordCanvasAnimation } from '../../lib/export-video';

export interface SceneCanvasHandle {
  exportGlb: () => Promise<Blob>;
  exportVideo: (onProgress?: (ratio: number) => void) => Promise<Blob>;
}

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
      {orbitMode ? <OrbitControls makeDefault /> : null}
    </>
  );
}

export const SceneCanvas = forwardRef<SceneCanvasHandle, SceneCanvasProps>(function SceneCanvas(
  { spec, isPlaying, orbitMode, playbackKey },
  ref,
) {
  const buildRef = useRef<SceneBuildResult | null>(null);

  useImperativeHandle(ref, () => ({
    async exportGlb() {
      const built = buildRef.current;
      if (!built) throw new Error('Scene is not ready');

      const exportRoot = new THREE.Group();
      built.scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          exportRoot.add(obj.clone());
        }
      });
      return exportObjectToGlb(exportRoot);
    },

    async exportVideo(onProgress) {
      const width = 1280;
      const height = 720;
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        preserveDrawingBuffer: true,
      });
      renderer.setSize(width, height, false);

      const built = buildSceneFromSpec(spec, { aspect: width / height });
      const duration = spec.camera.duration ?? 10;

      try {
        return await recordCanvasAnimation({
          canvas,
          durationSec: duration,
          onProgress,
          onFrame: (delta) => {
            built.update(delta);
            renderer.render(built.scene, built.camera);
          },
        });
      } finally {
        built.dispose();
        renderer.dispose();
      }
    },
  }));

  return (
    <Canvas
      shadows
      className="h-full w-full rounded-lg bg-black"
      camera={{ position: [0, 8, 18], fov: 55 }}
      gl={{ preserveDrawingBuffer: true }}
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
});
