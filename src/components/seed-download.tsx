import { useMemo, useState } from "react";
import {
  Check,
  Copy,
  Download,
  FileText,
  ShieldCheck,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  SEED_FILES,
  SEED_PACK_VERSION,
  SEED_ZIP_NAME,
  SEED_CLASS,
} from "@/data/clean-seed";
import { buildZipBlob, downloadBlob } from "@/lib/zip-store";
import { cn } from "@/lib/utils";

export function SeedDownloadPanel() {
  const [active, setActive] = useState(
    () => SEED_FILES.find((f) => f.pasteTarget)?.name ?? SEED_FILES[0]!.name,
  );
  const [copied, setCopied] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  const activeFile = useMemo(
    () => SEED_FILES.find((f) => f.name === active) ?? SEED_FILES[0]!,
    [active],
  );

  function handleDownloadZip() {
    const blob = buildZipBlob(
      SEED_FILES.map((f) => ({ name: f.name, content: f.content })),
    );
    downloadBlob(blob, SEED_ZIP_NAME);
    setDownloaded(true);
    window.setTimeout(() => setDownloaded(false), 2500);
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(activeFile.content);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = activeFile.content;
      ta.style.position = "fixed";
      ta.style.left = "-9999px";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <section
      id="seed"
      className="glass-panel scroll-mt-20 rounded-xl p-5 shadow-[0_0_48px_-18px_var(--color-glow-violet)] sm:p-8"
      aria-labelledby="seed-heading"
    >
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-xl space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-success/30 bg-success/10 px-3 py-1 text-xs font-medium text-success">
            <ShieldCheck className="size-3.5" aria-hidden />
            Public-safe clean seed · {SEED_PACK_VERSION}
          </div>
          <h2
            id="seed-heading"
            className="text-2xl font-semibold tracking-tight text-fg text-glow sm:text-3xl"
          >
            Download clean seed ZIP
          </h2>
          <p className="text-sm leading-relaxed text-fg-muted sm:text-base">
            Public pack only. No private history, no family material, no operator-surface
            inventory, no personal contact details. Paste{" "}
            <code className="rounded-sm bg-bg-subtle px-1.5 py-0.5 font-mono text-xs text-accent">
              01-NEW-CHAT-SEED.md
            </code>{" "}
            into a brand-new Grok Build chat — never old thread exports.
          </p>
          <p className="text-xs text-fg-subtle">{SEED_CLASS}</p>
        </div>

        <div className="flex w-full flex-col gap-2 sm:w-auto sm:min-w-[220px]">
          <Button
            type="button"
            size="lg"
            onClick={handleDownloadZip}
            className="w-full shadow-[0_0_28px_-6px_var(--color-glow-violet)] sm:w-auto"
            aria-label={`Download ${SEED_ZIP_NAME}`}
          >
            {downloaded ? (
              <Check className="size-4" aria-hidden />
            ) : (
              <Download className="size-4" aria-hidden />
            )}
            {downloaded ? "Downloaded" : "Download clean seed ZIP"}
          </Button>
          <p className="text-center font-mono text-[11px] text-fg-subtle sm:text-left">
            {SEED_ZIP_NAME}
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {SEED_FILES.map((file) => (
          <button
            key={file.name}
            type="button"
            onClick={() => setActive(file.name)}
            className={cn(
              "focus-ring flex min-h-11 items-start gap-3 rounded-lg border p-3 text-left transition-colors",
              active === file.name
                ? "border-accent/50 bg-accent/10 shadow-[0_0_24px_-12px_var(--color-glow-violet)]"
                : "border-border bg-bg/50 hover:border-border-strong hover:bg-bg-subtle/60",
            )}
          >
            <FileText
              className={cn(
                "mt-0.5 size-4 shrink-0",
                file.pasteTarget ? "text-accent" : "text-fg-subtle",
              )}
              aria-hidden
            />
            <span className="min-w-0">
              <span className="block truncate font-mono text-xs font-medium text-fg">
                {file.name}
              </span>
              <span className="mt-0.5 block text-xs text-fg-muted">{file.role}</span>
              {file.pasteTarget ? (
                <span className="mt-1 inline-block rounded-sm bg-chip px-1.5 py-0.5 text-[10px] font-medium tracking-wide text-accent uppercase">
                  Paste target
                </span>
              ) : null}
            </span>
          </button>
        ))}
      </div>

      <div className="mt-6 overflow-hidden rounded-lg border border-border bg-bg/80">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-3 py-2 sm:px-4">
          <p className="font-mono text-xs text-fg-muted">{activeFile.name}</p>
          <Button type="button" variant="secondary" size="sm" onClick={handleCopy}>
            {copied ? (
              <Check className="size-3.5" aria-hidden />
            ) : (
              <Copy className="size-3.5" aria-hidden />
            )}
            {copied ? "Copied" : "Copy file"}
          </Button>
        </div>
        <pre className="max-h-[28rem] overflow-auto p-4 font-mono text-[11px] leading-relaxed text-fg-muted sm:text-xs">
          {activeFile.content}
        </pre>
      </div>

      <div className="mt-5 flex gap-3 rounded-lg border border-warn/25 bg-warn/5 px-4 py-3">
        <AlertTriangle className="mt-0.5 size-4 shrink-0 text-warn" aria-hidden />
        <div className="space-y-1 text-sm text-fg-muted">
          <p className="font-medium text-fg">Paste discipline</p>
          <p>
            Open a <strong className="font-medium text-fg">new</strong> conversation. Paste
            only <code className="font-mono text-xs text-accent">01-NEW-CHAT-SEED.md</code>.
            Do not paste email envelopes, personal addresses, or prior chat exports.
          </p>
        </div>
      </div>
    </section>
  );
}
