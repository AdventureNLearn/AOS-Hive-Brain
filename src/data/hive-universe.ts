/**
 * Public Hive universe — principle-level nodes only.
 * Voice: a careful high-school senior should understand every public label.
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

export const HIVE_NODES: HiveNode[] = [
  {
    id: "hive",
    label: "Hive Brain",
    short: "HIVE",
    kind: "core",
    color: "#c4b5fd",
    blurb: "The shared center of the building. Public tools grow out from here.",
  },
  {
    id: "aos",
    label: "Workshop rules",
    short: "RULES",
    kind: "layer",
    color: "#a78bfa",
    blurb: "The floor for purpose and product discipline — the house rules.",
  },
  {
    id: "know",
    label: "Knowledge floor",
    short: "KNOW",
    kind: "layer",
    color: "#22d3ee",
    blurb: "Where notes and sources live so work does not vanish when a chat ends.",
  },
  {
    id: "archive",
    label: "Archive floor",
    short: "SAVE",
    kind: "layer",
    color: "#94a3b8",
    blurb: "Finished chapters get saved honestly — no rewriting the past to look prettier.",
  },
  {
    id: "fence",
    label: "Private floor",
    short: "FENCE",
    kind: "layer",
    color: "#f472b6",
    blurb: "Experiments stay behind this fence until someone chooses to make them public.",
  },
  {
    id: "evidence",
    label: "Evidence",
    short: "EVID",
    kind: "integrity",
    color: "#34d399",
    blurb: "What the original record actually shows. Prefer this over “I heard that…”.",
  },
  {
    id: "inference",
    label: "Careful guess",
    short: "INFER",
    kind: "integrity",
    color: "#60a5fa",
    blurb: "A conclusion you carefully drew from evidence — keep the label on so no one confuses it with proof.",
  },
  {
    id: "assumption",
    label: "Assumption",
    short: "ASSUM",
    kind: "integrity",
    color: "#fbbf24",
    blurb: "Something you are taking as true for now. Useful — not proven.",
  },
  {
    id: "supported",
    label: "Supported",
    short: "SUP",
    kind: "claim",
    status: "Supported",
    color: "#6ee7b7",
    blurb: "Strong enough to use carefully, with the source still in view.",
  },
  {
    id: "unproven",
    label: "Unproven",
    short: "UNP",
    kind: "claim",
    status: "Unproven",
    color: "#fcd34d",
    blurb: "Still open. Do not dress this up as certainty.",
  },
  {
    id: "disputed",
    label: "Disputed",
    short: "DIS",
    kind: "claim",
    status: "Disputed",
    color: "#fb7185",
    blurb: "People or sources disagree. Keep the argument visible — do not hide it.",
  },
  {
    id: "human",
    label: "Human decision",
    short: "HUMAN",
    kind: "claim",
    status: "Human call",
    color: "#e9d5ff",
    blurb: "A real person decides what is true enough to share — and owns the leftover risk.",
  },
  {
    id: "sense",
    label: "Look first",
    short: "LOOK",
    kind: "process",
    color: "#67e8f9",
    blurb: "Notice what is going on before you invent a story or start building.",
  },
  {
    id: "reason",
    label: "Think carefully",
    short: "THINK",
    kind: "process",
    color: "#818cf8",
    blurb: "Organize your scrutiny. Tools can help; they do not get to declare truth alone.",
  },
  {
    id: "build",
    label: "Build",
    short: "BUILD",
    kind: "process",
    color: "#f0abfc",
    blurb: "Make the public thing only after looking and thinking carefully.",
  },
  {
    id: "architect",
    label: "Planner",
    short: "PLAN",
    kind: "agent",
    color: "#93c5fd",
    blurb: "Shapes the structure and boundaries — how the rooms connect.",
  },
  {
    id: "builder",
    label: "Maker",
    short: "MAKE",
    kind: "agent",
    color: "#86efac",
    blurb: "Builds the surface people actually use.",
  },
  {
    id: "critic",
    label: "Checker",
    short: "CHECK",
    kind: "agent",
    color: "#fda4af",
    blurb: "Stress-tests overclaims, private leaks, and “looks good enough” theater.",
  },
  {
    id: "integrator",
    label: "Merger",
    short: "MERGE",
    kind: "agent",
    color: "#c4b5fd",
    blurb: "Brings parallel work into one honest delivery.",
  },
  {
    id: "civic",
    label: "Civic tools",
    short: "CIVIC",
    kind: "product",
    color: "#2dd4bf",
    blurb: "Public map-style tools for claims — everyday language.",
  },
  {
    id: "tutor",
    label: "Learning path",
    short: "LEARN",
    kind: "product",
    color: "#fbbf24",
    blurb: "Craft learning that sticks — not “time spent staring at a screen.”",
  },
  {
    id: "replication",
    label: "Someone else can continue",
    short: "CONT",
    kind: "tool",
    color: "#a5b4fc",
    blurb: "Another careful person could pick this up from the written record alone.",
  },
  {
    id: "fidelity",
    label: "Honest history",
    short: "HONEST",
    kind: "tool",
    color: "#67e8f9",
    blurb: "History stays true; we do not polish it into fiction.",
  },
  {
    id: "engagement-out",
    label: "Not popularity",
    short: "!POP",
    kind: "tool",
    color: "#94a3b8",
    blurb: "Likes and watch-time are not how we decide if work is ready.",
  },
];

export type ShapeCategoryId =
  | "orient"
  | "integrity"
  | "mission"
  | "coordinate"
  | "surface";

export type HiveModeId =
  | "honeycomb"
  | "layer-stack"
  | "welcome-path"
  | "map-atlas"
  | "integrity-triangle"
  | "claim-diamond"
  | "provenance-chain"
  | "honest-gap"
  | "mission-spine"
  | "sense-reason-build"
  | "ship-gate"
  | "freeze-era"
  | "four-agent"
  | "sync-gate"
  | "edge-permission"
  | "fresh-verifier"
  | "field-helix"
  | "star-burst"
  | "civic-lens"
  | "tutor-path";

export type HiveMode = {
  id: HiveModeId;
  category: ShapeCategoryId;
  title: string;
  subtitle: string;
  description: string;
};

export type ShapeCategory = {
  id: ShapeCategoryId;
  title: string;
  plain: string;
  blurb: string;
};

export const SHAPE_CATEGORIES: ShapeCategory[] = [
  {
    id: "orient",
    title: "Orient",
    plain: "Look around first",
    blurb: "Walk the building. Learn the floors before you force a big mission.",
  },
  {
    id: "integrity",
    title: "Integrity",
    plain: "Say how you know",
    blurb: "Evidence, careful guesses, open holes, and honest labels — nothing quietly becomes “proven.”",
  },
  {
    id: "mission",
    title: "Mission",
    plain: "Finish one honest job",
    blurb: "From first question to careful share: order of work, a ship checklist, and saving the chapter.",
  },
  {
    id: "coordinate",
    title: "Coordinate",
    plain: "Share carefully",
    blurb: "When people work side by side, share short checked notes — full dumps can spread mistakes.",
  },
  {
    id: "surface",
    title: "Surface",
    plain: "What the public sees",
    blurb: "Civic maps, learning paths, field loops, and the few rules that never move.",
  },
];

export type ReasoningDepth = "moderate" | "deep";

export type ReasonChapter =
  | "Frame"
  | "Sense"
  | "Reason"
  | "Coordinate"
  | "Build"
  | "Ship"
  | "Freeze";

/** High-school-friendly chapter labels (engineers still get the structure). */
export const CHAPTER_PLAIN: Record<ReasonChapter, string> = {
  Frame: "Start",
  Sense: "Look",
  Reason: "Think",
  Coordinate: "Team up",
  Build: "Build",
  Ship: "Share",
  Freeze: "Save",
};

