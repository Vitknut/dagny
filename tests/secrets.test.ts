import { describe, expect, it } from 'vitest';
import { AREAS } from '../src/data/areas';
import { DIALOG } from '../src/data/dialog';
import { ITEMS } from '../src/data/items';
import { OVERWORLD } from '../src/data/overworld';
import { TEMPLES } from '../src/data/temples';
import type { AreaDef, DialogAction } from '../src/data/types';
import { CONTAINER_HP, CONTAINER_MP } from '../src/data/progression';
import { addContainer, containerCount, hpMax, mpMax, newGame } from '../src/game/state';
import { deserialize, serialize } from '../src/game/save';
import { reachableTiles } from '../src/game/reach';

const TREASURES = new Set(TEMPLES.flatMap((t) => (t.treasure ? [t.treasure] : [])));
const allActions: DialogAction[] = Object.values(DIALOG).flatMap((d) => [...(d.actions ?? []), ...(d.choices ?? []).flatMap((c) => c.actions ?? [])]);

/** Cells reachable from the area's entries (a coarse, physics-free connectivity check). */
function reachable(a: AreaDef, withRadio: boolean): Set<string> {
  const t = a.tiles;
  const solid = (ch: string): boolean => ch === '#' || ch === 'L' || (ch === '?' && !withRadio);
  const seen = new Set<string>();
  const stack: Array<[number, number]> = [];
  t.forEach((row, y) => [...row].forEach((ch, x) => {
    if (/[A-Z@]/.test(ch) && ch !== 'L' && ch !== 'X' && ch !== 'B' && ch !== 'M' && ch !== 'T') stack.push([x, y]);
  }));
  // Walking in from the left or right edge counts too.
  for (let y = 0; y < t.length; y++) {
    if (!solid(t[y][0])) stack.push([0, y]);
    if (!solid(t[y][t[y].length - 1])) stack.push([t[y].length - 1, y]);
  }
  while (stack.length) {
    const [x, y] = stack.pop()!;
    const k = `${x},${y}`;
    const ch = t[y]?.[x];
    if (ch === undefined || seen.has(k) || solid(ch)) continue;
    seen.add(k);
    stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
  }
  return seen;
}

/** Locked doors are passable once a key is found; a locked door counts as reached when a cell beside it is. */
function cellsOf(a: AreaDef, chars: string): Array<[number, number]> {
  const out: Array<[number, number]> = [];
  a.tiles.forEach((row, y) => [...row].forEach((ch, x) => { if (chars.includes(ch)) out.push([x, y]); }));
  return out;
}

function containersPlaced(): Array<{ area: string; kind: 'liv' | 'magi'; via: string }> {
  const out: Array<{ area: string; kind: 'liv' | 'magi'; via: string }> = [];
  for (const a of Object.values(AREAS)) {
    for (const [x, y] of cellsOf(a, 'hp')) out.push({ area: a.id, kind: a.tiles[y][x] === 'h' ? 'liv' : 'magi', via: 'tile' });
    for (const ls of a.lampSecrets ?? []) if (ls.container) out.push({ area: a.id, kind: ls.container, via: ls.item });
    for (const r of a.rewards ?? []) out.push({ area: a.id, kind: r.kind, via: r.flag });
  }
  for (const act of allActions) if (act.type === 'container') out.push({ area: 'dialog', kind: act.kind, via: act.id });
  return out;
}

