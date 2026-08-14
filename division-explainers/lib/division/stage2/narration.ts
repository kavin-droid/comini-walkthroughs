import { K, Q, T, type NarrationFragment } from "../types";
import type { Stage2Session } from "./types";

export function buildStage2Narration(session: Stage2Session): NarrationFragment[] {
  const { total, divisor, concept, quotient, phase, dotsPlaced, previewCount } = session;
  const isSharing = concept === "sharing";

  switch (phase) {
    case "equation":
      return [Q(`${total} ÷ ${divisor}`), T(".")];

    case "reveal-dividend":
      return previewCount < total
        ? [T("Let's count "), K(String(total)), T(" items.")]
        : [T("That's "), Q(total), T(" items, all counted.")];

    case "reveal-divisor":
      if (isSharing) {
        return previewCount < divisor
          ? [T("Now let's count "), K(`${divisor} friends`), T(" to share with.")]
          : [T("There are "), Q(divisor), T(" friends ready to share with.")];
      }
      // Grouping's reveal-divisor covers 3 beats in one step: the friend appearing
      // (previewCount 0->1), then filling that friend with `divisor` items (dotsPlaced 0->divisor),
      // then settling once full - see stage2Reducer's TICK for "reveal-divisor".
      if (previewCount < 1) return [T("Here comes a friend to serve.")];
      if (dotsPlaced < divisor) return [T("Each friend needs "), K(String(divisor)), T(" items.")];
      return [K("Friend "), Q(1), T(": served with "), Q(divisor), T(".")];

    case "round1":
      // Sharing only - grouping's equivalent beat now lives inside reveal-divisor (see above).
      return [K("Let's share"), T(": one item to each friend.")];

    case "predict":
      return isSharing
        ? [T("How many will each friend get?")]
        : [T("Each friend gets "), K(String(divisor)), T(". How many friends can we serve?")];

    case "distribute": {
      const round = Math.max(1, Math.floor(dotsPlaced / divisor));
      const isLast = round === quotient;
      if (isSharing) {
        return isLast
          ? [K("Round "), Q(round), T(": the last item to each friend.")]
          : [K("Round "), Q(round), T(": one more to each friend.")];
      }
      return isLast
        ? [K("Friend "), Q(round), T(": served with the last "), Q(divisor), T(".")]
        : [K("Friend "), Q(round), T(": served with "), Q(divisor), T(" more.")];
    }

    case "feedback":
      return isSharing
        ? [T("All shared! Let's check your "), K("guess"), T(".")]
        : [T("All served! Let's check your "), K("guess"), T(".")];

    case "reveal":
      return isSharing
        ? [
            K("Division"),
            T(" is sharing. "),
            Q(`${total} ÷ ${divisor}`),
            T(" means "),
            Q(total),
            T(" shared among "),
            Q(divisor),
            T(". Each friend gets "),
            Q(quotient),
            T("."),
          ]
        : [
            K("Division"),
            T(" is a shortcut too. Each friend needs "),
            Q(divisor),
            T(". "),
            Q(`${total} ÷ ${divisor} = ${quotient}`),
            T(" friends."),
          ];

    case "notation":
      return [T("We write this as "), Q(`${total} ÷ ${divisor} = ${quotient}`), T(".")];

    case "done":
      return isSharing
        ? [K("Done."), T(" "), Q(`${total} ÷ ${divisor} = ${quotient}`), T(".")]
        : [K("Done."), T(" We served "), Q(quotient), T(" friends, "), Q(divisor), T(" each.")];

    default:
      return [];
  }
}
