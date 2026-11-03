import type { Prop } from './types';

/**
 * The temples' furniture: set pieces that make each place its own (sprites in
 * art/templeprops.ts), drawn behind Dagny like an area's props. Kept apart from
 * the rooms' maps so they can be moved without touching the play.
 */
export const FURNITURE: Readonly<Record<string, Prop[]>> = {
  krypta_1: [{ sprite: 'kryptaNisch', tx: 8, ty: 7 }, { sprite: 'kryptaGravsten', tx: 13, ty: 9 }, { sprite: 'kryptaGravsten', tx: 20, ty: 6 }, { sprite: 'kryptaNisch', tx: 26, ty: 9 }, { sprite: 'kryptaGravsten', tx: 34, ty: 9 }, { sprite: 'kryptaGravsten', tx: 39, ty: 9 }, { sprite: 'kryptaNisch', tx: 43, ty: 9 }],
  krypta_2: [{ sprite: 'kryptaNisch', tx: 6, ty: 11 }, { sprite: 'kryptaNisch', tx: 14, ty: 11 }, { sprite: 'kryptaGravsten', tx: 19, ty: 8 }, { sprite: 'kryptaNisch', tx: 22, ty: 11 }, { sprite: 'kryptaNisch', tx: 31, ty: 11 }, { sprite: 'kryptaNisch', tx: 38, ty: 11 }, { sprite: 'kryptaGravsten', tx: 43, ty: 11 }, { sprite: 'kryptaNisch', tx: 54, ty: 11 }],
  krypta_3: [{ sprite: 'kryptaBenhus', tx: 6, ty: 9 }, { sprite: 'kryptaNisch', tx: 12, ty: 9 }, { sprite: 'kryptaBenhus', tx: 19, ty: 7 }, { sprite: 'kryptaBenhus', tx: 24, ty: 9 }, { sprite: 'kryptaNisch', tx: 34, ty: 9 }, { sprite: 'kryptaBenhus', tx: 41, ty: 9 }, { sprite: 'kryptaBenhus', tx: 47, ty: 9 }, { sprite: 'kryptaNisch', tx: 16, ty: 9 }],
  krypta_4: [{ sprite: 'kryptaGravsten', tx: 6, ty: 9 }, { sprite: 'kryptaLamm', tx: 8, ty: 9 }, { sprite: 'kryptaGravsten', tx: 17, ty: 9 }],
  gruvan_1: [{ sprite: 'gruvVerktyg', tx: 7, ty: 8 }, { sprite: 'gruvVinsch', tx: 13, ty: 9 }, { sprite: 'gruvKristall', tx: 19, ty: 9, dy: -32 }, { sprite: 'gruvVerktyg', tx: 35, ty: 9 }, { sprite: 'gruvVinsch', tx: 38, ty: 7 }, { sprite: 'gruvKristall', tx: 41, ty: 9, dy: -32 }, { sprite: 'gruvVerktyg', tx: 47, ty: 9 }, { sprite: 'gruvVinsch', tx: 53, ty: 9 }],
  gruvan_2: [{ sprite: 'gruvKristall', tx: 6, ty: 5, dy: -32 }, { sprite: 'gruvVinsch', tx: 11, ty: 27 }, { sprite: 'gruvVerktyg', tx: 18, ty: 21 }, { sprite: 'gruvKristall', tx: 22, ty: 27, dy: -32 }],
  gruvan_3: [{ sprite: 'gruvKristall', tx: 6, ty: 9, dy: -32 }, { sprite: 'gruvVerktyg', tx: 13, ty: 9 }, { sprite: 'gruvKristall', tx: 11, ty: 9, dy: -32 }, { sprite: 'gruvKristall', tx: 31, ty: 9, dy: -32 }, { sprite: 'gruvKristall', tx: 33, ty: 9, dy: -32 }, { sprite: 'gruvVerktyg', tx: 38, ty: 9 }, { sprite: 'gruvKristall', tx: 44, ty: 9, dy: -32 }, { sprite: 'gruvKristall', tx: 51, ty: 9, dy: -32 }, { sprite: 'gruvKristall', tx: 56, ty: 9, dy: -32 }],
  gruvan_4: [{ sprite: 'gruvOffer', tx: 6, ty: 9 }, { sprite: 'gruvKristall', tx: 9, ty: 9, dy: -32 }, { sprite: 'gruvOffer', tx: 16, ty: 9 }],
  fyren_1: [{ sprite: 'fyrVrak', tx: 30, ty: 9 }],
  fyren_2: [{ sprite: 'fyrTunnor', tx: 5, ty: 33 }, { sprite: 'fyrTrappa', tx: 10, ty: 33 }, { sprite: 'fyrLogg', tx: 15, ty: 33 }],
  fyren_3: [{ sprite: 'fyrTunnor', tx: 6, ty: 9 }, { sprite: 'fyrLogg', tx: 12, ty: 5 }, { sprite: 'fyrTunnor', tx: 19, ty: 9 }, { sprite: 'fyrTunnor', tx: 25, ty: 9 }, { sprite: 'fyrLogg', tx: 32, ty: 9 }, { sprite: 'fyrTunnor', tx: 38, ty: 9 }, { sprite: 'fyrTunnor', tx: 44, ty: 9 }, { sprite: 'fyrLogg', tx: 49, ty: 9 }],
  fyren_4: [{ sprite: 'fyrLins', tx: 9, ty: 9 }],
  folkparken_1: [{ sprite: 'parkAffisch', tx: 8, ty: 9 }, { sprite: 'parkLyckohjul', tx: 13, ty: 9 }, { sprite: 'parkAffisch', tx: 20, ty: 9 }, { sprite: 'parkAffisch', tx: 27, ty: 9 }, { sprite: 'parkLyckohjul', tx: 33, ty: 9 }, { sprite: 'parkAffisch', tx: 40, ty: 5 }, { sprite: 'parkAffisch', tx: 47, ty: 9 }, { sprite: 'parkLyckohjul', tx: 53, ty: 9 }],
  folkparken_2: [{ sprite: 'parkAffisch', tx: 6, ty: 9 }, { sprite: 'parkKarusell', tx: 12, ty: 9 }, { sprite: 'parkAffisch', tx: 10, ty: 9 }, { sprite: 'parkKarusell', tx: 32, ty: 9 }, { sprite: 'parkAffisch', tx: 36, ty: 9 }, { sprite: 'parkKarusell', tx: 38, ty: 9 }, { sprite: 'parkAffisch', tx: 44, ty: 9 }, { sprite: 'parkKarusell', tx: 49, ty: 9 }],
  folkparken_3: [{ sprite: 'parkAffisch', tx: 8, ty: 9 }, { sprite: 'parkLyckohjul', tx: 54, ty: 9 }, { sprite: 'parkAffisch', tx: 4, ty: 9 }, { sprite: 'parkAffisch', tx: 50, ty: 9 }],
  folkparken_4: [{ sprite: 'parkScen', tx: 13, ty: 9 }],
  fabod_1: [{ sprite: 'skogSten', tx: 7, ty: 9 }, { sprite: 'skogGardsgard', tx: 18, ty: 9 }, { sprite: 'skogSten', tx: 22, ty: 9 }, { sprite: 'skogSten', tx: 27, ty: 9 }, { sprite: 'skogGardsgard', tx: 37, ty: 9 }, { sprite: 'skogSten', tx: 41, ty: 9 }, { sprite: 'skogSten', tx: 47, ty: 9 }],
  fabod_2: [{ sprite: 'skogSten', tx: 7, ty: 9 }, { sprite: 'skogOffersten', tx: 17, ty: 9 }, { sprite: 'skogSten', tx: 21, ty: 7 }, { sprite: 'skogOffersten', tx: 29, ty: 9 }, { sprite: 'skogSten', tx: 34, ty: 9 }, { sprite: 'skogOffersten', tx: 42, ty: 9 }],
  fabod_3: [{ sprite: 'skogSvampring', tx: 6, ty: 9 }, { sprite: 'skogHaltrad', tx: 12, ty: 9 }, { sprite: 'skogSvampring', tx: 16, ty: 9 }, { sprite: 'skogHaltrad', tx: 25, ty: 9 }, { sprite: 'skogSvampring', tx: 31, ty: 9 }, { sprite: 'skogHaltrad', tx: 35, ty: 9 }, { sprite: 'skogSvampring', tx: 43, ty: 9 }, { sprite: 'skogHaltrad', tx: 28, ty: 9 }],
  fabod_4: [{ sprite: 'skogHaltrad', tx: 11, ty: 9 }, { sprite: 'skogGardsgard', tx: 18, ty: 9 }],
  troll_2: [{ sprite: 'trollKittel', tx: 7, ty: 9 }, { sprite: 'trollSkatt', tx: 13, ty: 9 }, { sprite: 'trollKittel', tx: 10, ty: 9 }, { sprite: 'trollSkatt', tx: 37, ty: 9 }, { sprite: 'trollKittel', tx: 40, ty: 9 }, { sprite: 'trollSkatt', tx: 43, ty: 9 }, { sprite: 'trollKittel', tx: 47, ty: 9 }, { sprite: 'trollSkatt', tx: 53, ty: 9 }],
  troll_gangar_1: [{ sprite: 'trollAnsikte', tx: 21, ty: 9 }],
  troll_gangar_2: [{ sprite: 'trollAnsikte', tx: 24, ty: 9 }],
  troll_3: [{ sprite: 'trollSkatt', tx: 5, ty: 29 }, { sprite: 'trollAnsikte', tx: 10, ty: 29 }, { sprite: 'trollSkatt', tx: 15, ty: 29 }],
  troll_skugga: [{ sprite: 'trollAnsikte', tx: 13, ty: 9 }],
  troll_4: [{ sprite: 'trollSkatt', tx: 7, ty: 9 }, { sprite: 'trollTron', tx: 13, ty: 9 }, { sprite: 'trollSkatt', tx: 20, ty: 9 }],
};
