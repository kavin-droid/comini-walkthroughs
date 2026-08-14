import { K, Q, T, type NarrationFragment } from "../types";
import type { Stage1Session } from "./types";

/** Deliberately short - a pre-reader can't follow a sentence, so every line here is a handful of
 * words plus a numeral (Q()) that doubles as the same big monospace pill used everywhere else in
 * the app. The animation + annotations (arrow, glow, pointing hand) carry the actual explanation;
 * this text is a caption for the adult in the room, not the primary channel - see hideText. */
export function buildStage1Narration(session: Stage1Session): NarrationFragment[] {
  const { total, people, quotient, phase, dotsPlaced, previewCount } = session;

  switch (phase) {
    case "pile-reveal":
      return previewCount < total ? [T("Counting…")] : [Q(total), K(" ready!")];

    case "people-reveal":
      return previewCount < people ? [Q(previewCount), T(" friends…")] : [Q(people), K(" friends!")];

    case "distribute":
      return dotsPlaced < total ? [K("Drag"), T(" to share!")] : [K("All shared!")];

    case "celebrate":
      return [Q(quotient), T(" each.")];

    case "recap":
      return [Q(total), T(" ÷ "), Q(people), T(" = "), Q(quotient)];

    case "done":
      return [K("Great job!")];

    default:
      return [];
  }
}
