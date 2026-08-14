"use client";

import { RoundingWalkthrough } from "@/components/rounding/RoundingWalkthrough";
import { STAGE2_CONFIG } from "@/lib/rounding/config";

export default function Stage2Page() {
  return <RoundingWalkthrough config={STAGE2_CONFIG} />;
}
