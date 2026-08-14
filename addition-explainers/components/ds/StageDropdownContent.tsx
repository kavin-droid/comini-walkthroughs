"use client";

import Link from "next/link";
import { DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { ALL_STAGES } from "@/lib/stages";

/** The dropdown's item list, shared by every stage-switcher trigger (HeaderPills' pill button on
 * desktop, OptionsPanel's full-width row on mobile, both stage1 and addition versions) so all of
 * them list every stage, not just a single "next stage" link - the current stage renders
 * disabled/plain, the other two as real links. */
export function StageDropdownContent({
  currentId,
  align = "end",
}: {
  currentId: string;
  align?: "start" | "end";
}) {
  return (
    <DropdownMenuContent align={align} className="w-56">
      {ALL_STAGES.map((stage) =>
        stage.id === currentId ? (
          <DropdownMenuItem key={stage.id} disabled className="font-mono text-[13px]">
            {stage.label}
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem key={stage.id} asChild className="font-mono text-[13px]">
            <Link href={stage.href}>{stage.label}</Link>
          </DropdownMenuItem>
        ),
      )}
    </DropdownMenuContent>
  );
}
