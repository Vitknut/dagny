import type { Enemy } from '../enemy';
import type { WorldApi } from '../types';
import type { Behavior, Sense } from './types';

/** Runs at Dagny with momentum and leaps when close. */
export const wolf: Behavior = {
  update(e: Enemy, world: WorldApi, s: Sense): void {
    const { dx, dist, sp } = s;
    if (e.onGround) {
      const want = Math.sign(dx) || e.facing;
      e.vx += want * 0.12;
      if (Math.abs(e.vx) > sp) e.vx = Math.sign(e.vx) * sp;
      e.facing = e.vx > 0 ? 1 : -1;
      if (--e.timer <= 0 && dist < 70) {
        e.vy = -3.8;
        e.timer = 80;
      }
    }
    e.frame = Math.floor(e.t / 5) % 2;
    e.fall(world);
  },
};
