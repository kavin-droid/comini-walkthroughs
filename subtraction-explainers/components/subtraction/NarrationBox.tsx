"use client";

import { buildNarration } from "@/lib/subtraction/narration";
import { isActionablePhase } from "@/lib/subtraction/phases";
import { SpeakerButton, fragmentsToText } from "@/components/shared/SpeakerButton";
import { useSubtraction } from "./SubtractionContext";
import { usePlaybackContext } from "./PlaybackContext";

export function NarrationBox() {
  const { session, config, phaseObj } = useSubtraction();
  const { hideText } = usePlaybackContext();
  const fragments = buildNarration(phaseObj, session, config);
  // The toggle only ever hides purely descriptive narration - an MCQ question or a tap/drag
  // prompt (see isActionablePhase) stays on screen regardless (round-18 feedback).
  if (hideText && !isActionablePhase(phaseObj)) return null;

  return (
    <div className="shrink-0 bg-paper-2 border-l-4 border-accent rounded-lg px-4 py-3 min-h-[20px] flex items-start gap-2.5">
      <SpeakerButton text={fragmentsToText(fragments)} className="mt-0.5" />
      <p className="font-serif text-[16px] leading-snug text-ink">
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
    </div>
  );
}
