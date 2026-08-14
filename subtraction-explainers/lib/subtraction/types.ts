export type Place = "hundreds" | "tens" | "ones";

export type PlaceRecord<T> = Record<Place, T>;

export type PhaseType =
  | "intro"
  | "showStart"
  | "showTake"
  | "regroupAnnounce"
  | "regroup"
  /** Announces which place comes next and draws a highlight/outline around just that place's
   * cells - everything else STAYS fully visible and un-narrowed here. The actual narrowing
   * (fading the other places away) happens one step later, in 'focus' - splitting "say what
   * we're about to do" from "now change the view" into two separately-readable beats instead of
   * both happening in the same instant. */
  | "spotlight"
  | "focus"
  | "predict"
  | "drag"
  | "expand"
  /** A brief full-picture pause inserted after a place's expand-<place>, before the next place's
   * group narrows in - lets the child see the whole current state before attention shifts. */
  | "recap"
  | "reveal"
  | "done";

export interface PhaseObj {
  type: PhaseType;
  place: Place | null;
}

export type RowKey = "start" | "take" | "result";

export interface RegroupInfo {
  needsRegroup: boolean;
  from: Place | null;
}

/** All three place keys are always present on every session, for every config, even when a
 * config's `places` only uses a subset (e.g. stage2 never touches "hundreds") - mirrors
 * addition's PlaceRecord<T> convention so one session/reducer shape serves both stages. */
export interface Session {
  minuend: number;
  subtrahend: number;
  total: number;
  /** The minuend's TRUE, immutable digit breakdown - used only for the 'done' phase's start-row
   * display, since `own.<place>.start` below gets mutated by regrouping and would otherwise show
   * a non-digit count there (e.g. "13 tens" instead of the true "4 tens, 2 ones"). */
  original: PlaceRecord<number>;
  /** `start`: the LIVE working total at this place - starts equal to `original`, mutated only by
   * a committed regroup (never by removal, matching stage2's own dots-vs-removed split).
   * `take`: the subtrahend's digit at this place - fixed for the life of the session. */
  own: PlaceRecord<{ start: number; take: number }>;
  /** Precomputed once at session creation (deterministic - no user choice affects it): which
   * places need to regroup from the place above before their own take-away can happen. Always
   * all-false when the config doesn't allow regrouping (stage2). */
  regroupPlan: PlaceRecord<RegroupInfo>;
  /** Whether a place's own regroup (per regroupPlan) has already been committed - lets GO_BACK
   * know whether landing back on regroupAnnounce-<place> needs to undo it first. */
  regrouped: PlaceRecord<boolean>;
  phaseIdx: number;
  /** The SPECIFIC block indices tapped away so far for the place currently in its drag-<place>
   * phase (persists once that place is finished, until a GO_BACK resets it) - deliberately not
   * just a count. A count alone can't tell the renderer WHICH blocks to ghost, so it always ghosted
   * the first N by array position regardless of which one the child actually tapped - tap the 3rd
   * block and a DIFFERENT one (whichever was "next in line") would vanish instead. Round-23 bug
   * report, "very very important": the block the child taps must be the one that disappears. */
  removed: PlaceRecord<number[]>;
  mcqOptions: PlaceRecord<number[] | null>;
}

export interface SubtractionConfig {
  id: "stage2" | "stage3";
  /** Display column order, big place to small (matches written notation). */
  places: Place[];
  /** Real subtraction algorithm order, small place to big (ones must resolve before tens, etc). */
  processingOrder: Place[];
  allowRegroup: boolean;
  minuendMin: number;
  minuendMax: number;
  subtrahendMin: number;
  subtrahendMax: number;
  defaultMinuend: number;
  defaultSubtrahend: number;
  validate: (minuend: number, subtrahend: number) => string | null;
  title: string;
  ageBand: string;
  conceptLabel: string;
}
