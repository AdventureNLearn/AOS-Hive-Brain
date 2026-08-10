import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  Hexagon,
  Pause,
  Play,
  RotateCcw,
  Map as MapIcon,
  Box,
  ChevronRight,
  Sparkles,
  ShieldCheck,
  X,
  ZoomIn,
  ZoomOut,
  Maximize2,
  GitBranch,
  Download,
  HelpCircle,
  BookOpen,
} from "lucide-react";
import {
  HIVE_MODES,
  HIVE_NODES,
  MAP_CARDS,
  SHAPE_CATEGORIES,
  modesInCategory,
  type ClaimStatus,
  type HiveModeId,
  type HiveNode,
  CHAPTER_PLAIN,
  type ReasonStep,
  type ReasoningDepth,
  type ShapeCategoryId,
} from "@/data/hive-universe";
import { HiveScene } from "@/components/hive/hive-scene";
import { cn } from "@/lib/utils";
import {
  getDepthStepCounts,
  getFormationPlainSummary,
  getFormationSnapshot,
  getFormationStore,
  getReasoningScript,
} from "@/lib/decision/scripts";

type ViewMode = "3d" | "map";

const STATUS_HELP: { status: ClaimStatus; plain: string; tip: string }[] = [
  {
    status: "Supported",
    plain: "Supported",
    tip: "Carefully backed by original records",
  },
  {
    status: "Unproven",
    plain: "Unproven",
    tip: "Still open — do not pretend you know",
  },
  {
    status: "Disputed",
    plain: "Disputed",
    tip: "People disagree — keep that visible",
  },
  {
    status: "Human call",
    plain: "Human decision",
    tip: "A person accepted the leftover risk",
  },
];

function statusLabel(s: ClaimStatus | undefined): string {
  if (!s) return "";
  if (s === "Human call") return "Human decision";
  return s;
}

function chapterLabel(ch: string | undefined): string | null {
  if (!ch) return null;
  return CHAPTER_PLAIN[ch as keyof typeof CHAPTER_PLAIN] ?? ch;
}


