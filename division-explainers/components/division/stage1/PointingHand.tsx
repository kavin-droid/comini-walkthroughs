"use client";

/** A nudging finger hovering over whatever should be DRAGGED next - the single most important
 * annotation in stage1, since it's the only thing telling a pre-reader "pick this up and carry it"
 * with zero text. Same diagonal drag-hint-nudge language as stage3's unpack-phase hand hint (a
 * small repeated nudge reads as "drag", not "tap"), and glides (CSS transition on left/top) to the
 * next active item rather than teleporting, so the child can actually follow "now it's this one"
 * as it happens. */
export function PointingHand({ x, y }: { x: number; y: number }) {
  return (
    <div
      className="absolute text-[32px] leading-none pointer-events-none select-none"
      style={{
        left: x,
        top: y,
        transform: "translate(-50%, -100%)",
        transition: "left 0.4s ease, top 0.4s ease",
        animation: "drag-hint-nudge 1s ease-in-out infinite",
      }}
      aria-hidden="true"
    >
      👆
    </div>
  );
}
