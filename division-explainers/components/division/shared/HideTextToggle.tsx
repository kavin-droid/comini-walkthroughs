"use client";

import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { IconButton } from "@/components/ds/IconButton";
import { useMediaQuery, DESKTOP_QUERY } from "@/hooks/useMediaQuery";

interface HideTextProps {
  hidden: boolean;
  onToggle: () => void;
}

/** Desktop-only header control - lets an adult preview the flow the way a pre-reading child
 * would, by hiding the narration text entirely. The mobile equivalent is HideTextRow below,
 * living inside SettingsSheet instead (no header real estate to spare there). */
export function HideTextToggle({ hidden, onToggle }: HideTextProps) {
  const isDesktop = useMediaQuery(DESKTOP_QUERY);
  if (!isDesktop) return null;

  return (
    <IconButton
      aria-label={hidden ? "Show instruction text" : "Hide instruction text"}
      size={36}
      variant={hidden ? "primary" : "default"}
      onClick={onToggle}
    >
      {hidden ? <EyeOff size={18} /> : <Eye size={18} />}
    </IconButton>
  );
}

/** Mobile counterpart, rendered inside the settings bottom sheet - same pill-switch language as
 * ModeToggle, scaled into a labeled settings row instead of a standalone icon. */
export function HideTextRow({ hidden, onToggle }: HideTextProps) {
  return (
    <button type="button" onClick={onToggle} className="flex items-center justify-between gap-3 w-full py-2.5">
      <span className="font-sans text-[15px] text-ink">Hide the words</span>
      <span
        className={cn(
          "relative block w-[46px] h-[26px] rounded-full border-[1.5px] transition-colors duration-200 shrink-0",
          hidden ? "bg-left/15 border-left" : "bg-paper-2 border-line-2",
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 left-0.5 w-[19px] h-[19px] rounded-full border transition-all duration-200",
            hidden ? "translate-x-[20px] bg-left border-left" : "translate-x-0 bg-card border-line-2",
          )}
          style={{ transitionTimingFunction: "cubic-bezier(0.34, 1.56, 0.64, 1)" }}
        />
      </span>
    </button>
  );
}
