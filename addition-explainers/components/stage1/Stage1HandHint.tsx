"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useStage1 } from "./Stage1Context";

interface Pts {
  sx: number;
  sy: number;
  tx: number;
  ty: number;
}

/** Idle "drag hint" - ported from the addition app's HandHint.tsx (same looping pointing-hand
 * keyframe between a source and target point), adapted to stage1's own drag targets: source =
 * the first still-draggable dot (whichever cluster is currently active - dragA or dragB, only
 * one has draggable dots at a time so a plain global query is enough, same simplification the
 * addition version uses), target = the answer box. Shows after 5s of no drag-relevant
 * interaction and disappears the instant the child interacts (any pointerdown/keydown) -
 * complements Stage1DragArrowHint's immediate, one-shot arrow rather than replacing it. */
export function Stage1HandHint() {
  const { phaseObj } = useStage1();
  const lastInteractionRef = useRef(Date.now());
  const [idleTick, setIdleTick] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [pts, setPts] = useState<Pts | null>(null);

  const eligible = phaseObj.type === "dragA" || phaseObj.type === "dragB";

  useEffect(() => {
    lastInteractionRef.current = Date.now();
  }, [phaseObj.type]);

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
      setPts(null);
      return;
    }
    const dot = document.querySelector(".cursor-grab");
    const box = document.querySelector('[data-stage1-drop="box"]');
    if (!dot || !box) {
      setPts(null);
      return;
    }
    const dr = dot.getBoundingClientRect();
    const br = box.getBoundingClientRect();
    setPts({
      sx: dr.left + dr.width / 2,
      sy: dr.top + dr.height / 2,
      tx: br.left + br.width / 2,
      ty: br.top + br.height / 2,
    });
  }, [showHint]);

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
