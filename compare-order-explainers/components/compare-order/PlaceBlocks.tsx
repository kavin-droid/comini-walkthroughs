import { cn } from "@/lib/utils";

const TEN_UNITS = Array.from({ length: 10 });

/** A single "ten" as a 2x5 grid of unit squares - same visual convention as addition-explainers'
 * UnitDot(place="tens"), reused here for consistency across the explainer series. */
function TenPack({ small }: { small: boolean }) {
  return (
    <div
      className={cn(
        "grid grid-cols-5 grid-rows-2 gap-[1px] rounded-[3px] bg-ten-bg border border-ten/30",
        small ? "p-[2px]" : "p-[3px]",
      )}
    >
      {TEN_UNITS.map((_, i) => (
        <div key={i} className={cn("rounded-[1px] bg-ten", small ? "w-[3px] h-[3px]" : "w-[4px] h-[4px]")} />
      ))}
    </div>
  );
}

/** A single "hundred" as a 2x5 grid of ten-bars (not 100 individual unit dots) - keeps the same
 * "pack of ten" motif one level up (a hundred is ten tens) without ballooning the DOM: a card can
 * show up to nine of these at once, so 100 real dots each would add up fast. */
function HundredPack({ small }: { small: boolean }) {
  return (
    <div
      className={cn(
        "grid grid-cols-5 grid-rows-2 gap-[2px] rounded-[3px] bg-hundred-bg border border-hundred/30",
        small ? "p-[3px]" : "p-[4px]",
      )}
    >
      {TEN_UNITS.map((_, i) => (
        <div
          key={i}
          className={cn("rounded-[1px] bg-hundred", small ? "w-[6px] h-[3px]" : "w-[8px] h-[4px]")}
        />
      ))}
    </div>
  );
}

function OneBlock({ small }: { small: boolean }) {
  return (
    <div
      className={cn("rounded-[2px] bg-one border border-one/40", small ? "w-[8px] h-[8px]" : "w-[10px] h-[10px]")}
    />
  );
}

interface PlaceBlocksProps {
  place: "hundreds" | "tens" | "ones";
  count: number;
  small?: boolean;
}

const MAX_WIDTH: Record<PlaceBlocksProps["place"], string> = {
  hundreds: "max-w-[130px]",
  tens: "max-w-[70px]",
  ones: "max-w-[54px]",
};

/** Renders a place-value digit as physical blocks instead of a numeral: each hundred as a 2x5
 * pack of ten-bars, each ten as a 2x5 pack of unit squares, each one as a single unit square - so
 * "tap the smallest tens digit" can be reasoned about from the blocks themselves, not just a
 * number. */
export function PlaceBlocks({ place, count, small = false }: PlaceBlocksProps) {
  if (count === 0) {
    return <div className="font-mono text-[10px] text-ink-3 leading-none">·</div>;
  }
  const Block = place === "ones" ? OneBlock : place === "tens" ? TenPack : HundredPack;
  return (
    <div className={cn("flex flex-wrap gap-[3px] justify-center", MAX_WIDTH[place])}>
      {Array.from({ length: count }).map((_, i) => (
        <Block key={i} small={small} />
      ))}
    </div>
  );
}
