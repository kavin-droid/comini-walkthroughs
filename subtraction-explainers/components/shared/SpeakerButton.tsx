"use client";

import { Volume2 } from "lucide-react";
import { cn } from "@/lib/utils";

/** Reads `text` aloud via the browser's built-in Web Speech API on tap - no audio assets, no
 * server round-trip. `cancel()` first so a rapid double-tap (or tapping a new sentence while the
 * previous one is still talking) restarts cleanly instead of queueing/overlapping utterances.
 * Silently does nothing where speechSynthesis isn't available (SSR, unsupported browser) rather
 * than throwing - this is a pure enhancement, never load-bearing for progressing the walkthrough. */
export function SpeakerButton({ text, className }: { text: string; className?: string }) {
  function handleClick(e: React.MouseEvent) {
    e.stopPropagation();
    if (typeof window === "undefined" || !("speechSynthesis" in window) || !text.trim()) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text.trim());
    window.speechSynthesis.speak(utterance);
  }

  return (
    <button
      type="button"
      aria-label="Read aloud"
      onClick={handleClick}
      className={cn(
        "shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-ink-3 border border-line bg-card hover:text-accent hover:border-accent transition-colors",
        className,
      )}
    >
      <Volume2 size={14} />
    </button>
  );
}

export function fragmentsToText(fragments: { text: string }[]): string {
  return fragments.map((f) => f.text).join("");
}
