import type { DialogDef } from '../types';

/** Shared by every temple and creature. */
export const ALLMANT: Record<string, DialogDef> = {
  dorr_last: {
    pages: ['Uppgången är stängd. Något väntar fortfarande vid altaret.'],
  },

  nyckel_saknas: {
    pages: ['Dörren är låst. Det behövs en nyckel.'],
  },

  boss_vaknar: {
    pages: ['Marken skälver. Något mycket gammalt vaknar.'],
  },

  boss_forlikad: {
    pages: ['Väsendet suckar djupt, som efter en lång dröm, och sjunker ner i marken.'],
  },
};
