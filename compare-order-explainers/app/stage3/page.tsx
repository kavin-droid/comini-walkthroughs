"use client";

import { CompareOrderWalkthrough } from "@/components/compare-order/CompareOrderWalkthrough";
import { STAGE3_CONFIG } from "@/lib/compare-order/config";

export default function Stage3Page() {
  return <CompareOrderWalkthrough config={STAGE3_CONFIG} />;
}
