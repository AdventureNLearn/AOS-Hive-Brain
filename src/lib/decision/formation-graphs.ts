/**
 * Decision graphs for every Hive formation.
 * Specs live in shape-chains.ts (moderate core + deep tiers).
 * PLAY is spine-only; side conflicts stay in export.
 */

import type { HiveModeId, ReasonStep, ReasoningDepth } from "@/data/hive-universe";
import { DecisionStore } from "./store";
import type {
  DecisionGraphSnapshot,
  RecordDecisionInput,
} from "./schema";
import type { ClaimStatus } from "@/data/hive-universe";
import {
  FORMATION_SPECS,
  type ChainStep,
  type GraphSpec,
} from "./shape-chains";

export type { GraphSpec, ChainStep };

function recordStep(
  store: DecisionStore,
  step: ChainStep,
  timestamp: string,
): string {
  const input: RecordDecisionInput = {
    id: step.id,
    title: step.title,
    scenario: step.scenario,
    outcome: step.outcome,
    status: step.status,
    reasoningKind: step.reasoningKind,
    reasoning: step.reasoning,
    confidence: step.confidence,
    decisionMaker: step.decisionMaker,
    timestamp,
    focusNodeIds: step.focusNodeIds,
    provenance: {
      source: step.source,
      agent: step.agent,
      recordedAt: timestamp,
      note: step.note,
    },
    humanCall: step.humanCall,
    phase: step.phase,
    depthTier: step.depthTier ?? "core",
    playWeight: step.playWeight ?? "spine",
  };
  if (step.status === "Human call" && step.humanCall) {
    const temp = {
      ...input,
      status: "Unproven" as ClaimStatus,
      humanCall: undefined,
    };
    const node = store.recordDecision(temp);
    store.recordHumanCall(node.id, step.humanCall);
    return node.id;
  }
  return store.recordDecision(input).id;
}

function buildFromSpec(spec: GraphSpec): DecisionStore {
  const store = new DecisionStore({
    title: spec.title,
    description: spec.description,
  });

  const ids: string[] = [];
  let t = 0;
  for (let i = 0; i < spec.steps.length; i++) {
    const step = spec.steps[i]!;
    const ts = new Date(Date.UTC(2026, 7, 10, 15, t, 0)).toISOString();
    t += 3;
    const id = recordStep(store, step, ts);
    ids.push(id);
    if (i > 0) {
      const kind = step.fromPrev ?? "caused";
      store.addEdge(ids[i - 1]!, id, kind, `${spec.steps[i - 1]!.title} → ${step.title}`);
    }
  }

  if (spec.sideConflict) {
    const sc = spec.sideConflict;
    const draft = { ...sc.draft, playWeight: "side" as const };
    const ts = new Date(Date.UTC(2026, 7, 10, 15, 1, 30)).toISOString();
    const draftId = recordStep(store, draft, ts);
    store.addEdge(sc.attachAfterId, draftId, "influenced", "Side draft surfaced");
    store.flagConflict(draftId, sc.againstStepId, sc.note);
  }

  store.leafId = ids[ids.length - 1]!;
  return store;
}

type CacheHit = {
  store: DecisionStore;
  snapshot: DecisionGraphSnapshot;
  stepsModerate: ReasonStep[];
  stepsDeep: ReasonStep[];
};

const cache = new Map<HiveModeId, CacheHit>();

function ensure(mode: HiveModeId): CacheHit {
  let hit = cache.get(mode);
  if (hit) return hit;
  const spec = FORMATION_SPECS.find((s) => s.mode === mode);
  if (!spec) throw new Error(`No formation graph for ${mode}`);
  const store = buildFromSpec(spec);
  const chain = store.traceDecisionChain();
  hit = {
    store,
    snapshot: store.exportGraph(),
    stepsModerate: store.chainToReasonSteps(chain, "moderate"),
    stepsDeep: store.chainToReasonSteps(chain, "deep"),
  };
  cache.set(mode, hit);
  return hit;
}

export function getFormationStore(mode: HiveModeId): DecisionStore {
  return ensure(mode).store;
}

export function getFormationSnapshot(mode: HiveModeId): DecisionGraphSnapshot {
  return ensure(mode).snapshot;
}

export function getFormationReasonSteps(
  mode: HiveModeId,
  depth: ReasoningDepth = "deep",
): ReasonStep[] {
  const hit = ensure(mode);
  return depth === "moderate" ? hit.stepsModerate : hit.stepsDeep;
}

export function getFormationPlainSummary(mode: HiveModeId): string {
  return FORMATION_SPECS.find((s) => s.mode === mode)?.plainSummary ?? "";
}

export function isDecisionBackedMode(_mode: HiveModeId): boolean {
  return true;
}

export function listFormationGraphTitles(): { mode: HiveModeId; title: string }[] {
  return FORMATION_SPECS.map((s) => ({ mode: s.mode, title: s.title }));
}

export function getDepthStepCounts(mode: HiveModeId): {
  moderate: number;
  deep: number;
  sideNodes: number;
} {
  const hit = ensure(mode);
  const sideNodes = hit.snapshot.nodes.filter((n) => n.playWeight === "side").length;
  return {
    moderate: hit.stepsModerate.length,
    deep: hit.stepsDeep.length,
    sideNodes,
  };
}
