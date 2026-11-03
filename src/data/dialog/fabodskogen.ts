import type { DialogDef } from '../types';

/** Temple 6: Fäbodskogen, Skogsrået and the näverlur. */
export const FABODSKOGEN: Record<string, DialogDef> = {
  fabod_skylt1: {
    pages: ['En handmålad skylt på en gärdesgård:\n"TILL FÄBODEN. FÖLJ DET RÖDA BANDET. LITA INTE PÅ LJUSEN."'],
  },

  villse: {
    pages: ['Stigen slingrar sig ... och leder rakt tillbaka till där du började. Skogen fnissar mellan granarna.'],
  },

  villse2: {
    pages: ['Irrblosset slocknar så fort du kommer fram. Du står vid ljusstaken igen.'],
  },

  skogsra_vaknar: {
    speaker: 'Skogsrået',
    pages: ['Ingen vallar korna här längre. Ingen sjunger på vallen. Fäbodarna står och ruttnar... som min rygg. Kom närmare, lilla vän.'],
  },

  skogsra_forlikad: {
    speaker: 'Skogsrået',
    pages: [
      'Du såg min rygg och vände inte om. Det är det som skiljer en Väktare från en jägare.',
      'Hon satt här på vallen och vävde en näverfilt den sista sommaren. Den blev aldrig klar... Den låg i en korg under klockstapeln.',
      'Ta luren. Blås, så kommer de du förlikat. Du är inte ensam längre.',
    ],
  },

  fick_naverlur: {
    pages: [
      'Dagny fick NÄVERLUREN!\nHåll NER och tryck MAGI, så kommer en vätte och hjälper dig en stund.',
      'Någon kular långt borta på vallen, och dimman lättar. En bit till av sommarljuset har kommit tillbaka.',
      'Från fäbodvallen går en gammal stig österut, upp mot Trollberget. Men berget öppnar sig först när alla sex platser har vaknat.',
    ],
    actions: [{ type: 'flag', flag: 'fabodskogen_klar' }],
  },

  lur_blast: {
    pages: ['Näverluren ljuder över skogen! En vätte kommer springande för att hjälpa.'],
  },

  lur_vila: {
    pages: ['Vättarna vilar. Vänta en stund innan du blåser igen.'],
  },
};
