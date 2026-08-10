/**
 * Public Hive universe — principle-level nodes only.
 * No private history, operators inventory, or personal data.
 */

export type ClaimStatus = "Supported" | "Unproven" | "Disputed" | "Human call";

export type HiveNode = {
  id: string;
  label: string;
  short: string;
  kind:
    | "core"
    | "integrity"
    | "claim"
    | "process"
    | "agent"
    | "product"
    | "layer"
    | "tool";
  status?: ClaimStatus;
  color: string;
  blurb: string;
};

export type HiveModeId =
  | "honeycomb"
  | "mission-spine"
  | "integrity-triangle"
  | "claim-diamond"
  | "sense-reason-build"
  | "four-agent"
  | "field-helix"
  | "star-burst";

export type HiveMode = {
  id: HiveModeId;
  title: string;
  subtitle: string;
  description: string;
};

export type ReasonStep = {
  id: string;
  t: number; // seconds into mode play
  title: string;
  detail: string;
  focusNodeIds: string[];
  edgePairs?: [string, string][];
  statusTone?: ClaimStatus;
};

export const HIVE_NODES: HiveNode[] = [
  {
    id: "hive",
    label: "Hive Brain",
    short: "HIVE",
    kind: "core",
    color: "#c4b5fd",
    blurb: "Shared integrity core. Public products radiate from here.",
  },
  {
    id: "aos",
    label: "AOS control",
    short: "AOS",
    kind: "layer",
    color: "#a78bfa",
    blurb: "Control plane — purpose and product discipline.",
  },
  {
    id: "know",
    label: "Knowledge",
    short: "KNOW",
    kind: "layer",
    color: "#22d3ee",
    blurb: "Linked sources that compound — wiki over chat amnesia.",
  },
  {
    id: "archive",
    label: "Archive",
    short: "ARCH",
    kind: "layer",
    color: "#94a3b8",
    blurb: "Finished eras freeze for fidelity.",
  },
  {
    id: "fence",
    label: "Private fence",
    short: "FENCE",
    kind: "layer",
    color: "#f472b6",
    blurb: "Experiments stay private until deliberately promoted.",
  },
  {
    id: "evidence",
    label: "Evidence",
    short: "EVID",
    kind: "integrity",
    color: "#34d399",
    blurb: "Primary record. Prefer this over commentary.",
  },
  {
    id: "inference",
    label: "Inference",
    short: "INF",
    kind: "integrity",
    color: "#60a5fa",
    blurb: "Derived claim — must stay labeled as inference.",
  },
  {
    id: "assumption",
    label: "Assumption",
    short: "ASSUM",
    kind: "integrity",
    color: "#fbbf24",
    blurb: "Working premise. Do not present as proven.",
  },
  {
    id: "supported",
    label: "Supported",
    short: "SUP",
    kind: "claim",
    status: "Supported",
    color: "#6ee7b7",
    blurb: "Backed by primary record enough to use carefully.",
  },
  {
    id: "unproven",
    label: "Unproven",
    short: "UNP",
    kind: "claim",
    status: "Unproven",
    color: "#fcd34d",
    blurb: "Open. Do not overclaim.",
  },
  {
    id: "disputed",
    label: "Disputed",
    short: "DIS",
    kind: "claim",
    status: "Disputed",
    color: "#fb7185",
    blurb: "Conflict remains visible. No silent resolution.",
  },
  {
    id: "human",
    label: "Human call",
    short: "HUMAN",
    kind: "claim",
    status: "Human call",
    color: "#e9d5ff",
    blurb: "A human decides what is true enough to ship.",
  },
  {
    id: "sense",
    label: "Sense",
    short: "SENSE",
    kind: "process",
    color: "#67e8f9",
    blurb: "Outer sense — observe the field without forcing a story.",
  },
  {
    id: "reason",
    label: "Reason",
    short: "REASON",
    kind: "process",
    color: "#818cf8",
    blurb: "Mid reason — structure scrutiny. Models assist.",
  },
  {
    id: "build",
    label: "Build",
    short: "BUILD",
    kind: "process",
    color: "#f0abfc",
    blurb: "Core build — ship only what integrity allows.",
  },
  {
    id: "architect",
    label: "Architect",
    short: "ARCHT",
    kind: "agent",
    color: "#93c5fd",
    blurb: "Shapes structure and interfaces.",
  },
  {
    id: "builder",
    label: "Builder",
    short: "BLD",
    kind: "agent",
    color: "#86efac",
    blurb: "Implements the public-safe surface.",
  },
  {
    id: "critic",
    label: "Critic",
    short: "CRIT",
    kind: "agent",
    color: "#fda4af",
    blurb: "Stress-tests claims and overreach.",
  },
  {
    id: "integrator",
    label: "Integrator",
    short: "INT",
    kind: "agent",
    color: "#c4b5fd",
    blurb: "Merges lanes into one honest delivery.",
  },
  {
    id: "civic",
    label: "Civic suite",
    short: "CIVIC",
    kind: "product",
    color: "#2dd4bf",
    blurb: "Public map-style claims tools — plain language.",
  },
  {
    id: "tutor",
    label: "Educational Tutor",
    short: "TUTOR",
    kind: "product",
    color: "#fbbf24",
    blurb: "Craft learning that transfers — not engagement theater.",
  },
  {
    id: "replication",
    label: "Replication",
    short: "REP",
    kind: "tool",
    color: "#a5b4fc",
    blurb: "Another team could continue from the record.",
  },
  {
    id: "fidelity",
    label: "Fidelity",
    short: "FID",
    kind: "tool",
    color: "#67e8f9",
    blurb: "History stays honest; no polish into fiction.",
  },
  {
    id: "engagement-out",
    label: "Not engagement",
    short: "!ENG",
    kind: "tool",
    color: "#94a3b8",
    blurb: "Attention metrics are not ship criteria.",
  },
];

