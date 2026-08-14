"use client";

import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { useVisualizeForm } from "@/hooks/useVisualizeForm";
import type { Direction, StepSize } from "@/lib/skip-counting/types";

type VisualizeForm = ReturnType<typeof useVisualizeForm>;

function SegButton({
  active,
  onClick,
  children,
  ariaLabel,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  ariaLabel?: string;
}) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      onClick={onClick}
      className={cn(
        "font-mono text-[12px] font-semibold rounded-lg border-[1.5px] border-transparent px-[11px] py-[9px] cursor-pointer transition-colors",
        active
          ? "bg-card text-ink border-line-2 shadow-[0_1px_2px_rgba(42,31,20,0.08)]"
          : "text-ink-2 hover:text-ink",
      )}
    >
      {children}
    </button>
  );
}

/** The "Question" sentence - ported from the vanilla app's #options-panel node, which is the
 * exact same DOM reparented between the mobile modal and the desktop row. Here it's the same
 * JSX rendered from two separate mount points (OptionsPanel, QuestionRow) sharing one
 * useVisualizeForm() instance each, per PORT-TO-NEXT.md's plain-conditional-rendering guidance. */
export function QuestionFields({ form, inputBg }: { form: VisualizeForm; inputBg: string }) {
  const { config, startVal, setStartVal, jumps, setJumps, dir, setDir, step, setStep, handleVisualize } = form;

  return (
    <div className="flex items-end gap-2.5 flex-wrap justify-center min-[900px]:justify-start">
      <div className="flex flex-col items-center gap-1">
        <input
          type="number"
          inputMode="numeric"
          aria-label="Start"
          value={startVal}
          onChange={(e) => setStartVal(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleVisualize()}
          min={config.minStart}
          max={config.maxStart}
          className={cn(
            "w-20 h-11 rounded-xl border-2 border-line-2 px-2 font-mono text-lg text-center text-ink focus:outline-none focus:border-accent",
            inputBg,
          )}
        />
        <span className="font-mono text-[9px] uppercase tracking-wide text-ink-3">start</span>
      </div>
      <span className="font-serif italic text-[15px] text-ink-3 mb-[22px]">Skip count</span>
      <div className="inline-flex gap-1 bg-paper-2 p-1 rounded-xl mb-[22px]">
        <SegButton active={dir === 1} onClick={() => setDir(1 as Direction)} ariaLabel="Skip count forward">
          →
        </SegButton>
        <SegButton active={dir === -1} onClick={() => setDir(-1 as Direction)} ariaLabel="Count back">
          ←
        </SegButton>
      </div>
      <span className="font-serif italic text-[15px] text-ink-3 mb-[22px]">by</span>
      <div className="relative inline-flex items-center mb-[22px]">
        <select
          aria-label="Step size"
          value={step}
          onChange={(e) => setStep(Number(e.target.value) as StepSize)}
          className={cn(
            "h-11 rounded-xl border-2 border-line-2 pl-3 pr-8 font-mono text-base font-semibold text-ink cursor-pointer appearance-none focus:outline-none focus:border-accent",
            inputBg,
          )}
        >
          {config.stepOptions.map((s) => (
            <option key={s} value={s}>
              {s}s
            </option>
          ))}
        </select>
        <ChevronDown size={14} className="pointer-events-none absolute right-2.5 text-ink-3" />
      </div>
      <span className="font-serif italic text-[15px] text-ink-3 mb-[22px]">for</span>
      <div className="flex flex-col items-center gap-1">
        <input
          type="number"
          inputMode="numeric"
          aria-label="Jumps"
          value={jumps}
          onChange={(e) => setJumps(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleVisualize()}
          min={config.minJumps}
          max={config.maxJumps}
          className={cn(
            "w-20 h-11 rounded-xl border-2 border-line-2 px-2 font-mono text-lg text-center text-ink focus:outline-none focus:border-accent",
            inputBg,
          )}
        />
        <span className="font-mono text-[9px] uppercase tracking-wide text-ink-3">jumps</span>
      </div>
    </div>
  );
}
