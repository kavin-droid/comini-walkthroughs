"use client";

import { buildNarration } from "@/lib/addition/narration";
import { NarrationFragments } from "@/components/ds/NarrationFragments";
import { SpeakButton } from "@/components/ds/SpeakButton";
import { useAddition } from "./AdditionContext";

/** The predict-phase question ("How many tens will there be in total?") - unlike the rest of
 * the narration (see NarrationBox, which explicitly skips "predict"), this ALWAYS shows
 * regardless of the hide-text toggle. The MCQ itself is the one moment this app asks the child
 * a real question; hiding it under the same toggle that hides purely-supportive narration would
 * leave a non-reading child unable to understand what's being asked at all. A speaker icon reads
 * it aloud via the browser's speech synthesis for the same reason. */
export function PredictPrompt() {
  const { session, config, phaseObj } = useAddition();
  if (phaseObj.type !== "predict") return null;

  const fragments = buildNarration(phaseObj, session, config);
  const plainText = fragments.map((f) => f.text).join("");

  return (
    <div className="shrink-0 bg-paper-2 border-l-4 border-accent rounded-lg px-4 py-3 min-h-[20px] flex items-center gap-3">
      <SpeakButton text={plainText} />
      <p className="font-serif text-[16px] leading-snug text-ink flex-1">
        <NarrationFragments fragments={fragments} />
      </p>
    </div>
  );
}
