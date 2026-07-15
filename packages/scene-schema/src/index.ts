import { z } from 'zod';

/** Supported procedural subject types (20+). */
export const SubjectTypeSchema = z.enum([
  'dragon',
  'bird',
  'fish',
  'car',
  'robot',
  'human',
  'tree',
  'planet',
  'spaceship',
  'butterfly',
  'whale',
  'horse',
  'cat',
  'dog',
  'snake',
  'cube',
  'sphere',
  'flower',
  'house',
  'boat',
  'airplane',
  'rocket',
  'cloud',
  'mountain',
  'crystal',
  'unknown',
]);

export type SubjectType = z.infer<typeof SubjectTypeSchema>;

export const SubjectSpecSchema = z.object({
  type: SubjectTypeSchema,
  color: z.string().optional(),
  scale: z.number().positive().max(100).optional(),
  count: z.number().int().positive().max(50).optional(),
  name: z.string().optional(),
});

export type SubjectSpec = z.infer<typeof SubjectSpecSchema>;

export const EnvironmentTypeSchema = z.enum([
  'ocean',
  'forest',
  'desert',
  'space',
  'city',
  'mountains',
  'abstract',
  'meadow',
  'underwater',
  'volcano',
  'arctic',
  'cave',
  'sky',
  'beach',
  'jungle',
]);

export type EnvironmentType = z.infer<typeof EnvironmentTypeSchema>;

export const TimeOfDaySchema = z.enum([
  'dawn',
  'morning',
  'noon',
  'afternoon',
  'sunset',
  'dusk',
  'night',
  'midnight',
]);

export type TimeOfDay = z.infer<typeof TimeOfDaySchema>;

export const MoodSchema = z.enum([
  'calm',
  'dramatic',
  'mysterious',
  'cheerful',
  'dark',
  'epic',
  'peaceful',
  'stormy',
  'romantic',
  'eerie',
]);

export type Mood = z.infer<typeof MoodSchema>;

export const LightingSpecSchema = z.object({
  timeOfDay: TimeOfDaySchema,
  mood: MoodSchema,
  intensity: z.number().min(0).max(2).optional(),
});

export type LightingSpec = z.infer<typeof LightingSpecSchema>;

export const MotionTypeSchema = z.enum([
  'fly',
  'orbit',
  'walk',
  'swim',
  'bounce',
  'spin',
  'float',
  'idle',
  'run',
  'dive',
  'hover',
  'patrol',
  'wave',
  'pulse',
  'grow',
]);

export type MotionType = z.infer<typeof MotionTypeSchema>;

export const PathTypeSchema = z.enum([
  'circle',
  'figure8',
  'line',
  'sine',
  'spiral',
  'random',
  'spline',
]);

export type PathType = z.infer<typeof PathTypeSchema>;

export const AnimationSpecSchema = z.object({
  target: z.string(),
  motion: MotionTypeSchema,
  path: PathTypeSchema.optional(),
  speed: z.number().min(0.1).max(10),
  loop: z.boolean().optional(),
  duration: z.number().positive().optional(),
});

export type AnimationSpec = z.infer<typeof AnimationSpecSchema>;

export const CameraMovementSchema = z.enum(['orbit', 'follow', 'flythrough', 'static']);

export type CameraMovement = z.infer<typeof CameraMovementSchema>;

export const CameraSpecSchema = z.object({
  movement: CameraMovementSchema,
  duration: z.number().positive().max(300),
  target: z.string().optional(),
  distance: z.number().positive().optional(),
  height: z.number().optional(),
});

export type CameraSpec = z.infer<typeof CameraSpecSchema>;

export const EffectTypeSchema = z.enum([
  'rain',
  'snow',
  'fog',
  'fire',
  'sparkles',
  'storm',
  'lightning',
  'bubbles',
  'dust',
  'leaves',
]);

export type EffectType = z.infer<typeof EffectTypeSchema>;

export const SceneSpecSchema = z.object({
  version: z.literal(1).default(1),
  seed: z.number().int().nonnegative(),
  prompt: z.string().min(1).max(2000),
  subjects: z.array(SubjectSpecSchema).min(0).max(20),
  environment: EnvironmentTypeSchema,
  lighting: LightingSpecSchema,
  animations: z.array(AnimationSpecSchema).max(30),
  camera: CameraSpecSchema,
  effects: z.array(EffectTypeSchema).max(10),
  metadata: z
    .object({
      source: z.enum(['parser', 'llm', 'fallback']).optional(),
      confidence: z.number().min(0).max(1).optional(),
      normalizedPrompt: z.string().optional(),
      generatedAt: z.string().datetime().optional(),
    })
    .optional(),
});

export type SceneSpec = z.infer<typeof SceneSpecSchema>;

/** Parse and validate unknown input into a SceneSpec. Throws ZodError on failure. */
export function parseSceneSpec(input: unknown): SceneSpec {
  return SceneSpecSchema.parse(input);
}

/** Safe parse returning success/error result. */
export function safeParseSceneSpec(input: unknown) {
  return SceneSpecSchema.safeParse(input);
}

/** Create a minimal valid SceneSpec with defaults for testing. */
export function createDefaultSceneSpec(
  overrides: Partial<Omit<SceneSpec, 'version'>> & Pick<SceneSpec, 'prompt' | 'seed'>,
): SceneSpec {
  return SceneSpecSchema.parse({
    version: 1,
    subjects: [],
    environment: 'abstract',
    lighting: { timeOfDay: 'noon', mood: 'calm' },
    animations: [],
    camera: { movement: 'orbit', duration: 10 },
    effects: [],
    ...overrides,
  });
}

/** Normalize prompt for cache key generation. */
export function normalizePrompt(prompt: string): string {
  return prompt
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/[^\w\s-]/g, '');
}

/** Simple deterministic hash from string (FNV-1a 32-bit). */
export function hashPrompt(prompt: string): number {
  const normalized = normalizePrompt(prompt);
  let hash = 2166136261;
  for (let i = 0; i < normalized.length; i++) {
    hash ^= normalized.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

/** Derive seed from prompt string. */
export function seedFromPrompt(prompt: string): number {
  return hashPrompt(prompt);
}

export { SCENE_SPEC_JSON_SCHEMA } from './json-schema.js';
