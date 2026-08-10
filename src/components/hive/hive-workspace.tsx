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
} from "lucide-react";
import {
  HIVE_MODES,
  HIVE_NODES,
  MAP_CARDS,
  REASONING_SCRIPTS,
  type HiveModeId,
  type HiveNode,
  type ReasonStep,
} from "@/data/hive-universe";
import { HiveScene } from "@/components/hive/hive-scene";
import { cn } from "@/lib/utils";

type ViewMode = "3d" | "map";

export function HiveWorkspace() {
  const hostRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<HiveScene | null>(null);
  const [mode, setMode] = useState<HiveModeId>("honeycomb");
  const [view, setView] = useState<ViewMode>("3d");
  const [playing, setPlaying] = useState(true);
  const [selected, setSelected] = useState<HiveNode | null>(null);
  const [step, setStep] = useState<ReasonStep | null>(null);
  const [stepIndex, setStepIndex] = useState(-1);
  const [log, setLog] = useState<ReasonStep[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [zoomPct, setZoomPct] = useState(100);
  const [mapZoom, setMapZoom] = useState(1);
  const [mapPan, setMapPan] = useState({ x: 0, y: 0 });

  const script = useMemo(() => REASONING_SCRIPTS[mode], [mode]);
  const modeMeta = HIVE_MODES.find((m) => m.id === mode)!;

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const apply = () => setSidebarOpen(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    const el = hostRef.current;
    if (!el || view !== "3d") return;

    const scene = new HiveScene(el, {
      onSelectNode: (id) => {
        setSelected(id ? (HIVE_NODES.find((n) => n.id === id) ?? null) : null);
      },
      onStepChange: (s, i) => {
        setStep(s);
        setStepIndex(i);
        if (s) {
          setLog((prev) => {
            if (prev.some((p) => p.id === s.id)) return prev;
            return [...prev.slice(-8), s];
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
    scene.setMode(mode, script);
  }, [mode, script]);

  useEffect(() => {
    sceneRef.current?.setPlaying(playing);
  }, [playing]);

  const handleMode = useCallback((id: HiveModeId) => {
    setMode(id);
    setPlaying(true);
    setView("3d");
    if (window.matchMedia("(max-width: 767px)").matches) {
      setSidebarOpen(false);
    }
  }, []);

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

  const displayZoom =
    view === "3d" ? zoomPct : Math.round(mapZoom * 100);

  return (
    <div className="relative flex h-[100dvh] flex-col overflow-hidden bg-bg text-fg">
      <header className="z-30 flex h-12 shrink-0 items-center justify-between gap-3 border-b border-border/70 bg-bg/80 px-3 backdrop-blur-xl sm:px-4">
        <div className="flex min-w-0 items-center gap-2.5">
          <Link to="/" className="focus-ring flex items-center gap-2 rounded-sm" title="System brief">
            <span className="flex size-7 items-center justify-center rounded-md border border-glow-violet/40 bg-bg-elevated shadow-[0_0_16px_-6px_var(--color-glow-violet)]">
              <Hexagon className="size-3.5 text-accent" aria-hidden />
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-semibold tracking-tight">
                Hive Brain · Live
              </span>
              <span className="hidden truncate text-[10px] text-fg-subtle sm:block">
                Interactive reasoning demo · public-safe
              </span>
            </span>
          </Link>
        </div>

        <nav
          className="hidden items-center gap-0.5 rounded-full border border-border bg-bg-elevated/80 p-0.5 lg:flex"
          aria-label="Workspace sections"
        >
          {["Learn", "Samples", "Industries", "Tools", "Progress", "Path"].map((label) => (
            <span
              key={label}
              className="rounded-full px-2.5 py-1 text-[11px] font-medium text-fg-subtle"
            >
              {label}
            </span>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <span className="hidden items-center gap-1.5 rounded-full border border-success/30 bg-success/10 px-2.5 py-1 text-[10px] font-medium tracking-wide text-success uppercase sm:inline-flex">
            <span className="size-1.5 animate-pulse rounded-full bg-success" />
            Live session
          </span>
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
          <div className="pointer-events-none absolute left-3 top-3 z-20 max-w-[min(100%,24rem)] sm:left-5 sm:top-5">
            <p className="text-[10px] font-medium tracking-[0.14em] text-accent uppercase">
              AdventureNLearn · AOS
            </p>
            <h1 className="mt-1 text-xl font-semibold tracking-tight text-fg text-glow sm:text-2xl">
              Hive Brain · The Hive
            </h1>
            <p className="mt-1 text-xs text-fg-muted sm:text-sm">{modeMeta.subtitle}</p>
            <p className="mt-2 hidden text-[11px] leading-relaxed text-fg-subtle sm:block">
              Drag to orbit · scroll / pinch / ± to zoom · click a node · pick a formation
            </p>
          </div>

          {view === "3d" ? (
            <div ref={hostRef} className="absolute inset-0 starfield" />
          ) : (
            <MapView
              selectedId={selected?.id ?? null}
              onSelect={(id) => {
                setSelected(HIVE_NODES.find((n) => n.id === id) ?? null);
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
                <div className="flex items-center gap-2 text-[10px] font-medium tracking-wide text-accent uppercase">
                  <Sparkles className="size-3.5" aria-hidden />
                  Active reasoning · step {stepIndex + 1}/{script.length}
                  {step.statusTone ? (
                    <span className="ml-auto rounded-full border border-border bg-bg px-2 py-0.5 text-[10px] normal-case tracking-normal text-fg-muted">
                      {step.statusTone}
                    </span>
                  ) : null}
                </div>
                <p className="mt-2 text-sm font-semibold text-fg">{step.title}</p>
                <p className="mt-1 text-xs leading-relaxed text-fg-muted">{step.detail}</p>
              </div>
            </div>
          ) : null}

          {/* Zoom cluster (always available) */}
          <div className="absolute right-3 top-3 z-20 flex flex-col gap-1 sm:right-5 sm:top-5 md:right-[calc(0px)]">
            <div className="flex flex-col overflow-hidden rounded-xl border border-border bg-bg-elevated/90 shadow-panel backdrop-blur-xl">
              <button
                type="button"
                className="focus-ring inline-flex size-10 items-center justify-center text-fg-muted hover:bg-bg-subtle hover:text-fg"
                onClick={handleZoomIn}
                aria-label="Zoom in"
                title="Zoom in"
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
                title="Zoom out"
              >
                <ZoomOut className="size-4" />
              </button>
              <button
                type="button"
                className="focus-ring inline-flex size-10 items-center justify-center border-t border-border text-fg-muted hover:bg-bg-subtle hover:text-fg"
                onClick={handleResetView}
                aria-label="Reset view"
                title="Reset view"
              >
                <Maximize2 className="size-3.5" />
              </button>
            </div>
          </div>

          {/* Bottom toolbar */}
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
              aria-label={playing ? "Pause reasoning" : "Play reasoning"}
              disabled={view !== "3d"}
            >
              {playing ? <Pause className="size-3.5" /> : <Play className="size-3.5" />}
            </button>
            <button
              type="button"
              className="focus-ring inline-flex size-9 items-center justify-center rounded-full text-fg-muted hover:text-fg disabled:opacity-40"
              onClick={handleReplay}
              aria-label="Replay reasoning"
              disabled={view !== "3d"}
            >
              <RotateCcw className="size-3.5" />
            </button>
            <button
              type="button"
              className="focus-ring ml-0.5 inline-flex h-9 items-center rounded-full px-3 text-xs font-medium text-fg-muted hover:text-fg md:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              Modes
            </button>
          </div>
        </div>

        <aside className="hidden w-[320px] shrink-0 flex-col border-l border-border/70 bg-bg-elevated/90 backdrop-blur-xl md:flex">
          <SidebarBody
            mode={mode}
            modeMeta={modeMeta}
            log={log}
            step={step}
            selected={selected}
            onMode={handleMode}
          />
        </aside>

        {sidebarOpen ? (
          <div className="fixed inset-0 z-40 md:hidden">
            <button
              type="button"
              className="absolute inset-0 bg-bg/70"
              aria-label="Close modes"
              onClick={() => setSidebarOpen(false)}
            />
            <aside className="absolute inset-y-0 right-0 flex w-[min(100%,320px)] flex-col border-l border-border/70 bg-bg-elevated shadow-panel">
              <div className="flex items-center justify-between border-b border-border/70 px-3 py-2">
                <p className="text-sm font-semibold">Formation modes</p>
                <button
                  type="button"
                  className="focus-ring inline-flex size-9 items-center justify-center rounded-md text-fg-muted"
                  onClick={() => setSidebarOpen(false)}
                  aria-label="Close"
                >
                  <X className="size-4" />
                </button>
              </div>
              <SidebarBody
                mode={mode}
                modeMeta={modeMeta}
                log={log}
                step={step}
                selected={selected}
                onMode={handleMode}
              />
            </aside>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function SidebarBody({
  mode,
  modeMeta,
  log,
  step,
  selected,
  onMode,
}: {
  mode: HiveModeId;
  modeMeta: (typeof HIVE_MODES)[number];
  log: ReasonStep[];
  step: ReasonStep | null;
  selected: HiveNode | null;
  onMode: (id: HiveModeId) => void;
}) {
  return (
    <>
      <div className="border-b border-border/70 px-4 py-3 max-md:hidden">
        <p className="text-[10px] font-medium tracking-[0.12em] text-fg-subtle uppercase">
          Educational framing · evidence check · pick a mode
        </p>
        <p className="mt-1 text-sm font-semibold text-fg">Formation modes</p>
        <p className="mt-1 text-[11px] text-fg-muted">
          Each mode is a different reasoning shape — spine, triangle, diamond, rings, lanes,
          helix, star.
        </p>
      </div>

      <div className="min-h-0 flex-1 space-y-1.5 overflow-y-auto p-3">
        {HIVE_MODES.map((m) => {
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

        <div className="mt-3 rounded-lg border border-border/80 bg-bg/50 p-3">
          <p className="text-[10px] font-medium tracking-wide text-accent uppercase">
            Advanced · Learning universe
          </p>
          <p className="mt-1.5 text-[11px] leading-relaxed text-fg-muted">
            Geometric polyhedra (icosa / octa / dodeca by role). Deep-universe lighting. Zoom
            with ±, scroll, or pinch.
          </p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            <span className="rounded-full border border-accent/40 bg-accent/15 px-2.5 py-1 text-[10px] font-medium text-fg">
              Geometric
            </span>
            <span className="rounded-full border border-accent/40 bg-accent/15 px-2.5 py-1 text-[10px] font-medium text-fg">
              Deep universe
            </span>
          </div>
        </div>
      </div>

      <div className="max-h-[38%] shrink-0 border-t border-border/70">
        <div className="flex items-center gap-2 px-4 py-2">
          <ShieldCheck className="size-3.5 text-success" aria-hidden />
          <p className="text-[11px] font-medium text-fg">Reasoning log</p>
          <span className="ml-auto font-mono text-[10px] text-fg-subtle">{modeMeta.title}</span>
        </div>
        <ol className="max-h-40 space-y-1.5 overflow-y-auto px-3 pb-3">
          {log.length === 0 ? (
            <li className="rounded-md border border-dashed border-border px-2.5 py-2 text-[11px] text-fg-subtle">
              Play a formation — steps appear as the active reasoning process runs.
            </li>
          ) : (
            log.map((s, i) => (
              <li
                key={`${s.id}-${i}`}
                className={cn(
                  "rounded-md border px-2.5 py-2",
                  step?.id === s.id
                    ? "border-accent/40 bg-accent/10"
                    : "border-border/70 bg-bg/40",
                )}
              >
                <p className="text-[11px] font-semibold text-fg">{s.title}</p>
                <p className="mt-0.5 text-[10px] leading-snug text-fg-muted">{s.detail}</p>
              </li>
            ))
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
              Claim posture: {selected.status}
            </p>
          ) : null}
        </div>
      ) : null}
    </>
  );
}

/** Mode-specific 2D map layouts so Map view also shows distinct reasoning shapes */
function mapLayoutForMode(mode: HiveModeId) {
  const n = MAP_CARDS.length;
  return MAP_CARDS.map((c, i) => {
    const t = i / Math.max(n - 1, 1);
    let x = 50;
    let y = 50;
    switch (mode) {
      case "mission-spine": {
        // vertical spine with side satellites
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
      case "integrity-triangle": {
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
      case "claim-diamond": {
        // diamond: top, left, right, bottom, then ring
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
      case "sense-reason-build": {
        // three horizontal bands
        const band = i % 3;
        const inBand = Math.floor(i / 3);
        const countBand = Math.ceil(n / 3);
        x = 12 + (inBand / Math.max(countBand - 1, 1)) * 76;
        y = 22 + band * 28;
        break;
      }
      case "four-agent": {
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
      case "star-burst": {
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
        // honeycomb-ish radial rings
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
    const onPointerUp = (e: PointerEvent) => {
      drag.current = null;
      try {
        el.releasePointerCapture(e.pointerId);
      } catch {
        /* ignore */
      }
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
      if (pinch.current) pinch.current = null;
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
          Map · {HIVE_MODES.find((m) => m.id === mode)?.title} shape · drag to pan · scroll /
          pinch / ± to zoom
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
        {/* connector hints for shape readability */}
        <svg
          className="pointer-events-none absolute inset-0 h-full w-full opacity-40"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          aria-hidden
        >
          {mode === "integrity-triangle" ? (
            <polygon
              points="50,18 22,72 78,72"
              fill="none"
              stroke="rgb(167 139 250)"
              strokeWidth="0.4"
            />
          ) : null}
          {mode === "claim-diamond" ? (
            <polygon
              points="50,14 22,48 50,82 78,48"
              fill="none"
              stroke="rgb(196 181 253)"
              strokeWidth="0.4"
            />
          ) : null}
          {mode === "star-burst" ? (
            <circle
              cx="50"
              cy="50"
              r="28"
              fill="none"
              stroke="rgb(103 232 249)"
              strokeWidth="0.25"
            />
          ) : null}
        </svg>

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
