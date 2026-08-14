"use client";

import { motion } from "framer-motion";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ds/Button";
import type { Place } from "@/lib/addition/types";
import { destPlace, destSingular, placeCountColorClass } from "@/lib/addition/pack";
import type { PackPhase, AnimRect } from "@/hooks/usePackAnimation";
import { useAddition } from "./AdditionContext";
import { usePlaybackContext } from "./PlaybackContext";
import { UnitDot } from "./UnitDot";

interface PackPromptProps {
  place: Place;
  phase: PackPhase;
  clusterRect: AnimRect | null;
  flyTarget: AnimRect | null;
  run: (
    place: Place,
    onCommit: () => void,
    getSourceBlockRect: () => AnimRect | null,
    getDestRect: () => AnimRect | null,
  ) => void;
}

/** Only the "move" stage renders here, as a fixed-position portal overlay - stages 1-3
 * (highlight/fadeOut/fadeIn) are real DOM content inside the source total-cell, see GridCell. */
export function PackPrompt({ place, phase, clusterRect, flyTarget, run }: PackPromptProps) {
  const { session, dispatch } = useAddition();
  const { hideText } = usePlaybackContext();

  if (!session.awaitingPack[place] && phase === "idle") return null;

  const dest = destPlace(place);

  function handlePack() {
    run(
      place,
      () => dispatch({ type: "PACK_PLACE", place }),
      () => {
        // The real fadeIn block, rendered directly inside the source total-cell (see GridCell) -
        // this is what the move animation departs from, measured at its true on-screen position.
        const el = document.querySelector(
          `[data-row="total"][data-place="${place}"] [data-pack-block]`,
        );
        if (!el) return null;
        const r = el.getBoundingClientRect();
        return { left: r.left, top: r.top, width: r.width, height: r.height };
      },
      () => {
        // The carry row's own wrapper only opens up (isPlaceVisible-independent - see CarryRow)
        // once carryIn[dest] becomes truthy, which happens inside the SAME flushSync as this
        // measurement in usePackAnimation - so this can momentarily read a collapsed
        // (max-width: 0) box mid-transition. That's fine: the cell itself has an explicit fixed
        // pixel width independent of its collapsed parent, so it overflows that parent and
        // renders at its real, stable final position regardless - same trick this measurement
        // already relied on when it used to target the (now-removed) early-reveal total cell.
        const cellEl = document.querySelector(`[data-row="carry"][data-place="${dest}"]`);
        if (!cellEl) return null;
        const r = cellEl.getBoundingClientRect();
        return { left: r.left, top: r.top, width: r.width, height: r.height };
      },
    );
  }

  const overlay =
    typeof document === "undefined" || phase !== "move" || !clusterRect
      ? null
      : createPortal(
          <motion.div
            initial={{
              opacity: 1,
              left: clusterRect.left,
              top: clusterRect.top,
            }}
            animate={
              flyTarget
                ? {
                    left: flyTarget.left + flyTarget.width / 2 - clusterRect.width / 2,
                    top: flyTarget.top + flyTarget.height / 2 - clusterRect.height / 2,
                  }
                : undefined
            }
            transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
            style={{
              position: "fixed",
              width: clusterRect.width,
              height: clusterRect.height,
              zIndex: 999,
              pointerEvents: "none",
            }}
          >
            <div className="flex flex-col items-center gap-1.5">
              <div className={cn("font-mono text-[14px] font-semibold min-[900px]:text-[20px]", placeCountColorClass(dest))}>
                1
              </div>
              <div className="flex flex-wrap gap-1 justify-center content-start min-h-5 max-w-full min-[900px]:gap-1.5 min-[900px]:min-h-8">
                <UnitDot place={dest} noOutline />
              </div>
            </div>
          </motion.div>,
          document.body,
        );

  return (
    <>
      {session.awaitingPack[place] && phase === "idle" && (
        <div className="mx-3 flex flex-col items-center gap-2 rounded-lg border border-line bg-paper-2 px-3 py-2 min-[900px]:mx-5 min-[900px]:gap-3 min-[900px]:px-5 min-[900px]:py-4">
          {!hideText && (
            <p className="font-serif italic text-[14px] text-ink text-center min-[900px]:text-[19px]">
              10 {place} make 1 {destSingular(place)}. Pack them.
            </p>
          )}
          <Button
            variant="primary"
            onClick={handlePack}
            className="min-[900px]:text-[18px] min-[900px]:px-7 min-[900px]:py-4"
          >
            Make 1 {destSingular(place)}
          </Button>
        </div>
      )}
      {overlay}
    </>
  );
}
