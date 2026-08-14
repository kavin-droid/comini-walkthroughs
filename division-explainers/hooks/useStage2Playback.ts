"use client";

import { useEffect, useState, type Dispatch } from "react";
import type { Stage2Action, Stage2Phase } from "@/lib/division/stage2";

const PLAY_SPEED = 2600;

/** "equation", "feedback", "reveal", and "notation" are timer-advanced phases (static narration,
 * nothing to wait on) - "round1"/"distribute" self-advance via their own dot-by-dot ticking effect
 * regardless of mode, "reveal-dividend"/"reveal-divisor" self-tick too but settle and wait for
 * manual Next (matching stage3's count-tens split, so they're deliberately excluded here), and
 * "predict" always blocks on the child's MCQ answer. */
const TIMER_ADVANCED = new Set<Stage2Phase>(["equation", "feedback", "reveal", "notation"]);

export function useStage2Playback(phase: Stage2Phase, dispatch: Dispatch<Stage2Action>) {
  const [mode, setModeState] = useState<"manual" | "auto">("manual");
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (!isPlaying) return;
    if (!TIMER_ADVANCED.has(phase)) return;
    const timer = window.setTimeout(() => dispatch({ type: "ADVANCE_PHASE" }), PLAY_SPEED);
    return () => window.clearTimeout(timer);
  }, [isPlaying, phase, dispatch]);

  function setMode(next: "manual" | "auto") {
    setModeState(next);
    setIsPlaying(next === "auto");
  }

  function togglePlayPause() {
    setIsPlaying((p) => !p);
  }

  function pause() {
    setIsPlaying(false);
  }

  function resumeIfAuto() {
    if (mode === "auto") setIsPlaying(true);
  }

  return { mode, setMode, isPlaying, togglePlayPause, pause, resumeIfAuto };
}
