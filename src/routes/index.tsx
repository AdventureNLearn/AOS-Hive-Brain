import type { ComponentType } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Archive,
  BookOpen,
  Brain,
  Building2,
  CheckCircle2,
  Compass,
  EyeOff,
  Layers,
  Map,
  Scale,
  Shield,
  Sparkles,
  Target,
  XCircle,
  Box,
} from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SeedDownloadPanel } from "@/components/seed-download";
import { HiveGraph } from "@/components/hive-graph";
import { SEED_PACK_VERSION } from "@/data/clean-seed";

export const Route = createFileRoute("/")({ component: HomePage });

const layers = [
  {
    icon: Compass,
    title: "Control plane",
    body: "Purpose and product discipline in one place — AOS holds the workshop law.",
    tone: "violet",
  },
  {
    icon: Layers,
    title: "Knowledge (Hive)",
    body: "Sources become linked knowledge that compounds. Wiki over chat amnesia.",
    tone: "cyan",
  },
  {
    icon: Brain,
    title: "Reasoning",
    body: "Structured scrutiny. Models assist; they do not crown truth.",
    tone: "blue",
  },
  {
    icon: Building2,
    title: "Public products",
    body: "Civic suite and Educational Tutor — plain language, public-safe surfaces.",
    tone: "mint",
  },
  {
    icon: EyeOff,
    title: "Private research",
    body: "Experiments stay fenced until deliberately promoted. Not silent production.",
    tone: "rose",
  },
  {
    icon: Archive,
    title: "Archive",
    body: "Finished eras freeze for fidelity. History is not polished into fiction.",
    tone: "amber",
  },
] as const;

const toneRing: Record<(typeof layers)[number]["tone"], string> = {
  violet: "border-glow-violet/35 shadow-[0_0_28px_-12px_var(--color-glow-violet)]",
  cyan: "border-glow-cyan/35 shadow-[0_0_28px_-12px_var(--color-glow-cyan)]",
  blue: "border-glow-blue/35 shadow-[0_0_28px_-12px_var(--color-glow-blue)]",
  mint: "border-glow-mint/35 shadow-[0_0_28px_-12px_var(--color-glow-mint)]",
  rose: "border-glow-rose/35 shadow-[0_0_28px_-12px_var(--color-glow-rose)]",
  amber: "border-glow-amber/35 shadow-[0_0_28px_-12px_var(--color-glow-amber)]",
};

const toneIcon: Record<(typeof layers)[number]["tone"], string> = {
  violet: "text-glow-violet",
  cyan: "text-glow-cyan",
  blue: "text-glow-blue",
  mint: "text-glow-mint",
  rose: "text-glow-rose",
  amber: "text-glow-amber",
};

const principles = [
  "Replication over engagement",
  "Fidelity over narrative polish",
  "One integrity framework for every builder",
  "Separate control plane from products people use",
  "Keep public products free of private theater",
  "Ship nothing from tokens alone",
] as const;

const notList = [
  "Not an engagement farm or content theater",
  "Not an auto-truth engine",
  "Not silent parallel production of every experiment",
  "Not operator-runbook publishing",
  "Not finished by token spend or traction",
] as const;

const success = [
  "Could another team continue this from the record?",
  "Does the record stay honest?",
  "Are public tools clear and free of private theater?",
  "Were engagement metrics never used as the ship criterion?",
] as const;

const integrity = [
  { label: "Supported", hint: "Backed by primary record", tone: "mint" as const },
  { label: "Unproven", hint: "Open; do not overclaim", tone: "amber" as const },
  { label: "Disputed", hint: "Conflict remains visible", tone: "rose" as const },
];

