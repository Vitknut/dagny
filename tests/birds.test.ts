import { describe, expect, it } from 'vitest';
import { ENEMIES } from '../src/data/enemies';
import { Kind, type TileGrid } from '../src/engine/collision';
import { Enemy } from '../src/entities/enemy';
import type { WorldApi } from '../src/entities/types';

function world(player: { x: number; y: number }, sounds: string[]): WorldApi {
  const w = 30;
  const h = 12;
  const kinds = new Uint8Array(w * h);
  for (let x = 0; x < w; x++) kinds[(h - 1) * w + x] = Kind.Solid;
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
    sfx: (id) => sounds.push(id),
    shake: () => undefined,
    gust: () => undefined,
    spawnEnemy: () => false,
    minions: () => 0,
    lit: () => false,
  };
}

describe('birds (diving creatures)', () => {
  it('shriek and show a warning before every dive', () => {
    const sounds: string[] = [];
    const wd = world({ x: 160, y: 160 }, sounds);
    const crow = new Enemy(ENEMIES.kraka, 140, 64);
    let warned = false;
    let warnFrames = 0;
    for (let i = 0; i < 400 && !crow.diving; i++) {
      crow.update(wd);
      if (crow.warn) {
        warned = true;
        warnFrames++;
      }
    }
    expect(crow.diving).toBe(true);
    expect(warned).toBe(true);
    expect(warnFrames).toBeGreaterThanOrEqual(25);
    expect(sounds).toContain('screech');
  });

  it('a shield parry leaves the bird dazed (no harm, easy to hit)', () => {
    const wd = world({ x: 160, y: 160 }, []);
    const crow = new Enemy(ENEMIES.kraka, 140, 64);
    for (let i = 0; i < 400 && !crow.diving; i++) crow.update(wd);
    crow.parry(160);
    expect(crow.diving).toBe(false);
    expect(crow.stun).toBeGreaterThan(30);
    crow.update(wd);
    expect(crow.diving).toBe(false);
  });
});
