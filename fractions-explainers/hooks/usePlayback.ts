"use client";

import { useEffect, useState } from "react";

const PLAY_SPEED = 2600;

interface UsePlaybackArgs {
  stepIdx: number;
  stepCount: number;
  /** Whether the step currently on screen requires a correct answer before advancing (a
   * `tapQuarters`/`mcqCombine` step) and hasn't gotten one yet. */
  awaitingAnswer: boolean;
  dispatch: (action: { type: "ADVANCE_STEP" }) => void;
}

/** Autoplay: advances one step every 2.6s (matches the vanilla fraction apps' PLAY_SPEED exactly),
 * but pauses on landing on an unsolved interactive step - it simply stops scheduling the next
 * tick, and since this effect re-runs on every `awaitingAnswer` change, ticking resumes on its
 * own the moment the step is solved (`MARK_SOLVED`), without any imperative "resume" call. */
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
