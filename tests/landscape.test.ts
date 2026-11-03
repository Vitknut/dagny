import { describe, expect, it } from 'vitest';
import { AREAS } from '../src/data/areas';
import { DIALOG } from '../src/data/dialog';
import { OVERWORLD } from '../src/data/overworld';
import { NPCS } from '../src/data/npcs';
import { PLACE_CHARS, TERRAIN } from '../src/data/terrain';
import { reachableTiles } from '../src/game/reach';

const t = OVERWORLD.tiles;
const W = t[0].length;
const H = t.length;
const at = (x: number, y: number): string => t[y]?.[x] ?? '^';

/** The treasures in the order they open the regions (the order is fixed: 1 → 7). */
const KEYS = ['eka', 'karbidlampa', 'stovlar', 'ficklampa', 'radio'];
const REGIONS = ['hemdalen', 'gruvbygden', 'kvarndalen', 'kusten', 'parkslätten', 'fäbodhöglandet'];

/** For every walkable tile, the region it belongs to: the first set of treasures that reaches it. */
const regionOf = new Map<string, number>();
for (let k = 0; k <= KEYS.length; k++) {
  for (const key of reachableTiles(KEYS.slice(0, k))) if (!regionOf.has(key)) regionOf.set(key, k);
}

const kind = (ch: string): 'B' | 'W' | 'L' => (TERRAIN[ch]?.blocked ? 'B' : ch === '~' ? 'W' : 'L');

describe('the overworld as landscape', () => {
  it('has no straight border or shore longer than six tiles', () => {
    const long: string[] = [];
    // Edges between rock/land/water, along rows and along columns (the outer frame's outer edge excluded).
    for (let y = 2; y < H - 3; y++) {
      let run = 0;
      let prev = '';
      for (let x = 0; x <= W; x++) {
        const e = x < W && kind(at(x, y)) !== kind(at(x, y + 1)) ? kind(at(x, y)) + kind(at(x, y + 1)) : '';
        run = e && e === prev ? run + 1 : e ? 1 : 0;
        if (run > 6) long.push(`row ${y} at x ${x} (${e})`);
        prev = e;
      }
    }
    for (let x = 2; x < W - 3; x++) {
      let run = 0;
      let prev = '';
      for (let y = 0; y <= H; y++) {
        const e = y < H && kind(at(x, y)) !== kind(at(x + 1, y)) ? kind(at(x, y)) + kind(at(x + 1, y)) : '';
        run = e && e === prev ? run + 1 : e ? 1 : 0;
        if (run > 6) long.push(`column ${x} at y ${y} (${e})`);
        prev = e;
      }
    }
    expect(long).toEqual([]);
  });

  it('is not mostly mountains: at most a fifth of the map', () => {
    expect(t.join('').split('^').length - 1).toBeLessThan(W * H * 0.22);
  });

  it('gives each border its own material', () => {
    const count = (chars: string, x0: number, y0: number, x1: number, y1: number): number => {
      let n = 0;
      for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) if (chars.includes(at(x, y))) n++;
      return n;
    };
    // Home ↔ the lake: shore and reeds, and jetties where the boat waits.
    expect(count('r', 20, 30, 34, 50)).toBeGreaterThan(3);
    expect(count('j', 0, 0, W - 1, H - 1)).toBeGreaterThan(1);
    // Mine ↔ mill: a fell with the mouths of Gamla stollen and its side gallery (and boarded-up old adits).
    expect(count('D', 55, 8, 70, 26)).toBe(3);
    expect(count('a', 55, 8, 70, 26)).toBeGreaterThan(0);
    // Mill ↔ coast: a wide marsh.
    expect(count('sv', 60, 26, 92, 48)).toBeGreaterThan(300);
    // Home ↔ park plain: rapids, and the bridge the flood took.
    expect(count('w', 28, 48, 40, 71)).toBeGreaterThan(30);
    expect(count('b', 28, 48, 40, 71)).toBeGreaterThan(0);
    // Home ↔ highlands: a spruce thicket with the hidden path.
    expect(count('F', 0, 20, 35, 34)).toBeGreaterThan(100);
    expect(count('H', 0, 20, 35, 34)).toBeGreaterThan(0);
    // Trollberget: dark cliffs, darker than the other mountains.
    expect(count('X', 34, 0, 60, 14)).toBeGreaterThan(30);
  });

  it('names every kind of ground it uses', () => {
    for (const ch of new Set(t.join(''))) {
      expect(TERRAIN[ch], `'${ch}'`).toBeDefined();
      expect(TERRAIN[ch].name.length).toBeGreaterThan(2);
    }
    // Fields have their own identities, not just "field".
    for (const ch of [':', 'm', 'l', 'h', 'g', 'd', 'k']) expect(t.join('')).toContain(ch);
  });

  it('nothing on the map looks like a place without being one', () => {
    const fakes: string[] = [];
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const looks = TERRAIN[at(x, y)]?.visitable || TERRAIN[at(x, y)]?.passage;
        if (looks && !OVERWORLD.places.some((p) => p.x === x && p.y === y)) fakes.push(`${at(x, y)} at ${x},${y}`);
      }
    }
    expect(fakes).toEqual([]);
  });

  it('every region has a small place with a task that rewards it (more may be there for the story or the view)', () => {
    const small = OVERWORLD.places.filter((p) => TERRAIN[at(p.x, p.y)]?.visitable && p.area);
    const rewardsOf = (areaId: string): number => {
      const area = AREAS[areaId];
      const npcs = Object.values(area.npcs ?? {}).map((id) => NPCS[id]);
      const dialogs = new Set<string>();
      const walk = (id: string | undefined): void => {
        if (!id || dialogs.has(id) || !DIALOG[id]) return;
        dialogs.add(id);
        walk(DIALOG[id].next);
        for (const c of DIALOG[id].choices ?? []) walk(c.next);
      };
      for (const n of npcs) for (const tk of n.talk) walk(tk.dialog);
      const fromDialog = [...dialogs].flatMap((id) => DIALOG[id].actions ?? []).filter((a) => a.type === 'container' || a.type === 'life');
      return fromDialog.length + (area.rewards?.length ?? 0);
    };
    for (let r = 0; r < REGIONS.length; r++) {
      const here = small.filter((p) => [[p.x + 1, p.y], [p.x - 1, p.y], [p.x, p.y + 1], [p.x, p.y - 1]].some(([a, b]) => regionOf.get(`${a},${b}`) === r));
      expect(here.some((p) => rewardsOf(p.area!) > 0), REGIONS[r]).toBe(true);
    }
    // Every visitable spot is a place to go into or a viewpoint.
    for (const p of OVERWORLD.places.filter((pl) => TERRAIN[at(pl.x, pl.y)]?.visitable)) expect(!!p.area || !!p.view, p.name).toBe(true);
  });

  it('never leaves a phone screen (20 × 11 tiles) without something new in sight', () => {
    const feature = (ch: string): boolean => !!TERRAIN[ch]?.landmark || PLACE_CHARS.includes(ch);
    const empty: string[] = [];
    for (const key of reachableTiles(KEYS)) {
      const [x, y] = key.split(',').map(Number);
      // On land; out on the water the shores and holms are in sight.
      if (at(x, y) === '~') continue;
      let seen = false;
      for (let dy = -5; dy <= 5 && !seen; dy++) for (let dx = -10; dx <= 10 && !seen; dx++) seen = feature(at(x + dx, y + dy));
      if (!seen) empty.push(key);
    }
    expect(empty).toEqual([]);
  });
});

