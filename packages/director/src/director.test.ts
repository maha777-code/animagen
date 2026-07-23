import { describe, expect, it } from 'vitest';
import { createDefaultSceneSpec } from '@animagen/scene-schema';
import { compileLtxPrompt, createShot, projectFromSpec, projectFromTemplate, specForShot } from './index.js';
import { getTemplateById } from './templates.js';

describe('@animagen/director', () => {
  it('creates project from spec with one default shot', () => {
    const spec = createDefaultSceneSpec({
      prompt: 'a dragon swimming underwater',
      seed: 42,
      environment: 'underwater',
      subjects: [{ type: 'dragon', name: 'dragon' }],
      animations: [{ target: 'dragon', motion: 'swim', speed: 1 }],
      camera: { movement: 'follow', duration: 12 },
      effects: ['bubbles'],
    });
    const project = projectFromSpec(spec, 'Test');
    expect(project.shots).toHaveLength(1);
    expect(project.shots[0]?.motion).toBe('swim');
  });

  it('merges shot into preview spec', () => {
    const spec = createDefaultSceneSpec({
      prompt: 'dragon',
      seed: 1,
      environment: 'ocean',
      subjects: [{ type: 'dragon', name: 'dragon' }],
      animations: [{ target: 'dragon', motion: 'fly', speed: 1 }],
      camera: { movement: 'orbit', duration: 10 },
    });
    const project = projectFromSpec(spec);
    const shot = createShot({
      ...project.shots[0]!,
      motion: 'swim',
      environment: 'underwater',
      effects: ['bubbles'],
    });
    const preview = specForShot(spec, shot);
    expect(preview.environment).toBe('underwater');
    expect(preview.animations[0]?.motion).toBe('swim');
    expect(preview.effects).toContain('bubbles');
  });

  it('compiles LTX prompt with style and camera hints', () => {
    const template = getTemplateById('underwater-documentary')!;
    const project = projectFromTemplate(template, 'a sea turtle gliding', 99);
    const spec = createDefaultSceneSpec({
      prompt: project.prompt,
      seed: 99,
      environment: 'underwater',
      subjects: [{ type: 'fish', name: 'fish' }],
    });
    const compiled = compileLtxPrompt(project, spec, 0);
    expect(compiled.prompt.toLowerCase()).toContain('underwater');
    expect(compiled.prompt.toLowerCase()).toContain('tracking');
    expect(compiled.negativePrompt).toContain('low quality');
    expect(compiled.metadata.shotCount).toBe(3);
  });

  it('loads template project with multiple shots', () => {
    const template = getTemplateById('epic-aerial')!;
    const project = projectFromTemplate(template, 'dragon over ocean', 7);
    expect(project.shots.length).toBe(2);
    expect(project.templateId).toBe('epic-aerial');
  });
});
