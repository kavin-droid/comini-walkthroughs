"use client";

import { useLayoutEffect, useRef, useState, type DependencyList } from "react";
import { DESKTOP_QUERY, useMediaQuery } from "./useMediaQuery";

interface FitResult {
  wrapRef: React.RefObject<HTMLDivElement | null>;
  workspaceRef: React.RefObject<HTMLDivElement | null>;
  scale: number;
}

/** How far above natural size the workspace may be blown up on desktop. The vanilla apps never
 * upscale (`Math.min(1, ...)`) because their workspace-wrap only ever has a little slack around
 * fixed-width content; this port's desktop card can end up considerably roomier than that (see
 * the "increase visuals/text to fill the desktop whitespace" ask this constant exists for), so
 * desktop is allowed to grow past 1x up to this cap - capped rather than uncapped so a very wide
 * monitor doesn't blow a short view (e.g. split) up disproportionately more than a tall one
 * (e.g. hop). Mobile is untouched: still `Math.min(1, ...)`, never upscaled. */
const DESKTOP_MAX_SCALE = 1.6;

/** Scale-to-fit for the rounding workspace, based on the vanilla apps' fitWorkspace() (scales on
 * BOTH axes, always centers - on mobile that's a 1:1 port, since rounding's vanilla source has no
 * mobile-only "scale width, top-align, let it scroll" branch, unlike addition-explainers' variant
 * of this hook). Desktop deliberately diverges from the vanilla `Math.min(1, ...)` never-upscale
 * behavior - see DESKTOP_MAX_SCALE above. Re-fits on every entry in `renderDeps` (content
 * reshapes whenever the step/view changes - a plain resize observer on the wrap alone wouldn't
 * catch that, since the wrap's own box doesn't resize when its content does) plus on real
 * viewport/container resize via ResizeObserver, matching the vanilla apps' "call fitWorkspace()
 * at the end of every render, also on resize" behavior without needing a global render() choke
 * point. */
export function useFitWorkspace(renderDeps: DependencyList): FitResult {
  const wrapRef = useRef<HTMLDivElement>(null);
  const workspaceRef = useRef<HTMLDivElement>(null);
  const isDesktop = useMediaQuery(DESKTOP_QUERY);
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
      const fitScale = Math.min(cw / nw, ch / nh);
      setScale(isDesktop ? Math.min(fitScale, DESKTOP_MAX_SCALE) : Math.min(1, fitScale));
    }

    fit();
    const ro = new ResizeObserver(fit);
    if (wrapRef.current) ro.observe(wrapRef.current);
    // Also observe the workspace itself, not just its wrap: a column's Framer exit animation
    // shrinks the workspace's own content size ~350ms AFTER the phase-change render that's
    // already in renderDeps, with nothing else to trigger a re-fit at that later moment.
    if (workspaceRef.current) ro.observe(workspaceRef.current);
    window.addEventListener("resize", fit);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", fit);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDesktop, ...renderDeps]);

  return { wrapRef, workspaceRef, scale };
}
