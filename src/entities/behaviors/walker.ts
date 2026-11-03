import { isSolidAt } from '../../engine/collision';
import { isSolidOrPlatformBelow } from './common';
import type { Enemy } from '../enemy';
import type { WorldApi } from '../types';
import type { Behavior, Sense } from './types';

/** Walks back and forth, turning at walls and ledges. */
export const walker: Behavior = {
  update(e: Enemy, world: WorldApi, s: Sense): void {
    const { sp } = s;
    if (e.onGround) {
      if (Math.abs(e.vx) > sp + 0.1) e.vx *= 0.85;
      else e.vx = e.facing * sp;
      // Turn at walls and ledges.
      const aheadX = e.facing === 1 ? e.x + e.w + 1 : e.x - 1;
      if (isSolidAt(world.grid, aheadX, e.y + e.h / 2) || !isSolidOrPlatformBelow(world, aheadX, e.y + e.h + 2)) {
        e.facing = e.facing === 1 ? -1 : 1;
        e.vx = 0;
      }
    }
    e.frame = Math.floor(e.t / 10) % 2;
    e.fall(world);
  },
};
