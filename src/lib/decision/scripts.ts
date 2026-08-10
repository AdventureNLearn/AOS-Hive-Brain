/**
 * Resolve Hive PLAY FLOW scripts for every formation.
 * Spine-only by default. Moderate vs deep step counts.
 */

import type { HiveModeId, ReasonStep, ReasoningDepth } from "@/data/hive-universe";
import {
  getDepthStepCounts,
  getFormationPlainSummary,
  getFormationReasonSteps,
  getFormationSnapshot,
  getFormationStore,
  isDecisionBackedMode,
} from "./formation-graphs";

export function getReasoningScript(
  mode: HiveModeId,
  depth: ReasoningDepth = "deep",
): ReasonStep[] {
  return getFormationReasonSteps(mode, depth);
}

export {
  getDepthStepCounts,
  getFormationPlainSummary,
  getFormationSnapshot,
  getFormationStore,
  isDecisionBackedMode,
};
