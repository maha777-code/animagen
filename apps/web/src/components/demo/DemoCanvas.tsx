'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { buildSceneFromSpec } from '@animagen/engine';
import { createDefaultSceneSpec, type EnvironmentType, type SubjectType } from '@animagen/scene-schema';

function ScenePreview({
  subject,
  environment,
}: {
  subject?: SubjectType;
  environment?: EnvironmentType;
}) {
  const spec = useMemo(
    () =>
      createDefaultSceneSpec({
        prompt: subject ? `demo ${subject}` : `demo ${environment}`,
        seed: subject ? subject.length * 100 : (environment?.length ?? 1) * 50,
        subjects: subject ? [{ type: subject, color: 'gold', name: subject }] : [],
        environment: environment ?? 'abstract',
        animations: subject ? [{ target: subject, motion: 'float', speed: 1, path: 'circle' }] : [],
        camera: { movement: 'orbit', duration: 10 },
        effects: [],
      }),
    [subject, environment],
  );

  const buildRef = useRef<ReturnType<typeof buildSceneFromSpec> | null>(null);

  useEffect(() => {
    return () => buildRef.current?.dispose();
  }, [spec]);

  return (
    <>
      <SceneContent spec={spec} buildRef={buildRef} />
      <OrbitControls makeDefault />
    </>
  );
}

function SceneContent({
  spec,
  buildRef,
}: {
  spec: ReturnType<typeof createDefaultSceneSpec>;
  buildRef: React.MutableRefObject<ReturnType<typeof buildSceneFromSpec> | null>;
}) {
  const groupRef = useRef<THREE.Group>(null);

  useEffect(() => {
    buildRef.current?.dispose();
    const built = buildSceneFromSpec(spec, { aspect: 1 });
    buildRef.current = built;
    const g = groupRef.current;
    if (g) {
      g.clear();
      while (built.scene.children.length > 0) {
        g.add(built.scene.children[0]!);
      }
    }
    return () => built.dispose();
  }, [spec, buildRef]);

  useFrame((_, delta) => {
    buildRef.current?.update(delta);
  });

  return <group ref={groupRef} />;
}

export function DemoCanvas({
  subject,
  environment,
}: {
  subject?: SubjectType;
  environment?: EnvironmentType;
}) {
  return (
    <Canvas shadows camera={{ position: [0, 8, 18], fov: 55 }} className="rounded-lg bg-black">
      <ambientLight intensity={0.3} />
      <ScenePreview subject={subject} environment={environment} />
    </Canvas>
  );
}
