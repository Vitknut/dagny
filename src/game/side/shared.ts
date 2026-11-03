import { rectHitsSolid, TILE, type Rect, type TileGrid } from '../../engine/collision';

/** Small helpers and types shared by the side-view scene and its systems. */

export interface Marker {
  tx: number;
  ty: number;
}

export interface Checkpoint extends Marker {
  lit: boolean;
  pid: string;
}

export type SpellTimers = Record<'skydd' | 'hopp' | 'lyse' | 'eld' | 'hamn', number>;

export const tmpA: Rect = { x: 0, y: 0, w: 0, h: 0 };
export const tmpB: Rect = { x: 0, y: 0, w: 0, h: 0 };

/** Removes the items that fail `keep`, in place (no new array each frame). */
export function compact<T>(list: T[], keep: (item: T) => boolean): void {
  let n = 0;
  for (let i = 0; i < list.length; i++) if (keep(list[i])) list[n++] = list[i];
  list.length = n;
}

let disc: HTMLCanvasElement | null = null;

/** A soft light: opaque out to 20 % of the radius, fading to nothing at the edge. */
export function lightDisc(): HTMLCanvasElement {
  if (disc) return disc;
  const size = 128;
  disc = document.createElement('canvas');
  disc.width = size;
  disc.height = size;
  const c = disc.getContext('2d') as CanvasRenderingContext2D;
  const r = size / 2;
  const g = c.createRadialGradient(r, r, r * 0.2, r, r, r);
  g.addColorStop(0, 'rgba(0,0,0,1)');
  g.addColorStop(1, 'rgba(0,0,0,0)');
  c.fillStyle = g;
  c.fillRect(0, 0, size, size);
  return disc;
}

/**
 * Nearest position for a w×h body that is not inside a solid tile, standing
 * on ground if possible: tries straight up first, then outward to the sides.
 * Null when the given spot is already free.
 */
export function nearestFreeSpot(grid: TileGrid, x: number, y: number, w: number, h: number): { x: number; y: number } | null {
  if (!rectHitsSolid(grid, { x, y, w, h })) return null;
  const bottom = y + h;
  for (let r = 0; r <= Math.max(grid.w, grid.h); r++) {
    for (const dx of r === 0 ? [0] : [0, -r, r]) {
      for (let dy = 0; dy <= r + 2; dy++) {
        const tx = Math.floor((x + w / 2) / TILE) + dx;
        const tyFeet = Math.floor((bottom - 1) / TILE) - dy;
        if (tx < 0 || tx >= grid.w || tyFeet < 0) continue;
        const nx = tx * TILE + TILE / 2 - w / 2;
        const ny = (tyFeet + 1) * TILE - h;
        if (!rectHitsSolid(grid, { x: nx, y: ny, w, h })) return { x: nx, y: ny };
      }
    }
  }
  return null;
}
