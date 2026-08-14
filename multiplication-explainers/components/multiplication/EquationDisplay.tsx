"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { AnswerPart } from "@/lib/multiplication/types";

/** Renders a `step.answer` part list (the "3 x 4 = ?" equation) with its styling - shared by
 * AnswerCard (always shown, above the workspace) and BoxGroupsView (the "build from the
 * equation" concept also draws its own copy inside the workspace, right above the containers
 * it's building, per size/emphasis passed via `size`). */
export function EquationDisplay({
  parts,
  size = "card",
}: {
  parts: AnswerPart[];
  size?: "card" | "inline";
}) {
  return (
    <span
      className={cn(
        "font-mono font-semibold text-ink leading-snug",
        size === "card" ? "text-[24px] min-[900px]:text-[28px]" : "text-[20px]",
      )}
    >
      {parts.map((part, i) =>
        part.highlight ? (
          <motion.span
            key={i}
            initial={{ scale: 0.85 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3, ease: [0.34, 1.56, 0.64, 1] }}
            className="inline-block bg-accent/15 text-accent px-2 rounded-lg"
          >
            {part.text}
          </motion.span>
        ) : part.kind === "new" ? (
          <span key={i} className="text-accent inline-block animate-in fade-in zoom-in-95 duration-500">
            {part.text}
          </span>
        ) : part.kind === "ph" ? (
          <span key={i} className="text-ink-3 opacity-50">
            {part.text}
          </span>
        ) : (
          <span key={i}>{part.text}</span>
        ),
      )}
    </span>
  );
}
