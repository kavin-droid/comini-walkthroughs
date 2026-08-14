"use client";

import { useStage1VisualizeForm } from "@/hooks/useStage1VisualizeForm";
import { Button } from "@/components/ds/Button";
import { STAGE1_MINUEND_MIN, STAGE1_MINUEND_MAX, STAGE1_SUBTRAHEND_MIN, STAGE1_SUBTRAHEND_MAX } from "@/lib/stage1/config";

/** Desktop-only inline "Question" card - pixel-identical layout to subtraction/QuestionRow.tsx
 * (round-21: "do you see tags in the stage2 question container? remove the tags entirely" - the
 * preset pills that used to sit under the inputs are gone, this is now label + two inputs + Show,
 * nothing else, exactly matching stage2). */
export function Stage1QuestionRow() {
  const { minuend, setMinuend, subtrahend, setSubtrahend, error, handleVisualize } = useStage1VisualizeForm();

  return (
    <div className="flex flex-col gap-3 bg-card border border-line rounded-2xl px-[18px] py-[14px] shadow-sm">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3.5 flex-1">
          <span className="font-mono text-[11px] font-bold uppercase tracking-wide text-ink-3 shrink-0">
            Question
          </span>
          <div className="flex items-center gap-[18px] flex-1 flex-nowrap">
            <input
              type="number"
              inputMode="numeric"
              value={minuend}
              onChange={(e) => setMinuend(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleVisualize()}
              min={STAGE1_MINUEND_MIN}
              max={STAGE1_MINUEND_MAX}
              className="w-20 h-11 rounded-lg border border-line bg-paper px-2 font-mono text-lg text-center text-ink focus:outline-none focus:border-accent"
            />
            <span className="font-serif font-light text-xl text-ink-3">−</span>
            <input
              type="number"
              inputMode="numeric"
              value={subtrahend}
              onChange={(e) => setSubtrahend(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleVisualize()}
              min={STAGE1_SUBTRAHEND_MIN}
              max={STAGE1_SUBTRAHEND_MAX}
              className="w-20 h-11 rounded-lg border border-line bg-paper px-2 font-mono text-lg text-center text-ink focus:outline-none focus:border-accent"
            />
          </div>
        </div>
        <Button variant="primary" onClick={handleVisualize} className="w-[160px] shrink-0">
          Show
        </Button>
      </div>
      {error && <p className="text-accent text-[13px]">{error}</p>}
    </div>
  );
}
