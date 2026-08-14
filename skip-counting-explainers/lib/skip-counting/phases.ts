import type { PhaseObj } from "./types";

/** Builds the flat phase list for a playthrough of `jumps` jumps:
 *   intro, jump-1, jump-2, ..., jump-N (line view - jump-1 passive, 2..N interactive taps),
 *   trip (whole-trip reveal, still line view),
 *   pattern (hundred-grid intro - shows the arithmetic pattern, nothing landed yet),
 *   gridTap-1, ..., gridTap-N (hundred-grid view - gridTap-1 passive like jump-1, then 2..N are
 *   interactive taps through the same sequence again, this time finding it on the grid),
 *   final (hundred-grid, done).
 * Total length is always 2*jumps + 4. */
export function buildPhases(jumps: number): PhaseObj[] {
  const jumpPhases: PhaseObj[] = [];
  for (let i = 1; i <= jumps; i++) jumpPhases.push({ type: "jump", jumpIndex: i });
  const gridTapPhases: PhaseObj[] = [];
  for (let i = 1; i <= jumps; i++) gridTapPhases.push({ type: "gridTap", jumpIndex: i });
  return [
    { type: "intro", jumpIndex: null },
    ...jumpPhases,
    { type: "trip", jumpIndex: null },
    { type: "pattern", jumpIndex: null },
    ...gridTapPhases,
    { type: "final", jumpIndex: null },
  ];
}

export function getPhaseCount(jumps: number): number {
  return 2 * jumps + 4;
}

/** pattern, gridTap and final all use the hundred-grid view; every earlier phase (intro, each
 * jump, trip) uses the number-line arc view. */
export function getView(phaseObj: PhaseObj): "line" | "grid" {
  return phaseObj.type === "pattern" || phaseObj.type === "gridTap" || phaseObj.type === "final"
    ? "grid"
    : "line";
}

/** Jump 1 is a passive, narrated reveal (as in the original vanilla walkthrough). Every jump
 * after that is an interactive "tap the next number" phase instead: the child must tap the
 * correct point on the number line to advance, rather than it being revealed automatically. */
export function isInteractiveJump(phaseObj: PhaseObj): boolean {
  return phaseObj.type === "jump" && phaseObj.jumpIndex !== null && phaseObj.jumpIndex > 1;
}

/** gridTap-1 is a passive, narrated reveal too - mirroring the line's jump-1 exactly: the first
 * hop is shown automatically so the child sees how the grid works before being asked to find one
 * themselves. Every gridTap after that (2..N) is an interactive "tap the next number" phase. */
export function isInteractiveGridTap(phaseObj: PhaseObj): boolean {
  return phaseObj.type === "gridTap" && phaseObj.jumpIndex !== null && phaseObj.jumpIndex > 1;
}

export function isInteractive(phaseObj: PhaseObj): boolean {
  return isInteractiveJump(phaseObj) || isInteractiveGridTap(phaseObj);
}

/** How many jumps have been "landed" (shown as filled points/cells) as of this phase. For an
 * interactive jump-i or gridTap-i phase (i>1), this is i-1, not i: the point being asked about
 * isn't landed yet - it only becomes landed once correctly tapped, which is exactly the moment
 * the reducer advances phaseIdx to the NEXT phase (see session.ts's TAP_NUMBER handling). The
 * passive jump-1/gridTap-1 phases report i (=1) directly, same as any other passive reveal.
 * `pattern` (the grid intro) always reports 0: nothing is confirmed on the grid yet. */
export function getLanded(phaseObj: PhaseObj, jumps: number): number {
  if (phaseObj.type === "intro") return 0;
  if (phaseObj.type === "jump") return isInteractiveJump(phaseObj) ? phaseObj.jumpIndex! - 1 : phaseObj.jumpIndex!;
  if (phaseObj.type === "pattern") return 0;
  if (phaseObj.type === "gridTap") return isInteractiveGridTap(phaseObj) ? phaseObj.jumpIndex! - 1 : phaseObj.jumpIndex!;
  return jumps; // trip, final
}

/** Index of the currently-highlighted ("you are here") point in the sequence, or -1 if none.
 * Mirrors getLanded's i-1 adjustment for interactive jump/gridTap phases - highlighting the last
 * CONFIRMED point, not the (not yet tapped) target, so the highlight doesn't give away the
 * answer. */
export function getCurrent(phaseObj: PhaseObj, jumps: number): number {
  if (phaseObj.type === "intro") return -1;
  if (phaseObj.type === "jump") return isInteractiveJump(phaseObj) ? phaseObj.jumpIndex! - 1 : phaseObj.jumpIndex!;
  if (phaseObj.type === "trip") return jumps;
  if (phaseObj.type === "pattern") return -1;
  if (phaseObj.type === "gridTap") return isInteractiveGridTap(phaseObj) ? phaseObj.jumpIndex! - 1 : phaseObj.jumpIndex!;
  return jumps; // final
}

/** The sequence index the child must tap next, or null when the current phase isn't an
 * interactive tap phase (works for both the number-line jump taps and the grid taps). */
export function getTapTargetIndex(phaseObj: PhaseObj): number | null {
  if (isInteractiveJump(phaseObj) || isInteractiveGridTap(phaseObj)) return phaseObj.jumpIndex!;
  return null;
}

/** Whether the answer expression should show the resolved sequence instead of a placeholder. */
export function isRevealAnswer(phaseObj: PhaseObj): boolean {
  return phaseObj.type !== "intro" && phaseObj.type !== "jump";
}

export function isDone(phaseObj: PhaseObj): boolean {
  return phaseObj.type === "final";
}
