"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface DotProps {
  color: string;
  /** Left behind in the source cluster once its dot has been dragged into the box - a dotted
   * grey outline marking where it used to be. Deliberately neutral (not a tint of `color`) so
   * it reads as "empty spot", not as a second, different-looking dot in the same color family. */
  ghost?: boolean;
  draggable?: boolean;
  onPointerDown?: (e: React.PointerEvent<HTMLDivElement>) => void;
  /** Mid-count-through pulse (see Stage1Scene's "count" phase). */
  pulse?: boolean;
  /** Smaller size for dots already collected inside the answer box / final recap groups. */
  small?: boolean;
  delay?: number;
  className?: string;
}

export function Dot({ color, ghost, draggable, onPointerDown, pulse, small, delay = 0, className }: DotProps) {
  const size = small ? "w-[22px] h-[22px] min-[900px]:w-[34px] min-[900px]:h-[34px]" : "w-[42px] h-[42px] min-[900px]:w-[86px] min-[900px]:h-[86px]";
  const border = small ? "border-2" : "border-[3px] min-[900px]:border-[4px]";

  return (
    <motion.div
      onPointerDown={onPointerDown}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: pulse ? [1, 1.25, 1] : 1, opacity: 1 }}
      transition={{
        scale: pulse
          ? { duration: 0.4, ease: "easeInOut" }
          : { type: "spring", stiffness: 320, damping: 22, delay },
        opacity: { duration: 0.3, delay },
      }}
      className={cn(
        size,
        border,
        "rounded-full shrink-0",
        draggable && "cursor-grab active:cursor-grabbing",
        className,
      )}
      style={{
        background: ghost ? "transparent" : color,
        borderColor: ghost ? "var(--color-line-2)" : color,
        borderStyle: ghost ? "dotted" : "solid",
        touchAction: draggable ? "none" : undefined,
      }}
    />
  );
}
