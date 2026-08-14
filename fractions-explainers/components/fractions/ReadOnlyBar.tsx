"use client";

import { cn } from "@/lib/utils";

/** A static, already-shaded `cellCount`-cell bar, all one `color` - used to show a previously
 * answered piece alongside a currently-interactive bar (TapQuartersView's `referenceBar`,
 * TapCombineView's two recap bars), never itself tappable. `compact` matches the app's existing
 * primary/secondary strip height convention (StripView's main strip vs. its "halves" overlay). */
export function ReadOnlyBar({
  cellCount,
  shaded,
  color,
  caption,
  compact = false,
}: {
  cellCount: number;
  shaded: number;
  color: string;
  caption: string;
  compact?: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div
        className={cn(
          "flex w-[280px] max-w-[78vw] max-[380px]:w-[240px] rounded-[10px] overflow-hidden border-2",
          compact ? "h-11" : "h-16",
        )}
        style={{
          borderColor: "var(--color-choco-dark)",
          boxShadow: "inset 0 2px 3px rgba(255,255,255,0.12), inset 0 -3px 5px rgba(0,0,0,0.25)",
        }}
      >
        {Array.from({ length: cellCount }).map((_, i) => (
          <div
            key={i}
            className={cn("flex-1", i < cellCount - 1 && "border-r-[3px]")}
            style={{
              borderColor: "var(--color-choco-dark)",
              background:
                i < shaded ? color : "linear-gradient(155deg, var(--color-choco-2), var(--color-choco) 60%)",
            }}
          />
        ))}
      </div>
      <div className="font-mono text-[10px] tracking-[1.5px] uppercase text-ink-3">{caption}</div>
    </div>
  );
}
