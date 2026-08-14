"use client";

import { useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { Stage1Session } from "@/lib/division/stage1";
import { useMediaQuery, DESKTOP_QUERY } from "@/hooks/useMediaQuery";
import { useLingerAfter } from "@/hooks/useLingerAfter";
import { LiveCounter } from "@/components/division/shared/LiveCounter";
import { MotionCandy } from "./MotionCandy";
import { PersonTray } from "./PersonTray";
import { Stage1Equation } from "./Stage1Equation";
import { ArrowAnnotation } from "./ArrowAnnotation";
import { PointingHand } from "./PointingHand";
import { GlowRing } from "./GlowRing";
import { Confetti } from "@/components/division/shared/Confetti";
import { ITEM_SIZE, TRAY_W, AVATAR_SIZE, canvasSize, pileItemCenter, trayTopLeft, trayIncomingAnchor } from "./canvas";

/** The one continuous canvas for pile-reveal through celebrate - same "one scene, items travel
 * between its regions" shape as stage2's Stage2SharingScene, just with a fixed-pixel coordinate
 * space instead of flex-wrap, since the annotation arrows need known, stable anchor points (see
 * canvas.ts). recap/done get their own dedicated view (Stage1NotationView) - a different shape
 * entirely (equation + icon columns), not this interactive board; Stage1Workspace crossfades
 * between the two rather than cutting instantly. `compact` (narrow/mobile) switches canvas.ts to a
 * taller, narrower layout so the scene's own aspect ratio is closer to a phone's - a landscape
 * canvas contain-fit into a portrait screen otherwise leaves most of the screen empty and shrinks
 * every tap target well below a 5-year-old's finger.
 *
 * pile-reveal/people-reveal additionally show the equation up top, highlighting whichever number
 * is currently being counted out below it - the thing that actually ties "10" to a pile of ten
 * candies for a pre-reader, instead of the number only ever living in the disconnected header
 * AnswerCard. The board itself sits dimmed underneath while the equation has the floor, then comes
 * into full focus once the equation fades out for distribute. */
export function Stage1MainScene({ session, onShareItem }: { session: Stage1Session; onShareItem: () => void }) {
  const { total, people, phase, dotsPlaced, previewCount, placements } = session;
  const compact = !useMediaQuery(DESKTOP_QUERY);
  const trayRefs = useRef<Record<number, HTMLDivElement | null>>({});

  const { w: canvasW, h: canvasH } = canvasSize(total, people, compact);
  const peopleVisibleCount = phase === "pile-reveal" ? 0 : phase === "people-reveal" ? previewCount : people;
  const activeIndex = phase === "distribute" && dotsPlaced < total ? dotsPlaced : null;
  const activeTarget = activeIndex !== null ? placements[activeIndex] : null;

  const showEquation = phase === "pile-reveal" || phase === "people-reveal";
  const equationHighlight = phase === "pile-reveal" ? "total" : phase === "people-reveal" ? "people" : null;
  const boardOpacity = showEquation ? 0.4 : 1;
  // Lingers 0.5s after the last dot lands (not gone the instant it appears) - a beat to let "yep,
  // that's all of them" register before the number goes away.
  const dotCounterLingering = useLingerAfter(phase === "pile-reveal" && previewCount < total, 500);
  const showDotCounter = phase === "pile-reveal" && dotCounterLingering;

  /** pile-reveal: only the counted-in prefix exists yet. people-reveal: the whole pile sits there,
   * untouched. distribute: whatever hasn't been dragged away yet. celebrate: the pile is empty (all
   * items now live in trays), so it isn't rendered at all. */
  function isPileItemVisible(i: number): boolean {
    if (phase === "pile-reveal") return i < previewCount;
    if (phase === "people-reveal") return true;
    if (phase === "distribute") return i >= dotsPlaced;
    return false;
  }

  function itemIdsFor(personIndex: number): number[] {
    const ids: number[] = [];
    for (let i = 0; i < dotsPlaced; i++) if (placements[i] === personIndex) ids.push(i);
    return ids;
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <AnimatePresence>
        {showEquation && (
          <motion.div
            key="equation"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35 }}
          >
            <Stage1Equation total={total} people={people} highlight={equationHighlight} />
          </motion.div>
        )}
      </AnimatePresence>
      <LiveCounter show={showDotCounter} count={previewCount} colorClass="text-s1-glow bg-s1-glow-bg border-[rgba(242,169,59,0.35)]" />

      <motion.div
        className="relative"
        style={{ width: canvasW, height: canvasH }}
        animate={{ opacity: boardOpacity }}
        transition={{ duration: 0.5 }}
      >
        {phase === "celebrate" && <Confetti />}

        {/* Pile: every not-yet-shared item sits at its fixed grid slot. Items that have been
            shared (index < dotsPlaced) simply aren't rendered here anymore - the SAME layoutId is
            instead rendered inside its target tray below, so Framer animates the real travel
            between the two instead of one vanishing while another pops in. z-10 (vs trays' z-0) -
            a candy mid-drag/FLIP travels visually across a tray box on its way in, and it needs to
            stay on top of that box the whole time, not duck behind it partway through. */}
        {Array.from({ length: total }).map((_, i) => {
          if (!isPileItemVisible(i)) return null;
          const { x, y } = pileItemCenter(i, compact);
          const isActive = i === activeIndex;
          return (
            <div key={i} className="absolute z-10" style={{ left: x, top: y, transform: "translate(-50%, -50%)" }}>
              <MotionCandy
                id={i}
                draggable={isActive}
                dropTargetRef={isActive ? { current: trayRefs.current[activeTarget ?? -1] ?? null } : undefined}
                onDropSuccess={isActive ? onShareItem : undefined}
              />
            </div>
          );
        })}

        {/* Active-item annotations: glow ring on the item to drag, a nudging hand above it, and a
            drawn arrow tracing exactly where it's about to go. All three point at the SAME item,
            so there's no ambiguity about what "this one" means. GlowRing/PointingHand glide (CSS
            transition on left/top) between successive active items rather than teleporting, so
            the "what to drag next" cue is itself a continuous, followable motion, not a jump-cut. */}
        {activeIndex !== null &&
          (() => {
            const from = pileItemCenter(activeIndex, compact);
            return (
              <>
                <GlowRing x={from.x} y={from.y} size={ITEM_SIZE + 16} />
                <PointingHand x={from.x} y={from.y - ITEM_SIZE / 2 - 6} />
              </>
            );
          })()}
        <ArrowAnnotation
          canvasW={canvasW}
          canvasH={canvasH}
          from={
            activeIndex !== null && activeTarget !== null
              ? { ...pileItemCenter(activeIndex, compact), to: trayIncomingAnchor(activeTarget, people, total, compact) }
              : null
          }
        />

        {/* Trays: one per person, fixed slots (wrapping after canvas.ts's traysPerRow), each
            showing whichever items have landed on them so far. Also the drop target for the
            active candy's drag gesture. */}
        {Array.from({ length: people }).map((_, i) => {
          const { x, y } = trayTopLeft(i, people, total, compact);
          const visible = i < peopleVisibleCount;
          return (
            <div
              key={i}
              ref={(el) => {
                trayRefs.current[i] = el;
              }}
              className="absolute z-0"
              style={{ left: x, top: y }}
            >
              <PersonTray index={i} itemIds={visible ? itemIdsFor(i) : []} visible={visible} />
            </div>
          );
        })}

        {/* Celebrate: every face glows at once, same color, same timing (delayMs=0 on all of
            them) - "look, you all have the same" without a single word. */}
        {phase === "celebrate" &&
          Array.from({ length: people }).map((_, i) => {
            const topLeft = trayTopLeft(i, people, total, compact);
            return (
              <GlowRing key={i} x={topLeft.x + TRAY_W / 2} y={topLeft.y + AVATAR_SIZE / 2} size={AVATAR_SIZE + 24} delayMs={0} />
            );
          })}
      </motion.div>
    </div>
  );
}
