"use client";

import { AdditionWalkthrough } from "@/components/addition/AdditionWalkthrough";
import { STAGE3_CONFIG } from "@/lib/addition/config";

export default function Stage3Page() {
  return <AdditionWalkthrough config={STAGE3_CONFIG} />;
}
