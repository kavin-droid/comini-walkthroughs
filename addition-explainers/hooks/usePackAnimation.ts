"use client";

import { useState } from "react";
import { flushSync } from "react-dom";
import type { Place } from "@/lib/addition/types";

export type PackPhase = "idle" | "highlight" | "fadeOut" | "fadeIn" | "move";

export interface AnimRect {
  left: number;
  top: number;
  width: number;
  height: number;
}

export interface PackAnimState {
  phase: PackPhase;
  source: Place;
  dest: Place;
}

function sleep(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

const HIGHLIGHT_MS = 350;
const FADE_OUT_MS = 300;
const FADE_IN_MS = 300;
const MOVE_MS = 500;

/** Orchestrates the pack sequence. Stages 1-3 (highlight the source dots container in the
 * destination's color, fade that highlight out, fade in the single destination-type block in
 * its place) are rendered as REAL, normally-flowed DOM content directly inside the source
 * total-cell (see GridCell's `packAnim` handling) - not a synthetic overlay copy - so there is
 * no possibility of the highlight drifting out of alignment with the actual dots container: it
 * IS the actual container. Only stage 4 (move) needs an overlay, since it has to travel to a
 * DIFFERENT cell in the DOM; `getSourceBlockRect` measures the real, already-rendered fadeIn
 * block's on-screen position at the instant fadeIn finishes (not a computed union of loose dot
 * rects), so the move animation starts from exactly where the visible content actually is.
 *
 * The state commit happens at the START of "move" (not earlier), because the destination
 * place's column doesn't exist in the DOM until `carryIn > 0` makes it visible - `onCommit`
 * must run, then the DOM must repaint, before `getDestRect` can find a real target. Bundling
 * `setPhase("move")` and `onCommit()` into one flushSync call (not two separate updates)
 * guarantees the re-render that makes carryIn visible is the SAME re-render where the
 * destination's suppression already reflects "move" (see AdditionGrid's `suppressedPlace`), so
 * there's no gap where the destination column's own CSS transition could reveal it early - it
 * only fades in once this hook reaches "idle" again, i.e. exactly when the moved block lands. */
export function usePackAnimation() {
  const [phase, setPhase] = useState<PackPhase>("idle");
  const [clusterRect, setClusterRect] = useState<AnimRect | null>(null);
  const [flyTarget, setFlyTarget] = useState<AnimRect | null>(null);

  async function run(
    place: string,
    onCommit: () => void,
    getSourceBlockRect: () => AnimRect | null,
    getDestRect: () => AnimRect | null,
  ) {
    setPhase("highlight");
    await sleep(HIGHLIGHT_MS);

    setPhase("fadeOut");
    await sleep(FADE_OUT_MS);

    setPhase("fadeIn");
    await sleep(FADE_IN_MS);

    const sourceRect = getSourceBlockRect();
    if (!sourceRect) {
      // Shouldn't happen (the fadeIn block was just rendered) - don't strand the session mid-pack.
      onCommit();
      setPhase("idle");
      return;
    }
    setClusterRect(sourceRect);

    flushSync(() => {
      setPhase("move");
      onCommit();
    });
    setFlyTarget(getDestRect() ?? sourceRect);

    await sleep(MOVE_MS + 50);
    setPhase("idle");
    setClusterRect(null);
    setFlyTarget(null);
  }

  return { phase, clusterRect, flyTarget, run };
}
