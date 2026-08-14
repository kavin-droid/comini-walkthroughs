"use client";

import { useCallback, useState } from "react";
import type { Place, RowKey } from "@/lib/addition/types";

export interface DragCloneState {
  place: Place;
  width: number;
  height: number;
  left: number;
  top: number;
}

interface UseDragDropOptions {
  /** `index` is the specific dot's position within its own addend row - threaded through from
   * onPointerDown so the caller can ghost the EXACT dot dragged, not just decrement a count (see
   * AdditionGrid - a count-only signal can't tell "dot 0" from "dot 2", so whichever dots
   * happened to be first by array index used to disappear regardless of which one was actually
   * dragged - the same bug class fixed for Stage 1's dots). */
  onCommit: (place: Place, rowKey: RowKey, index: number) => void;
}

/** Custom Pointer Events drag implementation, ported from the vanilla apps' proven mechanic:
 * on pointerdown, clone the dot visually (tracked in React state, rendered via a fixed-position
 * portal to escape the scaled workspace's transform), hide the original in place (a direct DOM
 * mutation - not React state - since it must happen synchronously without waiting on a render,
 * and gets naturally overwritten by the next real re-render regardless of outcome), then on
 * pointerup validate the drop via elementFromPoint + closest() against the SAME place's total
 * cell. No native HTML5 DnD, no drag library - deliberately, see the migration plan's rationale
 * (single drop target, single item type; the library's collision engine adds nothing here). */
export function useDragDrop({ onCommit }: UseDragDropOptions) {
  const [clone, setClone] = useState<DragCloneState | null>(null);

  const onPointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>, place: Place, rowKey: RowKey, index: number) => {
      e.preventDefault();
      const el = e.currentTarget;
      const rect = el.getBoundingClientRect();
      const startX = e.clientX;
      const startY = e.clientY;

      el.style.visibility = "hidden";
      setClone({ place, width: rect.width, height: rect.height, left: rect.left, top: rect.top });

      function onMove(ev: PointerEvent) {
        const dx = ev.clientX - startX;
        const dy = ev.clientY - startY;
        setClone((c) => (c ? { ...c, left: rect.left + dx, top: rect.top + dy } : c));
      }

      function onUp(ev: PointerEvent) {
        document.removeEventListener("pointermove", onMove);
        document.removeEventListener("pointerup", onUp);
        const target = document.elementFromPoint(ev.clientX, ev.clientY);
        const dropCell = target?.closest(`[data-row="total"][data-place="${place}"]`);
        // Either way, clear the imperative override we set at drag-start: React's own style
        // prop never included `visibility`, so it has no way to know to reset a value we set
        // outside its control - left in place, a successfully-dragged dot would stay invisible
        // forever instead of showing the real ghost-outline styling its re-render applies.
        el.style.removeProperty("visibility");
        if (dropCell) {
          onCommit(place, rowKey, index);
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
