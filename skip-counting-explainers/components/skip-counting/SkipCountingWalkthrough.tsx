"use client";

import { useReducer } from "react";
import { createSession, skipCountingReducer, type SessionAction } from "@/lib/skip-counting/session";
import { isDone } from "@/lib/skip-counting/phases";
import type { Session, SkipCountingConfig } from "@/lib/skip-counting/types";
import { SkipCountingContextProvider, buildSkipCountingContextValue } from "./SkipCountingContext";
import { PlaybackProvider } from "./PlaybackContext";
import { ToastProvider } from "./ToastContext";
import { InstructionsVisibilityProvider } from "./InstructionsVisibilityContext";
import { AppShell } from "./AppShell";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { AnswerCard } from "./AnswerCard";
import { NarrationBox } from "./NarrationBox";
import { Workspace } from "./Workspace";
import { ProgressBar } from "./ProgressBar";
import { DesktopOptionsRow } from "./DesktopOptionsRow";
import { HandHint } from "./HandHint";
import { Confetti } from "./Confetti";

export function SkipCountingWalkthrough({ config }: { config: SkipCountingConfig }) {
  const [session, dispatch] = useReducer(
    (state: Session, action: SessionAction) => skipCountingReducer(state, action),
    config,
    (cfg) => createSession(cfg.defaultStart, cfg.defaultDir, cfg.defaultStep, cfg.defaultJumps),
  );

  const value = buildSkipCountingContextValue(config, session, dispatch);

  return (
    <SkipCountingContextProvider value={value}>
      <PlaybackProvider>
        <ToastProvider>
          <InstructionsVisibilityProvider>
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
            <Confetti active={isDone(value.phaseObj)} />
          </InstructionsVisibilityProvider>
        </ToastProvider>
      </PlaybackProvider>
    </SkipCountingContextProvider>
  );
}
