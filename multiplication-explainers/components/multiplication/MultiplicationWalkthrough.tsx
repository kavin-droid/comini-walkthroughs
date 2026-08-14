"use client";

import { useReducer } from "react";
import { createSession, multiplicationReducer, type SessionAction, type Session } from "@/lib/multiplication/session";
import type { MultiplicationConfig } from "@/lib/multiplication/types";
import { MultiplicationContextProvider, buildMultiplicationContextValue } from "./MultiplicationContext";
import { PlaybackProvider } from "./PlaybackContext";
import { VisualizeFormProvider } from "./VisualizeFormContext";
import { TextVisibilityProvider } from "./TextVisibilityContext";
import { CombineCountProvider } from "./CombineCountContext";
import { AppShell } from "./AppShell";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { AnswerCard } from "./AnswerCard";
import { NumericPanel } from "./NumericPanel";
import { NarrationBox } from "./NarrationBox";
import { ProgressBar } from "./ProgressBar";
import { DesktopOptionsRow } from "./DesktopOptionsRow";
import { Workspace } from "./Workspace";
import { QuestionOptions } from "./QuestionOptions";
import { Confetti } from "./Confetti";

export function MultiplicationWalkthrough({ config }: { config: MultiplicationConfig }) {
  const [session, dispatch] = useReducer(
    (state: Session, action: SessionAction) => multiplicationReducer(state, action, config),
    config,
    (cfg) => createSession(cfg.defaultFactorA, cfg.defaultFactorB, cfg),
  );

  const value = buildMultiplicationContextValue(config, session, dispatch);

  return (
    <MultiplicationContextProvider value={value}>
      <VisualizeFormProvider>
        <TextVisibilityProvider>
          <PlaybackProvider>
            <CombineCountProvider>
              <Confetti />
              <AppShell>
                <ProgressBar />
                <Header />
                <main className="flex-1 min-h-0 flex flex-col gap-3 px-4 py-3 max-w-[900px] w-full mx-auto">
                  <DesktopOptionsRow />
                  {value.step.kind === "arrayMultiply" ? (
                    <div className="relative flex-1 min-h-0 flex flex-row gap-2.5 min-[900px]:gap-3">
                      <NumericPanel />
                      <Workspace />
                    </div>
                  ) : (
                    <>
                      <AnswerCard />
                      <Workspace />
                    </>
                  )}
                  <NarrationBox />
                  <QuestionOptions />
                </main>
                <Footer />
              </AppShell>
            </CombineCountProvider>
          </PlaybackProvider>
        </TextVisibilityProvider>
      </VisualizeFormProvider>
    </MultiplicationContextProvider>
  );
}
