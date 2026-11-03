import type { DialogDef } from './types';
import { HEM } from './dialog/hem';
import { GRUVSAMHALLET } from './dialog/gruvsamhallet';
import { KYRKBYN } from './dialog/kyrkbyn';
import { BRUKSORTEN } from './dialog/bruksorten';
import { FISKELAGET } from './dialog/fiskelaget';
import { FABODEN } from './dialog/faboden';
import { STATIONSSAMHALLET } from './dialog/stationssamhallet';
import { KRYPTA } from './dialog/krypta';
import { GRUVAN } from './dialog/gruvan';
import { KVARNEN } from './dialog/kvarnen';
import { FYREN } from './dialog/fyren';
import { FOLKPARKEN } from './dialog/folkparken';
import { FABODSKOGEN } from './dialog/fabodskogen';
import { TROLLBERGET } from './dialog/trollberget';
import { VARLDEN } from './dialog/varlden';
import { FOREMAL } from './dialog/foremal';
import { SMAPLATSER } from './dialog/smaplatser';
import { EPILOG } from './dialog/epilog';
import { ALLMANT } from './dialog/allmant';
import { SJON } from './dialog/sjon';

/**
 * All dialog in the game. Dagny never speaks: choices describe what she
 * does, never what she says. Keep pages short – they are typed out letter by
 * letter on a postcard and must fit four lines.
 *
 * The dialog lives in data/dialog/, one file per place.
 */
export const DIALOG_GROUPS: ReadonlyArray<Record<string, DialogDef>> = [
  HEM, GRUVSAMHALLET, KYRKBYN, BRUKSORTEN, FISKELAGET, FABODEN, STATIONSSAMHALLET, KRYPTA, GRUVAN, KVARNEN, FYREN, FOLKPARKEN, FABODSKOGEN, TROLLBERGET, VARLDEN, FOREMAL, SMAPLATSER, SJON, EPILOG, ALLMANT,
];

export const DIALOG: Readonly<Record<string, DialogDef>> = Object.assign({}, ...DIALOG_GROUPS);
