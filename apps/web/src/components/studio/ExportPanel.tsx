'use client';

import { compileLtxPrompt } from '@animagen/director';
import { useRef, useState } from 'react';
import {
  captureCanvasDataUrl,
  findStudioCanvas,
  startCinematicRender,
} from '../../lib/cinematic-export';
import { downloadBlob } from '../../lib/download';
import { useAnimagenStore } from '../../store/useAnimagenStore';
import { useDirectorStore, useDirectorTotalDuration } from '../../store/useDirectorStore';

interface ExportPanelProps {
  viewportRef?: React.RefObject<HTMLDivElement | null>;
}

export function ExportPanel({ viewportRef }: ExportPanelProps) {
  const baseSpec = useAnimagenStore((s) => s.spec);
  const getPreviewSpec = useDirectorStore((s) => s.getPreviewSpec);
  const project = useDirectorStore((s) => s.project);
  const setCompiledPromptPreview = useDirectorStore((s) => s.setCompiledPromptPreview);
  const compiledPromptPreview = useDirectorStore((s) => s.compiledPromptPreview);
  const totalDuration = useDirectorTotalDuration();

  const spec = getPreviewSpec(baseSpec);
  const [busy, setBusy] = useState<'glb' | 'video' | 'cinematic' | null>(null);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [cinematicMessage, setCinematicMessage] = useState<string | null>(null);

  const slug = useRef(0);

  const handleGlb = async () => {
    if (!spec) return;
    setBusy('glb');
    setError(null);
    try {
      const { exportSpecToGlb } = await import('../../lib/scene-export');
      const blob = await exportSpecToGlb(spec);
      slug.current += 1;
      downloadBlob(blob, `animagen-${spec.seed}-${slug.current}.glb`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'GLB export failed');
    } finally {
      setBusy(null);
    }
  };

  const handleVideo = async () => {
    if (!spec) return;
    setBusy('video');
    setError(null);
    setProgress(0);
    try {
      const { exportSpecToVideo } = await import('../../lib/scene-export');
      const blob = await exportSpecToVideo(spec, setProgress);
      slug.current += 1;
      downloadBlob(blob, `animagen-${spec.seed}-${slug.current}.webm`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Video export failed');
    } finally {
      setBusy(null);
      setProgress(0);
    }
  };

  const handleCinematic = async () => {
    if (!spec || !project || !baseSpec) return;
    setBusy('cinematic');
    setError(null);
    setCinematicMessage(null);

    try {
      const canvas = findStudioCanvas(viewportRef?.current ?? null);
      const imageBase64 = captureCanvasDataUrl(canvas);
      const compiled = compileLtxPrompt(project, baseSpec, project.activeShotIndex);
      setCompiledPromptPreview(compiled.prompt);

      const job = await startCinematicRender({
        project,
        spec: baseSpec,
        imageBase64,
        shotIndex: project.activeShotIndex,
      });

      setCinematicMessage(job.message ?? `Job ${job.status} (${job.mode})`);

      if (job.status === 'completed' && job.downloadUrl) {
        setCinematicMessage('Cinematic MP4 ready on GPU worker.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Cinematic export failed');
    } finally {
      setBusy(null);
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
        <button
          type="button"
          onClick={() => void handleCinematic()}
          disabled={!spec || !project || busy !== null}
          className="rounded-lg border border-indigo-500/50 bg-indigo-950/40 px-4 py-2 text-sm hover:bg-indigo-900/40 disabled:opacity-40"
        >
          {busy === 'cinematic' ? 'Submitting…' : 'Cinematic (LTX-2)'}
        </button>
      </div>
      <p className="mt-2 text-xs text-zinc-500">
        WebM = fast browser preview export. Cinematic sends keyframe + compiled prompt to LTX-2 worker
        {project ? ` · ${project.shots.length} shots · ${totalDuration}s timeline` : ''}.
      </p>
      {compiledPromptPreview ? (
        <details className="mt-2 text-xs">
          <summary className="cursor-pointer text-indigo-300">Compiled LTX prompt</summary>
          <p className="mt-1 rounded bg-zinc-950 p-2 text-zinc-400">{compiledPromptPreview}</p>
        </details>
      ) : null}
      {cinematicMessage ? <p className="mt-2 text-xs text-amber-300">{cinematicMessage}</p> : null}
      {error ? <p className="mt-2 text-xs text-red-400">{error}</p> : null}
    </div>
  );
}
