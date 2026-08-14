"use client";

import { cn } from "@/lib/utils";
import { useRounding } from "./RoundingContext";
import { useCloser } from "./CloserContext";

/** Ported from `renderCloser()`'s `#mcq-host` half - the two lower/upper option buttons plus
 * feedback, rendered as a sibling of the (scaled) workspace, matching the vanilla apps'
 * deliberate DOM placement (see PredictOptions in addition-explainers for the same rationale:
 * tap targets stay full native size regardless of how much the number line above has been
 * shrunk to fit). */
export function McqOptions() {
  const { step } = useRounding();
  const { mcqAnswered, correctSide, wrongSide, feedback, answer } = useCloser();
  if (step.view !== "closer") return null;

  const opts: { label: string; side: "below" | "above" }[] = [
    { label: String(step.lower), side: "below" },
    { label: String(step.upper), side: "above" },
  ];

  return (
    <div className="shrink-0 flex flex-col items-center gap-2.5 w-full">
      <div className="flex flex-row flex-wrap gap-2.5 w-full max-w-[340px]">
        {opts.map((opt) => {
          const isCorrect = mcqAnswered && correctSide === opt.side;
          const isWrong = wrongSide === opt.side;
          return (
            <button
              key={opt.side}
              type="button"
              disabled={mcqAnswered}
              onClick={() => answer(opt.side)}
              className={cn(
                "flex-1 min-w-[120px] font-sans text-base font-bold px-[18px] py-3.5 rounded-2xl border-2 text-center transition-all",
                "border-line-2 bg-card text-ink",
                !mcqAnswered && "hover:border-ink",
                mcqAnswered && "cursor-default",
                isCorrect && "border-left bg-left/10 text-left",
                isWrong && "border-used bg-used/[0.08] text-used rd-shake",
              )}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
      {feedback && (
        <div
          className={cn(
            "font-sans text-sm font-semibold text-center px-3.5 py-2.5 rounded-[10px] w-full max-w-[340px] rd-fade-in",
            feedback.kind === "right" && "text-left bg-left/10",
            feedback.kind === "wrong" && "text-used bg-used/[0.08]",
          )}
        >
          {feedback.text}
        </div>
      )}
    </div>
  );
}
