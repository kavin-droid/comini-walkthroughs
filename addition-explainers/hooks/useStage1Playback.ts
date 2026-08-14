"use client";

import { useEffect, useState } from "react";
import type { Stage1Action } from "@/lib/stage1/session";

const PLAY_SPEED = 2600;

interface UseStage1PlaybackArgs {
  phaseIdx: number;
  phaseCount: number;
  /** True during dragA/dragB/predict - steps that need a real action (drag, tap), not a timer,
   * to move forward. */
  isInteractive: boolean;
  dispatch: (action: Stage1Action) => void;
}

/** Same shape/behavior as the addition app's usePlayback, simplified: stage1 has no per-place
 * grouping, so there's no PhaseObj type-matching needed, just a boolean. */
export function useStage1Playback({ phaseIdx, phaseCount, isInteractive, dispatch }: UseStage1PlaybackArgs) {
  const [mode, setModeState] = useState<"manual" | "auto">("manual");
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (!isPlaying) return;
    if (isInteractive) return;
    if (phaseIdx >= phaseCount - 1) {
      setIsPlaying(false);
      return;
    }
    const timer = window.setTimeout(() => dispatch({ type: "ADVANCE_PHASE" }), PLAY_SPEED);
    return () => window.clearTimeout(timer);
  }, [isPlaying, isInteractive, phaseIdx, phaseCount, dispatch]);

  function setMode(next: "manual" | "auto") {
    setModeState(next);
    setIsPlaying(next === "auto");
  }

  function togglePlayPause() {
    setIsPlaying((p) => !p);
  }

  return { mode, setMode, isPlaying, togglePlayPause, setIsPlaying };
}
