import type { BossDef, EnemyDef } from './types';

/** Väsen are defined here and reused with variations. */
export const ENEMIES: Readonly<Record<string, EnemyDef>> = {
  vatte: {
    id: 'vatte', name: 'Vätte', sprite: 'vatte', behavior: 'walker',
    hp: 4, damage: 1, xp: 5, speed: 0.45,
    box: { x: 3, y: 4, w: 10, h: 12 }, puff: 'moss',
    drops: { bulle: 0.25, lingon: 0.1 },
    befriend: 'Vätten nyser, skakar på huvudet och travar hem till sin tuva.',
  },
  vatteGra: {
    id: 'vatteGra', name: 'Gravvätte', sprite: 'vatteGra', behavior: 'walker',
    hp: 6, damage: 2, xp: 8, speed: 0.55,
    box: { x: 3, y: 4, w: 10, h: 12 }, puff: 'mist',
    drops: { bulle: 0.3, termos: 0.1 },
  },
  lyktgubbe: {
    id: 'lyktgubbe', name: 'Lyktgubbe', sprite: 'lyktgubbe', behavior: 'floater',
    hp: 2, damage: 1, xp: 6, speed: 0.6,
    box: { x: 2, y: 2, w: 8, h: 8 }, puff: 'mist', flying: true,
    drops: { termos: 0.3 },
  },
  nisse: {
    id: 'nisse', name: 'Tomtenisse-krigare', sprite: 'nisse', behavior: 'parrier',
    hp: 8, damage: 2, xp: 20, speed: 0.5,
    box: { x: 3, y: 4, w: 10, h: 20 }, puff: 'leaf',
    drops: { bulle: 0.4, lingon: 0.25 },
    befriend: 'Nissen bugar djupt. Han ska vakta gården igen, som förr.',
  },
  myrkatt: {
    id: 'myrkatt', name: 'Myrkatt', sprite: 'myrkatt', behavior: 'hopper',
    hp: 5, damage: 2, xp: 12, speed: 1.2,
    box: { x: 2, y: 4, w: 12, h: 8 }, puff: 'moss',
    drops: { bulle: 0.3 },
  },
  kraka: {
    id: 'kraka', name: 'Kråka', sprite: 'kraka', behavior: 'diver',
    hp: 3, damage: 1, xp: 8, speed: 1.4,
    box: { x: 2, y: 2, w: 12, h: 8 }, puff: 'leaf', flying: true,
    drops: { bulle: 0.2 },
  },
  stenknekt: {
    id: 'stenknekt', name: 'Stenknekt', sprite: 'stenknekt', behavior: 'tank',
    hp: 18, damage: 2, xp: 30, speed: 0.25,
    box: { x: 1, y: 1, w: 13, h: 23 }, puff: 'moss', heavy: true, nudge: 1.8,
    drops: { lingon: 0.4, termos: 0.3 },
  },
  sjora: {
    id: 'sjora', name: 'Sjörå-skott', sprite: 'sjora', behavior: 'shooter',
    hp: 5, damage: 2, xp: 15, speed: 0,
    box: { x: 3, y: 2, w: 10, h: 14 }, puff: 'mist', heavy: true,
    drops: { termos: 0.35 },
  },
  gruvvatte: {
    id: 'gruvvatte', name: 'Gruvvätte', sprite: 'gruvvatte', behavior: 'walker',
    hp: 7, damage: 2, xp: 10, speed: 0.6,
    box: { x: 3, y: 4, w: 10, h: 12 }, puff: 'moss',
    drops: { bulle: 0.3, termos: 0.15 },
    befriend: 'Gruvvätten lyfter på mössan och försvinner in i en spricka i berget.',
  },
  fladdermus: {
    id: 'fladdermus', name: 'Fladdermus', sprite: 'fladdermus', behavior: 'diver',
    hp: 3, damage: 2, xp: 9, speed: 1.6,
    box: { x: 3, y: 2, w: 10, h: 6 }, puff: 'mist', flying: true,
    drops: { termos: 0.2 },
  },
  kvarnnisse: {
    id: 'kvarnnisse', name: 'Kvarnnisse', sprite: 'kvarnnisse', behavior: 'parrier',
    hp: 10, damage: 2, xp: 24, speed: 0.55,
    box: { x: 3, y: 4, w: 10, h: 20 }, puff: 'mist',
    drops: { bulle: 0.4, termos: 0.2 },
    befriend: 'Kvarnnissen dammar av mjölet och går för att smörja kugghjulen.',
  },
  mas: {
    id: 'mas', name: 'Mås', sprite: 'mas', behavior: 'diver',
    hp: 4, damage: 2, xp: 12, speed: 1.7,
    box: { x: 2, y: 2, w: 12, h: 8 }, puff: 'mist', flying: true,
    drops: { bulle: 0.25, termos: 0.15 },
  },
  // --- Each temple's own väsen ---------------------------------------------------
  dansgast: {
    id: 'dansgast', name: 'Dansgasten', sprite: 'dansgast', behavior: 'waltzer',
    hp: 7, damage: 2, xp: 22, speed: 0.7,
    box: { x: 3, y: 3, w: 10, h: 19 }, puff: 'mist', flying: true,
    drops: { termos: 0.3, bulle: 0.2 },
    befriend: 'Dansgasten niger, tackar för dansen och bleknar bort i ljusslingorna.',
  },
  fiolspoke: {
    id: 'fiolspoke', name: 'Fiolspöket', sprite: 'fiolspoke', behavior: 'shooter',
    hp: 6, damage: 2, xp: 18, speed: 0, shot: 'noteShot',
    box: { x: 2, y: 2, w: 12, h: 12 }, puff: 'mist', heavy: true,
    drops: { termos: 0.35 },
  },
  dimvatte: {
    id: 'dimvatte', name: 'Dimvätten', sprite: 'dimvatte', behavior: 'blinker',
    hp: 6, damage: 2, xp: 20, speed: 0.8,
    box: { x: 2, y: 3, w: 10, h: 11 }, puff: 'mist', flying: true,
    drops: { termos: 0.3 },
  },
  strandkrabba: {
    id: 'strandkrabba', name: 'Strandkrabba', sprite: 'strandkrabba', behavior: 'walker',
    hp: 10, damage: 2, xp: 18, speed: 0.8,
    box: { x: 2, y: 3, w: 12, h: 9 }, puff: 'mist', heavy: true,
    drops: { lingon: 0.3, bulle: 0.2 },
  },
  stubbtroll: {
    id: 'stubbtroll', name: 'Stubbtroll', sprite: 'stubbtroll', behavior: 'hopper',
    hp: 12, damage: 3, xp: 28, speed: 1.1,
    box: { x: 2, y: 3, w: 12, h: 13 }, puff: 'leaf',
    drops: { lingon: 0.35, bulle: 0.2 },
    befriend: 'Stubbtrollet gäspar, sätter ner rötterna och blir en stubbe igen.',
  },
  bergtroll: {
    id: 'bergtroll', name: 'Bergtroll', sprite: 'bergtroll', behavior: 'tank',
    hp: 26, damage: 4, xp: 45, speed: 0.35,
    box: { x: 2, y: 3, w: 12, h: 21 }, puff: 'moss', heavy: true,
    drops: { lingon: 0.4, termos: 0.3 },
  },
  // --- Fencers for the later temples: the tomtenisse's way of fighting, quicker each time ---
  gast: {
    id: 'gast', name: 'Gasten', sprite: 'gast', behavior: 'parrier',
    hp: 9, damage: 2, xp: 26, speed: 0.6, guardDelay: 18, thrustRest: 60,
    box: { x: 3, y: 4, w: 10, h: 20 }, puff: 'mist',
    drops: { termos: 0.3 },
  },
  kavaljer: {
    id: 'kavaljer', name: 'Kavaljeren', sprite: 'kavaljer', behavior: 'parrier',
    hp: 10, damage: 2, xp: 30, speed: 0.65, guardDelay: 15, thrustRest: 52,
    box: { x: 3, y: 4, w: 10, h: 20 }, puff: 'mist',
    drops: { termos: 0.3, bulle: 0.2 },
  },
  vittra: {
    id: 'vittra', name: 'Vittran', sprite: 'vittra', behavior: 'parrier',
    hp: 11, damage: 2, xp: 34, speed: 0.7, guardDelay: 13, thrustRest: 46,
    box: { x: 3, y: 4, w: 10, h: 20 }, puff: 'leaf',
    drops: { lingon: 0.3, bulle: 0.2 },
    befriend: 'Vittran lyfter på huvudet, lockar på sina kor och försvinner in under en sten.',
  },
  drabant: {
    id: 'drabant', name: 'Drabanten', sprite: 'drabant', behavior: 'parrier',
    hp: 14, damage: 3, xp: 40, speed: 0.8, guardDelay: 11, thrustRest: 40,
    box: { x: 3, y: 4, w: 10, h: 20 }, puff: 'moss',
    drops: { lingon: 0.35, termos: 0.25 },
  },
  /** Skuggan – Dagny's own shadow, torn loose in the mountain. Mirrors her guard. */
  skuggan: {
    id: 'skuggan', name: 'Skuggan', sprite: 'skuggan', behavior: 'shadow',
    // 45: what she had when Trollberget made every creature 1.5 × as tough (the staircase leaves her as she is).
    hp: 45, damage: 3, xp: 250, speed: 1.0,
    box: { x: 3, y: 2, w: 10, h: 22 }, puff: 'mist',
    drops: { lingon: 1 },
  },
  skuggvarg: {
    id: 'skuggvarg', name: 'Skuggvarg', sprite: 'skuggvarg', behavior: 'wolf',
    hp: 6, damage: 3, xp: 25, speed: 1.8,
    box: { x: 2, y: 3, w: 20, h: 10 }, puff: 'mist',
    drops: { lingon: 0.3 },
  },
};

