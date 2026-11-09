import type { AreaDef } from '../types';

/**
 * The lake (Kartan 2.0, kapitel 2): the islands the boat reaches, and the
 * strip of sand on the far shore where Dagmar signalled across the water.
 */
export const SJON: Record<string, AreaDef> = {
  /** Eremitholmen: a hut, a jetty and an old man who has watched the lake for forty years. */
  eremitholmen: {
    id: 'eremitholmen',
    name: 'Eremitholmen',
    kind: 'path',
    tone: 'sommarkvall',
    music: 'plats',
    backdrop: 'sea',
    theme: 'meadow',
    showName: true,
    ambience: ['fireflies'],
    signs: { I: 'eremit_skylt' },
    npcs: { '1': 'eremit' },
    props: [{ sprite: 'spruce', tx: 16, ty: 9 }, { sprite: 'spruce', tx: 21, ty: 9 }],
    left: { to: 'overworld', ow: { x: 40, y: 31 } },
    tiles: [
      "................................",
      "................................",
      "................................",
      "................................",
      "................................",
      "................................",
      "................................",
      "................................",
      "................................",
      "..A.I......1...........b........",
      "########################~~~~~~~~",
      "################################",
    ],
  },

  /**
   * Måsskäret: a bare skerry inside the fog bank. Gulls, a doll left in a
   * crevice, and a letter cut into the rock.
   */
  masskaret: {
    id: 'masskaret',
    name: 'Måsskäret',
    kind: 'path',
    tone: 'gra_augusti',
    music: 'plats',
    backdrop: 'sea',
    theme: 'skar',
    showName: true,
    ambience: ['mist', 'spray'],
    signs: { I: 'masskaret_ristning' },
    left: { to: 'overworld', ow: { x: 57, y: 47 } },
    tiles: [
      "................................",
      "................................",
      "................................",
      "...............e................",
      "...........===..................",
      "........................e.......",
      "..................+.............",
      "..............======............",
      "................................",
      "..A.......I..........e..........",
      "########################~~~~~~~~",
      "################################",
    ],
  },

  /**
   * Ärlskäret: a skerry with an old fishermen's cairn in the sound north of the
   * lighthouse. Wagtails nest in the cracks; once Viola has asked, a feather
   * lies on the highest rock. Reached only by boat, before the lighthouse.
   */
  arlskaret: {
    id: 'arlskaret',
    name: 'Ärlskäret',
    kind: 'path',
    finds: [{ item: 'fjader', tx: 21, ty: 4, after: 'fjader_uppdrag' }],
    perchers: [{ tx: 11, ty: 7 }, { tx: 16, ty: 6 }, { tx: 22, ty: 4 }, { tx: 24, ty: 7 }],
    tone: 'gra_augusti',
    music: 'plats',
    backdrop: 'sea',
    theme: 'skar',
    showName: true,
    ambience: ['spray'],
    left: { to: 'overworld', ow: { x: 91, y: 61 } },
    tiles: [
      "................................",
      "................................",
      "...........................e....",
      "............e...................",
      "................................",
      "....................####........",
      "....................####........",
      "...............###..####........",
      "..........###..###..######......",
      "..A.......###..###########......",
      "#############~~###########~~~~~~",
      "#############~~###########~~~~~~",
    ],
  },

  /**
   * Signalstranden: the stone Dagmar stood by every evening, flashing her
   * lamp across the lake – three short, three long, three short – while
   * Hulda answered from the belfry in Kyrkbyn.
   */
  signalstranden: {
    id: 'signalstranden',
    name: 'Signalstranden',
    kind: 'path',
    tone: 'sommarkvall',
    music: 'plats',
    backdrop: 'sea',
    theme: 'skar',
    showName: true,
    ambience: ['fireflies'],
    npcs: { '1': 'signalsten' },
    left: { to: 'overworld', ow: { x: 61, y: 37 } },
    tiles: [
      "................................",
      "................................",
      "................................",
      "................................",
      "................................",
      "................................",
      "........................##......",
      "........................##......",
      "....................##..##.##...",
      "..A............1....##..##.##..#",
      "################################",
      "################################",
    ],
  },
};
