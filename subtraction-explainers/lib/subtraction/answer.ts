import { buildPhases } from "./phases";
import type { PhaseObj, Session, SubtractionConfig } from "./types";

export interface AnswerPart {
  text: string;
  kind?: "ph" | "new";
}

/** One entry PER PLACE, always 1:1 aligned with `config.places` (round-22: the working-answer
 * card moved to a column layout that has to zip this together with the minuend/subtrahend digits
 * by place index - a filtered/shorter array would silently shift later columns out of their
 * aligned position). A place stays a '_' placeholder until its own expand-<place> phase has been
 * reached; the single MOST SIGNIFICANT place resolves to an EMPTY string (not '_', not '0') if it
 * settles to zero, so the answer never shows a leading zero (e.g. 24 - 20 = "4" not "04") while
 * still occupying its column slot - blank, not omitted. */
export function buildAnswerParts(phaseObj: PhaseObj, session: Session, config: SubtractionConfig): AnswerPart[] {
  const phases = buildPhases(config, session.regroupPlan);

  return config.places.map((place, i) => {
    const revealed = session.phaseIdx >= phases.indexOf(`expand-${place}`);
    if (!revealed) return { text: "_", kind: "ph" as const };
    const value = session.own[place].start - session.own[place].take;
    if (i === 0 && value === 0) return { text: "" };
    const kind = phaseObj.type === "expand" && phaseObj.place === place ? ("new" as const) : undefined;
    return { text: String(value), kind };
  });
}
