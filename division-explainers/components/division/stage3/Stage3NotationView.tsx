import type { ReactNode } from "react";
import { CONTAINER_AVATARS, type Stage3Session } from "@/lib/division/stage3";
import { Confetti } from "@/components/division/shared/Confetti";
import { Block } from "./Block";

const TENS_COLUMN_GRID = { gridTemplateColumns: "repeat(2, min-content)" } as const;

function NumberColumn({
  label,
  tens,
  tensGrid,
  ones,
}: {
  label: string;
  tens?: ReactNode;
  /** True for actual tens packs (dividend/quotient) - false for the divisor column, which reuses
   * this same slot for friend avatars, not place-value blocks. */
  tensGrid?: boolean;
  ones?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-3.5">
      <div className="font-mono text-[44px] font-semibold text-ink">{label}</div>
      {/* Tens and ones never share a flex-wrap row. Actual tens packs render in a firm 2-per-row
          grid (not flex-wrap's soft wrap) so this final view always reads as a tidy 2-column stack
          of packs, matching the visual language of the friend containers' fixed grids elsewhere. */}
      <div className="flex flex-col items-center gap-2 max-w-[180px] min-h-[30px]">
        {tens &&
          (tensGrid ? (
            <div className="grid gap-2 justify-center" style={TENS_COLUMN_GRID}>
              {tens}
            </div>
          ) : (
            <div className="flex flex-wrap gap-2 justify-center">{tens}</div>
          ))}
        {ones && <div className="flex flex-wrap gap-2 justify-center">{ones}</div>}
      </div>
    </div>
  );
}

/** The final "we write it as ..." equation view: each number in 76 ÷ 4 = 19 sits above its own
 * visual breakdown - place-value blocks for the dividend and quotient, the friend avatars for
 * the divisor. */
export function Stage3NotationView({ session }: { session: Stage3Session }) {
  const { dividend, divisor, tensDigit, onesDigit, tensPredicted, onesPredicted, remainder, phase } = session;
  const quotient = (tensPredicted ?? 0) * 10 + (onesPredicted ?? 0);

  return (
    <div className="relative flex flex-col items-center gap-4 p-1">
      {phase === "done" && <Confetti />}
      <div className="flex items-start justify-center gap-4">
        <NumberColumn
          label={String(dividend)}
          tensGrid
          tens={Array.from({ length: tensDigit }).map((_, i) => (
            <Block key={`t${i}`} kind="tens" />
          ))}
          ones={Array.from({ length: onesDigit }).map((_, i) => (
            <Block key={`o${i}`} kind="ones" />
          ))}
        />

        <div className="font-serif font-light text-4xl text-ink-3 pt-2">÷</div>

        <NumberColumn
          label={String(divisor)}
          tens={Array.from({ length: divisor }).map((_, i) => (
            <span key={i} className="text-3xl leading-none" aria-hidden="true">
              {CONTAINER_AVATARS[i % CONTAINER_AVATARS.length]}
            </span>
          ))}
        />

        <div className="font-serif font-light text-4xl text-ink-3 pt-2">=</div>

        <NumberColumn
          label={String(quotient)}
          tensGrid
          tens={Array.from({ length: tensPredicted ?? 0 }).map((_, i) => (
            <Block key={`t${i}`} kind="tens" />
          ))}
          ones={Array.from({ length: onesPredicted ?? 0 }).map((_, i) => (
            <Block key={`o${i}`} kind="ones" />
          ))}
        />
      </div>

      {remainder > 0 && (
        <div className="flex flex-col items-center gap-2">
          <div className="font-mono text-[16px] text-ink-2">
            remainder <strong className="text-s3-leftover">{remainder}</strong>
          </div>
          <div className="flex flex-wrap gap-2 justify-center max-w-[180px]">
            {Array.from({ length: remainder }).map((_, i) => (
              <Block key={i} kind="ones" highlight="leftover" />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
