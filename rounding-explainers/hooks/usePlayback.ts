"use client";

import { useEffect, useState } from "react";
import type { SessionAction } from "@/lib/rounding/session";
import type { RoundingStep } from "@/lib/rounding/types";

/** Matches the vanilla apps' `const PLAY_SPEED = 3000;` (rounding's own autoplay tick - NOT
 * addition-explainers' 2600ms, which is a different app's constant). */
const PLAY_SPEED = 3000;

interface UsePlaybackArgs {
  stepIdx: number;
  stepCount: number;
  step: RoundingStep;
  placed: boolean;
  mcqAnswered: boolean;
  dispatch: (action: SessionAction) => void;
}

/** Autoplay: advances one step every 3s, generalizing the vanilla apps' interactive-step gate
 * (`cur.view === 'closer' && !cur.mcqAnswered`, `cur.placeTap && !cur.placed`) into a single
 * declarative effect condition - the phase only moves forward via the child's own correct tap/
 * MCQ answer while parked on an interactive step, and this effect (re-evaluating on every
 * relevant session field) naturally resumes ticking once that happens. Also ports startPlay()'s
 * "pressing play at the very last step restarts from step 0" behavior. */
export function usePlayback({ stepIdx, stepCount, step, placed, mcqAnswered, dispatch }: UsePlaybackArgs) {
  const [mode, setModeState] = useState<"manual" | "auto">("manual");
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (!isPlaying) return;
    const interactive = (step.view === "closer" && !mcqAnswered) || (step.placeTap && !placed);
    if (interactive) return;
    if (stepIdx >= stepCount - 1) {
      setIsPlaying(false);
      return;
    }
    const timer = window.setTimeout(() => dispatch({ type: "ADVANCE_PHASE" }), PLAY_SPEED);
    return () => window.clearTimeout(timer);
  }, [isPlaying, step, placed, mcqAnswered, stepIdx, stepCount, dispatch]);

  function startFromTopIfAtEnd() {
    if (stepIdx >= stepCount - 1) dispatch({ type: "GO_TO_START" });
  }

  function setMode(next: "manual" | "auto") {
    setModeState(next);
    if (next === "auto") {
      startFromTopIfAtEnd();
      setIsPlaying(true);
    } else {
      setIsPlaying(false);
    }
  }

  function togglePlayPause() {
    setIsPlaying((playing) => {
      const next = !playing;
      if (next) startFromTopIfAtEnd();
      return next;
    });
  }

  return { mode, setMode, isPlaying, togglePlayPause, setIsPlaying };
}
