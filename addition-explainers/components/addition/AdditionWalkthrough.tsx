"use client";

import { useEffect, useReducer, useState } from "react";
import { additionReducer, createSession, getPlaceTarget, type SessionAction } from "@/lib/addition/session";
import { destPlace } from "@/lib/addition/pack";
import type { AdditionConfig, Session } from "@/lib/addition/types";
import { AdditionContextProvider, buildAdditionContextValue } from "./AdditionContext";
import { PlaybackProvider } from "./PlaybackContext";
import { AppShell } from "./AppShell";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { AnswerCard } from "./AnswerCard";
import { NarrationBox } from "./NarrationBox";
import { PredictPrompt } from "./PredictPrompt";
import { AdditionGrid } from "./AdditionGrid";
import { WorkingAnswerPanel } from "./WorkingAnswerPanel";
import { PredictOptions } from "./PredictOptions";
import { ProgressBar } from "./ProgressBar";
import { HandHint } from "./HandHint";
import { DesktopOptionsRow } from "./DesktopOptionsRow";

export function AdditionWalkthrough({ config }: { config: AdditionConfig }) {
  const [session, dispatch] = useReducer(
    (state: Session, action: SessionAction) => additionReducer(state, action, config),
    config,
    (cfg) => createSession(cfg.defaultA1, cfg.defaultA2, cfg),
  );

  // Intro sub-step timing, both stages: "The container which has the numeric representation
  // should be the same size as the workarea (workarea need not be visible now). Then in the next
  // step, resize the width... fade in the workarea simultaneously." - starts false (full-size
  // panel, workarea hidden) the moment 'intro' begins, flips true after a short pause (panel
  // shrinks to its docked width, workarea fades in) - both WorkingAnswerPanel and AdditionGrid
  // read this SAME piece of state via context so their transitions genuinely happen together,
  // not two independently-timed guesses at synchronization. Originally stage3-only, extended to
  // stage2 by request ("add this animation for stage 2 as well, its currently missing") - the
  // showA/showB row-dimming sequence that follows stays stage3-only (`allowCarry`-gated
  // separately in WorkingAnswerPanel/GridCell), only this size/reveal step is now shared.
  const [introRevealed, setIntroRevealed] = useState(false);
  // Bumped on every FRESH arrival at 'intro' (see the effect below) and used as WorkingAnswerPanel's
  // `key` - forces a true remount each time, so framer-motion's `layout` prop has no previous
  // frame to FLIP from. Without this, re-entering intro (RESTART via the "Start" button, or
  // GO_BACK) would animate the panel GROWING from wherever it was previously sized to full-size,
  // then almost immediately shrinking again once introRevealed flips - a jarring grow-then-shrink
  // instead of "instantly full-size, then cleanly shrink." A true first-ever page load never hits
  // this (nothing to flip from on initial mount), so the bug only shows up on re-entry - but a
  // child re-starting IS a real, expected path, not just an edge case.
  const [introEntryId, setIntroEntryId] = useState(0);
  const value = buildAdditionContextValue(config, session, dispatch, introRevealed, introEntryId);
  const { phaseObj } = value;

  useEffect(() => {
    if (phaseObj.type !== "intro") {
      setIntroRevealed(false);
      return;
    }
    setIntroRevealed(false);
    setIntroEntryId((id) => id + 1);
    const timer = window.setTimeout(() => setIntroRevealed(true), 1100);
    return () => window.clearTimeout(timer);
    // `session` (not just phaseObj.type) is a deliberate dependency: RESTART ("Start" button) or
    // GO_BACK landing back on 'intro' while `phaseObj.type` was ALREADY "intro" (phaseIdx 0 both
    // times) wouldn't otherwise register as a change - React only re-runs an effect when a
    // dependency's VALUE differs, and "intro" === "intro" here. `session` is a NEW object
    // reference on every dispatch (including RESTART/GO_BACK), so it reliably re-fires this timer
    // on every fresh arrival at intro, not just the very first mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phaseObj.type, session]);

  // Mirrors the vanilla apps' maybeAdvanceAfterDrag: once every own-dot (plus any carry) for the
  // active place has been dragged and no pack is pending, auto-advance to compare after a short
  // pause so the child sees the finished count before the screen changes. Being effect-driven
  // (not fired only from the drag-commit handler) also fixes a real vanilla-era bug for free: a
  // place whose true target is 0 has nothing to ever drag, so an event-triggered advance would
  // never fire - this effect still runs on mount of that phase and advances immediately.
  useEffect(() => {
    if (phaseObj.type !== "drag" || !phaseObj.place) return;
    const place = phaseObj.place;
    const target = getPlaceTarget(place, session);
    if (session.dragged[place] !== target || session.awaitingPack[place]) return;
    const timer = window.setTimeout(() => dispatch({ type: "ADVANCE_PHASE" }), 350);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phaseObj.type, phaseObj.place, session.dragged, session.awaitingPack]);

  // `bridgecarry-<place>` is always present in the static phase list (see buildPhases) even
  // though whether a carry actually happened depends on the session's real digits - skip
  // straight through it when this place's processing didn't produce one, same "graceful no-op"
  // pattern as a place with nothing to drag.
  useEffect(() => {
    if (phaseObj.type !== "bridgecarry" || !phaseObj.place) return;
    if (session.carryIn[destPlace(phaseObj.place)] > 0) return;
    dispatch({ type: "ADVANCE_PHASE" });
  }, [phaseObj.type, phaseObj.place, session.carryIn]);

  return (
    <AdditionContextProvider value={value}>
      <PlaybackProvider>
        <AppShell>
          <ProgressBar />
          <Header />
          <main className="flex-1 min-h-0 flex flex-col gap-3 px-4 py-3 max-w-[900px] w-full mx-auto">
            <DesktopOptionsRow />
            {/* The plain "a1 + a2 = ?" equation bar above the whole grid row - the container the
                user actually meant by "hide the old workingAnswer container... above the
                workarea" (a leftover from before WorkingAnswerPanel existed). Stage2 still wants
                it; stage3 doesn't (WorkingAnswerPanel below covers that job there now). */}
            {!config.allowCarry && <AnswerCard />}
            <div className="relative flex-1 min-h-0 flex gap-2.5 min-[900px]:gap-3">
              <WorkingAnswerPanel key={introEntryId} />
              <AdditionGrid />
            </div>
            <PredictPrompt />
            <NarrationBox />
            <PredictOptions />
          </main>
          <Footer />
        </AppShell>
        <HandHint />
      </PlaybackProvider>
    </AdditionContextProvider>
  );
}
