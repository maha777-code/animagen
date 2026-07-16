import Fastify from 'fastify';
import { createDefaultSceneSpec } from '@animagen/scene-schema';

export function buildApp() {
  const app = Fastify({ logger: false });

  app.get('/health', async () => ({ status: 'ok', service: 'animagen-api' }));

  /** Placeholder — full implementation in Phase 5. */
  app.post('/api/generate', async (request) => {
    const body = request.body as { prompt?: string };
    const prompt = body?.prompt ?? 'placeholder';
    return {
      status: 'not_implemented',
      message: 'Tier 2 LLM generation — see Phase 5',
      spec: createDefaultSceneSpec({ prompt, seed: 0 }),
    };
  });

  return app;
}
