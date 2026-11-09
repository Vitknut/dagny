import { Kind, kindAt, TILE, type TileGrid } from '../../engine/collision';
import { drawSprite } from '../../engine/sprites';
import { FURNITURE } from '../../data/furniture';
import type { AreaDef, CritterKind } from '../../data/types';

/**
 * Small harmless animals that make a place feel lived in: wagtails and
 * sparrows, hens, a squirrel, a hare, ducks on the water. None of them can
 * hurt or be hurt; each one minds its own business until Dagny comes close,
 * then gets out of her way in its own fashion.
 */
export interface Critter {
  kind: CritterKind;
  x: number;
  /** Feet (or waterline) in pixels. */
  y: number;
  vx: number;
  vy: number;
  t: number;
  facing: 1 | -1;
  /** 0 calm, 1 startled (fleeing), 2 settling again (hens only). */
  state: 0 | 1 | 2;
  /** Steps since it was startled. */
  ft: number;
  /** The ground (or water) it started on, in pixels. */
  gy: number;
  /** A squirrel's tree: the trunk's x and the crown's top, once it has picked one. */
  treeX?: number;
  treeTop?: number;
  /** Hidden in a crown: dropped next step. */
  gone?: boolean;
  /** Where a duck may paddle (pixel x range). */
  x0: number;
  x1: number;
}

interface KindDef {
  sprite: string;
  w: number;
  h: number;
  /** How close Dagny may come before it goes. */
  shy: number;
  flee: 'fly' | 'run' | 'hop' | 'climb' | 'swim';
}

const KINDS: Readonly<Record<CritterKind, KindDef>> = {
  arla: { sprite: 'arla', w: 10, h: 8, shy: 44, flee: 'fly' },
  sparv: { sprite: 'sparv', w: 8, h: 7, shy: 36, flee: 'fly' },
  hona: { sprite: 'hona', w: 12, h: 11, shy: 30, flee: 'run' },
  ekorre: { sprite: 'ekorre', w: 12, h: 10, shy: 56, flee: 'climb' },
  hare: { sprite: 'hare', w: 14, h: 11, shy: 64, flee: 'hop' },
  anka: { sprite: 'anka', w: 12, h: 8, shy: 40, flee: 'swim' },
};

function make(kind: CritterKind, x: number, y: number, seed: number): Critter {
  return { kind, x, y, gy: y, vx: 0, vy: 0, t: seed * 17, facing: seed % 2 ? 1 : -1, state: 0, ft: 0, x0: x - 24, x1: x + 24 };
}

/** A cheap, repeatable "random" number in [0, 1) from the room and a counter. */
function rnd(id: string, n: number): number {
  let h = 2166136261;
  for (let i = 0; i < id.length; i++) h = Math.imul(h ^ id.charCodeAt(i), 16777619);
  h = Math.imul(h ^ n, 2654435761);
  return ((h >>> 0) % 10000) / 10000;
}

/**
 * The animals of a room: the ones its data places by hand, or, in villages,
 * forests and by open water, a few set out by the ground itself. Temples,
 * dark places, storms and night stay empty.
 */
/** Trees a squirrel can run up (trunk x, foot and top in pixels), from the room's props. */
interface Tree {
  x: number;
  foot: number;
  top: number;
}
const TREE_SPRITES: Readonly<Record<string, { trunk: number; h: number }>> = {
  birch: { trunk: 12, h: 40 },
  rowan: { trunk: 12, h: 40 },
  spruce: { trunk: 11, h: 28 },
};
let trees: Tree[] = [];

function roomTrees(a: AreaDef): Tree[] {
  const out: Tree[] = [];
  for (const pr of [...(a.props ?? []), ...(FURNITURE[a.id] ?? [])]) {
    const tr = pr.sprite ? TREE_SPRITES[pr.sprite] : undefined;
    if (!tr || pr.front) continue;
    const foot = (pr.ty + 1) * TILE + (pr.dy ?? 0);
    out.push({ x: pr.tx * TILE + (pr.dx ?? 0) + tr.trunk, foot, top: foot - tr.h });
  }
  return out;
}

