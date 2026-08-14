"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { useDragToSplit } from "@/hooks/useDragToSplit";
import { Celebration } from "./Celebration";
import { WordLabel } from "./WordLabel";
import { DragHint } from "./DragHint";

export const SIZE = "clamp(200px, 34vw, 340px)";
const GAP_PX = 20;
const MISS_MS = 700;

export const crustStyle = {
  background: "radial-gradient(circle at 35% 30%, #F0C36B, #E0A83E 55%, #C6842A)",
  borderColor: "#8A5A1C",
  boxShadow: "inset 0 3px 5px rgba(255,255,255,0.35), inset 0 -4px 6px rgba(0,0,0,0.2)",
};

/** Pretend pepperoni, purely for "this reads as pizza, not just a circle" recognizability - each
 * array is in that HALF's own local percentage coordinates (0-100% of the half's own box), so no
 * shared full-circle coordinate math is needed. Exported for reuse by PizzaWholeIntro (a full,
 * unsplit pizza needs both arrays combined) and CompareWholeHalfMcq's pizza variant. */
export const LEFT_PEPPERONI: { top: string; left: string }[] = [
  { top: "30%", left: "45%" },
  { top: "65%", left: "60%" },
];
export const RIGHT_PEPPERONI: { top: string; left: string }[] = [{ top: "45%", left: "40%" }];

export function Pepperoni({ top, left }: { top: string; left: string }) {
  return (
    <div
      className="absolute w-[22%] aspect-square rounded-full -translate-x-1/2 -translate-y-1/2"
      style={{ top, left, background: "#B4432E", border: "1px solid #7A2C1C" }}
    />
  );
}

/** Reuses the exact same free-draw cut-line interaction as the bar (useDragToSplit), just
 * rendered as two semicircles (each half's outer edge fully rounded, inner edge flat, via
 * border-radius) instead of two rectangles. Same miss-feedback treatment as BarSplitInteractive:
 * a release that didn't drag far enough, or landed off-center, shakes the pizza and shows "Try
 * again" instead of doing nothing. */
export function PizzaCutHalf({ onSolved }: { onSolved: () => void }) {
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
    <div className="relative flex flex-col items-center gap-5 w-full" style={{ height: "clamp(220px, 40vh, 380px)" }}>
      <div ref={containerRef} className="relative touch-none select-none" style={{ width: SIZE, aspectRatio: 1 }} {...bind}>
        <motion.div
          className="relative w-full h-full"
          animate={missed ? { x: [0, -10, 10, -8, 8, 0] } : { x: 0 }}
          transition={{ duration: 0.4 }}
        >
          <motion.div
            className="absolute top-0 left-0 h-full overflow-hidden border-2"
            style={{ ...crustStyle, width: "50%", borderRadius: "999px 0 0 999px" }}
            animate={{ x: isSplit ? -GAP_PX / 2 : 0 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
          >
            {LEFT_PEPPERONI.map((p, i) => (
              <Pepperoni key={i} top={p.top} left={p.left} />
            ))}
          </motion.div>
          <motion.div
            className="absolute top-0 right-0 h-full overflow-hidden border-2"
            style={{ ...crustStyle, width: "50%", borderRadius: "0 999px 999px 0" }}
            animate={{ x: isSplit ? GAP_PX / 2 : 0 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
          >
            {RIGHT_PEPPERONI.map((p, i) => (
              <Pepperoni key={i} top={p.top} left={p.left} />
            ))}
          </motion.div>
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
          className="left-1/2 top-[calc(100%+18px)]"
        />
      </div>
    </div>
  );
}
