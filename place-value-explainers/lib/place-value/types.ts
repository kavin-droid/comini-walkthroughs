export type Fragment = { text: string; emphasis?: "key" | "quote" };

interface StepCommon {
  explanation: Fragment[];
  done: boolean;
}

/** Stage 2 only: the grouped 2x5-per-ten units field, covering two narrated phases - "loose"
 * (packed, no grouping shown, "too many to count") and "counting" (packed, one group boxed as an
 * example, not yet asking anything). The spacing-scaffold + "how many tens" question live inside
 * QuizTensStep instead of a separate step. */
export interface UnitsFieldStep extends StepCommon {
  kind: "unitsField";
  n: number;
  tens: number;
  ones: number;
  phase: "loose" | "counting";
}

/** Stage 2 only: "how many groups of ten?" - locks Prev/Next until answered (see
 * PlaceValueQuizContext), then plays a progressive box-reveal animation over the same units
 * field before allowing navigation onward. */
export interface QuizTensStep extends StepCommon {
  kind: "quizTens";
  n: number;
  tens: number;
  ones: number;
}

/** Stage 2 only: "how many loose ones are left?" - same lock/reveal shape as QuizTensStep. */
export interface QuizOnesStep extends StepCommon {
  kind: "quizOnes";
  n: number;
  tens: number;
  ones: number;
}

/** Stage 2 only: the settled tens/ones field, reused for three narrated steps - "labeled" (no
 * per-group counts anymore, just plain "tens"/"ones" column labels), "decompose" (adds the
 * "72 = 7 tens + 2 ones" callout), and "expanded" (adds the "70 + 2 = 72" callout on top of
 * that) - matching stage 3's CardsStep pattern of building up via showDecompose/showExpanded. */
export interface BundledStep extends StepCommon {
  kind: "bundled";
  n: number;
  tens: number;
  ones: number;
  showDecompose: boolean;
  showExpanded: boolean;
}

/** Stage 3 only: loose ten-packs + ones in one undifferentiated field (no "tens"/"ones" column
 * split yet - that only appears once the hundreds are confirmed and the cards step reveals the
 * settled layout), covering "loose" (packed, no hundred-grouping) and "highlight" (packed, one
 * hundred boxed as an example, not yet asking anything). The spacing-scaffold + "how many
 * hundreds" question + counted migration into a hundreds column live inside QuizHundredsStep. */
export interface RodsOnesStep extends StepCommon {
  kind: "rodsOnes";
  n: number;
  hundreds: number;
  tens: number;
  ones: number;
  totalTens: number;
  phase: "loose" | "highlight";
}

/** Stage 3 only: "how many hundreds are there in total?" - locks Prev/Next until answered (see
 * PlaceValueQuizContext), then counts the confirmed hundred-groups by flying each one, in turn,
 * into a dedicated hundreds column to the left of the tens field, fading its 10 ten-packs into a
 * single hundred-flat on arrival. */
export interface QuizHundredsStep extends StepCommon {
  kind: "quizHundreds";
  n: number;
  hundreds: number;
  tens: number;
  ones: number;
  totalTens: number;
}

/** Stage 3 only: hundreds/tens/ones place-card tier reveal, with the decompose/expanded
 * callouts once all three cards are shown. */
export interface CardsStep extends StepCommon {
  kind: "cards";
  n: number;
  hundreds: number;
  tens: number;
  ones: number;
  showDecompose: boolean;
  showExpanded: boolean;
  revealAnswer: boolean;
}

export type PlaceValueStep =
  | UnitsFieldStep
  | QuizTensStep
  | QuizOnesStep
  | BundledStep
  | RodsOnesStep
  | QuizHundredsStep
  | CardsStep;

export interface ConceptConfig {
  id: string;
  label: string;
  generate: (n: number) => PlaceValueStep[];
}

export interface PlaceValueConfig {
  id: "stage2" | "stage3";
  title: string;
  ageBand: string;
  digits: 2 | 3;
  concepts: ConceptConfig[];
  conceptSelectable: boolean;
  numberLabel: string;
  numberMin: number;
  numberMax: number;
  defaultNumber: number;
  /** Stage 2 only: whether the walkthrough has the interactive tens/ones quiz steps that lock
   * Prev/Next until answered. */
  hasQuiz: boolean;
  validate: (n: number) => string | null;
  progressionHref: string;
  progressionLabel: string;
}
