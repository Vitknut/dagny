import { Kind } from '../../engine/collision';
import type { Enemy } from '../enemy';
import type { WorldApi } from '../types';
import type { Behavior, Sense } from './types';

/**
 * Bäckahästen. Lives in the pond. Leaps onto the bank on Dagny's side, gallops, leaps back.
 * Phase two: spits water from the surface and sends waves along the ground.
 */
export const backahast: Behavior = {
  update(e: Enemy, world: WorldApi, s: Sense): void {
    const { p, dx } = s;
    const b = e.boss!;
    if (!e.awake) {
      e.homeY = e.y;
      e.alpha = 0;
      e.untouchable = true;
      return;
    }
    if (!e.pool) {
      e.pool = findPool(world);
      e.mode = 0;
      e.timer = 30;
    }
    const [px0, px1] = e.pool;
    const poolMid = (px0 + px1) / 2 - e.w / 2;
    const gw = world.grid.w * 16;
    if (e.phase === 0 && e.hp <= e.maxHp * b.phases[1].atHpFraction) {
      e.phase = 1;
      e.sprite = b.phases[1].sprite;
      world.sfx('roar');
      world.shake(30, 3);
    }
    const ph = b.phases[e.phase];
    const splash = (): void => {
      world.puff(e.x + e.w / 2, e.homeY + e.h, 'mist');
      world.sfx('water');
    };
    switch (e.mode) {
      case 0: // under water
        e.alpha = 0;
        e.untouchable = true;
        e.x = poolMid;
        e.y = e.homeY + 20;
        if (--e.timer <= 0) {
          if (e.phase === 1 && e.t % 2 === 0) {
            e.mode = 4;
            e.timer = 90;
            e.y = e.homeY + 8;
            splash();
          } else {
            e.y = e.homeY;
            splash();
            const leftSide = p.x < (px0 + px1) / 2;
            const target = leftSide ? Math.max(20, px0 - e.w - 12) : Math.min(gw - 20 - e.w, px1 + 12);
            leapTo(e, target);
            world.sfx('roar');
          }
        }
        break;
      case 4: { // phase two: spit water from the surface
        e.alpha = 1;
        e.untouchable = true;
        e.frame = 0;
        e.facing = dx > 0 ? 1 : -1;
        if (e.timer % 30 === 0) {
          const high = (e.timer / 30) % 2 === 1;
          const sx = e.facing === 1 ? e.x + e.w : e.x - 6;
          world.spawnProjectile({
            x: sx, y: e.y + 2,
            vx: e.facing * 2, vy: ((high ? p.y - 8 : p.y + 6) - (e.y + 2)) / 60,
            w: 6, h: 6, sprite: 'droplet', damage: 2, fromPlayer: false, life: 150,
          });
          world.sfx('water');
        }
        if (--e.timer <= 0) {
          e.mode = 0;
          e.timer = 10;
        }
        break;
      }
      case 1: // leap out onto a bank
      case 3: // leap back into the pond
        e.frame = 2;
        e.x += e.vx;
        e.y += e.vy;
        e.vy += 0.3;
        e.facing = e.vx >= 0 ? 1 : -1;
        if (e.vy > 0 && e.y >= e.homeY) {
          e.y = e.homeY;
          const cx = e.x + e.w / 2;
          if (cx > px0 && cx < px1) {
            splash();
            e.mode = 0;
            e.timer = e.phase === 1 ? 40 : 60;
          } else {
            world.shake(8, 2);
            world.sfx('land');
            e.mode = 2;
            e.timer = Math.round(ph.attackEvery * 60) + 40;
            if (e.phase === 1) {
              // A wave rolls along the ground towards Dagny.
              const dir = dx > 0 ? 1 : -1;
              world.spawnProjectile({
                x: dir === 1 ? e.x + e.w : e.x - 14, y: e.homeY + e.h - 8,
                vx: dir * 2.2, vy: 0, w: 14, h: 8, sprite: 'wave',
                damage: 2, fromPlayer: false, life: 120, ghost: true,
              });
            }
          }
        }
        break;
      case 2: { // gallop on the bank
        const onLeft = e.x + e.w / 2 < (px0 + px1) / 2;
        const lo = onLeft ? 16 : px1;
        const hi = onLeft ? px0 - e.w : gw - 16 - e.w;
        e.facing = dx > 0 ? 1 : -1;
        e.x += e.facing * ph.speed * 0.6;
        if (e.x < lo) e.x = lo;
        if (e.x > hi) e.x = hi;
        e.frame = Math.floor(e.t / 6) % 2;
        if (--e.timer <= 0) leapTo(e, poolMid);
        break;
      }
    }
  },
};

function findPool(world: WorldApi): [number, number] {
  const g = world.grid;
  const row = g.h - 2;
  let x0 = -1;
  let x1 = -1;
  for (let x = 0; x < g.w; x++) {
    if (g.kinds[row * g.w + x] === Kind.Hazard) {
      if (x0 < 0) x0 = x;
      x1 = x;
    }
  }
  return x0 < 0 ? [g.w * 8 - 32, g.w * 8 + 32] : [x0 * 16, (x1 + 1) * 16];
}

function leapTo(e: Enemy, targetX: number): void {
  const frames = 44;
  e.vx = (targetX - e.x) / frames;
  e.vy = -0.3 * frames / 2;
  e.mode = e.mode === 2 ? 3 : 1;
  e.untouchable = false;
  e.alpha = 1;
}
