"use client";

import { useReducer, useState } from "react";
import {
  STAGE2_META,
  stage2Phases,
  buildStage2Narration,
  createStage2Session,
  stage2Reducer,
  type Stage2Concept,
} from "@/lib/division/stage2";
import type { Stage2Committed } from "@/hooks/useStage2Form";
import { useStage2Playback } from "@/hooks/useStage2Playback";
import { useStage2Ticker } from "@/hooks/useStage2Ticker";
import { useFitWorkspace } from "@/hooks/useFitWorkspace";
import { AppShell } from "@/components/division/shared/AppShell";
import { ProgressBar } from "@/components/division/shared/ProgressBar";
import { AnswerCardSlot } from "@/components/division/shared/AnswerCardSlot";
import { NarrationBox } from "@/components/division/shared/NarrationBox";
import { Footer } from "@/components/division/shared/Footer";
import { Workspace } from "@/components/division/shared/Workspace";
import { DesktopRow } from "@/components/division/shared/DesktopRow";
import { Stage2Header } from "./Stage2Header";
import { Stage2QuestionRow } from "./Stage2QuestionRow";
import { Stage2PredictOptions } from "./Stage2PredictOptions";
import { Stage2Workspace } from "./Stage2Workspace";

const INITIAL: Stage2Committed = {
  dividend: STAGE2_META.defaultDividend,
  divisor: STAGE2_META.defaultDivisor,
  concept: STAGE2_META.defaultConcept,
};

export function Stage2Walkthrough() {
  const [session, dispatch] = useReducer(
    stage2Reducer,
    INITIAL,
    (init) => createStage2Session(init.dividend, init.divisor, init.concept),
  );
  const [pendingConcept, setPendingConcept] = useState<Stage2Concept>(INITIAL.concept);
  const [loading, setLoading] = useState(false);
  const [hideText, setHideText] = useState(false);

  const playback = useStage2Playback(session.phase, dispatch);
  useStage2Ticker(session, dispatch);
  const { wrapRef, workspaceRef, scale } = useFitWorkspace([session]);

  const committed: Stage2Committed = { dividend: session.total, divisor: session.divisor, concept: session.concept };

  function handleVisualize(next: Stage2Committed) {
    playback.pause();
    setLoading(true);
    window.setTimeout(() => {
      setPendingConcept(next.concept);
      dispatch({ type: "RESTART", total: next.dividend, divisor: next.divisor, concept: next.concept });
      setLoading(false);
      playback.resumeIfAuto();
    }, 450);
  }

  const previewTarget =
    session.phase === "reveal-dividend"
      ? session.total
      : session.phase === "reveal-divisor"
        ? session.concept === "sharing"
          ? session.divisor
          : 1
        : null;
  const previewBusy = previewTarget !== null && session.previewCount < previewTarget;
  // Grouping's reveal-divisor keeps auto-ticking dotsPlaced (filling the one friend) after its
  // preview settles at 1 - Prev/Next stay disabled through that fill, same as round1/distribute.
  const groupingFilling =
    session.phase === "reveal-divisor" && session.concept === "grouping" && session.previewCount >= 1 && session.dotsPlaced < session.divisor;
  const isAnimating = session.phase === "round1" || session.phase === "distribute" || previewBusy || groupingFilling;
  const atStart = session.phase === "equation";
  const atEnd = session.phase === "done";
  const phases = stage2Phases(session.concept);
  const phaseProgressIdx = phases.indexOf(session.phase);
  // Stage2NotationView already shows this exact equation, broken into place-value visuals, during
  // these two phases - the header card steps aside rather than showing a redundant second copy.
  const showWorkingAnswer = session.phase !== "notation" && session.phase !== "done";
  const quotientKnown = session.phase === "reveal";

  return (
    <AppShell>
      <ProgressBar count={phases.length} idx={phaseProgressIdx} />
      <Stage2Header
        committed={committed}
        concept={pendingConcept}
        onConceptChange={setPendingConcept}
        onVisualize={handleVisualize}
        mode={playback.mode}
        onToggleMode={() => playback.setMode(playback.mode === "auto" ? "manual" : "auto")}
        hideText={hideText}
        onToggleHideText={() => setHideText((h) => !h)}
      />
      <main className="flex-1 min-h-0 flex flex-col gap-2.5 px-4 py-3 max-w-[900px] w-full mx-auto">
        <DesktopRow>
          <Stage2QuestionRow committed={committed} concept={pendingConcept} onVisualize={handleVisualize} />
        </DesktopRow>
        <AnswerCardSlot show={showWorkingAnswer}>
          {session.total} ÷ {session.divisor} ={" "}
          {quotientKnown ? (
            <span
              key={session.phase}
              className="text-accent inline-block"
              style={{ animation: "pop-in 0.5s cubic-bezier(0.34,1.56,0.64,1)" }}
            >
              {session.quotient}
            </span>
          ) : (
            <span className="text-ink-3 opacity-50">?</span>
          )}
        </AnswerCardSlot>
        {session.phase !== "equation" && (
          <div className="flex-1 min-h-0 flex" style={{ animation: "fade-in-up 0.4s ease" }}>
            <Workspace wrapRef={wrapRef} workspaceRef={workspaceRef} scale={scale} loading={loading}>
              <Stage2Workspace session={session} hideText={hideText} />
            </Workspace>
          </div>
        )}
        {!hideText && <NarrationBox fragments={buildStage2Narration(session)} speakable={session.phase === "predict"} />}
      </main>
      {session.phase === "predict" ? (
        <Stage2PredictOptions
          session={session}
          hideText={hideText}
          onSelect={(value) => dispatch({ type: "SELECT_PREDICTION", value })}
        />
      ) : (
        <Footer
          mode={playback.mode}
          atStart={atStart || isAnimating}
          atEnd={atEnd || isAnimating}
          isPlaying={playback.isPlaying}
          onPrev={() => {
            playback.pause();
            dispatch({ type: "GO_BACK" });
          }}
          onNext={() => {
            playback.pause();
            dispatch({ type: "ADVANCE_PHASE" });
          }}
          onTogglePlay={playback.togglePlayPause}
        />
      )}
    </AppShell>
  );
}
