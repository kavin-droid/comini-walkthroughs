"use client";

import { useEffect, useState } from "react";
import { HundredsGroupsField } from "./HundredsGroupsField";
import type { RodsOnesStep } from "@/lib/place-value/types";

const NUMBER_HOLD_MS = 900;
const NUMBER_FADE_MS = 500;

function sleep(ms: number) {
  return new Promise<void>((resolve) => window.setTimeout(resolve, ms));
}

/** Stage 3's "highlight" phase mirrors stage 2's counting reveal: opens on the exact same layout
 * as the "loose" phase (number above the unhighlighted field), holds it briefly, fades only the
 * number out while the field stays put, and only then swaps to the one-hundred example group -
 * instead of the field disappearing the instant this phase mounts, leaving the number floating
 * alone. */
function HighlightReveal({ step }: { step: RodsOnesStep }) {
  const [numberVisible, setNumberVisible] = useState(true);
  const [showGroup, setShowGroup] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      await sleep(NUMBER_HOLD_MS);
      if (cancelled) return;
      setNumberVisible(false);
      await sleep(NUMBER_FADE_MS);
      if (cancelled) return;
      setShowGroup(true);
    }
    run();
    return () => {
      cancelled = true;
    };
  }, []);

  if (showGroup) {
    return (
      <HundredsGroupsField
        totalTens={step.totalTens}
        ones={step.ones}
        highlightFirst
        exampleTag="1 hundred (100)"
      />
    );
  }

  return (
    <>
      <div
        className="text-center font-serif text-[32px] font-semibold text-ink transition-opacity"
        style={{ transitionDuration: `${NUMBER_FADE_MS}ms`, opacity: numberVisible ? 1 : 0 }}
      >
        {step.n}
      </div>
      <HundredsGroupsField totalTens={step.totalTens} ones={step.ones} />
    </>
  );
}

/** Stage 3's loose/highlight phases: "loose" shows the number above a tidy 5-column grid of
 * ten-packs and ones together (too many tens to count at a glance); "highlight" fades that same
 * number out before revealing the arrangement again with one example hundred set apart via
 * spacing and tagged "1 hundred (100)". The spacing scaffold, "how many hundreds" question, and
 * counted migration into a hundreds column all live in the following quiz step. */
export function RodsOnesView({ step }: { step: RodsOnesStep }) {
  return (
    <div className="flex w-full flex-col items-center gap-3 p-1">
      {step.phase === "loose" ? (
        <>
          <div className="text-center font-serif text-[32px] font-semibold text-ink">{step.n}</div>
          <HundredsGroupsField totalTens={step.totalTens} ones={step.ones} />
        </>
      ) : (
        <HighlightReveal step={step} />
      )}
    </div>
  );
}
