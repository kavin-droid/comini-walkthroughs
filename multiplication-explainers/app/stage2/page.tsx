"use client";

import { MultiplicationWalkthrough } from "@/components/multiplication/MultiplicationWalkthrough";
import { STAGE2_CONFIG } from "@/lib/multiplication/config";

export default function Stage2Page() {
  return <MultiplicationWalkthrough config={STAGE2_CONFIG} />;
}
