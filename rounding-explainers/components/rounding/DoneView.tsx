"use client";

import { NlBase, NlMarker, NlMarks, makeGeo, pctOf } from "./NumberLinePrimitives";
import { NlCaption } from "./NlCaption";
import { NlStageFrame } from "./NlStageFrame";
import { useRounding } from "./RoundingContext";

/** Ported from `renderDone()`: a static marker parked at the rounded value. */
export function DoneView() {
  const { step } = useRounding();
  const geo = makeGeo(step.lower, step.upper);
  const pct = pctOf(step.rounded, geo);

  return (
    <div className="flex flex-col items-center gap-2.5 px-1 py-1.5">
      {step.caption && <NlCaption fragments={step.caption} />}
      <NlStageFrame>
        <NlBase />
        <NlMarks lower={step.lower} upper={step.upper} hopStep={step.hopStep} />
        <NlMarker value={step.rounded} leftPct={pct} />
      </NlStageFrame>
    </div>
  );
}
