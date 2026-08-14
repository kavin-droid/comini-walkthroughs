"use client";

import { useEffect, useState, type RefObject } from "react";

/** Live pixel width of a number-line stage element, used for the hop/closer views' SVG arc
 * math (the vanilla apps read `stage.clientWidth || 300` at click/hop time - this hook keeps a
 * live value instead so arcs redraw correctly across viewport/scale changes). */
export function useStageWidth(ref: RefObject<HTMLElement | null>): number {
  const [width, setWidth] = useState(300);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      if (el.clientWidth) setWidth(el.clientWidth);
    });
    ro.observe(el);
    if (el.clientWidth) setWidth(el.clientWidth);
    return () => ro.disconnect();
  }, [ref]);

  return width;
}
