"use client";

import { cn } from "@/lib/utils";
import type { GhostedIndices, Place, RowKey } from "@/lib/addition/types";
import type { PackAnimState } from "@/hooks/usePackAnimation";
import { isColumnOpen } from "@/lib/addition/visibility";
import { useAddition } from "./AdditionContext";
import { GridCell } from "./GridCell";

/** No more per-row digit label - the "arithmetic representation" (the addends' and total's own
 * digits) now lives entirely in WorkingAnswerPanel, to the left of this grid. This row is purely
 * the "visual representation": one cell per place, dots/packs only. */
export function GridRow({
  rowKey,
  packAnim = null,
  ghostedIndices,
  previewPlace = null,
}: {
  rowKey: RowKey;
  packAnim?: PackAnimState | null;
  ghostedIndices?: GhostedIndices;
  /** The pack sequence's destination place, while that sequence is running - opens this place's
   * column too (a contextual backdrop, see AdditionGrid) even though it isn't genuinely visible
   * yet, so GridCell renders it at reduced opacity via the `dimmed` prop below. */
  previewPlace?: Place | null;
}) {
  const { config, phaseObj, session } = useAddition();

  return (
    <div
      className={cn(
        "flex items-center gap-2.5 px-3 py-2 rounded-2xl border",
        "min-[900px]:gap-3 min-[900px]:px-5 min-[900px]:py-2",
        rowKey === "total" ? "border-sum bg-sum-bg" : "bg-card border-line",
      )}
    >
      {config.places.map((place) => {
        const genuinelyVisible = isColumnOpen(place, phaseObj, config, session);
        const isPreview = place === previewPlace;
        const visible = genuinelyVisible || isPreview;
        return (
          <div
            key={place}
            aria-hidden={!visible}
            style={{
              transition: "opacity 300ms ease-in-out, max-width 300ms ease-in-out, margin-left 300ms ease-in-out",
              overflow: "hidden",
              opacity: visible ? 1 : 0,
              maxWidth: visible ? 200 : 0,
              marginLeft: visible ? 0 : -10,
              pointerEvents: visible ? "auto" : "none",
            }}
          >
            <GridCell
              rowKey={rowKey}
              place={place}
              packAnim={packAnim}
              ghostedIndices={ghostedIndices}
              dimmed={isPreview && !genuinelyVisible}
            />
          </div>
        );
      })}
    </div>
  );
}
