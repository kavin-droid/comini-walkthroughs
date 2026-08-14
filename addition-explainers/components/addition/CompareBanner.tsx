"use client";

import { cn } from "@/lib/utils";
import { getLooseCount, getPlaceTarget } from "@/lib/addition/session";
import { placePlural } from "@/lib/addition/narration";
import type { Place } from "@/lib/addition/types";
import { useAddition } from "./AdditionContext";
import { usePlaybackContext } from "./PlaybackContext";

function destSingular(place: Place): string {
  return place === "ones" ? "ten" : "hundred";
}

export function CompareBanner({ place }: { place: Place }) {
  const { session } = useAddition();
  const { hideText } = usePlaybackContext();
  const guess = session.predictions[place];
  const actual = getPlaceTarget(place, session);
  const matched = guess === actual;
  const packed = session.packed[place] > 0;

  if (hideText) return null;

  return (
    <div
      className={cn(
        "mx-3 rounded-lg border px-3 py-2 font-mono text-[13px] text-center min-[900px]:mx-5 min-[900px]:px-5 min-[900px]:py-3 min-[900px]:text-[17px]",
        matched
          ? "bg-left/10 border-left/30 text-left"
          : "bg-accent/10 border-accent/30 text-accent",
      )}
    >
      {matched ? (
        <>Yes! {actual} {placePlural(place)}.</>
      ) : (
        <>
          You said {guess ?? "?"}. It is {actual}.
        </>
      )}
      {packed && (
        <>
          {" "}
          10 {placePlural(place)} make 1 {destSingular(place)}. {getLooseCount(place, session)}{" "}
          {placePlural(place)} stay here.
        </>
      )}
    </div>
  );
}
