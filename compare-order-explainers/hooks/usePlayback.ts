"use client";

import { useEffect, useState } from "react";
import type { SessionAction } from "@/lib/compare-order/session";

const PLAY_SPEED = 2600;

interface UsePlaybackArgs {
  idx: number;
  total: number;
  /** True while the current step requires a tap the learner hasn't answered correctly yet -
   * autoplay pauses on these instead of narrating past them, and resumes on its own once the
   * step is answered (this is a dependency of the ticking effect below). */
  interactive: boolean;
  dispatch: (action: SessionAction) => void;
}

/** Autoplay ticking, ported from the vanilla apps' startPlay()/pausePlay(): every non-interactive
 * step advances one step every 2.6s until the last step, then stops - matching the vanilla's
 * `if (idx < steps.length - 1) idx++; else pausePlay();`. Toggling play back on from the last
 * step restarts from the beginning, also ported from the vanilla's
 * `if (idx >= steps.length - 1) idx = 0` at the top of startPlay(). */
export function usePlayback({ idx, total, interactive, dispatch }: UsePlaybackArgs) {
  const [mode, setModeState] = useState<"manual" | "auto">("manual");
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (!isPlaying) return;
    if (interactive) return;
    if (idx >= total - 1) {
      setIsPlaying(false);
      return;
    }
    const timer = window.setTimeout(() => dispatch({ type: "ADVANCE" }), PLAY_SPEED);
    return () => window.clearTimeout(timer);
  }, [isPlaying, interactive, idx, total, dispatch]);

  function startPlay() {
    if (!total) return;
    if (idx >= total - 1) dispatch({ type: "GOTO_START" });
    setIsPlaying(true);
  }

  function pausePlay() {
    setIsPlaying(false);
  }

  function togglePlayPause() {
    if (isPlaying) pausePlay();
    else startPlay();
  }

  function setMode(next: "manual" | "auto") {
    setModeState(next);
    if (next === "auto") startPlay();
    else pausePlay();
  }

  return { mode, setMode, isPlaying, togglePlayPause };
}
