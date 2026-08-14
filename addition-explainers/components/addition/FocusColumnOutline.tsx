"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { placeColorVar } from "@/lib/addition/pack";
import { useAddition } from "./AdditionContext";

interface Rect {
  left: number;
  top: number;
  width: number;
  height: number;
}

/** Draws a trace-in outline around the target place's whole column (header label through the
 * total cell) during the 'focus' phase - a deliberate, separate step from the fade that narrows
 * the other columns away, which only happens later at the transition INTO predict (see
 * isInteractivePhase's doc comment in phases.ts). Without a clear visual here, focus's only
 * other cue is a subtle digit-color highlight, easy to miss - the two moments (indicate, then
 * fade) read as one combined event instead of the two separate beats they already are
 * structurally. Portaled to escape the workspace's scale transform, same reasoning as every
 * other measured overlay in this app (DragClone, PackPrompt's move stage). */
export function FocusColumnOutline() {
  const { phaseObj } = useAddition();
  const active = phaseObj.type === "focus" && !!phaseObj.place;
  const place = phaseObj.place;
  const [rect, setRect] = useState<Rect | null>(null);

  useEffect(() => {
    if (!active || !place) {
      setRect(null);
      return;
    }
    function measure() {
      const header = document.querySelector(`[data-row="header"][data-place="${place}"]`);
      const total = document.querySelector(`[data-row="total"][data-place="${place}"]`);
      if (!header || !total) return;
      const hr = header.getBoundingClientRect();
      const tr = total.getBoundingClientRect();
      const left = Math.min(hr.left, tr.left);
      const top = hr.top;
      const right = Math.max(hr.right, tr.right);
      const bottom = tr.bottom;
      setRect({ left, top, width: right - left, height: bottom - top });
    }
    // The transition INTO 'focus' is exactly the moment a later, not-yet-reached place (display
    // order, not processing order - e.g. hundreds sitting left of tens) flips from suppressed
    // back to full view (isPlaceVisible returns true unconditionally once the phase leaves the
    // interactive predict/drag/compare group - see its doc comment), kicking off that column's
    // own 300ms opacity/max-width fade. When that column sits to the LEFT of this effect's
    // target place in display order, its fade shifts the target's real on-screen position for
    // the whole 300ms. A synchronous first measure() here has no guard against that and can
    // capture the target mid-shift, then never self-correct (the ResizeObserver below only
    // watches #workspace-wrap's own box, which doesn't resize from this internal reflow) -
    // reading as the outline appearing in the wrong spot and visibly snapping into place later.
    // Fixed setTimeout (not rAF or a transitionend listener - transitionend is unreliable in
    // this project's own test harness, see usePackAnimation.ts) delays the first measurement
    // slightly past the known 300ms fade so it always lands on the settled box.
    const mountedAt = Date.now();
    const timer = window.setTimeout(measure, 360);
    // ResizeObserver's spec-mandated initial callback fires ~1 frame after `observe()` - well
    // before the 360ms settle window above - so without this guard it would measure the same
    // mid-transition box the timer delay exists to avoid, then the 360ms timer's measurement
    // would silently "correct" it a moment later: exactly the snap this whole fix targets.
    const ro = new ResizeObserver(() => {
      if (Date.now() >= mountedAt + 360) measure();
    });
    const wrap = document.getElementById("workspace-wrap");
    if (wrap) ro.observe(wrap);
    window.addEventListener("resize", measure);
    return () => {
      window.clearTimeout(timer);
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [active, place]);

  if (!active || !place || !rect || typeof document === "undefined") return null;

  return createPortal(
    <svg
      style={{
        position: "fixed",
        left: rect.left - 6,
        top: rect.top - 6,
        width: rect.width + 12,
        height: rect.height + 12,
        zIndex: 500,
        pointerEvents: "none",
      }}
    >
      <motion.rect
        x={3}
        y={3}
        width={rect.width + 6}
        height={rect.height + 6}
        rx={16}
        fill="none"
        strokeWidth={3}
        style={{ stroke: placeColorVar(place) }}
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
      />
    </svg>,
    document.body,
  );
}
