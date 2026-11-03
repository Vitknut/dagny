import type { Enemy } from '../enemy';
import type { WorldApi } from '../types';
import type { Behavior, Sense } from './types';

/** Dimvätten: drifts close, fades into the fog and shows up beside Dagny. */
export const blinker: Behavior = {
  update(e: Enemy, world: WorldApi, s: Sense): void {
    const { p, dx, sp } = s;
    // Dimvätten: drifts close, fades into the fog and shows up beside Dagny.
    e.facing = dx > 0 ? 1 : -1;
    e.frame = Math.floor(e.t / 10) % 2;
    // In Lyse's light there is no fog to hide in: it stays where it is, or comes back out.
    if (world.lit() && e.mode === 1) e.mode = 2;
    if (e.mode === 0) {
      e.x += Math.sign(dx) * sp * 0.5;
      e.y += (p.y - 8 - (e.y + e.h / 2)) * 0.01;
      if (--e.timer <= 0 && !world.lit()) e.mode = 1;
    } else if (e.mode === 1) {
      e.alpha = Math.max(0, e.alpha - 0.04);
      e.untouchable = e.alpha < 0.35;
      if (e.alpha <= 0) {
        const side = e.t % 2 === 0 ? 1 : -1;
        e.x = p.x + side * 44 - e.w / 2;
        e.y = p.y - 8;
        e.clampX(world);
        e.mode = 2;
      }
    } else {
      e.alpha = Math.min(1, e.alpha + 0.05);
      e.untouchable = e.alpha < 0.35;
      if (e.alpha >= 1) {
        e.mode = 0;
        e.timer = 120 + ((e.id * 31) % 60);
      }
    }
  },
};
