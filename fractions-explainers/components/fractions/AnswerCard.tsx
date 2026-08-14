"use client";

import { isInteractiveStep } from "@/lib/fractions/types";
import { useFractions } from "./FractionContext";

export function AnswerCard() {
  const { step, session } = useFractions();
  const answer = isInteractiveStep(step) && !session.solved ? step.promptAnswer : step.answer;

  return (
    <div className="shrink-0 bg-card border border-line rounded-2xl px-4 py-3 text-center shadow-sm">
      <span className="font-mono text-[24px] min-[900px]:text-[28px] font-semibold text-ink leading-snug">
        {answer.map((part, i) =>
          part.kind === "new" ? (
            <span key={i} className="text-accent inline-block animate-in fade-in zoom-in-95 duration-500">
              {part.text}
            </span>
          ) : part.kind === "ph" ? (
            <span key={i} className="text-ink-3 opacity-50">
              {part.text}
            </span>
          ) : (
            <span key={i}>{part.text}</span>
          ),
        )}
      </span>
    </div>
  );
}
