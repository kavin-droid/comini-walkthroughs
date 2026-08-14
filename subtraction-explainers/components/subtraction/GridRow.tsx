"use client";

import { cn } from "@/lib/utils";
import { isPlaceCollapsed } from "@/lib/subtraction/visibility";
import type { RowKey } from "@/lib/subtraction/types";
import { useSubtraction } from "./SubtractionContext";
import { GridCell } from "./GridCell";

/** No row-label digits anymore (round-23: "remove the numbers shown within the workarea since we
 * already show it in the workingAnswer container on the left") - the numeric/arithmetic
 * representation of the problem lives solely in AnswerCard now; this row is purely the visual
 * dot/block manipulative. The highlight/compare-flash cues that used to color THIS row's digit
 * text moved to AnswerCard's own digits instead (see Grid.tsx/AnswerCard.tsx's shared countCue). */
export function GridRow({
  rowKey,
  regroupSourceRef,
  onTapRegroup,
  countCue,
}: {
  rowKey: RowKey;
  regroupSourceRef?: React.RefObject<HTMLDivElement | null>;
  onTapRegroup?: () => void;
  countCue?: { row: "take" | "start" | "compare"; index?: number } | null;
}) {
  const { config, session, phaseObj } = useSubtraction();

  return (
    <div
      className={cn(
        "flex items-center gap-2.5 px-3 py-2 rounded-2xl border w-fit self-center",
        "min-[900px]:gap-3 min-[900px]:px-[14px] min-[900px]:py-2.5",
        rowKey === "take" && "border-used bg-used-bg",
        rowKey === "result" && "border-left bg-left-bg",
        rowKey !== "take" && rowKey !== "result" && "bg-card border-line",
      )}
    >
      {config.places.map((place) => {
        const visible = !isPlaceCollapsed(place, phaseObj, session);
        const cueAppliesHere = !!countCue && place === phaseObj.place;
        const countingIndex = cueAppliesHere && countCue!.row === rowKey ? countCue!.index : undefined;
        return (
          <div
            key={place}
            aria-hidden={!visible}
            style={{
              transition: "opacity 300ms ease-in-out, max-width 300ms ease-in-out, margin-left 300ms ease-in-out",
              overflow: "hidden",
              opacity: visible ? 1 : 0,
              // 140px fits a normal (<=9 dot) cell; a cell showing a just-regrouped 10-19 count
              // needs a bit more horizontal room for its 5-per-row dot grid - see CELL_BASE's
              // matching max-width in GridCell.
              maxWidth: visible ? 260 : 0,
              marginLeft: visible ? 0 : -10,
              pointerEvents: visible ? "auto" : "none",
            }}
          >
            <GridCell
              rowKey={rowKey}
              place={place}
              regroupSourceRef={rowKey === "start" ? regroupSourceRef : undefined}
              onTapRegroup={rowKey === "start" ? onTapRegroup : undefined}
              countingIndex={countingIndex}
            />
          </div>
        );
      })}
    </div>
  );
}
