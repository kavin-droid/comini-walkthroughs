"use client";

import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNarrationVisibility } from "./NarrationVisibilityContext";

/** Switch for the global narration-visibility toggle - visually matches ModeToggle (same
 * track/thumb dimensions) for design-system consistency. Rendered from two call sites: Header
 * (desktop only, wrapped in an `isDesktop` check there) and OptionsPanel (mobile settings sheet,
 * always visible there since that sheet only ever mounts on mobile) - not gated internally, so
 * both call sites control their own visibility. The trailing label hides itself below the 900px
 * desktop breakpoint, matching ModeToggle's own label-hiding behavior. */
export function InstructionsToggle() {
  const { visible, setVisible } = useNarrationVisibility();

  return (
    <button
      type="button"
      aria-label={visible ? "Hide hints" : "Show hints"}
      aria-pressed={visible}
      onClick={() => setVisible(!visible)}
      className="flex items-center gap-2 bg-transparent border-none cursor-pointer p-0.5 shrink-0"
    >
      <span
        className={cn(
          "relative block w-[52px] h-[30px] rounded-full border-[1.5px] transition-colors duration-200",
          visible ? "bg-left/15 border-left" : "bg-paper-2 border-line-2",
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 left-0.5 w-[23px] h-[23px] rounded-full border flex items-center justify-center transition-all duration-200",
            visible
              ? "translate-x-[22px] bg-left border-left text-card"
              : "translate-x-0 bg-card border-line-2 text-ink",
          )}
          style={{ transitionTimingFunction: "cubic-bezier(0.34, 1.56, 0.64, 1)" }}
        >
          {visible ? <Eye size={12} /> : <EyeOff size={12} />}
        </span>
      </span>
      <span className="hidden min-[900px]:inline-block font-mono text-[12px] font-semibold tracking-wide text-ink-2">
        Hints
      </span>
    </button>
  );
}
