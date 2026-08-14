"use client";

import { Volume2 } from "lucide-react";
import { cn } from "@/lib/utils";

/** Reads `text` aloud via the browser's built-in text-to-speech on tap - sits to the left of the
 * MCQ question everywhere it's shown, since a pre/early reader may not be able to decode the
 * question text at all, even with it visible. Cancels any in-flight utterance first so rapid
 * re-taps don't queue up and read on top of each other. */
export function SpeakerButton({ text, className }: { text: string; className?: string }) {
  function handleClick() {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.85;
    window.speechSynthesis.speak(utterance);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label="Read this aloud"
      className={cn(
        "shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-card border border-line text-ink-2 hover:border-accent hover:text-accent transition-colors",
        className,
      )}
    >
      <Volume2 size={16} />
    </button>
  );
}
