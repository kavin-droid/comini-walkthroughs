import { k, placeholderAnswer, q, revealedAnswer, t } from "./narration";
import { numericMcqOptions } from "./mcq";
import type { AnswerPart, MultiplicationStep } from "./types";

const ORDINALS = ["first", "second", "third", "fourth", "fifth"];

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** Keeps a counting-pointer animation's total runtime bounded regardless of how many lines it
 * has to reveal (2 rows vs 10 columns), so it always finishes comfortably inside the 2.4s
 * autoplay step duration. */
function staggerFor(count: number): number {
  return Math.max(140, Math.min(420, 1700 / Math.max(count, 1)));
}

/** Used only by generateRepeatedAdditionSteps below: intro, then build each group one at a time,
 * one step per group (no internal auto-stagger - each "Next" reveals the next group). */
function buildIntroAndGroups(
  groups: number,
  perGroup: number,
  total: number,
  answerPrefix: string,
): MultiplicationStep[] {
  const steps: MultiplicationStep[] = [];

  steps.push({
    kind: "groups",
    groups,
    perGroup,
    total,
    revealed: 0,
    showPlus: false,
    calloutAddition: null,
    calloutMul: null,
    done: false,
    answer: placeholderAnswer(answerPrefix),
    explanation: [
      q(`${groups} × ${perGroup}`),
      t(" means "),
      k(`${groups} equal groups`),
      t(" of "),
      k(String(perGroup)),
      t(". Build them one at a time."),
    ],
  });

  for (let i = 1; i <= groups; i++) {
    const ordinal = ORDINALS[i - 1] || `${i}th`;
    const explanation =
      i === 1
        ? [t(`First group of ${perGroup}.`)]
        : [k(`${capitalize(ordinal)} group`), t(` of ${perGroup}.`)];
    steps.push({
      kind: "groups",
      groups,
      perGroup,
      total,
      revealed: i,
      showPlus: false,
      calloutAddition: null,
      calloutMul: null,
      done: false,
      answer: placeholderAnswer(answerPrefix),
      explanation,
    });
  }

  return steps;
}

/** Retired from the concept dropdown in favor of generateEquationGroupsSteps below (now itself
 * labeled "Repeated Addition" in the UI) - kept here, unused, in case the plain one-group-per-step
 * flow is needed again later. groups -> add them up -> predict the sum -> reveal -> multiplication
 * is a shortcut -> done. No array involved. */
export function generateRepeatedAdditionSteps(groups: number, perGroup: number): MultiplicationStep[] {
  const total = groups * perGroup;
  const answerPrefix = `${groups} × ${perGroup} = `;
  const steps = buildIntroAndGroups(groups, perGroup, total, answerPrefix);
  const sumGuessId = "repeatedAddition-sum-guess";

  const terms = Array.from({ length: groups }, () => perGroup);
  const termsOnly = terms.join(" + ");
  const fullSentence = `${termsOnly} = ${total}`;

  // Set up the addition, total still hidden ("?" in the callout, not the real sum).
  steps.push({
    kind: "groups",
    groups,
    perGroup,
    total,
    revealed: groups,
    showPlus: true,
    calloutAddition: { terms, total: null },
    calloutMul: null,
    done: false,
    answer: placeholderAnswer(answerPrefix),
    explanation: [
      t("Add them up to find the total: "),
      q(`${termsOnly} = ?`),
      t(". This is "),
      k("repeated addition"),
      t("."),
    ],
  });

  // Question: what does it add up to? Same "?" callout, now with the question attached.
  steps.push({
    kind: "groups",
    groups,
    perGroup,
    total,
    revealed: groups,
    showPlus: true,
    calloutAddition: { terms, total: null },
    calloutMul: null,
    done: false,
    answer: placeholderAnswer(answerPrefix),
    question: { id: sumGuessId, options: numericMcqOptions(total, 1, 200), correctValue: String(total) },
    explanation: [t("What do you think "), q(`${termsOnly}`), t(" adds up to?")],
  });

  // Reveal: the real total, with feedback on the guess.
  steps.push({
    kind: "groups",
    groups,
    perGroup,
    total,
    revealed: groups,
    showPlus: true,
    calloutAddition: { terms, total },
    calloutMul: null,
    done: false,
    answer: revealedAnswer(answerPrefix, total),
    feedback: { questionId: sumGuessId, correctValue: String(total) },
    explanation: [t("Let's check: "), q(fullSentence), t(".")],
  });

  const mulCallout = { expr: `${groups} × ${perGroup} = `, total };

  steps.push({
    kind: "groups",
    groups,
    perGroup,
    total,
    revealed: groups,
    showPlus: true,
    calloutAddition: null,
    calloutMul: mulCallout,
    done: false,
    answer: revealedAnswer(answerPrefix, total),
    explanation: [
      k("Multiplication"),
      t(" is a faster way to add: "),
      q(`${groups} boxes of ${perGroup}`),
      t(" is "),
      q(`${groups} × ${perGroup} = ${total}`),
      t("."),
    ],
  });

  steps.push({
    kind: "groups",
    groups,
    perGroup,
    total,
    revealed: groups,
    showPlus: true,
    calloutAddition: null,
    calloutMul: mulCallout,
    done: true,
    answer: revealedAnswer(answerPrefix, total),
    explanation: [k("Done."), t(" "), q(`${groups} × ${perGroup} = ${total}`), t(".")],
  });

  return steps;
}

