"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const STEP_MS = 180;

/** Ported from the vanilla apps' buildCalloutHtml(): each equivalent form fades in with a
 * staggered delay (180ms apart), separated by "=", the last (newly-discovered) form bold. Used
 * for every fraction equivalence/combination callout in both stages. */
export function Callout({ parts }: { parts: string[] }) {
  let delay = 0;
  const pieces: { key: string; text: string; delay: number; muted?: boolean; strong?: boolean }[] = [];
  parts.forEach((part, i) => {
    if (i > 0) {
      pieces.push({ key: `eq-${i}`, text: "=", delay, muted: true });
      delay += STEP_MS;
    }
    pieces.push({ key: `part-${i}`, text: part, delay, strong: i === parts.length - 1 });
    delay += STEP_MS;
  });

  return (
    <div
      className="flex items-baseline justify-center gap-1.5 flex-wrap font-serif text-[16px] italic text-ink text-center px-4 py-2.5 rounded-[12px] border"
      style={{ background: "var(--color-half-bg)", borderColor: "rgba(62, 111, 196, 0.25)" }}
    >
      {pieces.map((p) => (
        <motion.span
          key={p.key}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.35, delay: p.delay / 1000 }}
          className={cn(
            p.muted && "text-ink-3 font-light not-italic",
            p.strong && "font-mono not-italic font-bold text-half",
          )}
        >
          {p.text}
        </motion.span>
      ))}
    </div>
  );
}
