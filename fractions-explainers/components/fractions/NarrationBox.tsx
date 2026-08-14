"use client";

import { isInteractiveStep } from "@/lib/fractions/types";
import { useTextVisibility } from "@/components/shared/TextVisibilityContext";
import { ReadAloudButton } from "@/components/shared/ReadAloudButton";
import { useFractions } from "./FractionContext";

/** Hidden entirely (not just visually collapsed) when the hide-text toggle is on - EXCEPT for an
 * unsolved interactive step's promptExplanation, which stays visible regardless: that sentence is
 * the actual instruction ("can you tap to show 2/4?"), not supplementary framing, the same
 * exemption stage 1's action steps get (see STAGE1_ACTION_STEPS). Once solved (or for a
 * non-interactive step's plain `explanation`), the toggle applies normally. The MCQ-equivalent
 * controls elsewhere in this app (AnswerCard, the fraction pickers) are never affected either -
 * they're the interaction itself, not narration about it. The read-aloud speaker sits to the left
 * of the sentence. */
export function NarrationBox() {
  const { step, session } = useFractions();
  const { hideText } = useTextVisibility();
  const isPrompt = isInteractiveStep(step) && !session.solved;
  if (hideText && !isPrompt) return null;

  const explanation = isPrompt ? step.promptExplanation : step.explanation;
  const plainText = explanation.map((f) => f.text).join("");

  return (
    <div className="shrink-0 flex items-start gap-3 bg-paper-2 border-l-4 border-accent rounded-lg px-4 py-3 min-h-[20px]">
      <ReadAloudButton text={plainText} className="mt-0.5" />
      <p className="font-serif text-[16px] leading-snug text-ink">
        {explanation.map((f, i) =>
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
