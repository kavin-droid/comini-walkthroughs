"use client";

import { Button } from "@/components/ds/Button";
import { STAGE2_META, type Stage2Concept } from "@/lib/division/stage2";
import { useStage2Form, type Stage2Committed } from "@/hooks/useStage2Form";

/** Desktop-only inline layout matching the vanilla app-shell spec: "Question" label, the two
 * number inputs, and the Visualize button sit in a single row inside #options-row-desktop -
 * Concept/Progression live in the header instead (Stage2HeaderPills), sharing this same `concept`
 * value from their common parent since both are mounted simultaneously on desktop. */
export function Stage2QuestionRow({
  committed,
  concept,
  onVisualize,
}: {
  committed: Stage2Committed;
  concept: Stage2Concept;
  onVisualize: (next: Stage2Committed) => void;
}) {
  const { dividendInput, setDividendInput, divisorInput, setDivisorInput, error, handleVisualize } = useStage2Form(
    committed,
    concept,
    onVisualize,
  );

  return (
    <div className="flex items-center justify-between gap-4 bg-card border border-line rounded-2xl px-[18px] py-[14px] shadow-sm flex-wrap">
      <div className="flex items-center gap-3.5 flex-1">
        <span className="font-mono text-[11px] font-bold uppercase tracking-wide text-ink-3 shrink-0">
          Question
        </span>
        <div className="flex items-center gap-[18px] flex-1 flex-nowrap">
          <input
            type="number"
            inputMode="numeric"
            value={dividendInput}
            onChange={(e) => setDividendInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleVisualize()}
            min={STAGE2_META.dividendMin}
            max={STAGE2_META.dividendMax}
            className="w-[88px] h-11 rounded-xl border-2 border-line-2 bg-card px-2 font-mono text-xl text-center text-ink focus:outline-none focus:border-accent"
          />
          <span className="font-serif font-light text-2xl text-ink-3">÷</span>
          <input
            type="number"
            inputMode="numeric"
            value={divisorInput}
            onChange={(e) => setDivisorInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleVisualize()}
            min={STAGE2_META.divisorMin}
            max={STAGE2_META.divisorMax}
            className="w-[88px] h-11 rounded-xl border-2 border-line-2 bg-card px-2 font-mono text-xl text-center text-ink focus:outline-none focus:border-accent"
          />
        </div>
      </div>
      <Button variant="primary" onClick={handleVisualize} className="w-[160px] shrink-0">
        Go
      </Button>
      {error && <p className="text-accent text-[13px] basis-full">{error}</p>}
    </div>
  );
}
