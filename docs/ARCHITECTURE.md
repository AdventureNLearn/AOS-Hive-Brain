# Architecture (public)

## Surfaces

| Route | Purpose |
| --- | --- |
| `/` | Public system brief, integrity kernel, clean seed download |
| `/hive` | Interactive Hive workspace — 3D + map reasoning formations |
| `/login` | Optional federated auth (env-gated) |

## Stack

- React 19 + TypeScript
- Vite 8 + TanStack Start / Router / Query
- Tailwind CSS v4
- Three.js (Hive 3D scene)
- Better Auth + PGLite (local) / Postgres (deploy)
- Client-side ZIP for the clean seed pack (no server secrets)

## Hive formations

Eight orchestration modes with distinct geometries:

1. Honeycomb  
2. Mission Spine  
3. Integrity Triangle  
4. Claim Diamond  
5. Sense → Reason → Build  
6. 4-Agent Lanes  
7. Field Helix  
8. Star Burst  

Shared controls: orbit, zoom (wheel / pinch / buttons), 3D ↔ map toggle, play/pause reasoning flow.

## Data philosophy

- Public product code and principle-level content only
- No private research trees in the public UI
- Seed pack is markdown-only and OPSEC-audited

## Deploy notes

- Production build uses Nitro `vercel` preset (build-only; not active in dev)
- Inject `BETTER_AUTH_*`, `DATABASE_URL`, and `GROK_AUTH_*` via the host — never commit them
- `VITE_AUTH_ENABLED=false` runs the brief + Hive demo without OAuth
