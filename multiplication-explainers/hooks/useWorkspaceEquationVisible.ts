"use client";

import { useEffect, useState } from "react";
import type { MultiplicationStep } from "@/lib/multiplication/types";

/** Matches the fade-out transition BoxGroupsView and ArrayBuildView both use for their
 * in-workspace equation copy: a short settle beat before the fade starts, then the fade itself
 * (currently 300ms + 500ms) - kept as one constant here so every consumer's timing stays in sync
 * without the components needing to share React state directly. */
export const EQUATION_FADE_COMPLETE_MS = 800;

/** True immediately for "visible", true until the fade above finishes for "fadeOut" (then
 * false), always false for "hidden" or for a step kind with no in-workspace equation at all
 * (`equationDisplay` absent). Used independently by AnswerCard (to know exactly when to
 * reappear) and by the workspace views themselves (to drive their own opacity) - two separate
 * instances of this hook, given the same step object, land on the same value at the same time
 * without an extra context wire-up between them. */
export function useWorkspaceEquationVisible(step: MultiplicationStep): boolean {
  const display = "equationDisplay" in step ? step.equationDisplay : undefined;
  // "fadeOut" starts visible too (it only fades later, via the effect below) - initializing to
  // just `display === "visible"` would flash the equation to hidden for one paint on a component
  // that mounts fresh mid-"fadeOut" (e.g. BoxGroupsView/ArrayBuildView, remounted per step), then
  // have it fade back IN before ever fading out.
  const [visible, setVisible] = useState(display === "visible" || display === "fadeOut");

  useEffect(() => {
    if (display !== "fadeOut") {
      setVisible(display === "visible");
      return;
    }
    setVisible(true);
    const t = window.setTimeout(() => setVisible(false), EQUATION_FADE_COMPLETE_MS);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  return visible;
}
