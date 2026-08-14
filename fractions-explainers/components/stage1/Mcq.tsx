"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

const OPTIONS = ["Whole", "Half"] as const;
const WRONG_RETRY_MS = 900;

/** A tiny glyph mirroring the split-bar visual from the earlier steps - one solid block for
 * "Whole", two blocks with a gap (one dimmed) for "Half" - so the choice is legible by shape
 * alone, not just an English word a pre-reader can't read yet. */
function OptionGlyph({ opt }: { opt: "Whole" | "Half" }) {
  const blockClass = "h-4 rounded-[3px]";
  if (opt === "Whole") {
    return <div className={cn(blockClass, "w-9 bg-current")} />;
  }
  return (
    <div className="flex gap-1">
      <div className={cn(blockClass, "w-4 bg-current")} />
      <div className={cn(blockClass, "w-4 bg-current opacity-30")} />
    </div>
  );
}

/** "What is it?" - tap Whole or Half. These two words are the actual controls, not narration, so
 * they're never affected by the hide-text toggle (contrast WordLabel). Each button also carries a
 * shape glyph (see OptionGlyph) so the choice doesn't depend on reading the word. A wrong pick
 * shakes back to idle after a beat so the child can try again; a right pick locks in with a check
 * and calls `onSolved`. */
export function Mcq({ correct, onSolved }: { correct: "Whole" | "Half"; onSolved: () => void }) {
  const [status, setStatus] = useState<"idle" | "wrong" | "right">("idle");

  useEffect(() => {
    if (status !== "wrong") return;
    const t = window.setTimeout(() => setStatus("idle"), WRONG_RETRY_MS);
    return () => window.clearTimeout(t);
  }, [status]);

  function pick(opt: string) {
    if (status === "right") return;
    if (opt === correct) {
      setStatus("right");
      onSolved();
    } else {
      setStatus("wrong");
    }
  }

  return (
    <div className="flex flex-col items-center gap-2.5">
      <div className="flex gap-4">
        {OPTIONS.map((opt) => (
          <motion.button
            key={opt}
            type="button"
            onClick={() => pick(opt)}
            animate={status === "wrong" ? { x: [0, -8, 8, -6, 6, 0] } : { x: 0 }}
            transition={{ duration: 0.4 }}
            disabled={status === "right"}
            className={cn(
              "flex flex-col items-center gap-2 px-6 py-3 rounded-2xl border-2 font-sans font-bold text-[17px] transition-colors",
              status === "right" && opt === correct
                ? "bg-left border-left text-card"
                : "bg-card border-line-2 text-ink hover:border-accent disabled:opacity-60",
            )}
          >
            <OptionGlyph opt={opt} />
            <span className="flex items-center gap-1.5">
              {status === "right" && opt === correct && <Check size={18} />}
              {opt}
            </span>
          </motion.button>
        ))}
      </div>
      <div className="h-6">
        <AnimatePresence>
          {status === "wrong" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-1 text-accent text-[13px] font-semibold"
            >
              <X size={14} /> Try again
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
