"use client";

import { createContext, useContext, useState } from "react";
import { useStage1Playback } from "@/hooks/useStage1Playback";
import { useStage1 } from "./Stage1Context";

type PlaybackValue = ReturnType<typeof useStage1Playback> & {
  hideText: boolean;
  toggleHideText: () => void;
};

const PlaybackContext = createContext<PlaybackValue | null>(null);

export function PlaybackProvider({ children }: { children: React.ReactNode }) {
  const { session, phases, phaseObj, dispatch } = useStage1();
  const playback = useStage1Playback({
    phaseIdx: session.phaseIdx,
    phaseCount: phases.length,
    isInteractive: phaseObj.type === "dragA" || phaseObj.type === "dragB" || phaseObj.type === "predict",
    dispatch,
  });
  // Lets a child experience the walkthrough without reading support - hides narration prose
  // (see NarrationBox) while leaving controls and numbers visible.
  const [hideText, setHideText] = useState(false);
  const value: PlaybackValue = {
    ...playback,
    hideText,
    toggleHideText: () => setHideText((h) => !h),
  };
  return <PlaybackContext.Provider value={value}>{children}</PlaybackContext.Provider>;
}

export function usePlaybackContext(): PlaybackValue {
  const ctx = useContext(PlaybackContext);
  if (!ctx) throw new Error("usePlaybackContext must be used within a <PlaybackProvider>");
  return ctx;
}
