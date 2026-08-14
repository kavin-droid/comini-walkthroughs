"use client";

import { useEffect, useReducer, useState } from "react";
import { compareOrderReducer, createSession, type SessionAction } from "@/lib/compare-order/session";
import type { CompareOrderConfig, Session } from "@/lib/compare-order/types";
import { CompareOrderContextProvider } from "./CompareOrderContext";
import { PlaybackProvider } from "./PlaybackContext";
import { AppShell } from "./AppShell";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { AnswerCard } from "./AnswerCard";
import { NarrationBox } from "./NarrationBox";
import { Workspace } from "./Workspace";
import { ProgressBar } from "./ProgressBar";
import { DesktopOptionsRow } from "./DesktopOptionsRow";
import { HandHint } from "./HandHint";

const VISUALIZE_DELAY_MS = 450;
const CORRECT_ADVANCE_DELAY_MS = 900;
const WRONG_CLEAR_DELAY_MS = 700;

export function CompareOrderWalkthrough({ config }: { config: CompareOrderConfig }) {
  const [session, dispatch] = useReducer(
    (state: Session, action: SessionAction) => compareOrderReducer(state, action, config),
    config,
    (cfg) => createSession(cfg.defaultValues, cfg),
  );
  const [loading, setLoading] = useState(false);
  const [instructionsVisible, setInstructionsVisible] = useState(true);

  function visualize(values: number[]) {
    setLoading(true);
    window.setTimeout(() => {
      dispatch({ type: "VISUALIZE", values });
      setLoading(false);
    }, VISUALIZE_DELAY_MS);
  }

  // Once a tap is confirmed correct, show the reveal for a beat, then move on automatically -
  // "proceed to move the correct to the spot below" without needing a separate Next tap.
  useEffect(() => {
    if (session.tapStatus !== "correct") return;
    const timer = window.setTimeout(() => dispatch({ type: "ADVANCE" }), CORRECT_ADVANCE_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [session.tapStatus, session.idx]);

  // A wrong tap's shake/highlight is momentary - clear it so the card returns to its normal
  // tappable state and the learner can try again.
  useEffect(() => {
    if (session.tapStatus !== "wrong") return;
    const timer = window.setTimeout(() => dispatch({ type: "CLEAR_WRONG" }), WRONG_CLEAR_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [session.tapStatus, session.wrongTapValue]);

  const value = {
    config,
    session,
    dispatch,
    step: session.steps[session.idx],
    loading,
    visualize,
    instructionsVisible,
    toggleInstructions: () => setInstructionsVisible((v) => !v),
  };

  return (
    <CompareOrderContextProvider value={value}>
      <PlaybackProvider>
        <AppShell>
          <ProgressBar />
          <Header />
          <main className="flex-1 min-h-0 flex flex-col gap-3 px-4 py-3 max-w-[900px] w-full mx-auto">
            <DesktopOptionsRow />
            <AnswerCard />
            <Workspace />
            <NarrationBox />
          </main>
          <Footer />
        </AppShell>
        <HandHint />
      </PlaybackProvider>
    </CompareOrderContextProvider>
  );
}
