import type { AdditionConfig, PhaseObj } from "./types";

/** Builds the flat phase list for a config, e.g. stage2:
 * ['intro','showA','showB','focus-ones','predict-ones','drag-ones','compare-ones',
 *  'focus-tens','predict-tens','drag-tens','compare-tens','reveal','done']
 * Order for the focus/predict/drag/compare groups follows processingOrder (ones-first),
 * NOT the display `places` order (which is big-to-small for on-screen columns). Each place
 * gets a `focus-<place>` step immediately before its `predict-<place>` step: a full-view
 * "we're about to work on this column" announcement, BEFORE the grid actually narrows down
 * to that one column (which happens as the transition INTO predict-<place>, not during
 * focus itself) - see isNarrowingPhase (visibility.ts), which deliberately excludes 'focus'.
 *
 * Stage3 (config.allowCarry) additionally gets two "bridge" steps per place, after compare:
 * `bridge-<place>` (highlight that place's own settled numeral + visual together, with a
 * connecting arrow - reinforcing that they're the same quantity) and, only for a place with a
 * next place to carry into, `bridgecarry-<place>` (same treatment for the carry it produced -
 * one word "bridgecarry" so parsePhase's single-hyphen split still lands on the right `place`).
 * These render in full view (see isNarrowingPhase) - they exist purely to look at what's
 * already been found, not to narrow anything further. `bridgecarry-<place>` auto-skips at
 * runtime if that place's processing didn't actually produce a carry (see the walkthrough's
 * own auto-advance effect) - it's still always present in the STATIC list since whether a
 * carry happens depends on the session's actual digits, not the config alone. */
export function buildPhases(config: AdditionConfig): string[] {
  const groups = config.processingOrder.flatMap((place, i) => {
    const hasNextPlace = i < config.processingOrder.length - 1;
    const base = [`focus-${place}`, `predict-${place}`, `drag-${place}`, `compare-${place}`];
    if (!config.allowCarry) return base;
    return [...base, `bridge-${place}`, ...(hasNextPlace ? [`bridgecarry-${place}`] : [])];
  });
  return ["intro", "showA", "showB", ...groups, "reveal", "done"];
}

/** Splits a phase string on its FIRST hyphen only, e.g. 'predict-ones' -> {type:'predict', place:'ones'}. */
export function parsePhase(phase: string): PhaseObj {
  const idx = phase.indexOf("-");
  if (idx === -1) {
    return { type: phase as PhaseObj["type"], place: null };
  }
  return {
    type: phase.slice(0, idx) as PhaseObj["type"],
    place: phase.slice(idx + 1) as PhaseObj["place"],
  };
}

/** Governs column NARROWING (isPlaceVisible) - 'predict'/'drag' always narrow (both stages);
 * 'compare' only narrows for stage2 (legacy behavior) - stage3 keeps compare in full view
 * ("show the full equation" once a place's drag is done, per the child-facing walkthrough
 * redesign), then layers its own 'bridge'/'bridgecarry' full-view highlight steps on top.
 * 'focus' is deliberately excluded everywhere so the grid stays in full view during the
 * announcement step. */
export function isNarrowingPhase(phaseObj: PhaseObj, config: AdditionConfig): boolean {
  if (phaseObj.type === "predict" || phaseObj.type === "drag") return true;
  if (phaseObj.type === "compare") return !config.allowCarry;
  return false;
}

const FOCUS_HIGHLIGHT_PHASE_TYPES = ["focus", "predict", "drag", "compare"] as const;

/** Governs digit-label HIGHLIGHTING only (not column visibility) - unlike isInteractivePhase,
 * this DOES include 'focus' so the row-label digit for the upcoming place already highlights
 * during the announcement step, foreshadowing which column is about to be worked on. */
export function isColumnFocusPhase(phaseObj: PhaseObj): boolean {
  return (FOCUS_HIGHLIGHT_PHASE_TYPES as readonly string[]).includes(phaseObj.type);
}
