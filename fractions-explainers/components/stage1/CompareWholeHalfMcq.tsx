"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { AnnotationArrow } from "./AnnotationArrow";
import { WordLabel } from "./WordLabel";
import { barPieceStyle } from "./BarWholeIntro";
import { crustStyle, Pepperoni, LEFT_PEPPERONI, RIGHT_PEPPERONI, SIZE } from "./PizzaCutHalf";

const HOLD_MS = 1400;
const GAP_BAR = 26;
const GAP_PIZZA = 20;

const glowBar = (on: boolean) =>
  on
    ? "0 0 0 5px rgba(62,111,196,0.55), inset 0 2px 3px rgba(255,255,255,0.18), inset 0 -3px 5px rgba(0,0,0,0.3)"
    : "0 0 0 0px rgba(62,111,196,0), inset 0 2px 3px rgba(255,255,255,0.18), inset 0 -3px 5px rgba(0,0,0,0.3)";
const glowPizza = (on: boolean) =>
  on
    ? "0 0 0 5px rgba(62,111,196,0.55), inset 0 3px 5px rgba(255,255,255,0.35), inset 0 -4px 6px rgba(0,0,0,0.2)"
    : "0 0 0 0px rgba(62,111,196,0), inset 0 3px 5px rgba(255,255,255,0.35), inset 0 -4px 6px rgba(0,0,0,0.2)";

/** Shared by both the bar and pizza contexts (barCompareMcq/pizzaCompareMcq): the shape starts
 * already split and plays a sequence - both pieces glow together labeled "Whole", then it narrows
 * to just the left piece glowing labeled "Half" - then settles there. Doesn't render its own Mcq:
 * once the sequence settles (phase 2) it calls `onMcqReady("Half")` so Stage1Walkthrough can show
 * the actual Whole/Half buttons in its own row below the instruction text, outside the workarea -
 * this keeps the workarea to visuals-only and puts every step's answer controls in one consistent
 * place. */
export function CompareWholeHalfMcq({
  shape,
  onMcqReady,
}: {
  shape: "bar" | "pizza";
  onMcqReady: (correct: "Whole" | "Half") => void;
}) {
  const [phase, setPhase] = useState<0 | 1 | 2>(0);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    setPhase(0);
    timers.current.push(window.setTimeout(() => setPhase(1), HOLD_MS));
    timers.current.push(window.setTimeout(() => setPhase(2), HOLD_MS * 2));
    return () => timers.current.forEach((t) => window.clearTimeout(t));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (phase === 2) onMcqReady("Half");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  const bothGlow = phase === 0;
  const leftGlow = phase === 0 || phase >= 1;
  const label = phase === 0 ? "Whole" : "Half";
  const isBar = shape === "bar";
  const gap = isBar ? GAP_BAR : GAP_PIZZA;
  const glow = isBar ? glowBar : glowPizza;

  return (
    <div className="relative flex flex-col items-center gap-6 w-full">
      <div
        className="relative"
        style={
          isBar
            ? { width: "min(82vw, 680px)", height: "clamp(120px, 22vh, 220px)" }
            : { width: SIZE, aspectRatio: 1 }
        }
      >
        {isBar ? (
          <>
            <motion.div
              className="absolute top-0 left-0 h-full rounded-l-[18px] border-2"
              style={{ ...barPieceStyle, width: "50%" }}
              animate={{ x: -gap / 2, boxShadow: glow(leftGlow) }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
            />
            <motion.div
              className="absolute top-0 right-0 h-full rounded-r-[18px] border-2"
              style={{ ...barPieceStyle, width: "50%" }}
              animate={{ x: gap / 2, boxShadow: glow(bothGlow) }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
            />
          </>
        ) : (
          <>
            <motion.div
              className="absolute top-0 left-0 h-full overflow-hidden border-2"
              style={{ ...crustStyle, width: "50%", borderRadius: "999px 0 0 999px" }}
              animate={{ x: -gap / 2, boxShadow: glow(leftGlow) }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
            >
              {LEFT_PEPPERONI.map((p, i) => (
                <Pepperoni key={i} top={p.top} left={p.left} />
              ))}
            </motion.div>
            <motion.div
              className="absolute top-0 right-0 h-full overflow-hidden border-2"
              style={{ ...crustStyle, width: "50%", borderRadius: "0 999px 999px 0" }}
              animate={{ x: gap / 2, boxShadow: glow(bothGlow) }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
            >
              {RIGHT_PEPPERONI.map((p, i) => (
                <Pepperoni key={i} top={p.top} left={p.left} />
              ))}
            </motion.div>
          </>
        )}

        <AnnotationArrow visible={phase < 2} className="left-1/2 -top-9" />
        <WordLabel text={label} visible={phase < 2} className="left-1/2 top-[calc(100%+18px)]" />
      </div>
    </div>
  );
}
