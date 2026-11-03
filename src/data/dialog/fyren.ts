import type { DialogDef } from '../types';

/** Temple 4: Fyren i skären and Havsfrun. */
export const FYREN: Record<string, DialogDef> = {
  fyren_skylt1: {
    pages: ['En mässingsskylt vid fyrens fot:\n"FYREN TÄNDES 1887. SLÄCKT I VÄNTAN PÅ AUTOMATISERING."'],
  },

  fyren_skylt2: {
    pages: ['Fyrvaktarens loggbok ligger uppslagen. Sista raden: "Midsommarnatten 1946. Ett ljus gick ner över Kyrkbyn. Signalen från stranden tystnade."'],
  },

  havsfru_vaknar: {
    speaker: 'Havsfrun',
    pages: ['Fyren är släckt, båtarna seglar på radar och ingen lägger längre en slant i vattnet åt mig. Låt stormen påminna dem.'],
  },

  havsfru_forlikad: {
    speaker: 'Havsfrun',
    pages: [
      'Stormen har bedarrat... Du stod kvar på galleriet fast vinden slet i dig. Precis som hon.',
      'Varje kväll blinkade hon med sin lampa från stranden. Tre korta, tre långa, tre korta. Och någon i Kyrkbyn svarade.',
      'Ta lampan. Kanske finns det någon som fortfarande väntar på signalen.',
    ],
  },

  fick_ficklampa: {
    pages: [
      'Dagny fick FICKLAMPAN!\nI mörker lyser den upp vägen framför henne.',
      'Fyren tänds igen och sveper över skären. En bit till av sommarljuset har kommit tillbaka.',
      'Väster om Fiskeläget står Nattskogen, så tät att det är mörkt mitt på dagen. Med ficklampan hittar Dagny igenom, till slätten med folkparken.',
    ],
    actions: [{ type: 'flag', flag: 'fyren_klar' }],
  },
};
