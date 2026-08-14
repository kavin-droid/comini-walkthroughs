"use client";

import { useEffect, useState } from "react";
import type { SessionAction } from "@/lib/skip-counting/session";

const PLAY_SPEED = 2600;

interface UsePlaybackArgs {
  phaseIdx: number;
  phaseCount: number;
  /** True on an interactive tap-the-next-number phase (jump 2+), where autoplay must wait for
   * the child's tap instead of auto-advancing - mirrors addition's predict/drag pause. */
  interactive: boolean;
  dispatch: (action: SessionAction) => void;
}

/** Autoplay: advances one phase every 2.6s until the last phase, pausing on any interactive tap
 * phase (it resumes on its own once the phase moves on, since this effect re-evaluates on every
 * phaseIdx/interactive change - no separate resume logic needed). Pressing play again once
 * finished restarts from the intro, mirroring the vanilla app's startPlay() ("if (idx >=
 * steps.length - 1) idx = 0"). */
export function usePlayback({ phaseIdx, phaseCount, interactive, dispatch }: UsePlaybackArgs) {
  const [mode, setModeState] = useState<"manual" | "auto">("manual");
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (!isPlaying || interactive) return;
    if (phaseIdx >= phaseCount - 1) {
      setIsPlaying(false);
      return;
    }
    const timer = window.setTimeout(() => dispatch({ type: "ADVANCE_PHASE" }), PLAY_SPEED);
    return () => window.clearTimeout(timer);
  }, [isPlaying, interactive, phaseIdx, phaseCount, dispatch]);

  function setMode(next: "manual" | "auto") {
    setModeState(next);
    if (next === "auto") {
      if (phaseIdx >= phaseCount - 1) dispatch({ type: "GO_TO_INTRO" });
      setIsPlaying(true);
    } else {
      setIsPlaying(false);
    }
  }

  function togglePlayPause() {
    if (!isPlaying && phaseIdx >= phaseCount - 1) {
      dispatch({ type: "GO_TO_INTRO" });
    }
    setIsPlaying((p) => !p);
  }

  return { mode, setMode, isPlaying, togglePlayPause, setIsPlaying };
}
