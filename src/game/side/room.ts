import { Kind, TILE } from '../../engine/collision';
import { drawSprite, frameCount, spriteSize } from '../../engine/sprites';
import { BOSSES, ENEMIES } from '../../data/enemies';
import { ENEMY_CHARS, PICKUP_CHARS, THEMES, DECO, FRONT, kindOf } from '../../data/legend';
import { NPCS } from '../../data/npcs';
import { spawnCritters } from './critters';
import { makeTrial } from './trial';
import { LOOSE, OBSTACLES, isBarrier } from './obstacles';
import { TEMPLE_BOSS_DAMAGE, TEMPLE_ENEMY_BONUS, lifeAtTier } from '../../data/progression';
import { areaTier } from '../reach';
import { ITEMS } from '../../data/items';
import { templeById } from '../../data/temples';
import { Enemy } from '../../entities/enemy';
import { Npc, Pickup } from '../../entities/misc';
import { hasFlag, hasItem } from '../state';
import type { SideScene } from '../sidescene';

/** Building a side-view room from its area data: tiles, creatures, pickups, markers and the pre-rendered layers. */

export function build(sc: SideScene): void {
  const a = sc.area;
  const theme = THEMES[a.theme];
  const s = sc.s;
  const { w, h } = sc.grid;
  const at = (x: number, y: number): string => (y < 0 || y >= h || x < 0 || x >= w ? '.' : a.tiles[y][x]);
  const themeAt = (x: number, y: number) => THEMES[a.themeBoxes?.find((bx) => x >= bx.x0 && x <= bx.x1 && y >= bx.y0 && y <= bx.y1)?.theme ?? ''] ?? theme;
  sc.tileSprite = new Array(w * h).fill(null);
  for (let ty = 0; ty < h; ty++) {
    for (let tx = 0; tx < w; tx++) {
      const ch = a.tiles[ty][tx];
      const i = ty * w + tx;
      const px = tx * TILE + TILE / 2;
      const py = (ty + 1) * TILE;
      let kind = kindOf(ch);
      switch (ch) {
        case '#': {
          const above = at(tx, ty - 1);
          sc.tileSprite[i] = above === '#' || above === 'L' || above === '?' ? themeAt(tx, ty).fill : themeAt(tx, ty).top;
          break;
        }
        case '?': {
          // Hidden passage: the transistor radio's static gives it away.
          if (hasItem(s, 'radio')) {
            kind = Kind.Empty;
            sc.tileSprite[i] = 'secretOpen';
          } else {
            const above = at(tx, ty - 1);
            sc.tileSprite[i] = above === '#' || above === 'L' || above === '?' ? themeAt(tx, ty).fill : themeAt(tx, ty).top;
          }
          break;
        }
        case '%':
        case '&':
          sc.beatCells.push({ i, tx, ty, group: ch });
          kind = ch === '%' ? Kind.OneWay : Kind.Empty;
          break;
        case '=':
          sc.tileSprite[i] = theme.platform;
          break;
        case '^':
          sc.tileSprite[i] = 'spikes';
          break;
        case 'n':
          sc.tileSprite[i] = 'nettles';
          // Nettle tops stick up above the ground so the patch reads as a hazard.
          if (at(tx, ty - 1) !== 'n') sc.anim.push({ x: tx * TILE, y: (ty - 1) * TILE, sprite: 'nettleTops', offset: tx });
          break;
        case '~':
          if (at(tx, ty - 1) === '~') sc.tileSprite[i] = 'waterDeep';
          else sc.anim.push({ x: tx * TILE, y: ty * TILE, sprite: 'water', offset: tx });
          break;
        case 'L':
          if (s.opened.includes(sc.pid(tx, ty))) kind = Kind.Empty;
          else sc.tileSprite[i] = 'lockedDoor';
          break;
        case '!':
          if (s.opened.includes(sc.pid(tx, ty))) kind = Kind.Empty;
          else sc.tileSprite[i] = 'hatch';
          break;
        case '_':
        case '(':
        case '[':
          // Rotten boards, dry roots, dead lanterns (side/obstacles.ts).
          if (s.opened.includes(sc.pid(tx, ty))) kind = Kind.Empty;
          else sc.tileSprite[i] = OBSTACLES[ch].sprite;
          break;
        case '-':
          sc.lightCells.push(i);
          break;
        case '}':
          if (s.opened.includes(sc.pid(tx, ty))) kind = Kind.Empty;
          else sc.tileSprite[i] = LOOSE.sprite;
          break;
        case 'k':
          if (!s.opened.includes(sc.pid(tx, ty))) {
            sc.pickups.push(new Pickup('key', px - 4, py - 12, 'key', false, sc.pid(tx, ty)));
          }
          break;
        case 'c': {
          const pid = `cp:${sc.pid(tx, ty)}`;
          sc.checkpoints.push({ tx, ty, lit: s.opened.includes(pid), pid });
          break;
        }
        case 'X':
          sc.altar = { tx, ty };
          sc.tileSprite[i] = 'altar';
          break;
        case 'q': {
          const item = a.questItem;
          if (item && ITEMS[item] && !hasItem(s, item) && !hasFlag(s, `${item}_klar`)) {
            sc.pickups.push(new Pickup('quest', px - 4, py - 10, ITEMS[item].sprite, false, item));
          }
          break;
        }
        case 'h':
        case 'p': {
          // Life ('h') and magic ('p') containers, each taken once.
          const kind = ch === 'h' ? 'liv' : 'magi';
          const id = sc.pid(tx, ty);
          if (!s.containers.includes(`${kind}:${id}`)) {
            sc.pickups.push(new Pickup('container', px - 6, py - 13, kind === 'liv' ? 'livbehallare' : 'magibehallare', false, `${kind}:${id}`));
          }
          break;
        }
        case '+': {
          // Näverdocka: an extra life, each doll found once.
          const pid = `liv1:${sc.pid(tx, ty)}`;
          if (!s.opened.includes(pid)) sc.pickups.push(new Pickup('life', px - 5, py - 15, 'naverdocka', false, pid));
          break;
        }
        case 'M':
          if (!hasItem(s, 'murre') && !hasFlag(s, 'murre_hemma')) {
            sc.pickups.push(new Pickup('cat', px - 7, py - 10, 'cat', false));
          }
          break;
        case 'B': {
          const temple = a.temple ? templeById(a.temple): undefined;
          const bossId = temple?.boss ?? 'grim';
          if (!hasFlag(s, `${a.temple}_boss`)) {
            const def = BOSSES[bossId];
            if (def) {
              sc.boss = new Enemy(def, px, py);
              sc.boss.bonusDamage = bossBonus(a.temple, def.damage);
              sc.enemies.push(sc.boss);
            }
          }
          break;
        }
        default: {
          if (ENEMY_CHARS[ch]) {
            const def = ENEMIES[ENEMY_CHARS[ch]];
            // A cleared sealed room stays empty.
            if (def && !(a.sealed && hasFlag(s, `${a.id}_rensad`))) {
              const e = new Enemy(def, px, py);
              e.scaleTo(lifeAtTier(def, roomTier(sc)));
              e.bonusDamage = templeBonus(a.temple);
              sc.enemies.push(e);
              // A meeting on the map shuts the way back (game/sidescene.ts, updateSeal).
              if (a.sealed || a.kind === 'encounter') sc.seal = 1;
            }
          } else if (PICKUP_CHARS[ch]) {
            const k = PICKUP_CHARS[ch];
            const sz = spriteSize(k);
            if (!sc.game.taken.has(sc.pid(tx, ty))) sc.pickups.push(new Pickup(k, px - sz.w / 2, py - sz.h - 2, k, false, sc.pid(tx, ty)));
          } else if (ch >= '1' && ch <= '9') {
            const npcId = a.npcs?.[ch];
            const def = npcId ? NPCS[npcId] : undefined;
            if (def && sc.game.check(def.if)) sc.npcs.push(new Npc(def, px, py));
          } else if (ch >= 'A' && ch <= 'Z' || ch === '@') {
            sc.entries.set(ch, { tx, ty });
            if (a.doors?.[ch]) sc.doors.push({ tx, ty, exit: a.doors[ch], ch });
            if (a.signs?.[ch]) sc.signs.push({ tx, ty, dialog: a.signs[ch] });
          }
        }
      }
      sc.grid.kinds[i] = kind;
    }
  }
  // After a cave-in, what came down stays: heaps of rock on the floor.
  if (a.cavein && hasFlag(s, a.cavein.flag)) {
    const heap = new Set((a.cavein.rubble ?? []).map(([x, y]) => y * w + x));
    for (const i of heap) {
      sc.grid.kinds[i] = Kind.Solid;
      sc.tileSprite[i] = heap.has(i - w) ? 'rubbleFill' : 'rubble';
    }
  }
  // Without the radio, rooms behind a hidden wall look like solid rock.
  if (!hasItem(s, 'radio') && a.tiles.some((r) => r.includes('?'))) sealHiddenRooms(sc, (x, y) => themeAt(x, y).fill);
  // The treasure appears on the altar once the guardian is reconciled.
  if (sc.altar && a.treasure && !hasItem(s, a.treasure) && (!sc.boss)) spawnTreasure(sc);
  if (a.afterBoss && a.temple && hasFlag(s, `${a.temple}_boss`)) spawnAfterBoss(sc);
  // A thing someone asked for shows only once they have asked (`after`).
  for (const fd of a.finds ?? []) if (!fd.after || hasFlag(s, fd.after)) placeFind(sc, fd.item, fd.tx, fd.ty);
  sc.trial = makeTrial(a, s);
  // Small animals: by hand, or set out by the ground.
  sc.critters = spawnCritters(a, sc.grid, [...sc.entries.values(), ...sc.npcs.map((n) => ({ tx: Math.floor(n.x / TILE), ty: Math.floor(n.y / TILE) })), ...sc.doors]);
  // Secrets only the lamps reveal.
  for (const ls of a.lampSecrets ?? []) {
    if (!hasItem(s, ls.item)) continue;
    const px = ls.tx * TILE + TILE / 2;
    const py = (ls.ty + 1) * TILE;
    if (ls.container) {
      const key = `${ls.container}:${sc.pid(ls.tx, ls.ty)}`;
      if (!s.containers.includes(key)) {
        sc.pickups.push(new Pickup('container', px - 6, py - 13, ls.container === 'liv' ? 'livbehallare' : 'magibehallare', false, key));
      }
    }
    if (ls.dialog) sc.signs.push({ tx: ls.tx, ty: ls.ty, dialog: ls.dialog });
    if (ls.gives) placeFind(sc, ls.gives, ls.tx, ls.ty);
    sc.lampGlints.push({ x: px, y: py - 8 });
  }
  refreshRoom(sc);
  // Animated decor (candles).
  if (a.deco) {
    for (let ty = 0; ty < h; ty++) {
      for (let tx = 0; tx < w; tx++) {
        const id = DECO[a.deco[ty][tx]];
        if (id && frameCount(id) > 1) sc.anim.push({ x: tx * TILE, y: ty * TILE, sprite: id, offset: tx * 3 + ty });
      }
    }
  }
}

