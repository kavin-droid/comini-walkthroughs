"use client";

import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { Button } from "@/components/ds/Button";
import { IconButton } from "@/components/ds/IconButton";
import { useStage1 } from "./Stage1Context";

/** Pixel/behavior-identical structure to subtraction/Footer.tsx (round-11: "controls should be
 * the same across all stages") - auto mode shows icon-only Prev/Play-Pause/Next, manual mode shows
 * labelled Previous/Next buttons (the tap-prompt label stays even with hideText on - round-18),
 * and an MCQ-answer step (take-away's "ask how many are left") hides Prev/Next entirely exactly
 * like stage2/3 hides them during `predict`, handing control to the MCQ component itself. */
export function Stage1Footer() {
  const { state, steps, step, mode, dispatch, isPlaying, togglePlayPause } = useStage1();

  const isAsking = step.view === "takeAway" && step.askRemaining && !step.revealAnswer;

  const atStart = state.stepIdx <= 0;
  const atEnd = state.stepIdx >= steps.length - 1;
  const prevDisabled = atStart;

  let nextLabel = "Next →";
  let nextDisabled = atEnd || !!step.requiresTap;
  const nextVariant: "primary" | "secondary" = "primary";

  if (step.requiresTap) {
    nextLabel = step.view === "countBack" ? "Tap the next spot ↑" : step.view === "takeAway" ? "Tap it out ↑" : "Tap to continue ↑";
  }

  if (mode === "auto") {
    return (
      <footer className="flex items-center justify-center gap-4 px-4 py-3 border-t border-line shrink-0">
        {!isAsking && (
          <IconButton aria-label="Previous" size={44} disabled={prevDisabled} onClick={() => dispatch({ type: "BACK" })}>
            <ChevronLeft size={20} />
          </IconButton>
        )}
        <IconButton aria-label={isPlaying ? "Pause" : "Play"} variant="primary" size={56} onClick={togglePlayPause}>
          {isPlaying ? <Pause size={22} /> : <Play size={22} />}
        </IconButton>
        {!isAsking && (
          <IconButton aria-label="Next" size={44} disabled={nextDisabled} onClick={() => dispatch({ type: "ADVANCE" })}>
            <ChevronRight size={20} />
          </IconButton>
        )}
      </footer>
    );
  }

  if (isAsking) {
    return <footer className="px-4 py-3 border-t border-line shrink-0" />;
  }

  // A manual-mode tap prompt label is action-oriented, so it stays on screen even with hideText
  // on (round-18) - no separate icon-only fallback needed anymore.
  return (
    <footer className="flex items-center gap-3 px-4 py-3 border-t border-line shrink-0">
      <Button variant="secondary" className="flex-1" disabled={prevDisabled} onClick={() => dispatch({ type: "BACK" })}>
        ← Previous
      </Button>
      <Button variant={nextVariant} className="flex-1" disabled={nextDisabled} onClick={() => dispatch({ type: "ADVANCE" })}>
        {nextLabel}
      </Button>
    </footer>
  );
}
