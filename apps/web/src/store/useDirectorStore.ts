'use client';

import {
  addShot,
  duplicateShot,
  getActiveShot,
  projectFromSpec,
  projectFromTemplate,
  removeShot,
  setActiveShot,
  specForActiveShot,
  totalDurationSec,
  updateShot,
  type DirectorProject,
  type DirectorTemplate,
} from '@animagen/director';
import type { SceneSpec } from '@animagen/scene-schema';
import { create } from 'zustand';

interface DirectorState {
  project: DirectorProject | null;
  compiledPromptPreview: string | null;
  initFromSpec: (spec: SceneSpec, name?: string) => void;
  applyTemplate: (template: DirectorTemplate, prompt: string, seed: number) => void;
  selectShot: (index: number) => void;
  patchActiveShot: (patch: Parameters<typeof updateShot>[2]) => void;
  addNewShot: () => void;
  duplicateActiveShot: () => void;
  deleteActiveShot: () => void;
  getPreviewSpec: (baseSpec: SceneSpec | null) => SceneSpec | null;
  setProjectName: (name: string) => void;
  setCompiledPromptPreview: (prompt: string | null) => void;
}

export const useDirectorStore = create<DirectorState>((set, get) => ({
  project: null,
  compiledPromptPreview: null,

  initFromSpec: (spec, name) => {
    set({ project: projectFromSpec(spec, name ?? 'Directed animation'), compiledPromptPreview: null });
  },

  applyTemplate: (template, prompt, seed) => {
    set({ project: projectFromTemplate(template, prompt, seed), compiledPromptPreview: null });
  },

  selectShot: (index) => {
    const { project } = get();
    if (!project) return;
    set({ project: setActiveShot(project, index) });
  },

  patchActiveShot: (patch) => {
    const { project } = get();
    if (!project) return;
    const shot = getActiveShot(project);
    set({ project: updateShot(project, shot.id, patch) });
  },

  addNewShot: () => {
    const { project } = get();
    if (!project) return;
    set({ project: addShot(project) });
  },

  duplicateActiveShot: () => {
    const { project } = get();
    if (!project) return;
    const shot = getActiveShot(project);
    set({ project: duplicateShot(project, shot.id) });
  },

  deleteActiveShot: () => {
    const { project } = get();
    if (!project) return;
    const shot = getActiveShot(project);
    set({ project: removeShot(project, shot.id) });
  },

  getPreviewSpec: (baseSpec) => {
    const { project } = get();
    if (!baseSpec || !project) return baseSpec;
    return specForActiveShot(baseSpec, project);
  },

  setProjectName: (name) => {
    const { project } = get();
    if (!project) return;
    set({ project: { ...project, name } });
  },

  setCompiledPromptPreview: (compiledPromptPreview) => set({ compiledPromptPreview }),
}));

export function useDirectorTotalDuration(): number {
  const project = useDirectorStore((s) => s.project);
  return project ? totalDurationSec(project) : 0;
}
