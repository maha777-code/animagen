'use client';

import { ALL_SUBJECT_TYPES } from '@animagen/engine';
import type { EnvironmentType } from '@animagen/scene-schema';
import Link from 'next/link';
import { useState } from 'react';
import { DemoCanvas } from '../../components/demo/DemoCanvas';

const ENVIRONMENTS: EnvironmentType[] = [
  'ocean',
  'forest',
  'desert',
  'space',
  'city',
  'mountains',
  'meadow',
  'underwater',
  'volcano',
  'arctic',
  'cave',
  'sky',
  'beach',
  'jungle',
  'abstract',
];

export default function DemoPage() {
  const [tab, setTab] = useState<'subjects' | 'environments'>('subjects');
  const [selectedSubject, setSelectedSubject] = useState(ALL_SUBJECT_TYPES[0]);
  const [selectedEnv, setSelectedEnv] = useState<EnvironmentType>('ocean');

  return (
    <main className="min-h-screen bg-zinc-950 p-6 text-zinc-100">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="mb-2 text-3xl font-bold">Animagen Engine Demo</h1>
            <p className="text-zinc-400">Phase 3 — browse procedural subjects and environments</p>
          </div>
          <Link
            href="/"
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium hover:bg-indigo-500"
          >
            ← Open Phase 4 Studio
          </Link>
        </div>

        <div className="mb-4 flex gap-2">
          <button
            type="button"
            onClick={() => setTab('subjects')}
            className={`rounded px-4 py-2 ${tab === 'subjects' ? 'bg-indigo-600' : 'bg-zinc-800'}`}
          >
            Subjects ({ALL_SUBJECT_TYPES.length})
          </button>
          <button
            type="button"
            onClick={() => setTab('environments')}
            className={`rounded px-4 py-2 ${tab === 'environments' ? 'bg-indigo-600' : 'bg-zinc-800'}`}
          >
            Environments ({ENVIRONMENTS.length})
          </button>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="max-h-[70vh] overflow-y-auto rounded-lg border border-zinc-800 bg-zinc-900 p-3 lg:col-span-1">
            {tab === 'subjects'
              ? ALL_SUBJECT_TYPES.map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setSelectedSubject(type)}
                    className={`mb-1 block w-full rounded px-3 py-2 text-left text-sm capitalize ${
                      selectedSubject === type ? 'bg-indigo-700' : 'hover:bg-zinc-800'
                    }`}
                  >
                    {type}
                  </button>
                ))
              : ENVIRONMENTS.map((env) => (
                  <button
                    key={env}
                    type="button"
                    onClick={() => setSelectedEnv(env)}
                    className={`mb-1 block w-full rounded px-3 py-2 text-left text-sm capitalize ${
                      selectedEnv === env ? 'bg-indigo-700' : 'hover:bg-zinc-800'
                    }`}
                  >
                    {env}
                  </button>
                ))}
          </div>

          <div className="h-[480px] lg:col-span-2">
            {tab === 'subjects' ? (
              <DemoCanvas key={selectedSubject} subject={selectedSubject} />
            ) : (
              <DemoCanvas key={selectedEnv} environment={selectedEnv} />
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
