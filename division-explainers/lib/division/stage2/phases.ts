import type { Stage2Concept, Stage2Phase } from "./types";

export const STAGE2_PHASES_SHARING: Stage2Phase[] = [
  "equation",
  "reveal-dividend",
  "reveal-divisor",
  "round1",
  "predict",
  "distribute",
  "feedback",
  "reveal",
  "notation",
  "done",
];

export const STAGE2_PHASES_GROUPING: Stage2Phase[] = [
  "equation",
  "reveal-dividend",
  "reveal-divisor",
  "predict",
  "distribute",
  "feedback",
  "reveal",
  "notation",
  "done",
];

/** The two concepts have different-length phase lists (see types.ts's Stage2Phase comment for
 * why) - ProgressBar needs the right one per concept, not a single shared constant. */
export function stage2Phases(concept: Stage2Concept): Stage2Phase[] {
  return concept === "sharing" ? STAGE2_PHASES_SHARING : STAGE2_PHASES_GROUPING;
}
