"use client";

import { LayoutGroup, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Unit } from "./Unit";
import { LabeledColumn } from "./LabeledColumn";

/** How long the packed -> scaffold spacing transition takes to play out - quiz views wait this
 * long before showing answer options, so the child watches the spacing change happen instead of
 * seeing it and the question appear at the same instant. */
export const SPACING_TRANSITION_MS = 550;

const UNIT_W = 13;
const GROUP_INNER_GAP = 3;
const GROUP_UNBOXED_W = 5 * UNIT_W + 4 * GROUP_INNER_GAP; // 77
const GROUP_BOXED_W = GROUP_UNBOXED_W + 2 * 3 + 2 * 1.5; // + padding (p-[3px]) + border ([1.5px]) = 86
/** Bounds every row to exactly 2 groups (10 units) - the same "10 per row" arrangement as the
 * loose step's plain grid (`UnitsFieldView`'s `LooseUnitsGrid`), so nothing suddenly reflows into
 * a different shape between adjacent steps. Sized between the largest "2 boxed groups at
 * scaffold gap" width (186) and the smallest "3 boxed groups at scaffold gap" width (286) so it
 * holds at exactly 2 across every boxed/unboxed x packed/scaffold combination - see
 * widestRowWidth's own doc comment for why a bound is needed at all instead of relying on
 * `maxWidth`/`fit-content`. Not a coincidence: at packed gap with unboxed groups, 2 groups + 1
 * gap = 157px, exactly matching `LooseUnitsGrid`'s `10 * 13 + 9 * 3 = 157px` row width - the two
 * layouts are pixel-identical where they should be. */
const MAX_ROW_WIDTH = 200;

/** Simulates the browser's own greedy flex-wrap algorithm (pack left-to-right, wrap on overflow)
 * to find the widest row, so the container can be given that *exact* width instead of a fixed
 * `maxWidth` with slack. A `maxWidth`-only container is wider than most rows' actual content, so
 * flex-wrap's default left-alignment leaves the visible content sitting flush left inside a
 * wider box - a `width: fit-content` container doesn't fix this either, since intrinsic sizing is
 * based on the *unwrapped* (single-row) content width, not the post-wrap row width. Computing the
 * exact width here keeps every row's content genuinely left-aligned (not per-row centered, which
 * would misalign uneven rows against each other) while the box itself, now sized to fit, ends up
 * visually centered whenever an ancestor centers it. */
function widestRowWidth(itemWidths: number[], gap: number, maxWidth: number): number {
  let rowWidth = 0;
  let widest = 0;
  for (const w of itemWidths) {
    const next = rowWidth === 0 ? w : rowWidth + gap + w;
    if (next > maxWidth && rowWidth > 0) {
      widest = Math.max(widest, rowWidth);
      rowWidth = w;
    } else {
      rowWidth = next;
    }
  }
  return Math.max(widest, rowWidth);
}

export interface TensGroupsFieldProps {
  tens: number;
  ones: number;
  /** "packed": groups sit flush against each other (reads as one undivided field, uniform
   * spacing throughout - no group has any extra padding/border reserved unless it's boxed).
   * "scaffold": extra gap opens up between groups so the grouping is visible from spacing alone,
   * before any box is drawn. */
  spacing: "packed" | "scaffold";
  /** How many groups (counting from the left) currently show an outline box. */
  boxedGroups: number;
  /** Whether boxed groups show their running count (1, 2, 3...) - off for the pre-quiz
   * highlight step (an outline only, so the count isn't given away before it's asked), on for
   * the post-answer reveal. Defaults to true. */
  boxLabels?: boolean;
  /** Custom text tag shown on group 0 instead of a numeric count - used for the "here's an
   * example" introduction step, before anything has been asked or answered. */
  exampleTag?: string;
  /** "inline": the leftover ones sit at the tail of the same field, ungrouped. "column": a
   * separate "ones" column is shown to the right; `onesArrived` of the leftover ones have
   * migrated into it (the rest still render inline) - both renders share a `layoutId` per unit,
   * so toggling this triggers a real fly-over animation, one unit at a time as `onesArrived`
   * increments. Once ones are in their column, the tens groups automatically get the same
   * bordered/labeled/counted treatment (see LabeledColumn) - the two always match. */
  onesPlacement: "inline" | "column";
  onesArrived?: number;
  /** Distinguishes concurrent instances so shared `layoutId`s never collide across steps. */
  layoutKey: string;
  className?: string;
}

