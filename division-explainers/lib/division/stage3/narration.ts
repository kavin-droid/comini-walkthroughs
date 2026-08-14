import { K, Q, T, type NarrationFragment } from "../types";
import type { Stage3Session } from "./types";

function pl(n: number, word: string): string {
  return n === 1 ? word : `${word}s`;
}

export function buildStage3Narration(session: Stage3Session): NarrationFragment[] {
  const {
    dividend,
    divisor,
    tensDigit,
    onesDigit,
    phase,
    tensPredicted,
    tensCountProgress,
    tensLeftover,
    leftoverCountProgress,
    onesTotal,
    onesPredicted,
    onesCountProgress,
    onesSharedRounds,
    remainder,
    unpackStages,
  } = session;

  switch (phase) {
    case "numerals":
      return [T("Share "), Q(`${dividend} ÷ ${divisor}`), T(". Split into "), K("tens"), T(" and "), K("ones"), T(".")];

    case "intro":
      return [
        Q(dividend),
        T(" is "),
        Q(`${tensDigit} ${pl(tensDigit, "ten")}`),
        T(" and "),
        Q(`${onesDigit} ${pl(onesDigit, "one")}`),
        T("."),
      ];

    case "reveal-friends":
      return [T("We'll share among "), Q(`${divisor} friends`), T(".")];

    case "focus-tens":
      return [T("Let's start with the "), K("tens"), T(".")];

    case "predict-tens":
      return [T("How many "), Q(`${divisor}s`), T(" fit into "), Q(tensDigit), T("?")];

    case "count-tens": {
      if (tensCountProgress < tensDigit || tensPredicted === null) {
        return [T("Let's "), K("count"), T(` to see how many ${divisor}s fit in ${tensDigit}.`)];
      }
      if (tensPredicted === 0) {
        return [T("No "), Q(`${divisor}s`), T(" fit in "), Q(tensDigit), T(".")];
      }
      return [
        Q(tensPredicted),
        T(tensPredicted === 1 ? ` ${divisor} fits in ` : ` ${divisor}s fit in `),
        Q(tensDigit),
        T("."),
      ];
    }

    case "share-tens":
      return tensPredicted
        ? [T("Sharing "), Q(`${tensPredicted} ${pl(tensPredicted, "ten")}`), T(" to each friend.")]
        : [T("We can't share the tens yet.")];

    case "count-leftover": {
      if (leftoverCountProgress < tensLeftover) {
        return [T("Let's "), K("count"), T(" these tens.")];
      }
      const isAre = tensLeftover === 1 ? "is" : "are";
      const itThem = tensLeftover === 1 ? "it" : "them";
      return [Q(tensLeftover), T(` ${pl(tensLeftover, "ten")} ${isAre} extra. We can't share ${itThem} the same way.`)];
    }

    case "unpack-intro":
      return [K("Unpack"), T(" them into ones.")];

    case "unpack":
      return unpackStages.length > 0 && unpackStages.every((s) => s === "moved")
        ? [T("All unpacked into "), K("ones"), T(".")]
        : [T("Drag "), K("each pack"), T(" into the ones to unpack it.")];

    case "focus-ones":
      return [T("Now let's look at the "), K("ones"), T(".")];

    case "predict-ones":
      return [
        T("Now we have "),
        Q(`${onesTotal} ${pl(onesTotal, "one")}`),
        T(". How many "),
        Q(`${divisor}s`),
        T(" fit into "),
        Q(onesTotal),
        T("?"),
      ];

    case "count-ones": {
      if (onesPredicted === null || onesCountProgress < onesTotal) {
        return [T("Let's "), K("count"), T(` to see how many ${divisor}s fit in ${onesTotal}.`)];
      }
      if (onesPredicted === 0) {
        return [T("No "), Q(`${divisor}s`), T(" fit in "), Q(onesTotal), T(".")];
      }
      return [
        Q(onesPredicted),
        T(onesPredicted === 1 ? ` ${divisor} fits in ` : ` ${divisor}s fit in `),
        Q(onesTotal),
        T("."),
      ];
    }

    case "share-ones":
      return [T("Tap to share "), K("one round"), T(" to every friend.")];

    case "remainder":
      return remainder > 0
        ? [T("That leaves "), Q(remainder), T(". That's our "), K("remainder"), T(".")]
        : [T("Everything is shared. "), K("No remainder"), T(".")];

    case "recap": {
      const quotient = (tensPredicted ?? 0) * 10 + (onesPredicted ?? 0);
      return [
        T("Here's the answer: "),
        Q(dividend),
        T(" shared among "),
        Q(divisor),
        T(" friends, "),
        Q(quotient),
        T(" each."),
        ...(remainder > 0 ? [T(" Remainder "), Q(remainder), T(".")] : []),
      ];
    }

    case "notation": {
      const quotient = (tensPredicted ?? 0) * 10 + (onesPredicted ?? 0);
      const expr = remainder > 0 ? `${dividend} ÷ ${divisor} = ${quotient} remainder ${remainder}` : `${dividend} ÷ ${divisor} = ${quotient}`;
      return [T("We write this as "), Q(expr), T(".")];
    }

    case "done": {
      const quotient = (tensPredicted ?? 0) * 10 + (onesPredicted ?? 0);
      const expr = remainder > 0 ? `${dividend} ÷ ${divisor} = ${quotient} remainder ${remainder}` : `${dividend} ÷ ${divisor} = ${quotient}`;
      return [K("Done."), T(" "), Q(expr), T(".")];
    }

    default:
      return [];
  }
}
