import type { DialogDef } from '../types';

/** Stationssamhället: the station, telegrafisten Oskar (Åska) and the stationmaster's whistle. */
export const STATIONSSAMHALLET: Record<string, DialogDef> = {
  lind_vila: {
    speaker: 'Fru Lind på järnvägshotellet',
    pages: ['Järnvägshotellet har rum med utsikt över spåren. Tågen går inte just nu, så det är tyst. Vill du vila?'],
    choices: [
      { text: 'Vila på hotellet', next: 'lind_vilat', actions: [{ type: 'rest' }] },
      { text: 'Inte nu', next: 'lind_hej' },
    ],
  },

  lind_vilat: {
    speaker: 'Fru Lind på järnvägshotellet',
    pages: ['God morgon! Frukosten är serverad, och det är kaffe på kannan. Ditt rum står alltid redo.'],
  },

  lind_hej: {
    speaker: 'Fru Lind på järnvägshotellet',
    pages: ['Det kom inte ett enda tåg i går. Inte i förrgår heller. Gästerna blir färre och färre.'],
  },

  oskar_uppdrag: {
    speaker: 'Telegrafisten Oskar',
    pages: [
      'Här uppe har jag kvar en mottagare. Den knastrar fortfarande, fast tråden är död.',
      'Åskan kan man inte bara be om. Man måste ha något som åskan själv har rört vid. En åskvigg.',
      'Folk plöjde upp sådana i åkrarna förr och murade in dem mot blixten. Vid milstolpen västerut ska det ligga en.',
    ],
    actions: [{ type: 'flag', flag: 'askvigg_uppdrag' }],
  },

  oskar_vantar: {
    speaker: 'Telegrafisten Oskar',
    pages: ['Åskviggen ska ligga i åkern vid milstolpen, västerut. På en av stenarna.'],
  },

  oskar_lar: {
    speaker: 'Telegrafisten Oskar',
    pages: [
      'En åskvigg! Den har varit i åskan, det känner man på den.',
      'Telegrafen tystnade i maj, men trådarna sjunger fortfarande. Hör du? Det är åskan som bor i dem.',
      'Min farfar var rallare. Han lärde mig en läsning som han fick av en gammal man vid Torsåsen. Tors vrede.',
      '"Åska i tråd och åska i sten, slå alla onda, skona var en." Så. Använd den sparsamt. Den tar mycket kraft.',
      'Ljusslingorna i folkparken dog samtidigt som telegrafen. Åskan bor i trådar, kom ihåg det.',
    ],
    actions: [{ type: 'takeItem', item: 'askvigg' }, { type: 'flag', flag: 'askvigg_klar' }, { type: 'learnSpell', spell: 'aska' }],
    next: 'lart_aska',
  },

  lart_aska: {
    pages: ['Dagny lärde sig läsningen ÅSKA!\nTräffar alla väsen på skärmen. Kostar mycket magi.'],
  },

  oskar_igen: {
    speaker: 'Telegrafisten Oskar',
    pages: ['Åskan är inte arg. Den är bara stark. Det är skillnad.'],
  },

  berg_uppdrag: {
    speaker: 'Stinsen Berg',
    pages: [
      'Min visselpipa! En pojke lånade den och sprang till folkparken. Sedan kom han hem utan.',
      'Utan visselpipan kan jag inte släppa iväg några tåg. Det står i reglementet.',
    ],
    actions: [{ type: 'flag', flag: 'visselpipa_uppdrag' }],
  },

  berg_vantar: {
    speaker: 'Stinsen Berg',
    pages: ['Pojken sa att han tappade den vid karusellen i folkparken. Han red på den svarta hästen.'],
  },

  berg_tack: {
    speaker: 'Stinsen Berg',
    pages: [
      'Där är den! Nu ska vi se...',
      'Priiip! Hör du? Nu kan tågen gå igen. Här, ta det här för besväret.',
    ],
    actions: [{ type: 'takeItem', item: 'visselpipa' }, { type: 'flag', flag: 'visselpipa_klar' }, { type: 'xp', amount: 250 }, { type: 'heal' }],
    next: 'berg_xp',
  },

  berg_xp: {
    pages: ['Dagny fick 250 XP och känner sig utvilad.'],
  },

  berg_glad: {
    speaker: 'Stinsen Berg',
    pages: ['Tågen går igen! Kyrkbyn, Gruvsamhället och Fiskeläget. Vart ska fröken?'],
    next: 'tag_resa',
  },

  // --- The train: fast travel between the stations, once the whistle is back ---
  tag_resa: {
    pages: ['Tåget står och puffar vid perrongen.'],
    choices: [
      { text: 'Kyrkbyn', actions: [{ type: 'travel', area: 'kyrkbyn' }] },
      { text: 'Gruvsamhället', actions: [{ type: 'travel', area: 'gruvsamhallet' }] },
      { text: 'Stationssamhället', actions: [{ type: 'travel', area: 'stationssamhallet' }] },
      { text: 'Fiskeläget', actions: [{ type: 'travel', area: 'fiskelaget' }] },
      { text: 'Stanna här' },
    ],
  },

  banvakt_vantar: {
    speaker: 'Banvakten',
    pages: ['Inga tåg i sommar. Stinsen i Stationssamhället har tappat sin visselpipa, och utan den går ingenting. Det står i reglementet.'],
  },

  banvakt_resa: {
    speaker: 'Banvakten',
    pages: ['Hör du? Tåget visslar igen! Hoppa på, fröken.'],
    next: 'tag_resa',
  },

  hittade_visselpipa: {
    pages: ['Dagny hittade en VISSELPIPA i nysilver. Den är nog stinsens.'],
  },

  resenaren: {
    speaker: 'Resenären',
    pages: ['Jag har väntat på tåget i tre dagar. Det har varit en mycket lugn semester, måste jag säga.'],
  },

  kalle: {
    speaker: 'Kalle',
    pages: ['Jag lånade stinsens visselpipa och tappade den. Säg inget till honom. Snälla.'],
  },

  kalle_efter: {
    speaker: 'Kalle',
    pages: ['Lyktorna i folkparken lyser igen! Mamma säger att jag får gå dit på lördag. Om jag inte tappar något.'],
  },
};
