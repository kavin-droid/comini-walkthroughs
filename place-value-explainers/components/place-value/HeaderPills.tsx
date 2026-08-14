"use client";

import Link from "next/link";
import { ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useMediaQuery, DESKTOP_QUERY } from "@/hooks/useMediaQuery";
import { usePlaceValue } from "./PlaceValueContext";

/** Desktop-only Concept + Progression pills, shown in the header ahead of the mode toggle -
 * matches the vanilla app-shell spec: on mobile these two fields live in the settings sheet
 * instead (see OptionsPanel). Both stages' concept select is always disabled with one fixed
 * label (`conceptSelectable` is false), matching the vanilla apps' `<select disabled>`. */
export function HeaderPills() {
  const isDesktop = useMediaQuery(DESKTOP_QUERY);
  const { config } = usePlaceValue();
  if (!isDesktop) return null;

  const currentLabel = `${config.id === "stage2" ? "Stage 2" : "Stage 3"} · ${config.ageBand}`;

  return (
    <>
      <select
        aria-label="Concept"
        className="h-8 px-3 rounded-full border border-line bg-card text-[12px] font-mono text-ink-2 max-w-[160px] shrink-0 cursor-not-allowed opacity-75"
        value={config.concepts[0].id}
        disabled
        onChange={() => {}}
      >
        <option value={config.concepts[0].id}>{config.concepts[0].label}</option>
      </select>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="h-8 px-2.5 rounded-full border border-line bg-card text-[12px] font-mono text-ink flex items-center gap-1 max-w-[120px] shrink-0">
            <span className="overflow-hidden text-ellipsis whitespace-nowrap">
              {config.ageBand}
            </span>
            <ChevronDown size={12} className="text-ink-3 shrink-0" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuItem disabled className="font-mono text-[13px]">
            {currentLabel}
          </DropdownMenuItem>
          <DropdownMenuItem asChild className="font-mono text-[13px]">
            <Link href={config.progressionHref}>{config.progressionLabel}</Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
