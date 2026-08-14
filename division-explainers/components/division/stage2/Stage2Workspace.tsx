import type { Stage2Session } from "@/lib/division/stage2";
import { DistView } from "./DistView";
import { Stage2SharingScene } from "./Stage2SharingScene";
import { Stage2NotationView } from "./Stage2NotationView";

/** Sharing gets its own continuous scene from "count the dividend" through "feedback" (see
 * Stage2SharingScene) - grouping's phases never match any of these, so it always falls through to
 * the original DistView unchanged. Both concepts share the same final notation breakdown
 * (numerals-above-visuals, plus the bridge-arrows step). "equation" phase never reaches here at
 * all - Stage2Walkthrough renders the WorkingAnswer alone (hero-sized) for that step, with no
 * workarea mounted. */
export function Stage2Workspace({ session, hideText }: { session: Stage2Session; hideText: boolean }) {
  if (session.phase === "notation" || session.phase === "done") {
    return <Stage2NotationView session={session} />;
  }
  if (session.concept === "sharing") {
    return <Stage2SharingScene session={session} hideText={hideText} />;
  }
  return <DistView session={session} hideText={hideText} />;
}