/** Bosses – each with two phases. Only Kyrkogrimmen is playable in the vertical slice. */
export const BOSSES: Readonly<Record<string, BossDef>> = {
  grim: {
    id: 'grim', name: 'Kyrkogrimmen', title: 'Kyrkogrimmen – kryptans väktare',
    sprite: 'grim', behavior: 'boss_grim',
    hp: 38, damage: 3, xp: 200, speed: 1.6,
    box: { x: 4, y: 12, w: 26, h: 20 }, puff: 'mist', heavy: true,
    phases: [
      { atHpFraction: 1, sprite: 'grim', speed: 1.7, attackEvery: 2.2 },
      { atHpFraction: 0.5, sprite: 'grimSpirit', speed: 1.1, attackEvery: 1.7 },
    ],
    introDialog: 'grim_vaknar',
    defeatDialog: 'grim_forlikad',
  },
  gruvraet: {
    id: 'gruvraet', name: 'Gruvrået', title: 'Gruvrået – bergets värdinna',
    sprite: 'gruvra', behavior: 'boss_gruvra',
    hp: 56, damage: 3, xp: 320, speed: 2.4,
    box: { x: 2, y: 6, w: 15, h: 26 }, puff: 'mist', heavy: true,
    // She carries her own carbide flame: fire bites her only half as hard as the blade.
    fireResist: 0.5,
    phases: [
      { atHpFraction: 1, sprite: 'gruvra', speed: 2.4, attackEvery: 1.6 },
      { atHpFraction: 0.5, sprite: 'gruvraVred', speed: 3.2, attackEvery: 1.1 },
    ],
    introDialog: 'gruvra_vaknar',
    defeatDialog: 'gruvra_forlikad',
  },
  backahasten: {
    id: 'backahasten', name: 'Bäckahästen', title: 'Bäckahästen – den vita hästen i forsen',
    sprite: 'backahast', behavior: 'boss_backahast',
    hp: 64, damage: 3, xp: 420, speed: 2.2,
    box: { x: 3, y: 9, w: 26, h: 15 }, puff: 'mist', heavy: true,
    phases: [
      { atHpFraction: 1, sprite: 'backahast', speed: 2.2, attackEvery: 1.6 },
      { atHpFraction: 0.5, sprite: 'backahastNack', speed: 2.8, attackEvery: 1.1 },
    ],
    introDialog: 'backahast_vaknar',
    defeatDialog: 'backahast_forlikad',
  },
  havsfrun: {
    id: 'havsfrun', name: 'Havsfrun', title: 'Havsfrun – stormens dotter',
    sprite: 'havsfru', behavior: 'boss_havsfru',
    hp: 72, damage: 3, xp: 520, speed: 1.6,
    box: { x: 4, y: 6, w: 15, h: 24 }, puff: 'mist', heavy: true, flying: true,
    phases: [
      { atHpFraction: 1, sprite: 'havsfru', speed: 1.6, attackEvery: 1.7 },
      { atHpFraction: 0.5, sprite: 'havsfruStorm', speed: 2.1, attackEvery: 1.2 },
    ],
    introDialog: 'havsfru_vaknar',
    defeatDialog: 'havsfru_forlikad',
  },
  spelmannen: {
    id: 'spelmannen', name: 'Spelmannen', title: 'Spelmannen vid dansbanan',
    sprite: 'spelman', behavior: 'boss_spelman',
    hp: 84, damage: 3, xp: 650, speed: 2,
    box: { x: 3, y: 6, w: 12, h: 26 }, puff: 'mist', heavy: true,
    phases: [
      { atHpFraction: 1, sprite: 'spelman', speed: 2, attackEvery: 1.5 },
      { atHpFraction: 0.5, sprite: 'spelmanNack', speed: 2.6, attackEvery: 1.05 },
    ],
    introDialog: 'spelman_vaknar',
    defeatDialog: 'spelman_forlikad',
  },
  skogsraet: {
    id: 'skogsraet', name: 'Skogsrået', title: 'Skogsrået – hon med ihålig rygg',
    sprite: 'skogsra', behavior: 'boss_skogsra',
    hp: 90, damage: 3, xp: 800, speed: 2.4,
    box: { x: 2, y: 8, w: 14, h: 24 }, puff: 'leaf', heavy: true, backOnly: true,
    phases: [
      { atHpFraction: 1, sprite: 'skogsra', speed: 2.4, attackEvery: 1.6 },
      { atHpFraction: 0.5, sprite: 'skogsraBark', speed: 3, attackEvery: 1.15 },
    ],
    introDialog: 'skogsra_vaknar',
    defeatDialog: 'skogsra_forlikad',
  },
  bergakungen: {
    id: 'bergakungen', name: 'Bergakungen', title: 'Bergakungen – han under Trollberget',
    sprite: 'bergakung', behavior: 'boss_bergakung',
    hp: 150, damage: 4, xp: 1000, speed: 1.4,
    box: { x: 6, y: 16, w: 28, h: 32 }, puff: 'moss', heavy: true,
    phases: [
      { atHpFraction: 1, sprite: 'bergakung', speed: 1.4, attackEvery: 1.5 },
      { atHpFraction: 0.5, sprite: 'bergakungSvag', speed: 1.8, attackEvery: 1.05 },
    ],
    introDialog: 'bergakung_vaknar',
    defeatDialog: 'bergakung_forlikad',
  },
};
