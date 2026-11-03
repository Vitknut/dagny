import type { Behavior as BehaviorId } from '../../data/types';
import { backahast } from './backahast';
import { bergakung } from './bergakung';
import { blinker } from './blinker';
import { diver } from './diver';
import { floater } from './floater';
import { grim } from './grim';
import { gruvra } from './gruvra';
import { havsfru } from './havsfru';
import { hopper } from './hopper';
import { parrier } from './parrier';
import { shadow } from './shadow';
import { shooter } from './shooter';
import { skogsra } from './skogsra';
import { spelman } from './spelman';
import { tank } from './tank';
import { walker } from './walker';
import { waltzer } from './waltzer';
import { wolf } from './wolf';
import type { Behavior } from './types';

export type { Behavior, Sense } from './types';

/**
 * Every behaviour by name. Adding one: write a module here, add its name to
 * `Behavior` in data/types.ts and list it below – TypeScript checks that
 * none is missing.
 */
export const BEHAVIORS: Readonly<Record<BehaviorId, Behavior>> = {
  walker,
  floater,
  parrier,
  hopper,
  diver,
  tank,
  shooter,
  wolf,
  waltzer,
  blinker,
  shadow,
  boss_grim: grim,
  boss_gruvra: gruvra,
  boss_backahast: backahast,
  boss_havsfru: havsfru,
  boss_spelman: spelman,
  boss_skogsra: skogsra,
  boss_bergakung: bergakung,
  boss_placeholder: grim,
};
