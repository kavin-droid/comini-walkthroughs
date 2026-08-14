import type { ReactNode } from "react";

export function AnswerCard({ children }: { children: ReactNode }) {
  return (
    <div className="shrink-0 bg-card border border-line rounded-2xl px-4 py-3 text-center shadow-sm">
      <span className="font-mono text-[24px] min-[900px]:text-[28px] font-semibold text-ink">
        {children}
      </span>
    </div>
  );
}
