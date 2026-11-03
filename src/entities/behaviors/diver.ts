import { isSolidAt } from '../../engine/collision';
import type { Enemy } from '../enemy';
import type { WorldApi } from '../types';
import type { Behavior, Sense } from './types';

/** Birds: hover, shriek and rise (the warning), dive at the locked aim, then climb back. A shield parry or a crash leaves them dazed. */
export const diver: Behavior = {
  update(e: Enemy, world: WorldApi, s: Sense): void {
    const { p, cx, cy, dx, dist, sp } = s;
    // mode 0 hover, 3 wind-up (the warning), 1 dive, 4 dazed, 2 climb back.
    if (e.mode === 0) {
      e.facing = dx > 0 ? 1 : -1;
      e.x += Math.sign(dx) * 0.4 * (dist > 10 ? 1 : 0);
      e.y = e.baseY + Math.sin(e.t / 12) * 3;
      e.frame = Math.floor(e.t / 7) % 2;
      if (--e.timer <= 0 && dist < 90 && p.y > cy) {
        // Stop, rise a little and shriek: the dive comes in half a second.
        e.mode = 3;
        e.timer = 30;
        world.sfx('screech');
      }
    } else if (e.mode === 3) {
      e.facing = dx > 0 ? 1 : -1;
      e.y -= 0.35;
      e.x += Math.sin(e.t * 1.7) * 0.8;
      e.frame = Math.floor(e.t / 3) % 2;
      e.warn = true;
      if (--e.timer <= 0) {
        // The aim is locked now: step aside, or turn the shield to it.
        e.warn = false;
        e.mode = 1;
        const ang = Math.atan2(p.y - cy, dx);
        e.vx = Math.cos(ang) * sp * 1.6;
        e.vy = Math.sin(ang) * sp * 1.6;
      }
    } else if (e.mode === 1) {
      e.frame = 2;
      e.x += e.vx;
      e.y += e.vy;
      if (isSolidAt(world.grid, cx, e.y + e.h)) {
        // Crashed into the ground: dazed for a moment.
        e.mode = 4;
        e.stun = 55;
      } else if (e.y > e.baseY + 90 || e.t % 200 === 0) e.mode = 2;
    } else if (e.mode === 4) {
      e.frame = 0;
      e.y += Math.sin(e.t / 4) * 0.3;
      if (--e.stun <= 0) e.mode = 2;
    } else {
      e.frame = Math.floor(e.t / 5) % 2;
      e.y -= 1.2;
      e.x += e.vx * 0.3;
      if (e.y <= e.baseY) {
        e.y = e.baseY;
        e.mode = 0;
        e.timer = 60;
      }
    }
  },
};
