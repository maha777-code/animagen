import { createDefaultSceneSpec } from '@animagen/scene-schema';

export default function HomePage() {
  const placeholder = createDefaultSceneSpec({
    prompt: 'Animagen scaffold — Phase 1 complete',
    seed: 0,
  });

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-8">
      <h1 className="text-4xl font-bold tracking-tight text-animagen-100">Animagen</h1>
      <p className="max-w-lg text-center text-zinc-400">
        Production-grade 3D animation from text prompts. Monorepo scaffold ready.
      </p>
      <pre className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4 text-sm text-zinc-300">
        {JSON.stringify(placeholder, null, 2)}
      </pre>
    </main>
  );
}
