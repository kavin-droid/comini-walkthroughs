"use client";

import { SkipCountingWalkthrough } from "@/components/skip-counting/SkipCountingWalkthrough";
import { SKIP_COUNTING_CONFIG } from "@/lib/skip-counting/config";

export default function Page() {
  return <SkipCountingWalkthrough config={SKIP_COUNTING_CONFIG} />;
}
