"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { useSubtractionPlayback } from "@/hooks/useSubtractionPlayback";
import { useSubtraction } from "./SubtractionContext";

type PlaybackValue = ReturnType<typeof useSubtractionPlayback> & {
  hideText: boolean;
  setHideText: (value: boolean) => void;
};

const PlaybackContext = createContext<PlaybackValue | null>(null);

export function PlaybackProvider({ children }: { children: ReactNode }) {
  const { session, phases, phaseObj, dispatch } = useSubtraction();
  const playback = useSubtractionPlayback({
    phaseIdx: session.phaseIdx,
    phaseCount: phases.length,
    phaseObj,
    dispatch,
  });
  // Independent of playback timing/mode - a display preference, not session/reducer state, so it
  // deliberately does NOT reset on RESTART (a child re-visualizing a new pair of numbers while in
  // "no text" mode should stay in "no text" mode).
  const [hideText, setHideText] = useState(false);
  const value: PlaybackValue = { ...playback, hideText, setHideText };
  return <PlaybackContext.Provider value={value}>{children}</PlaybackContext.Provider>;
}

export function usePlaybackContext(): PlaybackValue {
  const ctx = useContext(PlaybackContext);
  if (!ctx) throw new Error("usePlaybackContext must be used within a <PlaybackProvider>");
  return ctx;
}
