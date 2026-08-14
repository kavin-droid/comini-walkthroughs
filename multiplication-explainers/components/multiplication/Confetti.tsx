"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useMultiplication } from "./MultiplicationContext";

const COLORS = [
  "var(--color-accent)",
  "var(--color-row)",
  "var(--color-group)",
  "var(--color-item)",
  "var(--color-left)",
];
const PIECE_COUNT = 70;
const BURST_MS = 3200;

interface Piece {
  id: number;
  left: number;
  delay: number;
  duration: number;
  color: string;
  rotate: number;
  drift: number;
  width: number;
  height: number;
}

function makePieces(): Piece[] {
  return Array.from({ length: PIECE_COUNT }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 0.35,
    duration: 1.8 + Math.random() * 1.3,
    color: COLORS[i % COLORS.length],
    rotate: 180 + Math.random() * 540,
    drift: (Math.random() - 0.5) * 30,
    width: 6 + Math.random() * 5,
    height: 8 + Math.random() * 6,
  }));
}

/** A one-shot confetti burst celebrating the very last step of any concept (`step.done`) - lives
 * outside the per-step-remounted workspace (see MultiplicationWalkthrough) so it survives that
 * remount instead of being torn down with the rest of the step's visuals, and re-triggers itself
 * via its own effect whenever a *new* done step is freshly landed on (arriving via Next, an MCQ
 * answer, or Previous-then-forward again) rather than replaying on every unrelated re-render. */
export function Confetti() {
  const { step, session } = useMultiplication();
  const [pieces, setPieces] = useState<Piece[] | null>(null);

  useEffect(() => {
    if (!step.done) {
      setPieces(null);
      return;
    }
    setPieces(makePieces());
    const t = window.setTimeout(() => setPieces(null), BURST_MS);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step.done, session.stepIdx]);

  if (!pieces) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden" aria-hidden>
      {pieces.map((p) => (
        <motion.span
          key={p.id}
          initial={{ top: "-8%", left: `${p.left}%`, opacity: 1, rotate: 0 }}
          animate={{ top: "110%", left: `${p.left + p.drift}%`, opacity: [1, 1, 0], rotate: p.rotate }}
          transition={{ duration: p.duration, delay: p.delay, ease: "easeIn" }}
          style={{
            position: "absolute",
            width: p.width,
            height: p.height,
            backgroundColor: p.color,
            borderRadius: 2,
          }}
        />
      ))}
    </div>
  );
}
