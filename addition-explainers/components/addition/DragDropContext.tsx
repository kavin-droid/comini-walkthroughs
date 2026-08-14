"use client";

import { createContext, useContext } from "react";
import type { Place, RowKey } from "@/lib/addition/types";

export type DragPointerDown = (
  e: React.PointerEvent<HTMLDivElement>,
  place: Place,
  rowKey: RowKey,
  index: number,
) => void;

const DragDropContext = createContext<DragPointerDown | null>(null);

export const DragDropContextProvider = DragDropContext.Provider;

export function useDragPointerDown(): DragPointerDown | null {
  return useContext(DragDropContext);
}
