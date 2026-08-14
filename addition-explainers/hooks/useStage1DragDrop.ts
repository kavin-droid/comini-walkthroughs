"use client";

import { useCallback, useState } from "react";

export type Stage1DragSet = "A" | "B";

export interface Stage1DragCloneState {
  set: Stage1DragSet;
  color: string;
  width: number;
  height: number;
  left: number;
  top: number;
}

interface UseStage1DragDropOptions {
  /** `index` is the specific dot's position within its cluster - threaded through from
   * onPointerDown so the caller can ghost the EXACT dot that was dragged, not just decrement a
   * count (see Stage1Scene - a count-only signal can't tell "dot 0" from "dot 2", so whichever
   * dots happened to be first by array index used to disappear regardless of which one the
   * child actually dragged). */
  onCommit: (set: Stage1DragSet, index: number) => void;
}

/** Single-drop-zone version of the addition app's useDragDrop (see components/addition -
 * same clone-and-follow Pointer Events mechanic, ported down to Stage 1's simpler case: one
 * drop target (the answer box, `[data-stage1-drop="box"]`), one item "type" per set (just a
 * color, no Place/RowKey typing needed). */
export function useStage1DragDrop({ onCommit }: UseStage1DragDropOptions) {
  const [clone, setClone] = useState<Stage1DragCloneState | null>(null);

  const onPointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>, set: Stage1DragSet, color: string, index: number) => {
      e.preventDefault();
      const el = e.currentTarget;
      const rect = el.getBoundingClientRect();
      const startX = e.clientX;
      const startY = e.clientY;

      el.style.visibility = "hidden";
      setClone({ set, color, width: rect.width, height: rect.height, left: rect.left, top: rect.top });

      function onMove(ev: PointerEvent) {
        const dx = ev.clientX - startX;
        const dy = ev.clientY - startY;
        setClone((c) => (c ? { ...c, left: rect.left + dx, top: rect.top + dy } : c));
      }

      function onUp(ev: PointerEvent) {
        document.removeEventListener("pointermove", onMove);
        document.removeEventListener("pointerup", onUp);
        const target = document.elementFromPoint(ev.clientX, ev.clientY);
        const dropped = target?.closest('[data-stage1-drop="box"]');
        el.style.removeProperty("visibility");
        if (dropped) {
          onCommit(set, index);
        }
        setClone(null);
      }

      document.addEventListener("pointermove", onMove);
      document.addEventListener("pointerup", onUp);
    },
    [onCommit],
  );

  return { clone, onPointerDown };
}
