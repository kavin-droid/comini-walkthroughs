import type { PhaseObj, PlaceRecord, RegroupInfo, SubtractionConfig } from "./types";

/** Builds the flat phase list, e.g. stage2: ['intro','showStart','showTake',
 * 'spotlight-ones','focus-ones','predict-ones','drag-ones','expand-ones','recap-ones',
 * 'spotlight-tens','focus-tens','predict-tens','drag-tens','expand-tens','reveal','done'].
 * Stage3 is IDENTICAL in shape, with one addition: a place whose regroupPlan says it needs to
 * borrow gets 'regroupAnnounce-<place>','regroup-<place>' inserted right after that place's own
 * 'focus' step (announce the plan for this place first, THEN discover/fix the shortfall,
 * mirroring how a person actually works through it) - not before it. This is the only structural
 * difference between the two stages - everything else in the phase list (and the components that
 * render it) is shared.
 *
 * Every place's own group starts with TWO separate steps rather than one: 'spotlight-<place>'
 * (announce + highlight that place - everything else stays fully visible) THEN 'focus-<place>'
 * (now narrow the other places away). Splitting these lets "here's what we're about to look at"
 * and "now the view actually changes" read as two distinct beats instead of both landing on the
 * same render.
 *
 * 'recap-<place>' is inserted after every place's own group EXCEPT the last (which flows straight
 * into 'reveal', itself already a full-picture step) - a deliberate full-picture pause between
 * finishing one place and narrowing into the next, so the view never jumps directly from one
 * narrowed single-place column to a different narrowed single-place column. */
export function buildPhases(config: SubtractionConfig, regroupPlan: PlaceRecord<RegroupInfo>): string[] {
  const order = config.processingOrder;
  const groups = order.flatMap((place, i) => {
    const mid = regroupPlan[place].needsRegroup ? [`regroupAnnounce-${place}`, `regroup-${place}`] : [];
    const isLast = i === order.length - 1;
    const post = isLast ? [] : [`recap-${place}`];
    return [`spotlight-${place}`, `focus-${place}`, ...mid, `predict-${place}`, `drag-${place}`, `expand-${place}`, ...post];
  });
  return ["intro", "showStart", "showTake", ...groups, "reveal", "done"];
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

/** Governs column NARROWING and digit-label highlighting. 'spotlight' is deliberately EXCLUDED -
 * it announces/highlights the next place while every column stays fully visible; only the
 * following 'focus' step (still included here) actually narrows the other columns away. 'focus'
 * narrows too (not just predict/drag/expand) so a place that just finished regrouping stays
 * narrowed straight through its own focus/predict/drag/expand group instead of re-expanding to
 * the full breakdown and then narrowing again one step later. 'regroup' is special: it narrows to
 * the two columns involved (the destination place AND the place it borrows from), not just one. */
export const NARROWING_PHASE_TYPES = ["focus", "predict", "drag", "expand", "regroupAnnounce", "regroup"] as const;

export function isNarrowingPhase(phaseObj: PhaseObj): boolean {
  return (NARROWING_PHASE_TYPES as readonly string[]).includes(phaseObj.type);
}

/** Phases where the narration IS the instruction for what to do right now (an MCQ question, or a
 * tap/drag prompt) rather than scene-setting/descriptive prose - the "hide instruction text"
 * toggle must never hide these (round-18: "the mcq and action oriented text should be displayed
 * irrespective of the toggle"), only the purely descriptive narration on every other phase. */
const ACTIONABLE_PHASE_TYPES = ["predict", "drag", "regroup"] as const;

export function isActionablePhase(phaseObj: PhaseObj): boolean {
  return (ACTIONABLE_PHASE_TYPES as readonly string[]).includes(phaseObj.type);
}
