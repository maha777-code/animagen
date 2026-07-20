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
});
