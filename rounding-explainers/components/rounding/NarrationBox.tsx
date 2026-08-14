"use client";

import { useRounding } from "./RoundingContext";
import { useNarrationOverride } from "./NarrationOverrideContext";
import { useNarrationVisibility } from "./NarrationVisibilityContext";
import { FragmentText } from "./FragmentText";
import { McqInstructionBanner } from "./McqInstructionBanner";

/** The "closer" step's instruction doubles as its MCQ prompt - answering the question requires
 * reading it, so it's exempt from the narration-visibility toggle and rendered via
 * McqInstructionBanner (which also adds the read-aloud speaker button) instead of the normal,
 * toggle-gated paragraph below. */
export function NarrationBox() {
  const { step } = useRounding();
  const { override } = useNarrationOverride();
  const { visible } = useNarrationVisibility();

  if (step.view === "closer") return <McqInstructionBanner />;
  if (!visible) return null;

  const fragments = override ?? step.explanation;

  return (
    <div className="shrink-0 bg-paper-2 border-l-4 border-accent rounded-lg px-4 py-3 min-h-[20px]">
      <p className="font-serif text-[16px] leading-snug text-ink">
        <FragmentText fragments={fragments} />
      </p>
    </div>
  );
}
