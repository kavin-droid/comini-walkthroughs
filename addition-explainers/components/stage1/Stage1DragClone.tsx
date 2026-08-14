"use client";

import { createPortal } from "react-dom";
import type { Stage1DragCloneState } from "@/hooks/useStage1DragDrop";

/** Portaled to document.body so it escapes the workspace's own CSS `transform: scale(...)` -
 * same reasoning as the addition app's DragClone. */
export function Stage1DragClone({ clone }: { clone: Stage1DragCloneState | null }) {
  if (!clone || typeof document === "undefined") return null;

  return createPortal(
    <div
      style={{
        position: "fixed",
        left: clone.left,
        top: clone.top,
        width: clone.width,
        height: clone.height,
        borderRadius: "9999px",
        background: clone.color,
        border: `3px solid ${clone.color}`,
        pointerEvents: "none",
        zIndex: 999,
        filter: "drop-shadow(0 8px 18px rgba(42,31,20,0.28))",
      }}
    />,
    document.body,
  );
}
