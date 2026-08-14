"use client";

import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ds/Button";
import { useTextVisibility } from "@/components/shared/TextVisibilityContext";
import { useFractions } from "./FractionContext";
import { useVisualizeForm } from "./VisualizeFormContext";

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="block font-mono text-[11px] font-bold uppercase tracking-wide text-ink-3 mb-1">
      {children}
    </label>
  );
}

const fractionSelectClass =
  "w-[88px] h-11 px-2 rounded-[12px] border-2 border-line-2 bg-card font-mono text-[17px] font-semibold text-center text-ink cursor-pointer focus:outline-none focus:border-accent";

/** Mobile-only: all fields stacked in the settings bottom sheet (Question, Concept, Visualize) -
 * desktop splits the same shared form across QuestionRow (Question) and HeaderPills (Concept)
 * instead, see APP-SHELL-LAYOUT.md's Settings-panel section. No Progression field for now - see
 * HeaderPills. */
export function OptionsPanel({ onVisualized }: { onVisualized?: () => void }) {
  const { config } = useFractions();
  const { conceptId, setConceptId, fraction, setFraction, piece1, setPiece1, piece2, setPiece2, handleVisualize } =
    useVisualizeForm();
  const { hideText, toggleHideText } = useTextVisibility();
  const draftConcept = config.concepts.find((c) => c.id === conceptId) ?? config.concepts[0];

  function submit() {
    if (handleVisualize()) onVisualized?.();
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <FieldLabel>Question</FieldLabel>
        {draftConcept.inputMode === "single" ? (
          <div className="flex justify-center">
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
          </div>
        ) : (
          <div className="flex items-center justify-center gap-2.5">
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

      <div>
        <FieldLabel>Concept</FieldLabel>
        <select
          className="w-full h-11 px-3 rounded-[12px] border border-line bg-card text-[14px] font-semibold text-ink disabled:bg-paper-2 disabled:text-ink-2 disabled:opacity-75 disabled:cursor-not-allowed"
          value={conceptId}
          disabled={!config.conceptSelectable}
          onChange={(e) => setConceptId(e.target.value)}
        >
          {config.concepts.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <FieldLabel>Instruction text</FieldLabel>
        <button
          type="button"
          onClick={toggleHideText}
          className="w-full flex items-center justify-between px-4 py-3 rounded-[12px] border-2 border-line-2 bg-card"
        >
          <span className="font-sans font-semibold text-[14px] text-ink">Instruction text</span>
          <span className="flex items-center gap-2 font-mono text-[13px] text-ink-2">
            {hideText ? <EyeOff size={16} /> : <Eye size={16} />}
            {hideText ? "Hidden" : "Shown"}
          </span>
        </button>
      </div>

      <Button variant="primary" fullWidth onClick={submit}>
        Go
      </Button>
    </div>
  );
}
