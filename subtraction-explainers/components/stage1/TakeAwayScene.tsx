"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import type { TakeAwayStep } from "@/lib/stage1/types";
import { EquationBanner } from "./EquationBanner";
import { useStage1 } from "./Stage1Context";

/** Fixed footprint per breakpoint, matching the SVG scenes' layoutFor() pattern - a main "box"
 * grid on top, a single row of empty target-slot circles centered below it. Every apple gets an
 * EXPLICIT (x,y) target computed from this layout and its own index. Position is applied via
 * plain CSS `left`/`top` (a CSS transition handles the one-time box->slot move), NOT Framer's
 * `animate.x`/`animate.y` - combining `drag` with an `animate`-owned x/y on the SAME element is a
 * known Framer footgun (round-18 bug report: "one apple... randomly floats in the top left
 * corner") - `drag`'s own x/y motion values fight an `animate` target that's simultaneously being
 * told to go somewhere else. Keeping position on plain CSS and letting `drag` own ONLY its own
 * transient transform (reset via `dragSnapToOrigin`) removes that conflict entirely. */
function layoutFor(isDesktop: boolean) {
  const boxPad = isDesktop ? 16 : 12;
  const cell = isDesktop ? 84 : 58;
  const cols = 5;
  const slotCell = isDesktop ? 56 : 42;
  const slotGap = isDesktop ? 14 : 10;
  const gap = isDesktop ? 30 : 22;
  return { boxPad, cell, cols, slotCell, slotGap, gap };
}

function computeLayout(isDesktop: boolean, minuend: number, subtrahend: number) {
  const L = layoutFor(isDesktop);
  const boxRows = Math.max(1, Math.ceil(minuend / L.cols));
  const boxW = L.boxPad * 2 + L.cols * L.cell;
  const boxH = L.boxPad * 2 + boxRows * L.cell;
  const slotRowW = subtrahend * L.slotCell + Math.max(0, subtrahend - 1) * L.slotGap;
  const slotY0 = boxH + L.gap;

  const totalW = Math.max(boxW, slotRowW);
  const totalH = slotY0 + L.slotCell;
  const boxX0 = (totalW - boxW) / 2;
  const slotX0 = (totalW - slotRowW) / 2;

  const boxPos = (i: number) => {
    const col = i % L.cols;
    const row = Math.floor(i / L.cols);
    return { x: boxX0 + L.boxPad + col * L.cell + L.cell / 2, y: L.boxPad + row * L.cell + L.cell / 2 };
  };
  const slotPos = (rank: number) => ({
    x: slotX0 + rank * (L.slotCell + L.slotGap) + L.slotCell / 2,
    y: slotY0 + L.slotCell / 2,
  });

  return {
    ...L,
    boxW,
    boxH,
    boxX0,
    slotX0,
    slotY0,
    slotRowW,
    totalW,
    totalH,
    boxPos,
    slotPos,
    apple: L.cell * 0.62,
    slotApple: L.slotCell * 0.62,
  };
}

/** How long each apple's own entrance is staggered from the previous one, in ms - deliberately
 * slow (round-17 feedback: "DO NOT RUSH THE APPLES IN... these are 5 year olds"). The running
 * count badge below the box is scheduled from this SAME constant (not a separately-tuned
 * setInterval, which used to drift out of sync with the actual per-apple fade stagger below). */
const ENTER_STAGGER_MS = 450;
/** How long the running count badge lingers on the FINAL number before fading - without this it
 * disappeared the instant it reached minuend (condition was `< minuend`), so the last count never
 * got its own visible moment (round-18: "the counter fades out before showing the last count"). */
const ENTER_LINGER_MS = 700;

/** Take-away model: a ten-frame of identical objects, dragged/tapped out one at a time onto an
 * empty target slot, then an MCQ asks how many remain. */
