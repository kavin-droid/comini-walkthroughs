"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import { Dot } from "./Dot";
import type { GroupsToArrayStep } from "@/lib/multiplication/types";

type Phase = "groups" | "array";

const MIGRATE_DELAY_MS = 60;
const GROUPS_FADE_MS = 400;
const ENCLOSE_DELAY_MS = 650;

/** Animation #1: dots fly out of their group containers to form the array, the (now empty) group
 * boxes fade away, then the array gets its enclosing border. Naming the result "an array" is a
 * separate step that follows this one (see generateArraySteps) - this view stays silent about
 * what the new shape is called, it only shows the rearrangement happening. Both trees share one
 * `layoutId` per dot (row = original group index, col = index within that group), so Framer
 * Motion bridges each dot's position automatically across the groups -> array mount swap - no
 * manual rect measurement needed, unlike the addition app's viewport-escaping pack animation. */
export function GroupsToArrayView({ step }: { step: GroupsToArrayStep }) {
  const [phase, setPhase] = useState<Phase>("groups");
  const [showEnclosure, setShowEnclosure] = useState(false);

  useEffect(() => {
    const t1 = window.setTimeout(() => setPhase("array"), MIGRATE_DELAY_MS);
    const t2 = window.setTimeout(() => setShowEnclosure(true), ENCLOSE_DELAY_MS);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, []);

  const dotId = (r: number, c: number) => `dot-${r}-${c}`;
  const cols = Math.min(step.perGroup, 5);

  return (
    <LayoutGroup id="groups-to-array">
      <div className="flex flex-col items-center gap-3 w-full">
        <AnimatePresence>
          {phase === "groups" && (
            <motion.div
              key="groups"
              exit={{ opacity: 0 }}
              transition={{ duration: GROUPS_FADE_MS / 1000 }}
              className="flex flex-wrap gap-3 justify-center items-start p-1.5"
            >
              {Array.from({ length: step.groups }, (_, r) => (
                <div
                  key={r}
                  className="flex flex-col items-center gap-[7px] px-[9px] pt-[9px] pb-[7px] rounded-xl border-[1.5px] border-dashed bg-group-bg border-group min-w-[52px]"
                >
                  <div className="font-mono text-[10px] tracking-widest uppercase font-semibold text-group">
                    Group {r + 1}
                  </div>
                  <div
                    className="grid gap-1 justify-center"
                    style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
                  >
                    {Array.from({ length: step.perGroup }, (_, c) => (
                      <motion.div key={c} layoutId={dotId(r, c)} layout>
                        <Dot />
                      </motion.div>
                    ))}
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {phase === "array" && (
          <div className="flex flex-col items-center gap-3">
            <motion.div
              initial={{ scale: 0.96, opacity: 0.5 }}
              animate={
                showEnclosure ? { scale: 1, opacity: 1 } : { scale: 0.99, opacity: 0.85 }
              }
              transition={{ duration: 0.35, ease: [0.34, 1.56, 0.64, 1] }}
              className="inline-grid gap-[5px] p-[10px] bg-card border border-line rounded-xl"
            >
              {Array.from({ length: step.groups }, (_, r) => (
                <div key={r} className="flex items-center gap-2">
                  <div className="font-mono text-[10px] text-row font-semibold w-[18px] text-right opacity-80 shrink-0">
                    {r + 1}.
                  </div>
                  <div className="flex gap-[5px]">
                    {Array.from({ length: step.perGroup }, (_, c) => (
                      <motion.div key={c} layoutId={dotId(r, c)} layout>
                        <Dot />
                      </motion.div>
                    ))}
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        )}
      </div>
    </LayoutGroup>
  );
}