/** Arrays concept (redesigned, inspired by "Repeated Addition"/generateEquationGroupsSteps above):
 * the equation is drawn in the workspace and highlights each factor as it produces its half of the
 * array directly - rows fade in one at a time (factor A), then each row's dots pop in as a batch,
 * row by row (factor B). No separate "groups" phase to rearrange from. Once built, the equation
 * fades out and a hand-drawn border traces around the array ("This is an array"), then a row and a
 * column get named one at a time - each "how many" statement backed by a counting-pointer
 * animation (sequentially highlighting each row/column with a popping-in number) so the count is
 * watched happening, not just read. The equation then returns to ask for the total, discovered by
 * skip-counting the rows (4, 8, 12) - not by repeated addition. */
export function generateArraySteps(groups: number, perGroup: number): MultiplicationStep[] {
  const total = groups * perGroup;
  const totalGuessId = "arrayBuild-total-guess";
  const steps: MultiplicationStep[] = [];

  // 1. Open with the bare equation, no rows yet.
  steps.push({
    kind: "arrayBuild",
    rows: groups,
    cols: perGroup,
    total,
    rowsRevealed: 0,
    rowReveal: null,
    dotRowsRevealed: 0,
    dotRowReveal: null,
    equationDisplay: "visible",
    outline: "hidden",
    caption: null,
    highlightLine: null,
    countReveal: null,
    done: false,
    answer: buildEquationParts(groups, perGroup),
    explanation: [t("Let's build "), q(`${groups} × ${perGroup}`), t(" as an array.")],
  });

  // 2. Highlight the first factor - rows fade in one at a time, each counted as it appears, empty
  // until the second factor fills them in the next step.
  steps.push({
    kind: "arrayBuild",
    rows: groups,
    cols: perGroup,
    total,
    rowsRevealed: 0,
    rowReveal: { staggerMs: staggerFor(groups) },
    dotRowsRevealed: 0,
    dotRowReveal: null,
    equationDisplay: "visible",
    outline: "hidden",
    caption: null,
    highlightLine: null,
    countReveal: null,
    done: false,
    answer: buildEquationParts(groups, perGroup, { highlightGroups: true }),
    explanation: [t("Let's make "), q(String(groups)), t(" rows.")],
  });

  // 3. Highlight the second factor - each row's dots pop in together as a batch, row by row.
  steps.push({
    kind: "arrayBuild",
    rows: groups,
    cols: perGroup,
    total,
    rowsRevealed: groups,
    rowReveal: null,
    dotRowsRevealed: 0,
    dotRowReveal: { staggerMs: staggerFor(groups) },
    equationDisplay: "visible",
    outline: "hidden",
    caption: null,
    highlightLine: null,
    countReveal: null,
    done: false,
    answer: buildEquationParts(groups, perGroup, { highlightPerGroup: true }),
    explanation: [t("Let's fill each row with "), q(String(perGroup)), t(" dots.")],
  });

  // 4. Fade the equation out, draw a border around the array, name the arrangement.
  steps.push({
    kind: "arrayBuild",
    rows: groups,
    cols: perGroup,
    total,
    rowsRevealed: groups,
    rowReveal: null,
    dotRowsRevealed: groups,
    dotRowReveal: null,
    equationDisplay: "fadeOut",
    outline: "draw",
    caption: [t("This is an "), k("array")],
    highlightLine: null,
    countReveal: null,
    done: false,
    answer: buildEquationParts(groups, perGroup),
    explanation: [t("This shape is called an "), k("array"), t(".")],
  });

  // 5. Name a row.
  steps.push({
    kind: "arrayBuild",
    rows: groups,
    cols: perGroup,
    total,
    rowsRevealed: groups,
    rowReveal: null,
    dotRowsRevealed: groups,
    dotRowReveal: null,
    equationDisplay: "hidden",
    outline: "shown",
    caption: [t("↔ A "), k("row")],
    highlightLine: { type: "row", index: 0 },
    countReveal: null,
    done: false,
    answer: buildEquationParts(groups, perGroup),
    explanation: [
      t("An array has "),
      k("rows"),
      t(" and "),
      k("columns"),
      t(". A "),
      k("row"),
      t(" goes "),
      q("side to side"),
      t("."),
    ],
  });

  // 6. Count the rows, 1, 2, 3...
  steps.push({
    kind: "arrayBuild",
    rows: groups,
    cols: perGroup,
    total,
    rowsRevealed: groups,
    rowReveal: null,
    dotRowsRevealed: groups,
    dotRowReveal: null,
    equationDisplay: "hidden",
    outline: "shown",
    caption: [q(`${groups} rows`)],
    highlightLine: null,
    countReveal: {
      type: "row",
      labels: Array.from({ length: groups }, (_, i) => String(i + 1)),
      staggerMs: staggerFor(groups),
    },
    done: false,
    answer: buildEquationParts(groups, perGroup),
    explanation: [t("Let's count: this array has "), q(`${groups} rows`), t(".")],
  });

  // 7. Name a column.
  steps.push({
    kind: "arrayBuild",
    rows: groups,
    cols: perGroup,
    total,
    rowsRevealed: groups,
    rowReveal: null,
    dotRowsRevealed: groups,
    dotRowReveal: null,
    equationDisplay: "hidden",
    outline: "shown",
    caption: [t("↕ A "), k("column")],
    highlightLine: { type: "column", index: 0 },
    countReveal: null,
    done: false,
    answer: buildEquationParts(groups, perGroup),
    explanation: [t("A "), k("column"), t(" goes "), q("up and down"), t(".")],
  });

  // 8. Count the columns, 1, 2, 3...
  steps.push({
    kind: "arrayBuild",
    rows: groups,
    cols: perGroup,
    total,
    rowsRevealed: groups,
    rowReveal: null,
    dotRowsRevealed: groups,
    dotRowReveal: null,
    equationDisplay: "hidden",
    outline: "shown",
    caption: [q(`${perGroup} columns`)],
    highlightLine: null,
    countReveal: {
      type: "column",
      labels: Array.from({ length: perGroup }, (_, i) => String(i + 1)),
      staggerMs: staggerFor(perGroup),
    },
    done: false,
    answer: buildEquationParts(groups, perGroup),
    explanation: [t("Let's count: this array has "), q(`${perGroup} columns`), t(".")],
  });

  // 9. The equation returns and asks for the total.
  steps.push({
    kind: "arrayBuild",
    rows: groups,
    cols: perGroup,
    total,
    rowsRevealed: groups,
    rowReveal: null,
    dotRowsRevealed: groups,
    dotRowReveal: null,
    equationDisplay: "visible",
    outline: "shown",
    caption: null,
    highlightLine: null,
    countReveal: null,
    done: false,
    answer: buildEquationParts(groups, perGroup),
    question: { id: totalGuessId, options: numericMcqOptions(total, 1, 200), correctValue: String(total) },
    explanation: [t("How many dots are there in "), k("total"), t("?")],
  });

  // 10. Reveal: skip-count the rows by `perGroup`s (4, 8, 12) before the total lands - the answer
  // below already carries the real total, for AnswerCard, which never gates on animation state;
  // ArrayBuildView holds its own in-workspace copy back until the skip-count finishes.
  const totalLabels = Array.from({ length: groups }, (_, i) => String((i + 1) * perGroup));
  const totalStaggerMs = staggerFor(groups);
  steps.push({
    kind: "arrayBuild",
    rows: groups,
    cols: perGroup,
    total,
    rowsRevealed: groups,
    rowReveal: null,
    dotRowsRevealed: groups,
    dotRowReveal: null,
    equationDisplay: "visible",
    outline: "shown",
    caption: null,
    highlightLine: null,
    countReveal: { type: "row", labels: totalLabels, staggerMs: totalStaggerMs },
    done: false,
    answer: buildEquationParts(groups, perGroup, { total }),
    feedback: {
      questionId: totalGuessId,
      correctValue: String(total),
      feedbackDelayMs: totalStaggerMs * (groups + 1) + 300,
    },
    explanation: [t("Let's count the rows to find the total.")],
  });

  // 11. Done.
  steps.push({
    kind: "arrayBuild",
    rows: groups,
    cols: perGroup,
    total,
    rowsRevealed: groups,
    rowReveal: null,
    dotRowsRevealed: groups,
    dotRowReveal: null,
    equationDisplay: "visible",
    outline: "shown",
    caption: null,
    highlightLine: null,
    countReveal: null,
    done: true,
    answer: buildEquationParts(groups, perGroup, { total }),
    explanation: [k("Done."), t(" "), q(`${groups} × ${perGroup} = ${total}`), t(".")],
  });

  return steps;
}

