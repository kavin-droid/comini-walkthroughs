"use client";

import { ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { CONCEPT_ORDER, CONCEPT_LABEL, CONCEPT_ICON } from "@/lib/stage1/config";
import { useStage1 } from "./Stage1Context";

/** Replaces the old big-icon tab row (round-13: "instead of tab view include the methods inside a
 * dropdown in the header like in the other stages") - same DropdownMenu component and trigger-pill
 * styling as subtraction/HeaderPills' Progression dropdown, just driving SET_CONCEPT instead of a
 * page link. The emoji stays in the trigger/items so it's still the fastest visual identifier, but
 * the control itself now lives in the header like every sibling stage's pickers.
 *
 * `className` lets round-20's mobile settings sheet (Stage1OptionsPanel) restyle the trigger as a
 * full-width field row matching that sheet's other fields, instead of the default compact header
 * pill - the dropdown logic/content is identical either way.
 *
 * The name label used to be `hidden` below 900px (icon-only on mobile) - round-21 feedback wants
 * the name visible everywhere, truncated rather than dropped, so a narrow header pill still reads
 * as "which method is this" without opening the menu. */
export function Stage1ConceptDropdown({ className }: { className?: string }) {
  const { state, dispatch } = useStage1();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={cn(
            "h-8 px-2.5 rounded-full border border-line bg-card text-[12px] font-mono text-ink flex items-center gap-1.5 shrink-0 min-w-0",
            className,
          )}
        >
          <span aria-hidden className="shrink-0">{CONCEPT_ICON[state.concept]}</span>
          <span className="truncate min-w-0 max-w-[120px]">{CONCEPT_LABEL[state.concept]}</span>
          <ChevronDown size={12} className="text-ink-3 shrink-0" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-48">
        {CONCEPT_ORDER.map((concept) => (
          <DropdownMenuItem
            key={concept}
            className="font-mono text-[13px] gap-2"
            onClick={() => dispatch({ type: "SET_CONCEPT", concept })}
          >
            <span aria-hidden>{CONCEPT_ICON[concept]}</span>
            {CONCEPT_LABEL[concept]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
