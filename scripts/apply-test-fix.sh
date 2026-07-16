#!/usr/bin/env bash
# Creates missing Phase 1 test scaffolding. Run from repo root:
#   bash scripts/apply-test-fix.sh

set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

mkdir -p packages/parser/src packages/engine/src apps/api/src

# --- parser ---
cat > packages/parser/vitest.config.ts <<'EOF'
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: false,
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
});
EOF

cat > packages/parser/src/index.test.ts <<'EOF'
import { describe, expect, it } from 'vitest';
import { parsePrompt } from './index.js';

describe('@animagen/parser scaffold', () => {
  it('exports parsePrompt (Phase 2 placeholder)', () => {
    expect(typeof parsePrompt).toBe('function');
    expect(() => parsePrompt('a red dragon flying')).toThrow(/Phase 2/);
  });
});
EOF

# --- engine ---
cat > packages/engine/vitest.config.ts <<'EOF'
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: false,
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
});
EOF

cat > packages/engine/src/index.test.ts <<'EOF'
import { createDefaultSceneSpec } from '@animagen/scene-schema';
import { describe, expect, it } from 'vitest';
import { buildSceneFromSpec } from './index.js';

describe('@animagen/engine scaffold', () => {
  it('exports buildSceneFromSpec (Phase 3 placeholder)', () => {
    const spec = createDefaultSceneSpec({ prompt: 'test scene', seed: 1 });
    expect(typeof buildSceneFromSpec).toBe('function');
    expect(() => buildSceneFromSpec(spec)).toThrow(/Phase 3/);
  });
});
EOF

# --- api ---
cat > apps/api/vitest.config.ts <<'EOF'
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: false,
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
});
EOF

cat > apps/api/src/app.ts <<'EOF'
import Fastify from 'fastify';
import { createDefaultSceneSpec } from '@animagen/scene-schema';

export function buildApp() {
  const app = Fastify({ logger: false });

  app.get('/health', async () => ({ status: 'ok', service: 'animagen-api' }));

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
EOF

cat > apps/api/src/index.ts <<'EOF'
import { buildApp } from './app.js';

const app = buildApp();

const port = Number(process.env.PORT ?? 3001);
const host = process.env.HOST ?? '0.0.0.0';

app.listen({ port, host }).catch((err) => {
  app.log.error(err);
  process.exit(1);
});
EOF

cat > apps/api/src/app.test.ts <<'EOF'
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
EOF

echo "Test scaffolding written. Run: pnpm test"
