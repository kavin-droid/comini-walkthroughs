"use client";

import { createContext, useContext, type ReactNode } from "react";
import { usePlayback } from "@/hooks/usePlayback";
import { useCompareOrder } from "./CompareOrderContext";

type PlaybackValue = ReturnType<typeof usePlayback>;

const PlaybackContext = createContext<PlaybackValue | null>(null);

export function PlaybackProvider({ children }: { children: ReactNode }) {
  const { session, step, dispatch } = useCompareOrder();
  const interactive = step.requiresTap && session.tapStatus !== "correct";
  const playback = usePlayback({ idx: session.idx, total: session.steps.length, interactive, dispatch });
  return <PlaybackContext.Provider value={playback}>{children}</PlaybackContext.Provider>;
}

export function usePlaybackContext(): PlaybackValue {
  const ctx = useContext(PlaybackContext);
  if (!ctx) throw new Error("usePlaybackContext must be used within a <PlaybackProvider>");
  return ctx;
}
