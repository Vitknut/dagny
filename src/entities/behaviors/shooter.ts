import type { Enemy } from '../enemy';
import type { WorldApi } from '../types';
import type { Behavior, Sense } from './types';

/** Stands and shoots, alternating high and low. */
export const shooter: Behavior = {
  update(e: Enemy, world: WorldApi, s: Sense): void {
    const { dx, dist } = s;
    e.facing = dx > 0 ? 1 : -1;
    e.frame = e.timer < 12 ? 1 : 0;
    if (--e.timer <= 0) {
      if (dist < 200) {
        const high = e.shotHigh;
        e.shotHigh = !e.shotHigh;
        world.spawnProjectile({
          x: e.facing === 1 ? e.x + e.w : e.x - 6,
          y: high ? e.y + 1 : e.y + e.h - 7,
          vx: e.facing * 1.6,
          vy: 0,
          w: 6,
          h: 6,
          sprite: e.def.shot ?? 'droplet',
          damage: e.def.damage,
          fromPlayer: false,
          life: 180,
          ghost: !!e.def.shot,
        });
        world.sfx(e.def.shot ? 'magic' : 'water');
      }
      e.timer = 95;
    }
    e.fall(world);
  },
};
