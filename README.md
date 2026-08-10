# AOS Hive Brain

**Public system brief + interactive reasoning workspace** for AdventureNLearn / AOS.

> **Fixed rules:** Someone else can continue · Honest history — **not** popularity.  
> **Class:** PUBLIC · OPSEC-clean · Human decision  
> **Release:** **v0.2.0** · seed `2026-08-10-r02`

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)
[![Release](https://img.shields.io/badge/release-v0.2.0-violet.svg)](./CHANGELOG.md)
[![Credits](https://img.shields.io/badge/credits-contributors%20%26%20platforms-informational.svg)](./CREDITS.md)

## What this is

Hive Brain is the living picture of the AOS workshop:

- **System brief** — purpose, floors, honesty kernel, public products  
- **Clean seed pack** — markdown-only start kit for new build conversations  
- **Interactive Hive** — 3D / map **thinking shapes** that walk **written decisions**  

Readable by a careful **high-school senior** and a **senior engineer** at the same time.

This repository ships **public-safe** product and principle material only.  
See [`docs/OPSEC.md`](./docs/OPSEC.md) before adding content.

## What’s new in v0.2.0

| Feature | Why it matters |
| --- | --- |
| **5 rooms · 20 shapes** | Browse without overload |
| **Shorter / Fuller stories** | Deeper reasoning without drowning newcomers |
| **Story-step scrubber** | Jump anywhere in the checklist |
| **Node inspect during play** | Hover / pin / mobile **X** — one card at a time |
| **Decision substrate** | Record · link · conflict · human call · export |
| **Humanized language** | Floors · human decision · someone else can continue |

Full notes: [`docs/RELEASE-0.2.0.md`](./docs/RELEASE-0.2.0.md) · history: [`CHANGELOG.md`](./CHANGELOG.md)

**Older release archived:** [`archive/v0.1.0/`](./archive/v0.1.0/) (git tag `v0.1.0`).

## Live demo

Interactive Hive workspace (when deployed): open `/hive` on your host.

Related:

- Frameworks: [AOS-Public](https://github.com/AdventureNLearn/AOS-Public)  
- Educational tutor: [Grok-Tutor-AOS-Path](https://github.com/AdventureNLearn/Grok-Tutor-AOS-Path)  
- **Credits & guiding platforms:** [CREDITS.md](./CREDITS.md)  

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
archive/                Older public releases (honest history)
docs/
  OPSEC.md              Public ship rules
  ARCHITECTURE.md       Surfaces + stack
  DECISION-SCHEMA.md    Decision graph in plain English
  RELEASE-0.2.0.md      This release
  seed/                 Clean seed pack (markdown)
src/
  routes/               Brief (/) + Hive (/hive) + auth
  components/hive/      Three.js scene + workspace UI
  data/                 Universe nodes + seed content
  lib/decision/         Schema · store · shape chains
public/                 Favicon + install assets
CREDITS.md              Contributors + guiding platforms
CHANGELOG.md            Release history
```

## Rooms & shapes (v0.2.0)

| Room | Plain idea | Example shapes |
| --- | --- | --- |
| **Orient** | Look around first | Honeycomb · Floor stack · Welcome path · Map atlas |
| **Integrity** | Say how you know | Integrity triangle · Claim diamond · Source trail · Honest gap |
| **Mission** | Finish one honest job | Mission path · Look→Think→Build · Ship gate · Save the chapter |
| **Coordinate** | Share carefully | Four roles · Share gate · Real links only · Fresh eyes |
| **Surface** | What the public sees | Learning spiral · Star · Civic map · Learning path |

Play walks the **main storyline** only. Download the decision record for side drafts.

## Clean seed pack

| File | Role |
| --- | --- |
| `docs/seed/00-OPSEC-READ-FIRST.md` | Rules before any paste |
| `docs/seed/01-NEW-CHAT-SEED.md` | **Paste this** as message 1 in a new chat |
| `docs/seed/02-PLATFORM-BRIEF.md` | Public system brief |
| `docs/seed/03-START-HERE-CHECKLIST.md` | Checklist + inventory |
| `docs/seed/README-PACK.txt` | Pack purpose |

The in-app download builds the same files client-side (no server secret required).

## Honesty kernel

- Supported / Unproven / Disputed / Human decision  
- Evidence / careful guess / assumption labeled  
- Original records beat second-hand commentary  
- Multi-tool agreement ≠ automatic truth  
- **Human decision** is non-negotiable and written down  

## OPSEC summary

**In:** public purpose, principles, demo UI, seed markdown  
**Out:** private history, family material, operator runbooks, secrets, chat exports  

Full rules: [`docs/OPSEC.md`](./docs/OPSEC.md) · vulnerability process: [`SECURITY.md`](./SECURITY.md)

## Credits

Steward, contributors, and **guiding platforms** (with honest “not powered by” boundaries):  
→ **[CREDITS.md](./CREDITS.md)**

## License

MIT — see [LICENSE](./LICENSE).

---

**Motto:** SOMEONE ELSE CAN CONTINUE · HONEST HISTORY · HONEST WORK
