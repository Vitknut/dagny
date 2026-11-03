import type { Enemy } from '../enemy';
import type { WorldApi } from '../types';
import type { Behavior, Sense } from './types';

/**
 * Skogsrået. Walks towards Dagny with her lovely face turned to her. Dashes past and stands
 * with her hollow back turned for a moment – the only time she can be hurt.
 * Calls roots up from the ground (dirt sprays first) and throws pine cones.
 */
export const skogsra: Behavior = {
  update(e: Enemy, world: WorldApi, s: Sense): void {
    const { p, dx } = s;
    const b = e.boss!;
    if (!e.awake) {
      e.homeY = e.y;
      e.frame = 0;
      return;
    }
    if (e.phase === 0 && e.hp <= e.maxHp * b.phases[1].atHpFraction) {
      e.phase = 1;
      e.sprite = b.phases[1].sprite;
      world.sfx('roar');
      world.shake(24, 2);
    }
    const ph = b.phases[e.phase];
    const gw = world.grid.w * 16;
    const minX = 18;
    const maxX = gw - 18 - e.w;
    const floorY = e.homeY + e.h;
    switch (e.mode) {
      case 0: // stroll towards Dagny, face first
        e.facing = dx > 0 ? 1 : -1;
        e.frame = 0;
        if (Math.abs(dx) > 30) e.x = Math.max(minX, Math.min(maxX, e.x + e.facing * ph.speed * 0.35));
        if (--e.timer <= 0) {
          const c = e.cycle++ % 3;
          e.mode = c === 0 ? 1 : c === 1 ? 3 : 4;
          e.timer = c === 0 ? 24 : 40;
        }
        break;
      case 1: // wind up, then dash past Dagny
        e.frame = 1;
        if (--e.timer <= 0) {
          e.mode = 5;
          e.vx = e.facing * ph.speed * 2.2;
          world.sfx('roar');
        }
        break;
      case 5: // dashing
        e.frame = 2;
        e.x += e.vx;
        if (e.x <= minX || e.x >= maxX) {
          e.x = Math.max(minX, Math.min(maxX, e.x));
          // Stop with her back to the room.
          e.facing = e.x <= minX ? -1 : 1;
          e.mode = 2;
          e.timer = e.phase === 1 ? 55 : 75;
          world.shake(6, 1);
        }
        break;
      case 2: // recovering, back turned – strike now
        e.frame = 0;
        if (--e.timer <= 0) {
          e.mode = 0;
          e.timer = Math.round(ph.attackEvery * 60);
        }
        break;
      case 3: // roots burst up where the dirt sprays
        e.facing = dx > 0 ? 1 : -1;
        e.frame = 1;
        if (e.timer === 30) {
          const n = e.phase === 1 ? 5 : 3;
          for (let i = 0; i < n; i++) {
            const x = Math.max(8, Math.min(gw - 18, p.x - 5 + (i - (n - 1) / 2) * 30));
            world.spawnProjectile({
              x, y: floorY - 24, vx: 0, vy: 0, w: 10, h: 24, sprite: 'root',
              damage: 2, fromPlayer: false, life: 36, ghost: true, delay: 40 + i * 8,
            });
          }
          world.sfx('magic');
        }
        if (--e.timer <= 0) {
          e.mode = 0;
          e.timer = Math.round(ph.attackEvery * 60);
        }
        break;
      case 4: // pine cones in arcs
        e.facing = dx > 0 ? 1 : -1;
        e.frame = 1;
        if (e.timer === 20) {
          for (let i = 0; i < 3; i++) {
            const tx = p.x + (i - 1) * 20;
            const flight = 50;
            world.spawnProjectile({
              x: e.x + e.w / 2, y: e.y + 6, vx: (tx - e.x - e.w / 2) / flight, vy: -3.6 - i * 0.3,
              w: 6, h: 8, sprite: 'kotte', damage: 2, fromPlayer: false, life: 150, gravity: 0.14,
            });
          }
          world.sfx('sword');
        }
        if (--e.timer <= 0) {
          e.mode = 0;
          e.timer = Math.round(ph.attackEvery * 60);
        }
        break;
    }
  },
};
