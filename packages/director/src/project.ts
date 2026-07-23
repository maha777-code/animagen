import type { SceneSpec } from '@animagen/scene-schema';
import type { DirectorProject, DirectorTemplate, ShotSpec } from './types.js';
import { ShotSpecSchema } from './types.js';

let shotCounter = 0;

export function newShotId(): string {
  shotCounter += 1;
  return `shot-${Date.now()}-${shotCounter}`;
}

export function createShot(partial: Omit<ShotSpec, 'id'> & { id?: string }): ShotSpec {
  return ShotSpecSchema.parse({
    id: partial.id ?? newShotId(),
    ...partial,
  });
}

/** Build a director project from an existing SceneSpec (single shot default). */
export function projectFromSpec(spec: SceneSpec, name = 'Untitled project'): DirectorProject {
  const primaryAnim = spec.animations[0];
  const shot = createShot({
    label: 'Main shot',
    durationSec: Math.min(Math.max(spec.camera.duration, 3), 30),
    camera: spec.camera.movement,
    motion: primaryAnim?.motion ?? 'float',
    path: primaryAnim?.path,
    effects: [...spec.effects],
    environment: spec.environment,
  });

  return {
    version: 1,
    name,
    prompt: spec.prompt,
    seed: spec.seed,
    shots: [shot],
    activeShotIndex: 0,
  };
}

/** Apply a template to create a new director project. */
export function projectFromTemplate(template: DirectorTemplate, prompt: string, seed: number): DirectorProject {
  const shots = template.shots.map((s) => createShot(s));
  return {
    version: 1,
    name: template.name,
    prompt: prompt.trim() || template.promptHint,
    seed,
    stylePreset: template.stylePreset,
    templateId: template.id,
    shots,
    activeShotIndex: 0,
  };
}

export function getActiveShot(project: DirectorProject): ShotSpec {
  const shot = project.shots[project.activeShotIndex];
  if (!shot) throw new Error('No active shot');
  return shot;
}

export function totalDurationSec(project: DirectorProject): number {
  return project.shots.reduce((sum, s) => sum + s.durationSec, 0);
}

/** Merge active shot settings into a base SceneSpec for 3D preview. */
export function specForShot(base: SceneSpec, shot: ShotSpec): SceneSpec {
  const target = base.subjects[0]?.name ?? base.subjects[0]?.type ?? 'subject';

  const animations =
    base.animations.length > 0
      ? base.animations.map((anim, index) =>
          index === 0
            ? {
                ...anim,
                target: anim.target || target,
                motion: shot.motion,
                path: shot.path ?? anim.path,
                duration: shot.durationSec,
              }
            : anim,
        )
      : [{ target, motion: shot.motion, path: shot.path, speed: 1, duration: shot.durationSec }];

  return {
    ...base,
    environment: shot.environment ?? base.environment,
    camera: {
      ...base.camera,
      movement: shot.camera,
      duration: shot.durationSec,
      target: base.camera.target ?? target,
    },
    animations,
    effects: shot.effects.length > 0 ? shot.effects : base.effects,
  };
}

/** Preview spec for the currently active shot. */
export function specForActiveShot(base: SceneSpec, project: DirectorProject): SceneSpec {
  return specForShot(base, getActiveShot(project));
}

export function updateShot(project: DirectorProject, shotId: string, patch: Partial<Omit<ShotSpec, 'id'>>): DirectorProject {
  return {
    ...project,
    shots: project.shots.map((s) => (s.id === shotId ? ShotSpecSchema.parse({ ...s, ...patch }) : s)),
  };
}

export function setActiveShot(project: DirectorProject, index: number): DirectorProject {
  const clamped = Math.max(0, Math.min(index, project.shots.length - 1));
  return { ...project, activeShotIndex: clamped };
}

export function reorderShot(project: DirectorProject, fromIndex: number, toIndex: number): DirectorProject {
  const shots = [...project.shots];
  const [moved] = shots.splice(fromIndex, 1);
  if (!moved) return project;
  shots.splice(toIndex, 0, moved);
  const activeShotIndex =
    project.activeShotIndex === fromIndex
      ? toIndex
      : project.activeShotIndex > fromIndex && project.activeShotIndex <= toIndex
        ? project.activeShotIndex - 1
        : project.activeShotIndex < fromIndex && project.activeShotIndex >= toIndex
          ? project.activeShotIndex + 1
          : project.activeShotIndex;
  return { ...project, shots, activeShotIndex };
}

export function duplicateShot(project: DirectorProject, shotId: string): DirectorProject {
  const index = project.shots.findIndex((s) => s.id === shotId);
  if (index < 0) return project;
  const source = project.shots[index]!;
  const copy = createShot({
    ...source,
    label: `${source.label} (copy)`,
  });
  const shots = [...project.shots];
  shots.splice(index + 1, 0, copy);
  return { ...project, shots, activeShotIndex: index + 1 };
}

export function removeShot(project: DirectorProject, shotId: string): DirectorProject {
  if (project.shots.length <= 1) return project;
  const index = project.shots.findIndex((s) => s.id === shotId);
  if (index < 0) return project;
  const shots = project.shots.filter((s) => s.id !== shotId);
  const activeShotIndex = Math.min(project.activeShotIndex, shots.length - 1);
  return { ...project, shots, activeShotIndex };
}

export function addShot(project: DirectorProject, partial?: Partial<Omit<ShotSpec, 'id'>>): DirectorProject {
  const last = project.shots[project.shots.length - 1];
  const shot = createShot({
    label: partial?.label ?? `Shot ${project.shots.length + 1}`,
    durationSec: partial?.durationSec ?? last?.durationSec ?? 5,
    camera: partial?.camera ?? last?.camera ?? 'orbit',
    motion: partial?.motion ?? last?.motion ?? 'float',
    path: partial?.path ?? last?.path,
    effects: partial?.effects ?? last?.effects ?? [],
    environment: partial?.environment ?? last?.environment,
    notes: partial?.notes,
  });
  return {
    ...project,
    shots: [...project.shots, shot],
    activeShotIndex: project.shots.length,
  };
}
