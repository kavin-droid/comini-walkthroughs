"use client";

import { cn } from "@/lib/utils";
import { motion, type HTMLMotionProps } from "framer-motion";

const UNITS = Array.from({ length: 10 });

interface TenPackProps extends HTMLMotionProps<"div"> {
  /** Smaller footprint for the migration waypoint container (animation #3), where a full-size
   * pack would overflow the narrow gap between the ones and tens columns. */
  small?: boolean;
}

/** A ten visualized as a 2-row x 5-column pack of units (animation #4) - the same shape used by
 * the addition walkthrough's UnitDot "tens" case, replacing the vanilla multiplication apps'
 * 1-column x 10-row `.ten-block`. */
export function TenPack({ className, small, ...props }: TenPackProps) {
  return (
    <motion.div
      className={cn(
        "grid grid-cols-5 grid-rows-2 gap-[1px] rounded bg-row-bg border border-row/30",
        small ? "p-[2px]" : "p-[3px]",
        className,
      )}
      {...props}
    >
      {UNITS.map((_, i) => (
        <div
          key={i}
          className={cn("rounded-[1px] bg-row", small ? "w-[4px] h-[4px]" : "w-[6px] h-[6px]")}
        />
      ))}
    </motion.div>
  );
}
