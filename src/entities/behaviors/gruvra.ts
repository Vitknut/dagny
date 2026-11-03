import type { Enemy } from '../enemy';
import type { WorldApi } from '../types';
import type { Behavior, Sense } from './types';

/**
 * Gruvrået. Appears out of the dark, throws stones, fades away and appears elsewhere.
 * Phase two: faster, dashes along the floor and brings down the roof.
 */
export const gruvra: Behavior = {
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
      world.shake(30, 3);
      e.mode = 3;
      e.timer = 20;
    }
    const ph = b.phases[e.phase];
    const minX = 24;
    const maxX = world.grid.w * 16 - 24 - e.w;
    // Phase two: the roof comes down now and then.
    if (e.phase === 1 && e.t % 80 === 0) {
      world.spawnProjectile({
        x: Math.max(minX, Math.min(maxX, p.x - 4 + ((e.t * 37) % 60) - 30)),
        y: 34, vx: 0, vy: 0.6, w: 8, h: 8, sprite: 'stone',
        damage: 2, fromPlayer: false, life: 160, gravity: 0.14,
      });
      world.sfx('land');
    }
    switch (e.mode) {
      case 0: // hidden
        e.alpha = 0;
        e.untouchable = true;
        if (--e.timer <= 0) {
          // Appear away from Dagny.
          let x = minX + ((e.t * 53) % (maxX - minX));
          if (Math.abs(x + e.w / 2 - p.x) < 70) x = p.x < (minX + maxX) / 2 ? maxX - 10 : minX + 10;
          e.x = x;
          e.y = e.homeY;
          e.mode = 1;
          e.timer = 24;
          world.sfx('magic');
        }
        break;
      case 1: // fade in
        e.facing = dx > 0 ? 1 : -1;
        e.alpha = 1 - e.timer / 24;
        e.untouchable = e.alpha < 0.6;
        if (--e.timer <= 0) {
          e.mode = 2;
          e.timer = Math.round(ph.attackEvery * 60) + 30;
          e.alpha = 1;
          e.untouchable = false;
        }
        break;
      case 2: { // visible: throw stones in arcs
        e.facing = dx > 0 ? 1 : -1;
        const total = Math.round(ph.attackEvery * 60) + 30;
        const elapsed = total - e.timer;
        e.frame = elapsed % 30 > 18 ? 1 : 0;
        if (elapsed % 30 === 24) {
          const fx = e.facing === 1 ? e.x + e.w : e.x - 8;
          const flight = 46;
          world.spawnProjectile({
            x: fx, y: e.y + 4,
            vx: Math.max(-3, Math.min(3, (p.x - fx) / flight)),
            vy: -3.4, w: 8, h: 8, sprite: 'stone',
            damage: e.def.damage, fromPlayer: false, life: 140, gravity: 0.15,
          });
          world.sfx('sword');
        }
        if (--e.timer <= 0) {
          if (e.phase === 1 && (e.t >> 3) % 2 === 0) {
            e.mode = 4;
            e.vx = (p.x < e.x + e.w / 2 ? -1 : 1) * ph.speed;
            e.facing = e.vx > 0 ? 1 : -1;
            world.sfx('roar');
          } else {
            e.mode = 3;
            e.timer = 24;
          }
        }
        break;
      }
      case 3: // fade out
        e.frame = 0;
        e.alpha = Math.max(0, e.timer / 24);
        e.untouchable = e.alpha < 0.6;
        if (--e.timer <= 0) {
          e.mode = 0;
          e.timer = e.phase === 1 ? 30 : 45;
        }
        break;
      case 4: // dash along the floor
        e.frame = 2;
        e.x += e.vx;
        if (e.x <= minX || e.x >= maxX) {
          e.x = Math.max(minX, Math.min(maxX, e.x));
          world.shake(10, 2);
          world.sfx('door');
          e.mode = 3;
          e.timer = 24;
        }
        break;
    }
  },
};
