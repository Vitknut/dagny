import { Kind, TILE, type Rect } from '../../engine/collision';
import { drawSprite } from '../../engine/sprites';
import type { SkillId, SpellId } from '../../data/types';

/**
 * Things in a room that only one ability gets past (the rule of three, fas 3):
 *
 *  _  skört golv   – rotten boards: a thrust from above (Nedåtstöt) breaks them
 *  (  torra rötter – a tangle of dry roots: a fireball (Eld) burns it away
 *  [  lyktgrind    – a gate of dead lanterns: thunder (Åska) in the room opens it
 *  -  ljusstig     – a ledge that is only there in the light (Lyse)
 *  }  lösa stenar  – loose masonry: struck with the crowbar in the pack (spettet, the crypt's tool) it comes down
 *
 * The first three open for good (kept in GameState.opened, like hatches);
 * the light path comes and goes with the light.
 */
export const OBSTACLES: Readonly<Record<string, { ability: SpellId | SkillId; sprite: string }>> = {
  _: { ability: 'nedatstot', sprite: 'skortGolv' },
  '(': { ability: 'eld', sprite: 'torraRotter' },
  '[': { ability: 'aska', sprite: 'lyktgrind' },
  '-': { ability: 'lyse', sprite: 'ljusstig' },
};

/** Loose masonry and the tool that brings it down (fas 4, the crypt). */
export const LOOSE = { ch: '}', item: 'spett', sprite: 'lostBlock' } as const;

/** The ones that stand solid until opened (all but the light path). */
export function isBarrier(ch: string): boolean {
  return ch === '_' || ch === '(' || ch === '[' || ch === LOOSE.ch;
}

/** What the room needs to know to open its barriers. */
export interface ObstacleRoom {
  area: { tiles: readonly string[] };
  grid: { w: number; h: number; kinds: Uint8Array | number[] };
  tileSprite: Array<string | null>;
}

/** Cells of `ch` that are still shut and overlap `box`. */
export function shutCellsIn(r: ObstacleRoom, ch: string, box: Rect): number[] {
  const out: number[] = [];
  const x0 = Math.max(0, Math.floor(box.x / TILE));
  const x1 = Math.min(r.grid.w - 1, Math.floor((box.x + box.w - 1) / TILE));
  const y0 = Math.max(0, Math.floor(box.y / TILE));
  const y1 = Math.min(r.grid.h - 1, Math.floor((box.y + box.h - 1) / TILE));
  for (let ty = y0; ty <= y1; ty++) {
    for (let tx = x0; tx <= x1; tx++) {
      const i = ty * r.grid.w + tx;
      if (r.area.tiles[ty][tx] === ch && r.grid.kinds[i] === Kind.Solid) out.push(i);
    }
  }
  return out;
}

/** Every still-shut cell of `ch` in the room. */
export function allShut(r: ObstacleRoom, ch: string): number[] {
  return shutCellsIn(r, ch, { x: 0, y: 0, w: r.grid.w * TILE, h: r.grid.h * TILE });
}

/** Light paths: one-way ledges while the light burns, nothing otherwise. */
export function setLightPaths(r: ObstacleRoom, cells: readonly number[], lit: boolean): void {
  for (const i of cells) r.grid.kinds[i] = lit ? Kind.OneWay : Kind.Empty;
}

/** The light path, drawn only while it is there (and a faint shimmer as the light fades). */
export function renderLightPaths(ctx: CanvasRenderingContext2D, cells: readonly number[], w: number, camX: number, camY: number, lit: boolean, frame: number): void {
  if (!lit) return;
  for (const i of cells) {
    const x = (i % w) * TILE - camX;
    const y = Math.floor(i / w) * TILE - camY;
    if (x < -TILE || x > 400 || y < -TILE || y > 260) continue;
    drawSprite(ctx, 'ljusstig', Math.floor((frame + i * 3) / 12) % 2, x, y);
  }
}

/** The whole tangle a fire spreads through: every shut `ch` cell joined to these. */
export function spread(r: ObstacleRoom, ch: string, seeds: readonly number[]): number[] {
  const { w, h } = r.grid;
  const seen = new Set<number>(seeds);
  const stack = [...seeds];
  while (stack.length) {
    const i = stack.pop()!;
    const x = i % w;
    const y = (i - x) / w;
    for (const [nx, ny] of [[x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]]) {
      const j = ny * w + nx;
      if (nx < 0 || ny < 0 || nx >= w || ny >= h || seen.has(j)) continue;
      if (r.area.tiles[ny][nx] !== ch || r.grid.kinds[j] !== Kind.Solid) continue;
      seen.add(j);
      stack.push(j);
    }
  }
  return [...seen];
}
