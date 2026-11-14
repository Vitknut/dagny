import { describe, expect, it } from 'vitest';
import { AREAS } from '../src/data/areas';
import { SPELLS } from '../src/data/spells';
import type { AreaDef } from '../src/data/types';
import { blocks, type Has } from '../src/tools/playthrough';

/**
 * The rule of three (förbättringsplanen, fas 3): every ability that opens
 * the world is wanted in at least three rooms, one of them in Trollberget,
 * and in each of those rooms it really guards something.
 */

const ABILITIES = ['hopp', 'hamn', 'aska', 'eld', 'lyse', 'uppatstot', 'nedatstot'] as const;
type Ability = (typeof ABILITIES)[number];
const SKILLS = new Set<string>(['uppatstot', 'nedatstot']);
/** Tile characters that only one ability gets past (game/side/obstacles.ts, and the hatch). */
const BARRIER: Readonly<Record<string, Ability>> = { '!': 'uppatstot', _: 'nedatstot', '(': 'eld', '[': 'aska' };
/** Something worth reaching. */
const TREASURE = /[bTghpk+q]/;

function roomsWanting(): Record<Ability, string[]> {
  const uses = Object.fromEntries(ABILITIES.map((k) => [k, [] as string[]])) as Record<Ability, string[]>;
  for (const a of Object.values(AREAS)) {
    const here = new Set<Ability>();
    for (const n of a.needs ?? []) here.add(n.ability as Ability);
    for (const r of a.tiles) for (const ch of r) if (BARRIER[ch]) here.add(BARRIER[ch]);
    for (const k of here) uses[k].push(a.id);
  }
  return uses;
}

/** Cells reachable from the room's ways in, with everything but `without`. */
function reach(a: AreaDef, without: Ability | null): Set<number> {
  const w = a.tiles[0].length;
  const h = a.tiles.length;
  const spells = new Set<string>(Object.keys(SPELLS));
  const skills = new Set(SKILLS);
  if (without) {
    spells.delete(without);
    skills.delete(without);
  }
  const has: Has = { items: new Set(['radio']), spells, skills, unlocked: () => true };
  const stack: number[] = [];
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const ch = a.tiles[y][x];
      if ((x === 0 && a.left) || (x === w - 1 && a.right) || (/[A-Z@]/.test(ch) && !'LXTMB'.includes(ch))) stack.push(y * w + x);
    }
  }
  const seen = new Set<number>();
  while (stack.length) {
    const i = stack.pop()!;
    const x = i % w;
    const y = (i - x) / w;
    if (seen.has(i) || blocks(a, x, y, has)) continue;
    seen.add(i);
    if (x + 1 < w) stack.push(i + 1);
    if (x > 0) stack.push(i - 1);
    if (y + 1 < h) stack.push(i + w);
    if (y > 0) stack.push(i - w);
  }
  return seen;
}

describe('the rule of three', () => {
  const uses = roomsWanting();

  for (const k of ABILITIES) {
    it(`${k} is wanted in three rooms or more, one of them in Trollberget`, () => {
      expect(uses[k].length, `${k}: ${uses[k].join(', ')}`).toBeGreaterThanOrEqual(3);
      expect(
        uses[k].some((id) => AREAS[id].temple === 'trollberget'),
        `${k}: ${uses[k].join(', ')}`,
      ).toBe(true);
    });

    it(`where ${k} is wanted, something lies that only ${k} reaches`, () => {
      for (const id of uses[k]) {
        const a = AREAS[id];
        const all = reach(a, null);
        const less = reach(a, k);
        const w = a.tiles[0].length;
        const behind = [...all].filter((i) => !less.has(i));
        // Dance floors and the like guard the way on rather than a treasure: the room's far side.
        const guards = behind.some((i) => TREASURE.test(a.tiles[Math.floor(i / w)][i % w]) || i % w === w - 1 || /[A-Z]/.test(a.tiles[Math.floor(i / w)][i % w]));
        expect(guards, `${id}: nothing behind ${k}`).toBe(true);
      }
    });
  }
});
