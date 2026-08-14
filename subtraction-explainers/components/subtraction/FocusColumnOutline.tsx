"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { placeColorVar } from "@/lib/subtraction/format";
import { useSubtraction } from "./SubtractionContext";

interface Rect {
  left: number;
  top: number;
  width: number;
  height: number;
}

/** Ported from addition-explainers' FocusColumnOutline (see that file for the full rationale) -
 * a portaled SVG trace-in outline around the target place's whole column (header label through
 * the take row, the last row visible during 'spotlight' - result isn't shown yet), replacing the
 * previous per-cell pulsing-ring TrimPathHighlight, which read as "not proper" against this. Only
 * active during 'spotlight' (matches isPlaceHighlighted), same single beat addition uses this for.
 * Portaled to document.body to escape the workspace's own scale transform. */
export function FocusColumnOutline() {
  const { phaseObj } = useSubtraction();
  const active = phaseObj.type === "spotlight" && !!phaseObj.place;
  const place = phaseObj.place;
  const [rect, setRect] = useState<Rect | null>(null);

  useEffect(() => {
    if (!active || !place) {
      setRect(null);
      return;
    }
    function measure() {
      const header = document.querySelector(`[data-row="header"][data-place="${place}"]`);
      const take = document.querySelector(`[data-row="take"][data-place="${place}"]`);
      const bottom = take ?? document.querySelector(`[data-row="start"][data-place="${place}"]`);
      if (!header || !bottom) return;
      const hr = header.getBoundingClientRect();
      const br = bottom.getBoundingClientRect();
      const left = Math.min(hr.left, br.left);
      const top = hr.top;
      const right = Math.max(hr.right, br.right);
      const bot = br.bottom;
      setRect({ left, top, width: right - left, height: bot - top });
    }
    // Entering 'spotlight' can follow a 'recap'/'expand' step whose own column-collapse fade is
    // still settling (300ms opacity/max-width transition) - a synchronous first measure() has no
    // guard against that and could capture the column mid-shift. Same fixed-delay approach as
    // addition-explainers (a plain setTimeout, not rAF/transitionend - matches its reasoning).
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
