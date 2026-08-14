import type { Stage1Config } from "./types";

export const STAGE1_META: Stage1Config = {
  title: "Division, Visualized",
  ageBand: "Ages 5–6",
  totalMin: 2,
  totalMax: 20,
  peopleMin: 2,
  peopleMax: 5,
  defaultTotal: 10,
  defaultPeople: 2,
};

/** One bright candy-like item per pile piece - a single consistent icon (not mixed fruit/candy),
 * same "one visual language" rule stage2/3 follow for their base unit. */
export const ITEM_ICON = "🍬";

/** One face per person tray, cycled by index - same placeholder-emoji approach as stage2/3's
 * avatar sets. */
export const PERSON_AVATARS = ["🧒", "👦", "👧", "🧑", "👩"];

export function validateStage1(total: number, people: number): string | null {
  if (Number.isNaN(total) || Number.isNaN(people)) return "Please enter valid numbers.";
  if (total < STAGE1_META.totalMin || total > STAGE1_META.totalMax) {
    return `Number of items must be between ${STAGE1_META.totalMin} and ${STAGE1_META.totalMax}.`;
  }
  if (people < STAGE1_META.peopleMin || people > STAGE1_META.peopleMax) {
    return `Number of people must be between ${STAGE1_META.peopleMin} and ${STAGE1_META.peopleMax}.`;
  }
  if (total % people !== 0) {
    const nearest = Math.round(total / people) * people;
    return `${total} doesn't share evenly between ${people}. Try a number that divides evenly, like ${nearest}.`;
  }
  return null;
}
