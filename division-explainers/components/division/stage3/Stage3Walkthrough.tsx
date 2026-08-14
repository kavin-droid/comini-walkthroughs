"use client";

import { useReducer, useState } from "react";
import {
  STAGE3_META,
  STAGE3_PHASES,
  buildStage3Narration,
  createStage3Session,
  stage3Reducer,
  type Stage3Session,
} from "@/lib/division/stage3";
import type { Stage3Committed } from "@/hooks/useStage3Form";
import { useStage3Playback } from "@/hooks/useStage3Playback";
import { useStage3Ticker } from "@/hooks/useStage3Ticker";
import { useFitWorkspace } from "@/hooks/useFitWorkspace";
import { AppShell } from "@/components/division/shared/AppShell";
import { ProgressBar } from "@/components/division/shared/ProgressBar";
import { NarrationBox } from "@/components/division/shared/NarrationBox";
import { Footer } from "@/components/division/shared/Footer";
import { Workspace } from "@/components/division/shared/Workspace";
import { DesktopRow } from "@/components/division/shared/DesktopRow";
import { Stage3Header } from "./Stage3Header";
import { Stage3QuestionRow } from "./Stage3QuestionRow";
import { Stage3PredictOptions } from "./Stage3PredictOptions";
import { Stage3Workspace } from "./Stage3Workspace";
import { Stage3WorkingAnswer } from "./Stage3WorkingAnswer";

const INITIAL: Stage3Committed = {
  dividend: STAGE3_META.defaultDividend,
  divisor: STAGE3_META.defaultDivisor,
};

/** Phases where nothing is settled yet for Prev/Next to act on - either an auto-animation is
 * still ticking, or the child hasn't finished tapping through a tap-driven step. count-tens,
 * count-leftover, and count-ones each become reviewable (not busy) once their counting finishes,
 * showing the feedback callout; unpack becomes reviewable once every leftover pack has unpacked
 * (ghosts showing). share-tens/share-ones are pure auto-animation/tap-through with their own
 * automatic hand-off, so they're always busy. */
function isBusy(session: Stage3Session): boolean {
  const { phase, tensCountProgress, tensDigit, tensLeftover, leftoverCountProgress, onesCountProgress, onesTotal, unpackStages } = session;
  if (phase === "share-tens" || phase === "share-ones") return true;
  if (phase === "count-tens") return tensCountProgress < tensDigit;
  if (phase === "count-leftover") return leftoverCountProgress < tensLeftover;
  if (phase === "unpack") return !(unpackStages.length > 0 && unpackStages.every((s) => s === "moved"));
  if (phase === "count-ones") return onesCountProgress < onesTotal;
  return false;
}

