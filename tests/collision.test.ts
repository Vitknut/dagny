import { describe, expect, it } from 'vitest';
import { Kind, firmlySupported, groundBelow, moveBody, overlaps, pushX, touchesKind, type Body, type TileGrid } from '../src/engine/collision';

/** Builds a grid from rows: '#' solid, '=' one-way, '^' hazard. */
function grid(rows: string[], walls = true): TileGrid {
  const h = rows.length;
  const w = rows[0].length;
  const kinds = new Uint8Array(w * h);
  rows.forEach((r, y) =>
    [...r].forEach((ch, x) => {
      kinds[y * w + x] = ch === '#' ? Kind.Solid : ch === '=' ? Kind.OneWay : ch === '^' ? Kind.Hazard : Kind.Empty;
    }),
  );
  return { w, h, kinds, wallLeft: walls, wallRight: walls };
}

const body = (x: number, y: number, w = 10, h = 20): Body => ({ x, y, w, h, vx: 0, vy: 0, onGround: false });

describe('overlaps', () => {
  it('detects overlap and touching edges correctly', () => {
    expect(overlaps({ x: 0, y: 0, w: 10, h: 10 }, { x: 5, y: 5, w: 10, h: 10 })).toBe(true);
    expect(overlaps({ x: 0, y: 0, w: 10, h: 10 }, { x: 10, y: 0, w: 10, h: 10 })).toBe(false);
    expect(overlaps({ x: 0, y: 0, w: 10, h: 10 }, { x: 0, y: 10, w: 10, h: 10 })).toBe(false);
  });
});

describe('moveBody', () => {
  const g = grid(['....', '....', '....', '####']);

  it('lands on solid ground', () => {
    const b = body(20, 20);
    b.vy = 5;
    let landed = false;
    for (let i = 0; i < 10; i++) landed = moveBody(g, b).landed || landed;
    expect(landed).toBe(true);
    expect(b.onGround).toBe(true);
    expect(b.y + b.h).toBe(48);
    expect(b.vy).toBe(0);
  });

  it('stays on the ground when standing still', () => {
    const b = body(20, 28);
    moveBody(g, b);
    expect(b.onGround).toBe(true);
  });

  it('stops at walls', () => {
    const w = grid(['..#.', '..#.', '..#.', '####']);
    const b = body(5, 20, 10, 20);
    b.vx = 30;
    const r = moveBody(w, b);
    expect(r.hitWall).toBe(true);
    expect(b.x + b.w).toBe(32);
  });

  it('treats map edges as walls only when asked', () => {
    const open = grid(['....', '####'], false);
    const b = body(2, 0, 10, 16);
    b.vx = -10;
    moveBody(open, b);
    expect(b.x).toBe(-8);
    const closed = grid(['....', '####'], true);
    const c = body(2, 0, 10, 16);
    c.vx = -10;
    moveBody(closed, c);
    expect(c.x).toBe(0);
  });

  it('hits ceilings', () => {
    const c = grid(['####', '....', '....', '####']);
    const b = body(20, 20, 10, 20);
    b.vy = -10;
    const r = moveBody(c, b);
    expect(r.hitCeiling).toBe(true);
    expect(b.y).toBe(16);
  });

  it('one-way platforms carry from above and let you jump through from below', () => {
    const p = grid(['....', '....', '====', '....', '####']);
    const fall = body(20, 10, 10, 20);
    fall.vy = 4;
    for (let i = 0; i < 5; i++) moveBody(p, fall);
    expect(fall.onGround).toBe(true);
    expect(fall.y + fall.h).toBe(32);

    const jump = body(20, 44, 10, 20);
    jump.vy = -6;
    moveBody(p, jump);
    expect(jump.y).toBe(38);
    expect(jump.onGround).toBe(false);
  });

  it('drops through one-way platforms on request', () => {
    const p = grid(['....', '....', '====', '....', '####']);
    const b = body(20, 12, 10, 20);
    b.vy = 2;
    moveBody(p, b, true);
    expect(b.onGround).toBe(false);
    expect(groundBelow(p, b, false)).toBe(false);
  });
});

describe('touchesKind', () => {
  it('finds hazards under a body', () => {
    const g = grid(['....', '.^..', '####']);
    expect(touchesKind(g, { x: 18, y: 18, w: 8, h: 8 }, Kind.Hazard)).toBe(true);
    expect(touchesKind(g, { x: 36, y: 18, w: 8, h: 8 }, Kind.Hazard)).toBe(false);
  });
});

describe('pushX (wind)', () => {
  it('pushes sideways and stops at walls without touching vertical state', () => {
    const g = grid(['....#', '....#', '#####']);
    const b = body(10, 12, 10, 20);
    b.vy = 1.5;
    b.onGround = true;
    expect(pushX(g, b, 5)).toBe(false);
    expect(b.x).toBe(15);
    expect(pushX(g, b, 100)).toBe(true);
    expect(b.x + b.w).toBe(64);
    expect(b.vy).toBe(1.5);
    expect(b.onGround).toBe(true);
    pushX(g, b, -200);
    expect(b.x).toBe(0);
  });
});

describe('firmlySupported', () => {
  const g = grid(['......', '......', '##....']);
  it('is true with both feet on the ground', () => {
    expect(firmlySupported(g, { x: 4, y: 32 - 12, w: 12, h: 12 })).toBe(true);
  });
  it('is false with a toe on the edge of a ledge', () => {
    expect(firmlySupported(g, { x: 24, y: 32 - 12, w: 12, h: 12 })).toBe(false);
  });
  it('is false in the air', () => {
    expect(firmlySupported(g, { x: 4, y: 0, w: 12, h: 12 })).toBe(false);
  });
});

describe('nearestFreeSpot (a saved spot inside rock after a map change)', () => {
  it('lifts Dagny out of a filled-in gap onto the rock', async () => {
    const { nearestFreeSpot } = await import('../src/game/sidescene');
    const g = grid(['......', '...###', '...###', '######']);
    // Feet on the bottom row inside the block at x 4.
    const spot = nearestFreeSpot(g, 4 * 16 + 2, 3 * 16 - 22, 10, 22)!;
    expect(spot).not.toBeNull();
    expect(spot.y + 22).toBeLessThanOrEqual(16);
    expect(nearestFreeSpot(g, 2, 0, 10, 14)).toBeNull();
  });
});
