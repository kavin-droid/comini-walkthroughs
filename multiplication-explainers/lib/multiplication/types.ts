export type Fragment = { text: string; emphasis?: "key" | "quote" };
/** `highlight: true` marks a part (typically one factor) as currently emphasized - see
 * AnswerCard, which styles it as a distinct pill instead of plain text. Used by the "build from
 * the equation" concept to draw attention to whichever factor is being introduced. */
export type AnswerPart = { text: string; kind?: "ph" | "new"; highlight?: boolean };

export interface QuestionOption {
  value: string;
  label: string;
}

/** An MCQ (or yes/no) question attached to a step: the step's own `explanation` doubles as the
 * question prompt, so the child reads it right where narration normally goes; `options` render as
 * a row of tap targets outside the workspace (see QuestionOptions.tsx) - modeled directly on the
 * addition apps' predict phase. Answering stores `session.answers[id]` and immediately advances,
 * right or wrong - there's no retry, the very next step reveals the truth either way. */
export interface StepQuestion {
  id: string;
  options: QuestionOption[];
  correctValue: string;
}

/** Ties a step to an earlier question so it can show a one-line "you said X, turns out it's Y"
 * comparison once the true value is revealed - `correctValue` is duplicated here (rather than
 * looked up from the question) so the reveal step is self-contained and doesn't need to search
 * back through the step list for the question that produced `session.answers[questionId]`.
 * `feedbackDelayMs` lets a step whose own reveal animation runs longer than the default (e.g. a
 * multi-dot migration) hold the feedback line back until that animation has actually finished,
 * instead of spoiling the answer mid-animation. */
export interface StepFeedback {
  questionId: string;
  correctValue: string;
  feedbackDelayMs?: number;
}

interface StepCommon {
  explanation: Fragment[];
  answer: AnswerPart[];
  done: boolean;
  /** Optional (not required like `done`/`answer`) so stage 2's plain walkthrough steps, which
   * never ask a question, don't all need `question: null, feedback: null` added by hand - every
   * consumer treats a missing field the same as an explicit `null`. */
  question?: StepQuestion | null;
  feedback?: StepFeedback | null;
}

/** Stage 2 only: equal groups being built up one at a time, then combined via repeated
 * addition and the multiplication shortcut. */
export interface GroupsStep extends StepCommon {
  kind: "groups";
  groups: number;
  perGroup: number;
  total: number;
  revealed: number;
  showPlus: boolean;
  /** `total: null` renders "?" in place of the sum (see AdditionCallout) - used while the child
   * is still predicting, before the reveal step fills in the real number. */
  calloutAddition: { terms: number[]; total: number | null } | null;
  calloutMul: { expr: string; total: number } | null;
}

/** Stage 2 alternate concept: starts from the bare equation (drawn both in AnswerCard and again
 * inside the workspace, one factor highlighted at a time via AnswerPart.highlight) instead of
 * from groups already forming. Empty containers fade in one at a time, first factor; the second
 * factor then fills them with dots, one container completely before the next - the in-workspace
 * equation copy fades out partway through that (see `equationDisplay`), handing off fully to
 * repeated addition's own visual language (containers + addition/multiplication callouts, no
 * equation duplicate) for the rest of the walkthrough. The AnswerCard copy above the workspace is
 * a different element entirely and never hides - only its total stays a "?" placeholder until the
 * multiplication fact is revealed at the end, in the same spot it was showing "?" the whole time. */
