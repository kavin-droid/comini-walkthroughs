export type BlockKind = "tens" | "ones";

export type UnpackStage = "packed" | "moving" | "fading" | "moved";

export type Stage3Phase =
  | "numerals"
  | "intro"
  | "reveal-friends"
  | "focus-tens"
  | "predict-tens"
  | "count-tens"
  | "share-tens"
  | "count-leftover"
  | "unpack-intro"
  | "unpack"
  | "focus-ones"
  | "predict-ones"
  | "count-ones"
  | "share-ones"
  | "remainder"
  | "recap"
  | "notation"
  | "done";

export interface Stage3Session {
  dividend: number;
  divisor: number;
  tensDigit: number;
  onesDigit: number;

  /** The value actually used for every downstream computation - always the mathematically
   * correct floor(tensDigit / divisor), regardless of what the child taps. */
  tensPredicted: number | null;
  /** What the child actually tapped in the MCQ - may be wrong, used only to drive the feedback
   * callout after share-tens ("you guessed X, but..."). */
  tensGuess: number | null;
  mcqOptionsTens: number[] | null;
  /** 0..tensDigit - how many individual BLOCKS have been "counted" so far in the count-tens demo,
   * one at a time ("1.. 2.. 3.. 4"). Each counted block shows a (index % divisor) + 1 label; a
   * group only colors in once its own last member has landed, and the trailing partial group (the
   * leftover) shakes + colors red once it's fully counted and still comes up short. */
  tensCountProgress: number;
  /** 0..tensPredicted*divisor - auto round-robin placement into containers after counting. */
  tensSharePlaced: number;
  tensContainerCounts: number[];
  /** tensDigit - tensPredicted*divisor, frozen once predicted. */
  tensLeftover: number;
  /** 0..tensLeftover - how many leftover packs have been counted out ("1.. 2.. 3..") before the
   * "can't share evenly" callout, in the count-leftover phase. */
  leftoverCountProgress: number;

  /** One entry per leftover tens pack - tapped independently, each strips then moves on its own. */
  unpackStages: UnpackStage[];

  /** onesDigit until unpack completes, then onesDigit + tensLeftover*10. */
  onesTotal: number;
  /** Correct floor(onesTotal / divisor), always used for the real math (see tensPredicted). */
  onesPredicted: number | null;
  /** What the child actually tapped - feedback only (see tensGuess). */
  onesGuess: number | null;
  mcqOptionsOnes: number[] | null;
  /** 0..onesTotal - how many individual ONES have been "counted" so far, one at a time - no
   * number badges here (too cluttered), each dot just colors blue (complete group) or red
   * (trailing leftover) the moment it's counted. */
  onesCountProgress: number;
  /** 0..onesPredicted - one child tap = one round = 1 one shared to every container. */
  onesSharedRounds: number;
  /** onesTotal - onesPredicted*divisor, finalized once onesPredicted is chosen. */
  remainder: number;

  phase: Stage3Phase;
}

export interface Stage3Config {
  title: string;
  ageBand: string;
  dividendMin: number;
  dividendMax: number;
  divisorOptions: readonly number[];
  defaultDividend: number;
  defaultDivisor: number;
}