describe('hidden places', () => {
  const hidden = OVERWORLD.places.filter((p) => p.hidden);
  const caves = ['tjuvgrottan', 'jattegrytan', 'bjorkhagen'].map((a) => OVERWORLD.places.find((p) => p.area === a)!);

  it('there are hidden places beyond the three known ones, one found by standing beside it and one with the radio', () => {
    // Väktarkammaren has a door on each side of the cliff: two places, one room.
    expect([...new Set(hidden.map((p) => `${p.hidden}:${p.area}`))].sort()).toEqual(['near:fallgrottan', 'near:havsgrottan', 'radio:vaktarkammaren']);
    for (const p of hidden) expect(AREAS[p.area!], p.area).toBeDefined();
  });

  it('every hidden place can be reached with the treasures Dagny has in the region where it lies', () => {
    for (const p of [...hidden, ...caves]) {
      // The region of the tile beside it, and its treasures.
      const beside = [[p.x + 1, p.y], [p.x - 1, p.y], [p.x, p.y + 1], [p.x, p.y - 1]].map(([a, b]) => regionOf.get(`${a},${b}`)).filter((r) => r !== undefined) as number[];
      expect(beside.length, p.name).toBeGreaterThan(0);
      const region = Math.min(...beside);
      const items = KEYS.slice(0, region);
      if (p.hidden === 'radio' && !items.includes('radio')) items.push('radio');
      expect(reachableTiles(items).has(`${p.x},${p.y}`), `${p.name} with ${items.join(', ') || 'nothing'}`).toBe(true);
    }
  });

  it('the door in the cliff stays shut without the radio', () => {
    const door = hidden.find((p) => p.hidden === 'radio')!;
    expect(TERRAIN[at(door.x, door.y)].needs).toBe('radio');
    expect(reachableTiles(KEYS.slice(0, 4)).has(`${door.x},${door.y}`)).toBe(false);
  });

  it('every hidden cave leads back out onto the map next to where it lies', () => {
    for (const p of hidden) {
      const a = AREAS[p.area!];
      // Out the way it came in – by the door on this side of the cliff.
      const exit = [a.left, a.right].filter((e) => e?.to === 'overworld').sort((e1, e2) => Math.abs(e1!.ow!.x - p.x) - Math.abs(e2!.ow!.x - p.x))[0]!;
      expect(Math.abs(exit.ow!.x - p.x) + Math.abs(exit.ow!.y - p.y), p.name).toBe(1);
      expect(TERRAIN[at(exit.ow!.x, exit.ow!.y)].blocked, p.name).toBeFalsy();
    }
  });
});
