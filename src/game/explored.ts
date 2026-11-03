import { OVERWORLD } from '../data/overworld';
import type { GameState } from './state';

/**
 * Which overworld tiles Dagny has seen, for the map in the pause menu. Kept
 * in the save as a bit set (one bit per tile, base64), about 750 characters.
 */
const W = OVERWORLD.tiles[0].length;
const H = OVERWORLD.tiles.length;
const B64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';

/** How far around Dagny counts as seen: about one phone screen (20 × 11 tiles). */
export const SEE_X = 10;
export const SEE_Y = 6;

const cache = new WeakMap<GameState, { text: string; bits: Uint8Array }>();

function bitsOf(s: GameState): Uint8Array {
  const hit = cache.get(s);
  if (hit && hit.text === s.explored) return hit.bits;
  const bits = new Uint8Array(W * H);
  for (let i = 0; i < s.explored.length; i++) {
    const v = B64.indexOf(s.explored[i]);
    if (v < 0) continue;
    for (let b = 0; b < 6; b++) if (v & (1 << b) && i * 6 + b < bits.length) bits[i * 6 + b] = 1;
  }
  cache.set(s, { text: s.explored, bits });
  return bits;
}

function store(s: GameState, bits: Uint8Array): void {
  let out = '';
  for (let i = 0; i < bits.length; i += 6) {
    let v = 0;
    for (let b = 0; b < 6; b++) if (bits[i + b]) v |= 1 << b;
    out += B64[v];
  }
  s.explored = out.replace(/A+$/, '');
  cache.set(s, { text: s.explored, bits });
}

export function isExplored(s: GameState, x: number, y: number): boolean {
  return x >= 0 && y >= 0 && x < W && y < H && bitsOf(s)[y * W + x] === 1;
}

/** Marks everything within sight of (x, y) as seen. Returns true if anything was new. */
export function markExplored(s: GameState, x: number, y: number, rx = SEE_X, ry = SEE_Y): boolean {
  const bits = bitsOf(s).slice();
  let changed = false;
  for (let yy = Math.max(0, y - ry); yy <= Math.min(H - 1, y + ry); yy++) {
    for (let xx = Math.max(0, x - rx); xx <= Math.min(W - 1, x + rx); xx++) {
      if (!bits[yy * W + xx]) {
        bits[yy * W + xx] = 1;
        changed = true;
      }
    }
  }
  if (changed) store(s, bits);
  return changed;
}

/** The smallest box round every seen tile, or null when nothing is seen yet. */
export function exploredBounds(s: GameState): { x0: number; y0: number; x1: number; y1: number } | null {
  const bits = bitsOf(s);
  let x0 = W, y0 = H, x1 = -1, y1 = -1;
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      if (!bits[y * W + x]) continue;
      if (x < x0) x0 = x;
      if (x > x1) x1 = x;
      if (y < y0) y0 = y;
      if (y > y1) y1 = y;
    }
  }
  return x1 < 0 ? null : { x0, y0, x1, y1 };
}
