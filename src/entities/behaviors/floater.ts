import type { Enemy } from '../enemy';
import type { WorldApi } from '../types';
import type { Behavior, Sense } from './types';

/** Floats in a slow wave and drifts towards Dagny. */
export const floater: Behavior = {
  update(e: Enemy, _world: WorldApi, s: Sense): void {
    const { dx, dist, sp } = s;
    e.facing = dx > 0 ? 1 : -1;
    if (dist < 160) e.vx += (Math.sign(dx) * sp - e.vx) * 0.02;
    else e.vx *= 0.95;
    e.y = e.baseY + Math.sin(e.t / 22) * 14;
    e.x += e.vx;
    e.frame = Math.floor(e.t / 8) % 2;
  },
};
