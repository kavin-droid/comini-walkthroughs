"use client";

import { PERSON_AVATARS } from "@/lib/division/stage1";
import { MotionCandy } from "./MotionCandy";
import { AVATAR_SIZE, TRAY_ITEM_GRID, TRAY_W } from "./canvas";

/** One person's whole tray: avatar on top, a small grid of whatever candies have landed on them so
 * far (up to 5 per row, same "cap and wrap" rule stage3's friend containers use), a numeral count
 * badge underneath. Pure presentation - all positioning/annotation (glow ring, arrows) lives in
 * Stage1MainScene, which knows the shared canvas coordinate space this tray sits in. */
export function PersonTray({
  index,
  itemIds,
  visible,
}: {
  index: number;
  itemIds: number[];
  /** false during pile-reveal / not-yet-revealed people - renders nothing but still reserves
   * layout space isn't needed since the parent positions every tray absolutely regardless. */
  visible: boolean;
}) {
  if (!visible) return null;

  return (
    <div
      className="flex flex-col items-center gap-2"
      style={{ width: TRAY_W, animation: "item-arrive 0.5s cubic-bezier(0.34,1.56,0.64,1) both" }}
    >
      <div className="text-[44px] leading-none" style={{ width: AVATAR_SIZE, height: AVATAR_SIZE, textAlign: "center" }} aria-hidden="true">
        {PERSON_AVATARS[index % PERSON_AVATARS.length]}
      </div>
      <div
        className="rounded-2xl border-[2.5px] border-dashed border-line-2 bg-paper-2 px-2.5 py-2.5 min-h-[70px] flex items-center justify-center"
        style={{ width: TRAY_W - 20 }}
      >
        <div className="grid justify-center content-center" style={TRAY_ITEM_GRID}>
          {itemIds.map((id) => (
            <MotionCandy key={id} id={id} size={26} />
          ))}
        </div>
      </div>
      <div className="font-mono text-[18px] font-bold bg-card px-3.5 py-1 rounded-full border-2 border-line text-[var(--color-s1-person)]">
        {itemIds.length}
      </div>
    </div>
  );
}
