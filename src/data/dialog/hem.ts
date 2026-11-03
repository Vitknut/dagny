import type { DialogDef } from '../types';

/** Mormors by: Mormor Hulda, gamle Sven, smeden Algot, Karin and Murre, the other villagers – and Björkhagen. */
export const HEM: Record<string, DialogDef> = {
  intro_hulda: {
    speaker: 'Mormor Hulda',
    pages: [
      'Där är du, Dagny. Sätt dig. Kaffet är nyss kokat.',
      'Du har väl också märkt det. Sommaren är så mörk i år. Irrblossen dansar över myren mitt på dagen.',
      'Förr vaktades de sju heliga platserna av Väktarna. De höll fred mellan folket och skogens väsen.',
      'Men folk glömmer. Vägarna dit växer igen, ingen tänder ljusen, ingen säger väsendenas namn... och platserna vaknar i vrede.',
      'Den sista Väktaren försvann midsommarnatten 1946. Samma natt som jag hittade dig under klockstapeln.',
      'Det finns saker om den natten som jag har lovat att inte säga. Inte än, Dagny. Du får se dem med egna ögon först.',
      'Bredvid dig låg en klinga utan fäste. Jag har smitt ihop den åt dig, med kläppen från kyrkklockan.',
      'Ta den. Inte för att förinta väsendena, mitt barn – utan för att förlika världarna.',
      'Gå först till Stenkyrkan i norr. Kryptan där nere har börjat ringa igen om nätterna.',
      'Och prata med gamle Sven och smeden Algot innan du går. De kan ett och annat.',
    ],
    actions: [
      { type: 'giveItem', item: 'svard' },
      { type: 'flag', flag: 'intro_done' },
    ],
    next: 'fick_svard',
  },

  fick_svard: {
    pages: ['Dagny fick KLINGAN!\nSvärd: X / B-knappen. Håll NER för att slå lågt.'],
  },

  hulda_vila: {
    speaker: 'Mormor Hulda',
    pages: ['Du ser trött ut, lilla vän. Vill du vila en stund? Jag håller kaffet varmt.'],
    choices: [
      { text: 'Vila hos mormor', next: 'hulda_vilat', actions: [{ type: 'rest' }] },
      { text: 'Gå vidare', next: 'hulda_hej' },
    ],
  },

  hulda_vilat: {
    speaker: 'Mormor Hulda',
    pages: ['Så där. Nu har du sovit gott. Liv och magi är fyllda, och jag har skrivit upp var du är.'],
  },

  hulda_hej: {
    speaker: 'Mormor Hulda',
    pages: ['Akta dig för myren. Och kom hem till middag.'],
  },

  hulda_efter_krypta: {
    speaker: 'Mormor Hulda',
    pages: [
      'Dagny! Såg du? Solen bröt igenom molnen över Stenkyrkan i morse. Hela byn stod ute och tittade.',
      'Den gamla grimmen har slutit fred... Då är det sant. Du är den vi väntat på.',
      'Sex platser återstår. Vila nu, så pratar vi mer i morgon.',
    ],
    actions: [{ type: 'flag', flag: 'hulda_efter_krypta' }, { type: 'rest' }],
  },

  sven_uppdrag: {
    speaker: 'Gamle Sven',
    pages: [
      'Så Hulda har skickat dig. Hmm. Du har ögon som... nej. Glöm det. Gamla gubbar pratar för mycket.',
      'Jag kan en gammal läsning mot värk. Men den biter inte utan johannesört – och mina knän tar mig inte till skogen längre.',
      'Den växer i Björkhagen, sydost om byn, högt uppe där solen når. Akta dig för nässlorna. Hämta en kvist, så lär jag dig.',
    ],
    actions: [{ type: 'flag', flag: 'sven_uppdrag' }],
  },

  sven_vantar: {
    speaker: 'Gamle Sven',
    pages: ['Johannesörten växer högt uppe i Björkhagen, sydost om byn. Hoppa på hyllorna – och akta nässlorna.'],
  },

  sven_lar: {
    speaker: 'Gamle Sven',
    pages: [
      'Johannesört! Och plockad med rötterna kvar i jorden, som sig bör. Du är din mormors barnbarn.',
      'Hör här nu. Min farmor lärde mig den här vid vedspisen.',
      '"Värk ut, värk ner, i jord och sten, läk kött och ben..." Så. Nu kan du den.',
    ],
    actions: [
      { type: 'takeItem', item: 'johannesort' },
      { type: 'flag', flag: 'johannesort_klar' },
      { type: 'learnSpell', spell: 'lakning' },
    ],
    next: 'lart_lakning',
  },

  lart_lakning: {
    pages: ['Dagny lärde sig läsningen LÄKNING!\nMagi: C / Y-knappen. Byt läsning i pausmenyn.'],
  },

  sven_igen: {
    speaker: 'Gamle Sven',
    pages: ['Läkningen kostar magi. Kaffe hjälper, så klart. Det finns termosar överallt där väsen har varit.'],
  },

  sven_efter: {
    speaker: 'Gamle Sven',
    pages: ['Det har inte varit så här ljust på år och dag. Min farmor hade varit stolt över dig, jäntan.'],
  },

  algot_uppdrag: {
    speaker: 'Smeden Algot',
    pages: [
      'Så det är du som bär klockans kläpp nu. Ska du ner i kryptan? Inte utan att kunna stöta nedåt, säger jag.',
      'Grimmen svävar högt och hugger ovanifrån. Den som inte kan slå neråt i luften kommer inte åt honom.',
      'Jag lär dig. Men först vill jag ha tillbaka min gamla tång. Den ligger kvar i gamla smedjan, öster om byn.',
    ],
    actions: [{ type: 'flag', flag: 'tang_uppdrag' }],
  },

  algot_tack: {
    speaker: 'Smeden Algot',
    pages: [
      'Min tång! Den har hållit mer järn än du har ätit gröt, jäntan. Tack.',
      'Nu ska du få ditt knep: när du hoppar, håll NER och låt tyngden göra jobbet.',
    ],
    actions: [
      { type: 'takeItem', item: 'tang' },
      { type: 'flag', flag: 'tang_klar' },
      { type: 'learnSkill', skill: 'nedatstot' },
      { type: 'flag', flag: 'algot_lart' },
    ],
    next: 'lart_nedatstot',
  },

  algot_vantar: {
    speaker: 'Smeden Algot',
    pages: [
      'Tången ligger i gamla smedjan, öster om byn. Och gå inte ner i kryptan förrän du kan stöta nedåt.',
    ],
  },

  lart_nedatstot: {
    pages: ['Dagny lärde sig NEDÅTSTÖT!\nHåll NER i luften för att stöta svärdet nedåt.'],
  },

  algot_igen: {
    speaker: 'Smeden Algot',
    pages: [
      'En stöt nedåt studsar dig upp igen. Bra mot väsen med sköld, och mot stenar som behöver knäckas.',
      'Och fåglarna, kråkor och fladdermöss: de skriker och stannar upp innan de dyker. Vänd skölden mot dem då, så blir de yra en stund. Sedan slår du.',
    ],
  },

  karin_uppdrag: {
    speaker: 'Karin',
    pages: [
      'Åh, Dagny! Har du sett Murre? Han smet ut i går kväll och har inte kommit hem.',
      'Han brukar smita bort till Kyrkbyn och tigga strömming. Men vägen dit har varit så otäck nu...',
    ],
    actions: [{ type: 'flag', flag: 'murre_uppdrag' }],
  },

  karin_vantar: {
    speaker: 'Karin',
    pages: ['Kyrkbyn ligger nordost om byn, vid sjön. Snälla, titta efter Murre om du går förbi.'],
  },

  karin_tack: {
    speaker: 'Karin',
    pages: [
      'MURRE! Där är du ju, din lilla rackare! Tack, Dagny, tack!',
      'Här, ta de här kanelbullarna. Mamma bakade i morse. Du förtjänar dem.',
    ],
    actions: [
      { type: 'takeItem', item: 'murre' },
      { type: 'flag', flag: 'murre_hemma' },
      { type: 'xp', amount: 80 },
      { type: 'heal' },
    ],
    next: 'karin_xp',
  },

  karin_xp: {
    pages: ['Dagny fick 80 XP och känner sig utvilad.'],
  },

  karin_glad: {
    speaker: 'Karin',
    pages: ['Murre har inte lämnat spisen sedan han kom hem. Han spinner så fort han ser dig.'],
  },

  murre_spinner: {
    pages: ['Murre spinner och stryker sig mot Dagnys ben.'],
  },

  murre_hittad: {
    pages: ['Dagny hittade MURRE! Han kryper upp i hennes famn och spinner. Dags att gå hem till Karin.'],
  },

  handlarn: {
    speaker: 'Handlarn',
    pages: [
      'Välkommen in! Kaffe, socker, tändstickor... fast leveranserna är försenade. Lastbilen vågar inte köra genom skogen.',
      'Chauffören säger att han såg en skugga med lysande ögon vid vägskälet.',
    ],
  },

  handlarn_efter: {
    speaker: 'Handlarn',
    pages: ['Lastbilen kom i dag! Det första jag gjorde var att ställa undan ett paket kaffe åt Hulda.'],
  },

  olle: {
    speaker: 'Olle',
    pages: [
      'Hej Dagny! Lyssna! Jag har fått en transistorradio av morbror i Stockholm!',
      'Fast den brusar så konstigt på kvällarna. Som om någon sjunger mellan stationerna.',
    ],
  },

  olle_efter: {
    speaker: 'Olle',
    pages: ['Radion spelar bara schlager nu. Inget sjungande brus. Lite tråkigt, faktiskt.'],
  },

  greta: {
    speaker: 'Telefonist-Greta',
    pages: [
      'Telefonkiosken har ringt av sig själv tre nätter i rad. När jag svarar hörs bara kyrkklockor.',
      'Stenkyrkan ligger rakt norrut, förbi rågfälten. Var försiktig, Dagny.',
      'Och en sak till. Om kvällarna har jag sett ett ljus ute på en holme mitt i sjön. Någon bor där, fast ingen här vet vem.',
    ],
    actions: [{ type: 'flag', flag: 'rykte_eremitholmen' }],
  },

  hulda_efter_gruvan: {
    speaker: 'Mormor Hulda',
    pages: [
      'Lampan... låt mig se den. H.D. Jag har inte sett de bokstäverna på arton år.',
      'Jag lovar att berätta, Dagny. Men inte än. Först måste du se mer själv.',
      'Vila nu. Kaffet är varmt.',
    ],
    actions: [{ type: 'flag', flag: 'hulda_efter_gruvan' }, { type: 'rest' }],
  },

  hulda_efter_kvarnen: {
    speaker: 'Mormor Hulda',
    pages: [
      'Stövlar... gröna stövlar, storlek trettioåtta. Jag köpte dem på lanthandeln i Kyrkbyn 1945.',
      'Ja, Dagny. Jag kände henne. Bättre än någon. Mer än så säger jag inte förrän du har sett alla platserna.',
      'Sov nu. Tre platser har vaknat i godo. Det känns i luften.',
    ],
    actions: [{ type: 'flag', flag: 'hulda_efter_kvarnen' }, { type: 'rest' }],
  },

  hulda_efter_fyren: {
    speaker: 'Mormor Hulda',
    pages: [
      'Den där lampan... Tre korta, tre långa, tre korta. Varje kväll i åtta år.',
      'Det var jag som svarade, Dagny. Från vinden i klockstapeln, med fotogenlyktan.',
      'Nu vet du lite till. Fyra platser har vaknat. Vila nu.',
    ],
    actions: [{ type: 'flag', flag: 'hulda_efter_fyren' }, { type: 'rest' }],
  },

  hulda_efter_folkparken: {
    speaker: 'Mormor Hulda',
    pages: [
      'Fotografiet från dansbanan... Jag tog det själv, midsommar 1945. Det var sista gången jag såg henne skratta.',
      'Hon hette Dagmar. Mer säger jag inte än. Två platser kvar, och sedan Trollberget.',
      'Vila nu, vännen.',
    ],
    actions: [{ type: 'flag', flag: 'hulda_efter_folkparken' }, { type: 'rest' }],
  },

  olle_radio: {
    speaker: 'Olle',
    pages: ['Har du också fått en radio! Lyssna... det brusar annorlunda nära Björkhagen. Som om berget hade en dörr.'],
  },

  hulda_efter_fabodskogen: {
    speaker: 'Mormor Hulda',
    pages: [
      'Näverfilten... den du låg i när jag hittade dig. Dagmar vävde den åt dig, fast hon aldrig hann bli klar.',
      'Hon var din mamma, Dagny. Och hon var min dotter.',
      '"...da, Väktare 1921–1946" – det står Hulda i kryptan. H.D., Hulda Dahl, står det på lampan. Jag var Väktare före henne. Du kallar mig mormor som alla andra. Jag är det på riktigt.',
      'Det var jag som slutade gå. Kriget kom, och jag förlöste halva bygden de åren. En sommar till, tänkte jag, så tänder jag ljusen igen. Och så en till.',
      'Midsommarnatten 1946 vaknade berget. Jag var ute på en förlossning. Gåvan hade redan lämnat mig, och Dagmar gick i stället. Hon lade dig under klockstapeln och lät klockan ringa. I korgen låg en lapp till mig.',
      '"Berätta inget för henne förrän hon har sett platserna själv." Hade du vetat, hade du sprungit rakt upp i berget. Och berget släpper ingen som inte först väckt de andra platserna.',
      'Jag fick aldrig säga ja. Men jag har hållit det. Förlåt att jag lät dig gå ensam, som jag lät henne.',
      'Sex platser har vaknat i godo. Nu återstår bara Trollberget. Där är hon.',
      'Men först vilar du. Kom hit.',
    ],
    actions: [{ type: 'flag', flag: 'hulda_efter_fabodskogen' }, { type: 'rest' }],
  },

  bjorkhagen_nasslor: {
    pages: ['En lapp på en pinne, skriven med barnhandstil:\n"AKTA BRÄNNÄSSLORNA I GROPEN! HOPPA ÖVER! /OLLE"'],
  },

  hittade_hacka: {
    pages: ['Dagny hittade BERGHACKAN! Skaftet är svart av ålder, och någon har bränt in ett K i det.'],
  },

  hittade_tang: {
    pages: ['Dagny hittade SMEDTÅNGEN! Den är tung och sotig. Smeden Algot väntar på den.'],
  },

  smedjan_skylt: {
    pages: ['Gamla smedjan. Ässjan är kall sedan länge, och skorstenen har rasat. Här bodde väsen förr, säger folk.'],
  },

  hittade_johannesort: {
    pages: ['Dagny hittade JOHANNESÖRT! Små gula stjärnor som lyser i solen. Gamle Sven väntar på den.'],
  },
};
