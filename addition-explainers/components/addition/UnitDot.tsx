"use client";

import { cn } from "@/lib/utils";
import type { Place } from "@/lib/addition/types";
import type { HTMLAttributes } from "react";

interface UnitDotProps extends HTMLAttributes<HTMLDivElement> {
  place: Place;
  ghost?: boolean;
  glow?: boolean;
  draggable?: boolean;
  /** Drops this dot's own border, keeping only its fill - for when it's shown as one of several
   * "contents" inside an already-outlined container (the pack highlight box), where each item's
   * own border reads as visual clutter stacked on top of the container's own outline. */
  noOutline?: boolean;
}

const TEN_UNITS = Array.from({ length: 10 });
const HUNDRED_UNITS = Array.from({ length: 100 });

export function UnitDot({
  place,
  ghost,
  glow,
  draggable,
  noOutline,
  className,
  style,
  ...rest
}: UnitDotProps) {
  const draggableProps = draggable
    ? {
        style: { touchAction: "none" as const, ...style },
        className: cn("cursor-grab active:cursor-grabbing"),
      }
    : { style };

  if (place === "ones") {
    return (
      <div
        {...rest}
        style={draggableProps.style}
        className={cn(
          "w-[15px] h-[15px] rounded-[3px] border transition-transform min-[900px]:w-[22px] min-[900px]:h-[22px]",
          ghost ? "bg-transparent border-2 border-one/60" : "bg-one border-one/40",
          glow && "animate-pulse",
          noOutline && "border-0",
          draggableProps.className,
          className,
        )}
      />
    );
  }

  if (place === "tens") {
    return (
      <div
        {...rest}
        style={draggableProps.style}
        className={cn(
          "grid grid-cols-5 grid-rows-2 gap-[1px] p-[3px] rounded min-[900px]:gap-[2px] min-[900px]:p-[5px]",
          ghost ? "bg-transparent border border-ten/65" : "bg-ten-bg border border-ten/30",
          glow && "animate-pulse",
          noOutline && "border-0",
          draggableProps.className,
          className,
        )}
      >
        {TEN_UNITS.map((_, i) => (
          <div
            key={i}
            className={cn(
              "w-[6px] h-[6px] rounded-[1px] min-[900px]:w-[9px] min-[900px]:h-[9px]",
              ghost ? "bg-transparent border-[1.5px] border-ten/65" : "bg-ten",
            )}
          />
        ))}
      </div>
    );
  }

  // hundreds - a real 10x10 grid of tiny units, same pattern as tens scaled up (not a solid
  // textured block) - matches the vanilla app's actual DOM structure exactly.
  return (
    <div
      {...rest}
      style={draggableProps.style}
      className={cn(
        "grid grid-cols-10 grid-rows-10 gap-[1px] p-[3px] rounded min-[900px]:p-[5px]",
        ghost
          ? "bg-transparent border border-hundred/65"
          : "bg-hundred-bg border border-hundred/30",
        glow && "animate-pulse",
        noOutline && "border-0",
        draggableProps.className,
        className,
      )}
    >
      {HUNDRED_UNITS.map((_, i) => (
        <div
          key={i}
          className={cn(
            "w-[2px] h-[2px] rounded-[1px] min-[900px]:w-[3px] min-[900px]:h-[3px]",
            ghost ? "bg-transparent border-[1.5px] border-hundred/65" : "bg-hundred",
          )}
        />
      ))}
    </div>
  );
}
