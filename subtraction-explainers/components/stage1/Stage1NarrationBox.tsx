"use client";

import { SpeakerButton, fragmentsToText } from "@/components/shared/SpeakerButton";
import { useStage1 } from "./Stage1Context";

export function Stage1NarrationBox() {
  const { step, hideText } = useStage1();
  // The toggle only ever hides purely descriptive narration - an MCQ question or a tap/drag
  // prompt (requiresTap covers every such step in stage1) stays on screen regardless (round-18).
  if (hideText && !step.requiresTap) return null;

  return (
    <div className="shrink-0 bg-paper-2 border-l-4 border-hop rounded-lg px-4 py-3 min-h-[20px] flex items-start gap-2.5">
      <SpeakerButton text={fragmentsToText(step.narration)} className="mt-0.5" />
      <p className="font-serif text-[16px] leading-snug text-ink">
        {step.narration.map((f, i) =>
          f.emphasis === "key" ? (
            <span key={i} className="font-semibold text-ink">
              {f.text}
            </span>
          ) : f.emphasis === "quote" ? (
            <span key={i} className="font-mono text-[0.88em] bg-card text-hop px-1.5 py-0.5 rounded border border-line">
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
