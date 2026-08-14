"use client";

import { useEffect, useState, type Dispatch } from "react";
import type { Stage1Action, Stage1Phase } from "@/lib/division/stage1";

const PLAY_SPEED = 2600;

/** Only "celebrate" and "recap" are timer-advanced (static, nothing to wait on). "pile-reveal" and
 * "people-reveal" self-tick via useStage1Ticker regardless of mode but settle and wait for manual
 * Next once done (same checkpoint split as stage2/3). "distribute" is always drag-driven - a
 * pre-reader learns "I pick it up, it moves" by doing it themselves, not by watching autoplay, so
 * it's excluded from autoplay entirely (mirrors stage3's drag-gated phases). */
const TIMER_ADVANCED = new Set<Stage1Phase>(["celebrate", "recap"]);

export function useStage1Playback(phase: Stage1Phase, dispatch: Dispatch<Stage1Action>) {
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