export function spawnCritters(a: AreaDef, grid: TileGrid, avoid: Array<{ tx: number; ty: number }>): Critter[] {
  trees = roomTrees(a);
  if (a.critters) return a.critters.map((c, i) => make(c.kind, c.tx * TILE + 8, (c.ty + 1) * TILE, c.tx + i));
  if (a.kind === 'temple' || a.dark || a.tone === 'storm' || a.tone === 'lyktsken' || a.backdrop === 'none') return [];

  const out: Critter[] = [];
  const solid = (x: number, y: number): boolean => kindAt(grid, x, y) === Kind.Solid;
  const empty = (x: number, y: number): boolean => kindAt(grid, x, y) === Kind.Empty;
  // Open ground: empty with room above, firm ground below, away from the ways in and the people.
  const ground: Array<[number, number]> = [];
  for (let ty = 1; ty < grid.h - 1; ty++) {
    for (let tx = 1; tx < grid.w - 1; tx++) {
      if (!empty(tx, ty) || !empty(tx, ty - 1) || !solid(tx, ty + 1)) continue;
      if (avoid.some((m) => Math.abs(m.tx - tx) < 3 && Math.abs(m.ty - ty) < 3)) continue;
      ground.push([tx, ty]);
    }
  }
  // Open water: the top row of a pond or the sea, with air above it.
  const water: Array<[number, number, number]> = [];
  for (let ty = 1; ty < grid.h; ty++) {
    let run = -1;
    for (let tx = 0; tx <= grid.w; tx++) {
      const wet = tx < grid.w && kindAt(grid, tx, ty) === Kind.Hazard && a.tiles[ty][tx] === '~' && empty(tx, ty - 1);
      if (wet && run < 0) run = tx;
      if (!wet && run >= 0) {
        if (tx - run >= 3) water.push([run, tx - 1, ty]);
        run = -1;
      }
    }
  }
  let n = 0;
  const pick = (kind: CritterKind, count: number): void => {
    for (let i = 0; i < count && ground.length; i++) {
      const k = Math.floor(rnd(a.id, n++) * ground.length);
      const [tx, ty] = ground.splice(k, 1)[0];
      out.push(make(kind, tx * TILE + 8, (ty + 1) * TILE, tx + n));
      // Keep the next one a little apart.
      for (let j = ground.length - 1; j >= 0; j--) if (Math.abs(ground[j][0] - tx) < 3 && ground[j][1] === ty) ground.splice(j, 1);
    }
  };
  const outdoors = a.backdrop === 'outdoor' || a.backdrop === 'forest' || a.backdrop === 'sea';
  if (a.kind === 'village' && outdoors) {
    pick('hona', 3);
    pick('sparv', 2);
  } else if (a.backdrop === 'forest' || a.theme === 'skog') {
    pick('ekorre', 1);
    pick('hare', 1);
  } else if (outdoors && rnd(a.id, 99) < 0.6) {
    pick('sparv', 2);
  }
  if (outdoors) {
    for (const [x0, x1, ty] of water.slice(0, 2)) {
      const cx = ((x0 + x1 + 1) / 2) * TILE;
      const c = make('anka', cx, ty * TILE + 4, x0 + ty);
      c.x0 = x0 * TILE + 8;
      c.x1 = (x1 + 1) * TILE - 8;
      out.push(c);
    }
  }
  return out;
}

