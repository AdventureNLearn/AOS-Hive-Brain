# AOS Hive Brain

**Public system brief + interactive reasoning workspace** for AdventureNLearn / AOS.

> **North star:** Replication · Fidelity — **not** engagement.  
> **Class:** PUBLIC · OPSEC-clean · Human final call

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)

## What this is

Hive Brain is the living picture of the AOS control plane:

- **System brief** — purpose, layers, integrity kernel, public products
- **Clean seed pack** — markdown-only start kit for new build conversations
- **Interactive Hive** — 3D / map formations that make reasoning orchestration visible

This repository ships **public-safe** product and principle material only.  
See [`docs/OPSEC.md`](./docs/OPSEC.md) before adding content.

## Live demo

Interactive Hive workspace (when deployed): open `/hive` on your host.

Related:

- Frameworks: [AOS-Public](https://github.com/AdventureNLearn/AOS-Public)
- Educational tutor: [Grok-Tutor-AOS-Path](https://github.com/AdventureNLearn/Grok-Tutor-AOS-Path)

## Quick start

```bash
git clone https://github.com/AdventureNLearn/AOS-Hive-Brain.git
cd AOS-Hive-Brain
npm install
cp .env.example .env
# Optional no-auth local demo:
# echo 'VITE_AUTH_ENABLED=false' >> .env
npm run dev
```

App listens on **port 8080** by default.

```bash
npm run typecheck
npm run build
```

## Repository map

```text
docs/
  OPSEC.md              Public ship rules
  ARCHITECTURE.md       Surfaces + stack
  seed/                 Clean seed pack (markdown)
src/
  routes/               Brief (/) + Hive (/hive) + auth
  components/hive/      Three.js scene + workspace UI
  data/                 Universe nodes + seed content
  lib/                  Auth, ZIP, formations
public/                 Favicon + install assets
```

## Formation modes (Hive)

| Mode | Shape idea |
| --- | --- |
| Honeycomb | Clustered comb lattice |
| Mission Spine | Vertical frame → deliver tower |
| Integrity Triangle | Three-hub scrutiny |
| Claim Diamond | Claim / evidence eye |
| Sense → Reason → Build | Process pipeline |
| 4-Agent Lanes | Parallel agent S-curves |
| Field Helix | Spiral field chain |
| Star Burst | Core + radial burst |

Zoom works in **3D** and **map** views (wheel, pinch, buttons).

## Clean seed pack

| File | Role |
| --- | --- |
| `docs/seed/00-OPSEC-READ-FIRST.md` | Rules before any paste |
| `docs/seed/01-NEW-CHAT-SEED.md` | **Paste this** as message 1 in a new chat |
| `docs/seed/02-PLATFORM-BRIEF.md` | Public system brief |
| `docs/seed/03-START-HERE-CHECKLIST.md` | Checklist + inventory |
| `docs/seed/README-PACK.txt` | Pack purpose |

The in-app download builds the same files client-side (no server secret required).

## Integrity kernel

- Supported / Unproven / Disputed  
- Evidence / Inference / Assumption labeled  
- Primary records beat commentary  
- Multi-model agreement ≠ automatic truth  
- **Human final call** is non-negotiable  

## OPSEC summary

**In:** public purpose, principles, demo UI, seed markdown  
**Out:** private history, family material, operator runbooks, secrets, chat exports  

Full rules: [`docs/OPSEC.md`](./docs/OPSEC.md) · vulnerability process: [`SECURITY.md`](./SECURITY.md)

## License

MIT — see [LICENSE](./LICENSE).

---

**Motto:** REPLICATION · FIDELITY · HONEST WORK
