import { forwardRef, useEffect, useRef, useState, type KeyboardEvent, type MouseEvent } from "react";
import { cn } from "@/lib/utils";
import type { CompareOrderConfig, NumItem, PlaceKey, WinnerTag } from "@/lib/compare-order/types";
import { PlaceBlocks } from "./PlaceBlocks";

const PLACE_COLOR: Record<PlaceKey, { text: string; bg: string; border: string }> = {
  hundreds: { text: "text-hundred", bg: "bg-hundred-bg", border: "border-hundred" },
  tens: { text: "text-ten", bg: "bg-ten-bg", border: "border-ten" },
  ones: { text: "text-one", bg: "bg-one-bg", border: "border-one" },
};

/** CSS class per place for the intro stagger-reveal (see globals.css's co-reveal-* keyframes) -
 * each place flashes its own theme color in as it fades in, then settles back to plain. */
const REVEAL_ANIMATION_CLASS: Record<PlaceKey, string> = {
  hundreds: "animate-reveal-hundreds",
  tens: "animate-reveal-tens",
  ones: "animate-reveal-ones",
};

const PEEK_DURATION_MS = 2000;
const REVEAL_STAGGER_MS = 350;

function joinPlaceNames(names: string[]): string {
  if (names.length < 2) return names.join("");
  return `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
}

interface NumCardProps {
  item: NumItem;
  places: { key: PlaceKey; label: string }[];
  hiPlace: PlaceKey | null;
  /** True only during this number's own intro step - plays the stagger-reveal animation across
   * its places (smallest first) instead of the static compare-phase highlight. Scoping this to a
   * single card (rather than applying hiPlace globally, as the compare phase does) is what keeps
   * the reveal/highlight from flashing on every other already-revealed number too. */
  focused: boolean;
  dim: boolean;
  isWinner: boolean;
  winnerTag: WinnerTag;
  sizing: CompareOrderConfig["sizing"];
  isNarrow: boolean;
  /** False shows a plain digit numeral per place instead of the block visuals - stage3 uses this
   * so its three-place cards (already the widest) stay simple: numbers alone. Tapping the number
   * itself still sneak-peeks the blocks for a couple seconds regardless (see peeking below). */
  showVisuals: boolean;
  /** True while this card can be tapped to answer the current round's question. */
  tappable: boolean;
  /** True for the one tick after this specific card was tapped incorrectly. */
  isWrongTap: boolean;
  onTap?: () => void;
  className?: string;
}

export const NumCard = forwardRef<HTMLDivElement, NumCardProps>(function NumCard(
  {
    item,
    places,
    hiPlace,
    focused,
    dim,
    isWinner,
    winnerTag,
    sizing,
    isNarrow,
    showVisuals,
    tappable,
    isWrongTap,
    onTap,
    className,
  },
  ref,
) {
  const placeMinWidth = isNarrow ? sizing.placeColMinWidthNarrow : sizing.placeColMinWidth;

  // Tapping the number itself is a separate affordance from tapping the card to answer the
  // round: it sneak-peeks the place-value blocks for a couple seconds, then hides them again -
  // local, ephemeral UI state, not part of the session (nothing else depends on it, and it should
  // reset on its own regardless of round/step progress).
  const [peeking, setPeeking] = useState(false);
  const peekTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (peekTimer.current) clearTimeout(peekTimer.current);
    };
  }, []);

  function handlePeek(e: MouseEvent) {
    e.stopPropagation();
    setPeeking(true);
    if (peekTimer.current) clearTimeout(peekTimer.current);
    peekTimer.current = setTimeout(() => setPeeking(false), PEEK_DURATION_MS);
  }

  function handleCardKeyDown(e: KeyboardEvent) {
    if (!tappable) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onTap?.();
    }
  }

  const revealBlocks = showVisuals || peeking;

  return (
    <div
      ref={ref}
      role="button"
      tabIndex={tappable ? 0 : -1}
      aria-disabled={!tappable}
      onClick={tappable ? onTap : undefined}
      onKeyDown={handleCardKeyDown}
      className={cn(
        "flex flex-col items-center justify-start gap-2 pt-3 pb-2.5 px-3.5 bg-card border-[1.5px] border-line rounded-2xl transition-all duration-200 animate-num-card-in outline-none",
        tappable && "cursor-pointer hover:border-line-2 hover:-translate-y-0.5 active:translate-y-0",
        !tappable && "cursor-default",
        dim && "opacity-40",
        isWinner && "border-accent shadow-[0_0_0_4px_rgba(200,68,62,0.12)] animate-num-card-pop",
        isWrongTap && "border-used shadow-[0_0_0_4px_rgba(200,68,62,0.14)] animate-shake",
        className,
      )}
    >
      <button
        type="button"
        onClick={handlePeek}
        aria-label={`See how many ${joinPlaceNames(places.map((p) => p.key))} are in ${item.value}`}
        className={cn(
          "font-serif font-medium leading-none text-ink rounded-md px-1.5 py-0.5 -mx-1.5 -my-0.5 transition-colors",
          "hover:bg-paper-2 active:bg-paper-2",
          peeking && "bg-sum-bg",
        )}
        style={{ fontSize: sizing.cardValueFontSize }}
      >
        {item.value}
      </button>
      <div className={cn("flex", isNarrow ? "gap-1.5" : "gap-2")}>
        {places.map((place, arrayIdx) => {
          const key = place.key;
          const color = PLACE_COLOR[key];
          // Places array is big-to-small (hundreds, tens, ones); the reveal plays smallest-first.
          const revealIdx = places.length - 1 - arrayIdx;
          const hi = !focused && hiPlace === key;
          return (
            <div
              key={key}
              className={cn(
                "flex flex-col items-center justify-start gap-1 rounded-[10px] border-[1.5px] border-transparent transition-all duration-200",
                isNarrow ? "px-1.5 py-1" : "px-2 py-1.5",
                hi && [color.border, color.bg],
                focused && REVEAL_ANIMATION_CLASS[key],
              )}
              style={{
                minWidth: placeMinWidth,
                ...(focused ? { animationDelay: `${revealIdx * REVEAL_STAGGER_MS}ms` } : {}),
              }}
            >
              <div className={cn("font-mono text-[9px] tracking-wide uppercase", hi ? color.text : "text-ink-3")}>
                {key}
              </div>
              {revealBlocks ? (
                <PlaceBlocks place={key} count={item.digits[key]!} small={isNarrow} />
              ) : (
                <div
                  className={cn(
                    "font-mono font-semibold text-ink",
                    isNarrow ? "text-[16px]" : "text-[18px]",
                    hi && color.text,
                  )}
                >
                  {item.digits[key]}
                </div>
              )}
            </div>
          );
        })}
      </div>
      {isWinner && (
        <div className="font-mono text-[10px] font-bold tracking-wide uppercase text-accent bg-accent/10 rounded-full px-2.5 py-0.5 animate-fade-in">
          {winnerTag}
        </div>
      )}
    </div>
  );
});
