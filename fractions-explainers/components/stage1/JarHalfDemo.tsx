"use client";

import { useEffect, useState } from "react";
import { AnnotationArrow } from "./AnnotationArrow";
import { WordLabel } from "./WordLabel";
import { JarShape } from "./JarShape";

const POUR_DELAY_MS = 500;
const POUR_DURATION_S = 1.1;

/** The jar's "here's what half looks like" beat - sits between JarWholeDemo (fills all the way)
 * and JarFillHalf (the child fills it themselves), so by the time the child is asked to fill the
 * jar halfway they've already watched both the whole and the half demonstrated, matching the
 * bar/pizza contexts' demo-then-compare shape. Auto-pours to exactly 50%, then marks itself
 * solved - nothing for the child to do here but watch. */
export function JarHalfDemo({ onSolved }: { onSolved: () => void }) {
  const [fill, setFill] = useState(0);
  const [pourDone, setPourDone] = useState(false);

  useEffect(() => {
    const t1 = window.setTimeout(() => setFill(50), POUR_DELAY_MS);
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
        <WordLabel text="Half" visible={pourDone} className="left-1/2 top-[calc(100%+16px)]" />
      </div>
    </div>
  );
}
