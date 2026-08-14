"use client";

import { motion } from "framer-motion";

const COLORS = ["var(--color-hop)", "var(--color-used)", "var(--color-left)", "var(--color-accent)", "var(--color-one)"];

/** Deterministic burst (angle/distance/color derived from index, no Math.random) - a static
 * export renders identically on server and client, avoiding a hydration mismatch a random
 * per-render burst would cause on first paint. */
const PIECES = Array.from({ length: 24 }, (_, i) => {
  const angle = (i / 24) * Math.PI * 2;
  const distance = 70 + ((i * 37) % 50);
  return {
    x: Math.cos(angle) * distance,
    y: Math.sin(angle) * distance - 30,
    rotate: (i * 53) % 360,
    color: COLORS[i % COLORS.length],
    delay: (i % 6) * 0.03,
  };
});

/** One-shot celebratory burst - mounts (and plays) whenever its parent renders it, unmounts (and
 * resets) when the parent stops. Purely decorative, absolutely positioned over its relative
 * parent; never gates progression. */
export function Confetti() {
  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-visible" aria-hidden>
      {PIECES.map((p, i) => (
        <motion.span
          key={i}
          initial={{ x: 0, y: 0, opacity: 1, rotate: 0, scale: 1 }}
          animate={{ x: p.x, y: p.y + 60, opacity: 0, rotate: p.rotate, scale: 0.6 }}
          transition={{ duration: 1.1, delay: p.delay, ease: "easeOut" }}
          style={{
            position: "absolute",
            width: 8,
            height: 8,
            borderRadius: 2,
            background: p.color,
          }}
        />
      ))}
    </div>
  );
}
