import { k, placeholderAnswer, q, revealedAnswer, t } from "./narration";
import { numericMcqOptions, YES_NO_OPTIONS } from "./mcq";
import type { AnswerPart, CountReveal, MultiplicationStep } from "./types";

function splitFactor(n: number): [number, number] {
  if (n > 5) return [5, n - 5];
  const p1 = Math.ceil(n / 2);
  return [p1, n - p1];
}

function skipCountLabels(rows: number, step: number): string[] {
  return Array.from({ length: rows }, (_, i) => String((i + 1) * step));
}

/** Keeps a skip-counting reveal's total runtime bounded regardless of row count (2 rows vs 9),
 * so it always finishes comfortably inside the 2.4s autoplay step duration. Mirrors stage2.ts's
 * identically-purposed `staggerFor` - kept as its own small copy here rather than a shared import
 * since the two files don't otherwise share step-generation helpers. */
function staggerFor(count: number): number {
  return Math.max(140, Math.min(420, 1700 / Math.max(count, 1)));
}

/** Interactive rewrite of the commutative property walkthrough: two predict-then-reveal beats
 * (count the first array, predict whether rotating keeps the same count) followed by watching
 * the rotation happen and predicting the rotated count too, before a final side-by-side summary.
 * Every "how many dots" question is answered by skip-counting the rows (ArrayGrid's countReveal),
 * not just stated - the array itself starts and stays unlabeled with its total until that
 * counting plays out, mirroring how a child actually finds the answer. */
export function generateCommutativeSteps(a: number, b: number): MultiplicationStep[] {
  const total = a * b;
  const countId = "commutative-count-1";
  const rotateId = "commutative-rotate-predict";
  const count2Id = "commutative-count-2";
  const answerPrefix = `${a} × ${b} = `;

  const steps: MultiplicationStep[] = [];

  // 1. Intro: the array, total still unknown.
  steps.push({
    kind: "array",
    rows: a,
    cols: b,
    caption: [t(`${a} × ${b}`)],
    done: false,
    answer: placeholderAnswer(answerPrefix),
    explanation: [q(`${a} × ${b}`), t(".")],
  });

  // 2. Question: how many dots in total?
  steps.push({
    kind: "array",
    rows: a,
    cols: b,
    caption: [t(`${a} × ${b}`)],
    done: false,
    answer: placeholderAnswer(answerPrefix),
    question: { id: countId, options: numericMcqOptions(total, 1, 100), correctValue: String(total) },
    explanation: [t("How many dots are there?")],
  });

  // 3. Reveal: skip-count the rows to find out.
  steps.push({
    kind: "array",
    rows: a,
    cols: b,
    caption: [q(`${a} × ${b}`)],
    countReveal: { type: "row", labels: skipCountLabels(a, b), staggerMs: staggerFor(a) },
    done: false,
    answer: revealedAnswer(answerPrefix, total),
    feedback: { questionId: countId, correctValue: String(total) },
    explanation: [t("Let's count: skip count by "), q(String(b)), t(" for each row.")],
  });

  // 4. Question: would rotating it keep the same count?
  steps.push({
    kind: "array",
    rows: a,
    cols: b,
    caption: [t(`${a} × ${b} = ${total}`)],
    done: false,
    answer: revealedAnswer(answerPrefix, total),
    question: { id: rotateId, options: YES_NO_OPTIONS, correctValue: "yes" },
    explanation: [t("Let's turn it sideways: "), q(`${b} × ${a}`), t(". Same number of dots, or different?")],
  });

  // 5. Let's see what happens: a fresh array fades in, then the whole shape rotates.
  steps.push({
    kind: "compare",
    left: { rows: a, cols: b, caption: [t(`${a} × ${b} = ${total}`)] },
    right: {
      rows: b,
      cols: a,
      caption: [t(`${b} × ${a}`)],
      rotateFrom: { rows: a, cols: b },
    },
    calloutAddition: null,
    done: false,
    answer: revealedAnswer(answerPrefix, total),
    feedback: { questionId: rotateId, correctValue: "yes" },
    explanation: [t("Let's see what happens...")],
  });

  // 6. Question: how many dots in the new (rotated) arrangement? Original fades back.
  steps.push({
    kind: "compare",
    left: { rows: a, cols: b, caption: [t(`${a} × ${b} = ${total}`)], dimmed: true },
    right: { rows: b, cols: a, caption: [t(`${b} × ${a}`)] },
    calloutAddition: null,
    done: false,
    answer: revealedAnswer(answerPrefix, total),
    question: { id: count2Id, options: numericMcqOptions(total, 1, 100), correctValue: String(total) },
    explanation: [t("How many dots are in "), k("this new shape"), t("?")],
  });

  // 7. Reveal: skip-count the rotated rows, with feedback on the guess.
  steps.push({
    kind: "compare",
    left: { rows: a, cols: b, caption: [t(`${a} × ${b} = ${total}`)], dimmed: true },
    right: {
      rows: b,
      cols: a,
      caption: [q(`${b} × ${a}`)],
      countReveal: { type: "row", labels: skipCountLabels(b, a), staggerMs: staggerFor(b) },
    },
    calloutAddition: null,
    done: false,
    answer: revealedAnswer(answerPrefix, total),
    feedback: { questionId: count2Id, correctValue: String(total) },
    explanation: [t("Let's count: skip count by "), q(String(a)), t(" for each row.")],
  });

  // 8. Done: both counts side by side.
  steps.push({
    kind: "compare",
    left: { rows: a, cols: b, caption: [t(`${a} × ${b} = ${total}`)] },
    right: { rows: b, cols: a, caption: [t(`${b} × ${a} = ${total}`)] },
    calloutAddition: null,
    done: true,
    answer: [{ text: `${a} × ${b} = ${b} × ${a} = ` }, { text: String(total), kind: "new" }],
    explanation: [
      k("Done."),
      t(" "),
      q(`${a} × ${b}`),
      t(" and "),
      q(`${b} × ${a}`),
      t(" are both "),
      q(String(total)),
      t(". That's the "),
      k("commutative property"),
      t(": order never changes the answer."),
    ],
  });

  return steps;
}

