"use client";

import { useEffect, useState } from "react";
import { Volume2 } from "lucide-react";
import { cn } from "@/lib/utils";

/** Reads `text` aloud via the browser's built-in speech synthesis when pressed - the instruction-
 * text toggle only controls whether the sentence is shown as text, this gives a non-reader (or
 * anyone who'd rather listen) a way to hear it regardless of that toggle's state. Cancels any
 * in-flight utterance before starting a new one so rapid taps or step changes never queue up
 * overlapping speech, and cancels on unmount for the same reason - a step change shouldn't leave
 * the previous step's sentence still talking over the new one. Renders nothing if the browser has
 * no speech synthesis support, rather than showing a button that silently does nothing. */
export function ReadAloudButton({ text, className = "" }: { text: string; className?: string }) {
  const [speaking, setSpeaking] = useState(false);
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    setSupported(typeof window !== "undefined" && "speechSynthesis" in window);
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel();
    };
  }, []);

  if (!supported) return null;

  function speak() {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(utterance);
  }

  return (
    <button
      type="button"
      aria-label="Read aloud"
      onClick={speak}
      className={cn(
        "flex items-center justify-center shrink-0 w-8 h-8 rounded-full border-2 transition-colors",
        speaking
          ? "bg-accent border-accent text-card"
          : "bg-card border-line-2 text-ink-2 hover:border-accent hover:text-accent",
        className,
      )}
    >
      <Volume2 size={16} className={speaking ? "animate-pulse" : ""} />
    </button>
  );
}
