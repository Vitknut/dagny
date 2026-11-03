import type { AreaDef } from '../types';

/**
 * Passages: short side-view stretches that take Dagny from one part of the
 * map to the next, instead of a single tile. Each has its own danger, and a
 * little something to come back for.
 */
export const PASSAGER: Record<string, AreaDef> = {
  /**
   * Gamla stollen: the old adit through the fell between the mine country and
   * the mill valley. Pitch dark – the karbidlampa is what gets Dagny in. A cart
   * over a spike channel, a fallen rock, and a gallery up under the roof where
   * the radio's static gives away a hollow.
   */
  stollen: {
    id: 'stollen',
    name: 'Gamla stollen',
    kind: 'path',
    tone: 'gruva',
    music: 'grotta',
    backdrop: 'mine',
    theme: 'mine',
    dark: true,
    ambience: ['dust'],
    showName: true,
    signs: { I: 'stollen_skylt' },
    left: { to: 'overworld', ow: { x: 61, y: 18 } },
    right: { to: 'stollen_2', entry: 'A' },
    platforms: [{ kind: 'cart', tx: 13, ty: 9, toTx: 27, toTy: 9, mode: 'ride' }],
    tiles: [
      "################################################################",
      "################################################################",
      "####################################..........?.......##########",
      "####################################....b.....?...+...##########",
      "......................................################..#####...",
      "....................f...................................#####...",
      ".....................................=......f...................",
      "..............................g...===...........................",
      "..............................##................................",
      "..A.I...u...T.................##.........u...............u...E..",
      "##############^^^^^^^^^^^^^^####################################",
      "################################################################",
    ],
    deco: [
      "................................................................",
      "................................................................",
      "......................................rrrrrrrrrrrrrrrr..........",
      "......................................rrrrrrrrrrrrrrrr..........",
      "rrrOrrrrrrrrOrrrrrrrrOrrrrrrrrOrrrrrrr................rr.....rrr",
      "|rrrrrrrr|rrrrrrrr|rrrrrrrr|rrrrrrrr|rrrrrrrr|rrrrrrrr|r.....rr|",
      "|rrrrrrrr|rrrrrrrr|rrrrrrrr|rrrrrrrr|rrrrrrrr|rrrrrrrr|rrrrrrrr|",
      "|rrrrrrrr|rrrrrrrr|rrrrrrrr|rrrrrrrr|rrrrrrrr|rrrrrrrr|rrrrrrrr|",
      "|rrrrrrrr|rrrrrrrr|rrrrrrrr|rr..rrrr|rrrrrrrr|rrrrrrrr|rrrrrrrr|",
      "|rrrrrrrr|rrrrrrrr|rrrrrrrr|rr..rrrr|rrrrrrrr|rrrrrrrr|rrrrrrrr|",
      "................................................................",
      "................................................................",
    ],
  },

  /**
   * Gamla stollen, the deep part: where the roof came down in 1931. It comes
   * down again behind Dagny – run.
   */
  stollen_2: {
    id: 'stollen_2',
    name: 'Rasgången',
    kind: 'path',
    tone: 'gruva',
    music: 'grotta',
    backdrop: 'mine',
    theme: 'mine',
    dark: true,
    ambience: ['dust'],
    showName: true,
    signs: { I: 'stollen_ras_skylt' },
    cavein: {
      at: 6, speed: 1.15, flag: 'stollen_rasat',
      // What the roof left on the floor: heaps to climb over, there for good.
      rubble: [[9, 9], [18, 9], [19, 9], [19, 8], [26, 9], [36, 9], [37, 9], [48, 9], [61, 9]],
    },
    left: { to: 'stollen', entry: 'E' },
    right: { to: 'overworld', ow: { x: 67, y: 18 } },
    // A side gallery off the cave-in: Hulda's old pocket, and a way out by the mine.
    doors: { U: { to: 'stollen_gomd', entry: 'A' } },
    tiles: [
      "########################################################################",
      "########################################################################",
      "########################################################################",
      "########################################################################",
      "......................................########..........................",
      "..........................f...........########..........................",
      "................................................f.......................",
      "................................................................##......",
      "..............##..............##..........................##....##......",
      "..A.I.........##..............##..g.........U.............##....##...E..",
      "######################^^###########################^^###################",
      "########################################################################",
    ],
    deco: [
      "........................................................................",
      "........................................................................",
      "........................................................................",
      "........................................................................",
      "rrrrrOrrrrrrrrrrOrrrrrrrrrrOrrrrrrrrrr........rrrOrrrrrrrrrrOrrrrrrrrrrO",
      "|rrrrrrrrrr|rrrrrrrrrr|rrrrrrrrrr|rrrr........rrrrrrrrr|rrrrrrrrrr|rrrrr",
      "|rrrrrrrrrr|rrrrrrrrrr|rrrrrrrrrr|rrrrrrrrrr|rrrrrrrrrr|rrrrrrrrrr|rrrrr",
      "|rrrrrrrrrr|rrrrrrrrrr|rrrrrrrrrr|rrrrrrrrr...rrrrrrrrr|rrrrrrrr..|rrrrr",
      "|rrrrrrrrrr|rr..rrrrrr|rrrrrrr..r|rrrrrrrrr...rrrrrrrrr|rr..rrrr..|rrrrr",
      "|rrrrrrrrrr|rr..rrrrrr|rrrrrrr..r|rrrrrrrrr...rrrrrrrrr|rr..rrrr..|rrrrr",
      "........................................................................",
      "........................................................................",
    ],
  },

  /**
   * The side gallery: where Hulda, the Väktare before Dagmar, brought her
   * daughter to listen to the fell. Comes out by the caved-in adit above the
   * old mine – a way back to Gruvsamhället.
   */
  stollen_gomd: {
    id: 'stollen_gomd',
    name: 'Sidoorten',
    kind: 'path',
    tone: 'gruva',
    music: 'grotta',
    backdrop: 'mine',
    theme: 'mine',
    dark: true,
    darkness: 0.85,
    ambience: ['dust'],
    showName: true,
    signs: { I: 'stollen_gomd_ristning' },
    left: { to: 'stollen_2', entry: 'U' },
    right: { to: 'overworld', ow: { x: 58, y: 15 } },
    opens: 'sidoorten_oppen',
    tiles: [
      "##################################",
      "##################################",
      "##################################",
      "##########.....##########.........",
      "##########..T..##########.........",
      "...........===..........f.........",
      "..................................",
      "........===..........===..........",
      "..................................",
      "..A....I.......b.........u.....E..",
      "##################################",
      "##################################",
    ],
  },

  // --- Bergsstigen (chapter 8): caves between the ledges of the fell ---------------------

  /** Klyftan: a gorge through the fell, from the first ledge to the stormy shelf beyond. */
  klyftan: {
    id: 'klyftan',
    name: 'Klyftan',
    kind: 'path',
    tone: 'troll',
    music: 'grotta',
    backdrop: 'mine',
    theme: 'berg',
    showName: true,
    ambience: ['dust'],
    wind: [{ x0: 14, y0: 2, x1: 40, y1: 9, dir: 'alternate', force: 0.6, on: 120, off: 100 }],
    left: { to: 'overworld', ow: { x: 44, y: 10 } },
    right: { to: 'overworld', ow: { x: 53, y: 11 } },
    tiles: [
      "########################################################",
      "########################################################",
      "########################################################",
      "......................f.................................",
      "........................................................",
      "...............===.........===........====..............",
      "........................................................",
      "..........##....................a.............##........",
      "..........##..........f.......####............##....f...",
      "..A.......##....g.............####......o.....##.....E..",
      "#############^^^^^^^^####################^^^^###########",
      "########################################################",
    ],
  },

  /**
   * Vättegången: three ways on, and only one leads up. The vättar know which –
   * blow the näverlur and the one who comes runs to it (AreaDef.lurGuide).
   */
  vattegangen: {
    id: 'vattegangen',
    name: 'Vättegången',
    kind: 'path',
    tone: 'troll',
    music: 'grotta',
    backdrop: 'mine',
    theme: 'berg',
    dark: true,
    darkness: 0.8,
    showName: true,
    ambience: ['dust'],
    lurGuide: 'F',
    left: { to: 'overworld', ow: { x: 54, y: 9 } },
    signs: { I: 'vattegang_skylt' },
    doors: {
      D: { to: 'vattegangen', entry: 'A', dialog: 'berg_villse' },
      F: { to: 'vattegangen_2', entry: 'A' },
      G: { to: 'vattegangen', entry: 'A', dialog: 'berg_villse' },
    },
    tiles: [
      "################################################",
      "################################################",
      "...........................................#####",
      "...........................................#####",
      "....f..............f..............f........#####",
      "...........................................#####",
      "..........===...........===..........===...#####",
      "...........................................#####",
      "...........................................#####",
      "..A..I.........D...........F........u..G...#####",
      "################################################",
      "################################################",
    ],
    deco: [
      "................................................",
      "................................................",
      "rrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr....",
      "rrrrXrrrrrrrrrrrrrrrrrrrrrrXrrrrrrrrrrrrrrrr....",
      "rrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr....",
      "rrrrrrrrrrrrrrrrXrrrrrrrrrrrrrrrrrrrrrXrrrrr....",
      "rrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr....",
      "rrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr....",
      "rrrrrrrrrrrrrrr1rrrrrrrrrrr1rrrrrrrrrrrr1rrr....",
      "rrrrrrrrrrrrrrr2rrrrrrrrrrr2rrrrrrrrrrrr2rrr....",
      "................................................",
      "................................................",
    ],
  },

  /** Vättegången, the way up: out onto the summit plateau below Trollberget. */
  vattegangen_2: {
    id: 'vattegangen_2',
    name: 'Vättegången',
    kind: 'path',
    tone: 'troll',
    music: 'grotta',
    backdrop: 'mine',
    theme: 'berg',
    dark: true,
    darkness: 0.75,
    ambience: ['dust'],
    left: { to: 'vattegangen', entry: 'A' },
    right: { to: 'overworld', ow: { x: 50, y: 4 } },
    tiles: [
      "########################################",
      "########################################",
      "########################################",
      "..........................==............",
      "........................................",
      "..................==..............f.....",
      "........................................",
      "..........==..............b.............",
      "...................a....................",
      "..A.................................E...",
      "########################################",
      "########################################",
    ],
  },

  /**
   * Rasbranten: the wrong way. A steep scree where the storm on the shelf
   * blows the careless – it runs only down, and out below the mountain.
   */
  rasbranten: {
    id: 'rasbranten',
    name: 'Rasbranten',
    kind: 'path',
    tone: 'troll',
    music: 'grotta',
    backdrop: 'mine',
    theme: 'berg',
    showName: true,
    ambience: ['dust'],
    signs: { I: 'rasbranten_skylt' },
    left: { to: 'overworld', ow: { x: 55, y: 12 } },
    right: { to: 'overworld', ow: { x: 55, y: 15 } },
    tiles: [
      "########################################",
      "........................................",
      "..A.I...................................",
      "########.....f..........................",
      "########................................",
      "################........................",
      "################..........g.............",
      "########################................",
      "###############################.........",
      "###############################.....E...",
      "########################################",
      "########################################",
    ],
  },
};