export const HIVE_MODES: HiveMode[] = [
  {
    id: "honeycomb",
    title: "Honeycomb",
    subtitle: "Default field — equal combs, open exploration",
    description:
      "Browse the integrity field without forcing a delivery path. Good for orientation.",
  },
  {
    id: "mission-spine",
    title: "Mission Spine",
    subtitle: "Frame → Evidence → Route → Practice → Deliver",
    description:
      "Vertical spine for a single honest mission. Satellites hold supporting claims.",
  },
  {
    id: "integrity-triangle",
    title: "Integrity Triangle",
    subtitle: "Evidence · Inference · Assumption",
    description:
      "Force every claim into the triangle. Labels stay visible — no silent upgrade.",
  },
  {
    id: "claim-diamond",
    title: "Claim Diamond",
    subtitle: "Supported · Unproven · Disputed · Human call",
    description:
      "In-state claims with human final call at the tip. Demo of status discipline.",
  },
  {
    id: "sense-reason-build",
    title: "Sense → Reason → Build",
    subtitle: "Outer sense · mid reason · core build",
    description:
      "Three nested zones of work. Tools assist; they do not crown truth.",
  },
  {
    id: "four-agent",
    title: "4-Agent Lanes",
    subtitle: "Architect · Builder · Critic · Integrator",
    description:
      "Parallel lanes, single integrator. Orchestration without silent parallel production.",
  },
  {
    id: "field-helix",
    title: "Field Helix",
    subtitle: "Observe → Claim → Communicate → Progress spiral",
    description:
      "Field learning loop: honest observation, careful claims, clear talk, then progress.",
  },
  {
    id: "star-burst",
    title: "Star Burst",
    subtitle: "Workspace combs as star points",
    description:
      "Product surfaces radiate from a shared integrity core — public-safe only.",
  },
];

