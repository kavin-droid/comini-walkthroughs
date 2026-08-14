"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { CONTAINER_AVATARS, type Stage3Session } from "@/lib/division/stage3";
import { useDragHint } from "@/hooks/useDragHint";
import { Block } from "./Block";
import { MotionBlock } from "./MotionBlock";

const TENS_POOL_GRID = { gridTemplateColumns: "repeat(3, min-content)" } as const;
const ONES_ROW_GRID = { gridTemplateColumns: "repeat(5, min-content)" } as const;

/** Marks the grid spot a tens pack occupied before it started unpacking - same footprint as
 * Block's tens variant (5 cols * 11px + 4 gaps * 4px + padding = 87x42), so the pool doesn't
 * reflow around the gap. Dashed, not filled - same "something was here" language as stage2's
 * GhostSlot. Shown as soon as a pack leaves "packed" (moving/fading/moved), not just once it's
 * fully gone - the pack itself is by then rendered inside the ones column instead. */
function TensPackGhost() {
  return <div className="rounded-md border border-dashed border-line-2 bg-transparent" style={{ width: 87, height: 42 }} aria-hidden="true" />;
}

/** A nudging hand that visibly TRAVELS from the pack it's overlaid on toward the ones column -
 * not a tap-in-place bounce. Measures the real on-screen distance between the pack and the ones
 * column (via refs) and animates a scaled-down sweep along that exact vector, looping, so the
 * motion itself reads as "pick this up and carry it over there" rather than "poke this". Shown
 * the first time unpack starts, and again after any 5s stretch of no drag attempts. */
function DragHint({ packRef, targetRef }: { packRef: RefObject<HTMLDivElement | null>; targetRef: RefObject<HTMLDivElement | null> }) {
  const [delta, setDelta] = useState<{ dx: number; dy: number } | null>(null);

  useEffect(() => {
    function measure() {
      const packRect = packRef.current?.getBoundingClientRect();
      const targetRect = targetRef.current?.getBoundingClientRect();
      if (!packRect || !targetRect) return;
      const rawDx = targetRect.left + targetRect.width / 2 - (packRect.left + packRect.width / 2);
      const rawDy = targetRect.top + targetRect.height / 2 - (packRect.top + packRect.height / 2);
      // Scaled down and clamped - direction and "this is real travel" matter here, not landing
      // pixel-exact on the target (which would also fly off-screen on very wide layouts).
      setDelta({ dx: Math.max(-160, Math.min(160, rawDx * 0.55)), dy: Math.max(-70, Math.min(70, rawDy * 0.55)) });
    }
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [packRef, targetRef]);

  return (
    <motion.div
      className="absolute top-1/2 left-1/2 text-2xl leading-none pointer-events-none select-none z-20"
      style={{ marginTop: -16, marginLeft: -16 }}
      animate={delta ? { x: [0, delta.dx, 0], y: [0, delta.dy, 0], opacity: [0.9, 1, 0.9], scale: [1, 1.15, 1] } : undefined}
      transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
      aria-hidden="true"
    >
      👆
    </motion.div>
  );
}

/** A short, always-visible status bubble (icon + word) - not narration text, so it reads clearly
 * even with the hideText toggle on. Used for the "can't share evenly" / "let's unpack!" beats
 * between counting the leftover packs and actually unpacking them. */
function StatusCallout({ icon, label, colorClass }: { icon: string; label: string; colorClass: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.85 }}
      transition={{ duration: 0.3 }}
      className={cn("flex items-center gap-2.5 px-5 py-2.5 rounded-full border-2 font-sans font-bold text-[16px]", colorClass)}
    >
      <span className="text-2xl leading-none" aria-hidden="true">
        {icon}
      </span>
      <span>{label}</span>
    </motion.div>
  );
}

function ColumnHeader({ label, count }: { label: string; count: number }) {
  return (
    <div className="flex items-center gap-2">
      <span className="font-mono text-[13px] tracking-[1.5px] uppercase text-ink-3">{label}</span>
      <span className="font-mono text-[13px] font-bold text-s3-bucket bg-card px-2.5 py-0.5 rounded-full border border-line">
        {count}
      </span>
    </div>
  );
}

/** `oneIds` are the pool's own global one-indices that now belong to this friend (round-robin:
 * index % divisor === this friend's index) - rendered as MotionBlocks sharing the SAME layoutId
 * the pool used for them, so when a "share a round" tap moves an index out of the pool, Framer
 * FLIPs that exact block across to here instead of the pool's dot fading out and a brand new one
 * fading in here. */
