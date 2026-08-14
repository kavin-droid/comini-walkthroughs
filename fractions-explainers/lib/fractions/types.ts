export type Fragment = { text: string; emphasis?: "key" | "quote" };
export type AnswerPart = { text: string; kind?: "ph" | "new" };

interface StepCommon {
  /** For interactive kinds (`tapQuarters`, `tapCombineTotal`) this is the narration shown once
   * the step has been answered correctly - `promptExplanation` is shown before that. For every
   * other kind it's the only narration the step has. */
  explanation: Fragment[];
  /** Same split as `explanation`: the revealed/final answer for interactive kinds, the only
   * answer for everything else. */
  answer: AnswerPart[];
  done: boolean;
}

/** A whole chocolate bar, unmarked - the starting point of every walkthrough. */
export interface WholeStep extends StepCommon {
  kind: "whole";
}

/** A bar split into `cellCount` equal cells, `shaded` of them filled in. When `boundary` is set
 * (stage 2's "combine two unit fractions" concept only), cells before it are colored piece1 and
 * cells from it onward are colored piece2 - otherwise every shaded cell is plain piece1.
 * `showHalves`/`halvesShaded` render a second, separate 2-cell strip underneath (stage 2 only),
 * used when the same amount can also be named as a number of halves (2/4 = 1/2, 4/4 = 1 = 2/2).
 * Always display-only - never gated behind an answer. */
export interface StripStep extends StepCommon {
  kind: "strip";
  cellCount: number;
  shaded: number;
  boundary: number | null;
  caption: string;
  showHalves: boolean;
  halvesShaded: number;
  callout: string[] | null;
}

/** Stage 2 only: a `cellCount`-cell bar the learner must tap themselves to shade a target number
 * of cells, gated behind a Check button - wrong counts get "try again", the right count marks the
 * step solved and unlocks moving on. Every cell is always tappable (no pre-shaded cells share this
 * bar - see `referenceBar` for showing a previous answer alongside it instead). Used both for the
 * equivalence concept's single "show us this fraction" question and the combine concept's two
 * piece-by-piece questions, each on its own bar. */
export interface TapQuartersStep extends StepCommon {
  kind: "tapQuarters";
  cellCount: number;
  target: number;
  activeColor: "piece1" | "piece2";
  /** When set, a second, read-only, already-shaded bar is shown above the tappable one - the
   * combine concept's second tap-piece step uses this to show the first piece's bar as a
   * reference, rather than building both pieces on one shared bar. */
  referenceBar: { shaded: number; color: "piece1" | "piece2"; caption: string } | null;
  /** The target fraction ("2/4"), shown as a Callout badge directly in the workarea while
   * unsolved - unlike `promptExplanation`, this is never hidden by the instruction-text toggle,
   * so the child always has a non-prose way to know what to tap for. */
  promptCallout: string[] | null;
  promptExplanation: Fragment[];
  promptAnswer: AnswerPart[];
  /** Shown alongside `explanation` once solved, e.g. ["2 of 4", "2/4"]. */
  solvedCallout: string[] | null;
}

/** Stage 2's combine concept only: three bars stacked - the first two are read-only, already
 * shaded from the two preceding `tapQuarters` steps (`piece1Shaded` in piece1 color,
 * `piece2Shaded` in piece2 color); the third is a fresh `cellCount`-cell bar the learner taps
 * themselves to show the combined total, gated behind a Check button exactly like
 * `TapQuartersStep`. Checking counts the tapped cells right there on the third bar itself (a
 * numbered badge pops onto each one in order) before comparing that count to `target` and giving
 * feedback - so a wrong attempt sees its own count spoken back to it, not just "wrong". */
export interface TapCombineStep extends StepCommon {
  kind: "tapCombineTotal";
  cellCount: number;
  piece1Shaded: number;
  piece1Caption: string;
  piece2Shaded: number;
  piece2Caption: string;
  target: number;
  totalCaption: string;
  /** The target expression ("1/4 + 1/2"), shown as a Callout badge directly in the workarea
   * while unsolved - same purpose as TapQuartersStep's promptCallout: a non-text fallback for the
   * one thing the prompt sentence asks for, so the sentence itself is never the only source of
   * that information. */
  promptCallout: string[] | null;
  promptExplanation: Fragment[];
  promptAnswer: AnswerPart[];
  solvedCallout: string[] | null;
}

/** Stage 3 only: a set of `size` chocolate pieces, either ungrouped (plain grid) or split into
 * `denominator` equal groups with `shadedGroups` of them highlighted. */
export interface SetStep extends StepCommon {
  kind: "set";
  size: number;
  denominator: number;
  grouped: boolean;
  shadedGroups: number;
  callout: string[] | null;
}

export type FractionStep = WholeStep | StripStep | TapQuartersStep | TapCombineStep | SetStep;

export function isInteractiveStep(step: FractionStep): step is TapQuartersStep | TapCombineStep {
  return step.kind === "tapQuarters" || step.kind === "tapCombineTotal";
}

export interface FractionOption {
  value: string;
  label: string;
}

export interface ConceptConfig {
  id: string;
  label: string;
  /** "single" shows one fraction <select> (stage 2's Understand/Equivalence concept, stage 3's
   * only concept). "combine" shows two fraction <select>s joined by a "+" (stage 2's Combine
   * concept). */
  inputMode: "single" | "combine";
  fractionOptions: FractionOption[];
  defaultFraction: string;
  piece1Options: FractionOption[];
  piece2Options: FractionOption[];
  defaultPiece1: string;
  defaultPiece2: string;
  generate: (fraction: string, piece1: string, piece2: string) => FractionStep[];
}

export interface FractionConfig {
  id: "stage2" | "stage3";
  title: string;
  ageBand: string;
  /** Stage 2 has two concepts (Understand Unit Fractions & Equivalence, Combine Unit Fractions);
   * stage 3 has exactly one, shown as a disabled single-option select - mirrors the vanilla
   * markup's `<select ... disabled><option>Equal Parts of a Whole or Set</option></select>`. */
  conceptSelectable: boolean;
  concepts: ConceptConfig[];
  progressionHref: string;
  progressionLabel: string;
}
