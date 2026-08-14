"use client";

import type { CSSProperties, ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { Stage3Session } from "@/lib/division/stage3";

type NumState = "upcoming" | "active" | "done" | "faded";

// The whole dividend highlights together at "intro", then settles to plain ink for the rest of the
// walkthrough - both its digits share one color and one timeline (see dividendTensDigitState /
// dividendOnesDigitState) so "the dividend" always reads as a single, settled written fact. The
// live "what's happening right now" highlight moves to the subtraction/bring-down rows below
// instead of re-lighting the original digits. Each digit fades to reduced opacity (rather than
// staying full-ink "done") the moment the row below it takes over that digit's job - the tens
// digit once the leftover ("3") is worked out, the ones digit once it's been brought down as part
// of "36" - so the eye is drawn toward whichever number is currently doing the work.
const TENS_FOCUS_PHASES = ["focus-tens", "predict-tens", "count-tens", "share-tens", "count-leftover", "unpack-intro", "unpack"];
const ONES_PHASES = ["focus-ones", "predict-ones", "count-ones", "share-ones", "remainder"];
// The leftover-tens row ("3") appears once they've been counted out and called "extra" - either
// mid count-leftover once its own counting settles, or any phase after.
const LEFTOVER_ROW_PHASES = ["unpack-intro", "unpack", "focus-ones", "predict-ones", "count-ones", "share-ones", "remainder", "recap", "notation", "done"];
// The ones digit "bring-down" (completing "3" into "36") appears once regrouping/unpacking has
// actually finished and the workarea's ones pool reflects the real onesTotal.
const BRING_DOWN_REVEALED_PHASES = ["focus-ones", "predict-ones", "count-ones", "share-ones", "remainder", "recap", "notation", "done"];

function leftoverRevealed(session: Stage3Session): boolean {
  return (session.phase === "count-leftover" && session.leftoverCountProgress >= session.tensLeftover) || LEFTOVER_ROW_PHASES.includes(session.phase);
}

function dividendTensDigitState(session: Stage3Session): NumState {
  const { phase } = session;
  if (phase === "numerals") return "upcoming";
  if (leftoverRevealed(session)) return "faded";
  if (phase === "intro") return "active";
  return TENS_FOCUS_PHASES.includes(phase) ? "active" : "done";
}

// The dividend's ones digit only ever highlights alongside the tens digit at "intro" - once the
// walkthrough moves into the ones arc, the LIVE highlight belongs to the bring-down row's "36"
// (see bringDownState), not this static "6", so this never re-actives for ONES_PHASES.
function dividendOnesDigitState(phase: Stage3Session["phase"]): NumState {
  if (phase === "numerals") return "upcoming";
  if (phase === "intro") return "active";
  if (BRING_DOWN_REVEALED_PHASES.includes(phase)) return "faded";
  return "done";
}

function divisorState(phase: Stage3Session["phase"]): NumState {
  if (phase === "numerals" || phase === "intro") return "upcoming";
  if (phase === "reveal-friends") return "active";
  return "done";
}

// The written quotient digit only appears once its own counting demo has actually reached it -
// tensPredicted/onesPredicted become non-null the instant the MCQ is answered, well before the
// counting animation finishes, so gating on count progress (not just non-null) keeps the written
// answer from "spoiling" the count.
function tensQuotientRevealed(session: Stage3Session): boolean {
  return session.tensPredicted !== null && session.tensCountProgress >= session.tensDigit;
}

function onesQuotientRevealed(session: Stage3Session): boolean {
  return session.onesPredicted !== null && session.onesCountProgress >= session.onesTotal;
}

function tensQuotientState(session: Stage3Session): NumState {
  if (!tensQuotientRevealed(session)) return "upcoming";
  return session.phase === "count-tens" ? "active" : "done";
}

function onesQuotientState(session: Stage3Session): NumState {
  if (!onesQuotientRevealed(session)) return "upcoming";
  return session.phase === "count-ones" ? "active" : "done";
}

// The bring-down row ("3" then "36" once the ones digit joins it) is the live mirror of the
// regrouping work - it lights up for the whole ones arc, then settles once the ones have actually
// been shared out.
function bringDownState(phase: Stage3Session["phase"]): NumState {
  return ONES_PHASES.includes(phase) ? "active" : "done";
}

// The final remainder row always appears once revealed - including "0" for exact division, since
// a real worked long-division never omits its last subtraction just because it comes out even.
const REMAINDER_REVEALED_PHASES = ["remainder", "recap", "notation", "done"];
// The "-4" subtracted-tens row appears once the tens have actually been shared out (matches the
// workarea's share-tens animation), and stays visible from then on as part of the running work.
const SUBTRACTED_TENS_REVEALED_PHASES = [
  "share-tens", "count-leftover", "unpack-intro", "unpack",
  "focus-ones", "predict-ones", "count-ones", "share-ones", "remainder", "recap", "notation", "done",
];
// The "-36" subtracted-ones row (divisor * onesPredicted) mirrors the subtracted-tens row one
// step down - it appears once the ones have actually been shared out round by round.
const SUBTRACTED_ONES_REVEALED_PHASES = ["share-ones", "remainder", "recap", "notation", "done"];

const COLOR_CLASSES: Record<"ten" | "one" | "bucket" | "leftover", string> = {
  ten: "bg-s3-ten-bg text-s3-ten",
  one: "bg-s3-one-bg text-s3-one",
  bucket: "bg-s3-bucket-bg text-s3-bucket",
  leftover: "bg-s3-leftover-bg text-s3-leftover",
};

const OPACITY_CLASSES: Partial<Record<NumState, string>> = {
  upcoming: "opacity-40",
  faded: "opacity-60",
};

// A plain, unrounded grid cell for anything that carries a rule line (border-b/border-l/border-t) -
// keeping the line on this wrapper, separate from DigitCell's own rounded highlight pill, is what
// keeps the rule a straight edge-to-edge line instead of curling into an arc at its rounded corners.
function Cell({
  children,
  className,
  style,
  justify = "end",
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  justify?: "end" | "center";
}) {
  return (
    <div className={cn("flex", justify === "end" ? "justify-end" : "justify-center", className)} style={style}>
      {children}
    </div>
  );
}

function DigitCell({
  value,
  placeholder,
  state,
  color,
  className,
  style,
}: {
  value: number | null;
  placeholder?: string;
  state: NumState;
  color: "ten" | "one" | "bucket" | "leftover";
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <span
      className={cn(
        "inline-block min-w-[1.6ch] text-right font-mono text-[20px] min-[900px]:text-[24px] font-bold rounded-lg px-1 transition-all duration-300",
        state === "active" ? COLOR_CLASSES[color] : "text-ink",
        OPACITY_CLASSES[state],
        className,
      )}
      style={state === "active" ? { animation: "pop-in 0.4s cubic-bezier(0.34,1.56,0.64,1)", ...style } : style}
    >
      {value === null ? placeholder : value}
    </span>
  );
}

// The little "bring the 6 down" cue - appears the moment unpacking finishes, in the ones column of
// the subtracted-tens row (the one cell that's otherwise always blank), pointing down toward where
// the ones digit is about to reappear as part of "36". Stays put afterward, same as a real worked
// long-division keeps its bring-down mark once drawn.
function BringDownArrow() {
  return (
    <span className="self-center text-center text-[16px] text-ink-3" style={{ animation: "fade-in-up 0.3s ease" }} aria-hidden="true">
      ↓
    </span>
  );
}

/** The persistent arithmetic representation of the problem, in classic long-division bracket
 * notation - the quotient's tens+ones digits sit above a bar, the divisor sits to the left of the
 * dividend, and the dividend's tens+ones digits sit under that bar with a vertical rule on their
 * left (the ")" bracket). Below that, the actual worked subtraction appears as the workarea
 * itself performs it: "-4" once the tens are shared out, then "3" (the leftover) once they're
 * counted as extra, then the ones digit "6" is brought down next to it once regrouping finishes -
 * so the written column stays a live, honest mirror of what just happened visually, not a static
 * label. Remainder is a trailing row once revealed. `layoutId` lets this same panel FLIP from
 * numerals' centered solo presentation into its sidebar spot once step 2 begins, rather than
 * popping between the two layouts. Highlight state is a pure function of session fields, so it's
 * automatically in sync with GO_BACK/Next navigation.
 *
 * A true 3-column grid (lead / tens / ones) - rather than a 2-column grid with a nested flex pair
 * per row - so every row's tens and ones digits are literal grid siblings sharing the same column
 * tracks. That's what guarantees, structurally, that (say) the "-4" row's digit lands in exactly
 * the same x-position as the dividend's tens digit above it, regardless of which rows happen to
 * carry a border or extra padding. Rule lines live on a separate unrounded `Cell` wrapper rather
 * than on DigitCell itself, so a line never inherits DigitCell's rounded corners and curls into an
 * arc - it stays a plain straight rule, the way this is actually written on paper. */
export function Stage3WorkingAnswer({ session, size = "sidebar" }: { session: Stage3Session; size?: "hero" | "sidebar" }) {
  const { tensDigit, onesDigit, divisor, tensPredicted, onesPredicted, remainder, phase, tensLeftover } = session;
  const showRemainder = REMAINDER_REVEALED_PHASES.includes(phase);

  const showSubtractedTens = tensPredicted !== null && tensPredicted > 0 && SUBTRACTED_TENS_REVEALED_PHASES.includes(phase);
  const showLeftoverRow = leftoverRevealed(session);
  const showBringDown = BRING_DOWN_REVEALED_PHASES.includes(phase);
  const showSubtractedOnes = onesPredicted !== null && onesPredicted > 0 && SUBTRACTED_ONES_REVEALED_PHASES.includes(phase);
  const subtractedOnesValue = (onesPredicted ?? 0) * divisor;
  const bring = bringDownState(phase);

  return (
    <motion.div
      layout
      layoutId="s3-working-answer"
      transition={{ layout: { type: "spring", stiffness: 300, damping: 30, mass: 0.8 } }}
      className={cn(
        "grid items-end justify-center content-center gap-x-1 gap-y-0.5 py-3 px-2.5 min-[900px]:px-3.5 bg-card border border-line rounded-2xl shadow-sm",
        size === "hero" ? "flex-1 h-full" : "shrink-0",
      )}
      style={{ gridTemplateColumns: "auto auto auto" }}
    >
      <span aria-hidden="true" />
      <Cell className="pb-1 border-b-2 border-ink">
        <DigitCell
          value={tensQuotientRevealed(session) ? tensPredicted : null}
          placeholder="?"
          state={tensQuotientState(session)}
          color="ten"
        />
      </Cell>
      <Cell className="pb-1 border-b-2 border-ink">
        <DigitCell
          value={onesQuotientRevealed(session) ? onesPredicted : null}
          placeholder="?"
          state={onesQuotientState(session)}
          color="one"
        />
      </Cell>

      <DigitCell value={divisor} state={divisorState(phase)} color="bucket" className="self-center pb-0.5" />
      <Cell className="pt-0.5 border-l-2 border-ink">
        <DigitCell value={tensDigit} state={dividendTensDigitState(session)} color="ten" />
      </Cell>
      <DigitCell value={onesDigit} state={dividendOnesDigitState(phase)} color="ten" className="pt-0.5" />

      {(showSubtractedTens || showBringDown) && (
        <>
          {showSubtractedTens ? (
            <span className="font-mono text-[16px] text-ink-3 self-end pb-1" aria-hidden="true">
              −
            </span>
          ) : (
            <span aria-hidden="true" />
          )}
          {showSubtractedTens ? (
            <DigitCell value={tensPredicted! * divisor} state="done" color="ten" style={{ animation: "fade-in-up 0.3s ease" }} />
          ) : (
            <span aria-hidden="true" />
          )}
          {showBringDown ? <BringDownArrow /> : <span aria-hidden="true" />}
        </>
      )}

      {showLeftoverRow && (
        <>
          <span aria-hidden="true" />
          <Cell className="pt-0.5 border-t-2 border-ink" style={{ animation: "fade-in-up 0.3s ease" }}>
            <DigitCell value={tensLeftover} state={bring} color="leftover" />
          </Cell>
          {showBringDown ? (
            <Cell className="pt-0.5 border-t-2 border-ink" style={{ animation: "fade-in-up 0.3s ease", animationDelay: "0.35s" }}>
              <DigitCell value={onesDigit} state={bring} color="leftover" />
            </Cell>
          ) : (
            <span aria-hidden="true" />
          )}
        </>
      )}

      {showSubtractedOnes && (
        <>
          <span className="font-mono text-[16px] text-ink-3 self-end pb-1" aria-hidden="true">
            −
          </span>
          <DigitCell
            value={Math.floor(subtractedOnesValue / 10) || null}
            placeholder=""
            state="done"
            color="one"
            style={{ animation: "fade-in-up 0.3s ease" }}
          />
          <DigitCell value={subtractedOnesValue % 10} state="done" color="one" style={{ animation: "fade-in-up 0.3s ease" }} />
        </>
      )}

      {showRemainder && (
        <>
          <span aria-hidden="true" />
          <Cell
            justify="center"
            className="pt-0.5 border-t-2 border-ink"
            style={{ animation: "fade-in-up 0.3s ease", gridColumn: "2 / span 2" }}
          >
            <DigitCell value={remainder} state="done" color="leftover" />
          </Cell>
        </>
      )}
    </motion.div>
  );
}
