"use client";

import { useEffect, useReducer } from "react";
import { stage1Reducer, createSession, type Stage1Action } from "@/lib/stage1/session";
import type { Stage1Config, Stage1Session } from "@/lib/stage1/types";
import { Stage1ContextProvider, buildStage1ContextValue } from "./Stage1Context";
import { PlaybackProvider } from "./PlaybackContext";
import { AppShell } from "@/components/addition/AppShell";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { NarrationBox } from "./NarrationBox";
import { PredictPrompt } from "./PredictPrompt";
import { Stage1Scene } from "./Stage1Scene";
import { Stage1PredictOptions } from "./Stage1PredictOptions";
import { Stage1HandHint } from "./Stage1HandHint";
import { ProgressBar } from "./ProgressBar";
import { DesktopOptionsRow } from "./DesktopOptionsRow";

const AUTO_ADVANCE_DELAY_MS = 400;

export function Stage1Walkthrough({ config }: { config: Stage1Config }) {
  const [session, dispatch] = useReducer(
    (state: Stage1Session, action: Stage1Action) => stage1Reducer(state, action, config.mcqMax),
    config,
    (cfg) => createSession(cfg.defaultA1, cfg.defaultA2),
  );

  const value = buildStage1ContextValue(config, session, dispatch);
  const { phaseObj } = value;

  // Mirrors the addition app's maybeAdvanceAfterDrag: once every dot in the active set has
  // landed in the box, move on by itself after a short pause so the child sees the finished
  // count before the screen changes - the drag itself is already the required action, there's
  // nothing left to tap.
  useEffect(() => {
    const done =
      (phaseObj.type === "dragA" && session.draggedA >= session.a1) ||
      (phaseObj.type === "dragB" && session.draggedB >= session.a2);
    if (!done) return;
    const timer = window.setTimeout(() => dispatch({ type: "ADVANCE_PHASE" }), AUTO_ADVANCE_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [phaseObj.type, session.draggedA, session.draggedB, session.a1, session.a2]);

  return (
    <Stage1ContextProvider value={value}>
      <PlaybackProvider>
        <AppShell>
          <ProgressBar />
          <Header />
          <main className="flex-1 min-h-0 flex flex-col gap-3 px-4 py-3 max-w-[900px] w-full mx-auto">
            <DesktopOptionsRow />
            <Stage1Scene />
            <PredictPrompt />
            <NarrationBox />
            <Stage1PredictOptions />
          </main>
          <Footer />
        </AppShell>
        <Stage1HandHint />
      </PlaybackProvider>
    </Stage1ContextProvider>
  );
}
