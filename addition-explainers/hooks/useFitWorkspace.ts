"use client";

import { useLayoutEffect, useRef, useState, type DependencyList } from "react";
import { DESKTOP_QUERY, useMediaQuery } from "./useMediaQuery";

interface FitResult {
  wrapRef: React.RefObject<HTMLDivElement | null>;
  workspaceRef: React.RefObject<HTMLDivElement | null>;
  scale: number;
  origin: "center" | "top";
}

/** Scale-to-fit for the addition grid, ported from the vanilla apps' fitWorkspace(): desktop
 * scales on BOTH axes (never upscales past 1) so the grid never needs to scroll; mobile scales
 * width only and relies on the wrap's own vertical scroll for anything still too tall. Re-fits
 * on every entry in `renderDeps` (content reshapes whenever the visible place columns or phase
 * change - a plain resize observer on the wrap alone wouldn't catch that, since the wrap's own
 * box doesn't resize when its content does) plus on real viewport/container resize via
 * ResizeObserver, matching the vanilla apps' "call fitWorkspace() at the end of every render,
 * also on resize" behavior without needing a global render() choke point. */
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
      // `cw`/`ch` subtract 16px of padding from the wrap's own box - a `clientWidth`/
      // `clientHeight` of 0 (transiently possible mid-layout-thrash, e.g. right as a dragged
      // item's source element is hidden) makes them NEGATIVE, not zero, so a plain falsy check
      // lets a negative value slip through and land in `Math.min(1, cw/nw, ...)` - producing a
      // negative scale that inverts and shrinks the whole workspace, and persists in state until
      // some unrelated resize happens to trigger a corrective re-fit. Guard the sign explicitly.
      if (!nw || !nh || cw <= 0 || ch <= 0) return;
      if (isDesktop) {
        setScale(Math.min(1, cw / nw, ch / nh));
        setOrigin("center");
      } else {
        setScale(Math.min(1, cw / nw));
        setOrigin("top");
      }
    }

    fit();

    // Observer-triggered fits are debounced (unlike the direct call above): a column's
    // opacity/max-width CSS transition (GridRow/GridHeader, 300ms) fires this observer on every
    // intermediate frame as the box continuously resizes, which without debouncing recomputes
    // `scale` dozens of times mid-transition and reads as the whole workspace visibly jittering
    // in size. Debouncing collapses that burst into one recalculation once the box stops moving,
    // using its final settled dimensions - a real (non-transition) resize still lands within one
    // short delay of the actual change, which is imperceptible for a fit-to-container reflow.
    let debounceTimer: number | undefined;
    function debouncedFit() {
      if (debounceTimer) window.clearTimeout(debounceTimer);
      debounceTimer = window.setTimeout(fit, 80);
    }

    const ro = new ResizeObserver(debouncedFit);
    if (wrapRef.current) ro.observe(wrapRef.current);
    // Also observe the workspace itself, not just its wrap: a column's Framer exit animation
    // shrinks the workspace's own content size ~350ms AFTER the phase-change render that's
    // already in renderDeps, with nothing else to trigger a re-fit at that later moment.
    if (workspaceRef.current) ro.observe(workspaceRef.current);
    window.addEventListener("resize", debouncedFit);
    return () => {
      if (debounceTimer) window.clearTimeout(debounceTimer);
      ro.disconnect();
      window.removeEventListener("resize", debouncedFit);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDesktop, ...renderDeps]);

  return { wrapRef, workspaceRef, scale, origin };
}
