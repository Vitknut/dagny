import type { Enemy } from '../enemy';
import type { WorldApi } from '../types';
import type { Behavior, Sense } from './types';

/**
 * Havsfrun. Hovers above the gallery. Spits sea water, calls gusts that push Dagny towards
 * the edge, and swoops down. Phase two adds lightning that strikes where it warns.
 */
export const havsfru: Behavior = {
  update(e: Enemy, world: WorldApi, s: Sense): void {
    const { p, dx } = s;
    const b = e.boss!;
    if (!e.awake) {
      e.homeY = e.y;
      e.baseY = e.y - 64;
      e.frame = 0;
      return;
    }
    if (e.phase === 0 && e.hp <= e.maxHp * b.phases[1].atHpFraction) {
      e.phase = 1;
      e.sprite = b.phases[1].sprite;
      world.sfx('thunder');
      world.shake(30, 3);
      e.mode = 2;
      e.timer = 40;
    }
    const ph = b.phases[e.phase];
    const gw = world.grid.w * 16;
    const minX = 20;
    const maxX = gw - 20 - e.w;
    const floorY = e.homeY + e.h;
    e.facing = dx > 0 ? 1 : -1;
    const drift = (): void => {
      const want = Math.max(minX, Math.min(maxX, p.x - e.w / 2 + Math.sin(e.t / 50) * 60));
      e.x += Math.max(-ph.speed, Math.min(ph.speed, (want - e.x) * 0.05));
      e.y += (e.baseY + Math.sin(e.t / 20) * 6 - e.y) * 0.1;
    };
    switch (e.mode) {
      case 0: // drift and choose
        e.frame = 0;
        drift();
        if (--e.timer <= 0) {
          const c = e.cycle++ % 4;
          if (c === 0) { e.mode = 1; e.timer = 34; }
          else if (c === 1) { e.mode = e.phase === 1 ? 4 : 2; e.timer = 40; }
          else if (c === 2) { e.mode = 3; e.timer = 70; e.vx = Math.sign(dx) * ph.speed * 1.4; }
          else { e.mode = e.phase === 1 ? 2 : 1; e.timer = 40; }
        }
        break;
      case 1: // spit a fan of sea water
        e.frame = 1;
        drift();
        if (e.timer === 18) {
          const cx = e.x + e.w / 2;
          const cy = e.y + 12;
          const base = Math.atan2(p.y - cy, p.x - cx);
          for (const off of [-0.25, 0, 0.25]) {
            world.spawnProjectile({
              x: cx - 3, y: cy, vx: Math.cos(base + off) * 2, vy: Math.sin(base + off) * 2,
              w: 6, h: 6, sprite: 'droplet', damage: 2, fromPlayer: false, life: 160, ghost: true,
            });
          }
          world.sfx('water');
        }
        if (--e.timer <= 0) { e.mode = 0; e.timer = Math.round(ph.attackEvery * 60); }
        break;
      case 2: // call the storm: a gust towards the nearest edge
        e.frame = 1;
        drift();
        if (e.timer === 30) {
          const out = p.x > gw / 2 ? 1 : -1;
          world.gust(out * (e.phase === 1 ? 1.1 : 0.9), 80);
        }
        if (--e.timer <= 0) { e.mode = 0; e.timer = Math.round(ph.attackEvery * 60); }
        break;
      case 3: // swoop down at Dagny
        e.frame = 2;
        e.x = Math.max(minX, Math.min(maxX, e.x + e.vx));
        if (e.timer > 35) e.y += (floorY - e.h - 2 - e.y) * 0.12;
        else e.y += (e.baseY - e.y) * 0.08;
        if (--e.timer <= 0) { e.mode = 0; e.timer = Math.round(ph.attackEvery * 60); }
        break;
      case 4: // lightning where it warns
        e.frame = 1;
        drift();
        if (e.timer === 38) {
          for (const [k, off] of [[0, -36], [1, 0], [2, 36]] as const) {
            const x = Math.max(8, Math.min(gw - 16, p.x + off - 4));
            world.spawnProjectile({
              x, y: 0, vx: 0, vy: 0, w: 8, h: floorY,
              sprite: 'bolt', damage: 3, fromPlayer: false, life: 14, ghost: true, delay: 46 + k * 10,
            });
          }
          world.sfx('magic');
        }
        if (e.timer === 1) world.sfx('thunder');
        if (--e.timer <= 0) { e.mode = 0; e.timer = Math.round(ph.attackEvery * 60) + 20; }
        break;
    }
  },
};