/** Public map cards (2D map view) — principle/product labels only */
export const MAP_CARDS = [
  { id: "lrn", label: "Live session", group: "path", color: "#67e8f9" },
  { id: "pth", label: "Your path", group: "path", color: "#a78bfa" },
  { id: "prg", label: "Progress", group: "path", color: "#34d399" },
  { id: "thk", label: "Thinking tools", group: "tools", color: "#818cf8" },
  { id: "evc", label: "Evidence check", group: "tools", color: "#6ee7b7" },
  { id: "asm", label: "Assumption check", group: "tools", color: "#fcd34d" },
  { id: "ic", label: "Integrity check", group: "tools", color: "#c4b5fd" },
  { id: "sww", label: "Show your work", group: "tools", color: "#93c5fd" },
  { id: "civic", label: "Civic suite", group: "products", color: "#2dd4bf" },
  { id: "tutor", label: "Educational Tutor", group: "products", color: "#fbbf24" },
  { id: "rep", label: "Replication", group: "north", color: "#a5b4fc" },
  { id: "fid", label: "Fidelity", group: "north", color: "#67e8f9" },
  { id: "neng", label: "Not engagement", group: "north", color: "#94a3b8" },
  { id: "aos", label: "AOS control", group: "layers", color: "#a78bfa" },
  { id: "know", label: "Knowledge hive", group: "layers", color: "#22d3ee" },
  { id: "fence", label: "Private fence", group: "layers", color: "#f472b6" },
  { id: "arch", label: "Archive freeze", group: "layers", color: "#94a3b8" },
  { id: "hum", label: "Human final call", group: "integrity", color: "#e9d5ff" },
  { id: "sup", label: "Supported", group: "integrity", color: "#6ee7b7" },
  { id: "unp", label: "Unproven", group: "integrity", color: "#fcd34d" },
  { id: "dis", label: "Disputed", group: "integrity", color: "#fb7185" },
  { id: "hlp", label: "How to use", group: "path", color: "#cbd5e1" },
  { id: "smp", label: "Simple lessons", group: "products", color: "#86efac" },
  { id: "ind", label: "Industries (public)", group: "products", color: "#fda4af" },
] as const;

