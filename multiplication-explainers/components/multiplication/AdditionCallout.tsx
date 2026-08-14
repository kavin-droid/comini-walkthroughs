"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const STEP_MS = 180;

/** Ported from the vanilla apps' buildAdditionCalloutHtml(): each term/operator/total fades in
 * with a staggered delay (180ms apart), used both by stage 2's "repeated addition" callout and
 * stage 3's distributive-property "add the parts back together" callout. `total: null` renders
 * "?" in its place - stage 2 shows the addition first and asks the child to predict the sum
 * before a later step passes the real number here. */
export function AdditionCallout({ terms, total }: { terms: number[]; total: number | null }) {
  let delay = 0;
  const pieces: { key: string; text: string; delay: number; muted?: boolean; strong?: boolean; placeholder?: boolean }[] = [];
  terms.forEach((term, i) => {
    if (i > 0) {
      pieces.push({ key: `op-${i}`, text: "+", delay, muted: true });
      delay += STEP_MS;
    }
    pieces.push({ key: `term-${i}`, text: String(term), delay });
    delay += STEP_MS;
  });
  pieces.push({ key: "eq", text: "=", delay, muted: true });
  delay += STEP_MS;
  pieces.push(
    total === null
      ? { key: "total", text: "?", delay, placeholder: true }
      : { key: "total", text: String(total), delay, strong: true },
  );

  return (
    <div className="flex items-baseline justify-center gap-[7px] flex-wrap font-serif text-[18px] italic text-ink text-center px-[18px] py-[10px] bg-row-bg border border-row/20 rounded-xl">
      {pieces.map((p) => (
        <motion.span
          key={p.key}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.35, delay: p.delay / 1000 }}
          className={cn(
            p.muted && "text-ink-3 font-light not-italic",
            p.strong && "font-mono not-italic font-bold text-row",
            p.placeholder && "font-mono not-italic text-ink-3 opacity-50",
          )}
        >
          {p.text}
        </motion.span>
      ))}
    </div>
  );
}