function Container({ index, tensCount, oneIds }: { index: number; tensCount: number; oneIds: number[] }) {
  const total = tensCount * 10 + oneIds.length;
  return (
    <div className="flex flex-col items-center gap-2.5 pt-4 px-4 pb-3 rounded-xl min-w-[96px] border-[1.5px] border-dashed bg-paper-2 border-line-2">
      <div className="text-5xl leading-none" aria-hidden="true">
        {CONTAINER_AVATARS[index % CONTAINER_AVATARS.length]}
      </div>
      <span className="sr-only">Friend {index + 1}</span>
      {/* Tens and ones never share a flex-wrap row - each gets its own row so they stay visually distinct. */}
      <div className="flex flex-col items-center gap-2 min-h-[30px] max-w-[180px]">
        <div className="flex flex-wrap gap-2 justify-center">
          {Array.from({ length: tensCount }).map((_, i) => (
            <Block key={`t${i}`} kind="tens" />
          ))}
        </div>
        <div className="grid gap-2 justify-center" style={ONES_ROW_GRID}>
          {oneIds.map((id) => (
            <MotionBlock key={id} id={`s3-one-${id}`} kind="ones" transitionDelay={index * 0.08} />
          ))}
        </div>
      </div>
      <div className="font-mono text-[13px] font-bold text-s3-bucket bg-card px-3 py-1 rounded-full border border-line">
        {total}
      </div>
    </div>
  );
}

/** Tens counting highlight: a block only colors in once its OWN group's last member has landed
 * ("1.. 2.. 3.. 4" first, then the whole group turns blue together) - the trailing leftover group
 * (which can never complete) colors red only once counting has reached the very end, so it reads
 * as "we counted them all and it still wasn't enough", not a running red tally. */
function tensCountHighlight(index: number, tensCountProgress: number, tensDigit: number, divisor: number, tensPredicted: number | null): "group" | "leftover" | null {
  const isGroupable = tensPredicted !== null && index < tensPredicted * divisor;
  if (isGroupable) {
    const groupEnd = (Math.floor(index / divisor) + 1) * divisor;
    return tensCountProgress >= groupEnd ? "group" : null;
  }
  return tensCountProgress >= tensDigit ? "leftover" : null;
}

/** Ones counting highlight: each dot colors in the instant it's individually counted, blue if it
 * belongs to a complete group, red if it's part of the trailing leftover. */
function onesCountHighlight(index: number, onesCountProgress: number, divisor: number, onesPredicted: number | null): "group" | "leftover" | null {
  if (index >= onesCountProgress) return null;
  return onesPredicted !== null && index < onesPredicted * divisor ? "group" : "leftover";
}

/** Ones counting label: "1.. 2.. 3.. 4" within each group of `divisor`, same per-block cadence as
 * tensCountHighlight's badge - but unlike tens (which keeps every label forever as a running
 * tally), a completed group's labels disappear the moment the NEXT group starts counting, so the
 * badge always reads as "how far into the current 4" rather than "here's every number we've ever
 * said" (the colored dot itself is the permanent record; the number is scratch work). */
function onesCountLabel(index: number, onesCountProgress: number, divisor: number): number | null {
  if (index >= onesCountProgress) return null;
  const groupEnd = (Math.floor(index / divisor) + 1) * divisor;
  if (onesCountProgress > groupEnd) return null;
  return (index % divisor) + 1;
}

