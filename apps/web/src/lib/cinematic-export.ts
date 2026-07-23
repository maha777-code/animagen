const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

export interface CinematicJob {
  id: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  mode: string;
  message?: string | null;
  downloadUrl?: string | null;
  keyframeSaved: boolean;
  compiledPrompt: string;
  createdAt: string;
}

export async function fetchCinematicHealth(): Promise<{ ok: boolean; ltx_enabled: boolean }> {
  try {
    const res = await fetch(`${API_BASE}/api/cinematic/health`);
    if (!res.ok) return { ok: false, ltx_enabled: false };
    return (await res.json()) as { ok: boolean; ltx_enabled: boolean };
  } catch {
    return { ok: false, ltx_enabled: false };
  }
}

export async function startCinematicRender(body: {
  project: unknown;
  spec: unknown;
  imageBase64?: string;
  shotIndex?: number;
}): Promise<CinematicJob> {
  const res = await fetch(`${API_BASE}/api/cinematic/render`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(err.error ?? `Cinematic render failed (${res.status})`);
  }
  return res.json() as Promise<CinematicJob>;
}

export async function pollCinematicJob(jobId: string): Promise<CinematicJob> {
  const res = await fetch(`${API_BASE}/api/cinematic/jobs/${jobId}`);
  if (!res.ok) {
    throw new Error(`Job poll failed (${res.status})`);
  }
  return res.json() as Promise<CinematicJob>;
}

/** Capture PNG data URL from a canvas element (Three.js R3F canvas). */
export function captureCanvasDataUrl(canvas: HTMLCanvasElement | null): string | undefined {
  if (!canvas) return undefined;
  try {
    return canvas.toDataURL('image/png');
  } catch {
    return undefined;
  }
}

/** Find the WebGL canvas inside the studio viewport. */
export function findStudioCanvas(root: HTMLElement | null): HTMLCanvasElement | null {
  if (!root) return null;
  return root.querySelector('canvas');
}
