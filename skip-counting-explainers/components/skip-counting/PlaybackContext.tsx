"use client";

import { createContext, useContext, type ReactNode } from "react";
import { usePlayback } from "@/hooks/usePlayback";
import { isInteractive } from "@/lib/skip-counting/phases";
import { useSkipCounting } from "./SkipCountingContext";

type PlaybackValue = ReturnType<typeof usePlayback>;

const PlaybackContext = createContext<PlaybackValue | null>(null);

export function PlaybackProvider({ children }: { children: ReactNode }) {
  const { session, phases, phaseObj, dispatch } = useSkipCounting();
  const playback = usePlayback({
    phaseIdx: session.phaseIdx,
    phaseCount: phases.length,
    interactive: isInteractive(phaseObj),
    dispatch,
  });
  return <PlaybackContext.Provider value={playback}>{children}</PlaybackContext.Provider>;
}

export function usePlaybackContext(): PlaybackValue {
  const ctx = useContext(PlaybackContext);
  if (!ctx) throw new Error("usePlaybackContext must be used within a <PlaybackProvider>");
  return ctx;
}