/** Stage 2's core visual: a wrapping field of 2x5 unit groups (one group per ten), with
 * independently controllable inter-group spacing and per-group box reveal, plus a real
 * fly-to-column animation for leftover ones. */
export function TensGroupsField({
  tens,
  ones,
  spacing,
  boxedGroups,
  boxLabels = true,
  exampleTag,
  onesPlacement,
  onesArrived = 0,
  layoutKey,
  className,
}: TensGroupsFieldProps) {
  const arrived = onesPlacement === "column" ? Math.min(onesArrived, ones) : 0;
  const inlineIdxs = Array.from({ length: ones }, (_, i) => i).filter((i) => i >= arrived);
  const columnIdxs = Array.from({ length: arrived }, (_, i) => i);
  const settled = onesPlacement === "column";
  const gap = spacing === "scaffold" ? 14 : 3;
  const itemWidths = [
    ...Array.from({ length: tens }, (_, g) => (g < boxedGroups ? GROUP_BOXED_W : GROUP_UNBOXED_W)),
    ...inlineIdxs.map(() => UNIT_W),
  ];
  const rowWidth = widestRowWidth(itemWidths, gap, MAX_ROW_WIDTH);

  const groupsWrap = (
    <div
      className="flex flex-wrap items-start transition-[gap] duration-500 ease-out"
      style={{ gap, width: rowWidth }}
    >
      {Array.from({ length: tens }, (_, g) => {
        const boxed = g < boxedGroups;
        const showTag = boxed && !!exampleTag && g === 0;
        return (
          <div
            key={`group-${g}`}
            className={cn(
              "relative grid grid-cols-5 grid-rows-2 gap-[3px] rounded-md transition-all duration-300",
              boxed ? "border-[1.5px] border-tens bg-tens/10 p-[3px]" : "border-0 p-0",
            )}
          >
            {showTag && (
              <div className="absolute -top-[13px] left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-tens px-2 py-0.5 font-mono text-[10px] font-bold tracking-wide text-card">
                {exampleTag}
              </div>
            )}
            {!showTag && boxed && boxLabels && (
              <div className="absolute -top-[11px] left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-tens px-2 py-0.5 font-mono text-[10px] font-bold tracking-wide text-card">
                {g + 1}
              </div>
            )}
            {Array.from({ length: 10 }, (_, i) => (
              <motion.div key={i} layout layoutId={`${layoutKey}-t-${g * 10 + i}`}>
                <Unit />
              </motion.div>
            ))}
          </div>
        );
      })}

      {inlineIdxs.map((idx) => (
        <motion.div key={`one-${idx}`} layout layoutId={`${layoutKey}-o-${idx}`}>
          <Unit />
        </motion.div>
      ))}
    </div>
  );

  return (
    <LayoutGroup id={layoutKey}>
      <div className={cn("flex items-start gap-5", className)}>
        {settled ? (
          <LabeledColumn place="tens" count={tens}>
            {groupsWrap}
          </LabeledColumn>
        ) : (
          groupsWrap
        )}

        {onesPlacement === "column" && (
          <LabeledColumn place="ones" count={arrived}>
            <div className="flex min-h-[16px] flex-wrap justify-center gap-1">
              {columnIdxs.map((idx) => (
                <motion.div key={`one-${idx}`} layout layoutId={`${layoutKey}-o-${idx}`}>
                  <Unit />
                </motion.div>
              ))}
            </div>
          </LabeledColumn>
        )}
      </div>
    </LayoutGroup>
  );
}
