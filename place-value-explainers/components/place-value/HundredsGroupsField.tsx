"use client";

import { cn } from "@/lib/utils";
import { TenPack } from "./TenPack";
import { Unit } from "./Unit";

/** Fits exactly 5 ten-packs per row (49px pack + 8px gap). */
const GRID_WIDTH = 280;

export interface HundredsGroupsFieldProps {
  /** Total ten-packs in the field (n / 10, i.e. all tens including ones already folded off). */
  totalTens: number;
  /** Rendered to the right of the ten-packs, plain and unlabeled - stage 3 has no separate
   * "ones" column until the hundreds are confirmed, matching stage 2's UnitsFieldView. */
  ones: number;
  /** Wraps the first ten ten-packs (one hundred) in a bordered, background-filled container so
   * the example group reads clearly as "this is one group". */
  highlightFirst?: boolean;
  exampleTag?: string;
  className?: string;
}

/** Stage 3's loose/highlight arrangement: a tidy 5-column grid of ten-packs (not a flowing wrap,
 * so every row lines up), with any leftover ones trailing to the right, unlabeled. When
 * `highlightFirst` is set, the first hundred (10 packs = 2 rows) sits in its own bordered,
 * background-filled block, set apart from the rest by a gap - column alignment is preserved
 * because both blocks share the same column count and width. */
export function HundredsGroupsField({
  totalTens,
  ones,
  highlightFirst = false,
  exampleTag,
  className,
}: HundredsGroupsFieldProps) {
  const showHighlightBlock = highlightFirst && totalTens >= 10;
  const highlightCount = showHighlightBlock ? 10 : 0;
  const restCount = totalTens - highlightCount;

  return (
    <div className={cn("flex items-start gap-6", className)}>
      <div className="flex flex-col gap-3" style={{ width: GRID_WIDTH }}>
        {showHighlightBlock && (
          <div className="relative grid grid-cols-5 gap-2 rounded-lg border-[1.5px] border-hundreds bg-hundreds-bg p-2">
            {exampleTag && (
              <div className="absolute -top-[13px] left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-hundreds px-2 py-0.5 font-mono text-[10px] font-bold tracking-wide text-card">
                {exampleTag}
              </div>
            )}
            {Array.from({ length: highlightCount }, (_, i) => (
              <TenPack key={i} />
            ))}
          </div>
        )}
        {restCount > 0 && (
          <div
            className={cn(
              "grid grid-cols-5 gap-2 rounded-lg border-[1.5px] border-transparent",
              showHighlightBlock && "p-2",
            )}
          >
            {Array.from({ length: restCount }, (_, i) => (
              <TenPack key={i} />
            ))}
          </div>
        )}
      </div>

      <div className="flex max-w-[100px] flex-wrap content-start gap-1 pt-1">
        {Array.from({ length: ones }, (_, i) => (
          <Unit key={`one-${i}`} size={12} />
        ))}
      </div>
    </div>
  );
}
