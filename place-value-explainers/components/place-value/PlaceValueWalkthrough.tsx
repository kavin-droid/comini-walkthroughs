"use client";

import { useReducer } from "react";
import { createSession, placeValueReducer, type SessionAction, type Session } from "@/lib/place-value/session";
import type { PlaceValueConfig } from "@/lib/place-value/types";
import { PlaceValueContextProvider, buildPlaceValueContextValue } from "./PlaceValueContext";
import { QuizProvider } from "./QuizContext";
import { PlaybackProvider } from "./PlaybackContext";
import { VisualizeFormProvider } from "./VisualizeFormContext";
import { TextVisibilityProvider } from "./TextVisibilityContext";
import { AppShell } from "./AppShell";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { AnswerCard } from "./AnswerCard";
import { NarrationBox } from "./NarrationBox";
import { ProgressBar } from "./ProgressBar";
import { DesktopOptionsRow } from "./DesktopOptionsRow";
import { Workspace } from "./Workspace";
import { QuizOptions } from "./QuizOptions";

export function PlaceValueWalkthrough({ config }: { config: PlaceValueConfig }) {
  const [session, dispatch] = useReducer(
    (state: Session, action: SessionAction) => placeValueReducer(state, action, config),
    config,
    (cfg) => createSession(cfg.defaultNumber, cfg),
  );

  const value = buildPlaceValueContextValue(config, session, dispatch);

  return (
    <PlaceValueContextProvider value={value}>
      <QuizProvider>
        <VisualizeFormProvider>
          <PlaybackProvider>
            <TextVisibilityProvider>
              <AppShell>
                <ProgressBar />
                <Header />
                <main className="flex-1 min-h-0 flex flex-col gap-3 px-4 py-3 max-w-[900px] w-full mx-auto">
                  <DesktopOptionsRow />
                  <AnswerCard />
                  <Workspace />
                  <NarrationBox />
                  <QuizOptions />
                </main>
                <Footer />
              </AppShell>
            </TextVisibilityProvider>
          </PlaybackProvider>
        </VisualizeFormProvider>
      </QuizProvider>
    </PlaceValueContextProvider>
  );
}
