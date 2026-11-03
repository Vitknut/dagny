import type { DialogDef } from '../types';

/** Kyrkbyn: the church, the bell tower where Dagny was found, Prosten (Eld) and Ingrid's hymn book. */
export const KYRKBYN: Record<string, DialogDef> = {
  signe_vila: {
    speaker: 'Signe i prästgården',
    pages: ['Kom in, kom in. Prästgården har fler rum än präster. Vill du vila en stund?'],
    choices: [
      { text: 'Vila i prästgården', next: 'signe_vilat', actions: [{ type: 'rest' }] },
      { text: 'Inte nu', next: 'signe_hej' },
    ],
  },

  signe_vilat: {
    speaker: 'Signe i prästgården',
    pages: ['Sovit gott? Det gör alla under kyrkklockan. Du är alltid välkommen tillbaka hit.'],
  },

  signe_hej: {
    speaker: 'Signe i prästgården',
    pages: ['Dörren är olåst. Det har den varit sedan 1700-talet.'],
  },

  prosten_lar: {
    speaker: 'Prosten',
    pages: [
      'Så du är flickan från klockstapeln. Jag döpte dig, vet du. Du skrek så att det ekade i valvet.',
      'Kryptan sover lugnt nu. Då kan jag lära dig det min företrädare lärde sig av den förra Väktaren.',
      '"Eld i järn, eld i sol, eld som midsommarnatten stal..." Så. Nu brinner det i klingan när du ber den.',
    ],
    actions: [{ type: 'learnSpell', spell: 'eld' }],
    next: 'lart_eld',
  },

  lart_eld: {
    pages: ['Dagny lärde sig läsningen ELD!\nSvärdet skjuter eldbollar en stund.'],
  },

  prosten_igen: {
    speaker: 'Prosten',
    pages: ['Eld är inte till för att förstöra. Den är till för att lysa upp och värma. Glöm aldrig det.'],
  },

  prosten_vanta: {
    speaker: 'Prosten',
    pages: [
      'Det är något som rör sig under kyrkan. Jag hör det på nätterna, som stenar som skaver mot varandra.',
      'Gå ner i kryptan och se vad som är fel. Kom sedan tillbaka, så har jag något åt dig.',
    ],
  },

  prosten_efter: {
    speaker: 'Prosten',
    pages: ['I morse ringde klockan av sig själv igen. Men den här gången lät den glad. Jag vet inte hur jag ska förklara det.'],
  },

  ingrid_uppdrag: {
    speaker: 'Ingrid',
    pages: [
      'Min psalmbok! Jag tappade den i kryptan när ljusen slocknade och alla sprang ut.',
      'Mor fick den på sin konfirmation. Det ligger pressade blommor från varje midsommar i den. Om du ser den...',
    ],
    actions: [{ type: 'flag', flag: 'psalmbok_uppdrag' }],
  },

  ingrid_vantar: {
    speaker: 'Ingrid',
    pages: ['Den måste ligga i kryptan, i rummet med de tre valven. Jag satt alltid längst upp.'],
  },

  ingrid_tack: {
    speaker: 'Ingrid',
    pages: [
      'Där är den! Och blommorna ligger kvar, varenda en.',
      'Här, ta det här. Och nästa midsommar pressar vi en blomma åt dig också.',
    ],
    actions: [{ type: 'takeItem', item: 'psalmbok' }, { type: 'flag', flag: 'psalmbok_klar' }, { type: 'xp', amount: 150 }, { type: 'heal' }],
    next: 'ingrid_xp',
  },

  ingrid_xp: {
    pages: ['Dagny fick 150 XP och känner sig utvilad.'],
  },

  ingrid_glad: {
    speaker: 'Ingrid',
    pages: ['Jag har pressat en prästkrage åt dig. Den ligger på sidan för midsommarpsalmen.'],
  },

  hittade_psalmbok: {
    pages: ['Dagny hittade en PSALMBOK. Det sticker ut torkade blommor mellan bladen. Den är nog Ingrids.'],
  },

  bosse: {
    speaker: 'Bosse',
    pages: ['Jag har klättrat upp i klockstapeln! Nästan. Halvvägs. Prosten blev arg.'],
  },

  bosse_efter: {
    speaker: 'Bosse',
    pages: ['Det spökar inte i kryptan längre, säger prosten. Då vågar jag gå ner. Kanske. Om du följer med.'],
  },

  kyrkby_klockstapel: {
    pages: [
      'Den gamla klockstapeln. Klockan har hängt här i trehundra år.',
      'En liten mässingsskylt på stolpen:\n"MIDSOMMARNATTEN 1946 RINGDE JAG AV MIG SJÄLV."',
    ],
  },

  tyra: {
    speaker: 'Gamla Tyra',
    pages: [
      'Jag var vaken den natten, 1946. Jag såg en kvinna med kopparhår gå förbi med en korg.',
      'Hon stannade vid klockstapeln och grät. Sedan gick hon mot Trollberget, utan korgen.',
      'Folk sa sedan att Väktaren gick in i berget och höll det stilla med sina egna händer. Att det är därför berget har varit tyst i alla år. Men nu börjar det mullra igen.',
      'Kopparhår. Ungefär som ditt, lilla vän. ...Nå. Det är inte min sak att säga. Fråga Hulda.',
    ],
  },

  tyra_efter: {
    speaker: 'Gamla Tyra',
    pages: ['Jag såg ljuset över Trollberget i morse. Hon är fri nu. Och den som är fri hittar hem, förr eller senare.'],
  },
};
