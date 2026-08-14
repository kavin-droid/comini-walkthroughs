"use client";

import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { IconButton } from "@/components/ds/IconButton";
import { usePlaybackContext } from "./PlaybackContext";

/** Desktop: compact icon button (rendered in Header, top right). Mobile: a labeled row button
 * (rendered inside SettingsSheet's bottom sheet). Both read/write the same `hideText` state from
 * PlaybackContext, so toggling on one surface is reflected if the child ever sees the other. */
export function HideTextToggle({ variant }: { variant: "header" | "sheet" }) {
  const { hideText, toggleHideText } = usePlaybackContext();

  if (variant === "header") {
    return (
      <IconButton
        aria-label={hideText ? "Show the words" : "Hide the words"}
        aria-pressed={hideText}
        size={36}
        variant={hideText ? "primary" : "default"}
        onClick={toggleHideText}
      >
        {hideText ? <EyeOff size={18} /> : <Eye size={18} />}
      </IconButton>
    );
  }

  return (
    <button
      type="button"
      aria-pressed={hideText}
      onClick={toggleHideText}
      className={cn(
        "w-full h-11 flex items-center justify-between px-3 rounded-lg border font-mono text-[13px]",
        hideText ? "bg-left/10 border-left text-left" : "bg-card border-line text-ink",
      )}
    >
      <span className="flex items-center gap-2">
        {hideText ? <EyeOff size={16} /> : <Eye size={16} />}
        Hide the words
      </span>
      <span
        className={cn(
          "relative block w-[38px] h-[22px] rounded-full border-[1.5px] transition-colors duration-200 shrink-0",
          hideText ? "bg-left/15 border-left" : "bg-paper-2 border-line-2",
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 left-0.5 w-[16px] h-[16px] rounded-full border transition-all duration-200",
            hideText
              ? "translate-x-[16px] bg-left border-left"
              : "translate-x-0 bg-card border-line-2",
          )}
        />
      </span>
    </button>
  );
}
