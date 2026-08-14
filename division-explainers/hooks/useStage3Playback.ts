"use client";

import { useEffect, useState, type Dispatch } from "react";
import type { Stage3Action, Stage3Phase } from "@/lib/division/stage3";

const PLAY_SPEED = 2600;

/** Narration-only "read and continue" phases advance on a timer in auto mode. "share-tens" is
 * deliberately excluded - it's a feedback/reflection pause after the first auto-share, so it
 * always waits for an explicit Next regardless of mode. Every other phase either blocks on an
 * MCQ, blocks on a tap (unpack, share-ones), or self-advances via useStage3Ticker regardless of
 * mode (count-tens, count-ones). */
const TIMER_ADVANCED: ReadonlySet<Stage3Phase> = new Set([
  "numerals",
  "intro",
  "reveal-friends",
  "focus-tens",
  "unpack-intro",
  "focus-ones",
  "remainder",
  "recap",
  "notation",
]);

export function useStage3Playback(phase: Stage3Phase, dispatch: Dispatch<Stage3Action>) {
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
