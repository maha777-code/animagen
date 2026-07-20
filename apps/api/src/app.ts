import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import Fastify, { type FastifyInstance } from 'fastify';
import { createSceneCache } from './cache/scene-cache.js';
import { config } from './config.js';
import { generateScene, validateGenerateBody } from './services/generate-scene.js';

export function buildApp(): FastifyInstance {
  const app = Fastify({ logger: true });
  const cache = createSceneCache(config.redisUrl);

  app.register(cors, {
    origin: config.corsOrigin,
    methods: ['GET', 'POST', 'OPTIONS'],
  });

  app.register(rateLimit, {
    max: 120,
    timeWindow: '1 minute',
  });

  app.get('/health', async () => ({
    status: 'ok',
    service: 'animagen-api',
    inference: config.inferenceUrl,
    cache: config.redisUrl ? 'redis' : 'memory',
  }));

  app.post('/api/generate', async (request, reply) => {
    try {
      const body = validateGenerateBody(request.body);
      const result = await generateScene(cache, body);
      return reply.send(result);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Generate failed';
      return reply.status(400).send({ error: message });
    }
  });

  app.addHook('onClose', async () => {
    await cache.close();
  });

  return app;
}
