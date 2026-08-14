"use client";

import { Button } from "@/components/ds/Button";
import { STAGE3_META } from "@/lib/division/stage3";
import { useStage3Form, type Stage3Committed } from "@/hooks/useStage3Form";
import { Stage3DivisorSelect } from "./Stage3DivisorSelect";

/** Desktop-only inline layout matching the vanilla app-shell spec: "Question" label, the two
 * inputs, and the Visualize button sit in a single row inside #options-row-desktop - Concept/
 * Progression live in the header instead (Stage3HeaderPills). */
export function Stage3QuestionRow({
  committed,
  onVisualize,
}: {
  committed: Stage3Committed;
  onVisualize: (next: Stage3Committed) => void;
}) {
  const { dividendInput, setDividendInput, divisorInput, setDivisorInput, error, handleVisualize } = useStage3Form(
    committed,
    onVisualize,
  );

  return (
    <div className="flex items-center justify-between gap-4 bg-card border border-line rounded-2xl px-[18px] py-[14px] shadow-sm flex-wrap">
      <div className="flex items-center gap-3.5 flex-1">
        <span className="font-mono text-[11px] font-bold uppercase tracking-wide text-ink-3 shrink-0">
          Question
        </span>
        <div className="flex items-center gap-2.5 flex-1 flex-nowrap justify-between">
          <input
            type="number"
            inputMode="numeric"
            value={dividendInput}
            onChange={(e) => setDividendInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleVisualize()}
            min={STAGE3_META.dividendMin}
            max={STAGE3_META.dividendMax}
            className="w-[88px] h-11 rounded-xl border-2 border-line-2 bg-card px-2 font-mono text-xl text-center text-ink focus:outline-none focus:border-accent"
          />
          <span className="font-serif font-light text-2xl text-ink-3">÷</span>
          <Stage3DivisorSelect value={divisorInput} onChange={setDivisorInput} />
        </div>
      </div>
      <Button variant="primary" onClick={handleVisualize} className="w-[160px] shrink-0">
        Go
      </Button>
      {error && <p className="text-accent text-[13px] basis-full">{error}</p>}
    </div>
  );
}