export function Stage3Walkthrough() {
  const [session, dispatch] = useReducer(
    stage3Reducer,
    INITIAL,
    (init) => createStage3Session(init.dividend, init.divisor),
  );
  const [loading, setLoading] = useState(false);
  const [hideText, setHideText] = useState(false);

  const playback = useStage3Playback(session.phase, dispatch);
  useStage3Ticker(session, dispatch);
  const { wrapRef, workspaceRef, scale } = useFitWorkspace([session]);

  const committed: Stage3Committed = { dividend: session.dividend, divisor: session.divisor };

  function handleVisualize(next: Stage3Committed) {
    playback.pause();
    setLoading(true);
    window.setTimeout(() => {
      dispatch({ type: "RESTART", dividend: next.dividend, divisor: next.divisor });
      setLoading(false);
      playback.resumeIfAuto();
    }, 450);
  }

  const busy = isBusy(session);
  const atStart = session.phase === "numerals";
  const atEnd = session.phase === "done";
  const phaseProgressIdx = STAGE3_PHASES.indexOf(session.phase);

  return (
    <AppShell>
      <ProgressBar count={STAGE3_PHASES.length} idx={phaseProgressIdx} />
      <Stage3Header
        committed={committed}
        onVisualize={handleVisualize}
        mode={playback.mode}
        onToggleMode={() => playback.setMode(playback.mode === "auto" ? "manual" : "auto")}
        hideText={hideText}
        onToggleHideText={() => setHideText((h) => !h)}
      />
      <main className="flex-1 min-h-0 flex flex-col gap-2.5 px-4 py-3 max-w-[900px] w-full mx-auto">
        <DesktopRow>
          <Stage3QuestionRow committed={committed} onVisualize={handleVisualize} />
        </DesktopRow>
        {session.phase === "numerals" ? (
          // Step 1: the arithmetic representation fills the same box the workarea would occupy -
          // nothing else on screen. It FLIPs (shared layoutId) into its narrow sidebar spot the
          // moment step 2 begins, while the workarea fades in alongside it (see the fade-in-up
          // mount animation below, which only ever plays once - on that exact transition, since
          // this whole branch swap only happens the one time phase leaves "numerals").
          <div className="flex-1 min-h-0 flex">
            <Stage3WorkingAnswer session={session} size="hero" />
          </div>
        ) : session.phase === "notation" || session.phase === "done" ? (
          // The final breakdown view is already the widest content in the whole walkthrough (three
          // place-value groups side by side) - the sidebar bracket would just squeeze it further on
          // mobile for no benefit, since Stage3NotationView already restates the full equation.
          <div className="flex-1 min-h-0 flex" style={{ animation: "fade-in-up 0.4s ease" }}>
            <Workspace wrapRef={wrapRef} workspaceRef={workspaceRef} scale={scale} loading={loading}>
              <Stage3Workspace
                session={session}
                hideText={hideText}
                onTapUnpack={(index) => dispatch({ type: "TAP_UNPACK", index })}
                onTapShareRound={() => dispatch({ type: "TAP_SHARE_ONES_ROUND" })}
              />
            </Workspace>
          </div>
        ) : (
          <div className="flex-1 min-h-0 flex gap-2 min-[900px]:gap-3">
            <Stage3WorkingAnswer session={session} />
            <div className="flex-1 min-w-0 min-h-0 flex" style={{ animation: "fade-in-up 0.4s ease" }}>
              <Workspace wrapRef={wrapRef} workspaceRef={workspaceRef} scale={scale} loading={loading}>
                <Stage3Workspace
                  session={session}
                  hideText={hideText}
                  onTapUnpack={(index) => dispatch({ type: "TAP_UNPACK", index })}
                  onTapShareRound={() => dispatch({ type: "TAP_SHARE_ONES_ROUND" })}
                />
              </Workspace>
            </div>
          </div>
        )}
        {!hideText && (
          <NarrationBox
            fragments={buildStage3Narration(session)}
            speakable={session.phase === "predict-tens" || session.phase === "predict-ones"}
          />
        )}
      </main>
      {session.phase === "predict-tens" && session.mcqOptionsTens ? (
        <Stage3PredictOptions
          session={session}
          options={session.mcqOptionsTens}
          hideText={hideText}
          onSelect={(value) => dispatch({ type: "SELECT_TENS_PREDICTION", value })}
        />
      ) : session.phase === "predict-ones" && session.mcqOptionsOnes ? (
        <Stage3PredictOptions
          session={session}
          options={session.mcqOptionsOnes}
          hideText={hideText}
          onSelect={(value) => dispatch({ type: "SELECT_ONES_PREDICTION", value })}
        />
      ) : (
        <Footer
          mode={playback.mode}
          atStart={atStart || busy}
          atEnd={atEnd || busy}
          isPlaying={playback.isPlaying}
          onPrev={() => {
            playback.pause();
            dispatch({ type: "GO_BACK" });
          }}
          onNext={() => {
            playback.pause();
            if (session.phase === "count-tens") dispatch({ type: "CONTINUE_AFTER_COUNT_TENS" });
            else if (session.phase === "count-leftover") dispatch({ type: "CONTINUE_AFTER_COUNT_LEFTOVER" });
            else if (session.phase === "unpack") dispatch({ type: "FINISH_UNPACK" });
            else if (session.phase === "count-ones") dispatch({ type: "CONTINUE_AFTER_COUNT_ONES" });
            else dispatch({ type: "ADVANCE_PHASE" });
          }}
          onTogglePlay={playback.togglePlayPause}
        />
      )}
    </AppShell>
  );
}
