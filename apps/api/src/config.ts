export const config = {
  port: Number(process.env.PORT ?? 3001),
  host: process.env.HOST ?? '0.0.0.0',
  redisUrl: process.env.REDIS_URL ?? '',
  inferenceUrl: process.env.INFERENCE_URL ?? 'http://localhost:8000',
  ltxWorkerUrl: process.env.LTX_WORKER_URL ?? 'http://localhost:8010',
  cacheTtlSec: Number(process.env.CACHE_TTL_SEC ?? 86400),
  parserConfidenceThreshold: Number(process.env.PARSER_CONFIDENCE_THRESHOLD ?? 0.35),
  corsOrigin: process.env.CORS_ORIGIN ?? 'http://localhost:3000',
} as const;
