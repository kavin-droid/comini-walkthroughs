"use client";

import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { Button } from "@/components/ds/Button";
import { IconButton } from "@/components/ds/IconButton";
import { useRounding } from "./RoundingContext";
import { usePlaybackContext } from "./PlaybackContext";

/** Unlike addition-explainers' Footer, the vanilla rounding apps never disable/hide Prev/Next
 * based on whether the active step is interactive (placeTap/closer) - `refresh()` only ever
 * gates the buttons on `atStart`/`atEnd`, and the manual Next button's click handler is a bare
 * `pausePlay(); goNext();` with no interactivity check. This is a deliberate departure from that:
 * while the MCQ ("closer" step) is unanswered, Prev/Next are hidden entirely rather than merely
 * disabled - the child must answer it to proceed (mirrors addition-explainers' own Footer, which
 * hides Prev/Next during its "predict" MCQ phase the same way). Play/Pause stays visible in auto
 * mode; autoplay was already gated off an active MCQ via usePlayback, so it just sits paused. */
export function Footer() {
  const { session, step, dispatch } = useRounding();
  const { mode, isPlaying, togglePlayPause } = usePlaybackContext();

  const atStart = session.stepIdx <= 0;
  const atEnd = session.stepIdx >= session.steps.length - 1;
  const mcqActive = step.view === "closer" && !session.mcqAnswered;

  if (mode === "auto") {
    return (
      <footer className="flex items-center justify-center gap-4 px-4 py-3 border-t border-line shrink-0">
        {!mcqActive && (
          <IconButton
            aria-label="Previous step"
            size={44}
            disabled={atStart}
            onClick={() => dispatch({ type: "GO_BACK" })}
          >
            <ChevronLeft size={20} />
          </IconButton>
        )}
        <IconButton
          aria-label={isPlaying ? "Pause" : "Play"}
          variant="primary"
          size={56}
          onClick={togglePlayPause}
          className={isPlaying ? "bg-accent border-accent" : undefined}
        >
          {isPlaying ? <Pause size={22} /> : <Play size={22} />}
        </IconButton>
        {!mcqActive && (
          <IconButton
            aria-label="Next step"
            size={44}
            disabled={atEnd}
            onClick={() => dispatch({ type: "ADVANCE_PHASE" })}
          >
            <ChevronRight size={20} />
          </IconButton>
        )}
      </footer>
    );
  }

  if (mcqActive) {
    return <footer className="px-4 py-3 border-t border-line shrink-0" />;
  }

  return (
    <footer className="flex items-center gap-3 px-4 py-3 border-t border-line shrink-0">
      <Button
        variant="secondary"
        aria-label="Previous"
        className="flex-1"
        disabled={atStart}
        onClick={() => dispatch({ type: "GO_BACK" })}
      >
        ←
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
