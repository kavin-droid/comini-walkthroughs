"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { useSubtraction } from "./SubtractionContext";

/** Rendered as a sibling of the scaled workspace (not inside it) so tap targets stay full native
 * size regardless of how much the grid above has been shrunk to fit. A wrong guess never reaches
 * the reducer - it's pure local UI feedback (shake + "Not quite. Try again!"), and this feedback
 * text is action-oriented so it's never gated by the hide-instruction-text toggle (round-18). */
export function PredictOptions() {
  const { session, dispatch, phaseObj } = useSubtraction();
  const [wrongValue, setWrongValue] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);

  useEffect(() => {
    setWrongValue(null);
    setShowFeedback(false);
  }, [phaseObj.type, phaseObj.place]);

  if (phaseObj.type !== "predict" || !phaseObj.place) return null;
  const place = phaseObj.place;
  const options = session.mcqOptions[place];
  if (!options) return null;
  const correct = session.own[place].take;

  function handleClick(value: number) {
    if (value === correct) {
      dispatch({ type: "SELECT_PREDICTION", place, value });
    } else {
      setWrongValue(value);
      setShowFeedback(true);
      window.setTimeout(() => setWrongValue(null), 450);
    }
  }

  return (
    <div className="shrink-0 flex flex-col items-center gap-2 pt-0.5">
      <div className="flex justify-center gap-3.5">
        {options.map((value) => (
          <button
            key={value}
            data-mcq-option
            onClick={() => handleClick(value)}
            className={cn(
              "w-14 h-14 rounded-2xl bg-card border-2 border-line font-mono text-xl font-bold text-ink",
              "hover:border-accent hover:bg-paper-2 transition-colors",
              wrongValue === value && "border-used bg-used-bg animate-shake",
            )}
          >
            {value}
          </button>
        ))}
      </div>
      <div
        className={cn(
          "font-serif italic text-[14px] text-used min-h-[18px] text-center transition-opacity duration-200",
          showFeedback ? "opacity-100" : "opacity-0",
        )}
      >
        Not quite. Try again!
      </div>
    </div>
  );
}
