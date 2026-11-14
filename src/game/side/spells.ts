import { allShut } from './obstacles';
import { moveBody, overlaps } from '../../engine/collision';
import { VIEW_W, VIEW_H } from '../../engine/screen';
import { TILE } from '../../engine/collision';
import { PALETTE } from '../../data/palettes';
import { SPELLS } from '../../data/spells';
import { STR } from '../../data/strings';
import type { SpellId } from '../../data/types';
import { Enemy } from '../../entities/enemy';
import { DialogOverlay } from '../dialog';
import { swordDamage } from '../progression';
import { hasFlag, hpMax, setFlag, spellCost } from '../state';
import { tmpA, type SpellTimers } from './shared';
import type { SideScene } from '../sidescene';
import { killEnemy } from './combat';

/** Readings (spells), the näverlur and the vättar it calls. */

export function tickSpells(sc: SideScene): void {
  const sp = sc.spell;
  for (const k of Object.keys(sp) as Array<keyof SpellTimers>) if (sp[k] > 0) sp[k]--;
  const p = sc.player;
  if (p.state === 'bird' && sp.hamn <= 0) {
    if (!p.leaveBird(sc.grid)) sp.hamn = 1; // no room yet – stay a bird a little longer
  }
}

export function castSpell(sc: SideScene): void {
  const s = sc.s;
  const g = sc.game;
  const id: SpellId | null = s.selectedSpell;
  if (!id) {
    g.toast(STR.noSpells, 2.5);
    return;
  }
  const def = SPELLS[id];
  const p0 = sc.player;
  // A bird that casts again comes down (if there is room to stand).
  if (id === 'hamn' && p0.state === 'bird') {
    if (p0.leaveBird(sc.grid)) sc.spell.hamn = 0;
    return;
  }
  // A reading still burning in this room needs no second casting.
  if (id !== 'lakning' && id !== 'aska' && sc.spell[id] > 0) {
    sc.sfx('cancel');
    return;
  }
  const cost = spellCost(s, id);
  if (s.mp < cost) {
    // Just the dull click: the empty magic bar says the rest.
    sc.sfx('cancel');
    return;
  }
  const p = sc.player;
  if (p.state === 'dead' || p.state === 'hurt') return;
  s.mp -= cost;
  sc.sfx('magic');
  sc.flashT = 8;
  // Like Zelda II: a reading lasts until Dagny leaves the room (the timers live in the room's scene).
  const frames = def.duration > 0 ? Infinity : 0;
  const pc = sc.playerCenter();
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * Math.PI * 2;
    sc.particles.spawn({ x: pc.x, y: pc.y, vx: Math.cos(a) * 1.4, vy: Math.sin(a) * 1.4, life: 24, color: PALETTE.Y });
  }
  switch (id) {
    case 'lakning':
      s.hp = Math.min(hpMax(s), s.hp + 8);
      sc.sfx('heal');
      break;
    case 'skydd':
      sc.spell.skydd = frames;
      break;
    case 'hopp':
      sc.spell.hopp = frames;
      break;
    case 'lyse':
      sc.spell.lyse = frames;
      break;
    case 'eld':
      sc.spell.eld = frames;
      break;
    case 'hamn':
      sc.spell.hamn = frames;
      if (p.state !== 'bird') p.enterBird();
      break;
    case 'aska': {
      sc.sfx('thunder');
      sc.flashT = 30;
      sc.shake(30, 3);
      for (const e of sc.enemies) {
        if (e.dead) continue;
        const onScreen = e.x + e.w > sc.camX && e.x < sc.camX + VIEW_W && e.y + e.h > sc.camY && e.y < sc.camY + VIEW_H;
        if (!onScreen) continue;
        const r = e.takeHit(8 + s.levels.magi * 2, e.x, 'magic', sc);
        if (r === 'dead') killEnemy(sc, e);
      }
      // Dead lanterns in the room light up, and their gates open.
      sc.openCells(allShut(sc, '['), 'thunder');
      // The thunder runs into the dead light strings, and the dance floor wakes.
      const wake = sc.area.beat?.wake;
      if (wake && !hasFlag(s, wake)) {
        setFlag(s, wake);
        sc.lastBeat = -1;
        sc.game.toast(STR.lightsWake, 3);
      }
      break;
    }
  }
}

/** Näverluren calls a befriended vätte to help for a while. */
export function blowLur(sc: SideScene): void {
  const g = sc.game;
  if (sc.lurCooldown > 0) {
    g.toast(DialogOverlay.get('lur_vila').pages[0]);
    return;
  }
  sc.lurCooldown = 30 * 60;
  sc.sfx('horn');
  const p = sc.player;
  sc.helpers.push({ x: p.x - p.facing * 20, y: p.y + p.h - 12, vx: 0, vy: -2, onGround: false, w: 10, h: 12, life: 12 * 60, cd: 0, facing: p.facing });
  sc.puff(p.x - p.facing * 16, p.y + p.h - 6, 'moss');
  g.toastOnce('lur', DialogOverlay.get('lur_blast').pages[0], 2.5);
}

export function updateHelpers(sc: SideScene): void {
  for (const h of sc.helpers) {
    h.life--;
    if (h.cd > 0) h.cd--;
    // Run to the nearest väsen and strike it.
    let target: Enemy | null = null;
    let best = 1e9;
    for (const e of sc.enemies) {
      if (e.dead || e.untouchable || (e.boss && !e.awake)) continue;
      const d = Math.abs(e.x + e.w / 2 - (h.x + h.w / 2));
      if (d < best) { best = d; target = e; }
    }
    // Nothing to fight: in a room of many ways, it shows the right one.
    const guide = sc.area.lurGuide ? sc.doors.find((d) => d.ch === sc.area.lurGuide) : undefined;
    const goal = target ? target.x + target.w / 2 : guide ? guide.tx * TILE + 8 : sc.player.x - sc.player.facing * 18;
    if (!target && guide && Math.abs(goal - (h.x + h.w / 2)) < 8 && h.life % 20 === 0) sc.sparks(goal, guide.ty * TILE - 4);
    const dx = goal - (h.x + h.w / 2);
    h.facing = dx >= 0 ? 1 : -1;
    h.vx = Math.abs(dx) > 6 ? h.facing * 1.4 : 0;
    h.vy = Math.min(5, h.vy + 0.35);
    moveBody(sc.grid, h);
    if (target && h.cd === 0 && overlaps(h, target.box(tmpA))) {
      h.cd = 40;
      const r = target.takeHit(2, h.x + h.w / 2, 'magic', sc);
      if (r === 'dead') killEnemy(sc, target);
      if (r !== 'none') sc.sparks(h.x + h.w / 2, h.y + 4);
    }
    if (h.life === 0) sc.puff(h.x + h.w / 2, h.y + h.h / 2, 'moss');
  }
  sc.helpers = sc.helpers.filter((h) => h.life > 0);
}

export function shootFire(sc: SideScene): void {
  // One fireball at a time: the next only once the last has gone out or hit.
  if (sc.projectiles.some((pr) => pr.fromPlayer && pr.sprite === 'fireball' && !pr.dead)) return;
  const p = sc.player;
  sc.sfx('fire');
  sc.spawnProjectile({
    x: p.facing === 1 ? p.x + p.w + 4 : p.x - 12,
    y: p.y + 6,
    vx: p.facing * 3,
    vy: 0,
    w: 8,
    h: 8,
    sprite: 'fireball',
    damage: swordDamage(sc.s.levels.styrka, sc.s.items),
    fromPlayer: true,
    life: 70,
  });
}
