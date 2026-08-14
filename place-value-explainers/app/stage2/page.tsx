"use client";

import { PlaceValueWalkthrough } from "@/components/place-value/PlaceValueWalkthrough";
import { STAGE2_CONFIG } from "@/lib/place-value/config";

export default function Stage2Page() {
  return <PlaceValueWalkthrough config={STAGE2_CONFIG} />;
}
