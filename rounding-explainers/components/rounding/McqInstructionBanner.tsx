"use client";

import { useEffect, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { useRounding } from "./RoundingContext";
import { useNarrationOverride } from "./NarrationOverrideContext";
import { FragmentText, fragmentsToPlainText } from "./FragmentText";

/** The "closer" step's instruction (e.g. "It took 3 hops to reach 70 and 7 hops to reach 80.
 * Which is closer?") - rendered unconditionally by NarrationBox for that step regardless of the
 * global narration-visibility toggle, since answering the MCQ requires reading it. Pairs it with
 * a speaker button (Web Speech API) so a child who has the toggle off elsewhere - or who just
 * struggles reading it - can have it read aloud instead. */
export function McqInstructionBanner() {
  const { step } = useRounding();
  const { override } = useNarrationOverride();
  const fragments = override ?? step.explanation;
  const [speaking, setSpeaking] = useState(false);

  // Stop speech and reset the button if the step changes (or the component unmounts) mid-utterance.
  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && window.speechSynthesis) window.speechSynthesis.cancel();
    };
  }, [step]);

  function toggleSpeak() {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    if (speaking) {
      setSpeaking(false);
      return;
    }
    const utterance = new SpeechSynthesisUtterance(fragmentsToPlainText(fragments));
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(utterance);
    setSpeaking(true);
  }

  return (
    <div className="shrink-0 flex items-start gap-2.5 bg-paper-2 border-l-4 border-accent rounded-lg px-4 py-3 min-h-[20px]">
      <button
        type="button"
        aria-label={speaking ? "Stop reading aloud" : "Read this aloud"}
        aria-pressed={speaking}
        onClick={toggleSpeak}
        className="shrink-0 mt-0.5 inline-flex items-center justify-center w-7 h-7 rounded-full border border-line bg-card text-ink hover:border-line-2 transition-colors"
      >
        {speaking ? <VolumeX size={14} /> : <Volume2 size={14} />}
      </button>
      <p className="font-serif text-[16px] leading-snug text-ink">
        <FragmentText fragments={fragments} />
      </p>
    </div>
  );
}
