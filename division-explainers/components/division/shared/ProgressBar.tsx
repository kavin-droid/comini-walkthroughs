"use client";

import { cn } from "@/lib/utils";
import { useMediaQuery, DESKTOP_QUERY } from "@/hooks/useMediaQuery";

export function ProgressBar({ count, idx }: { count: number; idx: number }) {
  const isDesktop = useMediaQuery(DESKTOP_QUERY);
  if (isDesktop) return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 flex gap-[3px] px-2.5 h-1 mt-1.5"
      style={{ zIndex: 60, pointerEvents: "none" }}
    >
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "flex-1 h-1 rounded-full transition-colors duration-200",
            i <= idx ? "bg-left" : "bg-line-2",
          )}
        />
      ))}
    </div>
  );
}
