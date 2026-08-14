"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { ArrowUp } from "lucide-react";
import { Celebration } from "./Celebration";
import { WordLabel } from "./WordLabel";
import { JAR_W, JAR_ASPECT } from "./JarShape";

const TOLERANCE_LOW = 35;
const TOLERANCE_HIGH = 65;

/** Drag up/down on the jar to raise or lower the water level live, exactly tracking the
 * finger (no snapping while dragging - only on release, so the whole gesture reads as "I am
 * pouring" rather than a discrete step). Releasing within a generous band around the halfway mark
 * snaps to a perfect 50% and celebrates; releasing outside it just leaves the water where it is
 * and waits for another drag, never punishing a miss with a reset. The idle-state "Fill halfway"
 * label is the in-workarea equivalent of bar/pizza's "Draw a line" prompt - without it, this step
 * had no action text at all outside the hideable narration sentence, so hiding instructions left
 * the child with only an arrow icon and no indication of what to actually do. */
export function JarFillHalf({ onSolved }: { onSolved: () => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [fill, setFill] = useState(0);
  const [solved, setSolvedLocal] = useState(false);
  const [celebrate, setCelebrate] = useState(false);
  const dragging = useRef(false);

  function fillFromClientY(clientY: number): number {
    const rect = containerRef.current!.getBoundingClientRect();
    const pct = ((rect.bottom - clientY) / rect.height) * 100;
    return Math.min(100, Math.max(0, pct));
  }

  function onPointerDown(e: React.PointerEvent) {
    if (solved) return;
    (e.target as Element).setPointerCapture?.(e.pointerId);
    dragging.current = true;
    setFill(fillFromClientY(e.clientY));
  }
  function onPointerMove(e: React.PointerEvent) {
    if (!dragging.current || solved) return;
    setFill(fillFromClientY(e.clientY));
  }
  function finish() {
    if (!dragging.current || solved) return;
    dragging.current = false;
    if (fill >= TOLERANCE_LOW && fill <= TOLERANCE_HIGH) {
      setFill(50);
      setSolvedLocal(true);
      setCelebrate(true);
      onSolved();
      window.setTimeout(() => setCelebrate(false), 900);
    }
  }

  return (
    <div className="flex flex-col items-center gap-5 w-full">
      <div
        ref={containerRef}
        className="relative touch-none select-none rounded-[16px_16px_34px_34px] border-2 overflow-hidden shrink-0"
        style={{ width: JAR_W, aspectRatio: JAR_ASPECT, background: "rgba(255,255,255,0.35)", borderColor: "var(--color-ink-3)" }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={finish}
        onPointerCancel={finish}
      >
        <div
          className="absolute left-0 right-0 border-t-2 border-dashed"
          style={{ top: "50%", borderColor: "rgba(62,111,196,0.55)" }}
        />
        <motion.div
          className="absolute left-0 right-0 bottom-0"
          style={{ background: "linear-gradient(180deg, #5D95E0, var(--color-half))" }}
          animate={{ height: `${fill}%` }}
          transition={{ duration: solved ? 0.4 : 0, ease: "easeOut" }}
        >
          <div className="absolute top-0 left-0 right-0 h-2" style={{ background: "rgba(255,255,255,0.35)" }} />
        </motion.div>
        <div
          className="absolute top-3 left-2.5 w-2.5 rounded-full"
          style={{ height: "70%", background: "rgba(255,255,255,0.5)" }}
        />

        {!solved && fill < 8 && (
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 1.1, repeat: Infinity, ease: "easeInOut" }}
            className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          >
            <div className="rounded-full bg-card border-2 border-accent p-2" style={{ boxShadow: "0 0 0 6px rgba(200,68,62,0.15)" }}>
              <ArrowUp size={20} className="text-accent" />
            </div>
          </motion.div>
        )}

        <Celebration show={celebrate} className="left-1/2 top-1/2" />
        <WordLabel
          text={solved ? "Half" : "Fill halfway"}
          visible
          className="left-1/2 top-[calc(100%+16px)]"
        />
      </div>
    </div>
  );
}
