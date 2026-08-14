"use client";

import { Stage1Walkthrough } from "@/components/stage1/Stage1Walkthrough";
import { STAGE1_CONFIG } from "@/lib/stage1/config";

export default function Stage1Page() {
  return <Stage1Walkthrough config={STAGE1_CONFIG} />;
}
