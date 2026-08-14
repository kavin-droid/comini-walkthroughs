"use client";

import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { Button } from "@/components/ds/Button";
import { IconButton } from "@/components/ds/IconButton";
import { usePlaceValue } from "./PlaceValueContext";
import { usePlaybackContext } from "./PlaybackContext";
import { useQuiz } from "./QuizContext";

export function Footer() {
  const { session, dispatch, steps } = usePlaceValue();
  const { mode, isPlaying, togglePlayPause } = usePlaybackContext();
  const { isLocked } = useQuiz();

  const atStart = session.stepIdx <= 0 || isLocked;
  const atEnd = session.stepIdx >= steps.length - 1 || isLocked;

  if (mode === "auto") {
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
        <IconButton
          aria-label={isPlaying ? "Pause" : "Play"}
          variant="primary"
          size={56}
          onClick={togglePlayPause}
        >
          {isPlaying ? <Pause size={22} /> : <Play size={22} />}
        </IconButton>
        <IconButton
          aria-label="Next"
          size={44}
          disabled={atEnd}
          onClick={() => dispatch({ type: "ADVANCE_STEP" })}
        >
          <ChevronRight size={20} />
        </IconButton>
      </footer>
    );
  }

  return (
    <footer className="flex items-center gap-3 px-4 py-3 border-t border-line shrink-0">
      <Button
        variant="secondary"
        className="flex-1"
        disabled={atStart}
        onClick={() => dispatch({ type: "GO_BACK" })}
      >
        ← Previous
      </Button>
      <Button
        variant="primary"
        className="flex-1"
        disabled={atEnd}
        onClick={() => dispatch({ type: "ADVANCE_STEP" })}
      >
        Next →
      </Button>
    </footer>
  );
}
