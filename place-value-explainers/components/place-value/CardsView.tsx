"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Flat } from "./Flat";
import { TenPack } from "./TenPack";
import { Unit } from "./Unit";
import { DecomposeCallout3 } from "./DecomposeCallout3";
import { ExpandedCallout } from "./ExpandedCallout";
import type { CardsStep } from "@/lib/place-value/types";

const PLACE_COLOR: Record<"hundreds" | "tens" | "ones", string> = {
  hundreds: "text-hundreds",
  tens: "text-tens",
  ones: "text-ones",
};

function PlaceCard({ place, count }: { place: "hundreds" | "tens" | "ones"; count: number }) {
  return (
    <div className="flex min-w-[84px] flex-col items-center gap-2 rounded-xl border-[1.5px] border-line bg-card px-3 pb-2.5 pt-[11px]">
      <div className={cn("font-mono text-[10px] font-bold uppercase tracking-widest", PLACE_COLOR[place])}>
        {place}
      </div>
      <div className="font-mono text-[18px] font-bold text-ink">{count}</div>
      <div className="flex min-h-[20px] max-w-[120px] flex-wrap content-start justify-center gap-1">
        {count === 0 ? (
          <div className="px-0.5 py-1 font-mono text-[11px] text-ink-3">none</div>
        ) : (
          Array.from({ length: count }, (_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.3 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: (i * 40) / 1000, ease: [0.34, 1.56, 0.64, 1] }}
            >
              {place === "hundreds" ? <Flat /> : place === "tens" ? <TenPack /> : <Unit size={12} />}
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}

/** Stage 3's place-card tier reveal, ported from the vanilla app's renderCards(). Both cards
 * steps in generatePlaceValueSteps3 always show all three cards revealed (the vanilla app's
 * `pending`/unrevealed card style is dead code for the generated walkthrough - never reached -
 * so it's dropped here rather than ported unused). */
export function CardsView({ step }: { step: CardsStep }) {
  return (
    <div className="flex flex-col items-center gap-2.5 p-1.5">
      {step.showDecompose && (
        <DecomposeCallout3 hundreds={step.hundreds} tens={step.tens} ones={step.ones} total={step.n} />
      )}
      {step.showExpanded && (
        <ExpandedCallout
          parts={[step.hundreds * 100, step.tens * 10, step.ones]}
          total={step.n}
          stepMs={160}
        />
      )}
      <div className="flex flex-wrap items-start justify-center gap-2.5">
        <PlaceCard place="hundreds" count={step.hundreds} />
        <PlaceCard place="tens" count={step.tens} />
        <PlaceCard place="ones" count={step.ones} />
      </div>
    </div>
  );
}
