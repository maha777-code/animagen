'use client';

import { useAnimagenStore } from '../../store/useAnimagenStore';

export function PromptBar() {
  const prompt = useAnimagenStore((s) => s.prompt);
  const parseError = useAnimagenStore((s) => s.parseError);
  const isGenerating = useAnimagenStore((s) => s.isGenerating);
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
        disabled={isGenerating}
        placeholder="e.g. a golden dragon flying over the ocean at sunset with rain"
        className="w-full resize-y rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-indigo-500 focus:outline-none disabled:opacity-60"
      />
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => void generate()}
          disabled={isGenerating}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium hover:bg-indigo-500 disabled:opacity-50"
        >
          {isGenerating ? 'Generating…' : 'Generate'}
        </button>
        <button
          type="button"
          onClick={() => void generate({ forceLlm: true })}
          disabled={isGenerating}
          className="rounded-lg border border-indigo-500/60 bg-indigo-950/40 px-4 py-2 text-sm hover:bg-indigo-900/40 disabled:opacity-50"
        >
          AI Enhance
        </button>
        <button
          type="button"
          onClick={() => void rerollSeed()}
          disabled={isGenerating}
          className="rounded-lg border border-zinc-600 px-4 py-2 text-sm hover:bg-zinc-800 disabled:opacity-50"
        >
          Reroll seed
        </button>
      </div>
      {parseError ? (
        <p className={`mt-2 text-sm ${parseError.includes('offline') ? 'text-amber-400' : 'text-red-400'}`}>
          {parseError}
        </p>
      ) : null}
    </div>
  );
}
