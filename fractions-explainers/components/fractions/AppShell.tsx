import type { ReactNode } from "react";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="h-dvh w-full flex flex-col bg-paper text-ink overflow-hidden pt-2.5 min-[900px]:pt-0">
      {children}
    </div>
  );
}
