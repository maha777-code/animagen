import { describe, expect, it } from 'vitest';
import { buildApp } from './app.js';

describe('@animagen/api', () => {
  it('GET /health returns ok', async () => {
    const app = buildApp();
    const response = await app.inject({ method: 'GET', url: '/health' });
    expect(response.statusCode).toBe(200);
    const body = response.json() as { status: string; service: string };
    expect(body.status).toBe('ok');
    expect(body.service).toBe('animagen-api');
  });

  it('POST /api/generate returns enriched parser spec for dragon prompt', async () => {
    const app = buildApp();
    const response = await app.inject({
      method: 'POST',
      url: '/api/generate',
      payload: { prompt: 'a red dragon flying over the ocean at sunset' },
    });
    expect(response.statusCode).toBe(200);
    const body = response.json() as {
      tier: string;
      spec: { subjects: { type: string }[]; environment: string };
      confidence: number;
    };
    expect(['cache', 'parser', 'enhanced', 'llm']).toContain(body.tier);
    expect(body.spec.subjects.length).toBeGreaterThan(0);
    expect(body.spec.subjects[0]?.type).toBe('dragon');
    expect(body.confidence).toBeGreaterThan(0.3);
  });

  it('POST /api/generate rejects empty prompt', async () => {
    const app = buildApp();
    const response = await app.inject({
      method: 'POST',
      url: '/api/generate',
      payload: { prompt: '   ' },
    });
    expect(response.statusCode).toBe(400);
  });

  it('POST /api/generate with forceLlm uses separate cache from parser', async () => {
    const app = buildApp();
    const payload = { prompt: 'a red dragon flying over the ocean at sunset', seed: 42 };

    const parserRes = await app.inject({
      method: 'POST',
      url: '/api/generate',
      payload,
    });
    expect(parserRes.statusCode).toBe(200);
    const parserBody = parserRes.json() as { tier: string; spec: { metadata?: { source?: string } } };
    expect(parserBody.tier).toBe('parser');
    expect(parserBody.spec.metadata?.source).toBe('parser');

    const enhanceRes = await app.inject({
      method: 'POST',
      url: '/api/generate',
      payload: { ...payload, forceLlm: true },
    });
    expect(enhanceRes.statusCode).toBe(200);
    const enhanceBody = enhanceRes.json() as {
      tier: string;
      spec: { metadata?: { source?: string } };
    };
    expect(enhanceBody.tier).not.toBe('cache');
    expect(['enhanced', 'llm']).toContain(enhanceBody.tier);
    expect(enhanceBody.spec.metadata?.source).not.toBe('parser');
  });
});
