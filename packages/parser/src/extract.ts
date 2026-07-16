import type {
  AnimationSpec,
  CameraSpec,
  EffectType,
  EnvironmentType,
  LightingSpec,
  MotionType,
  PathType,
  SubjectSpec,
  SubjectType,
  TimeOfDay,
  Mood,
} from '@animagen/scene-schema';
import {
  CAMERA_PHRASES,
  COLOR_WORDS,
  COUNT_WORDS,
  EFFECT_SYNONYMS,
  ENVIRONMENT_SYNONYMS,
  MOOD_SYNONYMS,
  MOTION_SYNONYMS,
  PATH_SYNONYMS,
  SKIP_WORDS,
  SPEED_MODIFIERS,
  SUBJECT_SYNONYMS,
  TIME_OF_DAY_SYNONYMS,
} from './dictionaries.js';
import {
  matchAllDictionary,
  matchDictionary,
  matchPhrase,
  parseCountToken,
  tokenize,
  type Token,
} from './tokenize.js';

export interface ExtractedEntities {
  subjects: SubjectSpec[];
  environment: EnvironmentType;
  lighting: LightingSpec;
  animations: AnimationSpec[];
  camera: CameraSpec;
  effects: EffectType[];
  matchedEntities: string[];
}

const DEFAULT_ENVIRONMENT: EnvironmentType = 'abstract';
const DEFAULT_TIME: TimeOfDay = 'noon';
const DEFAULT_MOOD: Mood = 'calm';
const COLOR_SET = new Set(COLOR_WORDS);

function findColorBefore(tokens: Token[], subjectIndex: number): string | undefined {
  for (let i = subjectIndex - 1; i >= Math.max(0, subjectIndex - 3); i--) {
    const tok = tokens[i]?.value;
    if (!tok) continue;
    if (COLOR_SET.has(tok)) return tok;
    if (!SKIP_WORDS.has(tok) && !COUNT_WORDS[tok] && !parseCountToken(tok)) break;
  }
  return undefined;
}

function findCountBefore(tokens: Token[], subjectIndex: number): number | undefined {
  for (let i = subjectIndex - 1; i >= Math.max(0, subjectIndex - 4); i--) {
    const tok = tokens[i]?.value;
    if (!tok) continue;
    const fromWord = COUNT_WORDS[tok];
    if (fromWord) return fromWord;
    const fromNum = parseCountToken(tok);
    if (fromNum) return fromNum;
    if (!SKIP_WORDS.has(tok)) break;
  }
  return undefined;
}

function extractSubjects(tokens: Token[]): { subjects: SubjectSpec[]; matched: string[] } {
  const hits = matchAllDictionary(tokens, SUBJECT_SYNONYMS, 1);
  const subjects: SubjectSpec[] = [];
  const matched: string[] = [];
  const seenTypes = new Set<SubjectType>();

  for (const hit of hits) {
    if (seenTypes.has(hit.value)) continue;
    seenTypes.add(hit.value);

    const color = findColorBefore(tokens, hit.startIndex);
    const count = findCountBefore(tokens, hit.startIndex) ?? 1;

    subjects.push({
      type: hit.value,
      ...(color ? { color } : {}),
      ...(count > 1 ? { count } : {}),
      name: hit.value,
    });
    matched.push(`subject:${hit.matched}`);
    if (color) matched.push(`color:${color}`);
    if (count > 1) matched.push(`count:${count}`);
  }

  return { subjects, matched };
}

function extractEnvironment(tokens: Token[]): { environment: EnvironmentType; matched: string[] } {
  const hit = matchDictionary(tokens, ENVIRONMENT_SYNONYMS, 2);
  if (hit) {
    return { environment: hit.value, matched: [`environment:${hit.matched}`] };
  }
  return { environment: DEFAULT_ENVIRONMENT, matched: [] };
}

