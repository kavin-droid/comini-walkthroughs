"use client";

import { cn } from "@/lib/utils";
import { motion, type HTMLMotionProps } from "framer-motion";

const CELLS = Array.from({ length: 10 });

/** A ten visualized as a 2x5 pack of tens-colored cells - replaces the earlier 1x10 `Rod` shape
 * for every "ten" glyph in stage 3 (loose/counting tens cluster, the "10 tens = a hundred"
 * grouping, and the tens place-card), per explicit design feedback: a 2x5 pack reads as a
 * countable unit at a glance, where a tall thin rod doesn't. */
export function TenPack({ className, ...props }: HTMLMotionProps<"div">) {
  return (
    <motion.div
      className={cn(
        "grid grid-cols-5 grid-rows-2 gap-[2px] rounded border border-tens/35 bg-tens-bg p-[3px]",
        className,
      )}
      {...props}
    >
      {CELLS.map((_, i) => (
        <div key={i} className="h-[7px] w-[7px] rounded-[1px] bg-tens" />
      ))}
    </motion.div>
  );
}
