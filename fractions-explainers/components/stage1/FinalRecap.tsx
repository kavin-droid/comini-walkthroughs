"use client";

import { useEffect } from "react";
import { WordLabelInline } from "./RecapWhole";
import { RecapShapes } from "./RecapShapes";

/** The closing step: both concepts side by side at once, rather than sequentially like
 * recapWhole/recapHalf before it - the whole-shapes set labeled "Whole" stacked above the
 * half-shapes set labeled "Half", so the two ideas are compared in the same glance instead of
 * separate steps apart. Uses RecapShapes' `compact` sizing since two full three-shape sets need
 * to share the workarea at once. Pure look-at-this beat, so it marks itself solved on mount. */
export function FinalRecap({ onSolved }: { onSolved: () => void }) {
  useEffect(() => {
    onSolved();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex flex-col items-center gap-6 w-full">
      <div className="flex flex-col items-center gap-3">
        <WordLabelInline text="Whole" />
        <RecapShapes split={false} compact />
      </div>
      <div className="flex flex-col items-center gap-3">
        <WordLabelInline text="Half" />
        <RecapShapes split compact />
      </div>
    </div>
  );
}
