"use client";

import { motion } from "framer-motion";
import { barPieceStyle } from "./BarWholeIntro";

const MINI_GAP = 10;

function glow(on: boolean) {
  return on
    ? "0 0 0 4px rgba(62,111,196,0.55)"
    : "0 0 0 0px rgba(62,111,196,0)";
}

/** Small (non-interactive) recap renders of the bar/jar/pizza, shared by RecapWhole and
 * RecapHalf. `split` toggles whole vs. two-piece layout; `highlightFirst`/`highlightSecond`
 * independently glow each piece (used by RecapHalf's numerator/denominator highlight sequence -
 * "first piece" glowing alone illustrates the "1" in "1/2", both glowing together illustrates the
 * "2"). `compact` shrinks every shape further, for FinalRecap's side-by-side whole+half layout
 * where two full sets need to fit on screen together. Everything here is the exact same
 * continuous animate-target pattern as the interactive steps, just permanently settled rather
 * than triggered by a tap/drag. */
function MiniBar({
  split,
  highlightFirst,
  highlightSecond,
  compact,
}: {
  split: boolean;
  highlightFirst: boolean;
  highlightSecond: boolean;
  compact: boolean;
}) {
  return (
    <div
      className="relative"
      style={
        compact
          ? { width: "clamp(84px, 14vw, 140px)", height: "clamp(40px, 6vw, 62px)" }
          : { width: "clamp(120px, 20vw, 200px)", height: "clamp(56px, 9vw, 88px)" }
      }
    >
      <motion.div
        className="absolute top-0 left-0 h-full rounded-l-[12px] border-2"
        style={{ ...barPieceStyle, width: "50%" }}
        animate={{ x: split ? -MINI_GAP / 2 : 0, boxShadow: glow(highlightFirst) }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-0 right-0 h-full rounded-r-[12px] border-2"
        style={{ ...barPieceStyle, width: "50%" }}
        animate={{ x: split ? MINI_GAP / 2 : 0, boxShadow: glow(highlightSecond) }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
      />
    </div>
  );
}

function MiniJar({
  split,
  highlightFirst,
  highlightSecond,
  compact,
}: {
  split: boolean;
  highlightFirst: boolean;
  highlightSecond: boolean;
  compact: boolean;
}) {
  const fill = split ? 50 : 100;
  return (
    <motion.div
      className="relative rounded-[10px_10px_22px_22px] border-2 overflow-hidden shrink-0"
      style={{
        width: compact ? "clamp(42px, 7vw, 68px)" : "clamp(60px, 10vw, 96px)",
        aspectRatio: 92 / 190,
        background: "rgba(255,255,255,0.35)",
        borderColor: "var(--color-ink-3)",
      }}
      animate={{ boxShadow: glow(highlightFirst || highlightSecond) }}
      transition={{ duration: 0.5 }}
    >
      {split && (
        <div
          className="absolute left-0 right-0 border-t-2 border-dashed z-10"
          style={{ top: "50%", borderColor: "rgba(62,111,196,0.55)" }}
        />
      )}
      <motion.div
        className="absolute left-0 right-0 bottom-0"
        style={{ background: "linear-gradient(180deg, #5D95E0, var(--color-half))" }}
        animate={{ height: `${fill}%` }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
      />
    </motion.div>
  );
}

function MiniPizza({
  split,
  highlightFirst,
  highlightSecond,
  compact,
}: {
  split: boolean;
  highlightFirst: boolean;
  highlightSecond: boolean;
  compact: boolean;
}) {
  const crustStyle = {
    background: "radial-gradient(circle at 35% 30%, #F0C36B, #E0A83E 55%, #C6842A)",
    borderColor: "#8A5A1C",
  };
  return (
    <div
      className="relative"
      style={{ width: compact ? "clamp(46px, 8vw, 70px)" : "clamp(64px, 11vw, 100px)", aspectRatio: 1 }}
    >
      <motion.div
        className="absolute top-0 left-0 h-full border-2"
        style={{ ...crustStyle, width: "50%", borderRadius: "999px 0 0 999px" }}
        animate={{ x: split ? -MINI_GAP / 2 : 0, boxShadow: glow(highlightFirst) }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-0 right-0 h-full border-2"
        style={{ ...crustStyle, width: "50%", borderRadius: "0 999px 999px 0" }}
        animate={{ x: split ? MINI_GAP / 2 : 0, boxShadow: glow(highlightSecond) }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
      />
    </div>
  );
}

export function RecapShapes({
  split,
  highlightFirst = false,
  highlightSecond = false,
  compact = false,
}: {
  split: boolean;
  highlightFirst?: boolean;
  highlightSecond?: boolean;
  compact?: boolean;
}) {
  return (
    <div className={compact ? "flex flex-wrap items-center justify-center gap-4" : "flex flex-wrap items-center justify-center gap-8"}>
      <MiniBar split={split} highlightFirst={highlightFirst} highlightSecond={highlightSecond} compact={compact} />
      <MiniJar split={split} highlightFirst={highlightFirst} highlightSecond={highlightSecond} compact={compact} />
      <MiniPizza split={split} highlightFirst={highlightFirst} highlightSecond={highlightSecond} compact={compact} />
    </div>
  );
}
