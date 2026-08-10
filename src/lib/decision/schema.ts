/**
 * Hive decision / claim schema — pattern-only durable substrate.
 * Inspired by decision-intelligence graphs (record, causal edges, conflict flags,
 * provenance, human gate). Not a Semantica dependency; no "powered by" claim.
 */

import type { ClaimStatus } from "@/data/hive-universe";

export type { ClaimStatus };

export type ReasoningKind = "Evidence" | "Inference" | "Assumption";

export type EdgeKind =
  | "evidence-of"
  | "inferred-from"
  | "conflicts-with"
  | "caused"
  | "influenced"
  | "precedent-for";

export type Provenance = {
  source: string;
  agent: string;
  recordedAt: string;
  note?: string;
};

/** Human final call is a recorded hard gate — never a slogan. */
export type HumanCallEvent = {
  decidedBy: string;
  decidedAt: string;
  note: string;
  acceptedRisk: string;
};

/** Optional chapter for long chains (UI grouping). */
export type DecisionPhase =
  | "frame"
  | "sense"
  | "reason"
  | "coordinate"
  | "build"
  | "ship"
  | "freeze";

export type PlayWeight = "spine" | "side";

/** core = included in moderate + deep; deep = deep PLAY only */
export type DepthTier = "core" | "deep";

export type DecisionNode = {
  id: string;
  title: string;
  scenario: string;
  outcome: string;
  status: ClaimStatus;
  reasoningKind?: ReasoningKind;
  reasoning: string;
  confidence: number;
  decisionMaker: string;
  timestamp: string;
  /** Hive formation node ids for visual focus during replay */
  focusNodeIds: string[];
  provenance: Provenance;
  humanCall?: HumanCallEvent;
  phase?: DecisionPhase;
  chapter?: string;
  playWeight?: PlayWeight;
  depthTier?: DepthTier;
  metadata?: Record<string, string | number | boolean>;
};

export type DecisionEdge = {
  id: string;
  from: string;
  to: string;
  kind: EdgeKind;
  note?: string;
};

export type ConflictFlag = {
  id: string;
  a: string;
  b: string;
  note: string;
  flaggedAt: string;
  resolved: false; // public Hive never auto-resolves
};

export type DecisionGraphSnapshot = {
  version: 1;
  title: string;
  description: string;
  nodes: DecisionNode[];
  edges: DecisionEdge[];
  conflicts: ConflictFlag[];
  /** Leaf decision id used as default Mission Spine replay tip */
  leafId: string;
};

export type RecordDecisionInput = {
  id?: string;
  title: string;
  scenario: string;
  outcome: string;
  status: ClaimStatus;
  reasoningKind?: ReasoningKind;
  reasoning: string;
  confidence: number;
  decisionMaker: string;
  timestamp?: string;
  focusNodeIds: string[];
  provenance: Omit<Provenance, "recordedAt"> & { recordedAt?: string };
  humanCall?: HumanCallEvent;
  phase?: DecisionPhase;
  chapter?: string;
  playWeight?: PlayWeight;
  depthTier?: DepthTier;
  metadata?: Record<string, string | number | boolean>;
};

/** Causal edge kinds used when walking a Mission Spine chain */
export const CAUSAL_EDGE_KINDS: EdgeKind[] = [
  "caused",
  "influenced",
  "precedent-for",
];
