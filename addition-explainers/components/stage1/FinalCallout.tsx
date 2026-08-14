"use client";

import { motion } from "framer-motion";
import { COLOR_A, COLOR_B } from "./colors";
import { Dot } from "./Dot";

/** The "done" recap: the equation again, but now each number has its own dot group sitting
 * right below it - set A's dots under the first addend, set B's under the second, and BOTH
 * groups together under the total, tying the individual parts back to the combined whole. A
 * 5-column grid keeps the "+"/"=" glyphs between the three dot-bearing columns. */
export function FinalCallout({ a1, a2, sum }: { a1: number; a2: number; sum: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="flex flex-col items-center gap-4 min-[900px]:gap-6 bg-card border border-line rounded-2xl px-4 py-5 min-[900px]:px-10 min-[900px]:py-8"
    >
      <div className="grid grid-cols-[auto_auto_auto_auto_auto] items-start gap-2 min-[900px]:gap-4">
        <CalloutColumn label={a1} color={COLOR_A}>
          {Array.from({ length: a1 }).map((_, i) => (
            <Dot key={`a-${i}`} color={COLOR_A} small delay={i * 0.05} />
          ))}
        </CalloutColumn>
        <Glyph>+</Glyph>
        <CalloutColumn label={a2} color={COLOR_B}>
          {Array.from({ length: a2 }).map((_, i) => (
            <Dot key={`b-${i}`} color={COLOR_B} small delay={i * 0.05} />
          ))}
        </CalloutColumn>
        <Glyph>=</Glyph>
        <CalloutColumn label={sum} colorClassName="text-sum">
          {Array.from({ length: a1 }).map((_, i) => (
            <Dot key={`sa-${i}`} color={COLOR_A} small delay={0.3 + i * 0.05} />
          ))}
          {Array.from({ length: a2 }).map((_, i) => (
            <Dot key={`sb-${i}`} color={COLOR_B} small delay={0.3 + (a1 + i) * 0.05} />
          ))}
        </CalloutColumn>
      </div>
    </motion.div>
  );
}

function Glyph({ children }: { children: React.ReactNode }) {
  return (
    <div className="font-serif font-light text-[22px] min-[900px]:text-[32px] text-ink-3 self-center pb-8 min-[900px]:pb-12">
      {children}
    </div>
  );
}

function CalloutColumn({
  label,
  color,
  colorClassName,
  children,
}: {
  label: number;
  color?: string;
  colorClassName?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-2 min-[900px]:gap-3 w-[74px] min-[900px]:w-[120px]">
      <div
        className={colorClassName ? `font-mono text-[26px] min-[900px]:text-[40px] font-bold ${colorClassName}` : "font-mono text-[26px] min-[900px]:text-[40px] font-bold"}
        style={color ? { color } : undefined}
      >
        {label}
      </div>
      <div className="flex flex-wrap justify-center gap-1 min-[900px]:gap-1.5 min-h-[26px] min-[900px]:min-h-[38px]">
        {children}
      </div>
    </div>
  );
}
