"use client";

import { cn } from "@/lib/utils";
import { motion, type HTMLMotionProps } from "framer-motion";

const CELLS = Array.from({ length: 100 });

/** A hundred visualized as a 10x10 flat of hundreds-colored cells, ported from the vanilla
 * stage3 app's `.flat` class. */
export function Flat({ className, ...props }: HTMLMotionProps<"div">) {
  return (
    <motion.div
      className={cn(
        "grid gap-px rounded border border-hundreds/35 bg-hundreds-bg p-[3px]",
        className,
      )}
      style={{ gridTemplateColumns: "repeat(10, 2px)", gridTemplateRows: "repeat(10, 2px)" }}
      {...props}
    >
      {CELLS.map((_, i) => (
        <div key={i} className="rounded-[1px] bg-hundreds" />
      ))}
    </motion.div>
  );
}
