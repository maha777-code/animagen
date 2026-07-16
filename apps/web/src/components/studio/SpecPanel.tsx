'use client';

import { useAnimagenStore } from '../../store/useAnimagenStore';

export function SpecPanel() {
  const spec = useAnimagenStore((s) => s.spec);
  const confidence = useAnimagenStore((s) => s.confidence);
  const matchedEntities = useAnimagenStore((s) => s.matchedEntities);
  const needsLlmFallback = useAnimagenStore((s) => s.needsLlmFallback);
  const seed = useAnimagenStore((s) => s.seed);

  if (!spec) {
    return (
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/80 p-4 text-sm text-zinc-500">
        Enter a prompt and click Generate to parse and preview your scene.
      </div>
    );
  }

  const confidencePct = Math.round(confidence * 100);

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/80 p-4">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-400">Scene spec</h2>

      <div className="mb-3 flex flex-wrap gap-2 text-xs">
        <span className="rounded bg-zinc-800 px-2 py-1">Seed: {seed ?? spec.seed}</span>
        <span className="rounded bg-zinc-800 px-2 py-1">Confidence: {confidencePct}%</span>
        <span className="rounded bg-zinc-800 px-2 py-1 capitalize">Env: {spec.environment}</span>
      </div>

      {needsLlmFallback ? (
        <p className="mb-3 rounded-lg border border-amber-700/50 bg-amber-950/40 px-3 py-2 text-xs text-amber-200">
          Low parser confidence — Tier 2 LLM fallback would be used in Phase 5.
        </p>
      ) : null}

      {matchedEntities.length > 0 ? (
        <div className="mb-3">
          <p className="mb-1 text-xs text-zinc-500">Matched entities</p>
          <div className="flex flex-wrap gap-1">
            {matchedEntities.map((entity) => (
              <span key={entity} className="rounded bg-indigo-900/60 px-2 py-0.5 text-xs text-indigo-200">
                {entity}
              </span>
            ))}
          </div>
        </div>
      ) : null}

      <details className="text-xs">
        <summary className="cursor-pointer text-zinc-400 hover:text-zinc-200">View SceneSpec JSON</summary>
        <pre className="mt-2 max-h-48 overflow-auto rounded-lg bg-zinc-950 p-2 text-zinc-400">
          {JSON.stringify(spec, null, 2)}
        </pre>
      </details>
    </div>
  );
}
