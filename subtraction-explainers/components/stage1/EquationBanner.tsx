"use client";

import { cn } from "@/lib/utils";
import type { EquationHighlight } from "@/lib/stage1/types";

/** The equation lives INSIDE each scene's own workspace now (round-11: "WorkingAnswer need not be
 * shown when the equation is shown within the workarea in the same styling") - this is that same
 * styling (ported 1:1 from the old separate Stage1AnswerCard/subtraction AnswerCard), just
 * rendered as the first child of the scaled workspace instead of a sibling card above it, so it
 * scales together with the rest of the scene instead of staying a fixed size while everything
 * below it grows/shrinks. */
export function EquationBanner({
  left,
  right,
  answer,
  highlight,
  revealed,
}: {
  left: number;
  right: number;
  answer: number;
  highlight: EquationHighlight;
  revealed: boolean;
}) {
  return (
    <div className="shrink-0 bg-card border border-line rounded-2xl px-4 py-3 text-center shadow-sm">
      <span className="font-mono text-[26px] min-[900px]:text-[30px] font-semibold text-ink tracking-wide">
        <span className={cn("rounded transition-colors duration-300", highlight === "minuend" && "text-hop bg-hop-bg px-1")}>
          {left}
        </span>
        {" − "}
        <span className={cn("rounded transition-colors duration-300", highlight === "subtrahend" && "text-hop bg-hop-bg px-1")}>
          {right}
        </span>
        {" = "}
        <span className={cn("inline-block transition-colors duration-300", revealed ? "text-left" : "text-ink-3 opacity-50")}>
          {revealed ? answer : "?"}
        </span>
      </span>
    </div>
  );
}
