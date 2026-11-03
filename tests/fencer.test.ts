import { describe, expect, it } from 'vitest';
import { ENEMIES } from '../src/data/enemies';
import { Kind, type TileGrid } from '../src/engine/collision';
import { Enemy } from '../src/entities/enemy';
import type { WorldApi } from '../src/entities/types';

/** A flat floor with Dagny standing at x = 100. */
function world(): WorldApi {
  const w = 40;
  const h = 12;
  const kinds = new Uint8Array(w * h);
  for (let x = 0; x < w; x++) kinds[(h - 1) * w + x] = Kind.Solid;
  const grid: TileGrid = { w, h, kinds, wallLeft: true, wallRight: true };
  const player = { x: 100, y: 165 };
  return {
    grid,
    frame: 0,
    playerCenter: () => player,
    playerBox: () => ({ x: player.x - 5, y: player.y - 11, w: 10, h: 22 }),
    playerDucking: () => false,
    spawnProjectile: () => undefined,
    puff: () => undefined,
    sparks: () => undefined,
    sfx: () => undefined,
    shake: () => undefined,
    gust: () => undefined,
    spawnEnemy: () => false,
    minions: () => 0,
    lit: () => false,
  };
}

describe('the tomtenisse fences instead of rushing', () => {
  it('never moves faster than a short thrust, and only thrusts up close', () => {
    const wd = world();
    const e = new Enemy(ENEMIES.nisse, 220, 176);
    let fastest = 0;
    for (let i = 0; i < 600; i++) {
      e.update(wd);
      fastest = Math.max(fastest, Math.abs(e.vx));
      const dist = Math.abs(e.x + e.w / 2 - 100);
      if (e.mode === 2) expect(dist).toBeLessThan(48);
    }
    expect(fastest).toBeLessThanOrEqual(1.6);
  });

  it('is open while it thrusts', () => {
    const wd = world();
    const e = new Enemy(ENEMIES.nisse, 120, 176);
    for (let i = 0; i < 400 && e.mode !== 2; i++) e.update(wd);
    expect(e.mode).toBe(2);
    expect(e.takeHit(3, 100, 'high', wd)).toBe('hit');
  });
});
