"use client";

import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { IconButton } from "@/components/ds/IconButton";
import { useStage1 } from "./Stage1Context";
import { usePlaybackContext } from "./PlaybackContext";

/** Icon-only controls in both modes - this audience can't read "Previous"/"Next". dragA/dragB
 * disable Next entirely (they auto-advance themselves once every dot lands - see
 * Stage1Walkthrough's effect - the drag itself is the required action). "predict" hides the
 * footer altogether, same as the addition app's predict phase - picking an MCQ option is what
 * advances, there's nothing for Previous/Next to do mid-question. */
export function Footer() {
  const { session, dispatch, phases, phaseObj } = useStage1();
  const { mode, isPlaying, togglePlayPause } = usePlaybackContext();

  const isPredicting = phaseObj.type === "predict";
  const atStart = session.phaseIdx <= 0;
  const atEnd = session.phaseIdx >= phases.length - 1;
  const isDeadEndDrag = phaseObj.type === "dragA" || phaseObj.type === "dragB";
  const nextDisabled = atEnd || isDeadEndDrag;

  if (isPredicting) {
    return <footer className="px-4 py-3 border-t border-line shrink-0" />;
  }

  return (
    <footer className="flex items-center justify-center gap-4 px-4 py-3 border-t border-line shrink-0">
      <IconButton
        aria-label="Previous"
        size={44}
        disabled={atStart}
        onClick={() => dispatch({ type: "GO_BACK" })}
      >
        <ChevronLeft size={20} />
      </IconButton>
      {mode === "auto" && (
        <IconButton
          aria-label={isPlaying ? "Pause" : "Play"}
          variant="primary"
          size={56}
          onClick={togglePlayPause}
        >
          {isPlaying ? <Pause size={22} /> : <Play size={22} />}
        </IconButton>
      )}
      <IconButton
        aria-label="Next"
        size={44}
        disabled={nextDisabled}
        onClick={() => dispatch({ type: "ADVANCE_PHASE" })}
      >
        <ChevronRight size={20} />
      </IconButton>
    </footer>
  );
}
