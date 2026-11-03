import { Kind, type TileKind } from '../engine/collision';

/**
 * Characters used in side-view tile maps (AreaDef.tiles).
 *
 *  .  empty              #  ground (theme: grass/dirt, cobbles, brick)
 *  =  one-way platform   ^  spikes (hazard)       ~  water (hazard)
 *  n  nettles (hazard)   L  locked door (needs a key)
 *  k  key                c  checkpoint candle (unlit until touched)
 *  X  altar with the area's treasure
 *  @  default start      A–Z (except L, X)  doors / entry markers
 *  1–9  NPCs (AreaDef.npcs)
 *  v vätte  V gravvätte  l lyktgubbe  t tomtenisse  m myrkatt  r kråka
 *  s stenknekt  j sjörå-skott  w skuggvarg  f fladdermus  u gruvvätte  z kvarnnisse  e mås  B boss
 *  d dansgast  i fiolspöke  y dimvätte  x strandkrabba  o stubbtroll  a bergtroll
 *  *  Skuggan (Dagny's shadow, Trollberget)
 *  b bulle  T termos  g lingon  M Murre the cat (side quest)
 *  q the area's quest item (AreaDef.questItem)
 *  %  &  dance-floor squares that come and go with the beat (AreaDef.beat)
 *  ?  hidden passage: looks solid until Dagny carries the transistor radio
 *  h  life container (livbehållare)   p  magic container (magibehållare)
 *  +  näverdocka – an extra life (taken once)
 *  !  hatch in a floor: solid until struck from below with Uppåtstöt (opened once)
 */
export const ENEMY_CHARS: Readonly<Record<string, string>> = {
  v: 'vatte',
  V: 'vatteGra',
  l: 'lyktgubbe',
  t: 'nisse',
  m: 'myrkatt',
  r: 'kraka',
  s: 'stenknekt',
  j: 'sjora',
  w: 'skuggvarg',
  f: 'fladdermus',
  u: 'gruvvatte',
  z: 'kvarnnisse',
  e: 'mas',
  d: 'dansgast',
  i: 'fiolspoke',
  y: 'dimvatte',
  x: 'strandkrabba',
  o: 'stubbtroll',
  a: 'bergtroll',
  '*': 'skuggan',
};

export const PICKUP_CHARS: Readonly<Record<string, 'bulle' | 'termos' | 'lingon'>> = {
  b: 'bulle',
  T: 'termos',
  g: 'lingon',
};

export interface Theme {
  top: string;
  fill: string;
  platform: string;
}

export const THEMES: Readonly<Record<string, Theme>> = {
  meadow: { top: 'grass', fill: 'dirt', platform: 'log' },
  village: { top: 'road', fill: 'dirt', platform: 'plank' },
  crypt: { top: 'brickTop', fill: 'brick', platform: 'ledge' },
  mine: { top: 'rockTop', fill: 'rock', platform: 'beam' },
  mill: { top: 'millTop', fill: 'millStone', platform: 'plank' },
  skar: { top: 'graniteTop', fill: 'granite', platform: 'plank' },
  fyr: { top: 'fyrFloor', fill: 'whiteStone', platform: 'plank' },
  park: { top: 'boardwalk', fill: 'dirt', platform: 'plank' },
  skog: { top: 'mossTop', fill: 'peat', platform: 'log' },
  berg: { top: 'bergTop', fill: 'bergRock', platform: 'beam' },
};

/** Collision kind for a tile-layer character. */
export function kindOf(ch: string): TileKind {
  switch (ch) {
    case '#':
    case 'L':
    case '?':
    case '!':
      return Kind.Solid;
    case '%':
    case '&':
      return Kind.OneWay;
    case '=':
      return Kind.OneWay;
    case '^':
    case '~':
    case 'n':
      return Kind.Hazard;
    default:
      return Kind.Empty;
  }
}

/** Background decor characters (AreaDef.deco) → sprite id. */
export const DECO: Readonly<Record<string, string>> = {
  w: 'wall',
  '[': 'corner',
  ']': 'cornerR',
  o: 'window',
  d: 'doorTop',
  D: 'doorBottom',
  '/': 'roofL',
  '-': 'roof',
  '\\': 'roofR',
  h: 'chimney',
  f: 'fence',
  '*': 'flowers',
  b: 'bgBrick',
  p: 'pillar',
  '(': 'archL',
  ')': 'archR',
  C: 'candle',
  s: 'stainedGlass',
  c: 'coffin',
  x: 'web',
  r: 'bgRock',
  '|': 'support',
  T: 'supportTop',
  _: 'rail',
  a: 'ore',
  O: 'lantern',
  W: 'wallY',
  '{': 'cornerY',
  '}': 'cornerRY',
  Q: 'windowY',
  e: 'doorTopY',
  E: 'doorBottomY',
  m: 'millWall',
  F: 'fall',
  g: 'gear',
  k: 'sack',
  i: 'millWindow',
  y: 'fyrWall',
  P: 'porthole',
  R: 'railing',
  L: 'lens',
  N: 'net',
  u: 'bulbs',
  U: 'parkFence',
  K: 'booth',
  S: 'stage',
  t: 'trunk',
  B: 'boughs',
  A: 'pathArch',
  G: 'timber',
  Z: 'turfRoof',
  j: 'turfRoofL',
  l: 'turfRoofR',
  z: 'turfTop',
  H: 'turfTopL',
  I: 'turfTopR',
  X: 'crystal',
  J: 'throne',
  '1': 'tunnelTop',
  '2': 'tunnelBottom',
  v: 'wallW',
  '<': 'cornerW',
  '>': 'cornerRW',
  V: 'windowW',
  n: 'wallB',
  '!': 'cornerB',
  $: 'cornerRB',
  q: 'windowB',
};

/** Foreground layer characters (AreaDef.front) → sprite id. */
export const FRONT: Readonly<Record<string, string>> = {
  f: 'foliage',
  F: 'fern',
};