export function Stage3MainScene({
  session,
  hideText,
  onTapUnpack,
  onTapShareRound,
}: {
  session: Stage3Session;
  hideText: boolean;
  onTapUnpack: (index: number) => void;
  onTapShareRound: () => void;
}) {
  const {
    phase,
    divisor,
    tensDigit,
    onesDigit,
    tensPredicted,
    tensCountProgress,
    tensSharePlaced,
    tensContainerCounts,
    tensLeftover,
    leftoverCountProgress,
    unpackStages,
    onesTotal,
    onesPredicted,
    onesCountProgress,
    onesSharedRounds,
  } = session;

  const onesColumnRef = useRef<HTMLDivElement>(null);
  const hintPackRef = useRef<HTMLDivElement>(null);
  const { showHint, notifyActivity } = useDragHint(phase === "unpack");
  const firstPackedIndex = unpackStages.findIndex((s) => s === "packed");

  // Ones hides starting predict-tens (once the MCQ is asked and we're truly focused on the tens
  // count) - reveal-friends and focus-tens both keep the FULL breakdown on screen while friends
  // fade in and "we'll focus on the tens first" is said, so those are the only new things
  // happening in those steps, not also "and the ones vanished".
  const focusTens =
    phase === "predict-tens" || phase === "count-tens" || phase === "share-tens" || phase === "count-leftover" || phase === "unpack-intro";
  const focusOnesGroup =
    phase === "focus-ones" || phase === "predict-ones" || phase === "count-ones" || phase === "share-ones" || phase === "remainder";
  const inUnpack = phase === "unpack-intro" || phase === "unpack";
  const isCountingLeftover = phase === "count-leftover";
  // The ones column is fully hidden (not just faded) while the tens are the sole focus - it only
  // comes back once unpacking itself needs somewhere for the regrouped units to land.
  const showOnesColumn = !focusTens;
  // Step 2 (intro) is the place-value breakdown alone - friends fade in starting step 3
  // (reveal-friends) and stay visible from then on, including while counting tens (item 2: no need
  // to hide the friends just because we're counting - they're who we're counting FOR).
  const showFriendsRow = phase !== "intro";
  // "we'll start with the tens" - a highlighted ring on the tens column while that's being said,
  // shown ONLY at focus-tens (rendered as its own fading overlay below, not a class toggle, so
  // it can cross-fade in/out instead of popping).
  const tensPathHighlight = phase === "focus-tens";
  // Tens is fully hidden (not just faded) once ones is the sole focus, same "unmount, don't dim"
  // treatment as the ones column gets elsewhere - and justify-center on the row then centers the
  // lone ones column automatically.
  const showTensColumn = !focusOnesGroup;

  const tensSharedTarget = tensPredicted !== null ? tensPredicted * divisor : 0;
  const tensPoolCount = tensDigit - tensSharePlaced;
  // Within the remaining pool, the next (tensSharedTarget - tensSharePlaced) blocks are still
  // queued to be shared; anything after that is genuine leftover, set aside for good.
  const tensRemainingToShare = Math.max(0, tensSharedTarget - tensSharePlaced);
  const dimTensDuringShare = phase === "share-tens";
  const showTensCountLabels = phase === "count-tens";
  const leftoverFullyCounted = leftoverCountProgress >= tensLeftover;

  const usingOnesTotalPool = focusOnesGroup;
  const onesShareTarget = onesPredicted !== null ? onesPredicted * divisor : 0;
  // Remainder ones get a red highlight (not just dimmed) from share-ones onward, so they read as
  // clearly "these are the leftover", carrying the same visual language as the counting demo.
  const remainderHighlightPhases = phase === "share-ones" || phase === "remainder";
  const showOnesCountLabels = phase === "count-ones";

  // Column-wise running totals, matching exactly what's currently rendered in each pool. Once a
  // pack finishes unpacking (moved), it's gone from the tens pool for good - not just mid-unpack.
  const movedTensCount = unpackStages.filter((s) => s === "moved").length;
  const tensVisibleCount = tensPoolCount - movedTensCount;
  const onesVisibleCount = usingOnesTotalPool
    ? onesTotal - onesSharedRounds * divisor
    : onesDigit + movedTensCount * 10;

  return (
    <div className="flex flex-col items-center gap-6 p-1 w-full">
      {/* Row 1: the tens/ones breakdown itself - the dividend numeral now lives permanently in
          the WorkingAnswer column to the left of the workarea, not duplicated here. */}
      <div className="flex items-center gap-5 justify-center w-full">
        <div
          className="flex flex-wrap gap-5 justify-center items-start"
          style={{ animation: "fade-in-up 0.4s ease both", animationDelay: "0.3s" }}
        >
          {/* Tens column - fully unmounted (not just dimmed) once ones is the sole focus, so the
              row's justify-center genuinely centers the lone ones column instead of leaving a
              faint ghost of tens pulling it off-center. */}
          <AnimatePresence>
            {showTensColumn && (
              <motion.div
                key="tens-column"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="relative flex flex-col items-center gap-2.5 py-3.5 px-5 rounded-xl"
              >
                {/* The "we'll start here" path-highlight - its own fading overlay (not a class
                    toggle on the column itself), so it cross-fades in/out cleanly instead of an
                    abrupt border popping on/off. */}
                <AnimatePresence>
                  {tensPathHighlight && (
                    <motion.div
                      key="tens-path-highlight"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="absolute inset-0 rounded-xl border-[1.5px] border-s3-bucket pointer-events-none"
                      style={{ animation: "path-pulse 1.6s ease-in-out infinite" }}
                    />
                  )}
                </AnimatePresence>
                <ColumnHeader label="Tens" count={tensVisibleCount} />
                <div className="grid gap-2.5 justify-center min-h-[42px]" style={TENS_POOL_GRID}>
                  {inUnpack
                    ? Array.from({ length: tensPoolCount }).map((_, k) => {
                        const stage = unpackStages[k] ?? "packed";
                        if (stage !== "packed") return <TensPackGhost key={k} />;
                        const block = (
                          <MotionBlock
                            id={`s3-tens-pack-${k}`}
                            kind="tens"
                            draggable={phase === "unpack"}
                            dropTargetRef={onesColumnRef}
                            onDropSuccess={() => onTapUnpack(k)}
                            onDragActivity={notifyActivity}
                          />
                        );
                        if (phase === "unpack" && k === firstPackedIndex && showHint) {
                          return (
                            <div key={k} className="relative" ref={hintPackRef}>
                              {block}
                              <DragHint packRef={hintPackRef} targetRef={onesColumnRef} />
                            </div>
                          );
                        }
                        return <span key={k}>{block}</span>;
                      })
                    : isCountingLeftover
                      ? // These packs are never groupable - that's the whole point, they're what's
                        // left over - so it's a plain running count (1.. 2.. 3..), then the whole
                        // set colors red + shakes together once fully counted, same "we counted
                        // them all and it still wasn't enough" language as tensCountHighlight's
                        // own leftover branch.
                        Array.from({ length: tensVisibleCount }).map((_, k) => {
                          const counted = k < leftoverCountProgress;
                          const label = counted ? k + 1 : null;
                          return (
                            <Block
                              key={k}
                              kind="tens"
                              countLabel={label}
                              highlight={leftoverFullyCounted ? "leftover" : null}
                              shake={leftoverFullyCounted}
                            />
                          );
                        })
                      : Array.from({ length: tensVisibleCount }).map((_, k) => {
                          const label = showTensCountLabels && k < tensCountProgress ? (k % divisor) + 1 : null;
                          const dim = dimTensDuringShare && k >= tensRemainingToShare;
                          const highlight = showTensCountLabels ? tensCountHighlight(k, tensCountProgress, tensDigit, divisor, tensPredicted) : null;
                          return <Block key={k} kind="tens" dimmed={dim} countLabel={label} highlight={highlight} shake={highlight === "leftover"} />;
                        })}
                </div>
                {/* tensLeftover defaults to 0 before it's actually computed (SELECT_TENS_PREDICTION) -
                    gate on tensPredicted being set too, or this reads as "nothing left over" during
                    intro/reveal-friends/focus-tens/predict-tens, when nothing has been shared yet. */}
                {tensPredicted !== null && tensLeftover === 0 && !focusTens && (
                  <div className="font-mono text-[13px] text-ink-3">all shared</div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Ones column - unmounted entirely (not just faded) while focusTens, see
              showOnesColumn; fades in/out around that rather than popping. */}
          <AnimatePresence>
            {showOnesColumn && (
              <motion.div
                key="ones-column"
                ref={onesColumnRef}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
                transition={{ duration: 0.3, delay: 0.15 }}
                className="flex flex-col items-center gap-2.5 py-3.5 px-5 rounded-xl"
              >
                <ColumnHeader label="Ones" count={onesVisibleCount} />
                <div className="flex flex-wrap gap-3.5 justify-center max-w-[340px] min-h-[24px]">
                  {usingOnesTotalPool
                    ? // Grouped into chunks of `divisor` - tight gap-1.5 within a chunk, a wider
                      // gap-3 between chunks (the outer container's gap), so groups of `divisor`
                      // read visually via proximity alone, no color-coding needed to see them.
                      Array.from({ length: Math.ceil(onesTotal / divisor) }).map((_, g) => {
                        const groupBlocks = Array.from({ length: divisor }).map((_, j) => {
                          const i = g * divisor + j;
                          if (i >= onesTotal || i < onesSharedRounds * divisor) return null;
                          const highlight = showOnesCountLabels
                            ? onesCountHighlight(i, onesCountProgress, divisor, onesPredicted)
                            : remainderHighlightPhases && i >= onesShareTarget
                              ? "leftover"
                              : null;
                          const label = showOnesCountLabels ? onesCountLabel(i, onesCountProgress, divisor) : null;
                          const tappable =
                            phase === "share-ones" && i < onesShareTarget && i >= onesSharedRounds * divisor
                              ? onTapShareRound
                              : undefined;
                          return <MotionBlock key={i} id={`s3-one-${i}`} kind="ones" highlight={highlight} countLabel={label} onTap={tappable} />;
                        });
                        if (groupBlocks.every((b) => b === null)) return null;
                        return (
                          <div key={g} className="flex flex-wrap gap-2 justify-center">
                            {groupBlocks}
                          </div>
                        );
                      })
                    : Array.from({ length: onesDigit }).map((_, i) => (
                        <Block key={`d${i}`} kind="ones" />
                      ))}
                  {inUnpack &&
                    Array.from({ length: tensLeftover }).map((_, k) => {
                      const stage = unpackStages[k] ?? "packed";
                      // "moving"/"fading": the pack itself, now rendered here instead of the tens
                      // pool - the SAME layoutId means Framer FLIPs it across from its old tens
                      // position, then it fades out in place once "fading" sets opacity to 0.
                      if (stage === "moving" || stage === "fading") {
                        return <MotionBlock key={`pack-${k}`} id={`s3-tens-pack-${k}`} kind="tens" opacity={stage === "fading" ? 0 : 1} />;
                      }
                      // "moved": the pack is gone - its 10 equivalent ones fade in, using the SAME
                      // ids those units will carry once focus-ones's onesTotal pool takes over, so
                      // there's no visual pop at that phase boundary.
                      if (stage === "moved") {
                        return Array.from({ length: 10 }).map((_, j) => (
                          <MotionBlock key={`${k}-${j}`} id={`s3-one-${onesDigit + k * 10 + j}`} kind="ones" />
                        ));
                      }
                      return null;
                    })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Status callouts - the leftover-counting demo's conclusion, then unpack-intro's own
          separate beat. mode="wait" so "{N} Tens Extra" fully exits before "Let's unpack!" enters,
          matching the "fade out, THEN fade in" sequencing rather than a cross-dissolve. */}
      <AnimatePresence mode="wait">
        {isCountingLeftover && leftoverFullyCounted && (
          <StatusCallout
            key="cannot-share"
            icon="🚫"
            label={`${tensLeftover} ${tensLeftover === 1 ? "Ten" : "Tens"} Extra`}
            colorClass="bg-s3-leftover-bg border-s3-leftover text-s3-leftover"
          />
        )}
        {phase === "unpack-intro" && (
          <StatusCallout key="unpack-label" icon="📦" label="Let's unpack!" colorClass="bg-s3-bucket-bg border-s3-bucket text-s3-bucket" />
        )}
      </AnimatePresence>

      {phase === "unpack" && (
        <div className="font-mono text-[13px] text-ink-3">
          {unpackStages.filter((s) => s === "moved").length} of {unpackStages.length} unpacked
        </div>
      )}
      {phase === "share-ones" && (
        <button
          type="button"
          onClick={onTapShareRound}
          className="px-7 py-3.5 rounded-full bg-left text-card font-sans font-semibold text-[17px] hover:brightness-105 transition-colors"
        >
          Tap to share a round
        </button>
      )}

      {/* Row 2: the friends themselves - shown from reveal-friends onward (fades in as the ONLY
          thing that changes that step) and stays visible for the rest of the flow, hidden only
          during intro (breakdown-only). The "Friends" count pill above it is the same
          number->visual pairing the WorkingAnswer column gives the divisor - "4" isn't just
          spoken in the narration, it's shown right above the 4 friends it refers to. w-full so
          it matches row 1's width. */}
      <AnimatePresence>
        {showFriendsRow && (
          <motion.div
            key="friends-row"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-2.5 w-full"
          >
            <ColumnHeader label="Friends" count={divisor} />
            <div className="flex flex-wrap gap-3.5 justify-center items-start">
              {Array.from({ length: divisor }).map((_, c) => {
                // Round-robin: friend c received one unit in each of the onesSharedRounds
                // rounds so far, at pool indices c, divisor+c, 2*divisor+c, ...
                const oneIds = Array.from({ length: onesSharedRounds }, (_, r) => r * divisor + c);
                return <Container key={c} index={c} tensCount={tensContainerCounts[c]} oneIds={oneIds} />;
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
