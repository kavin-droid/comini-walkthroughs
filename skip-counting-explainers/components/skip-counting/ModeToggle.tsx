"use client";

import { cn } from "@/lib/utils";
import { usePlaybackContext } from "./PlaybackContext";
import { useToast } from "./ToastContext";

export function ModeToggle() {
  const { mode, setMode } = usePlaybackContext();
  const { showToast } = useToast();
  const isAuto = mode === "auto";

  function toggle() {
    const next = isAuto ? "manual" : "auto";
    setMode(next);
    showToast(next === "auto" ? "Play" : "Tap");
  }

  return (
    <button
      type="button"
      aria-label="Toggle autoplay"
      onClick={toggle}
      className="flex items-center gap-2 bg-transparent border-none cursor-pointer p-0.5 shrink-0"
    >
      <span
        className={cn(
          "relative block w-[52px] h-[30px] rounded-full border-[1.5px] transition-colors duration-200",
          isAuto ? "bg-left/15 border-left" : "bg-paper-2 border-line-2",
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 left-0.5 w-[23px] h-[23px] rounded-full border flex items-center justify-center text-[11px] transition-all duration-200",
            isAuto
              ? "translate-x-[22px] bg-left border-left text-card"
              : "translate-x-0 bg-card border-line-2 text-ink",
          )}
          style={{ transitionTimingFunction: "cubic-bezier(0.34, 1.56, 0.64, 1)" }}
        >
          {isAuto ? "❙❙" : "▶"}
        </span>
      </span>
      <span className="hidden min-[900px]:inline-block font-mono text-[12px] font-semibold tracking-wide text-ink-2">
        {isAuto ? "Play" : "Tap"}
      </span>
    </button>
  );
}