describe('secrets', () => {
  it('has eight life and seven magic containers (hidden caves and the small places on the map)', () => {
    const c = containersPlaced();
    expect(c.filter((x) => x.kind === 'liv')).toHaveLength(8);
    expect(c.filter((x) => x.kind === 'magi')).toHaveLength(7);
  });

  it('temples 1–4 each hide a radio room with a container', () => {
    for (const temple of ['krypta', 'gruvan', 'kvarnen', 'fyren']) {
      const rooms = Object.values(AREAS).filter((a) => a.temple === temple);
      const hidden = rooms.filter((a) => {
        const without = reachable(a, false);
        const withRadio = reachable(a, true);
        return cellsOf(a, 'hp').some(([x, y]) => !without.has(`${x},${y}`) && withRadio.has(`${x},${y}`));
      });
      expect(hidden.length, temple).toBeGreaterThanOrEqual(1);
    }
  });

  it('every container can be reached with the treasures in the game', () => {
    expect(TREASURES.has('radio')).toBe(true);
    for (const a of Object.values(AREAS)) {
      const all = reachable(a, true);
      for (const [x, y] of cellsOf(a, 'hp')) expect(all.has(`${x},${y}`), `${a.id} ${x},${y}`).toBe(true);
      for (const ls of a.lampSecrets ?? []) {
        expect(TREASURES.has(ls.item), ls.item).toBe(true);
        expect(ITEMS[ls.item]).toBeDefined();
        expect(all.has(`${ls.tx},${ls.ty}`), `${a.id} lamp secret ${ls.tx},${ls.ty}`).toBe(true);
        if (ls.dialog) expect(DIALOG[ls.dialog], ls.dialog).toBeDefined();
      }
    }
  });

  it('no secret is needed to finish the game: keys, doors, altars and bosses never hide behind a radio wall', () => {
    for (const a of Object.values(AREAS)) {
      // Trollberget comes after all six temples, so the radio is guaranteed there.
      if (a.temple === 'trollberget') continue;
      const without = reachable(a, false);
      const near = (x: number, y: number): boolean =>
        [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => without.has(`${x + dx},${y + dy}`));
      for (const [x, y] of cellsOf(a, 'kXBL')) expect(near(x, y), `${a.id} ${a.tiles[y][x]} at ${x},${y}`).toBe(true);
      for (const id of Object.keys(a.doors ?? {})) {
        for (const [x, y] of cellsOf(a, id)) expect(without.has(`${x},${y}`), `${a.id} door ${id}`).toBe(true);
      }
    }
  });

  it('the caves on the map need a treasure to reach (eka, stövlar, or the radio for Bergsstigen)', () => {
    const t = OVERWORLD.tiles;
    const flood = (items: Set<string>): Set<string> => reachableTiles([...items]);
    const caves = OVERWORLD.places.filter((p) => t[p.y][p.x] === 'C');
    expect(caves.length).toBeGreaterThanOrEqual(1);
    const bare = flood(new Set());
    const all = flood(TREASURES);
    for (const c of caves) {
      expect(AREAS[c.area!], c.name).toBeDefined();
      expect(bare.has(`${c.x},${c.y}`), `${c.name} without treasures`).toBe(false);
      expect(all.has(`${c.x},${c.y}`), `${c.name} with treasures`).toBe(true);
    }
  });
});

describe('containers', () => {
  it('each container counts once and raises the max', () => {
    const s = newGame();
    const hp0 = hpMax(s);
    const mp0 = mpMax(s);
    expect(addContainer(s, 'liv', 'krypta_1:2,4')).toBe(true);
    expect(addContainer(s, 'liv', 'krypta_1:2,4')).toBe(false);
    expect(addContainer(s, 'magi', 'krypta_1:2,4')).toBe(true);
    expect(containerCount(s, 'liv')).toBe(1);
    expect(hpMax(s)).toBe(hp0 + CONTAINER_HP);
    expect(mpMax(s)).toBe(mp0 + CONTAINER_MP);
    expect(s.hp).toBe(hpMax(s));
  });

  it('are saved and loaded, ignoring junk and duplicates', () => {
    const s = newGame();
    addContainer(s, 'liv', 'a');
    addContainer(s, 'liv', 'b');
    s.hp = hpMax(s);
    const back = deserialize(serialize(s))!.state;
    expect(back.containers).toEqual(['liv:a', 'liv:b']);
    expect(back.hp).toBe(hpMax(s));
    const raw = JSON.parse(serialize(s));
    raw.state.containers = ['liv:a', 'liv:a', 'nonsense', 3, 'magi:x'];
    const fixed = deserialize(JSON.stringify(raw))!.state;
    expect(fixed.containers).toEqual(['liv:a', 'magi:x']);
  });

  it('an old save without containers still loads', () => {
    const raw = JSON.parse(serialize(newGame()));
    delete raw.state.containers;
    expect(deserialize(JSON.stringify(raw))!.state.containers).toEqual([]);
  });
});

