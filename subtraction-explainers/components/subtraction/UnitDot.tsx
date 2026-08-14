"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils";
import type { Place } from "@/lib/subtraction/types";

interface UnitDotProps {
  place: Place;
  ghost?: boolean;
  tappable?: boolean;
  id?: string;
  onClick?: () => void;
}

const TEN_UNITS = Array.from({ length: 10 });
const HUNDRED_UNITS = Array.from({ length: 100 });

/** One place-value block. 'tens' is always a 5x2 grid of 6px units (the "2x5 tens pack"), same
 * exact markup/size for both stages - do not substitute a 1x10 rod or any other arrangement.
 *
 * A "ghost" (already-removed) tens/hundreds block only outlines the OUTER pack boundary - the
 * individual sub-units inside stay plain `bg-transparent` with no border of their own. Outlining
 * every one of the 10/100 tiny sub-cells as well reads as a grid of small boxes rather than "one
 * empty pack", which is both visually noisy and not what a single removed block should look like. */
export const UnitDot = forwardRef<HTMLDivElement, UnitDotProps>(function UnitDot(
  { place, ghost, tappable, id, onClick },
  ref,
) {
  // `data-tappable` (not the generic `cursor-pointer` utility class, which other unrelated
  // controls like ModeToggle also use) is what HandHint's target selector queries - a shared
  // styling class is not a safe hook for "find the ONE thing the child should tap".
  if (place === "ones") {
    return (
      <div
        ref={ref}
        id={id}
        data-tappable={tappable || undefined}
        onClick={onClick}
        className={cn(
          "w-4 h-4 rounded-[3px] border transition-transform active:scale-90",
          ghost ? "bg-transparent border-2 border-one/60" : "bg-one border-one/40",
          tappable && "cursor-pointer animate-bounce-block",
        )}
      />
    );
  }

  if (place === "tens") {
    return (
      <div
        ref={ref}
        id={id}
        data-tappable={tappable || undefined}
        onClick={onClick}
        className={cn(
          "grid grid-cols-5 grid-rows-2 gap-[1px] p-[3px] rounded transition-transform active:scale-90",
          ghost ? "bg-transparent border-[1.5px] border-ten/65" : "bg-ten-bg border border-ten/30",
          tappable && "cursor-pointer animate-bounce-block",
        )}
      >
        {TEN_UNITS.map((_, i) => (
          <div key={i} className={cn("w-[6px] h-[6px] rounded-[1px]", ghost ? "bg-transparent" : "bg-ten")} />
        ))}
      </div>
    );
  }

  // hundreds - a real 10x10 grid of tiny units, matching the tens/ones pattern scaled up.
  return (
    <div
      ref={ref}
      id={id}
      data-tappable={tappable || undefined}
      onClick={onClick}
      className={cn(
        "grid grid-cols-10 grid-rows-10 gap-[1px] p-[3px] rounded transition-transform active:scale-90",
        ghost ? "bg-transparent border-[1.5px] border-hundred/65" : "bg-hundred-bg border border-hundred/30",
        tappable && "cursor-pointer animate-bounce-block",
      )}
    >
      {HUNDRED_UNITS.map((_, i) => (
        <div key={i} className={cn("w-[2px] h-[2px] rounded-[1px]", ghost ? "bg-transparent" : "bg-hundred")} />
      ))}
    </div>
  );
});
