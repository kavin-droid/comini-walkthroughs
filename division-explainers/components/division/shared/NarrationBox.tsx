import { fragmentsToText, type NarrationFragment } from "@/lib/division/types";
import { NarrationFragments } from "./NarrationFragments";
import { SpeakerButton } from "./SpeakerButton";

/** `speakable` shows a read-aloud icon next to the text - used specifically for MCQ question
 * steps (not every narration line), since those are the ones a child must actually understand to
 * act on, not just flavor text. */
export function NarrationBox({ fragments, speakable }: { fragments: NarrationFragment[]; speakable?: boolean }) {
  return (
    <div className="shrink-0 bg-paper-2 border-l-4 border-accent rounded-lg px-4 py-3 min-h-[20px] flex items-center gap-3">
      {speakable && <SpeakerButton text={fragmentsToText(fragments)} />}
      <p className="font-serif text-[16px] leading-snug text-ink">
        <NarrationFragments fragments={fragments} />
      </p>
    </div>
  );
}
