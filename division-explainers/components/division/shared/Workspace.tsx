"use client";

import type { ReactNode, RefObject } from "react";

export function Workspace({
  wrapRef,
  workspaceRef,
  scale,
  loading,
  children,
}: {
  wrapRef: RefObject<HTMLDivElement | null>;
  workspaceRef: RefObject<HTMLDivElement | null>;
  scale: number;
  loading: boolean;
  children: ReactNode;
}) {
  return (
    <div
      ref={wrapRef}
      className="relative flex-1 min-w-0 min-h-0 bg-card border border-line rounded-2xl flex items-center justify-center overflow-hidden shadow-sm"
    >
      <div
        ref={workspaceRef}
        className="shrink-0"
        style={{ transform: `scale(${scale})`, transformOrigin: "center center" }}
      >
        {children}
      </div>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-card/85 rounded-2xl z-10">
          <div
            className="w-[34px] h-[34px] rounded-full border-[3px] border-line-2 border-t-left"
            style={{ animation: "spin 0.7s linear infinite" }}
          />
        </div>
      )}
    </div>
  );
}
