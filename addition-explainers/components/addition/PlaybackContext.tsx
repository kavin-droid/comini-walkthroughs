"use client";

import { createContext, useContext, useState } from "react";
import { usePlayback } from "@/hooks/usePlayback";
import { useAddition } from "./AdditionContext";

type PlaybackValue = ReturnType<typeof usePlayback> & {
  hideText: boolean;
  toggleHideText: () => void;
};

const PlaybackContext = createContext<PlaybackValue | null>(null);

export function PlaybackProvider({ children }: { children: React.ReactNode }) {
  const { session, phases, phaseObj, dispatch } = useAddition();
  const playback = usePlayback({
    phaseIdx: session.phaseIdx,
    phaseCount: phases.length,
    phaseObj,
    dispatch,
  });
  // Lets a child experience the walkthrough without reading support - hides narration/feedback
  // prose (see NarrationBox, PackPrompt, CompareBanner) while leaving controls and numbers
  // visible. Lives here (not the domain reducer) since it's a UI/session preference, same
  // reasoning as `mode`/`isPlaying` above.
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
