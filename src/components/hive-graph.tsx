/**
 * Decorative public knowledge-graph hero — principle-level nodes only.
 * No private inventory, ports, paths, or personal data.
 */

type NodeDef = {
  id: string;
  x: number;
  y: number;
  label: string;
  sub: string;
  fill: string;
  stroke: string;
  size: "lg" | "md" | "sm";
};

const NODES: NodeDef[] = [
  {
    id: "core",
    x: 400,
    y: 250,
    label: "HIVE",
    sub: "Brain",
    fill: "url(#coreGrad)",
    stroke: "#c4b5fd",
    size: "lg",
  },
  {
    id: "ctrl",
    x: 250,
    y: 150,
    label: "AOS",
    sub: "Control",
    fill: "url(#violetGrad)",
    stroke: "#a78bfa",
    size: "md",
  },
  {
    id: "know",
    x: 550,
    y: 140,
    label: "KNOW",
    sub: "Hive",
    fill: "url(#cyanGrad)",
    stroke: "#22d3ee",
    size: "md",
  },
  {
    id: "reason",
    x: 620,
    y: 280,
    label: "REASON",
    sub: "Scrutinize",
    fill: "url(#blueGrad)",
    stroke: "#60a5fa",
    size: "md",
  },
  {
    id: "civic",
    x: 520,
    y: 390,
    label: "CIVIC",
    sub: "Public",
    fill: "url(#mintGrad)",
    stroke: "#34d399",
    size: "md",
  },
  {
    id: "tutor",
    x: 280,
    y: 390,
    label: "TUTOR",
    sub: "Craft",
    fill: "url(#amberGrad)",
    stroke: "#fbbf24",
    size: "md",
  },
  {
    id: "priv",
    x: 180,
    y: 280,
    label: "FENCE",
    sub: "Private",
    fill: "url(#roseGrad)",
    stroke: "#f472b6",
    size: "md",
  },
  {
    id: "arch",
    x: 400,
    y: 110,
    label: "ARCHIVE",
    sub: "Fidelity",
    fill: "url(#slateGrad)",
    stroke: "#94a3b8",
    size: "sm",
  },
];

const EDGES: [string, string][] = [
  ["core", "ctrl"],
  ["core", "know"],
  ["core", "reason"],
  ["core", "civic"],
  ["core", "tutor"],
  ["core", "priv"],
  ["core", "arch"],
  ["ctrl", "know"],
  ["know", "reason"],
  ["civic", "tutor"],
  ["priv", "arch"],
];

const SIZE = { lg: 58, md: 42, sm: 32 } as const;

function hexPoints(cx: number, cy: number, r: number): string {
  const pts: string[] = [];
  for (let i = 0; i < 6; i++) {
    const a = (Math.PI / 180) * (60 * i - 30);
    pts.push(`${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`);
  }
  return pts.join(" ");
}

function nodeById(id: string) {
  return NODES.find((n) => n.id === id)!;
}

