import type { SceneSpec } from '@animagen/scene-schema';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

export interface GenerateApiResponse {
  tier: 'cache' | 'parser' | 'llm' | 'enhanced';
  spec: SceneSpec;
  confidence: number;
  matchedEntities: string[];
  needsLlmFallback: boolean;
  cached: boolean;
}

export interface GenerateApiOptions {
  seed?: number;
  forceLlm?: boolean;
}

export async function fetchGenerate(
  prompt: string,
  options: GenerateApiOptions = {},
): Promise<GenerateApiResponse> {
  const res = await fetch(`${API_BASE}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      prompt,
      seed: options.seed,
      forceLlm: options.forceLlm ?? false,
    }),
  });

  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(err.error ?? `API error ${res.status}`);
  }

  return res.json() as Promise<GenerateApiResponse>;
}

export async function checkApiHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/health`, { method: 'GET' });
    return res.ok;
  } catch {
    return false;
  }
}