/** Interactive rewrite of the distributive property walkthrough: after the split, each part's
 * value is predicted on its own (the other part dimmed out of focus) rather than both totals
 * appearing together, and the final sum is predicted too before it's revealed - three
 * predict-then-reveal beats in total, matching the two-question rhythm already used for the
 * commutative walkthrough. The split itself is now the child's own choice (see SplitSlider) -
 * `splitChoice` is the confirmed column count for the first part (null before any choice, or
 * carried over from a session where it no longer fits the current `b`), clamped into [1, b-1] and
 * falling back to the same auto-computed default (`splitFactor`) used before this was
 * interactive - every step after the split reads from that single resolved value. */
export function generateDistributiveSteps(a: number, b: number, splitChoice?: number | null): MultiplicationStep[] {
  const total = a * b;
  const [autoB1] = splitFactor(b);
  const b1 = Math.min(Math.max(splitChoice ?? autoB1, 1), b - 1);
  const b2 = b - b1;
  const p1 = a * b1;
  const p2 = a * b2;
  const steps: MultiplicationStep[] = [];
  const answerPrefix = `${a} × ${b} = `;
  const part1Id = "distributive-part1";
  const part2Id = "distributive-part2";
  const totalId = "distributive-total";

  steps.push({
    kind: "array",
    rows: a,
    cols: b,
    caption: [t(`${a} × ${b}`)],
    done: false,
    answer: placeholderAnswer(answerPrefix),
    explanation: [
      q(`${a} × ${b}`),
      t(" is hard all at once. "),
      k("Let's split it into two easier parts"),
      t("."),
    ],
  });

  steps.push({
    kind: "array",
    rows: a,
    cols: b,
    caption: [k("Split"), t(" the dots")],
    splitInteractive: { min: 1, max: b - 1, default: b1 },
    done: false,
    answer: placeholderAnswer(answerPrefix),
    explanation: [t("Drag to split the dots. Then press "), q("Split"), t(".")],
  });

  // 3. Question: what is the first part worth? Second part dimmed.
  steps.push({
    kind: "compare",
    left: { rows: a, cols: b1, caption: [t(`${a} × ${b1}`)] },
    right: { rows: a, cols: b2, caption: [t(`${a} × ${b2}`)], allColor: "split-b", dimmed: true },
    calloutAddition: null,
    done: false,
    answer: placeholderAnswer(answerPrefix),
    question: { id: part1Id, options: numericMcqOptions(p1, 1, 100), correctValue: String(p1) },
    explanation: [t("What is "), q(`${a} × ${b1}`), t("?")],
  });

  // 4. Reveal part 1 - skip-counts the rows to validate the guess (same countReveal pattern as
  // the commutative flow) before the feedback line lands, delayed to match (see feedbackDelayMs).
  // The addition/total reveal below deliberately skips this - see its own comment.
  const part1Stagger = staggerFor(a);
  steps.push({
    kind: "compare",
    left: {
      rows: a,
      cols: b1,
      caption: [t(`${a} × ${b1} = ${p1}`)],
      countReveal: { type: "row", labels: skipCountLabels(a, b1), staggerMs: part1Stagger },
    },
    right: { rows: a, cols: b2, caption: [t(`${a} × ${b2}`)], allColor: "split-b", dimmed: true },
    calloutAddition: null,
    done: false,
    answer: placeholderAnswer(answerPrefix),
    feedback: { questionId: part1Id, correctValue: String(p1), feedbackDelayMs: part1Stagger * (a + 1) + 300 },
    explanation: [q(`${a} × ${b1}`), t(" = "), q(String(p1)), t(". That's the first part done.")],
  });

  // 5. Question: what is the second part worth? First part dimmed now instead.
  steps.push({
    kind: "compare",
    left: { rows: a, cols: b1, caption: [t(`${a} × ${b1} = ${p1}`)], dimmed: true },
    right: { rows: a, cols: b2, caption: [t(`${a} × ${b2}`)], allColor: "split-b" },
    calloutAddition: null,
    done: false,
    answer: placeholderAnswer(answerPrefix),
    question: { id: part2Id, options: numericMcqOptions(p2, 1, 100), correctValue: String(p2) },
    explanation: [t("What about "), q(`${a} × ${b2}`), t("?")],
  });

  // 6. Reveal part 2 - same skip-count validation as part 1, before feedback - both parts known
  // now, back to full focus on both.
  const part2Stagger = staggerFor(a);
  steps.push({
    kind: "compare",
    left: { rows: a, cols: b1, caption: [t(`${a} × ${b1} = ${p1}`)] },
    right: {
      rows: a,
      cols: b2,
      caption: [t(`${a} × ${b2} = ${p2}`)],
      allColor: "split-b",
      countReveal: { type: "row", labels: skipCountLabels(a, b2), staggerMs: part2Stagger },
    },
    calloutAddition: null,
    done: false,
    answer: placeholderAnswer(answerPrefix),
    feedback: { questionId: part2Id, correctValue: String(p2), feedbackDelayMs: part2Stagger * (a + 1) + 300 },
    explanation: [
      q(`${a} × ${b2}`),
      t(" = "),
      q(String(p2)),
      t(". Two easy parts: "),
      q(String(p1)),
      t(" and "),
      q(String(p2)),
      t("."),
    ],
  });

  // 7. Question: what's the total once the parts are added back together? The two panels get a
  // "+" drawn directly between them here (see showPlusBetween) since this is the one step that's
  // both showing the split parts and asking for their sum.
  steps.push({
    kind: "compare",
    left: { rows: a, cols: b1, caption: [t(`${a} × ${b1} = ${p1}`)] },
    right: { rows: a, cols: b2, caption: [t(`${a} × ${b2} = ${p2}`)], allColor: "split-b" },
    calloutAddition: null,
    showPlusBetween: true,
    done: false,
    answer: placeholderAnswer(answerPrefix),
    question: { id: totalId, options: numericMcqOptions(total, 1, 200), correctValue: String(total) },
    explanation: [t("Now add the two parts: "), q(`${p1} + ${p2}`), t(" = ?")],
  });

  // 8. Reveal the total - deliberately no countReveal/skip-count validation here, unlike parts 1
  // and 2 above: the addition callout's own term-by-term stagger is the reveal, kept as-is.
  steps.push({
    kind: "compare",
    left: { rows: a, cols: b1, caption: [t(`${a} × ${b1} = ${p1}`)] },
    right: { rows: a, cols: b2, caption: [t(`${a} × ${b2} = ${p2}`)], allColor: "split-b" },
    calloutAddition: { terms: [p1, p2], total },
    done: false,
    answer: revealedAnswer(answerPrefix, total),
    feedback: { questionId: totalId, correctValue: String(total) },
    explanation: [q(`${p1} + ${p2}`), t(" = "), q(String(total)), t(". So "), q(`${a} × ${b} = ${total}`), t(".")],
  });

  steps.push({
    kind: "compare",
    left: { rows: a, cols: b1, caption: [t(`${a} × ${b1} = ${p1}`)] },
    right: { rows: a, cols: b2, caption: [t(`${a} × ${b2} = ${p2}`)], allColor: "split-b" },
    calloutAddition: { terms: [p1, p2], total },
    done: true,
    answer: revealedAnswer(answerPrefix, total),
    explanation: [
      k("Done."),
      t(" Splitting "),
      q(String(b)),
      t(" into "),
      q(`${b1} + ${b2}`),
      t(" made "),
      q(`${a} × ${b}`),
      t(" easy. That's the "),
      k("distributive property"),
      t("."),
    ],
  });

  return steps;
}

