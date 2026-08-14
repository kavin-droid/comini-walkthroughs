"use client";

import { Volume2 } from "lucide-react";
import { IconButton } from "./IconButton";

/** Reads `text` aloud via the browser's built-in speech synthesis - no network/API dependency,
 * works offline. Cancels any in-flight utterance first so repeated taps restart cleanly instead
 * of queueing up. Silently does nothing if the API isn't available (SSR, or an unsupported
 * browser) rather than throwing. */
export function SpeakButton({ text, size = 32 }: { text: string; size?: number }) {
  function handleClick() {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(new SpeechSynthesisUtterance(text));
  }

  return (
    <IconButton aria-label="Read aloud" size={size} onClick={handleClick} className="shrink-0">
      <Volume2 size={Math.round(size * 0.5)} />
    </IconButton>
  );
}
