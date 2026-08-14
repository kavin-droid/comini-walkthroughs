import { k, plural, q, t } from "./narration";
import type { Fragment, PlaceValueStep } from "./types";

/** 5 fixed steps - loose ten-packs, one hundred highlighted, an interactive "how many hundreds"
 * quiz (the spacing scaffold and the counted migration into a hundreds column both live inside
 * this step, not separate ones), reveal the three place cards, then expanded form (done). */
export function generatePlaceValueSteps3(n: number): PlaceValueStep[] {
  const hundreds = Math.floor(n / 100);
  const rem = n % 100;
  const tens = Math.floor(rem / 10);
  const ones = rem % 10;
  const totalTens = Math.floor(n / 10);
  const steps: PlaceValueStep[] = [];

  const onesPhrase: Fragment = ones > 0 ? k(`${ones} ${plural(ones, "one")}`) : k("no loose ones");

  steps.push({
    kind: "rodsOnes",
    n,
    hundreds,
    tens,
    ones,
    totalTens,
    phase: "loose",
    done: false,
    explanation: [
      q(String(n)),
      t(" is made of "),
      k(`${totalTens} ten-packs`),
      t(" and "),
      onesPhrase,
      t(", too many tens to count quickly."),
    ],
  });

  steps.push({
    kind: "rodsOnes",
    n,
    hundreds,
    tens,
    ones,
    totalTens,
    phase: "highlight",
    done: false,
    explanation: [k("Ten ten-packs"), t(" make a hundred.")],
  });

  steps.push({
    kind: "quizHundreds",
    n,
    hundreds,
    tens,
    ones,
    totalTens,
    done: false,
    explanation: [k("How many hundreds are there in total?"), t(" Tap your answer.")],
  });

  steps.push({
    kind: "cards",
    n,
    hundreds,
    tens,
    ones,
    showDecompose: true,
    showExpanded: false,
    revealAnswer: true,
    done: false,
    explanation: [k("The ten-packs and ones become the tens and ones column"), t(".")],
  });

  steps.push({
    kind: "cards",
    n,
    hundreds,
    tens,
    ones,
    showDecompose: true,
    showExpanded: true,
    revealAnswer: true,
    done: true,
    explanation: [q(`${hundreds * 100} + ${tens * 10} + ${ones} = ${n}`), t(".")],
  });

  return steps;
}
