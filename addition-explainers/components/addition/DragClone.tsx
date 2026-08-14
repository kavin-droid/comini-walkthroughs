"use client";

import { createPortal } from "react-dom";
import type { DragCloneState } from "@/hooks/useDragDrop";
import { UnitDot } from "./UnitDot";

/** Rendered via a portal to document.body so it escapes the workspace's own CSS `transform:
 * scale(...)` (from useFitWorkspace) - a transformed ancestor creates a new containing block
 * for `position: fixed` descendants, which would otherwise break the clone's viewport-relative
 * dragging. Same reason the vanilla apps append their clone to document.body directly. */
export function DragClone({ clone }: { clone: DragCloneState | null }) {
  if (!clone || typeof document === "undefined") return null;

  return createPortal(
    <div
      style={{
        position: "fixed",
        left: clone.left,
        top: clone.top,
        width: clone.width,
        height: clone.height,
        pointerEvents: "none",
        zIndex: 999,
        filter: "drop-shadow(0 8px 18px rgba(42,31,20,0.28))",
      }}
    >
      <UnitDot place={clone.place} className="w-full h-full" />
    </div>,
    document.body,
  );
}
