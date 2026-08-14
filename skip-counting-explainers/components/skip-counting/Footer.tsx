"use client";

import { ChevronLeft, ChevronRight, Pause, Play, RotateCcw } from "lucide-react";
import { Button } from "@/components/ds/Button";
import { IconButton } from "@/components/ds/IconButton";
import { isInteractive, isInteractiveJump } from "@/lib/skip-counting/phases";
import { useSkipCounting } from "./SkipCountingContext";
import { usePlaybackContext } from "./PlaybackContext";

export function Footer() {
  const { session, dispatch, phases, phaseObj } = useSkipCounting();
  const { mode, isPlaying, togglePlayPause } = usePlaybackContext();

  // While asking the child to tap the next number (line or grid), Prev/Next are hidden entirely
  // - the only way forward is a correct tap, and there's nothing sensible to go "back" to
  // mid-question. Only the line's wrong-tap hop needs a Try Again button; the grid's wrong taps
  // either grey out permanently or just give feedback, no reset step needed - another cell is
  // always immediately tappable.
  if (isInteractive(phaseObj)) {
    if (isInteractiveJump(phaseObj) && session.lastWrongTap !== null) {
      return (
        <footer className="flex items-center px-4 py-3 border-t border-line shrink-0">
          <Button
            variant="primary"
            fullWidth
            onClick={() => dispatch({ type: "RETRY" })}
          >
            <RotateCcw size={16} className="inline-block mr-1.5 -mt-0.5" />
            Try Again
          </Button>
        </footer>
      );
    }
    return (
      <footer className="flex items-center justify-center px-4 py-3 border-t border-line shrink-0">
        <span className="font-mono text-[12px] tracking-wide text-ink-3">
          {isInteractiveJump(phaseObj) ? "Tap the number line above ↑" : "Tap the grid above ↑"}
        </span>
      </footer>
    );
  }

  const atStart = session.phaseIdx <= 0;
  const atEnd = session.phaseIdx >= phases.length - 1;

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
          onClick={() => dispatch({ type: "ADVANCE_PHASE" })}
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
        onClick={() => dispatch({ type: "ADVANCE_PHASE" })}
      >
        Next →
      </Button>
    </footer>
  );
}
