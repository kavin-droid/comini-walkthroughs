"use client";

import { useState } from "react";
import { motion } from "framer-motion";

const COLORS = ["#f6b93b", "#e55039", "#4a69bd", "#78e08f", "#e58e26", "#82ccdd", "#b71540"];
const PIECE_COUNT = 36;

interface Piece {
  left: number;
  delay: number;
  duration: number;
  rotate: number;
  drift: number;
  width: number;
  height: number;
  color: string;
}

function makePieces(): Piece[] {
  return Array.from({ length: PIECE_COUNT }, (_, i) => ({
    left: Math.random() * 100,
    delay: Math.random() * 0.35,
    duration: 1.6 + Math.random() * 1.1,
    rotate: Math.random() * 480 - 240,
    drift: (Math.random() - 0.5) * 120,
    width: 6 + Math.random() * 6,
    height: 4 + Math.random() * 5,
    color: COLORS[i % COLORS.length],
  }));
}

/** A one-shot confetti burst for a "done"/celebration screen - plain filled rectangles falling
 * from the top with random drift/rotation, no external library. Piece geometry is generated once
 * via lazy useState init (not inline Math.random() in the render body), so an unrelated parent
 * re-render doesn't reshuffle every piece's position mid-fall. Render inside a `position:
 * relative; overflow: hidden` ancestor - this fills that ancestor via `inset-0` and never
 * intercepts pointer events. */
export function Confetti() {
  const [pieces] = useState(makePieces);

  return (
    <div className="absolute inset-0 overflow-hidden" style={{ zIndex: 50, pointerEvents: "none" }}>
      {pieces.map((p, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: -20, x: 0, rotate: 0 }}
          animate={{ opacity: [0, 1, 1, 0], y: 320, x: p.drift, rotate: p.rotate }}
          transition={{ duration: p.duration, delay: p.delay, ease: "easeIn" }}
          style={{
            position: "absolute",
            left: `${p.left}%`,
            top: 0,
            width: p.width,
            height: p.height,
            background: p.color,
            borderRadius: 2,
          }}
        />
      ))}
    </div>
  );
}
