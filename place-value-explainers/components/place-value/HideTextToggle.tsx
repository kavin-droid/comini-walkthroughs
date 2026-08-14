"use client";

import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { IconButton } from "@/components/ds/IconButton";
import { useTextVisibility } from "./TextVisibilityContext";

/** Toggles the narration/instruction text off entirely - lets a grown-up preview the walkthrough
 * the way a pre-reading child would (visuals + interaction only, no prose to lean on). Rendered
 * as a compact icon button in the desktop header (`variant="icon"`) or a labeled switch row in
 * the mobile settings sheet (`variant="row"`) - same shared state either way. */
export function HideTextToggle({ variant = "icon" }: { variant?: "icon" | "row" }) {
  const { hideText, toggleHideText } = useTextVisibility();
  const label = hideText ? "Show instruction text" : "Hide instruction text";

  if (variant === "row") {
    return (
      <button
        type="button"
        onClick={toggleHideText}
        aria-pressed={hideText}
        className="flex h-11 w-full items-center justify-between rounded-lg border border-line bg-card px-3 text-[14px] font-semibold text-ink"
      >
        <span className="flex items-center gap-2">
          {hideText ? <EyeOff size={16} className="text-ink-3" /> : <Eye size={16} className="text-ink-3" />}
          {label}
        </span>
        <span
          className={cn(
            "relative block h-6 w-11 shrink-0 rounded-full border-[1.5px] transition-colors duration-200",
            hideText ? "border-left bg-left/15" : "border-line-2 bg-paper-2",
          )}
        >
          <span
            className={cn(
              "absolute top-0.5 left-0.5 h-[19px] w-[19px] rounded-full border transition-transform duration-200",
              hideText ? "translate-x-[19px] border-left bg-left" : "translate-x-0 border-line-2 bg-card",
            )}
          />
        </span>
      </button>
    );
  }

  return (
    <IconButton
      aria-label={label}
      aria-pressed={hideText}
      onClick={toggleHideText}
      size={36}
      variant={hideText ? "primary" : "default"}
    >
      {hideText ? <EyeOff size={16} /> : <Eye size={16} />}
    </IconButton>
  );
}