export function HiveWorkspace() {
  const hostRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<HiveScene | null>(null);
  const selectedRef = useRef<HiveNode | null>(null);
  const [mode, setMode] = useState<HiveModeId>("honeycomb");
  const [category, setCategory] = useState<ShapeCategoryId>("orient");
  const [depth, setDepth] = useState<ReasoningDepth>("moderate");
  const [view, setView] = useState<ViewMode>("3d");
  const [playing, setPlaying] = useState(true);
  const [selected, setSelected] = useState<HiveNode | null>(null);
  const [hoverNode, setHoverNode] = useState<HiveNode | null>(null);
  const [hoverPos, setHoverPos] = useState<{ x: number; y: number } | null>(null);
  const [step, setStep] = useState<ReasonStep | null>(null);
  const [stepIndex, setStepIndex] = useState(-1);
  const [log, setLog] = useState<ReasonStep[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [zoomPct, setZoomPct] = useState(100);
  const [mapZoom, setMapZoom] = useState(1);
  const [mapPan, setMapPan] = useState({ x: 0, y: 0 });

  const script = useMemo(() => getReasoningScript(mode, depth), [mode, depth]);
  const modeMeta = HIVE_MODES.find((m) => m.id === mode)!;
  const graphSnap = useMemo(() => getFormationSnapshot(mode), [mode]);
  const plainSummary = useMemo(() => getFormationPlainSummary(mode), [mode]);
  const categoryMeta = SHAPE_CATEGORIES.find((c) => c.id === category)!;
  const shapesInRoom = useMemo(() => modesInCategory(category), [category]);
  const depthCounts = useMemo(() => getDepthStepCounts(mode), [mode]);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const apply = () => setSidebarOpen(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  // Keep room tab in sync when mode changes externally
  useEffect(() => {
    setCategory(modeMeta.category);
  }, [modeMeta.category]);

  useEffect(() => {
    const el = hostRef.current;
    if (!el || view !== "3d") return;

    const scene = new HiveScene(el, {
      onSelectNode: (id) => {
        const node = id ? (HIVE_NODES.find((n) => n.id === id) ?? null) : null;
        selectedRef.current = node;
        setSelected(node);
        if (id) {
          setHoverNode(null);
          setHoverPos(null);
        }
      },
      onHoverNode: (id, screen) => {
        if (selectedRef.current) {
          setHoverNode(null);
          setHoverPos(null);
          return;
        }
        if (!id) {
          setHoverNode(null);
          setHoverPos(null);
          return;
        }
        setHoverNode(HIVE_NODES.find((n) => n.id === id) ?? null);
        if (screen) setHoverPos(screen);
      },
      onStepChange: (s, i) => {
        setStep(s);
        setStepIndex(i);
        if (s) {
          setLog((prev) => {
            if (prev.some((p) => p.id === s.id)) return prev;
            return [...prev.slice(-10), s];
          });
        }
      },
      onZoomChange: (pct) => setZoomPct(pct),
    });
    sceneRef.current = scene;
    scene.setMode(mode, script);
    scene.setPlaying(playing);

    return () => {
      scene.dispose();
      sceneRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view]);

  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;
    setLog([]);
    setStep(null);
    setStepIndex(-1);
    setSelected(null);
    setHoverNode(null);
    setHoverPos(null);
    selectedRef.current = null;
    scene.setMode(mode, script);
  }, [mode, script]);

  useEffect(() => {
    sceneRef.current?.setPlaying(playing);
  }, [playing]);

  const handleMode = useCallback((id: HiveModeId) => {
    const m = HIVE_MODES.find((x) => x.id === id);
    if (m) setCategory(m.category);
    setMode(id);
    setPlaying(true);
    setView("3d");
    if (window.matchMedia("(max-width: 767px)").matches) {
      setSidebarOpen(false);
    }
  }, []);

  const handleCategory = useCallback(
    (id: ShapeCategoryId) => {
      setCategory(id);
      const list = modesInCategory(id);
      // If current mode not in room, switch to first shape of that room
      if (!list.some((m) => m.id === mode) && list[0]) {
        setMode(list[0].id);
        setPlaying(true);
      }
    },
    [mode],
  );

  const handleReplay = () => {
    setLog([]);
    setStep(null);
    setStepIndex(-1);
    setPlaying(true);
    sceneRef.current?.replay();
  };

  const handleZoomIn = () => {
    if (view === "3d") {
      sceneRef.current?.zoomIn();
      setZoomPct(sceneRef.current?.getZoomPct() ?? zoomPct);
    } else {
      setMapZoom((z) => Math.min(3.5, z * 1.22));
    }
  };

  const handleZoomOut = () => {
    if (view === "3d") {
      sceneRef.current?.zoomOut();
      setZoomPct(sceneRef.current?.getZoomPct() ?? zoomPct);
    } else {
      setMapZoom((z) => Math.max(0.45, z / 1.22));
    }
  };

  const handleResetView = () => {
    if (view === "3d") {
      sceneRef.current?.resetView();
      setZoomPct(sceneRef.current?.getZoomPct() ?? 100);
    } else {
      setMapZoom(1);
      setMapPan({ x: 0, y: 0 });
    }
  };

  const handleExportGraph = () => {
    const snap = getFormationStore(mode).exportGraph();
    const blob = new Blob([JSON.stringify(snap, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `hive-${mode}-decisions.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSeekStep = useCallback(
    (index: number) => {
      sceneRef.current?.seekToStep(index);
      setPlaying(false);
    },
    [],
  );

  const handleDepth = useCallback((d: ReasoningDepth) => {
    setDepth(d);
    setPlaying(true);
  }, []);

  const displayZoom = view === "3d" ? zoomPct : Math.round(mapZoom * 100);

  return (
    <div className="relative flex h-[100dvh] flex-col overflow-hidden bg-bg text-fg">
      <header className="z-30 flex h-12 shrink-0 items-center justify-between gap-3 border-b border-border/70 bg-bg/80 px-3 backdrop-blur-xl sm:px-4">
        <div className="flex min-w-0 items-center gap-2.5">
          <Link
            to="/"
            className="focus-ring flex items-center gap-2 rounded-sm"
            title="Back to system brief"
          >
            <span className="flex size-7 items-center justify-center rounded-md border border-glow-violet/40 bg-bg-elevated shadow-[0_0_16px_-6px_var(--color-glow-violet)]">
              <Hexagon className="size-3.5 text-accent" aria-hidden />
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-semibold tracking-tight">
                Hive Brain · Live
              </span>
              <span className="hidden truncate text-[10px] text-fg-subtle sm:block">
                20 shapes · 5 floors of thinking · built for anyone
              </span>
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <span className="hidden items-center gap-1.5 rounded-full border border-glow-cyan/35 bg-glow-cyan/10 px-2.5 py-1 text-[10px] font-medium tracking-wide text-glow-cyan uppercase sm:inline-flex">
            <GitBranch className="size-3" aria-hidden />
            {categoryMeta.title} · {modeMeta.title} ·{" "}
            {depth === "moderate" ? "Shorter" : "Fuller"}
          </span>
          <button
            type="button"
            className="focus-ring inline-flex size-9 items-center justify-center rounded-md border border-border text-fg-muted hover:text-fg"
            onClick={() => setHelpOpen(true)}
            aria-label="How to use the Hive"
            title="How to use"
          >
            <HelpCircle className="size-4" />
          </button>
          <Link
            to="/"
            className="focus-ring rounded-md border border-border px-2.5 py-1.5 text-[11px] font-medium text-fg-muted hover:text-fg"
          >
            Brief
          </Link>
        </div>
      </header>

      <div className="relative flex min-h-0 flex-1">
        <div className="relative min-w-0 flex-1">
          <div className="pointer-events-none absolute left-3 top-3 z-20 max-w-[min(100%,22rem)] sm:left-5 sm:top-5">
            <p className="text-[10px] font-medium tracking-[0.14em] text-accent uppercase">
              {categoryMeta.title} · {categoryMeta.plain}
            </p>
            <h1 className="mt-1 text-xl font-semibold tracking-tight text-fg text-glow sm:text-2xl">
              {modeMeta.title}
            </h1>
            <p className="mt-1 text-xs text-fg-muted sm:text-sm">{modeMeta.subtitle}</p>
            <p className="mt-2 hidden text-[11px] leading-relaxed text-fg-subtle sm:block">
              Drag to look · click a glowing node to learn about it · rooms are like floors in a building
            </p>
          </div>

          {view === "3d" ? (
            <div ref={hostRef} className="absolute inset-0 starfield" />
          ) : (
            <MapView
              selectedId={selected?.id ?? null}
              onSelect={(id) => {
                const node = HIVE_NODES.find((n) => n.id === id) ?? null;
                selectedRef.current = node;
                setSelected(node);
              }}
              zoom={mapZoom}
              pan={mapPan}
              onPanChange={setMapPan}
              onZoomChange={setMapZoom}
              mode={mode}
            />
          )}

          {step && view === "3d" ? (
            <div className="absolute bottom-20 left-3 right-3 z-20 sm:bottom-24 sm:left-5 sm:right-auto sm:max-w-md">
              <div className="glass-panel rounded-xl border-accent/30 p-4 shadow-[0_0_40px_-12px_var(--color-glow-violet)]">
                <div className="flex flex-wrap items-center gap-2 text-[10px] font-medium tracking-wide text-accent uppercase">
                  <Sparkles className="size-3.5 shrink-0" aria-hidden />
                  <span>
                    Story step {stepIndex + 1} of {script.length}
                  </span>
                  {chapterLabel(step.chapter) ? (
                    <span className="rounded-full border border-accent/30 bg-accent/10 px-2 py-0.5 text-[10px] normal-case tracking-normal text-accent">
                      {chapterLabel(step.chapter)}
                    </span>
                  ) : null}
                  {step.statusTone ? (
                    <span className="ml-auto rounded-full border border-border bg-bg px-2 py-0.5 text-[10px] normal-case tracking-normal text-fg-muted">
                      {statusLabel(step.statusTone)}
                    </span>
                  ) : null}
                </div>
                <p className="mt-2 text-sm font-semibold text-fg">{step.title}</p>
                <p className="mt-1.5 text-xs leading-relaxed text-fg-muted">{step.detail}</p>
              </div>
            </div>
          ) : null}

          {/* Desktop hover preview — not pinned; disappears when leaving the node */}
          {view === "3d" && hoverNode && !selected ? (
            <div
              className="pointer-events-none absolute z-30 hidden max-w-[min(100%,18rem)] sm:block"
              style={{
                left: Math.min(
                  Math.max((hoverPos?.x ?? 24) + 16, 12),
                  (hostRef.current?.clientWidth ?? 400) - 300,
                ),
                top: Math.min(
                  Math.max((hoverPos?.y ?? 24) + 16, 12),
                  (hostRef.current?.clientHeight ?? 400) - 160,
                ),
              }}
            >
              <NodeInfoCard node={hoverNode} mode="hover" />
            </div>
          ) : null}

          {/* Pinned user selection — one at a time, above story card, works during play */}
          {selected ? (
            <div className="absolute bottom-20 left-3 right-3 z-40 sm:bottom-auto sm:left-5 sm:right-auto sm:top-28 sm:max-w-md">
              <NodeInfoCard
                node={selected}
                mode="pinned"
                onClose={() => {
                  selectedRef.current = null;
                  setSelected(null);
                  sceneRef.current?.clearSelection();
                }}
              />
            </div>
          ) : null}

          <div className="absolute right-3 top-3 z-20 flex flex-col gap-1 sm:right-5 sm:top-5">
            <div className="flex flex-col overflow-hidden rounded-xl border border-border bg-bg-elevated/90 shadow-panel backdrop-blur-xl">
              <button
                type="button"
                className="focus-ring inline-flex size-10 items-center justify-center text-fg-muted hover:bg-bg-subtle hover:text-fg"
                onClick={handleZoomIn}
                aria-label="Zoom in"
              >
                <ZoomIn className="size-4" />
              </button>
              <div className="border-y border-border px-1 py-1.5 text-center font-mono text-[10px] tabular-nums text-fg-subtle">
                {displayZoom}%
              </div>
              <button
                type="button"
                className="focus-ring inline-flex size-10 items-center justify-center text-fg-muted hover:bg-bg-subtle hover:text-fg"
                onClick={handleZoomOut}
                aria-label="Zoom out"
              >
                <ZoomOut className="size-4" />
              </button>
              <button
                type="button"
                className="focus-ring inline-flex size-10 items-center justify-center border-t border-border text-fg-muted hover:bg-bg-subtle hover:text-fg"
                onClick={handleResetView}
                aria-label="Reset view"
              >
                <Maximize2 className="size-3.5" />
              </button>
            </div>
          </div>

          <div className="absolute bottom-3 left-1/2 z-20 flex -translate-x-1/2 items-center gap-1 rounded-full border border-border bg-bg-elevated/90 p-1 shadow-panel backdrop-blur-xl sm:bottom-5">
            <button
              type="button"
              className={cn(
                "focus-ring inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-xs font-medium",
                view === "3d" ? "bg-accent/20 text-fg" : "text-fg-muted hover:text-fg",
              )}
              onClick={() => setView("3d")}
            >
              <Box className="size-3.5" aria-hidden />
              3D
            </button>
            <button
              type="button"
              className={cn(
                "focus-ring inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-xs font-medium",
                view === "map" ? "bg-accent/20 text-fg" : "text-fg-muted hover:text-fg",
              )}
              onClick={() => setView("map")}
            >
              <MapIcon className="size-3.5" aria-hidden />
              Map
            </button>
            <span className="mx-0.5 h-5 w-px bg-border" />
            <button
              type="button"
              className="focus-ring inline-flex size-9 items-center justify-center rounded-full text-fg-muted hover:text-fg"
              onClick={handleZoomOut}
              aria-label="Zoom out"
            >
              <ZoomOut className="size-3.5" />
            </button>
            <span className="min-w-[2.75rem] text-center font-mono text-[10px] tabular-nums text-fg-subtle">
              {displayZoom}%
            </span>
            <button
              type="button"
              className="focus-ring inline-flex size-9 items-center justify-center rounded-full text-fg-muted hover:text-fg"
              onClick={handleZoomIn}
              aria-label="Zoom in"
            >
              <ZoomIn className="size-3.5" />
            </button>
            <span className="mx-0.5 h-5 w-px bg-border" />
            <button
              type="button"
              className="focus-ring inline-flex size-9 items-center justify-center rounded-full text-fg-muted hover:text-fg disabled:opacity-40"
              onClick={() => setPlaying((p) => !p)}
              aria-label={playing ? "Pause" : "Play"}
              disabled={view !== "3d"}
            >
              {playing ? <Pause className="size-3.5" /> : <Play className="size-3.5" />}
            </button>
            <button
              type="button"
              className="focus-ring inline-flex size-9 items-center justify-center rounded-full text-fg-muted hover:text-fg disabled:opacity-40"
              onClick={handleReplay}
              aria-label="Replay from the start"
              disabled={view !== "3d"}
            >
              <RotateCcw className="size-3.5" />
            </button>
            <button
              type="button"
              className="focus-ring ml-0.5 inline-flex h-9 items-center rounded-full px-3 text-xs font-medium text-fg-muted hover:text-fg md:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              Rooms
            </button>
          </div>
        </div>

        <aside className="hidden w-[min(100%,340px)] shrink-0 flex-col border-l border-border/70 bg-bg-elevated/90 backdrop-blur-xl md:flex">
          <SidebarBody
            mode={mode}
            modeMeta={modeMeta}
            category={category}
            categoryMeta={categoryMeta}
            shapesInRoom={shapesInRoom}
            log={log}
            step={step}
            stepIndex={stepIndex}
            script={script}
            depth={depth}
            depthCounts={depthCounts}
            selected={selected}
            onMode={handleMode}
            onCategory={handleCategory}
            onDepth={handleDepth}
            onSeekStep={handleSeekStep}
            graphSnap={graphSnap}
            plainSummary={plainSummary}
            onExportGraph={handleExportGraph}
            onOpenHelp={() => setHelpOpen(true)}
          />
        </aside>

        {sidebarOpen ? (
          <div className="fixed inset-0 z-40 md:hidden">
            <button
              type="button"
              className="absolute inset-0 bg-bg/70"
              aria-label="Close rooms panel"
              onClick={() => setSidebarOpen(false)}
            />
            <aside className="absolute inset-y-0 right-0 flex w-[min(100%,340px)] flex-col border-l border-border/70 bg-bg-elevated shadow-panel">
              <div className="flex items-center justify-between border-b border-border/70 px-3 py-2">
                <p className="text-sm font-semibold">Rooms & shapes</p>
                <button
                  type="button"
                  className="focus-ring inline-flex size-10 items-center justify-center rounded-md text-fg-muted"
                  onClick={() => setSidebarOpen(false)}
                  aria-label="Close"
                >
                  <X className="size-4" />
                </button>
              </div>
              <SidebarBody
                mode={mode}
                modeMeta={modeMeta}
                category={category}
                categoryMeta={categoryMeta}
                shapesInRoom={shapesInRoom}
                log={log}
                step={step}
                stepIndex={stepIndex}
                script={script}
                depth={depth}
                depthCounts={depthCounts}
                selected={selected}
                onMode={handleMode}
                onCategory={handleCategory}
                onDepth={handleDepth}
                onSeekStep={handleSeekStep}
                graphSnap={graphSnap}
                plainSummary={plainSummary}
                onExportGraph={handleExportGraph}
                onOpenHelp={() => setHelpOpen(true)}
              />
            </aside>
          </div>
        ) : null}
      </div>

      {helpOpen ? <HelpOverlay onClose={() => setHelpOpen(false)} /> : null}
    </div>
  );
}

function HelpOverlay({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-3 sm:items-center sm:p-6">
      <button
        type="button"
        className="absolute inset-0 bg-bg/75 backdrop-blur-sm"
        aria-label="Close help"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-labelledby="hive-help-title"
        className="relative z-10 max-h-[min(90dvh,40rem)] w-full max-w-lg overflow-y-auto rounded-xl border border-border bg-bg-elevated p-5 shadow-panel sm:p-6"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-medium tracking-[0.14em] text-accent uppercase">
              Quick start
            </p>
            <h2 id="hive-help-title" className="mt-1 text-lg font-semibold text-fg">
              How to use the Hive
            </h2>
          </div>
          <button
            type="button"
            className="focus-ring inline-flex size-10 shrink-0 items-center justify-center rounded-md text-fg-muted"
            onClick={onClose}
            aria-label="Close"
          >
            <X className="size-4" />
          </button>
        </div>

        <p className="mt-3 text-sm leading-relaxed text-fg-muted">
          Built so a careful high-school senior and a senior engineer can share the same map.
          Think of the Hive as a <span className="font-medium text-fg">building with floors</span> —
          different floors have different rules.
        </p>

        <ol className="mt-5 space-y-3 text-sm leading-relaxed text-fg-muted">
          <li>
            <span className="font-semibold text-fg">1. Pick a room</span> — five big areas (Orient,
            Integrity, Mission, Coordinate, Surface). You only see about four shapes at a time so
            nothing dumps on you at once.
          </li>
          <li>
            <span className="font-semibold text-fg">2. Pick a shape</span> — each shape is a different
            way to think. New here? Start with <em className="text-fg not-italic">Honeycomb</em>.
          </li>
          <li>
            <span className="font-semibold text-fg">3. Choose Shorter or Fuller story</span> — same
            mission. Fuller adds extra careful steps. Play follows the main storyline only.
          </li>
          <li>
            <span className="font-semibold text-fg">4. Press play or tap a story step</span> — each card
            is a real decision in plain language. Jump around the checklist anytime.
          </li>
          <li>
            <span className="font-semibold text-fg">5. Click any glowing node</span> — even while the
            story plays. Desktop: hover for a preview, click to pin. Phone: tap to open, close with
            the X. Only one node card open at a time.
          </li>
          <li>
            <span className="font-semibold text-fg">6. Download the record</span> — get the full written
            trail (including side drafts that play skips) so someone else could continue.
          </li>
        </ol>

        <div className="mt-5 rounded-lg border border-border/80 bg-bg/50 p-3">
          <p className="text-[11px] font-medium tracking-wide text-fg-subtle uppercase">
            Five rooms (like floors of work)
          </p>
          <ul className="mt-2 space-y-1.5">
            {SHAPE_CATEGORIES.map((c) => (
              <li key={c.id} className="flex gap-2 text-xs text-fg-muted">
                <span className="min-w-[5.5rem] font-semibold text-fg">{c.title}</span>
                <span>{c.plain}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-3 rounded-lg border border-border/80 bg-bg/50 p-3">
          <p className="text-[11px] font-medium tracking-wide text-fg-subtle uppercase">
            Honesty labels (your traffic lights)
          </p>
          <ul className="mt-2 space-y-1.5">
            {STATUS_HELP.map((s) => (
              <li key={s.status} className="flex gap-2 text-xs text-fg-muted">
                <span className="min-w-[5.5rem] font-semibold text-fg">{s.plain}</span>
                <span>{s.tip}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-3 rounded-lg border border-border/80 bg-bg/50 p-3">
          <p className="text-[11px] font-medium tracking-wide text-fg-subtle uppercase">
            Words we use on purpose
          </p>
          <ul className="mt-2 space-y-1.5 text-xs text-fg-muted">
            <li>
              <span className="font-semibold text-fg">Floors</span> — separate areas of work that
              should not mix (public tools vs private experiments).
            </li>
            <li>
              <span className="font-semibold text-fg">Story steps</span> — the main decision checklist
              you watch in play (side drafts stay in the download).
            </li>
            <li>
              <span className="font-semibold text-fg">Human decision</span> — a person, not software,
              accepts leftover risk before something goes public.
            </li>
          </ul>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="focus-ring mt-5 inline-flex h-11 w-full items-center justify-center rounded-md bg-accent text-sm font-medium text-accent-fg"
        >
          Got it — show me the Hive
        </button>
      </div>
    </div>
  );
}

function SidebarBody({
  mode,
  modeMeta,
  category,
  categoryMeta,
  shapesInRoom,
  log,
  step,
  stepIndex,
  script,
  depth,
  depthCounts,
  selected,
  onMode,
  onCategory,
  onDepth,
  onSeekStep,
  graphSnap,
  plainSummary,
  onExportGraph,
  onOpenHelp,
}: {
  mode: HiveModeId;
  modeMeta: (typeof HIVE_MODES)[number];
  category: ShapeCategoryId;
  categoryMeta: (typeof SHAPE_CATEGORIES)[number];
  shapesInRoom: (typeof HIVE_MODES)[number][];
  log: ReasonStep[];
  step: ReasonStep | null;
  stepIndex: number;
  script: ReasonStep[];
  depth: ReasoningDepth;
  depthCounts: { moderate: number; deep: number; sideNodes: number };
  selected: HiveNode | null;
  onMode: (id: HiveModeId) => void;
  onCategory: (id: ShapeCategoryId) => void;
  onDepth: (d: ReasoningDepth) => void;
  onSeekStep: (index: number) => void;
  graphSnap: ReturnType<typeof getFormationSnapshot>;
  plainSummary: string;
  onExportGraph: () => void;
  onOpenHelp: () => void;
}) {
  return (
    <>
      <div className="border-b border-border/70 px-3 py-3 max-md:pt-2">
        <p className="text-[10px] font-medium tracking-[0.12em] text-fg-subtle uppercase">
          Five rooms · 20 shapes
        </p>
        <p className="mt-1 text-sm font-semibold text-fg">Pick a room, then a thinking shape</p>
        <div className="mt-2.5 flex flex-wrap gap-1">
          {SHAPE_CATEGORIES.map((c) => {
            const active = c.id === category;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => onCategory(c.id)}
                className={cn(
                  "focus-ring rounded-full border px-2.5 py-1.5 text-[11px] font-medium transition-colors",
                  active
                    ? "border-accent/50 bg-accent/15 text-fg"
                    : "border-border/80 bg-bg/40 text-fg-muted hover:border-border-strong hover:text-fg",
                )}
              >
                {c.title}
              </button>
            );
          })}
        </div>
        <p className="mt-2 text-[11px] leading-relaxed text-fg-muted">{categoryMeta.blurb}</p>

        <div className="mt-3 rounded-lg border border-border/80 bg-bg/50 p-2">
          <p className="px-0.5 text-[10px] font-medium tracking-wide text-fg-subtle uppercase">
            How detailed is the story?
          </p>
          <div className="mt-1.5 grid grid-cols-2 gap-1">
            <button
              type="button"
              onClick={() => onDepth("moderate")}
              className={cn(
                "focus-ring rounded-md border px-2 py-2 text-left transition-colors",
                depth === "moderate"
                  ? "border-accent/50 bg-accent/15"
                  : "border-border/70 hover:border-border-strong",
              )}
            >
              <span className="block text-[11px] font-semibold text-fg">Shorter</span>
              <span className="block text-[10px] text-fg-muted">
                {depthCounts.moderate} main steps
              </span>
            </button>
            <button
              type="button"
              onClick={() => onDepth("deep")}
              className={cn(
                "focus-ring rounded-md border px-2 py-2 text-left transition-colors",
                depth === "deep"
                  ? "border-accent/50 bg-accent/15"
                  : "border-border/70 hover:border-border-strong",
              )}
            >
              <span className="block text-[11px] font-semibold text-fg">Fuller</span>
              <span className="block text-[10px] text-fg-muted">
                {depthCounts.deep} main steps
              </span>
            </button>
          </div>
          <p className="mt-1.5 px-0.5 text-[10px] leading-snug text-fg-subtle">
            Play follows the main storyline. Side drafts stay in the download
            {depthCounts.sideNodes ? ` (${depthCounts.sideNodes} extra)` : ""}.
          </p>
        </div>
      </div>

      <div className="min-h-0 flex-1 space-y-1.5 overflow-y-auto p-3">
        <p className="px-0.5 text-[10px] font-medium tracking-wide text-fg-subtle uppercase">
          Shapes in {categoryMeta.title}
        </p>
        {shapesInRoom.map((m) => {
          const active = m.id === mode;
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => onMode(m.id)}
              className={cn(
                "focus-ring w-full rounded-lg border px-3 py-2.5 text-left transition-colors",
                active
                  ? "border-accent/50 bg-accent/10 shadow-[0_0_24px_-12px_var(--color-glow-violet)]"
                  : "border-border/80 bg-bg/40 hover:border-border-strong hover:bg-bg-subtle/60",
              )}
            >
              <span className="flex items-center gap-2">
                <span className="text-sm font-semibold text-fg">{m.title}</span>
                <span className="rounded-full border border-glow-cyan/40 bg-glow-cyan/10 px-1.5 py-0.5 text-[9px] font-medium tracking-wide text-glow-cyan uppercase">
                  Story
                </span>
                {active ? (
                  <ChevronRight className="ml-auto size-3.5 text-accent" aria-hidden />
                ) : null}
              </span>
              <span className="mt-0.5 block text-[11px] leading-snug text-fg-muted">
                {m.subtitle}
              </span>
            </button>
          );
        })}

        <div className="mt-3 rounded-lg border border-glow-cyan/30 bg-glow-cyan/5 p-3">
          <div className="flex items-start gap-2">
            <GitBranch className="mt-0.5 size-3.5 shrink-0 text-glow-cyan" aria-hidden />
            <div className="min-w-0">
              <p className="text-[10px] font-medium tracking-wide text-glow-cyan uppercase">
                This shape’s story
              </p>
              <p className="mt-1 text-[11px] font-semibold text-fg">{graphSnap.title}</p>
              <p className="mt-1 text-[11px] leading-relaxed text-fg-muted">{plainSummary}</p>
              <p className="mt-2 text-[11px] leading-relaxed text-fg-subtle">
                {modeMeta.description}
              </p>
              <dl className="mt-2 grid grid-cols-3 gap-1.5 text-center">
                <div className="rounded-md border border-border/70 bg-bg/50 px-1 py-1.5">
                  <dt className="text-[9px] text-fg-subtle uppercase">Recorded</dt>
                  <dd className="font-mono text-xs text-fg">{graphSnap.nodes.length}</dd>
                </div>
                <div className="rounded-md border border-border/70 bg-bg/50 px-1 py-1.5">
                  <dt className="text-[9px] text-fg-subtle uppercase">In play</dt>
                  <dd className="font-mono text-xs text-fg">{script.length}</dd>
                </div>
                <div className="rounded-md border border-border/70 bg-bg/50 px-1 py-1.5">
                  <dt className="text-[9px] text-fg-subtle uppercase">Disputes</dt>
                  <dd className="font-mono text-xs text-fg">{graphSnap.conflicts.length}</dd>
                </div>
              </dl>
              {graphSnap.conflicts[0] ? (
                <p className="mt-2 text-[10px] leading-snug text-glow-rose">
                  Open disagreement (not auto-fixed): {graphSnap.conflicts[0].note}
                </p>
              ) : null}
              <button
                type="button"
                onClick={onExportGraph}
                className="focus-ring mt-3 inline-flex h-10 w-full items-center justify-center gap-1.5 rounded-md border border-border bg-bg/60 text-[11px] font-medium text-fg-muted hover:border-accent/40 hover:text-fg"
              >
                <Download className="size-3.5" aria-hidden />
                Download the full written record
              </button>
              <button
                type="button"
                onClick={onOpenHelp}
                className="focus-ring mt-2 inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-md text-[11px] font-medium text-fg-subtle hover:text-fg"
              >
                <BookOpen className="size-3.5" aria-hidden />
                How to use the Hive
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-h-[38%] shrink-0 border-t border-border/70">
        <div className="flex items-center gap-2 px-4 py-2">
          <ShieldCheck className="size-3.5 text-success" aria-hidden />
          <p className="text-[11px] font-medium text-fg">Story steps</p>
          <span className="ml-auto truncate font-mono text-[10px] text-fg-subtle">
            {depth === "moderate" ? "Shorter" : "Fuller"} · {script.length}
          </span>
        </div>
        <ol className="max-h-40 space-y-1 overflow-y-auto px-3 pb-3">
          {script.length === 0 ? (
            <li className="rounded-md border border-dashed border-border px-2.5 py-2 text-[11px] text-fg-subtle">
              No story steps for this detail level.
            </li>
          ) : (
            script.map((s, i) => {
              const active = stepIndex === i || step?.id === s.id;
              const seen = log.some((l) => l.id === s.id) || i <= stepIndex;
              return (
                <li key={s.id}>
                  <button
                    type="button"
                    onClick={() => onSeekStep(i)}
                    className={cn(
                      "focus-ring w-full rounded-md border px-2.5 py-2 text-left transition-colors",
                      active
                        ? "border-accent/40 bg-accent/10"
                        : seen
                          ? "border-border/70 bg-bg/40 hover:border-border-strong"
                          : "border-border/50 bg-bg/20 hover:border-border-strong",
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] text-fg-subtle tabular-nums">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <p className="min-w-0 flex-1 truncate text-[11px] font-semibold text-fg">
                        {s.title}
                      </p>
                      {chapterLabel(s.chapter) ? (
                        <span className="shrink-0 text-[9px] text-accent">
                          {chapterLabel(s.chapter)}
                        </span>
                      ) : null}
                      {s.statusTone ? (
                        <span className="shrink-0 rounded-full border border-border px-1.5 py-0.5 text-[9px] text-fg-subtle">
                          {statusLabel(s.statusTone)}
                        </span>
                      ) : null}
                    </div>
                    {active ? (
                      <p className="mt-1 line-clamp-2 text-[10px] leading-snug text-fg-muted">
                        {s.detail}
                      </p>
                    ) : null}
                  </button>
                </li>
              );
            })
          )}
        </ol>
      </div>

      {selected ? (
        <div className="border-t border-border/70 px-4 py-3">
          <p className="text-[10px] font-medium tracking-wide text-fg-subtle uppercase">
            Selected node
          </p>
          <p className="mt-1 text-sm font-semibold" style={{ color: selected.color }}>
            {selected.label}
          </p>
          <p className="mt-1 text-[11px] leading-relaxed text-fg-muted">{selected.blurb}</p>
          {selected.status ? (
            <p className="mt-2 text-[10px] font-medium text-accent">
              Honesty label: {statusLabel(selected.status)}
            </p>
          ) : null}
        </div>
      ) : null}
    </>
  );
}



function NodeInfoCard({
  node,
  mode,
  onClose,
}: {
  node: HiveNode;
  mode: "hover" | "pinned";
  onClose?: () => void;
}) {
  return (
    <div
      className={cn(
        "glass-panel rounded-xl border-accent/40 p-4 shadow-[0_0_48px_-10px_var(--color-glow-violet)]",
        mode === "pinned" &&
          "border-accent/55 shadow-[0_0_56px_-8px_var(--color-glow-violet)] ring-1 ring-accent/25",
      )}
      role={mode === "pinned" ? "dialog" : "tooltip"}
      aria-label={node.label}
    >
      <div className="flex items-start gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 text-[10px] font-medium tracking-wide text-accent uppercase">
            <span
              className="size-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: node.color, boxShadow: `0 0 10px ${node.color}` }}
              aria-hidden
            />
            <span>{mode === "pinned" ? "Your pick" : "Hover"}</span>
            <span className="rounded-full border border-border bg-bg/70 px-2 py-0.5 text-[10px] normal-case tracking-normal text-fg-muted">
              {node.kind}
            </span>
            {node.status ? (
              <span className="rounded-full border border-border bg-bg/70 px-2 py-0.5 text-[10px] normal-case tracking-normal text-fg-muted">
                {statusLabel(node.status)}
              </span>
            ) : null}
          </div>
          <p className="mt-2 text-sm font-semibold text-fg" style={{ color: node.color }}>
            {node.label}
          </p>
          <p className="mt-1.5 text-xs leading-relaxed text-fg-muted">{node.blurb}</p>
          {mode === "hover" ? (
            <p className="mt-2 text-[10px] text-fg-subtle">Click to pin this card · only one open at a time</p>
          ) : (
            <p className="mt-2 text-[10px] text-fg-subtle">
              Works while the story plays · pick another node to switch
            </p>
          )}
        </div>
        {mode === "pinned" && onClose ? (
          <button
            type="button"
            onClick={onClose}
            className="focus-ring -mr-1 -mt-1 inline-flex size-10 shrink-0 items-center justify-center rounded-md border border-border bg-bg/60 text-fg-muted hover:text-fg"
            aria-label="Close node card"
          >
            <X className="size-4" />
          </button>
        ) : null}
      </div>
    </div>
  );
}

function mapLayoutForMode(mode: HiveModeId) {
  const n = MAP_CARDS.length;
  return MAP_CARDS.map((c, i) => {
    const t = i / Math.max(n - 1, 1);
    let x = 50;
    let y = 50;
    switch (mode) {
      case "mission-spine":
      case "welcome-path":
      case "provenance-chain":
      case "tutor-path": {
        if (i < 7) {
          x = 50;
          y = 12 + (i / 6) * 76;
        } else {
          const a = ((i - 7) / (n - 7)) * Math.PI * 2;
          const r = 28 + ((i - 7) % 3) * 8;
          x = 50 + Math.cos(a) * r;
          y = 50 + Math.sin(a) * r * 0.55;
        }
        break;
      }
      case "integrity-triangle":
      case "honest-gap": {
        const hubs = [
          { x: 50, y: 18 },
          { x: 22, y: 72 },
          { x: 78, y: 72 },
        ];
        if (i < 3) {
          x = hubs[i]!.x;
          y = hubs[i]!.y;
        } else {
          const h = hubs[i % 3]!;
          const a = (i / n) * Math.PI * 2;
          x = h.x + Math.cos(a) * 12;
          y = h.y + Math.sin(a) * 10;
        }
        break;
      }
      case "claim-diamond":
      case "ship-gate": {
        if (i === 0) {
          x = 50;
          y = 14;
        } else if (i === 1) {
          x = 22;
          y = 48;
        } else if (i === 2) {
          x = 78;
          y = 48;
        } else if (i === 3) {
          x = 50;
          y = 82;
        } else {
          const a = ((i - 4) / (n - 4)) * Math.PI * 2;
          x = 50 + Math.cos(a) * 36;
          y = 50 + Math.sin(a) * 28;
        }
        break;
      }
      case "sense-reason-build":
      case "layer-stack": {
        const band = i % 3;
        const inBand = Math.floor(i / 3);
        const countBand = Math.ceil(n / 3);
        x = 12 + (inBand / Math.max(countBand - 1, 1)) * 76;
        y = 22 + band * 28;
        break;
      }
      case "four-agent":
      case "sync-gate":
      case "edge-permission":
      case "fresh-verifier": {
        const lane = i % 4;
        const col = Math.floor(i / 4);
        const cols = Math.ceil(n / 4);
        x = 14 + (col / Math.max(cols - 1, 1)) * 72;
        y = 18 + lane * 20;
        break;
      }
      case "field-helix": {
        const turns = 2.2;
        const a = t * Math.PI * 2 * turns;
        const r = 8 + t * 34;
        x = 50 + Math.cos(a) * r;
        y = 14 + t * 72;
        break;
      }
      case "star-burst":
      case "civic-lens":
      case "freeze-era": {
        if (i < 6) {
          const a = (i / 6) * Math.PI * 2 - Math.PI / 2;
          x = 50 + Math.cos(a) * 12;
          y = 50 + Math.sin(a) * 10;
        } else if (i < 14) {
          const a = ((i - 6) / 8) * Math.PI * 2;
          x = 50 + Math.cos(a) * 28;
          y = 50 + Math.sin(a) * 22;
        } else {
          const a = ((i - 14) / (n - 14)) * Math.PI * 2;
          x = 50 + Math.cos(a) * 40;
          y = 50 + Math.sin(a) * 32;
        }
        break;
      }
      default: {
        const ring = i < 6 ? 0 : i < 14 ? 1 : 2;
        const inRing = MAP_CARDS.filter((_, j) => {
          const r = j < 6 ? 0 : j < 14 ? 1 : 2;
          return r === ring;
        });
        const idx = inRing.findIndex((x) => x.id === c.id);
        const a = (idx / Math.max(inRing.length, 1)) * Math.PI * 2 - Math.PI / 2;
        const r = 10 + ring * 16;
        x = 50 + Math.cos(a) * r * 1.1;
        y = 50 + Math.sin(a) * r * 0.85;
      }
    }
    return { ...c, x, y };
  });
}

function MapView({
  selectedId,
  onSelect,
  zoom,
  pan,
  onPanChange,
  onZoomChange,
  mode,
}: {
  selectedId: string | null;
  onSelect: (id: string) => void;
  zoom: number;
  pan: { x: number; y: number };
  onPanChange: (p: { x: number; y: number }) => void;
  onZoomChange: (z: number) => void;
  mode: HiveModeId;
}) {
  const stageRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{
    active: boolean;
    moved: boolean;
    x: number;
    y: number;
    panX: number;
    panY: number;
  } | null>(null);
  const pinch = useRef<{ dist: number; zoom: number } | null>(null);

  const placed = useMemo(() => mapLayoutForMode(mode), [mode]);

  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const factor = e.deltaY > 0 ? 0.9 : 1.1;
      onZoomChange(Math.min(3.5, Math.max(0.45, zoom * factor)));
    };

    const onPointerDown = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      drag.current = {
        active: true,
        moved: false,
        x: e.clientX,
        y: e.clientY,
        panX: pan.x,
        panY: pan.y,
      };
      el.setPointerCapture(e.pointerId);
    };
    const onPointerMove = (e: PointerEvent) => {
      if (!drag.current?.active) return;
      const dx = e.clientX - drag.current.x;
      const dy = e.clientY - drag.current.y;
      if (Math.hypot(dx, dy) > 3) drag.current.moved = true;
      onPanChange({ x: drag.current.panX + dx, y: drag.current.panY + dy });
    };
    const onPointerUp = () => {
      drag.current = null;
    };

    const touchDist = (a: Touch, b: Touch) =>
      Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        e.preventDefault();
        pinch.current = {
          dist: touchDist(e.touches[0]!, e.touches[1]!),
          zoom,
        };
        drag.current = null;
      } else if (e.touches.length === 1) {
        drag.current = {
          active: true,
          moved: false,
          x: e.touches[0]!.clientX,
          y: e.touches[0]!.clientY,
          panX: pan.x,
          panY: pan.y,
        };
      }
    };
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2 && pinch.current) {
        e.preventDefault();
        const d = touchDist(e.touches[0]!, e.touches[1]!);
        const next = pinch.current.zoom * (d / pinch.current.dist);
        onZoomChange(Math.min(3.5, Math.max(0.45, next)));
      } else if (e.touches.length === 1 && drag.current?.active) {
        e.preventDefault();
        const t = e.touches[0]!;
        const dx = t.clientX - drag.current.x;
        const dy = t.clientY - drag.current.y;
        if (Math.hypot(dx, dy) > 3) drag.current.moved = true;
        onPanChange({ x: drag.current.panX + dx, y: drag.current.panY + dy });
      }
    };
    const onTouchEnd = () => {
      pinch.current = null;
      drag.current = null;
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    el.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    el.addEventListener("touchstart", onTouchStart, { passive: false });
    el.addEventListener("touchmove", onTouchMove, { passive: false });
    el.addEventListener("touchend", onTouchEnd);

    return () => {
      el.removeEventListener("wheel", onWheel);
      el.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
      el.removeEventListener("touchend", onTouchEnd);
    };
  }, [zoom, pan.x, pan.y, onPanChange, onZoomChange]);

  return (
    <div
      ref={stageRef}
      className="absolute inset-0 cursor-grab overflow-hidden starfield active:cursor-grabbing"
      style={{ touchAction: "none" }}
    >
      <div className="pointer-events-none absolute left-0 right-0 top-20 z-10 px-4 text-center sm:top-24">
        <p className="text-xs text-fg-muted">
          Map view · {HIVE_MODES.find((m) => m.id === mode)?.title} · drag to pan · pinch to zoom
        </p>
      </div>
      <div
        className="absolute left-1/2 top-1/2 will-change-transform"
        style={{
          width: "min(920px, 92vw)",
          height: "min(690px, 70vh)",
          transform: `translate(calc(-50% + ${pan.x}px), calc(-50% + ${pan.y}px)) scale(${zoom})`,
          transformOrigin: "center center",
        }}
      >
        {placed.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => {
              if (drag.current?.moved) return;
              onSelect(c.id);
            }}
            className={cn(
              "focus-ring absolute -translate-x-1/2 -translate-y-1/2 rounded-lg border px-2.5 py-1.5 text-left shadow-panel backdrop-blur-md transition-transform hover:scale-105",
              selectedId === c.id
                ? "z-10 border-accent/50 bg-accent/15"
                : "border-border/80 bg-bg-elevated/80",
            )}
            style={{
              left: `${c.x}%`,
              top: `${c.y}%`,
              boxShadow: `0 0 20px -8px ${c.color}`,
            }}
          >
            <span
              className="block text-[10px] font-semibold tracking-wide"
              style={{ color: c.color }}
            >
              {c.id.toUpperCase()}
            </span>
            <span className="block max-w-[7.5rem] truncate text-[11px] text-fg">{c.label}</span>
          </button>
        ))}
        <div className="pointer-events-none absolute left-1/2 top-1/2 flex size-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-accent/40 bg-accent/10 text-center text-[10px] font-semibold tracking-wide text-accent uppercase">
          Hive
          <br />
          core
        </div>
      </div>
    </div>
  );
}
