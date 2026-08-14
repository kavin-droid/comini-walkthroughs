"use client";

import { PlaceValueWalkthrough } from "@/components/place-value/PlaceValueWalkthrough";
import { STAGE3_CONFIG } from "@/lib/place-value/config";

export default function Stage3Page() {
  return <PlaceValueWalkthrough config={STAGE3_CONFIG} />;
}
