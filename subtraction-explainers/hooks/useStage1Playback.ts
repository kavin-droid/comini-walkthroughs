"use client";

import { useEffect, useState } from "react";
import type { AnyStage1Step } from "@/lib/stage1/types";
import type { Stage1Action } from "@/lib/stage1/session";

const PLAY_SPEED = 2400;

interface UseStage1PlaybackArgs {
  stepIdx: number;
  stepCount: number;
  currentStep: AnyStage1Step;
  dispatch: (action: Stage1Action) => void;
}

/** Same `mode`/`isPlaying` shape as useSubtractionPlayback (stage2/3) - Stage1's controls are
 * meant to look and behave identically to every other stage (round-11 ask), so the underlying
 * state shape matches too, not just the Footer markup. Autoplay pauses on any step that
 * `requiresTap` (a hop/removal/MCQ prompt) exactly like stage2/3 pauses on predict/drag/regroup. */
export function useStage1Playback({ stepIdx, stepCount, currentStep, dispatch }: UseStage1PlaybackArgs) {
  const [mode, setModeState] = useState<"manual" | "auto">("manual");
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (!isPlaying) return;
    if (currentStep.requiresTap) return;
    if (stepIdx >= stepCount - 1) {
      setIsPlaying(false);
      return;
    }
    const timer = window.setTimeout(() => dispatch({ type: "ADVANCE" }), PLAY_SPEED);
    return () => window.clearTimeout(timer);
  }, [isPlaying, currentStep.requiresTap, stepIdx, stepCount, dispatch]);

  function setMode(next: "manual" | "auto") {
    setModeState(next);
    setIsPlaying(next === "auto");
  }

  function togglePlayPause() {
    setIsPlaying((p) => !p);
  }

  return { mode, setMode, isPlaying, togglePlayPause, setIsPlaying };
}
