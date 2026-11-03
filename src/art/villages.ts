import type { SpriteDef } from '../engine/sprites';

/**
 * The five remaining villages: Kyrkbyn, Bruksorten, Fiskeläget, Fäboden and
 * Stationssamhället – house colours, landmarks, villagers and the side-quest items.
 */
const white = { r: 'w', R: 'W', d: 'G' };
const blue = { r: 'u', R: 'U', d: 'n' };
const v = (base: string, recolor: Record<string, string>, w = 16, h = 16): SpriteDef => ({ base, w, h, frames: [], recolor });
const item = (rows: string[]): SpriteDef => ({ w: 8, h: 8, outline: 'k', frames: [rows] });

export const villageSprites: Record<string, SpriteDef> = {
  // House walls: whitewashed (church, station) and grey-blue (fishing huts).
  wallW: v('wall', white),
  cornerW: v('corner', { ...white, W: 'G', w: 'g' }),
  cornerRW: v('cornerR', { ...white, W: 'G', w: 'g' }),
  windowW: v('window', white),
  wallB: v('wall', blue),
  cornerB: v('corner', blue),
  cornerRB: v('cornerR', blue),
  windowB: v('window', blue),

  /** Kyrkbyn: the wooden bell tower where Hulda found Dagny. 24×64 */
  klockstapel: {
    w: 24,
    h: 64,
    frames: [[
      '...........kk...........',
      '...........yy...........',
      '..........kyyk..........',
      '..........kbbk..........',
      '.........kbBBbk.........',
      '........kbBBBBbk........',
      '.......kbBbBBbBbk.......',
      '......kbBBBBBBBBbk......',
      '.....kbBBbBBBBbBBbk.....',
      '....kbBBBBBBBBBBBBbk....',
      '....kkkkkkkkkkkkkkkk....',
      '.....rrrrrrrrrrrrrr.....',
      '.....rKKKKKKKKKKKKr.....',
      '.....rKKKKyyyyKKKKr.....',
      '.....rKKKyYYYYyKKKr.....',
      '.....rKKKyYYYYyKKKr.....',
      '.....rKKyYYYYYYyKKr.....',
      '.....rKKyyyyyyyyKKr.....',
      '.....rKKKKKKyKKKKKr.....',
      '.....rrrrrrrrrrrrrr.....',
      '....kbbbbbbbbbbbbbbk....',
      '.....bBb........bBb.....',
      '.....bBbb......bbBb.....',
      '.....bBbBb....bBbBb.....',
      '.....bBb.bB..Bb.bBb.....',
      '.....bBb..bBBb..bBb.....',
      '.....bBb...bb...bBb.....',
      '.....bBb..bBBb..bBb.....',
      '.....bBb.bB..Bb.bBb.....',
      '....bbBbBb....bBbBbb....',
      '....bBBbb......bbBBb....',
      '....bBBb........bBBb....',
      '....bBBbb......bbBBb....',
      '....bBBbBb....bBbBBb....',
      '....bBBb.bB..Bb.bBBb....',
      '....bBBb..bBBb..bBBb....',
      '....bBBb...bb...bBBb....',
      '....bBBb..bBBb..bBBb....',
      '...bbBBb.bB..Bb.bBBbb...',
      '...bBBBbBb....bBbBBBb...',
      '...bBBBbb......bbBBBb...',
      '...bBBBb........bBBBb...',
      '...bBBBbb......bbBBBb...',
      '...bBBBbBb....bBbBBBb...',
      '...bBBBb.bB..Bb.bBBBb...',
      '...bBBBb..bBBb..bBBBb...',
      '...bBBBb...bb...bBBBb...',
      '...bBBBb..bBBb..bBBBb...',
      '..bbBBBb.bB..Bb.bBBBbb..',
      '..bBBBBbBb....bBbBBBBb..',
      '..bBBBBbb......bbBBBBb..',
      '..bBBBBb........bBBBBb..',
      '..bBBBBb........bBBBBb..',
      '..bBBBBb........bBBBBb..',
      '..bBBBBb........bBBBBb..',
      '..bBBBBb........bBBBBb..',
      '..bBBBBb........bBBBBb..',
      '..bBBBBb........bBBBBb..',
      '..bBBBBb........bBBBBb..',
      '..bBBBBb........bBBBBb..',
      '.gggggggg......gggggggg.',
      '.gGGGGGGg......gGGGGGGg.',
      '.gGGGGGGg......gGGGGGGg.',
      '.gggggggg......gggggggg.',
    ]],
  },
  /** Bruksorten: the tall brick chimney of the works. 16×64 */
  skorsten: {
    w: 16,
    h: 64,
    frames: [Array.from({ length: 64 }, (_, y) => {
      if (y < 3) return '...kkkkkkkkkk...';
      if (y === 3) return '...dddddddddd...';
      const inset = Math.floor(y / 22);
      const pad = '.'.repeat(4 - inset);
      const width = 8 + inset * 2;
      const row = Array.from({ length: width }, (_, x) => ((x + (Math.floor(y / 2) % 2) * 2) % 4 === 0 && y % 2 === 0 ? 'd' : y % 2 === 0 ? 'r' : 'R')).join('');
      return (pad + row + pad).padEnd(16, '.').slice(0, 16);
    })],
  },
  /** Fiskeläget: a clinker-built fishing boat. 32×16 */
  fiskebat: {
    w: 32,
    h: 16,
    frames: [[
      '...............g................',
      '...............g................',
      '...............g...WWW..........',
      '...............g..WWWWW.........',
      '...............g..WWWWWW........',
      '...............g..WWWWWWW.......',
      '...............g..WWWWWWWW......',
      '...............g................',
      'k.............................k.',
      'kWWWWWWWWWWWWWWWWWWWWWWWWWWWWWk.',
      '.kuuuuuuuuuuuuuuuuuuuuuuuuuuuk..',
      '.kUUUUUUUUUUUUUUUUUUUUUUUUUUUk..',
      '..kuuuuuuuuuuuuuuuuuuuuuuuuuk...',
      '...kUUUUUUUUUUUUUUUUUUUUUUUk....',
      '....kkkkkkkkkkkkkkkkkkkkkkk.....',
      '................................',
    ]],
  },
  /** Fäboden: a fell cow (talkable). Frames: stand, graze, tail. 24×16 */
  ko: {
    w: 24,
    h: 16,
    outline: 'k',
    parts: {
      body: [
        '..WWWWrrrWWWWWrrWW......',
        '.WWWrrrrWWWWWWrrrWW.....',
        'bWWWrrrWWWWWWWWrrWW.....',
        '.WWWWWWWWWWrrrWWWWW.....',
        '..WWWWWWWWrrrrWWWW......',
        '...iii..........ii......',
        '...WW..WW....WW..WW.....',
        '...WW..WW....WW..WW.....',
        '...kk..kk....kk..kk.....',
      ],
      head: ['.ww.ww', '..WWWW', '..WkWr', '..WWWW', '...iii', '...ii.'],
      headDown: ['......', '.ww.ww', '..WWWW', '..WkWr', '..WWWW', '...iii'],
    },
    frames: [
      { parts: [['body', 0, 7], ['head', 17, 3]] },
      { parts: [['body', 0, 7], ['headDown', 17, 6]] },
      { parts: [['body', 1, 7], ['head', 17, 3]] },
    ],
  },
  /** Stationssamhället: a small steam locomotive. 48×32 */
  lok: {
    w: 48,
    h: 32,
    outline: 'k',
    frames: [[
      '.....kkk........................................',
      '.....kgk........................................',
      '....kgggk.......................................',
      '....kgggk..................kkkkkkkkkkkkkkkk.....',
      '....kgggk..................kmmmmmmmmmmmmmmk.....',
      '....kgggk...........kk.....kmmmmmmmmmmmmmmk.....',
      '....kgggk..........kyyk....kmCCCmmmmCCCmmmk.....',
      '....kgggk..........kyyk....kmCCCmmmmCCCmmmk.....',
      '..kkkkkkkkkkkkkkkkkkkkkkkkkkmCCCmmmmCCCmmmk.....',
      '..kmmmmmmmmmmmmmmmmmmmmmmmmkmmmmmmmmmmmmmmk.....',
      '.kmMMMMMMMMMMMMMMMMMMMMMMMMkmmmmmmmmmmmmmmk.....',
      '.kmyyyyyyyyyyyyyyyyyyyyyyyykmmmmmmmmmmmmmmk.....',
      '.kmMMMMMMMMMMMMMMMMMMMMMMMMkmmmmmmmmmmmmmmk.....',
      'kkmMMMMMMMMMMMMMMMMMMMMMMMMkmmmmmmmmmmmmmmkkk...',
      'kYkMMMMMMMMMMMMMMMMMMMMMMMMkmmmmmmmmmmmmmmmmk...',
      'kYkmmmmmmmmmmmmmmmmmmmmmmmmkmmmmmmmmmmmmmmmmk...',
      'kkkyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyk...',
      '..krrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrk...',
      '..kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk...',
      '..rr.................................rr.........',
      '.r..r..kkkkkk....kkkkkk....kkkkkk...r..r........',
      'rr..rrkggggggk..kggggggk..kggggggk.rr..rr.......',
      '.r..rkgGGGGGGgkkgGGGGGGgkkgGGGGGGgk.r..r........',
      '..rr.kgGGkkGGgk.kgGGkkGGgk.kgGGkkGGgkrr.........',
      '.....kgGGkkGGgk.kgGGkkGGgk.kgGGkkGGgk...........',
      '.....kgGGGGGGgk.kgGGGGGGgk.kgGGGGGGgk...........',
      '......kggggggk...kggggggk...kggggggk............',
      '.......kkkkkk.....kkkkkk.....kkkkkk.............',
      '................................................',
      '................................................',
      '................................................',
      '................................................',
    ]],
  },
  /** Stationssamhället: the platform clock on its post. 12×28 */
  stationsur: {
    w: 12,
    h: 28,
    outline: 'k',
    frames: [[
      '..gggggggg..',
      '.gWWWWWWWWg.',
      'gWWWWkWWWWWg',
      'gWWWWkWWWWWg',
      'gWWWWkWWWWWg',
      'gWWWWkkkkWWg',
      'gWWWWWWWWWWg',
      'gWWWWWWWWWWg',
      '.gWWWWWWWWg.',
      '..gggggggg..',
      '.....gg.....',
      '.....gg.....',
      '.....gg.....',
      '.....gg.....',
      '.....gg.....',
      '.....gg.....',
      '.....gg.....',
      '.....gg.....',
      '.....gg.....',
      '.....gg.....',
      '.....gg.....',
      '.....gg.....',
      '.....gg.....',
      '.....gg.....',
      '.....gg.....',
      '....gggg....',
      '...gGGGGg...',
      '...gggggg...',
    ]],
  },

  // Villagers.
  /** The vicar in a black cassock and white bands. */
  prost: v('man', { b: 'k', n: 'K', G: 'w' }, 16, 24),
  /** The parish clerk's wife in a dark blue dress. */
  signe: v('woman', { r: 'n', Y: 'G' }, 16, 24),
  /** Old Tyra, who remembers midsummer 1946. */
  tyra: v('hulda', { p: 'g', r: 'K', G: 'w' }, 16, 24),
  /** A works smith in a leather apron. */
  smed: v('man', { b: 'B', n: 'b', W: 't' }, 16, 24),
  /** The foreman in a brown jacket and cap. */
  forman: v('man', { b: 'b', n: 'K' }, 16, 24),
  /** Fisherman in a yellow oilskin. */
  fiskare: v('man', { b: 'y', n: 'u', W: 'Y' }, 16, 24),
  /** Net mender in a striped blue dress. */
  natlagerska: v('woman', { r: 'u', Y: 'w' }, 16, 24),
  /** Dairy maid with a red headscarf. */
  budeja: v('woman', { r: 'r', Y: 'R' }, 16, 24),
  /** The old woman of the summer farm, who knows how to change shape. */
  karna: v('hulda', { p: 'm', r: 'M', G: 'w' }, 16, 24),
  /** The station master in a blue uniform and red cap. */
  stins: v('man', { b: 'n', n: 'r', W: 'y' }, 16, 24),
  /** The telegraph operator with a green eyeshade. */
  telegrafist: v('man', { b: 'w', n: 'M', W: 'W' }, 16, 24),
  /** A traveller in a grey summer coat. */
  resenar: v('woman', { r: 'G', Y: 'b' }, 16, 24),
  /** Children with their own colours in each village. */
  kid3: v('kid', { U: 'M', u: 'm' }, 16, 24),
  kid4: v('kid', { U: 'y', u: 'b' }, 16, 24),

  // Side-quest items.
  /** Johannesört – a sprig of yellow star flowers. */
  tang: item(['k.....k.', 'gk...kg.', '.gk.kg..', '..gkg...', '..kgk...', '.k...k..', 'b.....b.', 'b.....b.']),
  johannesort: item(['.Y...Y..', 'YyY.YyY.', '.Y.M.Y..', '..MMM...', '...M..Y.', '...M.YyY', '...MM.Y.', '...M....']),
  psalmbok: item(['.kkkkkk.', 'kbbbbbbk', 'kbbYbbbk', 'kbYYYbbk', 'kbbYbbbk', 'kbbYbbbk', 'kbbbbbbW', '.kkkkkkW']),
  medaljong: item(['...yy...', '..y..y..', '...yy...', '..yYYy..', '.yYWWYy.', '.yYWiYy.', '..yYYy..', '...yy...']),
  kompass: item(['..gggg..', '.gWWWWg.', 'gWWrWWWg', 'gWWrWWWg', 'gWWkWWWg', 'gWWkWWWg', '.gWWWWg.', '..gggg..']),
  skalla: item(['...gg...', '..gYYg..', '.gYYYYg.', '.gYYYYg.', '.gYyYYg.', 'gyyyyyyg', '...kk...', '...kk...']),
  hacka: item(['.ggggg..', 'gGWGGgg.', 'g..b..gk', '...b....', '...b....', '...b....', '...b....', '...bk...']),
  solsten: item(['...WW...', '..WCCW..', '.WCWWCc.', 'WCWYWCcW', '.cCWCcW.', '..cCcW..', '...cW...', '........']),
  ronnkvist: item(['......M.', '..M..MM.', '.MMb.M..', '..Mb.R..', '...bRRR.', '..RbRR..', '.RRb....', '...b....']),
  fjader: item(['......kW', '.....kWW', '....kWW.', '...kWk..', '..kWk...', '.kWk....', '.Wk.....', 'W.......']),
  askvigg: item(['..gggg..', '.gGGGGg.', 'gGGwGGGg', 'gGGGGGgk', '.gGGGgk.', '..gGgk..', '...gk...', '........']),
  visselpipa: item(['........', '........', '..gggggg', '.gGGGGGg', 'gGGkGGGg', 'gGGGGGg.', '.ggggg..', '........']),
};
