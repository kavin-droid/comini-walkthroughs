import { k, placeholderAnswer, q, revealedAnswer, t } from "./narration";
import type { FractionStep } from "./types";

const QUARTERS_OF: Record<string, number> = {
  "1/4": 1,
  "1/2": 2,
  "3/4": 3,
  "1": 4,
};

/** Concept A: unit fractions & equivalence. Whole bar -> split into quarters -> highlight one
 * piece to establish "one piece = 1/4" -> the learner taps to shade the fraction themselves,
 * asked in quarters notation ("show what 2/4 looks like") now that they have a unit to count with
 * - gated: wrong counts must be retried, and the prompt never states how many cells to tap ->
 * naming the equivalent halves/whole form ("2/4 and 1/2 are the same") -> done. */
export function generateStepsEquivalence(fracStr: string): FractionStep[] {
  const quarters = QUARTERS_OF[fracStr];
  const exprRight = `${quarters}/4`;
  const answerPrefix = `${fracStr} = `;
  const steps: FractionStep[] = [];

  steps.push({
    kind: "whole",
    done: false,
    answer: placeholderAnswer(answerPrefix),
    explanation: [t("Here is "), k("one whole chocolate bar"), t(".")],
  });

  steps.push({
    kind: "strip",
    cellCount: 4,
    shaded: 0,
    boundary: null,
    caption: "quarters",
    showHalves: false,
    halvesShaded: 0,
    callout: null,
    done: false,
    answer: placeholderAnswer(answerPrefix),
    explanation: [t("Let's split the bar into "), k("4 equal pieces"), t(" — "), k("quarters"), t(".")],
  });

  steps.push({
    kind: "strip",
    cellCount: 4,
    shaded: 1,
    boundary: null,
    caption: "quarters",
    showHalves: false,
    halvesShaded: 0,
    callout: ["1/4"],
    done: false,
    answer: placeholderAnswer(answerPrefix),
    explanation: [t("This "), k("one piece"), t(" is "), q("1/4"), t(" of the whole bar.")],
  });

  steps.push({
    kind: "tapQuarters",
    cellCount: 4,
    target: quarters,
    activeColor: "piece1",
    referenceBar: null,
    done: false,
    promptCallout: [exprRight],
    promptExplanation: [t("Can you tap to show "), q(exprRight), t("?")],
    promptAnswer: placeholderAnswer(answerPrefix),
    answer: revealedAnswer(answerPrefix, exprRight),
    explanation: [t("Yes — "), k(`${quarters} out of 4 equal parts`), t(" is "), q(exprRight), t(".")],
    solvedCallout: [`${quarters} of 4`, exprRight],
  });

  const hasEquivalentForm = quarters === 2 || quarters === 4;

  if (quarters === 2) {
    steps.push({
      kind: "strip",
      cellCount: 4,
      shaded: 2,
      boundary: null,
      caption: "quarters",
      showHalves: true,
      halvesShaded: 1,
      callout: ["1/2", "2/4"],
      done: false,
      answer: revealedAnswer(answerPrefix, exprRight),
      explanation: [k("1/2"), t(" and "), q("2/4"), t(" are the same amount.")],
    });
  } else if (quarters === 4) {
    steps.push({
      kind: "strip",
      cellCount: 4,
      shaded: 4,
      boundary: null,
      caption: "quarters",
      showHalves: true,
      halvesShaded: 2,
      callout: ["1", "4/4", "2/2"],
      done: false,
      answer: revealedAnswer(answerPrefix, exprRight),
      explanation: [q("4/4"), t(", "), q("2/2"), t(", and "), k("1 whole"), t(" are all the same bar.")],
    });
  }

  steps.push({
    kind: "strip",
    cellCount: 4,
    shaded: quarters,
    boundary: null,
    caption: "quarters",
    showHalves: hasEquivalentForm,
    halvesShaded: hasEquivalentForm ? quarters / 2 : 0,
    callout: null,
    done: true,
    answer: revealedAnswer(answerPrefix, exprRight),
    explanation: [k("Done."), t(" "), q(`${fracStr} = ${exprRight}`), t(".")],
  });

  return steps;
}

