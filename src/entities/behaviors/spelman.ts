import type { Enemy } from '../enemy';
import type { WorldApi } from '../types';
import type { Behavior, Sense } from './types';

/**
 * Spelmannen. Plays on the stage and sends notes across the floor (duck, jump or block them),
 * then leaps down and dances across the floor – the moment to strike.
 * Phase two: he is Näcken; faster tunes, notes that rain down, hopping dances.
 */
export const spelman: Behavior = {
  update(e: Enemy, world: WorldApi, s: Sense): void {
    const { p, dx } = s;
    const b = e.boss!;
    if (!e.awake) {
      e.homeY = e.y;
      e.baseY = e.x;
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
    const floorY = (world.grid.h - 2) * 16;
    const stageX = e.baseY;
    const note = (x: number, y: number, vx: number, vy: number, gravity = 0): void =>
      world.spawnProjectile({ x, y, vx, vy, w: 8, h: 8, sprite: 'noteShot', damage: 2, fromPlayer: false, life: 220, gravity, ghost: true });
    switch (e.mode) {
      case 0: { // play on the stage
        e.facing = -1;
        e.frame = Math.floor(e.t / 12) % 2;
        if (--e.timer <= 0) {
          e.cycle++;
          const lo = floorY - 7;
          const hi = floorY - 21;
          const sx = e.x - 6;
          if (e.cycle % 3 === 1) {
            // A phrase along the floor, alternating high and low.
            for (let i = 0; i < (e.phase === 1 ? 6 : 4); i++) {
              const high = i % 2 === 0;
              world.spawnProjectile({
                x: sx + i * 18, y: high ? hi : lo, vx: -1.7, vy: 0, w: 8, h: 8,
                sprite: 'noteShot', damage: 2, fromPlayer: false, life: 260, ghost: true, delay: i * 14,
              });
            }
          } else if (e.cycle % 3 === 2) {
            // Notes tossed in arcs that fall where Dagny stands.
            const n = e.phase === 1 ? 5 : 3;
            for (let i = 0; i < n; i++) {
              const tx = p.x + (i - (n - 1) / 2) * 26;
              const flight = 60;
              note(e.x, e.y + 6, (tx - e.x) / flight, -3.6 - i * 0.2, 0.12);
            }
          } else {
            // Leap down and dance.
            e.mode = 1;
            e.vx = (Math.max(32, Math.min(gw - 64, p.x)) - e.x) / 40;
            e.vy = -6;
            world.sfx('roar');
            break;
          }
          world.sfx('magic');
          e.timer = Math.round(ph.attackEvery * 60);
        }
        break;
      }
      case 1: // leap to the floor
      case 3: // leap back to the stage
        e.frame = 2;
        e.x += e.vx;
        e.y += e.vy;
        e.vy += 0.3;
        if (e.vy > 0) {
          const target = e.mode === 1 ? floorY - e.h : e.homeY;
          if (e.y >= target) {
            e.y = target;
            if (e.mode === 1) {
              e.mode = 2;
              e.timer = e.phase === 1 ? 170 : 140;
              e.facing = dx > 0 ? 1 : -1;
              world.shake(6, 1);
            } else {
              e.mode = 0;
              e.x = stageX;
              e.timer = 40;
            }
          }
        }
        break;
      case 2: { // dance across the floor
        e.frame = Math.floor(e.t / 8) % 2 === 0 ? 2 : 0;
        e.x += e.facing * ph.speed;
        if (e.x < 20) { e.x = 20; e.facing = 1; }
        if (e.x > stageX - 30) { e.x = stageX - 30; e.facing = -1; }
        if (e.phase === 1 && e.t % 50 === 0 && e.y >= floorY - e.h) e.vy = -3.6;
        if (e.vy !== 0 || e.y < floorY - e.h) {
          e.y += e.vy;
          e.vy += 0.3;
          if (e.y >= floorY - e.h) { e.y = floorY - e.h; e.vy = 0; }
        }
        if (e.t % 30 === 0) world.sfx('step');
        if (--e.timer <= 0) {
          e.mode = 3;
          e.vx = (stageX - e.x) / 40;
          e.vy = -6.5;
        }
        break;
      }
    }
  },
};
