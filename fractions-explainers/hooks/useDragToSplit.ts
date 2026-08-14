"use client";

import { useRef, useState, type RefObject } from "react";

const CENTER_TOLERANCE = 0.15;
const MIN_DRAG_PX = 28;

/** Tracks a genuinely free-form pointer drag across `containerRef` - a live line follows the
 * pointer's x position from the very first movement, so it reads as actually drawing a line
 * rather than nudging a constrained slider. A release only counts as a completed cut if BOTH: the
 * pointer actually traveled at least `MIN_DRAG_PX` at some point (a plain tap/press with no real
 * drag calls `onMiss`, not `onComplete` - otherwise pressing anywhere near center, e.g. on the
 * hint icon itself, would "complete" a cut with zero dragging, which reads as a floating button
 * rather than a drawing gesture) AND the release lands within `CENTER_TOLERANCE` of the exact
 * center (the same forgiving-band idea as JarFillHalf's fill tolerance). Any other release -
 * dragged but off-center, or not dragged far enough - calls `onMiss` so the caller can show
 * explicit "try again" feedback rather than just silently doing nothing. Used by
 * BarSplitInteractive and PizzaCutHalf for their "draw the cut" interaction. */
export function useDragToSplit(
  containerRef: RefObject<HTMLElement | null>,
  onComplete: () => void,
  onMiss: () => void,
  enabled: boolean,
) {
  const [dragX, setDragX] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const startX = useRef<number | null>(null);
  const lastX = useRef<number | null>(null);
  const maxDelta = useRef(0);

  function relativeX(e: React.PointerEvent): number {
    const rect = containerRef.current!.getBoundingClientRect();
    return Math.min(Math.max(e.clientX - rect.left, 0), rect.width);
  }

  function onPointerDown(e: React.PointerEvent) {
    if (!enabled || !containerRef.current) return;
    (e.target as Element).setPointerCapture?.(e.pointerId);
    const x = relativeX(e);
    startX.current = x;
    lastX.current = x;
    maxDelta.current = 0;
    setDragX(x);
    setIsDragging(true);
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!isDragging || startX.current === null) return;
    const x = relativeX(e);
    lastX.current = x;
    maxDelta.current = Math.max(maxDelta.current, Math.abs(x - startX.current));
    setDragX(x);
  }

  function finish() {
    if (!isDragging || !containerRef.current) return;
    setIsDragging(false);
    const width = containerRef.current.getBoundingClientRect().width;
    const releaseX = lastX.current ?? 0;
    const draggedEnough = maxDelta.current >= MIN_DRAG_PX;
    const onCenter = width > 0 && Math.abs(releaseX / width - 0.5) <= CENTER_TOLERANCE;
    setDragX(null);
    startX.current = null;
    lastX.current = null;
    maxDelta.current = 0;
    if (draggedEnough && onCenter) onComplete();
    else onMiss();
  }

  return {
    dragX,
    isDragging,
    bind: {
      onPointerDown,
      onPointerMove,
      onPointerUp: finish,
      onPointerCancel: finish,
    },
  };
}
