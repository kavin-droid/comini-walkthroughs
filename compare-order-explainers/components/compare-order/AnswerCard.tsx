"use client";

import { useCompareOrder } from "./CompareOrderContext";
import { useMediaQuery, DESKTOP_QUERY } from "@/hooks/useMediaQuery";

export function AnswerCard() {
  const { config, session, step } = useCompareOrder();
  const isDesktop = useMediaQuery(DESKTOP_QUERY);
  const fontSize = isDesktop ? 28 : config.sizing.answerExprFontSize;

  return (
    <div className="shrink-0 bg-card border border-line rounded-2xl px-3 py-3 text-center shadow-sm">
      <span
        className="font-mono font-semibold tracking-[0.02em] text-ink"
        style={{ fontSize }}
      >
        {step.revealAnswer ? (
          step.chainTokens!.map((t, i) => (
            <span
              key={i}
              className={
                (t.type === "num" ? "text-sum font-bold mx-1" : "text-ink-3 font-bold mx-0.5") +
                " inline-block opacity-0 animate-chain-tok"
              }
              style={{ animationDelay: `${i * 150}ms` }}
            >
              {t.text}
            </span>
          ))
        ) : (
          <>
            {session.values.join(", ")}
            {"  →  "}
            <span className="text-ink-3 opacity-50">?</span>
          </>
        )}
      </span>
    </div>
  );
}