export interface BoxGroupsStep extends StepCommon {
  kind: "boxGroups";
  groups: number;
  perGroup: number;
  total: number;
  /** How many containers already show at mount (0 before any appear, `groups` once all are up).
   * Combined with `groupReveal`, the view animates from this value up to `groups`, one container
   * at a time - each is labeled with its own running count (1, 2, 3...), not "Group N". */
  groupsRevealed: number;
  groupReveal: { staggerMs: number } | null;
  /** How many dots (counted across the whole picture, left container to right) already show at
   * mount. Combined with `dotReveal`, the view animates from this value up to `groups *
   * perGroup`, filling the first container completely before moving to the next - a single
   * running total rather than a per-container count, since that's what makes "container 1 fills,
   * then container 2" fall out naturally (see BoxGroupsView for the per-container math). */
  dotsRevealed: number;
  dotReveal: { staggerMs: number } | null;
  /** Shows a "+" between every pair of containers, setting up the addition expression before the
   * "what's 4 + 4 + 4?" question is asked. */
  showPlus: boolean;
  calloutAddition: { terms: number[]; total: number | null } | null;
  /** Same "3 x 4 = 12" callout GroupsStep uses for its own multiplication-is-a-shortcut step -
   * shown here once repeated addition steps aside, since the equation itself is hidden by then
   * (see `equationDisplay`) and the workspace still needs somewhere to land that fact, exactly
   * like repeated addition does. */
  calloutMul: { expr: string; total: number } | null;
  /** Controls the in-workspace equation copy only (never the AnswerCard above it, which always
   * stays put): "visible" for the intro/highlight steps, "fadeOut" on the one step where it
   * animates away as the second factor's dots finish filling, "hidden" (not rendered at all) for
   * every step after that, so the workspace matches repeated addition's own visual language for
   * the rest of the walkthrough. */
  equationDisplay: "visible" | "fadeOut" | "hidden";
  /** Skip-counts the containers by `perGroup`s (e.g. "4, 8, 12") on the reveal step, so the total
   * is watched being discovered rather than just stated - the addition callout's own total (and
   * the feedback line, via `StepFeedback.feedbackDelayMs`) stays hidden in the view until this
   * finishes, even though it's already present in the step data (AnswerCard, which never gates on
   * animation state, shows it immediately). `null` on every other step. */
  containerCountReveal: { labels: string[]; staggerMs?: number } | null;
}

/** Stage 2's Arrays concept: builds the array directly in place, inspired by the "build from the
 * equation" concept (BoxGroupsStep) - the equation is drawn in the workspace and highlights each
 * factor as it produces its half of the picture, but the containers this time ARE the array's
 * rows from the start (no separate "groups" phase to rearrange from, unlike the retired
 * GroupsToArrayStep transition). Rows fade in one at a time (factor A) labeled with a running
 * count on the left; each row's dots then pop in together as a batch, row by row (factor B). Once
 * both factors have built the grid, the equation fades out and a hand-drawn border animates
 * around the array ("This is an array"), followed by naming a row and a column exactly like the
 * array concept always has. The equation then returns to ask for the total, discovered by
 * skip-counting the rows (see `countReveal`) - not by repeated addition. */
export interface ArrayBuildStep extends StepCommon {
  kind: "arrayBuild";
  rows: number;
  cols: number;
  total: number;
  /** How many rows already show at mount (0 before any appear, `rows` once all are up). Paired
   * with `rowReveal`, animates from this value up to `rows`, one row at a time - each is labeled
   * with a running count (1, 2, 3...) on the left as it appears, empty until `dotRowsRevealed`
   * fills it in. */
  rowsRevealed: number;
  rowReveal: { staggerMs: number } | null;
  /** How many rows already have their `cols` dots filled at mount. Paired with `dotRowReveal`,
   * animates from this value up to `rows` - each tick fills one row's dots all at once (a batch,
   * not one dot at a time), so "row 1 fills, then row 2" falls out naturally. */
  dotRowsRevealed: number;
  dotRowReveal: { staggerMs: number } | null;
  /** The equation copy drawn inside the workspace (never the AnswerCard above it, which stays put
   * throughout): "visible" while the rows/dots build, "fadeOut" as the border gets drawn,
   * "hidden" while the row/column are named, and "visible" again once it returns to ask for the
   * total - unlike BoxGroupsStep this can go hidden -> visible again, since the array concept
   * revisits the equation after naming the array's parts. */
  equationDisplay: "visible" | "fadeOut" | "hidden";
  /** The hand-drawn border around the array: "hidden" before it exists, "draw" on the one step
   * where it animates in (a trim-path stroke reveal), "shown" fully drawn with no animation for
   * every step after that. */
  outline: "hidden" | "draw" | "shown";
  /** The text callout above the grid (e.g. "This is an array" / "A row" / "A column") - null when
   * the equation is doing the talking instead (the build steps and the final total question). */
  caption: Fragment[] | null;
  /** Same meaning as ArrayStep: names one row or column for kids meeting "array" for the first
   * time, every dot in that row/column visually emphasized. */
  highlightLine: { type: "row" | "column"; index: number } | null;
  /** Skip-counts the rows to find the total (e.g. "4, 8, 12"), same shape as ArrayStep's
   * `countReveal` - the equation's total stays hidden in the view until this finishes, same
   * gating as BoxGroupsStep.containerCountReveal above. */
  countReveal: CountReveal | null;
}

