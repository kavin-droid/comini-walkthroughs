"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Dot } from "./Dot";
import { AdditionCallout } from "./AdditionCallout";
import { MultiplicationCallout } from "./MultiplicationCallout";
import { EquationDisplay } from "./EquationDisplay";
import { useWorkspaceEquationVisible, EQUATION_FADE_COMPLETE_MS } from "@/hooks/useWorkspaceEquationVisible";
import type { BoxGroupsStep } from "@/lib/multiplication/types";

const DEFAULT_STAGGER_MS = 420;
// After the equation finishes fading (see useWorkspaceEquationVisible), the "+" signs and then the
// addition equation pop in one beat at a time, rather than everything landing on the child at once.
const PLUS_DELAY_MS = 200;
const ADDITION_DELAY_MS = 250;

function CountBadge({ value }: { value: string }) {
  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.3 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 480, damping: 22 }}
      className="font-mono text-[12px] font-bold text-accent tabular-nums"
    >
      {value}
    </motion.span>
  );
}

/** Alternate stage 2 concept: the equation is drawn here too at first (not just in AnswerCard
 * above), right over the containers it's building - see `step.equationDisplay` for how it fades
 * out partway through and stays gone, handing the rest of the walkthrough over to repeated
 * addition's own visual language. Containers appear one at a time (see `groupsRevealed`) labeled
 * with a plain running count (1, 2, 3...), not "Group N". Dots then fill in as a single running
 * total across the whole picture (`dotsRevealed`) rather than per-container, which is what makes
 * the fill order fall out naturally: the first container's dots are indices [0, perGroup), the
 * second's are [perGroup, 2*perGroup), and so on - as the total climbs, each container fills
 * completely before the next one starts. */
