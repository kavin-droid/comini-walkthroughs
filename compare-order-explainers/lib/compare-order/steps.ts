import { build, joinAndFrag, joinFrag, K, Q } from "./narration";
import type { NumItem, PlaceDef, Step } from "./types";

const ORDINAL: Record<number, string> = { 1: "1st", 2: "2nd", 3: "3rd", 4: "4th" };
function ordinal(n: number): string {
  return ORDINAL[n] ?? `${n}th`;
}

function toItem(value: number, origIndex: number, places: PlaceDef[]): NumItem {
  const digits: NumItem["digits"] = {};
  places.forEach((p) => {
    digits[p.key] = p.digit(value);
  });
  return { value, origIndex, digits };
}

function cloneItems(items: NumItem[]): NumItem[] {
  return items.map((p) => ({ value: p.value, origIndex: p.origIndex, digits: { ...p.digits } }));
}

/** Builds the opening number-by-number reveal: one step per number. Each number's card mounts
 * with all of its places already present in the data, but NumCard plays a stagger-reveal
 * animation (smallest place first - ones, then tens, then hundreds) driven purely by CSS
 * animation-delay, scoped to whichever card's origIndex matches this step's focusOrigIndex - see
 * NumCard's `focused` prop. Keeps the comparison walkthrough below from opening with every
 * place-value breakdown already on screen, which is a lot to take in at once for a young learner,
 * without needing a separate step (and a separate Next tap) per place. */
function buildIntroSteps(nums: number[], places: PlaceDef[]): Step[] {
  const steps: Step[] = [];
  const shown: NumItem[] = [];

  nums.forEach((value, idx) => {
    shown.push(toItem(value, idx, places));
    steps.push({
      phase: "intro",
      pool: cloneItems(shown),
      placed: [],
      hiPlace: null,
      focusOrigIndex: idx,
      tiedVals: null,
      winnerVal: null,
      winnerTag: "smallest",
      revealAnswer: false,
      done: false,
      chainTokens: null,
      explanation: build("Here's the ", K(ordinal(idx + 1)), " number: ", Q(value), "."),
      requiresTap: false,
      tapPrompt: null,
    });
  });

  return steps;
}

/** Direct port of the vanilla stage2/stage3 apps' generateSteps(): repeatedly finds the smallest
 * remaining number by comparing places big-to-small (tie-breaking on original input order when
 * every place is equal), recording one step per micro-decision so the walkthrough can step
 * through the reasoning place-by-place rather than jumping straight to the sorted result. */
