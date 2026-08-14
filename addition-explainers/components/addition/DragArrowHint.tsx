"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { useAddition } from "./AdditionContext";

interface Pts {
  sx: number;
  sy: number;
  tx: number;
  ty: number;
}

/** A trace-in arrow pointing from the active place's draggable source dots down to that place's
 * Total-row target cell - a lightweight "this is the target" annotation, distinct from
 * HandHint's idle-only looping nudge (which only appears after 5s of inactivity and keeps
 * repeating). Both coexist: this one is immediate, HandHint layers on top later if the child
 * stalls.
 *
 * Row-aware and self-dismissing, not just "on for the whole drag-<place> phase": it points at
 * num1 first, disappears the instant the child drags their FIRST dot from num1 (they've got the
 * idea - repeating it for every remaining num1 dot would be nagging, HandHint's idle nudge is
 * there if they stall on a later one), then once num1 is fully drained it reappears pointing at
 * num2, again dismissing after num2's first drag. Portaled to document.body for the same reason
 * as FocusColumnOutline/HandHint - it needs real viewport coordinates, unaffected by the
 * workspace's scale() transform. */
export function DragArrowHint() {
  const { session, phaseObj } = useAddition();
  const place = phaseObj.place;
  const own1 = place ? session.own[place].n1 : 0;
  const own2 = place ? session.own[place].n2 : 0;
  const moved1 = place ? session.moved[place].n1 : 0;
  const moved2 = place ? session.moved[place].n2 : 0;

  let targetRow: "num1" | "num2" | null = null;
  if (own1 > 0 && moved1 === 0) targetRow = "num1";
  else if (own2 > 0 && moved2 === 0 && moved1 >= own1) targetRow = "num2";

  const active = phaseObj.type === "drag" && !!place && targetRow !== null;
  const [pts, setPts] = useState<Pts | null>(null);

  useEffect(() => {
    if (!active || !place || !targetRow) {
      setPts(null);
      return;
    }
    function measure() {
      const dot = document.querySelector(`[data-row="${targetRow}"][data-place="${place}"] .cursor-grab`);
      const totalCell = document.querySelector(`[data-row="total"][data-place="${place}"]`);
      if (!dot || !totalCell) return;
      const dr = dot.getBoundingClientRect();
      const tr = totalCell.getBoundingClientRect();
      setPts({
        sx: dr.left + dr.width / 2,
        sy: dr.top + dr.height / 2,
        tx: tr.left + tr.width / 2,
        ty: tr.top + tr.height / 2,
      });
    }
    // Same reasoning as FocusColumnOutline: entering 'drag' narrows the OTHER columns down to
    // just this place (plus any already-carried later place) via the same 300ms opacity/
    // max-width transition, which can shift this place's own on-screen position too (its wrapper
    // is mid-fade right as this effect activates). Delay the first measurement past that instead
    // of racing it - see FocusColumnOutline.tsx for the full explanation.
    const mountedAt = Date.now();
    const timer = window.setTimeout(measure, 360);
    // See FocusColumnOutline.tsx for why the ResizeObserver callback also needs this guard, not
    // just the initial timer - its spec-mandated first callback fires before the 360ms window.
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
  }, [active, place, targetRow]);

  if (!active || !pts || typeof document === "undefined") return null;

  const pad = 24;
  const left = Math.min(pts.sx, pts.tx) - pad;
  const top = Math.min(pts.sy, pts.ty) - pad;
  const width = Math.abs(pts.tx - pts.sx) + pad * 2;
  const height = Math.abs(pts.ty - pts.sy) + pad * 2;
  const x1 = pts.sx - left;
  const y1 = pts.sy - top;
  const x2 = pts.tx - left;
  const y2 = pts.ty - top;

  // Shorten the line so it stops short of the target cell, leaving room for the arrowhead
  // instead of terminating on top of the cell's content.
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len;
  const uy = dy / len;
  const ex = x2 - ux * 18;
  const ey = y2 - uy * 18;
  const arrowSize = 7;
  const leftWing = { x: ex - uy * arrowSize - ux * arrowSize, y: ey + ux * arrowSize - uy * arrowSize };
  const rightWing = { x: ex + uy * arrowSize - ux * arrowSize, y: ey - ux * arrowSize - uy * arrowSize };

  return createPortal(
    <svg
      style={{
        position: "fixed",
        left,
        top,
        width,
        height,
        zIndex: 400,
        pointerEvents: "none",
      }}
    >
      <motion.path
        d={`M ${x1} ${y1} L ${ex} ${ey} M ${leftWing.x} ${leftWing.y} L ${ex} ${ey} L ${rightWing.x} ${rightWing.y}`}
        fill="none"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ stroke: "var(--color-ink-3)" }}
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 0.6 }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
      />
    </svg>,
    document.body,
  );
}
