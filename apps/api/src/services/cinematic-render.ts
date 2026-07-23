import {
  buildLtxRenderRequest,
  DirectorProjectSchema,
  type DirectorProject,
  type LtxRenderRequest,
} from '@animagen/director';
import { parseSceneSpec, type SceneSpec } from '@animagen/scene-schema';
import { fetchLtxJob, submitLtxRender, type LtxJobResponse } from '../clients/ltx-client.js';
import { config } from '../config.js';

export interface CinematicRenderInput {
  project: DirectorProject;
  spec: SceneSpec;
  imageBase64?: string;
  shotIndex?: number;
  width?: number;
  height?: number;
}

export interface CinematicJobRecord {
  id: string;
  status: LtxJobResponse['status'];
  mode: string;
  message?: string | null;
  downloadUrl?: string | null;
  keyframeSaved: boolean;
  compiledPrompt: string;
  createdAt: string;
}

const localJobs = new Map<string, CinematicJobRecord>();

export function validateCinematicBody(body: unknown): CinematicRenderInput {
  if (!body || typeof body !== 'object') throw new Error('Invalid JSON body');
  const b = body as Record<string, unknown>;
  if (!b.project || typeof b.project !== 'object') throw new Error('project is required');
  if (!b.spec || typeof b.spec !== 'object') throw new Error('spec is required');

  return {
    project: DirectorProjectSchema.parse(b.project),
    spec: parseSceneSpec(b.spec),
    imageBase64: typeof b.imageBase64 === 'string' ? b.imageBase64 : undefined,
    shotIndex: typeof b.shotIndex === 'number' ? b.shotIndex : undefined,
    width: typeof b.width === 'number' ? b.width : undefined,
    height: typeof b.height === 'number' ? b.height : undefined,
  };
}

export async function startCinematicRender(input: CinematicRenderInput): Promise<CinematicJobRecord> {
  const ltxBody: LtxRenderRequest = buildLtxRenderRequest(input.project, input.spec, {
    imageBase64: input.imageBase64,
    width: input.width,
    height: input.height,
    shotIndex: input.shotIndex,
  });

  const remote = await submitLtxRender(config.ltxWorkerUrl, ltxBody);

  const record: CinematicJobRecord = {
    id: remote.id,
    status: remote.status,
    mode: remote.mode,
    message: remote.message,
    downloadUrl: remote.download_url,
    keyframeSaved: remote.keyframe_saved,
    compiledPrompt: ltxBody.prompt,
    createdAt: remote.created_at,
  };
  localJobs.set(record.id, record);
  return record;
}

export async function getCinematicJob(jobId: string): Promise<CinematicJobRecord | null> {
  const cached = localJobs.get(jobId);
  try {
    const remote = await fetchLtxJob(config.ltxWorkerUrl, jobId);
    const record: CinematicJobRecord = {
      id: remote.id,
      status: remote.status,
      mode: remote.mode,
      message: remote.message,
      downloadUrl: remote.download_url,
      keyframeSaved: remote.keyframe_saved,
      compiledPrompt: cached?.compiledPrompt ?? remote.prompt,
      createdAt: remote.created_at,
    };
    localJobs.set(jobId, record);
    return record;
  } catch {
    return cached ?? null;
  }
}