export function generateSteps(nums: number[], places: PlaceDef[]): Step[] {
  const introSteps = buildIntroSteps(nums, places);

  let pool = nums.map((v, i) => toItem(v, i, places));
  let placed: NumItem[] = [];
  const steps: Step[] = [];

  function snap(overrides: Partial<Step>): Step {
    return {
      phase: "compare",
      pool: cloneItems(pool),
      placed: cloneItems(placed),
      hiPlace: null,
      focusOrigIndex: null,
      tiedVals: null,
      winnerVal: null,
      winnerTag: "smallest",
      revealAnswer: false,
      done: false,
      chainTokens: null,
      explanation: [],
      requiresTap: false,
      tapPrompt: null,
      ...overrides,
    };
  }

  steps.push(
    snap({
      explanation: build(
        "Order ",
        joinFrag(
          pool.map((p) => [Q(p.value)]),
          ", ",
        ),
        ". Compare ",
        joinFrag(
          places.map((p) => [K(p.label)]),
          ", then ",
        ),
        ".",
      ),
    }),
  );

  while (pool.length) {
    if (pool.length === 1) {
      const w = pool[0];
      steps.push(
        snap({
          winnerVal: w.value,
          winnerTag: "last",
          explanation: build(Q(w.value), " is the last number."),
        }),
      );
      pool = [];
      placed.push(w);
      steps.push(
        snap({ explanation: build(Q(w.value), " moves to the ", K(ordinal(placed.length)), " spot.") }),
      );
      continue;
    }

    let candidates = pool.slice();
    let winner: NumItem | null = null;

    for (let pi = 0; pi < places.length; pi++) {
      const place = places[pi];
      const isDeeper = pi > 0;

      if (!isDeeper) {
        steps.push(
          snap({
            hiPlace: place.key,
            explanation: build(
              K(place.label.charAt(0).toUpperCase() + place.label.slice(1)),
              ": ",
              joinFrag(
                candidates.map((p) => build(Q(p.value), ` has ${p.digits[place.key]}`)),
                ", ",
              ),
              ".",
            ),
          }),
        );
      }

      const minVal = Math.min(...candidates.map((p) => p.digits[place.key]!));
      const tied = candidates.filter((p) => p.digits[place.key] === minVal);

      if (tied.length === 1) {
        winner = tied[0];
        const others = candidates.filter((p) => p !== winner);
        steps.push(
          snap({
            hiPlace: place.key,
            tiedVals: isDeeper ? candidates.map((p) => p.value) : null,
            winnerVal: winner.value,
            requiresTap: true,
            tapPrompt: isDeeper
              ? others.length === 1
                ? build("Tap the number with the smaller ", K(place.label), ".")
                : build("Tap the number with the smallest ", K(place.label), " of the tied numbers.")
              : build("Tap the number with the smallest ", K(place.label), "."),
            explanation: isDeeper
              ? others.length === 1
                ? build(
                    Q(winner.value),
                    " has the smaller ",
                    K(place.label),
                    ": ",
                    Q(winner.value),
                    " ",
                    K("<"),
                    " ",
                    Q(others[0].value),
                    ".",
                  )
                : build(Q(winner.value), " has the smallest ", K(place.label), " of the tied numbers.")
              : build(Q(winner.value), " has the smallest ", K(place.label), "."),
          }),
        );
        break;
      }

      if (pi === places.length - 1) {
        winner = tied.slice().sort((a, b) => a.origIndex - b.origIndex)[0];
        steps.push(
          snap({
            tiedVals: tied.map((p) => p.value),
            winnerVal: winner.value,
            winnerTag: "equal",
            requiresTap: true,
            tapPrompt: build("These numbers are ", K("equal"), ". Tap one."),
            explanation: build(
              joinAndFrag(tied.map((p) => [Q(p.value)])),
              " are ",
              K("equal"),
              ": ",
              joinFrag(
                tied.map((p) => [Q(p.value)]),
                " = ",
              ),
              ".",
            ),
          }),
        );
        break;
      }

      const nextPlace = places[pi + 1];
      steps.push(
        snap({
          tiedVals: tied.map((p) => p.value),
          explanation: build(
            joinAndFrag(tied.map((p) => [Q(p.value)])),
            tied.length === 2 ? " are the same" : " are all the same",
            " on ",
            K(place.label),
            ` (${minVal}). Compare `,
            K(nextPlace.label),
            ": ",
            joinFrag(
              tied.map((p) => build(Q(p.value), ` has ${p.digits[nextPlace.key]}`)),
              ", ",
            ),
            ".",
          ),
        }),
      );
      candidates = tied;
    }

    pool = pool.filter((p) => p !== winner);
    placed.push(winner!);
    steps.push(
      snap({ explanation: build(Q(winner!.value), " moves to the ", K(ordinal(placed.length)), " spot.") }),
    );
  }

  const chainTokens: { type: "num" | "sym"; text: string }[] = [];
  placed.forEach((p, idx) => {
    if (idx > 0) {
      const prev = placed[idx - 1];
      chainTokens.push({ type: "sym", text: prev.value === p.value ? "=" : "<" });
    }
    chainTokens.push({ type: "num", text: String(p.value) });
  });

  const narrChain: (string | ReturnType<typeof Q>)[] = [];
  placed.forEach((p, idx) => {
    if (idx > 0) {
      const prev = placed[idx - 1];
      narrChain.push(prev.value === p.value ? " = " : " < ");
    }
    narrChain.push(Q(p.value));
  });

  steps.push(
    snap({
      revealAnswer: true,
      done: true,
      chainTokens,
      explanation: build(K("Done."), " ", ...narrChain),
    }),
  );

  return [...introSteps, ...steps];
}
