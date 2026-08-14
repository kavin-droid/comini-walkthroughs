import { k, placeholderAnswer, q, revealedAnswer, t } from "./narration";
import type { FractionStep } from "./types";

/** Matches the vanilla stage 3 app's SET_SIZE - the number of chocolate pieces in the "set" view. */
export const SET_SIZE = 12;

function plPart(n: number): string {
  return n === 1 ? "part" : "parts";
}
function plGroup(n: number): string {
  return n === 1 ? "group" : "groups";
}
function plPiece(n: number): string {
  return n === 1 ? "piece" : "pieces";
}

/** Equal parts of a whole and a set. Ported 1:1 from the vanilla stage 3 app's
 * generateSteps(fracStr) - shade the fraction on a bar, then show the same fraction describing a
 * group of a 12-piece set, ending on the piece count that fraction represents. Note the answer
 * (a piece count out of the set) is only ever revealed once the set view names it - shading the
 * bar earlier does not reveal it, matching the vanilla step data exactly. */
export function generateSteps(fracStr: string): FractionStep[] {
  const [numStr, denStr] = fracStr.split("/");
  const num = parseInt(numStr, 10);
  const den = parseInt(denStr, 10);
  const groupSize = SET_SIZE / den;
  const shadedCount = num * groupSize;
  const answerPrefix = `${fracStr} of ${SET_SIZE} = `;
  const answerValue = String(shadedCount);
  const steps: FractionStep[] = [];

  steps.push({
    kind: "whole",
    done: false,
    answer: placeholderAnswer(answerPrefix),
    explanation: [
      t("Here is "),
      k("one whole chocolate bar"),
      t(". A fraction like "),
      q(fracStr),
      t(" can describe equal parts of it."),
    ],
  });

  steps.push({
    kind: "strip",
    cellCount: den,
    shaded: 0,
    boundary: null,
    caption: `${den} equal parts`,
    showHalves: false,
    halvesShaded: 0,
    callout: null,
    done: false,
    answer: placeholderAnswer(answerPrefix),
    explanation: [t("Split the bar into "), k(`${den} equal ${plPart(den)}`), t(".")],
  });

  steps.push({
    kind: "strip",
    cellCount: den,
    shaded: num,
    boundary: null,
    caption: `${den} equal parts`,
    showHalves: false,
    halvesShaded: 0,
    callout: [`${num} of ${den}`, fracStr],
    done: false,
    answer: placeholderAnswer(answerPrefix),
    explanation: [
      q(fracStr),
      t(" of the bar is "),
      k(`${num} out of ${den} equal ${plPart(den)}`),
      t("."),
    ],
  });

  steps.push({
    kind: "set",
    size: SET_SIZE,
    denominator: den,
    grouped: false,
    shadedGroups: 0,
    callout: null,
    done: false,
    answer: placeholderAnswer(answerPrefix),
    explanation: [
      t("A fraction can also describe equal parts of a "),
      k("set"),
      t(", like "),
      q(`${SET_SIZE} chocolate pieces`),
      t("."),
    ],
  });

  steps.push({
    kind: "set",
    size: SET_SIZE,
    denominator: den,
    grouped: true,
    shadedGroups: 0,
    callout: null,
    done: false,
    answer: placeholderAnswer(answerPrefix),
    explanation: [
      t("Split the "),
      t(String(SET_SIZE)),
      t(" pieces into "),
      k(`${den} equal ${plGroup(den)}`),
      t(" of "),
      q(`${groupSize} each`),
      t("."),
    ],
  });

  steps.push({
    kind: "set",
    size: SET_SIZE,
    denominator: den,
    grouped: true,
    shadedGroups: num,
    callout: [
      `${fracStr} of ${SET_SIZE}`,
      `${num} ${plGroup(num)} of ${groupSize}`,
      `${shadedCount} ${plPiece(shadedCount)}`,
    ],
    done: false,
    answer: revealedAnswer(answerPrefix, answerValue),
    explanation: [
      q(fracStr),
      t(` of ${SET_SIZE} pieces is `),
      k(`${num} ${plGroup(num)} of ${groupSize}`),
      t(", which is "),
      k(`${shadedCount} ${plPiece(shadedCount)}`),
      t("."),
    ],
  });

  steps.push({
    kind: "set",
    size: SET_SIZE,
    denominator: den,
    grouped: true,
    shadedGroups: num,
    callout: null,
    done: true,
    answer: revealedAnswer(answerPrefix, answerValue),
    explanation: [
      k("Done."),
      t(" Whether it is one bar or a set of pieces, "),
      q(fracStr),
      t(" always means the same "),
      k(`${num} of ${den} equal parts`),
      t(". "),
      q(`${fracStr} of ${SET_SIZE} = ${shadedCount}`),
      t("."),
    ],
  });

  return steps;
}
