import type { Enemy } from '../enemy';
import type { WorldApi } from '../types';
import type { Behavior, Sense } from './types';

/** Crouches, then leaps at Dagny. */
export const hopper: Behavior = {
  update(e: Enemy, world: WorldApi, s: Sense): void {
    const { dx, dist, sp } = s;
    if (e.onGround) {
      e.vx *= 0.8;
      e.frame = 0;
      if (--e.timer <= 0 && dist < 110) {
        e.facing = dx > 0 ? 1 : -1;
        e.vx = e.facing * sp * 1.3;
        e.vy = -4.2;
        e.timer = 50 + ((e.t * 7) % 40);
      }
    } else e.frame = 1;
    e.fall(world);
  },
};
