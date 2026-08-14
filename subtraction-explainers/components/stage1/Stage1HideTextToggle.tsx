"use client";

import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { IconButton } from "@/components/ds/IconButton";
import { useMediaQuery, DESKTOP_QUERY } from "@/hooks/useMediaQuery";
import { useStage1 } from "./Stage1Context";

/** Pixel/behavior-identical copy of subtraction/HideTextToggle.tsx's pair (round-20: header
 * consistency) - desktop-only icon button, top-right of the header; mobile gets the equivalent
 * row inside the settings sheet instead (see Stage1HideTextRow below) - never both at once. */
export function Stage1HideTextIconButton() {
  const isDesktop = useMediaQuery(DESKTOP_QUERY);
  const { hideText, setHideText } = useStage1();
  if (!isDesktop) return null;

  return (
    <IconButton
      aria-label={hideText ? "Show instruction text" : "Hide instruction text"}
      aria-pressed={hideText}
      variant={hideText ? "primary" : "default"}
      size={36}
      onClick={() => setHideText(!hideText)}
    >
      {hideText ? <EyeOff size={18} /> : <Eye size={18} />}
    </IconButton>
  );
}

/** Mobile-only row inside the settings bottom sheet, styled to match that sheet's other field
 * rows (Stage1OptionsPanel already only ever renders there). */
export function Stage1HideTextRow() {
  const { hideText, setHideText } = useStage1();

  return (
    <button
      type="button"
      role="switch"
      aria-checked={hideText}
      onClick={() => setHideText(!hideText)}
      className="w-full h-9 flex items-center justify-between px-3 rounded-lg border border-line bg-card text-[13px] text-ink font-mono"
    >
      <span className="flex items-center gap-2">
        {hideText ? <EyeOff size={15} className="text-ink-3" /> : <Eye size={15} className="text-ink-3" />}
        Instruction Text
      </span>
      <span
        className={cn(
          "relative block w-[38px] h-[22px] rounded-full border transition-colors duration-200 shrink-0",
          hideText ? "bg-left/15 border-left" : "bg-paper-2 border-line-2",
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 left-0.5 w-[16px] h-[16px] rounded-full border transition-transform duration-200",
            hideText ? "translate-x-[16px] bg-left border-left" : "translate-x-0 bg-card border-line-2",
          )}
        />
      </span>
    </button>
  );
}