export function HiveGraph({ className = "" }: { className?: string }) {
  return (
    <div className={`relative ${className}`} aria-hidden="true">
      <div className="pointer-events-none absolute inset-0 hive-pulse rounded-full bg-[radial-gradient(circle,rgb(139_92_246/0.22),transparent_62%)]" />
      <svg
        viewBox="0 0 800 500"
        className="relative h-full w-full hive-drift"
        role="img"
        aria-label="Hive Brain knowledge graph: control plane, knowledge, reasoning, public products, private fence, archive"
      >
        <defs>
          <linearGradient id="coreGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#4c1d95" stopOpacity="0.9" />
          </linearGradient>
          <linearGradient id="violetGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#a78bfa" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#5b21b6" stopOpacity="0.75" />
          </linearGradient>
          <linearGradient id="cyanGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#67e8f9" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#0e7490" stopOpacity="0.75" />
          </linearGradient>
          <linearGradient id="blueGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#93c5fd" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#1d4ed8" stopOpacity="0.75" />
          </linearGradient>
          <linearGradient id="mintGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6ee7b7" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#047857" stopOpacity="0.75" />
          </linearGradient>
          <linearGradient id="amberGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fcd34d" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#b45309" stopOpacity="0.75" />
          </linearGradient>
          <linearGradient id="roseGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f9a8d4" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#9d174d" stopOpacity="0.75" />
          </linearGradient>
          <linearGradient id="slateGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#cbd5e1" stopOpacity="0.75" />
            <stop offset="100%" stopColor="#334155" stopOpacity="0.8" />
          </linearGradient>
          <linearGradient id="edgeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.55" />
            <stop offset="50%" stopColor="#22d3ee" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#a78bfa" stopOpacity="0.55" />
          </linearGradient>
          <filter id="softGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="coreGlow" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="10" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <g opacity="0.22" fontFamily="ui-monospace, monospace" fontSize="8" fill="#94a3b8">
          <rect x="48" y="70" width="90" height="58" rx="6" fill="#0f172a" stroke="#334155" />
          <text x="58" y="90">claim := evidence</text>
          <text x="58" y="104">status: Supported</text>
          <text x="58" y="118">human_call()</text>
          <rect x="660" y="80" width="96" height="58" rx="6" fill="#0f172a" stroke="#334155" />
          <text x="670" y="100">replicate()</text>
          <text x="670" y="114">fidelity.lock</text>
          <text x="670" y="128">!engagement</text>
          <rect x="640" y="360" width="100" height="58" rx="6" fill="#0f172a" stroke="#334155" />
          <text x="650" y="380">public.ship</text>
          <text x="650" y="394">private.fence</text>
          <text x="650" y="408">archive.freeze</text>
        </g>

        {EDGES.map(([a, b], i) => {
          const na = nodeById(a);
          const nb = nodeById(b);
          return (
            <line
              key={`${a}-${b}`}
              x1={na.x}
              y1={na.y}
              x2={nb.x}
              y2={nb.y}
              stroke="url(#edgeGrad)"
              strokeWidth={a === "core" || b === "core" ? 1.6 : 1}
              className="hive-line"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          );
        })}

        {[
          [120, 120, "#a78bfa"],
          [700, 200, "#22d3ee"],
          [150, 400, "#34d399"],
          [680, 420, "#f472b6"],
          [360, 60, "#60a5fa"],
          [460, 460, "#fbbf24"],
          [90, 250, "#c4b5fd"],
          [720, 300, "#67e8f9"],
        ].map(([x, y, c], i) => (
          <polygon
            key={i}
            points={hexPoints(x as number, y as number, 10 + (i % 3) * 2)}
            fill={c as string}
            fillOpacity={0.35}
            stroke={c as string}
            strokeOpacity={0.6}
            strokeWidth={0.8}
            filter="url(#softGlow)"
          />
        ))}

        {NODES.map((n) => {
          const r = SIZE[n.size];
          return (
            <g key={n.id} filter={n.id === "core" ? "url(#coreGlow)" : "url(#softGlow)"}>
              <polygon
                points={hexPoints(n.x, n.y, r + 6)}
                fill="none"
                stroke={n.stroke}
                strokeOpacity={0.25}
                strokeWidth={1}
              />
              <polygon
                points={hexPoints(n.x, n.y, r)}
                fill={n.fill}
                stroke={n.stroke}
                strokeWidth={1.5}
                strokeOpacity={0.9}
              />
              <text
                x={n.x}
                y={n.y - 4}
                textAnchor="middle"
                fill="#f8fafc"
                fontSize={n.size === "lg" ? 13 : 10}
                fontWeight={600}
                fontFamily="Segoe UI, system-ui, sans-serif"
              >
                {n.label}
              </text>
              <text
                x={n.x}
                y={n.y + 12}
                textAnchor="middle"
                fill="#e2e8f0"
                fontSize={n.size === "lg" ? 10 : 8}
                opacity={0.85}
                fontFamily="Segoe UI, system-ui, sans-serif"
              >
                {n.sub}
              </text>
            </g>
          );
        })}

        <circle cx="400" cy="250" r="14" fill="#e9d5ff" opacity="0.9" filter="url(#coreGlow)" />
        <circle cx="400" cy="250" r="6" fill="#ffffff" opacity="0.95" />
      </svg>
    </div>
  );
}
