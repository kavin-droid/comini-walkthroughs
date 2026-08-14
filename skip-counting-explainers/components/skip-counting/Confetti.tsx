"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface Particle {
  id: number;
  leftPercent: number;
  driftPx: number;
  rotateDeg: number;
  color: string;
  delaySec: number;
  durationSec: number;
  size: number;
}

const COLORS = ["#2F8246", "#C97F0F", "#6B5FCC", "#C8443E", "#3E6FC4"];
const PARTICLE_COUNT = 48;
const BURST_MS = 3200;

/** Generates the random per-particle values inside an effect (not during render) so the
 * Math.random() calls don't trip the "no impure calls during render" purity rule the way a bare
 * `useRef(Date.now())` would. */
function generateParticles(): Particle[] {
  return Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
    id: i,
    leftPercent: Math.random() * 100,
    driftPx: (Math.random() - 0.5) * 140,
    rotateDeg: Math.random() * 360 + 180,
    color: COLORS[i % COLORS.length],
    delaySec: Math.random() * 0.4,
    durationSec: 1.8 + Math.random() * 1.2,
    size: 6 + Math.random() * 5,
  }));
}

/** A one-shot confetti burst, fired whenever `active` transitions from false to true (i.e. the
 * moment the walkthrough reaches "final"/done) - not a continuous loop, and not replayed on every
 * re-render while still on that phase. Re-fires if the child navigates away and back to done. */
export function Confetti({ active }: { active: boolean }) {
  const [particles, setParticles] = useState<Particle[] | null>(null);

  useEffect(() => {
    if (!active) {
      setParticles(null);
      return;
    }
    setParticles(generateParticles());
    const timer = window.setTimeout(() => setParticles(null), BURST_MS);
    return () => window.clearTimeout(timer);
  }, [active]);

  if (!particles) return null;

  return (
    <div
      style={{ position: "fixed", inset: 0, zIndex: 9997, pointerEvents: "none", overflow: "hidden" }}
      aria-hidden="true"
    >
      {particles.map((p) => (
        <motion.div
          key={p.id}
          initial={{ top: "-8%", left: `${p.leftPercent}%`, opacity: 1, rotate: 0 }}
          animate={{
            top: "108%",
            left: `calc(${p.leftPercent}% + ${p.driftPx}px)`,
            opacity: [1, 1, 0],
            rotate: p.rotateDeg,
          }}
          transition={{ duration: p.durationSec, delay: p.delaySec, ease: "easeIn" }}
          style={{
            position: "absolute",
            width: p.size,
            height: p.size * 0.65,
            background: p.color,
            borderRadius: 1.5,
          }}
        />
      ))}
    </div>
  );
}
