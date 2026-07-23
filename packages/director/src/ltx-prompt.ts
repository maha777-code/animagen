import type { SceneSpec } from '@animagen/scene-schema';
import type { DirectorProject, LtxCompiledPrompt, LtxRenderRequest, ShotSpec } from './types.js';
import { getActiveShot, totalDurationSec } from './project.js';

const STYLE_PROMPTS: Record<string, string> = {
  'cinematic-underwater':
    'cinematic underwater documentary, volumetric god rays, caustics, soft blue-green grading, high detail',
  'epic-fantasy': 'epic fantasy cinematic, dramatic lighting, rich colors, film grain, anamorphic lens flare',
  'clean-educational': 'clean educational visualization, bright readable composition, soft shadows, neutral grading',
  'motion-graphics': 'motion graphics style, crisp edges, studio lighting, bold color contrast, smooth motion',
  naturalistic: 'naturalistic lighting, realistic materials, subtle camera shake, documentary feel',
};

const DEFAULT_NEGATIVE =
  'shaky, glitchy, low quality, worst quality, deformed, distorted, disfigured, motion smear, motion artifacts, fused fingers, bad anatomy, weird hand, ugly, static frame, watermark, text overlay';

function envPhrase(environment: string): string {
  const map: Record<string, string> = {
    underwater: 'underwater scene with depth haze',
    ocean: 'over open ocean at sunset',
    space: 'in deep space with stars',
    forest: 'in a lush forest',
    abstract: 'in an abstract studio void',
    desert: 'in a desert landscape',
    city: 'in a city environment',
    arctic: 'in arctic snow',
    volcano: 'near an active volcano',
    meadow: 'in a sunlit meadow',
    mountains: 'among mountain peaks',
    cave: 'inside a cave',
    beach: 'on a tropical beach',
    jungle: 'in dense jungle',
    sky: 'high in the sky among clouds',
  };
  return map[environment] ?? environment;
}

function cameraPhrase(shot: ShotSpec): string {
  const map: Record<string, string> = {
    follow: 'smooth tracking shot following the subject',
    orbit: 'slow orbital camera around the subject',
    flythrough: 'dynamic flythrough camera movement',
    static: 'locked-off static camera',
  };
  return map[shot.camera] ?? shot.camera;
}

function motionPhrase(shot: ShotSpec): string {
  const map: Record<string, string> = {
    swim: 'fluid swimming motion',
    fly: 'graceful flying motion',
    walk: 'natural walking motion',
    run: 'energetic running motion',
    orbit: 'orbiting movement',
    float: 'gentle floating drift',
    spin: 'smooth spinning rotation',
    pulse: 'rhythmic pulsing scale',
    bounce: 'bouncy playful motion',
    idle: 'subtle idle movement',
  };
  return map[shot.motion] ?? shot.motion;
}

function effectsPhrase(effects: string[]): string {
  if (effects.length === 0) return '';
  return `with ${effects.join(', ')}`;
}

/** Compile SceneSpec + director project into an LTX-2 optimized prompt. */
export function compileLtxPrompt(
  project: DirectorProject,
  baseSpec: SceneSpec,
  shotIndex = project.activeShotIndex,
): LtxCompiledPrompt {
  const shot = project.shots[shotIndex] ?? getActiveShot(project);
  const environment = shot.environment ?? baseSpec.environment;
  const styleKey = project.stylePreset ?? 'cinematic-underwater';
  const styleLine = STYLE_PROMPTS[styleKey] ?? STYLE_PROMPTS['clean-educational']!;

  const subjectHint =
    baseSpec.subjects.length > 0
      ? baseSpec.subjects.map((s) => `${s.color ? `${s.color} ` : ''}${s.type}`).join(' and ')
      : project.prompt;

  const prompt = [
    project.prompt.trim(),
    subjectHint !== project.prompt ? `featuring ${subjectHint}` : '',
    envPhrase(environment),
    cameraPhrase(shot),
    motionPhrase(shot),
    effectsPhrase(shot.effects),
    styleLine,
    `duration ${shot.durationSec} seconds`,
  ]
    .filter(Boolean)
    .join(', ');

  return {
    prompt,
    negativePrompt: DEFAULT_NEGATIVE,
    metadata: {
      stylePreset: project.stylePreset,
      shotLabel: shot.label,
      environment,
      camera: shot.camera,
      motion: shot.motion,
      durationSec: shot.durationSec,
      totalDurationSec: totalDurationSec(project),
      shotCount: project.shots.length,
    },
  };
}

/** Build request payload for LTX-2 worker (single shot render). */
export function buildLtxRenderRequest(
  project: DirectorProject,
  baseSpec: SceneSpec,
  options: {
    imageBase64?: string;
    width?: number;
    height?: number;
    shotIndex?: number;
  } = {},
): LtxRenderRequest {
  const compiled = compileLtxPrompt(project, baseSpec, options.shotIndex ?? project.activeShotIndex);
  const shot = project.shots[options.shotIndex ?? project.activeShotIndex] ?? getActiveShot(project);
  const fps = 24;
  const numFrames = Math.min(241, Math.max(9, Math.round(shot.durationSec * fps) + 1));

  return {
    prompt: compiled.prompt,
    negativePrompt: compiled.negativePrompt,
    seed: project.seed,
    width: options.width ?? 768,
    height: options.height ?? 512,
    numFrames,
    frameRate: fps,
    imageBase64: options.imageBase64,
    shotLabel: shot.label,
    stylePreset: project.stylePreset,
  };
}
