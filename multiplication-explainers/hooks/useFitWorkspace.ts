"use client";

import { useLayoutEffect, useRef, useState, type DependencyList } from "react";

interface FitResult {
  wrapRef: React.RefObject<HTMLDivElement | null>;
  workspaceRef: React.RefObject<HTMLDivElement | null>;
  scale: number;
}

/** The workspace's natural content (dots, packs, text) is sized for a small mobile canvas, so on
 * a much larger card it would otherwise sit tiny and centered, surrounded by dead space. Scaling
 * up to fill the card reads fine here (the same technique as browser/canvas zoom - every border,
 * radius and font grows together, staying proportional) - but capped well short of `cw/nw`/`ch/nh`
 * so a single small step (e.g. a 2x2 array) doesn't blow up to a comically large multiple of the
 * surrounding chrome's scale. */
const MAX_SCALE = 2.2;

/** Scale-to-fit for the multiplication workspace, ported from the vanilla apps' fitWorkspace():
 * scales on both axes so the workspace never needs to scroll, matching the vanilla apps' single
 * desktop+mobile fit behavior (unlike addition's drag-grid, multiplication has no per-place
 * columns that reflow, so there's no mobile/desktop scroll-vs-shrink split here). Re-fits on every
 * entry in `renderDeps` (content reshapes whenever the step or concept changes - the wrap's own
 * box doesn't resize when its content does) plus on real viewport/container resize via
 * ResizeObserver. */
export function useFitWorkspace(renderDeps: DependencyList): FitResult {
  const wrapRef = useRef<HTMLDivElement>(null);
  const workspaceRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useLayoutEffect(() => {
    function fit() {
      const wrap = wrapRef.current;
      const ws = workspaceRef.current;
      if (!wrap || !ws) return;
      const prevTransform = ws.style.transform;
      ws.style.transform = "none";
      const cw = wrap.clientWidth - 16;
      const ch = wrap.clientHeight - 16;
      const nw = ws.scrollWidth;
      const nh = ws.scrollHeight;
      ws.style.transform = prevTransform;
      if (!nw || !nh || !cw || !ch) return;
      setScale(Math.min(MAX_SCALE, cw / nw, ch / nh));
    }

    fit();
    const ro = new ResizeObserver(fit);
    if (wrapRef.current) ro.observe(wrapRef.current);
    if (workspaceRef.current) ro.observe(workspaceRef.current);
    window.addEventListener("resize", fit);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", fit);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, renderDeps);

  return { wrapRef, workspaceRef, scale };
}
