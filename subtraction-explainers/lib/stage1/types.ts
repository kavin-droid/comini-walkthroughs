/** Stage1 (ages 5-6) has NO place value at all - every number here is just a count of identical
 * small objects, never broken into tens/ones. Two visual models cover the benchmark ("counting
 * back" and "take away" - "difference" was dropped per round-13 feedback); each gets its own
 * step-array generator, but both share this one step shape so a single player shell (narration
 * box, Prev/Next/Play, progress dots) can drive either of them. */
export type Concept = "countBack" | "takeAway";

/** Every render-relevant fact for one moment of the walkthrough, derived PURELY from
 * (concept, numbers, stepIndex) - never mutated. This is deliberately NOT a reducer: there is no
 * regroup/undo complexity here (unlike stage2/3's session), so a plain array of precomputed
 * snapshots is simpler and trivially testable (same stepIndex always yields the same snapshot). */
export interface Stage1Step {
  /** Stable id for logging/testing, e.g. "hop-3", "remove-2". */
  id: string;
  narration: NarrationFragment[];
  /** True once the top equation card should show the real answer instead of "?". */
  revealAnswer: boolean;
  /** True when this step requires the child to physically tap/drag a highlighted target to
   * proceed - Next is hidden and autoplay pauses here, exactly mirroring stage2/3's drag/regroup
   * gating (see PlaybackContext/Footer there) so returning users get the same mental model. */
  requiresTap?: boolean;
}

export interface NarrationFragment {
  text: string;
  emphasis?: "key" | "quote";
}

/** Which side of the equation (if any) should be highlighted this step - the equation itself is
 * drawn INSIDE each scene's own workspace (not a separate card above it), so every concept
 * carries its own minuend/subtrahend/answer and highlight state directly. */
export type EquationHighlight = "none" | "minuend" | "subtrahend";

export interface CountBackStep extends Stage1Step {
  view: "countBack";
  minuend: number;
  subtrahend: number;
  lineMax: number;
  /** False only for the very first "intro" step, before the rabbit has appeared at all. */
  placed: boolean;
  /** How many hops back have landed so far (0 = sitting on the start number, once placed). */
  hopsDone: number;
  highlight: EquationHighlight;
  /** The correct NEXT tick value to tap - present only on requiresTap hop steps (hop 2 onward;
   * hop 1 always happens on a plain Next/auto-advance, never a tap). */
  nextHopTarget?: number;
  /** True on the step asking "which number is the rabbit on" (an MCQ, after the last hop lands,
   * before the reveal) - mirrors take-away's askRemaining. */
  askPosition?: boolean;
}

export interface TakeAwayStep extends Stage1Step {
  view: "takeAway";
  minuend: number;
  subtrahend: number;
  /** False until the minuend has been highlighted and the apples have appeared. */
  shown: boolean;
  /** How many have been dragged/tapped out of the main box so far (0..subtrahend). */
  removedCount: number;
  highlight: EquationHighlight;
  /** Index (0-based, counting from the END of the row) of the object that must be dragged/tapped
   * out THIS step - only set on requiresTap removal steps. */
  tapTargetIndex?: number;
  /** True once the removed objects (sitting in the "outside" tray) should fade away - set
   * starting at the "ask" step (they stay visible through every removal, right up to the
   * question), not a separate earlier step. */
  fadeRemoved?: boolean;
  /** True once the "how many are left" MCQ should be shown (after all removals are done). */
  askRemaining?: boolean;
}

export type AnyStage1Step = CountBackStep | TakeAwayStep;
