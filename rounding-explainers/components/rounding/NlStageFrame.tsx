"use client";

import { forwardRef, type ReactNode, type MouseEvent } from "react";
import { cn } from "@/lib/utils";
import { useRounding } from "./RoundingContext";

interface NlStageFrameProps {
  interactive?: boolean;
  onClickStage?: (e: MouseEvent<HTMLDivElement>) => void;
  children: ReactNode;
}

/** Ported from `.nl-stage-wrap`/`.nl-stage`. Desktop width differs by stage: stage2's 2-column
 * (tens/ones) line is 420px wide, stage3's 3-column (hundreds/tens/ones) line is 460px - ported
 * exactly from each vanilla file's own `.nl-stage-wrap` desktop override, keyed here off
 * `config.places.length` rather than a dedicated config field (both stages' `places` array
 * length already uniquely identifies which vanilla file this is). */
export const NlStageFrame = forwardRef<HTMLDivElement, NlStageFrameProps>(function NlStageFrame(
  { interactive, onClickStage, children },
  ref,
) {
  const { config } = useRounding();
  const isStage3Width = config.places.length === 3;

  return (
    <div
      className={cn(
        "w-[340px] max-w-[92vw] min-[900px]:max-w-[88vw] px-2 max-[380px]:px-1",
        isStage3Width ? "min-[900px]:w-[460px]" : "min-[900px]:w-[420px]",
      )}
    >
      <div
        ref={ref}
        onClick={onClickStage}
        className={cn("relative h-[130px]", interactive ? "cursor-pointer" : "cursor-default")}
      >
        {children}
      </div>
    </div>
  );
});
