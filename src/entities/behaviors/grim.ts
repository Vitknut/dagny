import { moveBodyPreview } from './common';
import type { Enemy } from '../enemy';
import type { WorldApi } from '../types';
import type { Behavior, Sense } from './types';

/** Kyrkogrimmen (also used for placeholder bosses). */
export const grim: Behavior = {
  update(e: Enemy, world: WorldApi, s: Sense): void {
    const { p, dx, dist } = s;
    const b = e.boss!;
    if (!e.awake) {
      e.frame = 0;
      e.fall(world);
      return;
    }
    // Phase change.
    if (e.phase === 0 && e.hp <= e.maxHp * b.phases[1].atHpFraction) {
      e.phase = 1;
      e.sprite = b.phases[1].sprite;
      e.mode = 10;
      e.timer = 50;
      e.vx = 0;
      e.vy = 0;
      world.sfx('roar');
      world.shake(30, 2);
      world.puff(e.x + e.w / 2, e.y + e.h / 2, 'mist');
      e.baseY = e.y - 30;
    }
    const ph = b.phases[e.phase];
    if (e.stun > 0) {
      e.stun--;
      e.frame = 0;
      e.vx *= 0.85;
      e.fall(world);
      return;
    }
    if (e.phase === 0) {
      // mode 0 walk/think, 1 wind-up, 2 charge, 3 leap, 4 bell
      switch (e.mode) {
        case 0:
          e.facing = dx > 0 ? 1 : -1;
          if (e.onGround) e.vx = Math.sign(dx) * 0.5;
          e.frame = 0;
          if (--e.timer <= 0) {
            const r = (e.t * 31) % 3;
            if (r === 0 || dist > 120) {
              e.mode = 1;
              e.timer = 30;
              world.sfx('roar');
            } else if (r === 1) {
              e.mode = 3;
              e.vy = -6;
              e.vx = Math.max(-2.5, Math.min(2.5, dx / 40));
              e.onGround = false;
            } else {
              e.mode = 4;
              e.timer = 40;
              world.sfx('bell');
            }
          }
          break;
        case 1:
          e.vx = 0;
          e.frame = 1;
          if (--e.timer <= 0) {
            e.mode = 2;
            e.vx = e.facing * ph.speed * 1.7;
          }
          break;
        case 2: {
          e.frame = 1;
          const res = moveBodyPreview(e, world);
          if (res) {
            // Crashed into the wall: stunned – the moment to strike.
            e.vx = -e.facing * 1.5;
            e.vy = -2;
            e.stun = 85;
            e.mode = 0;
            e.timer = Math.round(ph.attackEvery * 60);
            world.shake(16, 3);
            world.sfx('door');
            // Loose stones / bells fall from the vault.
            for (let i = 0; i < 3; i++) {
              world.spawnProjectile({
                x: 32 + ((e.t * (i + 3) * 53) % (world.grid.w * 16 - 64)),
                y: 34,
                vx: 0,
                vy: 0.5,
                w: 8,
                h: 8,
                sprite: 'bell',
                damage: 2,
                fromPlayer: false,
                life: 160,
                gravity: 0.12,
              });
            }
          }
          break;
        }
        case 3:
          e.frame = 2;
          if (e.onGround && e.vy >= 0) {
            world.shake(10, 2);
            world.sfx('land');
            e.mode = 0;
            e.timer = Math.round(ph.attackEvery * 60);
            e.vx = 0;
          }
          break;
        case 4:
          e.vx = 0;
          e.frame = 0;
          if (e.timer % 12 === 0) {
            world.spawnProjectile({
              x: p.x - 4 + ((e.timer * 7) % 40) - 20,
              y: 34,
              vx: 0,
              vy: 0.4,
              w: 8,
              h: 8,
              sprite: 'bell',
              damage: 2,
              fromPlayer: false,
              life: 160,
              gravity: 0.12,
            });
          }
          if (--e.timer <= 0) {
            e.mode = 0;
            e.timer = Math.round(ph.attackEvery * 60);
          }
          break;
      }
      if (e.mode !== 2) e.fall(world);
      return;
    }

    // Phase 2: a floating spirit that throws bells at shield height.
    e.frame = e.mode === 12 ? 1 : 0;
    switch (e.mode) {
      case 10: // rise
        e.y += (e.baseY - e.y) * 0.05;
        if (--e.timer <= 0) {
          e.mode = 11;
          e.timer = 40;
        }
        break;
      case 11: // drift and throw
        e.facing = dx > 0 ? 1 : -1;
        e.vx += (Math.sign(dx) * ph.speed - e.vx) * 0.03;
        if (dist < 50) e.vx -= Math.sign(dx) * 0.08;
        e.x += e.vx;
        e.y = e.baseY + Math.sin(e.t / 20) * 10;
        e.clampX(world);
        if (--e.timer <= 0) {
          const high = (e.t >> 4) % 2 === 0;
          const py = high ? p.y - 6 : p.y + 4;
          world.spawnProjectile({
            x: e.facing === 1 ? e.x + e.w : e.x - 8,
            y: e.y + e.h / 2,
            vx: e.facing * 1.8,
            vy: (py - (e.y + e.h / 2)) / 55,
            w: 8,
            h: 8,
            sprite: 'bell',
            damage: e.def.damage,
            fromPlayer: false,
            life: 140,
            ghost: true,
          });
          world.sfx('bell');
          e.shotHigh = !e.shotHigh;
          e.timer = Math.round(ph.attackEvery * 60);
          if ((e.t * 17) % 4 === 0) {
            e.mode = 12;
            e.timer = 40;
          }
        }
        break;
      case 12: {
        // Swoop down at the player, then back up.
        e.facing = dx > 0 ? 1 : -1;
        e.x += Math.sign(dx) * ph.speed * 1.3;
        const groundY = (world.grid.h - 2) * 16 - e.h;
        e.y += (groundY - e.y) * 0.08;
        e.clampX(world);
        if (--e.timer <= 0) {
          e.mode = 13;
          e.timer = 50;
        }
        break;
      }
      case 13:
        e.y += (e.baseY - e.y) * 0.06;
        if (--e.timer <= 0) {
          e.mode = 11;
          e.timer = 30;
        }
        break;
    }
  },
};
