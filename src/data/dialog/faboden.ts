import type { DialogDef } from '../types';

/** Fäboden: the summer farm, gammelmor Karna (Hamn) and Lill-Per's cow bell. */
export const FABODEN: Record<string, DialogDef> = {
  anna_vila: {
    speaker: 'Budejan Anna',
    pages: ['Du ser trött ut. Det finns mjölk i kallkällan och en bädd i stugan. Vill du vila?'],
    choices: [
      { text: 'Vila i stugan', next: 'anna_vilat', actions: [{ type: 'rest' }] },
      { text: 'Inte nu', next: 'anna_hej' },
    ],
  },

  anna_vilat: {
    speaker: 'Budejan Anna',
    pages: ['Korna har redan gått ut. Du sov så gott att jag inte nändes väcka dig. Kom tillbaka när du vill.'],
  },

  anna_hej: {
    speaker: 'Budejan Anna',
    pages: ['Gå inte för långt in i skogen. Det är lätt att gå vilse i Fäbodskogen, även för oss som bor här.'],
  },

  karna_uppdrag: {
    speaker: 'Gammelmor Karna',
    pages: [
      'Jaså, det är du. Skogen har viskat om dig ett tag nu. Om flickan som förlikar.',
      'Jag kan en läsning som få kan. Man byter hamn och blir en liten fågel som kommer in där ingen annan kommer in.',
      'Men hamnen måste ha något att byta till. Hämta mig en fjäder från berguven. Den bor i branten öster om fäbodarna, där kalfjället börjar.',
    ],
    actions: [{ type: 'flag', flag: 'uvfjader_uppdrag' }],
  },

  karna_vantar: {
    speaker: 'Gammelmor Karna',
    pages: ['Berguven bor i branten öster om fäbodarna. Den tappar sina fjädrar högst upp, dit ingen vill klättra.'],
  },

  karna_hittat: {
    speaker: 'Gammelmor Karna',
    pages: [
      'Jaså, det är du. Skogen har viskat om dig ett tag nu. Om flickan som förlikar.',
      'Och vad har du där? En fjäder från berguven! Då vet jag vad du ska ha den till.',
    ],
    actions: [{ type: 'flag', flag: 'uvfjader_uppdrag' }],
    next: 'karna_lar',
  },

  karna_lar: {
    speaker: 'Gammelmor Karna',
    pages: [
      'Uvens fjäder. Den har sett mer av natten än vi andra, och den flyger utan ett ljud.',
      'Man byter hamn och blir en liten fågel som kommer in där ingen annan kommer in.',
      '"Hamn av fjäder, hamn av vind, byt mig om och ta mig in." Så. Men flyg inte för länge, då glömmer du vem du är.',
    ],
    actions: [{ type: 'takeItem', item: 'uvfjader' }, { type: 'flag', flag: 'uvfjader_klar' }, { type: 'learnSpell', spell: 'hamn' }],
    next: 'lart_hamn',
  },

  lart_hamn: {
    pages: ['Dagny lärde sig läsningen HAMN!\nDagny blir en liten fågel en stund och kan flyga genom trånga passager.'],
  },

  karna_igen: {
    speaker: 'Gammelmor Karna',
    pages: ['En fågel ser världen uppifrån. Det är nyttigt för en Väktare. Man ser vad som hänger ihop.'],
  },

  lillper_uppdrag: {
    speaker: 'Lill-Per',
    pages: [
      'Stjärna har tappat sin skälla! Nu hittar jag henne inte när hon går in i skogen.',
      'Jag tror att den ramlade av vid de tre stigarna. Där vågar jag inte gå. Det fnissar mellan granarna.',
    ],
    actions: [{ type: 'flag', flag: 'skalla_uppdrag' }],
  },

  lillper_vantar: {
    speaker: 'Lill-Per',
    pages: ['Skällan ligger nog vid Villvägarna i skogen, där stigen delar sig i tre. Lyssna efter klangen!'],
  },

  lillper_tack: {
    speaker: 'Lill-Per',
    pages: [
      'Den klingar! Stjärna, hör du? Nu kan du gå vart du vill igen.',
      'Ta det här. Mamma säger att man ska betala sina skulder. Och jag har inget annat.',
    ],
    actions: [{ type: 'takeItem', item: 'skalla' }, { type: 'flag', flag: 'skalla_klar' }, { type: 'xp', amount: 150 }, { type: 'heal' }],
    next: 'lillper_xp',
  },

  lillper_xp: {
    pages: ['Dagny fick 150 XP och känner sig utvilad.'],
  },

  lillper_glad: {
    speaker: 'Lill-Per',
    pages: ['Stjärna går aldrig vilse längre. Jag hör skällan ända från stugan.'],
  },

  hittade_skalla: {
    pages: ['Dagny hittade en KOSKÄLLA. Den klingar klart när hon skakar den. Den är nog Stjärnas.'],
  },

  stjarna: {
    pages: ['Kon tittar på Dagny med stora, fuktiga ögon. Hon saknar sin skälla.'],
  },

  stjarna_glad: {
    pages: ['Stjärna råmar nöjt. Skällan klingar när hon vänder på huvudet.'],
  },

  rosen: {
    pages: ['En kraftig fjällko med stora horn. Hon tuggar och tuggar och bryr sig inte om någonting annat.'],
  },

  britta: {
    speaker: 'Britta',
    pages: ['Mormor Karna säger att hon kan bli en uggla. Jag har aldrig sett det. Men hon vet saker hon inte borde veta.'],
  },

  britta_efter: {
    speaker: 'Britta',
    pages: ['Skogsrået sjunger om nätterna nu! Inte läskigt, mest vackert. Mormor sjunger med.'],
  },
};
