"use client";

import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  fullWidth?: boolean;
}

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:
    "bg-left text-card border border-left hover:brightness-105 disabled:bg-ink-3 disabled:border-ink-3",
  secondary:
    "bg-card text-ink border border-line hover:border-line-2 disabled:opacity-50",
  ghost: "bg-transparent text-ink border border-transparent hover:bg-paper-2 disabled:opacity-40",
};

export function Button({
  variant = "primary",
  fullWidth,
  className,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled}
      className={cn(
        "font-sans font-semibold text-[15px] rounded-2xl px-5 py-3 transition-colors",
        "disabled:cursor-not-allowed disabled:pointer-events-none",
        VARIANT_CLASSES[variant],
        fullWidth && "w-full",
        className,
      )}
      {...props}
    />
  );
}
