import { Link } from "@tanstack/react-router";
import { Hexagon } from "lucide-react";
import { SignedIn, SignedOut, UserButton } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";

const nav = [
  { href: "#north-star", label: "North star" },
  { href: "#shapes", label: "Shapes" },
  { href: "#integrity", label: "Integrity" },
  { href: "#seed", label: "Clean seed" },
] as const;

export function SiteHeader() {
  const { user, isPending } = useCurrentUserState();

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-bg/75 backdrop-blur-xl pt-[var(--grok-banner-h,0px)]">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <a href="#top" className="focus-ring flex min-w-0 items-center gap-2.5 rounded-sm">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-md border border-glow-violet/40 bg-bg-elevated shadow-[0_0_20px_-6px_var(--color-glow-violet)]">
            <Hexagon className="size-4 text-accent" strokeWidth={1.75} aria-hidden />
          </span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-semibold tracking-tight text-fg">
              Hive Brain
            </span>
            <span className="hidden truncate text-[11px] text-fg-subtle sm:block">
              AOS · Public system brief
            </span>
          </span>
        </a>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Section navigation">
          {nav.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="focus-ring rounded-sm px-2.5 py-1.5 text-xs font-medium text-fg-muted transition-colors hover:text-fg"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            to="/hive"
            className="focus-ring inline-flex min-h-10 items-center rounded-md border border-accent/40 bg-accent/15 px-3 py-1.5 text-xs font-medium text-fg shadow-[0_0_24px_-10px_var(--color-glow-violet)]"
          >
            Live Hive
          </Link>
          {isPending ? (
            <div className="size-8 animate-pulse rounded-full bg-bg-subtle" aria-hidden />
          ) : user ? (
            <SignedIn>
              <UserButton />
            </SignedIn>
          ) : (
            <SignedOut>
              <Link
                to="/login"
                className="focus-ring rounded-md px-2.5 py-1.5 text-xs font-medium text-fg-muted hover:text-fg"
              >
                Sign in
              </Link>
            </SignedOut>
          )}
        </div>
      </div>
    </header>
  );
}
