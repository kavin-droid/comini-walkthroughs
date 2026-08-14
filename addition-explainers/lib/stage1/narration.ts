import type { Stage1PhaseObj, Stage1Session } from "./types";

export interface NarrationFragment {
  text: string;
  emphasis?: "key" | "quote";
}

function K(text: string): NarrationFragment {
  return { text, emphasis: "key" };
}
function Q(text: string): NarrationFragment {
  return { text, emphasis: "quote" };
}
function T(text: string): NarrationFragment {
  return { text };
}

/** Purely supportive - every phase must already make sense with this hidden (see
 * HideTextToggle). Kept terse: this audience can't read yet, so narration is for the adult
 * alongside them, not a required instruction the child has to parse. */
export function buildNarration(phaseObj: Stage1PhaseObj, session: Stage1Session): NarrationFragment[] {
  const { a1, a2, sum } = session;

  switch (phaseObj.type) {
    case "intro":
      return [T("Add "), Q(`${a1} + ${a2}`), T(".")];

    case "showSetA":
      return [T("Here is "), Q(String(a1)), T(".")];

    case "showSetB":
      return [T("Here are "), Q(String(a2)), T(" more.")];

    case "dragA":
      return [T("Move "), K("all"), T(" the dots into the box.")];

    case "dragB":
      return [T("Now move "), K("the other"), T(" dots in.")];

    case "predict":
      return [T("How many dots "), K("now"), T("?")];

    case "count":
      return [T("Let's "), K("count the dots"), T(" in the box.")];

    case "done":
      return [Q(`${a1} + ${a2}`), T(" = "), K(String(sum)), T(".")];

    default:
      return [];
  }
}
