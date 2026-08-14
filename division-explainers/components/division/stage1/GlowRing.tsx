"use client";

import { cn } from "@/lib/utils";

/** A soft pulsing amber ring marking "this one" - wraps a pile item to say "tap me" during
 * distribute, or wraps every tray at once (synchronized, no delay) at celebrate to say "look, the
 * same" without a single word. Positioned in absolute canvas coordinates. */
export function GlowRing({ x, y, size, delayMs = 0 }: { x: number; y: number; size: number; delayMs?: number }) {
  return (
    <div
      className={cn("absolute rounded-full border-[3px] pointer-events-none", "border-[var(--color-s1-glow)]")}
      style={{
        left: x,
        top: y,
        width: size,
        height: size,
        transform: "translate(-50%, -50%)",
        transition: "left 0.4s ease, top 0.4s ease",
        animation: "glow-pulse 1.3s ease-in-out infinite",
        animationDelay: `${delayMs}ms`,
      }}
      aria-hidden="true"
    />
  );
}
