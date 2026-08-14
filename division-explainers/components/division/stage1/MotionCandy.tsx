"use client";

import { motion, type PanInfo } from "framer-motion";
import type { RefObject } from "react";
import { CANDY_COLORS, ITEM_SIZE } from "./canvas";

/** One shared item, styled as a bright glossy candy - a stable `layoutId` shared between wherever
 * it's currently rendered (the pile, or a person's tray), same FLIP technique as stage2's
 * MotionItem/stage3's MotionBlock: moving the SAME element to a new parent makes Framer animate
 * the real position/size delta, genuine travel instead of a pop-in-a-new-place. Bigger than either
 * of those (52px vs 16-20px) and in one of a few candy colors (not a single flat color) - this is
 * the star of the whole screen for a 5-year-old, it should read as a toy, not a data point.
 *
 * Draggable (not tappable) when active - same Framer `drag`/`dragSnapToOrigin`/`onDragEnd`
 * drop-rect-check technique as stage3's MotionBlock, so "pick it up and carry it to your friend"
 * is the actual physical action, not an abstract button press. */
export function MotionCandy({
  id,
  size = ITEM_SIZE,
  draggable,
  dropTargetRef,
  onDropSuccess,
  onDragActivity,
}: {
  id: number;
  size?: number;
  draggable?: boolean;
  dropTargetRef?: RefObject<HTMLDivElement | null>;
  onDropSuccess?: () => void;
  onDragActivity?: () => void;
}) {
  const color = CANDY_COLORS[id % CANDY_COLORS.length];

  function handleDragEnd(_: PointerEvent | MouseEvent | TouchEvent, info: PanInfo) {
    const rect = dropTargetRef?.current?.getBoundingClientRect();
    if (!rect) return;
    const { x, y } = info.point;
    if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
      onDropSuccess?.();
    }
  }

  return (
    <motion.div
      layout
      layoutId={`s1-item-${id}`}
      drag={draggable}
      dragSnapToOrigin
      dragElastic={0.15}
      dragMomentum={false}
      whileDrag={{ scale: 1.2, zIndex: 50 }}
      onDragStart={draggable ? onDragActivity : undefined}
      onDragEnd={draggable ? handleDragEnd : undefined}
      role={draggable ? "button" : undefined}
      aria-label={draggable ? "Drag to share this one" : undefined}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{
        layout: { type: "spring", stiffness: 380, damping: 30, mass: 0.7 },
        default: { type: "spring", stiffness: 420, damping: 20 },
      }}
      className="relative rounded-full border-[3px] shrink-0"
      style={{
        width: size,
        height: size,
        background: `radial-gradient(circle at 32% 28%, color-mix(in srgb, ${color} 60%, white), ${color})`,
        borderColor: "rgba(0,0,0,0.12)",
        boxShadow: "inset 0 -4px 0 rgba(0,0,0,0.12)",
        cursor: draggable ? "grab" : "default",
        touchAction: draggable ? "none" : undefined,
      }}
    />
  );
}
