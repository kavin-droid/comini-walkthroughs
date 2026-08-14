"use client";

import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { Button } from "@/components/ds/Button";
import { IconButton } from "@/components/ds/IconButton";
import { isAwaitingInteraction } from "@/lib/multiplication/session";
import { useMultiplication } from "./MultiplicationContext";
import { usePlaybackContext } from "./PlaybackContext";

export function Footer() {
  const { session, dispatch, steps, step } = useMultiplication();
  const { mode, isPlaying, togglePlayPause } = usePlaybackContext();

  const atStart = session.stepIdx <= 0;
  const atEnd = session.stepIdx >= steps.length - 1;
  // Answering (or, on the distributive split step, pressing Split) is what advances instead - see
  // isAwaitingInteraction. Next/auto's forward control stay hidden rather than merely disabled,
  // same as the addition apps' predict phase, so there's no dead button competing with the actual
  // tap target below the narration.
  const awaitingAnswer = isAwaitingInteraction(step, session);

  if (mode === "auto") {
    return (
      <footer className="flex items-center justify-center gap-4 px-4 py-3 border-t border-line shrink-0">
        {!awaitingAnswer && (
          <IconButton
            aria-label="Previous"
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
        >
          {isPlaying ? <Pause size={22} /> : <Play size={22} />}
        </IconButton>
        {!awaitingAnswer && (
          <IconButton
            aria-label="Next"
            size={44}
            disabled={atEnd}
            onClick={() => dispatch({ type: "ADVANCE_STEP" })}
          >
            <ChevronRight size={20} />
          </IconButton>
        )}
      </footer>
    );
  }

  if (awaitingAnswer) {
    return <footer className="px-4 py-3 border-t border-line shrink-0" />;
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
