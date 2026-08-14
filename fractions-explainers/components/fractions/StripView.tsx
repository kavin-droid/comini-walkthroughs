"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Callout } from "./Callout";
import type { StripStep } from "@/lib/fractions/types";

/** Exported for reuse by McqCombineView, which needs the exact same read-only boundary-colored
 * strip rendering for its (always fully pre-shaded) display. */
export function StripGroup({
  cellCount,
  shaded,
  boundary,
  isHalves,
  caption,
}: {
  cellCount: number;
  shaded: number;
  boundary: number | null;
  isHalves: boolean;
  caption: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="flex flex-col items-center gap-1.5"
    >
      <div
        className={cn(
          "flex w-[280px] max-w-[78vw] max-[380px]:w-[240px] rounded-[10px] overflow-hidden border-2",
          isHalves ? "h-11" : "h-16",
        )}
        style={{
          borderColor: "var(--color-choco-dark)",
          boxShadow: "inset 0 2px 3px rgba(255,255,255,0.12), inset 0 -3px 5px rgba(0,0,0,0.25)",
        }}
      >
        {Array.from({ length: cellCount }).map((_, i) => {
          const isShaded = i < shaded;
          const color = isHalves
            ? "var(--color-half)"
            : boundary != null && i >= boundary
              ? "var(--color-piece2)"
              : "var(--color-piece1)";
          return (
            <motion.div
              key={i}
              initial={isShaded ? { opacity: 0 } : false}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className={cn("flex-1", i < cellCount - 1 && "border-r-[3px]")}
              style={{
                borderColor: "var(--color-choco-dark)",
                background: isShaded
                  ? color
                  : "linear-gradient(155deg, var(--color-choco-2), var(--color-choco) 60%)",
              }}
            />
          );
        })}
      </div>
      <div className="font-mono text-[10px] tracking-[1.5px] uppercase text-ink-3">{caption}</div>
    </motion.div>
  );
}

/** A bar split into equal cells with some shaded in - ported from the vanilla apps'
 * renderStrip()/renderStripGroup(). Stage 2 always splits into quarters and optionally overlays a
 * second 2-cell "halves" strip underneath (an equivalent-form comparison); stage 3 splits into the
 * step's own denominator and never shows a boundary split or halves overlay. */
export function StripView({ step }: { step: StripStep }) {
  return (
    <div className="flex flex-col items-center gap-[18px]">
      <StripGroup
        cellCount={step.cellCount}
        shaded={step.shaded}
        boundary={step.boundary}
        isHalves={false}
        caption={step.caption}
      />
      {step.showHalves && (
        <StripGroup
          cellCount={2}
          shaded={step.halvesShaded}
          boundary={null}
          isHalves={true}
          caption="halves"
        />
      )}
      {step.callout && <Callout parts={step.callout} />}
    </div>
  );
}
