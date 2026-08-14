import type { Place } from "./types";

export function singular(place: Place): string {
  return { hundreds: "hundred", tens: "ten", ones: "one" }[place];
}

export function pl(count: number, place: Place): string {
  return count === 1 ? singular(place) : place;
}

/** Joins fragments with commas, "and" before the last - e.g. ["4 tens","4 ones"] ->
 * "4 tens and 4 ones"; ["1 hundred","7 tens","4 ones"] -> "1 hundred, 7 tens and 4 ones". */
export function joinWithAnd(parts: string[]): string {
  if (parts.length <= 1) return parts.join("");
  if (parts.length === 2) return `${parts[0]} and ${parts[1]}`;
  return `${parts.slice(0, -1).join(", ")} and ${parts[parts.length - 1]}`;
}

/** Same CSS custom-property names as addition-explainers' identically-named helper - both apps
 * define --color-hundred/--color-ten/--color-one in globals.css. */
export function placeColorVar(place: Place): string {
  if (place === "hundreds") return "var(--color-hundred)";
  if (place === "tens") return "var(--color-ten)";
  return "var(--color-one)";
}

export function placeValueLabel(place: Place): string {
  return { hundreds: "Hundreds", tens: "Tens", ones: "Ones" }[place];
}