/** "3 x 4 = ?" as five separate parts (rather than plainAnswer's single string) so any one
 * factor can be highlighted on its own via AnswerPart.highlight - used only by
 * generateEquationGroupsSteps below. `total: null` keeps the sum hidden ("?"); a number reveals
 * it (styled as newly-revealed, matching AnswerCard's `kind: "new"`). */
function buildEquationParts(
  groups: number,
  perGroup: number,
  opts: { highlightGroups?: boolean; highlightPerGroup?: boolean; total?: number | null } = {},
): AnswerPart[] {
  return [
    { text: String(groups), highlight: !!opts.highlightGroups },
    { text: " × " },
    { text: String(perGroup), highlight: !!opts.highlightPerGroup },
    { text: " = " },
    opts.total == null ? { text: "?", kind: "ph" } : { text: String(opts.total), kind: "new" },
  ];
}

/** Stage 2's "Repeated Addition" concept in the UI (id kept as "equationGroups" internally - it
 * replaced the retired generateRepeatedAdditionSteps flow above). The equation is drawn both in
 * AnswerCard and again inside the workspace (see BoxGroupsView), one factor highlighted at a time
 * as it produces its half of the picture - the first factor's containers fade in one at a time
 * (each labeled with a plain running count, not "Group N"), then the second factor fills them with
 * dots as a single running total that completes the first container before starting the second.
 * The dots stay filled and the equation stays fully visible through the end of that step - the
 * in-workspace equation copy only fades out at the *start* of the next step (see
 * `equationDisplay`), once the "+" appears between the containers, and from that point every step
 * mirrors the classic repeated-addition sequence beat for beat: addition callout with a hidden
 * total -> same callout with the question attached, posed as the expression itself -> reveal
 * (counting the containers by `perGroup`s before the total lands, see `containerCountReveal`) with
 * feedback -> multiplication-is-a-shortcut (calloutMul, same as GroupsStep uses) -> done. The
 * AnswerCard copy above the workspace is a different element and never fades - only its total
 * stays a "?" until that final reveal fills it in. */
