"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/** Every stage, always listed in full - a child (or the adult with them) should be able to jump
 * to any stage from any other stage, not just "forward one" from wherever they happen to be. */
const ALL_STAGES = [
  { href: "/stage1/", label: "Stage 1", ageBand: "Ages 5–6" },
  { href: "/stage2/", label: "Stage 2", ageBand: "Ages 6–7" },
  { href: "/stage3/", label: "Stage 3", ageBand: "Ages 7–8" },
];

export function ProgressionDropdown({ compact }: { compact?: boolean }) {
  const pathname = usePathname();
  const current = ALL_STAGES.find((s) => pathname?.startsWith(s.href)) ?? ALL_STAGES[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {compact ? (
          <button className="h-8 px-2.5 rounded-full border border-line bg-card text-[12px] font-mono text-ink flex items-center gap-1 max-w-[120px] shrink-0">
            <span className="overflow-hidden text-ellipsis whitespace-nowrap">{current.ageBand}</span>
            <ChevronDown size={12} className="text-ink-3 shrink-0" />
          </button>
        ) : (
          <button className="w-full h-9 flex items-center justify-between px-3 rounded-lg border border-line bg-card text-[13px] text-ink font-mono">
            <span>{current.ageBand}</span>
            <ChevronDown size={14} className="text-ink-3" />
          </button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align={compact ? "end" : "start"} className="w-60">
        {ALL_STAGES.map((stage) => {
          const isCurrent = stage.href === current.href;
          return (
            <DropdownMenuItem
              key={stage.href}
              disabled={isCurrent}
              asChild={!isCurrent}
              className={cn("font-mono text-[13px]", isCurrent && "font-semibold text-accent")}
            >
              {isCurrent ? (
                <span>
                  {stage.label} · {stage.ageBand}
                </span>
              ) : (
                <Link href={stage.href}>
                  {stage.label} · {stage.ageBand}
                </Link>
              )}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