describe('sword upgrades', () => {
  it('each upgrade adds one point of damage', async () => {
    const { swordDamage, SWORD_UPGRADES } = await import('../src/game/progression');
    expect(swordDamage(1)).toBe(2);
    expect(swordDamage(1, ['klingaHardad'])).toBe(3);
    expect(swordDamage(1, [...SWORD_UPGRADES])).toBe(5);
    for (const u of SWORD_UPGRADES) expect(ITEMS[u], u).toBeDefined();
  });

  it('the materials lie in reachable spots and the smith turns them into upgrades', () => {
    const places = Object.values(AREAS).flatMap((a) => [
      ...(a.finds ?? []).map((f) => ({ a, item: f.item, tx: f.tx, ty: f.ty })),
      ...(a.lampSecrets ?? []).filter((l) => l.gives).map((l) => ({ a, item: l.gives!, tx: l.tx, ty: l.ty })),
    ]);
    for (const item of ['malm', 'askstenen', 'silverbeslag']) {
      const at = places.filter((p) => p.item === item);
      expect(at, item).toHaveLength(1);
      const p = at[0];
      expect(reachable(p.a, true).has(`${p.tx},${p.ty}`), `${item} in ${p.a.id}`).toBe(true);
      expect(DIALOG[`hittade_${item}`], item).toBeDefined();
    }
    for (const [mat, up] of [['malm', 'klingaHardad'], ['askstenen', 'klingaBlank']]) {
      expect(allActions).toContainEqual({ type: 'takeItem', item: mat });
      expect(allActions).toContainEqual({ type: 'flag', flag: `${mat}_klar` });
      expect(allActions).toContainEqual({ type: 'giveItem', item: up });
    }
  });
});

/**
 * Where moving platforms carry Dagny: for each platform, the cells she can
 * stand in while riding it (a lift's whole column, a cart's or log's whole
 * run, every cell a wheel's paddles pass). Riding joins them all.
 */
function rides(a: AreaDef): Array<Set<string>> {
  return (a.platforms ?? []).map((p) => {
    const cells = new Set<string>();
    const add = (x: number, surface: number): void => void cells.add(`${x},${surface - 1}`);
    if (p.kind === 'lift') {
      for (let r = Math.min(p.ty, p.toTy); r <= Math.max(p.ty, p.toTy); r++) for (const x of [p.tx, p.tx + 1]) add(x, r);
    } else if (p.kind === 'cart' || p.kind === 'log') {
      const surface = p.kind === 'log' ? p.ty + 1 : p.ty;
      for (let x = Math.min(p.tx, p.toTx); x <= Math.max(p.tx, p.toTx) + 1; x++) add(x, surface);
    } else {
      const rx = p.radius ?? 2;
      const ry = p.radiusY ?? rx;
      for (let i = 0; i < 32; i++) add(Math.round(p.tx + Math.cos((i / 32) * Math.PI * 2) * rx), Math.round(p.ty + Math.sin((i / 32) * Math.PI * 2) * ry));
    }
    return cells;
  });
}

/**
 * Coarse platformer reachability: Dagny stands on a cell with floor under it,
 * walks, falls, and jumps up to 3 tiles high and 3 tiles across (a running jump
 * carries her 3.1 tiles), and rides
 * moving platforms anywhere along their way. Rooms with wind or dance
 * squares are left out (they need timing).
 */
interface JumpModel {
  w: number;
  h: number;
  stand: (x: number, y: number) => boolean;
  land: (x: number, y: number) => [number, number] | null;
  moves: (x: number, y: number) => Array<[number, number]>;
  free: (x: number, y: number) => boolean;
}

/** The coarse platformer model of one room (see softlocks); `up` is how many tiles a jump rises. */
/**
 * How far Dagny really carries (tiles, measured in the engine with a run-up and
 * the button held) when landing this many tiles higher: index = rise 0..5.
 */
const REACH = [3.12, 2.78, 2.45, 2.02];
const REACH_HOPP = [4.3, 3.97, 3.71, 3.46, 3.21, 2.87];

