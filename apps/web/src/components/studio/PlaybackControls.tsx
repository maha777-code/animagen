'use client';

import { useAnimagenStore } from '../../store/useAnimagenStore';

export function PlaybackControls() {
  const spec = useAnimagenStore((s) => s.spec);
  const isPlaying = useAnimagenStore((s) => s.isPlaying);
  const orbitMode = useAnimagenStore((s) => s.orbitMode);
  const togglePlaying = useAnimagenStore((s) => s.togglePlaying);
  const setOrbitMode = useAnimagenStore((s) => s.setOrbitMode);
  const restartPlayback = useAnimagenStore((s) => s.restartPlayback);

  const duration = spec?.camera.duration ?? 10;

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/80 p-4">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-400">Playback</h2>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={togglePlaying}
          disabled={!spec}
          className="rounded-lg bg-zinc-800 px-4 py-2 text-sm hover:bg-zinc-700 disabled:opacity-40"
        >
          {isPlaying ? 'Pause' : 'Play'}
        </button>
        <button
          type="button"
          onClick={restartPlayback}
          disabled={!spec}
          className="rounded-lg border border-zinc-600 px-4 py-2 text-sm hover:bg-zinc-800 disabled:opacity-40"
        >
          Restart
        </button>
        <button
          type="button"
          onClick={() => setOrbitMode(!orbitMode)}
          disabled={!spec}
          className={`rounded-lg px-4 py-2 text-sm disabled:opacity-40 ${
            orbitMode ? 'bg-indigo-700' : 'border border-zinc-600 hover:bg-zinc-800'
          }`}
        >
          {orbitMode ? 'Orbit: on' : 'Orbit: off'}
        </button>
      </div>
      <p className="mt-3 text-xs text-zinc-500">
        Clip duration: {duration}s · Camera: {spec?.camera.movement ?? '—'}
      </p>
    </div>
  );
}
