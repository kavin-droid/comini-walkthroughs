"use client";

import { SubtractionWalkthrough } from "@/components/subtraction/SubtractionWalkthrough";
import { STAGE3_CONFIG } from "@/lib/subtraction/config";

export default function Stage3Page() {
  return <SubtractionWalkthrough config={STAGE3_CONFIG} />;
}
