"use client";

import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { Button } from "@/components/ds/Button";
import { IconButton } from "@/components/ds/IconButton";
import { useAddition } from "./AdditionContext";
import { usePlaybackContext } from "./PlaybackContext";

export function Footer() {
  const { session, dispatch, phases, phaseObj } = useAddition();
  const { mode, isPlaying, togglePlayPause } = usePlaybackContext();

  const isPredicting = phaseObj.type === "predict";

  const atStart = session.phaseIdx <= 0;
  const atEnd = session.phaseIdx >= phases.length - 1;
  const prevDisabled = atStart || phaseObj.type === "drag";

  let nextLabel = "Next →";
  let nextDisabled = atEnd;
  let nextVariant: "primary" | "secondary" = "primary";

  if (phaseObj.type === "drag") {
    const place = phaseObj.place;
    nextLabel = place && session.awaitingPack[place] ? "Pack them first ↑" : "Move the dots ↑";
    nextDisabled = true;
    nextVariant = "secondary";
  }

  if (mode === "auto") {
    return (
      <footer className="flex items-center justify-center gap-4 px-4 py-3 border-t border-line shrink-0">
        {!isPredicting && (
          <IconButton
            aria-label="Previous"
            size={44}
            disabled={prevDisabled}
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
        {!isPredicting && (
          <IconButton
            aria-label="Next"
            size={44}
            disabled={nextDisabled}
            onClick={() => dispatch({ type: "ADVANCE_PHASE" })}
          >
            <ChevronRight size={20} />
          </IconButton>
        )}
      </footer>
    );
  }

  if (isPredicting) {
    return <footer className="px-4 py-3 border-t border-line shrink-0" />;
  }

  return (
    <footer className="flex items-center gap-3 px-4 py-3 border-t border-line shrink-0">
      <Button
        variant="secondary"
        className="flex-1"
        disabled={prevDisabled}
        onClick={() => dispatch({ type: "GO_BACK" })}
      >
        ← Back
      </Button>
      <Button
        variant={nextVariant}
        className="flex-1"
        disabled={nextDisabled}
        onClick={() => dispatch({ type: "ADVANCE_PHASE" })}
      >
        {nextLabel}
      </Button>
    </footer>
  );
}
