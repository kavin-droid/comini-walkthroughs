"use client";

import { AdditionWalkthrough } from "@/components/addition/AdditionWalkthrough";
import { STAGE2_CONFIG } from "@/lib/addition/config";

export default function Stage2Page() {
  return <AdditionWalkthrough config={STAGE2_CONFIG} />;
}
