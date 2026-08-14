"use client";

import { cn } from "@/lib/utils";
import { buildStage3Narration, type Stage3Session } from "@/lib/division/stage3";
import { fragmentsToText } from "@/lib/division/types";
import { NarrationFragments } from "@/components/division/shared/NarrationFragments";
import { SpeakerButton } from "@/components/division/shared/SpeakerButton";

/** The MCQ's own question ("How many groups of 4 fit into 7 tens?") is not flavor text - it's the
 * instruction for what the buttons below even mean, so it stays visible even with the hideText
 * toggle on, same treatment Stage2PredictOptions gets. Only rendered here when hideText is
 * actually on - otherwise NarrationBox above already shows this same text. */
export function Stage3PredictOptions({
  session,
  options,
  hideText,
  onSelect,
}: {
  session: Stage3Session;
  options: number[];
  hideText: boolean;
  onSelect: (value: number) => void;
}) {
  return (
    <footer className="shrink-0 flex flex-col items-center gap-2 px-4 py-3 border-t border-line">
      {hideText && (
        <div className="flex items-center gap-2.5 max-w-[320px]">
          <SpeakerButton text={fragmentsToText(buildStage3Narration(session))} />
          <p className="font-serif text-[14px] leading-snug text-ink text-center flex-1">
            <NarrationFragments fragments={buildStage3Narration(session)} />
          </p>
        </div>
      )}
      <div className="flex justify-center gap-3.5">
        {options.map((value) => (
          <button
            key={value}
            onClick={() => onSelect(value)}
            className={cn(
              "w-14 h-14 rounded-2xl bg-card border-2 border-line font-mono text-xl font-bold text-ink",
              "hover:border-accent hover:bg-paper-2 transition-colors",
            )}
          >
            {value}
          </button>
        ))}
      </div>
    </footer>
  );
}
