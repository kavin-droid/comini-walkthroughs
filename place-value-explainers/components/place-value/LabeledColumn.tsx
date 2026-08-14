"use client";

import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

const COLOR_CLASSES = {
  hundreds: { border: "border-hundreds", bg: "bg-hundreds-bg", text: "text-hundreds" },
  tens: { border: "border-tens", bg: "bg-tens-bg", text: "text-tens" },
  ones: { border: "border-ones", bg: "bg-ones-bg", text: "text-ones" },
} as const;

const PLACE_LABEL = {
  hundreds: "Hundreds",
  tens: "Tens",
  ones: "Ones",
} as const;

/** One shared bordered/labeled container used for every settled place-value column (hundreds,
 * tens, ones) across both stages - guarantees the three always look identical (heading with the
 * count in brackets, then content) instead of drifting into inconsistent one-off styling. */
export function LabeledColumn({
  place,
  count,
  children,
}: {
  place: "hundreds" | "tens" | "ones";
  count: number;
  children: ReactNode;
}) {
  const c = COLOR_CLASSES[place];
  return (
    <div
      className={cn(
        "flex min-w-[64px] flex-col items-center gap-1.5 rounded-xl border-[1.5px] px-3 py-2",
        c.border,
        c.bg,
      )}
    >
      <div className={cn("font-mono text-[11px] font-bold tracking-wide", c.text)}>
        {PLACE_LABEL[place]} ({count})
      </div>
      {children}
    </div>
  );
}
