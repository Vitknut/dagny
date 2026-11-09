import type { DialogDef } from '../types';

/** Fiskeläget: the fishing huts, Viola (Hopp), Johan's compass and old lighthouse keeper Ture. */
export const FISKELAGET: Record<string, DialogDef> = {
  hilma_vila: {
    speaker: 'Hilma i sjöboden',
    pages: ['Sjöboden luktar tjära och strömming, men sängarna är torra. Vill du vila?'],
    choices: [
      { text: 'Vila i sjöboden', next: 'hilma_vilat', actions: [{ type: 'rest' }] },
      { text: 'Inte nu', next: 'hilma_hej' },
    ],
  },

  hilma_vilat: {
    speaker: 'Hilma i sjöboden',
    pages: ['God morgon! Du sov som en säl. Kom tillbaka när du vill, nyckeln ligger under stenen.'],
  },

  hilma_hej: {
    speaker: 'Hilma i sjöboden',
    pages: ['Havet ger och havet tar, brukar vi säga. Men just nu tar det mest.'],
  },

  viola_uppdrag: {
    speaker: 'Nätlagerskan Viola',
    pages: [
      'Kom in, kom in. Akta näten. Jag lagar dem här uppe när det blåser för hårt nere vid sjöbodarna.',
      'Du tittar upp mot taket, ser jag. Där hänger det mesta jag äger, och dit når ingen utan stege.',
      'Min mormor kunde en läsning som gjorde en lätt som en fågel. Den behöver något som vet hur man flyger: en fjäder från en sädesärla.',
      'Ärlorna bygger bo på ett skär norr om fyren. Där har ingen stört dem på länge.',
    ],
    actions: [{ type: 'flag', flag: 'fjader_uppdrag' }],
  },

  viola_vantar: {
    speaker: 'Nätlagerskan Viola',
    pages: ['Ärlorna håller till på skäret norr om fyren, där fiskarna byggde ett röse en gång.'],
  },

  viola_lar: {
    speaker: 'Nätlagerskan Viola',
    pages: [
      'En ärlefjäder! Känn hur lätt den är. Lika lätt ska du bli.',
      'Du hoppar bra, men du hoppar som en människa. Jag ska lära dig hoppa som en sädesärla.',
      'Min mormor sa läsningen varje vår när fåglarna kom tillbaka. Hon påstod att hon kunde hoppa över båtarna.',
      '"Fjäder i fot och vind under häl, lätt som en ärla, lätt som en själ." Så. Nu ska du se.',
      'Ska du ut i fyren? Där uppe i linsrummet ligger saker på hyllor dit ingen människa når. Men en sädesärla når.',
    ],
    actions: [{ type: 'takeItem', item: 'fjader' }, { type: 'flag', flag: 'fjader_klar' }, { type: 'learnSpell', spell: 'hopp' }],
    next: 'lart_hopp',
  },

  lart_hopp: {
    pages: ['Dagny lärde sig läsningen HOPP!\nDagny hoppar högre en stund.'],
  },

  viola_igen: {
    speaker: 'Nätlagerskan Viola',
    pages: ['Akta så att du inte hoppar ner i sjön. Nät har jag gott om, men håvar har jag inga.'],
  },

  johan_uppdrag: {
    speaker: 'Fiskaren Johan',
    pages: [
      'Min kompass är borta! Jag rodde ut till fyren när stormen kom och tappade den i tornet.',
      'Utan den hittar jag inte hem i dimman. Den sitter i en mässingsdosa med en röd nål.',
    ],
    actions: [{ type: 'flag', flag: 'kompass_uppdrag' }],
  },

  johan_vantar: {
    speaker: 'Fiskaren Johan',
    pages: ['Den ligger nog uppe i fyren, i rummet med de stora linserna. Jag sprang därifrån så fort jag kunde.'],
  },

  johan_tack: {
    speaker: 'Fiskaren Johan',
    pages: [
      'Där är den! Och nålen pekar mot norr igen. Då har stormen lagt sig på riktigt.',
      'Ta det här. Och kom ut med båten en morgon, så ska jag visa dig var gäddorna står.',
    ],
    actions: [{ type: 'takeItem', item: 'kompass' }, { type: 'flag', flag: 'kompass_klar' }, { type: 'xp', amount: 250 }, { type: 'heal' }, { type: 'container', kind: 'liv', id: 'kompass' }],
    next: 'johan_xp',
  },

  johan_xp: {
    pages: ['Dagny fick 250 XP och en LIVBEHÅLLARE av Johan.'],
  },

  johan_glad: {
    speaker: 'Fiskaren Johan',
    pages: ['Nålen har inte darrat en enda gång sedan du kom med den. Havet är lugnt igen.'],
  },

  hittade_kompass: {
    pages: ['Dagny hittade en KOMPASS i en mässingsdosa. Nålen darrar och pekar mot norr. Den är nog Johans.'],
  },

  fiske_skylt: {
    pages: ['En skylt på bryggan:\n"FISKELÄGETS BRYGGA. HOPPA EJ I. VATTNET ÄR KALLT, ÄVEN I JULI."'],
  },

  stina: {
    speaker: 'Stina',
    pages: ['Fyren har inte lyst på hela sommaren. Pappa säger att Havsfrun har blåst ut den.'],
  },

  stina_efter: {
    speaker: 'Stina',
    pages: ['Fyren lyser igen! Jag räknar blinkarna innan jag somnar. Jag kommer alltid till tjugo.'],
  },

  ture: {
    speaker: 'Gamle Ture',
    pages: [
      'Jag var fyrvaktare en gång, innan de gjorde fyren automatisk. Ensamt, men vackert.',
      'Midsommarnatten 1946 såg jag ett ljus gå ner över Kyrkbyn. Jag skrev det i loggboken. Ingen trodde mig.',
    ],
  },

  // Return with the radio (chapter 7): the old coast transmitter and a recording of Dagmar.
  ture_sandare: {
    speaker: 'Gamle Ture',
    pages: [
      'Är det en transistorradio du har där? Då ska du få höra något. Jag har kvar fyrens gamla sändare och trådspelaren.',
      'Midsommarafton 1946 ropade någon upp fyren från stranden mitt emot Kyrkbyn. Jag spelade in det. Lyssna.',
      'Bandet knastrar. En kvinnoröst: "Fyren, fyren. Hälsa Hulda i Kyrkbyn att jag inte kommer i kväll. Säg att hon ska se efter klockstapeln."',
      'Jag förstod aldrig vad hon menade. Men du gör det, ser jag.',
    ],
    actions: [{ type: 'flag', flag: 'ture_sandare' }, { type: 'xp', amount: 150 }],
  },

  ture_efter: {
    speaker: 'Gamle Ture',
    pages: ['Har du läst min loggbok? Då vet du att jag inte ljög. Tack för att du tände fyren igen.'],
  },
};
