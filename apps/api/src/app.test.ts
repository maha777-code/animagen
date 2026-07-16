import { describe, expect, it } from 'vitest';
import { buildApp } from './app.js';

describe('@animagen/api scaffold', () => {
  it('GET /health returns ok', async () => {
    const app = buildApp();
    const response = await app.inject({ method: 'GET', url: '/health' });
    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ status: 'ok', service: 'animagen-api' });
  });

  it('POST /api/generate returns placeholder SceneSpec', async () => {
    const app = buildApp();
    const response = await app.inject({
      method: 'POST',
      url: '/api/generate',
      payload: { prompt: 'a dragon flying' },
    });
    expect(response.statusCode).toBe(200);
    const body = response.json() as { status: string; spec: { prompt: string } };
    expect(body.status).toBe('not_implemented');
    expect(body.spec.prompt).toBe('a dragon flying');
  });
});
