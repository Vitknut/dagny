import type { SpriteDef } from '../engine/sprites';

/**
 * Small harmless animals (game/side/critters.ts). Each faces right; frames are
 * calm, calm with a small movement (a peck, a tail bob), then the two frames
 * of getting away.
 */
export const critterSprites: Record<string, SpriteDef> = {
  /** Sädesärla – a wagtail: black cap and bib, white face, grey back, a long tail it bobs. Sit, bob, fly up, fly down. */
  arla: {
    w: 10,
    h: 8,
    frames: [
      ['..........', '......kk..', '.....kWWk.', '.....kkkkk', 'kkGGGGGk..', '...GWWWG..', '....k..k..', '..........'],
      ['..........', '......kk..', '.....kWWk.', 'kk...kkkkk', '.kGGGGGk..', '...GWWWG..', '....k..k..', '..........'],
      ['...G......', '...GG..kk.', '....GGkWWk', 'kkGGGGGkkk', '...GWWG...', '..........', '..........', '..........'],
      ['..........', '.......kk.', '......kWWk', 'kkGGGGGkkk', '...GWWG...', '....GG....', '.....G....', '..........'],
    ],
  },
  /** Gråsparv – a house sparrow: brown streaked back, grey crown, black bib. Sit, peck, fly up, fly down. */
  sparv: {
    w: 8,
    h: 7,
    frames: [
      ['........', '.....GG.', '....GBBk', '..BbBkk.', 'bBbBBw..', '..wwww..', '...k.k..'],
      ['........', '........', '....GG..', '..BbGBBk', 'bBbBBkk.', '..wwww..', '...k.k..'],
      ['..B.....', '..bB.GG.', '...BGBBk', 'bBbBBkk.', '..www...', '........', '........'],
      ['........', '.....GG.', '....GBBk', 'bBbBBkk.', '..wBB...', '...bB...', '....B...'],
    ],
  },
  /** Höna – a white hen with a red comb. Stand, peck, run with wings out (two frames). */
  hona: {
    w: 12,
    h: 11,
    frames: [
      ['.........r..', '........rr..', '........WWk.', '.......WWWWy', '.WW....WWr..', 'WWWWWWWWWW..', 'WWWWWWWWW...', '.WWWWWWWW...', '..WWWWWW....', '....y..y....', '....y..y....'],
      ['............', '............', '.WW.........', 'WWWWWWWWW...', 'WWWWWWWWWr..', '.WWWWWWWWWr.', '..WWWWWWWWWk', '....WW..WWWy', '.........r..', '....y..y....', '....y..y....'],
      ['.........r..', '...W....rr..', '..WWW...WWk.', '.WWWW..WWWWy', 'WW.WWWWWWr..', 'W.WWWWWWWW..', '..WWWWWWW...', '...WWWWWW...', '....WWWW....', '...y....y...', '..y......y..'],
      ['.........r..', '........rr..', '........WWk.', '.......WWWWy', 'WWW....WWr..', 'WWWWWWWWWW..', '.WWWWWWWW...', '..WWWWWWWWW.', '..WWWWWW.WW.', '.....yy.....', '.....yy.....'],
    ],
  },
  /** Ekorre – a red squirrel, bushy tail up. Sit, nibble, run, climb (straight up a trunk). */
  ekorre: {
    w: 12,
    h: 10,
    frames: [
      ['.oo.........', 'oooo....o.o.', 'oo.o....oooo', 'o..o...ooWok', '...o..ooooo.', '...oo.oooo..', '....oooooo..', '.....ooWo...', '.....oo.oo..', '....oo..oo..'],
      ['.oo.........', 'oooo........', 'oo.o....o.o.', 'o..o....oooo', '...o...ooWok', '...oo.oooyo.', '....oooooo..', '.....ooWo...', '.....oo.oo..', '....oo..oo..'],
      ['............', '.ooo........', 'oooooo......', 'o...ooo.o.o.', '......oooooo', '.....oooooWk', '....oooooo..', '...ooo..oo..', '..oo.....oo.', '............'],
      ['.....o.o....', '.....ooo....', '....oooWk...', '.....ooo....', '....oooooo..', '.....oooo.o.', '.....oooo.oo', '....oo..oooo', '..........oo', '..........o.'],
    ],
  },
  /** Hare – grey-brown, long black-tipped ears. Sit, ears twitch, bound. */
  hare: {
    w: 14,
    h: 11,
    frames: [
      ['.........k.k..', '.........g.g..', '.........g.g..', '........gggg..', '........gGGkg.', '.......GGGGGG.', '..GGGGGGGGG...', '.wGGGGGGGGG...', '.wGGGGGGGGG...', '..GGGGGGGG....', '..gg.gg..gg...'],
      ['.........kk...', '.........gg...', '.........gg...', '........gggg..', '........gGGkg.', '.......GGGGGG.', '..GGGGGGGGG...', '.wGGGGGGGGG...', '.wGGGGGGGGG...', '..GGGGGGGG....', '..gg.gg..gg...'],
      ['..........kk..', '...........gg.', '..........ggg.', '.........gGGkg', '......GGGGGGG.', '..GGGGGGGGGG..', '.wGGGGGGGGG...', 'wwGGGGGGG.....', 'gg.....ggg....', 'g.........gg..', '...........g..'],
    ],
  },
  /** Gräsand – a mallard drake on the water: green head, white collar, grey body. Float, bob, fly up, fly down. */
  anka: {
    w: 12,
    h: 8,
    frames: [
      ['........mm..', '.......mmmm.', '.......mkmmy', '.......WW...', '.kGGGGBBB...', 'kkGGGGGGB...', '.GGGGGGGG...', '..wwwwww....'],
      ['............', '........mm..', '.......mmmm.', '.......mkmmy', '.kGGGGBWW...', 'kkGGGGGGB...', '.GGGGGGGG...', '..wwwwww....'],
      ['...GG.......', '...GGG..mm..', '....GGGmkmmy', '.kGGGGBWW...', 'kkGGGGGGB...', '..GGGGGG....', '...yy.......', '............'],
      ['............', '........mm..', '.......mkmmy', '.kGGGGBWW...', 'kkGGGGGGB...', '..GGGGGGG...', '...GGG......', '....GG......'],
    ],
  },
};
