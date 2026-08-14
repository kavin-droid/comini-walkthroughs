"use client";

import { cn } from "@/lib/utils";
import { usePlaceValue } from "./PlaceValueContext";
import { useQuiz } from "./QuizContext";

/** The answer-option circles and feedback pill, rendered outside the workspace (below the
 * narration box), for whichever quiz is active - stage 2's tens/ones pair, or stage 3's
 * hundreds. Renders nothing for non-quiz steps. */
export function QuizOptions() {
  const { step } = usePlaceValue();
  const { quiz, dispatch } = useQuiz();

  if (step.kind !== "quizTens" && step.kind !== "quizOnes" && step.kind !== "quizHundreds") {
    return null;
  }

  const slotKey = step.kind === "quizTens" ? "tens" : step.kind === "quizOnes" ? "ones" : "hundreds";
  const slot = quiz[slotKey];
  const correctValue = step.kind === "quizTens" ? step.tens : step.kind === "quizOnes" ? step.ones : step.hundreds;

  // Wait for the spacing-scaffold animation to finish before showing the question, so the child
  // watches the spacing change happen instead of seeing the options pop in at the same instant.
  if (slot.phase === "intro") return null;

  const resolved = slot.phase === "feedback";
  const verb = correctValue === 1 ? "is" : "are";

  function choose(val: number) {
    if (slot.selected !== null) return;
    const type =
      slotKey === "tens" ? "ANSWER_TENS" : slotKey === "ones" ? "ANSWER_ONES" : "ANSWER_HUNDREDS";
    dispatch({ type, value: val });
  }

  return (
    <div className="shrink-0 flex flex-col items-center gap-2 py-1">
      <div className="flex flex-wrap justify-center gap-2.5">
        {slot.options.map((val) => {
          const isSelected = val === slot.selected;
          const isCorrect = resolved && val === correctValue;
          const isWrong = resolved && isSelected && val !== correctValue;
          return (
            <button
              key={val}
              type="button"
              disabled={slot.selected !== null}
              onClick={() => choose(val)}
              className={cn(
                "flex h-[50px] w-[50px] items-center justify-center rounded-full border-2 border-line-2 bg-card font-mono text-[18px] font-bold text-ink transition-all",
                slot.selected === null && "hover:border-tens hover:-translate-y-px",
                isSelected && !resolved && "border-ink bg-paper-2",
                isCorrect && "border-left bg-left/12 text-left",
                isWrong && "border-used bg-used/10 text-used",
                slot.selected !== null && "cursor-not-allowed",
              )}
            >
              {val}
            </button>
          );
        })}
      </div>
      {resolved && (
        <div
          className={cn(
            "rounded-full px-4 py-1.5 font-sans text-[13px] font-bold",
            slot.selected === correctValue ? "text-left bg-left/10" : "text-used bg-used/8",
          )}
        >
          {slot.selected === correctValue
            ? `Correct! There ${verb} ${correctValue}.`
            : `Not quite. There ${verb} ${correctValue}.`}
        </div>
      )}
    </div>
  );
}