/**
 * Paints every open cell that can't be reached without passing a hidden
 * wall ('?') as rock, and hides what lies there, so the room stays secret.
 */
export function sealHiddenRooms(sc: SideScene, fill: (x: number, y: number) => string): void {
  const { w, h } = sc.grid;
  const tiles = sc.area.tiles;
  // A hatch, rotten boards, roots or a lantern gate are ways through, not hidden walls: what lies behind shows.
  const open = (x: number, y: number): boolean =>
    x >= 0 && y >= 0 && x < w && y < h && (sc.grid.kinds[y * w + x] !== Kind.Solid || tiles[y][x] === '!' || isBarrier(tiles[y][x]));
  const seen = new Uint8Array(w * h);
  const stack: number[] = [];
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const ch = tiles[y][x];
      if ((x === 0 || x === w - 1 || (/[A-Z@]/.test(ch) && ch !== 'L')) && open(x, y)) stack.push(y * w + x);
    }
  }
  while (stack.length) {
    const i = stack.pop()!;
    if (seen[i]) continue;
    seen[i] = 1;
    const x = i % w;
    const y = (i - x) / w;
    for (const [nx, ny] of [[x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]]) if (open(nx, ny) && !seen[ny * w + nx]) stack.push(ny * w + nx);
  }
  for (let i = 0; i < w * h; i++) {
    if (seen[i] || sc.grid.kinds[i] === Kind.Solid) continue;
    const fx = i % w;
    const fy = Math.floor(i / w);
    sc.tileSprite[i] = fill(fx, fy);
    // The hidden room's floor would show as a ledge inside the rock: plain rock too.
    const below = i + w;
    if (below < w * h && tiles[fy + 1][fx] === '#') sc.tileSprite[below] = fill(fx, fy + 1);
    const x = (i % w) * TILE;
    const y = Math.floor(i / w) * TILE;
    sc.pickups = sc.pickups.filter((pk) => !(pk.x + pk.w / 2 >= x && pk.x + pk.w / 2 < x + TILE && pk.y + pk.h / 2 >= y && pk.y + pk.h / 2 < y + TILE));
  }
}

