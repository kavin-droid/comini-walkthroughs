"use client";

import { SubtractionWalkthrough } from "@/components/subtraction/SubtractionWalkthrough";
import { STAGE2_CONFIG } from "@/lib/subtraction/config";

export default function Stage2Page() {
  return <SubtractionWalkthrough config={STAGE2_CONFIG} />;
}
