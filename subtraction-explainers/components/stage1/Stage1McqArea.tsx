"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { generateNumberOptions } from "@/lib/stage1/mcq";
import type { TakeAwayStep } from "@/lib/stage1/types";
import { useStage1 } from "./Stage1Context";
import { PositionMcq } from "./NumberLineScene";

/** Holds every Stage1 MCQ - both concepts' - so it can render OUTSIDE the scaled workarea, below
 * the narration text (round-17/18 feedback: an MCQ buried inside the workspace card shrinks/grows
 * with its fit-to-card scale like the rest of the SVG). */
export function Stage1McqArea() {
  const { step, dispatch, countingIndex, runCountThenAdvance } = useStage1();

  if (step.view === "countBack" && step.askPosition && !step.revealAnswer) {
    const answer = step.minuend - step.subtrahend;
    return (
      <div className="shrink-0 flex justify-center">
        <PositionMcq answer={answer} onCorrect={() => dispatch({ type: "ADVANCE" })} />
      </div>
    );
  }

  if (step.view === "takeAway" && step.askRemaining && !step.revealAnswer) {
    const remaining = step.minuend - step.subtrahend;
    return (
      <div className="shrink-0 flex justify-center">
        <RemainingMcq
          step={step}
          counting={countingIndex !== null}
          onCorrect={() => runCountThenAdvance(remaining, () => dispatch({ type: "ADVANCE" }))}
        />
      </div>
    );
  }

  return null;
}

/** "How many are left" MCQ, same wrong-answer-is-purely-local-feedback pattern as
 * subtraction/PredictOptions - a wrong tap never dispatches anything. A correct tap hands off to
 * Stage1Context's "count one by one, then advance" sequence instead of advancing immediately. */
function RemainingMcq({
  step,
  counting,
  onCorrect,
}: {
  step: TakeAwayStep;
  counting: boolean;
  onCorrect: () => void;
}) {
  const correct = step.minuend - step.subtrahend;
  const options = generateNumberOptions(correct);
  const [wrongValue, setWrongValue] = useState<number | null>(null);
  const [chosen, setChosen] = useState<number | null>(null);

  useEffect(() => {
    setWrongValue(null);
    setChosen(null);
  }, [step.id]);

  function handleClick(value: number) {
    if (chosen !== null) return;
    if (value === correct) {
      setChosen(value);
      onCorrect();
      return;
    }
    setWrongValue(value);
    window.setTimeout(() => setWrongValue(null), 450);
  }

  return (
    <div className="flex justify-center gap-3.5 pt-1">
      {options.map((value) => (
        <button
          key={value}
          data-mcq-option
          disabled={counting || chosen !== null}
          onClick={() => handleClick(value)}
          className={cn(
            "w-14 h-14 rounded-2xl bg-card border-2 border-line font-mono text-xl font-bold text-ink",
            "hover:border-accent hover:bg-paper-2 transition-colors disabled:opacity-60",
            wrongValue === value && "border-used bg-used-bg animate-shake",
            chosen === value && "border-hop bg-hop-bg",
          )}
        >
          {value}
        </button>
      ))}
    </div>
  );
}