/** Concept B: combine two unit fractions. Intro -> the learner taps to shade the first piece on
 * its own bar -> taps to shade the second piece on a fresh second bar (with the first piece's bar
 * shown above, read-only, as a reference - never on the same bar as the first) -> both bars are
 * shown alongside a fresh third bar the learner taps to show the combined total, gated the same
 * way -> any simpler equivalent form -> done. None of the tap prompts state how many cells to
 * tap. */
export function generateStepsCombine(p1: string, p2: string): FractionStep[] {
  const q1 = p1 === "1/2" ? 2 : 1;
  const q2 = p2 === "1/2" ? 2 : 1;
  const total = q1 + q2;
  const exprLeft = `${p1} + ${p2}`;
  const exprRight = `${total}/4`;
  const simpleName = total === 2 ? "1/2" : total === 4 ? "1" : null;
  const answerPrefix = `${exprLeft} = `;
  const answerValue = simpleName ?? exprRight;
  const steps: FractionStep[] = [];

  steps.push({
    kind: "whole",
    done: false,
    answer: placeholderAnswer(answerPrefix),
    explanation: [t("What does "), q(exprLeft), t(" make?")],
  });

  steps.push({
    kind: "tapQuarters",
    cellCount: 4,
    target: q1,
    activeColor: "piece1",
    referenceBar: null,
    done: false,
    promptCallout: [p1],
    promptExplanation: [t("First, what does "), q(p1), t(" look like here?")],
    promptAnswer: placeholderAnswer(answerPrefix),
    answer: placeholderAnswer(answerPrefix),
    explanation: [t("Yes — "), q(p1), t(" is "), k(`${q1} out of 4 equal parts`), t(".")],
    solvedCallout: null,
  });

  steps.push({
    kind: "tapQuarters",
    cellCount: 4,
    target: q2,
    activeColor: "piece2",
    referenceBar: { shaded: q1, color: "piece1", caption: p1 },
    done: false,
    promptCallout: [p2],
    promptExplanation: [t("Now, what does "), q(p2), t(" look like here?")],
    promptAnswer: placeholderAnswer(answerPrefix),
    answer: placeholderAnswer(answerPrefix),
    explanation: [t("Yes — "), q(p2), t(" is "), k(`${q2} out of 4 equal parts`), t(".")],
    solvedCallout: null,
  });

  steps.push({
    kind: "tapCombineTotal",
    cellCount: 4,
    piece1Shaded: q1,
    piece1Caption: p1,
    piece2Shaded: q2,
    piece2Caption: p2,
    target: total,
    totalCaption: exprLeft,
    done: false,
    promptCallout: [exprLeft],
    promptExplanation: [t("Tap this bar to show "), q(exprLeft), t(".")],
    promptAnswer: placeholderAnswer(answerPrefix),
    answer: revealedAnswer(answerPrefix, answerValue),
    explanation: [t("Yes — "), q(exprLeft), t(" = "), k(exprRight), t(" of the chocolate bar.")],
    solvedCallout: [exprLeft, exprRight],
  });

  if (simpleName) {
    steps.push({
      kind: "strip",
      cellCount: 4,
      shaded: total,
      boundary: q1,
      caption: "quarters",
      showHalves: true,
      halvesShaded: total / 2,
      callout: [exprLeft, exprRight, simpleName],
      done: false,
      answer: revealedAnswer(answerPrefix, answerValue),
      explanation: [
        q(exprRight),
        t(" is the same as "),
        k(simpleName === "1" ? "1 whole chocolate bar" : simpleName),
        t("."),
      ],
    });
  }

  steps.push({
    kind: "strip",
    cellCount: 4,
    shaded: total,
    boundary: q1,
    caption: "quarters",
    showHalves: !!simpleName,
    halvesShaded: simpleName ? total / 2 : 0,
    callout: null,
    done: true,
    answer: revealedAnswer(answerPrefix, answerValue),
    explanation: [k("Done."), t(" "), q(`${exprLeft} = ${answerValue}`), t(".")],
  });

  return steps;
}
