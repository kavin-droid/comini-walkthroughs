"use client";

import { useLayoutEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { useMediaQuery, DESKTOP_QUERY, NARROW_QUERY } from "@/hooks/useMediaQuery";
import { useFitWorkspace } from "@/hooks/useFitWorkspace";
import { useCompareOrder } from "./CompareOrderContext";
import { NumCard } from "./NumCard";
import { TrackRow } from "./TrackRow";
import { Confetti } from "./Confetti";

function ZoneLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="font-mono text-[10px] tracking-[2px] uppercase text-ink-3 text-center">{children}</div>
  );
}

export function Workspace() {
  const { config, session, step, loading, dispatch } = useCompareOrder();
  const isDesktop = useMediaQuery(DESKTOP_QUERY);
  const isNarrow = useMediaQuery(NARROW_QUERY);

  // Equalize pool card width AND height so uneven content (e.g. one card showing nine ten-packs
  // next to another showing one, or just plain digits of different widths) doesn't leave the row
  // looking jagged - measured directly rather than via CSS alone because the pool can wrap into
  // independent grid/flex rows (see poolGrid) whose native stretch only equalizes sizes *within*
  // one row, not across all of them. Runs before useFitWorkspace's own measurement below so the
  // fit-to-scale calculation sees the final, equalized sizes rather than the pre-equalized ones.
  // Measures via offsetWidth/offsetHeight, not getBoundingClientRect(): the whole workspace sits
  // inside a CSS `transform: scale()` wrapper (see useFitWorkspace), and getBoundingClientRect
  // reports the scaled, painted size while a `minWidth`/`minHeight` style is set in unscaled
  // layout pixels - mixing the two silently produces a constraint far too small to matter.
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  useLayoutEffect(() => {
    const els = cardRefs.current.filter((el): el is HTMLDivElement => el !== null);
    els.forEach((el) => {
      el.style.minHeight = "";
      el.style.minWidth = "";
    });
    if (els.length < 2) return;
    const maxHeight = Math.max(...els.map((el) => el.offsetHeight));
    const maxWidth = Math.max(...els.map((el) => el.offsetWidth));
    els.forEach((el) => {
      el.style.minHeight = `${maxHeight}px`;
      el.style.minWidth = `${maxWidth}px`;
    });
  }, [step, isDesktop, isNarrow]);

  const { wrapRef, workspaceRef, scale } = useFitWorkspace([step]);

  const useGrid =
    step.pool.length > 1 &&
    (config.poolGrid === "always" || (config.poolGrid === "mobile" && !isDesktop));
  const oddTrailing = useGrid && step.pool.length % 2 === 1;
  const unanswered = step.requiresTap && session.tapStatus !== "correct";

  const poolLabel =
    step.phase === "intro"
      ? "Meet the numbers"
      : step.pool.length > 1
        ? "Comparing"
        : "Placing the last number";

  return (
    <div
      ref={wrapRef}
      className="relative flex-1 min-h-0 bg-card border border-line rounded-2xl flex items-center justify-center overflow-hidden shadow-sm"
    >
      <div
        ref={workspaceRef}
        className="shrink-0"
        style={{ transform: `scale(${scale})`, transformOrigin: "center center" }}
      >
        <div className="flex flex-col items-center gap-3">
          {step.pool.length > 0 && (
            <>
              <ZoneLabel>{poolLabel}</ZoneLabel>
              <div
                data-pool-row
                className={cn(
                  "flex flex-wrap gap-2.5 justify-center items-start",
                  useGrid && "grid grid-cols-2 justify-items-center items-stretch",
                )}
              >
                {step.pool.map((item, i) => {
                  const isTied = step.tiedVals ? step.tiedVals.includes(item.value) : false;
                  const dim = !!(step.tiedVals && !isTied);
                  const isWinner = !unanswered && step.winnerVal !== null && item.value === step.winnerVal;
                  const isWrongTap = session.tapStatus === "wrong" && session.wrongTapValue === item.value;
                  const isTrailing = oddTrailing && i === step.pool.length - 1;
                  const focused = step.focusOrigIndex !== null && item.origIndex === step.focusOrigIndex;
                  return (
                    <NumCard
                      key={item.value + "-" + item.origIndex}
                      ref={(el) => {
                        cardRefs.current[i] = el;
                      }}
                      className={isTrailing ? "col-span-2" : undefined}
                      item={item}
                      places={config.places}
                      hiPlace={step.hiPlace}
                      focused={focused}
                      dim={dim}
                      isWinner={isWinner}
                      winnerTag={step.winnerTag}
                      sizing={config.sizing}
                      isNarrow={isNarrow}
                      showVisuals={config.placeVisuals}
                      tappable={unanswered}
                      isWrongTap={isWrongTap}
                      onTap={() => dispatch({ type: "TAP", value: item.value })}
                    />
                  );
                })}
              </div>
            </>
          )}

          <ZoneLabel>Order</ZoneLabel>
          <TrackRow placed={step.placed} total={session.values.length} sizing={config.sizing} isNarrow={isNarrow} />
        </div>
      </div>

      {step.done && <Confetti />}

      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-card/85 rounded-2xl z-10">
          <div className="w-[34px] h-[34px] rounded-full border-[3px] border-line-2 border-t-left animate-spin-slow" />
        </div>
      )}
    </div>
  );
}
