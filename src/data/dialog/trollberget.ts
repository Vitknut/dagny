import type { DialogDef } from '../types';

/** Temple 7: Trollberget – the maze, Skuggan, Bergakungen and Dagmar. */
export const TROLLBERGET: Record<string, DialogDef> = {
  troll_gangar_skylt1: {
    pages: ['Någon har ristat i berget, djupt och länge sedan:\n"TRE GÅNGAR. TVÅ GÅR I RING.\nDEN MITTERSTA BÄR."'],
  },

  troll_gangar_skylt2: {
    pages: ['Samma hand har ristat igen:\n"SOLEN GÅR NER I VÄSTER.\nGÅ DIT HON GÅR."'],
  },

  troll_villse: {
    pages: ['Gången slingrade sig i mörkret...\n...och Dagny kom ut där hon började.'],
  },

  troll_villse2: {
    pages: ['Gången vred sig om och om igen.\nNär den tog slut stod Dagny vid ingången till Trollgångarna igen.'],
  },

  skuggan_moter: {
    pages: [
      'Ur mörkret kliver en gestalt. Den har Dagnys flätor, Dagnys sjal – och röda, glödande ögon.',
      'Den lyfter sitt svärd precis som hon. Den parerar där hon parerar.\nVägen ut stängs bakom dem.',
    ],
  },

  troll_skylt1: {
    pages: ['Någon har ristat i berget, för länge sedan:\n"D. GICK HÄR MIDSOMMARNATT 1946. GLÖM OSS INTE."'],
  },

  bergakung_vaknar: {
    speaker: 'Bergakungen',
    pages: [
      'SÅ. ÄNTLIGEN KOMMER NÅGON UPP FÖR BERGET IGEN.',
      'DE STENGÄRDSGÅRDAR NI RIVER. DE KÄLLOR NI FYLLER IGEN. DE NAMN NI GLÖMMER. ALLT DET BÄR JAG.',
      'HON SOM BAND MIG ÄR SVAG NU. VISA MIG OM DU ÄR STARKARE, LILLA VÄKTARE.',
    ],
  },

  bergakung_forlikad: {
    speaker: 'Bergakungen',
    pages: [
      'Du slog... men inte för att döda. Och du gick upp hela vägen, genom sex platser som alla har vaknat i godo.',
      'Då minns människorna oss igen. Vreden får vila.',
      'Hon som väntar här har hållit mig i arton år. Gå till henne nu. Hon har väntat längre på dig än på mig.',
    ],
  },

  dagmar_avsked: {
    speaker: 'Dagmar',
    pages: [
      'Dagny. Du har blivit så stor.',
      'Midsommarnatten 1946 sov alla platserna in, och Bergakungen vaknade i vrede. Mamma hade släppt platserna under kriget, och gåvan hade lämnat henne. Det fanns ingen annan Väktare än jag.',
      'Mamma var ute på en förlossning. Så jag lade dig i näverfilten under klockstapeln och lät klockan ringa, så att hon skulle komma. Och så gick jag upp i berget.',
      'Jag band mig vid honom, så länge människorna mindes de heliga platserna. Men de glömde. Bandet blev svagare för varje sommar.',
      'Nu har du väckt dem igen, en efter en. Bandet behövs inte längre. Och jag... jag kan inte stanna. Inte än, älskling.',
    ],
    choices: [{ text: 'Krama henne', next: 'dagmar_ljus' }],
  },

  dagmar_ljus: {
    speaker: 'Dagmar',
    pages: [
      'Där. Nu vet jag hur det känns. Det räckte gott.',
      'Du behöver inte säga något. Det har du aldrig behövt. Ditt namn säger allt: ny dag.',
      'Berget släpper mig inte på en gång. Arton år sitter i. Men en dag kommer jag hem. Det lovar jag.',
      'Hälsa mamma. Säg att det aldrig var hennes fel. Och att hon höll sitt löfte.',
      'Se. Solen går upp.',
    ],
    actions: [{ type: 'flag', flag: 'trollberget_klar' }, { type: 'scene', scene: 'ending' }],
  },
};
