/**
 * In-memory decision graph store.
 * Durable pattern for demo + future persistence — not a full KG platform.
 */

import type {
  ReasonChapter,
  ReasoningDepth,
  ReasonStep,
} from "@/data/hive-universe";
import {
  CAUSAL_EDGE_KINDS,
  type ConflictFlag,
  type DecisionEdge,
  type DecisionGraphSnapshot,
  type DecisionNode,
  type EdgeKind,
  type HumanCallEvent,
  type RecordDecisionInput,
} from "./schema";

/** PLAY timing: base gaps × 1.75 so cards stay readable. */
export const PLAY_STEP_GAP_SEC = 1.7 * 1.75; // ~2.975s between steps
export const PLAY_FIRST_STEP_AT = 0.4 * 1.75; // ~0.7s
/** Hold last step before loop (scene also uses this scale). */
export const PLAY_END_DWELL_SEC = 2.8 * 1.75; // ~4.9s

function uid(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

function nowIso() {
  return new Date().toISOString();
}

/** Plain-language label for claim status (UI + PLAY details). */
export function statusInPlainWords(status: DecisionNode["status"]): string {
  switch (status) {
    case "Supported":
      return "Supported — carefully backed by original records";
    case "Unproven":
      return "Unproven — still open; do not overclaim";
    case "Disputed":
      return "Disputed — the disagreement stays visible";
    case "Human call":
      return "Human decision — a person accepted the leftover risk";
    default:
      return status;
  }
}

export function reasoningInPlainWords(
  kind: DecisionNode["reasoningKind"] | undefined,
): string | null {
  if (!kind) return null;
  switch (kind) {
    case "Evidence":
      return "How we know: Evidence (from an original record)";
    case "Inference":
      return "How we know: Careful guess (drawn from evidence — not raw proof)";
    case "Assumption":
      return "How we know: Assumption (working premise for now)";
    default:
      return null;
  }
}

function phaseToChapter(phase?: DecisionNode["phase"]): ReasonChapter | undefined {
  if (!phase) return undefined;
  const map: Record<NonNullable<DecisionNode["phase"]>, ReasonChapter> = {
    frame: "Frame",
    sense: "Sense",
    reason: "Reason",
    coordinate: "Coordinate",
    build: "Build",
    ship: "Ship",
    freeze: "Freeze",
  };
  return map[phase];
}

export class DecisionStore {
  private nodes = new Map<string, DecisionNode>();
  private edges: DecisionEdge[] = [];
  private conflicts: ConflictFlag[] = [];
  title: string;
  description: string;
  leafId: string;

  constructor(opts?: {
    title?: string;
    description?: string;
    leafId?: string;
  }) {
    this.title = opts?.title ?? "Hive decision graph";
    this.description = opts?.description ?? "";
    this.leafId = opts?.leafId ?? "";
  }

  recordDecision(input: RecordDecisionInput): DecisionNode {
    if (input.status === "Human call" && !input.humanCall) {
      throw new Error(
        "Human call status requires a recorded HumanCallEvent (hard gate).",
      );
    }
    if (input.confidence < 0 || input.confidence > 1) {
      throw new Error("confidence must be between 0 and 1");
    }

    const timestamp = input.timestamp ?? nowIso();
    const node: DecisionNode = {
      id: input.id ?? uid("dec"),
      title: input.title,
      scenario: input.scenario,
      outcome: input.outcome,
      status: input.status,
      reasoningKind: input.reasoningKind,
      reasoning: input.reasoning,
      confidence: input.confidence,
      decisionMaker: input.decisionMaker,
      timestamp,
      focusNodeIds: [...input.focusNodeIds],
      provenance: {
        source: input.provenance.source,
        agent: input.provenance.agent,
        recordedAt: input.provenance.recordedAt ?? timestamp,
        note: input.provenance.note,
      },
      humanCall: input.humanCall,
      phase: input.phase,
      chapter: input.chapter ?? phaseToChapter(input.phase),
      playWeight: input.playWeight ?? "spine",
      depthTier: input.depthTier ?? "core",
      metadata: input.metadata,
    };
    this.nodes.set(node.id, node);
    return node;
  }

  addEdge(
    from: string,
    to: string,
    kind: EdgeKind,
    note?: string,
  ): DecisionEdge {
    if (!this.nodes.has(from) || !this.nodes.has(to)) {
      throw new Error(`addEdge: unknown node (${from} → ${to})`);
    }
    const edge: DecisionEdge = {
      id: uid("edge"),
      from,
      to,
      kind,
      note,
    };
    this.edges.push(edge);
    return edge;
  }

  flagConflict(a: string, b: string, note: string): ConflictFlag {
    if (!this.nodes.has(a) || !this.nodes.has(b)) {
      throw new Error("flagConflict: unknown node");
    }
    this.addEdge(a, b, "conflicts-with", note);
    for (const id of [a, b]) {
      const n = this.nodes.get(id)!;
      if (n.status !== "Human call") {
        this.nodes.set(id, { ...n, status: "Disputed" });
      }
    }
    const flag: ConflictFlag = {
      id: uid("cf"),
      a,
      b,
      note,
      flaggedAt: nowIso(),
      resolved: false,
    };
    this.conflicts.push(flag);
    return flag;
  }

  recordHumanCall(decisionId: string, event: HumanCallEvent): DecisionNode {
    const n = this.nodes.get(decisionId);
    if (!n) throw new Error(`recordHumanCall: unknown ${decisionId}`);
    const updated: DecisionNode = {
      ...n,
      status: "Human call",
      humanCall: event,
      timestamp: event.decidedAt,
    };
    this.nodes.set(decisionId, updated);
    this.leafId = decisionId;
    return updated;
  }

  get(id: string): DecisionNode | undefined {
    return this.nodes.get(id);
  }

  listNodes(): DecisionNode[] {
    return [...this.nodes.values()].sort((a, b) =>
      a.timestamp.localeCompare(b.timestamp),
    );
  }

  listEdges(): DecisionEdge[] {
    return [...this.edges];
  }

  listConflicts(): ConflictFlag[] {
    return [...this.conflicts];
  }

  /**
   * Walk upstream from leaf via caused / influenced / precedent-for.
   * Returns root → leaf order. Side-only nodes are skipped if not on the path.
   */
  traceDecisionChain(
    leafId: string = this.leafId,
    maxDepth = 48,
  ): DecisionNode[] {
    if (!leafId || !this.nodes.has(leafId)) return [];

    const parentOf = new Map<string, { parent: string; kind: EdgeKind }>();
    for (const e of this.edges) {
      if (!CAUSAL_EDGE_KINDS.includes(e.kind)) continue;
      // Prefer spine parents: if already set, keep first spine edge
      if (!parentOf.has(e.to)) {
        parentOf.set(e.to, { parent: e.from, kind: e.kind });
      }
    }

    const chain: DecisionNode[] = [];
    let cur: string | undefined = leafId;
    let depth = 0;
    const seen = new Set<string>();
    while (cur && depth < maxDepth && !seen.has(cur)) {
      seen.add(cur);
      const node = this.nodes.get(cur);
      if (node && (node.playWeight ?? "spine") !== "side") {
        chain.push(node);
      } else if (node) {
        // side node on path — still walk up but don't include in PLAY spine
        chain.push(node);
      }
      cur = parentOf.get(cur)?.parent;
      depth++;
    }
    // Filter side after reverse so PLAY is spine-only
    return chain
      .reverse()
      .filter((n) => (n.playWeight ?? "spine") !== "side");
  }

  /**
   * Convert causal chain into ReasonStep script for Hive PLAY FLOW.
   * - Spine only (side drafts/conflicts stay in export, not default PLAY)
   * - depth "moderate" = core tiers; "deep" = core + deep tiers
   */
  chainToReasonSteps(
    chain: DecisionNode[] = this.traceDecisionChain(),
    depth: ReasoningDepth = "deep",
    stepGap = PLAY_STEP_GAP_SEC,
  ): ReasonStep[] {
    const filtered = chain.filter((node) => {
      const tier = node.depthTier ?? "core";
      if (depth === "moderate") return tier === "core";
      return true;
    });

    return filtered.map((node, i) => {
      const edgePairs = this.edgePairsForStep(node, filtered[i - 1]);
      const parts: string[] = [];

      parts.push(`We asked: ${node.scenario}`);
      const kindLine = reasoningInPlainWords(node.reasoningKind);
      if (kindLine) parts.push(kindLine);
      parts.push(node.reasoning);
      parts.push(`What we decided: ${node.outcome}`);

      if (node.status === "Disputed") {
        parts.push("A disagreement is still visible — nothing was silently overwritten.");
      }
      if (node.humanCall) {
        parts.push(
          `Person who signed off: ${node.humanCall.decidedBy}. Note: ${node.humanCall.note}`,
        );
      }

      return {
        id: node.id,
        t: PLAY_FIRST_STEP_AT + i * stepGap,
        title: node.title,
        detail: parts.join(" "),
        focusNodeIds: node.focusNodeIds,
        edgePairs: edgePairs.length ? edgePairs : undefined,
        statusTone: node.status,
        chapter: (node.chapter as ReasonChapter | undefined) ?? phaseToChapter(node.phase),
        depthTier: node.depthTier ?? "core",
        playWeight: "spine",
      };
    });
  }

  private edgePairsForStep(
    node: DecisionNode,
    prev?: DecisionNode,
  ): [string, string][] {
    const pairs: [string, string][] = [];
    if (prev) {
      const a = prev.focusNodeIds[0];
      const b = node.focusNodeIds[0];
      if (a && b && a !== b) pairs.push([a, b]);
    }
    for (let i = 0; i < node.focusNodeIds.length - 1; i++) {
      const a = node.focusNodeIds[i]!;
      const b = node.focusNodeIds[i + 1]!;
      if (a !== b) pairs.push([a, b]);
    }
    return pairs.slice(0, 6);
  }

  exportGraph(): DecisionGraphSnapshot {
    return {
      version: 1,
      title: this.title,
      description: this.description,
      nodes: this.listNodes(),
      edges: this.listEdges(),
      conflicts: this.listConflicts(),
      leafId: this.leafId,
    };
  }

  static fromSnapshot(snap: DecisionGraphSnapshot): DecisionStore {
    const store = new DecisionStore({
      title: snap.title,
      description: snap.description,
      leafId: snap.leafId,
    });
    for (const n of snap.nodes) {
      store.nodes.set(n.id, n);
    }
    store.edges = snap.edges.map((e) => ({ ...e }));
    store.conflicts = snap.conflicts.map((c) => ({ ...c }));
    return store;
  }
}
