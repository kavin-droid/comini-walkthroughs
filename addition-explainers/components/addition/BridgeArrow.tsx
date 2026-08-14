"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { destPlace } from "@/lib/addition/pack";
import { useAddition } from "./AdditionContext";

interface Pts {
  sx: number;
  sy: number;
  tx: number;
  ty: number;
}

/** "Reinforcing the bridge between the numeral and the visual" - during bridge-<place> connects
 * WorkingAnswerPanel's total-<place> numeral to the grid's total-<place> dots; during
 * bridgecarry-<place> connects the panel's carry-<destPlace> numeral to CarryRow's own
 * carry-<destPlace> pack. Thicker/more deliberate than DragArrowHint (which points at a DROP
 * target during dragging, a different purpose) - portaled + measured the same way as every other
 * overlay here (FocusColumnOutline, DragArrowHint) for the same reason: real viewport
 * coordinates, unaffected by the workspace's scale() transform. */
export function BridgeArrow() {
  const { phaseObj } = useAddition();
  const active = phaseObj.type === "bridge" || phaseObj.type === "bridgecarry";
  const [pts, setPts] = useState<Pts | null>(null);

  useEffect(() => {
    if (!active || !phaseObj.place) {
      setPts(null);
      return;
    }
    const place = phaseObj.place;
    const isCarry = phaseObj.type === "bridgecarry";
    const targetPlace = isCarry ? destPlace(place) : place;

    function measure() {
      const numeralSel = isCarry
        ? `[data-panel-row="carry"][data-place="${targetPlace}"]`
        : `[data-panel-row="total"][data-place="${place}"]`;
      const visualSel = isCarry
        ? `[data-row="carry"][data-place="${targetPlace}"]`
        : `[data-row="total"][data-place="${place}"]`;
      const numeral = document.querySelector(numeralSel);
      const visual = document.querySelector(visualSel);
      if (!numeral || !visual) return;
      const nr = numeral.getBoundingClientRect();
      const vr = visual.getBoundingClientRect();
      setPts({
        sx: nr.left + nr.width / 2,
        sy: nr.top + nr.height / 2,
        tx: vr.left + vr.width / 2,
        ty: vr.top + vr.height / 2,
      });
    }
    // Same reasoning as FocusColumnOutline/DragArrowHint: entering a full-view phase can shift
    // columns via their own 300ms opacity/max-width fade, which can shift the measured targets'
    // real on-screen position for the whole transition - delay the first measurement past that
    // instead of racing it, and guard the ResizeObserver's spec-mandated immediate first
    // callback the same way.
    const mountedAt = Date.now();
    const timer = window.setTimeout(measure, 360);
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
  }, [active, phaseObj.type, phaseObj.place]);

  if (!active || !pts || typeof document === "undefined") return null;

  const pad = 28;
  const left = Math.min(pts.sx, pts.tx) - pad;
  const top = Math.min(pts.sy, pts.ty) - pad;
  const width = Math.abs(pts.tx - pts.sx) + pad * 2;
  const height = Math.abs(pts.ty - pts.sy) + pad * 2;
  const x1 = pts.sx - left;
  const y1 = pts.sy - top;
  const x2 = pts.tx - left;
  const y2 = pts.ty - top;

  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len;
  const uy = dy / len;
  const ex = x2 - ux * 22;
  const ey = y2 - uy * 22;
  const arrowSize = 12;
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
        zIndex: 600,
        pointerEvents: "none",
      }}
    >
      <motion.path
        d={`M ${x1} ${y1} L ${ex} ${ey} M ${leftWing.x} ${leftWing.y} L ${ex} ${ey} L ${rightWing.x} ${rightWing.y}`}
        fill="none"
        strokeWidth={5}
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ stroke: "var(--color-accent)" }}
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 0.9 }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
      />
    </svg>,
    document.body,
  );
}
