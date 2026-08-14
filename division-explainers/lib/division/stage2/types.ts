export type Stage2Concept = "sharing" | "grouping";

/** Both concepts share one phase list: equation -> reveal-dividend (count out the dots) ->
 * reveal-divisor -> round1 -> predict -> distribute -> feedback -> reveal (equation + answer) ->
 * (sharing only) notation -> done. "reveal-divisor"/"round1" mean different things per concept
 * because `divisor` means different things per concept - for sharing it's the friend count, so
 * reveal-divisor counts that many friends in and round1 deals one dot to each; for grouping it's
 * the group size, so reveal-divisor reveals a single friend and round1 fills just that one friend
 * with `divisor` dots, demonstrating what one full group looks like before the quotient (how many
 * friends total) is predicted. See session.ts's stage2Reducer for the concept branches. */
export type Stage2Phase =
  | "equation"
  | "reveal-dividend"
  | "reveal-divisor"
  | "round1"
  | "predict"
  | "distribute"
  | "feedback"
  | "reveal"
  | "notation"
  | "done";

export interface Stage2Session {
  total: number;
  divisor: number;
  concept: Stage2Concept;
  quotient: number;
  /** placements[i] = container index that dot i belongs to, length = total */
  placements: number[];
  phase: Stage2Phase;
  /** How many dots (0..total) have left the pile and landed in their container - drives both the
   * round1 and distribute sub-animations, and is never reset between them (only RESTART resets it). */
  dotsPlaced: number;
  /** 0..total during reveal-dividend (pile dots appearing one at a time with a running count),
   * then 0..divisor during reveal-divisor (friends appearing one at a time) - unrelated to
   * dotsPlaced, which tracks dots already shared INTO containers, not just displayed. */
  previewCount: number;
  predicted: number | null;
  mcqOptions: number[] | null;
}

export interface Stage2Config {
  title: string;
  ageBand: string;
  dividendMin: number;
  dividendMax: number;
  divisorMin: number;
  divisorMax: number;
  defaultDividend: number;
  defaultDivisor: number;
  defaultConcept: Stage2Concept;
}