export function BoxGroupsView({ step }: { step: BoxGroupsStep }) {
  const [revealedGroups, setRevealedGroups] = useState(step.groupsRevealed);
  const [revealedDots, setRevealedDots] = useState(step.dotsRevealed);
  const equationVisible = useWorkspaceEquationVisible(step);
  const [plusVisible, setPlusVisible] = useState(step.equationDisplay !== "fadeOut");
  const [additionVisible, setAdditionVisible] = useState(step.equationDisplay !== "fadeOut");
  const [countRevealed, setCountRevealed] = useState(0);
  const [totalRevealed, setTotalRevealed] = useState(!step.containerCountReveal);

  useEffect(() => {
    setRevealedGroups(step.groupsRevealed);
    if (!step.groupReveal) return;
    const stagger = step.groupReveal.staggerMs ?? DEFAULT_STAGGER_MS;
    const rounds = step.groups - step.groupsRevealed;
    const timers = Array.from({ length: rounds }, (_, i) =>
      window.setTimeout(() => setRevealedGroups(step.groupsRevealed + i + 1), (i + 1) * stagger),
    );
    return () => timers.forEach(window.clearTimeout);
  }, [step]);

  useEffect(() => {
    setRevealedDots(step.dotsRevealed);
    if (!step.dotReveal) return;
    const stagger = step.dotReveal.staggerMs ?? DEFAULT_STAGGER_MS;
    const total = step.groups * step.perGroup;
    const rounds = total - step.dotsRevealed;
    const timers = Array.from({ length: rounds }, (_, i) =>
      window.setTimeout(() => setRevealedDots(step.dotsRevealed + i + 1), (i + 1) * stagger),
    );
    return () => timers.forEach(window.clearTimeout);
  }, [step]);

  // On the one step where the equation fades (the "+" appears / addup-setup step), the reveal
  // happens as a clear sequence, not all at once - kids need each new thing to land on its own
  // beat: the equation fades out (see useWorkspaceEquationVisible, which also drives AnswerCard's
  // reappearance in sync), *then* the "+" signs pop in between the containers, *then* the addition
  // equation itself builds. Every other step (where equationDisplay isn't "fadeOut") shows both
  // immediately, unanimated - they're already-settled facts by then, not a first reveal.
  useEffect(() => {
    if (step.equationDisplay !== "fadeOut") {
      setPlusVisible(true);
      setAdditionVisible(true);
      return;
    }
    setPlusVisible(false);
    setAdditionVisible(false);
    const plusTimer = window.setTimeout(() => setPlusVisible(true), EQUATION_FADE_COMPLETE_MS + PLUS_DELAY_MS);
    const additionTimer = window.setTimeout(
      () => setAdditionVisible(true),
      EQUATION_FADE_COMPLETE_MS + PLUS_DELAY_MS + ADDITION_DELAY_MS,
    );
    return () => {
      window.clearTimeout(plusTimer);
      window.clearTimeout(additionTimer);
    };
  }, [step]);

  // Skip-counts the containers by `perGroup`s before the total lands in the addition callout -
  // `totalRevealed` gates that reveal (the step data already carries the real total, for
  // AnswerCard, which never gates on animation state) so the child watches the count happen
  // instead of the sum just appearing. Driven by setTimeout, same reasoning as the effects above.
  useEffect(() => {
    setCountRevealed(0);
    setTotalRevealed(!step.containerCountReveal);
    if (!step.containerCountReveal) return;
    const { labels, staggerMs } = step.containerCountReveal;
    const stagger = staggerMs ?? DEFAULT_STAGGER_MS;
    const timers = labels.map((_, i) =>
      window.setTimeout(() => setCountRevealed(i + 1), (i + 1) * stagger),
    );
    const finishTimer = window.setTimeout(() => setTotalRevealed(true), (labels.length + 1) * stagger);
    return () => {
      timers.forEach(window.clearTimeout);
      window.clearTimeout(finishTimer);
    };
  }, [step]);

  const cols = Math.min(step.perGroup, 5);
  const calloutTotal = step.containerCountReveal && !totalRevealed ? null : (step.calloutAddition?.total ?? null);

  return (
    <div className="flex flex-col items-center gap-3 w-full">
      {step.equationDisplay !== "hidden" &&
        (step.equationDisplay === "fadeOut" ? (
          <motion.div initial={false} animate={{ opacity: equationVisible ? 1 : 0 }} transition={{ duration: 0.5 }}>
            <EquationDisplay parts={step.answer} size="card" />
          </motion.div>
        ) : (
          <EquationDisplay parts={step.answer} size="card" />
        ))}

      {step.calloutAddition && additionVisible && (
        <AdditionCallout terms={step.calloutAddition.terms} total={calloutTotal} />
      )}
      {step.calloutMul && <MultiplicationCallout expr={step.calloutMul.expr} total={step.calloutMul.total} />}

      <div className="flex flex-wrap gap-3 justify-center items-start p-1.5">
        {Array.from({ length: step.groups }, (_, i) => {
          const visible = i < revealedGroups;
          const dotsShown = Math.max(0, Math.min(step.perGroup, revealedDots - i * step.perGroup));
          const counted = i < countRevealed;
          return (
            <div key={i} className="contents">
              {i > 0 && step.showPlus && plusVisible && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: "spring", stiffness: 480, damping: 22 }}
                  className="self-center font-serif font-light text-2xl text-ink-3 pb-1.5"
                >
                  +
                </motion.div>
              )}
              <motion.div
                initial={{ opacity: 0, scale: 0.3 }}
                animate={{ opacity: visible ? 1 : 0, scale: visible ? 1 : 0.3 }}
                transition={{ duration: 0.35, ease: [0.34, 1.56, 0.64, 1] }}
                className={cn(
                  "flex flex-col items-center gap-[7px] px-[9px] pt-[9px] pb-[7px] rounded-xl border-[1.5px] border-dashed border-group bg-group-bg min-w-[52px] min-h-[44px] transition-colors duration-200",
                  counted && "bg-accent/12",
                )}
              >
                <div className="grid gap-1 justify-center" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
                  {Array.from({ length: dotsShown }, (_, k) => (
                    <motion.div
                      key={k}
                      initial={{ opacity: 0, scale: 0.4 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.25 }}
                    >
                      <Dot />
                    </motion.div>
                  ))}
                </div>
                {counted ? (
                  <CountBadge value={step.containerCountReveal!.labels[i]} />
                ) : (
                  <div className="font-mono text-[11px] font-semibold text-group">{i + 1}</div>
                )}
              </motion.div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
