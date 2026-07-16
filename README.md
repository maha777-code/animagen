# Animagen

Production-grade web application that generates **3D animations from text prompts**.

## Architecture

- **Tier 1 (Browser)**: Rule-based prompt parser + procedural Three.js engine (~90% of requests)
- **Tier 2 (Self-hosted)**: vLLM fallback for novel prompts → SceneSpec JSON only (never executes model code)

All rendering, video export, and GLB export happen **client-side**. Servers are stateless and cache SceneSpec JSON.

## Monorepo Structure

```
animagen/
├── apps/
│   ├── web/          # Next.js 14 (App Router) + R3F + Tailwind
│   ├── api/          # Fastify API gateway
│   └── inference/    # Python vLLM GPU workers
├── packages/
│   ├── scene-schema/ # Shared SceneSpec types + Zod validation
│   ├── parser/       # Rule-based prompt → SceneSpec
│   └── engine/       # Procedural Three.js scene builder
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

## Phase Status

| Phase | Description | Status |
|-------|-------------|--------|
| 1 | Monorepo scaffold + SceneSpec schema | ✅ |
| 2 | Rule-based parser + tests | ✅ |
| 3 | Procedural Three.js engine | ✅ |
| 4 | Web app (render, export, controls) | ✅ |
| 5 | Backend API + vLLM worker | Pending |
| 6 | Infra (Docker, k8s, k6) | Pending |

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
