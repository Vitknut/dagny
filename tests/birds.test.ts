import { describe, expect, it } from 'vitest';
import { ENEMIES } from '../src/data/enemies';
import { Kind, type TileGrid } from '../src/engine/collision';
import { Enemy } from '../src/entities/enemy';
import { DIVE_WARNING } from '../src/entities/behaviors/diver';
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
    expect(warnFrames).toBeGreaterThanOrEqual(DIVE_WARNING - 1);
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

  it('take turns: only one bird winds up or dives at a time', () => {
    const wd = world({ x: 160, y: 160 }, []);
    const birds = [new Enemy(ENEMIES.kraka, 130, 64), new Enemy(ENEMIES.kraka, 150, 64), new Enemy(ENEMIES.mas, 170, 64)];
    wd.diveBusy = (self) => birds.some((b) => b !== self && (b.mode === 1 || b.mode === 3));
    let dives = 0;
    for (let i = 0; i < 1500; i++) {
      for (const b of birds) {
        const was = b.mode;
        b.update(wd);
        if (b.mode === 1 && was !== 1) dives++;
      }
      expect(birds.filter((b) => b.mode === 1 || b.mode === 3).length).toBeLessThanOrEqual(1);
    }
    expect(dives).toBeGreaterThan(3);
  });
});

describe('Stenknekten', () => {
  it('rocks back a little from a strike but stays on the ground', () => {
    const wd = world({ x: 40, y: 160 }, []);
    const s = new Enemy(ENEMIES.stenknekt, 100, 152);
    for (let i = 0; i < 30; i++) s.update(wd);
    const x0 = s.x;
    s.takeHit(1, s.x - 4, 'high', wd as never);
    let maxBack = 0;
    for (let i = 0; i < 20; i++) {
      s.update(wd);
      maxBack = Math.max(maxBack, s.x - x0);
      expect(s.vy).toBeGreaterThanOrEqual(0);
    }
    expect(maxBack).toBeGreaterThan(4);
    expect(maxBack).toBeLessThan(12);
  });
});
