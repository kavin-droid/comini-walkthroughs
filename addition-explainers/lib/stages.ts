export interface StageLink {
  id: "stage1" | "stage2" | "stage3";
  href: string;
  label: string;
}

/** Single source of truth for the 3-stage list, used everywhere a stage-switcher dropdown
 * appears (HeaderPills, OptionsPanel) so every entry point lists all 3 stages consistently,
 * not just a single "next stage" link. */
export const ALL_STAGES: StageLink[] = [
  { id: "stage1", href: "/stage1/", label: "Stage 1 · Ages 5–6" },
  { id: "stage2", href: "/stage2/", label: "Stage 2 · Ages 6–7" },
  { id: "stage3", href: "/stage3/", label: "Stage 3 · Ages 7–8" },
];
