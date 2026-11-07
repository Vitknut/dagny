import { describe, expect, it } from 'vitest';
import { BOSSES } from '../src/data/enemies';
import { Kind, type TileGrid } from '../src/engine/collision';
import { Enemy } from '../src/entities/enemy';
import type { WorldApi } from '../src/entities/types';

function world(player: { x: number; y: number }): WorldApi {
  const w = 30;
  const h = 12;
  const kinds = new Uint8Array(w * h);
  for (let x = 0; x < w; x++) kinds[(h - 1) * w + x] = Kind.Solid;
  // The pond: hazard tiles in the middle of the row above the floor.
  for (let x = 12; x < 18; x++) kinds[(h - 2) * w + x] = Kind.Hazard;
  const grid: TileGrid = { w, h, kinds, wallLeft: true, wallRight: true };
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

describe('Bäckahästen', () => {
  it('in phase two still leaps out onto the bank, where it can be struck', () => {
    const wd = world({ x: 60, y: 160 });
    const horse = new Enemy(BOSSES.backahasten, 240, 160);
    horse.update(wd);
    horse.awake = true;
    horse.hp = Math.floor(horse.maxHp * 0.4);
    let leaps = 0;
    let spits = 0;
    let openFrames = 0;
    for (let i = 0; i < 3000; i++) {
      const was = horse.mode;
      horse.update(wd);
      if (horse.mode === 1 && was !== 1) leaps++;
      if (horse.mode === 4 && was !== 4) spits++;
      if (!horse.untouchable) openFrames++;
    }
    expect(horse.phase).toBe(1);
    expect(spits).toBeGreaterThan(2);
    expect(leaps).toBeGreaterThan(2);
    expect(openFrames).toBeGreaterThan(600);
  });
});
