"use client";

import { useLayoutEffect, useRef, useState, type DependencyList } from "react";
import { DESKTOP_QUERY, useMediaQuery } from "./useMediaQuery";

interface FitResult {
  wrapRef: React.RefObject<HTMLDivElement | null>;
  workspaceRef: React.RefObject<HTMLDivElement | null>;
  scale: number;
  origin: "center" | "top";
}

/** Scale-to-fit for the skip-counting workspace, ported from the vanilla app's fitWorkspace()
 * with one deliberate desktop-only change: desktop scales on BOTH axes and is allowed to
 * upscale past 1 (unlike the vanilla original, which capped at 1) so the number-line/hundred-grid
 * content actually fills the generous desktop card instead of sitting small in a sea of
 * whitespace - the container's own width/height still bound it via the same Math.min, so this
 * can't overflow. Mobile is untouched: width-only, still capped at 1, relying on the wrap's own
 * vertical scroll for anything too tall. Re-fits on every entry in `renderDeps` (content reshapes
 * whenever the active view or phase changes - a plain resize observer on the wrap alone wouldn't
 * catch that, since the wrap's own box doesn't resize when its content does) plus on real
 * viewport/container resize via ResizeObserver, matching the vanilla app's "call fitWorkspace()
 * at the end of every render, also on resize" behavior without needing a global render() choke
 * point. */
export function useFitWorkspace(renderDeps: DependencyList): FitResult {
  const wrapRef = useRef<HTMLDivElement>(null);
  const workspaceRef = useRef<HTMLDivElement>(null);
  const isDesktop = useMediaQuery(DESKTOP_QUERY);
  const [scale, setScale] = useState(1);
  const [origin, setOrigin] = useState<"center" | "top">("center");

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
      if (isDesktop) {
        setScale(Math.min(cw / nw, ch / nh));
        setOrigin("center");
      } else {
        setScale(Math.min(1, cw / nw));
        setOrigin("top");
      }
    }

    fit();
    const ro = new ResizeObserver(fit);
    if (wrapRef.current) ro.observe(wrapRef.current);
    // Also observe the workspace itself, not just its wrap - the same rationale as addition's
    // port: a view's own content size can change shortly after the phase-change render that's
    // already in renderDeps, with nothing else to trigger a re-fit at that later moment.
    if (workspaceRef.current) ro.observe(workspaceRef.current);
    window.addEventListener("resize", fit);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", fit);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDesktop, ...renderDeps]);

  return { wrapRef, workspaceRef, scale, origin };
}