/** Stage 2 only: the dedicated transition step between the finished groups view and the array
 * view (animation #1) - dots fly from their group position to their array position, group boxes
 * fade out, then the array gets its enclosing border/caption. `groups` == array rows and
 * `perGroup` == array cols, so a flat dot index maps 1:1 between the two layouts. */
export interface GroupsToArrayStep extends StepCommon {
  kind: "groupsToArray";
  groups: number;
  perGroup: number;
  total: number;
}

/** A "counting pointer": sequentially highlights each row (or column) one at a time, popping in
 * `labels[i]` as line `i` lights up, so a count is watched happening rather than just stated.
 * Used both for plain counting ("This array has 3 rows" -> labels ["1","2","3"]) and for
 * skip-counting the total ("3 rows of 4 make 12" -> labels ["4","8","12"], each row's running
 * total instead of its row number). */
export interface CountReveal {
  type: "row" | "column";
  labels: string[];
  staggerMs?: number;
}

/** A single array (rows x cols of dots), used standalone (stage 2's settled array view, stage 3's
 * distributive-property intro) or as one side of a CompareStep. */
export interface ArrayPanel {
  rows: number;
  cols: number;
  caption: Fragment[];
  splitAt?: number | null;
  allColor?: "split-b" | null;
  countReveal?: CountReveal | null;
  /** Stage 3 only: fades this side toward the background so a two-panel step can put full focus
   * on the other side - the commutative flow dims the already-counted original while a question
   * is live on the freshly rotated array, and the distributive flow dims whichever split isn't
   * currently being asked about. */
  dimmed?: boolean;
}

export interface ArrayStep extends StepCommon {
  kind: "array";
  rows: number;
  cols: number;
  caption: Fragment[];
  splitAt?: number | null;
  /** Stage 2 only: names one row or one column for kids meeting "array" for the first time -
   * every dot in that row/column gets visually emphasized so the definition points at something
   * concrete instead of just using the word. */
  highlightLine?: { type: "row" | "column"; index: number } | null;
  countReveal?: CountReveal | null;
  /** Distributive property only: renders a draggable slider (SplitSlider) over the plain array
   * instead of a static `splitAt` coloring - the child positions the divider between columns and
   * presses "Split" to confirm (dispatches SET_SPLIT), which becomes the split point every later
   * step in the flow is generated from. `default` is the column count already chosen (either the
   * session's stored `splitChoice`, or the auto-computed split before any choice has been made),
   * so revisiting this step via Previous shows whatever was last picked rather than resetting. */
  splitInteractive?: { min: number; max: number; default: number } | null;
}

export interface CompareSide extends ArrayPanel {
  /** Present only on the commutative property's compare steps: render this side as a live
   * duplicate of the `left` array that animates (rotates 90 degrees) into its own rows x cols
   * instead of appearing pre-rotated (animation #2). */
  rotateFrom?: { rows: number; cols: number } | null;
}

export interface CompareStep extends StepCommon {
  kind: "compare";
  left: CompareSide;
  right: CompareSide;
  calloutAddition: { terms: number[]; total: number } | null;
  /** Distributive property only: draws a "+" directly between the two array panels, on the one
   * step that both shows the split parts and asks the child to add them back together. */
  showPlusBetween?: boolean;
}

/** Stage 3 "Multiply by 10" only. tensCount/onesCount are the counts already-settled at step
 * mount. When `migrate` is set, the view animates `migrate.moveCount` one-dots flying from the
 * ones column to a waypoint container placed between the ones and tens columns, fading out
 * there, then a tens-pack spawns in the waypoint and flies onward into the tens column
 * (animation #3) - after which the numeric labels update to migrate.tensCountAfter /
 * migrate.onesCountAfter. */
