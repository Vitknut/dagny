import type { Enemy, HitHeight } from '../enemy';
import type { WorldApi } from '../types';
import type { Behavior, Sense } from './types';

/**
 * Skuggan: keeps a sword's length away and copies Dagny's guard. She winds
 * up (raised blade = a cut at the head, crouch = a cut along the floor),
 * lunges when Dagny is close, jumps when Dagny jumps, and after each attack
 * stands open for a moment.
 * Modes: 0 stalk, 1 wind-up, 2 lunge, 3 open.
 */
export const shadow: Behavior = {
  update(e: Enemy, world: WorldApi, s: Sense): void {
    const { dx, dist } = s;
    const sp = e.def.speed;
    const dir = dx > 0 ? 1 : -1;
    if (e.mode !== 2) e.facing = dir;
    const want: 'high' | 'low' = world.playerDucking() ? 'low' : 'high';
    if (want !== e.guard) {
      if (++e.guardDelay > 9) {
        e.guard = want;
        e.guardDelay = 0;
      }
    } else e.guardDelay = 0;
    const pb = world.playerBox();
    const dagnyUp = pb.y + pb.h < e.y + e.h - 10;
    switch (e.mode) {
      case 0: {
        if (e.onGround) {
          if (dagnyUp && dist < 70 && e.t % 4 === 0) e.vy = -4.4;
          else if (dist > 40) e.vx = dir * sp;
          else if (dist < 24) e.vx = -dir * sp * 0.8;
          else e.vx *= 0.8;
        }
        e.frame = !e.onGround ? 5 : e.guard === 'high' ? 0 : 6;
        if (--e.timer <= 0 && e.onGround && dist < 140) {
          e.mode = 1;
          e.timer = 18;
          // Mostly along the floor, sometimes at the head – the stance shows which.
          e.shotHigh = (e.t * 7) % 5 < 2;
        }
        break;
      }
      case 1: {
        e.vx *= 0.7;
        e.frame = e.shotHigh ? 9 : 6;
        if (--e.timer <= 0) {
          if (dist < 36) {
            e.mode = 2;
            e.timer = 22;
            e.vx = dir * 2.8;
          } else {
            world.spawnProjectile({
              x: e.facing === 1 ? e.x + e.w : e.x - 10,
              y: e.shotHigh ? e.y + 2 : e.y + e.h - 7,
              vx: e.facing * 2.3,
              vy: 0,
              w: 10,
              h: 6,
              sprite: 'skuggslag',
              damage: e.damage,
              fromPlayer: false,
              life: 90,
            });
            world.sfx('sword');
            e.mode = 3;
            e.timer = 34;
          }
        }
        break;
      }
      case 2: {
        e.frame = e.shotHigh ? 7 : 8;
        if (--e.timer <= 0) {
          e.mode = 3;
          e.timer = 30;
        }
        break;
      }
      default: {
        // Open: blade lowered, catching her breath.
        e.vx *= 0.85;
        e.frame = 1;
        if (--e.timer <= 0) {
          e.mode = 0;
          e.timer = 45 + ((e.t * 17) % 40);
        }
      }
    }
    e.fall(world);
  },
  /** Guards where Dagny guards – only a thrust from above or below, or a strike while she is open, gets through. */
  blocks(e: Enemy, height: HitHeight) {
    return (e.mode === 0 || e.mode === 1) && (height === 'high' || height === 'low') && height === e.guard ? { push: 1.6, iframes: 8 } : null;
  },
};