function extractLighting(tokens: Token[]): { lighting: LightingSpec; matched: string[] } {
  const matched: string[] = [];
  let timeOfDay = DEFAULT_TIME;
  let mood = DEFAULT_MOOD;

  const timeHit = matchDictionary(tokens, TIME_OF_DAY_SYNONYMS, 2);
  if (timeHit) {
    timeOfDay = timeHit.value;
    matched.push(`timeOfDay:${timeHit.matched}`);
  }

  const moodHit = matchDictionary(tokens, MOOD_SYNONYMS, 1);
  if (moodHit) {
    mood = moodHit.value;
    matched.push(`mood:${moodHit.matched}`);
  }

  if (tokens.some((t) => t.value === 'stormy' || t.value === 'storm')) {
    if (!moodHit) {
      mood = 'stormy';
      matched.push('mood:stormy');
    }
  }

  if ((timeOfDay === 'sunset' || timeOfDay === 'dusk') && !moodHit && mood === DEFAULT_MOOD) {
    mood = 'dramatic';
    matched.push('mood:inferred_dramatic');
  }

  if ((timeOfDay === 'night' || timeOfDay === 'midnight') && !moodHit && mood === DEFAULT_MOOD) {
    mood = 'mysterious';
    matched.push('mood:inferred_mysterious');
  }

  return { lighting: { timeOfDay, mood }, matched };
}

function extractMotions(tokens: Token[]): {
  motions: Array<{ motion: MotionType; index: number; matched: string }>;
  matched: string[];
} {
  const hits = matchAllDictionary(tokens, MOTION_SYNONYMS, 1);
  const motions = hits.map((h) => ({
    motion: h.value,
    index: h.startIndex,
    matched: h.matched,
  }));
  return { motions, matched: motions.map((m) => `motion:${m.matched}`) };
}

function extractPath(tokens: Token[]): { path?: PathType; matched: string[] } {
  const hit = matchDictionary(tokens, PATH_SYNONYMS, 2);
  if (hit) {
    return { path: hit.value, matched: [`path:${hit.matched}`] };
  }
  if (matchPhrase(tokens, 'in circles') !== null || tokens.some((t) => t.value === 'around')) {
    return { path: 'circle', matched: ['path:circle'] };
  }
  return { matched: [] };
}

function extractSpeed(tokens: Token[]): number {
  for (const t of tokens) {
    const mod = SPEED_MODIFIERS[t.value];
    if (mod !== undefined) return mod;
  }
  return 1;
}

function subjectTokenIndex(tokens: Token[], type: SubjectType, beforeIndex: number): number | null {
  let best: number | null = null;
  for (const t of tokens) {
    if (t.index >= beforeIndex) break;
    if (SUBJECT_SYNONYMS[t.value] === type) best = t.index;
  }
  return best;
}

function linkAnimations(
  tokens: Token[],
  subjects: SubjectSpec[],
  motions: Array<{ motion: MotionType; index: number; matched: string }>,
  path: PathType | undefined,
  speed: number,
): AnimationSpec[] {
  if (subjects.length === 0 || motions.length === 0) return [];

  const animations: AnimationSpec[] = [];
  const usedTargets = new Set<string>();

  for (const motion of motions) {
    let target = subjects[0]?.name ?? subjects[0]?.type ?? 'subject';
    let bestDist = Infinity;

    for (const subject of subjects) {
      const idx = subjectTokenIndex(tokens, subject.type, motion.index);
      if (idx !== null && motion.index - idx < bestDist) {
        bestDist = motion.index - idx;
        target = subject.name ?? subject.type;
      }
    }

    if (usedTargets.has(target)) {
      const alt = subjects.find((s) => !usedTargets.has(s.name ?? s.type));
      if (alt) target = alt.name ?? alt.type;
    }
    usedTargets.add(target);

    animations.push({
      target,
      motion: motion.motion,
      speed,
      ...(path ? { path } : {}),
      loop: true,
    });
  }

  return animations;
}

