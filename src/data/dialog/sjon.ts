import type { DialogDef } from '../types';

/** The lake: the hermit on his island, Måsskäret in the fog, and the signal stone on the far shore. */
export const SJON: Record<string, DialogDef> = {
  // --- Eremitholmen --------------------------------------------------------------------------
  eremit_skylt: {
    pages: ['En båtlänning av gamla plankor. Någon har ristat streck i en stolpe – ett för varje vinter, verkar det. Det är många streck.'],
  },
  eremit_forsta: {
    speaker: 'Eremiten',
    pages: [
      'Nej men. En båt på sjön igen. Den ekan känner jag igen, flicka.',
      'Förr rodde en kvinna hit om kvällarna, med kopparhår som ditt. Hon satt där du står och såg bort mot Kyrkbyn tills det blev mörkt.',
      'Sedan rodde hon vidare österut, till sanden på andra stranden. Därifrån blinkade hon med sin lampa. Varje kväll.',
      'Och ser du dimman där borta i söder? Mitt i den ligger ett skär som måsarna har för sig själva. Hon brukade vila där. Ingen annan hittar dit.',
      'Akta dig för strömmen i sydväst. Sjön rinner ut i forsen där, och den drar.',
    ],
    actions: [{ type: 'flag', flag: 'eremit_traffad' }, { type: 'flag', flag: 'rykte_masskaret' }, { type: 'flag', flag: 'rykte_signalstranden' }],
  },
  eremit_igen: {
    speaker: 'Eremiten',
    pages: ['Gruvan i norr har legat tyst sedan fyrtiosex. Men ibland, när det är stilla på sjön, hör jag hackor därinne. Som om någon fortfarande gräver.'],
  },

  // --- Måsskäret -----------------------------------------------------------------------------
  masskaret_ristning: {
    pages: [
      'I berghällen, där måsarna inte sitter, är det ristat en liten sol. Under den en enda bokstav: D.',
      'Bredvid, med en annan hand: ett H. Någon har ristat dem samtidigt, sida vid sida.',
    ],
  },

  // --- Signalstranden ------------------------------------------------------------------------
  signalsten_las: {
    pages: [
      'En stor sten vid vattnet. I den är det ristat tre streck, tre ringar, tre streck.',
      'Rakt över sjön, långt borta, syns klockstapeln i Kyrkbyn. Härifrån ser den liten ut, som en tändsticka.',
    ],
  },
  signalsten_ficklampa: {
    pages: [
      'Tre streck, tre ringar, tre streck. Rakt över sjön står klockstapeln i Kyrkbyn och ser hit.',
      'Dagny tar fram ficklampan.',
    ],
    choices: [
      { text: 'Blinka: tre korta, tre långa, tre korta', actions: [{ type: 'signal', then: 'signalen_besvaras' }] },
      { text: 'Låt bli' },
    ],
  },
  signalen_besvaras: {
    pages: ['Ljuset i klockstapeln lyser en stund till. Sedan slocknar det, och det är bara vågorna igen.'],
    actions: [{ type: 'flag', flag: 'signalen_besvarad' }, { type: 'life', id: 'signalen' }, { type: 'xp', amount: 100 }],
  },
  signalsten_besvarad: {
    pages: ['Stenen är sval. På andra sidan sjön lyser klockstapeln en stund till, och slocknar.'],
  },
  hulda_signal: {
    speaker: 'Mormor Hulda',
    pages: [
      'Jag såg ditt ljus i går kväll, Dagny. Tre korta, tre långa, tre korta.',
      'Jag gick upp i klockstapeln och svarade. Benen bar mig, fast de inte har gjort det på länge.',
      'Arton år har jag stått där om kvällarna och tittat ut över sjön. Nu har någon blinkat tillbaka.',
    ],
    actions: [{ type: 'flag', flag: 'hulda_signal' }],
  },
};