function jumpModel(a: AreaDef, radio: boolean, opts: { up?: number; hatches?: boolean; keys?: boolean; strict?: boolean } = {}): JumpModel {
  const t = a.tiles;
  const h = t.length;
  const w = t[0].length;
  const groups = rides(a);
  const onRide = (x: number, y: number): boolean => groups.some((g) => g.has(`${x},${y}`));
  const solid = (x: number, y: number): boolean => y >= h || (x >= 0 && x < w && y >= 0 && (t[y][x] === '#' || (t[y][x] === 'L' && !opts.keys) || (t[y][x] === '!' && !opts.hatches) || (t[y][x] === '?' && !radio)));
  const free = (x: number, y: number): boolean => x >= 0 && x < w && y < h && (y < 0 || (!solid(x, y) && !'^~n'.includes(t[y][x])));
  const floor = (x: number, y: number): boolean => y + 1 < h && y + 1 >= 0 && (solid(x, y + 1) || '=%&'.includes(t[y + 1][x] ?? '') || onRide(x, y));
  const stand = (x: number, y: number): boolean => free(x, y) && free(x, y - 1) && floor(x, y);
  const land = (x: number, y: number): [number, number] | null => {
    let yy = y;
    while (yy < h && free(x, yy) && !floor(x, yy)) yy++;
    return yy < h && stand(x, yy) ? [x, yy] : null;
  };
  const moves = (x: number, y: number): Array<[number, number]> => {
    const out: Array<[number, number]> = [];
    for (const dx of [-1, 1]) {
      if (free(x + dx, y) && free(x + dx, y - 1)) {
        const l = land(x + dx, y);
        if (l) out.push(l);
      }
    }
    const reach = (opts.up ?? 3) > 3 ? REACH_HOPP : REACH;
    const span = opts.strict ? 6 : 3;
    for (let up = 1; up <= (opts.up ?? 3) && free(x, y - up); up++) {
      for (let dx = -span; dx <= span; dx++) {
        let ok = true;
        for (let cx = x; cx !== x + dx + Math.sign(dx || 1) && ok; cx += Math.sign(dx || 1)) if (!free(cx, y - up)) ok = false;
        const l = ok ? land(x + dx, y - up) : null;
        if (!l) continue;
        if (opts.strict) {
          // Comfortably within the measured reach: a few pixels to spare at each end.
          const rise = y - l[1];
          const carry = rise >= 0 ? reach[rise] ?? -1 : reach[0] + 0.35 * -rise;
          if (Math.abs(dx) * 16 - 10 > carry * 16) continue;
        }
        out.push(l);
      }
    }
    for (const g of groups) {
      if (!g.has(`${x},${y}`)) continue;
      for (const k of g) {
        const [gx, gy] = k.split(',').map(Number);
        if (free(gx, gy) && free(gx, gy - 1)) out.push([gx, gy]);
      }
    }
    return out;
  };
  return { w, h, stand, land, moves, free };
}

function softlocks(a: AreaDef, radio: boolean): string[] {
  const t = a.tiles;
  const { w, h, land, moves, free } = jumpModel(a, radio, { strict: true });
  const exits = new Set<string>();
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const ch = t[y][x];
      // An edge is a way out only on a side the room has an exit.
      const edge = (x === 0 && !!a.left) || (x === w - 1 && !!a.right);
      if ((edge && free(x, y)) || (/[A-Z]/.test(ch) && !'LXBMT'.includes(ch))) exits.add(`${x},${y}`);
    }
  }
  const key = (c: [number, number]): string => `${c[0]},${c[1]}`;
  const starts = [...exits].map((k) => k.split(',').map(Number) as [number, number]).map(([x, y]) => land(x, y)).filter((c): c is [number, number] => !!c);
  const seen = new Map<string, [number, number]>();
  const stack = [...starts];
  while (stack.length) {
    const c = stack.pop()!;
    if (seen.has(key(c))) continue;
    seen.set(key(c), c);
    for (const n of moves(...c)) if (!seen.has(key(n))) stack.push(n);
  }
  const good = new Set<string>([...seen.keys()].filter((k) => {
    const [x, y] = k.split(',').map(Number);
    return exits.has(k) || exits.has(`${x - 1},${y}`) || exits.has(`${x + 1},${y}`) || (x === 0 && !!a.left) || (x === w - 1 && !!a.right);
  }));
  for (let changed = true; changed;) {
    changed = false;
    for (const [k, c] of seen) {
      if (!good.has(k) && moves(...c).some((n) => good.has(key(n)))) {
        good.add(k);
        changed = true;
      }
    }
  }
  return [...seen.keys()].filter((k) => !good.has(k));
}

describe('no pits to get stuck in', () => {
  it('from every place Dagny can stand she can get back to an exit (without keys, with or without the radio)', () => {
    const bad: string[] = [];
    for (const a of Object.values(AREAS)) {
      if (a.wind || a.beat) continue;
      for (const radio of [false, true]) {
        const stuck = softlocks(a, radio);
        if (stuck.length) bad.push(`${a.id} radio=${radio}: ${stuck.join(' ')}`);
      }
    }
    expect(bad).toEqual([]);
  });
});

