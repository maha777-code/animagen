import { parseSceneSpec, type SceneSpec } from '@animagen/scene-schema';

export interface InferenceGenerateRequest {
  prompt: string;
  seed: number;
  hint?: SceneSpec;
}

export interface InferenceGenerateResponse {
  spec: SceneSpec;
  source: 'llm' | 'enhanced';
  model?: string;
}

export async function requestInferenceSpec(
  baseUrl: string,
  body: InferenceGenerateRequest,
): Promise<InferenceGenerateResponse> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 120_000);

  try {
    const res = await fetch(`${baseUrl.replace(/\/$/, '')}/v1/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Inference ${res.status}: ${text}`);
    }

    const data = (await res.json()) as { spec: unknown; source?: string; model?: string };
    return {
      spec: parseSceneSpec(data.spec),
      source: data.source === 'llm' ? 'llm' : 'enhanced',
      model: data.model,
    };
  } finally {
    clearTimeout(timeout);
  }
}
