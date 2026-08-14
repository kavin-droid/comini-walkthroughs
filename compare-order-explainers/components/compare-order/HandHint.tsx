"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useCompareOrder } from "./CompareOrderContext";

interface Pt {
  x: number;
  y: number;
}

/** Idle "tap hint" adapted from addition-explainers' HandHint - same shape (a looping pointing
 * hand, shown after 5s of no relevant interaction, gone the instant the learner acts), but
 * pointing at the CENTER of the pool row rather than any one card: this app's decision points are
 * "which card is correct", so animating the hand toward a specific card would give the answer
 * away. A stationary pulse over the whole row says "tap one of these" without picking a winner. */
export function HandHint() {
  const { session, step } = useCompareOrder();
  const lastInteractionRef = useRef(Date.now());
  const [idleTick, setIdleTick] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [pt, setPt] = useState<Pt | null>(null);

  const eligible = step.requiresTap && session.tapStatus !== "correct";

  // Fresh grace window every time a new question begins (or is answered/reset).
  useEffect(() => {
    lastInteractionRef.current = Date.now();
  }, [step, session.tapStatus]);

  useEffect(() => {
    if (!eligible) return undefined;
    const interval = window.setInterval(() => setIdleTick((t) => t + 1), 500);
    const onInteract = () => {
      lastInteractionRef.current = Date.now();
    };
    window.addEventListener("pointerdown", onInteract);
    window.addEventListener("keydown", onInteract);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener("pointerdown", onInteract);
      window.removeEventListener("keydown", onInteract);
    };
  }, [eligible]);

  useEffect(() => {
    if (!eligible) {
      setShowHint(false);
      return;
    }
    const elapsed = Date.now() - lastInteractionRef.current;
    setShowHint(elapsed >= 5000);
  }, [idleTick, eligible]);

  useEffect(() => {
    if (!showHint) {
      setPt(null);
      return;
    }
    const pool = document.querySelector("[data-pool-row]");
    if (!pool) {
      setPt(null);
      return;
    }
    const r = pool.getBoundingClientRect();
    setPt({ x: r.left + r.width / 2, y: r.top + r.height / 2 });
  }, [showHint]);

  if (!pt) return null;

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 9999, pointerEvents: "none" }}>
      <motion.div
        initial={{ left: pt.x, top: pt.y, opacity: 0, scale: 1 }}
        animate={{
          opacity: [0, 1, 1, 0],
          y: [0, 10, 10, 0],
          scale: [1, 0.88, 0.88, 1],
        }}
        transition={{
          duration: 1.6,
          repeat: Infinity,
          repeatDelay: 0.5,
          ease: "easeInOut",
          times: [0, 0.15, 0.75, 1],
        }}
        style={{
          position: "absolute",
          left: pt.x,
          top: pt.y,
          fontSize: 36,
          transform: "translate(-50%, -50%)",
          filter: "drop-shadow(0 3px 4px rgba(0,0,0,0.35))",
        }}
      >
        👆
      </motion.div>
    </div>
  );
}
