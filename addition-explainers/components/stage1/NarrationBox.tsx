"use client";

import { buildNarration } from "@/lib/stage1/narration";
import { NarrationFragments } from "@/components/ds/NarrationFragments";
import { useStage1 } from "./Stage1Context";
import { usePlaybackContext } from "./PlaybackContext";

/** Purely-supportive narration - hidden by the hide-text toggle same as always, EXCEPT
 * "predict": that phase's question is a PredictPrompt instead (see PredictPrompt.tsx), which
 * always shows regardless of the toggle since it's the one moment the child is actually asked
 * something, not just narrated at. */
export function NarrationBox() {
  const { session, phaseObj } = useStage1();
  const { hideText } = usePlaybackContext();

  if (hideText || phaseObj.type === "predict") return null;

  const fragments = buildNarration(phaseObj, session);

  return (
    <div className="shrink-0 bg-paper-2 border-l-4 border-accent rounded-lg px-4 py-3 min-h-[20px]">
      <p className="font-serif text-[16px] leading-snug text-ink">
        <NarrationFragments fragments={fragments} />
      </p>
    </div>
  );
}
