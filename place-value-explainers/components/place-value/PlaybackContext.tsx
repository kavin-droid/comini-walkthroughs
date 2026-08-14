"use client";

import { createContext, useContext, type ReactNode } from "react";
import { usePlayback } from "@/hooks/usePlayback";
import { usePlaceValue } from "./PlaceValueContext";
import { useQuiz } from "./QuizContext";

type PlaybackValue = ReturnType<typeof usePlayback>;

const PlaybackContext = createContext<PlaybackValue | null>(null);

export function PlaybackProvider({ children }: { children: ReactNode }) {
  const { session, steps, dispatch } = usePlaceValue();
  const { isLocked } = useQuiz();
  const playback = usePlayback({
    stepIdx: session.stepIdx,
    stepCount: steps.length,
    dispatch,
    isLocked,
  });
  return <PlaybackContext.Provider value={playback}>{children}</PlaybackContext.Provider>;
}

export function usePlaybackContext(): PlaybackValue {
  const ctx = useContext(PlaybackContext);
  if (!ctx) throw new Error("usePlaybackContext must be used within a <PlaybackProvider>");
  return ctx;
}
