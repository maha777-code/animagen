# Animagen

Production-grade web application that generates **3D animations from text prompts**.

## Architecture

- **Tier 1 (Browser)**: Rule-based prompt parser + procedural Three.js engine (~90% of requests)
- **Tier 2 (Self-hosted)**: vLLM / heuristic fallback for novel prompts → SceneSpec JSON only
- **Tier 3 (Animagen Pro)**: LTX-2 cinematic export — keyframe + compiled prompt → MP4 (GPU worker)

Interactive 3D preview and GLB export happen **client-side**. SceneSpec JSON is cached server-side. Cinematic export uses the optional LTX-2 worker.

## Monorepo Structure

```
animagen/
├── apps/
│   ├── web/          # Next.js 14 — Animagen Pro studio UI
│   ├── api/          # Fastify API gateway + cinematic jobs
│   ├── inference/    # Tier 2 spec enrichment worker
│   └── ltx-worker/   # Tier 3 LTX-2 render worker (optional GPU)
├── packages/
│   ├── scene-schema/ # Shared SceneSpec types + Zod validation
│   ├── parser/       # Rule-based prompt → SceneSpec
│   ├── engine/       # Procedural Three.js scene builder
│   └── director/     # Shot editor, templates, LTX prompt compiler
└── infra/            # Docker, k8s, k6 (Phase 6)
```

## Prerequisites

- Node.js ≥ 20
- pnpm ≥ 9

## Getting Started

```bash
pnpm install
pnpm build
pnpm test
```

## Development

```bash
pnpm dev          # All packages via Turbo
```

### Phase 5 — Tier 2 backend (recommended for best quality)

Terminal 1 — inference worker (Python, no GPU required in dev mode):

```bash
cd apps/inference
pip install -r requirements.txt
python worker.py
```

Terminal 2 — API gateway:

```bash
pnpm --filter @animagen/scene-schema build
pnpm --filter @animagen/parser build
pnpm --filter @animagen/api dev
```

Terminal 3 — web studio:

```bash
pnpm --filter @animagen/engine build
pnpm --filter @animagen/web dev
```

Open http://localhost:3000 — **Generate** uses Tier 1 parser when confidence is high; low-confidence prompts automatically use Tier 2 enhancement. Click **AI Enhance** to force Tier 2.

Optional Redis cache:

```bash
docker compose -f infra/docker-compose.dev.yml up redis inference api
```

Production LLM: set `VLLM_ENABLED=1` on the inference worker and point `VLLM_BASE_URL` at your vLLM server.

### Animagen Pro — Directed Animation Studio (Tier 3)

**Loop:** prompt → 3D preview → tweak shots → cinematic export (LTX-2)

Terminal 4 — LTX worker (dev mode works without GPU; saves keyframe + compiled prompt):

```bash
cd apps/ltx-worker
pip install -r requirements.txt
python worker.py
```

Build director package before API/web:

```bash
pnpm --filter @animagen/director build
```

Studio features at http://localhost:3000:

- **Template library** — education, previs, and motion design shot timelines
- **Shot editor** — per-shot camera, motion, path, effects, duration
- **Cinematic export** — sends Three.js keyframe + compiled LTX prompt to `apps/ltx-worker`

GPU production render: set `LTX_ENABLED=1` on the LTX worker and install `torch` + `diffusers` (see `apps/ltx-worker/render_engine.py`).

```bash
curl http://localhost:3001/api/cinematic/health
curl -X POST http://localhost:3001/api/cinematic/render \
  -H "Content-Type: application/json" \
  -d @fixtures/cinematic-request.json
```

Optional full stack:

```bash
docker compose -f infra/docker-compose.dev.yml up redis inference ltx-worker api
```

## Phase Status

| Phase | Description | Status |
|-------|-------------|--------|
| 1 | Monorepo scaffold + SceneSpec schema | ✅ |
| 2 | Rule-based parser + tests | ✅ |
| 3 | Procedural Three.js engine | ✅ |
| 4 | Web app (render, export, controls) | ✅ |
| 5 | Backend API + inference worker | ✅ |
| 6 | Infra (Docker, k8s, k6) | Pending |
| 7 | Animagen Pro — director + LTX-2 export | ✅ |

## SceneSpec

The core data contract between parser, LLM, and engine:

```typescript
interface SceneSpec {
  version: 1;
  seed: number;
  prompt: string;
  subjects: { type: string; color?: string; scale?: number; count?: number }[];
  environment: 'ocean' | 'forest' | 'desert' | 'space' | ...;
  lighting: { timeOfDay: string; mood: string };
  animations: { target: string; motion: string; speed: number; path?: string }[];
  camera: { movement: string; duration: number };
  effects: ('rain' | 'snow' | 'fog' | ...)[];
}
```

Validated at runtime with Zod in `@animagen/scene-schema`.

## License

Private — all rights reserved.
