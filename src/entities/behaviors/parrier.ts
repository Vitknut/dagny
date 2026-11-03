import type { Enemy, HitHeight } from '../enemy';
import type { WorldApi } from '../types';
import type { Behavior, Sense } from './types';

/**
 * Tomtenisse-krigare: a fencer. Copies Dagny’s stance and parries strikes at
 * that height, keeps its distance, and now and then makes a short thrust
 * (open while thrusting). It never rushes her: beating it is about changing
 * height faster than it can follow, or striking into the thrust.
 */
export const parrier: Behavior = {
  update(e: Enemy, world: WorldApi, s: Sense): void {
    const { dx, dist, sp } = s;
    e.facing = dx > 0 ? 1 : -1;
    // Match the player's stance after a short reaction time.
    const want: 'high' | 'low' = world.playerDucking() ? 'low' : 'high';
    if (want !== e.guard) {
      if (++e.guardDelay > 22) {
        e.guard = want;
        e.guardDelay = 0;
      }
    } else e.guardDelay = 0;
    if (e.mode === 2) {
      // Thrust: a short step in with the blade, guard open.
      if (--e.timer <= 0) {
        e.mode = 0;
        e.timer = 70 + ((e.t * 13) % 50);
      }
      e.vx *= 0.9;
      e.frame = 2;
    } else {
      e.frame = e.guard === 'high' ? 0 : 1;
      if (e.onGround) {
        if (dist > 30 && dist < 150) e.vx = Math.sign(dx) * sp;
        else if (dist < 22) e.vx = -Math.sign(dx) * sp * 0.6;
        else e.vx *= 0.8;
      }
      if (--e.timer <= 0 && dist < 30) {
        e.mode = 2;
        e.timer = 22;
        e.vx = Math.sign(dx) * 1.6;
      }
    }
    e.fall(world);
  },
  /** Parries strikes at the height it guards, except while thrusting. */
  blocks(e: Enemy, height: HitHeight) {
    return e.mode !== 2 && (height === 'high' || height === 'low') && height === e.guard ? { push: 1.2, iframes: 10 } : null;
  },
};
