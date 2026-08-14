"use client";

import { useMultiplication } from "./MultiplicationContext";
import { useVisualizeForm } from "./VisualizeFormContext";
import { Button } from "@/components/ds/Button";

/** Desktop-only inline layout matching the vanilla app-shell spec: "Question" label, the two
 * factor inputs, and the Visualize button sit in a single row - on desktop this shows the
 * question only (Concept/Progression live in the header instead, see HeaderPills). */
export function QuestionRow() {
  const { config } = useMultiplication();
  const { aText, setAText, bText, setBText, conceptId, error, handleVisualize } = useVisualizeForm();
  const activeConcept = config.concepts.find((c) => c.id === conceptId);
  const bLocked = activeConcept?.lockFactorB ?? false;

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
            aria-label={config.factorALabel}
            value={aText}
            onChange={(e) => setAText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleVisualize()}
            min={activeConcept?.factorAMin ?? config.factorAMin}
            max={activeConcept?.factorAMax ?? config.factorAMax}
            className="w-20 h-11 rounded-lg border border-line bg-paper px-2 font-mono text-lg text-center text-ink focus:outline-none focus:border-accent"
          />
          <span className="font-serif font-light text-xl text-ink-3">×</span>
          <input
            type="number"
            inputMode="numeric"
            aria-label={config.factorBLabel}
            value={bText}
            onChange={(e) => setBText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleVisualize()}
            min={activeConcept?.factorBMin ?? config.factorBMin}
            max={activeConcept?.factorBMax ?? config.factorBMax}
            disabled={bLocked}
            className="w-20 h-11 rounded-lg border border-line bg-paper px-2 font-mono text-lg text-center text-ink focus:outline-none focus:border-accent disabled:bg-paper-2 disabled:text-ink-2 disabled:opacity-75"
          />
        </div>
      </div>
      <Button variant="primary" onClick={() => handleVisualize()} className="w-[160px] shrink-0">
        Go
      </Button>
      {error && <p className="text-accent text-[13px] basis-full">{error}</p>}
    </div>
  );
}
