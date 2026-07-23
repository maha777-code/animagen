'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { useAnimagenStore } from '../../store/useAnimagenStore';
import { useDirectorStore } from '../../store/useDirectorStore';
import { ExportPanel } from './ExportPanel';
import { PlaybackControls } from './PlaybackControls';
import { PromptBar } from './PromptBar';
import { ShotEditor } from './ShotEditor';
import { SpecPanel } from './SpecPanel';
import { TemplateLibrary } from './TemplateLibrary';

const SceneCanvas = dynamic(() => import('./SceneCanvas').then((m) => m.SceneCanvas), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center rounded-lg bg-zinc-900 text-zinc-500">
      Loading 3D preview…
    </div>
  ),
});

export function StudioApp() {
  const baseSpec = useAnimagenStore((s) => s.spec);
  const hydrated = useAnimagenStore((s) => s.hydrated);
  const isPlaying = useAnimagenStore((s) => s.isPlaying);
  const orbitMode = useAnimagenStore((s) => s.orbitMode);
  const playbackKey = useAnimagenStore((s) => s.playbackKey);
  const hydrate = useAnimagenStore((s) => s.hydrate);

  const getPreviewSpec = useDirectorStore((s) => s.getPreviewSpec);
  const initFromSpec = useDirectorStore((s) => s.initFromSpec);
  const project = useDirectorStore((s) => s.project);

  const viewportRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  const previewSpec = getPreviewSpec(baseSpec);

  useEffect(() => {
    setMounted(true);
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (baseSpec && !project) {
      initFromSpec(baseSpec, 'Directed animation');
    }
  }, [baseSpec, project, initFromSpec]);

  const showCanvas = mounted && hydrated && previewSpec;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <header className="border-b border-zinc-800 px-6 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">Animagen Pro</h1>
              <span className="rounded bg-indigo-900/80 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-indigo-200">
                Directed Studio
              </span>
            </div>
            <p className="text-sm text-zinc-400">Prompt → 3D preview → tweak shots → cinematic export</p>
          </div>
          <Link href="/demo" className="text-sm text-indigo-400 hover:text-indigo-300">
            Engine demo →
          </Link>
        </div>
      </header>

      <main className="mx-auto grid max-w-7xl gap-4 p-6 xl:grid-cols-[1fr_360px]">
        <div className="flex flex-col gap-4">
          <PromptBar />
          <div ref={viewportRef} className="h-[min(60vh,560px)] min-h-[320px]">
            {showCanvas ? (
              <SceneCanvas
                key={`${previewSpec.seed}-${playbackKey}-${project?.activeShotIndex ?? 0}`}
                spec={previewSpec}
                isPlaying={isPlaying}
                orbitMode={orbitMode}
                playbackKey={playbackKey}
              />
            ) : (
              <div className="flex h-full items-center justify-center rounded-lg border border-dashed border-zinc-700 text-zinc-500">
                Loading studio…
              </div>
            )}
          </div>
          <TemplateLibrary />
        </div>

        <aside className="flex flex-col gap-4">
          <ShotEditor />
          <SpecPanel />
          <PlaybackControls />
          <ExportPanel viewportRef={viewportRef} />
        </aside>
      </main>
    </div>
  );
}
