import type { DialogDef } from '../types';

/** Temple 2: Den gamla gruvan and Gruvrået. */
export const GRUVAN: Record<string, DialogDef> = {
  gruvan_skylt1: {
    pages: ['En emaljskylt, rostig i kanterna:\n"STOLL NR 3 – STÄNGD 1951. OBEHÖRIGA ÄGA EJ TILLTRÄDE."'],
  },

  gruvan_skylt2: {
    pages: ['Någon har ristat i en stötta: "Hälsa på rået när du går in, tacka henne när du går ut."'],
  },

  gruvan_skylt3: {
    pages: ['En gammal karbidlampa hänger på en spik. Den är kall. Initialerna H.D. är inristade i mässingen.'],
  },

  gruvra_vaknar: {
    speaker: 'Gruvrået',
    pages: ['Ingen hälsar längre. Ingen tackar. De tar malmen och släcker lyktorna... Så låt mörkret ta dem.'],
  },

  gruvra_forlikad: {
    speaker: 'Gruvrået',
    pages: [
      '...Du slog inte för att döda. Du slog som en Väktare.',
      'Den förra kom hit med sin lampa varje vår och hälsade. Hon lämnade den här när hon gick för sista gången.',
      'Ta den, barn. Mörkret ska inte skrämma dig mer.',
    ],
  },

  fick_karbidlampa: {
    pages: [
      'Dagny fick KARBIDLAMPAN!\nNu ser hon dubbelt så långt i mörka gruvor och grottor.',
      'Lyktorna längs orten tänds en efter en. En bit till av sommarljuset har kommit tillbaka.',
      'Med lampan går det att ta sig genom den gamla gruvgången i berget öster om gruvan. På andra sidan ligger kvarnen vid forsen.',
    ],
    actions: [{ type: 'flag', flag: 'gruvan_klar' }],
  },
};
