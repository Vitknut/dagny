import { describe, expect, it } from 'vitest';
import { COSTS, MAX_HP, MAX_LEVEL, MAX_MP, SWORD_DAMAGE, convertOldLevel } from '../src/data/progression';
import { affordable, canLevelUp, damageTaken, nextCost, nextTarget, raise, type Levels } from '../src/game/progression';

describe('XP curve', () => {
  it('has a cost for every level step and rises strictly', () => {
    for (const costs of Object.values(COSTS)) {
      expect(costs.length).toBe(MAX_LEVEL - 1);
      for (let i = 1; i < costs.length; i++) expect(costs[i]).toBeGreaterThan(costs[i - 1]);
    }
  });

  it('per-level tables cover all eight levels', () => {
    expect(SWORD_DAMAGE.length).toBe(MAX_LEVEL);
    expect(MAX_HP.length).toBe(MAX_LEVEL);
    expect(MAX_MP.length).toBe(MAX_LEVEL);
  });

  it('nextCost is null at max level', () => {
    expect(nextCost('styrka', 1)).toBe(COSTS.styrka[0]);
    expect(nextCost('liv', MAX_LEVEL)).toBeNull();
  });
});

describe('raising stats', () => {
  it('raises the level and spends all the XP, as in Zelda II', () => {
    const lv: Levels = { styrka: 1, magi: 1, liv: 1 };
    const xp = raise(100, lv, 'magi');
    expect(COSTS.magi[0]).toBeLessThan(100);
    expect(lv.magi).toBe(2);
    expect(xp).toBe(0);
  });

  it('refuses when there is not enough XP', () => {
    const lv: Levels = { styrka: 1, magi: 1, liv: 1 };
    expect(raise(10, lv, 'styrka')).toBe(10);
    expect(lv.styrka).toBe(1);
  });

  it('never goes past level 8', () => {
    const lv: Levels = { styrka: MAX_LEVEL, magi: 1, liv: 1 };
    expect(raise(99999, lv, 'styrka')).toBe(99999);
    expect(lv.styrka).toBe(MAX_LEVEL);
  });

  it('reports what is affordable', () => {
    const lv: Levels = { styrka: 1, magi: 1, liv: 1 };
    expect(canLevelUp(0, lv)).toBe(false);
    expect(affordable(COSTS.magi[0], lv).sort()).toEqual(['liv', 'magi']);
    expect(nextTarget(lv)).toBe(Math.min(COSTS.styrka[0], COSTS.magi[0], COSTS.liv[0]));
    expect(nextTarget({ styrka: MAX_LEVEL, magi: MAX_LEVEL, liv: MAX_LEVEL })).toBeNull();
  });
});

describe('damage', () => {
  it('calm mode and Skydd each halve damage, never below 1', () => {
    expect(damageTaken(4, false, false)).toBe(4);
    expect(damageTaken(4, true, false)).toBe(2);
    expect(damageTaken(4, true, true)).toBe(1);
    expect(damageTaken(1, true, true)).toBe(1);
  });
});

describe('the 12-level scale (version 1.1)', () => {
  it('old 8-step levels are stretched to the new scale, ends kept', () => {
    expect(convertOldLevel(1)).toBe(1);
    expect(convertOldLevel(8)).toBe(MAX_LEVEL);
    for (let l = 1; l < 8; l++) expect(convertOldLevel(l + 1)).toBeGreaterThan(convertOldLevel(l));
  });

  it('a converted level is never weaker than before', () => {
    const OLD_HP = [8, 10, 12, 14, 16, 18, 20, 24];
    const OLD_MP = [4, 5, 6, 7, 8, 9, 10, 12];
    const OLD_DMG = [2, 3, 4, 5, 6, 8, 10, 12];
    for (let l = 1; l <= 8; l++) {
      const n = convertOldLevel(l) - 1;
      expect(MAX_HP[n], `liv ${l}`).toBeGreaterThanOrEqual(OLD_HP[l - 1]);
      expect(MAX_MP[n], `magi ${l}`).toBeGreaterThanOrEqual(OLD_MP[l - 1]);
      expect(SWORD_DAMAGE[n], `styrka ${l}`).toBeGreaterThanOrEqual(OLD_DMG[l - 1]);
    }
  });

  it('values never go down with level, and the top values stay the same', () => {
    for (const arr of [MAX_HP, MAX_MP, SWORD_DAMAGE]) for (let i = 1; i < arr.length; i++) expect(arr[i]).toBeGreaterThanOrEqual(arr[i - 1]);
    expect(MAX_HP.at(-1)).toBe(24);
    expect(MAX_MP.at(-1)).toBe(12);
    expect(SWORD_DAMAGE.at(-1)).toBe(12);
  });
});
