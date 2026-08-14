"use client";

import { createContext, useContext, type ReactNode } from "react";
import { usePlayback } from "@/hooks/usePlayback";
import { isAwaitingInteraction } from "@/lib/multiplication/session";
import { useMultiplication } from "./MultiplicationContext";

type PlaybackValue = ReturnType<typeof usePlayback>;

const PlaybackContext = createContext<PlaybackValue | null>(null);

export function PlaybackProvider({ children }: { children: ReactNode }) {
  const { session, steps, step, dispatch } = useMultiplication();
  const awaitingAnswer = isAwaitingInteraction(step, session);
  const playback = usePlayback({
    stepIdx: session.stepIdx,
    stepCount: steps.length,
    awaitingAnswer,
    dispatch,
  });
  return <PlaybackContext.Provider value={playback}>{children}</PlaybackContext.Provider>;
}

export function usePlaybackContext(): PlaybackValue {
  const ctx = useContext(PlaybackContext);
  if (!ctx) throw new Error("usePlaybackContext must be used within a <PlaybackProvider>");
  return ctx;
}
