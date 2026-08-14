"use client";

import { useReducer } from "react";
import { roundingReducer, createSession, type SessionAction } from "@/lib/rounding/session";
import type { RoundingConfig, Session } from "@/lib/rounding/types";
import { RoundingContextProvider, buildRoundingContextValue } from "./RoundingContext";
import { PlaybackProvider } from "./PlaybackContext";
import { VisualizingProvider } from "./VisualizingContext";
import { NarrationOverrideProvider } from "./NarrationOverrideContext";
import { NarrationVisibilityProvider } from "./NarrationVisibilityContext";
import { CloserProvider } from "./CloserContext";
import { AppShell } from "./AppShell";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { AnswerCard } from "./AnswerCard";
import { NarrationBox } from "./NarrationBox";
import { Workspace } from "./Workspace";
import { McqOptions } from "./McqOptions";
import { ProgressBar } from "./ProgressBar";
import { DesktopOptionsRow } from "./DesktopOptionsRow";
import { Confetti } from "./Confetti";

export function RoundingWalkthrough({ config }: { config: RoundingConfig }) {
  const [session, dispatch] = useReducer(
    (state: Session, action: SessionAction) => roundingReducer(state, action),
    config,
    (cfg) => createSession(cfg.defaultNumber, cfg.defaultRoundTo),
  );

  const value = buildRoundingContextValue(config, session, dispatch);

  return (
    <RoundingContextProvider value={value}>
      <VisualizingProvider>
        <PlaybackProvider>
          <NarrationOverrideProvider>
            <NarrationVisibilityProvider>
              <CloserProvider key={session.stepIdx}>
                <AppShell>
                  <ProgressBar />
                  <Header />
                  <main className="flex-1 min-h-0 flex flex-col gap-3 px-4 py-3 max-w-[900px] w-full mx-auto">
                    <DesktopOptionsRow />
                    <AnswerCard />
                    <Workspace />
                    <NarrationBox />
                    <McqOptions />
                  </main>
                  <Footer />
                </AppShell>
                <Confetti />
              </CloserProvider>
            </NarrationVisibilityProvider>
          </NarrationOverrideProvider>
        </PlaybackProvider>
      </VisualizingProvider>
    </RoundingContextProvider>
  );
}
