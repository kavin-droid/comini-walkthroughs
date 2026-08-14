"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";

const COLORS = [
  "var(--color-accent)",
  "var(--color-left)",
  "var(--color-sum)",
  "var(--color-ten)",
  "var(--color-one)",
  "var(--color-hundred)",
];

interface Particle {
  id: number;
  x: number;
  y: number;
  rotate: number;
  color: string;
  delay: number;
  duration: number;
  width: number;
  height: number;
}

function makeParticles(count: number): Particle[] {
  return Array.from({ length: count }, (_, i) => {
    const angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 1.1;
    const distance = 90 + Math.random() * 170;
    return {
      id: i,
      x: Math.cos(angle) * distance,
      y: Math.sin(angle) * distance + 60,
      rotate: (Math.random() - 0.5) * 520,
      color: COLORS[i % COLORS.length],
      delay: Math.random() * 0.2,
      duration: 1 + Math.random() * 0.5,
      width: 5 + Math.random() * 5,
      height: 8 + Math.random() * 6,
    };
  });
}

/** One-shot celebratory burst for the walkthrough's final "Done" step - mounted only while that
 * step is showing (see Workspace), so simply appearing IS the trigger; no play/replay state to
 * manage. Plain CSS-transform particles via Framer Motion rather than a confetti library, since a
 * single decorative burst doesn't need a whole dependency. */
export function Confetti() {
  const particles = useMemo(() => makeParticles(32), []);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden z-20" aria-hidden="true">
      {particles.map((p) => (
        <motion.span
          key={p.id}
          initial={{ x: 0, y: 0, opacity: 1, rotate: 0 }}
          animate={{ x: p.x, y: p.y, opacity: 0, rotate: p.rotate }}
          transition={{ duration: p.duration, delay: p.delay, ease: "easeOut" }}
          style={{
            position: "absolute",
            left: "50%",
            top: "38%",
            width: p.width,
            height: p.height,
            background: p.color,
            borderRadius: 1.5,
          }}
        />
      ))}
    </div>
  );
}
