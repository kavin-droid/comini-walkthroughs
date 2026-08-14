"use client";

import { useEffect, useState } from "react";

const PLAY_SPEED = 2600;

interface UsePlaybackArgs {
  stepIdx: number;
  stepCount: number;
  dispatch: (action: { type: "ADVANCE_STEP" }) => void;
  /** True while the current step is an unanswered stage-2 quiz step - matches the vanilla app's
   * isCurrentStepLocked(): autoplay pauses itself the instant it lands on a locked step, rather
   * than advancing past it, and stays paused until the user resumes manually (answering the quiz
   * does not auto-resume playback, matching the vanilla app exactly). */
  isLocked: boolean;
}

export function usePlayback({ stepIdx, stepCount, dispatch, isLocked }: UsePlaybackArgs) {
  const [mode, setModeState] = useState<"manual" | "auto">("manual");
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (!isPlaying) return;
    if (isLocked) {
      setIsPlaying(false);
      return;
    }
    if (stepIdx >= stepCount - 1) {
      setIsPlaying(false);
      return;
    }
    const timer = window.setTimeout(() => dispatch({ type: "ADVANCE_STEP" }), PLAY_SPEED);
    return () => window.clearTimeout(timer);
  }, [isPlaying, stepIdx, stepCount, isLocked, dispatch]);

  function setMode(next: "manual" | "auto") {
    setModeState(next);
    setIsPlaying(next === "auto");
  }

  function togglePlayPause() {
    setIsPlaying((p) => !p);
  }

  return { mode, setMode, isPlaying, togglePlayPause, setIsPlaying };
}
