import { getLooseCount } from "./session";
import { destPlace } from "./pack";
import type { AdditionConfig, PhaseObj, Place, Session } from "./types";

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

export function placeSingular(place: Place): string {
  if (place === "hundreds") return "hundred";
  if (place === "tens") return "ten";
  return "one";
}

export function placePlural(place: Place): string {
  return place;
}

export function buildNarration(
  phaseObj: PhaseObj,
  session: Session,
  config: AdditionConfig,
): NarrationFragment[] {
  const { a1, a2, sum } = session;
  const places = config.processingOrder;

  switch (phaseObj.type) {
    case "intro":
      return [T("Add "), Q(`${a1} + ${a2}`), T(".")];

    case "showA":
      return [T("Here is "), Q(String(a1)), T(".")];

    case "showB":
      return [T("Here is "), Q(String(a2)), T(".")];

    case "focus": {
      const place = phaseObj.place!;
      const isFirst = places.indexOf(place) === 0;
      return isFirst
        ? [T("Let's add the "), K(placePlural(place)), T(" first.")]
        : [T("Let's add the "), K(placePlural(place)), T(" next.")];
    }

    case "predict": {
      const place = phaseObj.place!;
      const carry = session.carryIn[place];
      const carryPrefix: NarrationFragment[] =
        carry > 0
          ? [T(`You packed 1 ${placeSingular(place)}. `)]
          : [];
      return [
        ...carryPrefix,
        T("How many "),
        K(placePlural(place)),
        T("?"),
      ];
    }

    case "drag": {
      const place = phaseObj.place!;
      if (session.awaitingPack[place]) {
        return [T("You have 10 "), K(placePlural(place)), T(". Pack them.")];
      }
      return [
        T("Move the "),
        K(placePlural(place)),
        T(" down, one by one."),
      ];
    }

    case "compare":
      return [T("Let's "), K("see if you were right"), T(".")];

    case "bridge": {
      const place = phaseObj.place!;
      const loose = getLooseCount(place, session);
      const word = loose === 1 ? placeSingular(place) : placePlural(place);
      return [T("Here are the "), K(`${loose} ${word}`), T(".")];
    }

    case "bridgecarry": {
      const place = phaseObj.place!;
      return [T("And the 1 "), K(placeSingular(destPlace(place))), T(" we packed.")];
    }

    case "reveal": {
      // Display order (big place to small), matching the on-screen grid layout left-to-right -
      // NOT processingOrder (ones-first), which used to read the sentence backwards from the grid.
      const parts = config.places.map((place) => {
        const loose = getLooseCount(place, session);
        return `${loose} ${loose === 1 ? placeSingular(place) : placePlural(place)}`;
      });
      const joined =
        parts.length <= 1
          ? parts.join("")
          : parts.slice(0, -1).join(", ") + " and " + parts[parts.length - 1];
      return [T(joined + " make "), K(String(sum)), T(".")];
    }

    case "done":
      return [K("You did it!"), T(" "), Q(`${a1} + ${a2} = ${sum}`), T(".")];

    default:
      return [];
  }
}
