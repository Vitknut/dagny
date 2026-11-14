import type { EnemyDef, StatId } from './types';

/** Highest level for Styrka, Magi and Liv. */
export const MAX_LEVEL = 12;

/** The level cap before version 1.1 (saves from then are converted). */
export const OLD_MAX_LEVEL = 8;

/**
 * Rising XP curve: the XP needed to raise a stat from level n to n+1 is
 * COSTS[stat][n − 1]. Raising a level spends all the XP (it starts again from 0,
 * as in Zelda II), so waiting to save up for a dearer level is a real choice.
 */
export const COSTS: Readonly<Record<StatId, readonly number[]>> = {
  styrka: [80, 180, 320, 500, 750, 1050, 1450, 1900, 2450, 3100, 3900],
  magi: [60, 140, 260, 420, 620, 880, 1200, 1600, 2100, 2700, 3400],
  liv: [60, 140, 260, 420, 620, 880, 1200, 1600, 2100, 2700, 3400],
};

/**
 * Each temple hits harder than the one before, as in Zelda II: extra damage
 * for the ordinary creatures in temple 1–7 (index = temple number − 1), and
 * what each temple's guardian does with a touch.
 */
export const TEMPLE_ENEMY_BONUS = [0, 0, 1, 1, 2, 2, 3];
export const TEMPLE_BOSS_DAMAGE = [3, 3, 4, 4, 5, 5, 6];

/**
 * Creatures grow with Dagny, as in Zelda II. The sword damage she is expected
 * to have when she reaches temple 1–7 (from playtests: Styrka 1, 2, 3, 5, 6,
 * 7, 8 and the blade upgrades found by then), and how many blows a creature
 * should take at that damage: a light flier, an ordinary one, a heavy one.
 */
export const EXPECTED_SWORD = [2, 2, 4, 6, 8, 9, 10];
export const TARGET_BLOWS = { light: 2, normal: 3, heavy: 5 } as const;
/** The first temples are tuned by hand (and playtested); the staircase starts here. */
export const SCALE_FROM_TIER = 3;

export function enemyWeight(def: EnemyDef): keyof typeof TARGET_BLOWS {
  return def.behavior === 'tank' ? 'heavy' : def.flying ? 'light' : 'normal';
}

/**
 * Life of a creature met at tier 1–7 (a temple's number, or the temple of the
 * region it is met in): its own, or enough to take its target number of
 * blows at the expected damage, whichever is more. Dagny's own shadow is
 * left as it is.
 */
export function lifeAtTier(def: EnemyDef, tier: number): number {
  if (tier < SCALE_FROM_TIER || def.behavior === 'shadow') return def.hp;
  const dmg = EXPECTED_SWORD[Math.min(EXPECTED_SWORD.length, tier) - 1];
  return Math.max(def.hp, (TARGET_BLOWS[enemyWeight(def)] - 1) * dmg + Math.ceil(dmg / 2));
}

/** Sword damage per Styrka level. */
export const SWORD_DAMAGE = [2, 2, 3, 4, 4, 5, 6, 7, 8, 10, 11, 12];
/** Max health per Liv level (one point = half a heart segment on the HUD). */
export const MAX_HP = [8, 9, 10, 12, 13, 14, 16, 17, 18, 20, 22, 24];
/** Extra max health per life container ("livbehållare"), on top of the Liv level. */
export const CONTAINER_HP = 2;
/** Extra max magic per magic container ("magibehållare"), on top of the Magi level. */
export const CONTAINER_MP = 1;
/** Max magic per Magi level. */
export const MAX_MP = [4, 5, 5, 6, 7, 7, 8, 9, 9, 10, 11, 12];

export const STAT_NAMES: Readonly<Record<StatId, string>> = {
  styrka: 'Styrka',
  magi: 'Magi',
  liv: 'Liv',
};

/** Converts a level from the old 8-step scale to the 12-step one (8 → 12). */
export function convertOldLevel(old: number): number {
  const l = Math.max(1, Math.min(OLD_MAX_LEVEL, Math.floor(old)));
  return Math.round(((l - 1) * (MAX_LEVEL - 1)) / (OLD_MAX_LEVEL - 1)) + 1;
}
