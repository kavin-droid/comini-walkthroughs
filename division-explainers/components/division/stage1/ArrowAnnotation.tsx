"use client";

import { AnimatePresence, motion } from "framer-motion";

interface Point {
  x: number;
  y: number;
}

/** Quadratic-bezier control point offset perpendicular to the travel line, so every arrow gets a
 * gentle consistent arc regardless of which direction it's pointing (pile item -> tray can be
 * up/down/left/right of each other depending on layout). */
function arcPath(from: Point, to: Point): string {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const dist = Math.hypot(dx, dy) || 1;
  const nx = -dy / dist;
  const ny = dx / dist;
  const bulge = Math.min(60, dist * 0.25);
  const mx = (from.x + to.x) / 2 + nx * bulge;
  const my = (from.y + to.y) / 2 + ny * bulge;
  return `M ${from.x} ${from.y} Q ${mx} ${my} ${to.x} ${to.y}`;
}

/** A curved, hand-drawn-feeling arrow that DRAWS ITSELF ON (via Framer's native `pathLength`
 * animation on an SVG path) from a source point to a destination point - "this is where it's
 * going," with zero reliance on reading. One instance covers the whole canvas as an absolutely
 * positioned overlay; pass `active={null}` to show nothing (AnimatePresence handles the fade). */
export function ArrowAnnotation({
  from,
  canvasW,
  canvasH,
}: {
  from: (Point & { to: Point }) | null;
  canvasW: number;
  canvasH: number;
}) {
  return (
    <svg
      className="absolute inset-0 pointer-events-none"
      width={canvasW}
      height={canvasH}
      viewBox={`0 0 ${canvasW} ${canvasH}`}
      aria-hidden="true"
    >
      <defs>
        <marker id="s1-arrowhead" markerWidth="9" markerHeight="9" refX="6" refY="4.5" orient="auto" markerUnits="userSpaceOnUse">
          <path d="M0,0 L9,4.5 L0,9 Z" fill="var(--color-s1-glow)" />
        </marker>
      </defs>
      <AnimatePresence>
        {from && (
          <motion.path
            key={`${from.x},${from.y}-${from.to.x},${from.to.y}`}
            d={arcPath(from, from.to)}
            stroke="var(--color-s1-glow)"
            strokeWidth={5}
            strokeLinecap="round"
            fill="none"
            markerEnd="url(#s1-arrowhead)"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ pathLength: { duration: 0.45, ease: "easeInOut" }, opacity: { duration: 0.2 } }}
          />
        )}
      </AnimatePresence>
    </svg>
  );
}
