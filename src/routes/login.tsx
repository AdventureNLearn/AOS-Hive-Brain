import { createFileRoute, Link } from "@tanstack/react-router";
import { GROK_PROVIDERS, authEnabled, signIn } from "@/lib/auth/client";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/login")({ component: LoginPage });

function LoginPage() {
  return (
    <main className="grid min-h-dvh place-items-center px-4 py-16">
      <div className="w-full max-w-sm space-y-6 rounded-xl border border-border bg-bg-elevated p-6 shadow-panel">
        <div className="space-y-2">
          <p className="text-xs font-medium tracking-wide text-fg-subtle uppercase">
            AdventureNLearn
          </p>
          <h1 className="text-xl font-semibold tracking-tight text-fg">Sign in</h1>
          <p className="text-sm text-fg-muted leading-relaxed">
            Optional account access. The public system brief does not require sign-in.
          </p>
        </div>

        {authEnabled ? (
          <div className="space-y-2">
            {GROK_PROVIDERS.map((p) => (
              <button
                key={p.providerId}
                type="button"
                onClick={() => signIn(p.providerId, { callbackURL: "/" })}
                className="focus-ring w-full rounded-md border border-border bg-bg-subtle px-4 py-2.5 text-sm font-medium text-fg transition-colors hover:border-border-strong hover:bg-chip"
              >
                Continue with {p.label}
              </button>
            ))}
          </div>
        ) : (
          <p className="text-sm text-fg-muted">Sign-in is disabled in this environment.</p>
        )}

        <Link
          to="/"
          className="focus-ring inline-flex items-center gap-2 text-sm text-fg-muted transition-colors hover:text-fg"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Back to system brief
        </Link>
      </div>
    </main>
  );
}
