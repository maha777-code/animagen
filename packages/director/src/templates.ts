import type { DirectorTemplate } from './types.js';

export const DIRECTOR_TEMPLATES: DirectorTemplate[] = [
  {
    id: 'underwater-documentary',
    name: 'Underwater Documentary',
    description: 'Follow-cam swim sequence with bubbles — ideal for science explainers.',
    category: 'education',
    promptHint: 'a dragon swimming underwater with bubbles and soft light rays',
    stylePreset: 'cinematic-underwater',
    environment: 'underwater',
    shots: [
      {
        label: 'Establishing glide',
        durationSec: 6,
        camera: 'follow',
        motion: 'swim',
        path: 'circle',
        effects: ['bubbles'],
      },
      {
        label: 'Close follow',
        durationSec: 5,
        camera: 'follow',
        motion: 'swim',
        path: 'sine',
        effects: ['bubbles'],
      },
      {
        label: 'Wide orbit reveal',
        durationSec: 4,
        camera: 'orbit',
        motion: 'swim',
        path: 'circle',
        effects: ['bubbles'],
      },
    ],
  },
  {
    id: 'epic-aerial',
    name: 'Epic Aerial Chase',
    description: 'High-energy flythrough for fantasy or game previs.',
    category: 'previs',
    promptHint: 'a red dragon flying over the ocean at sunset with storm clouds',
    stylePreset: 'epic-fantasy',
    environment: 'ocean',
    shots: [
      {
        label: 'Wide establishing fly',
        durationSec: 5,
        camera: 'flythrough',
        motion: 'fly',
        path: 'figure8',
        effects: ['storm'],
      },
      {
        label: 'Hero follow',
        durationSec: 6,
        camera: 'follow',
        motion: 'fly',
        path: 'circle',
        effects: ['storm', 'rain'],
      },
    ],
  },
  {
    id: 'classroom-orbit',
    name: 'Classroom Orbit Study',
    description: 'Calm orbit around a subject — great for teaching moments.',
    category: 'education',
    promptHint: 'a golden planet floating in space with sparkles',
    stylePreset: 'clean-educational',
    environment: 'space',
    shots: [
      {
        label: 'Slow teaching orbit',
        durationSec: 10,
        camera: 'orbit',
        motion: 'orbit',
        path: 'circle',
        effects: ['sparkles'],
      },
    ],
  },
  {
    id: 'motion-design-pulse',
    name: 'Motion Design Pulse',
    description: 'Abstract pulse and spin for logo-style motion studies.',
    category: 'motion',
    promptHint: 'a glowing crystal spinning in abstract space',
    stylePreset: 'motion-graphics',
    environment: 'abstract',
    shots: [
      {
        label: 'Pulse intro',
        durationSec: 4,
        camera: 'static',
        motion: 'pulse',
        effects: ['sparkles'],
      },
      {
        label: 'Spin outro',
        durationSec: 4,
        camera: 'orbit',
        motion: 'spin',
        path: 'circle',
        effects: ['sparkles'],
      },
    ],
  },
  {
    id: 'forest-walkthrough',
    name: 'Forest Walkthrough',
    description: 'Ground-level walk sequence for narrative previs.',
    category: 'previs',
    promptHint: 'a robot walking through a forest with falling leaves',
    stylePreset: 'naturalistic',
    environment: 'forest',
    shots: [
      {
        label: 'Path walk-in',
        durationSec: 7,
        camera: 'follow',
        motion: 'walk',
        path: 'line',
        effects: ['leaves'],
      },
      {
        label: 'Pause and look',
        durationSec: 5,
        camera: 'static',
        motion: 'idle',
        effects: ['leaves', 'fog'],
      },
    ],
  },
];

export function getTemplateById(id: string): DirectorTemplate | undefined {
  return DIRECTOR_TEMPLATES.find((t) => t.id === id);
}

export function listTemplatesByCategory(category?: DirectorTemplate['category']): DirectorTemplate[] {
  if (!category) return DIRECTOR_TEMPLATES;
  return DIRECTOR_TEMPLATES.filter((t) => t.category === category);
}
