"use client";

import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes } from "react";

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  size?: number;
  variant?: "default" | "primary";
  "aria-label": string;
}

export function IconButton({
  size = 40,
  variant = "default",
  className,
  style,
  ...props
}: IconButtonProps) {
  return (
    <button
      style={{ width: size, height: size, ...style }}
      className={cn(
        "inline-flex items-center justify-center rounded-full border transition-colors shrink-0",
        variant === "primary"
          ? "bg-left border-left text-card hover:brightness-105"
          : "bg-card border-line text-ink hover:border-line-2",
        "disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none",
        className,
      )}
      {...props}
    />
  );
}