export interface PlaceValueStep extends StepCommon {
  kind: "placeValue";
  tensCount: number;
  onesCount: number;
  pvHighlight: "tens" | "ones" | null;
  demo: boolean;
  migrate: { moveCount: number; tensCountAfter: number; onesCountAfter: number } | null;
}

/** Stage 3's "Regroup and Multiply" concept: 2-digit x 1-digit multiplication via the array
 * method, splitting the 2-digit factor into tens and ones and building a separate rows x cols
 * array for each (rows = the digit, cols = the 1-digit factor) - ones as loose dots, tens as
 * ten-packs (so a "2 rows of 4" tens array reads directly as "8 tens = 80"). A persistent
 * numeric-representation panel (NumericPanel, rendered beside the workspace rather than inside
 * it - see MultiplicationWalkthrough's layout branch) shows the written partial-products
 * algorithm and fills in as each phase's product is found, then the total. Unlike every other
 * step-remounted view in this app, the panel never remounts (it's a sibling of the `key`-ed
 * workspace div), so its own transitions (docking width, digit highlight, partial rows
 * appearing) are plain boolean/CSS-driven with no one-shot-trigger machinery needed. */
export interface ArrayMultiplyStep extends StepCommon {
  kind: "arrayMultiply";
  /** Tens digit of the 2-digit factor (e.g. 2 for 23). */
  tens: number;
  /** Ones digit of the 2-digit factor (e.g. 3 for 23). */
  ones: number;
  /** The 1-digit multiplier (e.g. 4). */
  factor: number;

  /** False on the intro step and again at the start of each later "let's focus on X now" beat
   * (see `highlightPhase`) - the panel sits full width and the workspace is hidden. True once
   * that phase's equation is ready to show, docking the panel to a fixed width and fading the
   * workspace in - both NumericPanel and Workspace read this directly and transition via plain
   * CSS (see their own comments), since neither remounts on this flag. */
  panelDocked: boolean;
  /** Which phase (ones or tens) the panel's top-number/factor highlight currently targets - null
   * before either phase starts and once both partials are known. Combined with
   * `highlightNumber`/`highlightFactor` to pick exactly which digit(s) light up: both together
   * when first introducing a phase (still undocked) or asking its question, one alone while that
   * digit's own row-build or dot-build sub-step plays - so the highlight visibly narrows from
   * "we're about to multiply these two" down to "this is the one making rows right now". */
  highlightPhase: "ones" | "tens" | null;
  highlightNumber: boolean;
  highlightFactor: boolean;
  /** Highlights the panel's own written partial-product row(s) (the "12" / "+80" lines) instead
   * of the top number+factor - used only once both phases are done, while introducing the
   * addition step and while each partial's place-value breakdown is shown in the workspace. */
  partialHighlight: "ones" | "tens" | "both" | null;
  /** Panel row visibility: whether the ones partial product (e.g. "12"), the tens partial
   * product (e.g. "+80"), and the final total row have appeared yet. Each stays true for every
   * step after it first appears. */
  onesPartialRevealed: boolean;
  tensPartialRevealed: boolean;
  totalRevealed: boolean;

  /** The workspace array for whichever phase is currently active - 0 when no array is showing
   * (intro, the undocked focus beats, and every step from the addition intro onward, which show
   * either nothing, a place-value breakdown, or the plain equation instead). `rows` is the digit
   * (ones or tens) being multiplied, `cols` is always `factor`. */
  rows: number;
  cols: number;
  /** True during the tens phase: renders TenPack instead of Dot, so "2 rows of 4" reads as "8
   * ten-packs = 80" rather than forcing the child to count 80 individual dots. */
  usePacks: boolean;
  /** Same reveal-timer convention as ArrayBuildStep: `rowsRevealed`/`dotRowsRevealed` are the
   * counts already settled at mount, `rowReveal`/`dotRowReveal` (set on exactly one step each)
   * drive the batch-reveal timer up to `rows`. */
  rowsRevealed: number;
  rowReveal: { staggerMs: number } | null;
  dotRowsRevealed: number;
  dotRowReveal: { staggerMs: number } | null;
  /** Skip-counts the rows (by `factor` for ones, by 1 for tens ten-packs) before the phase's
   * feedback lands - same CountReveal convention as ArrayBuildStep/ArrayStep. */
  countReveal: CountReveal | null;

