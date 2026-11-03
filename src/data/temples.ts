import type { TempleDef, VillageDef } from './types';

/**
 * The seven holy places. The engine supports all of them; temples without an
 * `entryArea` are shown on the map as sleeping stone circles until built.
 */
export const TEMPLES: readonly TempleDef[] = [
  {
    id: 'krypta', number: 1, name: 'Stenkyrkans krypta', short: 'Stenkyrkan',
    mechanic: 'Valv, ljusstakar, enkla dörrar och nycklar.',
    tone: 'krypta', music: 'tempel', bossMusic: 'boss',
    treasure: 'eka', boss: 'grim', entryArea: 'krypta_1',
    lore: 'I kryptan står ett namn inristat i stenen, nästan bortnött: "...da, Väktare 1921–1946".',
  },
  {
    id: 'gruvan', number: 2, name: 'Den gamla gruvan', short: 'Gruvan',
    mechanic: 'Gruvvagnar, hissar, mörker.',
    tone: 'gruva', music: 'tempel', bossMusic: 'boss',
    treasure: 'karbidlampa', boss: 'gruvraet', entryArea: 'gruvan_1',
    lore: 'En lampa med initialerna H.D. hänger kvar på en spik.',
  },
  {
    id: 'kvarnen', number: 3, name: 'Kvarnen vid forsen', short: 'Kvarnen',
    mechanic: 'Vattenhjul, rörliga plattformar.',
    tone: 'gra_augusti', music: 'tempel', bossMusic: 'boss',
    treasure: 'stovlar', boss: 'backahasten', entryArea: 'kvarnen_1',
    lore: 'Någon har ristat en sol i kvarnstenen.',
  },
  {
    id: 'fyren', number: 4, name: 'Fyren i skären', short: 'Fyren',
    mechanic: 'Vind som knuffar, uppåt i torn.',
    tone: 'storm', music: 'tempel', bossMusic: 'boss',
    treasure: 'ficklampa', boss: 'havsfrun', entryArea: 'fyren_1',
    lore: 'Fyrvaktarens loggbok, midsommarnatten 1946: "Ett ljus gick ner över Kyrkbyn."',
  },
  {
    id: 'folkparken', number: 5, name: 'Folkparken om natten', short: 'Folkparken',
    mechanic: 'Karusell, dansbana, ljusslingor.',
    tone: 'folkpark', music: 'tempel', bossMusic: 'boss',
    treasure: 'radio', boss: 'spelmannen', entryArea: 'folkparken_1',
    lore: 'Ett gammalt fotografi: en kvinna med kopparfärgat hår dansar med ett irrbloss.',
  },
  {
    id: 'fabodskogen', number: 6, name: 'Fäbodskogen', short: 'Fäbodskogen',
    mechanic: 'Täta träd, irrbloss, vilseledande stigar.',
    tone: 'skog', music: 'tempel', bossMusic: 'boss',
    treasure: 'naverlur', boss: 'skogsraet', entryArea: 'fabod_1',
    lore: 'En vävd näverfilt, hälften färdig, ligger kvar i fäbodstugan.',
  },
  {
    id: 'trollberget', number: 7, name: 'Trollberget', short: 'Trollberget',
    mechanic: 'Allt kombinerat, högt och farligt.',
    tone: 'troll', music: 'trollberget', bossMusic: 'bergakung',
    treasure: null, boss: 'bergakungen', entryArea: 'troll_1',
    lore: 'Dagmar gick in i berget midsommarnatten 1946 och band sig vid Bergakungen, för att hålla vreden borta.',
  },
];

export function templeById(id: string): TempleDef | undefined {
  return TEMPLES.find((t) => t.id === id);
}

export const VILLAGES: readonly VillageDef[] = [
  { id: 'mormors_by', name: 'Mormors by', area: 'mormors_by', wakeEntry: 'H', teaches: 'lakning', place: 'krypta' },
  { id: 'bruksorten', name: 'Bruksorten', area: 'bruksorten', wakeEntry: 'H', teaches: 'skydd', place: 'kvarnen' },
  { id: 'fiskelaget', name: 'Fiskeläget', area: 'fiskelaget', wakeEntry: 'H', teaches: 'hopp', place: 'fyren' },
  { id: 'gruvsamhallet', name: 'Gruvsamhället', area: 'gruvsamhallet', wakeEntry: 'H', teaches: 'lyse', place: 'gruvan' },
  { id: 'kyrkbyn', name: 'Kyrkbyn', area: 'kyrkbyn', wakeEntry: 'H', teaches: 'eld', place: 'krypta' },
  { id: 'faboden', name: 'Fäboden', area: 'faboden', wakeEntry: 'H', teaches: 'hamn', place: 'fabodskogen' },
  { id: 'stationssamhallet', name: 'Stationssamhället', area: 'stationssamhallet', wakeEntry: 'H', teaches: 'aska', place: 'folkparken' },
];
