"use client";

import { useEffect, type Dispatch } from "react";
import type { Stage3Action, Stage3Session } from "@/lib/division/stage3";

const COUNT_TENS_TICK_MS = 400;
const SHARE_TENS_TICK_MS = 550;
const COUNT_LEFTOVER_TICK_MS = 400;
const UNPACK_MOVE_MS = 350;
const UNPACK_FADE_MS = 250;
const COUNT_ONES_TICK_MS = 350;

/** Drives every auto-animated (non-tap) stretch of the new stage3 flow: the tens counting demo,
 * the auto round-robin share of the counted tens group, each unpacked pack's stripped->moved
 * follow-up (300ms after its own tap, independently per pack), and the ones counting-by-groups
 * demo. Tap-driven phases (unpack's TAP_UNPACK, share-ones' TAP_SHARE_ONES_ROUND) are dispatched
 * directly from the UI, not from here. */
export function useStage3Ticker(session: Stage3Session, dispatch: Dispatch<Stage3Action>) {
  const {
    phase,
    tensDigit,
    tensCountProgress,
    tensPredicted,
    divisor,
    tensSharePlaced,
    tensLeftover,
    leftoverCountProgress,
    unpackStages,
    onesTotal,
    onesCountProgress,
  } = session;

  // count-tens: tick forward ONE block at a time ("1.. 2.. 3.. 4") - a group only colors in once
  // its own last member lands, and the trailing leftover shakes once it's fully counted and still
  // short. Once counting finishes it just sits there with the feedback callout showing -
  // CONTINUE_AFTER_COUNT_TENS is dispatched from the Next button once the child has seen it, not
  // automatically, so "count" and "feedback" read as one deliberate step before the (separate)
  // distribution step.
  const tensCountTarget = tensDigit;
  useEffect(() => {
    if (phase !== "count-tens") return;
    if (tensCountProgress >= tensCountTarget) return;
    const timer = window.setTimeout(() => dispatch({ type: "COUNT_TENS_TICK" }), COUNT_TENS_TICK_MS);
    return () => window.clearTimeout(timer);
  }, [phase, tensCountProgress, tensCountTarget, dispatch]);

  // share-tens: a separate, purely auto-animated distribution step - ticks the counted group out
  // to the containers, then hands off on its own once done (no pause; the reflection pause
  // already happened back in count-tens).
  useEffect(() => {
    if (phase !== "share-tens" || tensPredicted === null) return;
    const target = tensPredicted * divisor;
    if (tensSharePlaced >= target) return;
    const timer = window.setTimeout(() => dispatch({ type: "SHARE_TENS_TICK" }), SHARE_TENS_TICK_MS);
    return () => window.clearTimeout(timer);
  }, [phase, tensPredicted, divisor, tensSharePlaced, dispatch]);

  useEffect(() => {
    if (phase !== "share-tens" || tensPredicted === null) return;
    if (tensSharePlaced >= tensPredicted * divisor) dispatch({ type: "FINISH_SHARE_TENS" });
  }, [phase, tensPredicted, divisor, tensSharePlaced, dispatch]);

  // count-leftover: tick forward ONE pack at a time ("1.. 2.. 3.."), same per-block cadence as
  // count-tens - once every leftover pack is counted it just sits there with the "can't share
  // evenly" callout showing - CONTINUE_AFTER_COUNT_LEFTOVER is dispatched from the Next button
  // once the child has seen it, not automatically, same settle-then-continue split as
  // count-tens/count-ones.
  const leftoverCountTarget = tensLeftover;
  useEffect(() => {
    if (phase !== "count-leftover") return;
    if (leftoverCountProgress >= leftoverCountTarget) return;
    const timer = window.setTimeout(() => dispatch({ type: "COUNT_LEFTOVER_TICK" }), COUNT_LEFTOVER_TICK_MS);
    return () => window.clearTimeout(timer);
  }, [phase, leftoverCountProgress, leftoverCountTarget, dispatch]);

  // unpack: each pack that was just tapped ('moving') gets its own independent follow-up to
  // 'fading' once its FLIP travel to the ones column has had time to land, then a second
  // follow-up to 'moved' once it's finished fading out there - packs tapped in any order, at any
  // pace, each animate through both stages on their own timeline.
  useEffect(() => {
    if (phase !== "unpack") return;
    const moveTimers = unpackStages
      .map((stage, index) => (stage === "moving" ? index : -1))
      .filter((index) => index >= 0)
      .map((index) => window.setTimeout(() => dispatch({ type: "UNPACK_MOVE_DONE", index }), UNPACK_MOVE_MS));
    const fadeTimers = unpackStages
      .map((stage, index) => (stage === "fading" ? index : -1))
      .filter((index) => index >= 0)
      .map((index) => window.setTimeout(() => dispatch({ type: "UNPACK_FADE_DONE", index }), UNPACK_FADE_MS));
    return () => [...moveTimers, ...fadeTimers].forEach((t) => window.clearTimeout(t));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, unpackStages, dispatch]);

  // Once every leftover pack has unpacked, it just sits there with its ghost outlines showing -
  // FINISH_UNPACK is dispatched from the Next button once the child has seen it settle, not
  // automatically (same deliberate hand-off as count-tens -> share-tens).

  // count-ones: ticks forward one ONE at a time ("1.. 2.. 3.. 4" within each group of `divisor`),
  // same per-block cadence as count-tens - each block shows its own running count label, which
  // fades away once its group completes (see Block.tsx), then the next group starts counting.
  // Then sits there with the feedback callout showing - CONTINUE_AFTER_COUNT_ONES is dispatched
  // from the Next button once the child has seen it, not automatically, same split as
  // count-tens/share-tens.
  const onesCountTarget = onesTotal;
  useEffect(() => {
    if (phase !== "count-ones") return;
    if (onesCountProgress >= onesCountTarget) return;
    const timer = window.setTimeout(() => dispatch({ type: "COUNT_ONES_TICK" }), COUNT_ONES_TICK_MS);
    return () => window.clearTimeout(timer);
  }, [phase, onesCountTarget, onesCountProgress, dispatch]);
}
