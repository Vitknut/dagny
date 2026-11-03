import type { SpriteDef } from '../engine/sprites';
import { dagnySprites } from './dagny';
import { npcSprites } from './npcs';
import { enemySprites } from './enemies';
import { tileSprites } from './tiles';
import { itemSprites } from './items';
import { overworldSprites } from './overworld';
import { landscapeSprites } from './landscape';
import { smallPlaceSprites } from './smallplaces';
import { mineSprites } from './mine';
import { gruvbySprites } from './gruvby';
import { millSprites } from './mill';
import { landmarkSprites } from './landmarks';
import { templePropSprites } from './templeprops';
import { lighthouseSprites } from './lighthouse';
import { parkSprites } from './park';
import { forestSprites } from './forest';
import { trollSprites } from './troll';
import { villageSprites } from './villages';

/** Every sprite in the game, keyed by id. */
export const SPRITES: Record<string, SpriteDef> = {
  ...dagnySprites,
  ...npcSprites,
  ...enemySprites,
  ...tileSprites,
  ...itemSprites,
  ...overworldSprites,
  ...landscapeSprites,
  ...smallPlaceSprites,
  ...mineSprites,
  ...gruvbySprites,
  ...millSprites,
  ...landmarkSprites,
  ...templePropSprites,
  ...lighthouseSprites,
  ...parkSprites,
  ...forestSprites,
  ...trollSprites,
  ...villageSprites,
};
