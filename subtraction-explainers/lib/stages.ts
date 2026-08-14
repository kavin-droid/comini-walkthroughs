export type StageId = "stage1" | "stage2" | "stage3";

export interface StageInfo {
  id: StageId;
  href: string;
  label: string;
}

/** Single source of truth for every stage's picker (see components/shared/StageDropdown.tsx) -
 * previously each stage linked only to the "next" one, and Stage1 used a bare Link while
 * stage2/3 used a current+next dropdown, so switching stages didn't look/behave the same
 * anywhere (round-18: "not consistent"). */
export const STAGES: StageInfo[] = [
  { id: "stage1", href: "/stage1/", label: "Stage 1 · Ages 5–6" },
  { id: "stage2", href: "/stage2/", label: "Stage 2 · Ages 6–7" },
  { id: "stage3", href: "/stage3/", label: "Stage 3 · Ages 7–8" },
];
