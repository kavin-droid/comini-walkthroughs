import type { PlaceRecord } from "./types";

/** Decomposes a number up to 3 digits into place-value digits. Numbers with fewer than 3
 * digits simply have 0 in the unused higher place(s) - e.g. 35 -> {hundreds:0, tens:3, ones:5}. */
export function decomposeDigits(n: number): PlaceRecord<number> {
  const ones = n % 10;
  const rem1 = (n - ones) / 10;
  const tens = rem1 % 10;
  const hundreds = (rem1 - tens) / 10;
  return { hundreds, tens, ones };
}
