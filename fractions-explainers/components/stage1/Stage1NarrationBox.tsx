"use client";

import { useTextVisibility } from "@/components/shared/TextVisibilityContext";
import { ReadAloudButton } from "@/components/shared/ReadAloudButton";
import type { Stage1StepKind } from "@/lib/stage1/scenes";
import { STAGE1_NARRATION, STAGE1_ACTION_STEPS } from "@/lib/stage1/scenes";

/** Mirrors components/fractions/NarrationBox.tsx (same styling, same read-aloud placement) - and
 * the same toggle exemption: for action steps (STAGE1_ACTION_STEPS) the sentence IS the
 * instruction ("draw a line", "drag to fill"), so it stays visible even with the toggle on, same
 * as stage 2's promptExplanation does. Passive-demo steps stay toggle-gated as before, since their
 * narration is supplementary framing with no action being asked for. */
export function Stage1NarrationBox({ kind }: { kind: Stage1StepKind }) {
  const { hideText } = useTextVisibility();
  const isAction = STAGE1_ACTION_STEPS.has(kind);
  if (hideText && !isAction) return null;

  const text = STAGE1_NARRATION[kind];

  return (
    <div className="shrink-0 flex items-start gap-3 bg-paper-2 border-l-4 border-accent rounded-lg px-4 py-3 min-h-[20px] mx-4 mb-3">
      <ReadAloudButton text={text} className="mt-0.5" />
      <p className="font-serif text-[16px] leading-snug text-ink">{text}</p>
    </div>
  );
}
