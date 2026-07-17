'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useAnimagenStore } from '../../store/useAnimagenStore';
import { ExportPanel } from './ExportPanel';
import { PlaybackControls } from './PlaybackControls';
import { PromptBar } from './PromptBar';
import { SpecPanel } from './SpecPanel';

const SceneCanvas = dynamic(() => import('./SceneCanvas').then((m) => m.SceneCanvas), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center rounded-lg bg-zinc-900 text-zinc-500">
      Loading 3D preview…
    </div>
  ),
});

export function StudioApp() {
  const spec = useAnimagenStore((s) => s.spec);
  const hydrated = useAnimagenStore((s) => s.hydrated);
  const isPlaying = useAnimagenStore((s) => s.isPlaying);
  const orbitMode = useAnimagenStore((s) => s.orbitMode);
  const playbackKey = useAnimagenStore((s) => s.playbackKey);
  const hydrate = useAnimagenStore((s) => s.hydrate);

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    hydrate();
  }, [hydrate]);

  const showCanvas = mounted && hydrated && spec;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <header className="border-b border-zinc-800 px-6 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Animagen</h1>
            <p className="text-sm text-zinc-400">Phase 4 — prompt to 3D animation</p>
          </div>
          <Link href="/demo" className="text-sm text-indigo-400 hover:text-indigo-300">
            Phase 3 engine demo →
          </Link>
        </div>
      </header>

      <main className="mx-auto grid max-w-7xl gap-4 p-6 lg:grid-cols-[1fr_320px]">
        <div className="flex flex-col gap-4">
          <PromptBar />
          <div className="h-[min(60vh,560px)] min-h-[320px]">
            {showCanvas ? (
              <SceneCanvas
                key={`${spec.seed}-${playbackKey}`}
                spec={spec}
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
        </div>

        <aside className="flex flex-col gap-4">
          <SpecPanel />
          <PlaybackControls />
          <ExportPanel />
        </aside>
      </main>
    </div>
  );
}
