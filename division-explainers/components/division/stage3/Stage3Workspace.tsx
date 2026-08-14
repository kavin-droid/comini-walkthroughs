"use client";

import type { Stage3Session } from "@/lib/division/stage3";
import { Stage3MainScene } from "./Stage3MainScene";
import { Stage3RecapView } from "./Stage3RecapView";
import { Stage3NotationView } from "./Stage3NotationView";
import { Stage3Feedback } from "./Stage3Feedback";

export function Stage3Workspace({
  session,
  hideText,
  onTapUnpack,
  onTapShareRound,
}: {
  session: Stage3Session;
  hideText: boolean;
  onTapUnpack: (index: number) => void;
  onTapShareRound: () => void;
}) {
  if (session.phase === "recap") return <Stage3RecapView session={session} />;
  if (session.phase === "notation" || session.phase === "done") return <Stage3NotationView session={session} />;

  const tensCountSettled = session.phase === "count-tens" && session.tensCountProgress >= session.tensDigit;
  // Ones feedback shows right after counting settles too - same beat as tens - not later at
  // "remainder", which would put it after distribution has already happened.
  const onesCountSettled = session.phase === "count-ones" && session.onesCountProgress >= session.onesTotal;

  return (
    <div className="flex flex-col items-center gap-3 w-full">
      <Stage3MainScene session={session} hideText={hideText} onTapUnpack={onTapUnpack} onTapShareRound={onTapShareRound} />
      {tensCountSettled && session.tensGuess !== null && session.tensPredicted !== null && (
        <Stage3Feedback guess={session.tensGuess} correct={session.tensPredicted} hideText={hideText} />
      )}
      {onesCountSettled && session.onesGuess !== null && session.onesPredicted !== null && (
        <Stage3Feedback guess={session.onesGuess} correct={session.onesPredicted} hideText={hideText} />
      )}
    </div>
  );
}
