"use client";

import { useEffect, useState } from "react";
import { useSkipCounting } from "./SkipCountingContext";
import { getView } from "@/lib/skip-counting/phases";
import { useFitWorkspace } from "@/hooks/useFitWorkspace";
import { NumberLineView } from "./NumberLineView";
import { HundredGridView } from "./HundredGridView";
import { SwitchToGridCallout } from "./SwitchToGridCallout";

const FADE_MS = 300;
const CALLOUT_DURATION = 1400;

export function Workspace() {
  const { session, phaseObj } = useSkipCounting();
  const targetView = getView(phaseObj);

  // Crossfade between the number line and the hundred grid, driven by a plain setTimeout rather
  // than an animation-completion callback (AnimatePresence's exit detection needs real animation
  // frames to fire, which silently never happens when the tab isn't actively compositing - the
  // same class of bug the addition-explainers port hit with rAF-based "wait for paint" logic).
  // displayedView lags one fade-out beat behind targetView whenever they differ.
  const [displayedView, setDisplayedView] = useState(targetView);
  const [fadedOut, setFadedOut] = useState(false);
  useEffect(() => {
    if (targetView === displayedView) {
      setFadedOut(false);
      return;
    }
    setFadedOut(true);
    const timer = window.setTimeout(() => {
      setDisplayedView(targetView);
      setFadedOut(false);
    }, FADE_MS);
    return () => window.clearTimeout(timer);
  }, [targetView, displayedView]);

  const { wrapRef, workspaceRef, scale, origin } = useFitWorkspace([
    session.phaseIdx,
    session.startVal,
    session.step,
    session.dir,
    session.jumps,
    displayedView,
  ]);

  // "pattern" is the first grid phase, reached by switching out of the number line - show a
  // brief callout marking that mode switch, timed with the crossfade above.
  const [showCallout, setShowCallout] = useState(false);
  useEffect(() => {
    if (phaseObj.type !== "pattern") {
      setShowCallout(false);
      return;
    }
    setShowCallout(true);
    const timer = window.setTimeout(() => setShowCallout(false), CALLOUT_DURATION);
    return () => window.clearTimeout(timer);
  }, [phaseObj.type]);

  return (
    <div
      ref={wrapRef}
      className="relative flex-1 min-h-0 bg-card border border-line rounded-2xl flex items-center justify-center overflow-hidden shadow-sm"
    >
      <div
        ref={workspaceRef}
        className="shrink-0 max-w-full"
        style={{
          transform: `scale(${scale})`,
          transformOrigin: origin === "center" ? "center center" : "top center",
        }}
      >
        <div style={{ opacity: fadedOut ? 0 : 1, transition: `opacity ${FADE_MS}ms ease-in-out` }}>
          {displayedView === "grid" ? <HundredGridView /> : <NumberLineView />}
        </div>
      </div>
      <SwitchToGridCallout show={showCallout} />
    </div>
  );
}
