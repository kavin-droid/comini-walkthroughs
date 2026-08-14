"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { IconButton } from "@/components/ds/IconButton";

/** Two big icon buttons, nothing else - no "Previous"/"Next" text. `nextReady` gates the forward
 * button on a practice step's tap-triggered animation actually completing (demo steps are marked
 * ready immediately), the same "must engage before moving on" gate stage 2 uses, just without a
 * Check button or any verdict text to read. */
export function Stage1Footer({
  atStart,
  nextReady,
  onBack,
  onNext,
}: {
  atStart: boolean;
  nextReady: boolean;
  onBack: () => void;
  onNext: () => void;
}) {
  return (
    <footer className="flex items-center justify-center gap-6 px-4 py-4 border-t border-line shrink-0">
      <IconButton aria-label="Back" size={54} disabled={atStart} onClick={onBack}>
        <ChevronLeft size={24} />
      </IconButton>
      <IconButton aria-label="Next" variant="primary" size={54} disabled={!nextReady} onClick={onNext}>
        <ChevronRight size={24} />
      </IconButton>
    </footer>
  );
}
