/** Stage1's whole scene sits on a FIXED-size intrinsic canvas (like every other .dc.html-ported
 * workspace in this app - see useFitWorkspace, which just CSS-scales this fixed layout to fit the
 * viewport). Because the size is fully determined by (total, people, compact) - never measured -
 * every item/tray/arrow position below is a plain function of index + count. That matters here
 * more than elsewhere: the annotation arrows need reliable, jitter-free start/end points every
 * single tap, and computed coordinates can't ever be one frame stale the way a DOM measurement
 * can.
 *
 * `compact` (true on narrow/mobile viewports, via useMediaQuery(DESKTOP_QUERY) in
 * Stage1MainScene) switches to a narrower, taller layout - trays wrap after 2 per row instead of
 * one continuous row. A landscape 1000x560 canvas contain-fit into a portrait phone screen leaves
 * most of the available height empty and shrinks every tap target far below a usable size; a
 * layout whose own aspect ratio is closer to the device's does not. */
export const ITEM_SIZE = 58;
const PILE_COLS = 5;

export const AVATAR_SIZE = 64;
export const TRAY_W = 170;
const TRAY_ITEM_SIZE = 26;
const TRAY_ITEM_GAP = 6;
const TRAY_HEIGHT = 172;

interface LayoutConfig {
  canvasW: number;
  traysPerRow: number;
  pileGap: number;
  trayGap: number;
  trayRowGap: number;
  pileTrayGap: number;
}

const WIDE: LayoutConfig = { canvasW: 1000, traysPerRow: Infinity, pileGap: 14, trayGap: 20, trayRowGap: 20, pileTrayGap: 56 };
const COMPACT: LayoutConfig = { canvasW: 460, traysPerRow: 2, pileGap: 12, trayGap: 16, trayRowGap: 18, pileTrayGap: 40 };

function config(compact: boolean): LayoutConfig {
  return compact ? COMPACT : WIDE;
}

export function pileRows(total: number): number {
  return Math.ceil(total / PILE_COLS);
}

function pileBlockHeight(total: number): number {
  const rows = pileRows(total);
  const { pileGap } = config(false); // pile row spacing doesn't change between modes
  return rows * ITEM_SIZE + (rows - 1) * pileGap;
}

function trayRowCount(people: number, compact: boolean): number {
  return Math.ceil(people / config(compact).traysPerRow);
}

function contentHeight(total: number, people: number, compact: boolean): number {
  const { pileTrayGap, trayRowGap } = config(compact);
  const rows = trayRowCount(people, compact);
  return pileBlockHeight(total) + pileTrayGap + rows * TRAY_HEIGHT + (rows - 1) * trayRowGap;
}

/** The canvas's own intrinsic size - width is fixed per mode, height grows with however many pile
 * rows + tray rows this particular (total, people) needs, so nothing is ever cropped and small
 * totals don't carry a huge fixed empty canvas around with them either. */
export function canvasSize(total: number, people: number, compact: boolean): { w: number; h: number } {
  return { w: config(compact).canvasW, h: contentHeight(total, people, compact) + 48 };
}

/** Vertically centers the whole pile+trays composition within the canvas's own content height (see
 * canvasSize) - the +24 top margin here matches the +48 total padding canvasSize adds. */
function pileOriginY(): number {
  return 24;
}

function pileBlockWidth(): number {
  const { pileGap } = config(false);
  return PILE_COLS * ITEM_SIZE + (PILE_COLS - 1) * pileGap;
}

function pileOriginX(compact: boolean): number {
  return config(compact).canvasW / 2 - pileBlockWidth() / 2;
}

/** Center point of pile item `i` (0-indexed, row-major, 5 per row). */
export function pileItemCenter(i: number, compact: boolean): { x: number; y: number } {
  const { pileGap } = config(compact);
  const col = i % PILE_COLS;
  const row = Math.floor(i / PILE_COLS);
  return {
    x: pileOriginX(compact) + col * (ITEM_SIZE + pileGap) + ITEM_SIZE / 2,
    y: pileOriginY() + row * (ITEM_SIZE + pileGap) + ITEM_SIZE / 2,
  };
}

function trayRowOriginY(total: number, compact: boolean): number {
  return pileOriginY() + pileBlockHeight(total) + config(compact).pileTrayGap;
}

function trayRowWidth(rowPeopleCount: number, compact: boolean): number {
  const { trayGap } = config(compact);
  return rowPeopleCount * TRAY_W + (rowPeopleCount - 1) * trayGap;
}

/** Top-left corner of tray `i`'s box (the box itself is TRAY_W wide, TRAY_HEIGHT tall). Wraps
 * after `traysPerRow` trays (unlimited on wide/desktop, 2 on compact/mobile), each row
 * independently centered by however many trays actually land in it. */
export function trayTopLeft(i: number, people: number, total: number, compact: boolean): { x: number; y: number } {
  const { traysPerRow, trayGap, trayRowGap } = config(compact);
  const row = Math.floor(i / traysPerRow);
  const col = i % traysPerRow;
  // row * traysPerRow would be 0 * Infinity = NaN on the unlimited (wide/desktop) layout - i - col
  // is the same value without ever multiplying by Infinity.
  const rowStart = i - col;
  const rowPeopleCount = Math.min(traysPerRow, people - rowStart);
  const originX = config(compact).canvasW / 2 - trayRowWidth(rowPeopleCount, compact) / 2;
  return {
    x: originX + col * (TRAY_W + trayGap),
    y: trayRowOriginY(total, compact) + row * (TRAY_HEIGHT + trayRowGap),
  };
}

/** Where an incoming item visually "lands" - top-center of tray `i`'s item-grid area, just below
 * its avatar. A stable point regardless of how many items are already inside, so the arrow always
 * aims at the same spot on the way in. */
export function trayIncomingAnchor(i: number, people: number, total: number, compact: boolean): { x: number; y: number } {
  const topLeft = trayTopLeft(i, people, total, compact);
  return { x: topLeft.x + TRAY_W / 2, y: topLeft.y + AVATAR_SIZE + 14 };
}

export const TRAY_ITEM_GRID = {
  gridTemplateColumns: `repeat(5, ${TRAY_ITEM_SIZE}px)`,
  gap: TRAY_ITEM_GAP,
} as const;

export { TRAY_ITEM_SIZE, TRAY_HEIGHT };

/** A handful of bright, distinct candy colors cycled by index - purely decorative variety, not
 * data-carrying (unlike stage2/3's semantic colors), since a pile of visually-identical items is
 * both boring and harder for a 5-year-old to individuate at a glance. */
export const CANDY_COLORS = ["#e0577a", "#3ea0d8", "#f2a93b", "#5bab6a", "#9b6fd1"];
