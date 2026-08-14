import { k, plural, q, t } from "./narration";
import type { PlaceValueStep } from "./types";

/** 6 fixed steps - loose units, one highlighted group of ten, an interactive "how many tens" quiz
 * (the spacing scaffold lives inside this step, not a separate one), an interactive "how many
 * ones" quiz, a decompose callout step (this is also where the per-group counts get taken away -
 * `BundledView` always renders with `boxLabels={false}`), then an expanded-form callout step
 * (done). The two quiz steps carry no digit-reveal state of their own - PlaceValueQuizContext
 * tracks whether they've been answered, and the AnswerCard reads that global (not per-step)
 * reveal state. */
export function generatePlaceValueSteps2(n: number): PlaceValueStep[] {
  const tens = Math.floor(n / 10);
  const ones = n % 10;
  const steps: PlaceValueStep[] = [];

  steps.push({
    kind: "unitsField",
    n,
    tens,
    ones,
    phase: "loose",
    done: false,
    explanation: [
      q(String(n)),
      t(" is made of "),
      k(`${n} loose ones`),
      t(", too many to count quickly."),
    ],
  });

  steps.push({
    kind: "unitsField",
    n,
    tens,
    ones,
    phase: "counting",
    done: false,
    explanation: [k("Here is one ten"), t(", boxed together.")],
  });

  steps.push({
    kind: "quizTens",
    n,
    tens,
    ones,
    done: false,
    explanation: [k("How many tens are there?"), t(" Tap your answer.")],
  });

  steps.push({
    kind: "quizOnes",
    n,
    tens,
    ones,
    done: false,
    explanation: [k("How many ones are left?"), t(" Tap your answer.")],
  });

  steps.push({
    kind: "bundled",
    n,
    tens,
    ones,
    showDecompose: true,
    showExpanded: false,
    done: false,
    explanation: [
      t("Let's put it all together: "),
      q(`${tens} ${plural(tens, "ten")} + ${ones} ${plural(ones, "one")}`),
      t("."),
    ],
  });

  steps.push({
    kind: "bundled",
    n,
    tens,
    ones,
    showDecompose: true,
    showExpanded: true,
    done: true,
    explanation: [q(`${tens * 10} + ${ones} = ${n}`), t(".")],
  });

  return steps;
}
