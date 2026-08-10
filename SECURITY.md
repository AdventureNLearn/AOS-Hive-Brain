# Security Policy

## Supported versions

This public repository ships the **AOS Hive Brain** system brief and interactive demo.
Security fixes are accepted on the default branch (`main`).

## Reporting a vulnerability

Please open a **private security advisory** on GitHub, or contact the maintainers through
the GitHub account [@AdventureNLearn](https://github.com/AdventureNLearn).

Do **not** open a public issue that includes secrets, personal data, or exploit details.

## What this repo must never contain

- OAuth client secrets, API keys, session tokens, or database URLs
- Personal email addresses, legal names, or re-identifying biography
- Private family material or primary-source dumps
- Operator runbooks, port maps, gate inventories, or internal path maps
- Municipality product samples used as fixtures
- Prior chat exports

If you find any of the above in this tree, open a security advisory immediately.

## Local secrets

Copy `.env.example` → `.env` and inject credentials only on your machine or CI secrets store.
