"use client";

import { useEffect, useState } from "react";

const PLAY_SPEED = 2600;

/** Autoplay: every step in a division walkthrough is passive narration (no predict/drag gating
 * like the addition/multiplication ports), so this mirrors the vanilla apps' startPlay()/
 * pausePlay()/togglePlay() directly - advance one step every 2.6s while playing, stop
 * automatically at the last step. Switching to auto mode also (re)starts playback, matching the
 * vanilla setMode()'s "if (mode === 'auto') startPlay()". */
export function usePlayback(stepIdx: number, stepCount: number, setStepIdx: (i: number) => void) {
  const [mode, setModeState] = useState<"manual" | "auto">("manual");
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (!isPlaying) return;
    if (stepIdx >= stepCount - 1) {
      setIsPlaying(false);
      return;
    }
    const timer = window.setTimeout(() => setStepIdx(stepIdx + 1), PLAY_SPEED);
    return () => window.clearTimeout(timer);
  }, [isPlaying, stepIdx, stepCount, setStepIdx]);

  function setMode(next: "manual" | "auto") {
    setModeState(next);
    if (next === "auto") {
      if (stepIdx >= stepCount - 1) setStepIdx(0);
      setIsPlaying(true);
    } else {
      setIsPlaying(false);
    }
  }

  function togglePlayPause() {
    setIsPlaying((p) => !p);
  }

  /** Mirrors the vanilla start()'s unconditional pausePlay() at the top of every re-Visualize -
   * pause playback without touching the manual/auto mode toggle itself. */
  function pause() {
    setIsPlaying(false);
  }

  /** Mirrors the vanilla start()'s "if (mode === 'auto') startPlay()" once new steps land. */
  function resumeIfAuto() {
    if (mode === "auto") setIsPlaying(true);
  }

  return { mode, setMode, isPlaying, togglePlayPause, pause, resumeIfAuto };
}
