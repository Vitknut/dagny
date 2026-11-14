import { overlaps, TILE } from '../../engine/collision';
import { drawSprite } from '../../engine/sprites';
import { PALETTE } from '../../data/palettes';
import type { AreaDef } from '../../data/types';
import { hasFlag, setFlag, type GameState } from '../state';

/**
 * A trial of candles (Prosten's, before he teaches Eld): candles with a sign
 * carved above each, to be lit in the order a verse gives. Dagny lights one
 * by standing at it and pressing Up (walking past lights nothing). Light the
 * wrong one and every flame dies at once. Nothing says so; the dark says it.
 */
export interface TrialCandle {
  tx: number;
  ty: number;
  sign: string;
  lit: boolean;
  /** Dagny was touching it last step (a candle lights as she comes onto it, not while she stands there). */
  touching: boolean;
}

export interface Trial {
  candles: TrialCandle[];
  /** How many are lit in the right order. */
  next: number;
  /** Steps left of the gust after a wrong one. */
  gust: number;
  /** The unlit candle Dagny stands at now (-1: none), for the prompt over it. */
  near: number;
}

export function makeTrial(a: AreaDef, s: GameState): Trial | null {
  const t = a.candleTrial;
  if (!t) return null;
  const done = hasFlag(s, t.flag);
  return { candles: t.candles.map((c) => ({ ...c, lit: done, touching: false })), next: done ? t.order.length : 0, gust: 0, near: -1 };
}

export type TrialEvent = 'lit' | 'wrong' | 'done' | null;

/** One step: Dagny is `box`; `light` is Up pressed this step; a bird lights nothing. */
export function updateTrial(tr: Trial, a: AreaDef, s: GameState, box: { x: number; y: number; w: number; h: number }, human: boolean, light = false): TrialEvent {
  const t = a.candleTrial!;
  tr.near = -1;
  if (hasFlag(s, t.flag) || !hasFlag(s, t.requires)) return null;
  for (const [i, c] of tr.candles.entries()) {
    c.touching = human && overlaps({ x: c.tx * TILE, y: c.ty * TILE, w: TILE, h: TILE }, box);
    if (c.touching && !c.lit) tr.near = i;
  }
  if (tr.gust > 0) {
    tr.gust--;
    return null;
  }
  let ev: TrialEvent = null;
  for (const c of tr.candles) {
    if (light && c.touching && !c.lit && ev === null) {
      if (c.sign === t.order[tr.next]) {
        c.lit = true;
        tr.next++;
        ev = 'lit';
        if (tr.next === t.order.length) {
          setFlag(s, t.flag);
          ev = 'done';
        }
      } else {
        // Wrong: every flame goes out.
        for (const o of tr.candles) o.lit = false;
        tr.next = 0;
        tr.gust = 40;
        ev = 'wrong';
      }
    }
  }
  return ev;
}

/** The candles, and each one's sign carved in the wall above it. */
export function renderTrial(tr: Trial, ctx: CanvasRenderingContext2D, camX: number, camY: number, frame: number): void {
  for (const c of tr.candles) {
    const x = c.tx * TILE - camX;
    const y = c.ty * TILE - camY;
    drawSprite(ctx, c.lit ? 'candle' : 'candleOff', Math.floor((frame + c.tx * 5) / 18), x, y);
    drawSign(ctx, c.sign, x + 4, y - 14, c.lit);
  }
}

/** Small carved signs, 7×7: sol, måne, stjärna, kors, hjärta. */
const SIGNS: Readonly<Record<string, string[]>> = {
  sol: ['...X...', '.X.X.X.', '..XXX..', 'XXXXXXX', '..XXX..', '.X.X.X.', '...X...'],
  mane: ['..XXX..', '.XX....', 'XX.....', 'XX.....', 'XX.....', '.XX....', '..XXX..'],
  stjarna: ['...X...', '...X...', 'XXXXXXX', '.XXXXX.', '..XXX..', '.XX.XX.', 'X.....X'],
  kors: ['...X...', '...X...', 'XXXXXXX', '...X...', '...X...', '...X...', '...X...'],
  hjarta: ['.XX.XX.', 'XXXXXXX', 'XXXXXXX', '.XXXXX.', '..XXX..', '...X...', '.......'],
};

function drawSign(ctx: CanvasRenderingContext2D, sign: string, x: number, y: number, lit: boolean): void {
  const rows = SIGNS[sign];
  if (!rows) return;
  ctx.fillStyle = lit ? PALETTE.Y : PALETTE.w;
  for (let r = 0; r < rows.length; r++) {
    for (let k = 0; k < rows[r].length; k++) if (rows[r][k] === 'X') ctx.fillRect(Math.round(x + k), Math.round(y + r), 1, 1);
  }
}