/** An item lying on the floor, taken once (like the side-quest items). */
export function placeFind(sc: SideScene, item: string, tx: number, ty: number): void {
  const s = sc.s;
  const def = ITEMS[item];
  if (!def || hasItem(s, item) || hasFlag(s, `${item}_klar`)) return;
  const sz = spriteSize(def.sprite);
  sc.pickups.push(new Pickup('quest', tx * TILE + TILE / 2 - sz.w / 2, (ty + 1) * TILE - sz.h - 2, def.sprite, false, item));
}

/** Someone who was waiting behind the guardian (Dagmar in Trollberget). */
export function spawnAfterBoss(sc: SideScene): void {
  const ab = sc.area.afterBoss;
  const def = ab ? NPCS[ab.npc] : undefined;
  if (!ab || !def || sc.npcs.some((n) => n.def.id === def.id)) return;
  const n = new Npc(def, ab.tx * TILE + 8, (ab.ty + 1) * TILE);
  sc.npcs.push(n);
  sc.puff(n.x + n.w / 2, n.y + n.h / 2, 'mist');
}

export function spawnTreasure(sc: SideScene): void {
  if (!sc.altar || !sc.area.treasure) return;
  const item = ITEMS[sc.area.treasure];
  if (!item) return;
  const x = sc.altar.tx * TILE;
  const y = sc.altar.ty * TILE + 8 - 12;
  sc.pickups.push(new Pickup('treasure', x, y - 4, item.sprite, false, item.id));
}

