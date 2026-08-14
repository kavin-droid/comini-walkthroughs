"use client";

import { motion } from "framer-motion";

/** A single dot with a stable `layoutId` shared between its pile-rendered and bucket-rendered
 * positions. When `dotsPlaced` increments and dot `id` moves from being a child of the pile to
 * being a child of its target container, Framer Motion's shared layout projection animates the
 * real position/size delta between the two - genuine travel, not a fade-in-place. */
export function MotionItem({ id }: { id: number }) {
  return (
    <motion.div
      layout
      layoutId={`s2-dot-${id}`}
      transition={{ type: "spring", stiffness: 500, damping: 34, mass: 0.6 }}
      className="w-5 h-5 bg-s2-item rounded-full border border-[rgba(201,127,15,0.5)] shadow-[inset_0_-2px_0_rgba(0,0,0,0.08)] shrink-0"
    />
  );
}

/** Left behind in the pile once dot `id` has traveled to its container - an empty outline
 * marking "a dot was here", not itself animated (the real motion is the departed MotionItem). */
export function GhostSlot() {
  return (
    <div
      className="w-5 h-5 rounded-full border border-dashed border-line-2 bg-transparent shrink-0"
      style={{ animation: "fade-in-up 0.25s ease" }}
    />
  );
}
