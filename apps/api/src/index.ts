import Fastify from 'fastify';
import { createDefaultSceneSpec } from '@animagen/scene-schema';

const app = Fastify({ logger: true });

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

const port = Number(process.env.PORT ?? 3001);
const host = process.env.HOST ?? '0.0.0.0';

app.listen({ port, host }).catch((err) => {
  app.log.error(err);
  process.exit(1);
});
