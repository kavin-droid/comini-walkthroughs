"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useSkipCounting } from "./SkipCountingContext";
import { getTapTargetIndex } from "@/lib/skip-counting/phases";
import { sessionSequence } from "@/lib/skip-counting/sequence";

interface Pt {
  x: number;
  y: number;
}

const FIRST_TIME_DELAY = 900;
const IDLE_DELAY = 5000;

/** Idle "tap hint" for every interactive tap phase - both the number-line's jump taps and the
 * hundred-grid's tap-through - adapted from addition-explainers' HandHint (itself from
 * fair-share's HandHintLayer), but a single pulsing point instead of a source->target drag path,
 * since this is a tap, not a drag. Shows shortly after the FIRST interactive tap phase the child
 * ever reaches (so brand-new users get immediate guidance), then only after 5s of no interaction
 * on every phase after that. Disappears the instant the child interacts (any pointerdown/keydown)
 * or taps correctly and moves on.
 *
 * Follows the idle-hint-timer-pattern lesson: `eligible` below is a coarse, rarely-changing
 * condition (are we on an interactive tap phase at all) - nothing that toggles as a side effect
 * of normal play (like the wrong-tap shake replaying) is folded into it, so a wrong tap can't
 * accidentally reset the idle countdown the way a volatile flag did in the Mosquito Zapper bug
 * this pattern is named for. */
export function HandHint() {
  const { session, phaseObj } = useSkipCounting();
  const targetIdx = getTapTargetIndex(phaseObj);
  // Coarse gate for the idle-timer itself - phase shape only, NOT lastWrongTap. lastWrongTap
  // toggles on and off within the SAME phase (wrong tap -> hop shown -> Try Again -> null again),
  // exactly the kind of per-action volatile flag the idle-hint-timer-pattern memory warns against
  // folding into this boolean - doing so would re-trigger the fast first-time delay on every
  // retry instead of respecting the already-earned 5s idle delay. See `canHint` below instead.
  const eligible = targetIdx !== null;
  const canHint = eligible && session.lastWrongTap === null;
  const targetValue = targetIdx !== null ? sessionSequence(session)[targetIdx] : null;

  const lastInteractionRef = useRef(Date.now());
  const hasShownOnceRef = useRef(false);
  const [idleTick, setIdleTick] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [pt, setPt] = useState<Pt | null>(null);

  // Fresh grace window every time a new interactive phase begins.
  useEffect(() => {
    lastInteractionRef.current = Date.now();
  }, [phaseObj.type, phaseObj.jumpIndex]);

  useEffect(() => {
    if (!eligible) return undefined;
    const interval = window.setInterval(() => setIdleTick((t) => t + 1), 400);
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
    const delay = hasShownOnceRef.current ? IDLE_DELAY : FIRST_TIME_DELAY;
    const elapsed = Date.now() - lastInteractionRef.current;
    const shouldShow = elapsed >= delay;
    if (shouldShow) hasShownOnceRef.current = true;
    setShowHint(shouldShow);
  }, [idleTick, eligible]);

  useEffect(() => {
    // canHint is the fine-grained visibility gate: hide immediately while a wrong-tap hop is
    // showing (there's nothing to tap right now, only Try Again), but - per the pattern above -
    // this must NOT touch the idle timer itself, only whether an already-elapsed hint renders.
    if (!showHint || !canHint || targetValue === null) {
      setPt(null);
      return;
    }
    const el = document.querySelector(`[data-tap-value="${targetValue}"]`);
    if (!el) {
      setPt(null);
      return;
    }
    const elRect = el.getBoundingClientRect();
    // The number line has its own horizontally-scrolled wrap - don't render the hint mid-scroll
    // while the target sits outside it, or it'd float outside the card. The hundred grid has no
    // such wrap (it never scrolls), so this check simply doesn't apply there.
    const wrap = document.querySelector(".arc-stage-wrap");
    if (wrap) {
      const wrapRect = wrap.getBoundingClientRect();
      if (elRect.left < wrapRect.left - 4 || elRect.right > wrapRect.right + 4) {
        setPt(null);
        return;
      }
    }
    setPt({ x: elRect.left + elRect.width / 2, y: elRect.top + elRect.height / 2 });
  }, [showHint, canHint, targetValue, idleTick]);

  if (!pt) return null;

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 9999, pointerEvents: "none" }}>
      <motion.div
        initial={{ left: pt.x, top: pt.y, opacity: 0, scale: 1 }}
        animate={{
          left: pt.x,
          top: pt.y,
          opacity: [0, 1, 1, 1, 0],
          y: [0, -6, 0, -6, 0],
        }}
        transition={{ duration: 1.4, repeat: Infinity, repeatDelay: 0.3, ease: "easeInOut" }}
        style={{
          position: "absolute",
          fontSize: 34,
          transform: "translate(-35%, -55%)",
          filter: "drop-shadow(0 3px 4px rgba(0,0,0,0.35))",
        }}
      >
        👆
      </motion.div>
    </div>
  );
}
