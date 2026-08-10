/**
 * Live-preview OAuth client placeholders (server-only — NEVER import from the client).
 *
 * PUBLIC RELEASE: no client secrets are shipped in this repository.
 * Set GROK_AUTH_CLIENT_ID / GROK_AUTH_CLIENT_SECRET (deployed) or
 * GROK_PREVIEW_CLIENT_ID / GROK_PREVIEW_CLIENT_SECRET (local preview) via environment.
 * Auth falls back to disabled/dev behavior when secrets are absent.
 */
export const PREVIEW_CLIENT_ID =
  process.env.GROK_PREVIEW_CLIENT_ID ?? process.env.GROK_AUTH_CLIENT_ID ?? "grok_preview";

/** Empty by design in the public tree — inject via env for real OAuth. */
export const PREVIEW_CLIENT_SECRET =
  process.env.GROK_PREVIEW_CLIENT_SECRET ?? process.env.GROK_AUTH_CLIENT_SECRET ?? "";

/** Shared auth broker issuer (OIDC discovery lives under it). Override with GROK_AUTH_ISSUER. */
export const GROK_ISSUER_DEFAULT = "https://auth.grok.me";

/**
 * Host patterns whose callbacks a preview client may accept (wildcard-matched).
 * Deployed apps should set BETTER_AUTH_URL and GROK_AUTH_* instead.
 */
export const PREVIEW_ALLOWED_HOSTS = ["*.grok-sandbox.com"] as const;
