import { parsePrompt } from '@animagen/parser';
import { seedFromPrompt, type SceneSpec } from '@animagen/scene-schema';
import { create } from 'zustand';
import { fetchGenerate, type GenerateApiResponse } from '../lib/api-client';

export const DEFAULT_PROMPT = 'a red dragon flying over the ocean at sunset with storm clouds';

export type GenerateTier = GenerateApiResponse['tier'] | 'local';

interface AnimagenState {
  prompt: string;
  seed: number | null;
  spec: SceneSpec | null;
  confidence: number;
  matchedEntities: string[];
  needsLlmFallback: boolean;
  tier: GenerateTier | null;
  isPlaying: boolean;
  isGenerating: boolean;
  orbitMode: boolean;
  playbackKey: number;
  parseError: string | null;
  hydrated: boolean;
  apiOnline: boolean | null;
  setPrompt: (prompt: string) => void;
  generate: (options?: { forceLlm?: boolean }) => Promise<void>;
  rerollSeed: () => Promise<void>;
  setPlaying: (playing: boolean) => void;
  togglePlaying: () => void;
  setOrbitMode: (orbitMode: boolean) => void;
  restartPlayback: () => void;
  hydrate: () => void;
}

function applyLocalParse(set: (partial: Partial<AnimagenState>) => void, get: () => AnimagenState) {
  const { prompt, seed: seedOverride } = get();
  const seed = seedOverride ?? seedFromPrompt(prompt);
  const result = parsePrompt(prompt, { seed });
  set({
    spec: result.spec,
    confidence: result.confidence,
    matchedEntities: result.matchedEntities,
    needsLlmFallback: result.needsLlmFallback,
    seed,
    tier: 'local',
    parseError: null,
    isPlaying: true,
    playbackKey: get().playbackKey + 1,
  });
}

export const useAnimagenStore = create<AnimagenState>((set, get) => ({
  prompt: DEFAULT_PROMPT,
  seed: null,
  spec: null,
  confidence: 0,
  matchedEntities: [],
  needsLlmFallback: false,
  tier: null,
  isPlaying: true,
  isGenerating: false,
  orbitMode: false,
  playbackKey: 0,
  parseError: null,
  hydrated: false,
  apiOnline: null,

  hydrate: () => {
    if (get().hydrated) return;
    set({ hydrated: true });
    void get().generate();
  },

  setPrompt: (prompt) => set({ prompt }),

  generate: async (options) => {
    const { prompt, seed: seedOverride } = get();
    set({ isGenerating: true, parseError: null });

    try {
      const seed = seedOverride ?? seedFromPrompt(prompt);
      const result = await fetchGenerate(prompt, { seed, forceLlm: options?.forceLlm });
      set({
        spec: result.spec,
        confidence: result.confidence,
        matchedEntities: result.matchedEntities,
        needsLlmFallback: result.needsLlmFallback,
        seed: result.spec.seed,
        tier: result.tier,
        apiOnline: true,
        parseError: null,
        isPlaying: true,
        playbackKey: get().playbackKey + 1,
      });
    } catch {
      try {
        applyLocalParse(set, get);
        set({
          apiOnline: false,
          parseError: 'API offline — using browser parser. Start apps/api for Tier 2 quality.',
        });
      } catch (err) {
        set({
          parseError: err instanceof Error ? err.message : 'Failed to generate scene',
        });
      }
    } finally {
      set({ isGenerating: false });
    }
  },

  rerollSeed: async () => {
    const seed = Math.floor(Math.random() * 0xffffffff);
    set({ seed });
    await get().generate();
  },

  setPlaying: (isPlaying) => set({ isPlaying }),
  togglePlaying: () => set((s) => ({ isPlaying: !s.isPlaying })),
  setOrbitMode: (orbitMode) => set({ orbitMode }),
  restartPlayback: () => set((s) => ({ playbackKey: s.playbackKey + 1, isPlaying: true })),
}));
