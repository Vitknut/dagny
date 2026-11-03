import type { DialogDef } from '../types';

/** Gruvsamhället: Maj at the boarding house, gamla Elin (Lyse) and Anders' pocket watch. */
export const GRUVSAMHALLET: Record<string, DialogDef> = {
  maj_vila: {
    speaker: 'Maj på pensionatet',
    pages: ['Välkommen till pensionatet! Ett rum med utsikt över lavtornet och frukost klockan sju. Vill du vila?'],
    choices: [
      { text: 'Vila på pensionatet', next: 'maj_vilat', actions: [{ type: 'rest' }] },
      { text: 'Inte nu', next: 'maj_hej' },
    ],
  },

  maj_vilat: {
    speaker: 'Maj på pensionatet',
    pages: ['God morgon! Kaffet står på spisen. Jag har skrivit in dig i gästboken, så du hittar alltid tillbaka hit.'],
  },

  maj_hej: {
    speaker: 'Maj på pensionatet',
    pages: ['Dörren står alltid öppen. Gruvfolk sover dåligt ändå, så någon är alltid vaken.'],
  },

  elin_uppdrag: {
    speaker: 'Gamla Elin',
    pages: [
      'Så du hittade upp hit. Det gör inte många. Jag sitter helst här, nära ljuset från gluggen.',
      'Det finns en läsning för ljus. Men ljus måste man ha något att tända den med. En sten som samlar solen, en solsten.',
      'Dagmar hade en sådan. Hon lämnade den i den gamla gruvan, långt ner i en ort där ljuset aldrig når. Hämta den, så ska jag lära dig.',
    ],
    actions: [{ type: 'flag', flag: 'solsten_uppdrag' }],
  },

  elin_vantar: {
    speaker: 'Gamla Elin',
    pages: ['Solstenen ligger djupt ner i den gamla gruvan. Där ljuset aldrig når.'],
  },

  elin_lar: {
    speaker: 'Gamla Elin',
    pages: [
      'Solstenen! Ja, det är hennes. Den lyser fortfarande, fast hon är borta.',
      'Du har kommit långt för att vara så ung. Gruvan är mörk nu, mörkare än den varit på hundra år.',
      'Min mor lärde mig en läsning när jag skulle ner i schaktet första gången. Den har lyst för mig i sextio år.',
      '"Lyse i natt, lyse i berg, lyse för den som går utan färg..." Så. Nu bär du ljuset själv.',
      'Och kom ihåg: det som gömmer sig i dimma tål inte ljus.',
    ],
    actions: [{ type: 'takeItem', item: 'solsten' }, { type: 'flag', flag: 'solsten_klar' }, { type: 'learnSpell', spell: 'lyse' }],
    next: 'lart_lyse',
  },

  lart_lyse: {
    pages: ['Dagny lärde sig läsningen LYSE!\nDen lyser upp mörka gruvor och valv en lång stund.'],
  },

  elin_igen: {
    speaker: 'Gamla Elin',
    pages: ['Glöm inte att hälsa på rået när du går ner. Och tacka henne när du kommer upp.'],
  },

  elin_efter: {
    speaker: 'Gamla Elin',
    pages: ['Jag hörde lyktorna tändas där nere, en efter en, som förr. Hon har förlåtit oss, tror jag.'],
  },

  anders_uppdrag: {
    speaker: 'Gruvarbetaren Anders',
    pages: [
      'Mitt fickur! Jag tappade det nere i Orten när lyktorna slocknade och vi fick springa.',
      'Det var farfars. Jag vågar inte gå ner igen. Om du ändå ska dit... håll utkik.',
    ],
    actions: [{ type: 'flag', flag: 'fickur_uppdrag' }],
  },

  anders_vantar: {
    speaker: 'Gruvarbetaren Anders',
    pages: ['Orten ligger efter hisschaktet. Uret måste ligga någonstans längst in, nära lyktan vid valvet.'],
  },

  anders_tack: {
    speaker: 'Gruvarbetaren Anders',
    pages: [
      'Det tickar fortfarande! Farfar sa alltid att det här uret stannar den dag gruvan dör.',
      'Ta det här, jag har sparat det till en regnig dag. Och kom till pensionatet i kväll, Maj bjuder.',
    ],
    actions: [
      { type: 'takeItem', item: 'fickur' },
      { type: 'flag', flag: 'fickur_klar' },
      { type: 'xp', amount: 120 },
      { type: 'heal' },
    ],
    next: 'anders_xp',
  },

  anders_xp: {
    pages: ['Dagny fick 120 XP och känner sig utvilad.'],
  },

  anders_glad: {
    speaker: 'Gruvarbetaren Anders',
    pages: ['Jag lyssnar på uret varje kväll innan jag somnar. Tack, Dagny.'],
  },

  hittade_fickur: {
    pages: ['Dagny hittade ett FICKUR i mässing. Det tickar fortfarande. Det är nog Anders.'],
  },

  lisa: {
    speaker: 'Lisa',
    pages: [
      'Pappa säger att gruvan stängde när jag var liten. Men om nätterna hör jag hackor där nere.',
      'Och ibland står en grå tant vid lavtornet med en lykta. Hon vinkar aldrig tillbaka.',
    ],
  },

  lisa_efter: {
    speaker: 'Lisa',
    pages: ['I går vinkade den grå tanten tillbaka! Ingen tror mig.'],
  },

  nils: {
    speaker: 'Gruvarbetaren Nils',
    pages: ['Bolaget vill riva lavtornet och bygga en bilväg. Men ingen vågar gå nära schaktet längre. Lyktorna har slocknat.'],
  },

  nils_efter: {
    speaker: 'Gruvarbetaren Nils',
    pages: ['Lavtornet får stå kvar, sa bolaget i dag. Konstigt nog var det ingen som ville riva det längre.'],
  },
};