/** Ported from the vanilla stage3 app's generatePlaceValueSteps(a), restructured around a
 * `migrate` descriptor per step (animation #3): the view orchestrates each moved one-dot flying
 * through a waypoint container into the tens column. The demo step (the little "1 x 10 = 10"
 * callout box) is now purely explanatory - it runs no animation on the real array. Only the
 * *first* one migrates on its own, watched individually; then a question step holds that same
 * settled state (1 ten, no further animation) and asks the child to predict the total tens count
 * before the remaining ones all migrate together in one batch - always exactly this shape
 * regardless of how big `a` is, rather than playing out (or summarizing) more individual
 * migrations for larger factors. */
export function generatePlaceValueSteps(a: number): MultiplicationStep[] {
  const total = a * 10;
  const answerPrefix = `${a} × 10 = `;
  const tensGuessId = "placevalue-tens-guess";
  const steps: MultiplicationStep[] = [];

  steps.push({
    kind: "placeValue",
    tensCount: 0,
    onesCount: a,
    pvHighlight: "ones",
    demo: false,
    migrate: null,
    done: false,
    answer: placeholderAnswer(answerPrefix),
    explanation: [t("Start with "), k(`${a} ones`), t(".")],
  });

  steps.push({
    kind: "placeValue",
    tensCount: 0,
    onesCount: a,
    pvHighlight: "ones",
    demo: true,
    migrate: null,
    done: false,
    answer: placeholderAnswer(answerPrefix),
    explanation: [t("One of the ones becomes a "), k("ten"), t(".")],
  });

  const onesAfterFirst = a - 1;

  steps.push({
    kind: "placeValue",
    tensCount: 0,
    onesCount: a,
    pvHighlight: "ones",
    demo: false,
    migrate: { moveCount: 1, tensCountAfter: 1, onesCountAfter: onesAfterFirst },
    done: false,
    answer: placeholderAnswer(answerPrefix),
    explanation: [t("Now watch: one dot flies over and becomes a "), k("ten"), t(".")],
  });

  // Same settled state as the end of the migration above (1 ten, no more animation) - just ask
  // the question here instead of moving on.
  steps.push({
    kind: "placeValue",
    tensCount: 1,
    onesCount: onesAfterFirst,
    pvHighlight: "tens",
    demo: false,
    migrate: null,
    done: false,
    answer: placeholderAnswer(answerPrefix),
    question: { id: tensGuessId, options: numericMcqOptions(a, 1, 100), correctValue: String(a) },
    explanation: [t("Every one becomes a ten. "), k("How many tens"), t(" are there?")],
  });

  steps.push({
    kind: "placeValue",
    tensCount: 1,
    onesCount: onesAfterFirst,
    pvHighlight: "tens",
    demo: false,
    migrate: { moveCount: onesAfterFirst, tensCountAfter: a, onesCountAfter: 0 },
    done: false,
    answer: placeholderAnswer(answerPrefix),
    // PlaceValueView migrates its dots one at a time (~1300ms/dot - see its own DOT_MS/PACK_MS
    // constants) - the default 1.6s feedback delay would spoil the answer mid-animation for
    // anything beyond ~1 dot, so it's scaled to the batch size here instead.
    feedback: { questionId: tensGuessId, correctValue: String(a), feedbackDelayMs: onesAfterFirst * 1300 + 300 },
    explanation: [
      t("The other "),
      q(`${onesAfterFirst}`),
      t(" ones do the same. Now there are "),
      q(`${onesAfterFirst} more tens`),
      t("."),
    ],
  });

  steps.push({
    kind: "placeValue",
    tensCount: a,
    onesCount: 0,
    pvHighlight: "tens",
    demo: false,
    migrate: null,
    done: false,
    answer: revealedAnswer(answerPrefix, total),
    explanation: [
      q(`${a} tens`),
      t(" and "),
      q("0 ones"),
      t(" is "),
      q(String(total)),
      t(". So "),
      q(`${a} × 10 = ${total}`),
      t("."),
    ],
  });

  steps.push({
    kind: "placeValue",
    tensCount: a,
    onesCount: 0,
    pvHighlight: "tens",
    demo: false,
    migrate: null,
    done: true,
    answer: revealedAnswer(answerPrefix, total),
    explanation: [
      k("Done."),
      t(" Multiplying by 10 turns every one into a ten. "),
      q(`${a} × 10 = ${total}`),
      t("."),
    ],
  });

  return steps;
}

