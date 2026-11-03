import type { DialogDef } from '../types';

/** Temple 3: Kvarnen vid forsen and Bäckahästen. */
export const KVARNEN: Record<string, DialogDef> = {
  kvarnen_lucka: {
    pages: [
      'Rakt ovanför sitter en lucka i taket, tung och fastrostad. Den går inte att nå med händerna.',
      'Någon har ristat i bjälken bredvid: "SLÅ UPP DEN UNDERIFRÅN SOM VI GÖR PÅ BRUKET."',
    ],
  },

  kvarnen_skylt1: {
    pages: ['En skylt vid bäcken:\n"BADA EJ I FORSEN. FÖLJ EJ EFTER VITA HÄSTAR."\nNågon har strukit under sista raden.'],
  },

  kvarnen_skylt2: {
    pages: ['Inristat i kvarnstenen: en sol, och under den ett namn som någon har försökt skrapa bort.'],
  },

  backahast_vaknar: {
    speaker: 'Bäckahästen',
    pages: ['Sitt upp, lilla tös. Rid med mig ner i forsen. Ingen har sagt mitt namn på länge... ingen kan tvinga mig att gå.'],
  },

  backahast_forlikad: {
    speaker: 'Bäckahästen',
    pages: [
      'Den förra Väktaren sa mitt namn högt, och jag blev fri från vreden. Du säger ingenting...',
      '...men jag hör det ändå. Hur du andas. Hur du står kvar. Det är samma sak.',
      'Hon lämnade sina stövlar på stranden den sista sommaren. Ta dem. Myren bär dig nu.',
    ],
  },

  fick_stovlar: {
    pages: [
      'Dagny fick GUMMISTÖVLARNA!\nNu kan hon gå över myren på kartan.',
      'Regnet tunnas ut över forsen. Kvarnhjulet börjar snurra igen, och en bit till av sommarljuset kommer tillbaka.',
      'Med stövlarna går det att vada över tidvattenkärret söder om Bruksorten, ner till kusten där fyren står.',
    ],
    actions: [{ type: 'flag', flag: 'kvarnen_klar' }],
  },
};
