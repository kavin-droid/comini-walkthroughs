"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { TenPack } from "./TenPack";
import { Flat } from "./Flat";
import { Unit } from "./Unit";
import { LabeledColumn } from "./LabeledColumn";
import { useQuiz } from "./QuizContext";
import type { QuizHundredsStep } from "@/lib/place-value/types";

/** Fits exactly 5 ten-packs per row at both the packed and scaffold gap widths. */
const ROW_WIDTH = 290;
const SPACING_TRANSITION_MS = 550;
const COUNT_INTERVAL_MS = 550;
const PRE_MIGRATE_PAUSE_MS = 400;
const CONTAINER_INTRO_MS = 500;
const FLIGHT_MS = 900;
const MORPH_MS = 600;
const NEXT_GROUP_GAP_MS = 450;

function sleep(ms: number) {
  return new Promise<void>((resolve) => window.setTimeout(resolve, ms));
}

/** Stage 3's hundreds quiz - mirrors stage 2's tens quiz one level up. On mount, plays the
 * spacing-increase animation first (QuizOptions stays hidden while `quiz.hundreds.phase ===
 * "intro"`); ten-packs and ones stay in one flowing arrangement the whole time, not split into
 * separate columns, until the question is answered.
 *
 * Once answered, the sequence plays out in two distinct stages, not all at once:
 * 1. Counting: each hundred-group is boxed and labeled with its running count (1, 2, 3...) in
 *    place, one at a time - matching stage 2's tens-quiz reveal, before anything moves anywhere.
 * 2. Migrating: only once every group is counted does the (empty) hundreds column appear, then
 *    each counted group flies over one at a time (a shared `layoutId` per group drives the real
 *    position/size transition), settles, fades its 10 ten-packs out, and only then fades in as a
 *    single hundred-flat - before the next group starts its own flight.
 *
 * Once every hundred has landed, the leftover loose ten-packs and ones settle into their own
 * matching labeled columns too. */
export function QuizHundredsView({ step }: { step: QuizHundredsStep }) {
  const { quiz, dispatch } = useQuiz();
  const [counted, setCounted] = useState(0);
  const [containerReady, setContainerReady] = useState(false);
  const [arrived, setArrived] = useState(0);
  const [morphed, setMorphed] = useState(0);

  useEffect(() => {
    if (quiz.hundreds.phase !== "intro") return;
    const timer = window.setTimeout(() => dispatch({ type: "HUNDREDS_INTRO_DONE" }), SPACING_TRANSITION_MS);
    return () => window.clearTimeout(timer);
  }, [quiz.hundreds.phase, dispatch]);

  useEffect(() => {
    if (quiz.hundreds.phase !== "revealing") return;
    let cancelled = false;

    async function run() {
      // Stage 1: count every group in place first.
      for (let g = 0; g < step.hundreds; g++) {
        if (cancelled) return;
        setCounted(g + 1);
        await sleep(COUNT_INTERVAL_MS);
      }
      if (cancelled) return;
      await sleep(PRE_MIGRATE_PAUSE_MS);
      if (cancelled) return;

      // Stage 2: the hundreds column appears, then each counted group migrates in turn.
      setContainerReady(true);
      await sleep(CONTAINER_INTRO_MS);
      for (let g = 0; g < step.hundreds; g++) {
        if (cancelled) return;
        setArrived(g + 1);
        await sleep(FLIGHT_MS);
        if (cancelled) return;
        setMorphed(g + 1);
        await sleep(MORPH_MS + NEXT_GROUP_GAP_MS);
      }
      if (cancelled) return;
      dispatch({ type: "HUNDREDS_REVEAL_DONE" });
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [quiz.hundreds.phase, step.hundreds, dispatch]);

  const spacing = quiz.hundreds.phase === "intro" ? "packed" : "scaffold";
  const settled = quiz.hundreds.phase === "feedback";
  const showHundredsColumn = containerReady || settled;
  const looseTens = step.totalTens - step.hundreds * 10;
  const tensCols = Math.max(1, Math.min(looseTens, 5));
  const remainingGroups = Array.from({ length: step.hundreds }, (_, g) => g).filter((g) => g >= arrived);
  const arrivedGroups = Array.from({ length: arrived }, (_, g) => g);

  return (
    <div className="flex w-full items-start justify-center gap-4 p-1">
      <LayoutGroup id="pv3-quiz-hundreds">
        {showHundredsColumn && (
          <LabeledColumn place="hundreds" count={morphed}>
            <div className="flex min-h-[16px] flex-wrap justify-center gap-1.5">
              {arrivedGroups.map((g) => (
                <motion.div key={`hg-${g}`} layout layoutId={`hg-${g}`}>
                  <AnimatePresence mode="wait" initial={false}>
                    {g < morphed ? (
                      <motion.div
                        key="flat"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Flat />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="packs"
                        className="grid grid-cols-5 gap-1"
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        {Array.from({ length: 10 }, (_, i) => (
                          <TenPack key={i} />
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          </LabeledColumn>
        )}

        {settled ? (
          <LabeledColumn place="tens" count={looseTens}>
            <div className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${tensCols}, max-content)` }}>
              {Array.from({ length: looseTens }, (_, i) => (
                <TenPack key={i} />
              ))}
            </div>
          </LabeledColumn>
        ) : (
          <div
            className="flex flex-wrap items-start transition-[gap] duration-500 ease-out"
            style={{ gap: spacing === "scaffold" ? 10 : 4, width: ROW_WIDTH }}
          >
            {remainingGroups.map((g) => {
              const boxed = g < counted;
              return (
                <motion.div
                  key={`hg-${g}`}
                  layout
                  layoutId={`hg-${g}`}
                  className={cn(
                    "relative grid grid-cols-5 gap-1.5 rounded-lg transition-all duration-300",
                    boxed ? "border-[1.5px] border-hundreds bg-hundreds-bg p-1.5" : "border-0 p-0",
                  )}
                  style={{ width: ROW_WIDTH }}
                >
                  {boxed && (
                    <div className="absolute -top-[13px] left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-hundreds px-2 py-0.5 font-mono text-[10px] font-bold tracking-wide text-card">
                      {g + 1}
                    </div>
                  )}
                  {Array.from({ length: 10 }, (_, i) => (
                    <TenPack key={i} />
                  ))}
                </motion.div>
              );
            })}

            {Array.from({ length: looseTens }, (_, i) => (
              <TenPack key={`loose-${i}`} />
            ))}
          </div>
        )}
      </LayoutGroup>

      {settled ? (
        <LabeledColumn place="ones" count={step.ones}>
          <div className="flex min-h-[16px] flex-wrap justify-center gap-1">
            {Array.from({ length: step.ones }, (_, i) => (
              <Unit key={i} size={12} />
            ))}
          </div>
        </LabeledColumn>
      ) : (
        <div className="flex max-w-[100px] flex-wrap content-start gap-1 pt-1">
          {Array.from({ length: step.ones }, (_, i) => (
            <Unit key={`one-${i}`} size={12} />
          ))}
        </div>
      )}
    </div>
  );
}
