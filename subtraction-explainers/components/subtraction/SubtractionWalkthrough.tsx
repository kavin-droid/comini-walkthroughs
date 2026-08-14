"use client";

import { useEffect, useReducer, useState } from "react";
import { subtractionReducer, createSession, type SessionAction } from "@/lib/subtraction/session";
import type { Session, SubtractionConfig } from "@/lib/subtraction/types";
import { SubtractionContextProvider, buildSubtractionContextValue } from "./SubtractionContext";
import { PlaybackProvider } from "./PlaybackContext";
import { AppShell } from "@/components/shared/AppShell";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { AnswerCard } from "./AnswerCard";
import { NarrationBox } from "./NarrationBox";
import { Grid } from "./Grid";
import { PredictOptions } from "./PredictOptions";
import { ProgressBar } from "./ProgressBar";
import { DesktopOptionsRow } from "./DesktopOptionsRow";
import { HandHint } from "./HandHint";

export function SubtractionWalkthrough({ config }: { config: SubtractionConfig }) {
  const [session, dispatch] = useReducer(
    (state: Session, action: SessionAction) => subtractionReducer(state, action, config),
    config,
    (cfg) => createSession(cfg, cfg.defaultMinuend, cfg.defaultSubtrahend),
  );

  const value = buildSubtractionContextValue(config, session, dispatch);
  const { phaseObj } = value;

  // Once every block for the active place has been tapped away, auto-advance to expand after a
  // short pause. Effect-driven (not fired only from the tap-commit handler) so a place whose
  // target is 0 still advances on mount.
  useEffect(() => {
    if (phaseObj.type !== "drag" || !phaseObj.place) return;
    const place = phaseObj.place;
    const target = session.own[place].take;
    if (session.removed[place].length !== target) return;
    const timer = window.setTimeout(() => dispatch({ type: "ADVANCE_PHASE" }), 350);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phaseObj.type, phaseObj.place, session.removed, session.own]);

  // Once a regroup tap has been committed (which itself only happens once the fly-clone
  // animation finishes arriving - see Grid's handleTapRegroup), auto-advance after a short pause
  // so the child sees the settled result before the screen changes.
  useEffect(() => {
    if (phaseObj.type !== "regroup" || !phaseObj.place) return;
    if (!session.regrouped[phaseObj.place]) return;
    const timer = window.setTimeout(() => dispatch({ type: "ADVANCE_PHASE" }), 500);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phaseObj.type, phaseObj.place, session.regrouped]);

  // Round-14: with hideText on, "The ones place needs 8, but only has 2" (regroupAnnounce's
  // narration) is invisible, so there was no visual reason WHY a regroup was about to happen.
  // This sequentially pulses the take row's dots first (count out the 8 needed), then the start
  // row's dots (count out the 2 there are), then briefly flashes both digit counts together (the
  // visual "2 < 8, not enough!" beat) - purely a decorative overlay driven by a timer, not step
  // data, since it never affects the actual phase machine. Lives HERE (not inside Grid, round-23)
  // because AnswerCard needs the exact same cue to flash its OWN digits in sync - Grid and
  // AnswerCard are siblings, so their shared parent is where shared transient UI state belongs.
  const [countCue, setCountCue] = useState<{ row: "take" | "start" | "compare"; index?: number } | null>(null);
  useEffect(() => {
    if (phaseObj.type !== "regroupAnnounce" || !phaseObj.place) {
      setCountCue(null);
      return;
    }
    const place = phaseObj.place;
    const takeN = session.own[place].take;
    const startN = session.own[place].start;
    const timers: number[] = [];
    let t = 300;
    for (let i = 0; i < takeN; i++) {
      timers.push(window.setTimeout(() => setCountCue({ row: "take", index: i }), t));
      t += 220;
    }
    t += 300;
    for (let i = 0; i < startN; i++) {
      timers.push(window.setTimeout(() => setCountCue({ row: "start", index: i }), t));
      t += 220;
    }
    t += 300;
    timers.push(window.setTimeout(() => setCountCue({ row: "compare" }), t));
    t += 900;
    timers.push(window.setTimeout(() => setCountCue(null), t));
    return () => {
      timers.forEach((id) => window.clearTimeout(id));
      setCountCue(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phaseObj.type, phaseObj.place]);

  return (
    <SubtractionContextProvider value={value}>
      <PlaybackProvider>
        <AppShell>
          <ProgressBar />
          <Header />
          <main className="flex-1 min-h-0 flex flex-col gap-3 px-4 py-3 max-w-[900px] w-full mx-auto">
            <DesktopOptionsRow />
            {/* AnswerCard = the arithmetic/written representation of the problem, Grid = the
                visual/manipulative one - shown side by side on EVERY breakpoint now (round-23:
                "on mobile also, have the workingAnswer container on the left instead of above the
                workarea" - previously this only sat side by side on desktop, stacking on mobile). */}
            <div className="flex-1 min-h-0 flex flex-row gap-2 min-[900px]:gap-3">
              <AnswerCard countCue={countCue} />
              <Grid countCue={countCue} />
            </div>
            <NarrationBox />
            <PredictOptions />
          </main>
          <Footer />
        </AppShell>
        <HandHint />
      </PlaybackProvider>
    </SubtractionContextProvider>
  );
}