/** "left × right = ?/result" as four/five separate parts - used only by
 * generateArrayMultiplySteps below, for the ones/tens phase equation shown in the workspace
 * (distinct from the top-level `a × factor` equation, which uses placeholderAnswer/revealedAnswer
 * as normal). `leftHighlight`/`rightHighlight` mirror the step's own `highlightNumber`/
 * `highlightFactor` - only the digit whose array is actually being built lights up here, never
 * both at once during the row/dot sub-steps, so the equation's own emphasis matches whichever
 * visual is on screen instead of always calling out both factors. */
function phaseParts(left: number, right: number, leftHighlight: boolean, rightHighlight: boolean, result?: number): AnswerPart[] {
  return [
    { text: String(left), highlight: leftHighlight },
    { text: " × " },
    { text: String(right), highlight: rightHighlight },
    { text: " = " },
    result == null ? { text: "?", kind: "ph" } : { text: String(result), kind: "new" },
  ];
}

/** "left + right = ?/result" - the addition-of-partials equation shown in the workspace during
 * generateArrayMultiplySteps' place-value-breakdown steps, once both partial products are known
 * and being combined into the total. */
function additionParts(left: number, right: number, result?: number): AnswerPart[] {
  return [
    { text: String(left) },
    { text: " + " },
    { text: String(right) },
    { text: " = " },
    result == null ? { text: "?", kind: "ph" } : { text: String(result), kind: "new" },
  ];
}

