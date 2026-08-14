"use client";

import { useEffect } from "react";
import { WordLabel } from "./WordLabel";
import { RecapShapes } from "./RecapShapes";

/** All three shapes together, all whole, introducing the numeral "1" alongside the word "Whole" -
 * a look-at-this beat like the context-intro steps, so it marks itself solved on mount. */
export function RecapWhole({ onSolved }: { onSolved: () => void }) {
  useEffect(() => {
    onSolved();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex flex-col items-center gap-8">
      <RecapShapes split={false} />
      <div className="flex items-center gap-4">
        <WordLabelInline text="Whole" />
        <NumeralPill text="1" />
      </div>
    </div>
  );
}

/** A non-absolute variant of WordLabel's pill styling for the recap steps, which lay their
 * labels out inline in normal flow rather than pinned to one shape. Like WordLabel, never
 * affected by the instruction-text toggle - see its note. */
function WordLabelInline({ text }: { text: string }) {
  return (
    <div className="px-4 py-1.5 rounded-full bg-ink text-card font-sans font-bold text-[18px] shadow-lg">{text}</div>
  );
}

function NumeralPill({ text }: { text: string }) {
  return (
    <div className="min-w-[46px] px-3 py-1.5 rounded-full bg-accent text-card font-mono font-bold text-[20px] text-center shadow-lg">
      {text}
    </div>
  );
}

export { WordLabelInline, NumeralPill };
