"use client";

import { useLayoutEffect, useRef, useState, type DependencyList } from "react";
import { DESKTOP_QUERY, useMediaQuery } from "./useMediaQuery";

interface FitResult {
  wrapRef: React.RefObject<HTMLDivElement | null>;
  workspaceRef: React.RefObject<HTMLDivElement | null>;
  scale: number;
  origin: "center" | "top";
}

/** How far above natural size the workspace may be blown up. The vanilla apps never upscale
 * (`Math.min(1, ...)`) because their workspace-wrap only ever has a little slack around
 * fixed-width content; this port's card can end up considerably roomier than that (a 2-place
 * stage2 row is ~360px wide inside an 868px desktop card, for example) - see the "increase
 * visuals/text to fill the workarea's whitespace" ask these constants exist for. Desktop gets
 * more headroom than mobile since a short phone viewport has less vertical room to spare before
 * an enlarged workspace forces noticeably more scrolling. */
const DESKTOP_MAX_SCALE = 1.6;
const MOBILE_MAX_SCALE = 1.35;

/** Scale-to-fit for the addition grid, ported from the vanilla apps' fitWorkspace(): desktop
 * scales on BOTH axes so the grid never needs to scroll; mobile scales width only and relies on
 * the wrap's own vertical scroll for anything still too tall. Both directions are allowed to
 * upscale past 1x (capped - see DESKTOP_MAX_SCALE/MOBILE_MAX_SCALE) rather than the vanilla
 * apps' never-upscale behavior. Re-fits on every entry in `renderDeps` (content reshapes
 * whenever the visible place columns or phase change - a plain resize observer on the wrap alone
 * wouldn't catch that, since the wrap's own box doesn't resize when its content does) plus on
 * real viewport/container resize via ResizeObserver, matching the vanilla apps' "call
 * fitWorkspace() at the end of every render, also on resize" behavior without needing a global
 * render() choke point. */
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
        setScale(Math.min(DESKTOP_MAX_SCALE, cw / nw, ch / nh));
        setOrigin("center");
      } else {
        setScale(Math.min(MOBILE_MAX_SCALE, cw / nw));
        setOrigin("top");
      }
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

  return { wrapRef, workspaceRef, scale, origin };
}
