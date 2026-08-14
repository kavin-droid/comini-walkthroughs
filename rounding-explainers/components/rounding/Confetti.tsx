"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useRounding } from "./RoundingContext";

const COLORS = ["#c8443e", "#2f8246", "#6b5fcc", "#c97f0f", "#128864"];
const PIECE_COUNT = 60;
const BURST_MS = 2600;

interface Piece {
  id: number;
  leftPct: number;
  driftPct: number;
  delay: number;
  duration: number;
  rotate: number;
  color: string;
  isCircle: boolean;
}

function makePieces(): Piece[] {
  return Array.from({ length: PIECE_COUNT }, (_, i) => ({
    id: i,
    leftPct: Math.random() * 100,
    driftPct: (Math.random() - 0.5) * 26,
    delay: Math.random() * 0.35,
    duration: 1.6 + Math.random() * 0.9,
    rotate: 180 + Math.random() * 540,
    color: COLORS[i % COLORS.length],
    isCircle: i % 3 === 0,
  }));
}

/** A one-shot confetti burst, fired whenever the walkthrough arrives at its final step
 * (`step.done` - both the isExact short-path's last step and the normal path's `done` view set
 * this, see RoundingStep). Fixed/full-viewport so it isn't clipped by the (possibly small,
 * scaled-down) workspace card, and `pointerEvents: none` so it never blocks the Prev/Next or
 * Play-again controls underneath it. Fires again each time the child navigates back to the final
 * step, not just the first time - a short celebratory replay, not a one-time-per-session flag. */
export function Confetti() {
  const { step, session } = useRounding();
  const [pieces, setPieces] = useState<Piece[] | null>(null);
  const firedForStepIdx = useRef<number | null>(null);

  useEffect(() => {
    if (!step.done) return;
    if (firedForStepIdx.current === session.stepIdx) return;
    firedForStepIdx.current = session.stepIdx;
    setPieces(makePieces());
    const timer = window.setTimeout(() => setPieces(null), BURST_MS);
    return () => window.clearTimeout(timer);
  }, [step.done, session.stepIdx]);

  if (!pieces) return null;

  return (
    <div
      className="fixed inset-0 overflow-hidden"
      style={{ zIndex: 9999, pointerEvents: "none" }}
      aria-hidden="true"
    >
      {pieces.map((p) => (
        <motion.span
          key={p.id}
          initial={{ top: "-6%", left: `${p.leftPct}%`, opacity: 1, rotate: 0 }}
          animate={{
            top: "108%",
            left: `${Math.min(100, Math.max(0, p.leftPct + p.driftPct))}%`,
            opacity: [1, 1, 0],
            rotate: p.rotate,
          }}
          transition={{ duration: p.duration, delay: p.delay, ease: "easeIn" }}
          style={{
            position: "absolute",
            width: p.isCircle ? 8 : 7,
            height: p.isCircle ? 8 : 13,
            background: p.color,
            borderRadius: p.isCircle ? "50%" : 2,
          }}
        />
      ))}
    </div>
  );
}
