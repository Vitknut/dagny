import { describe, expect, it } from 'vitest';
import { AREAS } from '../src/data/areas';
import { ENEMIES } from '../src/data/enemies';
import { ENEMY_CHARS } from '../src/data/legend';
import { Kind, type TileGrid } from '../src/engine/collision';
import { Enemy } from '../src/entities/enemy';
import type { WorldApi } from '../src/entities/types';
import { playthrough } from '../src/tools/playthrough';

function world(lit: boolean): WorldApi {
  const w = 30;
  const h = 12;
  const kinds = new Uint8Array(w * h);
  for (let x = 0; x < w; x++) kinds[(h - 1) * w + x] = Kind.Solid;
  const grid: TileGrid = { w, h, kinds, wallLeft: true, wallRight: true };
  const player = { x: 60, y: 165 };
  return {
    grid, frame: 0,
    playerCenter: () => player,
    playerBox: () => ({ x: 55, y: 154, w: 10, h: 22 }),
    playerDucking: () => false,
    spawnProjectile: () => undefined, puff: () => undefined, sparks: () => undefined, sfx: () => undefined,
    shake: () => undefined, gust: () => undefined, spawnEnemy: () => false, minions: () => 0,
    lit: () => lit,
  };
}

describe('creatures with their own answer', () => {
  it('Grytvätten: the blade glances off its pot from the side; a thrust from above bites', () => {
    const wd = world(false);
    const e = new Enemy(ENEMIES.grytvatte, 100, 176);
    expect(e.takeHit(5, 80, 'high', wd)).toBe('blocked');
    expect(e.takeHit(5, 80, 'fire', wd)).toBe('none'); // still shrugging off the last blow
    e.iframes = 0;
    expect(e.takeHit(5, 80, 'low', wd)).toBe('blocked');
    e.iframes = 0;
    expect(e.takeHit(5, 80, 'down', wd)).not.toBe('blocked');
    expect(e.hp).toBeLessThan(ENEMIES.grytvatte.hp);
  });

  it('Bjäran: only fire bites; Åska and the blade do not', () => {
    const wd = world(false);
    const e = new Enemy(ENEMIES.bjara, 100, 176);
    for (const h of ['high', 'low', 'down', 'up', 'magic'] as const) {
      e.iframes = 0;
      expect(e.takeHit(5, 80, h, wd), h).toBe('blocked');
    }
    e.iframes = 0;
    expect(e.takeHit(5, 80, 'fire', wd)).not.toBe('blocked');
  });

  it('Maran: unseen and not to be struck in the dark, but she still hurts; in Lyse she is struck like any other', () => {
    const dark = world(false);
    const e = new Enemy(ENEMIES.mara, 100, 120);
    e.update(dark);
    expect(e.veiled).toBe(true);
    expect(e.harmful).toBe(true);
    expect(e.takeHit(5, 80, 'high', dark)).toBe('none');
    const lit = world(true);
    e.update(lit);
    expect(e.veiled).toBe(false);
    expect(e.takeHit(5, 80, 'high', lit)).not.toBe('none');
  });

  it('each stands only where Dagny already has its answer', () => {
    const run = playthrough();
    const learned = (kind: 'spell' | 'skill', what: string): number => run.steps.findIndex((s) => s.kind === kind && s.what === what);
    const answer: Record<string, number> = {
      grytvatte: learned('skill', 'nedatstot'),
      bjara: learned('spell', 'eld'),
      mara: learned('spell', 'lyse'),
    };
    for (const a of Object.values(AREAS)) {
      for (const row of a.tiles) {
        for (const ch of row) {
          const id = ENEMY_CHARS[ch];
          if (!id || !(id in answer)) continue;
          const first = run.steps.findIndex((s) => s.kind === 'area' && s.what === a.id);
          expect(answer[id], `${id}: answer is learned`).toBeGreaterThanOrEqual(0);
          expect(answer[id], `${id} in ${a.id}`).toBeLessThan(first);
          expect(a.sealed, `${id} never in a room that only opens when every creature is beaten`).toBeFalsy();
        }
      }
    }
    for (const id of Object.keys(answer)) expect(Object.values(AREAS).some((a) => a.tiles.some((r) => [...r].some((c) => ENEMY_CHARS[c] === id))), id).toBe(true);
  });
});
