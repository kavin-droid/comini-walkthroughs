"use client";

import { useLayoutEffect, useRef, useState, type DependencyList } from "react";

interface FitResult {
  wrapRef: React.RefObject<HTMLDivElement | null>;
  workspaceRef: React.RefObject<HTMLDivElement | null>;
  scale: number;
}

/** Scale-to-fit for the comparison workspace, ported from the vanilla stage2/stage3 apps'
 * fitWorkspace(): scales on BOTH axes (never upscales past 1) and always centers, on every
 * viewport - unlike addition-explainers' own fit hook, the vanilla compare-order apps never had a
 * mobile-only width-only/top-anchored variant, since the whole app commits to a no-scroll
 * `overflow: hidden` shell on every breakpoint. Re-fits on every entry in `renderDeps` (content
 * reshapes whenever the step changes - a plain resize observer on the wrap alone wouldn't catch
 * that, since the wrap's own box doesn't resize when its content does) plus on real
 * viewport/container resize via ResizeObserver, matching the vanilla's "call fitWorkspace() at the
 * end of every render, also on resize" behavior without needing a global render() choke point. */
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
      setScale(Math.min(1, cw / nw, ch / nh));
    }

    fit();
    const ro = new ResizeObserver(fit);
    if (wrapRef.current) ro.observe(wrapRef.current);
    // Also observe the workspace itself, not just its wrap: a card equalizing height or the
    // pool's grid reflowing can resize the workspace's own content after the step-change render
    // that's already in renderDeps, with nothing else to trigger a re-fit at that later moment.
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
