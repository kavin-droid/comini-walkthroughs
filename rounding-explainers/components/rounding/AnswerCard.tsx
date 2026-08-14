"use client";

import { useRounding } from "./RoundingContext";

/** Revealed either on the step's own `revealAnswer` flag (the final 'done' step) OR as soon as
 * the closer-MCQ has been answered correctly - the vanilla apps' closer-correct click handler
 * writes the resolved `n ≈ rounded` expression into #answer-expr immediately, well before the
 * walkthrough reaches its own 'done' step, and it stays revealed from then on. Since ANSWER_MCQ
 * is only ever dispatched on a correct answer (see session.ts), `session.mcqAnswered` alone is
 * sufficient for this early-reveal condition. */
export function AnswerCard() {
  const { session, step } = useRounding();
  const revealed = step.revealAnswer || session.mcqAnswered;

  return (
    <div className="shrink-0 bg-card border border-line rounded-2xl px-4 py-3 text-center shadow-sm">
      <span className="font-mono text-[24px] min-[900px]:text-[28px] font-semibold text-ink">
        {step.n} ≈{" "}
        {revealed ? (
          <span className="text-accent rd-answer-new">{step.rounded}</span>
        ) : (
          <span className="text-ink-3 opacity-50">?</span>
        )}
      </span>
    </div>
  );
}