export type ReasonStep = {
  id: string;
  t: number;
  title: string;
  detail: string;
  focusNodeIds: string[];
  edgePairs?: [string, string][];
  statusTone?: ClaimStatus;
  chapter?: ReasonChapter;
  depthTier?: "core" | "deep";
  playWeight?: "spine" | "side";
};

export const HIVE_MODES: HiveMode[] = [
  {
    id: "honeycomb",
    category: "orient",
    title: "Honeycomb",
    subtitle: "Look around first — no forced mission yet",
    description:
      "A gentle map of the whole building. Best when you are new and want to learn the floors before shipping anything.",
  },
  {
    id: "layer-stack",
    category: "orient",
    title: "Floor stack",
    subtitle: "Rules · knowledge · private · archive as floors",
    description:
      "See the Hive as a building with floors that must not blend. Public work stays on public floors.",
  },
  {
    id: "welcome-path",
    category: "orient",
    title: "Welcome path",
    subtitle: "A short first tour",
    description:
      "For anyone new: what this place is, the four honesty words, one demo, then a person decides to continue.",
  },
  {
    id: "map-atlas",
    category: "orient",
    title: "Map atlas",
    subtitle: "Flat cards when 3D feels like a lot",
    description:
      "A simple map of north-star rules, thinking tools, and public products — no pressure to “perform” in 3D.",
  },
  {
    id: "integrity-triangle",
    category: "integrity",
    title: "Integrity triangle",
    subtitle: "Evidence · careful guess · assumption",
    description:
      "Three corners for how we know something. Labels stay on — nothing quietly becomes “proven.”",
  },
  {
    id: "claim-diamond",
    category: "integrity",
    title: "Claim diamond",
    subtitle: "Supported · Unproven · Disputed · Human decision",
    description:
      "Four honest states for any claim. A person sits at the tip and decides what is true enough to share.",
  },
  {
    id: "provenance-chain",
    category: "integrity",
    title: "Source trail",
    subtitle: "Where did this come from?",
    description:
      "Follow a claim back to its source. Second-hand notes never outrank the original record.",
  },
  {
    id: "honest-gap",
    category: "integrity",
    title: "Honest gap",
    subtitle: "Incomplete is allowed",
    description:
      "Leave open holes as Unproven. Filling them with confident fiction is the failure mode.",
  },
  {
    id: "mission-spine",
    category: "mission",
    title: "Mission path",
    subtitle: "One job: idea → evidence → careful share",
    description:
      "A straight path for one public mission. Play walks real recorded decisions, including a conflict and a human sign-off.",
  },
  {
    id: "sense-reason-build",
    category: "mission",
    title: "Look → Think → Build",
    subtitle: "Notice · scrutinize · then make",
    description:
      "Three zones of work in order. Tools may help in the middle; they never get to declare truth alone.",
  },
  {
    id: "ship-gate",
    category: "mission",
    title: "Ship gate",
    subtitle: "Checklist before you go public",
    description:
      "Last checks: private stuff removed, claims labeled, leftover risk accepted by a person.",
  },
  {
    id: "freeze-era",
    category: "mission",
    title: "Save the chapter",
    subtitle: "When a chapter ends, lock the record",
    description:
      "Mark finished work, save the archive, and refuse to rewrite history so it looks smoother.",
  },
  {
    id: "four-agent",
    category: "coordinate",
    title: "Four roles",
    subtitle: "Planner · Maker · Checker · Merger",
    description:
      "Side-by-side roles with one honest merge. Checkers can dispute; a person still owns the final call.",
  },
  {
    id: "sync-gate",
    category: "coordinate",
    title: "Share gate",
    subtitle: "What may cross between roles",
    description:
      "Two people can both be “right” locally and still disagree. A short checked note beats dumping everything.",
  },
  {
    id: "edge-permission",
    category: "coordinate",
    title: "Real links only",
    subtitle: "Only true dependencies get wires",
    description:
      "Cut fake “and then” links. Independent work can fan out; the longest real chain stays honest.",
  },
  {
    id: "fresh-verifier",
    category: "coordinate",
    title: "Fresh eyes",
    subtitle: "Maker never grades their own test",
    description:
      "A separate checker, with fresh context, checks a real signal. Self-check alone is not enough.",
  },
  {
    id: "field-helix",
    category: "surface",
    title: "Learning spiral",
    subtitle: "Observe → claim → talk → improve",
    description:
      "A loop for field work. Each turn should get more honest — not more hyped.",
  },
  {
    id: "star-burst",
    category: "surface",
    title: "Star from the core",
    subtitle: "One honest center · public rays",
    description:
      "Public products radiate from a shared center. Private experiments are not a product ray.",
  },
  {
    id: "civic-lens",
    category: "surface",
    title: "Civic map",
    subtitle: "Public claims in plain words",
    description:
      "Claims on a public map stay everyday language, labeled, and free of private operator clutter.",
  },
  {
    id: "tutor-path",
    category: "surface",
    title: "Learning path",
    subtitle: "Goal → show your work → check transfer",
    description:
      "Lesson goal, visible thinking, then “can you use it?” Success is understanding — not minutes watched.",
  },
];

