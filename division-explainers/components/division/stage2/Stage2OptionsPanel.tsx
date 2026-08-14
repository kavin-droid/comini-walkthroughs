"use client";

import { Button } from "@/components/ds/Button";
import { STAGE2_META, type Stage2Concept } from "@/lib/division/stage2";
import { useStage2Form, type Stage2Committed } from "@/hooks/useStage2Form";
import { ProgressionDropdown } from "@/components/division/shared/ProgressionDropdown";
import { Stage2ConceptSelect } from "./Stage2ConceptSelect";

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="block font-mono text-[11px] font-bold uppercase tracking-wide text-ink-3 mb-1">
      {children}
    </label>
  );
}

/** Mobile-only: all fields stacked in the settings bottom sheet, matching the vanilla modal's
 * question/concept/progression/visualize stack. Desktop splits this across Stage2QuestionRow
 * (question only) + Stage2HeaderPills (concept + progression, in the header) instead. */
export function Stage2OptionsPanel({
  committed,
  concept,
  onConceptChange,
  onVisualize,
  onVisualized,
}: {
  committed: Stage2Committed;
  concept: Stage2Concept;
  onConceptChange: (v: Stage2Concept) => void;
  onVisualize: (next: Stage2Committed) => void;
  onVisualized?: () => void;
}) {
  const { dividendInput, setDividendInput, divisorInput, setDivisorInput, error, handleVisualize } = useStage2Form(
    committed,
    concept,
    (next) => {
      onVisualize(next);
      onVisualized?.();
    },
  );

  return (
    <div className="flex flex-col gap-4">
      <div>
        <FieldLabel>Question</FieldLabel>
        <div className="flex items-center gap-2.5 flex-wrap justify-center">
          <div className="flex flex-col items-center gap-1">
            <label htmlFor="s2-dividend" className="sr-only">
              Dividend
            </label>
            <input
              id="s2-dividend"
              type="number"
              inputMode="numeric"
              value={dividendInput}
              onChange={(e) => setDividendInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleVisualize()}
              min={STAGE2_META.dividendMin}
              max={STAGE2_META.dividendMax}
              className="w-[88px] h-11 rounded-xl border-2 border-line-2 bg-card px-2 font-mono text-xl text-center text-ink focus:outline-none focus:border-accent"
            />
          </div>
          <span className="font-serif font-light text-2xl text-ink-3">÷</span>
          <div className="flex flex-col items-center gap-1">
            <label htmlFor="s2-divisor" className="sr-only">
              {concept === "sharing" ? "Divisor (friends)" : "Divisor (group size)"}
            </label>
            <input
              id="s2-divisor"
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
      </div>

      <div>
        <FieldLabel>Type</FieldLabel>
        <Stage2ConceptSelect value={concept} onChange={onConceptChange} />
      </div>

      <div>
        <FieldLabel>Stage</FieldLabel>
        <ProgressionDropdown />
      </div>

      {error && <p className="text-accent text-[13px] text-center">{error}</p>}

      <Button variant="primary" fullWidth onClick={handleVisualize}>
        Go
      </Button>
    </div>
  );
}
