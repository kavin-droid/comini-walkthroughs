"use client";

import { useEffect, useState } from "react";
import type { PhaseObj } from "@/lib/addition/types";
import type { SessionAction } from "@/lib/addition/session";

const PLAY_SPEED = 2600;

interface UsePlaybackArgs {
  phaseIdx: number;
  phaseCount: number;
  phaseObj: PhaseObj;
  dispatch: (action: SessionAction) => void;
}

/** Autoplay: advances one phase every 2.6s, but only across non-interactive phases (intro,
 * showA/B, compare, reveal). On landing on predict/drag it simply stops scheduling the next
 * tick - the phase then only moves forward via the child's own MCQ tap or the drag-complete
 * auto-advance effect, and autoplay's effect (re-evaluating on every phaseIdx/phaseObj change)
 * naturally resumes ticking once that happens. Mirrors the vanilla apps' "advance, render, then
 * only pause if the new phase turned out to be interactive" behavior without needing the same
 * imperative sequencing - effect deps do the equivalent job declaratively. */
export function usePlayback({ phaseIdx, phaseCount, phaseObj, dispatch }: UsePlaybackArgs) {
  const [mode, setModeState] = useState<"manual" | "auto">("manual");
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (!isPlaying) return;
    const interactive = phaseObj.type === "predict" || phaseObj.type === "drag";
    if (interactive) return;
    if (phaseIdx >= phaseCount - 1) {
      setIsPlaying(false);
      return;
    }
    const timer = window.setTimeout(() => dispatch({ type: "ADVANCE_PHASE" }), PLAY_SPEED);
    return () => window.clearTimeout(timer);
  }, [isPlaying, phaseObj.type, phaseIdx, phaseCount, dispatch]);

  function setMode(next: "manual" | "auto") {
    setModeState(next);
    setIsPlaying(next === "auto");
  }

  function togglePlayPause() {
    setIsPlaying((p) => !p);
  }

  return { mode, setMode, isPlaying, togglePlayPause, setIsPlaying };
}
