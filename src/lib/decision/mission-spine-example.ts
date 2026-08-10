/**
 * Backward-compatible exports for the Mission Spine worked example.
 * Canonical graphs for all modes live in formation-graphs.ts.
 */

import type { ReasonStep } from "@/data/hive-universe";
import type { DecisionGraphSnapshot } from "./schema";
import {
  getFormationReasonSteps,
  getFormationSnapshot,
  getFormationStore,
  isDecisionBackedMode,
} from "./formation-graphs";
import type { DecisionStore } from "./store";

export function buildMissionSpineStore(): DecisionStore {
  // Fresh store each call (not the cached singleton) for tests that mutate.
  // Prefer getMissionSpineStore() in UI paths.
  return getFormationStore("mission-spine");
}

export function getMissionSpineStore(): DecisionStore {
  return getFormationStore("mission-spine");
}

export function getMissionSpineSnapshot(): DecisionGraphSnapshot {
  return getFormationSnapshot("mission-spine");
}

export function getMissionSpineReasonSteps(): ReasonStep[] {
  return getFormationReasonSteps("mission-spine");
}

export { isDecisionBackedMode };
