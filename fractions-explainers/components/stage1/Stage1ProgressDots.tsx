"use client";

import { cn } from "@/lib/utils";

/** Plain dots, evenly spaced - not a fraction ("3 of 12") or any other text. No grouping-by-
 * context spacing here (contrast the earlier bar/grid/jar version): the twelve steps split
 * unevenly across bar/jar/pizza/recap, so grouping by a fixed count no longer matches the real
 * structure. */
export function Stage1ProgressDots({ index, total }: { index: number; total: number }) {
  return (
    <div className="flex items-center justify-center gap-2.5 py-2 shrink-0">
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          className={cn(
            "block rounded-full transition-all duration-300",
            i === index ? "w-3 h-3 bg-accent" : i < index ? "w-2.5 h-2.5 bg-left" : "w-2.5 h-2.5 bg-line-2",
          )}
        />
      ))}
    </div>
  );
}
