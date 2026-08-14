"use client";

import { createContext, useContext, type Dispatch } from "react";
import { buildPhases, parsePhase } from "@/lib/addition/phases";
import type { SessionAction } from "@/lib/addition/session";
import type { AdditionConfig, PhaseObj, Session } from "@/lib/addition/types";

export interface AdditionContextValue {
  config: AdditionConfig;
  session: Session;
  dispatch: Dispatch<SessionAction>;
  phases: string[];
  phaseObj: PhaseObj;
  /** Stage3-only intro sub-step: starts false the moment 'intro' begins (WorkingAnswerPanel is
   * full workarea-size, the workarea itself hidden), flips true after a short delay (panel
   * shrinks to its docked width, workarea fades in simultaneously - see AdditionWalkthrough's own
   * timer). Irrelevant once past 'intro' or for stage2 (WorkingAnswerPanel/AdditionGrid ignore it
   * there). */
  introRevealed: boolean;
  /** Bumped on every FRESH arrival at 'intro' (RESTART, or GO_BACK landing back on it) - used as
   * a `key` on both WorkingAnswerPanel and AdditionGrid's own `#workspace-wrap`, forcing each to
   * remount fresh with its "collapsed" style already applied with no previous frame to transition
   * from. Without this on the GRID side specifically, its `flex-grow` transition would replay on
   * every re-entry (the wrap div is otherwise never unmounted), producing a visible unwanted
   * "grow" pop as it collapses back down before the real, later, intentional reveal-animation. */
  introEntryId: number;
}

const AdditionContext = createContext<AdditionContextValue | null>(null);

export function useAddition(): AdditionContextValue {
  const ctx = useContext(AdditionContext);
  if (!ctx) {
    throw new Error("useAddition must be called within an <AdditionWalkthrough>");
  }
  return ctx;
}

export function buildAdditionContextValue(
  config: AdditionConfig,
  session: Session,
  dispatch: Dispatch<SessionAction>,
  introRevealed: boolean,
  introEntryId: number,
): AdditionContextValue {
  const phases = buildPhases(config);
  const phaseObj = parsePhase(phases[session.phaseIdx]);
  return { config, session, dispatch, phases, phaseObj, introRevealed, introEntryId };
}

export const AdditionContextProvider = AdditionContext.Provider;
