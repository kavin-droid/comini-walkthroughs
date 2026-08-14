"use client";

import { useFractions } from "./FractionContext";
import { useVisualizeForm } from "./VisualizeFormContext";
import { Button } from "@/components/ds/Button";

const fractionSelectClass =
  "w-[88px] h-11 px-2 rounded-[12px] border-2 border-line-2 bg-paper font-mono text-[17px] font-semibold text-center text-ink cursor-pointer focus:outline-none focus:border-accent";

/** Desktop-only inline layout matching the vanilla app-shell spec: "Question" label, the fraction
 * input(s), and the Visualize button sit in a single row - Concept/Progression live in the header
 * instead (see HeaderPills). The question field's shape depends on the *draft* concept selection
 * (from VisualizeFormContext, not the committed session), matching the vanilla app's
 * concept-select 'change' handler, which toggles `#q-equivalence`/`#q-combine` immediately, before
 * Visualize is ever pressed. */
export function QuestionRow() {
  const { config } = useFractions();
  const { conceptId, fraction, setFraction, piece1, setPiece1, piece2, setPiece2, handleVisualize } =
    useVisualizeForm();
  const draftConcept = config.concepts.find((c) => c.id === conceptId) ?? config.concepts[0];

  return (
    <div className="flex items-center justify-between gap-4 bg-card border border-line rounded-2xl px-[18px] py-[14px] shadow-sm flex-wrap">
      <div className="flex items-center gap-3.5 flex-1">
        <span className="font-mono text-[11px] font-bold uppercase tracking-wide text-ink-3 shrink-0">
          Question
        </span>
        {draftConcept.inputMode === "single" ? (
          <select
            aria-label="Fraction"
            value={fraction}
            onChange={(e) => setFraction(e.target.value)}
            className={fractionSelectClass}
          >
            {draftConcept.fractionOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        ) : (
          <div className="flex items-center gap-2.5">
            <select
              aria-label="First piece"
              value={piece1}
              onChange={(e) => setPiece1(e.target.value)}
              className={fractionSelectClass}
            >
              {draftConcept.piece1Options.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            <span className="font-serif font-light text-2xl text-ink-3">+</span>
            <select
              aria-label="Second piece"
              value={piece2}
              onChange={(e) => setPiece2(e.target.value)}
              className={fractionSelectClass}
            >
              {draftConcept.piece2Options.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
      <Button variant="primary" onClick={() => handleVisualize()} className="w-[160px] shrink-0">
        Go
      </Button>
    </div>
  );
}
