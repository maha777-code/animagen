import type { SceneSpec } from '@animagen/scene-schema';
import { parseSceneSpec } from '@animagen/scene-schema';
import Redis from 'ioredis';

export interface SceneCache {
  get(key: string): Promise<SceneSpec | null>;
  set(key: string, spec: SceneSpec, ttlSec: number): Promise<void>;
  close(): Promise<void>;
}

class MemorySceneCache implements SceneCache {
  private store = new Map<string, { spec: SceneSpec; expires: number }>();

  async get(key: string): Promise<SceneSpec | null> {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expires) {
      this.store.delete(key);
      return null;
    }
    return entry.spec;
  }

  async set(key: string, spec: SceneSpec, ttlSec: number): Promise<void> {
    this.store.set(key, { spec, expires: Date.now() + ttlSec * 1000 });
  }

  async close(): Promise<void> {
    this.store.clear();
  }
}

class RedisSceneCache implements SceneCache {
  private redis: Redis;

  constructor(url: string) {
    this.redis = new Redis(url, { maxRetriesPerRequest: 2, lazyConnect: true });
  }

  async get(key: string): Promise<SceneSpec | null> {
    const raw = await this.redis.get(`animagen:spec:${key}`);
    if (!raw) return null;
    return parseSceneSpec(JSON.parse(raw));
  }

  async set(key: string, spec: SceneSpec, ttlSec: number): Promise<void> {
    await this.redis.set(`animagen:spec:${key}`, JSON.stringify(spec), 'EX', ttlSec);
  }

  async close(): Promise<void> {
    await this.redis.quit();
  }
}

export function createSceneCache(redisUrl: string): SceneCache {
  if (redisUrl) {
    return new RedisSceneCache(redisUrl);
  }
  return new MemorySceneCache();
}

export type CacheMode = 'standard' | 'enhance';

export function cacheKey(normalizedPrompt: string, seed: number, mode: CacheMode = 'standard'): string {
  return mode === 'enhance' ? `${normalizedPrompt}:${seed}:enhance` : `${normalizedPrompt}:${seed}`;
}
