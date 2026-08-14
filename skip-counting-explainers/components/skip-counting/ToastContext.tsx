"use client";

import { createContext, useContext, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ToastValue {
  showToast: (text: string) => void;
}

const ToastContext = createContext<ToastValue | null>(null);

export function useToast(): ToastValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within a <ToastProvider>");
  return ctx;
}

/** Ported from the vanilla app's showToast(): a fixed pill at the top of the screen that fades
 * in, holds for 2s, then fades out - used for the mode-toggle's "Autoplay"/"Manual" feedback. */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [text, setText] = useState("");
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<number | null>(null);

  function showToast(next: string) {
    if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    setText(next);
    setVisible(true);
    timerRef.current = window.setTimeout(() => setVisible(false), 2000);
  }

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div
        className={cn(
          "fixed left-1/2 top-3.5 -translate-x-1/2 bg-ink text-card font-mono text-[13px] font-semibold tracking-wide px-5 py-2.5 rounded-full pointer-events-none transition-opacity duration-300 z-[100]",
          visible ? "opacity-100" : "opacity-0",
        )}
      >
        {text}
      </div>
    </ToastContext.Provider>
  );
}
