import { joinWithAnd, pl, singular } from "./format";
import type { PhaseObj, Session, SubtractionConfig } from "./types";

export interface Fragment {
  text: string;
  emphasis?: "key" | "quote";
}

function K(text: string): Fragment {
  return { text, emphasis: "key" };
}
function Q(text: string): Fragment {
  return { text, emphasis: "quote" };
}
function T(text: string): Fragment {
  return { text };
}

export function buildNarration(phaseObj: PhaseObj, session: Session, config: SubtractionConfig): Fragment[] {
  const { minuend, subtrahend, total } = session;
  const places = config.processingOrder;

  switch (phaseObj.type) {
    case "intro": {
      const placeWords = config.places.length === 3 ? "hundreds, tens and ones" : "tens and ones";
      return [
        T("Let's find "),
        Q(`${minuend} − ${subtrahend}`),
        T(`. We'll split each number into ${placeWords}.`),
      ];
    }

    case "showStart":
      return [
        K(String(minuend)),
        T(" is "),
        Q(joinWithAnd(config.places.map((p) => `${session.own[p].start} ${pl(session.own[p].start, p)}`))),
        T("."),
      ];

    case "showTake":
      return [
        K(String(subtrahend)),
        T(" is "),
        Q(joinWithAnd(config.places.map((p) => `${session.own[p].take} ${pl(session.own[p].take, p)}`))),
        T("."),
      ];

    case "regroupAnnounce": {
      const place = phaseObj.place!;
      const have = session.own[place].start;
      const need = session.own[place].take;
      return [
        T("The "),
        K(place),
        T(" need at least "),
        Q(String(need)),
        T(", but there "),
        K(have === 1 ? "is" : "are"),
        T(" only "),
        Q(String(have)),
        T("."),
      ];
    }

    case "regroup": {
      const place = phaseObj.place!;
      const from = session.regroupPlan[place].from!;
      if (!session.regrouped[place]) {
        return [K("Unpack"), T(`: tap the ${singular(from)}.`)];
      }
      return [
        K("Unpack"),
        T(`: 1 ${singular(from)} = 10 ${place}. Now `),
        Q(`${session.own[from].start} ${pl(session.own[from].start, from)}`),
        T(", "),
        Q(`${session.own[place].start} ${pl(session.own[place].start, place)}`),
        T("."),
      ];
    }

    case "spotlight":
    case "focus": {
      // Same message for both steps of the pair - 'spotlight' announces/highlights the place
      // while everything stays visible, then 'focus' narrows the other columns away one step
      // later. The words don't change between them; only what the grid does changes.
      const place = phaseObj.place!;
      const isFirst = places.indexOf(place) === 0;
      // The very first place spells out the whole plan (matches the vanilla source exactly) -
      // this is also the cue for the row labels to highlight that place's digit in BOTH the
      // start and take rows (e.g. the 2 in 342 and the 8 in 168), handled by isNarrowingPhase
      // already including 'focus'. Later places get the terser "Next, the <place>."
      return isFirst
        ? [
            T("Now take away "),
            K(String(subtrahend)),
            T(" from "),
            K(String(minuend)),
            T(". First look at "),
            K(place),
            T("."),
          ]
        : [T("Next, the "), K(place), T(".")];
    }

    case "predict":
      return [T("How many "), K(String(phaseObj.place)), T(" are there in "), Q(String(subtrahend)), T("?")];

    case "drag": {
      const place = phaseObj.place!;
      const need = session.own[place].take;
      return [K("Good!"), T(" Tap to take away "), Q(`${need} ${pl(need, place)}`), T(".")];
    }

    case "expand": {
      const place = phaseObj.place!;
      const removedCount = session.removed[place].length;
      const remainingCount = session.own[place].start - removedCount;
      return [
        K("Nice!"),
        T(" "),
        Q(`${removedCount} ${pl(removedCount, place)}`),
        T(" taken away. "),
        Q(`${remainingCount} ${pl(remainingCount, place)}`),
        T(" now."),
      ];
    }

    case "recap": {
      const place = phaseObj.place!;
      const remainingCount = session.own[place].start - session.removed[place].length;
      return [Q(`${remainingCount} ${pl(remainingCount, place)}`), T(" now.")];
    }

    case "reveal": {
      const parts = config.places.map((p) => {
        const result = session.own[p].start - session.own[p].take;
        return `${result} ${pl(result, p)}`;
      });
      return [Q(joinWithAnd(parts)), T(" make "), K(String(total)), T(".")];
    }

    case "done":
      return [K("Done."), T(" "), Q(`${minuend} − ${subtrahend} = ${total}`), T(".")];

    default:
      return [];
  }
}
