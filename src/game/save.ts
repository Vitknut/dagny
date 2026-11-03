import type { KeyValueStore } from '../engine/storage';
import type { SkillId, SpellId, StatId } from '../data/types';
import { MAX_LEVEL, convertOldLevel } from '../data/progression';
import { OVERWORLD } from '../data/overworld';
import { SPELL_ORDER } from '../data/spells';
import { maxHp, maxMp } from './progression';
import { MAX_LIVES, START_LIVES, hpMax, mpMax, newGame, type GameState, type Location } from './state';
import { repairReach } from './reach';
import { markExplored } from './explored';
import { TEMPLES } from '../data/temples';

/** Bump when the format changes, and add a migration below. */
export const SAVE_VERSION = 4;
export const SAVE_KEY = 'dagny.save';

export interface SaveFile {
  v: number;
  savedAt: number;
  state: GameState;
}

export function serialize(state: GameState, now = Date.now()): string {
  const file: SaveFile = { v: SAVE_VERSION, savedAt: now, state };
  return JSON.stringify(file);
}

/** Containers once handed out in a dialog, now lying in the room: the same container under its new id. */
const MOVED_CONTAINERS: Readonly<Record<string, string>> = {
  'liv:kyrkogarden': 'liv:kyrkogarden:21,9',
  'magi:kolartorpet': 'magi:kolartorpet:17,9',
  'liv:fabodtorpet': 'liv:fabodtorpet:17,9',
};

const isObj = (x: unknown): x is Record<string, unknown> => typeof x === 'object' && x !== null && !Array.isArray(x);
const num = (x: unknown, d: number): number => (typeof x === 'number' && Number.isFinite(x) ? x : d);
const strArr = (x: unknown): string[] => (Array.isArray(x) ? x.filter((v): v is string => typeof v === 'string') : []);

function loc(x: unknown, d: Location): Location {
  if (!isObj(x) || typeof x.area !== 'string') return d;
  return { area: x.area, x: num(x.x, d.x), y: num(x.y, d.y) };
}

/** Old formats → current. Version 0 = before versioning (never released). */
function migrate(file: Record<string, unknown>): Record<string, unknown> {
  const v = num(file.v, 0);
  if (v > SAVE_VERSION) throw new Error('Sparfilen kommer från en nyare version');
  // Version 2: levels go to 12 instead of 8 – stretch them so nobody loses strength.
  if (v < 2 && isObj(file.state) && isObj(file.state.levels)) {
    const lv = file.state.levels;
    for (const k of ['styrka', 'magi', 'liv']) lv[k] = convertOldLevel(num(lv[k], 1));
  }
  // Version 3 (a larger overworld) and 4 (Kartan 2.0, 96 × 72): old map
  // positions don't fit, so Dagny is put beside the village she last rested
  // in (or Mormors by), and what she had seen is counted again on the new map.
  if (v < 4 && isObj(file.state)) {
    const st = file.state;
    const villageArea = typeof st.lastVillage === 'string' ? st.lastVillage : 'mormors_by';
    const place = OVERWORLD.places.find((p) => p.area === villageArea) ?? OVERWORLD.places.find((p) => p.area === 'mormors_by')!;
    const spot = { x: place.x, y: place.y + 1 };
    st.ow = spot;
    if (isObj(st.loc) && st.loc.area === 'overworld') st.loc = { area: 'overworld', x: spot.x, y: spot.y };
    delete st.explored;
  }
  return file;
}

/**
 * Parses and validates a save. Unknown or broken fields fall back to new-game
 * defaults, so a damaged save never crashes the game. Returns null if the
 * text is not a save at all.
 */
export function deserialize(text: string | null): SaveFile | null {
  if (!text) return null;
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    return null;
  }
  if (!isObj(raw) || !isObj(raw.state)) return null;
  let file: Record<string, unknown>;
  try {
    file = migrate(raw);
  } catch {
    return null;
  }
  const s = file.state as Record<string, unknown>;
  const d = newGame();
  const lv = isObj(s.levels) ? s.levels : {};
  const level = (k: StatId): number => Math.max(1, Math.min(MAX_LEVEL, Math.floor(num(lv[k], 1))));
  const levels = { styrka: level('styrka'), magi: level('magi'), liv: level('liv') };
  const spells = strArr(s.spells).filter((x): x is SpellId => (SPELL_ORDER as readonly string[]).includes(x));
  const skills = strArr(s.skills).filter((x): x is SkillId => x === 'nedatstot' || x === 'uppatstot');
  const selected = typeof s.selectedSpell === 'string' && spells.includes(s.selectedSpell as SpellId)
    ? (s.selectedSpell as SpellId)
    : spells[0] ?? null;
  const keys: Record<string, number> = {};
  if (isObj(s.keys)) for (const [k, v] of Object.entries(s.keys)) keys[k] = Math.max(0, Math.floor(num(v, 0)));
  const owRaw = isObj(s.ow) ? s.ow : {};
  const state: GameState = {
    hp: Math.max(1, Math.min(maxHp(levels.liv), num(s.hp, d.hp))),
    mp: Math.max(0, Math.min(maxMp(levels.magi), num(s.mp, d.mp))),
    xp: Math.max(0, Math.floor(num(s.xp, 0))),
    levels,
    spells,
    selectedSpell: selected,
    skills,
    items: strArr(s.items),
    keys,
    flags: strArr(s.flags),
    opened: strArr(s.opened),
    loc: loc(s.loc, d.loc),
    ow: { x: Math.floor(num(owRaw.x, d.ow.x)), y: Math.floor(num(owRaw.y, d.ow.y)) },
    lastVillage: typeof s.lastVillage === 'string' ? s.lastVillage : d.lastVillage,
    checkpoint: s.checkpoint === null || s.checkpoint === undefined ? null : loc(s.checkpoint, d.loc),
    playTime: Math.max(0, num(s.playTime, 0)),
    containers: [...new Set(strArr(s.containers).filter((c) => /^(liv|magi):./.test(c)).map((c) => MOVED_CONTAINERS[c] ?? c))],
    // Saves from before lives existed start with a full set.
    lives: Math.max(1, Math.min(MAX_LIVES, Math.floor(num(s.lives, START_LIVES)))),
    explored: typeof s.explored === 'string' ? s.explored.replace(/[^A-Za-z0-9_-]/g, '').slice(0, 1200) : '',
  };
  state.hp = Math.max(1, Math.min(hpMax(state), num(s.hp, d.hp)));
  state.mp = Math.max(0, Math.min(mpMax(state), num(s.mp, d.mp)));
  // Never leave Dagny where she can't get out with what she carries.
  repairReach(state);
  // Saves from before the map remembered what Dagny had seen: count where
  // she stands, where she last rested and the temples she has restored.
  if (typeof s.explored !== 'string') {
    markExplored(state, state.ow.x, state.ow.y);
    for (const p of OVERWORLD.places) {
      const temple = TEMPLES.find((t) => t.entryArea === p.area);
      if (p.area === state.lastVillage || (temple && state.flags.includes(`${temple.id}_klar`))) markExplored(state, p.x, p.y);
    }
  }
  return { v: SAVE_VERSION, savedAt: num(file.savedAt, 0), state };
}

export function writeSave(store: KeyValueStore, state: GameState): boolean {
  return store.set(SAVE_KEY, serialize(state));
}

export function readSave(store: KeyValueStore): SaveFile | null {
  return deserialize(store.get(SAVE_KEY));
}

export function hasSave(store: KeyValueStore): boolean {
  return readSave(store) !== null;
}
