"use client";

import { cn } from "@/lib/utils";
import { useMultiplication } from "./MultiplicationContext";

/** Rendered as a sibling of the scaled workspace (not inside it, see Workspace.tsx) so the tap
 * targets stay full native size regardless of how much the visuals above have been shrunk to fit
 * - ported directly from the addition apps' PredictOptions. The question's own prompt lives in
 * NarrationBox's `step.explanation` (it doubles as the instruction text), so this only renders
 * the row of option buttons underneath it. */
export function QuestionOptions() {
  const { step, session, dispatch } = useMultiplication();
  if (!step.question) return null;
  const question = step.question;
  const picked = session.answers[question.id];

  return (
    <div className="shrink-0 flex flex-wrap justify-center gap-3">
      {question.options.map((option) => (
        <button
          key={option.value}
          onClick={() => dispatch({ type: "SELECT_ANSWER", questionId: question.id, value: option.value })}
          className={cn(
            "min-w-14 h-14 px-4 rounded-2xl bg-card border-2 border-line font-mono text-lg font-bold text-ink",
            "hover:border-accent hover:bg-paper-2 transition-colors",
            picked === option.value && "border-accent bg-paper-2",
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
