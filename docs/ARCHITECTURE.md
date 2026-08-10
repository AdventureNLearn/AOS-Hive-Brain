# Architecture (public)

Written for builders who may not live in frameworks all day.

**Release 0.2.0** — 20 shapes · 5 rooms · shorter/fuller stories · node inspect during play · humanized copy.

## Surfaces

| Route | What you see |
| --- | --- |
| `/` | Public system brief — purpose, integrity, eight shapes, clean seed |
| `/hive` | Interactive Hive — 3D + map thinking shapes with decision playback |
| `/login` | Optional sign-in (only if auth env is turned on) |

## Stack (short)

- React + TypeScript UI
- Vite + TanStack Start routing
- Tailwind for styling
- Three.js for the 3D Hive scene
- Optional auth + local/Postgres database
- In-memory decision graphs for every formation (`src/lib/decision/`)

## Eight formations (all decision-backed)

| Shape | Plain-language idea |
| --- | --- |
| Honeycomb | Look around first |
| Mission Spine | One mission to ship (includes a conflict demo) |
| Integrity Triangle | Evidence / Inference / Assumption |
| Claim Diamond | Supported / Unproven / Disputed / Human call |
| Sense → Reason → Build | Look, think, then build |
| 4-Agent Lanes | Parallel roles, one honest merge |
| Field Helix | Observe → claim → talk → progress |
| Star Burst | One integrity core, public product rays |

PLAY on any shape replays a recorded decision chain (question → choice → status → optional human sign-off).

## Decision substrate

| File | Role |
| --- | --- |
| `docs/DECISION-SCHEMA.md` | One-page schema in plain English |
| `src/lib/decision/schema.ts` | Types |
| `src/lib/decision/store.ts` | Record, link, conflict, human call, export |
| `src/lib/decision/formation-graphs.ts` | Demo graphs for all eight shapes |

**Pattern-only.** Inspired by decision-intelligence graphs. Not a full knowledge-graph platform. Not auto-truth. Human final call is a recorded event.

## Deploy notes

- Production build targets Vercel (Nitro preset, build-only)
- Put secrets in the host environment — never in the repo
- `VITE_AUTH_ENABLED=false` runs the brief + Hive without OAuth