function extractEffects(tokens: Token[]): { effects: EffectType[]; matched: string[] } {
  const hits = matchAllDictionary(tokens, EFFECT_SYNONYMS, 1);
  const effects: EffectType[] = [];
  const matched: string[] = [];
  const seen = new Set<EffectType>();

  for (const hit of hits) {
    if (seen.has(hit.value)) continue;
    seen.add(hit.value);
    effects.push(hit.value);
    matched.push(`effect:${hit.matched}`);
  }

  if (
    !seen.has('storm') &&
    tokens.some((t) => t.value === 'stormy' || t.value === 'thunder' || t.value === 'tempest')
  ) {
    effects.push('storm');
    matched.push('effect:inferred_storm');
  }

  return { effects, matched };
}

function extractCamera(
  tokens: Token[],
  subjects: SubjectSpec[],
  motions: Array<{ motion: MotionType; index: number; matched: string }>,
): { camera: CameraSpec; matched: string[] } {
  const matched: string[] = [];

  for (const [phrase, movement] of Object.entries(CAMERA_PHRASES)) {
    if (matchPhrase(tokens, phrase) !== null) {
      matched.push(`camera:${phrase}`);
      const target = subjects[0]?.name ?? subjects[0]?.type;
      return {
        camera: {
          movement,
          duration: 12,
          ...(movement === 'follow' && target ? { target } : {}),
        },
        matched,
      };
    }
  }

  if (motions.some((m) => m.motion === 'fly' || m.motion === 'swim')) {
    matched.push('camera:inferred_follow');
    const target = subjects[0]?.name ?? subjects[0]?.type;
    return {
      camera: {
        movement: 'follow',
        duration: 15,
        ...(target ? { target } : {}),
      },
      matched,
    };
  }

  matched.push('camera:default_orbit');
  return { camera: { movement: 'orbit', duration: 10 }, matched };
}

export function extractEntities(prompt: string): ExtractedEntities {
  const tokens = tokenize(prompt);

  const { subjects, matched: subjectMatched } = extractSubjects(tokens);
  const { environment, matched: envMatched } = extractEnvironment(tokens);
  const { lighting, matched: lightMatched } = extractLighting(tokens);
  const { motions, matched: motionMatched } = extractMotions(tokens);
  const { path, matched: pathMatched } = extractPath(tokens);
  const speed = extractSpeed(tokens);
  const animations = linkAnimations(tokens, subjects, motions, path, speed);
  const { effects, matched: effectMatched } = extractEffects(tokens);
  const { camera, matched: cameraMatched } = extractCamera(tokens, subjects, motions);

  return {
    subjects,
    environment,
    lighting,
    animations,
    camera,
    effects,
    matchedEntities: [
      ...subjectMatched,
      ...envMatched,
      ...lightMatched,
      ...motionMatched,
      ...pathMatched,
      ...effectMatched,
      ...cameraMatched,
    ],
  };
}

export interface ConfidenceInput {
  subjects: SubjectSpec[];
  environment: EnvironmentType;
  lighting: LightingSpec;
  animations: AnimationSpec[];
  effects: EffectType[];
  tokenCount: number;
}

export function computeConfidence(input: ConfidenceInput): number {
  let score = 0;

  if (input.subjects.length > 0) score += 0.3;
  if (input.environment !== DEFAULT_ENVIRONMENT) score += 0.2;
  if (input.animations.length > 0) score += 0.15;
  if (input.lighting.timeOfDay !== DEFAULT_TIME) score += 0.1;
  if (input.lighting.mood !== DEFAULT_MOOD) score += 0.1;
  if (input.effects.length > 0) score += 0.1;
  if (input.subjects.some((s) => s.color)) score += 0.05;

  if (input.tokenCount < 2) score *= 0.5;
  if (input.subjects.length === 0) score = Math.min(score, 0.25);

  return Math.min(1, Math.round(score * 1000) / 1000);
}
