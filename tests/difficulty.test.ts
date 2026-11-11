import { describe, expect, it } from 'vitest';
import { TEMPLES } from '../src/data/temples';
import { bossBonus, roomTier, templeBonus } from '../src/game/side/room';
import { AREAS } from '../src/data/areas';
import { BOSSES, ENEMIES } from '../src/data/enemies';
import { ENEMY_CHARS } from '../src/data/legend';
import { EXPECTED_SWORD, SCALE_FROM_TIER, enemyWeight, lifeAtTier } from '../src/data/progression';
import type { AreaDef } from '../src/data/types';
import { Enemy } from '../src/entities/enemy';
import { areaTier, tierAt } from '../src/game/reach';
import { OVERWORLD } from '../src/data/overworld';

describe('each temple hits harder than the one before (as in Zelda II)', () => {
  it('ordinary creatures: +0, +0, +1, +1, +2, +2, +3', () => {
    const byNumber = [...TEMPLES].sort((a, b) => a.number - b.number);
    expect(byNumber.map((t) => templeBonus(t.id))).toEqual([0, 0, 1, 1, 2, 2, 3]);
    expect(templeBonus(undefined)).toBe(0);
  });

  it('guardians: 3, 3, 4, 4, 5, 5, 6 with a touch', () => {
    const byNumber = [...TEMPLES].sort((a, b) => a.number - b.number);
    const touch = byNumber.map((t) => BOSSES[t.boss].damage + bossBonus(t.id, BOSSES[t.boss].damage));
    expect(touch).toEqual([3, 3, 4, 4, 5, 5, 6]);
  });
});

describe('creatures grow with Dagny (life and XP), as in Zelda II', () => {
  const ordinary = (id: string): boolean => !!ENEMIES[id] && ENEMIES[id].behavior !== 'shadow';
  const blowsIn = (tier: number, areas: AreaDef[]): Array<{ id: string; blows: number }> => {
    const out: Array<{ id: string; blows: number }> = [];
    for (const a of areas) {
      for (const row of a.tiles) {
        for (const ch of row) {
          const id = ENEMY_CHARS[ch];
          if (id && ordinary(id)) out.push({ id, blows: Math.ceil(lifeAtTier(ENEMIES[id], tier) / EXPECTED_SWORD[tier - 1]) });
        }
      }
    }
    return out;
  };
  const median = (xs: number[]): number => [...xs].sort((a, b) => a - b)[Math.floor(xs.length / 2)];

  it('in every temple an ordinary creature takes two to four blows, and none becomes a sponge', () => {
    for (const t of TEMPLES) {
      const all = blowsIn(t.number, Object.values(AREAS).filter((a) => a.temple === t.id));
      const m = median(all.map((b) => b.blows));
      expect(m, t.id).toBeGreaterThanOrEqual(t.number >= SCALE_FROM_TIER ? 2 : 1);
      expect(m, t.id).toBeLessThanOrEqual(4);
      for (const b of all) {
        const heavy = enemyWeight(ENEMIES[b.id]) === 'heavy';
        expect(b.blows, `${t.id} ${b.id}`).toBeLessThanOrEqual(heavy ? 10 : 6);
      }
    }
  });

  it('the first two temples are left as they were tuned', () => {
    for (const e of Object.values(ENEMIES)) {
      expect(lifeAtTier(e, 1)).toBe(e.hp);
      expect(lifeAtTier(e, 2)).toBe(e.hp);
    }
  });

  it('a creature that grows is worth more XP in step', () => {
    const vatte = new Enemy(ENEMIES.vatte, 0, 0);
    vatte.scaleTo(lifeAtTier(ENEMIES.vatte, 6));
    expect(vatte.maxHp).toBeGreaterThan(ENEMIES.vatte.hp);
    expect(vatte.xp).toBe(Math.round((ENEMIES.vatte.xp * vatte.maxHp) / ENEMIES.vatte.hp));
  });

  it('a meeting on the map takes the tier of the region it started in', () => {
    const meeting = (tier: number | undefined) => ({ area: AREAS.mote_skog, spawnTier: tier }) as unknown as Parameters<typeof roomTier>[0];
    expect(roomTier(meeting(5))).toBe(5);
    expect(roomTier(meeting(undefined))).toBe(1);
    expect(tierAt(OVERWORLD.start.x, OVERWORLD.start.y)).toBe(1);
  });

  it('caves and small places take the tier of where they lie on the map', () => {
    expect(areaTier('krypta_2')).toBe(1);
    expect(areaTier('dagmars_ort')).toBe(2);
    expect(areaTier('ronnen')).toBe(3);
    expect(areaTier('tjuvgrottan_3')).toBe(4);
    expect(areaTier('arlskaret')).toBe(4);
    expect(areaTier('uvberget')).toBe(6);
    expect(areaTier('troll_2')).toBe(7);
    for (const a of Object.values(AREAS)) expect(areaTier(a.id), a.id).toBeGreaterThanOrEqual(1);
  });
});

describe('temples are full enough to fight through (temple 3 on)', () => {
  const rooms = Object.values(AREAS).filter((a) => {
    const t = TEMPLES.find((x) => x.id === a.temple);
    return !!t && t.number >= SCALE_FROM_TIER && !a.sealed && !a.tiles.join('').includes('B');
  });
  const enemiesIn = (a: AreaDef): Array<[number, number]> => {
    const out: Array<[number, number]> = [];
    a.tiles.forEach((row, y) => [...row].forEach((ch, x) => ENEMY_CHARS[ch] && out.push([x, y])));
    return out;
  };

  it("every room but the guardian's has at least one creature per ten tiles", () => {
    for (const a of rooms) {
      const size = Math.max(a.tiles[0].length, a.tiles.length);
      expect(enemiesIn(a).length, a.id).toBeGreaterThanOrEqual(Math.ceil(size / 10));
    }
  });

  it('no creature waits right where Dagny comes in', () => {
    // The markers some way leads in at (an exit's `entry`), and the room's left-hand entrance.
    const arrivals = new Map<string, Set<string>>();
    for (const r of Object.values(AREAS)) {
      for (const ex of [r.left, r.right, ...Object.values(r.doors ?? {})]) {
        if (ex?.to && ex.to !== 'overworld') (arrivals.get(ex.to) ?? arrivals.set(ex.to, new Set()).get(ex.to)!).add(ex.entry ?? 'A');
      }
    }
    for (const a of rooms) {
      const marks = arrivals.get(a.id) ?? new Set(['A']);
      marks.add('A');
      const ways: Array<[number, number]> = [];
      a.tiles.forEach((row, y) => [...row].forEach((ch, x) => marks.has(ch) && ways.push([x, y])));
      for (const [ex, ey] of enemiesIn(a)) {
        for (const [wx, wy] of ways) expect(Math.abs(ex - wx) < 5 && Math.abs(ey - wy) < 3, `${a.id}: creature at ${ex},${ey} by the way in at ${wx},${wy}`).toBe(false);
      }
    }
  });
});
