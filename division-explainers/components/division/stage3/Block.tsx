"use client";

import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { BlockKind } from "@/lib/division/stage3";

interface BlockProps {
  kind: BlockKind;
  /** Fades a "tens" pack's packaging (background + border) to transparent over 300ms - the first
   * half of the unpack animation, before it visually travels to the ones column. */
  stripped?: boolean;
  /** Reduced opacity - marks a block as leftover/remainder, set aside from the current round. */
  dimmed?: boolean;
  /** Small numbered badge shown during the counting demos ((index % divisor) + 1). Tens keeps its
   * label forever once counted (a persistent running tally); ones fades its label out (see
   * AnimatePresence below) once its own group of `divisor` completes, so the count visibly resets
   * to make room for the next group's 1-2-3-4. */
  countLabel?: number | null;
  /** Counting-time highlight: "group" for a block that belongs to a COMPLETE group of `divisor`,
   * "leftover" for one in the trailing partial group that can't form a full share. */
  highlight?: "group" | "leftover" | null;
  /** A small collective wiggle, tens-only - fires the moment the trailing leftover group finishes
   * counting and comes up short of a full group. */
  shake?: boolean;
  onTap?: () => void;
}

// Tens blocks are pale-container + solid-inner-squares by default, so their highlight uses the
// same pale "-bg" treatment; ones blocks are a single solid square by default, so their highlight
// swaps to the solid color instead - each kind keeps its own base visual language.
const TENS_HIGHLIGHT_BG: Record<"group" | "leftover", string> = {
  group: "bg-s3-bucket-bg border-s3-bucket",
  leftover: "bg-s3-leftover-bg border-s3-leftover",
};
const ONES_HIGHLIGHT_BG: Record<"group" | "leftover", string> = {
  group: "bg-s3-bucket border-s3-bucket",
  leftover: "bg-s3-leftover border-s3-leftover",
};
const HIGHLIGHT_BADGE: Record<"group" | "leftover", string> = {
  group: "text-s3-bucket",
  leftover: "text-s3-leftover",
};

/** A tens pack is a 2-row x 5-column grid of unit squares - deliberately NOT a 1x10 "rod", so it
 * reads as a compact block matching standard base-ten manipulative conventions. */
export function Block({ kind, stripped, dimmed, countLabel, highlight, shake, onTap }: BlockProps) {
  const tappable = !!onTap;
  const badgeColor = highlight ? HIGHLIGHT_BADGE[highlight] : "text-s3-bucket";

  if (kind === "tens") {
    return (
      <div
        onClick={onTap}
        className={cn(
          "relative grid gap-1 p-2 rounded-md border transition-colors duration-300",
          stripped ? "bg-transparent border-transparent" : highlight ? TENS_HIGHLIGHT_BG[highlight] : "bg-s3-ten-bg border-[rgba(18,136,100,0.3)]",
          dimmed && "opacity-25",
          tappable && "cursor-pointer",
        )}
        style={{
          gridTemplateColumns: "repeat(5, 11px)",
          gridTemplateRows: "repeat(2, 11px)",
          ...(shake ? { animation: "shake 0.4s ease" } : {}),
        }}
      >
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="bg-s3-ten rounded-[2px]" />
        ))}
        <AnimatePresence>
          {countLabel != null && (
            <motion.span
              key={countLabel}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.6 }}
              transition={{ duration: 0.25 }}
              className={cn(
                "absolute -top-3.5 left-1/2 -translate-x-1/2 font-mono text-[13px] font-bold bg-card px-1.5 rounded-full border border-line leading-relaxed",
                badgeColor,
              )}
            >
              {countLabel}
            </motion.span>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div
      onClick={onTap}
      className={cn(
        "relative w-5 h-5 rounded-[4px] border transition-colors duration-300",
        // Same base color as the unit squares inside a tens pack (s3-ten) - one representation,
        // one color, so "these are the same kind of thing, just regrouped" reads visually.
        highlight ? ONES_HIGHLIGHT_BG[highlight] : "bg-s3-ten border-[rgba(18,136,100,0.4)]",
        dimmed && "opacity-25",
        tappable && "cursor-pointer",
      )}
      style={{ animation: "fade-in-up 0.3s ease" }}
    >
      <AnimatePresence>
        {countLabel != null && (
          <motion.span
            key={countLabel}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.6 }}
            transition={{ duration: 0.25 }}
            className={cn(
              "absolute -top-4 left-1/2 -translate-x-1/2 font-mono text-[12px] font-bold bg-card px-1.5 rounded-full border border-line leading-relaxed",
              badgeColor,
            )}
          >
            {countLabel}
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
}
