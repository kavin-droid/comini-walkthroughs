"use client";

import { motion, type PanInfo } from "framer-motion";
import type { RefObject } from "react";
import type { BlockKind } from "@/lib/division/stage3";
import { Block } from "./Block";

interface MotionBlockProps {
  id: string;
  kind: BlockKind;
  stripped?: boolean;
  dimmed?: boolean;
  countLabel?: number | null;
  highlight?: "group" | "leftover" | null;
  /** Animates to this opacity (defaults to 1) - used for the unpack sequence's "fading" stage,
   * once a pack has already FLIPped over to the ones column and needs to fade out in place. */
  opacity?: number;
  /** Delays the layout (position/size) transition by this many seconds - used to stagger several
   * blocks that FLIP at the same moment (e.g. one "share a round" tap moving one block to each
   * friend at once) so they visibly travel one at a time rather than as a single simultaneous
   * blob. Has no effect once a block has already settled at its target (no layout change left to
   * animate), so it's safe to pass unconditionally. */
  transitionDelay?: number;
  onTap?: () => void;
  /** Makes the block draggable instead of (or in addition to) tappable - dropped onto
   * `dropTargetRef`'s rect calls `onDropSuccess`; missed drops spring back to origin
   * (dragSnapToOrigin) since nothing in session state changed. */
  draggable?: boolean;
  dropTargetRef?: RefObject<HTMLDivElement | null>;
  onDropSuccess?: () => void;
  /** Fires on drag start - lets the caller reset its idle-hint clock on any real attempt, whether
   * or not the drop lands on target. */
  onDragActivity?: () => void;
}

/** A block with a stable `layoutId` so moving it between two different parents (e.g. the tens
 * place-value pool -> a container, or the unpack sequence's tens column -> ones column) animates
 * a real position/size travel via Framer's shared layout projection, same technique as stage2's
 * MotionItem. */
export function MotionBlock({
  id,
  kind,
  stripped,
  dimmed,
  countLabel,
  highlight,
  opacity,
  transitionDelay,
  onTap,
  draggable,
  dropTargetRef,
  onDropSuccess,
  onDragActivity,
}: MotionBlockProps) {
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
      layoutId={id}
      animate={{ opacity: opacity ?? 1 }}
      transition={{
        layout: { type: "spring", stiffness: 420, damping: 32, mass: 0.7, delay: transitionDelay ?? 0 },
        opacity: { duration: 0.25 },
      }}
      drag={draggable}
      dragSnapToOrigin
      dragElastic={0.15}
      dragMomentum={false}
      whileDrag={{ scale: 1.15, zIndex: 50 }}
      onDragStart={draggable ? onDragActivity : undefined}
      onDragEnd={draggable ? handleDragEnd : undefined}
      style={draggable ? { cursor: "grab", touchAction: "none" } : undefined}
    >
      <Block kind={kind} stripped={stripped} dimmed={dimmed} countLabel={countLabel} highlight={highlight} onTap={onTap} />
    </motion.div>
  );
}
