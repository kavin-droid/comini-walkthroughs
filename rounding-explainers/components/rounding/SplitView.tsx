"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { SPLIT_BLOCK_TYPE } from "@/lib/rounding/steps";
import type { Place } from "@/lib/rounding/types";
import { useRounding } from "./RoundingContext";

type ColorKind = "above" | "below" | "num";

/** Column color is POSITIONAL within `config.places` (big-to-small), not a fixed mapping per
 * place name: stage2 (places=[tens,ones]) colors tens "above" and ones "num"; stage3
 * (places=[hundreds,tens,ones]) colors hundreds "above", tens "below", ones "num" - i.e. "tens"
 * is above-colored in one vanilla file and below-colored in the other, since each file's CSS
 * assigns colors to whichever place is biggest/middle/smallest on screen, not to "tens"
 * specifically. Ones is always "num" in both. */
function placeColor(place: Place, places: Place[]): ColorKind {
  if (place === "ones") return "num";
  return places.indexOf(place) === 0 ? "above" : "below";
}

const COLOR_BLOCK_BG: Record<ColorKind, string> = {
  above: "bg-above-bg border-above/30",
  below: "bg-below-bg border-below/30",
  num: "bg-num-bg border-num/30",
};
const COLOR_UNIT_BG: Record<ColorKind, string> = { above: "bg-above", below: "bg-below", num: "bg-num" };
const COLOR_LABEL: Record<ColorKind, string> = { above: "text-above", below: "text-below", num: "text-num" };
const COLOR_ONE: Record<ColorKind, string> = {
  above: "bg-above border-above/40",
  below: "bg-below border-below/40",
  num: "bg-num border-num/40",
};

function SplitBlock({ type, color }: { type: "hundred" | "ten" | "one"; color: ColorKind }) {
  if (type === "one") {
    return <div className={cn("w-[14px] h-[14px] rounded-[3px] border rd-fade-in", COLOR_ONE[color])} />;
  }
  const isHundred = type === "hundred";
  const cell = isHundred ? 4 : 8;
  const cols = isHundred ? 10 : 5;
  const rows = isHundred ? 10 : 2;
  const gap = isHundred ? 1 : 2;
  const count = isHundred ? 100 : 10;
  return (
    <div
      className={cn("grid p-[3px] rounded border rd-fade-in", COLOR_BLOCK_BG[color])}
      style={{
        gridTemplateColumns: `repeat(${cols}, ${cell}px)`,
        gridTemplateRows: `repeat(${rows}, ${cell}px)`,
        gap: `${gap}px`,
      }}
    >
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={cn("rounded-[1px]", COLOR_UNIT_BG[color])} />
      ))}
    </div>
  );
}

/** Ported from `renderSplit()`: tapping a place's digit shows that many unit blocks for 2s, then
 * fades out over 0.3s before clearing (see `showSplitPreview`'s 2000ms/320ms timers). */
export function SplitView() {
  const { config, step } = useRounding();
  const [preview, setPreview] = useState<{ place: Place; visible: boolean } | null>(null);
  const timers = useRef<number[]>([]);
  const is3Col = config.places.length === 3;

  useEffect(() => {
    return () => {
      timers.current.forEach((t) => window.clearTimeout(t));
      timers.current = [];
    };
  }, []);

  const values: Record<Place, number> = { hundreds: step.hundreds, tens: step.tens, ones: step.ones };

  function handleTap(place: Place) {
    if (!values[place]) return;
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
    setPreview({ place, visible: true });
    const t1 = window.setTimeout(() => {
      setPreview((p) => (p ? { ...p, visible: false } : p));
      const t2 = window.setTimeout(() => setPreview(null), 320);
      timers.current.push(t2);
    }, 2000);
    timers.current.push(t1);
  }

  return (
    <div className="flex flex-col items-center gap-4 p-2">
      <div className="text-center">
        <div className="font-mono text-[10px] tracking-[2px] uppercase text-ink-3 mb-1">the number</div>
        <div
          className={cn(
            "font-serif font-medium text-ink leading-none",
            is3Col ? "text-[34px] min-[900px]:text-[42px]" : "text-[38px] min-[900px]:text-[46px]",
          )}
        >
          {step.n}
        </div>
      </div>

      <div className={cn("flex", is3Col ? "gap-2.5 max-[380px]:gap-1.5" : "gap-3.5")}>
        {config.places.map((place) => {
          const isHi = step.highlightDecision && step.decisionPlace === place;
          const color = placeColor(place, config.places);
          // See placeColor's note above: stage3's `.split-col.hi .split-col-digit` rule is
          // unconditionally accent-red regardless of place; stage2's is per-place (num/above) -
          // but stage2 only ever highlights "ones" (num) in practice, so this reproduces both
          // vanilla files' real rendered output exactly.
          const digitHiClass = is3Col
            ? "text-accent"
            : color === "num"
              ? "text-num"
              : "text-above";
          return (
            <button
              key={place}
              type="button"
              onClick={() => handleTap(place)}
              className={cn(
                "flex flex-col items-center gap-1.5 rounded-2xl border-[1.5px] transition-all duration-[250ms]",
                is3Col
                  ? "min-w-[66px] px-[13px] pt-2.5 pb-2 min-[900px]:min-w-[84px] min-[900px]:px-[18px] min-[900px]:pt-3.5 min-[900px]:pb-3 max-[380px]:min-w-[58px] max-[380px]:px-2 max-[380px]:pt-2 max-[380px]:pb-1.5"
                  : "min-w-20 px-4 pt-3 pb-2.5 min-[900px]:min-w-24 min-[900px]:px-5 min-[900px]:pt-4 min-[900px]:pb-3.5",
                isHi
                  ? "border-accent bg-card shadow-[0_0_0_4px_rgba(200,68,62,0.08)]"
                  : "border-transparent bg-paper-2",
              )}
            >
              <div
                className={cn(
                  "font-mono uppercase",
                  is3Col ? "text-[9px] tracking-[1.5px]" : "text-[10px] tracking-[2px]",
                  isHi && "font-bold",
                  COLOR_LABEL[color],
                )}
              >
                {place}
              </div>
              <div
                className={cn(
                  "font-serif font-semibold leading-none text-ink",
                  is3Col
                    ? "text-[30px] min-[900px]:text-[38px] max-[380px]:text-[26px]"
                    : "text-[36px] min-[900px]:text-[44px]",
                  isHi && digitHiClass,
                )}
              >
                {values[place]}
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-1.5 justify-center items-center min-h-0">
        {preview && (
          <div
            className={cn(
              "flex flex-wrap gap-1.5 justify-center items-center transition-opacity duration-300",
              preview.visible ? "opacity-100" : "opacity-0",
            )}
          >
            {Array.from({ length: values[preview.place] }).map((_, i) => (
              <SplitBlock
                key={i}
                type={SPLIT_BLOCK_TYPE[preview.place]}
                color={placeColor(preview.place, config.places)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