export const REASONING_SCRIPTS: Record<HiveModeId, ReasonStep[]> = {
  honeycomb: [
    {
      id: "h1",
      t: 0.4,
      title: "Open the field",
      detail: "No forced route yet. Scan combs for structure without inventing a narrative.",
      focusNodeIds: ["hive", "know", "aos"],
    },
    {
      id: "h2",
      t: 2.2,
      title: "Separate layers",
      detail: "Control plane, knowledge, private fence, and archive stay distinct rooms.",
      focusNodeIds: ["aos", "know", "fence", "archive"],
      edgePairs: [
        ["hive", "aos"],
        ["hive", "know"],
        ["hive", "fence"],
        ["hive", "archive"],
      ],
    },
    {
      id: "h3",
      t: 4.2,
      title: "Mark integrity tools",
      detail: "Evidence / Inference / Assumption must remain labeled before any claim ships.",
      focusNodeIds: ["evidence", "inference", "assumption"],
      edgePairs: [
        ["evidence", "inference"],
        ["inference", "assumption"],
        ["assumption", "evidence"],
      ],
    },
    {
      id: "h4",
      t: 6.4,
      title: "Public products only",
      detail: "Civic suite and Educational Tutor are the public faces — no private theater.",
      focusNodeIds: ["civic", "tutor", "hive"],
      edgePairs: [
        ["hive", "civic"],
        ["hive", "tutor"],
      ],
    },
  ],
  "mission-spine": [
    {
      id: "m1",
      t: 0.3,
      title: "Frame the mission",
      detail: "State what we are building in public-safe language.",
      focusNodeIds: ["aos", "hive"],
    },
    {
      id: "m2",
      t: 1.8,
      title: "Gather evidence",
      detail: "Primary records first. Commentary is secondary.",
      focusNodeIds: ["evidence", "supported"],
      edgePairs: [["evidence", "supported"]],
      statusTone: "Supported",
    },
    {
      id: "m3",
      t: 3.4,
      title: "Route the work",
      detail: "Choose Sense → Reason → Build. Do not skip scrutiny.",
      focusNodeIds: ["sense", "reason", "build"],
      edgePairs: [
        ["sense", "reason"],
        ["reason", "build"],
      ],
    },
    {
      id: "m4",
      t: 5.2,
      title: "Practice on the surface",
      detail: "Tutor and civic tools stay plain. No operator chrome in the product UI.",
      focusNodeIds: ["tutor", "civic"],
    },
    {
      id: "m5",
      t: 7.0,
      title: "Deliver with human call",
      detail: "Ship only after a human accepts residual risk. Replication beats hype.",
      focusNodeIds: ["human", "replication", "fidelity"],
      edgePairs: [
        ["build", "human"],
        ["human", "replication"],
      ],
      statusTone: "Human call",
    },
  ],
  "integrity-triangle": [
    {
      id: "i1",
      t: 0.3,
      title: "Place Evidence",
      detail: "Corner A: what the primary record actually shows.",
      focusNodeIds: ["evidence"],
      statusTone: "Supported",
    },
    {
      id: "i2",
      t: 2.0,
      title: "Place Inference",
      detail: "Corner B: what we derive. Keep the label — never upgrade to evidence quietly.",
      focusNodeIds: ["inference"],
      edgePairs: [["evidence", "inference"]],
    },
    {
      id: "i3",
      t: 3.6,
      title: "Place Assumption",
      detail: "Corner C: working premises. Visible, challengeable.",
      focusNodeIds: ["assumption"],
      edgePairs: [
        ["inference", "assumption"],
        ["assumption", "evidence"],
      ],
    },
    {
      id: "i4",
      t: 5.4,
      title: "Refuse silent upgrade",
      detail: "If multi-model agreement appears, still require human call before ship.",
      focusNodeIds: ["human", "hive"],
      edgePairs: [["hive", "human"]],
      statusTone: "Human call",
    },
  ],
  "claim-diamond": [
    {
      id: "c1",
      t: 0.3,
      title: "Open claim set",
      detail: "Four in-state claim postures — none is auto-truth.",
      focusNodeIds: ["supported", "unproven", "disputed", "human"],
    },
    {
      id: "c2",
      t: 2.0,
      title: "Supported lane",
      detail: "Primary record backs use. Still cite evidence.",
      focusNodeIds: ["supported", "evidence"],
      edgePairs: [["evidence", "supported"]],
      statusTone: "Supported",
    },
    {
      id: "c3",
      t: 3.6,
      title: "Unproven stays open",
      detail: "Do not paper over gaps with confident fiction.",
      focusNodeIds: ["unproven", "assumption"],
      statusTone: "Unproven",
    },
    {
      id: "c4",
      t: 5.2,
      title: "Disputed remains visible",
      detail: "Conflict is a feature of honesty, not a defect to hide.",
      focusNodeIds: ["disputed", "critic"],
      statusTone: "Disputed",
    },
    {
      id: "c5",
      t: 6.8,
      title: "Human call at the tip",
      detail: "Final ship decision is human — tip of the diamond.",
      focusNodeIds: ["human", "hive"],
      edgePairs: [
        ["supported", "human"],
        ["unproven", "human"],
        ["disputed", "human"],
      ],
      statusTone: "Human call",
    },
  ],
  "sense-reason-build": [
    {
      id: "s1",
      t: 0.3,
      title: "Outer sense",
      detail: "Observe field signals without forcing a conclusion.",
      focusNodeIds: ["sense", "know"],
    },
    {
      id: "s2",
      t: 2.0,
      title: "Mid reason",
      detail: "Structure scrutiny. Models propose; they do not decide.",
      focusNodeIds: ["reason", "evidence", "inference"],
      edgePairs: [
        ["sense", "reason"],
        ["reason", "evidence"],
      ],
    },
    {
      id: "s3",
      t: 3.8,
      title: "Core build",
      detail: "Implement only what integrity and human call allow.",
      focusNodeIds: ["build", "civic", "tutor"],
      edgePairs: [
        ["reason", "build"],
        ["build", "civic"],
        ["build", "tutor"],
      ],
    },
    {
      id: "s4",
      t: 5.8,
      title: "North-star check",
      detail: "Replication and fidelity — not engagement metrics.",
      focusNodeIds: ["replication", "fidelity", "engagement-out"],
      statusTone: "Supported",
    },
  ],
  "four-agent": [
    {
      id: "a1",
      t: 0.3,
      title: "Architect lane",
      detail: "Define public interfaces and boundaries.",
      focusNodeIds: ["architect", "aos"],
    },
    {
      id: "a2",
      t: 1.8,
      title: "Builder lane",
      detail: "Ship the public-safe surface.",
      focusNodeIds: ["builder", "build"],
      edgePairs: [["architect", "builder"]],
    },
    {
      id: "a3",
      t: 3.4,
      title: "Critic lane",
      detail: "Attack overclaims, private leakage, engagement theater.",
      focusNodeIds: ["critic", "disputed"],
      edgePairs: [["builder", "critic"]],
      statusTone: "Disputed",
    },
    {
      id: "a4",
      t: 5.0,
      title: "Integrator merge",
      detail: "One delivery. No silent parallel production of every experiment.",
      focusNodeIds: ["integrator", "human", "hive"],
      edgePairs: [
        ["critic", "integrator"],
        ["architect", "integrator"],
        ["builder", "integrator"],
        ["integrator", "human"],
      ],
      statusTone: "Human call",
    },
  ],
  "field-helix": [
    {
      id: "f1",
      t: 0.3,
      title: "Observe",
      detail: "Honest field observation — Sense first.",
      focusNodeIds: ["sense", "know"],
    },
    {
      id: "f2",
      t: 1.8,
      title: "Claim carefully",
      detail: "Status labels on every claim before communication.",
      focusNodeIds: ["supported", "unproven", "disputed"],
      edgePairs: [
        ["sense", "supported"],
        ["sense", "unproven"],
      ],
    },
    {
      id: "f3",
      t: 3.6,
      title: "Communicate",
      detail: "Plain language for public tools. No private operator surface.",
      focusNodeIds: ["civic", "tutor"],
      edgePairs: [
        ["supported", "civic"],
        ["tutor", "civic"],
      ],
    },
    {
      id: "f4",
      t: 5.4,
      title: "Progress spiral",
      detail: "Each loop tightens fidelity — archive freezes what finished.",
      focusNodeIds: ["replication", "fidelity", "archive"],
      edgePairs: [
        ["civic", "archive"],
        ["archive", "fidelity"],
      ],
    },
  ],
  "star-burst": [
    {
      id: "b1",
      t: 0.3,
      title: "Integrity core",
      detail: "All public rays share one kernel — human final call remains.",
      focusNodeIds: ["hive", "human"],
    },
    {
      id: "b2",
      t: 2.0,
      title: "Radiate products",
      detail: "Civic suite and Educational Tutor as first-class public rays.",
      focusNodeIds: ["civic", "tutor", "hive"],
      edgePairs: [
        ["hive", "civic"],
        ["hive", "tutor"],
      ],
    },
    {
      id: "b3",
      t: 3.8,
      title: "Hold the fence",
      detail: "Private research is a ray that does not merge into public UI.",
      focusNodeIds: ["fence", "archive"],
      edgePairs: [["hive", "fence"]],
    },
    {
      id: "b4",
      t: 5.6,
      title: "Star points as combs",
      detail: "Workspace combs stay principle-level: replication, fidelity, not engagement.",
      focusNodeIds: ["replication", "fidelity", "engagement-out"],
      edgePairs: [
        ["hive", "replication"],
        ["hive", "fidelity"],
        ["hive", "engagement-out"],
      ],
    },
  ],
};

export function nodeById(id: string): HiveNode {
  const n = HIVE_NODES.find((x) => x.id === id);
  if (!n) throw new Error(`Unknown hive node: ${id}`);
  return n;
}
