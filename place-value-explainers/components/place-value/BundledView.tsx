"use client";

import { TensGroupsField } from "./TensGroupsField";
import { DecomposeCallout2 } from "./DecomposeCallout2";
import { ExpandedCallout } from "./ExpandedCallout";
import type { BundledStep } from "@/lib/place-value/types";

/** Stage 2's settled view, reused for three consecutive steps that build up one piece at a time:
 * plain "tens"/"ones" column labels with the per-group counts taken away (labels-only), then the
 * decompose callout added, then the expanded-form callout added on top of that. */
export function BundledView({ step }: { step: BundledStep }) {
  return (
    <div className="flex w-full flex-col items-center gap-3.5 p-1.5">
      {step.showDecompose && <DecomposeCallout2 tens={step.tens} ones={step.ones} total={step.n} />}
      {step.showExpanded && (
        <ExpandedCallout parts={[step.tens * 10, step.ones]} total={step.n} stepMs={180} />
      )}
      <TensGroupsField
        tens={step.tens}
        ones={step.ones}
        spacing="scaffold"
        boxedGroups={step.tens}
        boxLabels={false}
        onesPlacement="column"
        onesArrived={step.ones}
        layoutKey="pv2-bundled"
      />
    </div>
  );
}
