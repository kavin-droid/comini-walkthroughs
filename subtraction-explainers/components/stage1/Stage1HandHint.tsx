"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { useIdle } from "@/hooks/useIdle";
import { useStage1 } from "./Stage1Context";

const IDLE_MS = 5000;

interface Rect {
  left: number;
  top: number;
  width: number;
  height: number;
}

/** Points a bouncing hand at the object the child needs to tap, after 5s of no activity - even
 * more load-bearing here than on stage2/3 (see HandHint there) since this audience can't read a
 * "tap here" instruction at all if the animation alone doesn't make it obvious fast enough.
 * `data-tappable` covers the correct number-line tick and take-away's target apple; the "how many
 * are left" MCQ uses `data-mcq-option` instead (same convention as PredictOptions), so this
 * mirrors stage2/3's HandHint in picking whichever selector applies to the current step. */
export function Stage1HandHint() {
  const { step } = useStage1();
  const isIdle = useIdle(IDLE_MS, [step.id]);
  const [rect, setRect] = useState<Rect | null>(null);
  const isAsking = step.view === "takeAway" && step.askRemaining && !step.revealAnswer;
  const selector = isAsking ? "[data-mcq-option]" : "[data-tappable]";

  useEffect(() => {
    if (!isIdle || (!step.requiresTap && !isAsking)) {
      setRect(null);
      return;
    }
    const el = document.querySelector(selector);
    if (!el) {
      setRect(null);
      return;
    }
    const r = el.getBoundingClientRect();
    setRect({ left: r.left, top: r.top, width: r.width, height: r.height });
  }, [isIdle, step.requiresTap, isAsking, selector, step.id]);

  if (!rect || typeof document === "undefined") return null;

  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, y: [0, -10, 0] }}
      transition={{ opacity: { duration: 0.2 }, y: { duration: 0.9, repeat: Infinity, ease: "easeInOut" } }}
      style={{
        position: "fixed",
        left: rect.left + rect.width / 2 - 18,
        top: rect.top + rect.height / 2 - 10,
        fontSize: 34,
        zIndex: 500,
        pointerEvents: "none",
        filter: "drop-shadow(0 2px 3px rgba(0,0,0,0.25))",
      }}
    >
      👆
    </motion.div>,
    document.body,
  );
}