describe('everything in a room can be reached by jumping, not only by the solver', () => {
  /** Standing cells Dagny reaches from where she comes in (every way in, so rooms entered from either end count). */
  const reachable = (a: AreaDef, m: JumpModel): Set<string> => {
    const t = a.tiles;
    const starts: Array<[number, number]> = [];
    for (let y = 0; y < m.h; y++) {
      for (let x = 0; x < m.w; x++) {
        const ch = t[y][x];
        if ('@AW'.includes(ch) || (/[B-Z]/.test(ch) && !'LXBMT'.includes(ch) && !a.doors?.[ch])) {
          const l = m.land(x, y);
          if (l) starts.push(l);
        }
      }
      // The room's edges, where Dagny walks in from a neighbour.
      if (a.left && m.free(0, y)) { const l = m.land(0, y); if (l) starts.push(l); }
      if (a.right && m.free(m.w - 1, y)) { const l = m.land(m.w - 1, y); if (l) starts.push(l); }
    }
    const seen = new Set<string>();
    const stack = [...starts];
    while (stack.length) {
      const c = stack.pop()!;
      const k = `${c[0]},${c[1]}`;
      if (seen.has(k)) continue;
      seen.add(k);
      stack.push(...m.moves(c[0], c[1]));
    }
    return seen;
  };
  /** Dagny standing at (x, y) can touch (tx, ty): beside or on it, or by jumping up to it. */
  const touches = (seen: Set<string>, m: JumpModel, tx: number, ty: number, up: number): boolean => {
    for (const k of seen) {
      const [x, y] = k.split(',').map(Number);
      // Jumping only gets the head up so far: touching a thing up on a ledge means standing next to it, near enough.
      if (Math.abs(x - tx) > 1 || ty > y || y - ty > Math.min(up, 2)) continue;
      let clear = true;
      for (let yy = y - 1; yy > ty && clear; yy--) if (!m.free(x, yy)) clear = false;
      if (clear) return true;
    }
    return false;
  };

  it('keys, treasures, quest things, containers, dolls, doors, people and the boss', () => {
    const bad: string[] = [];
    for (const a of Object.values(AREAS)) {
      if (process.env.ALLROOMS ? false : a.wind || a.beat) continue;
      const hopp = a.needsSpell?.some((n) => n.spell === 'hopp');
      const up = hopp ? 5 : 3;
      const m = jumpModel(a, true, { up, hatches: true, keys: true, strict: true });
      const seen = reachable(a, m);
      a.tiles.forEach((row, ty) =>
        [...row].forEach((ch, tx) => {
          // (The boss starts where it lives – in the water, up in the air; a door that only loops back is a decoy.)
          const wanted = 'kXqhp+'.includes(ch) || (!!a.doors?.[ch] && a.doors[ch].to !== a.id && !a.doors[ch].dialog) || /[1-9]/.test(ch);
          if (!wanted) return;
          // A place only the bird gets into (Hamn): not for this model.
          if (a.needsSpell?.some((n) => n.spell === 'hamn' && tx >= n.x0 && tx <= n.x1 && ty >= n.y0 && ty <= n.y1)) return;
          if (!touches(seen, m, tx, ty, up)) bad.push(`${a.id}: '${ch}' at ${tx},${ty}`);
        }),
      );
    }
    expect(bad).toEqual([]);
  });
});

describe('nobody comes into a room standing in water or on spikes', () => {
  it('every way in has firm ground under it', () => {
    const bad: string[] = [];
    for (const a of Object.values(AREAS)) {
      const t = a.tiles;
      t.forEach((row, y) =>
        [...row].forEach((ch, x) => {
          // Entry markers: A–Z (not doors, nor the letters that mean something else), @ and W.
          const entry = ch === '@' || (/[A-Z]/.test(ch) && !'LXBMT'.includes(ch) && !a.doors?.[ch] && !a.signs?.[ch]);
          if (!entry) return;
          // Falling from the marker to the first thing below it.
          let yy = y + 1;
          while (yy < t.length && t[yy][x] === '.') yy++;
          const under = t[yy]?.[x] ?? '';
          const beside = [t[yy]?.[x - 1], t[yy]?.[x + 1]];
          if ('~^n'.includes(under) || !under || beside.some((c) => c !== undefined && '~^n'.includes(c))) bad.push(`${a.id}: '${ch}' at ${x},${y} over '${under}'`);
        }),
      );
    }
    expect(bad).toEqual([]);
  });
});
