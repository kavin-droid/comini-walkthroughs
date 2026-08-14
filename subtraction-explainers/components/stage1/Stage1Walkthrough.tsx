"use client";

import { AppShell } from "@/components/shared/AppShell";
import { Stage1Provider } from "./Stage1Context";
import { Stage1ProgressBar } from "./Stage1ProgressBar";
import { Stage1Header } from "./Stage1Header";
import { Stage1Footer } from "./Stage1Footer";
import { Stage1DesktopOptionsRow } from "./Stage1DesktopOptionsRow";
import { Stage1Workspace } from "./Stage1Workspace";
import { Stage1NarrationBox } from "./Stage1NarrationBox";
import { Stage1McqArea } from "./Stage1McqArea";
import { Stage1HandHint } from "./Stage1HandHint";

export function Stage1Walkthrough() {
  return (
    <Stage1Provider>
      <AppShell>
        <Stage1ProgressBar />
        <Stage1Header />
        <main className="flex-1 min-h-0 flex flex-col gap-3 px-4 py-3 max-w-[900px] w-full mx-auto">
          <Stage1DesktopOptionsRow />
          <Stage1Workspace />
          <Stage1NarrationBox />
          <Stage1McqArea />
        </main>
        <Stage1Footer />
      </AppShell>
      <Stage1HandHint />
    </Stage1Provider>
  );
}
