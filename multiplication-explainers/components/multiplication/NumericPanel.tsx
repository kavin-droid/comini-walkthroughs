"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { useMultiplication } from "./MultiplicationContext";
import { useMediaQuery, DESKTOP_QUERY } from "@/hooks/useMediaQuery";
import { useCombineCount } from "./CombineCountContext";
import type { ArrayMultiplyStep } from "@/lib/multiplication/types";

const DIGIT_COLS = 3;
// Desktop has room to spare; mobile squeezes the same 3-digit grid into a much narrower dock (see
// NumericPanel's own docked-width choice below), so both the digit cells and the operator gutter
// between them and the number shrink together - a narrower cell at the same gutter width would
// just look cramped, not more compact.
const SIZES = {
  desktop: { digitW: 26, operatorW: 16, fontSize: 19 },
  mobile: { digitW: 19, operatorW: 9, fontSize: 15 },
};

function padDigits(n: number, width: number): (string | null)[] {
  const digits = String(Math.max(n, 0)).split("");
  const pad = width - digits.length;
  return [...Array.from({ length: Math.max(pad, 0) }, () => null), ...digits];
}

function DigitCell({
  value,
  highlighted,
  dimmed,
  digitW,
  fontSize,
}: {
  value: string | null;
  highlighted: boolean;
  dimmed?: boolean;
  digitW: number;
  fontSize: number;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center h-8 font-mono font-bold transition-all duration-300",
        highlighted ? "text-accent" : "text-ink",
        dimmed && "opacity-35",
      )}
      style={{ width: `${digitW}px`, fontSize: `${fontSize}px` }}
    >
      {value ?? ""}
    </span>
  );
}

function DigitRow({
  operator,
  digits,
  highlightIndex,
  dimIndex,
  digitW,
  operatorW,
  fontSize,
}: {
  operator?: string;
  digits: (string | null)[];
  highlightIndex?: number[];
  /** Per-digit dim (opacity reduction) - the top number row's digit belonging to whichever phase
   * ISN'T currently active, e.g. the tens digit while the ones phase is in focus, or (when it
   * covers the whole row) the partial-product row not currently in focus - same "not involved
   * right now" meaning either way. Highlighting is text-color only (no background pill/tint) -
   * a whole-row highlight is just `highlightIndex` covering every column. */
  dimIndex?: number[];
  digitW: number;
  operatorW: number;
  fontSize: number;
}) {
  return (
    <div className="flex items-center transition-opacity duration-300">
      <span
        className="shrink-0 font-mono font-bold text-ink-3 text-center"
        style={{ width: `${operatorW}px`, fontSize: `${fontSize - 3}px` }}
      >
        {operator ?? ""}
      </span>
      {digits.map((d, i) => (
        <DigitCell
          key={i}
          value={d}
          highlighted={!!highlightIndex?.includes(i)}
          dimmed={!!dimIndex?.includes(i)}
          digitW={digitW}
          fontSize={fontSize}
        />
      ))}
    </div>
  );
}

/** Stage 3's "Regroup and Multiply" numeric-representation panel - the written partial-products
 * algorithm, docked to the left of the workspace (see MultiplicationWalkthrough's layout
 * branch), matching the "numeric representation container" the division/addition/subtraction
 * apps show beside their own workareas. Unlike the workspace, this component is never remounted
 * per step (it reads `step` live via context, the same way AnswerCard does), so every transition
 * here - the docking width, a row fading in, a digit highlighting - is a plain boolean/CSS-driven
 * change, no one-shot-trigger machinery needed (contrast ArrayMultiplyView, which remounts every
 * step and does need that pattern for its own animations). All rows share the same 3-digit
 * (hundreds/tens/ones) column grid so the algorithm stays vertically aligned even though the top
 * number and factor are always short - the extra columns just render blank. */
const ALL_COLS = Array.from({ length: DIGIT_COLS }, (_, i) => i);

