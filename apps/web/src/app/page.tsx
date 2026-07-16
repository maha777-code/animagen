import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-zinc-950 p-8 text-zinc-100">
      <h1 className="text-4xl font-bold">Animagen</h1>
      <p className="max-w-lg text-center text-zinc-400">
        Production-grade 3D animation from text prompts.
      </p>
      <Link
        href="/demo"
        className="rounded-lg bg-indigo-600 px-6 py-3 font-medium hover:bg-indigo-500"
      >
        Open Engine Demo (Phase 3)
      </Link>
    </main>
  );
}
