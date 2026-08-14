"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { useIdle } from "@/hooks/useIdle";
import { useSubtraction } from "./SubtractionContext";

const IDLE_MS = 5000;

interface Rect {
  left: number;
  top: number;
  width: number;
  height: number;
}

/** Every interactive phase marks its ONE actionable target with either `data-mcq-option`
 * (PredictOptions' buttons) or `data-tappable` (a drag-removable or regroup-source UnitDot) -
 * reusing those as the hint's query selectors means this component doesn't need any
 * phase-specific wiring beyond picking which selector applies. Deliberately NOT the generic
 * `cursor-pointer` utility class - other unrelated controls (e.g. ModeToggle) also use it, and
 * `document.querySelector` would silently grab whichever of those happens to sit first in the
 * DOM instead of the actual tap target. */
function targetSelector(phaseType: string): string | null {
  if (phaseType === "predict") return "[data-mcq-option]";
  if (phaseType === "drag" || phaseType === "regroup") return "[data-tappable]";
  return null;
}

/** After 5s with no tap/keypress, points a bouncing hand at whatever the child should tap next.
 * The idle clock itself (useIdle) is a generic "how long since anything happened" timer that
 * knows nothing about phases - the DISPLAY decision (is there even a sensible target right now)
 * is made entirely here, at render time, from the current phase. */
export function HandHint() {
  const { session, phaseObj } = useSubtraction();
  const isIdle = useIdle(IDLE_MS, [
    phaseObj.type,
    phaseObj.place,
    session.phaseIdx,
    session.removed,
    session.regrouped,
  ]);
  const [rect, setRect] = useState<Rect | null>(null);
  const selector = targetSelector(phaseObj.type);

  useEffect(() => {
    if (!isIdle || !selector) {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isIdle, selector, session.removed, session.regrouped]);

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
