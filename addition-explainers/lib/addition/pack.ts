import type { Place } from "./types";

export function destPlace(place: Place): Place {
  return place === "ones" ? "tens" : "hundreds";
}

export function destSingular(place: Place): string {
  return place === "ones" ? "ten" : "hundred";
}

/** A place's own theme color var - used for the pack highlight/block, which is styled in the
 * DESTINATION place's color, not the source's (previews what the cluster is about to become:
 * 10 tens packing into 1 hundred highlights purple, not green). Callers pass `packAnim.dest`
 * here, never the source place. */
export function placeColorVar(place: Place): string {
  if (place === "hundreds") return "var(--color-hundred)";
  if (place === "tens") return "var(--color-ten)";
  return "var(--color-one)";
}

/** Tailwind text-color class for a place's own digit/count label. */
export function placeCountColorClass(place: Place): string {
  if (place === "hundreds") return "text-hundred";
  if (place === "tens") return "text-ten";
  return "text-one";
}
