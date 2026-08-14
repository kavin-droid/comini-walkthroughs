"use client";

import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { Button } from "@/components/ds/Button";
import { IconButton } from "@/components/ds/IconButton";
import { useCompareOrder } from "./CompareOrderContext";
import { usePlaybackContext } from "./PlaybackContext";

export function Footer() {
  const { session, step, dispatch } = useCompareOrder();
  const { mode, isPlaying, togglePlayPause } = usePlaybackContext();

  const atStart = session.idx <= 0;
  const unanswered = step.requiresTap && session.tapStatus !== "correct";
  const atEnd = session.idx >= session.steps.length - 1 || unanswered;

  if (mode === "auto") {
    return (
      <footer className="flex items-center justify-center gap-4 px-4 py-3 border-t border-line shrink-0">
        <IconButton
          aria-label="Previous step"
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
          aria-label="Next step"
          size={44}
          disabled={atEnd}
          onClick={() => dispatch({ type: "ADVANCE" })}
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
        onClick={() => dispatch({ type: "ADVANCE" })}
      >
        Next →
      </Button>
    </footer>
  );
}
