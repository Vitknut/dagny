import type { SkillDef, SkillId, SpellDef, SpellId } from './types';

/** The seven "läsningar" – old folk charms taught by village elders. */
export const SPELLS: Readonly<Record<SpellId, SpellDef>> = {
  lakning: {
    id: 'lakning',
    name: 'Läkning',
    description: 'En gammal läsning mot värk. Fyller på livet.',
    cost: [3, 3, 3, 3, 2, 2, 2, 2, 2, 2, 2, 2],
    duration: 0,
    village: 'Mormors by',
  },
  skydd: {
    id: 'skydd',
    name: 'Skydd',
    description: 'Ett kors av rönn över bröstet. Halverar skadan så länge Dagny är kvar i rummet.',
    cost: [2, 2, 2, 2, 2, 2, 1, 1, 1, 1, 1, 1],
    duration: 20,
    village: 'Bruksorten',
  },
  hopp: {
    id: 'hopp',
    name: 'Hopp',
    description: 'Lätt som en sädesärla. Högre hopp så länge Dagny är kvar i rummet.',
    cost: [2, 2, 2, 2, 2, 2, 2, 2, 1, 1, 1, 1],
    duration: 20,
    village: 'Fiskeläget',
  },
  lyse: {
    id: 'lyse',
    name: 'Lyse',
    description: 'Ett varmt sken som lyser upp mörka grottor och valv.',
    cost: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    duration: 45,
    village: 'Gruvsamhället',
  },
  eld: {
    id: 'eld',
    name: 'Eld',
    description: 'Midsommareld i klingan. Svärdet skjuter eldbollar.',
    cost: [3, 3, 3, 3, 3, 3, 2, 2, 2, 2, 2, 2],
    duration: 20,
    village: 'Kyrkbyn',
  },
  hamn: {
    id: 'hamn',
    name: 'Hamn',
    description: 'Byt hamn. Bli en liten fågel som tar sig genom trånga passager.',
    // As dear as Åska: changing shape lets Dagny round walls and gates, so one
    // flight should empty the bar at mid levels and need a termos to repeat.
    cost: [6, 6, 6, 6, 5, 5, 5, 5, 5, 5, 5, 4],
    duration: 15,
    village: 'Fäboden',
  },
  aska: {
    id: 'aska',
    name: 'Åska',
    description: 'Tors vrede. Träffar alla väsen på skärmen.',
    cost: [6, 6, 6, 5, 5, 5, 5, 5, 4, 4, 4, 4],
    duration: 0,
    village: 'Stationssamhället',
  },
};

export const SPELL_ORDER: readonly SpellId[] = ['lakning', 'skydd', 'hopp', 'lyse', 'eld', 'hamn', 'aska'];

export const SKILLS: Readonly<Record<SkillId, SkillDef>> = {
  nedatstot: {
    id: 'nedatstot',
    name: 'Nedåtstöt',
    description: 'Håll NER i luften för att stöta svärdet nedåt.',
    village: 'Mormors by',
  },
  uppatstot: {
    id: 'uppatstot',
    name: 'Uppåtstöt',
    description: 'Håll UPP och slå för att stöta svärdet uppåt.',
    village: 'Bruksorten',
  },
};
