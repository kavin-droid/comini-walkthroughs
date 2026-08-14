"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useAddition } from "./AdditionContext";

interface Pts {
  sx: number;
  sy: number;
  tx: number;
  ty: number;
}

/** Idle "drag hint" adapted from fair-share/components/FairShareGame.tsx's HandHintLayer -
 * same animation shape (a looping pointing-hand keyframe between a source and target point),
 * generalized here to this app's own drag targets: source = the first still-draggable dot,
 * target = the active place's Total cell. Shows after 5s of no drag-relevant interaction
 * (covers both "never dragged yet" and "went idle after packing, remaining dots unclear") and
 * disappears the instant the child interacts (any pointerdown/keydown). */
export function HandHint() {
  const { phaseObj } = useAddition();
  const lastInteractionRef = useRef(Date.now());
  const [idleTick, setIdleTick] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [pts, setPts] = useState<Pts | null>(null);

  const eligible = phaseObj.type === "drag";

  // Fresh grace window every time a new place's drag phase begins.
  useEffect(() => {
    lastInteractionRef.current = Date.now();
  }, [phaseObj.place, phaseObj.type]);

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
    if (!showHint || !phaseObj.place) {
      setPts(null);
      return;
    }
    const dot = document.querySelector(".cursor-grab");
    const totalCell = document.querySelector(
      `[data-row="total"][data-place="${phaseObj.place}"]`,
    );
    if (!dot || !totalCell) {
      setPts(null);
      return;
    }
    const dr = dot.getBoundingClientRect();
    const tr = totalCell.getBoundingClientRect();
    setPts({
      sx: dr.left + dr.width / 2,
      sy: dr.top + dr.height / 2,
      tx: tr.left + tr.width / 2,
      ty: tr.top + tr.height / 2,
    });
  }, [showHint, phaseObj.place]);

  if (!pts) return null;

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 9999, pointerEvents: "none" }}>
      <motion.div
        initial={{ left: pts.sx, top: pts.sy, opacity: 0, scale: 1 }}
        animate={{
          left: [pts.sx, pts.sx, pts.tx, pts.tx],
          top: [pts.sy, pts.sy, pts.ty, pts.ty],
          opacity: [0, 1, 1, 0],
          scale: [1, 0.85, 0.85, 1],
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
          fontSize: 36,
          transform: "translate(-40%, -30%)",
          filter: "drop-shadow(0 3px 4px rgba(0,0,0,0.35))",
        }}
      >
        👆
      </motion.div>
    </div>
  );
}
