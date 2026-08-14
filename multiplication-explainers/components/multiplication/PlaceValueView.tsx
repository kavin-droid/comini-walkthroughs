"use client";

import { useEffect, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Dot } from "./Dot";
import { TenPack } from "./TenPack";
import type { PlaceValueStep } from "@/lib/multiplication/types";

/** Each migrating "one" is a plain two-beat slide, entirely self-contained inside the x10
 * waypoint box - no cross-parent shared-layout animation (no `layoutId`/`layout`), which was
 * fragile: Framer has to measure real DOM rects in the ones column and the waypoint to compute
 * the flight, and got it wrong often enough to read as the dot flying off to a random spot before
 * correcting. Instead: (1) the dot slides in along -X (from just right of center to center) and
 * fades in, holds, then fades out in place; (2) the ten-pack then fades in in place and slides
 * out along -X (from center toward the tens side) while fading, "handing off" to a plain
 * (non-animated) ten-pack that appears in the tens column the moment it's gone. Sequencing is
 * driven by plain `setTimeout`s matching the keyframe durations, not Framer's
 * `onAnimationComplete` - that callback only fires once the browser has actually run the
 * animation's frames, so a step could never advance in a backgrounded/throttled tab (or with
 * reduced-motion setups) where those frames never get composited. */
const DOT_MS = 650;
const PACK_MS = 650;
// The dot enters from the ones side (+X, right) and slides to center (net motion along -X);
// the pack then slides on from center toward the tens side (-X, left) as it fades - two plain,
// self-contained horizontal moves, nothing measured or flown in from another component.
const SLIDE_PX = 14;
const DOT_KEYFRAMES = { x: [SLIDE_PX, 0, 0, 0], opacity: [0, 1, 1, 0] };
const DOT_TRANSITION = { duration: DOT_MS / 1000, times: [0, 0.35, 0.75, 1], ease: "easeInOut" as const };
const PACK_KEYFRAMES = { x: [0, 0, -SLIDE_PX], opacity: [0, 1, 1, 0] };
const PACK_TRANSITION = { duration: PACK_MS / 1000, times: [0, 0.3, 0.7, 1], ease: "easeInOut" as const };

function PlaceValueColumn({
  label,
  count,
  highlighted,
  place,
  children,
}: {
  label: string;
  count: number;
  highlighted: boolean;
  place: "tens" | "ones";
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center px-3 pt-3.5 pb-3 rounded-2xl border-[1.5px] min-w-[110px] min-h-[170px] transition-colors duration-200",
        highlighted
          ? "bg-card border-accent shadow-[0_0_0_4px_rgba(200,68,62,0.08)]"
          : "bg-paper-2 border-transparent",
      )}
    >
      <div className="font-mono text-[10px] tracking-[2px] uppercase text-ink-3 mb-1">{label}</div>
      <div
        className={cn(
          "font-serif text-[30px] font-medium leading-none mb-2.5 transition-colors duration-200",
          place === "tens" ? "text-row" : "text-item",
        )}
      >
        {count}
      </div>
      <div className="flex flex-wrap gap-[5px] justify-center content-start">{children}</div>
    </div>
  );
}

/** Animation #3: one migrating "one" at a time - a dot slides into the x10 waypoint and fades,
 * then a ten-pack fades in there and slides on toward the tens column - only then does the next
 * one start. Counts update live as each one lands. */
export function PlaceValueView({ step }: { step: PlaceValueStep }) {
  const moveCount = step.migrate?.moveCount ?? 0;
  const [doneCount, setDoneCount] = useState(0);
  const [stage, setStage] = useState<"dot" | "pack">("dot");
  const [demoVisible, setDemoVisible] = useState(step.demo);

  useEffect(() => {
    if (!step.migrate || moveCount === 0) return;
    setDoneCount(0);
    setStage("dot");
    const timers: number[] = [];
    let t = 0;
    for (let i = 0; i < moveCount; i++) {
      t += DOT_MS;
      timers.push(window.setTimeout(() => setStage("pack"), t));
      t += PACK_MS;
      const doneIndex = i + 1;
      timers.push(
        window.setTimeout(() => {
          setDoneCount(doneIndex);
          setStage("dot");
        }, t),
      );
    }
    timers.push(window.setTimeout(() => setDemoVisible(false), DOT_MS * 0.6));
    return () => timers.forEach(window.clearTimeout);
  }, [step, moveCount]);

  const allDone = moveCount === 0 || doneCount >= moveCount;
  const activeIndex = doneCount;
  const showDotInWaypoint = !allDone && stage === "dot";
  const showPackInWaypoint = !allDone && stage === "pack";

  // The active one has already left the ones place the moment its own cycle begins.
  const leftOnesCount = allDone ? moveCount : activeIndex + 1;
  const onesRemaining = step.onesCount - leftOnesCount;
  const displayTens = step.tensCount + doneCount;
  const displayOnes = onesRemaining;

  return (
    <div className="flex flex-col items-center w-full gap-3">
      {step.demo && (
        <AnimatePresence>
          {demoVisible && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}
              className="flex flex-col items-center gap-2 px-4 py-3 bg-row-bg border border-row/20 rounded-xl"
            >
              <div className="flex items-center gap-3">
                <Dot />
                <div className="flex flex-col items-center gap-0.5">
                  <span className="font-mono text-[9px] tracking-wide text-ink-3">×10</span>
                  <span className="font-serif text-xl font-light text-ink-3 leading-none">→</span>
                </div>
                <TenPack />
              </div>
              <div className="font-mono text-xs font-semibold text-row">1 × 10 = 10</div>
            </motion.div>
          )}
        </AnimatePresence>
      )}

      <div className="flex gap-[18px] justify-center items-start p-1.5">
        <PlaceValueColumn label="tens" count={displayTens} highlighted={step.pvHighlight === "tens"} place="tens">
          {Array.from({ length: step.tensCount + doneCount }, (_, i) => (
            <motion.div key={`pack-${i}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.25 }}>
              <TenPack />
            </motion.div>
          ))}
        </PlaceValueColumn>

        {step.migrate && !allDone && (
          <div className="flex flex-col items-center justify-center gap-1 pt-8 min-w-[44px] shrink-0">
            <div className="font-mono text-[9px] tracking-wide text-ink-3">×10</div>
            <div className="w-11 h-16 rounded-lg border border-dashed border-line-2 flex items-center justify-center">
              {showDotInWaypoint && (
                <motion.div key={`dot-${activeIndex}`} animate={DOT_KEYFRAMES} transition={DOT_TRANSITION}>
                  <Dot variant="hi" />
                </motion.div>
              )}
              {showPackInWaypoint && (
                <motion.div key={`pack-${activeIndex}`} animate={PACK_KEYFRAMES} transition={PACK_TRANSITION}>
                  <TenPack small />
                </motion.div>
              )}
            </div>
          </div>
        )}

        <PlaceValueColumn label="ones" count={displayOnes} highlighted={step.pvHighlight === "ones"} place="ones">
          {Array.from({ length: onesRemaining }, (_, i) => (
            <Dot key={`static-${i}`} />
          ))}
        </PlaceValueColumn>
      </div>
    </div>
  );
}
