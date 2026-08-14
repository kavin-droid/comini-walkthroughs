import type { Stage1PhaseObj, Stage1PhaseType } from "./types";

/** Flat 8-step sequence - no place-value looping, one pass through one operation.
 * intro: the equation forms ("3 + 2 = ?") together with the (still empty) workarea.
 * showSetA / showSetB: the matching number in the equation highlights, then that many filled
 *   dots fade in below it (own color per set) - establishing "two separate sets" visually.
 * dragA / dragB: the equation fades out and an empty "answer box" fades in below the sets; an
 *   arrow points from the active set to the box, inviting the child to drag every dot in. The
 *   box's live count updates as each dot lands. dragB repeats this for the second set.
 * predict: "how many dots in total?" - a 3-option MCQ.
 * count: the box's dots are counted one at a time for real (not just the live drag tally),
 *   landing on the true sum, then feedback compares it to the guess.
 * done: settled recap - the equation again, now with each number's own dots grouped below it,
 *   and the total's dots showing both groups together. */
const PHASES: Stage1PhaseType[] = [
  "intro",
  "showSetA",
  "showSetB",
  "dragA",
  "dragB",
  "predict",
  "count",
  "done",
];

export function buildPhases(): Stage1PhaseType[] {
  return PHASES;
}

export function parsePhase(phase: Stage1PhaseType): Stage1PhaseObj {
  return { type: phase };
}

export function isEquationVisible(phaseObj: Stage1PhaseObj): boolean {
  return phaseObj.type === "intro" || phaseObj.type === "showSetA" || phaseObj.type === "showSetB";
}

/** The answer box exists on screen from the moment set A starts moving until counting finishes -
 * "done" replaces it entirely with the grouped recap. */
export function isBoxVisible(phaseObj: Stage1PhaseObj): boolean {
  const idx = PHASES.indexOf(phaseObj.type);
  return idx >= PHASES.indexOf("dragA") && idx <= PHASES.indexOf("count");
}
