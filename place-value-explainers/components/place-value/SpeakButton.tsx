"use client";

import { Volume2 } from "lucide-react";
import { IconButton } from "@/components/ds/IconButton";

/** Reads a plain-text narration aloud via the Web Speech API. Cancels any speech already in
 * flight first so rapid re-taps (or a step change mid-utterance) never queue up overlapping
 * voices. */
export function SpeakButton({ text }: { text: string }) {
  function handleClick() {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(new SpeechSynthesisUtterance(text));
  }

  return (
    <IconButton size={32} aria-label="Read instructions aloud" onClick={handleClick}>
      <Volume2 size={16} />
    </IconButton>
  );
}
