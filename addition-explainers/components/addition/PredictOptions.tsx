"use client";

import { cn } from "@/lib/utils";
import { useAddition } from "./AdditionContext";

/** Rendered as a sibling of the scaled workspace (not inside it, see AdditionWalkthrough) so
 * the tap targets stay full native size regardless of how much the grid above has been shrunk
 * to fit - ported directly from the vanilla apps' deliberate DOM placement. */
export function PredictOptions() {
  const { session, dispatch, phaseObj } = useAddition();

  if (phaseObj.type !== "predict" || !phaseObj.place) return null;
  const place = phaseObj.place;
  const options = session.mcqOptions[place];
  if (!options) return null;

  return (
    <div className="shrink-0 flex justify-center gap-3.5 pt-0.5">
      {options.map((value) => (
        <button
          key={value}
          onClick={() => dispatch({ type: "SELECT_PREDICTION", place, value })}
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
