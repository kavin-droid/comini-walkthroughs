"use client";

import { MultiplicationWalkthrough } from "@/components/multiplication/MultiplicationWalkthrough";
import { STAGE3_CONFIG } from "@/lib/multiplication/config";

export default function Stage3Page() {
  return <MultiplicationWalkthrough config={STAGE3_CONFIG} />;
}
