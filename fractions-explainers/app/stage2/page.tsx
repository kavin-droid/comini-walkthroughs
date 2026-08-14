"use client";

import { FractionWalkthrough } from "@/components/fractions/FractionWalkthrough";
import { STAGE2_CONFIG } from "@/lib/fractions/config";

export default function Stage2Page() {
  return <FractionWalkthrough config={STAGE2_CONFIG} />;
}
