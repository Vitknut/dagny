import { Kind, type TileGrid } from '../../src/engine/collision';
import type { WorldApi } from '../../src/entities/types';

/**
 * A stand-in for a side-view room, for running creatures without a scene:
 * a floor, walls, optionally a pond (hazard) in the middle, and Dagny
 * standing still at `player`.
 */
export function stubWorld(opts: { w?: number; h?: number; pond?: [number, number]; player?: { x: number; y: number }; lit?: boolean } = {}): WorldApi & { shots: number; spawned: number } {
  const w = opts.w ?? 30;
  const h = opts.h ?? 12;
  const kinds = new Uint8Array(w * h);
  for (let x = 0; x < w; x++) kinds[(h - 1) * w + x] = Kind.Solid;
  if (opts.pond) for (let x = opts.pond[0]; x < opts.pond[1]; x++) kinds[(h - 2) * w + x] = Kind.Hazard;
  const grid: TileGrid = { w, h, kinds, wallLeft: true, wallRight: true };
  const player = opts.player ?? { x: 60, y: (h - 1) * 16 - 11 };
  const world = {
    shots: 0,
    spawned: 0,
    grid,
    frame: 0,
    playerCenter: () => player,
    playerBox: () => ({ x: player.x - 5, y: player.y - 11, w: 10, h: 22 }),
    playerDucking: () => false,
    spawnProjectile: () => {
      world.shots++;
    },
    puff: () => undefined,
    sparks: () => undefined,
    sfx: () => undefined,
    shake: () => undefined,
    gust: () => undefined,
    spawnEnemy: () => {
      world.spawned++;
      return world.spawned < 3;
    },
    minions: () => 0,
    lit: () => !!opts.lit,
  };
  return world;
}
