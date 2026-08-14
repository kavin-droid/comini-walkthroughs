"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";

interface Pts {
  sx: number;
  sy: number;
  tx: number;
  ty: number;
}

const SETTLE_MS = 350;

/** A persistent (not idle-gated) curved arrow with a trace-in trim animation, pointing from the
 * active set's source cluster to the answer box - shown for the whole dragA/dragB phase, telling
 * a non-reader exactly where to drag without needing HandHint's 5s-idle wait first. Portaled to
 * escape the workspace's scale transform, same reasoning as every other measured overlay here.
 *
 * The first measurement is deliberately delayed by SETTLE_MS after `active` flips true: entering
 * dragA/dragB also kicks off the equation-card fade-out / answer-box fade-in, and measuring the
 * source/target elements before that settles can capture a mid-transition (still-moving) rect,
 * which then visibly snaps once a later ResizeObserver correction arrives - the same "trim path
 * animation is out of place" class of bug fixed for the stage2/3 focus-column outline. */
export function Stage1DragArrowHint({
  active,
  sourceSelector,
}: {
  active: boolean;
  sourceSelector: string;
}) {
  const [pts, setPts] = useState<Pts | null>(null);

  useEffect(() => {
    if (!active) {
      setPts(null);
      return;
    }
    let cancelled = false;

    function measure() {
      if (cancelled) return;
      const source = document.querySelector(sourceSelector);
      const target = document.querySelector('[data-stage1-drop="box"]');
      if (!source || !target) return;
      const sr = source.getBoundingClientRect();
      const tr = target.getBoundingClientRect();
      setPts({
        sx: sr.left + sr.width / 2,
        sy: sr.bottom,
        tx: tr.left + tr.width / 2,
        ty: tr.top,
      });
    }

    const settle = window.setTimeout(measure, SETTLE_MS);
    const wrap = document.getElementById("workspace-wrap");
    const ro = new ResizeObserver(() => {
      if (Date.now() >= mountedAt + SETTLE_MS) measure();
    });
    const mountedAt = Date.now();
    if (wrap) ro.observe(wrap);
    window.addEventListener("resize", measure);
    return () => {
      cancelled = true;
      window.clearTimeout(settle);
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [active, sourceSelector]);

  if (!pts || typeof document === "undefined") return null;

  const midY = (pts.sy + pts.ty) / 2;
  const d = `M ${pts.sx} ${pts.sy} Q ${pts.sx} ${midY} ${(pts.sx + pts.tx) / 2} ${midY} T ${pts.tx} ${pts.ty - 6}`;

  return createPortal(
    <svg
      style={{ position: "fixed", inset: 0, width: "100vw", height: "100vh", zIndex: 400, pointerEvents: "none" }}
    >
      <defs>
        <marker id="stage1-arrowhead" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto">
          <path d="M0,0 L8,4 L0,8 Z" className="fill-accent" />
        </marker>
      </defs>
      <motion.path
        d={d}
        fill="none"
        strokeWidth={3}
        strokeLinecap="round"
        strokeDasharray="1 7"
        className="stroke-accent"
        markerEnd="url(#stage1-arrowhead)"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 0.85 }}
        transition={{ duration: 0.7, ease: "easeInOut" }}
      />
    </svg>,
    document.body,
  );
}
