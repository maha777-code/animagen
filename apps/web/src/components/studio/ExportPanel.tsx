'use client';

import { useRef, useState } from 'react';
import { downloadBlob } from '../../lib/export-glb';
import { useAnimagenStore } from '../../store/useAnimagenStore';
import type { SceneCanvasHandle } from './SceneCanvas';

interface ExportPanelProps {
  canvasRef: React.RefObject<SceneCanvasHandle | null>;
}

export function ExportPanel({ canvasRef }: ExportPanelProps) {
  const spec = useAnimagenStore((s) => s.spec);
  const [busy, setBusy] = useState<'glb' | 'video' | null>(null);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const slug = useRef(0);

  const handleGlb = async () => {
    if (!canvasRef.current || !spec) return;
    setBusy('glb');
    setError(null);
    try {
      const blob = await canvasRef.current.exportGlb();
      slug.current += 1;
      downloadBlob(blob, `animagen-${spec.seed}-${slug.current}.glb`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'GLB export failed');
    } finally {
      setBusy(null);
    }
  };

  const handleVideo = async () => {
    if (!canvasRef.current || !spec) return;
    setBusy('video');
    setError(null);
    setProgress(0);
    try {
      const blob = await canvasRef.current.exportVideo(setProgress);
      slug.current += 1;
      downloadBlob(blob, `animagen-${spec.seed}-${slug.current}.webm`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Video export failed');
    } finally {
      setBusy(null);
      setProgress(0);
    }
  };

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/80 p-4">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-400">Export</h2>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={handleGlb}
          disabled={!spec || busy !== null}
          className="rounded-lg border border-zinc-600 px-4 py-2 text-sm hover:bg-zinc-800 disabled:opacity-40"
        >
          {busy === 'glb' ? 'Exporting GLB…' : 'Download GLB'}
        </button>
        <button
          type="button"
          onClick={handleVideo}
          disabled={!spec || busy !== null}
          className="rounded-lg border border-zinc-600 px-4 py-2 text-sm hover:bg-zinc-800 disabled:opacity-40"
        >
          {busy === 'video' ? `Recording ${Math.round(progress * 100)}%` : 'Download WebM'}
        </button>
      </div>
      <p className="mt-2 text-xs text-zinc-500">Video renders offscreen at 1280×720 using the scene duration.</p>
      {error ? <p className="mt-2 text-xs text-red-400">{error}</p> : null}
    </div>
  );
}
