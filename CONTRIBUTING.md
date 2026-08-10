# Contributing

Thanks for helping improve **AOS Hive Brain**.

## Before you open a PR

1. Read [`docs/OPSEC.md`](./docs/OPSEC.md) — public-only material.
2. Do not commit `.env`, secrets, personal data, or operator inventories.
3. Prefer small, reviewable changes with a clear purpose.
4. Keep the north star: **replication + fidelity**, not engagement metrics.

## Local setup

```bash
npm install
cp .env.example .env   # optional; set VITE_AUTH_ENABLED=false for no-auth demo
npm run dev            # http://localhost:8080
npm run typecheck
npm run build
```

## Seed pack changes

If you edit the public seed:

- Update both `src/data/clean-seed.ts` **and** `docs/seed/*`
- Keep inventory lists faithful to files actually shipped
- No personal contact details in pack files

## Integrity language

Claims in docs and UI should stay honest:

- Supported / Unproven / Disputed  
- Human final call remains non-negotiable  
