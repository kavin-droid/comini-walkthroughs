"use client";

import { Volume2 } from "lucide-react";
import { IconButton } from "@/components/ds/IconButton";
import { buildNarration } from "@/lib/skip-counting/narration";
import { isInteractive } from "@/lib/skip-counting/phases";
import { useSkipCounting } from "./SkipCountingContext";
import { useInstructionsVisibility } from "./InstructionsVisibilityContext";

export function NarrationBox() {
  const { session, phaseObj } = useSkipCounting();
  const { hideInstructions } = useInstructionsVisibility();
  const fragments = buildNarration(phaseObj, session);
  // "Hide instructions" never hides a posed question - the child still needs to read it to
  // answer - it only suppresses the passive walkthrough narration.
  const isQuestion = isInteractive(phaseObj);

  if (hideInstructions && !isQuestion) return null;

  function speak() {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(new SpeechSynthesisUtterance(fragments.map((f) => f.text).join("")));
  }

  return (
    <div className="shrink-0 bg-paper-2 border-l-4 border-accent rounded-lg px-4 py-3 min-h-[20px] flex items-start gap-2.5">
      <p className="font-serif text-[16px] leading-snug text-ink flex-1">
        {fragments.map((f, i) =>
          f.emphasis === "key" ? (
            <span key={i} className="font-semibold text-ink">
              {f.text}
            </span>
          ) : f.emphasis === "quote" ? (
            <span
              key={i}
              className="font-mono text-[0.88em] bg-card text-accent px-1.5 py-0.5 rounded border border-line"
            >
              {f.text}
            </span>
          ) : (
            <span key={i}>{f.text}</span>
          ),
        )}
      </p>
      {hideInstructions && isQuestion && (
        <IconButton aria-label="Read the question aloud" onClick={speak} size={32}>
          <Volume2 size={16} />
        </IconButton>
      )}
    </div>
  );
}
