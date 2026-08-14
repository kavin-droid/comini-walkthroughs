"use client";

import { useMultiplication } from "./MultiplicationContext";
import { EquationDisplay } from "./EquationDisplay";
import { useWorkspaceEquationVisible } from "@/hooks/useWorkspaceEquationVisible";

/** The working-answer card and its text never fade out - it stays on screen at full opacity for
 * the whole walkthrough, even on steps where the total hasn't been revealed yet (see
 * AnswerPart's `?` placeholder for that instead). The one exception is a hard hide (not a fade):
 * whenever the workspace is showing its own equation copy at the same size (BoxGroupsView /
 * ArrayBuildView, both now rendered at `size="card"` to match, via the shared
 * useWorkspaceEquationVisible hook), this card steps aside instead of duplicating it - it
 * reappears the instant that copy actually finishes fading (not the moment the fade starts), with
 * no transition of its own. */
export function AnswerCard() {
  const { step } = useMultiplication();
  const workspaceShowsEquation = useWorkspaceEquationVisible(step);
  if (workspaceShowsEquation) return null;

  return (
    <div className="shrink-0 bg-card border border-line rounded-2xl px-4 py-3 text-center shadow-sm">
      <EquationDisplay parts={step.answer} />
    </div>
  );
}
