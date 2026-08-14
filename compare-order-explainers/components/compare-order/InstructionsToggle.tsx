"use client";

import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { IconButton } from "@/components/ds/IconButton";
import { useMediaQuery, DESKTOP_QUERY } from "@/hooks/useMediaQuery";
import { useCompareOrder } from "./CompareOrderContext";

/** Desktop-only header control for hiding the passive narration text (see NarrationBox) - the
 * mobile equivalent (InstructionsToggleRow, below) lives in the settings sheet instead (see
 * OptionsPanel), matching this app's existing desktop-header vs mobile-sheet split for secondary
 * controls. */
export function InstructionsToggle() {
  const isDesktop = useMediaQuery(DESKTOP_QUERY);
  const { instructionsVisible, toggleInstructions } = useCompareOrder();
  if (!isDesktop) return null;

  return (
    <IconButton
      aria-label={instructionsVisible ? "Hide instructions" : "Show instructions"}
      onClick={toggleInstructions}
      size={36}
    >
      {instructionsVisible ? <Eye size={17} /> : <EyeOff size={17} />}
    </IconButton>
  );
}

/** Mobile settings-sheet row version - a labeled track/thumb switch matching ModeToggle's visual
 * language, since the sheet has room for a label the header icon-button doesn't. */
export function InstructionsToggleRow() {
  const { instructionsVisible, toggleInstructions } = useCompareOrder();

  return (
    <button
      type="button"
      onClick={toggleInstructions}
      className="w-full flex items-center justify-between px-3 h-11 rounded-lg border border-line bg-card"
    >
      <span className="text-[13px] font-medium text-ink">Instructions</span>
      <span
        className={cn(
          "relative block w-[44px] h-[26px] rounded-full border-[1.5px] transition-colors duration-200",
          instructionsVisible ? "bg-left/15 border-left" : "bg-paper-2 border-line-2",
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 left-0.5 w-[19px] h-[19px] rounded-full border transition-transform duration-200",
            instructionsVisible
              ? "translate-x-[18px] bg-left border-left"
              : "translate-x-0 bg-card border-line-2",
          )}
          style={{ transitionTimingFunction: "cubic-bezier(0.34, 1.56, 0.64, 1)" }}
        />
      </span>
    </button>
  );
}
