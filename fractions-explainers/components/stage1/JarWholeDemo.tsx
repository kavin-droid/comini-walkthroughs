"use client";

import { useEffect, useState } from "react";
import { AnnotationArrow } from "./AnnotationArrow";
import { WordLabel } from "./WordLabel";
import { JarShape } from "./JarShape";

const POUR_DELAY_MS = 500;
const POUR_DURATION_S = 1.3;

/** An empty jar fills all the way up (a real, continuous fill animation - not a jump to 100%),
 * then marks itself solved - a pure demo beat, mirroring BarWholeIntro/PizzaWholeIntro. The
 * "what is it?" check for this context happens later, at JarFillHalf, where the child has to
 * produce the half themselves rather than just recognize it. */
export function JarWholeDemo({ onSolved }: { onSolved: () => void }) {
  const [fill, setFill] = useState(0);
  const [pourDone, setPourDone] = useState(false);

  useEffect(() => {
    const t1 = window.setTimeout(() => setFill(100), POUR_DELAY_MS);
    const t2 = window.setTimeout(() => setPourDone(true), POUR_DELAY_MS + POUR_DURATION_S * 1000);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, []);

  useEffect(() => {
    if (pourDone) onSolved();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pourDone]);

  return (
    <div className="flex flex-col items-center gap-7 w-full">
      <div className="relative">
        <AnnotationArrow visible={pourDone} className="left-1/2 -top-9" />
        <JarShape fillPercent={fill} fillDurationS={POUR_DURATION_S} />
        <WordLabel text="Whole" visible={pourDone} className="left-1/2 top-[calc(100%+16px)]" />
      </div>
    </div>
  );
}