/** Default field values for every ArrayMultiplyStep - see generateArrayMultiplySteps below, which
 * spreads this and overrides only what actually changes on each step. Keeps a 19-step generator
 * legible despite ArrayMultiplyStep's wide field set (panel highlight/docking, array-build, and
 * place-value breakdown all live on the one step kind - see its own doc comment for why). */
function arrayMultiplyDefaults(tens: number, ones: number, factor: number) {
  return {
    tens,
    ones,
    factor,
    panelDocked: true,
    highlightPhase: null as "ones" | "tens" | null,
    highlightNumber: false,
    highlightFactor: false,
    partialHighlight: null as "ones" | "tens" | "both" | null,
    onesPartialRevealed: false,
    tensPartialRevealed: false,
    totalRevealed: false,
    rows: 0,
    cols: 0,
    usePacks: false,
    rowsRevealed: 0,
    rowReveal: null as { staggerMs: number } | null,
    dotRowsRevealed: 0,
    dotRowReveal: null as { staggerMs: number } | null,
    countReveal: null as CountReveal | null,
    onesBreakdownShown: false,
    tensBreakdownShown: false,
    panelHiddenMobile: false,
    countCombine: false,
  };
}

/** Stage 3's "Regroup and Multiply" concept (array method): splits the 2-digit factor into tens
 * and ones and multiplies each separately as its own array - see ArrayMultiplyStep's doc comment
 * for the full pedagogical rationale and the persistent NumericPanel it's paired with. Each phase
 * (ones, then tens) gets its own "focus" beat - the panel undocks to full width and highlights
 * both the digit and the factor together before the workspace ever shows that phase's array, so
 * the child sees what's about to be multiplied before watching it happen - followed by the array
 * build, where the highlight narrows to whichever single digit is producing that half of the
 * picture (rows = the number, dots = the factor). Once both partials are known, a third "focus"
 * beat undocks the panel again to introduce adding them, then each partial gets its own
 * place-value breakdown (ten-pack + loose ones, additive - the second joins the first rather than
 * replacing it) before a single "what's the total?" question. Always exactly this shape (19
 * steps) regardless of the factors, same fixed-shape principle as generatePlaceValueSteps. */
