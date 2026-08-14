"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface CalloutPiece {
  key: string;
  text: string;
  delayMs: number;
  strong?: boolean;
  muted?: boolean;
  /** Renders immediately with no fade-in - matches the vanilla apps' leading, unwrapped
   * "N =" text that isn't a `.callout-piece` itself. */
  instant?: boolean;
}

/** Shared shell for the vanilla apps' `.pv-callout` / `.pv-callout.numeric` boxes: a staggered
 * fade-in sentence built from typed pieces, used for both the "N = x tens + y ones" decompose
 * callout (tens-tinted) and the "10x + y = N" expanded-form callout (ones-tinted). */
export function Callout({ pieces, numeric }: { pieces: CalloutPiece[]; numeric?: boolean }) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-baseline justify-center gap-2 rounded-xl border px-[18px] py-[9px] text-center font-serif text-[16px] italic text-ink",
        numeric ? "bg-ones-bg border-ones/25" : "bg-tens-bg border-tens/20",
      )}
    >
      {pieces.map((p) =>
        p.instant ? (
          <span key={p.key}>{p.text}</span>
        ) : (
          <motion.span
            key={p.key}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.35, delay: p.delayMs / 1000 }}
            className={cn(
              p.muted && "font-light not-italic text-ink-3",
              p.strong &&
                cn("font-mono not-italic font-bold", numeric ? "text-ones" : "text-tens"),
            )}
          >
            {p.text}
          </motion.span>
        ),
      )}
    </div>
  );
}
