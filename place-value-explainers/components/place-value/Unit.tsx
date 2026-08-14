"use client";

import { cn } from "@/lib/utils";
import { motion, type HTMLMotionProps } from "framer-motion";

interface UnitProps extends HTMLMotionProps<"div"> {
  /** Stage 3's ones units are a hair smaller (12px) than stage 2's (13px), matching the vanilla
   * apps' separate `.unit` rules - kept distinct rather than unified since it's a load-bearing
   * pixel value from the vanilla spec, not an arbitrary default. */
  size?: 12 | 13;
}

/** The single reusable loose-ones square from the vanilla apps' `.unit` class. */
export function Unit({ size = 13, className, style, ...props }: UnitProps) {
  return (
    <motion.div
      style={{ width: size, height: size, ...style }}
      className={cn(
        "shrink-0 rounded-[3px] border bg-ones",
        "shadow-[inset_0_-2px_0_rgba(0,0,0,0.08)]",
        size === 13 ? "border-ones/50" : "border-ones/40",
        className,
      )}
      {...props}
    />
  );
}