  /** Place-value breakdown of the ones partial (e.g. 12 -> 1 ten + 2 ones) and/or the tens
   * partial (e.g. 80 -> 8 tens + 0 ones), drawn in the workspace like the addition app's own
   * per-number place-value decomposition (a ten-pack + loose ones, not an array) - additive, not
   * exclusive: `tensBreakdownShown` appears alongside `onesBreakdownShown`, never replacing it,
   * so both are on screen together by the time the total question asks the child to add them. */
  onesBreakdownShown: boolean;
  tensBreakdownShown: boolean;
  /** True only on the total-question step - on narrow viewports the numeric panel collapses
   * entirely (not just docks smaller) so the breakdown piles and MCQ options get the full width,
   * reappearing once the answer is picked and the next step mounts. Desktop is unaffected (the
   * panel already has room there). See NumericPanel's own `useMediaQuery` check. */
  panelHiddenMobile: boolean;
  /** True only on the total-reveal step - before the feedback line and the panel's total row
   * settle in, the workspace counts every already-broken-down piece out loud: the ones dots
   * first (always a single digit, never regroups further), then the tens ten-packs across both
   * piles, packing every full ten of *those* into a "hundred" block the moment the running count
   * crosses a multiple of ten - the same regroup-as-you-count beat the addition app's carry
   * animation uses, just one place value up. See ArrayMultiplyView's counting view; the
   * generator sizes `feedback.feedbackDelayMs` to this animation's real duration, same
   * stagger-then-feedback convention used by every other reveal step in this file. */
  countCombine: boolean;
}

export type MultiplicationStep =
  | GroupsStep
  | GroupsToArrayStep
  | ArrayStep
  | CompareStep
  | PlaceValueStep
  | BoxGroupsStep
  | ArrayBuildStep
  | ArrayMultiplyStep;

export interface ConceptConfig {
  id: string;
  label: string;
  /** Multiply-by-10 fixes factor B at 10 and disables its input, mirroring the vanilla
   * `CONCEPTS[...].lockB` flag. */
  lockFactorB: boolean;
  /** Per-concept override of the stage's shared factor ranges/defaults - absent for every
   * concept except "Regroup and Multiply" (2-digit x 1-digit), whose first factor must be a
   * 2-digit number while every other Stage 3 concept stays single-digit (an array/callout sized
   * to a 2-digit row count would be nonsensical for those). Falls back to
   * MultiplicationConfig.factorAMin/Max/defaultFactorA/B when absent - see QuestionRow,
   * OptionsPanel, validateStage3, and VisualizeFormContext.setConceptId, which all read whichever
   * concept is currently active rather than the stage-level values directly. */
  factorAMin?: number;
  factorAMax?: number;
  factorBMin?: number;
  factorBMax?: number;
  defaultFactorA?: number;
  defaultFactorB?: number;
  /** `splitChoice` is only read by the distributive property concept (the child's confirmed
   * split point via SplitSlider, or null before/without one) - every other concept's generator
   * ignores the third argument entirely. */
  generate: (a: number, b: number, splitChoice?: number | null) => MultiplicationStep[];
}

export interface MultiplicationConfig {
  id: "stage2" | "stage3";
  title: string;
  ageBand: string;
  concepts: ConceptConfig[];
  /** Whether the concept dropdown is enabled (stage 2: Repeated Addition / Arrays; stage 3:
   * Commutative / Distributive / Multiply by 10). Both stages currently have >1 concept, but the
   * flag stays config-driven rather than derived from `concepts.length` in case a future stage
   * ships with only one. */
  conceptSelectable: boolean;
  factorALabel: string;
  factorBLabel: string;
  factorAMin: number;
  factorAMax: number;
  factorBMin: number;
  factorBMax: number;
  defaultFactorA: number;
  defaultFactorB: number;
  validate: (a: number, b: number, concept: ConceptConfig) => string | null;
  progressionHref: string;
  progressionLabel: string;
}
