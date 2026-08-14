"use client";

import { RoundingWalkthrough } from "@/components/rounding/RoundingWalkthrough";
import { STAGE3_CONFIG } from "@/lib/rounding/config";

export default function Stage3Page() {
  return <RoundingWalkthrough config={STAGE3_CONFIG} />;
}