export function modesInCategory(cat: ShapeCategoryId): HiveMode[] {
  return HIVE_MODES.filter((m) => m.category === cat);
}

export function modeById(id: HiveModeId): HiveMode {
  const m = HIVE_MODES.find((x) => x.id === id);
  if (!m) throw new Error(`Unknown mode: ${id}`);
  return m;
}

export const MAP_CARDS = [
  { id: "lrn", label: "Live session", group: "path", color: "#67e8f9" },
  { id: "pth", label: "Your path", group: "path", color: "#a78bfa" },
  { id: "prg", label: "Progress", group: "path", color: "#34d399" },
  { id: "thk", label: "Thinking tools", group: "tools", color: "#818cf8" },
  { id: "evc", label: "Evidence check", group: "tools", color: "#6ee7b7" },
  { id: "asm", label: "Assumption check", group: "tools", color: "#fcd34d" },
  { id: "ic", label: "Integrity check", group: "tools", color: "#c4b5fd" },
  { id: "sww", label: "Show your work", group: "tools", color: "#93c5fd" },
  { id: "civic", label: "Civic tools", group: "products", color: "#2dd4bf" },
  { id: "tutor", label: "Learning path", group: "products", color: "#fbbf24" },
  { id: "rep", label: "Someone can continue", group: "north", color: "#a5b4fc" },
  { id: "fid", label: "Honest history", group: "north", color: "#67e8f9" },
  { id: "neng", label: "Not popularity", group: "north", color: "#94a3b8" },
  { id: "aos", label: "Workshop rules", group: "layers", color: "#a78bfa" },
  { id: "know", label: "Knowledge floor", group: "layers", color: "#22d3ee" },
  { id: "fence", label: "Private floor", group: "layers", color: "#f472b6" },
  { id: "arch", label: "Archive floor", group: "layers", color: "#94a3b8" },
  { id: "hum", label: "Human decision", group: "integrity", color: "#e9d5ff" },
  { id: "sup", label: "Supported", group: "integrity", color: "#6ee7b7" },
  { id: "unp", label: "Unproven", group: "integrity", color: "#fcd34d" },
  { id: "dis", label: "Disputed", group: "integrity", color: "#fb7185" },
  { id: "hlp", label: "How to use", group: "path", color: "#cbd5e1" },
  { id: "smp", label: "Simple lessons", group: "products", color: "#86efac" },
  { id: "ind", label: "Industries (public)", group: "products", color: "#fda4af" },
] as const;

export const REASONING_SCRIPTS: Partial<Record<HiveModeId, ReasonStep[]>> = {};

export function nodeById(id: string): HiveNode {
  const n = HIVE_NODES.find((x) => x.id === id);
  if (!n) throw new Error(`Unknown hive node: ${id}`);
  return n;
}
