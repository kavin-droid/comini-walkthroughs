"use client";

import { cn } from "@/lib/utils";
import { useStage1 } from "./Stage1Context";

/** Rendered as a sibling of the scaled workspace (not inside it) so the tap targets stay full
 * native size regardless of scale-to-fit - same placement reasoning as the addition app's
 * PredictOptions. */
export function Stage1PredictOptions() {
  const { session, dispatch, phaseObj } = useStage1();

  if (phaseObj.type !== "predict" || !session.mcqOptions) return null;

  return (
    <div className="shrink-0 flex justify-center gap-3.5 pt-0.5">
      {session.mcqOptions.map((value) => (
        <button
          key={value}
          onClick={() => dispatch({ type: "SELECT_PREDICTION", value })}
          className={cn(
            "w-14 h-14 rounded-2xl bg-card border-2 border-line font-mono text-xl font-bold text-ink",
            "hover:border-accent hover:bg-paper-2 transition-colors",
          )}
        >
          {value}
        </button>
      ))}
    </div>
  );
}
