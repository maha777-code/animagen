import type {
  CameraMovement,
  EffectType,
  EnvironmentType,
  MotionType,
  Mood,
  SubjectType,
  TimeOfDay,
} from '@animagen/scene-schema';

export interface PromptFixture {
  id: string;
  prompt: string;
  expect: {
    subjectTypes?: SubjectType[];
    colors?: string[];
    environment?: EnvironmentType;
    timeOfDay?: TimeOfDay;
    mood?: Mood;
    motions?: MotionType[];
    effects?: EffectType[];
    camera?: CameraMovement;
    minConfidence?: number;
    maxConfidence?: number;
    needsLlmFallback?: boolean;
  };
}

/** 35 prompt fixtures covering common and edge-case inputs. */
export const PROMPT_FIXTURES: PromptFixture[] = [
  {
    id: 'dragon-ocean-sunset',
    prompt: 'a red dragon flying over a stormy ocean at sunset',
    expect: {
      subjectTypes: ['dragon'],
      colors: ['red'],
      environment: 'ocean',
      timeOfDay: 'sunset',
      motions: ['fly'],
      effects: ['storm'],
      camera: 'follow',
      minConfidence: 0.7,
      needsLlmFallback: false,
    },
  },
  {
    id: 'blue-whale-underwater',
    prompt: 'a blue whale swimming slowly underwater with bubbles',
    expect: {
      subjectTypes: ['whale'],
      colors: ['blue'],
      environment: 'underwater',
      motions: ['swim'],
      effects: ['bubbles'],
      minConfidence: 0.6,
    },
  },
  {
    id: 'robot-city-night',
    prompt: 'a silver robot walking through a neon city at night',
    expect: {
      subjectTypes: ['robot'],
      colors: ['silver'],
      environment: 'city',
      timeOfDay: 'night',
      motions: ['walk'],
      minConfidence: 0.6,
    },
  },
  {
    id: 'birds-forest-morning',
    prompt: 'three birds flying in circles above a peaceful forest in the morning',
    expect: {
      subjectTypes: ['bird'],
      environment: 'forest',
      timeOfDay: 'morning',
      motions: ['fly'],
      minConfidence: 0.7,
    },
  },
  {
    id: 'spaceship-space',
    prompt: 'a golden spaceship orbiting a red planet in deep space with sparkles',
    expect: {
      subjectTypes: ['spaceship', 'planet'],
      environment: 'space',
      motions: ['orbit'],
      effects: ['sparkles'],
      minConfidence: 0.7,
    },
  },
  {
    id: 'car-desert',
    prompt: 'a fast black car driving through the desert at noon',
    expect: {
      subjectTypes: ['car'],
      colors: ['black'],
      environment: 'desert',
      timeOfDay: 'noon',
      minConfidence: 0.5,
    },
  },
  {
    id: 'fish-ocean',
    prompt: 'colorful fish swimming in the ocean',
    expect: {
      subjectTypes: ['fish'],
      environment: 'ocean',
      motions: ['swim'],
      camera: 'follow',
      minConfidence: 0.6,
    },
  },
  {
    id: 'horse-meadow',
    prompt: 'a white horse running across a sunny meadow',
    expect: {
      subjectTypes: ['horse'],
      colors: ['white'],
      environment: 'meadow',
      motions: ['run'],
      minConfidence: 0.6,
    },
  },
  {
    id: 'cat-room-abstract',
    prompt: 'a cat bouncing playfully',
    expect: {
      subjectTypes: ['cat'],
      motions: ['bounce'],
      minConfidence: 0.4,
    },
  },
  {
    id: 'dog-beach-sunset',
    prompt: 'a happy dog running on the beach at sunset',
    expect: {
      subjectTypes: ['dog'],
      environment: 'beach',
      timeOfDay: 'sunset',
      motions: ['run'],
      minConfidence: 0.7,
    },
  },
  {
    id: 'snake-jungle',
    prompt: 'a green snake slithering through the jungle with mist',
    expect: {
      subjectTypes: ['snake'],
      colors: ['green'],
      environment: 'jungle',
      effects: ['fog'],
      minConfidence: 0.5,
    },
  },
  {
    id: 'airplane-sky',
    prompt: 'an airplane flying through cloudy sky at dawn',
    expect: {
      subjectTypes: ['airplane'],
      environment: 'sky',
      timeOfDay: 'dawn',
      motions: ['fly'],
      camera: 'follow',
      minConfidence: 0.7,
    },
  },
  {
    id: 'rocket-space',
    prompt: 'a rocket launching into space with fire and smoke',
    expect: {
      subjectTypes: ['rocket'],
      environment: 'space',
      effects: ['fire'],
      minConfidence: 0.5,
    },
  },
  {
    id: 'boat-ocean-storm',
    prompt: 'a small boat on a stormy ocean with rain and lightning',
    expect: {
      subjectTypes: ['boat'],
      environment: 'ocean',
      effects: ['rain', 'lightning', 'storm'],
      mood: 'stormy',
      minConfidence: 0.7,
    },
  },
  {
    id: 'butterfly-garden',
    prompt: 'a purple butterfly floating above flowers in a meadow',
    expect: {
      subjectTypes: ['butterfly', 'flower'],
      colors: ['purple'],
      environment: 'meadow',
      motions: ['float'],
      minConfidence: 0.6,
    },
  },
  {
    id: 'human-mountains',
    prompt: 'a knight walking through misty mountains at dusk',
    expect: {
      subjectTypes: ['human'],
      environment: 'mountains',
      timeOfDay: 'dusk',
      motions: ['walk'],
      effects: ['fog'],
      minConfidence: 0.7,
    },
  },
  {
    id: 'tree-forest-autumn',
    prompt: 'trees in an autumn forest with falling leaves',
    expect: {
      subjectTypes: ['tree'],
      environment: 'forest',
      effects: ['leaves'],
      minConfidence: 0.5,
    },
  },
  {
    id: 'crystal-cave',
    prompt: 'glowing crystals spinning in a dark cave',
    expect: {
      subjectTypes: ['crystal'],
      environment: 'cave',
      motions: ['spin'],
      mood: 'dark',
      minConfidence: 0.6,
    },
  },
  {
    id: 'cloud-sky',
    prompt: 'fluffy clouds drifting across a blue sky',
    expect: {
      subjectTypes: ['cloud'],
      environment: 'sky',
      minConfidence: 0.4,
    },
  },
  {
    id: 'cube-abstract',
    prompt: 'a red cube bouncing on an abstract background',
    expect: {
      subjectTypes: ['cube'],
      colors: ['red'],
      motions: ['bounce'],
      minConfidence: 0.4,
    },
  },
  {
    id: 'sphere-space',
    prompt: 'a golden sphere floating in space',
    expect: {
      subjectTypes: ['sphere'],
      colors: ['golden'],
      environment: 'space',
      motions: ['float'],
      minConfidence: 0.6,
    },
  },
  {
    id: 'house-city',
    prompt: 'a cozy house in a cheerful city street',
    expect: {
      subjectTypes: ['house'],
      environment: 'city',
      mood: 'cheerful',
      minConfidence: 0.5,
    },
  },
  {
    id: 'volcano-fire',
    prompt: 'a volcano erupting with fire and ash at night',
    expect: {
      environment: 'volcano',
      timeOfDay: 'night',
      effects: ['fire'],
      minConfidence: 0.2,
      needsLlmFallback: true,
    },
  },
  {
    id: 'arctic-whale',
    prompt: 'a whale swimming in arctic ice waters',
    expect: {
      subjectTypes: ['whale'],
      environment: 'arctic',
      motions: ['swim'],
      camera: 'follow',
      minConfidence: 0.6,
    },
  },
  {
    id: 'epic-dragon-mountains',
    prompt: 'an epic dragon soaring over snowy mountains',
    expect: {
      subjectTypes: ['dragon'],
      environment: 'mountains',
      motions: ['fly'],
      mood: 'epic',
      camera: 'follow',
      minConfidence: 0.7,
    },
  },
  {
    id: 'eerie-forest-night',
    prompt: 'an eerie forest at midnight with fog',
    expect: {
      environment: 'forest',
      timeOfDay: 'midnight',
      mood: 'eerie',
      effects: ['fog'],
      minConfidence: 0.2,
      needsLlmFallback: true,
    },
  },
  {
    id: 'romantic-beach-sunset',
    prompt: 'a romantic beach scene at sunset with gentle waves',
    expect: {
      environment: 'beach',
      timeOfDay: 'sunset',
      mood: 'romantic',
      minConfidence: 0.2,
      needsLlmFallback: true,
    },
  },
  {
    id: 'follow-camera-drone',
    prompt: 'follow a red bird flying over the ocean',
    expect: {
      subjectTypes: ['bird'],
      colors: ['red'],
      environment: 'ocean',
      motions: ['fly'],
      camera: 'follow',
      minConfidence: 0.65,
    },
  },
  {
    id: 'flythrough-city',
    prompt: 'aerial fly through a futuristic city at night',
    expect: {
      environment: 'city',
      timeOfDay: 'night',
      camera: 'flythrough',
      minConfidence: 0.2,
      needsLlmFallback: true,
    },
  },
  {
    id: 'static-scene',
    prompt: 'static camera on a golden planet in space',
    expect: {
      subjectTypes: ['planet'],
      colors: ['golden'],
      environment: 'space',
      camera: 'static',
      minConfidence: 0.5,
    },
  },
  {
    id: 'multi-subject',
    prompt: 'a cat and a dog running in a sunny meadow',
    expect: {
      subjectTypes: ['cat', 'dog'],
      environment: 'meadow',
      motions: ['run'],
      minConfidence: 0.65,
    },
  },
  {
    id: 'slow-motion-fish',
    prompt: 'a fish swimming slowly in circles underwater',
    expect: {
      subjectTypes: ['fish'],
      environment: 'underwater',
      motions: ['swim'],
      minConfidence: 0.6,
    },
  },
  {
    id: 'dust-desert',
    prompt: 'dust blowing across a vast desert at afternoon',
    expect: {
      environment: 'desert',
      timeOfDay: 'afternoon',
      effects: ['dust'],
      minConfidence: 0.2,
      needsLlmFallback: true,
    },
  },
  {
    id: 'snow-arctic',
    prompt: 'snow falling over arctic tundra at dawn',
    expect: {
      environment: 'arctic',
      timeOfDay: 'dawn',
      effects: ['snow'],
      minConfidence: 0.2,
      needsLlmFallback: true,
    },
  },
  {
    id: 'novel-low-confidence',
    prompt: 'quantum flux harmonizing with ethereal resonance',
    expect: {
      maxConfidence: 0.35,
      needsLlmFallback: true,
    },
  },
];