export function NumericPanel() {
  const { step } = useMultiplication();
  const isDesktop = useMediaQuery(DESKTOP_QUERY);
  const { onesCounted, tensCounted } = useCombineCount();
  const rootRef = useRef<HTMLDivElement>(null);
  // CSS can't smoothly transition flex-basis between a percentage and a pixel value (they're
  // different reference frames) - it just gets stuck at the pre-transition value instead of
  // animating, the same pitfall the addition app's WorkingAnswerPanel already worked around by
  // measuring a real pixel width instead of using "100%". Here that measurement is the parent
  // flex row's own width (workspace is fully hidden whenever this is "undocked", so the panel's
  // natural full-width size just IS the row's width) - once known, every future dock/undock
  // transition moves between two real pixel numbers, which animates correctly.
  const [containerWidth, setContainerWidth] = useState<number | null>(null);
  useEffect(() => {
    const parent = rootRef.current?.parentElement;
    if (!parent) return;
    const observer = new ResizeObserver((entries) => setContainerWidth(entries[0].contentRect.width));
    observer.observe(parent);
    return () => observer.disconnect();
  }, []);
  if (step.kind !== "arrayMultiply") return null;
  const s = step as ArrayMultiplyStep;
  const a = s.tens * 10 + s.ones;
  const onesProduct = s.ones * s.factor;
  const tensPartialValue = s.tens * s.factor * 10;
  const total = a * s.factor;
  // While the workspace counts the pieces out loud (see CombineCountContext), this row mirrors
  // that same running tally instead of jumping straight to the final total - it always lands on
  // the true `total` exactly when counting finishes, by construction (every counted one is worth
  // 1, every counted ten-pack is worth 10), so no separate "snap to the real value" step is
  // needed once the animation completes.
  const displayTotal = s.countCombine ? onesCounted + tensCounted * 10 : total;

  const sizes = isDesktop ? SIZES.desktop : SIZES.mobile;

  // Number/factor highlight: which digit(s) light up depends on both *which* phase is active
  // (highlightPhase picks ones vs tens digit) and *how much* of it is in focus right now
  // (highlightNumber/highlightFactor - both together while introducing or questioning a phase,
  // one alone while that digit's own row/dot sub-step plays). The OTHER digit of the pair (the
  // one not currently being multiplied) dims instead, so it reads as "not involved right now".
  const numberDigitIndex = s.highlightPhase === "ones" ? DIGIT_COLS - 1 : s.highlightPhase === "tens" ? DIGIT_COLS - 2 : null;
  const otherDigitIndex = s.highlightPhase === "ones" ? DIGIT_COLS - 2 : s.highlightPhase === "tens" ? DIGIT_COLS - 1 : null;
  const numberHighlight = s.highlightNumber && numberDigitIndex != null ? [numberDigitIndex] : [];
  const numberDim = s.highlightPhase != null && otherDigitIndex != null ? [otherDigitIndex] : [];
  const factorHighlight = s.highlightFactor && s.highlightPhase ? [DIGIT_COLS - 1] : [];

  // Partial-product rows highlight/dim as a whole unit rather than digit by digit - covering
  // every column with the same index array reuses DigitCell's own text-color highlighting for
  // that, no separate row-level background treatment needed.
  const onesRowHighlight = s.partialHighlight === "ones" || s.partialHighlight === "both" ? ALL_COLS : [];
  const onesRowDim = s.partialHighlight === "tens" ? ALL_COLS : [];
  const tensRowHighlight = s.partialHighlight === "tens" || s.partialHighlight === "both" ? ALL_COLS : [];
  const tensRowDim = s.partialHighlight === "ones" ? ALL_COLS : [];

  // On mobile only, the panel collapses entirely (not just docks smaller) for every step that
  // needs the full width for the breakdown piles/MCQ/counting instead (see `panelHiddenMobile`) -
  // desktop already has room, so this never applies there.
  const mobileHidden = !isDesktop && s.panelHiddenMobile;
  const dockedWidthPx = isDesktop ? "148px" : "104px";
  const undockedWidthPx = containerWidth != null ? `${containerWidth}px` : "100%";

  return (
    <div
      ref={rootRef}
      className="shrink-0 bg-card border border-line rounded-2xl px-2.5 py-3 min-[900px]:px-3 flex flex-col items-center justify-center overflow-hidden"
      style={{
        // Grows to fill the row only when truly undocked (the full-width intro/focus beats,
        // where the workspace itself is hidden) - collapsed-on-mobile is NOT that case (the
        // workspace is fully visible then and needs the freed-up space instead), so this must
        // check `mobileHidden` too, not just `panelDocked`.
        flexGrow: !s.panelDocked && !mobileHidden ? 1 : 0,
        flexBasis: mobileHidden ? "0px" : s.panelDocked ? dockedWidthPx : undockedWidthPx,
        opacity: mobileHidden ? 0 : 1,
        padding: mobileHidden ? 0 : undefined,
        border: mobileHidden ? "none" : undefined,
        transition: "flex-grow 500ms ease-in-out, flex-basis 500ms ease-in-out, opacity 300ms ease-in-out",
      }}
    >
      <div className="flex flex-col gap-1">
        <DigitRow digits={padDigits(a, DIGIT_COLS)} highlightIndex={numberHighlight} dimIndex={numberDim} {...sizes} />
        <DigitRow operator="×" digits={padDigits(s.factor, DIGIT_COLS)} highlightIndex={factorHighlight} {...sizes} />
        <div className="h-[2px] bg-ink-3/40 rounded-full my-0.5" />
        <div className="transition-opacity duration-300" style={{ opacity: s.onesPartialRevealed ? 1 : 0 }}>
          <DigitRow digits={padDigits(onesProduct, DIGIT_COLS)} highlightIndex={onesRowHighlight} dimIndex={onesRowDim} {...sizes} />
        </div>
        <div className="transition-opacity duration-300" style={{ opacity: s.tensPartialRevealed ? 1 : 0 }}>
          <DigitRow
            operator="+"
            digits={padDigits(tensPartialValue, DIGIT_COLS)}
            highlightIndex={tensRowHighlight}
            dimIndex={tensRowDim}
            {...sizes}
          />
        </div>
        <div
          className="h-[2px] bg-ink-3/40 rounded-full my-0.5 transition-opacity duration-300"
          style={{ opacity: s.tensPartialRevealed ? 1 : 0 }}
        />
        <div className="transition-opacity duration-300" style={{ opacity: s.totalRevealed ? 1 : 0 }}>
          <DigitRow digits={padDigits(displayTotal, DIGIT_COLS)} {...sizes} />
        </div>
      </div>
    </div>
  );
}
