"use client";

import { cn } from "@/lib/utils";
import { motion, type HTMLMotionProps } from "framer-motion";

export type DotVariant = "item" | "split-b" | "hi";

interface DotProps extends HTMLMotionProps<"div"> {
  variant?: DotVariant;
  /** Stage 2's row/column-definition steps ring+pop the dots belonging to the one row or column
   * being named, without changing their base color - unlike `variant="hi"`, which recolors the
   * dot entirely for the place-value migration's "this one is converting" meaning. */
  emphasized?: boolean;
}

/** The single reusable "item" dot from the vanilla apps' `.item` class: a 14px circle in the
 * ones/array color, with two variants also ported 1:1 - `.split-b` (the distributive property's
 * second-part color) and `.hi-dot` (the place-value view's highlighted-for-migration dot). */
export function Dot({ variant = "item", emphasized, className, ...props }: DotProps) {
  return (
    <motion.div
      className={cn(
        "w-[14px] h-[14px] rounded-full border shrink-0 shadow-[inset_0_-2px_0_rgba(0,0,0,0.08)] transition-transform duration-200",
        variant === "split-b" && "bg-group border-group/50",
        variant === "hi" &&
          "bg-accent border-accent scale-[1.15] shadow-[0_0_0_4px_rgba(200,68,62,0.18),inset_0_-2px_0_rgba(0,0,0,0.1)]",
        variant === "item" && "bg-item border-item/50",
        emphasized && "scale-125 ring-2 ring-accent ring-offset-1 ring-offset-card z-10",
        className,
      )}
      {...props}
    />
  );
}
