import type { Enemy } from '../enemy';
import type { WorldApi } from '../types';
import type { Behavior, Sense } from './types';

/**
 * Bergakungen. A slow giant. Stomps (stones fall from the roof and a shock wave runs along the
 * floor – after a stomp he stands panting, the moment to strike), rolls boulders that
 * no shield can stop (jump them) and throws rocks. Phase two: the bond weakens, light
 * shines through the cracks, he calls up skuggvargar and rolls boulders in pairs.
 */
export const bergakung: Behavior = {
  update(e: Enemy, world: WorldApi, s: Sense): void {
    const { p, dx } = s;
    const b = e.boss!;
    if (!e.awake) {
      e.homeY = e.y;
      e.frame = 0;
      return;
    }
    const gw = world.grid.w * 16;
    const floorY = e.homeY + e.h;
    const minX = 20;
    const maxX = gw - 20 - e.w;
    const summon = (): void => {
      world.spawnEnemy('skuggvarg', 40, floorY);
      world.spawnEnemy('skuggvarg', gw - 40, floorY);
      world.sfx('roar');
    };
    if (e.phase === 0 && e.hp <= e.maxHp * b.phases[1].atHpFraction) {
      e.phase = 1;
      e.sprite = b.phases[1].sprite;
      e.stun = 0;
      e.mode = 0;
      e.timer = 50;
      world.shake(30, 3);
      summon();
    }
    const ph = b.phases[e.phase];
    e.y = e.homeY;
    if (e.stun > 0) {
      // Panting after a stomp.
      e.stun--;
      e.frame = 0;
      return;
    }
    const rest = (): void => {
      e.mode = 0;
      e.timer = Math.round(ph.attackEvery * 60);
    };
    const boulder = (dir: number, speed: number, delay = 0): void =>
      world.spawnProjectile({
        x: dir === 1 ? e.x + e.w - 4 : e.x - 10, y: floorY - 14, vx: dir * speed, vy: 0,
        w: 14, h: 14, sprite: 'boulder', damage: 3, fromPlayer: false, life: 420, delay,
      });
    switch (e.mode) {
      case 0: { // lumber towards Dagny
        e.facing = dx > 0 ? 1 : -1;
        e.frame = Math.floor(e.t / 20) % 2 === 0 ? 0 : 2;
        if (Math.abs(dx) > 44) e.x = Math.max(minX, Math.min(maxX, e.x + e.facing * ph.speed * 0.3));
        if (e.t % 40 === 0) world.shake(3, 1);
        if (--e.timer <= 0) {
          const order = e.phase === 0 ? [1, 2, 1, 3] : [1, 2, 4, 1, 3, 2];
          e.mode = order[e.cycle++ % order.length];
          e.timer = e.mode === 1 ? 40 : 30;
          if (e.mode === 4 && world.minions() >= 2) e.mode = 3;
        }
        break;
      }
      case 1: // stomp: arms up, then the ground shakes
        e.frame = 1;
        if (--e.timer <= 0) {
          e.frame = 0;
          world.shake(24, 3);
          world.sfx('door');
          const n = e.phase === 1 ? 5 : 3;
          for (let i = 0; i < n; i++) {
            const x = Math.max(20, Math.min(gw - 28, p.x - 4 + (i - (n - 1) / 2) * 34));
            world.spawnProjectile({
              x, y: 18, vx: 0, vy: 0.4, w: 8, h: 8, sprite: 'stone',
              damage: 2, fromPlayer: false, life: 200, gravity: 0.13, delay: 10 + i * 9, ghost: true,
            });
          }
          for (const dir of [-1, 1]) {
            world.spawnProjectile({
              x: dir === 1 ? e.x + e.w : e.x - 14, y: floorY - 8, vx: dir * 2, vy: 0,
              w: 14, h: 8, sprite: 'wave', damage: 2, fromPlayer: false, life: 140, ghost: true,
            });
          }
          e.stun = e.phase === 1 ? 50 : 70;
          rest();
        }
        break;
      case 2: // roll a boulder (two in phase two)
        e.frame = 2;
        if (--e.timer <= 0) {
          boulder(e.facing, e.phase === 1 ? 2 : 1.6);
          if (e.phase === 1) boulder(e.facing, 2, 50);
          world.sfx('door');
          rest();
        }
        break;
      case 3: // throw rocks in arcs
        e.frame = 1;
        if (e.timer === 12) {
          const n = e.phase === 1 ? 4 : 3;
          for (let i = 0; i < n; i++) {
            const tx = p.x + (i - (n - 1) / 2) * 22;
            const flight = 55;
            const sx = e.x + e.w / 2;
            world.spawnProjectile({
              x: sx, y: e.y, vx: (tx - sx) / flight, vy: -3.8 - i * 0.25,
              w: 8, h: 8, sprite: 'stone', damage: 2, fromPlayer: false, life: 160, gravity: 0.14,
            });
          }
          world.sfx('sword');
        }
        if (--e.timer <= 0) rest();
        break;
      case 4: // call the skuggvargar
        e.frame = 1;
        if (--e.timer <= 0) {
          summon();
          rest();
        }
        break;
    }
  },
};
