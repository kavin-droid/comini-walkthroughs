"use client";

import { createContext, useContext, type ReactNode } from "react";
import { usePlayback } from "@/hooks/usePlayback";
import { useRounding } from "./RoundingContext";

type PlaybackValue = ReturnType<typeof usePlayback>;

const PlaybackContext = createContext<PlaybackValue | null>(null);

export function PlaybackProvider({ children }: { children: ReactNode }) {
  const { session, step, dispatch } = useRounding();
  const playback = usePlayback({
    stepIdx: session.stepIdx,
    stepCount: session.steps.length,
    step,
    placed: session.placed,
    mcqAnswered: session.mcqAnswered,
    dispatch,
  });
  return <PlaybackContext.Provider value={playback}>{children}</PlaybackContext.Provider>;
}

export function usePlaybackContext(): PlaybackValue {
  const ctx = useContext(PlaybackContext);
  if (!ctx) throw new Error("usePlaybackContext must be used within a <PlaybackProvider>");
  return ctx;
}
