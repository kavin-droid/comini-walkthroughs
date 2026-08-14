export type PlaceKey = "hundreds" | "tens" | "ones";

export interface PlaceDef {
  key: PlaceKey;
  label: string;
  digit: (value: number) => number;
}

export interface NumItem {
  value: number;
  origIndex: number;
  digits: Partial<Record<PlaceKey, number>>;
}

export type WinnerTag = "smallest" | "last" | "equal";

export type Emphasis = "key" | "quote";

export interface Fragment {
  text: string;
  emphasis?: Emphasis;
}

export interface Step {
  /** "intro" = the opening number-by-number reveal sequence (see steps.ts's buildIntroSteps);
   * "compare" = the existing place-value comparison walkthrough, unchanged. Drives the pool
   * zone's label, since "Comparing"/"Last one left" don't make sense while numbers are still
   * being introduced one at a time. */
  phase: "intro" | "compare";
  pool: NumItem[];
  placed: NumItem[];
  hiPlace: PlaceKey | null;
  /** During intro, the origIndex of the number whose card should play its stagger-reveal
   * animation this step (its places fade/highlight in one-by-one, smallest place first). Null on
   * every other step, and null on every OTHER pool card even during intro - the point is to scope
   * the reveal/highlight to a single card, not flash it across every number on screen. */
  focusOrigIndex: number | null;
  tiedVals: number[] | null;
  winnerVal: number | null;
  winnerTag: WinnerTag;
  revealAnswer: boolean;
  done: boolean;
  chainTokens: { type: "num" | "sym"; text: string }[] | null;
  explanation: Fragment[];
  /** True for the steps where the algorithm decides a round's winner - these pause the
   * walkthrough and wait for the learner to tap the correct pool card instead of narrating the
   * answer directly. False for the purely-informational digit-reveal steps and the trivial
   * "only one left" step (nothing to decide there). */
  requiresTap: boolean;
  /** The question shown in place of `explanation` while a requiresTap step is unanswered -
   * deliberately never names a value, so the prompt itself can't give away the answer. */
  tapPrompt: Fragment[] | null;
}

export type TapStatus = "idle" | "correct" | "wrong";

export interface CompareOrderConfig {
  id: "stage2" | "stage3";
  places: PlaceDef[];
  min: number;
  max: number;
  digitCount: 2 | 3;
  defaultValues: [number, number, number, number];
  title: string;
  ageBand: string;
  conceptLabel: string;
  progressionHref: string;
  progressionLabel: string;
  /** Lay the pool out as a 2-column grid instead of flex-wrap: "always" on every viewport
   * (stage3's wider 3-place cards get cramped and too small four-across even on desktop),
   * "mobile" only below the desktop breakpoint (stage2's narrower 2-place cards are fine
   * four-across on desktop, but still too cramped on a phone), "never" otherwise. */
  poolGrid: "always" | "mobile" | "never";
  /** Show each place as physical blocks (a hundred as a pack of ten-bars, a ten as a 2x5 pack of
   * unit squares, a one as a single square) instead of a plain digit numeral. Stage3's cards
   * already show three place columns plus the value itself - adding blocks on top of that reads
   * as busy, so stage3 shows numbers alone; stage2's two-column cards have room for the blocks. */
  placeVisuals: boolean;
  validate: (values: number[]) => string | null;
  /** Per-stage pixel constants that vary only because the digit count differs - ported 1:1 from
   * the vanilla stage2/stage3 CSS rather than approximated, per the "preserve exact CSS pixel
   * values" porting rule. Card width/height are no longer set here - see Workspace's
   * cardRefs equalization effect, which measures and equalizes both dimensions directly. */
  sizing: {
    cardValueFontSize: number;
    placeColMinWidth: number;
    placeColMinWidthNarrow: number;
    trackSlotMinWidth: number;
    trackSlotMinWidthNarrow: number;
    trackSlotFontSize: number;
    trackSlotFontSizeNarrow: number;
    answerExprFontSize: number;
    inputWidth: number;
    inputFontSize: number;
  };
}

export interface Session {
  values: number[];
  steps: Step[];
  idx: number;
  tapStatus: TapStatus;
  /** The value most recently tapped incorrectly at the current step, so the wrong card can show
   * feedback - cleared automatically a moment later. */
  wrongTapValue: number | null;
}
