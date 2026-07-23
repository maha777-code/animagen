import { z } from 'zod';
import {
  CameraMovementSchema,
  EffectTypeSchema,
  EnvironmentTypeSchema,
  MotionTypeSchema,
  PathTypeSchema,
} from '@animagen/scene-schema';

export const ShotSpecSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1).max(80),
  durationSec: z.number().min(1).max(120),
  camera: CameraMovementSchema,
  motion: MotionTypeSchema,
  path: PathTypeSchema.optional(),
  effects: z.array(EffectTypeSchema).max(10),
  environment: EnvironmentTypeSchema.optional(),
  notes: z.string().max(500).optional(),
});

export type ShotSpec = z.infer<typeof ShotSpecSchema>;

export const DirectorProjectSchema = z.object({
  version: z.literal(1).default(1),
  name: z.string().min(1).max(120),
  prompt: z.string().min(1).max(2000),
  seed: z.number().int().nonnegative(),
  stylePreset: z.string().optional(),
  templateId: z.string().optional(),
  shots: z.array(ShotSpecSchema).min(1).max(12),
  activeShotIndex: z.number().int().min(0),
});

export type DirectorProject = z.infer<typeof DirectorProjectSchema>;

export const TemplateCategorySchema = z.enum(['education', 'previs', 'motion', 'general']);

export type TemplateCategory = z.infer<typeof TemplateCategorySchema>;

export const DirectorTemplateSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  category: TemplateCategorySchema,
  promptHint: z.string(),
  stylePreset: z.string().optional(),
  environment: EnvironmentTypeSchema.optional(),
  shots: z.array(ShotSpecSchema.omit({ id: true })),
});

export type DirectorTemplate = z.infer<typeof DirectorTemplateSchema>;

export const LtxRenderRequestSchema = z.object({
  prompt: z.string().min(1),
  negativePrompt: z.string(),
  seed: z.number().int().nonnegative(),
  width: z.number().int().min(256).max(1920).default(768),
  height: z.number().int().min(256).max(1080).default(512),
  numFrames: z.number().int().min(9).max(241).default(121),
  frameRate: z.number().min(12).max(60).default(24),
  imageBase64: z.string().optional(),
  shotLabel: z.string().optional(),
  stylePreset: z.string().optional(),
});

export type LtxRenderRequest = z.infer<typeof LtxRenderRequestSchema>;

export const LtxCompiledPromptSchema = z.object({
  prompt: z.string(),
  negativePrompt: z.string(),
  metadata: z.object({
    stylePreset: z.string().optional(),
    shotLabel: z.string().optional(),
    environment: z.string().optional(),
    camera: z.string(),
    motion: z.string(),
    durationSec: z.number(),
    totalDurationSec: z.number(),
    shotCount: z.number(),
  }),
});

export type LtxCompiledPrompt = z.infer<typeof LtxCompiledPromptSchema>;
