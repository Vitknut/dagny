import { describe, expect, it } from 'vitest';
import { BOSSES } from '../src/data/enemies';
import { TEMPLES } from '../src/data/temples';
import { bossBonus, templeBonus } from '../src/game/side/room';

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