export function renderStatic(sc: SideScene): HTMLCanvasElement {
  const { w, h } = sc.grid;
  const c = document.createElement('canvas');
  c.width = w * TILE;
  c.height = h * TILE;
  const ctx = c.getContext('2d') as CanvasRenderingContext2D;
  const deco = sc.area.deco;
  if (deco) {
    for (let ty = 0; ty < h; ty++) {
      for (let tx = 0; tx < w; tx++) {
        const id = DECO[deco[ty][tx]];
        if (!id) continue;
        if (frameCount(id) === 1) {
          drawSprite(ctx, id, 0, tx * TILE, ty * TILE);
        } else {
          // Animated decor is drawn each frame; fill the wall behind it from a neighbour.
          const n = [deco[ty][tx - 1], deco[ty][tx + 1], deco[ty - 1]?.[tx], deco[ty + 1]?.[tx]]
            .map((ch) => (ch ? DECO[ch] : undefined))
            .find((nid) => nid && frameCount(nid) === 1 && nid.startsWith('bg'));
          if (n) drawSprite(ctx, n, 0, tx * TILE, ty * TILE);
        }
      }
    }
  }
  for (let ty = 0; ty < h; ty++) {
    for (let tx = 0; tx < w; tx++) {
      const id = sc.tileSprite[ty * w + tx];
      if (id) drawSprite(ctx, id, 0, tx * TILE, ty * TILE);
    }
  }
  return c;
}

