"use client";

import { useEffect, useState } from "react";

const PLAY_SPEED = 2400;

interface UsePlaybackArgs {
  stepIdx: number;
  stepCount: number;
  /** True when the current step has a question the child hasn't answered yet. */
  awaitingAnswer: boolean;
  dispatch: (action: { type: "ADVANCE_STEP" }) => void;
}

/** Autoplay: advances one step every 2.4s (matches the vanilla apps' PLAY_SPEED exactly), stopping
 * automatically at the last step - and, on landing on a question step, simply stops scheduling
 * the next tick instead of pausing outright. The step only moves forward from there via
 * QuestionOptions' SELECT_ANSWER dispatch, and this effect (re-evaluating on every
 * awaitingAnswer/stepIdx change) naturally resumes ticking once that happens - same technique as
 * the addition apps' predict/drag pause. */
export function usePlayback({ stepIdx, stepCount, awaitingAnswer, dispatch }: UsePlaybackArgs) {
  const [mode, setModeState] = useState<"manual" | "auto">("manual");
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (!isPlaying) return;
    if (awaitingAnswer) return;
    if (stepIdx >= stepCount - 1) {
      setIsPlaying(false);
      return;
    }
    const timer = window.setTimeout(() => dispatch({ type: "ADVANCE_STEP" }), PLAY_SPEED);
    return () => window.clearTimeout(timer);
  }, [isPlaying, awaitingAnswer, stepIdx, stepCount, dispatch]);

  function setMode(next: "manual" | "auto") {
    setModeState(next);
    setIsPlaying(next === "auto");
  }

  function togglePlayPause() {
    setIsPlaying((p) => !p);
  }

  return { mode, setMode, isPlaying, togglePlayPause, setIsPlaying };
}
