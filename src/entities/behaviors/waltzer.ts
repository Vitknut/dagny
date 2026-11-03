import type { Enemy } from '../enemy';
import type { WorldApi } from '../types';
import type { Behavior, Sense } from './types';

/** Dansgasten: waltzes in a figure of eight, drifting towards Dagny. */
export const waltzer: Behavior = {
  update(e: Enemy, _world: WorldApi, s: Sense): void {
    const { dx, dist, sp } = s;
    // Dansgasten: waltzes in a figure of eight, drifting towards Dagny.
    if (e.t === 1) e.cx = e.x;
    e.cx += Math.sign(dx) * sp * (dist > 24 ? 0.35 : 0);
    e.ang += 0.045;
    e.x = e.cx + Math.cos(e.ang) * 22;
    e.y = e.baseY - 6 + Math.sin(e.ang * 2) * 10;
    e.facing = Math.cos(e.ang + Math.PI / 2) > 0 ? 1 : -1;
    e.alpha = 0.75 + Math.sin(e.t / 15) * 0.15;
    e.frame = Math.floor(e.t / 12) % 2;
  },
};
