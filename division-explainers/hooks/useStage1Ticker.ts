"use client";

import { useEffect, type Dispatch } from "react";
import type { Stage1Action, Stage1Session } from "@/lib/division/stage1";

/** Slower than stage2/3's counting ticks (380-400ms) - a 5-6 year old audience needs more time
 * per item to actually track each one popping in, not just a blur of numbers changing. */
const TICK_MS = 550;

/** Drives the two auto-counting phases (pile-reveal, people-reveal) - each ticks its own
 * previewCount up one at a time, then just sits there settled (manual Next), same
 * settle-then-continue split as stage2/3's checkpoint phases. distribute is NOT driven here - it's
 * drag-only, see useStage1Playback and Stage1MainScene's onShareItem. */
export function useStage1Ticker(session: Stage1Session, dispatch: Dispatch<Stage1Action>) {
  const { phase, total, people, previewCount } = session;

  const target = phase === "pile-reveal" ? total : phase === "people-reveal" ? people : null;

  useEffect(() => {
    if (target === null || previewCount >= target) return;
    const timer = window.setTimeout(() => dispatch({ type: "TICK" }), TICK_MS);
    return () => window.clearTimeout(timer);
  }, [target, previewCount, dispatch]);

  // Once the last drag lands, hand off to celebrate on its own - the child doesn't need to also
  // press Next right after finishing the very thing Next would do.
  const { dotsPlaced } = session;
  useEffect(() => {
    if (phase === "distribute" && dotsPlaced >= total) {
      dispatch({ type: "ADVANCE_PHASE" });
    }
  }, [phase, dotsPlaced, total, dispatch]);
}
