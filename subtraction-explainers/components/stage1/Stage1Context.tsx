"use client";

import { createContext, useContext, useMemo, useReducer, useRef, useState, type ReactNode } from "react";
import { createStage1State, stage1Reducer, buildSteps, type Stage1Action } from "@/lib/stage1/session";
import { useStage1Playback } from "@/hooks/useStage1Playback";
import type { AnyStage1Step } from "@/lib/stage1/types";

export interface Stage1ContextValue {
  state: ReturnType<typeof createStage1State>;
  dispatch: (action: Stage1Action) => void;
  steps: AnyStage1Step[];
  step: AnyStage1Step;
  mode: "manual" | "auto";
  setMode: (m: "manual" | "auto") => void;
  isPlaying: boolean;
  togglePlayPause: () => void;
  hideText: boolean;
  setHideText: (v: boolean) => void;
  /** Take-away's "count the remaining apples one by one, then advance" sequence (see
   * runCountThenAdvance) - lives here rather than as local state in TakeAwayScene because its own
   * MCQ (RemainingMcq) now renders in a SEPARATE sibling component (Stage1McqArea, round-18: "MCQ
   * options should be shown... outside the workarea"), so both need to read/drive the same
   * in-flight counting index. */
  countingIndex: number | null;
  runCountThenAdvance: (remaining: number, onDone: () => void) => void;
}

const Stage1Context = createContext<Stage1ContextValue | null>(null);

export function useStage1(): Stage1ContextValue {
  const ctx = useContext(Stage1Context);
  if (!ctx) throw new Error("useStage1 must be used within a <Stage1Provider>");
  return ctx;
}

export function Stage1Provider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(stage1Reducer, undefined, createStage1State);
  const [hideText, setHideText] = useState(false);
  const steps = useMemo(() => buildSteps(state), [state]);
  const step = steps[Math.min(state.stepIdx, steps.length - 1)];

  const { mode, setMode, isPlaying, togglePlayPause } = useStage1Playback({
    stepIdx: state.stepIdx,
    stepCount: steps.length,
    currentStep: step,
    dispatch,
  });

  const [countingIndex, setCountingIndex] = useState<number | null>(null);
  const countingTimer = useRef<number | null>(null);
  function runCountThenAdvance(remaining: number, onDone: () => void) {
    if (countingTimer.current) window.clearInterval(countingTimer.current);
    let i = 0;
    setCountingIndex(0);
    countingTimer.current = window.setInterval(() => {
      i++;
      if (i >= remaining) {
        if (countingTimer.current) window.clearInterval(countingTimer.current);
        window.setTimeout(() => {
          setCountingIndex(null);
          onDone();
        }, 350);
        return;
      }
      setCountingIndex(i);
    }, 380);
  }

  const value: Stage1ContextValue = {
    state,
    dispatch,
    steps,
    step,
    mode,
    setMode,
    isPlaying,
    togglePlayPause,
    hideText,
    setHideText,
    countingIndex,
    runCountThenAdvance,
  };
  return <Stage1Context.Provider value={value}>{children}</Stage1Context.Provider>;
}
