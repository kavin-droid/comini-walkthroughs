"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { useDragToSplit } from "@/hooks/useDragToSplit";
import { Celebration } from "./Celebration";
import { WordLabel } from "./WordLabel";
import { DragHint } from "./DragHint";
import { barPieceStyle } from "./BarWholeIntro";

const GAP_PX = 26;
const MISS_MS = 700;
const SPLIT_SHADOW = "0 0 0 4px rgba(62,111,196,0.45), inset 0 2px 3px rgba(255,255,255,0.18), inset 0 -3px 5px rgba(0,0,0,0.3)";
const WHOLE_SHADOW = "0 0 0 0px rgba(62,111,196,0), inset 0 2px 3px rgba(255,255,255,0.18), inset 0 -3px 5px rgba(0,0,0,0.3)";

/** Drag a finger freely across the bar to draw the cut line - a live line follows the pointer's
 * exact position from the first pixel of movement (see useDragToSplit), and releasing after a
 * real drag near center triggers the continuous split-apart animation. Releasing without having
 * actually dragged, or dragging but releasing off-center, shakes the bar and shows "Try again"
 * for a beat instead of silently doing nothing - explicit feedback either way, never a dead end. */
export function BarSplitInteractive({ onSolved }: { onSolved: () => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<"whole" | "split">("whole");
  const [celebrate, setCelebrate] = useState(false);
  const [missed, setMissed] = useState(false);

  function handleComplete() {
    setPhase("split");
    setCelebrate(true);
    onSolved();
    window.setTimeout(() => setCelebrate(false), 900);
  }

  function handleMiss() {
    setMissed(true);
    window.setTimeout(() => setMissed(false), MISS_MS);
  }

  const { dragX, isDragging, bind } = useDragToSplit(containerRef, handleComplete, handleMiss, phase === "whole");
  const isSplit = phase === "split";

  return (
    <div className="relative flex flex-col items-center gap-5 w-full" style={{ height: "clamp(200px, 36vh, 320px)" }}>
      <div
        ref={containerRef}
        className="relative touch-none select-none"
        style={{ width: "min(82vw, 680px)", height: "clamp(120px, 22vh, 220px)" }}
        {...bind}
      >
        <motion.div
          className="relative w-full h-full"
          animate={missed ? { x: [0, -10, 10, -8, 8, 0] } : { x: 0 }}
          transition={{ duration: 0.4 }}
        >
          <motion.div
            className="absolute top-0 left-0 h-full rounded-l-[18px] border-2"
            style={{ ...barPieceStyle, width: "50%" }}
            animate={{ x: isSplit ? -GAP_PX / 2 : 0, boxShadow: isSplit ? SPLIT_SHADOW : WHOLE_SHADOW }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute top-0 right-0 h-full rounded-r-[18px] border-2"
            style={{ ...barPieceStyle, width: "50%" }}
            animate={{ x: isSplit ? GAP_PX / 2 : 0, boxShadow: isSplit ? SPLIT_SHADOW : WHOLE_SHADOW }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
          />
        </motion.div>

        {isDragging && dragX != null && (
          <div
            className="absolute top-[-6px] bottom-[-6px] w-[3px] rounded-full pointer-events-none"
            style={{ left: dragX - 1.5, background: "var(--color-half)" }}
          />
        )}

        <DragHint
          visible={!isSplit && !isDragging && !missed}
          className="left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        />

        <Celebration show={celebrate} className="left-1/2 top-1/2" />
        <WordLabel
          text={isSplit ? "Split!" : missed ? "Try again" : "Draw a line"}
          visible
          className="left-1/2 top-[calc(100%+20px)]"
        />
      </div>
    </div>
  );
}