/** One step for every animal; the ones that have left the room are dropped. */
export function updateCritters(list: Critter[], grid: TileGrid, pc: { x: number; y: number }, camY: number): void {
  for (const c of list) {
    const d = KINDS[c.kind];
    c.t++;
    const near = Math.abs(pc.x - c.x) < d.shy && Math.abs(pc.y - c.y) < 40;
    if (c.state === 0) {
      if (c.kind === 'anka') {
        // Paddle slowly to and fro.
        c.x += c.facing * 0.15;
        if (c.x < c.x0 || c.x > c.x1) c.facing = c.facing === 1 ? -1 : 1;
      } else if (c.t % 110 === 0) c.facing = c.facing === 1 ? -1 : 1;
      if (near) {
        c.state = 1;
        c.ft = 0;
        c.facing = pc.x < c.x ? 1 : -1;
        if (d.flee === 'climb') {
          // The nearest tree on the far side from Dagny, standing on the same ground.
          let best: Tree | undefined;
          for (const tr of trees) {
            const ahead = (tr.x - c.x) * c.facing;
            if (ahead < -4 || ahead > 180 || Math.abs(tr.foot - c.y) > 20) continue;
            if (!best || Math.abs(tr.x - c.x) < Math.abs(best.x - c.x)) best = tr;
          }
          c.treeX = best?.x;
          c.treeTop = best?.top;
        }
      }
      continue;
    }
    c.ft++;
    switch (d.flee) {
      case 'fly':
        if (c.ft === 1) {
          c.vx = c.facing * (1.2 + (c.t % 5) * 0.1);
          c.vy = -1.4;
        }
        c.x += c.vx;
        c.y += c.vy + Math.sin(c.t / 3) * 0.4;
        c.vy = Math.max(-2.2, c.vy - 0.02);
        break;
      case 'swim':
        // Paddle away fast; cornered, take off.
        if (c.ft < 50) {
          c.x += c.facing * 0.9;
          if (c.x < c.x0 || c.x > c.x1) c.ft = 50;
        } else {
          if (c.ft === 50) {
            c.vx = c.facing * 1.6;
            c.vy = -1.2;
          }
          c.x += c.vx;
          c.y += c.vy;
          c.vy = Math.max(-1.8, c.vy - 0.02);
        }
        break;
      case 'run': {
        // A hen: a flapping dash along the ground, then she settles and pecks again.
        const nx = c.x + c.facing * 1.5;
        const tx = Math.floor((nx + c.facing * 5) / TILE);
        const ty = Math.floor((c.y - 2) / TILE);
        const blocked = kindAt(grid, tx, ty) === Kind.Solid || kindAt(grid, tx, ty + 1) === Kind.Empty || kindAt(grid, tx, ty + 1) === Kind.Hazard;
        if (blocked) c.facing = c.facing === 1 ? -1 : 1;
        else c.x = nx;
        if (c.ft > 45 && !near) c.state = 0;
        break;
      }
      case 'hop':
        // A hare: long bounds away, out of the room.
        c.x += c.facing * 2.6;
        c.vy = c.ft % 14 === 1 ? -1.8 : c.vy + 0.26;
        c.y = Math.min(c.gy, c.y + c.vy);
        break;
      case 'climb':
        // A squirrel: to its tree and straight up into the crown. No tree near? Off along the ground.
        if (c.treeX === undefined) c.x += c.facing * 2.4;
        else if (Math.abs(c.treeX - c.x) > 2) c.x += Math.sign(c.treeX - c.x) * 2.2;
        else {
          c.x = c.treeX;
          c.y -= 1.6;
          if (c.y < (c.treeTop ?? 0) + 14) c.gone = true;
        }
        break;
    }
  }
  const w = grid.w * TILE;
  for (let i = list.length - 1; i >= 0; i--) {
    const c = list[i];
    if (c.gone || c.y < camY - 30 || c.x < -40 || c.x > w + 40) list.splice(i, 1);
  }
}

export function renderCritters(list: readonly Critter[], ctx: CanvasRenderingContext2D, camX: number, camY: number): void {
  for (const c of list) {
    const d = KINDS[c.kind];
    let f = 0;
    const calm = c.state !== 1;
    switch (d.flee) {
      case 'fly':
        f = calm ? (Math.floor(c.t / 20) % 4 === 0 ? 1 : 0) : 2 + (Math.floor(c.t / 4) % 2);
        break;
      case 'swim':
        f = calm || c.ft < 50 ? Math.floor(c.t / 30) % 2 : 2 + (Math.floor(c.t / 4) % 2);
        break;
      case 'run':
        f = calm ? (Math.floor(c.t / 24) % 3 === 0 ? 1 : 0) : 2 + (Math.floor(c.t / 4) % 2);
        break;
      case 'hop':
        f = calm ? (Math.floor(c.t / 40) % 4 === 0 ? 1 : 0) : 2;
        break;
      case 'climb':
        f = calm ? (Math.floor(c.t / 30) % 3 === 0 ? 1 : 0) : c.treeX !== undefined && Math.abs(c.treeX - c.x) <= 2 ? 3 : 2;
        break;
    }
    drawSprite(ctx, d.sprite, f, c.x - d.w / 2 - camX, c.y - d.h - camY, c.facing === -1);
  }
}