export function TakeAwayScene({
  step,
  isDesktop,
  onCorrectRemove,
}: {
  step: TakeAwayStep;
  isDesktop: boolean;
  onCorrectRemove: () => void;
}) {
  const { countingIndex } = useStage1();
  const { minuend, subtrahend, shown, removedCount, tapTargetIndex, highlight, fadeRemoved, askRemaining, revealAnswer } = step;
  const remaining = minuend - removedCount;
  const answer = minuend - subtrahend;
  const layout = computeLayout(isDesktop, minuend, subtrahend);
  const slotRefs = useRef<Record<number, HTMLDivElement | null>>({});

  // Only the 'shown' step itself is ever actually entering - every later step (remove-k, ask,
  // reveal) already has all apples fully on screen, so their OWN opacity transitions (dimming on
  // 'ask', etc) must never inherit this stagger, or reaching a later step would replay the whole
  // entrance's per-apple delay on an unrelated opacity change.
  const isEnteringStep = step.id === "shown";

  const [enterCount, setEnterCount] = useState(0);
  const [entranceDone, setEntranceDone] = useState(false);
  useEffect(() => {
    if (!shown) {
      setEnterCount(0);
      setEntranceDone(false);
      return;
    }
    const timers: number[] = [];
    for (let k = 1; k <= minuend; k++) {
      timers.push(window.setTimeout(() => setEnterCount(k), (k - 1) * ENTER_STAGGER_MS));
    }
    timers.push(window.setTimeout(() => setEntranceDone(true), (minuend - 1) * ENTER_STAGGER_MS + ENTER_LINGER_MS));
    return () => timers.forEach((t) => window.clearTimeout(t));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shown, minuend]);

  // The empty slot row only appears once the subtrahend is highlighted (or later) - showing it
  // from the moment the apples appear reads as a random extra element with no purpose yet.
  const showSlots = highlight === "subtrahend" || removedCount > 0 || !!fadeRemoved;

  // Arrow annotation only during an actual removal prompt, never during the "how many are left"
  // MCQ (which also happens to have requiresTap set, for Footer/autoplay gating purposes only).
  const showArrow = !!step.requiresTap && !askRemaining;

  // Drag success = dropped the pointer on (or near) THIS apple's own slot - measured via real
  // getBoundingClientRect()/PanInfo.point (both absolute page coordinates), never via an assumed
  // scale-normalized offset, since the whole scene sits inside a CSS-scaled workspace and any
  // offset-based math has to either know that scale factor or risk being wrong by it.
  function handleDragEnd(i: number, isTarget: boolean, point: { x: number; y: number }) {
    if (!isTarget) return;
    const slotEl = slotRefs.current[minuend - 1 - i];
    if (!slotEl) {
      onCorrectRemove();
      return;
    }
    const r = slotEl.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    const hitRadius = Math.max(r.width, r.height);
    if (Math.hypot(point.x - cx, point.y - cy) <= hitRadius) onCorrectRemove();
  }

  const apples = Array.from({ length: minuend }, (_, i) => i);
  const slots = Array.from({ length: subtrahend }, (_, r) => r);

  return (
    <div className="flex flex-col items-center gap-3">
      <EquationBanner left={minuend} right={subtrahend} answer={answer} highlight={highlight} revealed={revealAnswer} />

      {!shown ? (
        <div style={{ width: layout.totalW, height: layout.boxH }} />
      ) : (
        <div className="relative" style={{ width: layout.totalW, height: layout.totalH }}>
          <div
            className="absolute rounded-3xl bg-card border-2 border-line"
            style={{ left: layout.boxX0, top: 0, width: layout.boxW, height: layout.boxH }}
          />

          {/* Running entrance count, centered directly below the apples container - synced to the
              SAME per-apple stagger driving the apples' own fade-in below, not a separate timer.
              Lingers on the FINAL number for ENTER_LINGER_MS instead of vanishing the instant it
              reaches minuend, so the last apple's count gets its own visible moment too. */}
          {enterCount > 0 && !entranceDone && (
            <motion.div
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="absolute font-mono font-bold text-[26px] text-hop"
              style={{ left: layout.boxX0, top: layout.boxH + 8, width: layout.boxW, textAlign: "center" }}
            >
              {enterCount}
            </motion.div>
          )}

          {/* Target slots: one outlined circle per apple to remove, laid out in a single row below
              the apples container - a fixed, always-visible preview of how many need to come out. */}
          <AnimatePresence>
            {showSlots &&
              slots.map((r) => {
                const pos = layout.slotPos(r);
                return (
                  <motion.div
                    key={`slot-${r}`}
                    ref={(el) => {
                      slotRefs.current[r] = el;
                    }}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3, delay: r * 0.05 }}
                    className="absolute rounded-full border-2 border-dashed border-line-2"
                    style={{
                      left: pos.x - layout.slotCell / 2,
                      top: pos.y - layout.slotCell / 2,
                      width: layout.slotCell,
                      height: layout.slotCell,
                    }}
                  />
                );
              })}
          </AnimatePresence>

          {/* A plain conditional, NOT AnimatePresence/exit - an inner child with a
              `repeat: Infinity` bounce turned out to block the OUTER element's exit animation
              from ever resolving even after splitting fade from bounce into nested motion divs
              (the arrow stayed stuck on screen well past the ask/reveal steps where it must not
              appear at all, in TWO separate attempts). Correctness (it must actually disappear)
              wins over a fade-out flourish here - React just unmounts it immediately, the
              fade-IN on first appearance still plays via initial/animate. */}
          {showArrow && (
            <motion.div
              key="arrow"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="absolute text-3xl"
              style={{ left: layout.totalW / 2 - 16, top: layout.boxH + layout.gap / 2 - 16 }}
              aria-hidden
            >
              <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}>
                ⬇️
              </motion.div>
            </motion.div>
          )}

          {apples.map((i) => {
            const isRemoved = i >= remaining;
            const rank = minuend - 1 - i;
            const target = isRemoved ? layout.slotPos(rank) : layout.boxPos(i);
            const size = isRemoved ? layout.slotApple : layout.apple;
            const isTarget = tapTargetIndex === i;
            const entranceDelay = isEnteringStep ? i * (ENTER_STAGGER_MS / 1000) : 0;
            const isCounting = countingIndex !== null && !isRemoved && i === countingIndex;
            const dimmed = !!fadeRemoved && isRemoved;
            return (
              <motion.button
                key={i}
                type="button"
                data-tappable={isTarget || undefined}
                aria-label={isTarget ? "Drag or tap to take this one away" : undefined}
                onClick={isTarget ? onCorrectRemove : undefined}
                drag={isTarget}
                dragSnapToOrigin
                dragElastic={0.15}
                dragConstraints={{ left: -layout.totalW, right: layout.totalW, top: -layout.totalH, bottom: layout.totalH }}
                onDragEnd={(_e, info) => handleDragEnd(i, isTarget, info.point)}
                initial={{ opacity: 0, scale: 0.4 }}
                animate={{
                  opacity: dimmed ? 0.35 : 1,
                  scale: isCounting ? 1.35 : 1,
                  width: size,
                  height: size,
                }}
                transition={{
                  opacity: { delay: entranceDelay, duration: 0.5 },
                  scale: { duration: isCounting ? 0.25 : 0.4, ease: "easeInOut" },
                  width: { duration: 0.4 },
                  height: { duration: 0.4 },
                }}
                className={cn(
                  "absolute rounded-full flex items-center justify-center select-none",
                  isRemoved
                    ? "text-lg min-[900px]:text-xl bg-used-bg border-2 border-used/40"
                    : "text-2xl min-[900px]:text-4xl bg-one border-2 border-one/40",
                  isTarget && "cursor-grab active:cursor-grabbing animate-bounce-block ring-4 ring-accent ring-offset-2 ring-offset-card",
                  isCounting && "ring-4 ring-hop ring-offset-2 ring-offset-card",
                )}
                style={{
                  left: target.x - size / 2,
                  top: target.y - size / 2,
                  transition: "left 0.5s ease, top 0.5s ease",
                }}
              >
                🍎
              </motion.button>
            );
          })}

          {/* Post-answer "count together" caption - pinned to the BOTTOM of the container itself,
              action-oriented so it's never gated by hideText (round-18). */}
          {countingIndex !== null && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute left-0 right-0 bottom-1 flex justify-center"
            >
              <div className="font-mono text-[13px] font-bold text-ink bg-card border border-line rounded-full px-3 py-1 shadow-sm">
                {remaining} apples now. Let&apos;s count together...
              </div>
            </motion.div>
          )}
        </div>
      )}

      <AnimatePresence>
        {revealAnswer && (
          <motion.div
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="text-4xl"
            aria-hidden
          >
            ✅
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
