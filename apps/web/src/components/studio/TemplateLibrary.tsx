'use client';

import { DIRECTOR_TEMPLATES, type TemplateCategory } from '@animagen/director';
import { seedFromPrompt } from '@animagen/scene-schema';
import { useAnimagenStore } from '../../store/useAnimagenStore';
import { useDirectorStore } from '../../store/useDirectorStore';

const CATEGORIES: { id: TemplateCategory | 'all'; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'education', label: 'Education' },
  { id: 'previs', label: 'Previs' },
  { id: 'motion', label: 'Motion' },
  { id: 'general', label: 'General' },
];

export function TemplateLibrary() {
  const prompt = useAnimagenStore((s) => s.prompt);
  const seed = useAnimagenStore((s) => s.seed);
  const setPrompt = useAnimagenStore((s) => s.setPrompt);
  const generate = useAnimagenStore((s) => s.generate);
  const applyTemplate = useDirectorStore((s) => s.applyTemplate);

  const apply = async (templateId: string) => {
    const template = DIRECTOR_TEMPLATES.find((t) => t.id === templateId);
    if (!template) return;
    const usePrompt = prompt.trim() || template.promptHint;
    if (!prompt.trim()) setPrompt(usePrompt);
    const useSeed = seed ?? seedFromPrompt(usePrompt);
    applyTemplate(template, usePrompt, useSeed);
    await generate();
  };

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/80 p-4">
      <h2 className="mb-1 text-sm font-semibold uppercase tracking-wide text-zinc-400">Template library</h2>
      <p className="mb-3 text-xs text-zinc-500">Preset shot timelines for education, previs, and motion design.</p>

      <div className="space-y-2">
        {DIRECTOR_TEMPLATES.map((template) => (
          <button
            key={template.id}
            type="button"
            onClick={() => void apply(template.id)}
            className="w-full rounded-lg border border-zinc-700 bg-zinc-950/50 px-3 py-2 text-left hover:border-indigo-600/60 hover:bg-indigo-950/20"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-medium text-zinc-200">{template.name}</span>
              <span className="rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] uppercase text-zinc-400">
                {template.category}
              </span>
            </div>
            <p className="mt-1 text-xs text-zinc-500">{template.description}</p>
            <p className="mt-1 text-[10px] text-zinc-600">
              {template.shots.length} shots · {template.shots.reduce((s, sh) => s + sh.durationSec, 0)}s total
            </p>
          </button>
        ))}
      </div>

      <p className="mt-3 text-[10px] text-zinc-600">
        Categories: {CATEGORIES.slice(1).map((c) => c.label).join(', ')}
      </p>
    </div>
  );
}
