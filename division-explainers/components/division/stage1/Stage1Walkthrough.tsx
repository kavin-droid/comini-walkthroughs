"use client";

import { useReducer, useState } from "react";
import {
  STAGE1_META,
  STAGE1_PHASES,
  buildStage1Narration,
  createStage1Session,
  stage1Reducer,
} from "@/lib/division/stage1";
import type { Stage1Committed } from "@/hooks/useStage1Form";
import { useStage1Playback } from "@/hooks/useStage1Playback";
import { useStage1Ticker } from "@/hooks/useStage1Ticker";
import { useFitWorkspace } from "@/hooks/useFitWorkspace";
import { AppShell } from "@/components/division/shared/AppShell";
import { ProgressBar } from "@/components/division/shared/ProgressBar";
import { AnswerCardSlot } from "@/components/division/shared/AnswerCardSlot";
import { NarrationBox } from "@/components/division/shared/NarrationBox";
import { Footer } from "@/components/division/shared/Footer";
import { Workspace } from "@/components/division/shared/Workspace";
import { DesktopRow } from "@/components/division/shared/DesktopRow";
import { Stage1Header } from "./Stage1Header";
import { Stage1QuestionRow } from "./Stage1QuestionRow";
import { Stage1Workspace } from "./Stage1Workspace";

const INITIAL: Stage1Committed = {
  total: STAGE1_META.defaultTotal,
  people: STAGE1_META.defaultPeople,
};

export function Stage1Walkthrough() {
  const [session, dispatch] = useReducer(
    stage1Reducer,
    INITIAL,
    (init) => createStage1Session(init.total, init.people),
  );
  const [loading, setLoading] = useState(false);
  const [hideText, setHideText] = useState(false);

  const playback = useStage1Playback(session.phase, dispatch);
  useStage1Ticker(session, dispatch);
  const { wrapRef, workspaceRef, scale } = useFitWorkspace([session]);

  const committed: Stage1Committed = { total: session.total, people: session.people };

  function handleVisualize(next: Stage1Committed) {
    playback.pause();
    setLoading(true);
    window.setTimeout(() => {
      dispatch({ type: "RESTART", total: next.total, people: next.people });
      setLoading(false);
      playback.resumeIfAuto();
    }, 450);
  }

  const previewTarget = session.phase === "pile-reveal" ? session.total : session.phase === "people-reveal" ? session.people : null;
  const previewBusy = previewTarget !== null && session.previewCount < previewTarget;
  const distributeBusy = session.phase === "distribute" && session.dotsPlaced < session.total;
  const isAnimating = previewBusy || distributeBusy;
  const atStart = session.phase === "pile-reveal";
  const atEnd = session.phase === "done";
  const phaseProgressIdx = STAGE1_PHASES.indexOf(session.phase);
  const answerKnown = session.phase === "celebrate" || session.phase === "recap" || session.phase === "done";
  // Stage1Equation already shows this exact equation, highlighted, inside the canvas during these
  // two phases - the header card steps aside rather than showing a redundant second copy.
  const showWorkingAnswer = session.phase !== "pile-reveal" && session.phase !== "people-reveal";

  return (
    <AppShell>
      <ProgressBar count={STAGE1_PHASES.length} idx={phaseProgressIdx} />
      <Stage1Header
        committed={committed}
        onVisualize={handleVisualize}
        mode={playback.mode}
        onToggleMode={() => playback.setMode(playback.mode === "auto" ? "manual" : "auto")}
        hideText={hideText}
        onToggleHideText={() => setHideText((h) => !h)}
      />
      <main className="flex-1 min-h-0 flex flex-col gap-2.5 px-4 py-3 max-w-[900px] w-full mx-auto">
        <DesktopRow>
          <Stage1QuestionRow committed={committed} onVisualize={handleVisualize} />
        </DesktopRow>
        <AnswerCardSlot show={showWorkingAnswer}>
          {session.total} ÷ {session.people} ={" "}
          {answerKnown ? (
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
        <Workspace wrapRef={wrapRef} workspaceRef={workspaceRef} scale={scale} loading={loading}>
          <Stage1Workspace session={session} onShareItem={() => dispatch({ type: "SHARE_ITEM" })} />
        </Workspace>
        {!hideText && <NarrationBox fragments={buildStage1Narration(session)} />}
      </main>
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
    </AppShell>
  );
}
