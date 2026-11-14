import type { Enemy } from '../enemy';
import type { WorldApi } from '../types';
import type { Behavior, Sense } from './types';

/** Slow and heavy: plods straight at Dagny. */
export const tank: Behavior = {
  update(e: Enemy, world: WorldApi, s: Sense): void {
    const { dx, dist, sp } = s;
    e.facing = dx > 0 ? 1 : -1;
    if (!e.onGround) {
      // keep the momentum in the air
    } else if (Math.abs(e.vx) > sp + 0.1) e.vx *= 0.8; // rocked back by a strike
    else e.vx = dist > 6 && dist < 200 ? Math.sign(dx) * sp : 0;
    e.frame = Math.floor(e.t / 18) % 2;
    e.fall(world);
  },
};
