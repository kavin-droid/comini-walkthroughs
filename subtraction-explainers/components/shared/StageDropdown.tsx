"use client";

import Link from "next/link";
import { Check, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { STAGES, type StageId } from "@/lib/stages";

/** Lists ALL three stages as dropdown items (the current one marked with a check, not just shown
 * as a bare disabled label pointing at "next") - shared by every stage's header so switching
 * stages behaves identically everywhere (round-18: previously Stage1 used a plain "next stage"
 * link while stage2/3 used a current+next-only dropdown, which read as inconsistent). */
export function StageDropdown({ currentId, className }: { currentId: StageId; className?: string }) {
  const current = STAGES.find((s) => s.id === currentId)!;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={cn(
            "h-8 px-2.5 rounded-full border border-line bg-card text-[12px] font-mono text-ink flex items-center gap-1 max-w-[150px] shrink-0",
            className,
          )}
        >
          <span className="overflow-hidden text-ellipsis whitespace-nowrap">{current.label}</span>
          <ChevronDown size={12} className="text-ink-3 shrink-0" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {STAGES.map((s) =>
          s.id === currentId ? (
            <DropdownMenuItem key={s.id} disabled className="font-mono text-[13px] text-accent font-semibold">
              <Check size={14} className="shrink-0" />
              {s.label}
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem key={s.id} asChild className="font-mono text-[13px]">
              {/* prefetch={false}: this is a static export, not a Next server - the app router's
                  fine-grained RSC segment prefetch has nothing to fetch here and 404s silently in
                  the background on every render once a Link is in the DOM (harmless - real
                  click-through navigation still works via a full page load - but noisy). */}
              <Link href={s.href} prefetch={false}>
                {s.label}
              </Link>
            </DropdownMenuItem>
          ),
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
