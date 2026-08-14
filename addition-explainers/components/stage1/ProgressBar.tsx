"use client";

import { cn } from "@/lib/utils";
import { useStage1 } from "./Stage1Context";
import { useMediaQuery, DESKTOP_QUERY } from "@/hooks/useMediaQuery";

export function ProgressBar() {
  const { session, phases } = useStage1();
  const isDesktop = useMediaQuery(DESKTOP_QUERY);

  if (isDesktop) {
    return (
      <div className="flex justify-center gap-1.5 px-4 pt-2 shrink-0">
        {phases.map((_, i) => (
          <div
            key={i}
            className={cn(
              "h-1.5 w-1.5 rounded-full transition-colors duration-200",
              i <= session.phaseIdx ? "bg-left" : "bg-line-2",
            )}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className="fixed top-0 left-0 right-0 flex gap-[3px] px-2.5 h-1 mt-1.5"
      style={{ zIndex: 60, pointerEvents: "none" }}
    >
      {phases.map((_, i) => (
        <div
          key={i}
          className={cn(
            "flex-1 h-1 rounded-full transition-colors duration-200",
            i <= session.phaseIdx ? "bg-left" : "bg-line-2",
          )}
        />
      ))}
    </div>
  );
}
