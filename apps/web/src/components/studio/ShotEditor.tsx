'use client';

import type { CameraMovement, EffectType, EnvironmentType, MotionType, PathType } from '@animagen/scene-schema';
import { useDirectorStore } from '../../store/useDirectorStore';

const CAMERAS: CameraMovement[] = ['orbit', 'follow', 'flythrough', 'static'];
const MOTIONS: MotionType[] = ['fly', 'swim', 'walk', 'run', 'orbit', 'float', 'spin', 'pulse', 'bounce', 'idle'];
const PATHS: PathType[] = ['circle', 'figure8', 'line', 'sine', 'spiral', 'random'];
const EFFECTS: EffectType[] = ['bubbles', 'rain', 'storm', 'sparkles', 'snow', 'fog', 'fire', 'leaves', 'dust'];
const ENVS: EnvironmentType[] = [
  'underwater',
  'ocean',
  'forest',
  'space',
  'abstract',
  'desert',
  'meadow',
  'volcano',
  'arctic',
  'city',
];

export function ShotEditor() {
  const project = useDirectorStore((s) => s.project);
  const selectShot = useDirectorStore((s) => s.selectShot);
  const patchActiveShot = useDirectorStore((s) => s.patchActiveShot);
  const addNewShot = useDirectorStore((s) => s.addNewShot);
  const duplicateActiveShot = useDirectorStore((s) => s.duplicateActiveShot);
  const deleteActiveShot = useDirectorStore((s) => s.deleteActiveShot);

  if (!project) {
    return (
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/80 p-4 text-sm text-zinc-500">
        Generate a scene to open the shot editor.
      </div>
    );
  }

  const active = project.shots[project.activeShotIndex];

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/80 p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-400">Shot editor</h2>
        <span className="text-xs text-zinc-500">
          {project.shots.length} shot{project.shots.length === 1 ? '' : 's'}
        </span>
      </div>

      <div className="mb-3 flex flex-wrap gap-1">
        {project.shots.map((shot, index) => (
          <button
            key={shot.id}
            type="button"
            onClick={() => selectShot(index)}
            className={`rounded-lg px-2 py-1 text-xs ${
              index === project.activeShotIndex
                ? 'bg-indigo-600 text-white'
                : 'border border-zinc-700 text-zinc-400 hover:bg-zinc-800'
            }`}
          >
            {index + 1}. {shot.label}
          </button>
        ))}
      </div>

      {active ? (
        <div className="space-y-3 text-sm">
          <label className="block">
            <span className="mb-1 block text-xs text-zinc-500">Label</span>
            <input
              value={active.label}
              onChange={(e) => patchActiveShot({ label: e.target.value })}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-2 py-1.5 text-sm"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-xs text-zinc-500">Duration (sec)</span>
            <input
              type="number"
              min={1}
              max={120}
              value={active.durationSec}
              onChange={(e) => patchActiveShot({ durationSec: Number(e.target.value) })}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-2 py-1.5 text-sm"
            />
          </label>

          <div className="grid grid-cols-2 gap-2">
            <label className="block">
              <span className="mb-1 block text-xs text-zinc-500">Camera</span>
              <select
                value={active.camera}
                onChange={(e) => patchActiveShot({ camera: e.target.value as CameraMovement })}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-2 py-1.5 text-sm"
              >
                {CAMERAS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-1 block text-xs text-zinc-500">Motion</span>
              <select
                value={active.motion}
                onChange={(e) => patchActiveShot({ motion: e.target.value as MotionType })}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-2 py-1.5 text-sm"
              >
                {MOTIONS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <label className="block">
              <span className="mb-1 block text-xs text-zinc-500">Path</span>
              <select
                value={active.path ?? ''}
                onChange={(e) => patchActiveShot({ path: (e.target.value || undefined) as PathType | undefined })}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-2 py-1.5 text-sm"
              >
                <option value="">default</option>
                {PATHS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-1 block text-xs text-zinc-500">Environment</span>
              <select
                value={active.environment ?? ''}
                onChange={(e) =>
                  patchActiveShot({ environment: (e.target.value || undefined) as EnvironmentType | undefined })
                }
                className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-2 py-1.5 text-sm"
              >
                <option value="">inherit</option>
                {ENVS.map((env) => (
                  <option key={env} value={env}>
                    {env}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div>
            <span className="mb-1 block text-xs text-zinc-500">Effects</span>
            <div className="flex flex-wrap gap-1">
              {EFFECTS.map((fx) => {
                const on = active.effects.includes(fx);
                return (
                  <button
                    key={fx}
                    type="button"
                    onClick={() =>
                      patchActiveShot({
                        effects: on ? active.effects.filter((e) => e !== fx) : [...active.effects, fx],
                      })
                    }
                    className={`rounded px-2 py-0.5 text-xs ${
                      on ? 'bg-indigo-700 text-white' : 'border border-zinc-700 text-zinc-400'
                    }`}
                  >
                    {fx}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      ) : null}

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={addNewShot}
          className="rounded-lg border border-zinc-600 px-3 py-1.5 text-xs hover:bg-zinc-800"
        >
          + Add shot
        </button>
        <button
          type="button"
          onClick={duplicateActiveShot}
          className="rounded-lg border border-zinc-600 px-3 py-1.5 text-xs hover:bg-zinc-800"
        >
          Duplicate
        </button>
        <button
          type="button"
          onClick={deleteActiveShot}
          disabled={project.shots.length <= 1}
          className="rounded-lg border border-zinc-600 px-3 py-1.5 text-xs hover:bg-zinc-800 disabled:opacity-40"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
