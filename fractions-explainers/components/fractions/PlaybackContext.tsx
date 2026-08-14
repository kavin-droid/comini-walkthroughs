"use client";

import { createContext, useContext, type ReactNode } from "react";
import { usePlayback } from "@/hooks/usePlayback";
import { isInteractiveStep } from "@/lib/fractions/types";
import { useFractions } from "./FractionContext";

type PlaybackValue = ReturnType<typeof usePlayback>;

const PlaybackContext = createContext<PlaybackValue | null>(null);

export function PlaybackProvider({ children }: { children: ReactNode }) {
  const { session, steps, step, dispatch } = useFractions();
  const playback = usePlayback({
    stepIdx: session.stepIdx,
    stepCount: steps.length,
    awaitingAnswer: isInteractiveStep(step) && !session.solved,
    dispatch,
  });
  return <PlaybackContext.Provider value={playback}>{children}</PlaybackContext.Provider>;
}

export function usePlaybackContext(): PlaybackValue {
  const ctx = useContext(PlaybackContext);
  if (!ctx) throw new Error("usePlaybackContext must be used within a <PlaybackProvider>");
  return ctx;
}
