/** Ordered list of length `total`; entry `i` is the container index that dot `i` belongs to.
 * Round-robin: dot 0 -> container 0, dot 1 -> container 1, ... cycling once per round (matches
 * "sharing" - one item to each friend per round). Requires total % divisor === 0. */
export function buildRoundRobinPlacements(total: number, divisor: number): number[] {
  const placements: number[] = [];
  const rounds = total / divisor;
  for (let r = 0; r < rounds; r++) {
    for (let c = 0; c < divisor; c++) placements.push(c);
  }
  return placements;
}

/** Ordered list of length `total`; fills container 0 completely (groupSize items) before moving
 * to container 1, etc (matches "grouping" - count out a full group before starting the next).
 * Requires total % groupSize === 0. */
export function buildBlockFillPlacements(total: number, groupSize: number): number[] {
  const placements: number[] = [];
  const groups = total / groupSize;
  for (let g = 0; g < groups; g++) {
    for (let k = 0; k < groupSize; k++) placements.push(g);
  }
  return placements;
}