function HomePage() {
  return (
    <div id="top" className="starfield min-h-dvh text-fg">
      <SiteHeader />

      <main>
        <section className="relative overflow-hidden border-b border-border/60">
          <div className="relative mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-[1.05fr_1fr] lg:items-center lg:gap-6 lg:py-20">
            <div className="relative z-10 max-w-xl space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-success/30 bg-success/10 px-3 py-1 text-[11px] font-medium tracking-wide text-success uppercase">
                <span className="size-1.5 rounded-full bg-success shadow-[0_0_8px_var(--color-success)]" />
                AdventureNLearn · AOS control plane
              </div>
              <h1 className="text-balance text-4xl font-semibold tracking-tight text-fg text-glow sm:text-5xl lg:text-[3.35rem] lg:leading-[1.08]">
                Hive Brain
                <span className="mt-2 block text-[0.52em] font-medium tracking-normal text-fg-muted sm:text-[0.48em]">
                  Public system brief · interactive reasoning demo
                </span>
              </h1>
              <p className="max-w-lg text-base leading-relaxed text-fg-muted sm:text-lg">
                A workshop that builds public tools for civic learning and craft education,
                while protecting private research. Watch active reasoning play through
                formation modes — or download the clean seed for a new Grok Build chat.
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <Link
                  to="/hive"
                  className="focus-ring inline-flex h-11 items-center justify-center gap-2 rounded-md bg-accent px-5 text-sm font-medium text-accent-fg shadow-[0_0_32px_-8px_var(--color-glow-violet)] transition-opacity hover:opacity-90 active:scale-[0.98]"
                >
                  <Box className="size-4" aria-hidden />
                  Open interactive Hive
                </Link>
                <a
                  href="#seed"
                  className="focus-ring inline-flex h-11 items-center justify-center rounded-md border border-border-strong/80 bg-bg-elevated/70 px-5 text-sm font-medium text-fg backdrop-blur-sm transition-colors hover:border-accent/40 hover:bg-bg-subtle active:scale-[0.98]"
                >
                  Download clean seed
                </a>
              </div>
              <dl className="flex flex-wrap gap-x-6 gap-y-2 pt-1 text-xs text-fg-subtle">
                <div className="flex gap-2">
                  <dt className="font-medium text-fg-muted">Class</dt>
                  <dd>PUBLIC</dd>
                </div>
                <div className="flex gap-2">
                  <dt className="font-medium text-fg-muted">Demo</dt>
                  <dd>8 formation modes · live reasoning</dd>
                </div>
                <div className="flex gap-2">
                  <dt className="font-medium text-fg-muted">Seed</dt>
                  <dd>{SEED_PACK_VERSION}</dd>
                </div>
              </dl>
            </div>

            <div className="relative mx-auto w-full max-w-xl lg:max-w-none">
              <div className="pointer-events-none absolute -inset-6 rounded-full bg-[radial-gradient(circle,rgb(139_92_246/0.2),transparent_68%)]" />
              <HiveGraph className="aspect-[8/5] w-full" />
              <div className="relative z-10 -mt-2 text-center">
                <p className="text-[11px] font-medium tracking-[0.2em] text-accent uppercase">
                  Hive Brain
                </p>
                <p className="mt-1 text-sm font-semibold text-fg text-glow sm:text-base">
                  Replication · Fidelity · Honest work
                </p>
                <Link
                  to="/hive"
                  className="focus-ring mt-3 inline-flex text-xs font-medium text-glow-cyan underline-offset-4 hover:underline"
                >
                  Enter the live 3D workspace →
                </Link>
              </div>
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-6xl space-y-16 px-4 py-14 sm:px-6 sm:py-20">
          <section id="north-star" className="scroll-mt-20 space-y-8" aria-labelledby="ns-h">
            <SectionHead icon={Target} kicker="Non-negotiable" title="North star" id="ns-h" />
            <div className="grid gap-4 md:grid-cols-3">
              <PrincipleCard
                title="Replication"
                body="Another competent builder should be able to continue from the record."
              />
              <PrincipleCard
                title="Fidelity"
                body="Finished work freezes; claims stay honest; history is not polished into fiction."
              />
              <PrincipleCard
                title="Not engagement"
                body="Not optimized for likes, dwell time, virality, or attention metrics."
                muted
              />
            </div>
          </section>

          <section id="layers" className="scroll-mt-20 space-y-8" aria-labelledby="layers-h">
            <SectionHead icon={Layers} kicker="Rooms in one building" title="System layers" id="layers-h" />
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {layers.map((layer, i) => (
                <article
                  key={layer.title}
                  className={`glass-panel rounded-lg p-5 ${toneRing[layer.tone]}`}
                >
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <span className="flex size-9 items-center justify-center rounded-md border border-border bg-bg-subtle">
                      <layer.icon className={`size-4 ${toneIcon[layer.tone]}`} aria-hidden />
                    </span>
                    <span className="font-mono text-[11px] text-fg-subtle">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold text-fg">{layer.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-fg-muted">{layer.body}</p>
                </article>
              ))}
            </div>
          </section>

          <section id="products" className="scroll-mt-20 space-y-8" aria-labelledby="products-h">
            <SectionHead icon={BookOpen} kicker="What ships publicly" title="Public products" id="products-h" />
            <div className="grid gap-4 md:grid-cols-2">
              <article className="glass-panel rounded-xl border-glow-mint/25 p-6 shadow-[0_0_40px_-18px_var(--color-glow-mint)] sm:p-8">
                <div className="mb-4 flex size-10 items-center justify-center rounded-md border border-glow-mint/30 bg-bg-subtle">
                  <Map className="size-5 text-glow-mint" aria-hidden />
                </div>
                <h3 className="text-lg font-semibold tracking-tight text-fg">Civic suite</h3>
                <p className="mt-2 text-sm leading-relaxed text-fg-muted">
                  Map-style tools for claims and jobsite-style surfaces. Public-facing UI stays
                  plain and educational.
                </p>
              </article>
              <article className="glass-panel rounded-xl border-glow-amber/25 p-6 shadow-[0_0_40px_-18px_var(--color-glow-amber)] sm:p-8">
                <div className="mb-4 flex size-10 items-center justify-center rounded-md border border-glow-amber/30 bg-bg-subtle">
                  <Sparkles className="size-5 text-glow-amber" aria-hidden />
                </div>
                <h3 className="text-lg font-semibold tracking-tight text-fg">Educational Tutor</h3>
                <p className="mt-2 text-sm leading-relaxed text-fg-muted">
                  Craft learning in plain language. Success is understanding that transfers — not
                  time-on-page theater.
                </p>
              </article>
            </div>
          </section>

          <section id="integrity" className="scroll-mt-20 space-y-8" aria-labelledby="integrity-h">
            <SectionHead icon={Scale} kicker="Always" title="Integrity kernel" id="integrity-h" />
            <div className="grid gap-3 sm:grid-cols-3">
              {integrity.map((item) => (
                <div
                  key={item.label}
                  className={`glass-panel rounded-lg px-4 py-5 text-center ${toneRing[item.tone]}`}
                >
                  <p className="text-base font-semibold tracking-tight text-fg">{item.label}</p>
                  <p className="mt-1 text-xs text-fg-muted">{item.hint}</p>
                </div>
              ))}
            </div>
            <ul className="grid gap-2 sm:grid-cols-2">
              {[
                "Evidence / Inference / Assumption labeled",
                "Primary records beat commentary",
                "Multi-model agreement ≠ automatic truth",
                "Human final call is non-negotiable",
                "Prefer honest incomplete state over confident fiction",
                "Attention is not a truth signal",
              ].map((line) => (
                <li
                  key={line}
                  className="flex items-start gap-2.5 rounded-md border border-border/80 bg-bg-elevated/60 px-3 py-2.5 text-sm text-fg-muted backdrop-blur-sm"
                >
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" aria-hidden />
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </section>

          <div className="grid gap-8 lg:grid-cols-2">
            <section className="space-y-5" aria-labelledby="principles-h">
              <SectionHead icon={Shield} kicker="Discipline" title="Principles" id="principles-h" />
              <ol className="space-y-2">
                {principles.map((p, i) => (
                  <li
                    key={p}
                    className="glass-panel flex items-start gap-3 rounded-lg px-4 py-3 text-sm text-fg"
                  >
                    <span className="font-mono text-[11px] text-accent tabular-nums">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    {p}
                  </li>
                ))}
              </ol>
            </section>
            <section className="space-y-5" aria-labelledby="not-h">
              <SectionHead icon={XCircle} kicker="Boundaries" title="What it is not" id="not-h" />
              <ul className="space-y-2">
                {notList.map((line) => (
                  <li
                    key={line}
                    className="glass-panel flex items-start gap-2.5 rounded-lg px-4 py-3 text-sm text-fg-muted"
                  >
                    <XCircle className="mt-0.5 size-4 shrink-0 text-fg-subtle" aria-hidden />
                    {line}
                  </li>
                ))}
              </ul>
            </section>
          </div>

          <section className="space-y-6" aria-labelledby="success-h">
            <SectionHead icon={CheckCircle2} kicker="Ship criteria" title="How to judge success" id="success-h" />
            <div className="grid gap-3 sm:grid-cols-2">
              {success.map((q) => (
                <blockquote
                  key={q}
                  className="glass-panel rounded-lg px-5 py-4 text-sm leading-relaxed text-fg"
                >
                  {q}
                </blockquote>
              ))}
            </div>
          </section>

          <SeedDownloadPanel />

          <section
            id="checklist"
            className="glass-panel scroll-mt-20 rounded-xl p-5 sm:p-8"
            aria-labelledby="check-h"
          >
            <SectionHead
              icon={CheckCircle2}
              kicker="New Grok Build"
              title="Start-here checklist"
              id="check-h"
            />
            <ul className="mt-6 space-y-3">
              {[
                "New conversation only (do not continue old thread)",
                "Paste 01-NEW-CHAT-SEED.md as message 1",
                "Confirm agent restates: replication + fidelity, not engagement",
                "Give one concrete public-safe build request",
                "Refuse re-import of private history or ops inventories into public UI",
                "Ship = live product / tagged release / written decision — not token spend",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-fg-muted">
                  <span
                    className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-sm border border-accent/30 bg-bg"
                    aria-hidden
                  />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </main>

      <footer className="border-t border-border/60 bg-bg/50 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <p className="text-sm font-medium text-fg">AdventureNLearn · AOS · Hive Brain</p>
            <p className="mt-1 text-xs text-fg-subtle">
              Public system brief + interactive demo · OPSEC clean · {SEED_PACK_VERSION}
            </p>
          </div>
          <Link to="/hive" className="text-xs font-medium text-accent hover:underline">
            Open interactive Hive →
          </Link>
        </div>
      </footer>
    </div>
  );
}

function SectionHead({
  icon: Icon,
  kicker,
  title,
  id,
}: {
  icon: ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  kicker: string;
  title: string;
  id: string;
}) {
  return (
    <div className="space-y-2">
      <p className="inline-flex items-center gap-2 text-xs font-medium tracking-[0.12em] text-accent uppercase">
        <Icon className="size-3.5" aria-hidden />
        {kicker}
      </p>
      <h2 id={id} className="text-2xl font-semibold tracking-tight text-fg sm:text-3xl">
        {title}
      </h2>
    </div>
  );
}

function PrincipleCard({
  title,
  body,
  muted,
}: {
  title: string;
  body: string;
  muted?: boolean;
}) {
  return (
    <article
      className={
        muted
          ? "rounded-lg border border-border/80 bg-bg/50 px-5 py-6 backdrop-blur-sm"
          : "glass-panel rounded-lg px-5 py-6 shadow-[0_0_36px_-16px_var(--color-glow-violet)]"
      }
    >
      <h3 className="text-base font-semibold tracking-tight text-fg">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-fg-muted">{body}</p>
    </article>
  );
}
