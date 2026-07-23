import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import Fastify, { type FastifyInstance } from 'fastify';
import { createSceneCache } from './cache/scene-cache.js';
import { checkLtxHealth } from './clients/ltx-client.js';
import { config } from './config.js';
import { getCinematicJob, startCinematicRender, validateCinematicBody } from './services/cinematic-render.js';
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
    ltxWorker: config.ltxWorkerUrl,
    cache: config.redisUrl ? 'redis' : 'memory',
  }));

  app.get('/api/cinematic/health', async () => {
    const ltx = await checkLtxHealth(config.ltxWorkerUrl);
    return { ok: ltx.ok, ltx_enabled: ltx.ltx_enabled, worker: config.ltxWorkerUrl };
  });

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

  app.post('/api/cinematic/render', async (request, reply) => {
    try {
      const body = validateCinematicBody(request.body);
      const job = await startCinematicRender(body);
      return reply.send(job);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Cinematic render failed';
      return reply.status(400).send({ error: message });
    }
  });

  app.get('/api/cinematic/jobs/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const job = await getCinematicJob(id);
    if (!job) return reply.status(404).send({ error: 'Job not found' });
    return reply.send(job);
  });

  app.addHook('onClose', async () => {
    await cache.close();
  });

  return app;
}
