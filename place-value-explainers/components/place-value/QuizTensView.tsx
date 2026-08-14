"use client";

import { useEffect, useState } from "react";
import { TensGroupsField, SPACING_TRANSITION_MS } from "./TensGroupsField";
import { useQuiz } from "./QuizContext";
import type { QuizTensStep } from "@/lib/place-value/types";

const BOX_INTERVAL_MS = 550;

/** The tens quiz: on mount, plays the spacing-increase animation (packed -> scaffold) first -
 * QuizOptions stays hidden while `quiz.tens.phase === "intro"` and only appears once that
 * finishes and the phase advances to "question". Once answered, boxes one more group every
 * 550ms until all `step.tens` groups are boxed with their running count, at which point it
 * reports back to PlaceValueQuizContext to unlock navigation. Local `boxedGroups` state is safe
 * to own here because Prev/Next stay locked (and this view stays mounted) for the entire
 * reveal. */
export function QuizTensView({ step }: { step: QuizTensStep }) {
  const { quiz, dispatch } = useQuiz();
  const [boxedGroups, setBoxedGroups] = useState(1);

  useEffect(() => {
    if (quiz.tens.phase !== "intro") return;
    const timer = window.setTimeout(() => dispatch({ type: "TENS_INTRO_DONE" }), SPACING_TRANSITION_MS);
    return () => window.clearTimeout(timer);
  }, [quiz.tens.phase, dispatch]);

  useEffect(() => {
    if (quiz.tens.phase !== "revealing") return;
    if (boxedGroups >= step.tens) {
      dispatch({ type: "TENS_REVEAL_DONE" });
      return;
    }
    const timer = window.setTimeout(() => setBoxedGroups((g) => g + 1), BOX_INTERVAL_MS);
    return () => window.clearTimeout(timer);
  }, [quiz.tens.phase, boxedGroups, step.tens, dispatch]);

  const spacing = quiz.tens.phase === "intro" ? "packed" : "scaffold";
  const boxLabels = quiz.tens.phase !== "intro" && quiz.tens.phase !== "question";

  return (
    <div className="flex w-full flex-col items-center gap-3 p-1.5">
      <TensGroupsField
        tens={step.tens}
        ones={step.ones}
        spacing={spacing}
        boxedGroups={boxedGroups}
        boxLabels={boxLabels}
        onesPlacement="inline"
        layoutKey="pv2-quiz-tens"
      />
    </div>
  );
}
