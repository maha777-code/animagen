import type {
  AnimationSpec,
  CameraSpec,
  EffectType,
  EnvironmentType,
  MotionType,
  SceneSpec,
} from '@animagen/scene-schema';

const ENV_EFFECTS: Partial<Record<EnvironmentType, EffectType[]>> = {
  ocean: ['storm'],
  underwater: ['bubbles'],
  arctic: ['snow'],
  forest: ['leaves', 'fog'],
  jungle: ['leaves', 'rain'],
  desert: ['dust'],
  space: ['sparkles'],
  volcano: ['fire'],
  meadow: ['sparkles'],
  sky: ['sparkles'],
};

function inferColor(prompt: string): string {
  const lower = prompt.toLowerCase();
  const colors = ['red', 'blue', 'green', 'gold', 'silver', 'purple', 'orange', 'white', 'black'];
  return colors.find((c) => lower.includes(c)) ?? 'gold';
}

function inferMotion(environment: EnvironmentType, prompt: string): MotionType {
  const lower = prompt.toLowerCase();
  if (lower.includes('swim') || environment === 'underwater' || environment === 'ocean') return 'swim';
  if (lower.includes('fly') || lower.includes('flying')) return 'fly';
  if (lower.includes('walk') || lower.includes('walking')) return 'walk';
  if (lower.includes('orbit')) return 'orbit';
  return environment === 'space' ? 'float' : 'fly';
}

function inferEffects(environment: EnvironmentType, mood: string): EffectType[] {
  const base = ENV_EFFECTS[environment] ?? [];
  if (mood === 'stormy' && !base.includes('storm')) return ['storm', ...base].slice(0, 3);
  if (mood === 'mysterious' && !base.includes('fog')) return ['fog', ...base].slice(0, 3);
  return base.slice(0, 3);
}

function cinematicCamera(spec: SceneSpec, animations: AnimationSpec[]): CameraSpec {
  const primary = spec.subjects[0];
  const target = primary?.name ?? primary?.type;
  const motion = animations[0]?.motion;
  let movement: CameraSpec['movement'] = spec.camera.movement;

  if (motion === 'fly' || motion === 'swim') movement = 'follow';
  if (spec.lighting.mood === 'epic' || spec.lighting.mood === 'dramatic') movement = 'flythrough';
  if (spec.environment === 'space') movement = 'orbit';

  return {
    ...spec.camera,
    movement,
    target: spec.camera.target ?? target,
    duration: Math.max(spec.camera.duration, 15),
    distance: spec.camera.distance ?? (movement === 'follow' ? 14 : 18),
    height: spec.camera.height ?? 6,
  };
}

/** Post-process SceneSpec for richer, more cinematic scenes. */
export function enrichSceneSpec(spec: SceneSpec): SceneSpec {
  const subjects = spec.subjects.map((s, i) => ({
    ...s,
    name: s.name ?? s.type ?? `subject-${i}`,
    color: s.color ?? inferColor(spec.prompt),
    scale: s.scale ?? 1,
  }));

  if (subjects.length === 0) {
    subjects.push({
      type: 'unknown',
      name: 'subject',
      color: inferColor(spec.prompt),
      scale: 1,
    });
  }

  const animations =
    spec.animations.length > 0
      ? [...spec.animations]
      : subjects.slice(0, 3).map((s) => ({
          target: s.name ?? s.type,
          motion: inferMotion(spec.environment, spec.prompt),
          speed: 1,
          path: 'circle' as const,
        }));

  const effects =
    spec.effects.length > 0 ? [...spec.effects] : inferEffects(spec.environment, spec.lighting.mood);

  const camera = cinematicCamera({ ...spec, subjects, animations }, animations);

  return {
    ...spec,
    subjects,
    animations,
    effects,
    camera,
    metadata: {
      ...spec.metadata,
      source: spec.metadata?.source ?? 'parser',
    },
  };
}
