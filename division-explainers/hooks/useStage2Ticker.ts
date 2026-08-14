"use client";

import { useEffect, type Dispatch } from "react";
import type { Stage2Action, Stage2Session } from "@/lib/division/stage2";

const TICK_MS = 380;
/** How long round1's very first tick (sharing only) waits before the first dot leaves the pile -
 * gives the equation's fade-out (triggered the instant round1 starts) time to actually finish
 * before anything else happens on screen. */
const ROUND1_START_DELAY_MS = 1000;

/** Drives every auto-animated tick in stage2:
 *  - reveal-dividend/reveal-divisor (sharing only): counts a preview total up one at a time, then
 *    just sits there once settled - ADVANCE_PHASE is manual (Next), same settle-then-continue
 *    split as stage3's count-tens, so the child can pace past it.
 *  - reveal-divisor (grouping only): reveals the one friend (previewCount 0->1), then - same
 *    step, no manual Next in between - keeps ticking `dotsPlaced` to fill it with `divisor` dots,
 *    then auto-hands-off straight to predict once full (see groupingFilling below).
 *  - round1/distribute: ticks `dotsPlaced` forward one dot at a time regardless of manual/auto
 *    mode (a scripted animation, not a reviewable step), then hands off to phase advancement
 *    automatically once the round/whole distribution completes. round1's first tick (sharing
 *    only) is deliberately delayed - see ROUND1_START_DELAY_MS. */
export function useStage2Ticker(session: Stage2Session, dispatch: Dispatch<Stage2Action>) {
  const { phase, concept, dotsPlaced, divisor, total, previewCount } = session;

  const previewTarget =
    phase === "reveal-dividend" ? total : phase === "reveal-divisor" ? (concept === "sharing" ? divisor : 1) : null;
  useEffect(() => {
    if (previewTarget === null || previewCount >= previewTarget) return;
    const timer = window.setTimeout(() => dispatch({ type: "TICK" }), TICK_MS);
    return () => window.clearTimeout(timer);
  }, [previewTarget, previewCount, dispatch]);

  const groupingFilling = phase === "reveal-divisor" && concept === "grouping" && previewCount >= 1;
  const isAnimating = phase === "round1" || phase === "distribute" || groupingFilling;
  const target = phase === "round1" || groupingFilling ? divisor : total;

  useEffect(() => {
    if (!isAnimating || dotsPlaced >= target) return;
    const delay = phase === "round1" && dotsPlaced === 0 && concept === "sharing" ? ROUND1_START_DELAY_MS : TICK_MS;
    const timer = window.setTimeout(() => dispatch({ type: "TICK" }), delay);
    return () => window.clearTimeout(timer);
  }, [isAnimating, dotsPlaced, target, phase, concept, dispatch]);

  useEffect(() => {
    if (isAnimating && dotsPlaced >= target) {
      dispatch({ type: "ADVANCE_PHASE" });
    }
  }, [isAnimating, dotsPlaced, target, dispatch]);
}
