"use client";

import { useEffect, useState } from "react";
import { TensGroupsField } from "./TensGroupsField";
import { useQuiz } from "./QuizContext";
import type { QuizOnesStep } from "@/lib/place-value/types";

const ARRIVE_INTERVAL_MS = 450;
const EMPTY_DELAY_MS = 150;

/** The ones quiz: continues the fully-boxed tens field from the previous step, with the leftover
 * ones still sitting loose at the tail. Once answered, a "ones" column opens to the right and the
 * leftover units count up one at a time as they fly into it (a shared `layoutId` per unit makes
 * the fly-over a real Framer Motion layout transition, not a cut). Reports back to
 * PlaceValueQuizContext once every leftover has arrived. The decompose/expanded callouts belong
 * to the later "bundled" steps, not here. */
export function QuizOnesView({ step }: { step: QuizOnesStep }) {
  const { quiz, dispatch } = useQuiz();
  const [arrived, setArrived] = useState(0);

  useEffect(() => {
    if (quiz.ones.phase !== "revealing") return;
    if (arrived >= step.ones) {
      dispatch({ type: "ONES_REVEAL_DONE" });
      return;
    }
    const delay = step.ones === 0 ? EMPTY_DELAY_MS : ARRIVE_INTERVAL_MS;
    const timer = window.setTimeout(() => setArrived((a) => a + 1), delay);
    return () => window.clearTimeout(timer);
  }, [quiz.ones.phase, arrived, step.ones, dispatch]);

  const answered = quiz.ones.phase !== "question";

  return (
    <div className="flex w-full flex-col items-center gap-3.5 p-1.5">
      <TensGroupsField
        tens={step.tens}
        ones={step.ones}
        spacing="scaffold"
        boxedGroups={step.tens}
        onesPlacement={answered ? "column" : "inline"}
        onesArrived={arrived}
        layoutKey="pv2-quiz-ones"
      />
    </div>
  );
}
