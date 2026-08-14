"use client";

import { useEffect, useState } from "react";
import { Unit } from "./Unit";
import { TensGroupsField } from "./TensGroupsField";
import type { UnitsFieldStep } from "@/lib/place-value/types";

const UNIT_W = 13;
const GRID_GAP = 3;
const NUMBER_HOLD_MS = 900;
const NUMBER_FADE_MS = 500;

function sleep(ms: number) {
  return new Promise<void>((resolve) => window.setTimeout(resolve, ms));
}

/** Stage 2's "loose" phase: a plain, continuous 10-column grid of individual units (not chunked
 * into 2x5 sub-groups) - a fixed 10-wide `grid-template-columns` gives a deterministic, exact
 * width (no flex-wrap slack to fight), which both keeps every row genuinely 10 units wide and
 * centers cleanly without extra work. */
function LooseUnitsGrid({ n }: { n: number }) {
  return (
    <div
      className="grid gap-[3px]"
      style={{ gridTemplateColumns: `repeat(10, ${UNIT_W}px)`, gap: GRID_GAP }}
    >
      {Array.from({ length: n }, (_, i) => (
        <Unit key={i} />
      ))}
    </div>
  );
}

/** Stage 2's "counting" phase opens on the exact same layout as the "loose" phase (number above
 * the full loose grid), holds it briefly so it registers, fades only the number out while the
 * grid stays put, and only then swaps to the highlighted ten-group - instead of the grid
 * disappearing the instant this phase mounts, leaving the number floating alone. */
function CountingReveal({ step }: { step: UnitsFieldStep }) {
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
      <TensGroupsField
        tens={step.tens}
        ones={step.ones}
        spacing="packed"
        boxedGroups={1}
        boxLabels={false}
        exampleTag="1 ten"
        onesPlacement="inline"
        layoutKey="pv2-intro"
      />
    );
  }

  return (
    <>
      <div
        className="mb-0.5 text-center font-serif text-[32px] font-semibold text-ink transition-opacity"
        style={{ transitionDuration: `${NUMBER_FADE_MS}ms`, opacity: numberVisible ? 1 : 0 }}
      >
        {step.n}
      </div>
      <LooseUnitsGrid n={step.n} />
    </>
  );
}

/** Stage 2's loose/counting phases: a plain, uniformly-spaced, ungrouped 10-wide grid (loose);
 * the group-block arrangement with one example group highlighted and tagged "1 ten" (counting),
 * not yet asking anything. The spacing scaffold and the "how many tens" question both live in
 * the following quiz step. */
export function UnitsFieldView({ step }: { step: UnitsFieldStep }) {
  return (
    <div className="flex w-full flex-col items-center gap-3 p-1.5">
      {step.phase === "loose" ? (
        <>
          <div className="mb-0.5 text-center font-serif text-[32px] font-semibold text-ink">{step.n}</div>
          <LooseUnitsGrid n={step.n} />
        </>
      ) : (
        <CountingReveal step={step} />
      )}
    </div>
  );
}
