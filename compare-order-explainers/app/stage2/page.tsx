"use client";

import { CompareOrderWalkthrough } from "@/components/compare-order/CompareOrderWalkthrough";
import { STAGE2_CONFIG } from "@/lib/compare-order/config";

export default function Stage2Page() {
  return <CompareOrderWalkthrough config={STAGE2_CONFIG} />;
}
