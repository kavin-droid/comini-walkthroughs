"use client";

import { Volume2 } from "lucide-react";
import type { Fragment } from "@/lib/compare-order/types";
import { useCompareOrder } from "./CompareOrderContext";

function FragmentText({ fragments }: { fragments: Fragment[] }) {
  return (
    <>
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
    </>
  );
}

function fragmentsToText(fragments: Fragment[]): string {
  return fragments.map((f) => f.text).join("");
}

function speak(text: string) {
  if (!text || typeof window === "undefined" || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(new SpeechSynthesisUtterance(text));
}

export function NarrationBox() {
  const { session, step, instructionsVisible } = useCompareOrder();
  const unanswered = step.requiresTap && session.tapStatus !== "correct";
  const justCorrect = step.requiresTap && session.tapStatus === "correct";
  const isWrong = session.tapStatus === "wrong";

  // Action-required text (the question, and wrong-tap feedback) always shows regardless of the
  // instructions toggle - hiding those would leave the learner with no way to know what to do.
  // Passive/explanatory text (digit reveals, the post-answer "why", the intro walkthrough) is
  // what the toggle actually controls.
  const showExplanation = instructionsVisible && !unanswered;

  const hasContent = isWrong || unanswered || justCorrect || showExplanation;

  const spokenParts: string[] = [];
  if (isWrong) spokenParts.push("Not quite, try again.");
  if (unanswered) spokenParts.push(fragmentsToText(step.tapPrompt!));
  if (justCorrect) spokenParts.push("Correct!");
  if (showExplanation) spokenParts.push(fragmentsToText(step.explanation));
  const spokenText = spokenParts.join(" ");

  // When the toggle hides passive narration and this step has no action-required text either
  // (a plain informational step with nothing to say), don't render the box at all - an empty
  // bordered container reads as a layout bug, not as "instructions off".
  if (!hasContent) return null;

  return (
    <div className="shrink-0 bg-paper-2 border-l-4 border-accent rounded-lg px-4 py-3 min-h-[20px] flex items-start gap-2.5">
      <button
        type="button"
        aria-label="Read the instructions aloud"
        disabled={!spokenText}
        onClick={() => speak(spokenText)}
        className="shrink-0 mt-0.5 w-7 h-7 rounded-full flex items-center justify-center text-ink-3 hover:text-accent hover:bg-card transition-colors disabled:opacity-30 disabled:pointer-events-none"
      >
        <Volume2 size={16} />
      </button>
      <div className="flex flex-col gap-1 min-w-0">
        {isWrong && <p className="font-mono text-[12px] font-semibold text-accent">Not quite — try again.</p>}
        {(unanswered || justCorrect || showExplanation) && (
          <p className="font-serif text-[16px] leading-snug text-ink">
            {justCorrect && <span className="font-semibold text-left mr-1">Correct!</span>}
            {unanswered && <FragmentText fragments={step.tapPrompt!} />}
            {showExplanation && <FragmentText fragments={step.explanation} />}
          </p>
        )}
      </div>
    </div>
  );
}
