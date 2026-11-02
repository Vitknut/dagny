import { overlaps } from '../../engine/collision';
import { spriteSize } from '../../engine/sprites';
import { PALETTE } from '../../data/palettes';
import { STR } from '../../data/strings';
import { VASEN } from '../../data/vasen';
import { Enemy, type HitHeight } from '../../entities/enemy';
import { Pickup, Projectile } from '../../entities/misc';
import { damageTaken, swordDamage } from '../progression';
import { hasFlag, hpMax, mpMax, setFlag } from '../state';
import { tmpA, tmpB } from './shared';
import type { SideScene } from '../sidescene';

/** Fighting: the sword, the shield, Dagny getting hurt and creatures being beaten. */

/** Whether Dagny holds her shield towards something at x. */
export function shieldFaces(sc: SideScene, x: number): boolean {
  const p = sc.player;
  if (p.attacking || p.state !== 'normal' || p.downThrust) return false;
  return (x > p.x + p.w / 2 ? 1 : -1) === p.facing;
}

export function shieldBlocks(sc: SideScene, pr: Projectile): boolean {
  const p = sc.player;
  if (p.attacking || p.state === 'hurt' || p.state === 'bird' || p.downThrust) return false;
  // Must come from the front...
  const fromRight = pr.x + pr.w / 2 > p.x + p.w / 2;
  if ((fromRight ? 1 : -1) !== p.facing) return false;
  // ...at the height the shield guards.
  const cy = pr.y + pr.h / 2;
  const mid = p.y + p.h / 2;
  const height = cy < mid ? 'high' : 'low';
  if (p.ducking) return true; // ducking covers the whole (lower) body
  return height === p.shieldHeight || cy < p.y + p.h - 4;
}

export function damagePlayer(sc: SideScene, base: number, fromX: number, ignoreInvuln = false): void {
  const p = sc.player;
  if (!ignoreInvuln && p.invuln > 0) return;
  const s = sc.s;
  const dmg = damageTaken(base, sc.game.settings.calm, sc.spell.skydd > 0);
  s.hp = Math.max(0, s.hp - dmg);
  sc.sfx('hurt');
  sc.game.vibrate(45);
  sc.shake(8, 2);
  if (p.state === 'bird') p.leaveBird(sc.grid);
  p.hurt(fromX);
  if (s.hp <= 0) {
    p.state = 'dead';
    p.invuln = 0;
    sc.deadT = 0;
    sc.game.audio.playMusic('somnar');
  }
}

export function combat(sc: SideScene): void {
  const p = sc.player;
  const sword = p.swordActive ? p.swordBox(tmpB): null;
  const dmg = swordDamage(sc.s.levels.styrka, sc.s.items);
  for (const e of sc.enemies) {
    if (e.dead) continue;
    const eb = e.box(tmpA);
    if (sword && !p.hitIds.has(e.id) && overlaps(sword, eb)) {
      p.hitIds.add(e.id);
      const height: HitHeight = p.downThrust ? 'down' : p.upThrust ? 'up' : p.lowAttack ? 'low' : 'high';
      const r = e.takeHit(dmg, p.x + p.w / 2, height, sc);
      if (r === 'blocked') {
        sc.game.vibrate(10);
        sc.hitStop = 2;
        p.vx = -p.facing * 1.2;
      } else if (r === 'hit' || r === 'dead') {
        sc.game.vibrate(r === 'dead' ? 30 : 20);
        // A short freeze gives the hit weight and shows that it landed.
        sc.hitStop = r === 'dead' ? 6 : 4;
        sc.sparks(sword.x + sword.w / 2, sword.y + sword.h / 2);
        if (r === 'dead') killEnemy(sc, e);
      }
      if (p.downThrust && r !== 'none') p.bounce();
      continue;
    }
    // A diving bird meets the shield: it is turned away and left dazed.
    if (e.diving && overlaps(eb, p) && shieldFaces(sc, e.x + e.w / 2)) {
      e.parry(p.x + p.w / 2);
      sc.sparks(e.x + e.w / 2, e.y + e.h / 2);
      sc.sfx('block');
      sc.game.vibrate(15);
      continue;
    }
    if (e.harmful && overlaps(eb, p) && p.invuln === 0) {
      damagePlayer(sc, e.damage, e.x + e.w / 2);
    }
  }
}

export function killEnemy(sc: SideScene, e: Enemy): void {
  const s = sc.s;
  sc.sfx('puff');
  sc.puff(e.x + e.w / 2, e.y + e.h / 2, e.def.puff);
  s.xp += e.def.xp;
  sc.particles.spawn({ x: e.x + e.w / 2 - 6, y: e.y - 4, vy: -0.5, life: 50, text: `+${e.def.xp}`, color: PALETTE.Y });
  // The first time: a page opens in Väsensboken.
  if (VASEN[e.def.id] && !hasFlag(s, `vasen_${e.def.id}`)) {
    setFlag(s, `vasen_${e.def.id}`);
    sc.game.toast(`${STR.vasenNew} ${e.def.name}`, 3);
  }
  if (e === sc.boss) {
    // A guardian reconciled gives Dagny back all her strength.
    s.hp = hpMax(s);
    s.mp = mpMax(s);
    sc.bossOutro = 1;
    sc.shake(40, 3);
    // Whatever the guardian called up goes with it.
    for (const m of sc.enemies) {
      if (m.dead || m === e) continue;
      m.dead = true;
      sc.puff(m.x + m.w / 2, m.y + m.h / 2, m.def.puff);
    }
    sc.projectiles = sc.projectiles.filter((pr) => pr.fromPlayer);
    return;
  }
  const d = e.def.drops ?? {};
  const r = Math.random();
  let kind: 'bulle' | 'termos' | 'lingon' | null = null;
  if (r < (d.termos ?? 0)) kind = 'termos';
  else if (r < (d.termos ?? 0) + (d.lingon ?? 0)) kind = 'lingon';
  else if (r < (d.termos ?? 0) + (d.lingon ?? 0) + (d.bulle ?? 0)) kind = 'bulle';
  if (kind) {
    const sz = spriteSize(kind);
    sc.pickups.push(new Pickup(kind, e.x + e.w / 2 - sz.w / 2, e.y + e.h / 2 - sz.h, kind, true));
  }
  if (e.def.befriend && !hasFlag(s, `van_${e.def.id}`)) {
    setFlag(s, `van_${e.def.id}`);
    sc.game.toast(e.def.befriend, 3.5);
  }
}
