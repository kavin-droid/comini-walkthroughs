"use client";

import { usePlaceValue } from "./PlaceValueContext";
import { useTextVisibility } from "./TextVisibilityContext";
import { SpeakButton } from "./SpeakButton";

const QUIZ_KINDS = new Set(["quizTens", "quizOnes", "quizHundreds"]);

/** Hiding the narration text (via the "hide text" toggle) is meant to make kids read the
 * workspace itself instead of relying on the sentence - but an MCQ's instructions ("How many
 * tens are there?") are the question itself, not a hint, so they stay visible (with a
 * read-aloud option) even while hidden everywhere else. */
export function NarrationBox() {
  const { step } = usePlaceValue();
  const { hideText } = useTextVisibility();
  const isQuiz = QUIZ_KINDS.has(step.kind);

  if (hideText && !isQuiz) return null;

  return (
    <div className="shrink-0 flex items-center gap-3 bg-paper-2 border-l-4 border-accent rounded-lg px-4 py-3 min-h-[20px]">
      <SpeakButton text={step.explanation.map((f) => f.text).join("")} />
      <p className="font-serif text-[16px] leading-snug text-ink">
        {step.explanation.map((f, i) =>
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
