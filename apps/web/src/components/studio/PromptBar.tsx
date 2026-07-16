'use client';

import { useAnimagenStore } from '../../store/useAnimagenStore';

export function PromptBar() {
  const prompt = useAnimagenStore((s) => s.prompt);
  const parseError = useAnimagenStore((s) => s.parseError);
  const setPrompt = useAnimagenStore((s) => s.setPrompt);
  const generate = useAnimagenStore((s) => s.generate);
  const rerollSeed = useAnimagenStore((s) => s.rerollSeed);

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/80 p-4">
      <label htmlFor="prompt" className="mb-2 block text-sm font-medium text-zinc-300">
        Describe your animation
      </label>
      <textarea
        id="prompt"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        rows={3}
        placeholder="e.g. a golden dragon flying over the ocean at sunset with rain"
        className="w-full resize-y rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-indigo-500 focus:outline-none"
      />
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={generate}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium hover:bg-indigo-500"
        >
          Generate
        </button>
        <button
          type="button"
          onClick={rerollSeed}
          className="rounded-lg border border-zinc-600 px-4 py-2 text-sm hover:bg-zinc-800"
        >
          Reroll seed
        </button>
      </div>
      {parseError ? <p className="mt-2 text-sm text-red-400">{parseError}</p> : null}
    </div>
  );
}