export function generateEquationGroupsSteps(groups: number, perGroup: number): MultiplicationStep[] {
  const total = groups * perGroup;
  const sumGuessId = "equationGroups-sum-guess";
  const terms = Array.from({ length: groups }, () => perGroup);
  const termsJoined = terms.join(" + ");
  const steps: MultiplicationStep[] = [];

  // 1. Open with the bare equation, no containers yet.
  steps.push({
    kind: "boxGroups",
    groups,
    perGroup,
    total,
    groupsRevealed: 0,
    groupReveal: null,
    dotsRevealed: 0,
    dotReveal: null,
    showPlus: false,
    calloutAddition: null,
    calloutMul: null,
    equationDisplay: "visible",
    containerCountReveal: null,
    done: false,
    answer: buildEquationParts(groups, perGroup),
    explanation: [t("Let's build "), q(`${groups} × ${perGroup}`), t(".")],
  });

  // 2. Highlight the first factor - containers fade in one at a time, each counted as it appears.
  steps.push({
    kind: "boxGroups",
    groups,
    perGroup,
    total,
    groupsRevealed: 0,
    groupReveal: { staggerMs: staggerFor(groups) },
    dotsRevealed: 0,
    dotReveal: null,
    showPlus: false,
    calloutAddition: null,
    calloutMul: null,
    equationDisplay: "visible",
    containerCountReveal: null,
    done: false,
    answer: buildEquationParts(groups, perGroup, { highlightGroups: true }),
    explanation: [t("Let's make "), q(String(groups)), t(" boxes.")],
  });

  // 3. Highlight the second factor - dots fill the first container, then the next, then the next.
  // The equation stays visible for the whole step (it fades at the *start* of the next one instead).
  steps.push({
    kind: "boxGroups",
    groups,
    perGroup,
    total,
    groupsRevealed: groups,
    groupReveal: null,
    dotsRevealed: 0,
    dotReveal: { staggerMs: staggerFor(total) },
    showPlus: false,
    calloutAddition: null,
    calloutMul: null,
    equationDisplay: "visible",
    containerCountReveal: null,
    done: false,
    answer: buildEquationParts(groups, perGroup, { highlightPerGroup: true }),
    explanation: [t("Let's fill each box with "), q(String(perGroup)), t(" dots.")],
  });

  // 4. "+" appears between the containers, and the addition callout sets up the expression -
  // total still hidden ("?") - mirroring generateRepeatedAdditionSteps' addup-setup step exactly.
  // The equation fades out right here, at the beginning of this step (not at the end of step 3),
  // handing off to repeated addition's own visuals.
  steps.push({
    kind: "boxGroups",
    groups,
    perGroup,
    total,
    groupsRevealed: groups,
    groupReveal: null,
    dotsRevealed: total,
    dotReveal: null,
    showPlus: true,
    calloutAddition: { terms, total: null },
    calloutMul: null,
    equationDisplay: "fadeOut",
    containerCountReveal: null,
    done: false,
    answer: buildEquationParts(groups, perGroup),
    explanation: [
      t("Add the boxes together: "),
      q(`${termsJoined} = ?`),
      t(". This is "),
      k("repeated addition"),
      t("."),
    ],
  });

  // 5. Question: same "?" callout, now with the question attached - posed as the addition
  // expression itself ("What's 4 + 4 + 4?").
  steps.push({
    kind: "boxGroups",
    groups,
    perGroup,
    total,
    groupsRevealed: groups,
    groupReveal: null,
    dotsRevealed: total,
    dotReveal: null,
    showPlus: true,
    calloutAddition: { terms, total: null },
    calloutMul: null,
    equationDisplay: "hidden",
    containerCountReveal: null,
    done: false,
    answer: buildEquationParts(groups, perGroup),
    question: { id: sumGuessId, options: numericMcqOptions(total, 1, 100), correctValue: String(total) },
    explanation: [t("What's "), q(termsJoined), t("?")],
  });

  // 6. Reveal: count the containers by `perGroup`s (4, 8, 12) before the total lands - the addition
  // callout's total (and the feedback line, delayed to match) are already present in the step data
  // below, but BoxGroupsView holds its own display of them back until the skip-count finishes, same
  // gating pattern as the Arrays concept's countReveal (see ArrayBuildView).
  const containerLabels = Array.from({ length: groups }, (_, i) => String((i + 1) * perGroup));
  const countStaggerMs = staggerFor(groups);
  steps.push({
    kind: "boxGroups",
    groups,
    perGroup,
    total,
    groupsRevealed: groups,
    groupReveal: null,
    dotsRevealed: total,
    dotReveal: null,
    showPlus: true,
    calloutAddition: { terms, total },
    calloutMul: null,
    equationDisplay: "hidden",
    containerCountReveal: { labels: containerLabels, staggerMs: countStaggerMs },
    done: false,
    answer: buildEquationParts(groups, perGroup),
    feedback: {
      questionId: sumGuessId,
      correctValue: String(total),
      feedbackDelayMs: countStaggerMs * (groups + 1) + 300,
    },
    explanation: [t("Let's count the boxes by "), k(String(perGroup)), t("s to find the total.")],
  });

  // 7. Multiplication is a shortcut for that addition - the addition callout steps aside for the
  // same calloutMul generateRepeatedAdditionSteps uses (the equation stays hidden, so the
  // workspace needs its own place to land the fact, same as repeated addition does).
  const mulCallout = { expr: `${groups} × ${perGroup} = `, total };
  steps.push({
    kind: "boxGroups",
    groups,
    perGroup,
    total,
    groupsRevealed: groups,
    groupReveal: null,
    dotsRevealed: total,
    dotReveal: null,
    showPlus: true,
    calloutAddition: null,
    calloutMul: mulCallout,
    equationDisplay: "hidden",
    containerCountReveal: null,
    done: false,
    answer: buildEquationParts(groups, perGroup, { total }),
    explanation: [
      k("Multiplication"),
      t(" is a faster way to add: "),
      q(`${groups} boxes of ${perGroup}`),
      t(" is "),
      q(`${groups} × ${perGroup} = ${total}`),
      t("."),
    ],
  });

  steps.push({
    kind: "boxGroups",
    groups,
    perGroup,
    total,
    groupsRevealed: groups,
    groupReveal: null,
    dotsRevealed: total,
    dotReveal: null,
    showPlus: true,
    calloutAddition: null,
    calloutMul: mulCallout,
    equationDisplay: "hidden",
    containerCountReveal: null,
    done: true,
    answer: buildEquationParts(groups, perGroup, { total }),
    explanation: [k("Done."), t(" "), q(`${groups} × ${perGroup} = ${total}`), t(".")],
  });

  return steps;
}
