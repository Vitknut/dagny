import type { DialogDef } from '../types';

/** The small places on the map, each with a little task: the churchyard, the charcoal croft, the plague cross, the stone ship, the milestone, the summer-farm croft. */
export const SMAPLATSER: Record<string, DialogDef> = {
  // --- Gamla kyrkogården: read the stones, move the right one ------------------------------
  kyrkogarden_grind: {
    pages: [
      'På grinden sitter en bleck skylt, skriven med kyrkvaktarens krumelurer:',
      '"MIN PLÅTASK LIGGER UNDER STENEN HOS DEN SOM SOMNADE PÅ MIDSOMMARDAGEN. DEN SOM LÄSER STENARNA HITTAR DEN."',
    ],
  },
  sten_anna: {
    pages: ['"ANNA LARSDOTTER 1801–1866.\nSOMNADE PÅ MIKAELIDAGEN."'],
    choices: [
      { text: 'Rucka på stenen', next: 'sten_fast' },
      { text: 'Låt den stå' },
    ],
  },
  sten_per: {
    pages: ['"PER ERSSON, GRUVFOGDE 1820–1871.\nGICK NER I GRUVAN PÅ KYNDELSMÄSSODAGEN OCH KOM ALDRIG UPP."'],
    choices: [
      { text: 'Rucka på stenen', next: 'sten_fast' },
      { text: 'Låt den stå' },
    ],
  },
  sten_johan: {
    pages: ['"JOHAN SVENSSON 1838–1902.\nSOMNADE PÅ JULAFTON."'],
    choices: [
      { text: 'Rucka på stenen', next: 'sten_fast' },
      { text: 'Låt den stå' },
    ],
  },
  sten_fast: {
    pages: ['Stenen sitter som berget. Här har ingen rört något på hundra år.'],
  },
  sten_karin: {
    pages: ['"KARIN NILSDOTTER 1840–1888.\nSOMNADE PÅ MIDSOMMARDAGEN."\nStenen lutar lite, som om någon har rört vid den.'],
    choices: [
      { text: 'Rucka på stenen', next: 'sten_karin_ask' },
      { text: 'Låt den stå' },
    ],
  },
  sten_karin_ask: {
    pages: [
      'Stenen glider åt sidan med ett gnissel. I gropen under ligger en rostig plåtask.',
      'I asken ligger en lapp, och under den blänker något.\n"Till den som läser stenarna och inte glömmer dem. /Kyrkvaktaren, 1946"',
    ],
    actions: [
      { type: 'flag', flag: 'karins_sten_rubbad' },
      { type: 'xp', amount: 40 },
    ],
  },
  sten_karin_tom: {
    pages: ['Stenen står snett nu. Gropen under är tom.'],
  },

  // --- Kolartorpet: light the dead charcoal stack with Eld ----------------------------------
  kolartorpet_skylt: {
    pages: ['Ett ödetorp vid hygget. En kolmila har stått här i alla år – marken är svart än, och när det regnar luktar det rök.'],
  },
  kolmila_kall: {
    pages: [
      'Kolmilan har slocknat. Torven har sjunkit ihop, och veden därinne är kall.',
      'Gamle kolaren lät aldrig sin mila slockna. Det skulle behövas eld – riktig eld. Prosten i Kyrkbyn lär ska kunna en läsning.',
    ],
  },
  kolmila_eld: {
    pages: ['Kolmilan har slocknat. Torven har sjunkit ihop, och veden därinne är kall. Den väntar på eld.'],
  },
  kolmila_tand: {
    pages: [
      'Lågan kryper in under torven. Det knäpper och pyser – och sedan stiger röken, rak och blå, som förr.',
      'I röken tycker Dagny att hon ser en gammal man som lyfter på mössan. Där han stod blänker något i askan.',
    ],
    actions: [{ type: 'xp', amount: 60 }],
  },

  // --- Pestkorset: flowers for the dead ---------------------------------------------------
  pestkorset_skylt: {
    pages: ['Ett vägkors av ek:\n"TILL MINNE AV DEM SOM DOG I FARSOTEN 1711."'],
  },
  grafru_ber: {
    speaker: 'Den grå frun',
    pages: [
      'Du ser mig? Då är du den första på länge.',
      'De som vilar här fick aldrig några blommor. Ingen vågade komma nära, det året. Och sedan glömde man.',
      'Det växer prästkragar uppe på klippan. Plocka en bukett åt dem – då kan jag också få vila.',
    ],
    actions: [{ type: 'flag', flag: 'grafru_bad' }],
  },
  grafru_vantar: {
    speaker: 'Den grå frun',
    pages: ['Prästkragarna växer högt uppe på klippan, där solen når. Jag väntar. Jag har väntat länge.'],
  },
  grafru_tack: {
    speaker: 'Den grå frun',
    pages: [
      'Prästkragar... Precis som de växte på ängen hemma.',
      'Tack, lilla vän. Ta det här – en näverdocka som jag flätade en gång åt min dotter. Den håller ett liv åt dig.',
      'Den grå frun bleknar som dimma i solen. Hon ler.',
    ],
    actions: [
      { type: 'takeItem', item: 'prastkragar' },
      { type: 'flag', flag: 'prastkragar_klar' },
      { type: 'flag', flag: 'grafru_frid' },
      { type: 'life', id: 'pestkorset' },
      { type: 'xp', amount: 40 },
    ],
  },
  hittade_prastkragar: {
    pages: ['Dagny plockade en bukett PRÄSTKRAGAR. De lyser vita mot den gråa klippan.'],
  },

  // --- Skeppssättningen: the missing piece of the rune stone --------------------------------
  skeppssattningen_skylt: {
    pages: ['Stenar ställda som ett skepp, med stäven mot havet. Fiskarna säger att en hövding seglar ut i det varje gång det stormar.'],
  },
  runsten_trasig: {
    pages: ['En runsten står vid aktern. En bit av den saknas – den har slagits loss och blivit liggande någonstans i sanden.'],
  },
  runsten_laga: {
    pages: [
      'Dagny sätter biten på plats. Den passar precis. Runorna lyser upp, en efter en, som glöd.',
      'Det susar i stenskeppet, som av ett segel. Vid stenens fot ligger en liten amulett av bärnsten – den håller ett liv åt den som bär den.',
    ],
    actions: [
      { type: 'takeItem', item: 'runbit' },
      { type: 'flag', flag: 'runbit_klar' },
      { type: 'flag', flag: 'runstenen_hel' },
      { type: 'life', id: 'skeppssattningen' },
      { type: 'xp', amount: 50 },
    ],
  },
  runsten_hel: {
    pages: ['"HÖVDINGEN SEGLAR VIDARE, SÅ LÄNGE NÅGON MINNS HONOM." Runorna glimmar svagt.'],
  },
  hittade_runbit: {
    pages: ['Dagny hittade en RUNSTENSBIT i sanden. Ristningarna på den fortsätter någon annanstans.'],
  },

  // --- Milstolpen: the drowned postman's horn ------------------------------------------------
  milstolpen_skylt: {
    pages: ['En milstolpe: "TILL STADEN 2 MIL".\nVägen den pekar mot finns inte kvar. Den gick där forsen går nu, innan vårfloden tog bron.'],
  },
  postiljon_ber: {
    speaker: 'Postiljonen',
    pages: [
      'Godag, fröken. Postiljon Lindgren, till er tjänst. Jag var på väg över bron med söndagsposten när floden kom.',
      'Posten kom fram till slut, det gjorde den. Men mitt horn – det for i forsen. Utan horn kan jag inte blåsa att posten är här.',
      'Det ligger nog kvar nedanför, på stenarna vid vattnet. Akta er för strömmen.',
    ],
    actions: [{ type: 'flag', flag: 'postiljon_bad' }],
  },
  postiljon_vantar: {
    speaker: 'Postiljonen',
    pages: ['Hornet ligger säkert kvar på stenarna nere vid forsen. Hoppa försiktigt, fröken.'],
  },
  postiljon_tack: {
    speaker: 'Postiljonen',
    pages: [
      'Mitt horn! Fröken, ni är en ängel.',
      'Postiljonen blåser en lång, klar ton över forsen. Någonstans långt borta svarar en annan.',
      'Här – det här brev har aldrig kunnat delas ut. Adressaten är borta sedan länge. Ta innehållet, ni har förtjänat det.\nI kuvertet ligger en MAGIBEHÅLLARE.',
    ],
    actions: [
      { type: 'takeItem', item: 'posthorn' },
      { type: 'flag', flag: 'posthorn_klar' },
      { type: 'container', kind: 'magi', id: 'milstolpen' },
      { type: 'xp', amount: 80 },
    ],
  },
  postiljon_frid: {
    speaker: 'Postiljonen',
    pages: ['Nu kan jag blåsa för posten igen. Sista turen går vid solnedgången. Hälsa er mormor!'],
  },
  hittade_posthorn: {
    pages: ['Dagny hittade POSTHORNET på en sten vid forsen. Det är bucklat, men glänser fortfarande.'],
  },

  // --- Fäbodtorpet: clear the healing spring ------------------------------------------------
  fabodtorpet_skylt: {
    pages: ['Fäbodtorpet. Spisen står kvar, och på hyllan en näverask med torkade örter. Här bodde vallkullorna om somrarna, förr i tiden.'],
  },
  kalla_igensatt: {
    pages: ['Trefaldighetskällan. Förr drack folk här på trefaldighetsafton för att bli friska. Nu är den igensatt av löv och kvistar.'],
    choices: [
      { text: 'Rensa källan', next: 'kalla_rensa' },
      { text: 'Låt den vara' },
    ],
  },
  kalla_rensa: {
    pages: [
      'Dagny plockar bort löv och kvistar, en näve i taget. Vattnet börjar porla, kallt och klart.',
      'Vid kanten, där vattnet rinner undan, blänker något som någon offrade här en gång.',
    ],
    actions: [
      { type: 'flag', flag: 'kallan_rensad' },
      { type: 'heal' },
      { type: 'magic' },
    ],
  },
  kalla_drick: {
    pages: ['Dagny dricker ur källan. Vattnet är iskallt och smakar järn och mossa. Hon känner sig som ny.'],
    actions: [{ type: 'heal' }, { type: 'magic' }],
  },
};
