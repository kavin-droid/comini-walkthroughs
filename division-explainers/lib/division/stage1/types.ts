/** Stage1 is pre-reading (ages 5-6): explore sharing small quantities (up to 20) equally between
 * 2-5 people. No place value, no remainder, no predict-then-check gap - just watch/tap and see it
 * happen. Six phases only (vs stage2/3's longer flows) since the concept itself is simpler and the
 * audience can't read a longer narration to bridge steps - the animation has to carry everything. */
export type Stage1Phase = "pile-reveal" | "people-reveal" | "distribute" | "celebrate" | "recap" | "done";

export interface Stage1Session {
  total: number;
  people: number;
  quotient: number;
  /** placements[i] = person index that item i belongs to, length = total (round-robin, same as
   * stage2 sharing - one item to each person per round). */
  placements: number[];
  phase: Stage1Phase;
  /** How many items (0..total) have left the pile and landed in a tray - only moves via TAP_SHARE
   * during distribute, never auto-ticks (this stage is tap-driven, not watch-only). */
  dotsPlaced: number;
  /** 0..total during pile-reveal (items popping in one at a time), then 0..people during
   * people-reveal (avatars popping in one at a time) - unrelated to dotsPlaced. */
  previewCount: number;
}

export interface Stage1Config {
  title: string;
  ageBand: string;
  totalMin: number;
  totalMax: number;
  peopleMin: number;
  peopleMax: number;
  defaultTotal: number;
  defaultPeople: number;
}
