import { cn } from "@/lib/utils";
import type { CompareOrderConfig, NumItem } from "@/lib/compare-order/types";

interface TrackRowProps {
  placed: NumItem[];
  total: number;
  sizing: CompareOrderConfig["sizing"];
  isNarrow: boolean;
}

export function TrackRow({ placed, total, sizing, isNarrow }: TrackRowProps) {
  const slotMinWidth = isNarrow ? sizing.trackSlotMinWidthNarrow : sizing.trackSlotMinWidth;
  const slotFontSize = isNarrow ? sizing.trackSlotFontSizeNarrow : sizing.trackSlotFontSize;
  const slotHeight = isNarrow ? 42 : 48;

  const cells: React.ReactNode[] = [];
  for (let i = 0; i < total; i++) {
    if (i > 0) {
      const isSet = i < placed.length;
      const isEq = isSet && placed[i - 1].value === placed[i].value;
      cells.push(
        <div
          key={`sym-${i}`}
          className={cn(
            "font-mono font-bold animate-fade-in",
            isSet ? (isEq ? "text-ten" : "text-ink-3") : "text-line-2",
          )}
          style={{ fontSize: slotFontSize }}
        >
          {isSet ? (isEq ? "=" : "<") : "·"}
        </div>,
      );
    }
    const filled = i < placed.length;
    cells.push(
      <div
        key={`slot-${i}`}
        className={cn(
          "flex items-center justify-center rounded-xl px-2.5 font-mono font-bold",
          filled
            ? "border-2 border-sum bg-card text-ink animate-track-slot-in"
            : "border-2 border-dashed border-line-2 bg-paper-2 text-ink-3",
        )}
        style={{ minWidth: slotMinWidth, height: slotHeight, fontSize: slotFontSize }}
      >
        {filled ? placed[i].value : ""}
      </div>,
    );
  }

  return <div className="flex flex-wrap gap-2.5 justify-center items-center">{cells}</div>;
}
