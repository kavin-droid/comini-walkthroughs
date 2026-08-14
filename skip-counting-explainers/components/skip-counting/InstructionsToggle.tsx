"use client";

import { MessageSquareOff, MessageSquareText } from "lucide-react";
import { IconButton } from "@/components/ds/IconButton";
import { useInstructionsVisibility } from "./InstructionsVisibilityContext";

export function InstructionsToggle() {
  const { hideInstructions, toggleHideInstructions } = useInstructionsVisibility();

  return (
    <IconButton
      aria-label={hideInstructions ? "Show text instructions" : "Hide text instructions"}
      onClick={toggleHideInstructions}
      size={36}
    >
      {hideInstructions ? <MessageSquareOff size={17} /> : <MessageSquareText size={17} />}
    </IconButton>
  );
}
