import type { LtxRenderRequest } from '@animagen/director';

export interface LtxJobResponse {
  id: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  created_at: string;
  updated_at: string;
  prompt: string;
  negative_prompt: string;
  seed: number;
  shot_label?: string | null;
  style_preset?: string | null;
  mode: string;
  message?: string | null;
  download_url?: string | null;
  keyframe_saved: boolean;
}

export async function submitLtxRender(baseUrl: string, body: LtxRenderRequest): Promise<LtxJobResponse> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 300_000);

  try {
    const res = await fetch(`${baseUrl.replace(/\/$/, '')}/v1/render`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: body.prompt,
        negative_prompt: body.negativePrompt,
        seed: body.seed,
        width: body.width,
        height: body.height,
        num_frames: body.numFrames,
        frame_rate: body.frameRate,
        image_base64: body.imageBase64,
        shot_label: body.shotLabel,
        style_preset: body.stylePreset,
      }),
      signal: controller.signal,
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`LTX worker ${res.status}: ${text}`);
    }

    return (await res.json()) as LtxJobResponse;
  } finally {
    clearTimeout(timeout);
  }
}

export async function fetchLtxJob(baseUrl: string, jobId: string): Promise<LtxJobResponse> {
  const res = await fetch(`${baseUrl.replace(/\/$/, '')}/v1/jobs/${jobId}`);
  if (!res.ok) {
    throw new Error(`LTX job ${res.status}`);
  }
  return (await res.json()) as LtxJobResponse;
}

export async function checkLtxHealth(baseUrl: string): Promise<{ ok: boolean; ltx_enabled: boolean }> {
  try {
    const res = await fetch(`${baseUrl.replace(/\/$/, '')}/health`);
    if (!res.ok) return { ok: false, ltx_enabled: false };
    const data = (await res.json()) as { ltx_enabled?: boolean };
    return { ok: true, ltx_enabled: data.ltx_enabled === true };
  } catch {
    return { ok: false, ltx_enabled: false };
  }
}
