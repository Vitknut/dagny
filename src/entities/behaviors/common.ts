import { groundBelow, isSolidAt, moveBody } from '../../engine/collision';
import type { Enemy } from '../enemy';
import type { WorldApi } from '../types';

/** Ground or a platform under the point (x, y). */
export function isSolidOrPlatformBelow(world: WorldApi, x: number, y: number): boolean {
  return groundBelow(world.grid, { x: x - 0.5, y: y - 3, w: 1, h: 1 }) || isSolidAt(world.grid, x, y);
}

/** Moves a charging boss one step and reports whether it hit a wall. */
export function moveBodyPreview(e: Enemy, world: WorldApi): boolean {
  e.vy = Math.min(5, e.vy + 0.35);
  const res = moveBody(world.grid, e);
  return res.hitWall;
}
