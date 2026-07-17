import type { SceneSpec } from '@animagen/scene-schema';

/** Client-only GLB export — dynamic imports avoid SSR loading Three.js exporters. */
export async function exportSpecToGlb(spec: SceneSpec): Promise<Blob> {
  const [{ buildSceneFromSpec }, { exportObjectToGlb }, THREE] = await Promise.all([
    import('@animagen/engine'),
    import('./export-glb'),
    import('three'),
  ]);

  const built = buildSceneFromSpec(spec, { aspect: 1 });
  try {
    const exportRoot = new THREE.Group();
    built.scene.traverse((obj) => {
      if (obj instanceof THREE.Mesh) {
        exportRoot.add(obj.clone());
      }
    });
    return exportObjectToGlb(exportRoot);
  } finally {
    built.dispose();
  }
}

/** Client-only WebM export at 1280×720. */
export async function exportSpecToVideo(
  spec: SceneSpec,
  onProgress?: (ratio: number) => void,
): Promise<Blob> {
  const [{ buildSceneFromSpec }, { recordCanvasAnimation }, THREE] = await Promise.all([
    import('@animagen/engine'),
    import('./export-video'),
    import('three'),
  ]);

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
}
