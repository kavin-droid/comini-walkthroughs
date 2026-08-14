"use client";

import { useReducer } from "react";
import { createSession, fractionReducer, type Session, type SessionAction } from "@/lib/fractions/session";
import type { FractionConfig } from "@/lib/fractions/types";
import { TextVisibilityProvider } from "@/components/shared/TextVisibilityContext";
import { FractionContextProvider, buildFractionContextValue } from "./FractionContext";
import { PlaybackProvider } from "./PlaybackContext";
import { VisualizeFormProvider } from "./VisualizeFormContext";
import { AppShell } from "./AppShell";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { AnswerCard } from "./AnswerCard";
import { NarrationBox } from "./NarrationBox";
import { ProgressBar } from "./ProgressBar";
import { DesktopOptionsRow } from "./DesktopOptionsRow";
import { Workspace } from "./Workspace";

export function FractionWalkthrough({ config }: { config: FractionConfig }) {
  const [session, dispatch] = useReducer(
    (state: Session, action: SessionAction) => fractionReducer(state, action, config),
    config,
    createSession,
  );

  const value = buildFractionContextValue(config, session, dispatch);

  return (
    <TextVisibilityProvider>
      <FractionContextProvider value={value}>
        <VisualizeFormProvider>
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
          </PlaybackProvider>
        </VisualizeFormProvider>
      </FractionContextProvider>
    </TextVisibilityProvider>
  );
}
