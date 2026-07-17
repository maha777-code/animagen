import { parsePrompt } from '@animagen/parser';
import { seedFromPrompt, type SceneSpec } from '@animagen/scene-schema';
import { create } from 'zustand';

export const DEFAULT_PROMPT = 'a red dragon flying over the ocean at sunset with storm clouds';

interface AnimagenState {
  prompt: string;
  seed: number | null;
  spec: SceneSpec | null;
  confidence: number;
  matchedEntities: string[];
  needsLlmFallback: boolean;
  isPlaying: boolean;
  orbitMode: boolean;
  playbackKey: number;
  parseError: string | null;
  hydrated: boolean;
  setPrompt: (prompt: string) => void;
  generate: () => void;
  rerollSeed: () => void;
  setPlaying: (playing: boolean) => void;
  togglePlaying: () => void;
  setOrbitMode: (orbitMode: boolean) => void;
  restartPlayback: () => void;
  hydrate: () => void;
}

function parseWithSeed(prompt: string, seed: number) {
  const result = parsePrompt(prompt, { seed });
  return {
    spec: result.spec,
    confidence: result.confidence,
    matchedEntities: result.matchedEntities,
    needsLlmFallback: result.needsLlmFallback,
    seed,
  };
}

export const useAnimagenStore = create<AnimagenState>((set, get) => ({
  prompt: DEFAULT_PROMPT,
  seed: null,
  spec: null,
  confidence: 0,
  matchedEntities: [],
  needsLlmFallback: false,
  isPlaying: true,
  orbitMode: false,
  playbackKey: 0,
  parseError: null,
  hydrated: false,

  hydrate: () => {
    if (get().hydrated) return;
    set({ hydrated: true });
    get().generate();
  },

  setPrompt: (prompt) => set({ prompt }),

  generate: () => {
    const { prompt, seed: seedOverride } = get();
    try {
      const seed = seedOverride ?? seedFromPrompt(prompt);
      const parsed = parseWithSeed(prompt, seed);
      set({
        ...parsed,
        parseError: null,
        isPlaying: true,
        playbackKey: get().playbackKey + 1,
      });
    } catch (err) {
      set({
        parseError: err instanceof Error ? err.message : 'Failed to parse prompt',
      });
    }
  },

  rerollSeed: () => {
    const { prompt } = get();
    try {
      const seed = Math.floor(Math.random() * 0xffffffff);
      const parsed = parseWithSeed(prompt, seed);
      set({
        ...parsed,
        seed,
        parseError: null,
        isPlaying: true,
        playbackKey: get().playbackKey + 1,
      });
    } catch (err) {
      set({
        parseError: err instanceof Error ? err.message : 'Failed to parse prompt',
      });
    }
  },

  setPlaying: (isPlaying) => set({ isPlaying }),
  togglePlaying: () => set((s) => ({ isPlaying: !s.isPlaying })),
  setOrbitMode: (orbitMode) => set({ orbitMode }),
  restartPlayback: () => set((s) => ({ playbackKey: s.playbackKey + 1, isPlaying: true })),
}));
