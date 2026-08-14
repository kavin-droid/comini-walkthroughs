export type Stage1StepKind =
  | "barWholeIntro"
  | "barFreeSplit"
  | "barCompareMcq"
  | "jarWholeDemo"
  | "jarHalfDemo"
  | "jarFillHalf"
  | "pizzaWholeIntro"
  | "pizzaFreeCut"
  | "pizzaCompareMcq"
  | "recapWhole"
  | "recapHalf"
  | "finalRecap";

/** Fixed, linear sequence, three beats per context (bar, jar, pizza), a two-step recap, then one
 * final side-by-side step - every context gets its own full "show whole and half, then check" arc
 * instead of saving the whole-vs-half comparison for a single pass at the very end:
 *   bar:   intro whole -> free-draw split -> compare whole/half + "which is it?" quiz
 *   jar:   pour to whole -> pour to half (demo) -> child pours to half themselves
 *   pizza: intro whole -> free-draw cut -> compare whole/half + "which is it?" quiz
 *   recap: all three as wholes ("1") -> all three as halves ("1/2") -> both sets together at once
 * No config/picker - a pre-reading child has nothing to choose, only this one path to walk with
 * Back/Next. */
export const STAGE1_STEPS: Stage1StepKind[] = [
  "barWholeIntro",
  "barFreeSplit",
  "barCompareMcq",
  "jarWholeDemo",
  "jarHalfDemo",
  "jarFillHalf",
  "pizzaWholeIntro",
  "pizzaFreeCut",
  "pizzaCompareMcq",
  "recapWhole",
  "recapHalf",
  "finalRecap",
];

/** Steps where the sentence IS the instruction for an action the child hasn't taken yet ("draw a
 * line", "which one is glowing?", "drag to fill") - these must stay visible even with the
 * instruction-text toggle on, the same way stage 2's promptExplanation does (see NarrationBox.tsx),
 * because for these steps the sentence is the only place that states the action itself; the
 * on-workarea WordLabel/Mcq elements show state, not the verb. Steps NOT in this set are passive
 * demos (an intro beat, a pour animation, a recap) with nothing for the child to be told to do, so
 * their narration is purely supplementary framing and stays toggle-gated as normal. */
export const STAGE1_ACTION_STEPS: ReadonlySet<Stage1StepKind> = new Set([
  "barFreeSplit",
  "barCompareMcq",
  "jarFillHalf",
  "pizzaFreeCut",
  "pizzaCompareMcq",
]);

/** One short, literal sentence per step - the "instruction version" alongside the wordless
 * visuals, shown in Stage1NarrationBox. Toggle-gated for passive-demo steps, always shown for
 * action steps (see STAGE1_ACTION_STEPS). Kept to a single constant sentence per step (not
 * phase-synced like stage 2's prompt/solved split). */
export const STAGE1_NARRATION: Record<Stage1StepKind, string> = {
  barWholeIntro: "Here is a whole chocolate bar.",
  barFreeSplit: "Draw a line to split it in two.",
  barCompareMcq: "Which one is glowing?",
  jarWholeDemo: "Watch the jar fill up. That's a whole jar.",
  jarHalfDemo: "Watch it fill halfway. That's half a jar.",
  jarFillHalf: "Drag to fill the jar halfway.",
  pizzaWholeIntro: "Here is a whole pizza.",
  pizzaFreeCut: "Draw a line to cut it in two.",
  pizzaCompareMcq: "Which one is glowing?",
  recapWhole: "All of these are whole. We write \"whole\" as 1.",
  recapHalf: "All of these are cut in half. We write \"half\" as 1/2.",
  finalRecap: "Whole and half, side by side.",
};