export function generateArrayMultiplySteps(a: number, b: number): MultiplicationStep[] {
  const tens = Math.floor(a / 10);
  const ones = a % 10;
  const factor = b;
  const onesProduct = ones * factor;
  const tensProductDigit = tens * factor;
  const tensPartialValue = tensProductDigit * 10;
  const total = a * factor;
  const answerPrefix = `${a} × ${factor} = `;
  const onesGuessId = "arrayMultiply-ones-guess";
  const tensGuessId = "arrayMultiply-tens-guess";
  const totalGuessId = "arrayMultiply-total-guess";
  // Place-value breakdown of each partial - the tens partial's ones digit is always 0 (it's
  // `tensProductDigit * 10`), but the ones partial's own tens digit is only 0 when it never
  // crossed into double digits (e.g. 2 x 3 = 6) - shown either way, just reading as "0 tens".
  const onesBreakdownTens = Math.floor(onesProduct / 10);
  const onesBreakdownOnes = onesProduct % 10;
  const d = arrayMultiplyDefaults(tens, ones, factor);
  const steps: MultiplicationStep[] = [];

  // 1. Intro: the numeric representation only, full width - no workspace yet.
  steps.push({
    kind: "arrayMultiply",
    ...d,
    panelDocked: false,
    done: false,
    answer: placeholderAnswer(answerPrefix),
    explanation: [
      t("Let's multiply "),
      q(`${a} × ${factor}`),
      t(" using arrays. We'll split "),
      q(String(a)),
      t(" into tens and ones."),
    ],
  });

  // 2. Ones phase, focus: still full width - highlight the ones digit and the factor together,
  // before the workspace shows anything.
  steps.push({
    kind: "arrayMultiply",
    ...d,
    panelDocked: false,
    highlightPhase: "ones",
    highlightNumber: true,
    highlightFactor: true,
    done: false,
    answer: placeholderAnswer(answerPrefix),
    explanation: [t("First, let's multiply the "), k("ones"), t(": "), q(`${ones} × ${factor}`), t(".")],
  });

  // 3. Ones phase, dock: the panel docks to the side, the workspace fades in showing the bare
  // equation - both digits still highlighted.
  steps.push({
    kind: "arrayMultiply",
    ...d,
    highlightPhase: "ones",
    highlightNumber: true,
    highlightFactor: true,
    done: false,
    answer: phaseParts(ones, factor, true, true),
    explanation: [t("Here's "), q(`${ones} × ${factor}`), t(" as an array.")],
  });

  // 4. Ones phase, rows: the ones digit alone highlights as it fades in as rows, one at a time.
  steps.push({
    kind: "arrayMultiply",
    ...d,
    highlightPhase: "ones",
    highlightNumber: true,
    highlightFactor: false,
    rows: ones,
    cols: factor,
    rowReveal: { staggerMs: staggerFor(ones) },
    done: false,
    answer: phaseParts(ones, factor, true, false),
    explanation: [t("Let's make "), q(String(ones)), t(` row${ones === 1 ? "" : "s"}.`)],
  });

  // 5. Ones phase, dots: the factor alone highlights as it fills each row with dots.
  steps.push({
    kind: "arrayMultiply",
    ...d,
    highlightPhase: "ones",
    highlightNumber: false,
    highlightFactor: true,
    rows: ones,
    cols: factor,
    rowsRevealed: ones,
    dotRowReveal: { staggerMs: staggerFor(ones) },
    done: false,
    answer: phaseParts(ones, factor, false, true),
    explanation: [t("Let's fill each row with "), q(String(factor)), t(" dots.")],
  });

  // 6. Ones phase, question: both highlight again - how many dots in total?
  steps.push({
    kind: "arrayMultiply",
    ...d,
    highlightPhase: "ones",
    highlightNumber: true,
    highlightFactor: true,
    rows: ones,
    cols: factor,
    rowsRevealed: ones,
    dotRowsRevealed: ones,
    done: false,
    answer: phaseParts(ones, factor, true, true),
    question: { id: onesGuessId, options: numericMcqOptions(onesProduct, 1, 100), correctValue: String(onesProduct) },
    explanation: [t("How many dots are there in total?")],
  });

  // 7. Ones phase, reveal: skip-count the dots, feedback, then write the ones partial into the
  // panel ("12").
  const onesStagger = staggerFor(ones);
  steps.push({
    kind: "arrayMultiply",
    ...d,
    highlightPhase: "ones",
    highlightNumber: true,
    highlightFactor: true,
    onesPartialRevealed: true,
    rows: ones,
    cols: factor,
    rowsRevealed: ones,
    dotRowsRevealed: ones,
    countReveal: { type: "row", labels: skipCountLabels(ones, factor), staggerMs: onesStagger },
    done: false,
    answer: phaseParts(ones, factor, true, true, onesProduct),
    feedback: {
      questionId: onesGuessId,
      correctValue: String(onesProduct),
      feedbackDelayMs: onesStagger * (ones + 1) + 300,
    },
    explanation: [q(`${ones} × ${factor}`), t(" = "), q(String(onesProduct)), t(".")],
  });

  // 8. Tens phase, focus: undock again - highlight the tens digit and the factor together before
  // the workspace shows the tens array.
  steps.push({
    kind: "arrayMultiply",
    ...d,
    panelDocked: false,
    highlightPhase: "tens",
    highlightNumber: true,
    highlightFactor: true,
    onesPartialRevealed: true,
    done: false,
    answer: placeholderAnswer(answerPrefix),
    explanation: [t("Now let's multiply the "), k("tens"), t(": "), q(`${tens} × ${factor}`), t(".")],
  });

  // 9. Tens phase, dock: the panel docks again, the workspace shows the bare tens equation.
  steps.push({
    kind: "arrayMultiply",
    ...d,
    highlightPhase: "tens",
    highlightNumber: true,
    highlightFactor: true,
    onesPartialRevealed: true,
    done: false,
    answer: phaseParts(tens, factor, true, true),
    explanation: [t("Here's "), q(`${tens} × ${factor}`), t(" as an array.")],
  });

  // 10. Tens phase, rows: the tens digit alone highlights as ten-pack rows fade in.
  steps.push({
    kind: "arrayMultiply",
    ...d,
    highlightPhase: "tens",
    highlightNumber: true,
    highlightFactor: false,
    onesPartialRevealed: true,
    rows: tens,
    cols: factor,
    usePacks: true,
    rowReveal: { staggerMs: staggerFor(tens) },
    done: false,
    answer: phaseParts(tens, factor, true, false),
    explanation: [t("Let's make "), q(String(tens)), t(` row${tens === 1 ? "" : "s"}.`)],
  });

  // 11. Tens phase, dots: the factor alone highlights as it fills each row with ten-packs.
  steps.push({
    kind: "arrayMultiply",
    ...d,
    highlightPhase: "tens",
    highlightNumber: false,
    highlightFactor: true,
    onesPartialRevealed: true,
    rows: tens,
    cols: factor,
    usePacks: true,
    rowsRevealed: tens,
    dotRowReveal: { staggerMs: staggerFor(tens) },
    done: false,
    answer: phaseParts(tens, factor, false, true),
    explanation: [t("Let's fill each row with "), q(String(factor)), t(" ten-packs.")],
  });

  // 12. Tens phase, question: both highlight again - how many ten-packs in total?
  steps.push({
    kind: "arrayMultiply",
    ...d,
    highlightPhase: "tens",
    highlightNumber: true,
    highlightFactor: true,
    onesPartialRevealed: true,
    rows: tens,
    cols: factor,
    usePacks: true,
    rowsRevealed: tens,
    dotRowsRevealed: tens,
    done: false,
    answer: phaseParts(tens, factor, true, true),
    question: {
      id: tensGuessId,
      options: numericMcqOptions(tensProductDigit, 1, 100),
      correctValue: String(tensProductDigit),
    },
    explanation: [t("How many ten-packs are there in total?")],
  });

  // 13. Tens phase, reveal: skip-count the packs, feedback, then write the tens partial into the
  // panel ("+80").
  const tensStagger = staggerFor(tens);
  steps.push({
    kind: "arrayMultiply",
    ...d,
    highlightPhase: "tens",
    highlightNumber: true,
    highlightFactor: true,
    onesPartialRevealed: true,
    tensPartialRevealed: true,
    rows: tens,
    cols: factor,
    usePacks: true,
    rowsRevealed: tens,
    dotRowsRevealed: tens,
    countReveal: { type: "row", labels: skipCountLabels(tens, factor), staggerMs: tensStagger },
    done: false,
    answer: phaseParts(tens, factor, true, true, tensProductDigit),
    feedback: {
      questionId: tensGuessId,
      correctValue: String(tensProductDigit),
      feedbackDelayMs: tensStagger * (tens + 1) + 300,
    },
    explanation: [
      q(`${tens} × ${factor}`),
      t(" = "),
      q(String(tensProductDigit)),
      t(` ten${tensProductDigit === 1 ? "" : "s"}, which is `),
      q(String(tensPartialValue)),
      t("."),
    ],
  });

  // 14. Addition, focus: undock once more - both partial rows highlight in the panel, workspace
  // hidden, introducing the add-them-together step.
  steps.push({
    kind: "arrayMultiply",
    ...d,
    panelDocked: false,
    partialHighlight: "both",
    onesPartialRevealed: true,
    tensPartialRevealed: true,
    done: false,
    answer: placeholderAnswer(answerPrefix),
    explanation: [t("Now let's add "), q(String(onesProduct)), t(" and "), q(String(tensPartialValue)), t(" together.")],
  });

  // 15. Addition, ones-partial breakdown: the panel highlights "12" alone, the workspace shows
  // it broken into a ten-pack + loose ones (place value, not an array). On mobile the panel
  // collapses (see `panelHiddenMobile`) for the rest of this concept - every step from here
  // through the total reveal needs the full width for the breakdown piles/MCQ/counting.
  steps.push({
    kind: "arrayMultiply",
    ...d,
    partialHighlight: "ones",
    onesPartialRevealed: true,
    tensPartialRevealed: true,
    onesBreakdownShown: true,
    panelHiddenMobile: true,
    done: false,
    answer: additionParts(onesProduct, tensPartialValue),
    explanation: [
      q(String(onesProduct)),
      t(" is "),
      q(`${onesBreakdownTens} ten${onesBreakdownTens === 1 ? "" : "s"}`),
      t(" and "),
      q(`${onesBreakdownOnes} one${onesBreakdownOnes === 1 ? "" : "s"}`),
      t("."),
    ],
  });

  // 16. Addition, tens-partial breakdown joins it: the panel highlights "+80" alone, the
  // workspace now shows both breakdowns side by side.
  steps.push({
    kind: "arrayMultiply",
    ...d,
    partialHighlight: "tens",
    onesPartialRevealed: true,
    tensPartialRevealed: true,
    onesBreakdownShown: true,
    tensBreakdownShown: true,
    panelHiddenMobile: true,
    done: false,
    answer: additionParts(onesProduct, tensPartialValue),
    explanation: [
      q(String(tensPartialValue)),
      t(" is "),
      q(`${tensProductDigit} tens`),
      t(" and "),
      q("0 ones"),
      t("."),
    ],
  });

  // 17. Question: what's the total? Both breakdowns stay on screen - on mobile the panel
  // collapses entirely here (see `panelHiddenMobile`) so the breakdown + MCQ options get the
  // full width instead of squeezing beside a 148px sidebar.
  steps.push({
    kind: "arrayMultiply",
    ...d,
    onesPartialRevealed: true,
    tensPartialRevealed: true,
    onesBreakdownShown: true,
    tensBreakdownShown: true,
    panelHiddenMobile: true,
    done: false,
    answer: additionParts(onesProduct, tensPartialValue),
    question: { id: totalGuessId, options: numericMcqOptions(total, 1, 999), correctValue: String(total) },
    explanation: [t("So what is "), q(`${onesProduct} + ${tensPartialValue}`), t("?")],
  });

  // 18. Reveal the total: before the feedback lands, the workspace counts every piece out loud
  // (see ArrayMultiplyView's counting view) - ones first (always single-digit, never regroups
  // further), then tens across both piles, packing every ten of *those* into a "hundred" as the
  // running count crosses each multiple of ten. feedbackDelayMs is sized to that real animation
  // duration, same stagger-then-feedback convention every other reveal step here already uses.
  const combineOnesUnits = onesBreakdownOnes;
  const combineTensUnits = onesBreakdownTens + tensProductDigit;
  const combineStagger = 380;
  const combineDurationMs = combineStagger * (combineOnesUnits + combineTensUnits + 2) + 300;
  steps.push({
    kind: "arrayMultiply",
    ...d,
    onesPartialRevealed: true,
    tensPartialRevealed: true,
    totalRevealed: true,
    onesBreakdownShown: true,
    tensBreakdownShown: true,
    panelHiddenMobile: true,
    countCombine: true,
    done: false,
    answer: additionParts(onesProduct, tensPartialValue, total),
    feedback: { questionId: totalGuessId, correctValue: String(total), feedbackDelayMs: combineDurationMs },
    explanation: [
      q(`${onesProduct} + ${tensPartialValue}`),
      t(" = "),
      q(String(total)),
      t(". So "),
      q(`${a} × ${factor} = ${total}`),
      t("."),
    ],
  });

  // 19. Done: undock one last time, workspace hidden, panel alone with the finished equation.
  steps.push({
    kind: "arrayMultiply",
    ...d,
    panelDocked: false,
    onesPartialRevealed: true,
    tensPartialRevealed: true,
    totalRevealed: true,
    done: true,
    answer: revealedAnswer(answerPrefix, total),
    explanation: [k("Done."), t(" "), q(`${a} × ${factor} = ${total}`), t(".")],
  });

  return steps;
}
