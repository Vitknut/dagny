import type { DialogDef } from '../types';

/** Finds: the sword upgrades, life and magic containers and the näverdockor. */
export const FOREMAL: Record<string, DialogDef> = {
  hittade_solsten: { pages: ['Dagny hittade SOLSTENEN! Hon håller den mot dimman, och den lyser upp – som om solen satt inuti.'] },
  hittade_ronnkvist: { pages: ['Dagny bröt en RÖNNKVIST! Bären är röda som glöd.'] },
  hittade_fjader: { pages: ['Dagny hittade ÄRLANS FJÄDER! Den väger nästan ingenting.'] },
  hittade_askvigg: { pages: ['Dagny hittade ÅSKVIGGEN! Stenen är sval och slät, och det pirrar i fingrarna.'] },

  holm_tips_malm: {
    speaker: 'Smeden Holm',
    pages: ['Klingan är bra, men den är mjuk efter alla år i en korg. Hitta mig en klump järnmalm i gamla gruvan, så härdar jag den åt dig.'],
  },

  holm_hardar: {
    speaker: 'Smeden Holm',
    pages: [
      'Där har vi malmen! Ge mig klingan en stund.',
      'Rött i ässjan, svart i vattnet... Så. Känn hur den biter nu.',
    ],
    actions: [{ type: 'takeItem', item: 'malm' }, { type: 'flag', flag: 'malm_klar' }, { type: 'giveItem', item: 'klingaHardad' }],
    next: 'fick_klingaHardad',
  },

  fick_klingaHardad: {
    pages: ['Klingan är HÄRDAD!\nSvärdet gör 1 mer i skada.'],
  },

  holm_tips_askstenen: {
    speaker: 'Smeden Holm',
    pages: ['Vill du ha en egg som ingen annan? Det sägs att blixten slår ner i fyren ute i skären. Där den slår blir stenen till glas. En sådan åsksten skulle jag kunna slipa med.'],
  },

  holm_slipar: {
    speaker: 'Smeden Holm',
    pages: [
      'En åsksten! Den är ju fortfarande varm.',
      'Hör hur det knastrar när jag drar den mot eggen... Där. Akta fingrarna, den här skär i ljus.',
    ],
    actions: [{ type: 'takeItem', item: 'askstenen' }, { type: 'flag', flag: 'askstenen_klar' }, { type: 'giveItem', item: 'klingaBlank' }],
    next: 'fick_klingaBlank',
  },

  fick_klingaBlank: {
    pages: ['Klingan är ÅSKSLIPAD!\nSvärdet gör 1 mer i skada.'],
  },

  hittade_malm: {
    pages: ['Dagny hittade en klump JÄRNMALM. Smeden Holm i Bruksorten kan nog använda den.'],
  },

  hittade_askstenen: {
    pages: ['Dagny hittade ÅSKSTENEN, en glaserad sten där blixten har slagit ner. Den är fortfarande varm.'],
  },

  hittade_silverbeslag: {
    pages: ['I lampans sken blänker något bakom en sten: Grå-Pelles silver! Det är smitt till ett beslag som passar precis runt kläppen.', 'Dagny fäster SILVERBESLAGET på klingan.\nSvärdet gör 1 mer i skada. Väsen ryggar för silver.'],
  },

  fick_livbehallare: {
    pages: ['Dagny hittade en LIVBEHÅLLARE!\nHennes liv räcker lite längre nu.'],
  },

  fick_naverdocka: {
    pages: [
      'Dagny hittade en NÄVERDOCKA!\nNågon har flätat den av björknäver och knutit en röd snibb om den.',
      'Mormor sa alltid att en näverdocka håller ett liv åt den som bär den.\n(+1 liv. Fler dockor finns gömda här och där.)',
    ],
  },

  fick_magibehallare: {
    pages: ['Dagny hittade en MAGIBEHÅLLARE!\nHon orkar läsa lite fler läsningar nu.'],
  },
};
