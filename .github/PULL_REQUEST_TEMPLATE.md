## Summary


## OPSEC checklist
- [ ] No secrets, tokens, or `.env` values
- [ ] No private history / family / operator surface material
- [ ] Seed inventory still matches `docs/seed/` if pack files changed
- [ ] Public-safe language only

## Test plan
- [ ] `npm run typecheck`
- [ ] `npm run build` (if code changed)
- [ ] Manual check of `/` and `/hive` if UI touched