export function renderFront(sc: SideScene): HTMLCanvasElement | null {
  const front = sc.area.front;
  if (!front) return null;
  const { w, h } = sc.grid;
  const c = document.createElement('canvas');
  c.width = w * TILE;
  c.height = h * TILE;
  const ctx = c.getContext('2d') as CanvasRenderingContext2D;
  for (let ty = 0; ty < h; ty++) {
    for (let tx = 0; tx < w; tx++) {
      const id = FRONT[front[ty]?.[tx] ?? '.'];
      if (id) drawSprite(ctx, id, 0, tx * TILE, ty * TILE);
    }
  }
  return c;
}

/**
 * Brings the room in line with what Dagny has done since it was built: people
 * and things that now should (or should no longer) be here, and containers a
 * finished task has left lying (AreaDef.rewards). Called after every dialog
 * and when something catches fire.
 */
export function refreshRoom(sc: SideScene): void {
  const a = sc.area;
  const s = sc.s;
  sc.npcs = sc.npcs.filter((n) => sc.game.check(n.def.if));
  for (let ty = 0; ty < a.tiles.length; ty++) {
    for (let tx = 0; tx < a.tiles[ty].length; tx++) {
      const ch = a.tiles[ty][tx];
      const def = ch >= '1' && ch <= '9' ? NPCS[a.npcs?.[ch] ?? ''] : undefined;
      if (!def || !sc.game.check(def.if) || sc.npcs.some((n) => n.def.id === def.id)) continue;
      sc.npcs.push(new Npc(def, tx * TILE + TILE / 2, (ty + 1) * TILE));
      sc.puff(tx * TILE + TILE / 2, ty * TILE + 8, 'mist');
    }
  }
  for (const r of a.rewards ?? []) {
    const key = `${r.kind}:${sc.pid(r.tx, r.ty)}`;
    if (!hasFlag(s, r.flag) || s.containers.includes(key) || sc.pickups.some((p) => p.pid === key && !p.taken)) continue;
    const px = r.tx * TILE + TILE / 2;
    const py = (r.ty + 1) * TILE;
    sc.pickups.push(new Pickup('container', px - 6, py - 13, r.kind === 'liv' ? 'livbehallare' : 'magibehallare', false, key));
  }
}

/** Extra damage for the creatures of a temple: the deeper in the game, the harder they hit. */
export function templeBonus(temple: string | undefined): number {
  const n = temple ? templeById(temple)?.number : undefined;
  return n ? TEMPLE_ENEMY_BONUS[n - 1] ?? 0 : 0;
}

/** What a temple's guardian adds to its own damage to hit as hard as TEMPLE_BOSS_DAMAGE says. */
export function bossBonus(temple: string | undefined, base: number): number {
  const n = temple ? templeById(temple)?.number : undefined;
  return n ? Math.max(0, (TEMPLE_BOSS_DAMAGE[n - 1] ?? base) - base) : 0;
}

/** How deep in the game this room is (1–7): a meeting takes the region it started in, other rooms their own (game/reach.ts). */
export function roomTier(sc: SideScene): number {
  return sc.area.kind === 'encounter' ? sc.spawnTier ?? 1 : areaTier(sc.area.id);
}

